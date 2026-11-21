import type { PlaceSearchResult } from "@weatheron/shared";
import type { WeatherLocationPreset } from "../providers/weatherLocations";
import type { DestinationTravelEstimate } from "../state/appStateTypes";

export type HomeUpdateState = { routePending: boolean; currentWeatherPending: boolean; destinationWeatherPending: boolean; currentWeatherRevision?: number };

/** Request identity is shared with the existing fetch effect, not a new request. */
export function homeRouteRequestKey(origin: unknown, place: unknown, schedule: unknown, targetAt: string | null | undefined) {
  return JSON.stringify({ origin, place, schedule, targetAt });
}

export function homeRouteStatus(estimate: DestinationTravelEstimate, pending: boolean, validTiming: boolean, queryTime?: string, now = Date.now()) {
  if (pending) return validTiming ? "이동시간 확인 중 · 이전 조회 기준" : "새 일정의 이동시간 확인 중";
  if (!validTiming) return estimate.status === "error" ? "경로 확인 실패 · 다시 시도해 주세요" : "경로 확인 필요";
  const reference = estimate.cacheStatus === "stale" || estimate.status !== "ready" || !(Date.parse(estimate.expiresAt ?? "") > now);
  return `${reference ? "이전 조회 기준 · 다시 확인 필요" : "조회한 경로 기준"}${queryTime ? ` · 조회 ${queryTime}` : ""}`;
}

/** An obsolete request must never clear a newer request's busy state. */
export function finishHomeRouteRequest(current: Record<string, number>, key: string, revision: number) {
  if (current[key] !== revision) return current;
  const next = { ...current }; delete next[key]; return next;
}

// Match the selected point, not a shared forecast grid or display name alone.
// The second branch tolerates GPS/geocoder drift only with the same full address.
export function homeDestinationMatchesOrigin(origin: WeatherLocationPreset | null | undefined, destination: PlaceSearchResult) {
  if (!origin || origin.countryCode !== destination.countryCode) return false;
  if (origin.countryIsoCode && destination.countryIsoCode && origin.countryIsoCode !== destination.countryIsoCode) return false;
  const a = origin.coordinate, b = destination.coordinate;
  if (![a.latitude, a.longitude, b.latitude, b.longitude].every(Number.isFinite)
    || Math.abs(a.latitude) > 90 || Math.abs(b.latitude) > 90 || Math.abs(a.longitude) > 180 || Math.abs(b.longitude) > 180) return false;
  if (origin.locationId === destination.id) return true;
  const radians = Math.PI / 180;
  const h = Math.sin((b.latitude - a.latitude) * radians / 2) ** 2
    + Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * Math.sin((b.longitude - a.longitude) * radians / 2) ** 2;
  const meters = 12_742_000 * Math.asin(Math.min(1, Math.sqrt(Math.max(0, h))));
  const normalize = (value: string) => value.normalize("NFKC").replace(/\s+/gu, "");
  const address = normalize(destination.address);
  return meters < 1 || (meters <= 75 && /\d/u.test(address) && normalize(origin.locationName) === address);
}
