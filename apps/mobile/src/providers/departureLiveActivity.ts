import {
  unavailableDepartureLiveActivityStatus,
  type DepartureLiveActivityInput,
  type DepartureLiveActivityStatus,
} from "./departureLiveActivity.shared";

export type { DepartureLiveActivityInput, DepartureLiveActivityStatus } from "./departureLiveActivity.shared";
export {
  departureLiveActivityAutoLeadMinutes,
  getDepartureWeatherGuidance,
  isDepartureLiveActivityAutoWindow,
} from "./departureLiveActivity.shared";

export async function getDepartureLiveActivityStatus(): Promise<DepartureLiveActivityStatus> {
  return unavailableDepartureLiveActivityStatus;
}

export async function startDepartureLiveActivity(
  _input: DepartureLiveActivityInput,
): Promise<DepartureLiveActivityStatus> {
  return unavailableDepartureLiveActivityStatus;
}

export async function endDepartureLiveActivity(): Promise<boolean> {
  return false;
}

export async function syncAutomaticDepartureLiveActivity(
  _input: DepartureLiveActivityInput | null,
): Promise<DepartureLiveActivityStatus> {
  return unavailableDepartureLiveActivityStatus;
}
