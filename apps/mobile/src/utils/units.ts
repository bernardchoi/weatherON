import type { DistanceUnit, TemperatureUnit } from "../state/useWeatherOnAppState";

export function formatTemperature(valueC: number, unit: TemperatureUnit, options: { suffix?: boolean } = {}) {
  const suffix = options.suffix ?? false;
  const value = unit === "fahrenheit" ? Math.round((valueC * 9) / 5 + 32) : Math.round(valueC);
  return `${value}°${suffix ? (unit === "fahrenheit" ? "F" : "C") : ""}`;
}

export function formatTemperatureDelta(valueC: number, unit: TemperatureUnit) {
  const value = unit === "fahrenheit" ? Math.round((valueC * 9) / 5) : Math.round(valueC);
  if (value > 0) return `+${value}°`;
  if (value === 0) return "±0°";
  return `${value}°`;
}

export function formatDistance(valueMeters: number, unit: DistanceUnit) {
  if (!valueMeters) return "";
  if (unit === "mile") return `${(valueMeters / 1609.344).toFixed(1)}mi`;
  if (valueMeters < 1000) return `${Math.round(valueMeters)}m`;
  return `${(valueMeters / 1000).toFixed(1)}km`;
}
