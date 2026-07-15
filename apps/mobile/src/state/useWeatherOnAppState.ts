import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { placeSearchFixtures, type PlaceSearchResult } from "@weatheron/shared";
import {
  presetWardrobe,
  type DestinationAlertCondition,
  type DestinationTransportMode,
  type NotificationRuleEvaluation,
  type UserPreferenceProfile,
  type WardrobeItem,
} from "@weatheron/shared";
import { buildDemoStateFromWeatherResult } from "../data/demoState";
import { isLaunchHiddenRoute, isP0Route, type AppRouteId, type OnboardingRouteId, type P0RouteId } from "../navigation/routes";
import {
  initialDeviceLocationState,
  requestDeviceWeatherLocation,
  syncDeviceWeatherLocationPermission,
  type DeviceLocationState,
} from "../providers/deviceLocation";
import { getFallbackSnapshots, runtimeWeatherProvider } from "../providers/weatherProvider";
import type { WeatherProviderMode, WeatherProviderResult } from "../providers/weatherProvider";
import {
  createKmaWeatherLocationFromCoordinate,
  defaultSeoulWeatherLocation,
  seongsuWeatherLocation,
  type KmaWeatherLocationPreset,
  type WeatherLocationPreset,
} from "../providers/weatherLocations";
import { getDeviceSearchLocale, runtimePlaceSearchClient } from "../providers/placeSearchClient";
import { runtimeTravelEstimateClient, type TravelEstimateResult } from "../providers/travelEstimateClient";
import { readAppValue, writeAppValue } from "../providers/appStorage";
import {
  addLocalNotificationReceivedListener,
  addLocalNotificationResponseListener,
  checkLocalNotificationPermission,
  requestLocalNotificationPermission,
  scheduleLocalNotificationTest,
  syncLocalWeatherNotifications,
  type LocalNotificationSyncResult,
} from "../providers/localNotifications";
import { getRouteLabel } from "../navigation/routeLabels";
import { getMinutesUntilTimeInZone } from "../utils/zonedDateTime";
import { getTravelMinutesForTransport, isWalkUnavailableForEstimate } from "../utils/travelEstimate";

export type { DestinationTransportMode };
export type DestinationRepeatDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type GateReason = "account-connect" | "save-outfit" | "destination-care" | "notification" | "social-note" | "weather-report";
export type WeatherLocationMode = "auto" | "manual";
export type DestinationHubFilter = "all" | "saved" | "care" | "category";
export type PlaceSearchStatus = "idle" | "loading" | "ready" | "empty" | "error";
export type AlertSettingsFocus = "general" | "umbrella" | "rain" | "destination";
export type AccountPendingAction = GateReason;
export type PermissionGateReason = "notification" | "destination-care" | "location" | "account-setup";
export type PolicyDocumentType = "privacy" | "terms" | "location" | "open-source";
export type AdConsentMode = "pending" | "personalized" | "non-personalized";
export type TemperatureUnit = "celsius" | "fahrenheit";
export type WeightUnit = "kilogram" | "pound";
export type DistanceUnit = "meter" | "mile";
export type ThemeMode = "system" | "light" | "dark";
export type StyleGender = "all" | "women" | "men";
export type AgeBand = "10-20" | "20-30" | "30-40" | "40-50" | "50+";
export type FitPreference = "standard" | "relaxed" | "formal" | "outdoor";
export type SmartCareScenario = "commute" | "outing" | "travel";
export type PermissionReturnRouteId = P0RouteId | OnboardingRouteId;
export type AccountGateReturnRouteId = P0RouteId | "A4";
export type DestinationAddReturnRouteId = P0RouteId | "O6";
export type AlertPreferenceKey = "rainDetail" | "weatherAlerts" | "routine" | "bedtime" | "destination" | "quietHours";
export type AlertPreferences = Record<AlertPreferenceKey, boolean>;
export type NotificationDeliveryStatus = LocalNotificationSyncResult;
export type DestinationSchedulePreference = {
  targetArrivalTime: string;
  transportMode: DestinationTransportMode;
  repeatEnabled: boolean;
  repeatDays: DestinationRepeatDay[];
};
export type DestinationTravelEstimate = TravelEstimateResult & {
  originPlaceId: string;
  destinationPlaceId: string;
};

export type AccountGateState = {
  returnTo: AccountGateReturnRouteId;
  reason: GateReason;
  pendingAction: AccountPendingAction;
  resumeLabel: string;
  selectedDestinationName?: string;
  outfitVariant?: string;
};

export type AlertSettingsRouteState = {
  returnTo: P0RouteId;
  focus: AlertSettingsFocus;
};

export type AccountGateResultState = {
  returnTo: AccountGateReturnRouteId;
  pendingAction: AccountPendingAction;
  message: string;
};

export type PermissionGateState = {
  returnTo: PermissionReturnRouteId;
  reason: PermissionGateReason;
  resumeLabel: string;
  selectedDestinationName?: string;
  alertFocus?: AlertSettingsFocus;
  pendingAccountAction?: AccountPendingAction;
};

export type PermissionGateResultState = {
  returnTo: PermissionReturnRouteId;
  reason: PermissionGateReason;
  message: string;
};

export type { DestinationAlertCondition };

export type SavedDestination = {
  place: PlaceSearchResult;
  careEnabled: boolean;
  alertCondition: DestinationAlertCondition;
  schedulePreference: DestinationSchedulePreference;
  travelEstimate: DestinationTravelEstimate;
  savedAtLabel: string;
};

export type NotificationHistoryItem = {
  id: string;
  notificationId: string;
  title: string;
  action: "read" | "open" | "sent" | "received";
  route?: P0RouteId;
  statusLabel: string;
  occurredAt?: string;
};

const defaultDestinationAlertCondition: DestinationAlertCondition = {
  rainThresholdPct: 50,
  leadTimeMinutes: 60,
  windThresholdMs: 8,
};
const defaultAlertPreferences: AlertPreferences = {
  rainDetail: true,
  weatherAlerts: true,
  routine: true,
  bedtime: true,
  destination: true,
  quietHours: true,
};
const defaultNotificationDeliveryStatus: NotificationDeliveryStatus = {
  status: "unavailable",
  scheduledCount: 0,
};

const appStateStorageKey = "weatheron.appState.v1";
const notificationStateStorageKey = "weatheron.notificationState.v1";
const weatherProviderResultStorageKey = "weatheron.weatherProviderResult.v1";

export function useWeatherOnAppState() {
  const [route, setRoute] = useState<AppRouteId>("O1");
  const [appStateHydrated, setAppStateHydrated] = useState(false);
  const [nowMinuteTick, setNowMinuteTick] = useState(() => Date.now());
  const [useDestinationWeather, setUseDestinationWeather] = useState(false);
  const [umbrellaReviewed, setUmbrellaReviewed] = useState(false);
  const [umbrellaReturnRoute, setUmbrellaReturnRoute] = useState<P0RouteId>("H1");
  const [notificationCenterReturnRoute, setNotificationCenterReturnRoute] = useState<P0RouteId>("H1");
  const [wardrobeReturnRoute, setWardrobeReturnRoute] = useState<P0RouteId>("C1");
  const [wardrobePresetReturnRoute, setWardrobePresetReturnRoute] = useState<P0RouteId>("C1");
  const [smartCareEnabled, setSmartCareEnabled] = useState(true);
  const [weatherProviderMode, setWeatherProviderMode] = useState<WeatherProviderMode>("ready");
  const [weatherLocationMode, setWeatherLocationMode] = useState<WeatherLocationMode>("auto");
  const [deviceLocationState, setDeviceLocationState] = useState<DeviceLocationState>(initialDeviceLocationState);
  const [deviceWeatherLocation, setDeviceWeatherLocation] = useState<KmaWeatherLocationPreset | null>(null);
  const [manualWeatherLocation, setManualWeatherLocation] = useState<WeatherLocationPreset>(defaultSeoulWeatherLocation);
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [recentlyRemovedDestination, setRecentlyRemovedDestination] = useState<SavedDestination | null>(null);
  const [previewDestinationCareEnabled, setPreviewDestinationCareEnabled] = useState(true);
  const [previewDestinationAlertCondition, setPreviewDestinationAlertCondition] = useState<DestinationAlertCondition>(defaultDestinationAlertCondition);
  const [selectedDestinationPlace, setSelectedDestinationPlace] = useState<PlaceSearchResult>(getDefaultDestinationPlace());
  const [previewDestinationSchedulePreference, setPreviewDestinationSchedulePreference] = useState<DestinationSchedulePreference>(() =>
    getDefaultDestinationSchedulePreference(getDefaultDestinationPlace()),
  );
  const [previewDestinationTravelEstimate, setPreviewDestinationTravelEstimate] = useState<DestinationTravelEstimate>(() =>
    createDefaultTravelEstimate(seongsuWeatherLocation, getDefaultDestinationPlace()),
  );
  const [destinationSelectionReady, setDestinationSelectionReady] = useState(false);
  const [destinationHubFilter, setDestinationHubFilterState] = useState<DestinationHubFilter>("all");
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeSearchResults, setPlaceSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isPlaceSearchLoading, setIsPlaceSearchLoading] = useState(false);
  const [placeSearchStatus, setPlaceSearchStatus] = useState<PlaceSearchStatus>("idle");
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryItem[]>([]);
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>(defaultAlertPreferences);
  const [notificationDeliveryStatus, setNotificationDeliveryStatus] = useState<NotificationDeliveryStatus>(defaultNotificationDeliveryStatus);
  const [alertSettingsRouteState, setAlertSettingsRouteState] = useState<AlertSettingsRouteState | null>(null);
  const [selectedPolicyDocument, setSelectedPolicyDocument] = useState<PolicyDocumentType>("privacy");
  const [adConsentMode, setAdConsentMode] = useState<AdConsentMode>("pending");
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("celsius");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kilogram");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("meter");
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [reducedTransparency, setReducedTransparency] = useState(false);
  const [styleProfileSaved, setStyleProfileSaved] = useState(false);
  const [styleGender, setStyleGender] = useState<StyleGender>("all");
  const [ageBand, setAgeBand] = useState<AgeBand>("20-30");
  const [fitPreference, setFitPreference] = useState<FitPreference>("standard");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["미니멀", "캐주얼"]);
  const [smartCareScenario, setSmartCareScenario] = useState<SmartCareScenario>("outing");
  const [wardrobeOwnedItemIds, setWardrobeOwnedItemIds] = useState<string[]>([]);
  const [selectedWardrobeItemId, setSelectedWardrobeItemId] = useState<string>(presetWardrobe[0]?.id ?? "");
  const [recentlyRemovedWardrobeItemId, setRecentlyRemovedWardrobeItemId] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [styleProfileReturnRoute, setStyleProfileReturnRoute] = useState<P0RouteId | null>(null);
  const [destinationAddReturnRoute, setDestinationAddReturnRoute] = useState<DestinationAddReturnRouteId>("G1");
  const [accountLinked, setAccountLinked] = useState(false);
  const [termsRequiredAccepted, setTermsRequiredAccepted] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [permissionReady, setPermissionReady] = useState(false);
  const [outfitSaved, setOutfitSaved] = useState(false);
  const [gate, setGate] = useState<AccountGateState | null>(null);
  const [accountGateResult, setAccountGateResult] = useState<AccountGateResultState | null>(null);
  const [permissionGate, setPermissionGate] = useState<PermissionGateState | null>(null);
  const [permissionGateResult, setPermissionGateResult] = useState<PermissionGateResultState | null>(null);
  const [weatherRefreshTick, setWeatherRefreshTick] = useState(0);
  const [weatherProviderResult, setWeatherProviderResult] = useState(() => getFallbackSnapshots("stale"));
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const localNotificationSyncKeyRef = useRef("");
  const placeSearchRequestSeqRef = useRef(0);
  const deviceLocationRequestInFlightRef = useRef(false);
  const previousRouteRef = useRef<AppRouteId | null>(null);
  const weatherLoadedFromNetworkRef = useRef(false);
  const persistedWeatherProviderResultRef = useRef<WeatherProviderResult | null>(null);
  const currentWeatherSnapshotRef = useRef<WeatherProviderResult["current"] | null>(null);
  const selectedDestinationPlaceIdRef = useRef(selectedDestinationPlace.id);
  const previousWeatherRequestRef = useRef<{
    currentLocationId: string;
    mode: WeatherProviderMode;
    refreshTick: number;
  } | null>(null);
  const savedDestinationWeatherKey = savedDestinations
    .map((destination) => `${destination.place.id}:${destination.place.coordinate.latitude}:${destination.place.coordinate.longitude}`)
    .join("|");
  const savedDestinationWeatherLocations = useMemo(
    () => savedDestinations.map((destination) => createWeatherLocationFromPlace(destination.place)),
    [savedDestinationWeatherKey],
  );
  useEffect(() => {
    selectedDestinationPlaceIdRef.current = selectedDestinationPlace.id;
  }, [selectedDestinationPlace.id]);
  const fallbackDestinationWeatherLocation = useMemo(
    () => (savedDestinationWeatherLocations.length ? undefined : createWeatherLocationFromPlace(selectedDestinationPlace)),
    [savedDestinationWeatherLocations.length, savedDestinationWeatherLocations.length ? null : selectedDestinationPlace],
  );
  const selectedSavedDestination = useMemo(
    () => savedDestinations.find((destination) => destination.place.id === selectedDestinationPlace.id),
    [savedDestinations, selectedDestinationPlace.id],
  );
  const destinationSaved = Boolean(selectedSavedDestination);
  const destinationCareEnabled = selectedSavedDestination?.careEnabled ?? previewDestinationCareEnabled;
  const selectedDestinationAlertCondition = selectedSavedDestination?.alertCondition ?? previewDestinationAlertCondition;
  const selectedDestinationSchedulePreference = selectedSavedDestination?.schedulePreference ?? previewDestinationSchedulePreference;
  const selectedDestinationTravelEstimate = selectedSavedDestination?.travelEstimate ?? previewDestinationTravelEstimate;
  const selectedDestinationTravelMinutes = getTravelMinutesForTransport(
    selectedDestinationTravelEstimate,
    selectedDestinationSchedulePreference.transportMode,
    selectedDestinationPlace.countryCode,
  );
  const selectedDestinationAutoBufferMinutes = typeof selectedDestinationTravelMinutes === "number"
    ? getAutoBufferMinutes(
        selectedDestinationSchedulePreference.targetArrivalTime,
        selectedDestinationTravelMinutes,
        nowMinuteTick,
        selectedDestinationPlace.timezone,
      )
    : undefined;
  const userPreferenceProfile = useMemo<UserPreferenceProfile>(
    () => ({
      gender: styleGender === "men" ? "male" : styleGender === "women" ? "female" : "any",
      ageBand,
      styleTags: selectedStyles,
      fit: fitPreference,
      routine: smartCareScenario === "outing" ? "free" : smartCareScenario === "commute" ? "commute" : "travel",
      alertMode: "auto-care",
    }),
    [ageBand, fitPreference, selectedStyles, smartCareScenario, styleGender],
  );
  const wardrobe = useMemo(() => presetWardrobe.map((item) => ({ ...item, owned: wardrobeOwnedItemIds.includes(item.id) })), [wardrobeOwnedItemIds]);
  const reconcileNotificationPermission = useCallback(async () => {
    const result = await checkLocalNotificationPermission();
    if (result.status === "unavailable") return;
    setPermissionReady(result.granted);
  }, []);

  const reconcileDeviceLocationPermission = useCallback(async () => {
    if (!locationReady && weatherLocationMode !== "auto") return;
    const result = await syncDeviceWeatherLocationPermission();
    setDeviceLocationState(result);
    if (result.status === "granted" && result.location) {
      setLocationReady(true);
      setDeviceWeatherLocation(result.location);
      return;
    }
    setLocationReady(false);
    setDeviceWeatherLocation(null);
    if (weatherLocationMode === "auto") {
      setWeatherLocationMode("manual");
      setUseDestinationWeather(false);
      setWeatherRefreshTick((value) => value + 1);
    }
  }, [locationReady, weatherLocationMode]);

  useEffect(() => {
    let active = true;
    Promise.all([readPersistedWeatherProviderResult(), readPersistedAppState(), readPersistedNotificationState()])
      .then(([persistedWeatherResult, persistedState, persistedNotificationState]) => {
        if (!active) return;
        if (persistedWeatherResult) {
          persistedWeatherProviderResultRef.current = persistedWeatherResult;
          setWeatherProviderResult(persistedWeatherResult);
        }
        if (!persistedState) {
          setReadNotificationIds(persistedNotificationState.readNotificationIds);
          setNotificationHistory(persistedNotificationState.notificationHistory);
          return;
        }
        setOnboardingCompleted(persistedState.onboardingCompleted);
        setSmartCareEnabled(persistedState.smartCareEnabled);
        setAccountLinked(persistedState.accountLinked);
        setTermsRequiredAccepted(persistedState.termsRequiredAccepted);
        setLocationReady(persistedState.locationReady);
        setPermissionReady(persistedState.permissionReady);
        setOutfitSaved(persistedState.outfitSaved);
        setStyleProfileSaved(persistedState.styleProfileSaved);
        setStyleGender(persistedState.styleGender);
        setAgeBand(persistedState.ageBand);
        setFitPreference(persistedState.fitPreference);
        setSelectedStyles(persistedState.selectedStyles);
        setSmartCareScenario(persistedState.smartCareScenario);
        setWardrobeOwnedItemIds(persistedState.wardrobeOwnedItemIds);
        setSelectedWardrobeItemId(persistedState.selectedWardrobeItemId);
        setSavedDestinations(persistedState.savedDestinations);
        setSelectedDestinationPlace(persistedState.selectedDestinationPlace);
        setPreviewDestinationCareEnabled(persistedState.previewDestinationCareEnabled);
        setPreviewDestinationAlertCondition(persistedState.previewDestinationAlertCondition);
        setPreviewDestinationSchedulePreference(persistedState.previewDestinationSchedulePreference);
        setPreviewDestinationTravelEstimate(persistedState.previewDestinationTravelEstimate);
        setWeatherLocationMode(persistedState.weatherLocationMode);
        setTemperatureUnit(persistedState.temperatureUnit);
        setWeightUnit(persistedState.weightUnit);
        setDistanceUnit(persistedState.distanceUnit);
        setThemeMode(persistedState.themeMode);
        setReducedTransparency(persistedState.reducedTransparency);
        setAdConsentMode(persistedState.adConsentMode);
        setReadNotificationIds(persistedState.readNotificationIds);
        setNotificationHistory(persistedState.notificationHistory);
        setAlertPreferences(persistedState.alertPreferences);
        if (persistedState.locationReady) setDeviceLocationState({ status: "idle", message: "현재 위치 재확인 필요" });
        setManualWeatherLocation(persistedState.manualWeatherLocation);
        setRoute(persistedState.onboardingCompleted ? "H1" : "O1");
      })
      .finally(() => {
        if (active) setAppStateHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const state = useMemo(
    () => {
      const hasSavedDestination = savedDestinations.length > 0;
      return buildDemoStateFromWeatherResult(weatherProviderResult, useDestinationWeather, {
        hasDestination: hasSavedDestination,
        destinationCareEnabled: hasSavedDestination ? destinationCareEnabled : false,
        wardrobe,
        preferenceProfile: userPreferenceProfile,
        destination: hasSavedDestination
          ? {
              id: selectedDestinationPlace.id,
              name: selectedDestinationPlace.name,
              category: selectedDestinationPlace.category,
              countryCode: selectedDestinationPlace.countryCode,
              timezone: selectedDestinationPlace.timezone,
            }
          : undefined,
        destinationAlertCondition: selectedDestinationAlertCondition,
        destinationSchedule: {
          targetArrivalTime: selectedDestinationSchedulePreference.targetArrivalTime,
          bufferMinutes: selectedDestinationAutoBufferMinutes,
          // 이동수단별 최종 이동시간(도보 거리 기반 계산 포함)은 demoState 쪽에서 동일한 공식으로
          // 다시 계산하므로, 여기서는 가공 전 원본 이동시간·거리를 넘긴다.
          travelMinutes: selectedDestinationTravelEstimate.travelMinutes,
          distanceMeters: selectedDestinationTravelEstimate.distanceMeters,
          transportMode: selectedDestinationSchedulePreference.transportMode,
          travelProvider: selectedDestinationTravelEstimate.provider,
          travelStatus: selectedDestinationTravelEstimate.status,
        },
        savedDestinations,
        notificationNow: nowMinuteTick,
      });
    },
    [
      destinationCareEnabled,
      savedDestinations,
      selectedDestinationAlertCondition,
      selectedDestinationAutoBufferMinutes,
      selectedDestinationPlace,
      selectedDestinationSchedulePreference,
      selectedDestinationTravelEstimate,
      selectedDestinationTravelMinutes,
      useDestinationWeather,
      userPreferenceProfile,
      wardrobe,
      weatherProviderResult,
      nowMinuteTick,
    ],
  );

  useEffect(() => {
    const intervalId = setInterval(() => setNowMinuteTick(Date.now()), 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!appStateHydrated) return;
    let active = true;
    setIsWeatherLoading(true);
    const currentLocation = getActiveWeatherLocation(weatherLocationMode, manualWeatherLocation, deviceWeatherLocation);
    // 홈 저장 목적지 전환은 이미 받은 목적지 스냅샷만 바꿔 보여준다.
    // 선택값을 이 요청의 의존성으로 두면 칩을 누를 때마다 전체 날씨 요청이 다시 발생한다.
    const destinationLocation = savedDestinationWeatherLocations[0] ?? fallbackDestinationWeatherLocation;
    const previousRequest = previousWeatherRequestRef.current;
    const currentSnapshot = previousRequest?.currentLocationId === currentLocation.locationId
      && previousRequest.mode === weatherProviderMode
      && previousRequest.refreshTick === weatherRefreshTick
      && currentWeatherSnapshotRef.current?.locationId === currentLocation.locationId
      ? currentWeatherSnapshotRef.current
      : undefined;
    runtimeWeatherProvider
      .getSnapshots(weatherProviderMode, {
        currentLocation,
        currentSnapshot,
        destinationLocation,
        destinationLocations: savedDestinationWeatherLocations,
      })
      .then((result) => {
        if (active) {
          const persistedWeatherResult = persistedWeatherProviderResultRef.current;
          const nextResult = shouldKeepPersistedWeatherResult(result, persistedWeatherResult) ? persistedWeatherResult : result;
          weatherLoadedFromNetworkRef.current = true;
          currentWeatherSnapshotRef.current = nextResult.current;
          previousWeatherRequestRef.current = {
            currentLocationId: currentLocation.locationId,
            mode: weatherProviderMode,
            refreshTick: weatherRefreshTick,
          };
          setWeatherProviderResult(nextResult);
          if (result.status === "ready" && !result.fallbackUsed) {
            persistedWeatherProviderResultRef.current = normalizePersistedWeatherProviderResult(result);
            savePersistedWeatherProviderResult(result);
          }
        }
      })
      .finally(() => {
        if (active) setIsWeatherLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appStateHydrated, weatherProviderMode, weatherRefreshTick, weatherLocationMode, deviceWeatherLocation, manualWeatherLocation, savedDestinationWeatherLocations, fallbackDestinationWeatherLocation]);

  useEffect(() => {
    if (!appStateHydrated) return;
    let active = true;
    const originLocation = getActiveWeatherLocation(weatherLocationMode, manualWeatherLocation, deviceWeatherLocation);
    const destinationPlace = selectedDestinationPlace;
    runtimeTravelEstimateClient
      .estimateRoute({
        origin: originLocation.coordinate,
        destination: destinationPlace.coordinate,
        originName: originLocation.locationName,
        destinationName: destinationPlace.name,
        originCountryCode: originLocation.countryCode,
        destinationCountryCode: destinationPlace.countryCode,
      })
      .then((result) => {
        if (!active) return;
        const estimate = createDestinationTravelEstimate(originLocation.locationId, destinationPlace.id, result);
        setPreviewDestinationTravelEstimate(estimate);
        setSavedDestinations((current) =>
          current.map((destination) =>
            destination.place.id === destinationPlace.id
              ? { ...destination, travelEstimate: estimate, savedAtLabel: destination.savedAtLabel === "방금 저장" ? "방금 저장" : "업데이트됨" }
              : destination,
          ),
        );
      })
      .catch(() => {
        if (!active) return;
        const estimate = createDefaultTravelEstimate(originLocation, destinationPlace, "error");
        setPreviewDestinationTravelEstimate(estimate);
      });
    return () => {
      active = false;
    };
  }, [appStateHydrated, weatherLocationMode, manualWeatherLocation, deviceWeatherLocation, selectedDestinationPlace]);

  useEffect(() => {
    if (!appStateHydrated) return;
    saveNotificationState({ readNotificationIds, notificationHistory });
  }, [appStateHydrated, notificationHistory, readNotificationIds]);

  useEffect(() => {
    if (!appStateHydrated) return;
    void reconcileNotificationPermission();
    void reconcileDeviceLocationPermission();
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void reconcileNotificationPermission();
        void reconcileDeviceLocationPermission();
      }
    });
    return () => {
      subscription.remove();
    };
  }, [appStateHydrated, reconcileDeviceLocationPermission, reconcileNotificationPermission]);

  useEffect(() => {
    if (!appStateHydrated) return;
    let active = true;
    const notifications = state.notifications.filter((item) => shouldScheduleLocalNotification(item, alertPreferences));
    const syncKey = JSON.stringify({
      permissionReady,
      smartCareEnabled,
      preferences: alertPreferences,
      ids: notifications.map((item) => `${item.id}:${item.active}:${item.reason}:${item.scheduledAt ?? ""}`),
    });
    if (localNotificationSyncKeyRef.current === syncKey) return;
    localNotificationSyncKeyRef.current = syncKey;
    void syncLocalWeatherNotifications({
      enabled: permissionReady && smartCareEnabled,
      notifications,
      reducedInterruptions: alertPreferences.quietHours,
    })
      .then((result) => {
        if (active) setNotificationDeliveryStatus(result);
      })
      .catch(() => {
        if (active) setNotificationDeliveryStatus(defaultNotificationDeliveryStatus);
      });
    return () => {
      active = false;
    };
  }, [alertPreferences, appStateHydrated, permissionReady, smartCareEnabled, state.notifications]);

  useEffect(() => {
    if (!appStateHydrated) return;
    savePersistedAppState({
      onboardingCompleted,
      smartCareEnabled,
      accountLinked,
      termsRequiredAccepted,
      locationReady,
      permissionReady,
      outfitSaved,
      styleProfileSaved,
      styleGender,
      ageBand,
      fitPreference,
      selectedStyles,
      smartCareScenario,
      wardrobeOwnedItemIds,
      selectedWardrobeItemId,
      savedDestinations,
      selectedDestinationPlace,
      previewDestinationCareEnabled,
      previewDestinationAlertCondition,
      previewDestinationSchedulePreference,
      previewDestinationTravelEstimate,
      weatherLocationMode,
      manualWeatherLocation,
      temperatureUnit,
      weightUnit,
      distanceUnit,
      themeMode,
      reducedTransparency,
      adConsentMode,
      readNotificationIds,
      notificationHistory,
      alertPreferences,
    });
  }, [
    accountLinked,
    adConsentMode,
    ageBand,
    alertPreferences,
    appStateHydrated,
    fitPreference,
    locationReady,
    notificationHistory,
    onboardingCompleted,
    outfitSaved,
    permissionReady,
    previewDestinationAlertCondition,
    previewDestinationCareEnabled,
    previewDestinationSchedulePreference,
    previewDestinationTravelEstimate,
    readNotificationIds,
    reducedTransparency,
    savedDestinations,
    selectedDestinationPlace,
    selectedStyles,
    selectedWardrobeItemId,
    smartCareEnabled,
    smartCareScenario,
    styleGender,
    styleProfileSaved,
    temperatureUnit,
    weightUnit,
    distanceUnit,
    termsRequiredAccepted,
    themeMode,
    wardrobeOwnedItemIds,
    weatherLocationMode,
    manualWeatherLocation,
  ]);

  const setWeatherMode = useCallback((mode: WeatherProviderMode) => {
    setWeatherProviderMode(mode);
    setWeatherRefreshTick((value) => value + 1);
  }, []);

  const refreshWeather = useCallback(() => {
    setWeatherProviderMode("ready");
    setWeatherRefreshTick((value) => value + 1);
  }, []);

  const setLocationMode = useCallback((mode: WeatherLocationMode) => {
    setWeatherLocationMode(mode);
    setWeatherProviderMode("ready");
    setUseDestinationWeather(false);
    setWeatherRefreshTick((value) => value + 1);
  }, []);

  const selectWeatherLocation = useCallback((place: PlaceSearchResult) => {
    setManualWeatherLocation(createWeatherLocationFromPlace(place));
    setWeatherLocationMode("manual");
    setWeatherProviderMode("ready");
    setUseDestinationWeather(false);
    setWeatherRefreshTick((value) => value + 1);
  }, []);

  const applyCurrentLocationWeather = useCallback(async (requestingMessage: string) => {
    deviceLocationRequestInFlightRef.current = true;
    setWeatherLocationMode("auto");
    setWeatherProviderMode("ready");
    setUseDestinationWeather(false);
    setDeviceLocationState({ status: "requesting", message: requestingMessage });
    try {
      const result = await requestDeviceWeatherLocation();
      setDeviceLocationState(result);
      if (result.status === "granted" && result.location) {
        setLocationReady(true);
        setDeviceWeatherLocation(result.location);
        // 권한 다이얼로그 대기 중 자동 위치 동기화가 거부로 끝나면 모드가 manual로 되돌아갈 수 있어,
        // 허용 성공 시 auto를 다시 확정한다.
        setWeatherLocationMode("auto");
      } else {
        setLocationReady(false);
        setDeviceWeatherLocation(null);
        setWeatherLocationMode("manual");
      }
      setWeatherRefreshTick((value) => value + 1);
      return result;
    } finally {
      deviceLocationRequestInFlightRef.current = false;
    }
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    if (deviceLocationRequestInFlightRef.current) return;
    await applyCurrentLocationWeather("위치 권한 및 현재 위치 확인 중");
  }, [applyCurrentLocationWeather]);

  useEffect(() => {
    if (!appStateHydrated || weatherLocationMode !== "auto") return;
    if (deviceWeatherLocation && deviceWeatherLocation.locationName !== "현재 위치") return;
    // 현재 위치 요청(권한 다이얼로그 포함)이 진행 중이면 동기화 결과가 요청 상태와 모드를 덮어쓰므로 건너뛴다.
    if (deviceLocationRequestInFlightRef.current) return;
    let active = true;
    setDeviceLocationState({ status: "requesting", message: locationReady ? "현재 위치 재확인 중" : "위치 권한 동기화 중" });
    syncDeviceWeatherLocationPermission().then((result) => {
      if (!active) return;
      setDeviceLocationState(result);
      if (result.status === "granted" && result.location) {
        setLocationReady(true);
        setDeviceWeatherLocation(result.location);
      } else {
        setLocationReady(false);
        setDeviceWeatherLocation(null);
        setWeatherLocationMode("manual");
      }
      setWeatherRefreshTick((value) => value + 1);
    });
    return () => {
      active = false;
    };
  }, [appStateHydrated, deviceWeatherLocation, locationReady, weatherLocationMode]);

  const resetPlaceSearch = useCallback(() => {
    placeSearchRequestSeqRef.current += 1;
    setPlaceSearchQuery("");
    setPlaceSearchResults([]);
    setIsPlaceSearchLoading(false);
    setPlaceSearchStatus("idle");
  }, []);

  useEffect(() => {
    const previousRoute = previousRouteRef.current;
    previousRouteRef.current = route;
    if (previousRoute && previousRoute !== "P1" && route === "P1") resetPlaceSearch();
  }, [resetPlaceSearch, route]);

  const navigate = useCallback((nextRoute: AppRouteId) => {
    setAlertSettingsRouteState(null);
    if (nextRoute === "O4" && isP0Route(route)) setStyleProfileReturnRoute(route);
    if (nextRoute === "P1") setDestinationAddReturnRoute(route === "O6" ? "O6" : "G1");
    if (nextRoute === "H4" && isP0Route(route) && route !== "H4") setUmbrellaReturnRoute(route);
    if (nextRoute === "H3" && isP0Route(route) && route !== "H3") setNotificationCenterReturnRoute(route);
    // 옷장(C2)·프리셋(C3)은 코디 메인(C1)과 코디 상세(C4) 양쪽에서 진입 가능해, 뒤로가기가
    // 항상 C1로 고정되면 코디 상세에서 들어왔을 때 엉뚱한 화면으로 돌아간다. 실제 진입 경로를 기억한다.
    if (nextRoute === "C2" && isP0Route(route) && route !== "C2") setWardrobeReturnRoute(route);
    if (nextRoute === "C3" && isP0Route(route) && route !== "C3") setWardrobePresetReturnRoute(route);
    setRoute(isLaunchHiddenRoute(nextRoute) ? "H1" : nextRoute);
  }, [route]);

  const returnFromDestinationAdd = useCallback(() => {
    setRoute(destinationAddReturnRoute);
  }, [destinationAddReturnRoute]);

  useEffect(() => {
    if (route !== "O4" && styleProfileReturnRoute) setStyleProfileReturnRoute(null);
  }, [route, styleProfileReturnRoute]);

  const openAlertSettings = useCallback((returnTo: P0RouteId, focus: AlertSettingsFocus = "general") => {
    setAlertSettingsRouteState({ returnTo, focus });
    setRoute("M2");
  }, []);

  const requestPermissionGate = useCallback((reason: PermissionGateReason, returnTo: PermissionReturnRouteId, alertFocus?: AlertSettingsFocus) => {
    const ready = reason === "location" ? locationReady : permissionReady;
    if (ready) {
      setPermissionGateResult(createPermissionGateResult(reason, returnTo));
      setRoute(returnTo);
      return;
    }
    setPermissionGate(createPermissionGateState(reason, returnTo, selectedDestinationPlace.name, alertFocus));
    setRoute("O3");
  }, [locationReady, permissionReady, selectedDestinationPlace.name]);

  const openPolicyDocument = useCallback((type: PolicyDocumentType) => {
    setSelectedPolicyDocument(type);
    setRoute("R2");
  }, []);

  const returnFromPolicyDocument = useCallback(() => {
    setRoute("R1");
  }, []);

  const signOutAccount = useCallback(() => {
    setAccountLinked(false);
    setTermsRequiredAccepted(false);
    setOutfitSaved(false);
    setSavedDestinations([]);
    setRecentlyRemovedDestination(null);
    setWardrobeOwnedItemIds([]);
    setSelectedWardrobeItemId(presetWardrobe[0]?.id ?? "");
    setRecentlyRemovedWardrobeItemId(null);
    setAccountGateResult(null);
    setRoute("M1");
  }, []);

  const toggleStyleTag = useCallback((tag: string) => {
    setSelectedStyles((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      return [...current, tag].slice(0, 4);
    });
  }, []);

  const setWardrobeItemOwned = useCallback((itemId: string, owned: boolean) => {
    if (owned) {
      setWardrobeOwnedItemIds((current) => (current.includes(itemId) ? current : [itemId, ...current]));
      return;
    }
    setWardrobeOwnedItemIds((current) => current.filter((id) => id !== itemId));
  }, []);

  const openWardrobeItem = useCallback((itemId: string) => {
    setSelectedWardrobeItemId(itemId);
    setRoute("C3");
  }, []);

  const removeWardrobeItem = useCallback((itemId: string) => {
    setWardrobeOwnedItemIds((current) => current.filter((id) => id !== itemId));
    setRecentlyRemovedWardrobeItemId(itemId);
  }, []);

  const restoreRemovedWardrobeItem = useCallback(() => {
    if (!recentlyRemovedWardrobeItemId) return;
    setWardrobeOwnedItemIds((current) =>
      current.includes(recentlyRemovedWardrobeItemId) ? current : [recentlyRemovedWardrobeItemId, ...current],
    );
    setRecentlyRemovedWardrobeItemId(null);
  }, [recentlyRemovedWardrobeItemId]);

  const saveStyleProfile = useCallback((returnTo: PermissionReturnRouteId = "O5") => {
    setStyleProfileSaved(true);
    setRoute(returnTo);
  }, []);

  const completeSmartCareOnboarding = useCallback(() => {
    setSmartCareEnabled(true);
    setRoute("O6");
  }, []);

  const completeOnboarding = useCallback((routeTo: P0RouteId = "H1") => {
    setOnboardingCompleted(true);
    setRoute(routeTo);
  }, []);

  const returnFromAlertSettings = useCallback(() => {
    const returnTo = alertSettingsRouteState?.returnTo ?? "H1";
    setAlertSettingsRouteState(null);
    setRoute(returnTo);
  }, [alertSettingsRouteState?.returnTo]);

  const toggleWeather = () => {
    setUseDestinationWeather((value) => !value);
    setUmbrellaReviewed(false);
  };

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((current) => (current.includes(id) ? current : [...current, id]));
    const notification = state.notifications.find((item) => item.id === id);
    setNotificationHistory((current) =>
      addNotificationHistoryItem(current, {
        id: createNotificationHistoryId(id, "read"),
        notificationId: id,
        title: notification?.title ?? "알림",
        action: "read",
        statusLabel: "읽음 처리",
        occurredAt: new Date().toISOString(),
      }),
    );
  }, [state.notifications]);

  const markAllNotificationsRead = useCallback(() => {
    const activeNotificationIds = state.notifications.filter((item) => item.active).map((item) => item.id);
    if (activeNotificationIds.length === 0) return;
    setReadNotificationIds((current) => [...new Set([...current, ...activeNotificationIds])]);
    setNotificationHistory((current) =>
      addNotificationHistoryItem(current, {
        id: createNotificationHistoryId("all-active", "read"),
        notificationId: "all-active",
        title: "오늘 알림",
        action: "read",
        statusLabel: `${activeNotificationIds.length}개 전체 읽음 처리`,
        occurredAt: new Date().toISOString(),
      }),
    );
  }, [state.notifications]);

  const clearNotificationHistory = useCallback(() => {
    setNotificationHistory([]);
  }, []);

  const toggleAlertPreference = useCallback((key: AlertPreferenceKey) => {
    setAlertPreferences((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  // 알림·목적지 진입점 3곳(알림 조건 수정, 알림 조건 편집, 딥링크)이 공유하는 저장 목적지 포커스 처리.
  const focusSavedDestination = useCallback((destination: SavedDestination) => {
    setSelectedDestinationPlace(destination.place);
    setDestinationSelectionReady(true);
    setPreviewDestinationCareEnabled(destination.careEnabled);
    setPreviewDestinationAlertCondition(destination.alertCondition);
    setDestinationHubFilterState("all");
    setUseDestinationWeather(false);
    setWeatherProviderMode("ready");
  }, []);

  const editDestinationAlertCondition = useCallback((placeId: string) => {
    const matchedDestination = savedDestinations.find((destination) => destination.place.id === placeId);
    if (matchedDestination) focusSavedDestination(matchedDestination);
    setRoute("G2");
  }, [focusSavedDestination, savedDestinations]);

  const editNotificationCondition = useCallback((id: string, route: P0RouteId) => {
    const destinationPlaceId = getNotificationDestinationPlaceId(id);
    if (destinationPlaceId) {
      const matchedDestination = savedDestinations.find((destination) => destination.place.id === destinationPlaceId);
      if (matchedDestination) focusSavedDestination(matchedDestination);
      setAlertSettingsRouteState({ returnTo: "G2", focus: "destination" });
      setRoute("M2");
      return;
    }
    setAlertSettingsRouteState({ returnTo: route, focus: getAlertSettingsFocusFromRoute(route) });
    setRoute("M2");
  }, [focusSavedDestination, savedDestinations]);

  const openNotificationDeepLink = useCallback((id: string, route: P0RouteId) => {
    setReadNotificationIds((current) => (current.includes(id) ? current : [...current, id]));
    const notification = state.notifications.find((item) => item.id === id);
    setNotificationHistory((current) =>
      addNotificationHistoryItem(current, {
        id: createNotificationHistoryId(id, "open", route),
        notificationId: id,
        title: getNotificationHistoryTitle(id, notification?.title),
        action: "open",
        route,
        statusLabel: getNotificationOpenResultLabel(id, route),
        occurredAt: new Date().toISOString(),
      }),
    );
    const destinationPlaceId = getNotificationDestinationPlaceId(id);
    if (destinationPlaceId && route === "G2") {
      const matchedDestination = savedDestinations.find((destination) => destination.place.id === destinationPlaceId);
      if (matchedDestination) focusSavedDestination(matchedDestination);
    }
    if (route === "M2") {
      setAlertSettingsRouteState({ returnTo: "H1", focus: "general" });
    }
    if (route === "H3") {
      setNotificationCenterReturnRoute("H1");
    }
    setRoute(route);
  }, [focusSavedDestination, savedDestinations, state.notifications]);

  const sendTestNotification = useCallback(async (route: P0RouteId = "M2") => {
    if (!permissionReady) {
      setPermissionGate(createPermissionGateState("notification", "M2", selectedDestinationPlace.name, "general"));
      setRoute("O3");
      return;
    }
    const result = await scheduleLocalNotificationTest({
      route,
      title: getTestNotificationTitle(route),
      body: getTestNotificationBody(route),
    });
    setNotificationDeliveryStatus(result);
    setNotificationHistory((current) =>
      addNotificationHistoryItem(current, {
        id: createNotificationHistoryId("local-test", "sent", route),
        notificationId: "local-test",
        title: getTestNotificationTitle(route),
        action: "sent",
        route,
        statusLabel: getLocalNotificationResultLabel(result),
        occurredAt: new Date().toISOString(),
      }),
    );
  }, [permissionReady, selectedDestinationPlace.name]);

  useEffect(() => {
    if (!appStateHydrated) return;
    let removeResponseListener: (() => void) | undefined;
    let removeReceivedListener: (() => void) | undefined;
    let active = true;
    void addLocalNotificationReceivedListener((payload) => {
      if (!active) return;
      const notificationId = payload.ruleId ?? payload.notificationId ?? "local-notification";
      const routeFromPayload = getP0RouteFromNotificationPayload(payload.route) ?? "M2";
      setNotificationHistory((current) =>
        addNotificationHistoryItem(current, {
          id: createNotificationHistoryId(notificationId, "received", routeFromPayload),
          notificationId,
          title: payload.title ?? getNotificationHistoryTitle(notificationId, getTestNotificationTitle(routeFromPayload)),
          action: "received",
          route: routeFromPayload,
          statusLabel: "수신 확인",
          occurredAt: new Date().toISOString(),
        }),
      );
    }).then((remove) => {
      if (active) {
        removeReceivedListener = remove;
        return;
      }
      remove();
    });
    void addLocalNotificationResponseListener((payload) => {
      if (!active) return;
      const routeFromPayload = getP0RouteFromNotificationPayload(payload.route);
      if (!routeFromPayload) return;
      openNotificationDeepLink(payload.ruleId ?? "local-notification", routeFromPayload);
    }).then((remove) => {
      if (active) {
        removeResponseListener = remove;
        return;
      }
      remove();
    });
    return () => {
      active = false;
      removeReceivedListener?.();
      removeResponseListener?.();
    };
  }, [appStateHydrated, openNotificationDeepLink]);

  const searchPlaces = useCallback(async (query: string) => {
    const requestSeq = placeSearchRequestSeqRef.current + 1;
    placeSearchRequestSeqRef.current = requestSeq;
    setPlaceSearchQuery(query);
    if (query.trim().length < 2) {
      setPlaceSearchResults([]);
      setIsPlaceSearchLoading(false);
      setPlaceSearchStatus("idle");
      return;
    }
    setIsPlaceSearchLoading(true);
    setPlaceSearchStatus("loading");
    try {
      const results = await runtimePlaceSearchClient.searchPlaces({ query, locale: getDeviceSearchLocale() });
      if (placeSearchRequestSeqRef.current !== requestSeq) return;
      const currentLocation = getActiveWeatherLocation(weatherLocationMode, manualWeatherLocation, deviceWeatherLocation);
      setPlaceSearchResults(sortPlaceSearchResultsByRelevanceAndDistance(results, query, currentLocation));
      setPlaceSearchStatus(results.length > 0 ? "ready" : "empty");
    } catch {
      if (placeSearchRequestSeqRef.current !== requestSeq) return;
      setPlaceSearchResults([]);
      setPlaceSearchStatus("error");
    } finally {
      if (placeSearchRequestSeqRef.current === requestSeq) setIsPlaceSearchLoading(false);
    }
  }, [deviceWeatherLocation, manualWeatherLocation, weatherLocationMode]);

  const selectDestinationPlace = useCallback((place: PlaceSearchResult) => {
    if (selectedDestinationPlaceIdRef.current === place.id) return;
    selectedDestinationPlaceIdRef.current = place.id;
    setSelectedDestinationPlace(place);
    setPreviewDestinationSchedulePreference(getDefaultDestinationSchedulePreference(place));
    setDestinationSelectionReady(true);
    setPreviewDestinationCareEnabled(true);
    setDestinationHubFilterState("all");
    setUseDestinationWeather(false);
  }, []);

  const saveSelectedDestination = useCallback((careEnabled = true) => {
    setDestinationSelectionReady(true);
    setSavedDestinations((current) => {
      const exists = current.some((destination) => destination.place.id === selectedDestinationPlace.id);
      const nextDestination: SavedDestination = {
        place: selectedDestinationPlace,
        careEnabled,
        alertCondition: selectedSavedDestination?.alertCondition ?? previewDestinationAlertCondition,
        schedulePreference: selectedSavedDestination?.schedulePreference ?? previewDestinationSchedulePreference,
        travelEstimate: selectedSavedDestination?.travelEstimate ?? previewDestinationTravelEstimate,
        savedAtLabel: exists ? "업데이트됨" : "방금 저장",
      };
      return exists
        ? current.map((destination) => (destination.place.id === selectedDestinationPlace.id ? nextDestination : destination))
        : [nextDestination, ...current];
    });
  }, [
    previewDestinationAlertCondition,
    previewDestinationSchedulePreference,
    previewDestinationTravelEstimate,
    selectedDestinationPlace,
    selectedSavedDestination?.alertCondition,
    selectedSavedDestination?.schedulePreference,
    selectedSavedDestination?.travelEstimate,
  ]);

  const startAccountGate = useCallback((reason: GateReason, returnTo: AccountGateReturnRouteId, selectedDestinationName?: string) => {
    setGate(createAccountGateState(reason, returnTo, selectedDestinationName, state.outfit.variant));
    setRoute(accountLinked ? "A3" : "A2");
  }, [accountLinked, state.outfit.variant]);

  const saveDestination = useCallback((returnTo: P0RouteId = "G1") => {
    saveSelectedDestination(permissionReady);
    resetPlaceSearch();
    setPreviewDestinationCareEnabled(permissionReady);
    setAccountGateResult(createAccountGateResult("destination-care", returnTo));
    if (route === "O6" || destinationAddReturnRoute === "O6") setOnboardingCompleted(true);
    setDestinationAddReturnRoute("G1");
    setRoute(returnTo);
  }, [destinationAddReturnRoute, permissionReady, resetPlaceSearch, route, saveSelectedDestination]);

  const toggleDestinationCare = useCallback(() => {
    const nextCareEnabled = !destinationCareEnabled;
    if (nextCareEnabled && !permissionReady) {
      setPermissionGate(createPermissionGateState("destination-care", "G2", selectedDestinationPlace.name, "destination"));
      setRoute("O3");
      return;
    }
    if (destinationSaved) {
      setSavedDestinations((current) =>
        current.map((destination) =>
          destination.place.id === selectedDestinationPlace.id ? { ...destination, careEnabled: nextCareEnabled, savedAtLabel: "업데이트됨" } : destination,
        ),
      );
    } else {
      saveSelectedDestination(nextCareEnabled);
    }
    setPreviewDestinationCareEnabled(nextCareEnabled);
  }, [destinationCareEnabled, destinationSaved, permissionReady, saveSelectedDestination, selectedDestinationPlace.id, selectedDestinationPlace.name]);

  const toggleSavedDestinationCare = useCallback((placeId: string) => {
    const matchedDestination = savedDestinations.find((destination) => destination.place.id === placeId);
    const nextCareEnabled = !matchedDestination?.careEnabled;
    if (nextCareEnabled && !permissionReady) {
      setPermissionGate(createPermissionGateState("destination-care", "G1", matchedDestination?.place.name, "destination"));
      setRoute("O3");
      return;
    }
    setSavedDestinations((current) =>
      current.map((destination) =>
        destination.place.id === placeId ? { ...destination, careEnabled: !destination.careEnabled, savedAtLabel: "업데이트됨" } : destination,
      ),
    );
  }, [permissionReady, savedDestinations]);

  const setSelectedDestinationSchedulePreference = useCallback((nextPreference: DestinationSchedulePreference) => {
    setPreviewDestinationSchedulePreference(nextPreference);
    if (destinationSaved) {
      setSavedDestinations((current) =>
        current.map((destination) =>
          destination.place.id === selectedDestinationPlace.id
            ? { ...destination, schedulePreference: nextPreference, savedAtLabel: "업데이트됨" }
            : destination,
        ),
      );
    }
  }, [destinationSaved, selectedDestinationPlace.id]);

  const setSelectedDestinationTargetArrivalTime = useCallback((targetArrivalTime: string) => {
    const currentPreference = selectedSavedDestination?.schedulePreference ?? previewDestinationSchedulePreference;
    if (!isValidTimeText(targetArrivalTime)) return;
    setSelectedDestinationSchedulePreference({ ...currentPreference, targetArrivalTime });
  }, [previewDestinationSchedulePreference, selectedSavedDestination?.schedulePreference, setSelectedDestinationSchedulePreference]);

  const setSelectedDestinationTransportMode = useCallback((transportMode: DestinationTransportMode) => {
    const currentPreference = selectedSavedDestination?.schedulePreference ?? previewDestinationSchedulePreference;
    const nextTransportMode = isWalkUnavailableForEstimate(selectedDestinationTravelEstimate, transportMode) ? "auto" : transportMode;
    setSelectedDestinationSchedulePreference({ ...currentPreference, transportMode: nextTransportMode });
  }, [previewDestinationSchedulePreference, selectedDestinationTravelEstimate, selectedSavedDestination?.schedulePreference, setSelectedDestinationSchedulePreference]);

  const toggleSelectedDestinationRepeat = useCallback(() => {
    const currentPreference = selectedSavedDestination?.schedulePreference ?? previewDestinationSchedulePreference;
    const repeatEnabled = !currentPreference.repeatEnabled;
    setSelectedDestinationSchedulePreference({
      ...currentPreference,
      repeatEnabled,
      repeatDays: repeatEnabled && currentPreference.repeatDays.length === 0 ? [getTodayRepeatDay()] : currentPreference.repeatDays,
    });
  }, [previewDestinationSchedulePreference, selectedSavedDestination?.schedulePreference, setSelectedDestinationSchedulePreference]);

  const toggleSelectedDestinationRepeatDay = useCallback((day: DestinationRepeatDay) => {
    const currentPreference = selectedSavedDestination?.schedulePreference ?? previewDestinationSchedulePreference;
    const hasDay = currentPreference.repeatDays.includes(day);
    const repeatDays = hasDay
      ? currentPreference.repeatDays.filter((item) => item !== day)
      : [...currentPreference.repeatDays, day].sort(compareRepeatDays);
    setSelectedDestinationSchedulePreference({
      ...currentPreference,
      repeatEnabled: repeatDays.length > 0,
      repeatDays,
    });
  }, [previewDestinationSchedulePreference, selectedSavedDestination?.schedulePreference, setSelectedDestinationSchedulePreference]);

  const removeSavedDestination = useCallback((placeId: string) => {
    const removedDestination = savedDestinations.find((destination) => destination.place.id === placeId);
    if (!removedDestination) return;
    const nextDestinations = savedDestinations.filter((destination) => destination.place.id !== placeId);
    setSavedDestinations(nextDestinations);
    setRecentlyRemovedDestination({ ...removedDestination, savedAtLabel: "방금 삭제" });
    if (selectedDestinationPlace.id === placeId) {
      const nextSelectedPlace = nextDestinations[0]?.place ?? getDefaultDestinationPlace();
      setSelectedDestinationPlace(nextSelectedPlace);
      setDestinationSelectionReady(nextDestinations.length > 0);
      setPreviewDestinationCareEnabled(nextDestinations[0]?.careEnabled ?? false);
      setPreviewDestinationAlertCondition(nextDestinations[0]?.alertCondition ?? defaultDestinationAlertCondition);
      setWeatherProviderMode("ready");
      setWeatherRefreshTick((value) => value + 1);
    }
  }, [savedDestinations, selectedDestinationPlace.id]);

  const restoreRemovedDestination = useCallback(() => {
    if (!recentlyRemovedDestination) return;
    const restoredDestination: SavedDestination = { ...recentlyRemovedDestination, savedAtLabel: "복구됨" };
    setSavedDestinations((current) => {
      const exists = current.some((destination) => destination.place.id === restoredDestination.place.id);
      return exists
        ? current.map((destination) => (destination.place.id === restoredDestination.place.id ? restoredDestination : destination))
        : [restoredDestination, ...current];
    });
    setSelectedDestinationPlace(restoredDestination.place);
    setDestinationSelectionReady(true);
    setPreviewDestinationCareEnabled(restoredDestination.careEnabled);
    setPreviewDestinationAlertCondition(restoredDestination.alertCondition);
    setRecentlyRemovedDestination(null);
    setDestinationHubFilterState("all");
    setWeatherProviderMode("ready");
    setWeatherRefreshTick((value) => value + 1);
  }, [recentlyRemovedDestination]);

  const setDestinationHubFilter = useCallback((filter: DestinationHubFilter) => {
    setDestinationHubFilterState(filter);
    const matchingDestination = savedDestinations.find((destination) =>
      getDestinationFilterMatched(filter, destination.careEnabled, destination.place.category, selectedDestinationPlace.category),
    );
    if (matchingDestination && matchingDestination.place.id !== selectedDestinationPlace.id) {
      setSelectedDestinationPlace(matchingDestination.place);
      setDestinationSelectionReady(true);
      setWeatherProviderMode("ready");
      setWeatherRefreshTick((value) => value + 1);
    }
  }, [savedDestinations, selectedDestinationPlace.category, selectedDestinationPlace.id]);

  const requestAccountGate = (reason: GateReason, returnTo: AccountGateReturnRouteId) => {
    if (accountLinked && termsRequiredAccepted) {
      if (reason === "save-outfit") setOutfitSaved(true);
      if (reason === "destination-care") {
        if (!permissionReady) {
          setPermissionGate(createPermissionGateState("destination-care", returnTo === "A4" ? "M1" : returnTo, selectedDestinationPlace.name, "destination"));
          setRoute("O3");
          return;
        }
        saveSelectedDestination(true);
        setPreviewDestinationCareEnabled(true);
      }
      setAccountGateResult(createAccountGateResult(reason, returnTo));
      setRoute(returnTo);
      return;
    }
    startAccountGate(reason, returnTo, reason === "destination-care" ? selectedDestinationPlace.name : undefined);
  };

  const completeAccountAction = (pendingGate: AccountGateState | null) => {
    if (!pendingGate) return;
    if (pendingGate.reason === "save-outfit") setOutfitSaved(true);
    if (pendingGate.reason === "destination-care") {
      saveSelectedDestination(permissionReady);
      setPreviewDestinationCareEnabled(permissionReady);
    }
    setAccountGateResult(createAccountGateResult(pendingGate.reason, pendingGate.returnTo));
  };

  const completeAccountLink = () => {
    setAccountLinked(true);
    if (!termsRequiredAccepted) {
      setRoute("A3");
      return;
    }
    const returnTo = gate?.returnTo === "A4" ? "M1" : gate?.returnTo ?? "H1";
    completeAccountAction(gate);
    setRoute(returnTo);
    setGate(null);
  };

  const completeTerms = () => {
    setTermsRequiredAccepted(true);
    const returnTo = gate?.returnTo === "A4" ? "M1" : gate?.returnTo ?? "H1";
    completeAccountAction(gate);
    setRoute(returnTo);
    setGate(null);
  };

  const completePermissionGate = async () => {
    let permissionCompleted = true;
    let notificationCompleted = permissionReady;
    if (permissionGate?.reason === "location") {
      if (locationReady && deviceWeatherLocation) {
        setWeatherLocationMode("auto");
        setWeatherProviderMode("ready");
        setUseDestinationWeather(false);
        setDeviceLocationState({ status: "granted", message: "현재 위치 사용 가능", location: deviceWeatherLocation });
        setWeatherRefreshTick((value) => value + 1);
      } else {
        const result = await applyCurrentLocationWeather("현재 위치 확인 중");
        permissionCompleted = result.status === "granted";
      }
    }
    if (permissionGate?.reason !== "location") {
      const result = await requestLocalNotificationPermission();
      notificationCompleted = result.granted;
      permissionCompleted = notificationCompleted;
      setPermissionReady(result.granted);
    }
    if (permissionGate?.reason === "destination-care") {
      saveSelectedDestination(permissionCompleted);
      setPreviewDestinationCareEnabled(permissionCompleted);
    }
    if (permissionGate?.reason === "account-setup" && permissionGate.pendingAccountAction) {
      if (permissionGate.pendingAccountAction === "save-outfit") setOutfitSaved(true);
      if (permissionGate.pendingAccountAction === "destination-care") {
        saveSelectedDestination(notificationCompleted);
        setPreviewDestinationCareEnabled(notificationCompleted);
      }
      setAccountGateResult(createAccountGateResult(permissionGate.pendingAccountAction, getAccountResultReturnRoute(permissionGate.returnTo)));
    }
    if (permissionGate) {
      setPermissionGateResult(
        permissionCompleted
          ? createPermissionGateResult(permissionGate.reason, permissionGate.returnTo)
          : createPermissionGateSkipResult(permissionGate.reason, permissionGate.returnTo),
      );
    }
    if (permissionGate?.returnTo === "M2") setAlertSettingsRouteState(null);
    setRoute(permissionGate?.returnTo ?? "H1");
    setPermissionGate(null);
  };

  const skipPermissionGate = () => {
    if (permissionGate) setPermissionGateResult(createPermissionGateSkipResult(permissionGate.reason, permissionGate.returnTo));
    if (permissionGate?.reason === "destination-care") {
      saveSelectedDestination(false);
      setPreviewDestinationCareEnabled(false);
    }
    if (permissionGate?.reason === "account-setup" && permissionGate.pendingAccountAction) {
      if (permissionGate.pendingAccountAction === "save-outfit") setOutfitSaved(true);
      if (permissionGate.pendingAccountAction === "destination-care") {
        saveSelectedDestination(false);
        setPreviewDestinationCareEnabled(false);
      }
      setAccountGateResult(createAccountGateResult(permissionGate.pendingAccountAction, getAccountResultReturnRoute(permissionGate.returnTo)));
    }
    if (permissionGate?.reason === "location") {
      setLocationReady(false);
      setDeviceWeatherLocation(null);
      setDeviceLocationState({ status: "denied", message: "위치 권한 나중에 설정" });
      setWeatherLocationMode("manual");
      setWeatherProviderMode("ready");
      setWeatherRefreshTick((value) => value + 1);
    }
    setRoute(permissionGate?.returnTo ?? "H1");
    setPermissionGate(null);
  };

  const cancelAccountGate = () => {
    setRoute(gate?.returnTo ?? "H1");
    setGate(null);
  };

  const goBack = useCallback(() => {
    if (route === "A1" || route === "H1" || route === "O1" || route === "O2") return false;
    if (route === "A2" || route === "A3") {
      setRoute(gate?.returnTo ?? "H1");
      setGate(null);
      return true;
    }
    if (route === "O3") {
      setRoute(permissionGate?.returnTo ?? "H1");
      setPermissionGate(null);
      return true;
    }
    if (route === "R2") {
      setRoute("R1");
      return true;
    }
    if (route === "O4" && styleProfileReturnRoute) {
      setRoute(styleProfileReturnRoute);
      return true;
    }
    if (route === "P1") {
      setRoute(destinationAddReturnRoute);
      return true;
    }
    if (route === "H4") {
      setRoute(umbrellaReturnRoute);
      return true;
    }
    if (route === "H3") {
      setRoute(notificationCenterReturnRoute);
      return true;
    }
    if (route === "C2") {
      setRoute(wardrobeReturnRoute);
      return true;
    }
    if (route === "C3") {
      setRoute(wardrobePresetReturnRoute);
      return true;
    }
    const backRoute = getBackRoute(route);
    setRoute(backRoute);
    return true;
  }, [
    destinationAddReturnRoute,
    gate?.returnTo,
    notificationCenterReturnRoute,
    permissionGate?.returnTo,
    route,
    styleProfileReturnRoute,
    umbrellaReturnRoute,
    wardrobePresetReturnRoute,
    wardrobeReturnRoute,
  ]);

  const canGoBack = route !== "A1" && route !== "H1" && route !== "O1" && route !== "O2";

  return {
    route,
    styleProfileReturnRoute,
    umbrellaReturnRoute,
    state,
    useDestinationWeather,
    umbrellaReviewed,
    smartCareEnabled,
    weatherProviderMode,
    weatherLocationMode,
    deviceLocationState,
    destinationSaved,
    savedDestinations,
    recentlyRemovedDestination,
    destinationCareEnabled,
    selectedDestinationAlertCondition,
    selectedDestinationSchedulePreference,
    selectedDestinationTravelEstimate,
    selectedDestinationPlace,
    destinationSelectionReady,
    destinationHubFilter,
    placeSearchQuery,
    placeSearchResults,
    isPlaceSearchLoading,
    placeSearchStatus,
    readNotificationIds,
    notificationHistory,
    alertPreferences,
    notificationDeliveryStatus,
    alertSettingsRouteState,
    selectedPolicyDocument,
    adConsentMode,
    temperatureUnit,
    weightUnit,
    distanceUnit,
    themeMode,
    reducedTransparency,
    styleProfileSaved,
    styleGender,
    ageBand,
    fitPreference,
    selectedStyles,
    wardrobe,
    selectedWardrobeItemId,
    recentlyRemovedWardrobeItemId,
    smartCareScenario,
    onboardingCompleted,
    isWeatherLoading,
    accountLinked,
    termsRequiredAccepted,
    locationReady,
    permissionReady,
    outfitSaved,
    accountGateResult,
    permissionGateResult,
    gate,
    permissionGate,
    navigate,
    goBack,
    canGoBack,
    openAlertSettings,
    returnFromAlertSettings,
    openPolicyDocument,
    returnFromPolicyDocument,
    setAdConsentMode,
    setTemperatureUnit,
    setWeightUnit,
    setDistanceUnit,
    setThemeMode,
    toggleReducedTransparency: () => setReducedTransparency((value) => !value),
    setStyleGender,
    setAgeBand,
    setFitPreference,
    toggleStyleTag,
    setWardrobeItemOwned,
    openWardrobeItem,
    removeWardrobeItem,
    restoreRemovedWardrobeItem,
    saveStyleProfile,
    setSmartCareScenario,
    completeSmartCareOnboarding,
    completeOnboarding,
    toggleWeather,
    markUmbrellaReviewed: () => setUmbrellaReviewed(true),
    toggleSmartCare: () => setSmartCareEnabled((value) => !value),
    setWeatherProviderMode: setWeatherMode,
    setWeatherLocationMode: setLocationMode,
    requestCurrentLocation,
    selectWeatherLocation,
    saveDestination,
    returnFromDestinationAdd,
    toggleDestinationCare,
    toggleSavedDestinationCare,
    setSelectedDestinationTargetArrivalTime,
    setSelectedDestinationTransportMode,
    toggleSelectedDestinationRepeat,
    toggleSelectedDestinationRepeatDay,
    removeSavedDestination,
    restoreRemovedDestination,
    setDestinationHubFilter,
    searchPlaces,
    selectDestinationPlace,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotificationHistory,
    toggleAlertPreference,
    editDestinationAlertCondition,
    editNotificationCondition,
    openNotificationDeepLink,
    sendTestNotification,
    refreshWeather,
    requestAccountGate,
    signOutAccount,
    requestPermissionGate,
    completeAccountLink,
    completeTerms,
    cancelAccountGate,
    completePermissionGate,
    skipPermissionGate,
  };
}

function getBackRoute(route: AppRouteId): AppRouteId {
  switch (route) {
    case "O4":
      return "O2";
    case "O7":
      return "O2";
    case "O1":
      return "A1";
    case "O5":
      return "O7";
    case "O6":
      return "O5";
    case "C4":
      return "C1";
    case "H3":
    case "H4":
    case "H5":
    case "H7":
    case "H2":
      return "H1";
    case "W2":
    case "W3":
      return "W1";
    case "W1":
      return "H1";
    case "W4":
      return "M1";
    case "P1":
    case "P3":
      return "G1";
    case "G2":
    case "P2":
      return "G1";
    case "M2":
    case "M3":
    case "M4":
    case "A4":
    case "R1":
    case "R3":
    case "R4":
      return "M1";
    case "S0":
    case "S2":
    case "S3":
      return "S1";
    case "C1":
    case "G1":
    case "M1":
    case "S1":
    default:
      return "H1";
  }
}

function getAccountResultReturnRoute(route: PermissionReturnRouteId): AccountGateReturnRouteId {
  return isP0Route(route) ? route : "H1";
}

function getP0RouteFromNotificationPayload(value?: string): P0RouteId | null {
  if (!value) return null;
  const route = value as AppRouteId;
  if (!isP0Route(route)) return null;
  return isLaunchHiddenRoute(route) ? "H1" : route;
}

function shouldScheduleLocalNotification(notification: NotificationRuleEvaluation, preferences: AlertPreferences): boolean {
  if (!notification.active || !notification.requiresPushPermission) return false;
  if (notification.type === "rain") return preferences.rainDetail;
  if (notification.type === "heatwave" || notification.type === "heavy-rain") return preferences.weatherAlerts;
  if (notification.type === "destination") return preferences.destination;
  if (notification.type === "bedtime") return preferences.bedtime;
  if (notification.type === "routine") return preferences.routine;
  return preferences.routine;
}

function getLocalNotificationResultLabel(result: NotificationDeliveryStatus): string {
  if (result.status === "scheduled" && result.scheduledCount > 0) return "알림 예약 완료";
  if (result.status === "scheduled") return "예약 대기 없음";
  if (result.status === "verification-failed") return "예약 확인 실패";
  if (result.status === "permission-required") return "권한 필요";
  if (result.status === "cancelled") return "알림 예약 해제";
  return "기기 알림 미지원";
}

function getNotificationHistoryTitle(notificationId: string, fallbackTitle?: string): string {
  if (notificationId === "local-test") return "WeatherON 알림";
  return fallbackTitle ?? "알림";
}

function getNotificationOpenResultLabel(notificationId: string, route: P0RouteId): string {
  if (notificationId === "local-test" && route === "M2") return "스마트 알림 설정 이동";
  return `${getRouteLabel(route)} 이동`;
}

function getTestNotificationTitle(route: P0RouteId): string {
  if (route === "H3") return "새 알림이 도착했어요";
  if (route === "H5") return "우산 챙길 시간이에요";
  if (route === "H7") return "내일 아침을 가볍게 준비해요";
  if (route === "G2") return "목적지 가는 길, 미리 살펴봐요";
  return "WeatherON이 필요한 순간 알려드릴게요";
}

function getTestNotificationBody(route: P0RouteId): string {
  if (route === "H3") return "오늘 필요한 날씨 정보를 확인해봐요";
  if (route === "H5") return "곧 비가 올 수 있어요. 이동 전 확인해요";
  if (route === "H7") return "내일 날씨와 코디를 미리 확인해봐요";
  if (route === "G2") return "가는 길 날씨를 확인하고 편하게 준비해요";
  return "나에게 맞는 날씨 알림을 확인해봐요";
}

function getAlertSettingsFocusFromRoute(route: P0RouteId): AlertSettingsFocus {
  if (route === "H4") return "umbrella";
  if (route === "H5") return "rain";
  if (route === "G2" || route === "G1") return "destination";
  return "general";
}

function createWeatherLocationFromPlace(place: PlaceSearchResult): WeatherLocationPreset {
  if (place.countryCode === "KR") return createKmaWeatherLocationFromCoordinate(place.coordinate, place.name, place.id);
  return {
    locationId: place.id,
    locationName: place.name,
    countryCode: place.countryCode,
    coordinate: place.coordinate,
    timezone: place.timezone,
  };
}

function getNotificationDestinationPlaceId(notificationId: string): string | null {
  const prefix = "destination-change:";
  return notificationId.startsWith(prefix) ? notificationId.slice(prefix.length) : null;
}

function createAccountGateState(
  reason: GateReason,
  returnTo: AccountGateReturnRouteId,
  selectedDestinationName?: string,
  outfitVariant?: string,
): AccountGateState {
  return {
    reason,
    returnTo,
    pendingAction: reason,
    resumeLabel: getAccountResumeLabel(reason),
    selectedDestinationName: reason === "destination-care" ? selectedDestinationName : undefined,
    outfitVariant: reason === "save-outfit" ? outfitVariant : undefined,
  };
}

function createAccountGateResult(reason: GateReason, returnTo: AccountGateReturnRouteId): AccountGateResultState {
  return {
    returnTo,
    pendingAction: reason,
    message: `${getAccountResumeLabel(reason)} 완료`,
  };
}

function getAccountResumeLabel(reason: GateReason): string {
  if (reason === "account-connect") return "계정 연결";
  if (reason === "save-outfit") return "코디 저장";
  if (reason === "destination-care") return "목적지 케어 저장";
  if (reason === "social-note") return "ON Square 체크인";
  if (reason === "weather-report") return "날씨 제보 저장";
  return "알림 확장";
}

function createPermissionGateState(
  reason: PermissionGateReason,
  returnTo: PermissionReturnRouteId,
  selectedDestinationName?: string,
  alertFocus?: AlertSettingsFocus,
  pendingAccountAction?: AccountPendingAction,
): PermissionGateState {
  return {
    reason,
    returnTo,
    resumeLabel: getPermissionResumeLabel(reason),
    selectedDestinationName: reason === "destination-care" ? selectedDestinationName : undefined,
    alertFocus,
    pendingAccountAction,
  };
}

function createPermissionGateResult(reason: PermissionGateReason, returnTo: PermissionReturnRouteId): PermissionGateResultState {
  return {
    reason,
    returnTo,
    message: `${getPermissionResumeLabel(reason)} 허용 완료`,
  };
}

function createPermissionGateSkipResult(reason: PermissionGateReason, returnTo: PermissionReturnRouteId): PermissionGateResultState {
  return {
    reason,
    returnTo,
    message: `${getPermissionResumeLabel(reason)} 나중에 설정`,
  };
}

function getPermissionResumeLabel(reason: PermissionGateReason): string {
  if (reason === "account-setup") return "알림 권한";
  if (reason === "location") return "현재 위치 사용";
  if (reason === "destination-care") return "목적지 케어 알림";
  return "알림 권한";
}

function createNotificationHistoryId(notificationId: string, action: NotificationHistoryItem["action"], route?: P0RouteId): string {
  return `${notificationId}:${route ?? "none"}:${action}`;
}

function addNotificationHistoryItem(items: NotificationHistoryItem[], nextItem: NotificationHistoryItem): NotificationHistoryItem[] {
  const withoutDuplicate = items.filter((item) => item.id !== nextItem.id);
  return [nextItem, ...withoutDuplicate].slice(0, 24);
}

type PersistedAppState = {
  onboardingCompleted: boolean;
  smartCareEnabled: boolean;
  accountLinked: boolean;
  termsRequiredAccepted: boolean;
  locationReady: boolean;
  permissionReady: boolean;
  outfitSaved: boolean;
  styleProfileSaved: boolean;
  styleGender: StyleGender;
  ageBand: AgeBand;
  fitPreference: FitPreference;
  selectedStyles: string[];
  smartCareScenario: SmartCareScenario;
  wardrobeOwnedItemIds: string[];
  selectedWardrobeItemId: string;
  savedDestinations: SavedDestination[];
  selectedDestinationPlace: PlaceSearchResult;
  previewDestinationCareEnabled: boolean;
  previewDestinationAlertCondition: DestinationAlertCondition;
  previewDestinationSchedulePreference: DestinationSchedulePreference;
  previewDestinationTravelEstimate: DestinationTravelEstimate;
  weatherLocationMode: WeatherLocationMode;
  manualWeatherLocation: WeatherLocationPreset;
  temperatureUnit: TemperatureUnit;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  themeMode: ThemeMode;
  reducedTransparency: boolean;
  adConsentMode: AdConsentMode;
  readNotificationIds: string[];
  notificationHistory: NotificationHistoryItem[];
  alertPreferences: AlertPreferences;
};

async function readPersistedAppState(): Promise<PersistedAppState | null> {
  const value = await readAppValue<unknown>(appStateStorageKey);
  return value ? normalizePersistedAppState(value) : null;
}

function savePersistedAppState(state: PersistedAppState) {
  void writeAppValue(appStateStorageKey, normalizePersistedAppState(state));
}

async function readPersistedWeatherProviderResult(): Promise<WeatherProviderResult | null> {
  const value = await readAppValue<unknown>(weatherProviderResultStorageKey);
  return value ? normalizePersistedWeatherProviderResult(value) : null;
}

function savePersistedWeatherProviderResult(result: WeatherProviderResult) {
  if (result.status !== "ready" || result.fallbackUsed) return;
  void writeAppValue(weatherProviderResultStorageKey, result);
}

function shouldKeepPersistedWeatherResult(result: WeatherProviderResult, persistedResult: WeatherProviderResult | null): persistedResult is WeatherProviderResult {
  if (!persistedResult) return false;
  if (!isSameWeatherSnapshotLocation(result.current, persistedResult.current)) return false;
  if (!isSameWeatherSnapshotLocation(result.destination, persistedResult.destination)) return false;
  if (!hasSameWeatherSnapshotLocations(result.destinationSnapshots, persistedResult.destinationSnapshots)) return false;
  return result.status === "error" || result.status === "fallback" || result.fallbackUsed;
}

function isSameWeatherSnapshotLocation(left: WeatherProviderResult["current"], right: WeatherProviderResult["current"]) {
  return left.locationId === right.locationId && left.locationName === right.locationName;
}

function hasSameWeatherSnapshotLocations(left: WeatherProviderResult["destinationSnapshots"], right: WeatherProviderResult["destinationSnapshots"]) {
  if (left.length !== right.length) return false;
  const rightLocationKeys = new Set(right.map((snapshot) => `${snapshot.locationId}:${snapshot.locationName}`));
  return left.every((snapshot) => rightLocationKeys.has(`${snapshot.locationId}:${snapshot.locationName}`));
}

function normalizePersistedWeatherProviderResult(value: unknown): WeatherProviderResult | null {
  if (!isWeatherProviderResult(value)) return null;
  return {
    current: markPersistedWeatherSnapshotStale(value.current),
    destination: markPersistedWeatherSnapshotStale(value.destination),
    destinationSnapshots: value.destinationSnapshots.filter(isWeatherSnapshot).map(markPersistedWeatherSnapshotStale),
    status: "stale",
    message: "최근 저장 예보 기준 추천",
    retryable: true,
    fallbackUsed: value.fallbackUsed === true,
  };
}

function isWeatherProviderResult(value: unknown): value is WeatherProviderResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<WeatherProviderResult>;
  return (
    isWeatherSnapshot(record.current) &&
    isWeatherSnapshot(record.destination) &&
    Array.isArray(record.destinationSnapshots) &&
    (record.status === "ready" || record.status === "stale" || record.status === "fallback" || record.status === "error") &&
    typeof record.message === "string" &&
    typeof record.retryable === "boolean" &&
    typeof record.fallbackUsed === "boolean"
  );
}

function markPersistedWeatherSnapshotStale(snapshot: WeatherProviderResult["current"]): WeatherProviderResult["current"] {
  return {
    ...snapshot,
    stale: true,
    current: { ...snapshot.current },
    hourly: snapshot.hourly.map((item) => ({ ...item })),
    daily: snapshot.daily?.map((item) => ({ ...item })),
  };
}

function isWeatherSnapshot(value: unknown): value is WeatherProviderResult["current"] {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<WeatherProviderResult["current"]>;
  return (
    typeof record.locationId === "string" &&
    typeof record.locationName === "string" &&
    (record.countryCode === "KR" || record.countryCode === "JP" || record.countryCode === "GLOBAL") &&
    typeof record.observedAt === "string" &&
    isWeatherCurrent(record.current) &&
    Array.isArray(record.hourly) &&
    record.hourly.every(isHourlyWeather) &&
    (record.daily === undefined || (Array.isArray(record.daily) && record.daily.every(isDailyWeather))) &&
    (record.source === "kma" || record.source === "openmeteo" || record.source === "cache" || record.source === "fallback") &&
    typeof record.stale === "boolean"
  );
}

function isWeatherCurrent(value: unknown): value is WeatherProviderResult["current"]["current"] {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<WeatherProviderResult["current"]["current"]>;
  return (
    typeof record.tempC === "number" &&
    typeof record.feelsLikeC === "number" &&
    (record.condition === "clear" || record.condition === "cloud" || record.condition === "rain" || record.condition === "snow" || record.condition === "storm" || record.condition === "dust") &&
    typeof record.precipitationMm === "number" &&
    typeof record.rainProbabilityPct === "number" &&
    typeof record.windMs === "number" &&
    typeof record.humidityPct === "number"
  );
}

function isHourlyWeather(value: unknown): value is WeatherProviderResult["current"]["hourly"][number] {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<WeatherProviderResult["current"]["hourly"][number]>;
  return (
    typeof record.time === "string" &&
    typeof record.tempC === "number" &&
    typeof record.rainProbabilityPct === "number" &&
    typeof record.precipitationMm === "number" &&
    typeof record.windMs === "number" &&
    typeof record.condition === "string"
  );
}

function isDailyWeather(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<NonNullable<WeatherProviderResult["current"]["daily"]>[number]>;
  return (
    typeof record.date === "string" &&
    typeof record.minTempC === "number" &&
    typeof record.maxTempC === "number" &&
    typeof record.rainProbabilityPct === "number" &&
    typeof record.precipitationMm === "number" &&
    typeof record.windMs === "number" &&
    typeof record.condition === "string"
  );
}

function normalizePersistedAppState(value: unknown): PersistedAppState {
  const record = value && typeof value === "object" ? (value as Partial<PersistedAppState>) : {};
  const savedDestinations = Array.isArray(record.savedDestinations)
    ? record.savedDestinations.map(normalizeSavedDestination).filter((item): item is SavedDestination => Boolean(item)).slice(0, 12)
    : [];
  const defaultSelectedDestinationPlace = savedDestinations[0]?.place ?? getDefaultDestinationPlace();
  const selectedDestinationPlace = normalizeSelectedDestinationPlace(record.selectedDestinationPlace, savedDestinations, defaultSelectedDestinationPlace);
  const notificationState = normalizeNotificationState({
    readNotificationIds: record.readNotificationIds,
    notificationHistory: record.notificationHistory,
  });

  return {
    onboardingCompleted: record.onboardingCompleted === true,
    // 이전 설치본에는 값이 없으므로 기존 자동 케어 기본값을 유지한다.
    smartCareEnabled: record.smartCareEnabled !== false,
    accountLinked: record.accountLinked === true,
    termsRequiredAccepted: record.termsRequiredAccepted === true,
    locationReady: record.locationReady === true,
    permissionReady: record.permissionReady === true,
    outfitSaved: record.outfitSaved === true,
    styleProfileSaved: record.styleProfileSaved === true,
    styleGender: isStyleGender(record.styleGender) ? record.styleGender : "all",
    ageBand: isAgeBand(record.ageBand) ? record.ageBand : "20-30",
    fitPreference: isFitPreference(record.fitPreference) ? record.fitPreference : "standard",
    selectedStyles: Array.isArray(record.selectedStyles)
      ? record.selectedStyles.filter((item): item is string => typeof item === "string").slice(0, 4)
      : ["미니멀", "캐주얼"],
    smartCareScenario: isSmartCareScenario(record.smartCareScenario) ? record.smartCareScenario : "outing",
    wardrobeOwnedItemIds: Array.isArray(record.wardrobeOwnedItemIds)
      ? record.wardrobeOwnedItemIds.filter((item): item is string => typeof item === "string").slice(0, 60)
      : [],
    selectedWardrobeItemId: typeof record.selectedWardrobeItemId === "string" ? record.selectedWardrobeItemId : presetWardrobe[0]?.id ?? "",
    savedDestinations,
    selectedDestinationPlace,
    previewDestinationCareEnabled: record.previewDestinationCareEnabled !== false,
    previewDestinationAlertCondition: normalizeDestinationAlertCondition(record.previewDestinationAlertCondition),
    previewDestinationSchedulePreference: normalizeDestinationSchedulePreference(record.previewDestinationSchedulePreference, selectedDestinationPlace),
    previewDestinationTravelEstimate: normalizeDestinationTravelEstimate(record.previewDestinationTravelEstimate, defaultSeoulWeatherLocation, selectedDestinationPlace),
    weatherLocationMode: record.weatherLocationMode === "manual" ? "manual" : "auto",
    manualWeatherLocation: isWeatherLocationPreset(record.manualWeatherLocation) ? record.manualWeatherLocation : defaultSeoulWeatherLocation,
    temperatureUnit: record.temperatureUnit === "fahrenheit" ? "fahrenheit" : "celsius",
    weightUnit: record.weightUnit === "pound" ? "pound" : "kilogram",
    distanceUnit: record.distanceUnit === "mile" ? "mile" : "meter",
    themeMode: isThemeMode(record.themeMode) ? record.themeMode : "system",
    reducedTransparency: record.reducedTransparency === true,
    adConsentMode: isAdConsentMode(record.adConsentMode) ? record.adConsentMode : "pending",
    readNotificationIds: notificationState.readNotificationIds,
    notificationHistory: notificationState.notificationHistory,
    alertPreferences: normalizeAlertPreferences(record.alertPreferences),
  };
}

function normalizeSelectedDestinationPlace(
  value: unknown,
  savedDestinations: SavedDestination[],
  fallbackPlace: PlaceSearchResult,
): PlaceSearchResult {
  if (!isPlaceSearchResult(value)) return fallbackPlace;
  if (savedDestinations.length === 0) return value;
  return savedDestinations.find((destination) => destination.place.id === value.id)?.place ?? fallbackPlace;
}

function getDefaultDestinationPlace(): PlaceSearchResult {
  return placeSearchFixtures[1] ?? placeSearchFixtures[0];
}

function getDefaultDestinationSchedulePreference(place: PlaceSearchResult): DestinationSchedulePreference {
  const normalizedName = place.name.toLowerCase();
  return {
    targetArrivalTime:
      place.category === "beach" || normalizedName.includes("강릉")
        ? "13:00"
        : place.category === "sports" || normalizedName.includes("잠실")
          ? "10:20"
          : place.countryCode === "JP"
          ? "15:30"
            : "10:05",
    transportMode: "auto",
    repeatEnabled: false,
    repeatDays: [],
  };
}

function getDefaultTravelMinutes(place: PlaceSearchResult): number {
  const normalizedName = place.name.toLowerCase();
  if (place.category === "beach" || normalizedName.includes("강릉")) return 180;
  if (place.category === "sports" || normalizedName.includes("잠실")) return 45;
  if (place.countryCode === "JP") return 150;
  return 35;
}

function createDefaultTravelEstimate(
  origin: WeatherLocationPreset,
  place: PlaceSearchResult,
  status: DestinationTravelEstimate["status"] = "fallback",
): DestinationTravelEstimate {
  return {
    originPlaceId: origin.locationId,
    destinationPlaceId: place.id,
    provider: "fallback",
    status,
    travelMinutes: getDefaultTravelMinutes(place),
    distanceMeters: 0,
    message: status === "error" ? "이동시간 갱신 실패" : "기본 이동시간",
    updatedAt: new Date().toISOString(),
  };
}

function createDestinationTravelEstimate(originPlaceId: string, destinationPlaceId: string, result: TravelEstimateResult): DestinationTravelEstimate {
  return {
    ...result,
    originPlaceId,
    destinationPlaceId,
  };
}


function getAutoBufferMinutes(targetArrivalTime: string, travelMinutes: number, nowMs: number, timeZone: string): number {
  if (!isValidTimeText(targetArrivalTime)) return 10;
  const arrivalOffset = getMinutesUntilTimeInZone(targetArrivalTime, nowMs, timeZone);
  const freeWindow = arrivalOffset - travelMinutes;
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

function getActiveWeatherLocation(
  mode: WeatherLocationMode,
  manualLocation: WeatherLocationPreset,
  deviceLocation: KmaWeatherLocationPreset | null,
): WeatherLocationPreset {
  return mode === "manual" ? manualLocation : deviceLocation ?? seongsuWeatherLocation;
}

function sortPlaceSearchResultsByRelevanceAndDistance(
  places: PlaceSearchResult[],
  query: string,
  origin: WeatherLocationPreset,
): PlaceSearchResult[] {
  return places
    .map((place, index) => ({
      place,
      index,
      textRank: getPlaceTextMatchRank(place, query),
      countryRank: getPlaceCountryRank(place, origin),
      distanceMeters: getCoordinateDistanceMeters(origin.coordinate, place.coordinate),
    }))
    .sort((a, b) =>
      a.textRank - b.textRank ||
      a.countryRank - b.countryRank ||
      a.distanceMeters - b.distanceMeters ||
      a.index - b.index
    )
    .map((item) => item.place);
}

function getPlaceTextMatchRank(place: PlaceSearchResult, query: string) {
  const normalizedQuery = normalizePlaceSearchText(query);
  const normalizedName = normalizePlaceSearchText(place.name);
  const normalizedAddress = normalizePlaceSearchText(place.address);
  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  if (normalizedName.includes(normalizedQuery)) return 2;
  if (normalizedAddress.includes(normalizedQuery)) return 3;
  return 4;
}

function getPlaceCountryRank(place: PlaceSearchResult, origin: WeatherLocationPreset) {
  if (place.countryCode === origin.countryCode) return 0;
  if (place.countryCode === "GLOBAL" || origin.countryCode === "GLOBAL") return 1;
  return 2;
}

function getCoordinateDistanceMeters(
  origin: WeatherLocationPreset["coordinate"],
  destination: PlaceSearchResult["coordinate"],
) {
  const earthRadiusMeters = 6371000;
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function normalizePlaceSearchText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeAlertPreferences(value: unknown): AlertPreferences {
  if (!value || typeof value !== "object") return defaultAlertPreferences;
  const record = value as Partial<AlertPreferences>;
  return {
    rainDetail: record.rainDetail !== false,
    weatherAlerts: record.weatherAlerts !== false,
    routine: record.routine !== false,
    bedtime: record.bedtime !== false,
    destination: record.destination !== false,
    quietHours: record.quietHours !== false,
  };
}

function normalizeDestinationAlertCondition(value: unknown): DestinationAlertCondition {
  if (!value || typeof value !== "object") return defaultDestinationAlertCondition;
  const record = value as Partial<DestinationAlertCondition>;
  return {
    rainThresholdPct: typeof record.rainThresholdPct === "number" ? record.rainThresholdPct : defaultDestinationAlertCondition.rainThresholdPct,
    leadTimeMinutes: typeof record.leadTimeMinutes === "number" ? record.leadTimeMinutes : defaultDestinationAlertCondition.leadTimeMinutes,
    windThresholdMs: typeof record.windThresholdMs === "number" ? record.windThresholdMs : defaultDestinationAlertCondition.windThresholdMs,
  };
}

function normalizeSavedDestination(value: unknown): SavedDestination | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<SavedDestination>;
  if (!isPlaceSearchResult(record.place) || typeof record.careEnabled !== "boolean" || !isDestinationAlertCondition(record.alertCondition)) return null;
  return {
    place: record.place,
    careEnabled: record.careEnabled,
    alertCondition: normalizeDestinationAlertCondition(record.alertCondition),
    schedulePreference: normalizeDestinationSchedulePreference(record.schedulePreference, record.place),
    travelEstimate: normalizeDestinationTravelEstimate(record.travelEstimate, defaultSeoulWeatherLocation, record.place),
    savedAtLabel: typeof record.savedAtLabel === "string" ? record.savedAtLabel : "저장됨",
  };
}

function normalizeDestinationSchedulePreference(value: unknown, place: PlaceSearchResult): DestinationSchedulePreference {
  if (!value || typeof value !== "object") return getDefaultDestinationSchedulePreference(place);
  const record = value as Partial<DestinationSchedulePreference>;
  const repeatDays = Array.isArray(record.repeatDays)
    ? record.repeatDays.filter(isDestinationRepeatDay).sort(compareRepeatDays)
    : [];
  return {
    targetArrivalTime: typeof record.targetArrivalTime === "string" && isValidTimeText(record.targetArrivalTime)
      ? record.targetArrivalTime
      : getDefaultDestinationSchedulePreference(place).targetArrivalTime,
    transportMode: isDestinationTransportMode(record.transportMode) ? record.transportMode : "auto",
    repeatEnabled: record.repeatEnabled === true && repeatDays.length > 0,
    repeatDays,
  };
}

const repeatDayOrder: DestinationRepeatDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function compareRepeatDays(a: DestinationRepeatDay, b: DestinationRepeatDay) {
  return repeatDayOrder.indexOf(a) - repeatDayOrder.indexOf(b);
}

function getTodayRepeatDay(): DestinationRepeatDay {
  const day = new Date().getDay();
  if (day === 0) return "sun";
  return repeatDayOrder[day - 1] ?? "mon";
}

function isDestinationRepeatDay(value: unknown): value is DestinationRepeatDay {
  return value === "mon" || value === "tue" || value === "wed" || value === "thu" || value === "fri" || value === "sat" || value === "sun";
}

function isDestinationTransportMode(value: unknown): value is DestinationTransportMode {
  return value === "auto" || value === "walk" || value === "drive" || value === "transit";
}

function normalizeDestinationTravelEstimate(value: unknown, origin: WeatherLocationPreset, place: PlaceSearchResult): DestinationTravelEstimate {
  if (!value || typeof value !== "object") return createDefaultTravelEstimate(origin, place);
  const record = value as Partial<DestinationTravelEstimate>;
  return {
    originPlaceId: typeof record.originPlaceId === "string" ? record.originPlaceId : origin.locationId,
    destinationPlaceId: typeof record.destinationPlaceId === "string" ? record.destinationPlaceId : place.id,
    provider: record.provider === "kakao" || record.provider === "google" ? record.provider : "fallback",
    status: isTravelEstimateStatus(record.status) ? record.status : "fallback",
    travelMinutes: typeof record.travelMinutes === "number" ? record.travelMinutes : getDefaultTravelMinutes(place),
    distanceMeters: typeof record.distanceMeters === "number" ? record.distanceMeters : 0,
    message: typeof record.message === "string" ? record.message : "기본 이동시간",
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : new Date().toISOString(),
  };
}

function isTravelEstimateStatus(value: unknown): value is DestinationTravelEstimate["status"] {
  return value === "idle" || value === "loading" || value === "ready" || value === "fallback" || value === "error";
}

function isPlaceSearchResult(value: unknown): value is PlaceSearchResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<PlaceSearchResult>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.address === "string" &&
    isDestinationCategory(record.category) &&
    (record.countryCode === "KR" || record.countryCode === "JP" || record.countryCode === "GLOBAL") &&
    isGeoCoordinate(record.coordinate) &&
    typeof record.timezone === "string" &&
    (record.provider === "fixture" || record.provider === "kakao" || record.provider === "google" || record.provider === "openmeteo")
  );
}

function isDestinationAlertCondition(value: unknown): value is DestinationAlertCondition {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<DestinationAlertCondition>;
  return (
    typeof record.rainThresholdPct === "number" &&
    typeof record.leadTimeMinutes === "number" &&
    typeof record.windThresholdMs === "number"
  );
}

function isGeoCoordinate(value: unknown): value is PlaceSearchResult["coordinate"] {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<PlaceSearchResult["coordinate"]>;
  return typeof record.latitude === "number" && typeof record.longitude === "number";
}

function isWeatherLocationPreset(value: unknown): value is WeatherLocationPreset {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<WeatherLocationPreset>;
  return (
    typeof record.locationId === "string" &&
    typeof record.locationName === "string" &&
    (record.countryCode === "KR" || record.countryCode === "JP" || record.countryCode === "GLOBAL") &&
    isGeoCoordinate(record.coordinate) &&
    typeof record.timezone === "string"
  );
}

function isDestinationCategory(value: unknown): value is PlaceSearchResult["category"] {
  return (
    value === "work" ||
    value === "school" ||
    value === "airport" ||
    value === "hotel" ||
    value === "sports" ||
    value === "mountain" ||
    value === "beach" ||
    value === "custom"
  );
}

function isStyleGender(value: unknown): value is StyleGender {
  return value === "all" || value === "women" || value === "men";
}

function isAgeBand(value: unknown): value is AgeBand {
  return value === "10-20" || value === "20-30" || value === "30-40" || value === "40-50" || value === "50+";
}

function isFitPreference(value: unknown): value is FitPreference {
  return value === "standard" || value === "relaxed" || value === "formal" || value === "outdoor";
}

function isSmartCareScenario(value: unknown): value is SmartCareScenario {
  return value === "commute" || value === "outing" || value === "travel";
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function isAdConsentMode(value: unknown): value is AdConsentMode {
  return value === "pending" || value === "personalized" || value === "non-personalized";
}

type PersistedNotificationState = {
  readNotificationIds: string[];
  notificationHistory: NotificationHistoryItem[];
};

async function readPersistedNotificationState(): Promise<PersistedNotificationState> {
  const value = await readAppValue<unknown>(notificationStateStorageKey);
  return normalizeNotificationState(value);
}

function saveNotificationState(state: PersistedNotificationState) {
  void writeAppValue(notificationStateStorageKey, normalizeNotificationState(state));
}

function normalizeNotificationState(value: unknown): PersistedNotificationState {
  if (!value || typeof value !== "object") return emptyPersistedNotificationState();
  const record = value as Partial<PersistedNotificationState>;
  return {
    readNotificationIds: Array.isArray(record.readNotificationIds)
      ? record.readNotificationIds.filter((id): id is string => typeof id === "string").slice(0, 40)
      : [],
    notificationHistory: Array.isArray(record.notificationHistory)
      ? record.notificationHistory.filter(isNotificationHistoryItem).slice(0, 24)
      : [],
  };
}

function isNotificationHistoryItem(item: unknown): item is NotificationHistoryItem {
  if (!item || typeof item !== "object") return false;
  const record = item as Partial<NotificationHistoryItem>;
  return (
    typeof record.id === "string" &&
    typeof record.notificationId === "string" &&
    typeof record.title === "string" &&
    (record.action === "read" || record.action === "open" || record.action === "sent" || record.action === "received") &&
    typeof record.statusLabel === "string" &&
    (record.route === undefined || typeof record.route === "string")
  );
}

function emptyPersistedNotificationState(): PersistedNotificationState {
  return {
    readNotificationIds: [],
    notificationHistory: [],
  };
}

function getDestinationFilterMatched(
  filter: DestinationHubFilter,
  careEnabled: boolean,
  category: PlaceSearchResult["category"],
  selectedCategory: PlaceSearchResult["category"],
): boolean {
  if (filter === "care") return careEnabled;
  if (filter === "category") return category === selectedCategory;
  return true;
}
