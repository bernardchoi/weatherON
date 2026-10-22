import assert from 'node:assert/strict';
import { buildSync } from 'esbuild';
const load = (file, plugins = []) => {
  const module = { exports: {} };
  const code = buildSync({ entryPoints: [file], bundle: true, platform: 'node', format: 'cjs', write: false, tsconfig: 'apps/mobile/tsconfig.json', plugins, external: ['expo-localization'] }).outputFiles[0].text;
  new Function('module', 'exports', 'require', code)(module, module.exports, () => ({ getLocales: () => [{ languageTag: 'ko-KR', languageCode: 'ko', regionCode: 'KR' }], getCalendars: () => [{ timeZone: 'Asia/Seoul', uses24HourClock: true }] }));
  return module.exports;
};
const s = load('packages/shared/src/index.ts');
const home = load('apps/mobile/src/utils/homeOuting.ts');
const today = load('apps/mobile/src/utils/todayOutfit.ts');
const companion = load('apps/mobile/src/utils/homeCompanion.ts');
const now = Date.parse('2026-10-22T07:40:00+09:00');
const target = '2026-10-22T08:40:00+09:00';
const presence = { temp: true, wind: true, rainProbability: true, precipitation: true, condition: true };
const hour = (tempC, extra = {}) => ({ time: '2026-10-22T08:00:00+09:00', tempC, windMs: 2, rainProbabilityPct: 0, precipitationMm: 0, condition: 'clear', available: presence, ...extra });
const fixture = (tempC = 3, feelsLikeC = 2, hourly = [hour(6)]) => ({ ...s.gangneungClearSnapshot, locationId: 'public-test', locationName: 'Test', timezone: 'Asia/Seoul', source: 'weatherkit', observedAt: new Date(now).toISOString(), stale: false,
  current: { tempC, feelsLikeC, tempAvailable: true, feelsLikeAvailable: true, windAvailable: true, humidityAvailable: true, humidityPct: 50, rainProbabilityAvailable: true, windMs: 2, rainProbabilityPct: 0, precipitationMm: 0, condition: 'clear' }, hourly,
  daily: [{ date: '2026-10-22', minTempC: 3, maxTempC: 15, rainProbabilityPct: 0, precipitationMm: 0, windMs: 2, condition: 'clear' }],
});
const outfit = weather => today.buildTodayOutfit(weather, s.defaultPreferenceProfile, s.presetWardrobe, now);
const prepare = weather => home.buildHomePreparation(weather, target, true, now);
const warm = value => assert.match(value, /보온|따뜻|두툼/);
const noLight = value => assert.doesNotMatch(value, /가볍게|가벼운|얇|한 겹만|편한 차림/);
const repro = fixture();
for (const text of [prepare(repro).copy, home.buildOutingCheck(repro, target, now), outfit(repro).outfit.decisionText, companion.getHomeCompanionMessage(repro, true, now)]) { warm(text); noLight(text); }
assert.equal(prepare(repro).basis, '목적지 도착 무렵');
assert.equal(prepare(repro).evidence, '기온 6°C');
assert.equal(outfit(repro).outfitContext.temperature.value, 2);
assert.ok(outfit(repro).outfit.items.outer.weatherTags.includes('cold'));
console.log('PASS: 3°C / apparent 2°C / arrival 6°C, shared insulation, distinct current/arrival evidence.');

for (const value of [-20, -0.01, 0, 3, 6, 8, 8.01, 12, 12.01, 18, 18.01, 22, 26.99, 27, 30, 38]) {
  const w = { ...fixture(value, value, [hour(value)]), daily: undefined };
  const judgment = s.getWeatherSignals(w);
  const p = prepare(w);
  if (judgment.isCold) { warm(p.copy); noLight(p.copy); warm(s.recommendOutfit(w, s.defaultPreferenceProfile, s.presetWardrobe).decisionText); }
  if (value < 0) assert.match(p.copy, /목도리/);
  if (judgment.isHot) assert.match(p.copy, /통풍|바람 잘 통/);
  assert.equal(prepare(w).copy, p.copy, 'stable copy across repeated renders');
}
const mild = { ...fixture(22, 22, [hour(22)]), daily: undefined };
assert.match(prepare(mild).copy, /온화/);
const summer = { ...fixture(34, 38, [hour(35)]), daily: undefined };
assert.match(prepare(summer).copy, /물/);
const swing = s.getWeatherSignals({ ...mild, hourly: [hour(14), hour(25, { time: '2026-10-22T14:00:00+09:00' })] });
assert.equal(s.thermalPreparation(swing.thermal).kind, 'swing');
const conflict = s.getWeatherSignals({ ...mild, current: { ...mild.current, tempC: -2, feelsLikeC: 35 } });
assert.equal(conflict.isCold, true); assert.equal(conflict.isHot, false);
for (const condition of ['rain', 'snow', 'sleet', 'hail', 'mixed']) for (const windMs of [2, 9]) {
  const w = fixture(3, 2, [hour(-2, { condition, windMs, rainProbabilityPct: 80, precipitationMm: 1 })]);
  const p = prepare(w); warm(p.copy); noLight(p.copy);
  if (condition === 'snow') { assert.match(p.copy, /눈|신발/); assert.doesNotMatch(p.copy, /우산/); }
  if (condition === 'rain' && windMs === 9) assert.match(p.copy, /비와 바람|방수/);
}
const wind = fixture(3, 2, [hour(6, { windMs: 9 })]);
assert.match(prepare(wind).copy, /바람/); warm(prepare(wind).copy); noLight(prepare(wind).copy);
const partial = fixture(20, 20, [hour(3, { rainProbabilityPct: NaN, windMs: NaN, available: { ...presence, wind: false, rainProbability: false } })]);
warm(prepare(partial).copy); assert.match(prepare(partial).status, /일부/);
assert.equal(outfit(partial).outfit.variant, 'cold', 'partial precipitation failure cannot discard cold temperature');
const nanHour = fixture(3, 2, [hour(NaN)]);
assert.match(prepare(nanHour).status, /미확인/); assert.doesNotMatch(prepare(nanHour).copy, /보온|온화|편한 차림/);
for (const value of [NaN, Infinity, null, undefined, 999, -999]) assert.ok(Number.isNaN(s.validTemperature(value)));
for (const value of [-1, 101, NaN]) assert.ok(Number.isNaN(s.validMeasure(value, true, 100)));
const poison = { ...mild, hourly: [hour(NaN, { precipitationMm: NaN, rainProbabilityPct: NaN, windMs: NaN }), hour(6, { windMs: 9, precipitationMm: 2, rainProbabilityPct: 80 })] };
const signals = s.getWeatherSignals(poison); assert.equal(signals.isWindy, true); assert.equal(signals.isRainy, true); assert.equal(signals.minTempC, 6);
console.log('PASS: boundaries, negatives, mild/heat, swing, conflicting signals, cold rain/snow/wind, partial and malformed fields.');

for (const patch of [{ stale: true }, { source: 'cache' }, { source: 'fallback' }, { locationUnverified: true }, { observedAt: new Date(now - 900_000).toISOString() }, { observedAt: new Date(now + 61_000).toISOString() }]) {
 const w = { ...repro, ...patch }; assert.match(prepare(w).status, /최근/); assert.doesNotMatch(prepare(w).copy, /보온|우산|가벼운/); assert.match(outfit(w).outfit.decisionText, /최신/);
}
assert.match(home.buildHomePreparation(repro, '2026-10-22T07:39:00+09:00', true, now).status, /지난/);
const future = home.buildHomePreparation(repro, '2026-10-23T08:40:00+09:00', true, now);
assert.equal(future.basis, '목적지 현재 날씨'); assert.match(future.status, /예보 없음.*현재 기준/);
const hotCurrentColdArrival = fixture(34, 40, [hour(6)]); warm(prepare(hotCurrentColdArrival).copy);
const coldCurrentHotArrival = fixture(3, -1, [hour(35)]); assert.match(prepare(coldCurrentHotArrival).copy, /물/); assert.doesNotMatch(prepare(coldCurrentHotArrival).copy, /목도리/);
const other = { ...mild, locationId: 'other' }; assert.equal(home.resolveRainWeather({ locationId: 'other' }, repro, { other }, repro), other);
assert.equal(home.resolveRainWeather({ locationId: 'removed' }, repro, { other }, other), undefined);
const midday = Date.parse('2026-10-22T12:30:00+09:00');
const pastLow = { ...mild, observedAt: new Date(midday).toISOString(), daily: repro.daily, hourly: [hour(-10, { time: '2026-10-22T05:00:00+09:00' }), hour(22, { time: '2026-10-22T12:00:00+09:00' }), hour(-10, { time: '2026-10-23T05:00:00+09:00' })] };
const remaining = today.buildTodayOutfit(pastLow, s.defaultPreferenceProfile, s.presetWardrobe, midday);
assert.equal(remaining.outfitContext.weather.daily, undefined); assert.equal(remaining.outfitContext.weather.hourly.length, 1); assert.notEqual(remaining.outfit.variant, 'cold');
const midnight = { ...repro, observedAt: '2026-10-22T23:50:00+09:00', hourly: [hour(-2, { time: '2026-10-23T00:00:00+09:00' })] };
assert.equal(home.forecastAt(midnight, '2026-10-23T00:40:00+09:00').tempC, -2);
assert.equal(home.buildHomePreparation(repro, target, true, now, v => `${Math.round(v * 9 / 5 + 32)}°F`).evidence, '기온 43°F');
assert.equal(home.buildHomePreparation(repro, target, true, now).copy, prepare(repro).copy);
console.log('PASS: freshness, dates/midnight, current/forecast/location separation, remaining today, Celsius judgment with Fahrenheit display.');

const tomorrow = load('apps/mobile/src/utils/tomorrowWeather.ts');
const nextDay = { ...repro.daily[0], date: '2026-10-23', minTempC: 22, maxTempC: 30 };
const tomorrowScoped = tomorrow.buildTomorrowWeather({ ...repro, current: { ...repro.current, feelsLikeC: -20, humidityPct: 100, uvIndex: 10, pm25: 100 }, daily: [...repro.daily, nextDay], hourly: [hour(23, { time: '2026-10-23T08:00:00+09:00' })] }, new Date(now));
assert.equal(tomorrowScoped.weather.current.feelsLikeAvailable, false);
assert.ok(Number.isNaN(tomorrowScoped.weather.current.feelsLikeC));
assert.ok(Number.isNaN(tomorrowScoped.weather.current.humidityPct));
assert.equal(tomorrowScoped.weather.current.uvIndex, undefined);
assert.equal(tomorrowScoped.weather.current.pm25, undefined);
assert.equal(s.getWeatherSignals(tomorrowScoped.weather).isCold, false);
const localization = load('apps/mobile/src/localization/localization.ts');
const warningCopies = new Set();
for (const temp of [-5, 3, 16, 22, 35]) for (const condition of ['clear', 'rain', 'snow', 'sleet', 'hail']) for (const windMs of [2, 9]) {
  const w = fixture(temp, temp, [hour(temp, { condition, windMs, precipitationMm: condition === 'clear' ? 0 : 1 })]);
  warningCopies.add(prepare(w).copy);
  warningCopies.add(s.recommendOutfit(w, s.defaultPreferenceProfile, s.presetWardrobe).decisionText);
  warningCopies.add(outfit(w).outfit.decisionText);
  for (const advice of s.recommendOutfit(w, s.defaultPreferenceProfile, s.presetWardrobe).timeAdvice) warningCopies.add(advice.text);
}
for (const temperature of [-5, 3, 16, 22, 35, NaN]) for (const stableKey of ['a', 'b']) {
  const thermal = s.judgeThermal({ air: temperature, apparent: temperature, min: temperature, max: temperature, wind: 2 });
  const result = s.thermalPreparation(thermal, stableKey);
  warningCopies.add(result.copy);
  if (thermal.cold) { warm(result.copy); noLight(result.copy); }
}
const hotAndCold = s.judgeThermal({ air: 22, apparent: 22, min: -2, max: 35, wind: 2 });
assert.equal(hotAndCold.freezing, true);
const mixedTemperatureCopy = s.thermalPreparation(hotAndCold).copy;
warm(mixedTemperatureCopy); assert.match(mixedTemperatureCopy, /더운 시간.*물을/); warningCopies.add(mixedTemperatureCopy);
const missingProbability = fixture(3, 2, [hour(3, { condition: 'rain', rainProbabilityPct: NaN, available: { ...presence, rainProbability: false } })]);
assert.doesNotMatch(s.recommendOutfit(missingProbability, s.defaultPreferenceProfile, s.presetWardrobe).reasons.join(' '), /NaN|undefined/);
for (const copy of warningCopies) for (const lang of ['en', 'ja']) assert.doesNotMatch(localization.translateText(copy, lang), /[가-힣]/u, `${lang}: ${copy}`);
for (const lang of ['en', 'ja', 'ko']) {
  const unknownWarning = '확인되지 않은 새 경고를 지우지 마세요';
  assert.equal(localization.translateText(unknownWarning, lang), unknownWarning, 'unknown copy keeps warning semantics');
}
console.log('PASS: tomorrow has no current apparent/humidity/UV/air quality; actual en/ja translation of composed warning matrices; safe unknown-language-copy fallback.');

const { readFileSync } = await import('node:fs');
const homeSource = readFileSync('apps/mobile/src/screens/HomeScreen.tsx', 'utf8');
assert.match(homeSource, /lineBreakStrategyIOS="hangul-word"/);
assert.match(homeSource, /getHomeOutfitTitle\(outfit.decisionText\)/);
assert.doesNotMatch(homeSource, /getHomeOutfitCopy\(/);
console.log('PASS: all text variants and hourly advice translate; subzero + heat retains both actions; missing probability has no NaN; Home uses judged copy and Korean word wrapping.');

const hotWind = { ...fixture(35, 35, [hour(35, { windMs: 9 })]), daily: undefined };
const hotWindOutfit = s.recommendOutfit(hotWind, s.defaultPreferenceProfile, s.presetWardrobe);
assert.equal(hotWindOutfit.items.outer, undefined);
assert.match(prepare(hotWind).copy, /바람|물/); assert.doesNotMatch(prepare(hotWind).copy, /겉옷을 챙겨/);
assert.doesNotMatch(hotWindOutfit.decisionText, /겉옷을 준비/);
console.log('PASS: hot wind keeps heat preparation without prescribing an extra outer layer.');

const forecastOnly = { ...repro, current: { ...repro.current, tempC: NaN, feelsLikeC: NaN, tempAvailable: false, feelsLikeAvailable: false, uvIndex: Infinity, pm25: NaN } };
const forecastOnlyOutfit = s.recommendOutfit(forecastOnly, s.defaultPreferenceProfile, s.presetWardrobe);
assert.doesNotMatch(forecastOnlyOutfit.reasons.join(' '), /NaN|Infinity|undefined/);
assert.equal(s.getWeatherSignals(forecastOnly).uvIndex, undefined);
assert.equal(s.getWeatherSignals(forecastOnly).pm25, undefined);
const deniedFields = { ...repro, source: 'openmeteo', hourly: [hour(0, { windMs: 12, available: { ...presence, temp: false, wind: false } })] };
assert.doesNotMatch(prepare(deniedFields).copy, /바람/);
assert.match(prepare(deniedFields).status, /일부/);
console.log('PASS: forecast-only cold reasons and malformed UV/air quality never expose numeric sentinels; explicit missing flags apply across providers.');
