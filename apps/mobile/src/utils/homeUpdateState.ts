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
