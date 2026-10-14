import type { DailyWeather, HourlyWeather } from "@weatheron/shared";

export function dailyValueAvailable(item: DailyWeather, field: "minTemp" | "maxTemp" | "rainProbability") {
  const value = field === "minTemp" ? item.minTempC : field === "maxTemp" ? item.maxTempC : item.rainProbabilityPct;
  return item.available?.[field] !== false && Number.isFinite(value) &&
    (field !== "rainProbability" || (value >= 0 && value <= 100));
}

// A single Celsius scale also works for Fahrenheit, which is a linear conversion.
export function dailyTemperatureScale(days: DailyWeather[]) {
  const values = days.filter(day => !(dailyValueAvailable(day, "minTemp") && dailyValueAvailable(day, "maxTemp") && day.minTempC > day.maxTempC)).flatMap(day => [
    ...(dailyValueAvailable(day, "minTemp") ? [day.minTempC] : []),
    ...(dailyValueAvailable(day, "maxTemp") ? [day.maxTempC] : []),
  ]);
  if (!values.length) return null;
  const min = Math.min(...values), max = Math.max(...values);
  return { min, max, span: max - min || 1 };
}

export function dailyTemperatureRange(item: DailyWeather, scale: ReturnType<typeof dailyTemperatureScale>) {
  if (!scale || !dailyValueAvailable(item, "minTemp") || !dailyValueAvailable(item, "maxTemp") || item.minTempC > item.maxTempC) return null;
  if (scale.min === scale.max) return { left: 50, width: 0 };
  return { left: 100 * (item.minTempC - scale.min) / scale.span, width: 100 * (item.maxTempC - item.minTempC) / scale.span };
}

export function getIosDailyForecast(daily: DailyWeather[] | undefined, hourly: HourlyWeather[], fallback: DailyWeather[]) {
  if (daily?.length) return daily;
  return fallback.map(day => {
    const hours = hourly.filter(hour => (hour.time.includes("T") ? hour.time.slice(0, 10) : "__today__") === day.date);
    const temps = hours.filter(hour => hour.available?.temp !== false && Number.isFinite(hour.tempC)).map(hour => hour.tempC);
    const rain = hours.filter(hour => hour.available?.rainProbability !== false && Number.isFinite(hour.rainProbabilityPct) && hour.rainProbabilityPct >= 0 && hour.rainProbabilityPct <= 100).map(hour => hour.rainProbabilityPct);
    return { ...day, available: { minTemp: temps.length > 0, maxTemp: temps.length > 0, rainProbability: rain.length > 0 }, minTempC: temps.length ? Math.min(...temps) : NaN, maxTempC: temps.length ? Math.max(...temps) : NaN, rainProbabilityPct: rain.length ? Math.max(...rain) : NaN };
  });
}
