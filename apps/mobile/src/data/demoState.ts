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

export type DemoState = ReturnType<typeof buildDemoStateFromWeatherResult>;

export type DemoStateOptions = {
  hasDestination?: boolean;
  destinationCareEnabled?: boolean;
  destination?: Pick<PlaceSearchResult, "id" | "name" | "category" | "countryCode">;
  destinationAlertCondition?: DestinationAlertCondition;
  destinationSchedule?: DestinationScheduleInput;
  savedDestinations?: DestinationNotificationInput[];
  wardrobe?: WardrobeItem[];
  preferenceProfile?: UserPreferenceProfile;
};

export type DestinationScheduleInput = {
  targetArrivalTime: string;
  travelMinutes: number;
  bufferMinutes: number;
  transportMode?: DestinationTransportMode;
  travelProvider?: "kakao" | "google" | "fallback";
  travelStatus?: "idle" | "loading" | "ready" | "fallback" | "error";
};

export type DestinationNotificationInput = {
  place: Pick<PlaceSearchResult, "id" | "name" | "category" | "countryCode">;
  careEnabled: boolean;
  alertCondition: DestinationAlertCondition;
  schedulePreference?: Pick<DestinationScheduleInput, "targetArrivalTime" | "transportMode">;
  travelEstimate?: Pick<DestinationScheduleInput, "travelMinutes" | "travelProvider" | "travelStatus">;
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
  const baseNotificationRules = defaultNotificationRules.filter(
    (rule) => rule.type !== "destination" && rule.type !== "umbrella" && rule.type !== "shoes",
  );
  const notifications = evaluateNotificationRules(activeWeather, {
    rules: baseNotificationRules,
  });
  const destinationNotifications = hasDestination
    ? buildDestinationNotifications(activeWeather, weatherProviderResult.destination, {
        destination: options.destination,
        destinationAlertCondition: options.destinationAlertCondition,
        destinationSnapshots: weatherProviderResult.destinationSnapshots,
        destinationCareOn: options.destinationCareEnabled ?? true,
        savedDestinations: options.savedDestinations,
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
    travelMinutes: options.destinationSchedule?.travelMinutes ?? 40,
    targetArrivalTime: options.destinationSchedule?.targetArrivalTime ?? "13:00",
    bufferMinutes: options.destinationSchedule?.bufferMinutes ?? 10,
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
            },
            careEnabled: options.destinationCareOn,
            alertCondition:
              options.destinationAlertCondition ?? destinationWeatherAlertConditionFallback(),
          },
        ];

  return destinations.map((destination) => {
    const destinationWeather =
      options.destinationSnapshots.find((snapshot) => snapshot.locationId === destination.place.id) ??
      relabelWeatherSnapshot(fallbackDestinationWeather, destination.place);
    const [notification] = evaluateNotificationRules(activeWeather, {
      rules: [{ ...destinationRule, id: `${destinationRule.id}:${destination.place.id}` }],
      destinationAlertCondition: destination.alertCondition,
      destinationCareOn: destination.careEnabled,
      destinationCategory: destination.place.category,
      destinationWeather,
    });
    return {
      ...notification,
      title: `${destination.place.name} 알림`,
    };
  });
}

function destinationWeatherAlertConditionFallback(): DestinationAlertCondition {
  return {
    rainThresholdPct: 50,
    leadTimeMinutes: 60,
    windThresholdMs: 8,
  };
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
