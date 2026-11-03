import type { WeatherSnapshot } from "@weatheron/shared";

export const departureLiveActivityAutoLeadMinutes = 60;
export type DepartureGuidanceKind = "rain-wind" | "rain" | "wind" | "clear";

export type DepartureLiveActivityInput = {
  destinationId: string;
  /** An explicit saved trip/care choice may replace the previous countdown. */
  replaceExistingActivity?: boolean;
  /** Unverified route: retain only the exact accepted trip; never start/update. */
  preserveExistingOnly?: boolean;
  destinationName: string;
  departureAt: string;
  departureTimeLabel: string;
  guidance: string;
  guidanceKind?: DepartureGuidanceKind;
  guidanceSymbol: string;
  deepLink: string;
};

export type DepartureActivityDiagnostics = {
  activityCount: number;
  activeCount: number;
  scheduledCount: number;
  staleCount: number;
};

export type DepartureLiveActivityStatus = {
  supported: boolean;
  enabled: boolean;
  active: boolean;
  scheduled?: boolean;
  automaticStartSupported?: boolean;
  automaticEndScheduled?: boolean;
  activityId?: string;
  destinationId?: string;
  departureAt?: string;
  guidance?: string;
  lifecycle?: "inactive" | "scheduled" | "active" | "stale";
  /** Native enumeration counts; this does not report Dynamic Island visibility. */
  diagnostics?: DepartureActivityDiagnostics;
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
  return getDepartureWeatherGuidanceLabel(getDepartureWeatherGuidanceKind(weather, rainThresholdPct, windThresholdMs));
}

export function getDepartureWeatherGuidanceKind(
  weather: WeatherSnapshot,
  rainThresholdPct: number,
  windThresholdMs: number,
): DepartureGuidanceKind {
  const upcoming = weather.hourly.slice(0, 6);
  const maxRainProbabilityPct = Math.max(weather.current.rainProbabilityPct, ...upcoming.map((item) => item.rainProbabilityPct));
  const maxWindMs = Math.max(weather.current.windMs, ...upcoming.map((item) => item.windMs));
  const rainRisk = maxRainProbabilityPct >= rainThresholdPct;
  const windRisk = maxWindMs >= windThresholdMs;
  if (rainRisk && windRisk) return "rain-wind";
  if (rainRisk) return "rain";
  if (windRisk) return "wind";
  return "clear";
}

export function getDepartureWeatherGuidanceLabel(kind: DepartureGuidanceKind): string {
  if (kind === "rain-wind") return "우산 챙기고 강풍 조심해요";
  if (kind === "rain") return "우산 챙겨요";
  if (kind === "wind") return "바람이 강해요";
  return "가볍게 출발해요";
}

export function getDepartureGuidanceSymbol(kind: DepartureGuidanceKind): string {
  if (kind === "rain" || kind === "rain-wind") return "umbrella.fill";
  if (kind === "wind") return "wind";
  return "figure.walk.departure";
}

export function parseDepartureLiveActivityStatus(value: string): DepartureLiveActivityStatus {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      supported: parsed.supported === true,
      enabled: parsed.enabled === true,
      active: parsed.active === true,
      scheduled: parsed.scheduled === true,
      automaticStartSupported: parsed.automaticStartSupported === true,
      automaticEndScheduled: typeof parsed.automaticEndScheduled === "boolean" ? parsed.automaticEndScheduled : undefined,
      activityId: typeof parsed.activityId === "string" && parsed.activityId ? parsed.activityId : undefined,
      destinationId: typeof parsed.destinationId === "string" && parsed.destinationId ? parsed.destinationId : undefined,
      departureAt: typeof parsed.departureAt === "string" && parsed.departureAt ? parsed.departureAt : undefined,
      guidance: typeof parsed.guidance === "string" && parsed.guidance ? parsed.guidance : undefined,
      diagnostics: parseDepartureActivityDiagnostics(parsed.diagnostics),
      lifecycle: ["inactive", "scheduled", "active", "stale"].includes(String(parsed.lifecycle))
        ? parsed.lifecycle as DepartureLiveActivityStatus["lifecycle"]
        : undefined,
    };
  } catch {
    return unavailableDepartureLiveActivityStatus;
  }
}

function parseDepartureActivityDiagnostics(value: unknown): DepartureActivityDiagnostics | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const raw = value as Record<string, unknown>;
  const keys = ["activityCount", "activeCount", "scheduledCount", "staleCount"] as const;
  if (!keys.every(key => typeof raw[key] === "number" && Number.isSafeInteger(raw[key]) && Number(raw[key]) >= 0)) return undefined;
  const result = {
    activityCount: Number(raw.activityCount), activeCount: Number(raw.activeCount),
    scheduledCount: Number(raw.scheduledCount), staleCount: Number(raw.staleCount),
  };
  return result.activeCount + result.scheduledCount + result.staleCount <= result.activityCount ? result : undefined;
}
