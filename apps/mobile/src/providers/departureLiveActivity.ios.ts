import { requestAuthenticatedAccountJson } from "./accountAuth";
import WeatheronWidgetDataModule from "../../modules/weatheron-widget-data/src/WeatheronWidgetDataModule";
import {
  isDepartureLiveActivityAutoWindow,
  parseDepartureLiveActivityStatus,
  unavailableDepartureLiveActivityStatus,
  type DepartureLiveActivityInput,
  type DepartureLiveActivityStatus,
} from "./departureLiveActivity.shared";

export type { DepartureLiveActivityInput, DepartureLiveActivityStatus } from "./departureLiveActivity.shared";
export {
  departureLiveActivityAutoLeadMinutes,
  getDepartureLiveActivityActivationDelay,
  getDepartureGuidanceSymbol,
  getDepartureWeatherGuidance,
  getDepartureWeatherGuidanceKind,
  isDepartureLiveActivityAutoWindow,
} from "./departureLiveActivity.shared";

let registeredToken = "";
let currentRegistrationKey = "";
let registrationQueue = Promise.resolve(false);
const pendingRegistrations = new Map<string, Promise<boolean>>();
const registrationRetryTimers = new Map<string, ReturnType<typeof setTimeout>>();
const registrationRetryAttempts = new Map<string, number>();

function clearRegistrationRetry(key: string) {
  const timer = registrationRetryTimers.get(key);
  if (timer) clearTimeout(timer);
  registrationRetryTimers.delete(key);
  registrationRetryAttempts.delete(key);
}

function scheduleRegistrationRetry(key: string) {
  if (key !== currentRegistrationKey || registrationRetryTimers.has(key) || !WeatheronWidgetDataModule) return;
  const nativeModule = WeatheronWidgetDataModule;
  const attempt = registrationRetryAttempts.get(key) ?? 0;
  const delay = Math.min(15_000 * 2 ** attempt, 5 * 60_000);
  registrationRetryAttempts.set(key, attempt + 1);
  registrationRetryTimers.set(key, setTimeout(() => {
    registrationRetryTimers.delete(key);
    void nativeModule.getDepartureActivityStatus()
      .then(registerAutomaticEnd)
      .catch(() => scheduleRegistrationRetry(key));
  }, delay));
}

function selectRegistrationKey(key: string) {
  if (key === currentRegistrationKey) return;
  currentRegistrationKey = key;
  registeredToken = "";
  for (const previous of registrationRetryAttempts.keys()) clearRegistrationRetry(previous);
}

async function registerAutomaticEnd(raw: string): Promise<DepartureLiveActivityStatus> {
  const status = parseDepartureLiveActivityStatus(raw);
  if (!status.active && !status.scheduled) {
    selectRegistrationKey("");
    return status;
  }
  const native = JSON.parse(raw) as Record<string, unknown>;
  const token = typeof native.pushToken === "string" ? native.pushToken : "";
  const key = `${status.activityId}:${token}:${status.departureAt}`;
  selectRegistrationKey(key);
  // Pending is not a server acknowledgement. JS retries only run while iOS allows execution.
  if (!token) {
    if (status.active) scheduleRegistrationRetry(key);
    return { ...status, automaticEndScheduled: status.scheduled ? undefined : false };
  }
  if (registeredToken === key) return { ...status, automaticEndScheduled: true };
  let pending = pendingRegistrations.get(key);
  if (!pending) {
    // Keep token rotations in order so an older request cannot overwrite the latest server token.
    pending = registrationQueue.then(async () => {
      if (key !== currentRegistrationKey) return false;
      const response = await requestAuthenticatedAccountJson<{ scheduled: boolean }>("/live-activities/departure", {
        activityId: status.activityId, departureAt: status.departureAt,
        pushToken: token, bundleId: native.bundleId, pushEnvironment: native.pushEnvironment,
      });
      if (key !== currentRegistrationKey) return false;
      if (response.scheduled === true) {
        registeredToken = key;
        clearRegistrationRetry(key);
      } else scheduleRegistrationRetry(key);
      return response.scheduled === true;
    }).catch(() => {
      scheduleRegistrationRetry(key);
      return false;
    }).finally(() => pendingRegistrations.delete(key));
    registrationQueue = pending;
    pendingRegistrations.set(key, pending);
  }
  return { ...status, automaticEndScheduled: await pending };
}

WeatheronWidgetDataModule?.addListener("onDeparturePushToken", () => {
  // An event may have queued before a replacement/cancellation; read the current native Activity.
  void getDepartureLiveActivityStatus();
});

export async function getDepartureLiveActivityStatus(): Promise<DepartureLiveActivityStatus> {
  if (!WeatheronWidgetDataModule) return unavailableDepartureLiveActivityStatus;
  try {
    return await registerAutomaticEnd(await WeatheronWidgetDataModule.getDepartureActivityStatus());
  } catch {
    return unavailableDepartureLiveActivityStatus;
  }
}

export async function startDepartureLiveActivity(
  input: DepartureLiveActivityInput,
): Promise<DepartureLiveActivityStatus> {
  if (!WeatheronWidgetDataModule) throw new Error("이 빌드에서는 실시간 출발 현황을 지원하지 않음");
  try {
    const status = await WeatheronWidgetDataModule.startDepartureActivity(JSON.stringify(input));
    return await registerAutomaticEnd(status);
  } catch {
    throw new Error("실시간 출발 현황을 시작하지 못했음. iOS 설정에서 Live Activity 허용 여부를 확인해야 함");
  }
}

export async function endDepartureLiveActivity(): Promise<boolean> {
  if (!WeatheronWidgetDataModule) return false;
  selectRegistrationKey("");
  try {
    return await WeatheronWidgetDataModule.endDepartureActivity();
  } catch {
    return false;
  }
}

export async function syncAutomaticDepartureLiveActivity(
  input: DepartureLiveActivityInput | null,
): Promise<DepartureLiveActivityStatus> {
  const revision = ++automaticSyncRevision;
  automaticSyncQueue = automaticSyncQueue
    .catch(() => unavailableDepartureLiveActivityStatus)
    .then(() => revision === automaticSyncRevision
      ? performAutomaticDepartureLiveActivitySync(input)
      : getDepartureLiveActivityStatus());
  return automaticSyncQueue;
}

let automaticSyncRevision = 0;
let automaticSyncQueue = Promise.resolve<DepartureLiveActivityStatus>(unavailableDepartureLiveActivityStatus);

async function performAutomaticDepartureLiveActivitySync(
  input: DepartureLiveActivityInput | null,
): Promise<DepartureLiveActivityStatus> {
  const status = await getDepartureLiveActivityStatus();
  if (!status.supported || !status.enabled) return status;

  const departureMs = input ? new Date(input.departureAt).getTime() : Number.NaN;
  if (!input || !Number.isFinite(departureMs) || departureMs <= Date.now()) {
    if (status.active || status.scheduled || status.lifecycle === "stale") {
      await endDepartureLiveActivity();
      return getDepartureLiveActivityStatus();
    }
    return status;
  }

  // A persisted intent can predate the currently scheduled native Activity
  // (for example after browsing another saved destination). This guard must
  // run before the auto-window branch below: outside the window, that branch
  // would otherwise end the existing trip before we get to preserve it.
  // Ordinary previews stay read-only with respect to the system countdown; a
  // future deliberate replacement needs an explicit native start rather than
  // this background reconciliation.
  if (
    (status.active || status.scheduled) &&
    status.destinationId &&
    status.destinationId !== input.destinationId &&
    !input.replaceExistingActivity
  ) {
    return status;
  }

  if (!status.automaticStartSupported && !isDepartureLiveActivityAutoWindow(input.departureAt)) {
    if (status.active || status.scheduled) {
      await endDepartureLiveActivity();
      return getDepartureLiveActivityStatus();
    }
    return status;
  }

  if (
    (status.active || status.scheduled) &&
    status.destinationId === input.destinationId &&
    status.departureAt &&
    Math.abs(new Date(status.departureAt).getTime() - departureMs) < 1_000 &&
    status.guidance === input.guidance
  ) {
    return status;
  }

  return startDepartureLiveActivity(input);
}
