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

export async function getDepartureLiveActivityStatus(): Promise<DepartureLiveActivityStatus> {
  if (!WeatheronWidgetDataModule) return unavailableDepartureLiveActivityStatus;
  try {
    return parseDepartureLiveActivityStatus(await WeatheronWidgetDataModule.getDepartureActivityStatus());
  } catch {
    return unavailableDepartureLiveActivityStatus;
  }
}

export async function startDepartureLiveActivity(input: DepartureLiveActivityInput): Promise<DepartureLiveActivityStatus> {
  if (!WeatheronWidgetDataModule) throw new Error("이 빌드에서는 실시간 출발 현황을 지원하지 않음");
  return parseDepartureLiveActivityStatus(await WeatheronWidgetDataModule.startDepartureActivity(JSON.stringify(input)));
}

export async function endDepartureLiveActivity(): Promise<boolean> {
  try {
    return await WeatheronWidgetDataModule?.endDepartureActivity() ?? false;
  } catch {
    return false;
  }
}

let automaticSyncQueue = Promise.resolve<DepartureLiveActivityStatus>(unavailableDepartureLiveActivityStatus);

export async function syncAutomaticDepartureLiveActivity(
  input: DepartureLiveActivityInput | null,
): Promise<DepartureLiveActivityStatus> {
  automaticSyncQueue = automaticSyncQueue.catch(() => unavailableDepartureLiveActivityStatus).then(async () => {
    const status = await getDepartureLiveActivityStatus();
    if (!status.supported || !status.enabled) return status;
    const departureMs = input ? new Date(input.departureAt).getTime() : Number.NaN;
    if (!input || !Number.isFinite(departureMs) || departureMs <= Date.now()) {
      if (status.active || status.scheduled) await endDepartureLiveActivity();
      return getDepartureLiveActivityStatus();
    }
    if (!status.automaticStartSupported && !isDepartureLiveActivityAutoWindow(input.departureAt)) return status;
    if (
      (status.active || status.scheduled) &&
      status.destinationId === input.destinationId &&
      status.departureAt === input.departureAt &&
      status.guidance === input.guidance
    ) return status;
    return startDepartureLiveActivity(input);
  });
  return automaticSyncQueue;
}
