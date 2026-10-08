import { Platform } from "../localization/react-native";
import type { NotificationRuleEvaluation } from "@weatheron/shared";
import { readAppValue, writeAppValue } from "./appStorage";
import { applyLocalNotificationPolicy } from "./notificationPolicy";
import { translateText } from "../localization/localization";

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
  "id" | "type" | "pushTitle" | "pushBody" | "deepLink" | "active" | "requiresPushPermission" | "scheduledAt" | "scheduleTimeZone" | "deliveryKey"
>;
type ExpoNotification = Parameters<ExpoNotificationsModule["addNotificationReceivedListener"]>[0] extends (notification: infer Notification) => void
  ? Notification
  : never;
type ExpoNotificationResponse = NonNullable<Awaited<ReturnType<ExpoNotificationsModule["getLastNotificationResponseAsync"]>>>;

const notificationChannelId = "weatheron-smart-care";
const smartNotificationIdentifierPrefix = "weatheron:smart:";
const specialAlertDeliveryStorageKey = "weatheron.specialAlertDelivery.v1";
// Keep SQLite's string-map contract, with explicit evidence and reservation states.
const receivedRecordPrefix = "received:v3:";
const pendingRecordPrefix = "pending:v3:";
const cancelledRecordPrefix = "cancelled:v3:";
const unknownRecordPrefix = "unknown:v3:";
const observedReceipts = new Map<string, string>();
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

let notificationSyncQueue: Promise<unknown> = Promise.resolve();

export function syncLocalWeatherNotifications(options: Parameters<typeof syncLocalWeatherNotificationsNow>[0]): Promise<LocalNotificationSyncResult> {
  // 기기 알림 목록 전체를 갱신하므로 켜기·끄기를 호출 순서대로 완료한다.
  const run = notificationSyncQueue.then(() => syncLocalWeatherNotificationsNow(options));
  notificationSyncQueue = run.catch(() => {});
  return run;
}

async function syncLocalWeatherNotificationsNow(options: {
  enabled: boolean;
  notifications: LocalNotificationInput[];
  reducedInterruptions?: boolean;
  contentRevision?: string;
}): Promise<LocalNotificationSyncResult> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return { status: "unavailable", scheduledCount: 0 };
  await configureNotifications(Notifications);

  if (options.enabled) {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return { status: "permission-required", scheduledCount: 0 };
  }

  // A failed OS read is not an empty list. Do not mutate reservations or records.
  const snapshot = await readNativeNotifications(Notifications);
  if (!snapshot) return { status: "verification-failed", scheduledCount: 0 };
  const { scheduled: scheduledNotifications, presented } = snapshot;
  const deliveryRecords = reconcileDeliveryRecords(await readSpecialAlertDeliveryRecords(), scheduledNotifications, presented);
  await writeSpecialAlertDeliveryRecords(deliveryRecords);

  if (!options.enabled) {
    const remaining = await cancelSmartScheduledNotifications(Notifications, scheduledNotifications, deliveryRecords);
    if (!remaining) return { status: "verification-failed", scheduledCount: 0 };
    const scheduledCount = remaining.filter((item) => item.identifier.startsWith(smartNotificationIdentifierPrefix)).length;
    return { status: scheduledCount === 0 ? "cancelled" : "verification-failed", scheduledCount };
  }

  const desiredNotifications = applyLocalNotificationPolicy(
    options.notifications.filter((item) => !isDeliverySuppressed(deliveryRecords, item.deliveryKey)),
    { reducedInterruptions: options.reducedInterruptions ?? true },
  );
  const scheduledByIdentifier = new Map(scheduledNotifications.map((request) => [request.identifier, request]));
  const preservedIdentifiers = new Set(desiredNotifications
    .filter((item) => scheduledByIdentifier.get(getSmartNotificationIdentifier(item))?.content.data?.scheduleFingerprint === getScheduleFingerprint(item, options.contentRevision))
    .map(getSmartNotificationIdentifier));

  const afterCancel = await cancelSmartScheduledNotifications(Notifications, scheduledNotifications, deliveryRecords, preservedIdentifiers);
  if (!afterCancel) return { status: "verification-failed", scheduledCount: 0 };
  if (afterCancel.some((request) => request.identifier.startsWith(smartNotificationIdentifierPrefix) && !preservedIdentifiers.has(request.identifier))) {
    return { status: "verification-failed", scheduledCount: afterCancel.filter((request) => request.identifier.startsWith(smartNotificationIdentifierPrefix)).length };
  }
  // Receipt callbacks publish evidence immediately, even while their durable write is queued.
  const eligibleNotifications = desiredNotifications.filter((item) => !isDeliverySuppressed(deliveryRecords, item.deliveryKey));
  eligibleNotifications.forEach((item) => {
    if (item.deliveryKey) setDeliveryRecord(deliveryRecords, item.deliveryKey, pendingRecordPrefix, item.scheduledAt!);
  });
  // Journal attempts before native scheduling: a crash cannot turn an overdue attempt into a resend.
  await writeSpecialAlertDeliveryRecords(deliveryRecords);
  const scheduledResults = await Promise.allSettled(eligibleNotifications
    .filter((item) => !preservedIdentifiers.has(getSmartNotificationIdentifier(item)))
    .map((item) => Notifications.scheduleNotificationAsync({
      identifier: getSmartNotificationIdentifier(item),
      content: {
        title: item.pushTitle, body: item.pushBody,
        data: {
          route: item.deepLink, ruleId: item.id, deliveryKey: item.deliveryKey,
          contentRevision: options.contentRevision, scheduleTimeZone: item.scheduleTimeZone,
          scheduledAt: item.scheduledAt, scheduleFingerprint: getScheduleFingerprint(item, options.contentRevision),
        },
        sound: "default", badge: 1,
      },
      trigger: getNotificationTrigger(Notifications, item),
    })));
  const failedSchedule = scheduledResults.find((result) => result.status === "rejected");
  if (failedSchedule?.status === "rejected") throw failedSchedule.reason;

  const finalScheduled = await readNativeScheduledNotifications(Notifications);
  if (!finalScheduled) return { status: "verification-failed", scheduledCount: 0 };
  // A receipt may arrive during a native schedule call; cancel its replacement before finishing.
  const finalDesired = eligibleNotifications.filter((item) => !isDeliverySuppressed(deliveryRecords, item.deliveryKey));
  const desiredIdentifiers = new Set(finalDesired.map(getSmartNotificationIdentifier));
  const verified = await cancelSmartScheduledNotifications(Notifications, finalScheduled, deliveryRecords, desiredIdentifiers);
  if (!verified) return { status: "verification-failed", scheduledCount: 0 };
  const finalIdentifiers = new Set(verified.map((request) => request.identifier));
  const scheduledCount = verified.filter((request) => request.identifier.startsWith(smartNotificationIdentifierPrefix)).length;
  return {
    status: scheduledCount === desiredIdentifiers.size && [...desiredIdentifiers].every((id) => finalIdentifiers.has(id)) ? "scheduled" : "verification-failed",
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
      title: translateText(options.title ?? "WeatherON이 필요한 순간 알려드릴게요"),
      body: translateText(options.body ?? "나가기 전 필요한 준비를 한 번 확인해봐요"),
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
    void markSpecialAlertReceived(payload.deliveryKey, response.notification.date);
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
    void markSpecialAlertReceived(payload.deliveryKey, notification.date);
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
      name: translateText("WeatherON 스마트 알림"),
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8CCFFF",
      sound: "default",
    });
  }
}

async function cancelSmartScheduledNotifications(
  Notifications: ExpoNotificationsModule,
  scheduled: Awaited<ReturnType<ExpoNotificationsModule["getAllScheduledNotificationsAsync"]>>,
  records: Record<string, string>,
  preservedIdentifiers = new Set<string>(),
) {
  const toCancel = scheduled.filter((request) => request.identifier.startsWith(smartNotificationIdentifierPrefix) && !preservedIdentifiers.has(request.identifier));
  const results = await Promise.allSettled(toCancel.map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)));
  const remaining = toCancel.length ? await readNativeScheduledNotifications(Notifications) : scheduled;
  const remainingIds = remaining ? new Set(remaining.map((request) => request.identifier)) : null;
  results.forEach((result, index) => {
    const key = toCancel[index].content.data?.deliveryKey;
    if (result.status === "fulfilled" && remainingIds && !remainingIds.has(toCancel[index].identifier) && typeof key === "string" && !isDeliverySuppressed(records, key)) {
      const scheduledAt = records[pendingRecordPrefix + key] ?? toCancel[index].content.data?.scheduledAt;
      const future = typeof scheduledAt === "string" && Date.parse(scheduledAt) > Date.now();
      // It may have fired between the snapshot and cancellation; overdue absence is ambiguous.
      setDeliveryRecord(records, key, future ? cancelledRecordPrefix : unknownRecordPrefix, new Date(Date.now()).toISOString());
    }
  });
  await writeSpecialAlertDeliveryRecords(records);
  const failure = results.find((result) => result.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
  return remaining;
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
  pruneObservedReceipts();
  observedReceipts.forEach((value, key) => setDeliveryRecord(keys, key, receivedRecordPrefix, value));
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
  const data = notification.request.content.data ?? {};
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
      timezone: item.scheduleTimeZone,
      repeats: true,
    };
  }
  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: new Date(item.scheduledAt!),
    channelId: notificationChannelId,
  };
}

async function readNativeNotifications(Notifications: ExpoNotificationsModule) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const presented = await Notifications.getPresentedNotificationsAsync();
    return { scheduled, presented };
  } catch {
    return null;
  }
}

async function readNativeScheduledNotifications(Notifications: ExpoNotificationsModule) {
  try { return await Notifications.getAllScheduledNotificationsAsync(); }
  catch { return null; }
}

function getScheduleFingerprint(item: LocalNotificationInput, contentRevision?: string): string {
  // Recurring reminders depend on wall-clock rules, not the computed next occurrence.
  const recurring = item.type === "routine" || item.type === "bedtime";
  return JSON.stringify([
    1, item.type, item.deliveryKey ?? null, item.scheduleTimeZone ?? null,
    recurring ? item.type : Date.parse(item.scheduledAt!),
    item.pushTitle, item.pushBody, item.deepLink, contentRevision ?? null,
  ]);
}

function pruneObservedReceipts() {
  const cutoff = Date.now() - 8 * 24 * 60 * 60_000;
  observedReceipts.forEach((value, key) => { if (Date.parse(value) < cutoff) observedReceipts.delete(key); });
  while (observedReceipts.size > 40) observedReceipts.delete(observedReceipts.keys().next().value!);
}

function setDeliveryRecord(records: Record<string, string>, eventKey: string, prefix: string, value: string) {
  for (const statePrefix of [receivedRecordPrefix, pendingRecordPrefix, cancelledRecordPrefix, unknownRecordPrefix]) delete records[statePrefix + eventKey];
  records[prefix + eventKey] = value;
}

function isDeliverySuppressed(records: Record<string, string>, eventKey: string | undefined): boolean {
  return !!eventKey && (observedReceipts.has(eventKey) || !!records[receivedRecordPrefix + eventKey] || !!records[unknownRecordPrefix + eventKey]);
}

function reconcileDeliveryRecords(
  records: Record<string, string>,
  scheduled: Awaited<ReturnType<ExpoNotificationsModule["getAllScheduledNotificationsAsync"]>>,
  presented: ExpoNotification[],
): Record<string, string> {
  const pendingKeys = new Set(scheduled.flatMap((request) => typeof request.content.data?.deliveryKey === "string" ? [request.content.data.deliveryKey] : []));
  pruneObservedReceipts();
  const result: Record<string, string> = {};
  Object.entries(records).forEach(([key, value]) => {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) return;
    const statePrefix = [receivedRecordPrefix, pendingRecordPrefix, cancelledRecordPrefix, unknownRecordPrefix, "delivered:v2:", "pending:v2:"].find((prefix) => key.startsWith(prefix));
    const eventKey = statePrefix ? key.slice(statePrefix.length) : key;
    // v2 'delivered' mixed actual receipts with inferred expiry, so it is not proof.
    // Unscoped legacy event keys stay unscoped: never attach them to today's location.
    const prefix = statePrefix === receivedRecordPrefix || statePrefix === cancelledRecordPrefix || statePrefix === unknownRecordPrefix
      ? statePrefix
      : statePrefix === "delivered:v2:" ? unknownRecordPrefix
      : pendingKeys.has(eventKey) ? pendingRecordPrefix
      : timestamp <= Date.now() ? unknownRecordPrefix : cancelledRecordPrefix;
    // Mixed older maps can contain both pending and terminal entries; evidence wins.
    if (result[receivedRecordPrefix + eventKey] || (result[unknownRecordPrefix + eventKey] && prefix !== receivedRecordPrefix)) return;
    setDeliveryRecord(result, eventKey, prefix, value);
  });
  presented.forEach((notification) => {
    const key = notification.request.content.data?.deliveryKey;
    if (typeof key === "string") setDeliveryRecord(result, key, receivedRecordPrefix, receiptTimestamp(notification.date));
  });
  observedReceipts.forEach((value, key) => setDeliveryRecord(result, key, receivedRecordPrefix, value));
  return result;
}

function receiptTimestamp(date: number | undefined): string {
  return new Date(Number.isFinite(date) ? date! : Date.now()).toISOString();
}

async function markSpecialAlertReceived(deliveryKey: string | undefined, date?: number) {
  if (!deliveryKey) return;
  const value = receiptTimestamp(date);
  observedReceipts.set(deliveryKey, value);
  // Serialize durable writes, while immediate evidence prevents in-flight rescheduling.
  const run = notificationSyncQueue.then(async () => {
    const records = await readSpecialAlertDeliveryRecords();
    setDeliveryRecord(records, deliveryKey, receivedRecordPrefix, value);
    await writeSpecialAlertDeliveryRecords(records);
  });
  notificationSyncQueue = run.catch(() => {});
  await run;
}
