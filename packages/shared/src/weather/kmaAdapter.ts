import type { DailyWeather, HourlyWeather, WeatherSnapshot } from "../types/weather";
import { conditionFromKma } from "./condition";
import type { KmaForecastItem, KmaForecastResponse, WeatherNormalizeOptions } from "./types";

type KmaBucket = Record<string, string | number | undefined>;

export function normalizeKmaWeather(payload: KmaForecastResponse | KmaForecastItem[], options: WeatherNormalizeOptions): WeatherSnapshot {
  const items = Array.isArray(payload) ? payload : payload.response?.body?.items?.item ?? [];
  if (items.length === 0) {
    throw new Error("KMA forecast payload has no items");
  }

  const grouped = groupByForecastTime(items);
  const hourly = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timeKey, bucket]) => buildHourly(timeKey, bucket));
  const first = hourly[0];
  const firstBucket = grouped[Object.keys(grouped).sort()[0]];
  const firstHumidityPct = toNumber(firstBucket?.REH, 0);

  return {
    id: `weather-${options.locationId}-${options.observedAt ?? first.time}`,
    locationId: options.locationId,
    locationName: options.locationName,
    countryCode: options.countryCode,
    observedAt: options.observedAt ?? toIsoLike(first.time, options.timezone),
    current: {
      tempC: first.tempC,
      feelsLikeC: calculateFeelsLikeC(first.tempC, firstHumidityPct, first.windMs),
      condition: conditionFromKma(firstBucket?.PTY, firstBucket?.SKY),
      precipitationMm: first.precipitationMm,
      rainProbabilityPct: first.rainProbabilityPct,
      windMs: first.windMs,
      humidityPct: firstHumidityPct,
      uvIndex: undefined,
    },
    hourly,
    daily: buildDaily(hourly),
    source: "kma",
    stale: options.stale ?? false,
  };
}

function groupByForecastTime(items: KmaForecastItem[]): Record<string, KmaBucket> {
  return items.reduce<Record<string, KmaBucket>>((groups, item) => {
    const key = `${item.fcstDate}${item.fcstTime}`;
    groups[key] = groups[key] ?? {};
    groups[key][item.category] = item.fcstValue;
    return groups;
  }, {});
}

function buildHourly(timeKey: string, bucket: KmaBucket): HourlyWeather {
  return {
    time: formatKmaTime(timeKey),
    tempC: toNumber(bucket.TMP ?? bucket.TMN ?? bucket.TMX, 0),
    rainProbabilityPct: toNumber(bucket.POP, 0),
    precipitationMm: parseKmaPrecipitation(bucket.PCP),
    windMs: toNumber(bucket.WSD, 0),
    condition: conditionFromKma(bucket.PTY, bucket.SKY),
  };
}

function buildDaily(hourly: HourlyWeather[]): DailyWeather[] | undefined {
  const grouped = hourly.reduce<Record<string, HourlyWeather[]>>((acc, item) => {
    const date = item.time.slice(0, 10);
    acc[date] = acc[date] ?? [];
    acc[date].push(item);
    return acc;
  }, {});
  const dates = Object.keys(grouped).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
  if (dates.length === 0) return undefined;
  return dates.sort().map((date) => {
    const items = grouped[date];
    return {
      date,
      minTempC: Math.min(...items.map((item) => item.tempC)),
      maxTempC: Math.max(...items.map((item) => item.tempC)),
      rainProbabilityPct: Math.max(...items.map((item) => item.rainProbabilityPct)),
      precipitationMm: Number(items.reduce((sum, item) => sum + item.precipitationMm, 0).toFixed(1)),
      windMs: Math.max(...items.map((item) => item.windMs)),
      condition: selectDailyCondition(items),
    };
  });
}

function selectDailyCondition(items: HourlyWeather[]): HourlyWeather["condition"] {
  const priority = ["storm", "snow", "rain", "dust", "cloud", "clear"];
  return priority.find((condition) => items.some((item) => item.condition === condition)) ?? items[0]?.condition ?? "cloud";
}

function formatKmaTime(timeKey: string): string {
  const date = timeKey.slice(0, 8);
  const time = timeKey.slice(8, 12);
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:00`;
}

function toIsoLike(time: string, timezone = "+09:00"): string {
  return time.includes("+") || time.endsWith("Z") ? time : `${time}${timezone}`;
}

function parseKmaPrecipitation(value: string | number | undefined): number {
  if (value === undefined) return 0;
  if (typeof value === "number") return value;
  const trimmed = value.trim();
  if (trimmed === "강수없음" || trimmed === "없음" || trimmed === "-") return 0;
  if (trimmed.includes("1mm 미만")) return 0.5;
  const match = trimmed.match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function calculateFeelsLikeC(tempC: number, humidityPct: number, windMs: number): number {
  if (tempC <= 10 && windMs >= 1.3) {
    const windKmh = windMs * 3.6;
    const windChillC = 13.12 + 0.6215 * tempC - 11.37 * windKmh ** 0.16 + 0.3965 * tempC * windKmh ** 0.16;
    return Math.round(windChillC * 10) / 10;
  }
  if (tempC >= 27 && humidityPct > 0) {
    const tempF = (tempC * 9) / 5 + 32;
    const heatIndexF =
      -42.379 +
      2.04901523 * tempF +
      10.14333127 * humidityPct -
      0.22475541 * tempF * humidityPct -
      0.00683783 * tempF * tempF -
      0.05481717 * humidityPct * humidityPct +
      0.00122874 * tempF * tempF * humidityPct +
      0.00085282 * tempF * humidityPct * humidityPct -
      0.00000199 * tempF * tempF * humidityPct * humidityPct;
    const heatIndexC = ((heatIndexF - 32) * 5) / 9;
    return Math.round(heatIndexC * 10) / 10;
  }
  return tempC;
}

function toNumber(value: string | number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
