import type { DestinationAlertCondition, DestinationCare, NotificationRule, NotificationRuleEvaluation } from "../types/recommendation";
import type { WeatherSnapshot } from "../types/weather";
import { RULE_VERSION } from "./constants";
import { recommendShoes } from "./shoes";
import { recommendUmbrella } from "./umbrella";

export const defaultNotificationRules: NotificationRule[] = [
  {
    id: "routine-morning",
    type: "routine",
    enabled: true,
    triggerWindow: "morning",
    requiresAccount: false,
    requiresPushPermission: false,
    deepLink: "H1",
  },
  {
    id: "rain-1h",
    type: "rain",
    enabled: true,
    triggerWindow: "rain-1h",
    requiresAccount: false,
    requiresPushPermission: true,
    deepLink: "H5",
  },
  {
    id: "umbrella-before-departure",
    type: "umbrella",
    enabled: true,
    triggerWindow: "before-departure",
    requiresAccount: false,
    requiresPushPermission: true,
    deepLink: "H4",
  },
  {
    id: "shoes-before-departure",
    type: "shoes",
    enabled: true,
    triggerWindow: "before-departure",
    requiresAccount: false,
    requiresPushPermission: true,
    deepLink: "H1",
  },
  {
    id: "destination-change",
    type: "destination",
    enabled: true,
    triggerWindow: "destination-change",
    requiresAccount: true,
    requiresPushPermission: true,
    deepLink: "G2",
  },
  {
    id: "bedtime-check",
    type: "bedtime",
    enabled: true,
    triggerWindow: "bedtime",
    requiresAccount: false,
    requiresPushPermission: true,
    deepLink: "H7",
  },
];

export type NotificationEvaluationOptions = {
  rules?: NotificationRule[];
  destinationWeather?: WeatherSnapshot;
  destinationCategory?: DestinationCare["category"];
  destinationCareOn?: boolean;
  destinationAlertCondition?: DestinationAlertCondition;
};

const defaultDestinationAlertCondition: DestinationAlertCondition = {
  rainThresholdPct: 50,
  leadTimeMinutes: 60,
  windThresholdMs: 8,
};

export function evaluateNotificationRules(
  weather: WeatherSnapshot,
  optionsOrRules: NotificationRule[] | NotificationEvaluationOptions = defaultNotificationRules,
): NotificationRuleEvaluation[] {
  const options = Array.isArray(optionsOrRules) ? { rules: optionsOrRules } : optionsOrRules;
  const rules = options.rules ?? defaultNotificationRules;
  const umbrella = recommendUmbrella(weather);
  const shoes = recommendShoes(weather);
  const destinationWeather = options.destinationWeather;
  const destinationCondition = options.destinationAlertCondition ?? defaultDestinationAlertCondition;
  const destinationShoes = destinationWeather ? recommendShoes(destinationWeather, options.destinationCategory) : undefined;

  return rules.map((rule) => {
    const destinationSignals =
      rule.type === "destination" && destinationWeather
        ? getDestinationAlertSignals(destinationWeather, destinationCondition, destinationShoes?.level)
        : undefined;
    const active =
      rule.enabled &&
      isRuleActive(rule, umbrella.level, shoes.level, {
        careOn: options.destinationCareOn ?? true,
        destinationSignals,
      });
    return {
      ...rule,
      active,
      title: getRuleTitle(rule),
      reason: getRuleReason(rule, active, umbrella.title, shoes.title, {
        destinationCondition,
        destinationSignals,
        destinationShoesTitle: destinationShoes?.title,
        destinationWeather,
      }),
      conditionSummary: rule.type === "destination" ? formatDestinationCondition(destinationCondition) : undefined,
      ruleVersion: RULE_VERSION,
    };
  });
}

function isRuleActive(
  rule: NotificationRule,
  umbrellaLevel: string,
  shoesLevel: string,
  context: {
    careOn: boolean;
    destinationSignals?: DestinationAlertSignals;
  },
): boolean {
  if (rule.type === "routine" || rule.type === "bedtime") return true;
  if (rule.type === "rain" || rule.type === "umbrella") return umbrellaLevel === "recommended" || umbrellaLevel === "required";
  if (rule.type === "shoes") return shoesLevel === "recommended";
  if (rule.type === "destination") {
    return Boolean(context.careOn && context.destinationSignals?.active);
  }
  return false;
}

function getRuleTitle(rule: NotificationRule): string {
  const titleByType: Record<NotificationRule["type"], string> = {
    routine: "외출 준비",
    rain: "강수 알림",
    umbrella: "우산 알림",
    shoes: "신발 알림",
    destination: "목적지 알림",
    bedtime: "내일 브리핑",
  };
  return titleByType[rule.type];
}

function getRuleReason(
  rule: NotificationRule,
  active: boolean,
  umbrellaTitle: string,
  shoesTitle: string,
  context: {
    destinationCondition: DestinationAlertCondition;
    destinationSignals?: DestinationAlertSignals;
    destinationShoesTitle?: string;
    destinationWeather?: WeatherSnapshot;
  },
): string {
  if (!active) {
    if (rule.type === "destination") {
      return context.destinationWeather
        ? `${formatDestinationCondition(context.destinationCondition)} 기준 대기`
        : "목적지 날씨 확인 후 대기";
    }
    return "현재 조건에서는 대기";
  }
  if (rule.type === "routine") return "오늘 준비 카드 확인 가능";
  if (rule.type === "bedtime") return "내일 날씨·코디·우산 준비 확인";
  if (rule.type === "rain") return "비 시작 전 미리 알림";
  if (rule.type === "shoes") return shoesTitle;
  if (rule.type === "destination") return getDestinationActiveReason(context.destinationCondition, context.destinationSignals, context.destinationShoesTitle);
  return umbrellaTitle;
}

type DestinationAlertSignals = {
  active: boolean;
  rainExceeded: boolean;
  windExceeded: boolean;
  shoesRecommended: boolean;
  maxRainProbabilityPct: number;
  maxWindMs: number;
};

function getDestinationAlertSignals(
  weather: WeatherSnapshot,
  condition: DestinationAlertCondition,
  shoesLevel: string | undefined,
): DestinationAlertSignals {
  const maxRainProbabilityPct = Math.max(weather.current.rainProbabilityPct, ...weather.hourly.map((hour) => hour.rainProbabilityPct));
  const maxWindMs = Math.max(weather.current.windMs, ...weather.hourly.map((hour) => hour.windMs));
  const rainExceeded = maxRainProbabilityPct >= condition.rainThresholdPct;
  const windExceeded = maxWindMs >= condition.windThresholdMs;
  const shoesRecommended = shoesLevel === "recommended";

  return {
    active: rainExceeded || windExceeded || shoesRecommended,
    rainExceeded,
    windExceeded,
    shoesRecommended,
    maxRainProbabilityPct,
    maxWindMs,
  };
}

function getDestinationActiveReason(
  condition: DestinationAlertCondition,
  signals: DestinationAlertSignals | undefined,
  shoesTitle: string | undefined,
): string {
  if (!signals) return "목적지 날씨 확인 후 대기";
  if (signals.rainExceeded) return `강수 ${Math.round(signals.maxRainProbabilityPct)}% · 출발 ${condition.leadTimeMinutes}분 전 알림`;
  if (signals.windExceeded) return `바람 ${signals.maxWindMs.toFixed(1)}m/s · 출발 ${condition.leadTimeMinutes}분 전 알림`;
  if (signals.shoesRecommended) return `목적지 날씨 변화 · 출발 ${condition.leadTimeMinutes}분 전 알림`;
  return `${formatDestinationCondition(condition)} 기준 대기`;
}

function formatDestinationCondition(condition: DestinationAlertCondition): string {
  return `강수 ${condition.rainThresholdPct}% · ${condition.leadTimeMinutes}분 전 · 바람 ${condition.windThresholdMs}m/s`;
}
