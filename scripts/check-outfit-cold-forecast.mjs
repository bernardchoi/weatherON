import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSync } from "esbuild";
import ts from "typescript";

const module = { exports: {} };
new Function("module", "exports", buildSync({ entryPoints: ["packages/shared/src/index.ts"], bundle: true, platform: "node", format: "cjs", write: false }).outputFiles[0].text)(module, module.exports);
const shared = module.exports;
const tomorrowModule = {};
new Function("exports", "require", ts.transpileModule(readFileSync("apps/mobile/src/utils/tomorrowWeather.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(tomorrowModule, () => ({ formatDisplayDate: () => "tomorrow", translateText: value => value }));
const now = new Date("2026-10-21T12:00:00Z");
const hour = (tempC, time) => ({ time: `2026-10-22T${time}:00`, tempC, condition: "clear", rainProbabilityPct: 0, precipitationMm: 0, windMs: 1.5, available: { temp: true, wind: true, rainProbability: true, precipitation: true } });
const weather = {
  ...shared.gangneungClearSnapshot, timezone: "Asia/Seoul", source: "weatherkit", observedAt: now.toISOString(),
  current: { ...shared.gangneungClearSnapshot.current, tempC: 16, feelsLikeC: 17, tempAvailable: true, feelsLikeAvailable: true, condition: "clear", rainProbabilityPct: 0, precipitationMm: 0, uvIndex: undefined, pm10: undefined, pm25: undefined },
  hourly: [hour(3.85, "06:00"), hour(14.75, "14:00")],
  daily: [{ date: "2026-10-22", minTempC: 3.85, maxTempC: 14.75, condition: "clear", rainProbabilityPct: 0, precipitationMm: 0, windMs: 1.5 }],
};
const wardrobe = shared.presetWardrobe.map(item => ({ ...item, owned: ["outer-cardigan", "top-striped-long-sleeve", "bottom-wide-denim", "shoes-waterproof-sneakers"].includes(item.id) }));
const tomorrow = tomorrowModule.buildTomorrowWeather(weather, now);
assert.equal(tomorrow.weather.current.tempC, 9.3, "keep raw values for classification; round only for display");
const result = shared.recommendOutfit(tomorrow.weather, shared.defaultPreferenceProfile, wardrobe);
console.log("Repro:", JSON.stringify({ range: tomorrow.summary, representativeAir: tomorrow.weather.current.tempC, outer: result.items.outer.name, top: result.items.top.name, reasons: result.reasons }));
assert.ok(result.items.outer.weatherTags.includes("cold"), "3.85–14.75°C must recommend a warm outer even when a thin cardigan is owned");
assert.ok(result.items.top.weatherTags.includes("cold"), "cold morning needs a warm base layer");
assert.doesNotMatch(result.reasons.join(" "), /얇게|얇은|\d+\.\d+도/, "cold explanations must not recommend thin layers or expose raw decimal temperatures");
assert.ok(result.reasons.some(reason => /최저 4도/.test(reason)), "explain the actual cold forecast as rounded degrees");
// Daily-only and sparse hourly forecasts must retain the cold morning.
for (const hourly of [[], [hour(14.75, "14:00")]]) {
  const scoped = tomorrowModule.buildTomorrowWeather({ ...weather, hourly }, now);
  const outfit = shared.recommendOutfit(scoped.weather, shared.defaultPreferenceProfile, wardrobe);
  assert.ok(outfit.items.outer.weatherTags.includes("cold"));
  assert.match(outfit.reasons[0], /최저 4도/);
  assert.equal(scoped.weather.hourly.length, hourly.length, "never invent hourly observations");
  assert.equal(scoped.weather.current.feelsLikeAvailable, false);
  assert.equal(scoped.weather.current.pm25, undefined, "today's air quality is not tomorrow's forecast");
}
// Keep existing mild-day ownership preference; do not round inputs before classifying.
function recommend(temps, overrides = {}) {
  const forecast = { ...tomorrow.weather, daily: undefined, current: { ...tomorrow.weather.current, tempC: temps[0], feelsLikeC: temps[0], feelsLikeAvailable: true, ...overrides }, hourly: temps.map((temp, index) => hour(temp, String(index + 10).padStart(2, "0"))) };
  return shared.recommendOutfit(forecast, shared.defaultPreferenceProfile, wardrobe);
}
assert.equal(recommend([15, 12, 24]).items.outer.id, "outer-cardigan");
assert.equal(recommend([12, 8, 18]).variant, "cold");
assert.notEqual(recommend([12, 8.01, 18]).variant, "cold");
assert.equal(recommend([30.25, 24.2, 35.1]).items.outer, undefined);
assert.doesNotMatch(recommend([30.25, 24.2, 35.1]).reasons.join(" "), /\d+\.\d+도/);
const windChill = recommend([12, 13, 15], { feelsLikeC: 4.35 });
assert.match(windChill.reasons[0], /체감 4도/);
assert.doesNotMatch(windChill.reasons[0], /최저 12도/);
const wetCold = shared.recommendOutfit({ ...tomorrow.weather, current: { ...tomorrow.weather.current, condition: "rain", precipitationMm: 2, rainProbabilityPct: 90 } }, shared.defaultPreferenceProfile,
  [{ ...wardrobe.find(item => item.id === "outer-cardigan"), id: "owned-light-rain", seasons: ["winter"], weatherTags: ["rain"], owned: true }, ...wardrobe]);
assert.ok(wetCold.items.outer.weatherTags.includes("cold"));
assert.ok(wetCold.items.outer.weatherTags.includes("rain"));
assert.doesNotMatch(wetCold.reasons.join(" "), /얇은|얇게/);
// False availability and non-finite sentinel values must not create an artificial freeze.
const unavailable = { ...tomorrow.weather, daily: undefined, current: { ...tomorrow.weather.current, tempC: 15, feelsLikeC: 15 }, hourly: [hour(16, "12:00"), { ...hour(0, "13:00"), available: { temp: false } }, hour(NaN, "14:00")] };
assert.equal(shared.getWeatherSignals(unavailable).minTempC, 15);
const missingZero = { ...unavailable, hourly: [], current: { ...unavailable.current, tempC: 0, feelsLikeC: 0, tempAvailable: false, feelsLikeAvailable: false } };
assert.equal(shared.getWeatherSignals(missingZero).isCold, false, "a missing current value stored as zero is not freezing weather");
assert.equal(shared.getWeatherSignals(missingZero).isHot, false);
assert.equal(Object.values(shared.recommendOutfit(missingZero, shared.defaultPreferenceProfile, wardrobe).items).filter(Boolean).length, 0);
const noTemperature = shared.recommendOutfit({ ...tomorrow.weather, current: { ...tomorrow.weather.current, tempAvailable: false } }, shared.defaultPreferenceProfile, wardrobe);
assert.equal(Object.values(noTemperature.items).filter(Boolean).length, 0);
// The location's date, not UTC's date or another day's minimum, selects daily extremes.
const utcPreviousDay = { ...tomorrow.weather, observedAt: "2026-10-21T23:00:00Z", hourly: [], daily: [{ ...weather.daily[0], date: "2026-10-21", minTempC: -20 }, weather.daily[0]] };
assert.equal(shared.getWeatherSignals(utcPreviousDay).minTempC, 3.85);
console.log("PASS: screenshot, daily-only/sparse coverage, ownership, cold boundaries, heat, wind chill, cold rain, unavailable data, local date and rounded copy.");
