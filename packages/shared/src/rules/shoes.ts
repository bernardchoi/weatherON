import type { RecommendationState } from "../types/recommendation";
import type { DestinationCare } from "../types/recommendation";
import type { WeatherSnapshot } from "../types/weather";
import { getWeatherSignals } from "./weatherSignals";

export function recommendShoes(weather: WeatherSnapshot, destinationCategory?: DestinationCare["category"]): RecommendationState {
  const signals = getWeatherSignals(weather);

  if (weather.current.condition === "snow" || signals.isCold) {
    return {
      level: "recommended",
      title: "보온·미끄럼 방지 신발",
      reason: "추위나 눈 신호가 있어 접지력과 보온이 중요",
    };
  }

  if (signals.isRainy) {
    return {
      level: "recommended",
      title: "방수 스니커즈 추천",
      reason: "젖은 노면 가능성이 있어 방수 소재가 안정적",
    };
  }

  if (destinationCategory === "mountain") {
    return {
      level: "recommended",
      title: "쿠션 있는 워킹화",
      reason: "장거리 이동 목적지라 발 피로를 줄이는 신발 우선",
    };
  }

  if (destinationCategory === "beach") {
    return {
      level: "notice",
      title: "물가용 가벼운 신발",
      reason: "해변 목적지라 젖어도 관리 쉬운 소재가 좋음",
    };
  }

  if (destinationCategory === "work") {
    return {
      level: "notice",
      title: "로퍼 또는 깔끔한 스니커즈",
      reason: "업무 목적지에 맞춰 단정한 신발 우선",
    };
  }

  return {
    level: "none",
    title: "기본 스니커즈 가능",
    reason: "날씨 위험 신호가 낮아 평소 신발로 충분",
  };
}
