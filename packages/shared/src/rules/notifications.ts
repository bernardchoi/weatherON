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
  {
    id: "heatwave-advisory",
    type: "heatwave",
    enabled: true,
    triggerWindow: "weather-alert",
    requiresAccount: false,
    requiresPushPermission: true,
    deepLink: "H3",
  },
  {
    id: "heatwave-warning",
    type: "heatwave",
    enabled: true,
    triggerWindow: "weather-alert",
    requiresAccount: false,
    requiresPushPermission: true,
    deepLink: "H3",
  },
  {
    id: "heavy-rain-advisory",
    type: "heavy-rain",
    enabled: true,
    triggerWindow: "weather-alert",
    requiresAccount: false,
    requiresPushPermission: true,
    deepLink: "H3",
  },
  {
    id: "heavy-rain-warning",
    type: "heavy-rain",
    enabled: true,
    triggerWindow: "weather-alert",
    requiresAccount: false,
    requiresPushPermission: true,
    deepLink: "H3",
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
  const weatherAlertSignals = getWeatherAlertSignals(weather);

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
        weatherAlertSignals,
      });
    const weatherAlertSignal = getWeatherAlertSignal(rule, weatherAlertSignals);
    return {
      ...rule,
      active,
      title: getRuleTitle(rule),
      reason: getRuleReason(rule, active, umbrella.title, shoes.title, {
        destinationCondition,
        destinationSignals,
        destinationShoesTitle: destinationShoes?.title,
        destinationWeather,
        weatherAlertSignal,
      }),
      deliveryKey: weatherAlertSignal ? `${rule.id}:${weatherAlertSignal.eventDate}` : undefined,
      conditionSummary:
        rule.type === "destination"
          ? formatDestinationCondition(destinationCondition)
          : weatherAlertSignal
            ? `${weatherAlertSignal.label} 기준 도달 예상`
            : undefined,
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
    weatherAlertSignals: WeatherAlertSignals;
  },
): boolean {
  if (rule.type === "routine" || rule.type === "bedtime") return true;
  if (rule.type === "rain" || rule.type === "umbrella") return umbrellaLevel === "recommended" || umbrellaLevel === "required";
  if (rule.type === "shoes") return shoesLevel === "recommended";
  if (rule.type === "destination") {
    return Boolean(context.careOn && context.destinationSignals?.active);
  }
  if (rule.type === "heatwave" || rule.type === "heavy-rain") {
    return Boolean(getWeatherAlertSignal(rule, context.weatherAlertSignals));
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
    heatwave: rule.id.endsWith("warning") ? "폭염경보 기준 도달 예상" : "폭염주의보 기준 도달 예상",
    "heavy-rain": rule.id.endsWith("warning") ? "호우경보 기준 도달 예상" : "호우주의보 기준 도달 예상",
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
    weatherAlertSignal?: WeatherAlertSignal;
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
  if (rule.type === "heatwave" || rule.type === "heavy-rain") return context.weatherAlertSignal?.reason ?? "특보 기준 예보 확인 대기";
  if (rule.type === "shoes") return shoesTitle;
  if (rule.type === "destination") return getDestinationActiveReason(context.destinationCondition, context.destinationSignals, context.destinationShoesTitle);
  return umbrellaTitle;
}

type WeatherAlertLevel = "advisory" | "warning";

type WeatherAlertSignal = {
  level: WeatherAlertLevel;
  label: string;
  reason: string;
  eventDate: string;
};

type WeatherAlertSignals = {
  heatwave?: WeatherAlertSignal;
  heavyRain?: WeatherAlertSignal;
};

function getWeatherAlertSignal(rule: NotificationRule, signals: WeatherAlertSignals): WeatherAlertSignal | undefined {
  const signal = rule.type === "heatwave" ? signals.heatwave : rule.type === "heavy-rain" ? signals.heavyRain : undefined;
  if (!signal) return undefined;
  const expectedLevel: WeatherAlertLevel = rule.id.endsWith("warning") ? "warning" : "advisory";
  return signal.level === expectedLevel ? signal : undefined;
}

function getWeatherAlertSignals(weather: WeatherSnapshot): WeatherAlertSignals {
  return {
    heatwave: getHeatwaveSignal(weather),
    heavyRain: getHeavyRainSignal(weather),
  };
}

function getHeatwaveSignal(weather: WeatherSnapshot): WeatherAlertSignal | undefined {
  const dailyHighs = getDailyHighs(weather);
  const warningRun = getConsecutiveHeatDays(dailyHighs, 35);
  if (warningRun) {
    return {
      level: "warning",
      label: "폭염경보",
      reason: `일최고 ${warningRun.maxTempC.toFixed(0)}℃ 이상 ${warningRun.days}일 예상 · 야외 활동과 수분 보충 확인`,
      eventDate: warningRun.startDate,
    };
  }
  const advisoryRun = getConsecutiveHeatDays(dailyHighs, 33);
  if (!advisoryRun) return undefined;
  return {
    level: "advisory",
    label: "폭염주의보",
    reason: `일최고 ${advisoryRun.maxTempC.toFixed(0)}℃ 이상 ${advisoryRun.days}일 예상 · 한낮 외출 조절 권장`,
    eventDate: advisoryRun.startDate,
  };
}

function getHeavyRainSignal(weather: WeatherSnapshot): WeatherAlertSignal | undefined {
  const totals = getRainWindowTotals(weather);
  if (!totals) return undefined;
  const eventDate = getWeatherDate(weather.hourly[0]?.time ?? weather.observedAt);
  if (totals.max3hMm >= 90 || totals.max12hMm >= 180) {
    return {
      level: "warning",
      label: "호우경보",
      reason: formatHeavyRainReason(totals, "경보"),
      eventDate,
    };
  }
  if (totals.max3hMm >= 60 || totals.max12hMm >= 110) {
    return {
      level: "advisory",
      label: "호우주의보",
      reason: formatHeavyRainReason(totals, "주의보"),
      eventDate,
    };
  }
  return undefined;
}

function getDailyHighs(weather: WeatherSnapshot): Array<{ date: string; maxTempC: number }> {
  const highs = new Map<string, number>();
  const add = (date: string, tempC: number) => {
    if (!date || !Number.isFinite(tempC)) return;
    highs.set(date, Math.max(highs.get(date) ?? -Infinity, tempC));
  };
  weather.daily?.forEach((day) => add(day.date, day.maxTempC));
  weather.hourly.forEach((hour) => add(getWeatherDate(hour.time), hour.tempC));
  add(getWeatherDate(weather.observedAt), weather.current.feelsLikeC);
  return [...highs.entries()]
    .map(([date, maxTempC]) => ({ date, maxTempC }))
    .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getConsecutiveHeatDays(highs: Array<{ date: string; maxTempC: number }>, thresholdC: number) {
  let current: Array<{ date: string; maxTempC: number }> = [];
  let best: Array<{ date: string; maxTempC: number }> = [];
  highs.forEach((high) => {
    const previous = current.at(-1);
    const consecutive = previous && getDateOffsetDays(previous.date, high.date) === 1;
    if (high.maxTempC >= thresholdC) {
      current = consecutive ? [...current, high] : [high];
      if (current.length > best.length) best = current;
      return;
    }
    current = [];
  });
  if (best.length < 2) return undefined;
  return {
    startDate: best[0].date,
    days: best.length,
    maxTempC: Math.max(...best.map((item) => item.maxTempC)),
  };
}

function getRainWindowTotals(weather: WeatherSnapshot): { max3hMm: number; max12hMm: number } | undefined {
  const amounts = weather.hourly
    .map((hour) => ({ time: Date.parse(hour.time), precipitationMm: hour.precipitationMm }))
    .filter((hour) => Number.isFinite(hour.time) && Number.isFinite(hour.precipitationMm))
    .sort((a, b) => a.time - b.time);
  if (amounts.length === 0) return undefined;
  const intervals = amounts.slice(1).map((item, index) => (item.time - amounts[index].time) / 3_600_000).filter((value) => value > 0);
  const medianHours = intervals.length ? intervals.sort((a, b) => a - b)[Math.floor(intervals.length / 2)] : 1;
  if (medianHours > 3.5) return undefined;
  const bucketHours = medianHours <= 1.5 ? 1 : 3;
  return {
    max3hMm: getRollingPrecipitation(amounts.map((item) => item.precipitationMm), Math.max(1, Math.round(3 / bucketHours))),
    max12hMm: getRollingPrecipitation(amounts.map((item) => item.precipitationMm), Math.max(1, Math.round(12 / bucketHours))),
  };
}

function getRollingPrecipitation(amounts: number[], windowSize: number): number {
  if (amounts.length === 0) return 0;
  let max = 0;
  for (let index = 0; index < amounts.length; index += 1) {
    const total = amounts.slice(index, index + windowSize).reduce((sum, amount) => sum + Math.max(amount, 0), 0);
    max = Math.max(max, total);
  }
  return max;
}

function formatHeavyRainReason(totals: { max3hMm: number; max12hMm: number }, levelLabel: string): string {
  const window = totals.max3hMm >= (levelLabel === "경보" ? 90 : 60)
    ? `3시간 ${totals.max3hMm.toFixed(0)}mm`
    : `12시간 ${totals.max12hMm.toFixed(0)}mm`;
  return `${window} 예상 · 호우${levelLabel} 기준 도달 예상, 저지대·하천 주변 접근 주의`;
}

function getWeatherDate(value: string): string {
  return value.slice(0, 10);
}

function getDateOffsetDays(previous: string, next: string): number {
  return Math.round((Date.parse(`${next}T00:00:00Z`) - Date.parse(`${previous}T00:00:00Z`)) / 86_400_000);
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
