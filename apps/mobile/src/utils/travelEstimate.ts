import type { DestinationTransportMode } from "@weatheron/shared";

export const maxWalkableDestinationDistanceKm = 25;

export type TravelEstimateInput = {
  originPlaceId?: string;
  travelMinutes: number;
  distanceMeters: number;
  provider?: "kakao" | "kakao-transit" | "google" | "google-transit" | "fallback";
  status: "idle" | "loading" | "ready" | "fallback" | "error";
};

export function isUnverifiedInternationalRoute(
  estimate: TravelEstimateInput,
  originCountryCode?: "KR" | "JP" | "GLOBAL",
  destinationCountryCode?: "KR" | "JP" | "GLOBAL",
  currentOriginPlaceId?: string,
): boolean {
  if (currentOriginPlaceId && estimate.originPlaceId && estimate.originPlaceId !== currentOriginPlaceId) return true;
  if (!originCountryCode || !destinationCountryCode) {
    return destinationCountryCode !== "KR" && estimate.status !== "ready";
  }
  if (originCountryCode !== destinationCountryCode) return true;
  if (destinationCountryCode === "KR") return false;
  return estimate.status !== "ready" && estimate.status !== "fallback";
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
  originCountryCode?: "KR" | "JP" | "GLOBAL",
  destinationCountryCode?: "KR" | "JP" | "GLOBAL",
  currentOriginPlaceId?: string,
): number | undefined {
  if (isUnverifiedInternationalRoute(estimate, originCountryCode, destinationCountryCode, currentOriginPlaceId)) return undefined;
  const baseMinutes = estimate.travelMinutes || 35;
  const distanceKm = estimate.distanceMeters > 0 ? estimate.distanceMeters / 1000 : 0;
  if (transportMode === "walk") {
    if (distanceKm > maxWalkableDestinationDistanceKm) return baseMinutes;
    if (distanceKm > 0) return Math.max(5, Math.ceil((distanceKm / 4.5) * 60));
    return Math.max(15, Math.ceil(baseMinutes * 1.8));
  }
  if (transportMode === "transit" && isLiveTransitEstimate(estimate)) return baseMinutes;
  if (transportMode === "transit") return Math.max(12, Math.ceil(baseMinutes * 1.25) + 8);
  if (transportMode === "drive") return baseMinutes;
  return baseMinutes;
}

export function isLiveTransitEstimate(estimate: Pick<TravelEstimateInput, "provider" | "status">): boolean {
  return estimate.status === "ready" && (estimate.provider === "kakao-transit" || estimate.provider === "google-transit");
}
