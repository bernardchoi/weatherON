import type { WeatherSnapshot } from "@weatheron/shared";

export const departureLiveActivityAutoLeadMinutes = 60;

export type DepartureLiveActivityInput = {
  destinationId: string;
  destinationName: string;
  departureAt: string;
  departureTimeLabel: string;
  guidance: string;
  deepLink: string;
};

export type DepartureLiveActivityStatus = {
  supported: boolean;
  enabled: boolean;
  active: boolean;
  automaticEndScheduled?: boolean;
  activityId?: string;
  destinationId?: string;
  departureAt?: string;
};

export const unavailableDepartureLiveActivityStatus: DepartureLiveActivityStatus = {
  supported: false,
  enabled: false,
  active: false,
};

export function isDepartureLiveActivityAutoWindow(
  departureAt: string,
  nowMs = Date.now(),
  leadMinutes = departureLiveActivityAutoLeadMinutes,
): boolean {
  const departureMs = new Date(departureAt).getTime();
  if (!Number.isFinite(departureMs)) return false;
  const remainingMs = departureMs - nowMs;
  return remainingMs > 0 && remainingMs <= leadMinutes * 60_000;
}

export function getDepartureLiveActivityActivationDelay(
  departureAt: string,
  nowMs = Date.now(),
  leadMinutes = departureLiveActivityAutoLeadMinutes,
): number | null {
  const departureMs = new Date(departureAt).getTime();
  if (!Number.isFinite(departureMs) || departureMs <= nowMs) return null;
  return Math.max(0, departureMs - leadMinutes * 60_000 - nowMs);
}

export function getDepartureWeatherGuidance(
  weather: WeatherSnapshot,
  rainThresholdPct: number,
  windThresholdMs: number,
): string {
  const upcoming = weather.hourly.slice(0, 6);
  const maxRainProbabilityPct = Math.max(weather.current.rainProbabilityPct, ...upcoming.map((item) => item.rainProbabilityPct));
  const maxWindMs = Math.max(weather.current.windMs, ...upcoming.map((item) => item.windMs));
  const rainRisk = maxRainProbabilityPct >= rainThresholdPct;
  const windRisk = maxWindMs >= windThresholdMs;
  if (rainRisk && windRisk) return "비·강풍 대비 필요";
  if (rainRisk) return "비 대비 필요 · 강풍 위험 낮음";
  if (windRisk) return "비 위험 낮음 · 강풍 대비 필요";
  return "비·강풍 위험 낮음";
}

export function parseDepartureLiveActivityStatus(value: string): DepartureLiveActivityStatus {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      supported: parsed.supported === true,
      enabled: parsed.enabled === true,
      active: parsed.active === true,
      activityId: typeof parsed.activityId === "string" && parsed.activityId ? parsed.activityId : undefined,
      destinationId: typeof parsed.destinationId === "string" && parsed.destinationId ? parsed.destinationId : undefined,
      departureAt: typeof parsed.departureAt === "string" && parsed.departureAt ? parsed.departureAt : undefined,
    };
  } catch {
    return unavailableDepartureLiveActivityStatus;
  }
}
