// useWeatherOnAppState가 공개하는 타입·기본값 모음.
// 화면들은 기존처럼 useWeatherOnAppState에서 재노출된 타입을 임포트한다.
import type { PlaceSearchResult } from "@weatheron/shared";
import type { DestinationAlertCondition, DestinationTransportMode } from "@weatheron/shared";
import type { OnboardingRouteId, P0RouteId } from "../navigation/routes";
import type { LocalNotificationSyncResult } from "../providers/localNotifications";
import type { TravelEstimateResult } from "../providers/travelEstimateClient";

export type { DestinationAlertCondition, DestinationTransportMode };

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

export const defaultDestinationAlertCondition: DestinationAlertCondition = {
  rainThresholdPct: 50,
  leadTimeMinutes: 60,
  windThresholdMs: 8,
};

export const defaultAlertPreferences: AlertPreferences = {
  rainDetail: true,
  weatherAlerts: true,
  routine: true,
  bedtime: true,
  destination: true,
  quietHours: true,
};

export const defaultNotificationDeliveryStatus: NotificationDeliveryStatus = {
  status: "unavailable",
  scheduledCount: 0,
};

export const appStateStorageKey = "weatheron.appState.v1";
export const notificationStateStorageKey = "weatheron.notificationState.v1";
export const weatherProviderResultStorageKey = "weatheron.weatherProviderResult.v1";
