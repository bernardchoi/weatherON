import type { OutfitRecommendation, RecommendationState, WeatherSnapshot } from "@weatheron/shared";
import { getConditionLabel } from "../utils/weatherPresentation";

export const weatheronWidgetAppGroup = "group.com.weatheron.mobile";
export const weatheronWidgetDeepLink = "weatheron://home";

export type WeatheronWidgetSnapshot = {
  schemaVersion: 1;
  locationName: string;
  temperatureC: number;
  condition: WeatherSnapshot["current"]["condition"];
  conditionLabel: string;
  advice: string;
  observedAt: string;
};

export function saveWeatheronWidgetSnapshot(_snapshot: WeatheronWidgetSnapshot): boolean {
  return false;
}

export function createWeatheronWidgetSnapshot(
  weather: WeatherSnapshot,
  outfit: OutfitRecommendation,
  umbrella: RecommendationState,
): WeatheronWidgetSnapshot {
  return {
    schemaVersion: 1,
    locationName: weather.locationName,
    temperatureC: Math.round(weather.current.tempC),
    condition: weather.current.condition,
    conditionLabel: getConditionLabel(weather.current.condition),
    advice: [getUmbrellaAdvice(umbrella), getOuterAdvice(outfit), getMaskAdvice(weather)].join(" · "),
    observedAt: weather.observedAt,
  };
}

function getUmbrellaAdvice(umbrella: RecommendationState): string {
  return umbrella.level === "none" ? "우산 X" : "우산 O";
}

function getOuterAdvice(outfit: OutfitRecommendation): string {
  return outfit.items.outer ? "외투 O" : "외투 X";
}

function getMaskAdvice(weather: WeatherSnapshot): string {
  const needsMask = (weather.current.pm10 ?? 0) > 80 || (weather.current.pm25 ?? 0) > 35;
  return needsMask ? "마스크 O" : "마스크 X";
}
