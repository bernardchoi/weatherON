import type { RecommendationState } from "../types/recommendation";
import type { WeatherSnapshot } from "../types/weather";
import { getWeatherSignals } from "./weatherSignals";

export function recommendUmbrella(weather: WeatherSnapshot): RecommendationState {
  const signals = getWeatherSignals(weather);
  const maxPrecipitation = Math.max(weather.current.precipitationMm, ...weather.hourly.map((hour) => hour.precipitationMm));
  const maxRainProbability = Math.max(weather.current.rainProbabilityPct, ...weather.hourly.map((hour) => hour.rainProbabilityPct));

  if (!signals.isRainy && maxRainProbability < 40) {
    return {
      level: "none",
      title: "우산 불필요",
      reason: "강수 신호가 낮아 앱 내 안내만 유지",
    };
  }

  if (signals.isWindy && maxPrecipitation >= 1) {
    return {
      level: "required",
      title: "우비 또는 방수 아우터 우선",
      reason: "바람이 강해 장우산보다 착용형 비 대응이 안전",
    };
  }

  if (maxPrecipitation >= 10) {
    return {
      level: "required",
      title: "장우산 또는 우비 필요",
      reason: "시간당 강수량이 높아 작은 우산만으로는 부족",
    };
  }

  if (maxPrecipitation >= 5 || signals.isLongRain) {
    return {
      level: "required",
      title: "큰 3단 우산 추천",
      reason: "비가 오래 이어질 가능성이 있어 큰 우산이 유리",
    };
  }

  if (maxRainProbability >= 60 || maxPrecipitation >= 1) {
    return {
      level: "recommended",
      title: "3단 우산 추천",
      reason: "강수확률 또는 예상 강수량이 외출 판단 기준을 넘음",
    };
  }

  return {
    level: "notice",
    title: "소형 우산 선택",
    reason: "비 가능성은 있으나 강도는 낮아 가벼운 대비로 충분",
  };
}
