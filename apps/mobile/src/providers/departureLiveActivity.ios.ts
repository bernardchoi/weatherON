import WeatheronWidgetDataModule from "../../modules/weatheron-widget-data/src/WeatheronWidgetDataModule";
import {
  parseDepartureLiveActivityStatus,
  unavailableDepartureLiveActivityStatus,
  type DepartureLiveActivityInput,
  type DepartureLiveActivityStatus,
} from "./departureLiveActivity.shared";

export type { DepartureLiveActivityInput, DepartureLiveActivityStatus } from "./departureLiveActivity.shared";

export async function getDepartureLiveActivityStatus(): Promise<DepartureLiveActivityStatus> {
  if (!WeatheronWidgetDataModule) return unavailableDepartureLiveActivityStatus;
  try {
    return parseDepartureLiveActivityStatus(await WeatheronWidgetDataModule.getDepartureActivityStatus());
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
    return parseDepartureLiveActivityStatus(status);
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
