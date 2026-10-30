import { getZonedDateTimeParts } from "./zonedDateTime";
import type { DestinationTransportMode } from "@weatheron/shared";
import type { TravelEstimateResult } from "../providers/travelEstimateClient";

export const maxWalkableDestinationDistanceKm = 25;

export type TravelEstimateInput = {
  originPlaceId?: string;
  durationSeconds?: number;
  transportMode?: DestinationTransportMode;
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
  // GLOBAL groups different countries, so only a provider-confirmed route can establish travel time.
  if (destinationCountryCode === "GLOBAL") return estimate.status !== "ready";
  return estimate.status !== "ready" && estimate.status !== "fallback";
}

export function isWalkUnavailableForEstimate(estimate: TravelEstimateInput, transportMode: DestinationTransportMode): boolean {
  if (transportMode !== "walk" || estimate.transportMode !== "walk") return false;
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
  if (estimate.status === "idle" || estimate.status === "loading" || estimate.status === "error") return undefined;
  if (estimate.status === "fallback" && estimate.distanceMeters <= 0) return undefined;
  if (estimate.transportMode && (estimate.transportMode === "auto" ? "drive" : estimate.transportMode) !== (transportMode === "auto" ? "drive" : transportMode)) return undefined;
  if (transportMode === "walk" && (estimate.transportMode !== "walk" || isWalkUnavailableForEstimate(estimate, transportMode))) return undefined;
  if (transportMode === "transit" && !isLiveTransitEstimate(estimate)) return undefined;
  const seconds = estimate.durationSeconds ?? estimate.travelMinutes * 60;
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > 7 * 86400) return undefined;
  return seconds / 60;
}

export function isLiveTransitEstimate(estimate: Pick<TravelEstimateInput, "provider" | "status">): boolean {
  return estimate.status === "ready" && (estimate.provider === "kakao-transit" || estimate.provider === "google-transit");
}

export function canScheduleTravelEstimate(estimate: Partial<TravelEstimateResult>, nowMs: number): boolean {
  // Legacy/expired estimates remain readable; automation waits for a fresh route lookup.
  return estimate.status === "ready" && ["kakao", "kakao-transit", "google", "google-transit"].includes(estimate.provider ?? "")
    && estimate.cacheStatus !== "stale" && estimate.timingBasis !== "distance" && estimate.timingBasis !== "unavailable"
    && Number.isFinite(Date.parse(estimate.updatedAt ?? ""))
    && Date.parse(estimate.updatedAt!) <= nowMs
    && Date.parse(estimate.expiresAt ?? "") > nowMs;
}

// Absolute timing shared by screens, notifications, widgets and Live Activity. P defaults to zero;
// the reminder lead time is not preparation time and never changes D or B.
export function resolveTravelTiming(
  estimate: Partial<TravelEstimateResult>, targetAt: string, timeBasis: "arrival" | "departure",
  travelMinutes: number, bufferMinutes: number, preparationMinutes = 0, nowMs = Date.now(),
) {
  const target = Date.parse(targetAt);
  const durationSeconds = estimate.durationSeconds ?? travelMinutes * 60;
  if (!Number.isFinite(target) || !Number.isFinite(durationSeconds) || durationSeconds < 0) return undefined;
  const matches = timeBasis === "arrival" && estimate.requestArrivalTime === targetAt;
  const bufferSeconds = timeBasis === "departure" ? 0 : matches ? estimate.bufferSeconds ?? bufferMinutes * 60 : bufferMinutes * 60;
  const calculated = timeBasis === "departure" ? target : target - durationSeconds * 1000 - bufferSeconds * 1000;
  const departure = matches && estimate.departureAt && Number.isFinite(Date.parse(estimate.departureAt)) ? Date.parse(estimate.departureAt) : calculated;
  return {
    targetAt, departureAt: new Date(departure).toISOString(),
    arrivalAt: new Date(departure + durationSeconds * 1000).toISOString(),
    preparationAt: new Date(departure - preparationMinutes * 60000).toISOString(),
    nowArrivalAt: departure <= nowMs ? new Date(nowMs + durationSeconds * 1000).toISOString() : undefined,
    durationSeconds, bufferSeconds,
    arrivalFeasible: timeBasis === "departure" || departure + durationSeconds * 1000 + bufferSeconds * 1000 <= target,
  };
}

export function formatRouteClock(value: string, timeZone: string): string {
  const parts = getZonedDateTimeParts(new Date(value), timeZone);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}
