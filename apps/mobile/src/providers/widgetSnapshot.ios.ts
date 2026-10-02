import WeatheronWidgetDataModule from "../../modules/weatheron-widget-data/src/WeatheronWidgetDataModule";
import type { WeatheronWidgetSnapshot } from "./widgetSnapshot.shared";
import type { WidgetLocation } from "./widgetLocations";

export * from "./widgetSnapshot.shared";

export function saveWeatheronWidgetLocations(locations: WidgetLocation[]): boolean {
  try {
    return WeatheronWidgetDataModule?.saveLocations(JSON.stringify(locations)) ?? false;
  } catch {
    return false;
  }
}

export function saveWeatheronWidgetSnapshot(snapshot: WeatheronWidgetSnapshot): boolean {
  try {
    return WeatheronWidgetDataModule?.saveSnapshot(JSON.stringify(snapshot)) ?? false;
  } catch {
    return false;
  }
}
