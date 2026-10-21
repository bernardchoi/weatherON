import type { RecommendationState } from "../types/recommendation";
import type { WeatherSnapshot } from "../types/weather";
import type { HourlyWeather } from "../types/weather";

// This is the same near-term window shown by the umbrella screen. A rain cell
// far beyond those six hours must not select a long umbrella against a 0%
// chart, while a current observation remains an immediate safety signal.
export const UMBRELLA_FORECAST_WINDOW_HOURS = 6;

export type UmbrellaRecommendationOptions = {
  /**
   * Limit the forecast considered by a surface that only displays a near-term
   * chart. Omitting this deliberately retains the all-hour behavior used by
   * existing non-iOS consumers.
   */
  forecastWindowHours?: number;
  /** A caller-supplied, timestamp-resolved near-term horizon. */
  forecastHours?: readonly HourlyWeather[];
};

export function recommendUmbrella(weather: WeatherSnapshot, options: UmbrellaRecommendationOptions = {}): RecommendationState {
  const hours = options.forecastHours ? [...options.forecastHours] : getRecommendationHours(weather.hourly, options.forecastWindowHours);
  const timeRangeLabel = options.forecastHours || options.forecastWindowHours ? "표시한 가까운 시간대" : "예보 시간대";
  const currentIsRainy = isRainCondition(weather.current.condition);
  const currentIsHail = isHailCondition(weather.current.condition);
  const hourlyHail = hours.some((hour) => isConditionAvailable(hour) && isHailCondition(hour.condition));
  if (currentIsHail || hourlyHail) {
    return { level: "required", title: "실내 대기 우선", reason: "우박 신호가 있어 우산 종류보다 실외 이동을 잠시 보류하고 안전을 확인하는 것이 우선", prioritizeShelter: true };
  }

  const probabilities = [
    numeric(weather.current.rainProbabilityPct),
    ...hours.filter((hour) => isRainProbabilityAvailable(hour)).map((hour) => numeric(hour.rainProbabilityPct)),
  ].filter(isNumber);
  const precipitation = [
    numeric(weather.current.precipitationMm),
    ...hours.filter((hour) => isPrecipitationAvailable(hour)).map((hour) => numeric(hour.precipitationMm)),
  ].filter(isNumber);
  const wind = [
    weather.current.windAvailable === false ? undefined : numeric(weather.current.windMs),
    ...hours.filter((hour) => hour.available?.wind !== false).map((hour) => numeric(hour.windMs)),
  ].filter(isNumber);
  const maxRainProbability = maximum(probabilities);
  const maxPrecipitation = maximum(precipitation);
  const maxWind = maximum(wind);
  const hasRainData = probabilities.length > 0 || precipitation.length > 0;
  const rainyHours = hours.filter((hour) =>
    (isConditionAvailable(hour) && isRainCondition(hour.condition))
    || (isRainProbabilityAvailable(hour) && (numeric(hour.rainProbabilityPct) ?? 0) >= 60)
    || (isPrecipitationAvailable(hour) && (numeric(hour.precipitationMm) ?? 0) >= 1),
  ).length;

  // Do not turn a missing forecast into a false "no umbrella" assurance. A
  // known current condition still wins, because it is an observation rather
  // than an absent future value.
  if (!hasRainData && !currentIsRainy) {
    return { level: "notice", title: "강수 정보 확인 중", reason: "가까운 시간대 강수 정보가 확인되면 우산 종류를 다시 안내" };
  }

  if (currentIsRainy && maxPrecipitation < 1 && maxRainProbability < 60) {
    return { level: "recommended", title: "3단 우산 추천", reason: "현재 비 신호가 있어 가까운 이동에는 휴대 가능한 우산이 안전" };
  }

  if (!currentIsRainy && maxPrecipitation === 0 && maxRainProbability < 40) {
    return {
      level: "none",
      title: "우산 불필요",
      reason: `${timeRangeLabel}에 강수 확률과 예상 강수량이 모두 없음`,
    };
  }

  if (maxWind >= 7 && maxPrecipitation >= 1) {
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
      reason: `${timeRangeLabel}의 강수량이 높아 작은 우산만으로는 부족`,
    };
  }

  if (maxPrecipitation >= 5 || rainyHours >= 3) {
    return {
      level: "required",
      title: "큰 3단 우산 추천",
      reason: `${timeRangeLabel}에 비가 오래 이어질 가능성이 있어 넓은 커버가 유리`,
    };
  }

  if (maxRainProbability >= 60 || maxPrecipitation >= 1) {
    return {
      level: "recommended",
      title: "3단 우산 추천",
      reason: `${timeRangeLabel}의 강수확률 또는 예상 강수량이 외출 판단 기준을 넘음`,
    };
  }

  return {
    level: "notice",
    title: "소형 우산 선택",
    reason: `${timeRangeLabel}에 약한 비 가능성은 있으나 강도는 낮아 가벼운 대비로 충분`,
  };
}

function getRecommendationHours(hours: HourlyWeather[], forecastWindowHours: number | undefined): HourlyWeather[] {
  if (typeof forecastWindowHours !== "number" || !Number.isFinite(forecastWindowHours)) return hours;
  return hours.slice(0, Math.max(0, Math.floor(forecastWindowHours)));
}

function numeric(value: number): number | undefined {
  return Number.isFinite(value) ? Math.max(0, value) : undefined;
}

function isNumber(value: number | undefined): value is number {
  return typeof value === "number";
}

function maximum(values: number[]): number {
  return values.length ? Math.max(...values) : 0;
}

function isRainProbabilityAvailable(hour: HourlyWeather): boolean {
  return hour.available?.rainProbability !== false && Number.isFinite(hour.rainProbabilityPct);
}

function isPrecipitationAvailable(hour: HourlyWeather): boolean {
  return hour.available?.precipitation !== false && Number.isFinite(hour.precipitationMm);
}

function isConditionAvailable(hour: HourlyWeather): boolean {
  return hour.available?.condition !== false;
}

function isHailCondition(condition: string): boolean {
  return condition === "hail" || condition === "storm-hail";
}

function isRainCondition(condition: string): boolean {
  return ["rain", "storm", "sleet", "hail", "storm-hail", "mixed"].includes(condition);
}
