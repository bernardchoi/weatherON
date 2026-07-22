import type { DailyWeather, HourlyWeather, WeatherSnapshot } from "../types/weather";
import { conditionFromWeatherKit } from "./condition";
import type { WeatherKitResponse, WeatherNormalizeOptions } from "./types";

export function normalizeWeatherKitWeather(payload: WeatherKitResponse, options: WeatherNormalizeOptions): WeatherSnapshot {
  const current = payload.currentWeather;
  if (!current) {
    throw new Error("WeatherKit payload has no current weather");
  }

  const hourly = buildHourly(payload);
  const daily = buildDaily(payload);
  const observedAt = options.observedAt ?? current.asOf ?? current.metadata?.reportedTime ?? current.metadata?.readTime ?? new Date(0).toISOString();
  const currentPrecipitationMm = hourly[0]?.precipitationMm ?? current.precipitationIntensity ?? 0;

  return {
    id: `weather-${options.locationId}-${observedAt}`,
    locationId: options.locationId,
    locationName: options.locationName,
    countryCode: options.countryCode,
    observedAt,
    current: {
      tempC: current.temperature ?? hourly[0]?.tempC ?? 0,
      feelsLikeC: current.temperatureApparent ?? current.temperature ?? hourly[0]?.tempC ?? 0,
      condition: conditionFromWeatherKit(current.conditionCode),
      precipitationMm: currentPrecipitationMm,
      rainProbabilityPct: hourly[0]?.rainProbabilityPct ?? (currentPrecipitationMm > 0 ? 80 : 0),
      windMs: current.windSpeed === undefined ? hourly[0]?.windMs ?? 0 : kmhToMs(current.windSpeed),
      humidityPct: ratioToPct(current.humidity ?? getCurrentHourlyHumidity(payload)),
      uvIndex: current.uvIndex,
    },
    hourly,
    daily,
    source: "weatherkit",
    stale: options.stale ?? false,
  };
}

function buildHourly(payload: WeatherKitResponse): HourlyWeather[] {
  return (payload.forecastHourly?.hours ?? []).map((hour) => ({
    time: hour.forecastStart ?? "",
    tempC: hour.temperature ?? payload.currentWeather?.temperature ?? 0,
    rainProbabilityPct: ratioToPct(hour.precipitationChance),
    precipitationMm: hour.precipitationAmount ?? 0,
    windMs: kmhToMs(hour.windSpeed ?? payload.currentWeather?.windSpeed ?? 0),
    condition: conditionFromWeatherKit(hour.conditionCode ?? payload.currentWeather?.conditionCode),
  }));
}

function buildDaily(payload: WeatherKitResponse): DailyWeather[] | undefined {
  const days = payload.forecastDaily?.days ?? [];
  if (days.length === 0) return undefined;
  return days.map((day) => ({
    date: day.forecastStart?.slice(0, 10) ?? "",
    minTempC: day.temperatureMin ?? payload.currentWeather?.temperature ?? 0,
    maxTempC: day.temperatureMax ?? payload.currentWeather?.temperature ?? 0,
    rainProbabilityPct: ratioToPct(day.precipitationChance),
    precipitationMm: day.precipitationAmount ?? 0,
    windMs: kmhToMs(day.windSpeedAvg ?? day.windSpeed ?? payload.currentWeather?.windSpeed ?? 0),
    condition: conditionFromWeatherKit(day.conditionCode ?? payload.currentWeather?.conditionCode),
  }));
}

function getCurrentHourlyHumidity(payload: WeatherKitResponse): number | undefined {
  const currentTime = payload.currentWeather?.asOf;
  const hours = payload.forecastHourly?.hours ?? [];
  if (!hours.length) return undefined;
  if (!currentTime) return hours[0]?.humidity;
  const currentHour = currentTime.slice(0, 13);
  return hours.find((hour) => hour.forecastStart?.slice(0, 13) === currentHour)?.humidity ?? hours[0]?.humidity;
}

function ratioToPct(value?: number): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.round(value <= 1 ? value * 100 : value);
}

function kmhToMs(value: number): number {
  return Number((value / 3.6).toFixed(2));
}
