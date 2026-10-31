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
  options?: { temperature: { value: number; basis: "feelsLike" | "air" } | null },
): OutfitRecommendation {
  const temperatureAvailable = options ? options.temperature !== null
    : (weather.current.tempAvailable !== false && Number.isFinite(weather.current.tempC))
      || (weather.current.feelsLikeAvailable !== false && Number.isFinite(weather.current.feelsLikeC));
  const temperatureLabel = options?.temperature?.basis === "air" ? "현재 기온" : weather.current.feelsLikeAvailable === false ? "기온" : "체감";
  if (options) weather = { ...weather, current: { ...weather.current,
    feelsLikeC: options.temperature?.value ?? NaN,
    tempC: weather.current.tempAvailable === false || (weather.source === "weatherkit" && weather.current.tempAvailable !== true) ? NaN : weather.current.tempC } };
  const signals = getWeatherSignals(weather);
  const top = temperatureAvailable ? selectWardrobeItem(wardrobe, "top", signals, profile) : undefined;
  const bottom = temperatureAvailable ? selectWardrobeItem(wardrobe, "bottom", signals, profile) : undefined;
  const shoes = temperatureAvailable ? selectWardrobeItem(wardrobe, "shoes", signals, profile) : undefined;
  const accessory = temperatureAvailable && shouldUseAccessory(signals) ? selectWardrobeItem(wardrobe, "accessory", signals, profile) : undefined;
  const outer = temperatureAvailable && shouldUseOuter(signals) ? selectWardrobeItem(wardrobe, "outer", signals, profile) : undefined;
  const reasons = buildReasons(weather, signals, Boolean(accessory && (!signals.isRainy || accessory.weatherTags.includes("rain"))), temperatureLabel, temperatureAvailable);
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

  const reliable = !weather.stale && !weather.locationUnverified && weather.source !== "cache" && weather.source !== "fallback";
  return {
    id: `outfit-${weather.locationId}-${OUTFIT_RULE_VERSION}`,
    weatherSnapshotId: weather.id ?? weather.locationId,
    items,
    preparation,
    decisionText: weather.stale || weather.locationUnverified || weather.source === "cache" || weather.source === "fallback"
      ? "최신 날씨를 확인한 뒤 코디를 안내해요" : buildDecisionText(weather, signals, temperatureAvailable),
    timeAdvice: temperatureAvailable && reliable ? buildTimeAdvice(weather) : [],
    reasons: reliable ? reasons : [],
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

// The explanation shares the item selector's signals; precipitation never replaces thermal advice.
export function buildOutfitCommentary(weather: WeatherSnapshot, temperatureAvailable = true): string {
  return buildDecisionText(weather, getWeatherSignals(weather), temperatureAvailable);
}

function buildDecisionText(weather: WeatherSnapshot, signals: ReturnType<typeof getWeatherSignals>, temperatureAvailable = true): string {
  if (!temperatureAvailable) return "온도를 확인한 뒤 옷차림을 추천해요";
  const base = signals.isCold ? "추운 날씨라 보온 겉옷과 따뜻한 상의가 좋아요"
    : signals.isHot ? "더운 날씨라 통풍이 잘되는 가벼운 차림이 좋아요"
    : signals.needsLightLayer ? "서늘함에 대비해 가볍게 걸칠 한 겹이 좋아요"
    : "온화한 기온에 맞춰 편한 차림으로 나가요";
  const condition = weather.current.condition;
  const extra = condition === "hail" || condition === "storm-hail" ? "우박 신호가 있어 실외 이동을 잠시 피하고 확인해요"
    : condition === "snow" ? signals.maxWindMs >= 8 ? "눈과 바람에 대비해 미끄럼 적은 신발을 챙겨요" : "눈에 대비해 미끄럼 적은 신발을 챙겨요"
    : condition === "sleet" || condition === "mixed" ? "얼음·혼합 강수에 대비해 방수와 미끄럼을 확인해요"
    : signals.isRainy ? signals.maxWindMs >= 8 ? "강수와 강한 바람에 대비해 방수 겉옷을 챙겨요"
      : signals.isHeavyRain ? "강한 강수에 대비해 방수 겉옷과 신발을 챙겨요"
      : condition === "rain" || condition === "storm" ? "비에 대비해 우산을 챙겨요" : "강수 가능성에 대비해 젖지 않을 겉옷을 챙겨요"
    : signals.isWindy && signals.needsLightLayer ? "바람에 체온을 빼앗기지 않게 겉옷을 여며요"
    : signals.isPoorAirQuality ? "먼지에 대비해 마스크를 챙겨요"
    : signals.isHighUv ? "강한 햇빛에 대비해 모자나 선크림을 챙겨요" : "";
  const swing = signals.needsLightLayer && signals.tempSwingC >= 7
    ? "확인된 기온 차가 커서 겉옷을 벗고 입으며 조절해요" : "";
  return [base, extra, swing].filter(Boolean).join(" · ");
}

function buildReasons(weather: WeatherSnapshot, signals: ReturnType<typeof getWeatherSignals>, hasAccessory: boolean, temperatureLabel = "체감", temperatureAvailable = true): string[] {
  if (!temperatureAvailable) return [];
  const reasons: string[] = [];
  const temperature = Math.round(weather.current.feelsLikeAvailable === false ? weather.current.tempC : weather.current.feelsLikeC);
  if (signals.isCold) reasons.push(
    signals.minTempC < (weather.current.feelsLikeAvailable === false ? weather.current.tempC : weather.current.feelsLikeC)
      ? `최저 ${Math.round(signals.minTempC)}도까지 내려가 보온성 있는 겉옷과 따뜻한 상의를 준비해요`
      : `${temperatureLabel} ${temperature}도라 따뜻한 한 겹 더 챙겨요`,
  );
  if (signals.isRainy) reasons.push(signals.maxWindMs >= 8 ? "강수와 강한 바람에 대비해 방수 겉옷을 챙겨요" : "강수 가능성에 대비해 젖지 않을 겉옷을 챙겨요");
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
    reasons.push(`확인된 기온 차는 ${Math.round(signals.tempSwingC)}도라 예보에 맞춰 옷차림을 조절해요`);
  }

  if (hasAccessory && !signals.isRainy) reasons.push(buildAccessoryReason(signals));
  if (temperatureAvailable && reasons.length === 0) reasons.push("지금 날씨에 맞는 기본 코디로 빠르게 골랐어요");
  return reasons.slice(0, 4);
}

function buildTimeAdvice(weather: WeatherSnapshot): OutfitRecommendation["timeAdvice"] {
  let previous: string | undefined;
  return weather.hourly.flatMap(hour => {
    const fields = ["temp", "wind", "rainProbability", "precipitation"] as const;
    if (fields.some(field => hour.available?.[field] === false || (weather.source === "weatherkit" && hour.available?.[field] !== true))
      || ![hour.tempC, hour.windMs, hour.rainProbabilityPct, hour.precipitationMm].every(Number.isFinite)) return [];
    const scoped: WeatherSnapshot = { ...weather, daily: undefined, hourly: [], current: { ...weather.current,
      tempC: hour.tempC, feelsLikeC: hour.tempC, tempAvailable: true, feelsLikeAvailable: false,
      rainProbabilityPct: hour.rainProbabilityPct, precipitationMm: hour.precipitationMm, windMs: hour.windMs,
      uvIndex: undefined, pm10: undefined, pm25: undefined, humidityPct: NaN,
      condition: hour.available?.condition === false || (weather.source === "weatherkit" && hour.available?.condition !== true) ? "unknown" as const : hour.condition as WeatherSnapshot["current"]["condition"] } };
    const signals = getWeatherSignals(scoped);
    const action = buildDecisionText(scoped, signals);
    const changed = previous !== undefined && action !== previous;
    previous = action;
    if (!changed) return [];
    return [{ time: hour.time, text: action }];
  });
}

function buildAirQualityReason(signals: ReturnType<typeof getWeatherSignals>): string {
  const pm25 = typeof signals.pm25 === "number" ? `초미세 ${Math.round(signals.pm25)}` : undefined;
  const pm10 = typeof signals.pm10 === "number" ? `미세 ${Math.round(signals.pm10)}` : undefined;
  const value = pm25 ?? pm10;
  return value ? `${value}라 오래 걸을 땐 마스크가 좋아요` : "먼지 신호가 있어 마스크를 챙기면 좋아요";
}

function buildAccessoryReason(signals: ReturnType<typeof getWeatherSignals>): string {
  if (signals.isPoorAirQuality) return "먼지 많은 날에 맞춰 마스크까지 생각했어요";
  if (signals.isHighUv) return "햇빛을 가릴 수 있게 액세서리도 함께 봤어요";
  return "외출에 필요한 액세서리까지 함께 골랐어요";
}
