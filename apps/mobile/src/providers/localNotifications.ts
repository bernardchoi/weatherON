import { Platform } from "react-native";
import type { NotificationRuleEvaluation } from "@weatheron/shared";
import { readAppValue, writeAppValue } from "./appStorage";
import { applyLocalNotificationPolicy } from "./notificationPolicy";

type ExpoNotificationsModule = typeof import("expo-notifications");

export type LocalNotificationPermissionResult = {
  granted: boolean;
  status: "granted" | "denied" | "unavailable";
};

export type LocalNotificationSyncResult = {
  status: "scheduled" | "cancelled" | "permission-required" | "unavailable" | "verification-failed";
  scheduledCount: number;
};

export type LocalNotificationResponsePayload = {
  route?: string;
  ruleId?: string;
  deliveryKey?: string;
  notificationId?: string;
  title?: string;
};

type LocalNotificationInput = Pick<
  NotificationRuleEvaluation,
  "id" | "type" | "pushTitle" | "pushBody" | "deepLink" | "active" | "requiresPushPermission" | "scheduledAt" | "deliveryKey"
>;
type ExpoNotification = Parameters<ExpoNotificationsModule["addNotificationReceivedListener"]>[0] extends (notification: infer Notification) => void
  ? Notification
  : never;
type ExpoNotificationResponse = NonNullable<Awaited<ReturnType<ExpoNotificationsModule["getLastNotificationResponseAsync"]>>>;

const notificationChannelId = "weatheron-smart-care";
const smartNotificationIdentifierPrefix = "weatheron:smart:";
const specialAlertDeliveryStorageKey = "weatheron.specialAlertDelivery.v1";
const routineReminderHour = 7;
const routineReminderMinute = 30;
const bedtimeReminderHour = 21;
let notificationHandlerReady = false;

export async function requestLocalNotificationPermission(): Promise<LocalNotificationPermissionResult> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return { granted: false, status: "unavailable" };
  await configureNotifications(Notifications);

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return { granted: true, status: "granted" };

  const requested = await Notifications.requestPermissionsAsync();
  return {
    granted: requested.granted,
    status: requested.granted ? "granted" : "denied",
  };
}

export async function checkLocalNotificationPermission(): Promise<LocalNotificationPermissionResult> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return { granted: false, status: "unavailable" };
  await configureNotifications(Notifications);

  const current = await Notifications.getPermissionsAsync();
  return {
    granted: current.granted,
    status: current.granted ? "granted" : "denied",
  };
}

export async function syncLocalWeatherNotifications(options: {
  enabled: boolean;
  notifications: LocalNotificationInput[];
  reducedInterruptions?: boolean;
}): Promise<LocalNotificationSyncResult> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return { status: "unavailable", scheduledCount: 0 };
  await configureNotifications(Notifications);

  if (!options.enabled) {
    await cancelSmartScheduledNotifications(Notifications);
    return { status: "cancelled", scheduledCount: 0 };
  }

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return { status: "permission-required", scheduledCount: 0 };

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledIdentifiers = new Set(scheduledNotifications.map((notification) => notification.identifier));
  const presentedNotifications = await getPresentedNotifications(Notifications);
  const nowIso = new Date().toISOString();
  const storedDeliveryRecords = await readSpecialAlertDeliveryRecords();
  const presentedDeliveryRecords = Object.fromEntries(
    options.notifications.flatMap((item) =>
      item.deliveryKey && presentedNotifications.some((notification) => notification.request.identifier === getSmartNotificationIdentifier(item))
        ? [[item.deliveryKey, nowIso]]
        : [],
    ),
  );
  const deliveryRecords = cleanStalePendingDeliveryRecords(
    { ...storedDeliveryRecords, ...presentedDeliveryRecords },
    options.notifications,
    scheduledIdentifiers,
  );
  const deliveredKeys = new Set(
    Object.entries(deliveryRecords)
      .filter(([key, value]) => {
        const item = options.notifications.find((notification) => notification.deliveryKey === key);
        const stillScheduled = item ? scheduledIdentifiers.has(getSmartNotificationIdentifier(item)) : false;
        return !stillScheduled && Date.parse(value) <= Date.now();
      })
      .map(([key]) => key),
  );
  const policyNotifications = applyLocalNotificationPolicy(
    options.notifications.filter((item) => !item.deliveryKey || !deliveredKeys.has(item.deliveryKey)),
    {
      reducedInterruptions: options.reducedInterruptions ?? true,
    },
  );
  const desiredNotifications = policyNotifications;
  const desiredIdentifiers = new Set(desiredNotifications.map(getSmartNotificationIdentifier));
  const preservedIdentifiers = new Set(
    desiredNotifications
      .filter((item) => {
        const identifier = getSmartNotificationIdentifier(item);
        return scheduledIdentifiers.has(identifier) && (Boolean(item.deliveryKey) || item.type === "routine" || item.type === "bedtime");
      })
      .map(getSmartNotificationIdentifier),
  );

  await cancelSmartScheduledNotifications(Notifications, preservedIdentifiers);
  const notificationsToSchedule = desiredNotifications.filter((item) => {
    return !preservedIdentifiers.has(getSmartNotificationIdentifier(item));
  });

  await Promise.all(
    notificationsToSchedule.map((item) =>
      Notifications.scheduleNotificationAsync({
        identifier: getSmartNotificationIdentifier(item),
        content: {
          title: item.pushTitle,
          body: item.pushBody,
          data: {
            route: item.deepLink,
            ruleId: item.id,
            deliveryKey: item.deliveryKey,
          },
          sound: "default",
          badge: 1,
        },
        trigger: getNotificationTrigger(Notifications, item),
      }),
    ),
  );
  const newlyScheduledDeliveryRecords = Object.fromEntries(
    notificationsToSchedule.flatMap((item) => (item.deliveryKey ? [[item.deliveryKey, item.scheduledAt!]] : [])),
  );
  const deliveryRecordsChanged = JSON.stringify(deliveryRecords) !== JSON.stringify(storedDeliveryRecords);
  if (deliveryRecordsChanged || Object.keys(newlyScheduledDeliveryRecords).length > 0) {
    await writeSpecialAlertDeliveryRecords({
      ...deliveryRecords,
      ...newlyScheduledDeliveryRecords,
    });
  }

  const finalScheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const finalIdentifiers = new Set(finalScheduledNotifications.map((notification) => notification.identifier));
  const scheduledCount = finalScheduledNotifications.filter((notification) => notification.identifier.startsWith(smartNotificationIdentifierPrefix)).length;
  return {
    status: [...desiredIdentifiers].every((identifier) => finalIdentifiers.has(identifier)) ? "scheduled" : "verification-failed",
    scheduledCount,
  };
}

export async function scheduleLocalNotificationTest(options: {
  route?: string;
  title?: string;
  body?: string;
  seconds?: number;
} = {}): Promise<LocalNotificationSyncResult> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return { status: "unavailable", scheduledCount: 0 };
  await configureNotifications(Notifications);

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return { status: "permission-required", scheduledCount: 0 };

  const route = options.route ?? "M2";
  const identifier = `weatheron:test:${route}:${Date.now()}`;
  const trigger = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 5,
    channelId: notificationChannelId,
  };
  if (options.seconds) trigger.seconds = options.seconds;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: options.title ?? "WeatherON이 필요한 순간 알려드릴게요",
      body: options.body ?? "나가기 전 필요한 준비를 한 번 확인해봐요",
      data: {
        route,
        ruleId: "local-test",
      },
      sound: "default",
      badge: 1,
    },
    trigger,
  });

  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledCount = scheduledNotifications.some((notification) => notification.identifier === identifier) ? 1 : 0;
  return { status: scheduledCount === 1 ? "scheduled" : "verification-failed", scheduledCount };
}

export async function addLocalNotificationResponseListener(
  listener: (payload: LocalNotificationResponsePayload) => void,
): Promise<() => void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return () => {};
  await configureNotifications(Notifications);

  const emitPayload = (response: ExpoNotificationResponse) => {
    const payload = getLocalNotificationResponsePayload(response);
    void markSpecialAlertDelivered(payload.deliveryKey);
    listener(payload);
    void dismissRespondedNotification(Notifications, response);
  };
  const subscription = Notifications.addNotificationResponseReceivedListener(emitPayload);
  const lastResponse = await Notifications.getLastNotificationResponseAsync();
  if (lastResponse) {
    emitPayload(lastResponse);
  }

  return () => {
    subscription.remove();
  };
}

export async function addLocalNotificationReceivedListener(
  listener: (payload: LocalNotificationResponsePayload) => void,
): Promise<() => void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return () => {};
  await configureNotifications(Notifications);

  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    const payload = getLocalNotificationPayload(notification);
    void markSpecialAlertDelivered(payload.deliveryKey);
    listener(payload);
  });
  return () => {
    subscription.remove();
  };
}

async function loadNotificationsModule(): Promise<ExpoNotificationsModule | null> {
  if (Platform.OS === "web") return null;
  try {
    return await import("expo-notifications");
  } catch {
    return null;
  }
}

async function configureNotifications(Notifications: ExpoNotificationsModule) {
  if (!notificationHandlerReady) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    notificationHandlerReady = true;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(notificationChannelId, {
      name: "WeatherON 스마트 알림",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8CCFFF",
      sound: "default",
    });
  }
}

async function cancelSmartScheduledNotifications(Notifications: ExpoNotificationsModule, preservedIdentifiers = new Set<string>()) {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduledNotifications
      .filter(
        (notification) =>
          notification.identifier.startsWith(smartNotificationIdentifierPrefix) && !preservedIdentifiers.has(notification.identifier),
      )
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
  );
}

function getSmartNotificationIdentifier(item: LocalNotificationInput): string {
  return `${smartNotificationIdentifierPrefix}${item.id}`;
}

async function readSpecialAlertDeliveryRecords(): Promise<Record<string, string>> {
  const stored = await readAppValue<unknown>(specialAlertDeliveryStorageKey);
  if (!stored || typeof stored !== "object") return {};
  const cutoff = Date.now() - 8 * 24 * 60 * 60_000;
  return Object.entries(stored as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string" && Number.isFinite(Date.parse(value)) && Date.parse(value) >= cutoff) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

async function writeSpecialAlertDeliveryRecords(keys: Record<string, string>) {
  const compactKeys = Object.entries(keys)
    .slice(-40)
    .reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  await writeAppValue(specialAlertDeliveryStorageKey, compactKeys);
}

async function dismissRespondedNotification(Notifications: ExpoNotificationsModule, response: ExpoNotificationResponse) {
  const identifier = response.notification.request.identifier;
  try {
    if (identifier) await Notifications.dismissNotificationAsync(identifier);
  } catch {
    // Notification tray cleanup is best-effort; navigation already used the response payload.
  }
  try {
    await Notifications.clearLastNotificationResponseAsync();
  } catch {
    // Last-response cleanup is also best-effort on older native notification modules.
  }
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch {
    // Badge cleanup is best-effort on launchers without badge support.
  }
}

function getLocalNotificationResponsePayload(response: ExpoNotificationResponse): LocalNotificationResponsePayload {
  return getLocalNotificationPayload(response.notification);
}

function getLocalNotificationPayload(notification: ExpoNotification): LocalNotificationResponsePayload {
  const data = notification.request.content.data;
  const fallbackRuleId = notification.request.identifier.startsWith("weatheron:test:") ? "local-test" : undefined;
  const fallbackRoute = fallbackRuleId ? getTestNotificationRouteFromIdentifier(notification.request.identifier) : undefined;
  return {
    route: typeof data.route === "string" ? data.route : fallbackRoute,
    ruleId: typeof data.ruleId === "string" ? data.ruleId : fallbackRuleId,
    deliveryKey: typeof data.deliveryKey === "string" ? data.deliveryKey : undefined,
    notificationId: notification.request.identifier,
    title: typeof notification.request.content.title === "string" ? notification.request.content.title : undefined,
  };
}

function getTestNotificationRouteFromIdentifier(identifier: string): string | undefined {
  const [, , route] = identifier.split(":");
  return route || "M2";
}

function getNotificationTrigger(
  Notifications: ExpoNotificationsModule,
  item: LocalNotificationInput,
): Parameters<ExpoNotificationsModule["scheduleNotificationAsync"]>[0]["trigger"] {
  const dailyTime = item.type === "routine"
    ? { hour: routineReminderHour, minute: routineReminderMinute }
    : item.type === "bedtime"
      ? { hour: bedtimeReminderHour, minute: 0 }
      : null;
  if (dailyTime && Platform.OS === "android") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      ...dailyTime,
      channelId: notificationChannelId,
    };
  }
  if (dailyTime) {
    return {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      ...dailyTime,
      repeats: true,
    };
  }
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: new Date(item.scheduledAt!),
    channelId: notificationChannelId,
  };
}

async function getPresentedNotifications(Notifications: ExpoNotificationsModule): Promise<ExpoNotification[]> {
  try {
    return await Notifications.getPresentedNotificationsAsync();
  } catch {
    return [];
  }
}

function cleanStalePendingDeliveryRecords(
  records: Record<string, string>,
  notifications: LocalNotificationInput[],
  scheduledIdentifiers: Set<string>,
): Record<string, string> {
  return Object.entries(records).reduce<Record<string, string>>((acc, [key, value]) => {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) return acc;
    const item = notifications.find((notification) => notification.deliveryKey === key);
    const stillScheduled = item ? scheduledIdentifiers.has(getSmartNotificationIdentifier(item)) : false;
    if (timestamp > Date.now() && item && !stillScheduled) return acc;
    acc[key] = value;
    return acc;
  }, {});
}

async function markSpecialAlertDelivered(deliveryKey: string | undefined) {
  if (!deliveryKey) return;
  const records = await readSpecialAlertDeliveryRecords();
  await writeSpecialAlertDeliveryRecords({
    ...records,
    [deliveryKey]: new Date().toISOString(),
  });
}
