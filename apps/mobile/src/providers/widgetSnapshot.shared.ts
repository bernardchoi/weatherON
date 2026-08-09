import type {
  DestinationTransportMode,
  OutfitRecommendation,
  RecommendationState,
  WeatherSnapshot,
} from "@weatheron/shared";
import { getConditionLabel } from "../utils/weatherPresentation";

export const weatheronWidgetAppGroup = "group.com.weatheron.mobile";
export const weatheronWidgetDeepLink = "weatheron://home";

export type WeatheronWidgetHourlySnapshot = {
  time: string;
  temperatureC: number;
  condition: string;
  rainProbabilityPct: number;
};

export type WeatheronWidgetOutfitItem = {
  category: "outer" | "top" | "bottom" | "shoes";
  name: string;
};

export type WeatheronWidgetLocationSnapshot = {
  id: string;
  kind: "current" | "destination";
  locationName: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: WeatherSnapshot["current"]["condition"];
  conditionLabel: string;
  rainProbabilityPct: number;
  humidityPct: number;
  windMs: number;
  umbrellaNeeded: boolean;
  outerNeeded: boolean;
  maskNeeded: boolean;
  outfitSummary: string;
  outfitItems: WeatheronWidgetOutfitItem[];
  outfitVariant: OutfitRecommendation["variant"];
  observedAt: string;
  hourly: WeatheronWidgetHourlySnapshot[];
  departureTime?: string;
  arrivalTime?: string;
  travelMinutes?: number;
  transportMode?: DestinationTransportMode;
  deepLink: string;
};

export type WeatheronWidgetStoreSnapshot = {
  schemaVersion: 2;
  updatedAt: string;
  selectedDestinationId?: string;
  current: WeatheronWidgetLocationSnapshot;
  destinations: WeatheronWidgetLocationSnapshot[];
};

// v1 이름은 플랫폼 래퍼 호환을 위해 유지한다.
export type WeatheronWidgetSnapshot = WeatheronWidgetStoreSnapshot;

type WidgetLocationOptions = {
  id?: string;
  kind?: WeatheronWidgetLocationSnapshot["kind"];
  departureTime?: string;
  arrivalTime?: string;
  travelMinutes?: number;
  transportMode?: DestinationTransportMode;
  deepLink?: string;
};

export function createWeatheronWidgetLocationSnapshot(
  weather: WeatherSnapshot,
  outfit: OutfitRecommendation,
  umbrella: RecommendationState,
  options: WidgetLocationOptions = {},
): WeatheronWidgetLocationSnapshot {
  const kind = options.kind ?? "current";
  return {
    id: options.id ?? weather.locationId,
    kind,
    locationName: weather.locationName,
    temperatureC: Math.round(weather.current.tempC),
    feelsLikeC: Math.round(weather.current.feelsLikeC),
    condition: weather.current.condition,
    conditionLabel: getConditionLabel(weather.current.condition),
    rainProbabilityPct: Math.round(weather.current.rainProbabilityPct),
    humidityPct: Math.round(weather.current.humidityPct),
    windMs: Math.round(weather.current.windMs * 10) / 10,
    umbrellaNeeded: umbrella.level !== "none",
    outerNeeded: Boolean(outfit.items.outer),
    maskNeeded: (weather.current.pm10 ?? 0) > 80 || (weather.current.pm25 ?? 0) > 35,
    outfitSummary: getOutfitSummary(outfit),
    outfitItems: getOutfitItems(outfit),
    outfitVariant: outfit.variant,
    observedAt: weather.observedAt,
    hourly: weather.hourly.slice(0, 6).map((hour) => ({
      time: hour.time,
      temperatureC: Math.round(hour.tempC),
      condition: hour.condition,
      rainProbabilityPct: Math.round(hour.rainProbabilityPct),
    })),
    departureTime: options.departureTime,
    arrivalTime: options.arrivalTime,
    travelMinutes: options.travelMinutes,
    transportMode: options.transportMode,
    deepLink: options.deepLink ?? weatheronWidgetDeepLink,
  };
}

export function createWeatheronWidgetStoreSnapshot(
  current: WeatheronWidgetLocationSnapshot,
  destinations: WeatheronWidgetLocationSnapshot[],
  selectedDestinationId?: string,
): WeatheronWidgetStoreSnapshot {
  return {
    schemaVersion: 2,
    updatedAt: new Date().toISOString(),
    selectedDestinationId,
    current,
    destinations,
  };
}

// 기존 호출부나 외부 테스트가 단일 현재 위치 스냅샷을 만들 때 사용하는 호환 함수.
export function createWeatheronWidgetSnapshot(
  weather: WeatherSnapshot,
  outfit: OutfitRecommendation,
  umbrella: RecommendationState,
): WeatheronWidgetStoreSnapshot {
  const current = createWeatheronWidgetLocationSnapshot(weather, outfit, umbrella);
  return createWeatheronWidgetStoreSnapshot(current, []);
}

export function getWeatheronDestinationDeepLink(destinationId: string): string {
  return `weatheron://destination?id=${encodeURIComponent(destinationId)}`;
}

export function subtractWidgetTime(time: string, minutes: number): string | undefined {
  if (!/^\d{2}:\d{2}$/u.test(time) || !Number.isFinite(minutes)) return undefined;
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;
  const dayMinutes = 24 * 60;
  const total = ((hour * 60 + minute - Math.round(minutes)) % dayMinutes + dayMinutes) % dayMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function getOutfitSummary(outfit: OutfitRecommendation): string {
  return getOutfitItems(outfit).slice(0, 3).map((item) => item.name).join(" · ");
}

function getOutfitItems(outfit: OutfitRecommendation): WeatheronWidgetOutfitItem[] {
  return [
    outfit.items.outer ? { category: "outer", name: outfit.items.outer.name } : undefined,
    { category: "top", name: outfit.items.top.name },
    { category: "bottom", name: outfit.items.bottom.name },
    { category: "shoes", name: outfit.items.shoes.name },
  ].filter((item): item is WeatheronWidgetOutfitItem => Boolean(item));
}
