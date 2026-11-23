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

// A Korean geocoder can repeat a neighborhood token or omit the district.
// Match the numbered street/lot, not a POI name, district alone or forecast grid.
function koreanAddressKey(value: string) {
  const words = [...new Set(value.normalize("NFKC").trim().split(/\s+/u))];
  const match = words.join(" ").match(/(?:^|\s)([가-힣0-9·]+(?:로|길|동|리|[0-9]가))\s+(\d+(?:-\d+)?)(?=\s|$)/u);
  if (!match) return null;
  const prefix = words.join(" ").slice(0, match.index).split(/\s+/u);
  const area = prefix.filter(part => /(?:특별시|광역시|자치시|자치도|시|도|군|구)$|^(?:서울|부산|대구|인천|광주|대전|울산|세종)$/u.test(part));
  return { premise: match[1] + " " + match[2], area };
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
  if (meters <= 75 && /\d/u.test(address) && normalize(origin.locationName) === address) return true;
  if (meters > 45) return false;
  if (origin.countryCode !== "KR") return meters < 1;
  const originKey = koreanAddressKey(origin.locationName);
  const destinationKey = koreanAddressKey(destination.address);
  if (!originKey || !destinationKey) return meters < 1;
  if (originKey.premise !== destinationKey.premise) return false;
  // Missing district is OK, conflicting explicitly known districts are not.
  const canonical = (area: string) => area.replace(/^(서울|부산|대구|인천|광주|대전|울산|세종)(?:특별자치시|특별시|광역시|시)$/u, "$1");
  const conflict = (kind: RegExp) => {
    const a = originKey.area.filter(part => kind.test(part)).map(canonical);
    const b = destinationKey.area.filter(part => kind.test(part)).map(canonical);
    return a.length > 0 && b.length > 0 && !a.some(part => b.includes(part));
  };
  return !conflict(/도$/u) && !conflict(/시$|^(?:서울|부산|대구|인천|광주|대전|울산|세종)$/u) && !conflict(/(?:구|군)$/u);
}
