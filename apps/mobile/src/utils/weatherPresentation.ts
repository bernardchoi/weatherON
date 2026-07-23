import type { WeatherCondition } from "@weatheron/shared";
import { uiIconAssets } from "../assets";
import type { AppTheme } from "../theme/tokens";

export function getConditionLabel(condition: WeatherCondition | string): string {
  if (condition === "clear") return "맑음";
  if (condition === "cloud") return "흐림";
  if (condition === "rain") return "비";
  if (condition === "snow") return "눈";
  if (condition === "storm") return "강한 비";
  if (condition === "dust") return "먼지";
  return "날씨";
}

export function getConditionIcon(condition: WeatherCondition | string) {
  if (condition === "rain" || condition === "storm" || condition === "snow") return uiIconAssets.rain;
  if (condition === "dust") return uiIconAssets.wind;
  return uiIconAssets.uv;
}

export function getConditionColor(condition: WeatherCondition | string, theme: AppTheme): string {
  if (condition === "rain" || condition === "storm" || condition === "snow") return theme.sky;
  if (condition === "dust" || condition === "cloud") return theme.clear;
  return theme.gold;
}
