import type { WeatheronWidgetSnapshot } from "./widgetSnapshot.shared";

export * from "./widgetSnapshot.shared";

export function saveWeatheronWidgetLocations(_locations: import("./widgetLocations").WidgetLocation[]): boolean {
  return false;
}

export function saveWeatheronWidgetSnapshot(_snapshot: WeatheronWidgetSnapshot): boolean {
  return false;
}
