import type { OutfitRecommendation } from "../types/recommendation";
import type { UserPreferenceProfile } from "../types/profile";
import type { WardrobeItem } from "../types/wardrobe";
import type { WeatherSnapshot } from "../types/weather";
import { validTemperature, validMeasure, thermalPreparation } from "./thermalJudgment";
import { OUTFIT_RULE_VERSION } from "./constants";
import { getWeatherSignals } from "./weatherSignals";
import { selectWardrobeItem } from "./wardrobeSelect";

export function recommendOutfit(
  weather: WeatherSnapshot,
  profile: UserPreferenceProfile,
  wardrobe: WardrobeItem[],
  options?: { temperature: { value: number; basis: "feelsLike" | "air" } | null },
): OutfitRecommendation {
  const air = validTemperature(weather.current.tempC, weather.current.tempAvailable !== false && (weather.source !== "weatherkit" || weather.current.tempAvailable === true));
  const apparent = validTemperature(weather.current.feelsLikeC, weather.current.feelsLikeAvailable !== false && (weather.source !== "weatherkit" || weather.current.feelsLikeAvailable === true));
  const selected = options ? options.temperature : undefined;
  const selectedApparent = options ? selected?.basis === "feelsLike" ? validTemperature(selected.value) : NaN : apparent;
  const temperatureAvailable = options ? selected != null && Number.isFinite(validTemperature(selected.value)) : Number.isFinite(air) || Number.isFinite(apparent);
  const temperatureLabel = selected?.basis === "air" ? "현재 기온" : Number.isFinite(selectedApparent) ? "체감" : "기온";
  weather = { ...weather, current: { ...weather.current, tempC: air, tempAvailable: Number.isFinite(air),
    feelsLikeC: selectedApparent, feelsLikeAvailable: Number.isFinite(selectedApparent) } };
  const signals = getWeatherSignals(weather);
  const top = temperatureAvailable ? selectWardrobeItem(wardrobe, "top", signals, profile) : undefined;
  const bottom = temperatureAvailable ? selectWardrobeItem(wardrobe, "bottom", signals, profile) : undefined;
  const shoes = temperatureAvailable ? selectWardrobeItem(wardrobe, "shoes", signals, profile) : undefined;
  const accessory = temperatureAvailable && shouldUseAccessory(signals) ? selectWardrobeItem(wardrobe, "accessory", signals, profile) : undefined;
  const outer = temperatureAvailable && shouldUseOuter(signals) ? selectWardrobeItem(wardrobe, "outer", signals, profile) : undefined;
  const reasons = buildReasons(weather, signals, Boolean(outer), Boolean(accessory && (!signals.isRainy || accessory.weatherTags.includes("rain"))), temperatureLabel, temperatureAvailable);
  const items = { outer, top, bottom, shoes, accessory };
  const selectedItems = Object.values(items).filter((item): item is WardrobeItem => Boolean(item));
  const preparation = {
    ownedItemCount: selectedItems.filter((item) => item.owned).length,
    totalItemCount: selectedItems.length,
    missingItemNames: selectedItems.filter((item) => !item.owned).map((item) => item.name),
    rainProtectionGaps: temperatureAvailable && signals.isRainy
      ? [outer, shoes, accessory].filter((item) => !item?.weatherTags.includes("rain"))
          .map((item) => item?.category ?? "accessory")
      : [],
  };

  return {
    id: `outfit-${weather.locationId}-${OUTFIT_RULE_VERSION}`,
    weatherSnapshotId: weather.id ?? weather.locationId,
    items,
    preparation,
    decisionText: buildDecisionText(signals, temperatureAvailable),
    timeAdvice: temperatureAvailable ? buildTimeAdvice(weather) : [],
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

function buildDecisionText(signals: ReturnType<typeof getWeatherSignals>, temperatureAvailable = true): string {
  const thermal = thermalPreparation(signals.thermal).copy;
  if (signals.isRainy) {
    const protection = getPrecipitationPreparation(signals);
    return `${protection}${signals.isWindy && ["snow", "ice", "hail"].includes(signals.precipitationKind) ? "\n강한 바람도 있어요. 바람을 막는 겉옷을 준비해요." : ""}${signals.isCold || signals.isHot ? `\n${thermal}` : ""}`;
  }
  if (signals.isWindy) return `${signals.needsLightLayer ? "바람이 강해요. 바람을 막는 겉옷을 준비해요." : "바람이 강해요. 날아갈 물건을 정리해요."}\n${thermal}`;
  if (signals.isCold || signals.isHot) return thermal;
  if (signals.isPoorAirQuality) return "먼지가 있어요. 마스크까지 챙기면 좋아요";
  if (signals.isHighUv) return "햇빛이 강해요. 모자나 선크림 챙겨요";
  if (!temperatureAvailable) return "온도를 확인한 뒤 옷차림을 추천해요";
  return thermal;
}

function getPrecipitationPreparation(signals: ReturnType<typeof getWeatherSignals>): string {
  return signals.precipitationKind === "hail" ? "우박 신호가 있어요. 실외 이동을 잠시 피하고 확인해요."
      : signals.precipitationKind === "ice" ? "얼음·혼합 강수 소식이에요. 방수와 미끄럼에 대비해요."
      : signals.precipitationKind === "snow" ? "눈 소식이 있어요. 미끄럼 적은 방수 신발을 챙겨요."
      : signals.isWindy ? "강수와 강한 바람에 대비해요. 방수 겉옷과 신발을 챙겨요."
      : "강수 소식이 있어요. 방수 신발과 우산을 준비해요.";

}

function buildReasons(weather: WeatherSnapshot, signals: ReturnType<typeof getWeatherSignals>, hasOuter: boolean, hasAccessory: boolean, temperatureLabel = "체감", temperatureAvailable = true): string[] {
  const reasons: string[] = [];
  const temperature = Math.round(signals.thermal.temperature);
  if (signals.isCold) reasons.push(
    Number.isFinite(signals.minTempC) && (!Number.isFinite(signals.thermal.temperature) || signals.minTempC < signals.thermal.temperature)
      ? `최저 ${Math.round(signals.minTempC)}도까지 내려가 보온성 있는 겉옷과 따뜻한 상의를 준비해요`
      : `${temperatureLabel} ${temperature}도라 따뜻한 한 겹 더 챙겨요`,
  );
  if (signals.isRainy) reasons.push(signals.precipitationKind === "rain" && Number.isFinite(signals.maxRainProbabilityPct)
    ? `비 올 가능성 ${signals.maxRainProbabilityPct}%라 우산 챙겨두면 좋아요`
    : getPrecipitationPreparation(signals));
  if (signals.isPoorAirQuality) reasons.push(buildAirQualityReason(signals));
  if (signals.isHighUv && typeof signals.uvIndex === "number") reasons.push(`자외선 지수 ${Math.round(signals.uvIndex)}라 모자나 선크림을 챙기면 좋아요`);
  if (signals.isWindy && signals.needsLightLayer && !signals.isCold) reasons.push(`바람이 ${signals.maxWindMs.toFixed(1)}m/s라 얇은 겉옷이 있으면 좋아요`);
  if (signals.isHot) {
    reasons.push(
      signals.isHumid
        ? `${temperatureLabel} ${temperature}도에 습도 ${weather.current.humidityPct}%라 통풍이 잘되는 옷이 좋아요`
        : `${temperatureLabel} ${temperature}도라 바람 잘 통하는 소재가 좋아요`,
    );
  }
  if (!signals.isCold && signals.needsLightLayer && signals.tempSwingC >= 7) {
    reasons.push(`최저 ${Math.round(signals.minTempC)}도까지 내려가 얇게 걸칠 옷이 있으면 좋아요`);
  } else if (signals.isHot && signals.tempSwingC >= 8) {
    reasons.push(`일교차는 ${Math.round(signals.tempSwingC)}도지만 낮 더위를 고려해 긴 겉옷은 뺐어요`);
  }
  if (hasOuter) reasons.push("날씨가 바뀌어도 편하도록 겉옷을 함께 골랐어요");
  if (hasAccessory) reasons.push(buildAccessoryReason(signals));
  if (temperatureAvailable && reasons.length === 0) reasons.push("지금 날씨에 맞는 기본 코디로 빠르게 골랐어요");
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
  const available = (field: "temp" | "wind" | "rainProbability" | "precipitation" | "condition") => hour.available?.[field] !== false && (weather.source !== "weatherkit" || hour.available?.[field] === true);
  const air = validTemperature(hour.tempC, available("temp"));
  const scoped: WeatherSnapshot = { ...weather, observedAt: hour.time, daily: undefined, hourly: [], current: {
    tempC: air, tempAvailable: Number.isFinite(air), feelsLikeC: NaN, feelsLikeAvailable: false,
    windMs: validMeasure(hour.windMs, available("wind")), windAvailable: available("wind"),
    rainProbabilityPct: validMeasure(hour.rainProbabilityPct, available("rainProbability"), 100), rainProbabilityAvailable: available("rainProbability"),
    precipitationMm: validMeasure(hour.precipitationMm, available("precipitation")),
    condition: available("condition") ? hour.condition as WeatherSnapshot["current"]["condition"] : "unknown",
    humidityPct: NaN, humidityAvailable: false,
  } };
  return buildDecisionText(getWeatherSignals(scoped), Number.isFinite(air));
}
