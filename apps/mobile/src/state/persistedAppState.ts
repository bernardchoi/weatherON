// 앱 상태·알림 상태·날씨 결과의 영속화(읽기/쓰기)와 저장값 정규화.
// 저장소가 손상되거나 구버전 형식이어도 앱이 깨지지 않도록 모든 필드를 타입 가드로 걸러 읽는다.
import { presetWardrobe, type PlaceSearchResult } from "@weatheron/shared";
import { readAppValue, writeAppValue } from "../providers/appStorage";
import type { WeatherProviderResult } from "../providers/weatherProvider";
import { defaultSeoulWeatherLocation, type WeatherLocationPreset } from "../providers/weatherLocations";
import { normalizePlaceSearchResultCategory } from "../utils/destination-visual-resolver";
import {
  createDefaultTravelEstimate,
  compareRepeatDays,
  getDefaultDestinationPlace,
  getDefaultDestinationSchedulePreference,
  getDefaultTravelMinutes,
  isDestinationRepeatDay,
  isValidTimeText,
} from "./appStateHelpers";
import {
  appStateStorageKey,
  defaultAlertPreferences,
  defaultDestinationAlertCondition,
  notificationStateStorageKey,
  weatherProviderResultStorageKey,
  type AdConsentMode,
  type AgeBand,
  type AlertPreferences,
  type DestinationAlertCondition,
  type DestinationSchedulePreference,
  type DestinationTransportMode,
  type DestinationTravelEstimate,
  type DistanceUnit,
  type FitPreference,
  type NotificationHistoryItem,
  type SavedDestination,
  type SmartCareScenario,
  type StyleGender,
  type TemperatureUnit,
  type ThemeMode,
  type WeatherLocationMode,
  type WeightUnit,
} from "./appStateTypes";

export type PersistedAppState = {
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
  dynamicColorEnabled: boolean;
  adConsentMode: AdConsentMode;
  readNotificationIds: string[];
  notificationHistory: NotificationHistoryItem[];
  alertPreferences: AlertPreferences;
};

export type PersistedNotificationState = {
  readNotificationIds: string[];
  notificationHistory: NotificationHistoryItem[];
};

export async function readPersistedAppState(): Promise<PersistedAppState | null> {
  const value = await readAppValue<unknown>(appStateStorageKey);
  return value ? normalizePersistedAppState(value) : null;
}

export function savePersistedAppState(state: PersistedAppState) {
  void writeAppValue(appStateStorageKey, normalizePersistedAppState(state));
}

export async function readPersistedWeatherProviderResult(): Promise<WeatherProviderResult | null> {
  const value = await readAppValue<unknown>(weatherProviderResultStorageKey);
  return value ? normalizePersistedWeatherProviderResult(value) : null;
}

export function savePersistedWeatherProviderResult(result: WeatherProviderResult) {
  if (result.status !== "ready" || result.fallbackUsed) return;
  void writeAppValue(weatherProviderResultStorageKey, result);
}

export async function readPersistedNotificationState(): Promise<PersistedNotificationState> {
  const value = await readAppValue<unknown>(notificationStateStorageKey);
  return normalizeNotificationState(value);
}

export function saveNotificationState(state: PersistedNotificationState) {
  void writeAppValue(notificationStateStorageKey, normalizeNotificationState(state));
}

export function shouldKeepPersistedWeatherResult(result: WeatherProviderResult, persistedResult: WeatherProviderResult | null): persistedResult is WeatherProviderResult {
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

export function normalizePersistedWeatherProviderResult(value: unknown): WeatherProviderResult | null {
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

export function normalizePersistedAppState(value: unknown): PersistedAppState {
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
    dynamicColorEnabled: record.dynamicColorEnabled === true,
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
  if (savedDestinations.length === 0) return normalizePlaceSearchResultCategory(value);
  return savedDestinations.find((destination) => destination.place.id === value.id)?.place ?? fallbackPlace;
}

export function normalizeAlertPreferences(value: unknown): AlertPreferences {
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

export function normalizeDestinationAlertCondition(value: unknown): DestinationAlertCondition {
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
  const place = normalizePlaceSearchResultCategory(record.place);
  return {
    place,
    careEnabled: record.careEnabled,
    alertCondition: normalizeDestinationAlertCondition(record.alertCondition),
    schedulePreference: normalizeDestinationSchedulePreference(record.schedulePreference, place),
    travelEstimate: normalizeDestinationTravelEstimate(record.travelEstimate, defaultSeoulWeatherLocation, place),
    savedAtLabel: typeof record.savedAtLabel === "string" ? record.savedAtLabel : "저장됨",
  };
}

export function normalizeDestinationSchedulePreference(value: unknown, place: PlaceSearchResult): DestinationSchedulePreference {
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

function isDestinationTransportMode(value: unknown): value is DestinationTransportMode {
  return value === "auto" || value === "walk" || value === "drive" || value === "transit";
}

export function normalizeDestinationTravelEstimate(value: unknown, origin: WeatherLocationPreset, place: PlaceSearchResult): DestinationTravelEstimate {
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
    value === "residential" ||
    value === "transit" ||
    value === "medical" ||
    value === "culture" ||
    value === "religious" ||
    value === "shopping" ||
    value === "leisure" ||
    value === "dining" ||
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

export function normalizeNotificationState(value: unknown): PersistedNotificationState {
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
