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
  if (signals.isHeavyRain) return "비가 세요. 방수 차림으로 편하게 나가요";
  if (signals.isRainy) return "비 소식 있어요. 우산과 방수 신발 챙겨요";
  if (signals.isHot) return "더운 날이에요. 바람 잘 통하는 차림이 좋아요";
  if (signals.isCold) return "쌀쌀해요. 따뜻한 한 겹 더 챙겨요";
  if (signals.tempSwingC >= 8) return "하루 기온차 커요. 가벼운 겹옷이 좋아요";
  return "오늘은 가볍게, 편한 차림으로 나가요";
}

function buildReasons(weather: WeatherSnapshot, signals: ReturnType<typeof getWeatherSignals>, hasOuter: boolean, hasAccessory: boolean): string[] {
  const reasons: string[] = [];
  if (signals.isRainy) reasons.push(`비 올 가능성 ${signals.maxRainProbabilityPct}%라 우산 챙겨두면 좋아요`);
  if (signals.isWindy) reasons.push(`바람이 ${signals.maxWindMs.toFixed(1)}m/s라 겉옷 하나 더 있으면 좋아요`);
  if (signals.isHot) reasons.push(`체감 ${weather.current.feelsLikeC}도라 바람 잘 통하는 소재가 좋아요`);
  if (signals.isCold) reasons.push(`체감 ${weather.current.feelsLikeC}도라 따뜻한 한 겹 더 챙겨요`);
  if (signals.tempSwingC >= 8) reasons.push(`일교차 ${signals.tempSwingC}도라 아침에 걸칠 옷이 있으면 좋아요`);
  if (hasOuter) reasons.push("날씨가 바뀌어도 편하도록 겉옷을 함께 골랐어요");
  if (hasAccessory) reasons.push("우산도 함께 챙길 수 있게 담았어요");
  if (reasons.length === 0) reasons.push("지금 날씨에 맞는 기본 코디로 빠르게 골랐어요");
  return reasons.slice(0, 4);
}

function buildTimeAdvice(weather: WeatherSnapshot): OutfitRecommendation["timeAdvice"] {
  return weather.hourly.slice(0, 3).map((hour) => ({
    time: hour.time,
    text: hour.rainProbabilityPct >= 60 ? "비 오는 시간대엔 우산 함께" : hour.tempC >= 30 ? "더운 시간대엔 가볍게" : "지금 차림 그대로 좋아요",
  }));
}
