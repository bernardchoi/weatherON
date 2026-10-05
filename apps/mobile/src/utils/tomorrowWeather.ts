import type { DailyWeather, WeatherSnapshot } from "@weatheron/shared";
import { formatDisplayDate, translateText } from "../localization/localization";

export function buildTomorrowWeather(weather: WeatherSnapshot, now = new Date()): { weather: WeatherSnapshot; summary: DailyWeather; dateLabel: string } | null {
  const today = getDateKey(now.toISOString(), weather.timezone);
  if (!today) return null;
  const next = new Date(`${today}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const tomorrowDate = next.toISOString().slice(0, 10);
  const summary = weather.daily?.find((item) => item.date === tomorrowDate);
  if (!summary) return null;

  const matchingHours = weather.hourly.filter((item) => getDateKey(item.time, weather.timezone) === summary.date);
  const midpointTemperature = Math.round((summary.minTempC + summary.maxTempC) / 2);
  return {
    weather: {
      ...weather,
      observedAt: `${summary.date}T09:00:00`,
      current: {
        ...weather.current,
        tempC: midpointTemperature,
        feelsLikeC: midpointTemperature,
        condition: toCondition(summary.condition),
        precipitationMm: summary.precipitationMm,
        rainProbabilityPct: summary.rainProbabilityPct,
        windMs: summary.windMs,
      },
      hourly: matchingHours,
      daily: [summary],
    },
    summary,
    dateLabel: formatTomorrowDate(summary.date),
  };
}

function getDateKey(value: string, timezone?: string) {
  // Offset-free provider hours already represent the location's wall clock.
  if (!/[zZ]$|[+-]\d{2}:?\d{2}$/.test(value)) return value.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
  if (!timezone) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
    const part = (type: string) => parts.find((item) => item.type === type)?.value;
    return `${part("year")}-${part("month")}-${part("day")}`;
  } catch { return ""; }
}

function formatTomorrowDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return translateText("내일");
  return formatDisplayDate(parsed, { month: "long", day: "numeric", weekday: "short" });
}

function toCondition(value: string): WeatherSnapshot["current"]["condition"] {
  if (value === "clear" || value === "cloud" || value === "rain" || value === "snow" || value === "storm" || value === "dust") return value;
  return "cloud";
}
