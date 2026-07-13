import type { DestinationTransportMode } from "@weatheron/shared";

export const maxWalkableDestinationDistanceKm = 25;

export type TravelEstimateInput = {
  travelMinutes: number;
  distanceMeters: number;
  status: "idle" | "loading" | "ready" | "fallback" | "error";
};

export function isUnverifiedInternationalRoute(estimate: TravelEstimateInput, destinationCountryCode?: "KR" | "JP" | "GLOBAL"): boolean {
  return destinationCountryCode !== "KR" && estimate.status !== "ready";
}

export function isWalkUnavailableForEstimate(estimate: TravelEstimateInput, transportMode: DestinationTransportMode): boolean {
  if (transportMode !== "walk") return false;
  const distanceKm = estimate.distanceMeters > 0 ? estimate.distanceMeters / 1000 : 0;
  return distanceKm > maxWalkableDestinationDistanceKm;
}

// 도보 이동시간은 알림 예약(demoState)과 화면 표시(useWeatherOnAppState) 양쪽에서 동일하게 계산해야
// 예약 시각과 화면에 보이는 이동시간이 어긋나지 않는다.
export function getTravelMinutesForTransport(
  estimate: TravelEstimateInput,
  transportMode: DestinationTransportMode,
  destinationCountryCode?: "KR" | "JP" | "GLOBAL",
): number | undefined {
  if (isUnverifiedInternationalRoute(estimate, destinationCountryCode)) return undefined;
  const baseMinutes = estimate.travelMinutes || 35;
  const distanceKm = estimate.distanceMeters > 0 ? estimate.distanceMeters / 1000 : 0;
  if (transportMode === "walk") {
    if (distanceKm > maxWalkableDestinationDistanceKm) return baseMinutes;
    if (distanceKm > 0) return Math.max(5, Math.ceil((distanceKm / 4.5) * 60));
    return Math.max(15, Math.ceil(baseMinutes * 1.8));
  }
  if (transportMode === "transit") return Math.max(12, Math.ceil(baseMinutes * 1.25) + 8);
  if (transportMode === "drive") return baseMinutes;
  return baseMinutes;
}
