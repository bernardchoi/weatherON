import { Platform } from "react-native";
import type { NotificationRuleEvaluation } from "@weatheron/shared";

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
  notificationId?: string;
};

type LocalNotificationInput = Pick<NotificationRuleEvaluation, "id" | "title" | "reason" | "deepLink" | "active" | "requiresPushPermission">;
type ExpoNotification = Parameters<ExpoNotificationsModule["addNotificationReceivedListener"]>[0] extends (notification: infer Notification) => void
  ? Notification
  : never;
type ExpoNotificationResponse = NonNullable<Awaited<ReturnType<ExpoNotificationsModule["getLastNotificationResponseAsync"]>>>;

const notificationChannelId = "weatheron-smart-care";
const smartNotificationIdentifierPrefix = "weatheron:smart:";
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

  const activeNotifications = options.notifications
    .filter((item) => item.active && item.requiresPushPermission)
    .slice(0, 3);
  await cancelSmartScheduledNotifications(Notifications);

  await Promise.all(
    activeNotifications.map((item, index) =>
      Notifications.scheduleNotificationAsync({
        identifier: `${smartNotificationIdentifierPrefix}${item.id}`,
        content: {
          title: item.title,
          body: item.reason,
          data: {
            route: item.deepLink,
            ruleId: item.id,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60 * (index + 1),
          channelId: notificationChannelId,
        },
      }),
    ),
  );

  const scheduledCount = await countScheduledNotifications(Notifications, smartNotificationIdentifierPrefix);
  return {
    status: scheduledCount >= activeNotifications.length ? "scheduled" : "verification-failed",
    scheduledCount,
  };
}

export async function scheduleLocalNotificationTest(): Promise<LocalNotificationSyncResult> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return { status: "unavailable", scheduledCount: 0 };
  await configureNotifications(Notifications);

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return { status: "permission-required", scheduledCount: 0 };

  const identifier = `weatheron:test:${Date.now()}`;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "WeatherON 테스트 알림",
      body: "알림을 누르면 스마트 알림 설정으로 이동함",
      data: {
        route: "M2",
        ruleId: "local-test",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: notificationChannelId,
    },
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
    listener(getLocalNotificationResponsePayload(response));
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
    listener(getLocalNotificationPayload(notification));
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
        shouldPlaySound: false,
        shouldSetBadge: false,
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
    });
  }
}

async function cancelSmartScheduledNotifications(Notifications: ExpoNotificationsModule) {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduledNotifications
      .filter((notification) => notification.identifier.startsWith(smartNotificationIdentifierPrefix))
      .map((notification) => Notifications.cancelScheduledNotificationAsync(notification.identifier)),
  );
}

async function countScheduledNotifications(Notifications: ExpoNotificationsModule, identifierPrefix: string) {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  return scheduledNotifications.filter((notification) => notification.identifier.startsWith(identifierPrefix)).length;
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
}

function getLocalNotificationResponsePayload(response: ExpoNotificationResponse): LocalNotificationResponsePayload {
  return getLocalNotificationPayload(response.notification);
}

function getLocalNotificationPayload(notification: ExpoNotification): LocalNotificationResponsePayload {
  const data = notification.request.content.data;
  const fallbackRuleId = notification.request.identifier.startsWith("weatheron:test:") ? "local-test" : undefined;
  const fallbackRoute = fallbackRuleId ? "M2" : undefined;
  return {
    route: typeof data.route === "string" ? data.route : fallbackRoute,
    ruleId: typeof data.ruleId === "string" ? data.ruleId : fallbackRuleId,
    notificationId: notification.request.identifier,
  };
}
