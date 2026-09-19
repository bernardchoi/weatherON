import type { DistanceUnit, TemperatureUnit } from "../state/useWeatherOnAppState";
import { formatDisplayNumber, formatDisplayUnit } from "../localization/localization";

export function formatTemperature(valueC: number, unit: TemperatureUnit, options: { suffix?: boolean } = {}) {
  const suffix = options.suffix ?? false;
  const value = unit === "fahrenheit" ? Math.round((valueC * 9) / 5 + 32) : Math.round(valueC);
  return `${formatDisplayNumber(value)}°${suffix ? (unit === "fahrenheit" ? "F" : "C") : ""}`;
}

export function formatTemperatureDelta(valueC: number, unit: TemperatureUnit) {
  const value = unit === "fahrenheit" ? Math.round((valueC * 9) / 5) : Math.round(valueC);
  if (value > 0) return `+${formatDisplayNumber(value)}°`;
  if (value === 0) return "±0°";
  return `${formatDisplayNumber(value)}°`;
}

export function formatDistance(valueMeters: number, unit: DistanceUnit) {
  if (!valueMeters) return "";
  if (unit === "mile") return formatDisplayUnit(valueMeters / 1609.344, "mile", 1);
  if (valueMeters < 1000) return formatDisplayUnit(valueMeters, "meter", 0);
  return formatDisplayUnit(valueMeters / 1000, "kilometer", 1);
}
