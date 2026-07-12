import type { DailyWeather, HourlyWeather, WeatherSnapshot } from "../types/weather";
import { conditionFromOpenMeteo } from "./condition";
import type { OpenMeteoResponse, WeatherNormalizeOptions } from "./types";

export function normalizeOpenMeteoWeather(payload: OpenMeteoResponse, options: WeatherNormalizeOptions): WeatherSnapshot {
  const current = payload.current;
  if (!current) {
    throw new Error("Open-Meteo payload has no current weather");
  }

  const hourly = buildHourly(payload);
  const daily = buildDaily(payload);
  const precipitationMm = current.precipitation ?? current.rain ?? current.showers ?? current.snowfall ?? 0;

  return {
    id: `weather-${options.locationId}-${options.observedAt ?? current.time ?? "current"}`,
    locationId: options.locationId,
    locationName: options.locationName,
    countryCode: options.countryCode,
    observedAt: options.observedAt ?? current.time ?? new Date(0).toISOString(),
    current: {
      tempC: current.temperature_2m ?? hourly[0]?.tempC ?? 0,
      feelsLikeC: current.apparent_temperature ?? current.temperature_2m ?? hourly[0]?.tempC ?? 0,
      condition: conditionFromOpenMeteo(current.weather_code),
      precipitationMm,
      rainProbabilityPct: hourly[0]?.rainProbabilityPct ?? (precipitationMm > 0 ? 80 : 0),
      windMs: kmhToMs(current.wind_speed_10m ?? 0),
      humidityPct: current.relative_humidity_2m ?? getCurrentHourlyHumidity(payload) ?? 0,
      uvIndex: current.uv_index ?? payload.hourly?.uv_index?.[0],
    },
    hourly,
    daily,
    source: "openmeteo",
    stale: options.stale ?? false,
  };
}

function getCurrentHourlyHumidity(payload: OpenMeteoResponse): number | undefined {
  const humidityValues = payload.hourly?.relative_humidity_2m;
  if (!humidityValues?.length) return undefined;

  const currentTime = payload.current?.time;
  const hourlyTimes = payload.hourly?.time ?? [];
  if (currentTime) {
    const exactIndex = hourlyTimes.indexOf(currentTime);
    if (exactIndex >= 0) return humidityValues[exactIndex];

    const currentHour = currentTime.slice(0, 13);
    const hourIndex = hourlyTimes.findIndex((time) => time.slice(0, 13) === currentHour);
    if (hourIndex >= 0) return humidityValues[hourIndex];
  }

  return humidityValues[0];
}

function buildHourly(payload: OpenMeteoResponse): HourlyWeather[] {
  const hourly = payload.hourly;
  const times = hourly?.time ?? [];
  return times.map((time, index) => ({
    time,
    tempC: hourly?.temperature_2m?.[index] ?? payload.current?.temperature_2m ?? 0,
    rainProbabilityPct: hourly?.precipitation_probability?.[index] ?? 0,
    precipitationMm: hourly?.precipitation?.[index] ?? 0,
    windMs: kmhToMs(hourly?.wind_speed_10m?.[index] ?? payload.current?.wind_speed_10m ?? 0),
    condition: conditionFromOpenMeteo(hourly?.weather_code?.[index] ?? payload.current?.weather_code),
  }));
}

function buildDaily(payload: OpenMeteoResponse): DailyWeather[] | undefined {
  const daily = payload.daily;
  const times = daily?.time ?? [];
  if (times.length === 0) return undefined;
  return times.map((date, index) => ({
    date,
    minTempC: daily?.temperature_2m_min?.[index] ?? payload.current?.temperature_2m ?? 0,
    maxTempC: daily?.temperature_2m_max?.[index] ?? payload.current?.temperature_2m ?? 0,
    rainProbabilityPct: daily?.precipitation_probability_max?.[index] ?? 0,
    precipitationMm: daily?.precipitation_sum?.[index] ?? 0,
    windMs: kmhToMs(daily?.wind_speed_10m_max?.[index] ?? payload.current?.wind_speed_10m ?? 0),
    condition: conditionFromOpenMeteo(daily?.weather_code?.[index] ?? payload.current?.weather_code),
  }));
}

function kmhToMs(value: number): number {
  return Number((value / 3.6).toFixed(2));
}
