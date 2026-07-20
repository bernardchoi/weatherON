// useWeatherOnAppState에서 사용하는 순수 헬퍼 모음. React 상태에 의존하지 않는다.
import { placeSearchFixtures, type PlaceSearchResult } from "@weatheron/shared";
import type { NotificationRuleEvaluation } from "@weatheron/shared";
import { isLaunchHiddenRoute, isP0Route, type AppRouteId, type P0RouteId } from "../navigation/routes";
import { getRouteLabel } from "../navigation/routeLabels";
import {
  createKmaWeatherLocationFromCoordinate,
  seongsuWeatherLocation,
  type KmaWeatherLocationPreset,
  type WeatherLocationPreset,
} from "../providers/weatherLocations";
import { getMinutesUntilTimeInZone } from "../utils/zonedDateTime";
import type {
  AccountGateResultState,
  AccountGateReturnRouteId,
  AccountPendingAction,
  AlertPreferences,
  AlertSettingsFocus,
  DestinationHubFilter,
  DestinationRepeatDay,
  DestinationSchedulePreference,
  DestinationTravelEstimate,
  GateReason,
  NotificationDeliveryStatus,
  NotificationHistoryItem,
  PermissionGateReason,
  PermissionGateResultState,
  PermissionGateState,
  PermissionReturnRouteId,
  AccountGateState,
  WeatherLocationMode,
} from "./appStateTypes";
import type { TravelEstimateResult } from "../providers/travelEstimateClient";

export function getBackRoute(route: AppRouteId): AppRouteId {
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

export function getAccountResultReturnRoute(route: PermissionReturnRouteId): AccountGateReturnRouteId {
  return isP0Route(route) ? route : "H1";
}

export function getP0RouteFromNotificationPayload(value?: string): P0RouteId | null {
  if (!value) return null;
  const route = value as AppRouteId;
  if (!isP0Route(route)) return null;
  return isLaunchHiddenRoute(route) ? "H1" : route;
}

export function shouldScheduleLocalNotification(notification: NotificationRuleEvaluation, preferences: AlertPreferences): boolean {
  if (!notification.active || !notification.requiresPushPermission) return false;
  if (notification.type === "rain") return preferences.rainDetail;
  if (notification.type === "heatwave" || notification.type === "heavy-rain") return preferences.weatherAlerts;
  if (notification.type === "destination") return preferences.destination;
  if (notification.type === "bedtime") return preferences.bedtime;
  if (notification.type === "routine") return preferences.routine;
  return preferences.routine;
}

export function getLocalNotificationResultLabel(result: NotificationDeliveryStatus): string {
  if (result.status === "scheduled" && result.scheduledCount > 0) return "알림 예약 완료";
  if (result.status === "scheduled") return "예약 대기 없음";
  if (result.status === "verification-failed") return "예약 확인 실패";
  if (result.status === "permission-required") return "권한 필요";
  if (result.status === "cancelled") return "알림 예약 해제";
  return "기기 알림 미지원";
}

export function getNotificationHistoryTitle(notificationId: string, fallbackTitle?: string): string {
  if (notificationId === "local-test") return "WeatherON 알림";
  return fallbackTitle ?? "알림";
}

export function getNotificationOpenResultLabel(notificationId: string, route: P0RouteId): string {
  if (notificationId === "local-test" && route === "M2") return "스마트 알림 설정 이동";
  return `${getRouteLabel(route)} 이동`;
}

export function getTestNotificationTitle(route: P0RouteId): string {
  if (route === "H3") return "새 알림이 도착했어요";
  if (route === "H5") return "우산 챙길 시간이에요";
  if (route === "H7") return "내일 아침을 가볍게 준비해요";
  if (route === "G2") return "목적지 가는 길, 미리 살펴봐요";
  return "WeatherON이 필요한 순간 알려드릴게요";
}

export function getTestNotificationBody(route: P0RouteId): string {
  if (route === "H3") return "오늘 필요한 날씨 정보를 확인해봐요";
  if (route === "H5") return "곧 비가 올 수 있어요. 이동 전 확인해요";
  if (route === "H7") return "내일 날씨와 코디를 미리 확인해봐요";
  if (route === "G2") return "가는 길 날씨를 확인하고 편하게 준비해요";
  return "나에게 맞는 날씨 알림을 확인해봐요";
}

export function getAlertSettingsFocusFromRoute(route: P0RouteId): AlertSettingsFocus {
  if (route === "H4") return "umbrella";
  if (route === "H5") return "rain";
  if (route === "G2" || route === "G1") return "destination";
  return "general";
}

export function createWeatherLocationFromPlace(place: PlaceSearchResult): WeatherLocationPreset {
  if (place.countryCode === "KR") return createKmaWeatherLocationFromCoordinate(place.coordinate, place.name, place.id);
  return {
    locationId: place.id,
    locationName: place.name,
    countryCode: place.countryCode,
    coordinate: place.coordinate,
    timezone: place.timezone,
  };
}

export function getNotificationDestinationPlaceId(notificationId: string): string | null {
  const prefix = "destination-change:";
  return notificationId.startsWith(prefix) ? notificationId.slice(prefix.length) : null;
}

export function createAccountGateState(
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

export function createAccountGateResult(reason: GateReason, returnTo: AccountGateReturnRouteId): AccountGateResultState {
  return {
    returnTo,
    pendingAction: reason,
    message: `${getAccountResumeLabel(reason)} 완료`,
  };
}

export function getAccountResumeLabel(reason: GateReason): string {
  if (reason === "account-connect") return "계정 연결";
  if (reason === "save-outfit") return "코디 저장";
  if (reason === "destination-care") return "목적지 케어 저장";
  if (reason === "social-note") return "ON Square 체크인";
  if (reason === "weather-report") return "날씨 제보 저장";
  return "알림 확장";
}

export function createPermissionGateState(
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

export function createPermissionGateResult(reason: PermissionGateReason, returnTo: PermissionReturnRouteId): PermissionGateResultState {
  return {
    reason,
    returnTo,
    message: `${getPermissionResumeLabel(reason)} 허용 완료`,
  };
}

export function createPermissionGateSkipResult(reason: PermissionGateReason, returnTo: PermissionReturnRouteId): PermissionGateResultState {
  return {
    reason,
    returnTo,
    message: `${getPermissionResumeLabel(reason)} 나중에 설정`,
  };
}

export function getPermissionResumeLabel(reason: PermissionGateReason): string {
  if (reason === "account-setup") return "알림 권한";
  if (reason === "location") return "현재 위치 사용";
  if (reason === "destination-care") return "목적지 케어 알림";
  return "알림 권한";
}

export function createNotificationHistoryId(notificationId: string, action: NotificationHistoryItem["action"], route?: P0RouteId): string {
  return `${notificationId}:${route ?? "none"}:${action}`;
}

export function addNotificationHistoryItem(items: NotificationHistoryItem[], nextItem: NotificationHistoryItem): NotificationHistoryItem[] {
  const withoutDuplicate = items.filter((item) => item.id !== nextItem.id);
  return [nextItem, ...withoutDuplicate].slice(0, 24);
}

export function getDefaultDestinationPlace(): PlaceSearchResult {
  return placeSearchFixtures[1] ?? placeSearchFixtures[0];
}

export function getDefaultDestinationSchedulePreference(place: PlaceSearchResult): DestinationSchedulePreference {
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

export function getDefaultTravelMinutes(place: PlaceSearchResult): number {
  const normalizedName = place.name.toLowerCase();
  if (place.category === "beach" || normalizedName.includes("강릉")) return 180;
  if (place.category === "sports" || normalizedName.includes("잠실")) return 45;
  if (place.countryCode === "JP") return 150;
  return 35;
}

export function createDefaultTravelEstimate(
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

export function createDestinationTravelEstimate(originPlaceId: string, destinationPlaceId: string, result: TravelEstimateResult): DestinationTravelEstimate {
  return {
    ...result,
    originPlaceId,
    destinationPlaceId,
  };
}

export function getAutoBufferMinutes(targetArrivalTime: string, travelMinutes: number, nowMs: number, timeZone: string): number {
  if (!isValidTimeText(targetArrivalTime)) return 10;
  const arrivalOffset = getMinutesUntilTimeInZone(targetArrivalTime, nowMs, timeZone);
  const freeWindow = arrivalOffset - travelMinutes;
  if (freeWindow <= 30) return 0;
  if (freeWindow <= 90) return 5;
  if (freeWindow <= 180) return 10;
  if (freeWindow <= 360) return 15;
  return 20;
}

export function isValidTimeText(value: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(value)) return false;
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function getActiveWeatherLocation(
  mode: WeatherLocationMode,
  manualLocation: WeatherLocationPreset,
  deviceLocation: KmaWeatherLocationPreset | null,
): WeatherLocationPreset {
  return mode === "manual" ? manualLocation : deviceLocation ?? seongsuWeatherLocation;
}

export const repeatDayOrder: DestinationRepeatDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function compareRepeatDays(a: DestinationRepeatDay, b: DestinationRepeatDay) {
  return repeatDayOrder.indexOf(a) - repeatDayOrder.indexOf(b);
}

export function getTodayRepeatDay(): DestinationRepeatDay {
  const day = new Date().getDay();
  if (day === 0) return "sun";
  return repeatDayOrder[day - 1] ?? "mon";
}

export function isDestinationRepeatDay(value: unknown): value is DestinationRepeatDay {
  return value === "mon" || value === "tue" || value === "wed" || value === "thu" || value === "fri" || value === "sat" || value === "sun";
}

export function getDestinationFilterMatched(
  filter: DestinationHubFilter,
  careEnabled: boolean,
  category: PlaceSearchResult["category"],
  selectedCategory: PlaceSearchResult["category"],
): boolean {
  if (filter === "care") return careEnabled;
  if (filter === "category") return category === selectedCategory;
  return true;
}
