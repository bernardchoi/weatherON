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
  getDepartureWeatherGuidance,
  isDepartureLiveActivityAutoWindow,
} from "./departureLiveActivity.shared";

let registeredToken = "";
const pendingRegistrations = new Map<string, Promise<boolean>>();

async function registerAutomaticEnd(raw: string): Promise<DepartureLiveActivityStatus> {
  const status = parseDepartureLiveActivityStatus(raw);
  if (!status.active) return status;
  const native = JSON.parse(raw) as Record<string, unknown>;
  const token = typeof native.pushToken === "string" ? native.pushToken : "";
  if (!token) return { ...status, automaticEndScheduled: false };
  const key = `${status.activityId}:${token}:${status.departureAt}`;
  if (registeredToken === key) return { ...status, automaticEndScheduled: true };
  let pending = pendingRegistrations.get(key);
  if (!pending) {
    pending = requestAuthenticatedAccountJson<{ scheduled: boolean }>("/live-activities/departure", {
      activityId: status.activityId, departureAt: status.departureAt,
      pushToken: token, bundleId: native.bundleId, pushEnvironment: native.pushEnvironment,
    }).then((response) => {
      if (response.scheduled) registeredToken = key;
      return response.scheduled === true;
    }).catch(() => false).finally(() => pendingRegistrations.delete(key));
    pendingRegistrations.set(key, pending);
  }
  return { ...status, automaticEndScheduled: await pending };
}

WeatheronWidgetDataModule?.addListener("onDeparturePushToken", ({ status }) => {
  void registerAutomaticEnd(status);
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
  try {
    return await WeatheronWidgetDataModule.endDepartureActivity();
  } catch {
    return false;
  }
}

export async function syncAutomaticDepartureLiveActivity(
  input: DepartureLiveActivityInput | null,
): Promise<DepartureLiveActivityStatus> {
  const status = await getDepartureLiveActivityStatus();
  if (!status.supported || !status.enabled) return status;

  if (!input || !isDepartureLiveActivityAutoWindow(input.departureAt)) {
    if (status.active) {
      await endDepartureLiveActivity();
      return getDepartureLiveActivityStatus();
    }
    return status;
  }

  if (
    status.active &&
    status.destinationId === input.destinationId &&
    status.departureAt &&
    Math.abs(new Date(status.departureAt).getTime() - new Date(input.departureAt).getTime()) < 1_000
  ) {
    return status;
  }

  return startDepartureLiveActivity(input);
}
