import type { HourlyWeather, WeatherSnapshot } from "../types/weather";
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

  return {
    id: `weather-${options.locationId}-${options.observedAt ?? first.time}`,
    locationId: options.locationId,
    locationName: options.locationName,
    countryCode: options.countryCode,
    observedAt: options.observedAt ?? toIsoLike(first.time, options.timezone),
    current: {
      tempC: first.tempC,
      feelsLikeC: toNumber(firstBucket?.TMX ?? firstBucket?.TMP, first.tempC),
      condition: conditionFromKma(firstBucket?.PTY, firstBucket?.SKY),
      precipitationMm: first.precipitationMm,
      rainProbabilityPct: first.rainProbabilityPct,
      windMs: first.windMs,
      humidityPct: toNumber(firstBucket?.REH, 0),
      uvIndex: undefined,
    },
    hourly,
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

function toNumber(value: string | number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
