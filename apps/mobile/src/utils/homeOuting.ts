import { judgePreparationConditions, judgeThermal, thermalPreparation, validTemperature, validMeasure } from "../../../../packages/shared/src/rules/thermalJudgment";
import type { HourlyWeather, WeatherSnapshot } from "@weatheron/shared";
import { addZonedCalendarDays, createDateAtTimeInZone, getZonedDateTimeParts, parseDateTimeInZone } from "./zonedDateTime";

export type RainForecastContext = { locationId: string; targetAt?: string; basisLabel: string };
export type ForecastHour = HourlyWeather & { at: number };
const hourMs = 3_600_000;
const validZones = new Map<string, boolean>();
function validZone(zone: string) {
  if (validZones.has(zone)) return validZones.get(zone)!;
  try { new Intl.DateTimeFormat("en", { timeZone: zone }).format(0); validZones.set(zone, true); return true; }
  catch { validZones.set(zone, false); return false; }
}

export function snapshotReliable(weather: WeatherSnapshot | undefined, now = Date.now()) {
  if (!weather || weather.locationUnverified || weather.stale || weather.source === "fallback" || weather.source === "cache") return false;
  const age = now - Date.parse(weather.observedAt);
  return Number.isFinite(age) && age >= -60_000 && age < 15 * 60_000;
}

export function forecastHours(weather: WeatherSnapshot | undefined): ForecastHour[] {
  if (!weather) return [];
  const zone = weather.timezone ?? (weather.countryCode === "KR" ? "Asia/Seoul" : weather.countryCode === "JP" ? "Asia/Tokyo" : undefined);
  if (!zone || !validZone(zone) || !Number.isFinite(Date.parse(weather.observedAt))) return [];
  try {
    let day = getZonedDateTimeParts(new Date(weather.observedAt), zone);
    let previous = -Infinity;
    const seen = new Set<number>();
    return weather.hourly.flatMap(hour => {
      let at: number;
      if (/^([01]\d|2[0-3]):[0-5]\d$/.test(hour.time)) {
        at = createDateAtTimeInZone(day, hour.time, zone).getTime();
        if (previous !== -Infinity && at < previous) {
          day = { ...day, ...addZonedCalendarDays(day, 1) };
          at = createDateAtTimeInZone(day, hour.time, zone).getTime();
        }
      } else if (/^\d{4}-\d{2}-\d{2}T/.test(hour.time)) {
        at = parseDateTimeInZone(hour.time, zone).getTime();
      } else return [];
      previous = at;
      if (!Number.isFinite(at) || seen.has(at)) return [];
      seen.add(at);
      return [{ ...hour, at }];
    }).sort((a, b) => a.at - b.at);
  } catch { return []; }
}

export function forecastAt(weather: WeatherSnapshot | undefined, targetAt: string | undefined) {
  const at = targetAt ? Date.parse(targetAt) : NaN;
  if (!Number.isFinite(at)) return undefined;
  // Only an actually supplied hourly interval covers the selected instant. Gaps stay unknown.
  return forecastHours(weather).find(hour => hour.at <= at && at < hour.at + hourMs);
}

export function forecastTime(at: number, weather: WeatherSnapshot | undefined) {
  const zone = weather?.timezone ?? (weather?.countryCode === "KR" ? "Asia/Seoul" : weather?.countryCode === "JP" ? "Asia/Tokyo" : undefined);
  if (!zone || !validZone(zone) || !Number.isFinite(at)) return "시각 확인 필요";
  try {
    const p = getZonedDateTimeParts(new Date(at), zone);
    return `${p.month}/${p.day} ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
  } catch { return "시각 확인 필요"; }
}

export function resolveRainWeather(context: RainForecastContext | null | undefined, origin: WeatherSnapshot, destinations: Record<string, WeatherSnapshot>, active: WeatherSnapshot) {
  if (!context) return active;
  if (context.locationId === origin.locationId) return origin;
  // A removed/changed destination must never silently become another location's forecast.
  return destinations[context.locationId];
}

export function buildRainForecast(weather: WeatherSnapshot | undefined, context?: RainForecastContext | null, now = Date.now()) {
  const reliable = snapshotReliable(weather, now);
  const usable = Boolean(weather && weather.source !== "fallback" && !weather.locationUnverified);
  const target = context?.targetAt ? Date.parse(context.targetAt) : undefined;
  const covered = target === undefined || (Number.isFinite(target) && target >= now && Boolean(forecastAt(weather, context?.targetAt)));
  const hours = forecastHours(weather).filter(h => h.at + hourMs > now && (target === undefined || h.at + hourMs > target)).slice(0, 8);
  const bars = covered && usable ? hours.filter(h => (weather?.source !== "weatherkit" || (h.available?.precipitation === true && h.available.rainProbability === true)) && Number.isFinite(h.precipitationMm) && h.precipitationMm >= 0 && Number.isFinite(h.rainProbabilityPct) && h.rainProbabilityPct >= 0 && h.rainProbabilityPct <= 100) : [];
  const missing = bars.length !== hours.length || bars.some((h, i) => i > 0 && h.at - bars[i - 1].at > hourMs);
  const hasRain = bars.some(h => h.precipitationMm > 0);
  const maxProbability = bars.length ? Math.max(...bars.map(h => h.rainProbabilityPct)) : undefined;
  const firstRain = bars.find(h => h.precipitationMm > 0);
  const range = bars.length ? `${forecastTime(bars[0].at, weather)}–${forecastTime(bars[bars.length - 1].at + hourMs, weather)}` : "시간별 예보 없음";
  const title = !weather ? "선택한 위치를 다시 확인해 주세요" : !usable ? "날씨를 다시 확인해 주세요" : !reliable ? "최근 기준 · 최신 예보 확인 필요" : target !== undefined && target < now ? "지난 일정이에요 · 시간을 다시 골라 주세요" : !covered ? "선택 시각의 예보가 아직 없어요" : !bars.length ? "시간별 강수 예보가 없어요" : hasRain ? "확인된 시간대에 강수 예보가 있어요" : (maxProbability ?? 0) >= 40 ? "강수 가능성이 있어요" : "확인된 시간대의 강수 신호가 낮아요";
  const summary = !reliable || !covered || !bars.length ? title : firstRain ? `${forecastTime(firstRain.at, weather)} 강수 예보 · 최대 ${maxProbability}%` : `확인 구간 강수확률 최대 ${maxProbability}%`;
  return { reliable, usable, covered, bars, missing, hasRain, maxProbability, firstRain, range, title, summary };
}

export function buildOutingCheck(weather: WeatherSnapshot | undefined, targetAt: string | undefined, now = Date.now(), formatDelta = (value: number) => `${Math.round(value)}°C`) {
  if (!snapshotReliable(weather, now)) return "최신 날씨를 확인한 뒤 준비를 안내해요";
  if (!targetAt || !Number.isFinite(Date.parse(targetAt))) return "출발·도착 시간을 확인해 주세요";
  if (Date.parse(targetAt) < now) return "지난 일정이에요 · 시간을 다시 골라 주세요";
  const hour = forecastAt(weather, targetAt);
  if (!hour) return "선택 시각의 예보가 아직 없어요";
  const preparation = buildHomePreparation(weather, targetAt, true, now);
  const judgment = getPreparationThermal(weather!, hour);
  const difference = hour.tempC - weather!.current.tempC;
  const copy = preparation.copy.replace(/\n/g, " ");
  if (!judgment.cold && !judgment.hot && Number.isFinite(validTemperature(hour.tempC, hour.available?.temp !== false && (weather!.source !== "weatherkit" || hour.available?.temp === true))) && Number.isFinite(validTemperature(weather!.current.tempC, weather!.current.tempAvailable !== false && (weather!.source !== "weatherkit" || weather!.current.tempAvailable === true))) && Number.isFinite(difference) && difference <= -4) {
    return `지금보다 기온 ${formatDelta(-difference)} 낮아요 · ${copy}${preparation.status ? ` · ${preparation.status}` : ""}`;
  }
  return preparation.status ? `${copy} · ${preparation.status}` : copy;
}

export function getCurrentWeatherFeature(weather: WeatherSnapshot, reliable: boolean) {
  if (!reliable) return "최근 기준 날씨예요";
  const c = weather.current;
  if (c.condition === "storm") return "현재 강한 비가 내려요";
  if (c.condition === "snow") return "현재 눈이 내려요";
  if (c.condition === "sleet") return "현재 진눈깨비가 내려요";
  if (c.condition === "hail" || c.condition === "storm-hail") return c.condition === "storm-hail" ? "현재 뇌우와 우박 신호가 있어요" : "현재 우박 신호가 있어요";
  if (c.condition === "mixed") return "현재 비와 눈이 섞여 내려요";
  if (c.precipitationMm > 0 || c.condition === "rain") return "현재 비가 내려요";
  if (c.windMs >= 7) return "현재 바람이 강해요";
  if (c.condition === "dust") return "현재 먼지 신호가 있어요";
  const thermal = getPreparationThermal(weather);
  if (!Number.isFinite(thermal.temperature)) return "현재 날씨를 확인해요";
  if (thermal.hot) return "덥게 느껴지는 날씨예요";
  if (thermal.cold) return "차갑게 느껴지는 공기예요";
  if (thermal.lightLayer) return "선선한 공기예요";
  return "온화하게 느껴지는 공기예요";
}

export function hasFeelsLike(weather: Pick<WeatherSnapshot, "source" | "current">) {
  return Number.isFinite(validTemperature(weather.current.feelsLikeC)) && weather.current.feelsLikeAvailable !== false && (weather.source !== "weatherkit" || weather.current.feelsLikeAvailable === true);
}

// The main Home copy owns the preparation action; the lower area owns its evidence.
export function buildHomePreparation(weather: WeatherSnapshot | undefined, targetAt: string | undefined, hasDestination: boolean, now = Date.now(), temperature = (value: number) => `${Math.round(value)}°C`) {
  const neutral = { copy: "나가기 전, 가는 곳 날씨를\n같이 확인해요.", basis: "목적지 준비", status: "", evidence: "", rainEvidence: false };
  if (!hasDestination) return { ...neutral, copy: "어디로 나갈까요?\n가는 곳부터 같이 골라봐요.", basis: "외출 준비", status: "목적지 선택 필요" };
  if (!snapshotReliable(weather, now)) return { ...neutral, status: "최근 정보 · 새로 확인 필요" };
  const target = targetAt ? Date.parse(targetAt) : NaN;
  if (Number.isFinite(target) && target < now) return { ...neutral, status: "지난 일정 · 시간 다시 선택" };
  const hour = forecastAt(weather, targetAt);
  const current = weather!.current;
  const isForecast = Boolean(hour);
  const available = (field: "temp" | "wind" | "rainProbability" | "precipitation" | "condition") => hour?.available?.[field] !== false && (weather!.source !== "weatherkit" || hour?.available?.[field] === true);
  const temp = hour ? available("temp") && Number.isFinite(validTemperature(hour.tempC)) ? hour.tempC : undefined
    : hasFeelsLike(weather!) ? current.feelsLikeC : current.tempAvailable !== false && (weather!.source !== "weatherkit" || current.tempAvailable === true) && Number.isFinite(validTemperature(current.tempC)) ? current.tempC : undefined;
  const wind = hour ? available("wind") && Number.isFinite(validMeasure(hour.windMs)) ? hour.windMs : undefined
    : current.windAvailable !== false && (weather!.source !== "weatherkit" || current.windAvailable === true) && Number.isFinite(validMeasure(current.windMs)) ? current.windMs : undefined;
  const rainProbability = hour ? available("rainProbability") && Number.isFinite(validMeasure(hour.rainProbabilityPct, true, 100)) ? hour.rainProbabilityPct : undefined : Number.isFinite(validMeasure(current.rainProbabilityPct, current.rainProbabilityAvailable !== false, 100)) ? current.rainProbabilityPct : undefined;
  const precipitation = hour ? available("precipitation") && Number.isFinite(validMeasure(hour.precipitationMm)) ? hour.precipitationMm : undefined : Number.isFinite(validMeasure(current.precipitationMm)) ? current.precipitationMm : undefined;
  const condition = hour ? available("condition") ? hour.condition : undefined : current.condition;
  // Probability and amount describe precipitation, not its phase. Known snow wins.
  const conditions = judgePreparationConditions({ conditions: condition ? [condition] : [], wind: wind ?? NaN, probability: rainProbability ?? NaN, precipitation: precipitation ?? NaN });
  const snowy = conditions.phase === "snow";
  const frozenPrecipitation = conditions.phase === "ice" || conditions.phase === "hail";
  const rainy = conditions.phase === "rain";
  const precipitationPossible = conditions.wet;
  const status = isForecast ? [temp, wind, rainProbability, precipitation, condition].some(value => value === undefined) ? "일부 예보 미확인" : ""
    : targetAt ? "선택 시각 예보 없음 · 현재 기준" : "도착 시각 미확인 · 현재 기준";
  const basis = isForecast ? "목적지 도착 무렵" : "목적지 현재 날씨";
  const evidence = precipitationPossible ? rainProbability !== undefined ? `강수확률 ${rainProbability}%` : snowy ? "눈 소식 있어요" : frozenPrecipitation ? "얼음·혼합 강수 소식 있어요" : rainy ? "비 소식 있어요" : "강수 가능성이 있어요"
    : conditions.windy ? `바람 ${wind!.toFixed(1)}m/s`
    : temp !== undefined ? `${!isForecast && hasFeelsLike(weather!) ? "현재 체감" : "기온"} ${temperature(temp)}` : "";
  const thermal = getPreparationThermal(weather!, hour);
  let copy: string = thermalPreparation(thermal, `${weather!.locationId}:${hour?.time ?? weather!.observedAt.slice(0, 10)}`).copy;
  if (snowy) copy = conditions.windAndWet ? "눈과 바람이 겹쳐요.\n미끄럼 적은 신발로 나가요." : isForecast ? "눈 소식이 있어요.\n미끄럼 적은 신발로 나가요." : "지금 가는 곳에 눈이 와요.\n미끄럼 적은 신발로 나가요.";
  else if (frozenPrecipitation) copy = condition === "hail" || condition === "storm-hail" ? "우박 신호가 있어요.\n실외 이동을 잠시 피하고 확인해요." : "얼음·혼합 강수 소식이에요.\n방수와 미끄럼에 대비해요.";
  else if (rainy && conditions.windAndWet) copy = "비와 바람이 겹쳐요.\n방수 겉옷을 챙겨요.";
  else if (rainy) copy = isForecast ? "비 소식이 있어요.\n우산 하나 챙겨 나가요." : "지금 가는 곳에 비가 와요.\n우산을 챙겨봐요.";
  else if (precipitationPossible) copy = conditions.windAndWet ? "강수와 강한 바람에 대비해요.\n젖지 않을 겉옷을 챙겨요." : "강수 가능성이 있어요.\n젖지 않을 겉옷을 챙겨요.";
  else if (conditions.windy) copy = thermal.cold
    ? "바람이 강하고 추워요.\n바람을 막는 보온 겉옷을 챙겨요."
    : thermal.lightLayer ? "바람이 강해요.\n바람을 막을 겉옷을 챙겨요."
    : "바람이 강해요.\n날아갈 물건을 정리해요.";
  // A precipitation action must not erase cold or heat preparation.
  if (precipitationPossible && thermal.cold) copy += "\n보온 겉옷과 따뜻한 상의도 챙겨요.";
  else if ((precipitationPossible || (wind ?? 0) >= 7) && thermal.hot) copy += "\n통풍 좋은 옷과 물도 챙겨요.";
  if (temp === undefined && !precipitationPossible && !((wind ?? 0) >= 7)) return { ...neutral, basis, status: status || "준비 판단에 필요한 예보 없음", evidence: "" };
  // Unknown rain/wind never become an optimistic 'no rain/no wind' statement.
  return { copy, basis, status, evidence, rainEvidence: precipitationPossible };
}

// A selected hour is a separate context. Never import current apparent
// temperature, humidity or daily extremes into that hour's judgment.
export function getPreparationThermal(weather: WeatherSnapshot, hour?: HourlyWeather) {
  const known = (field: "temp" | "wind") => hour?.available?.[field] !== false && (weather.source !== "weatherkit" || hour?.available?.[field] === true);
  const air = hour ? validTemperature(hour.tempC, known("temp")) : validTemperature(weather.current.tempC, weather.current.tempAvailable !== false && (weather.source !== "weatherkit" || weather.current.tempAvailable === true));
  const apparent = !hour && hasFeelsLike(weather) ? weather.current.feelsLikeC : NaN;
  const wind = hour ? validMeasure(hour.windMs, known("wind")) : validMeasure(weather.current.windMs, weather.current.windAvailable !== false && (weather.source !== "weatherkit" || weather.current.windAvailable === true));
  return judgeThermal({ air, apparent, min: air, max: air, wind, humid: !hour && weather.current.humidityAvailable !== false && weather.current.humidityPct >= 70 });
}
