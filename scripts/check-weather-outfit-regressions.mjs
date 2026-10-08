import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSync } from "esbuild";
import ts from "typescript";

const sharedModule = { exports: {} };
new Function("module", "exports", buildSync({ entryPoints: ["packages/shared/src/index.ts"], bundle: true, platform: "node", format: "cjs", write: false }).outputFiles[0].text)(sharedModule, sharedModule.exports);
const shared = sharedModule.exports;
function load(path, imports = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("exports", "require", code)(exports, (name) => {
    assert.ok(name in imports, `Unexpected import ${name}`);
    return imports[name];
  });
  return exports;
}
const demo = load("apps/mobile/src/data/demoState.ts", {
  "@weatheron/shared": shared, "../providers/weatherProvider": {},
  "../utils/zonedDateTime": load("apps/mobile/src/utils/zonedDateTime.ts"),
  "../utils/travelEstimate": load("apps/mobile/src/utils/travelEstimate.ts"),
});
const now = Date.parse("2026-07-01T12:00:00+09:00");
const base = { ...shared.gangneungClearSnapshot, timezone: "Asia/Seoul", observedAt: new Date(now).toISOString(), source: "openmeteo", stale: false,
  current: { ...shared.gangneungClearSnapshot.current, tempC: 30, feelsLikeC: 50 }, hourly: [] };
const day = (date, maxTempC) => ({ date, maxTempC, minTempC: 25, rainProbabilityPct: 0, precipitationMm: 0, windMs: 1, condition: "clear" });
const heat = (weather, nowMs = now) => shared.evaluateNotificationRules(weather, { nowMs }).filter((n) => n.type === "heatwave" && n.active);
const build = (weather, nowMs = now, officialSpecialAlert) => demo.buildDemoStateFromWeatherResult({ current: weather, destination: weather, destinationSnapshots: [], officialSpecialAlert, status: "ready", message: "", retryable: false, fallbackUsed: false }, false, { notificationNow: nowMs });
const scheduledHeat = (weather, nowMs = now) => build(weather, nowMs).notifications.filter((n) => n.type === "heatwave" && n.active);

// Current provider feels-like must never turn a cool forecast day into a hot day.
assert.equal(heat({ ...base, daily: [day("2026-07-01", 30), day("2026-07-02", 34)] }).length, 0);
assert.equal(heat({ ...base, daily: [day("2026-07-02", 32.9), day("2026-07-03", 33)] }).length, 0);
assert.equal(heat({ ...base, daily: [day("2026-07-02", 34), day("2026-07-04", 34)] }).length, 0);
const hot = { ...base, daily: [day("2026-07-04", 34), day("2026-07-05", 34)] };
const advisory = scheduledHeat(hot)[0];
assert.equal(advisory.id, "heatwave-advisory");
assert.equal(advisory.scheduledAt, "2026-07-03T22:30:00.000Z");
assert.equal(advisory.forecastEventDate, "2026-07-04");
assert.match(advisory.reason, /2026-07-04부터 2일간 일최고 기온 33℃/);
assert.match(advisory.pushBody, /공식 기상청 특보와 별개/);
assert.doesNotMatch(advisory.title + advisory.pushTitle, /주의보|경보|오늘 한낮/);
assert.match(advisory.deliveryKey, /^app-high-temperature-v1:/);
const warning = scheduledHeat({ ...hot, daily: hot.daily.map((d) => ({ ...d, maxTempC: 35 })) })[0];
assert.equal(warning.id, "heatwave-warning");
assert.notEqual(warning.deliveryKey, advisory.deliveryKey);
// The earliest run wins, even if a later run is longer or hotter.
assert.equal(heat({ ...hot, daily: [...hot.daily, day("2026-07-06", 25), day("2026-07-08", 36), day("2026-07-09", 36), day("2026-07-10", 36)] })[0].forecastEventDate, "2026-07-04");
assert.equal(heat({ ...hot, daily: [day("2026-06-28", 36), day("2026-06-29", 36), ...hot.daily] })[0].forecastEventDate, "2026-07-04");
assert.equal(scheduledHeat(hot, Date.parse("2026-07-04T08:00:00+09:00"))[0].scheduledAt, "2026-07-03T23:00:05.000Z");
assert.equal(scheduledHeat(hot, Date.parse("2026-07-04T18:00:00+09:00")).length, 0);
assert.equal(scheduledHeat(hot, Date.parse("2026-07-06T00:00:00+09:00")).length, 0);
assert.equal(heat({ ...hot, stale: true }).length, 0);
assert.equal(heat({ ...hot, source: "fallback" }).length, 0);
assert.equal(heat({ ...hot, countryCode: "GLOBAL", timezone: undefined }).length, 0);
const official = { source: "kma", active: true, type: "heatwave", level: "warning", title: "폭염경보" };
assert.deepEqual(build(hot, now, official).officialSpecialAlert, official);

// UTC hourly timestamps are grouped by the forecast location's local date.
const hourly = ["2026-07-03T23:00:00Z", "2026-07-04T23:00:00Z"].map((time) => ({ time, tempC: 34, rainProbabilityPct: 0, precipitationMm: 0, windMs: 1, condition: "clear" }));
assert.equal(scheduledHeat({ ...base, daily: undefined, hourly })[0].forecastEventDate, "2026-07-04");
assert.equal(scheduledHeat({ ...hot, countryCode: "GLOBAL", timezone: "America/New_York" })[0].scheduledAt, "2026-07-04T11:30:00.000Z");
const dst = { ...hot, countryCode: "GLOBAL", timezone: "America/New_York", daily: [day("2026-11-01", 34), day("2026-11-02", 34)] };
assert.equal(scheduledHeat(dst, Date.parse("2026-10-31T15:00:00Z"))[0].scheduledAt, "2026-11-01T12:30:00.000Z");
const destinationState = demo.buildDemoStateFromWeatherResult({ current: base, destination: hot, destinationSnapshots: [], status: "ready", message: "", retryable: false, fallbackUsed: false }, true, { notificationNow: now });
assert.equal(destinationState.notifications.find((n) => n.type === "heatwave" && n.active).forecastEventDate, "2026-07-04");

// Rain protection takes priority over ownership, while winter rain gear stays out of summer outfits.
const rainy = { ...base, current: { ...base.current, feelsLikeC: 32, rainProbabilityPct: 90, precipitationMm: 3, condition: "rain", uvIndex: 8 } };
const wardrobe = shared.presetWardrobe.map((item) => ({ ...item, owned: ["shoes-black-sport-sandals", "accessory-navy-baseball-cap", "outer-black-puffer", "accessory-oatmeal-cashmere-scarf", "accessory-brown-leather-gloves"].includes(item.id) }));
const outfit = shared.recommendOutfit(rainy, shared.defaultPreferenceProfile, wardrobe);
for (const item of [outfit.items.outer, outfit.items.shoes, outfit.items.accessory]) {
  assert.ok(item.weatherTags.includes("rain"));
  assert.ok(item.seasons.includes("summer"));
  assert.ok(!item.weatherTags.includes("cold"));
  assert.equal(item.owned, false);
  assert.ok(outfit.preparation.missingItemNames.includes(item.name));
}
assert.deepEqual(outfit.preparation.rainProtectionGaps, []);
const otherOwnership = wardrobe.map((item) => ({ ...item, owned: item.weatherTags.includes("cold") ? !item.owned : item.owned }));
assert.deepEqual(shared.recommendOutfit(rainy, shared.defaultPreferenceProfile, otherOwnership).preparation, outfit.preparation);
assert.equal("matchPct" in outfit, false);
const ownRainShoes = wardrobe.map((item) => ({ ...item, owned: item.id === "shoes-waterproof-sneakers" || item.owned }));
assert.equal(shared.recommendOutfit(rainy, shared.defaultPreferenceProfile, ownRainShoes).items.shoes.id, "shoes-waterproof-sneakers");
const noSummerRain = wardrobe.filter((item) => !(item.category === "shoes" && item.weatherTags.includes("rain") && item.seasons.includes("summer")));
const gapOutfit = shared.recommendOutfit(rainy, shared.defaultPreferenceProfile, noSummerRain);
assert.ok(gapOutfit.preparation.rainProtectionGaps.includes("shoes"));
assert.ok(!gapOutfit.items.shoes.weatherTags.includes("cold"));
const coldRain = { ...rainy, current: { ...rainy.current, tempC: 2, feelsLikeC: 0 } };
assert.ok(shared.recommendOutfit(coldRain, shared.defaultPreferenceProfile, wardrobe).items.shoes.seasons.includes("winter"));
const dry = { ...rainy, current: { ...rainy.current, precipitationMm: 0, rainProbabilityPct: 0, condition: "clear" } };
assert.ok(shared.recommendOutfit(dry, shared.defaultPreferenceProfile, wardrobe).items.accessory.weatherTags.includes("heat"));
const chosen = Object.values(outfit.items).filter(Boolean);
assert.equal(outfit.preparation.totalItemCount, chosen.length);
assert.equal(outfit.preparation.ownedItemCount, chosen.filter((item) => item.owned).length);

// Execute the production Expo notification adapter: the future event stays future,
// resync preserves one request, and disabling cancels it. Native boundaries are mocked.
const scheduled = new Map();
const values = new Map();
let scheduleCalls = 0;
const native = {
  setNotificationHandler() {},
  getPermissionsAsync: async () => ({ granted: true }),
  getAllScheduledNotificationsAsync: async () => [...scheduled.values()],
  getPresentedNotificationsAsync: async () => [],
  cancelScheduledNotificationAsync: async (id) => scheduled.delete(id),
  scheduleNotificationAsync: async (request) => { scheduleCalls++; scheduled.set(request.identifier, request); return request.identifier; },
  SchedulableTriggerInputTypes: { DATE: "date", CALENDAR: "calendar" },
};
const adapter = load("apps/mobile/src/providers/localNotifications.ts", {
  "../localization/react-native": { Platform: { OS: "ios" } },
  "../localization/localization": { translateText: (text) => text },
  "./appStorage": { readAppValue: async (key) => values.get(key), writeAppValue: async (key, value) => values.set(key, value) },
  "./notificationPolicy": load("apps/mobile/src/providers/notificationPolicy.ts"),
  "expo-notifications": native,
});
const originalNow = Date.now;
try {
  Date.now = () => now;
  const input = { enabled: true, reducedInterruptions: false, notifications: [advisory] };
  assert.equal((await adapter.syncLocalWeatherNotifications(input)).scheduledCount, 1);
  const request = [...scheduled.values()][0];
  assert.equal(request.trigger.type, "date");
  assert.equal(request.trigger.date.toISOString(), advisory.scheduledAt);
  assert.equal(request.content.title, advisory.pushTitle);
  assert.match(request.content.body, /공식 기상청 특보와 별개/);
  assert.equal(request.content.data.deliveryKey, advisory.deliveryKey);
  await adapter.syncLocalWeatherNotifications(input);
  assert.equal(scheduleCalls, 1);
  assert.equal((await adapter.syncLocalWeatherNotifications({ enabled: false, notifications: [] })).status, "cancelled");
  assert.equal(scheduled.size, 0);
} finally { Date.now = originalNow; }
console.log("Weather/outfit regressions passed: honest temperature basis, earliest dates, local-time scheduling, DST, stale forecasts, official-alert separation, rain/thermal priority, selected-item preparation, native-adapter scheduling/dedupe/cancellation (mock).");
