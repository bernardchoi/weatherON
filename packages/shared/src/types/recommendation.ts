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
  category: "work" | "school" | "airport" | "hotel" | "sports" | "mountain" | "beach" | "custom";
  originWeather: WeatherSnapshot;
  destinationWeather: WeatherSnapshot;
  departureAdvice?: {
    targetArrivalTime?: string;
    recommendedDepartureTime?: string;
    travelMinutes?: number;
    bufferMinutes?: number;
    transportMode?: DestinationTransportMode;
    travelProvider?: "kakao" | "google" | "fallback";
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
  type: "routine" | "rain" | "umbrella" | "shoes" | "destination";
  enabled: boolean;
  triggerWindow: "morning" | "before-departure" | "rain-1h" | "rain-3h" | "destination-change";
  requiresAccount: boolean;
  requiresPushPermission: boolean;
  deepLink: "H1" | "H4" | "H5" | "G2" | "M2";
};

export type NotificationRuleEvaluation = NotificationRule & {
  active: boolean;
  title: string;
  reason: string;
  /** 실제 기기 알림을 발송할 절대 시각. 시간 기준이 없는 안내 알림은 예약하지 않음. */
  scheduledAt?: string;
  conditionSummary?: string;
  ruleVersion: string;
};
