import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import type { PlaceSearchResult } from "@weatheron/shared";
import { presetWardrobe, type UserPreferenceProfile } from "@weatheron/shared";
import { buildDemoStateFromWeatherResult } from "../data/demoState";
import { isLaunchHiddenRoute, isP0Route, type AppRouteId, type P0RouteId } from "../navigation/routes";
import {
  initialDeviceLocationState,
  requestDeviceWeatherLocation,
  syncDeviceWeatherLocationPermission,
  type DeviceLocationState,
} from "../providers/deviceLocation";
import { getFallbackSnapshots, runtimeWeatherProvider } from "../providers/weatherProvider";
import type { WeatherProviderMode, WeatherProviderResult } from "../providers/weatherProvider";
import {
  defaultSeoulWeatherLocation,
  seongsuWeatherLocation,
  type KmaWeatherLocationPreset,
  type WeatherLocationPreset,
} from "../providers/weatherLocations";
import { getDeviceSearchLocale, runtimePlaceSearchClient } from "../providers/placeSearchClient";
import { sortPlaceSearchResults } from "../utils/placeSearchRanking";
import { runtimeTravelEstimateClient } from "../providers/travelEstimateClient";
import {
  addLocalNotificationReceivedListener,
  addLocalNotificationResponseListener,
  checkLocalNotificationPermission,
  requestLocalNotificationPermission,
  scheduleLocalNotificationTest,
  syncLocalWeatherNotifications,
} from "../providers/localNotifications";
import { getTravelMinutesForTransport, isWalkUnavailableForEstimate } from "../utils/travelEstimate";
import { normalizePlaceSearchResultCategory } from "../utils/destination-visual-resolver";
import {
  defaultAlertPreferences,
  defaultDestinationAlertCondition,
  defaultNotificationDeliveryStatus,
} from "./appStateTypes";
import type {
  AccountGateResultState,
  AccountGateReturnRouteId,
  AccountGateState,
  AccountPendingAction,
  AdConsentMode,
  AgeBand,
  AlertPreferenceKey,
  AlertPreferences,
  AlertSettingsFocus,
  AlertSettingsRouteState,
  DestinationAddReturnRouteId,
  DestinationAlertCondition,
  DestinationHubFilter,
  DestinationRepeatDay,
  DestinationSchedulePreference,
  DestinationTransportMode,
  DestinationTravelEstimate,
  DistanceUnit,
  FitPreference,
  GateReason,
  NotificationDeliveryStatus,
  NotificationHistoryItem,
  PermissionGateReason,
  PermissionGateResultState,
  PermissionGateState,
  PermissionReturnRouteId,
  PlaceSearchStatus,
  PolicyDocumentType,
  SavedDestination,
  SmartCareScenario,
  StyleGender,
  TemperatureUnit,
  ThemeMode,
  WeatherLocationMode,
  WeightUnit,
} from "./appStateTypes";
import {
  addNotificationHistoryItem,
  createAccountGateResult,
  createAccountGateState,
  createDefaultTravelEstimate,
  createDestinationTravelEstimate,
  createNotificationHistoryId,
  createPermissionGateResult,
  createPermissionGateSkipResult,
  createPermissionGateState,
  createWeatherLocationFromPlace,
  compareRepeatDays,
  getAccountResultReturnRoute,
  getActiveWeatherLocation,
  getAlertSettingsFocusFromRoute,
  getAutoBufferMinutes,
  getBackRoute,
  getDefaultDestinationPlace,
  getDefaultDestinationSchedulePreference,
  getDestinationFilterMatched,
  getLocalNotificationResultLabel,
  getNotificationDestinationPlaceId,
  getNotificationHistoryTitle,
  getNotificationOpenResultLabel,
  getP0RouteFromNotificationPayload,
  getTestNotificationBody,
  getTestNotificationTitle,
  getTodayRepeatDay,
  isValidTimeText,
  shouldScheduleLocalNotification,
} from "./appStateHelpers";
import {
  normalizePersistedWeatherProviderResult,
  readPersistedAppState,
  readPersistedNotificationState,
  readPersistedWeatherProviderResult,
  saveNotificationState,
  savePersistedAppState,
  savePersistedWeatherProviderResult,
  shouldKeepPersistedWeatherResult,
} from "./persistedAppState";

// 화면들이 이 모듈에서 타입을 임포트하던 기존 경로를 유지하기 위해 재노출한다.
export type {
  AccountGateResultState,
  AccountGateReturnRouteId,
  AccountGateState,
  AccountPendingAction,
  AdConsentMode,
  AgeBand,
  AlertPreferenceKey,
  AlertPreferences,
  AlertSettingsFocus,
  AlertSettingsRouteState,
  DestinationAddReturnRouteId,
  DestinationAlertCondition,
  DestinationHubFilter,
  DestinationRepeatDay,
  DestinationSchedulePreference,
  DestinationTransportMode,
  DestinationTravelEstimate,
  DistanceUnit,
  FitPreference,
  GateReason,
  NotificationDeliveryStatus,
  NotificationHistoryItem,
  PermissionGateReason,
  PermissionGateResultState,
  PermissionGateState,
  PermissionReturnRouteId,
  PlaceSearchStatus,
  PolicyDocumentType,
  SavedDestination,
  SmartCareScenario,
  StyleGender,
  TemperatureUnit,
  ThemeMode,
  WeatherLocationMode,
  WeightUnit,
};

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
  const [dynamicColorEnabled, setDynamicColorEnabled] = useState(false);
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
  const placeSearchOrigin = deviceLocationState.location
    ?? deviceWeatherLocation
    ?? (weatherLocationMode === "manual" ? manualWeatherLocation : null);
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
        setDynamicColorEnabled(persistedState.dynamicColorEnabled);
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
      dynamicColorEnabled,
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
    dynamicColorEnabled,
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

  const requestOnboardingNotificationPermission = useCallback(async () => {
    const result = await requestLocalNotificationPermission();
    setPermissionReady(result.granted);
    return result.granted;
  }, []);

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
      const searchOrigin = deviceLocationState.location
        ?? deviceWeatherLocation
        ?? (weatherLocationMode === "manual" ? manualWeatherLocation : null);
      const results = await runtimePlaceSearchClient.searchPlaces({
        query,
        locale: getDeviceSearchLocale(),
        origin: searchOrigin?.coordinate,
      });
      if (placeSearchRequestSeqRef.current !== requestSeq) return;
      setPlaceSearchResults(sortPlaceSearchResults(results, query, searchOrigin));
      setPlaceSearchStatus(results.length > 0 ? "ready" : "empty");
    } catch {
      if (placeSearchRequestSeqRef.current !== requestSeq) return;
      setPlaceSearchResults([]);
      setPlaceSearchStatus("error");
    } finally {
      if (placeSearchRequestSeqRef.current === requestSeq) setIsPlaceSearchLoading(false);
    }
  }, [deviceLocationState.location, deviceWeatherLocation, manualWeatherLocation, weatherLocationMode]);

  const selectDestinationPlace = useCallback((place: PlaceSearchResult) => {
    const normalizedPlace = normalizePlaceSearchResultCategory(place);
    if (selectedDestinationPlaceIdRef.current === normalizedPlace.id) return;
    selectedDestinationPlaceIdRef.current = normalizedPlace.id;
    setSelectedDestinationPlace(normalizedPlace);
    setPreviewDestinationSchedulePreference(getDefaultDestinationSchedulePreference(normalizedPlace));
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
    placeSearchOrigin,
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
    dynamicColorEnabled,
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
    toggleDynamicColor: () => setDynamicColorEnabled((value) => !value),
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
    requestOnboardingNotificationPermission,
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
