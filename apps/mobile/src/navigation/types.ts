import type { DemoState } from "../data/demoState";
import type { AppRouteId, P0RouteId } from "./routes";
import type { PlaceSearchResult } from "@weatheron/shared";
import type { WardrobeItem } from "@weatheron/shared";
import type {
  DestinationAlertCondition,
  AlertSettingsRouteState,
  AlertSettingsFocus,
  AlertPreferenceKey,
  AlertPreferences,
  AccountGateResultState,
  PermissionGateResultState,
  PermissionGateReason,
  PolicyDocumentType,
  AdConsentMode,
  TemperatureUnit,
  DistanceUnit,
  ThemeMode,
  StyleGender,
  AgeBand,
  FitPreference,
  SmartCareScenario,
  PermissionReturnRouteId,
  AccountGateReturnRouteId,
  DestinationHubFilter,
  DestinationSchedulePreference,
  DestinationTransportMode,
  DestinationTravelEstimate,
  PlaceSearchStatus,
  GateReason,
  NotificationDeliveryStatus,
  NotificationHistoryItem,
  SavedDestination,
  WeatherLocationMode,
} from "../state/useWeatherOnAppState";
import type { DeviceLocationState } from "../providers/deviceLocation";
import type { WeatherProviderMode } from "../providers/weatherProvider";

export type P0ScreenProps = {
  state: DemoState;
  useDestinationWeather: boolean;
  umbrellaReviewed: boolean;
  smartCareEnabled: boolean;
  weatherProviderMode: WeatherProviderMode;
  weatherLocationMode: WeatherLocationMode;
  deviceLocationState: DeviceLocationState;
  destinationSaved: boolean;
  savedDestinations: SavedDestination[];
  recentlyRemovedDestination: SavedDestination | null;
  destinationCareEnabled: boolean;
  selectedDestinationAlertCondition: DestinationAlertCondition;
  selectedDestinationSchedulePreference: DestinationSchedulePreference;
  selectedDestinationTravelEstimate: DestinationTravelEstimate;
  selectedDestinationPlace: PlaceSearchResult;
  destinationSelectionReady: boolean;
  destinationHubFilter: DestinationHubFilter;
  placeSearchQuery: string;
  placeSearchResults: PlaceSearchResult[];
  isPlaceSearchLoading: boolean;
  placeSearchStatus: PlaceSearchStatus;
  readNotificationIds: string[];
  notificationHistory: NotificationHistoryItem[];
  alertPreferences: AlertPreferences;
  notificationDeliveryStatus: NotificationDeliveryStatus;
  alertSettingsRouteState: AlertSettingsRouteState | null;
  selectedPolicyDocument: PolicyDocumentType;
  adConsentMode: AdConsentMode;
  temperatureUnit: TemperatureUnit;
  distanceUnit: DistanceUnit;
  themeMode: ThemeMode;
  reducedTransparency: boolean;
  styleProfileSaved: boolean;
  styleGender: StyleGender;
  ageBand: AgeBand;
  fitPreference: FitPreference;
  selectedStyles: string[];
  smartCareScenario: SmartCareScenario;
  wardrobeItems: WardrobeItem[];
  selectedWardrobeItemId: string;
  onboardingCompleted: boolean;
  isWeatherLoading: boolean;
  accountLinked: boolean;
  termsRequiredAccepted: boolean;
  locationReady: boolean;
  permissionReady: boolean;
  outfitSaved: boolean;
  accountGateResult: AccountGateResultState | null;
  permissionGateResult: PermissionGateResultState | null;
  onNavigate: (route: AppRouteId) => void;
  onGoBack: () => boolean;
  onOpenAlertSettings: (returnTo: P0RouteId, focus?: AlertSettingsFocus) => void;
  onReturnFromAlertSettings: () => void;
  onOpenPolicyDocument: (type: PolicyDocumentType) => void;
  onReturnFromPolicyDocument: () => void;
  onSetAdConsentMode: (mode: AdConsentMode) => void;
  onSetTemperatureUnit: (unit: TemperatureUnit) => void;
  onSetDistanceUnit: (unit: DistanceUnit) => void;
  onSetThemeMode: (mode: ThemeMode) => void;
  onToggleReducedTransparency: () => void;
  onSetStyleGender: (gender: StyleGender) => void;
  onSetAgeBand: (ageBand: AgeBand) => void;
  onSetFitPreference: (fit: FitPreference) => void;
  onToggleStyleTag: (tag: string) => void;
  onSetWardrobeItemOwned: (itemId: string, owned: boolean) => void;
  onOpenWardrobeItem: (itemId: string) => void;
  onSaveStyleProfile: (returnTo?: PermissionReturnRouteId) => void;
  onSetSmartCareScenario: (scenario: SmartCareScenario) => void;
  onCompleteSmartCareOnboarding: () => void;
  onCompleteOnboarding: (routeTo?: P0RouteId) => void;
  onToggleWeather: () => void;
  onReviewUmbrella: () => void;
  onToggleSmartCare: () => void;
  onSetWeatherProviderMode: (mode: WeatherProviderMode) => void;
  onSetWeatherLocationMode: (mode: WeatherLocationMode) => void;
  onRequestCurrentLocation: () => void;
  onSelectWeatherLocation: (place: PlaceSearchResult) => void;
  onSaveDestination: (returnTo?: P0RouteId) => void;
  onReturnFromDestinationAdd: () => void;
  onToggleDestinationCare: () => void;
  onToggleSavedDestinationCare: (placeId: string) => void;
  onCycleDestinationAlertCondition: (field: keyof DestinationAlertCondition) => void;
  onSetDestinationTargetArrivalTime: (targetArrivalTime: string) => void;
  onSetDestinationTransportMode: (transportMode: DestinationTransportMode) => void;
  onRemoveSavedDestination: (placeId: string) => void;
  onRestoreRemovedDestination: () => void;
  onSetDestinationHubFilter: (filter: DestinationHubFilter) => void;
  onSearchPlaces: (query: string) => void;
  onSelectDestinationPlace: (place: PlaceSearchResult) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onClearNotificationHistory: () => void;
  onToggleAlertPreference: (key: AlertPreferenceKey) => void;
  onEditDestinationAlertCondition: (placeId: string) => void;
  onEditNotificationCondition: (id: string, route: P0RouteId) => void;
  onOpenNotificationDeepLink: (id: string, route: P0RouteId) => void;
  onSendTestNotification: () => void;
  onRefreshWeather: () => void;
  onRequireAccount: (reason: GateReason, returnTo: AccountGateReturnRouteId) => void;
  onRequestPermissionGate: (reason: PermissionGateReason, returnTo: PermissionReturnRouteId, alertFocus?: AlertSettingsFocus) => void;
  onSignOutAccount: () => void;
};
