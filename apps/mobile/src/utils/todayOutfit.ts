import { recommendOutfit, type WeatherSnapshot, type UserPreferenceProfile, type WardrobeItem } from "@weatheron/shared";
import { forecastHours, snapshotReliable, type ForecastHour } from "./homeOuting";
import { addZonedCalendarDays, createDateAtTimeInZone, getZonedDateTimeParts } from "./zonedDateTime";

export type TodayOutfitContext = {
  status: string;
  observedLabel?: string;
  currentAvailable: boolean;
  temperature?: { value: number; basis: "feelsLike" | "air" };
  weather: WeatherSnapshot;
  complete: boolean;
  reliable: boolean;
};

// iOS outfit uses the selected location's remaining calendar day, never the
// provider's entire horizon. Unknown dates/zones/field presence stay unknown.
export function buildTodayOutfit(weather: WeatherSnapshot, profile: UserPreferenceProfile, wardrobe: WardrobeItem[], now: number) {
  const observationAvailable = weather.source !== "fallback" && !weather.locationUnverified && Number.isFinite(Date.parse(weather.observedAt));
  const present = (value: number, flag?: boolean) => Number.isFinite(value) && flag !== false && (weather.source !== "weatherkit" || flag === true);
  const temperature: TodayOutfitContext["temperature"] = !observationAvailable ? undefined
    : present(weather.current.feelsLikeC, weather.current.feelsLikeAvailable) ? { value: weather.current.feelsLikeC, basis: "feelsLike" }
    : present(weather.current.tempC, weather.current.tempAvailable) ? { value: weather.current.tempC, basis: "air" } : undefined;
  const currentAvailable = temperature !== undefined;
  const reliable = snapshotReliable(weather, now);
  let end = NaN;
  let zoneValid = false;
  let hours: ForecastHour[] = [];
  try {
    if (!weather.timezone) throw new Error("Missing location time zone");
    new Intl.DateTimeFormat("en", { timeZone: weather.timezone }).format(now);
    const day = getZonedDateTimeParts(new Date(now), weather.timezone);
    end = createDateAtTimeInZone(addZonedCalendarDays(day, 1), "00:00", weather.timezone).getTime();
    zoneValid = Number.isFinite(end) && end > now;
    // A clock-only value cannot establish which calendar day the provider meant.
    hours = forecastHours({ ...weather, hourly: weather.hourly.filter(h => /^\d{4}-\d{2}-\d{2}T/.test(h.time)) })
      .filter(h => h.at + 3_600_000 > now && h.at < end);
  } catch { /* No inferred device zone or confident forecast without a location zone. */ }
  const usable = hours.filter(h => Number.isFinite(h.tempC) && Number.isFinite(h.windMs)
    && Number.isFinite(h.rainProbabilityPct) && h.rainProbabilityPct >= 0 && h.rainProbabilityPct <= 100
    && Number.isFinite(h.precipitationMm) && h.precipitationMm >= 0
    && (weather.source !== "weatherkit" || (h.available?.temp && h.available.wind && h.available.rainProbability && h.available.precipitation)));
  let coveredTo = now;
  for (const h of usable) {
    if (h.at > coveredTo) break;
    coveredTo = Math.max(coveredTo, h.at + 3_600_000);
  }
  const complete = zoneValid && coveredTo >= end;
  const usableHours = reliable && zoneValid ? usable : [];
  // Provider current probability/amount may come from its first forecast hour.
  // Recompute them from the interval containing now; preserve actual condition.
  const currentHour = usableHours.find(h => h.at <= now && h.at + 3_600_000 > now);
  const scoped: WeatherSnapshot = { ...weather, daily: undefined, hourly: usableHours,
    current: { ...weather.current, rainProbabilityPct: currentHour?.rainProbabilityPct ?? 0,
      precipitationMm: currentHour?.precipitationMm ?? 0 } };
  const outfit = recommendOutfit(scoped, profile, wardrobe, { temperature: temperature ?? null });
  const status = !reliable ? "최근 자료 · 최신 확인 필요" : !zoneValid ? "위치 시간대 확인 필요"
    : !usable.length ? "오늘 남은 시간 예보 없음" : !complete ? "오늘 예보 일부 미확인" : "오늘 남은 시간 기준";
  const wet = usableHours.find(h => h.condition === "rain" || h.condition === "storm" || h.condition === "snow" || h.rainProbabilityPct >= 60 || h.precipitationMm >= 1);
  let decision = outfit.decisionText;
  if (!reliable) decision = "최신 날씨를 확인한 뒤 코디를 안내해요";
  else if (!zoneValid) decision = "위치 시간대를 확인한 뒤 코디를 안내해요";
  else if (weather.current.condition === "snow") decision = "현재 눈 · 미끄럼 적은 신발을 챙겨요";
  else if (weather.current.condition === "rain" || weather.current.condition === "storm") decision = "현재 비 · 우산과 방수 신발을 챙겨요";
  else if (wet) {
    const p = getZonedDateTimeParts(new Date(wet.at), weather.timezone!);
    const clock = `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
    decision = wet.condition === "snow" ? `오늘 ${clock} 무렵 눈 예보 · 미끄럼에 대비해요`
      : wet.condition === "rain" || wet.condition === "storm" ? `오늘 ${clock} 무렵 비 예보 · 우산을 챙겨요`
      : `오늘 ${clock} 무렵 강수 가능 · 방수 차림을 준비해요`;
  } else if (!currentAvailable) decision = outfit.decisionText;
  else if (!complete) decision = "예보를 확인한 뒤 오늘 코디를 준비해요";
  const observed = Date.parse(weather.observedAt);
  let observedLabel: string | undefined;
  if (observationAvailable && zoneValid && Number.isFinite(observed)) {
    const p = getZonedDateTimeParts(new Date(observed), weather.timezone!);
    observedLabel = `${p.month}/${p.day} ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
  }
  return { outfit: { ...outfit, decisionText: decision,
    reasons: reliable && complete ? outfit.reasons : [],
    timeAdvice: reliable && zoneValid ? outfit.timeAdvice : [] },
    outfitContext: { status, observedLabel, currentAvailable, temperature, weather: scoped, complete, reliable } satisfies TodayOutfitContext };
}
