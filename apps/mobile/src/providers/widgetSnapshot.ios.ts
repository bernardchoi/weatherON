import WeatheronWidgetDataModule from "../../modules/weatheron-widget-data/src/WeatheronWidgetDataModule";
import {
  createWeatheronWidgetSnapshot,
  weatheronWidgetAppGroup,
  weatheronWidgetDeepLink,
  type WeatheronWidgetSnapshot,
} from "./widgetSnapshot.shared";

export { createWeatheronWidgetSnapshot, weatheronWidgetAppGroup, weatheronWidgetDeepLink };
export type { WeatheronWidgetSnapshot };

export function saveWeatheronWidgetSnapshot(snapshot: WeatheronWidgetSnapshot): boolean {
  try {
    return WeatheronWidgetDataModule?.saveSnapshot(JSON.stringify(snapshot)) ?? false;
  } catch {
    return false;
  }
}
