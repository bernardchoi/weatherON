import type { WeatherCondition } from "../types/weather";
import type { WeatherConditionMappingProfile } from "./types";

export function conditionFromKma(pty?: string | number, sky?: string | number, profile: WeatherConditionMappingProfile = "legacy"): WeatherCondition {
  if (profile === "legacy") return legacyConditionFromKma(pty, sky);
  if (pty === undefined && sky === undefined) return "unknown";
  const precipitationType = pty === undefined ? undefined : String(pty);
  const skyCode = sky === undefined ? undefined : String(sky);

  if (precipitationType === "3" || precipitationType === "7") return "snow";
  // KMA PTY 2 (rain/snow) and 6 (raindrops/snow flurries) are both mixed phase.
  if (precipitationType === "2" || precipitationType === "6") return "mixed";
  if (precipitationType === "1" || precipitationType === "4" || precipitationType === "5") {
    return "rain";
  }
  if (precipitationType !== undefined && precipitationType !== "0") return "unknown";
  if (skyCode === "1") return "clear";
  if (skyCode === "3" || skyCode === "4") return "cloud";
  return "unknown";
}

export function conditionFromOpenMeteo(code?: number, profile: WeatherConditionMappingProfile = "legacy"): WeatherCondition {
  if (profile === "legacy") return legacyConditionFromOpenMeteo(code);
  if (code === undefined || !Number.isInteger(code)) return "unknown";
  // WMO 96/99 explicitly mean a thunderstorm with slight/heavy hail. Keep both
  // parts in the canonical state so hourly/daily persistence cannot drop thunder.
  if (code === 96 || code === 99) return "storm-hail";
  if (code === 95) return "storm";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code === 0) return "clear";
  if (code >= 1 && code <= 3) return "cloud";
  if (code === 45 || code === 48) return "cloud";
  return "unknown";
}

export function conditionFromWeatherKit(code?: string, profile: WeatherConditionMappingProfile = "legacy"): WeatherCondition {
  if (profile === "legacy") return legacyConditionFromWeatherKit(code);
  // WeatherKit sends enum case names (for example WintryMix). Keeping an explicit
  // table avoids treating an unfamiliar provider value as fair weather.
  const normalized = String(code ?? "").replace(/[^a-z]/gi, "").toLowerCase();
  if (!normalized) return "unknown";
  const states: Record<string, WeatherCondition> = {
    clear: "clear", mostlyclear: "clear", hot: "clear", frigid: "clear",
    cloudy: "cloud", mostlycloudy: "cloud", partlycloudy: "cloud", foggy: "cloud", breezy: "cloud", windy: "cloud",
    rain: "rain", heavyrain: "rain", drizzle: "rain", freezingrain: "rain", freezingdrizzle: "rain", sunshowers: "rain", scatteredshowers: "rain",
    snow: "snow", heavysnow: "snow", blizzard: "snow", blowingsnow: "snow", flurries: "snow", sunflurries: "snow",
    sleet: "sleet", hail: "hail", wintrymix: "mixed",
    thunderstorms: "storm", isolatedthunderstorms: "storm", scatteredthunderstorms: "storm", strongstorms: "storm", tropicalstorm: "storm", hurricane: "storm",
    blowingdust: "dust", smoky: "dust", haze: "dust",
  };
  return states[normalized] ?? "unknown";
}

function legacyConditionFromKma(pty?: string | number, sky?: string | number): WeatherCondition {
  const precipitationType = String(pty ?? "0");
  const skyCode = String(sky ?? "1");
  if (precipitationType === "3" || precipitationType === "7") return "snow";
  if (precipitationType === "1" || precipitationType === "2" || precipitationType === "4" || precipitationType === "5" || precipitationType === "6") return "rain";
  if (skyCode === "3" || skyCode === "4") return "cloud";
  return "clear";
}

function legacyConditionFromOpenMeteo(code?: number): WeatherCondition {
  if (code === undefined) return "clear";
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 1 && code <= 3) return "cloud";
  if (code === 45 || code === 48) return "cloud";
  return "clear";
}

function legacyConditionFromWeatherKit(code?: string): WeatherCondition {
  const normalized = String(code ?? "").toLowerCase();
  if (!normalized) return "clear";
  if (normalized.includes("thunder") || normalized.includes("hurricane") || normalized.includes("tropicalstorm")) return "storm";
  if (normalized.includes("snow") || normalized.includes("sleet") || normalized.includes("flurr")) return "snow";
  if (normalized.includes("rain") || normalized.includes("drizzle") || normalized.includes("shower")) return "rain";
  if (normalized.includes("dust") || normalized.includes("haze") || normalized.includes("smok")) return "dust";
  if (normalized.includes("cloud") || normalized.includes("fog")) return "cloud";
  return "clear";
}
