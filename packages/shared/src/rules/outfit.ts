import type { OutfitRecommendation } from "../types/recommendation";
import type { UserPreferenceProfile } from "../types/profile";
import type { WardrobeItem } from "../types/wardrobe";
import type { WeatherSnapshot } from "../types/weather";
import { OUTFIT_RULE_VERSION } from "./constants";
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
  const accessory = shouldUseAccessory(signals) ? selectWardrobeItem(wardrobe, "accessory", signals, profile) : undefined;
  const outer = shouldUseOuter(signals) ? selectWardrobeItem(wardrobe, "outer", signals, profile) : undefined;
  const reasons = buildReasons(weather, signals, Boolean(outer), Boolean(accessory));
  const matchPct = Math.min(96, 72 + reasons.length * 4 + wardrobe.filter((item) => item.owned).length);

  return {
    id: `outfit-${weather.locationId}-${OUTFIT_RULE_VERSION}`,
    weatherSnapshotId: weather.id ?? weather.locationId,
    items: { outer, top, bottom, shoes, accessory },
    matchPct,
    decisionText: buildDecisionText(signals),
    timeAdvice: buildTimeAdvice(weather),
    reasons,
    variant: profile.fit === "formal" ? "formal" : signals.variant,
    ruleVersion: OUTFIT_RULE_VERSION,
  };
}

function shouldUseOuter(signals: ReturnType<typeof getWeatherSignals>): boolean {
  return signals.isRainy || signals.isCold || signals.needsLightLayer;
}

function shouldUseAccessory(signals: ReturnType<typeof getWeatherSignals>): boolean {
  return signals.isRainy || signals.isHighUv || signals.isPoorAirQuality;
}

function buildDecisionText(signals: ReturnType<typeof getWeatherSignals>): string {
  if (signals.isHeavyRain) return "비가 세요. 방수 차림으로 편하게 나가요";
  if (signals.isRainy) return "비 소식 있어요. 우산과 방수 신발 챙겨요";
  if (signals.isPoorAirQuality) return "먼지가 있어요. 마스크까지 챙기면 좋아요";
  if (signals.isHighUv && signals.isHot) return "햇빛이 강하고 더워요. 가볍게 가리고 나가요";
  if (signals.isHighUv) return "햇빛이 강해요. 모자나 선크림 챙겨요";
  if (signals.isHot) return "더운 날이에요. 바람 잘 통하는 차림이 좋아요";
  if (signals.isCold) return "쌀쌀해요. 따뜻한 한 겹 더 챙겨요";
  if (signals.needsLightLayer) return "서늘한 시간대가 있어요. 가벼운 겹옷이 좋아요";
  return "오늘은 가볍게, 편한 차림으로 나가요";
}

function buildReasons(weather: WeatherSnapshot, signals: ReturnType<typeof getWeatherSignals>, hasOuter: boolean, hasAccessory: boolean): string[] {
  const reasons: string[] = [];
  if (signals.isRainy) reasons.push(`비 올 가능성 ${signals.maxRainProbabilityPct}%라 우산 챙겨두면 좋아요`);
  if (signals.isPoorAirQuality) reasons.push(buildAirQualityReason(signals));
  if (signals.isHighUv && typeof signals.uvIndex === "number") reasons.push(`자외선 지수 ${Math.round(signals.uvIndex)}라 모자나 선크림을 챙기면 좋아요`);
  if (signals.isWindy && signals.needsLightLayer) reasons.push(`바람이 ${signals.maxWindMs.toFixed(1)}m/s라 얇은 겉옷이 있으면 좋아요`);
  if (signals.isHot) {
    reasons.push(
      signals.isHumid
        ? `체감 ${weather.current.feelsLikeC}도에 습도 ${weather.current.humidityPct}%라 통풍이 잘되는 옷이 좋아요`
        : `체감 ${weather.current.feelsLikeC}도라 바람 잘 통하는 소재가 좋아요`,
    );
  }
  if (signals.isCold) reasons.push(`체감 ${weather.current.feelsLikeC}도라 따뜻한 한 겹 더 챙겨요`);
  if (signals.needsLightLayer && signals.tempSwingC >= 7) {
    reasons.push(`최저 ${signals.minTempC}도까지 내려가 얇게 걸칠 옷이 있으면 좋아요`);
  } else if (signals.isHot && signals.tempSwingC >= 8) {
    reasons.push(`일교차는 ${signals.tempSwingC}도지만 낮 더위를 고려해 긴 겉옷은 뺐어요`);
  }
  if (hasOuter) reasons.push("날씨가 바뀌어도 편하도록 겉옷을 함께 골랐어요");
  if (hasAccessory) reasons.push(buildAccessoryReason(signals));
  if (reasons.length === 0) reasons.push("지금 날씨에 맞는 기본 코디로 빠르게 골랐어요");
  return reasons.slice(0, 4);
}

function buildTimeAdvice(weather: WeatherSnapshot): OutfitRecommendation["timeAdvice"] {
  return weather.hourly.slice(0, 3).map((hour) => ({
    time: hour.time,
    text: getTimeAdviceText(weather, hour),
  }));
}

function buildAirQualityReason(signals: ReturnType<typeof getWeatherSignals>): string {
  const pm25 = typeof signals.pm25 === "number" ? `초미세 ${Math.round(signals.pm25)}` : undefined;
  const pm10 = typeof signals.pm10 === "number" ? `미세 ${Math.round(signals.pm10)}` : undefined;
  const value = pm25 ?? pm10;
  return value ? `${value}라 오래 걸을 땐 마스크가 좋아요` : "먼지 신호가 있어 마스크를 챙기면 좋아요";
}

function buildAccessoryReason(signals: ReturnType<typeof getWeatherSignals>): string {
  if (signals.isRainy) return "우산도 함께 챙길 수 있게 담았어요";
  if (signals.isPoorAirQuality) return "먼지 많은 날에 맞춰 마스크까지 생각했어요";
  if (signals.isHighUv) return "햇빛을 가릴 수 있게 액세서리도 함께 봤어요";
  return "외출에 필요한 액세서리까지 함께 골랐어요";
}

function getTimeAdviceText(weather: WeatherSnapshot, hour: WeatherSnapshot["hourly"][number]): string {
  if (hour.rainProbabilityPct >= 60) return "비 오는 시간대엔 우산 함께";
  if (weather.current.pm25 !== undefined && weather.current.pm25 > 35) return "오래 걷는 시간엔 마스크 함께";
  if (weather.current.pm10 !== undefined && weather.current.pm10 > 80) return "먼지 많은 시간엔 마스크 함께";
  if (weather.current.uvIndex !== undefined && weather.current.uvIndex >= 6 && hour.tempC >= 24) return "햇빛 강한 시간엔 모자 함께";
  if (hour.tempC >= 30) return "더운 시간대엔 가볍게";
  return "지금 차림 그대로 좋아요";
}
