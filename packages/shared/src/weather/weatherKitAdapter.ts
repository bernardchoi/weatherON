import type { DailyWeather, HourlyWeather, WeatherSnapshot } from "../types/weather";
import { conditionFromWeatherKit } from "./condition";
import type { WeatherKitResponse, WeatherNormalizeOptions } from "./types";

export function normalizeWeatherKitWeather(payload: WeatherKitResponse, options: WeatherNormalizeOptions): WeatherSnapshot {
  const current = payload.currentWeather;
  if (!current) {
    throw new Error("WeatherKit payload has no current weather");
  }

  const hourly = buildHourly(payload, options.timezone);
  const daily = buildDaily(payload, options.timezone);
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

// WeatherKit의 forecastStart는 항상 UTC ISO 문자열이다. KMA/Open-Meteo 어댑터는 모두
// 지역 로컬시각 문자열(YYYY-MM-DDTHH:mm)을 hourly[].time/daily[].date에 넣고, 화면 쪽
// formatHour/getDateKey 등은 이를 그대로 로컬시각으로 가정해 정규식으로 파싱한다.
// 여기서 로컬 문자열로 변환해두지 않으면 UTC 시각이 로컬시각처럼 표시된다(KST 기준 9시간 오차).
function buildHourly(payload: WeatherKitResponse, timeZone?: string): HourlyWeather[] {
  return (payload.forecastHourly?.hours ?? []).map((hour) => ({
    time: hour.forecastStart ? toLocalTimeString(hour.forecastStart, timeZone) : "",
    tempC: hour.temperature ?? payload.currentWeather?.temperature ?? 0,
    rainProbabilityPct: ratioToPct(hour.precipitationChance),
    precipitationMm: hour.precipitationAmount ?? 0,
    windMs: kmhToMs(hour.windSpeed ?? payload.currentWeather?.windSpeed ?? 0),
    condition: conditionFromWeatherKit(hour.conditionCode ?? payload.currentWeather?.conditionCode),
  }));
}

function buildDaily(payload: WeatherKitResponse, timeZone?: string): DailyWeather[] | undefined {
  const days = payload.forecastDaily?.days ?? [];
  if (days.length === 0) return undefined;
  return days.map((day) => ({
    date: day.forecastStart ? toLocalDateString(day.forecastStart, timeZone) : "",
    minTempC: day.temperatureMin ?? payload.currentWeather?.temperature ?? 0,
    maxTempC: day.temperatureMax ?? payload.currentWeather?.temperature ?? 0,
    rainProbabilityPct: ratioToPct(day.precipitationChance),
    precipitationMm: day.precipitationAmount ?? 0,
    windMs: kmhToMs(day.windSpeedAvg ?? day.windSpeed ?? payload.currentWeather?.windSpeed ?? 0),
    condition: conditionFromWeatherKit(day.conditionCode ?? payload.currentWeather?.conditionCode),
  }));
}

function toLocalTimeString(isoUtc: string, timeZone?: string): string {
  const parts = getZonedParts(isoUtc, timeZone);
  if (!parts) return isoUtc;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function toLocalDateString(isoUtc: string, timeZone?: string): string {
  const parts = getZonedParts(isoUtc, timeZone);
  if (!parts) return isoUtc.slice(0, 10);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getZonedParts(isoUtc: string, timeZone?: string) {
  if (!timeZone) return null;
  const date = new Date(isoUtc);
  if (Number.isNaN(date.getTime())) return null;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return { year: parts.year, month: parts.month, day: parts.day, hour: parts.hour, minute: parts.minute };
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
