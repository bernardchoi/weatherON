import { getZonedDateTimeParts } from "./zonedDateTime";
import type { DestinationTransportMode } from "@weatheron/shared";
import type { TravelEstimateResult } from "../providers/travelEstimateClient";
import type { PlaceSearchResult } from "@weatheron/shared";
import type { WeatherLocationPreset } from "../providers/weatherLocations";

export type LeavingNowRouteState = {
  status: "loading" | "ready" | "error" | "offline";
  result?: TravelEstimateResult;
};

export function getLeavingNowRouteKey(origin: WeatherLocationPreset, place: PlaceSearchResult, transportMode: DestinationTransportMode): string {
  return JSON.stringify([origin.locationId, origin.coordinate.latitude, origin.coordinate.longitude, origin.countryCode, place.id, place.coordinate.latitude, place.coordinate.longitude, place.countryCode, transportMode === "auto" ? "drive" : transportMode]);
}

export function isLeavingNowRouteResult(result: TravelEstimateResult | undefined, nowMs: number): result is TravelEstimateResult {
  return Boolean(result && result.requestKind === "now" && !result.requestArrivalTime && !result.requestDepartureTime
    && result.status === "ready" && result.provider !== "fallback" && (result.timingBasis === "current" || result.timingBasis === "route")
    && Number.isFinite(result.durationSeconds) && result.durationSeconds! >= 0 && result.durationSeconds! <= 7 * 86400
    && Number.isFinite(Date.parse(result.updatedAt)) && Date.parse(result.updatedAt) <= nowMs
    && Number.isFinite(Date.parse(result.expiresAt ?? "")));
}

export function resolveLeavingNowTiming(state: LeavingNowRouteState | undefined, nowMs: number) {
  const result = isLeavingNowRouteResult(state?.result, nowMs) ? state.result : undefined;
  const reference = Boolean(result && (state?.status !== "ready" || result.cacheStatus === "stale" || Date.parse(result.expiresAt!) <= nowMs));
  // A failed lookup keeps the original query's ETA; it must not slide forward as a new lookup.
  const departure = result ? reference ? Date.parse(result.departureAt ?? result.updatedAt) : nowMs : NaN;
  return {
    nowArrivalStatus: state?.status ?? "idle" as const,
    nowArrivalReference: reference,
    nowArrivalAt: result && Number.isFinite(departure) ? new Date(departure + result.durationSeconds! * 1000).toISOString() : undefined,
    nowRouteUpdatedAt: result?.updatedAt,
    nowRouteExpiresAt: result?.expiresAt,
    nowRouteMessage: result?.message,
  };
}

export function getLeavingNowDescription(timing: ReturnType<typeof resolveLeavingNowTiming>, timeZone: string): string {
  const clock = (value: string) => {
    const parts = getZonedDateTimeParts(new Date(value), timeZone);
    return `${parts.year}/${parts.month}/${parts.day} ${formatRouteClock(value, timeZone)}`;
  };
  const status = timing.nowArrivalStatus === "loading" ? "지금 출발 도착 조회 중" : timing.nowArrivalStatus === "offline" ? "오프라인/연결 실패" : timing.nowArrivalStatus === "error" ? "지금 출발 경로 조회 실패" : "";
  const arrival = timing.nowArrivalAt ? `지금 출발 시 ${clock(timing.nowArrivalAt)} 도착 예상` : "지금 출발 도착 예상 확인 불가";
  return [status, arrival, timing.nowArrivalReference ? "이전 조회 기준 참고" : timing.nowArrivalAt ? "최신 조회" : "", timing.nowRouteUpdatedAt ? `조회 ${clock(timing.nowRouteUpdatedAt)}` : "", timing.nowRouteMessage].filter(Boolean).join(" · ");
}

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
  travelMinutes: number, bufferMinutes: number, preparationMinutes = 0,
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
    durationSeconds, bufferSeconds,
    arrivalFeasible: timeBasis === "departure" || departure + durationSeconds * 1000 + bufferSeconds * 1000 <= target,
  };
}

export function formatRouteClock(value: string, timeZone: string): string {
  const parts = getZonedDateTimeParts(new Date(value), timeZone);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}
