import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const source = stripTypeScriptTypes(readFileSync("packages/shared/src/rules/umbrella.ts", "utf8"))
  .replace(/^import[^;]+;\n/gmu, "")
  .replace(/^export /gmu, "");
const { recommendUmbrella, UMBRELLA_FORECAST_WINDOW_HOURS } = new Function(`${source}\nreturn { recommendUmbrella, UMBRELLA_FORECAST_WINDOW_HOURS };`)();
const signalSource = readFileSync("apps/mobile/src/utils/umbrellaRainSignals.ts", "utf8");
const demoStateSource = readFileSync("apps/mobile/src/data/demoState.ts", "utf8");
const hour = (index, patch = {}) => ({
  time: `2026-10-17T${String(index).padStart(2, "0")}:00+09:00`, tempC: 16,
  rainProbabilityPct: 0, precipitationMm: 0, windMs: 5, condition: "cloud", ...patch,
});
const weather = (patch = {}) => ({
  locationId: "place", locationName: "place", countryCode: "KR", observedAt: "2026-10-17T22:58:00+09:00", source: "weatherkit", stale: false,
  current: { tempC: 16, feelsLikeC: 16, condition: "cloud", rainProbabilityPct: 0, precipitationMm: 0, windMs: 5, humidityPct: 55 },
  hourly: Array.from({ length: UMBRELLA_FORECAST_WINDOW_HOURS }, (_, index) => hour(index)), ...patch,
});

// Screenshot regression: all displayed hours are dry. A later forecast cell
// must not select a long umbrella against the six-hour chart.
const displayedWindow = { forecastWindowHours: UMBRELLA_FORECAST_WINDOW_HOURS };
assert.equal(recommendUmbrella(weather({ hourly: [...Array.from({ length: 6 }, (_, index) => hour(index)), hour(6, { rainProbabilityPct: 90, precipitationMm: 12, windMs: 9, condition: "rain" })] }), displayedWindow).level, "none");
assert.equal(recommendUmbrella(weather({ hourly: Array.from({ length: 6 }, (_, index) => hour(index, { rainProbabilityPct: 0, precipitationMm: index === 2 ? 1.2 : 0 })) }), displayedWindow).level, "recommended", "measured rain wins even at 0% probability");
assert.equal(recommendUmbrella(weather({ current: { tempC: 16, feelsLikeC: 16, condition: "rain", rainProbabilityPct: 0, precipitationMm: 0, windMs: 2, humidityPct: 55 } }), displayedWindow).level, "recommended", "current rain is not erased by a zero future probability");
assert.equal(recommendUmbrella(weather({ hourly: Array.from({ length: 6 }, (_, index) => hour(index, { available: { temp: true, rainProbability: false, precipitation: false, wind: true, condition: false }, rainProbabilityPct: Number.NaN, precipitationMm: Number.NaN })) , current: { tempC: 16, feelsLikeC: 16, condition: "unknown", rainProbabilityPct: Number.NaN, precipitationMm: Number.NaN, windMs: 2, humidityPct: 55 } }), displayedWindow).title, "강수 정보 확인 중");
assert.equal(recommendUmbrella(weather({ hourly: [hour(0, { condition: "hail" }), ...Array.from({ length: 5 }, (_, index) => hour(index + 1))] }), displayedWindow).prioritizeShelter, true, "near-term hail keeps shelter priority");
assert.equal(recommendUmbrella(weather({ hourly: [hour(0, { rainProbabilityPct: 80, precipitationMm: 2, windMs: 8, condition: "rain" }), ...Array.from({ length: 5 }, (_, index) => hour(index + 1))] }), displayedWindow).title, "우비 또는 방수 아우터 우선");
assert.equal(recommendUmbrella(weather({ hourly: [...Array.from({ length: 6 }, (_, index) => hour(index)), hour(6, { rainProbabilityPct: 90, precipitationMm: 12, windMs: 9, condition: "rain" })] })).title, "우비 또는 방수 아우터 우선", "non-iOS default retains the full forecast");
assert.match(signalSource, /forecastHours\(weather\)[\s\S]*?hour\.at \+ hourMs > observedAt[\s\S]*?\.slice\(0, limit\)/, "iOS window is timestamp-resolved, not raw-array slice");
assert.match(demoStateSource, /forecastHours: getUmbrellaForecastHours\(activeWeather\)/, "iOS recommendation receives the exact chart horizon");
console.log("PASS umbrella window: displayed 0%/0mm stays dry; measured/current rain, unavailable data, wind rainwear, and near-term hail remain distinct.");
