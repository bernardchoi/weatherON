import type { WeatherCondition } from "@weatheron/shared";
import { uiIconAssets } from "../assets";
import type { AppTheme } from "../theme/tokens";

export function getConditionLabel(condition: WeatherCondition | string): string {
  if (condition === "clear") return "맑음";
  if (condition === "cloud") return "흐림";
  if (condition === "rain") return "비";
  if (condition === "snow") return "눈";
  if (condition === "sleet") return "진눈깨비";
  if (condition === "hail") return "우박";
  if (condition === "storm-hail") return "뇌우와 우박";
  if (condition === "mixed") return "비와 눈";
  if (condition === "storm") return "강한 비";
  if (condition === "dust") return "먼지";
  return "날씨 확인 중";
}

export function getConditionIcon(condition: WeatherCondition | string, isNight = false) {
  if (condition === "rain" || condition === "storm" || condition === "snow" || condition === "sleet" || condition === "hail" || condition === "storm-hail" || condition === "mixed") return uiIconAssets.rain;
  if (condition === "dust") return uiIconAssets.wind;
  if (condition === "cloud") return uiIconAssets.cloud;
  if (condition === "clear" && isNight) return uiIconAssets.clearNight;
  return condition === "unknown" ? uiIconAssets.cloud : uiIconAssets.uv;
}

export function getConditionColor(condition: WeatherCondition | string, theme: AppTheme, isNight = false): string {
  if (condition === "rain" || condition === "storm" || condition === "snow" || condition === "sleet" || condition === "hail" || condition === "storm-hail" || condition === "mixed") return theme.sky;
  if (condition === "dust" || condition === "cloud") return theme.clear;
  if (condition === "unknown") return theme.muted;
  if (condition === "clear" && isNight) return theme.skyLite;
  return theme.gold;
}
