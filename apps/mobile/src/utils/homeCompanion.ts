import { buildHomePreparation, snapshotReliable } from "./homeOuting";
import type { DestinationCare, WeatherSnapshot } from "@weatheron/shared";

export function getHomeCompanionMessage(weather: WeatherSnapshot, reliable: boolean, now = Date.now()) {
  if (!reliable || !snapshotReliable(weather, now)) return "저장된 날씨예요. 최신 정보를 다시 확인해 주세요.";
  return buildHomePreparation(weather, undefined, true, now).copy;

}

export function getHomeDepartureSummary(
  care: DestinationCare,
  ready: boolean,
  departureAt?: string,
  now = Date.now(),
  timeBasis: "arrival" | "departure" = "arrival",
) {
  if (!ready) return { value: "어디로 갈까요?", body: "목적지를 고르면 출발 시간을 알려드려요.", soon: false };
  const advice = care.departureAdvice;
  // 출발 기준에서는 사용자가 고른 출발 시각이 아닌, 경로 시간으로 계산한 도착 시각을 주값으로 보여준다.
  const time = timeBasis === "departure" ? advice?.targetArrivalTime : advice?.recommendedDepartureTime;
  if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !["ready", "fallback"].includes(advice?.travelStatus ?? "")) {
    return {
      value: advice?.travelStatus === "loading" ? "경로 확인 중" : "경로 확인 필요",
      body: `이동 시간을 확인한 뒤 ${timeBasis === "departure" ? "도착" : "출발"} 시간을 안내해요.`,
      soon: false,
    };
  }
  const remaining = departureAt ? Date.parse(departureAt) - now : NaN;
  if (!Number.isFinite(remaining)) {
    return { value: "경로 확인 필요", body: "출발지와 도착 시간을 확인해 주세요.", soon: false };
  }
  if (remaining < 0) {
    return timeBasis === "departure"
      ? { value: "출발 시간 변경 필요", body: "지난 출발 시간이라 새 출발 시간을 골라 주세요.", soon: false }
      : { value: "도착 시간 변경 필요", body: "지난 출발 시간이라 새 도착 시간을 골라 주세요.", soon: false };
  }
  const soon = (timeBasis === "departure" || advice?.travelStatus === "ready") && remaining <= 30 * 60_000;
  return {
    value: time,
    body: timeBasis === "departure"
      ? advice?.travelStatus === "fallback"
        ? "예상 이동시간 기준 도착 예정 시간이에요. 경로를 다시 확인해 주세요."
        : "선택한 출발 시간과 이동시간 기준 도착 예정 시간이에요."
      : advice?.travelStatus === "fallback"
      ? "예상 출발 시간이에요. 경로를 다시 확인해 주세요."
      : soon ? "출발이 가까워졌어요. 챙길 것 확인해 볼까요?" : `${advice?.targetArrivalTime ?? "예정 시각"} 도착에 맞춘 출발 시간이에요.`,
    soon,
  };
}
