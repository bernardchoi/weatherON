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

export function getHomeDepartureSummary(care: DestinationCare, ready: boolean, departureAt?: string, now = Date.now()) {
  if (!ready) return { value: "어디로 갈까요?", body: "목적지를 고르면 출발 시간을 알려드려요.", soon: false };
  const advice = care.departureAdvice;
  const time = advice?.recommendedDepartureTime;
  if (!time || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !["ready", "fallback"].includes(advice?.travelStatus ?? "")) {
    return { value: advice?.travelStatus === "loading" ? "경로 확인 중" : "경로 확인 필요", body: "이동 시간을 확인한 뒤 출발 시간을 안내해요.", soon: false };
  }
  const remaining = departureAt ? Date.parse(departureAt) - now : NaN;
  const soon = advice?.travelStatus === "ready" && remaining >= 0 && remaining <= 30 * 60_000;
  return {
    value: time,
    body: advice?.travelStatus === "fallback"
      ? "예상 출발 시간이에요. 경로를 다시 확인해 주세요."
      : soon ? "출발이 가까워졌어요. 챙길 것 확인해 볼까요?" : `${advice?.targetArrivalTime ?? "예정 시각"} 도착에 맞춘 출발 시간이에요.`,
    soon,
  };
}
