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
  activityId?: string;
  destinationId?: string;
  departureAt?: string;
};

export const unavailableDepartureLiveActivityStatus: DepartureLiveActivityStatus = {
  supported: false,
  enabled: false,
  active: false,
};

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
