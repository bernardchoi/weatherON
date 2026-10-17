import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(file, bindings = {}) {
  const module = { exports: {} };
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", output)(module, module.exports, (id) => {
    if (id in bindings) return bindings[id];
    throw new Error(`Unexpected dependency ${id} from ${file}`);
  });
  return module.exports;
}

const conditions = load("packages/shared/src/weather/condition.ts");
const { conditionFromKma, conditionFromOpenMeteo, conditionFromWeatherKit } = conditions;

for (const [pty, sky, expected] of [
  ["0", "1", "clear"], ["0", "3", "cloud"], ["1", "4", "rain"], ["2", "4", "mixed"],
  ["3", "4", "snow"], ["5", "3", "rain"], ["6", "3", "mixed"], ["7", "4", "snow"],
  [undefined, undefined, "unknown"], ["0", undefined, "unknown"], ["8", "1", "unknown"],
]) assert.equal(conditionFromKma(pty, sky, "ambient-v3"), expected, `iOS KMA ${pty}/${sky}`);

for (const [code, expected] of [[0, "clear"], [3, "cloud"], [61, "rain"], [77, "snow"], [95, "storm"], [96, "storm-hail"], [99, "storm-hail"], [undefined, "unknown"], [98, "unknown"]]) {
  assert.equal(conditionFromOpenMeteo(code, "ambient-v3"), expected, `iOS Open-Meteo ${code}`);
}

for (const [code, expected] of [["Hail", "hail"], ["Sleet", "sleet"], ["WintryMix", "mixed"], ["HeavyRain", "rain"], ["Thunderstorms", "storm"], ["BlowingDust", "dust"], ["Cloudy", "cloud"], ["", "unknown"], ["UnlistedFutureCode", "unknown"]]) {
  assert.equal(conditionFromWeatherKit(code, "ambient-v3"), expected, `iOS WeatherKit ${code}`);
}

for (const [pty, sky, expected] of [["2", "4", "rain"], ["6", "3", "rain"], [undefined, undefined, "clear"]]) assert.equal(conditionFromKma(pty, sky), expected, `Android legacy KMA ${pty}/${sky}`);
for (const [code, expected] of [[96, "storm"], [99, "storm"], [undefined, "clear"], [98, "storm"]]) assert.equal(conditionFromOpenMeteo(code), expected, `Android legacy Open-Meteo ${code}`);
for (const [code, expected] of [["Sleet", "snow"], ["Hail", "clear"], ["WintryMix", "clear"], ["", "clear"]]) assert.equal(conditionFromWeatherKit(code), expected, `Android legacy WeatherKit ${code}`);

const weatherKit = load("packages/shared/src/weather/weatherKitAdapter.ts", { "./condition": conditions, "./timezone": { isValidIanaTimeZone: () => true } });
const normalized = weatherKit.normalizeWeatherKitWeather({
  currentWeather: { asOf: "2026-10-17T01:00:00Z", temperature: 7, conditionCode: "Hail" },
  forecastHourly: { hours: [{ forecastStart: "2026-10-17T02:00:00Z", temperature: 6, conditionCode: "Sleet", precipitationChance: .5, precipitationAmount: 1, windSpeed: 8 }] },
  forecastDaily: { days: [{ forecastStart: "2026-10-18T00:00:00Z", temperatureMin: 2, temperatureMax: 9, conditionCode: "WintryMix", precipitationChance: .6, precipitationAmount: 2, windSpeedAvg: 7 }] },
}, { locationId: "test", locationName: "test", countryCode: "KR", timezone: "Asia/Seoul", observedAt: "2026-10-17T01:00:00Z", conditionProfile: "ambient-v3" });
assert.equal(normalized.current.condition, "hail"); assert.equal(normalized.hourly[0].condition, "sleet"); assert.equal(normalized.daily[0].condition, "mixed");

const openMeteo = load("packages/shared/src/weather/openMeteoAdapter.ts", { "./condition": conditions });
const openMeteoHail = openMeteo.normalizeOpenMeteoWeather({
  current: { weather_code: 96, temperature_2m: 7 },
  hourly: { time: ["2026-10-17T02:00"], temperature_2m: [6], weather_code: [99] },
  daily: { time: ["2026-10-18"], temperature_2m_min: [2], temperature_2m_max: [9], weather_code: [96] },
}, { locationId: "test", locationName: "test", countryCode: "GLOBAL", timezone: "UTC", conditionProfile: "ambient-v3" });
assert.equal(openMeteoHail.current.condition, "storm-hail"); assert.equal(openMeteoHail.current.atmosphere?.kind, "thunder");
assert.equal(openMeteoHail.hourly[0].condition, "storm-hail"); assert.equal(openMeteoHail.daily[0].condition, "storm-hail");
assert.equal(openMeteo.normalizeOpenMeteoWeather({ current: { temperature_2m: 7 } }, { locationId: "test", locationName: "test", countryCode: "GLOBAL", timezone: "UTC", conditionProfile: "ambient-v3" }).current.condition, "unknown");
assert.equal(openMeteo.normalizeOpenMeteoWeather({ current: { weather_code: 96, temperature_2m: 7 } }, { locationId: "test", locationName: "test", countryCode: "GLOBAL", timezone: "UTC" }).current.condition, "storm", "Android keeps the prior Open-Meteo result");

const androidLocation = { locationId: "legacy-android", locationName: "Legacy Android", countryCode: "GLOBAL", timezone: "America/Los_Angeles", coordinate: { latitude: 37, longitude: -122 } };
const weatherProvider = load("apps/mobile/src/providers/weatherProvider.ts", {
  "@weatheron/shared": { normalizeKmaWeather: () => { throw new Error("KMA should not run"); }, normalizeOpenMeteoWeather: openMeteo.normalizeOpenMeteoWeather, normalizeWeatherKitWeather: weatherKit.normalizeWeatherKitWeather, openMeteoFixture: { current: { weather_code: 0, temperature_2m: 0 } }, applyLifestyleIndex: (snapshot) => snapshot, isValidIanaTimeZone: () => true },
  "../localization/react-native": { Platform: { OS: "android" } },
  "../config/weatherEnv": { getWeatherRuntimeConfig: () => ({ clientMode: "fixture" }) },
  "./weatherClient": { runtimeWeatherClient: {}, fixtureWeatherClient: {} },
  "./weatherLocations": { defaultGangneungWeatherLocation: androidLocation, defaultSeoulWeatherLocation: androidLocation, gangneungWeatherLocation: androidLocation, seongsuWeatherLocation: androidLocation },
});
const androidResult = await weatherProvider.createWeatherProvider({
  fetchOpenMeteoForecast: async () => ({
    current: { weather_code: 96, temperature_2m: 7 },
    hourly: { time: ["2026-10-17T02:00"], temperature_2m: [6], weather_code: [99] },
    daily: { time: ["2026-10-18"], temperature_2m_min: [2], temperature_2m_max: [9], weather_code: [96] },
  }),
}, { platform: "android", preferKma: false }).getSnapshots("ready", { currentLocation: androidLocation, destinationLocation: androidLocation, destinationLocations: [] });
assert.equal(androidResult.current.current.condition, "storm");
assert.equal(androidResult.current.hourly[0].condition, "storm");
assert.equal(androidResult.current.daily[0].condition, "storm");

const androidPersistence = load("apps/mobile/src/state/persistedAppState.ts", {
  "@weatheron/shared": { presetWardrobe: [] },
  "../localization/react-native": { Platform: { OS: "android" } },
  "../providers/appStorage": {}, "../utils/wardrobePhotoUri": {}, "../providers/weatherProvider": {},
  "../providers/weatherLocations": {}, "../utils/destination-visual-resolver": {}, "./appStateHelpers": {}, "./appStateTypes": {},
});
const stagedSnapshot = {
  locationId: "staged", locationName: "Staged", countryCode: "GLOBAL", observedAt: "2026-10-17T01:00:00Z", source: "openmeteo", stale: false,
  current: { tempC: 7, feelsLikeC: 7, condition: "storm-hail", precipitationMm: 0, rainProbabilityPct: 0, windMs: 0, humidityPct: 0 },
  hourly: [{ time: "2026-10-17T02:00", tempC: 6, rainProbabilityPct: 0, precipitationMm: 0, windMs: 0, condition: "sleet" }],
  daily: [{ date: "2026-10-18", minTempC: 2, maxTempC: 9, rainProbabilityPct: 0, precipitationMm: 0, windMs: 0, condition: "mixed" }],
};
const remappedPersisted = androidPersistence.normalizePersistedWeatherProviderResult({ current: stagedSnapshot, destination: stagedSnapshot, destinationSnapshots: [stagedSnapshot], status: "ready", message: "", retryable: false, fallbackUsed: false });
assert.equal(remappedPersisted.current.current.condition, "storm");
assert.equal(remappedPersisted.current.hourly[0].condition, "snow");
assert.equal(remappedPersisted.current.daily[0].condition, "rain");

const persistence = readFileSync("apps/mobile/src/state/persistedAppState.ts", "utf8");
for (const state of ["sleet", "hail", "storm-hail", "mixed", "unknown"]) assert.match(persistence, new RegExp(`record\\.condition === "${state}"`));
const storage = readFileSync("apps/mobile/src/providers/appStorage.ts", "utf8");
assert.match(storage, /return Platform\.OS === "ios" \? "unknown" : "clear"/, "Android keeps the prior storage fallback");
assert.equal((storage.match(/textValue\((?:current|hourly|daily)\.condition\) \?\? defaultStoredCondition\(\)/g) ?? []).length, 3, "storage fallback is platform-scoped");
const provider = readFileSync("apps/mobile/src/providers/weatherProvider.ts", "utf8");
assert.match(provider, /const conditionProfile = ios \? "ambient-v3" : "legacy"/);
assert.match(provider, /conditionProfile: Platform\.OS === "ios" \? "ambient-v3" : "legacy"/);
assert.match(persistence, /if \(Platform\.OS !== "android"\) return snapshot/);
assert.match(persistence, /if \(condition === "storm-hail"\) return "storm"/);
const presentation = readFileSync("apps/mobile/src/utils/weatherPresentation.ts", "utf8");
assert.match(presentation, /return "날씨 확인 중"/); assert.match(presentation, /condition === "unknown" \? uiIconAssets\.cloud/);
console.log("PASS weather states: iOS retains provider-specific hail/sleet/mixed values and unknown fallbacks; Android keeps its previous provider, persistence, display-input, and guidance conditions.");
