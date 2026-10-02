import WeatheronWidgetDataModule from "../../modules/weatheron-widget-data/src/WeatheronWidgetDataModule";
import type { WeatheronWidgetSnapshot } from "./widgetSnapshot.shared";

export * from "./widgetSnapshot.shared";

export function saveWeatheronWidgetLocations(_locations: import("./widgetLocations").WidgetLocation[]): boolean {
  return false;
}

export function saveWeatheronWidgetSnapshot(snapshot: WeatheronWidgetSnapshot): boolean {
  try {
    return WeatheronWidgetDataModule?.saveSnapshot(JSON.stringify(snapshot)) ?? false;
  } catch {
    return false;
  }
}
