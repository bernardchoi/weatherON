import type { OutfitRecommendation } from "../types/recommendation";
import type { UserPreferenceProfile } from "../types/profile";
import type { WardrobeItem } from "../types/wardrobe";
import type { WeatherSnapshot } from "../types/weather";
import { RULE_VERSION } from "./constants";
import { getWeatherSignals } from "./weatherSignals";
import { selectWardrobeItem } from "./wardrobeSelect";

export function recommendOutfit(
  weather: WeatherSnapshot,
  profile: UserPreferenceProfile,
  wardrobe: WardrobeItem[],
): OutfitRecommendation {
  const signals = getWeatherSignals(weather);
  const top = selectWardrobeItem(wardrobe, "top", signals, profile);
  const bottom = selectWardrobeItem(wardrobe, "bottom", signals, profile);
  const shoes = selectWardrobeItem(wardrobe, "shoes", signals, profile);
  const accessory = signals.isRainy ? selectWardrobeItem(wardrobe, "accessory", signals, profile) : undefined;
  const outer = shouldUseOuter(signals) ? selectWardrobeItem(wardrobe, "outer", signals, profile) : undefined;
  const reasons = buildReasons(weather, signals, Boolean(outer), Boolean(accessory));
  const matchPct = Math.min(96, 72 + reasons.length * 4 + wardrobe.filter((item) => item.owned).length);

  return {
    id: `outfit-${weather.locationId}-${RULE_VERSION}`,
    weatherSnapshotId: weather.id ?? weather.locationId,
    items: { outer, top, bottom, shoes, accessory },
    matchPct,
    decisionText: buildDecisionText(signals),
    timeAdvice: buildTimeAdvice(weather),
    reasons,
    variant: profile.fit === "formal" ? "formal" : signals.variant,
    ruleVersion: RULE_VERSION,
  };
}

function shouldUseOuter(signals: ReturnType<typeof getWeatherSignals>): boolean {
  return signals.isRainy || signals.isWindy || signals.isCold || signals.tempSwingC >= 8 || (signals.minTempC <= 15 && signals.maxTempC >= 24);
}

function buildDecisionText(signals: ReturnType<typeof getWeatherSignals>): string {
  if (signals.isHeavyRain) return "비가 강해 방수 중심으로 준비 필요";
  if (signals.isRainy) return "비 신호가 있어 우산과 방수 신발 우선";
  if (signals.isHot) return "체감 더위가 높아 통기성 있는 코디 추천";
  if (signals.isCold) return "체감 추위가 커 보온 중심 추천";
  if (signals.tempSwingC >= 8) return "일교차가 커 가벼운 레이어링 추천";
  return "오늘 준비는 가볍게, 기본 외출 코디 추천";
}

function buildReasons(weather: WeatherSnapshot, signals: ReturnType<typeof getWeatherSignals>, hasOuter: boolean, hasAccessory: boolean): string[] {
  const reasons: string[] = [];
  if (signals.isRainy) reasons.push(`강수확률 ${weather.current.rainProbabilityPct}% 기준으로 비 대응 아이템 우선`);
  if (signals.isWindy) reasons.push(`바람 ${weather.current.windMs.toFixed(1)}m/s라 안정적인 겉옷 추천`);
  if (signals.isHot) reasons.push(`체감 ${weather.current.feelsLikeC}도라 통기성 소재 우선`);
  if (signals.isCold) reasons.push(`체감 ${weather.current.feelsLikeC}도라 보온 아이템 우선`);
  if (signals.tempSwingC >= 8) reasons.push(`일교차 ${signals.tempSwingC}도라 아침 레이어링 필요`);
  if (hasOuter) reasons.push("겉옷을 포함해 이동 중 변화에 대응");
  if (hasAccessory) reasons.push("우산을 함께 챙기도록 액세서리 반영");
  if (reasons.length === 0) reasons.push("현재 날씨 기준 기본 프리셋으로 빠르게 추천");
  return reasons.slice(0, 4);
}

function buildTimeAdvice(weather: WeatherSnapshot): OutfitRecommendation["timeAdvice"] {
  return weather.hourly.slice(0, 3).map((hour) => ({
    time: hour.time,
    text: hour.rainProbabilityPct >= 60 ? "비 대응 유지" : hour.tempC >= 30 ? "더위 대비" : "기본 코디 유지",
  }));
}
