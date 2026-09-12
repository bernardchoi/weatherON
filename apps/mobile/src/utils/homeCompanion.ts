import type { DestinationCare, WeatherSnapshot } from "@weatheron/shared";

export function getHomeCompanionMessage(weather: WeatherSnapshot, reliable: boolean) {
  if (!reliable || weather.stale) return "저장된 날씨예요. 최신 정보를 다시 확인해 주세요.";
  const current = weather.current;
  if (current.condition === "storm") return "비가 강해요. 나가기 전 기상특보를 확인해 주세요.";
  if (current.condition === "snow") return "눈 소식 있어요. 미끄러운 길 조심하세요.";
  if (current.precipitationMm > 0 || current.condition === "rain") return "비가 내려요. 나갈 때 우산 챙겨요.";
  if (current.rainProbabilityPct >= 50) return "비 올 가능성이 높아요. 우산을 챙겨두세요.";
  if (current.windMs >= 7) return "바람이 강해요. 바람막이 한 겹 챙겨요.";
  if (current.feelsLikeC >= 30) return "덥게 느껴져요. 물 챙기고 쉬어가요.";
  if (current.feelsLikeC <= 8) return "공기가 차가워요. 따뜻한 겉옷 챙겨요.";
  if (current.condition === "dust") return "먼지가 있어요. 나가기 전 대기질을 확인해 주세요.";
  if (current.feelsLikeC <= 18) return "선선한 날이에요. 가벼운 겉옷이면 좋아요.";
  return "오늘 날씨에 맞춰, 나갈 준비를 함께해요.";
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
