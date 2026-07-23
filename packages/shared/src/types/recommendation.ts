import type { WardrobeItem } from "./wardrobe";
import type { WeatherSnapshot } from "./weather";

export type RecommendationLevel = "none" | "notice" | "recommended" | "required";

export type RecommendationState = {
  level: RecommendationLevel;
  title: string;
  reason: string;
};

export type DestinationAlertCondition = {
  rainThresholdPct: number;
  leadTimeMinutes: number;
  windThresholdMs: number;
};

export type DestinationTransportMode = "auto" | "walk" | "drive" | "transit";

export type OutfitVariant = "default" | "formal" | "rain" | "cold" | "heat";

export type OutfitRecommendation = {
  id: string;
  weatherSnapshotId: string;
  items: {
    outer?: WardrobeItem;
    top: WardrobeItem;
    bottom: WardrobeItem;
    shoes: WardrobeItem;
    accessory?: WardrobeItem;
  };
  matchPct: number;
  decisionText: string;
  timeAdvice: Array<{ time: string; text: string }>;
  reasons: string[];
  variant: OutfitVariant;
  ruleVersion: string;
};

export type DestinationCare = {
  destinationId: string;
  name: string;
  category:
    | "work"
    | "school"
    | "airport"
    | "hotel"
    | "sports"
    | "mountain"
    | "beach"
    | "residential"
    | "transit"
    | "medical"
    | "culture"
    | "religious"
    | "shopping"
    | "leisure"
    | "dining"
    | "custom";
  originWeather: WeatherSnapshot;
  destinationWeather: WeatherSnapshot;
  departureAdvice?: {
    targetArrivalTime?: string;
    recommendedDepartureTime?: string;
    travelMinutes?: number;
    bufferMinutes?: number;
    transportMode?: DestinationTransportMode;
    travelProvider?: "kakao" | "kakao-transit" | "google" | "google-transit" | "fallback";
    travelStatus?: "idle" | "loading" | "ready" | "fallback" | "error";
  };
  umbrellaAdvice: RecommendationState;
  shoesAdvice: RecommendationState;
  careOn: boolean;
  alertCondition?: DestinationAlertCondition;
  nextAlertText?: string;
};

export type NotificationRule = {
  id: string;
  type: "routine" | "rain" | "umbrella" | "shoes" | "destination" | "bedtime" | "heatwave" | "heavy-rain";
  enabled: boolean;
  triggerWindow: "morning" | "before-departure" | "rain-1h" | "rain-3h" | "destination-change" | "bedtime" | "weather-alert";
  requiresAccount: boolean;
  requiresPushPermission: boolean;
  deepLink: "H1" | "H3" | "H4" | "H5" | "H7" | "G2" | "M2";
};

export type NotificationRuleEvaluation = NotificationRule & {
  active: boolean;
  /** 알림함에서 기준을 확인할 수 있는 제목. */
  title: string;
  /** 알림함에서 기준을 확인할 수 있는 상세 문구. */
  reason: string;
  /** 기기 푸시에 노출할 행동 중심 제목. */
  pushTitle: string;
  /** 기기 푸시에 노출할 친화적인 안내 문구. */
  pushBody: string;
  /** 실제 기기 알림을 발송할 절대 시각. 시간 기준이 없는 안내 알림은 예약하지 않음. */
  scheduledAt?: string;
  /** 동일 특보 등급을 한 번만 발송하기 위한 영속 dedupe 키. */
  deliveryKey?: string;
  conditionSummary?: string;
  ruleVersion: string;
};
