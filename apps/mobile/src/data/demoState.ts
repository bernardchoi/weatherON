import {
  buildDestinationCare,
  defaultNotificationRules,
  defaultPreferenceProfile,
  evaluateNotificationRules,
  type UserPreferenceProfile,
  presetWardrobe,
  recommendOutfit,
  recommendUmbrella,
} from "@weatheron/shared";
import type {
  DestinationAlertCondition,
  DestinationCare,
  DestinationTransportMode,
  NotificationRuleEvaluation,
  PlaceSearchResult,
  WardrobeItem,
  WeatherSnapshot,
} from "@weatheron/shared";
import { runtimeWeatherProvider } from "../providers/weatherProvider";
import type { WeatherProviderMode, WeatherProviderResult } from "../providers/weatherProvider";
import {
  addZonedCalendarDays,
  createDateAtTimeInZone,
  getWeekdayForZonedDate,
  getZonedDateTimeParts,
  parseDateTimeInZone,
} from "../utils/zonedDateTime";
import { getTravelMinutesForTransport } from "../utils/travelEstimate";

export type DemoState = ReturnType<typeof buildDemoStateFromWeatherResult>;

export type DemoStateOptions = {
  hasDestination?: boolean;
  destinationCareEnabled?: boolean;
  destination?: Pick<PlaceSearchResult, "id" | "name" | "category" | "countryCode" | "timezone">;
  destinationAlertCondition?: DestinationAlertCondition;
  destinationSchedule?: DestinationScheduleInput;
  savedDestinations?: DestinationNotificationInput[];
  wardrobe?: WardrobeItem[];
  preferenceProfile?: UserPreferenceProfile;
  notificationNow?: number;
};

export type DestinationScheduleInput = {
  targetArrivalTime: string;
  travelMinutes?: number;
  distanceMeters?: number;
  bufferMinutes?: number;
  transportMode?: DestinationTransportMode;
  repeatEnabled?: boolean;
  repeatDays?: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">;
  travelProvider?: "kakao" | "kakao-transit" | "google" | "google-transit" | "fallback";
  travelStatus?: "idle" | "loading" | "ready" | "fallback" | "error";
};

export type DestinationNotificationInput = {
  place: Pick<PlaceSearchResult, "id" | "name" | "category" | "countryCode" | "timezone">;
  careEnabled: boolean;
  alertCondition: DestinationAlertCondition;
  schedulePreference?: Pick<DestinationScheduleInput, "targetArrivalTime" | "transportMode" | "repeatEnabled" | "repeatDays">;
  // 저장된 목적지는 실제 TravelEstimateResult(provider/status 필드명)를, 미저장 임시 목적지는
  // DestinationScheduleInput(travelProvider/travelStatus 필드명)을 그대로 재사용해 넘기므로 두 필드명을 모두 허용한다.
  travelEstimate?: Pick<DestinationScheduleInput, "travelMinutes" | "distanceMeters" | "travelProvider" | "travelStatus"> & {
    status?: DestinationScheduleInput["travelStatus"];
  };
};

export function buildDemoStateFromWeatherResult(
  weatherProviderResult: WeatherProviderResult,
  useDestinationWeather: boolean,
  options: DemoStateOptions = {},
) {
  const hasDestination = options.hasDestination ?? Boolean(options.destination || options.savedDestinations?.length);
  const destinationWeatherById = buildDestinationWeatherById(
    options.savedDestinations,
    weatherProviderResult.destinationSnapshots,
    weatherProviderResult.destination,
  );
  const destinationWeather = getDestinationWeatherSnapshot(
    weatherProviderResult.destination,
    weatherProviderResult.destinationSnapshots,
    options.destination,
    destinationWeatherById,
  );
  const activeWeather = useDestinationWeather ? destinationWeather : weatherProviderResult.current;
  const wardrobe = options.wardrobe?.length ? options.wardrobe : presetWardrobe;
  const preferenceProfile = options.preferenceProfile ?? defaultPreferenceProfile;
  const outfit = recommendOutfit(activeWeather, preferenceProfile, wardrobe);
  const umbrella = recommendUmbrella(activeWeather);
  const baseNotificationRules = defaultNotificationRules.filter((rule) => rule.type !== "destination");
  const notifications = withScheduledNotificationTimes(
    evaluateNotificationRules(activeWeather, {
      rules: baseNotificationRules,
    }),
    activeWeather,
    options.notificationNow ?? Date.now(),
    getDefaultTimeZone(weatherProviderResult.current.countryCode),
  );
  const destinationNotifications = hasDestination
    ? buildDestinationNotifications(activeWeather, weatherProviderResult.destination, {
        destination: options.destination,
        destinationAlertCondition: options.destinationAlertCondition,
        destinationSnapshots: weatherProviderResult.destinationSnapshots,
        destinationCareOn: options.destinationCareEnabled ?? true,
        savedDestinations: options.savedDestinations,
        fallbackSchedule: options.destinationSchedule,
        nowMs: options.notificationNow ?? Date.now(),
      })
    : [];
  const destinationCare = buildDestinationCare({
    destinationId: options.destination?.id ?? "destination-empty",
    name: options.destination?.name ?? "목적지 미등록",
    category: options.destination?.category ?? "custom",
    originWeather: weatherProviderResult.current,
    destinationWeather,
    careOn: hasDestination ? options.destinationCareEnabled ?? true : false,
    alertCondition: options.destinationAlertCondition,
    travelMinutes: getTravelMinutes(options.destinationSchedule?.transportMode, options.destinationSchedule, options.destination?.countryCode),
    targetArrivalTime: options.destinationSchedule?.targetArrivalTime ?? "13:00",
    bufferMinutes: options.destinationSchedule?.bufferMinutes,
    transportMode: options.destinationSchedule?.transportMode ?? "auto",
    travelProvider: options.destinationSchedule?.travelProvider,
    travelStatus: options.destinationSchedule?.travelStatus,
  });

  return {
    hasDestination,
    weather: activeWeather,
    outfit,
    umbrella,
    notifications: [...notifications, ...destinationNotifications],
    destinationCare,
    destinationWeatherById,
    weatherProvider: {
      status: weatherProviderResult.status,
      message: weatherProviderResult.message,
      retryable: weatherProviderResult.retryable,
      fallbackUsed: weatherProviderResult.fallbackUsed,
      currentSource: weatherProviderResult.current.source,
      destinationSource: weatherProviderResult.destination.source,
      currentObservedAt: weatherProviderResult.current.observedAt,
      destinationObservedAt: weatherProviderResult.destination.observedAt,
    },
  };
}

function buildDestinationWeatherById(
  savedDestinations: DestinationNotificationInput[] | undefined,
  destinationSnapshots: WeatherSnapshot[],
  fallbackDestinationWeather: WeatherSnapshot,
): Record<string, WeatherSnapshot> {
  if (!savedDestinations?.length) return {};
  return savedDestinations.reduce<Record<string, WeatherSnapshot>>((acc, destination) => {
    const destinationWeather =
      destinationSnapshots.find((snapshot) => snapshot.locationId === destination.place.id) ??
      relabelWeatherSnapshot(fallbackDestinationWeather, destination.place);
    acc[destination.place.id] = destinationWeather;
    return acc;
  }, {});
}

function buildDestinationNotifications(
  activeWeather: WeatherSnapshot,
  fallbackDestinationWeather: WeatherSnapshot,
  options: {
    destination?: DemoStateOptions["destination"];
    destinationAlertCondition?: DestinationAlertCondition;
    destinationSnapshots: WeatherSnapshot[];
    destinationCareOn: boolean;
    savedDestinations?: DestinationNotificationInput[];
    fallbackSchedule?: DestinationScheduleInput;
    nowMs: number;
  },
): NotificationRuleEvaluation[] {
  const destinationRule = defaultNotificationRules.find((rule) => rule.type === "destination");
  if (!destinationRule) return [];
  const destinations =
    options.savedDestinations && options.savedDestinations.length > 0
      ? options.savedDestinations
      : [
          {
            place: {
              id: options.destination?.id ?? fallbackDestinationWeather.locationId,
              name: options.destination?.name ?? fallbackDestinationWeather.locationName,
              category: options.destination?.category ?? "beach",
              countryCode: options.destination?.countryCode ?? fallbackDestinationWeather.countryCode,
              timezone: options.destination?.timezone ?? getDefaultTimeZone(options.destination?.countryCode ?? fallbackDestinationWeather.countryCode),
            },
            careEnabled: options.destinationCareOn,
            alertCondition:
              options.destinationAlertCondition ?? destinationWeatherAlertConditionFallback(),
            schedulePreference: options.fallbackSchedule,
            travelEstimate: options.fallbackSchedule,
          },
        ];

  return destinations.map((destination) => {
    const destinationWeather =
      options.destinationSnapshots.find((snapshot) => snapshot.locationId === destination.place.id) ??
      relabelWeatherSnapshot(fallbackDestinationWeather, destination.place);
    const timing = getDestinationNotificationTiming(destination, destinationWeather, options.nowMs);
    const weatherAtDeparture = timing
      ? getWeatherAtDeparture(destinationWeather, timing.departureAt, destination.place.timezone)
      : undefined;
    const [notification] = evaluateNotificationRules(activeWeather, {
      rules: [{ ...destinationRule, id: `${destinationRule.id}:${destination.place.id}` }],
      destinationAlertCondition: destination.alertCondition,
      destinationCareOn: destination.careEnabled,
      destinationCategory: destination.place.category,
      destinationWeather: weatherAtDeparture ?? destinationWeather,
    });
    return {
      ...notification,
      title: `${destination.place.name} 알림`,
      pushTitle: `${destination.place.name} 가는 길, 미리 살펴봐요`,
      active: Boolean(timing && notification.active),
      reason: timing && notification.active ? notification.reason : "도착 희망시간 기준 예보 확인 대기",
      scheduledAt: timing && notification.active ? timing.scheduledAt.toISOString() : undefined,
    };
  });
}

type DestinationNotificationTiming = {
  departureAt: Date;
  scheduledAt: Date;
};

function getDestinationNotificationTiming(
  destination: DestinationNotificationInput,
  weather: WeatherSnapshot,
  nowMs: number,
): DestinationNotificationTiming | null {
  const schedule = destination.schedulePreference;
  const targetArrivalTime = schedule?.targetArrivalTime;
  if (!targetArrivalTime || !isValidTimeText(targetArrivalTime)) return null;

  const travelMinutes = getTravelMinutes(schedule?.transportMode, destination.travelEstimate, destination.place.countryCode);
  if (typeof travelMinutes !== "number") return null;
  const arrivalAt = getNextArrivalAt(
    targetArrivalTime,
    schedule?.repeatEnabled ?? false,
    schedule?.repeatDays ?? [],
    nowMs,
    travelMinutes,
    destination.alertCondition.leadTimeMinutes,
    destination.place.timezone,
  );
  if (!arrivalAt) return null;
  const bufferMinutes = getAutoBufferMinutes(arrivalAt.getTime() - nowMs, travelMinutes);
  const departureAt = new Date(arrivalAt.getTime() - (travelMinutes + bufferMinutes) * 60_000);
  const scheduledAt = new Date(departureAt.getTime() - destination.alertCondition.leadTimeMinutes * 60_000);
  if (scheduledAt.getTime() <= nowMs) return null;
  if (!getWeatherAtDeparture(weather, departureAt, destination.place.timezone)) return null;
  return { departureAt, scheduledAt };
}

function getNextArrivalAt(
  targetArrivalTime: string,
  repeatEnabled: boolean,
  repeatDays: DestinationScheduleInput["repeatDays"],
  nowMs: number,
  travelMinutes: number,
  leadTimeMinutes: number,
  timeZone: string,
): Date | null {
  const nowParts = getZonedDateTimeParts(new Date(nowMs), timeZone);
  for (let offset = 0; offset <= 7; offset += 1) {
    const arrivalDate = addZonedCalendarDays(nowParts, offset);
    const arrivalAt = createDateAtTimeInZone(arrivalDate, targetArrivalTime, timeZone);
    if (repeatEnabled && !repeatDays?.includes(getWeekdayForZonedDate(arrivalDate))) continue;
    const latestAllowedTime = nowMs + (travelMinutes + leadTimeMinutes) * 60_000;
    if (arrivalAt.getTime() > latestAllowedTime) return arrivalAt;
  }
  return null;
}

function getWeatherAtDeparture(weather: WeatherSnapshot, departureAt: Date, timeZone: string): WeatherSnapshot | null {
  const departureMs = departureAt.getTime();
  const closestHour = weather.hourly.reduce<{ hour: WeatherSnapshot["hourly"][number]; distance: number } | null>((closest, hour) => {
    const hourMs = getWeatherHourTimestamp(hour.time, weather.observedAt, timeZone);
    if (!Number.isFinite(hourMs)) return closest;
    const candidate = { hour, distance: Math.abs(hourMs - departureMs) };
    return !closest || candidate.distance < closest.distance ? candidate : closest;
  }, null);
  if (!closestHour || closestHour.distance > 2 * 60 * 60_000) return null;
  return {
    ...weather,
    current: {
      ...weather.current,
      rainProbabilityPct: closestHour.hour.rainProbabilityPct,
      precipitationMm: closestHour.hour.precipitationMm,
      windMs: closestHour.hour.windMs,
      condition: closestHour.hour.condition as WeatherSnapshot["current"]["condition"],
    },
    hourly: [closestHour.hour],
  };
}

function getWeatherHourTimestamp(hourTime: string, observedAt: string, timeZone: string): number {
  if (isValidTimeText(hourTime)) {
    const [hourText, minuteText] = hourTime.split(":");
    const observed = parseDateTimeInZone(observedAt, timeZone);
    const observedParts = getZonedDateTimeParts(observed, timeZone);
    return createDateAtTimeInZone(observedParts, `${hourText}:${minuteText}`, timeZone).getTime();
  }
  return parseDateTimeInZone(hourTime, timeZone).getTime();
}

function getTravelMinutes(
  mode: DestinationTransportMode | undefined,
  travelEstimate: DestinationNotificationInput["travelEstimate"],
  destinationCountryCode: PlaceSearchResult["countryCode"] | undefined,
): number | undefined {
  const baseTravelMinutes = travelEstimate?.travelMinutes;
  if (typeof baseTravelMinutes !== "number" || baseTravelMinutes <= 0) return undefined;
  return getTravelMinutesForTransport(
    {
      travelMinutes: baseTravelMinutes,
      distanceMeters: travelEstimate?.distanceMeters ?? 0,
      status: travelEstimate?.status ?? travelEstimate?.travelStatus ?? "fallback",
    },
    mode ?? "auto",
    destinationCountryCode,
  );
}

function getAutoBufferMinutes(arrivalOffsetMs: number, travelMinutes: number): number {
  const freeWindow = Math.floor(arrivalOffsetMs / 60_000) - travelMinutes;
  if (freeWindow <= 30) return 0;
  if (freeWindow <= 90) return 5;
  if (freeWindow <= 180) return 10;
  if (freeWindow <= 360) return 15;
  return 20;
}

function isValidTimeText(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function destinationWeatherAlertConditionFallback(): DestinationAlertCondition {
  return {
    rainThresholdPct: 50,
    leadTimeMinutes: 60,
    windThresholdMs: 8,
  };
}

function getDefaultTimeZone(countryCode: PlaceSearchResult["countryCode"]): string {
  if (countryCode === "KR") return "Asia/Seoul";
  if (countryCode === "JP") return "Asia/Tokyo";
  return "UTC";
}

const bedtimeReminderHour = 21;
const routineReminderHour = 7;
const routineReminderMinute = 30;
const weatherAlertDeliveryLeadMs = 5_000;

function withScheduledNotificationTimes(
  notifications: NotificationRuleEvaluation[],
  weather: WeatherSnapshot,
  nowMs: number,
  timeZone: string,
): NotificationRuleEvaluation[] {
  const rainEvent = getRainEvent(weather, nowMs, timeZone);
  return notifications.map((notification) => {
    if (notification.type === "routine") {
      return {
        ...notification,
        scheduledAt: getNextDailyReminderAt(nowMs, timeZone, routineReminderHour, routineReminderMinute).toISOString(),
      };
    }
    if (notification.type === "bedtime") {
      return { ...notification, scheduledAt: getNextDailyReminderAt(nowMs, timeZone, bedtimeReminderHour).toISOString() };
    }
    if ((notification.type === "rain" || notification.type === "umbrella" || notification.type === "shoes") && notification.active) {
      const leadMinutes = notification.type === "rain" ? 60 : notification.type === "umbrella" ? 45 : 10;
      const desiredAt = rainEvent ? rainEvent.timestamp - leadMinutes * 60_000 : nowMs;
      const scheduledAt = Math.max(nowMs + weatherAlertDeliveryLeadMs, desiredAt);
      const eventKey = rainEvent?.key ?? weather.observedAt.slice(0, 10);
      return {
        ...notification,
        scheduledAt: new Date(scheduledAt).toISOString(),
        deliveryKey: `${notification.id}:${eventKey}`,
      };
    }
    if ((notification.type === "heatwave" || notification.type === "heavy-rain") && notification.active) {
      return { ...notification, scheduledAt: new Date(nowMs + weatherAlertDeliveryLeadMs).toISOString() };
    }
    return notification;
  });
}

function getNextDailyReminderAt(nowMs: number, timeZone: string, hour: number, minute = 0): Date {
  const reminderTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const nowParts = getZonedDateTimeParts(new Date(nowMs), timeZone);
  const todayAt = createDateAtTimeInZone(nowParts, reminderTime, timeZone);
  if (todayAt.getTime() > nowMs) return todayAt;
  return createDateAtTimeInZone(addZonedCalendarDays(nowParts, 1), reminderTime, timeZone);
}

function getRainEvent(weather: WeatherSnapshot, nowMs: number, timeZone: string): { timestamp: number; key: string } | null {
  const rainyHours = weather.hourly
    .filter((hour) => hour.rainProbabilityPct >= 40 || hour.precipitationMm > 0 || hour.condition === "rain" || hour.condition === "snow")
    .map((hour) => ({
      timestamp: getWeatherHourTimestamp(hour.time, weather.observedAt, timeZone),
      key: hour.time,
    }))
    .filter((item) => Number.isFinite(item.timestamp))
    .sort((left, right) => left.timestamp - right.timestamp);
  return rainyHours.find((item) => item.timestamp >= nowMs - 2 * 60 * 60_000) ?? rainyHours[0] ?? null;
}

function getDestinationWeatherSnapshot(
  fallbackDestinationWeather: WeatherSnapshot,
  destinationSnapshots: WeatherSnapshot[],
  destination?: DemoStateOptions["destination"],
  destinationWeatherById: Record<string, WeatherSnapshot> = {},
): WeatherSnapshot {
  if (!destination) return fallbackDestinationWeather;
  return (
    destinationWeatherById[destination.id] ??
    destinationSnapshots.find((snapshot) => snapshot.locationId === destination.id) ??
    relabelWeatherSnapshot(fallbackDestinationWeather, destination)
  );
}

function relabelWeatherSnapshot(
  snapshot: WeatherSnapshot,
  place: Pick<PlaceSearchResult, "id" | "name" | "countryCode">,
): WeatherSnapshot {
  return {
    ...snapshot,
    locationId: place.id,
    locationName: place.name,
    countryCode: place.countryCode,
    current: { ...snapshot.current },
    hourly: snapshot.hourly.map((hour) => ({ ...hour })),
    daily: snapshot.daily?.map((day) => ({ ...day })),
  };
}

export async function buildDemoState(
  useDestinationWeather: boolean,
  weatherProviderMode: WeatherProviderMode = "ready",
  options: DemoStateOptions = {},
) {
  const weatherProviderResult = await runtimeWeatherProvider.getSnapshots(weatherProviderMode);
  return buildDemoStateFromWeatherResult(weatherProviderResult, useDestinationWeather, options);
}
