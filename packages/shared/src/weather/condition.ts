import type { WeatherCondition } from "../types/weather";

export function conditionFromKma(pty?: string | number, sky?: string | number): WeatherCondition {
  const precipitationType = String(pty ?? "0");
  const skyCode = String(sky ?? "1");

  if (precipitationType === "3" || precipitationType === "7") return "snow";
  if (precipitationType === "1" || precipitationType === "2" || precipitationType === "4" || precipitationType === "5" || precipitationType === "6") {
    return "rain";
  }
  if (skyCode === "3" || skyCode === "4") return "cloud";
  return "clear";
}

export function conditionFromOpenMeteo(code?: number): WeatherCondition {
  if (code === undefined) return "clear";
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 1 && code <= 3) return "cloud";
  if (code === 45 || code === 48) return "cloud";
  return "clear";
}

export function conditionFromWeatherKit(code?: string): WeatherCondition {
  const normalized = String(code ?? "").toLowerCase();
  if (!normalized) return "clear";
  if (normalized.includes("thunder") || normalized.includes("hurricane") || normalized.includes("tropicalstorm")) return "storm";
  if (normalized.includes("snow") || normalized.includes("sleet") || normalized.includes("flurr")) return "snow";
  if (normalized.includes("rain") || normalized.includes("drizzle") || normalized.includes("shower")) return "rain";
  if (normalized.includes("dust") || normalized.includes("haze") || normalized.includes("smok")) return "dust";
  if (normalized.includes("cloud") || normalized.includes("fog")) return "cloud";
  return "clear";
}
