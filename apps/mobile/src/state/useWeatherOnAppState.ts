import { useCallback, useEffect, useMemo, useState } from "react";
import { placeSearchFixtures, type PlaceSearchResult } from "@weatheron/shared";
import { presetWardrobe, type DestinationAlertCondition, type UserPreferenceProfile, type WardrobeItem } from "@weatheron/shared";
import { buildDemoStateFromWeatherResult } from "../data/demoState";
import type { AppRouteId, OnboardingRouteId, P0RouteId } from "../navigation/routes";
import { initialDeviceLocationState, requestDeviceWeatherLocation, type DeviceLocationState } from "../providers/deviceLocation";
import { fixtureWeatherProvider, getFallbackSnapshots } from "../providers/weatherProvider";
import type { WeatherProviderMode } from "../providers/weatherProvider";
import { defaultSeoulWeatherLocation, seongsuWeatherLocation, type KmaWeatherLocationPreset, type WeatherLocationPreset } from "../providers/weatherLocations";
import { runtimePlaceSearchClient } from "../providers/placeSearchClient";

export type GateReason = "save-outfit" | "destination-care" | "notification";
export type WeatherLocationMode = "auto" | "manual";
export type DestinationHubFilter = "all" | "saved" | "care" | "category";
export type AlertSettingsFocus = "general" | "umbrella" | "rain" | "destination";
export type AccountPendingAction = GateReason;
export type PermissionGateReason = "notification" | "destination-care" | "location";
export type PolicyDocumentType = "privacy" | "terms" | "location" | "open-source";
export type AdConsentMode = "pending" | "personalized" | "non-personalized";
export type TemperatureUnit = "celsius" | "fahrenheit";
export type ThemeMode = "system" | "light" | "dark";
export type StyleGender = "all" | "women" | "men";
export type AgeBand = "10-20" | "20-30" | "30-40" | "40-50" | "50+";
export type FitPreference = "standard" | "relaxed" | "formal" | "outdoor";
export type SmartCareScenario = "commute" | "outing" | "travel";
export type PermissionReturnRouteId = P0RouteId | OnboardingRouteId;

export type AccountGateState = {
  returnTo: P0RouteId;
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
  returnTo: P0RouteId;
  pendingAction: AccountPendingAction;
  message: string;
};

export type PermissionGateState = {
  returnTo: PermissionReturnRouteId;
  reason: PermissionGateReason;
  resumeLabel: string;
  selectedDestinationName?: string;
  alertFocus?: AlertSettingsFocus;
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
  savedAtLabel: string;
};

export type NotificationHistoryItem = {
  id: string;
  notificationId: string;
  title: string;
  action: "read" | "open";
  route?: P0RouteId;
  statusLabel: string;
};

const defaultDestinationAlertCondition: DestinationAlertCondition = {
  rainThresholdPct: 50,
  leadTimeMinutes: 60,
  windThresholdMs: 8,
};

const rainThresholdSteps = [30, 50, 70];
const leadTimeSteps = [30, 60, 120];
const windThresholdSteps = [5, 8, 11];
const notificationStateStorageKey = "weatheron.notificationState.v1";

export function useWeatherOnAppState() {
  const [route, setRoute] = useState<AppRouteId>("H1");
  const [useDestinationWeather, setUseDestinationWeather] = useState(false);
  const [umbrellaReviewed, setUmbrellaReviewed] = useState(false);
  const [smartCareEnabled, setSmartCareEnabled] = useState(true);
  const [weatherProviderMode, setWeatherProviderMode] = useState<WeatherProviderMode>("ready");
  const [weatherLocationMode, setWeatherLocationMode] = useState<WeatherLocationMode>("auto");
  const [deviceLocationState, setDeviceLocationState] = useState<DeviceLocationState>(initialDeviceLocationState);
  const [deviceWeatherLocation, setDeviceWeatherLocation] = useState<KmaWeatherLocationPreset | null>(null);
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [recentlyRemovedDestination, setRecentlyRemovedDestination] = useState<SavedDestination | null>(null);
  const [previewDestinationCareEnabled, setPreviewDestinationCareEnabled] = useState(true);
  const [previewDestinationAlertCondition, setPreviewDestinationAlertCondition] = useState<DestinationAlertCondition>(defaultDestinationAlertCondition);
  const [selectedDestinationPlace, setSelectedDestinationPlace] = useState<PlaceSearchResult>(placeSearchFixtures[0]);
  const [destinationHubFilter, setDestinationHubFilterState] = useState<DestinationHubFilter>("all");
  const [placeSearchQuery, setPlaceSearchQuery] = useState("강릉");
  const [placeSearchResults, setPlaceSearchResults] = useState<PlaceSearchResult[]>(placeSearchFixtures.slice(0, 3));
  const [isPlaceSearchLoading, setIsPlaceSearchLoading] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => loadNotificationState().readNotificationIds);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryItem[]>(() => loadNotificationState().notificationHistory);
  const [alertSettingsRouteState, setAlertSettingsRouteState] = useState<AlertSettingsRouteState | null>(null);
  const [selectedPolicyDocument, setSelectedPolicyDocument] = useState<PolicyDocumentType>("privacy");
  const [adConsentMode, setAdConsentMode] = useState<AdConsentMode>("pending");
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("celsius");
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
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
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
  const selectedSavedDestination = useMemo(
    () => savedDestinations.find((destination) => destination.place.id === selectedDestinationPlace.id),
    [savedDestinations, selectedDestinationPlace.id],
  );
  const destinationSaved = Boolean(selectedSavedDestination);
  const destinationCareEnabled = selectedSavedDestination?.careEnabled ?? previewDestinationCareEnabled;
  const selectedDestinationAlertCondition = selectedSavedDestination?.alertCondition ?? previewDestinationAlertCondition;
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

  const state = useMemo(
    () =>
      buildDemoStateFromWeatherResult(weatherProviderResult, useDestinationWeather, {
        destinationCareEnabled,
        wardrobe,
        preferenceProfile: userPreferenceProfile,
        destination: {
          id: selectedDestinationPlace.id,
          name: selectedDestinationPlace.name,
          category: selectedDestinationPlace.category,
          countryCode: selectedDestinationPlace.countryCode,
        },
        destinationAlertCondition: selectedDestinationAlertCondition,
        savedDestinations,
      }),
    [
      destinationCareEnabled,
      savedDestinations,
      selectedDestinationAlertCondition,
      selectedDestinationPlace,
      useDestinationWeather,
      userPreferenceProfile,
      wardrobe,
      weatherProviderResult,
    ],
  );

  useEffect(() => {
    let active = true;
    setIsWeatherLoading(true);
    const currentLocation =
      weatherLocationMode === "manual" ? defaultSeoulWeatherLocation : deviceWeatherLocation ?? seongsuWeatherLocation;
    const destinationLocation = {
      locationId: selectedDestinationPlace.id,
      locationName: selectedDestinationPlace.name,
      countryCode: selectedDestinationPlace.countryCode,
      coordinate: selectedDestinationPlace.coordinate,
      timezone: selectedDestinationPlace.timezone,
    };
    const savedDestinationLocations = savedDestinations.map((destination) => createWeatherLocationFromPlace(destination.place));
    fixtureWeatherProvider
      .getSnapshots(weatherProviderMode, { currentLocation, destinationLocation, destinationLocations: savedDestinationLocations })
      .then((result) => {
        if (active) setWeatherProviderResult(result);
      })
      .finally(() => {
        if (active) setIsWeatherLoading(false);
      });

    return () => {
      active = false;
    };
  }, [weatherProviderMode, weatherRefreshTick, weatherLocationMode, deviceWeatherLocation, savedDestinations, selectedDestinationPlace]);

  useEffect(() => {
    saveNotificationState({ readNotificationIds, notificationHistory });
  }, [notificationHistory, readNotificationIds]);

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

  const requestCurrentLocation = useCallback(async () => {
    if (!locationReady) {
      setPermissionGate(createPermissionGateState("location", "H1"));
      setRoute("O3");
      return;
    }
    setWeatherLocationMode("auto");
    setWeatherProviderMode("ready");
    setUseDestinationWeather(false);
    setDeviceLocationState({ status: "requesting", message: "위치 확인 중" });
    const result = await requestDeviceWeatherLocation();
    setDeviceLocationState(result);
    if (result.location) setDeviceWeatherLocation(result.location);
    setWeatherRefreshTick((value) => value + 1);
  }, [locationReady]);

  const navigate = useCallback((nextRoute: AppRouteId) => {
    setAlertSettingsRouteState(null);
    setRoute(nextRoute);
  }, []);

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
      }),
    );
  }, [state.notifications]);

  const clearNotificationHistory = useCallback(() => {
    setNotificationHistory([]);
  }, []);

  const editDestinationAlertCondition = useCallback((placeId: string) => {
    const matchedDestination = savedDestinations.find((destination) => destination.place.id === placeId);
    if (matchedDestination) {
      setSelectedDestinationPlace(matchedDestination.place);
      setPreviewDestinationCareEnabled(matchedDestination.careEnabled);
      setPreviewDestinationAlertCondition(matchedDestination.alertCondition);
      setDestinationHubFilterState("all");
      setUseDestinationWeather(false);
      setWeatherProviderMode("ready");
      setWeatherRefreshTick((value) => value + 1);
    }
    setRoute("G2");
  }, [savedDestinations]);

  const editNotificationCondition = useCallback((id: string, route: P0RouteId) => {
    const destinationPlaceId = getNotificationDestinationPlaceId(id);
    if (destinationPlaceId) {
      editDestinationAlertCondition(destinationPlaceId);
      return;
    }
    setRoute(route === "H1" ? "M2" : route);
  }, [editDestinationAlertCondition]);

  const openNotificationDeepLink = useCallback((id: string, route: P0RouteId) => {
    setReadNotificationIds((current) => (current.includes(id) ? current : [...current, id]));
    const notification = state.notifications.find((item) => item.id === id);
    setNotificationHistory((current) =>
      addNotificationHistoryItem(current, {
        id: createNotificationHistoryId(id, "open"),
        notificationId: id,
        title: notification?.title ?? "알림",
        action: "open",
        route,
        statusLabel: `${route} 이동`,
      }),
    );
    const destinationPlaceId = getNotificationDestinationPlaceId(id);
    if (destinationPlaceId && route === "G2") {
      const matchedDestination = savedDestinations.find((destination) => destination.place.id === destinationPlaceId);
      if (matchedDestination) {
        setSelectedDestinationPlace(matchedDestination.place);
        setPreviewDestinationCareEnabled(matchedDestination.careEnabled);
        setPreviewDestinationAlertCondition(matchedDestination.alertCondition);
        setDestinationHubFilterState("all");
        setUseDestinationWeather(false);
        setWeatherProviderMode("ready");
        setWeatherRefreshTick((value) => value + 1);
      }
    }
    setRoute(route);
  }, [savedDestinations, state.notifications]);

  const searchPlaces = useCallback(async (query: string) => {
    setPlaceSearchQuery(query);
    setIsPlaceSearchLoading(true);
    try {
      const results = await runtimePlaceSearchClient.searchPlaces({ query });
      setPlaceSearchResults(results.length ? results : placeSearchFixtures.slice(0, 3));
    } catch {
      setPlaceSearchResults(placeSearchFixtures.slice(0, 3));
    } finally {
      setIsPlaceSearchLoading(false);
    }
  }, []);

  const selectDestinationPlace = useCallback((place: PlaceSearchResult) => {
    setSelectedDestinationPlace(place);
    setPreviewDestinationCareEnabled(true);
    setDestinationHubFilterState("all");
    setUseDestinationWeather(false);
    setWeatherProviderMode("ready");
    setWeatherRefreshTick((value) => value + 1);
  }, []);

  const saveSelectedDestination = useCallback((careEnabled = true) => {
    setSavedDestinations((current) => {
      const nextDestination: SavedDestination = {
        place: selectedDestinationPlace,
        careEnabled,
        alertCondition: selectedSavedDestination?.alertCondition ?? previewDestinationAlertCondition,
        savedAtLabel: current.some((destination) => destination.place.id === selectedDestinationPlace.id) ? "업데이트됨" : "방금 저장",
      };
      const exists = current.some((destination) => destination.place.id === selectedDestinationPlace.id);
      return exists
        ? current.map((destination) => (destination.place.id === selectedDestinationPlace.id ? nextDestination : destination))
        : [nextDestination, ...current];
    });
  }, [previewDestinationAlertCondition, selectedDestinationPlace, selectedSavedDestination?.alertCondition]);

  const saveDestination = useCallback((returnTo: P0RouteId = "G1") => {
    if (accountLinked && termsRequiredAccepted) {
      if (!permissionReady) {
        setPermissionGate(createPermissionGateState("destination-care", returnTo, selectedDestinationPlace.name, "destination"));
        setRoute("O3");
        return;
      }
      saveSelectedDestination(true);
      setPreviewDestinationCareEnabled(true);
      setAccountGateResult(createAccountGateResult("destination-care", returnTo));
      setRoute(returnTo);
      return;
    }
    setGate(createAccountGateState("destination-care", returnTo, selectedDestinationPlace.name));
    setRoute("A2");
  }, [accountLinked, permissionReady, saveSelectedDestination, selectedDestinationPlace.name, termsRequiredAccepted]);

  const toggleDestinationCare = useCallback(() => {
    if (!accountLinked || !termsRequiredAccepted) {
      setGate(createAccountGateState("destination-care", "G2", selectedDestinationPlace.name));
      setRoute("A2");
      return;
    }
    if (!permissionReady) {
      setPermissionGate(createPermissionGateState("destination-care", "G2", selectedDestinationPlace.name, "destination"));
      setRoute("O3");
      return;
    }
    const nextCareEnabled = !destinationCareEnabled;
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
  }, [accountLinked, destinationCareEnabled, destinationSaved, permissionReady, saveSelectedDestination, selectedDestinationPlace.id, selectedDestinationPlace.name, termsRequiredAccepted]);

  const toggleSavedDestinationCare = useCallback((placeId: string) => {
    if (!accountLinked || !termsRequiredAccepted) {
      setGate(createAccountGateState("destination-care", "G1"));
      setRoute("A2");
      return;
    }
    if (!permissionReady) {
      const matchedDestination = savedDestinations.find((destination) => destination.place.id === placeId);
      setPermissionGate(createPermissionGateState("destination-care", "G1", matchedDestination?.place.name, "destination"));
      setRoute("O3");
      return;
    }
    setSavedDestinations((current) =>
      current.map((destination) =>
        destination.place.id === placeId ? { ...destination, careEnabled: !destination.careEnabled, savedAtLabel: "업데이트됨" } : destination,
      ),
    );
  }, [accountLinked, permissionReady, savedDestinations, termsRequiredAccepted]);

  const cycleSelectedDestinationAlertCondition = useCallback((field: keyof DestinationAlertCondition) => {
    const steps = getDestinationAlertConditionSteps(field);
    const currentValue = selectedDestinationAlertCondition[field];
    const currentIndex = steps.indexOf(currentValue);
    const nextValue = steps[(currentIndex + 1) % steps.length];
    const nextCondition = { ...selectedDestinationAlertCondition, [field]: nextValue };
    if (destinationSaved) {
      setSavedDestinations((current) =>
        current.map((destination) =>
          destination.place.id === selectedDestinationPlace.id ? { ...destination, alertCondition: nextCondition, savedAtLabel: "업데이트됨" } : destination,
        ),
      );
    } else {
      setPreviewDestinationAlertCondition(nextCondition);
    }
  }, [destinationSaved, selectedDestinationAlertCondition, selectedDestinationPlace.id]);

  const removeSavedDestination = useCallback((placeId: string) => {
    const removedDestination = savedDestinations.find((destination) => destination.place.id === placeId);
    if (!removedDestination) return;
    const nextDestinations = savedDestinations.filter((destination) => destination.place.id !== placeId);
    setSavedDestinations(nextDestinations);
    setRecentlyRemovedDestination({ ...removedDestination, savedAtLabel: "방금 삭제" });
    if (selectedDestinationPlace.id === placeId) {
      const nextSelectedPlace = nextDestinations[0]?.place ?? removedDestination.place;
      setSelectedDestinationPlace(nextSelectedPlace);
      setPreviewDestinationCareEnabled(nextDestinations[0]?.careEnabled ?? true);
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
      setWeatherProviderMode("ready");
      setWeatherRefreshTick((value) => value + 1);
    }
  }, [savedDestinations, selectedDestinationPlace.category, selectedDestinationPlace.id]);

  const requestAccountGate = (reason: GateReason, returnTo: P0RouteId) => {
    if (accountLinked && termsRequiredAccepted) {
      if (reason === "save-outfit") setOutfitSaved(true);
      if (reason === "destination-care") {
        if (!permissionReady) {
          setPermissionGate(createPermissionGateState("destination-care", returnTo, selectedDestinationPlace.name, "destination"));
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
    setGate(createAccountGateState(reason, returnTo, selectedDestinationPlace.name, state.outfit.variant));
    setRoute("A2");
  };

  const completeAccountLink = () => {
    setAccountLinked(true);
    setRoute("A3");
  };

  const completeTerms = () => {
    setTermsRequiredAccepted(true);
    if (gate?.reason === "save-outfit") setOutfitSaved(true);
    if (gate?.reason === "destination-care") {
      if (!permissionReady) {
        setPermissionGate(createPermissionGateState("destination-care", gate.returnTo, selectedDestinationPlace.name, "destination"));
        setRoute("O3");
        setGate(null);
        return;
      }
      saveSelectedDestination(true);
      setPreviewDestinationCareEnabled(true);
    }
    if (gate) setAccountGateResult(createAccountGateResult(gate.reason, gate.returnTo));
    setRoute(gate?.returnTo ?? "H1");
    setGate(null);
  };

  const completePermissionGate = () => {
    if (permissionGate?.reason === "location") {
      setLocationReady(true);
      setWeatherLocationMode("auto");
      setDeviceLocationState({ status: "granted", message: "위치 권한 허용됨", location: seongsuWeatherLocation });
      setDeviceWeatherLocation(seongsuWeatherLocation);
      setWeatherProviderMode("ready");
      setUseDestinationWeather(false);
      setWeatherRefreshTick((value) => value + 1);
    } else {
      setPermissionReady(true);
    }
    if (permissionGate?.reason === "destination-care") {
      saveSelectedDestination(true);
      setPreviewDestinationCareEnabled(true);
    }
    if (permissionGate) setPermissionGateResult(createPermissionGateResult(permissionGate.reason, permissionGate.returnTo));
    if (permissionGate?.returnTo === "M2") setAlertSettingsRouteState(null);
    setRoute(permissionGate?.returnTo ?? "H1");
    setPermissionGate(null);
  };

  const skipPermissionGate = () => {
    if (permissionGate) setPermissionGateResult(createPermissionGateSkipResult(permissionGate.reason, permissionGate.returnTo));
    if (permissionGate?.reason === "location") {
      setLocationReady(false);
      setDeviceLocationState({ status: "denied", message: "위치 권한 나중에 설정", location: seongsuWeatherLocation });
      setWeatherLocationMode("manual");
    }
    setRoute(permissionGate?.returnTo ?? "H1");
    setPermissionGate(null);
  };

  const cancelAccountGate = () => {
    setRoute(gate?.returnTo ?? "H1");
    setGate(null);
  };

  return {
    route,
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
    selectedDestinationPlace,
    destinationHubFilter,
    placeSearchQuery,
    placeSearchResults,
    isPlaceSearchLoading,
    readNotificationIds,
    notificationHistory,
    alertSettingsRouteState,
    selectedPolicyDocument,
    adConsentMode,
    temperatureUnit,
    themeMode,
    reducedTransparency,
    styleProfileSaved,
    styleGender,
    ageBand,
    fitPreference,
    selectedStyles,
    wardrobe,
    selectedWardrobeItemId,
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
    openAlertSettings,
    returnFromAlertSettings,
    openPolicyDocument,
    returnFromPolicyDocument,
    setAdConsentMode,
    setTemperatureUnit,
    setThemeMode,
    toggleReducedTransparency: () => setReducedTransparency((value) => !value),
    setStyleGender,
    setAgeBand,
    setFitPreference,
    toggleStyleTag,
    setWardrobeItemOwned,
    openWardrobeItem,
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
    saveDestination,
    toggleDestinationCare,
    toggleSavedDestinationCare,
    cycleSelectedDestinationAlertCondition,
    removeSavedDestination,
    restoreRemovedDestination,
    setDestinationHubFilter,
    searchPlaces,
    selectDestinationPlace,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotificationHistory,
    editDestinationAlertCondition,
    editNotificationCondition,
    openNotificationDeepLink,
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

function getDestinationAlertConditionSteps(field: keyof DestinationAlertCondition): number[] {
  if (field === "rainThresholdPct") return rainThresholdSteps;
  if (field === "leadTimeMinutes") return leadTimeSteps;
  return windThresholdSteps;
}

function createWeatherLocationFromPlace(place: PlaceSearchResult): WeatherLocationPreset {
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
  returnTo: P0RouteId,
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

function createAccountGateResult(reason: GateReason, returnTo: P0RouteId): AccountGateResultState {
  return {
    returnTo,
    pendingAction: reason,
    message: `${getAccountResumeLabel(reason)} 완료`,
  };
}

function getAccountResumeLabel(reason: GateReason): string {
  if (reason === "save-outfit") return "코디 저장";
  if (reason === "destination-care") return "목적지 케어 저장";
  return "알림 확장";
}

function createPermissionGateState(
  reason: PermissionGateReason,
  returnTo: PermissionReturnRouteId,
  selectedDestinationName?: string,
  alertFocus?: AlertSettingsFocus,
): PermissionGateState {
  return {
    reason,
    returnTo,
    resumeLabel: getPermissionResumeLabel(reason),
    selectedDestinationName: reason === "destination-care" ? selectedDestinationName : undefined,
    alertFocus,
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
  if (reason === "location") return "현재 위치 사용";
  if (reason === "destination-care") return "목적지 케어 알림";
  return "알림 권한";
}

function createNotificationHistoryId(notificationId: string, action: NotificationHistoryItem["action"]): string {
  return `${notificationId}:${action}`;
}

function addNotificationHistoryItem(items: NotificationHistoryItem[], nextItem: NotificationHistoryItem): NotificationHistoryItem[] {
  const withoutDuplicate = items.filter((item) => item.id !== nextItem.id);
  return [nextItem, ...withoutDuplicate].slice(0, 6);
}

type PersistedNotificationState = {
  readNotificationIds: string[];
  notificationHistory: NotificationHistoryItem[];
};

function loadNotificationState(): PersistedNotificationState {
  const storage = getLocalStorage();
  if (!storage) return emptyPersistedNotificationState();
  try {
    return normalizeNotificationState(JSON.parse(storage.getItem(notificationStateStorageKey) ?? "{}"));
  } catch {
    return emptyPersistedNotificationState();
  }
}

function saveNotificationState(state: PersistedNotificationState) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(notificationStateStorageKey, JSON.stringify(normalizeNotificationState(state)));
  } catch {
    // Local persistence is best-effort; app state should keep working without it.
  }
}

function normalizeNotificationState(value: unknown): PersistedNotificationState {
  if (!value || typeof value !== "object") return emptyPersistedNotificationState();
  const record = value as Partial<PersistedNotificationState>;
  return {
    readNotificationIds: Array.isArray(record.readNotificationIds)
      ? record.readNotificationIds.filter((id): id is string => typeof id === "string").slice(0, 40)
      : [],
    notificationHistory: Array.isArray(record.notificationHistory)
      ? record.notificationHistory.filter(isNotificationHistoryItem).slice(0, 6)
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
    (record.action === "read" || record.action === "open") &&
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

function getLocalStorage(): Storage | null {
  try {
    return typeof globalThis.localStorage === "undefined" ? null : globalThis.localStorage;
  } catch {
    return null;
  }
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
