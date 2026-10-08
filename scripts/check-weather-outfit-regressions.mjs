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
let cancelCalls = 0;
let presented = [];
let received;
let lastResponse = null;
let presentedFailure = false;
let scheduledFailure = false;
let scheduledReadCount = 0;
let failScheduledReadAt;
let onPresented;
let onSchedule;
let failCancelId;
let ignoreCancel = false;
const native = {
  setNotificationHandler() {},
  getPermissionsAsync: async () => ({ granted: true }),
  getAllScheduledNotificationsAsync: async () => { scheduledReadCount++; if (scheduledFailure || scheduledReadCount === failScheduledReadAt) throw new Error("scheduled read failed"); return [...scheduled.values()]; },
  getPresentedNotificationsAsync: async () => { if (presentedFailure) throw new Error("presented read failed"); if (onPresented) await onPresented(); return presented; },
  cancelScheduledNotificationAsync: async (id) => { cancelCalls++; if (id === failCancelId) throw new Error("cancel failed"); if (!ignoreCancel) scheduled.delete(id); },
  addNotificationReceivedListener: (listener) => { received = listener; return { remove() {} }; },
  addNotificationResponseReceivedListener: () => ({ remove() {} }),
  getLastNotificationResponseAsync: async () => lastResponse,
  dismissNotificationAsync: async () => {},
  clearLastNotificationResponseAsync: async () => { lastResponse = null; },
  setBadgeCountAsync: async () => {},
  scheduleNotificationAsync: async (request) => { scheduleCalls++; scheduled.set(request.identifier, request); if (onSchedule) onSchedule(request); return request.identifier; },
  SchedulableTriggerInputTypes: { DATE: "date", CALENDAR: "calendar" },
};
const adapterImports = {
  "../localization/react-native": { Platform: { OS: "ios" } },
  "../localization/localization": { translateText: (text) => text },
  "./appStorage": { readAppValue: async (key) => values.get(key), writeAppValue: async (key, value) => values.set(key, value) },
  "./notificationPolicy": load("apps/mobile/src/providers/notificationPolicy.ts"),
  "expo-notifications": native,
};
const adapter = load("apps/mobile/src/providers/localNotifications.ts", adapterImports);
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
  const routine = { ...advisory, id: "routine-test", type: "routine", deliveryKey: undefined, pushTitle: "Routine", pushBody: "Routine body" };
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [advisory, routine] });
  const routineRequest = scheduled.get("weatheron:smart:routine-test");
  const update = async (item) => adapter.syncLocalWeatherNotifications({ ...input, notifications: [item, { ...routine, scheduledAt: "2026-07-05T00:00:00Z" }] });
  const periodChanged = scheduledHeat({ ...hot, daily: [...hot.daily, day("2026-07-06", 34.8)] })[0];
  assert.equal(periodChanged.deliveryKey, advisory.deliveryKey);
  await update(periodChanged);
  assert.equal(scheduled.get(request.identifier).content.body, periodChanged.pushBody);
  assert.equal(scheduled.get("weatheron:smart:routine-test"), routineRequest, "unaffected recurring request must be retained");
  const afterContentChange = scheduleCalls;
  await update(periodChanged);
  assert.equal(scheduleCalls, afterContentChange, "same input must not churn");
  const atChanged = { ...periodChanged, scheduledAt: "2026-07-03T23:00:00.000Z" };
  await update(atChanged);
  assert.equal(scheduled.get(request.identifier).trigger.date.toISOString(), atChanged.scheduledAt);
  const zoneOnly = { ...atChanged, scheduleTimeZone: "Asia/Tokyo" };
  await update(zoneOnly);
  assert.equal(scheduled.get(request.identifier).content.data.scheduleTimeZone, "Asia/Tokyo");
  const titleChanged = { ...zoneOnly, pushTitle: "Updated title" };
  await update(titleChanged);
  assert.equal(scheduled.get(request.identifier).content.title, "Updated title");
  const beforeLanguageChange = scheduleCalls;
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [titleChanged, routine], contentRevision: "en" });
  assert.ok(scheduleCalls > beforeLanguageChange);
  const afterLanguageChange = scheduleCalls;
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [titleChanged, routine], contentRevision: "en" });
  assert.equal(scheduleCalls, afterLanguageChange);
  const newLocation = scheduledHeat({ ...hot, locationId: "other-location" })[0];
  assert.notEqual(newLocation.deliveryKey, advisory.deliveryKey);
  await update(newLocation);
  assert.equal(scheduled.get(request.identifier).content.data.deliveryKey, newLocation.deliveryKey);
  const newZone = scheduledHeat({ ...hot, locationId: "other-location", countryCode: "GLOBAL", timezone: "America/New_York" })[0];
  assert.notEqual(newZone.deliveryKey, newLocation.deliveryKey);
  await update(newZone);
  assert.equal(scheduled.get(request.identifier).trigger.date.toISOString(), "2026-07-04T11:30:00.000Z");
  const beforePresentation = scheduleCalls;
  presented = [{ request }]; // Old event shares the identifier but carries a different delivery key.
  await update(newZone);
  assert.equal(scheduleCalls, beforePresentation);
  assert.equal(scheduled.get(request.identifier).content.data.deliveryKey, newZone.deliveryKey);
  assert.ok(values.get("weatheron.specialAlertDelivery.v1")[`received:v3:${advisory.deliveryKey}`]);
  await adapter.addLocalNotificationReceivedListener(() => {});
  const deliveredRequest = scheduled.get(request.identifier);
  received({ request: deliveredRequest });
  await update({ ...newZone, pushBody: "Changed after receipt" });
  assert.equal(scheduled.has(request.identifier), false, "receipt evidence wins even if native still reports a pending identifier");
  const afterDelivery = scheduleCalls;
  await update({ ...newZone, pushTitle: "Changed after delivery" });
  assert.equal(scheduleCalls, afterDelivery, "content change must not resend the delivered event");
  const restartedAdapter = load("apps/mobile/src/providers/localNotifications.ts", adapterImports);
  await restartedAdapter.syncLocalWeatherNotifications({ ...input, notifications: [{ ...newZone, pushBody: "After restart" }, routine] });
  assert.equal(scheduleCalls, afterDelivery, "persisted receipt dedupe must survive module restart");
  const anotherLocation = scheduledHeat({ ...hot, locationId: "third-location", countryCode: "GLOBAL", timezone: "America/New_York" })[0];
  await update(anotherLocation);
  assert.equal(scheduled.get(request.identifier).content.data.deliveryKey, anotherLocation.deliveryKey);
  assert.equal((await adapter.syncLocalWeatherNotifications({ enabled: false, notifications: [] })).status, "cancelled");
  assert.equal(scheduled.size, 0);
  assert.ok(!Object.keys(values.get("weatheron.specialAlertDelivery.v1")).some((key) => key.startsWith("pending:v3:")));
  assert.ok(cancelCalls > 0);
  // Legacy string records use the actual pending event key, not the new input's shared identifier.
  presented = [];
  values.set("weatheron.specialAlertDelivery.v1", { [advisory.deliveryKey]: advisory.scheduledAt });
  scheduled.set(request.identifier, { ...request, content: { ...request.content, data: { deliveryKey: advisory.deliveryKey } } });
  await update(newLocation);
  assert.equal(scheduled.get(request.identifier).content.data.deliveryKey, newLocation.deliveryKey);
  assert.ok(!values.get("weatheron.specialAlertDelivery.v1")[`received:v3:${advisory.deliveryKey}`], "a cancelled future legacy event is not delivered");
  values.set("weatheron.specialAlertDelivery.v1", { [advisory.deliveryKey]: "2026-07-01T00:00:00Z" });
  scheduled.clear();
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [advisory] });
  assert.equal(scheduled.size, 0, "elapsed legacy delivery without a native request remains suppressed");
  const storageKey = "weatheron.specialAlertDelivery.v1";
  const records = () => values.get(storageKey);
  assert.ok(records()[`unknown:v3:${advisory.deliveryKey}`], "elapsed absence is unknown, not received");
  assert.ok(!records()[`received:v3:${advisory.deliveryKey}`]);
  const reboot = () => load("apps/mobile/src/providers/localNotifications.ts", adapterImports);
  await reboot().syncLocalWeatherNotifications(input);
  assert.equal(scheduled.size, 0, "unknown dedupe survives restart");
  // v2 delivered includes old inferred delivery; upgrade must not claim receipt proof.
  values.set(storageKey, { [`delivered:v2:${advisory.deliveryKey}`]: "2026-07-01T00:00:00Z" });
  await reboot().syncLocalWeatherNotifications(input);
  assert.ok(records()[`unknown:v3:${advisory.deliveryKey}`]);
  assert.equal(scheduled.size, 0);
  const migrated = JSON.stringify(records());
  await reboot().syncLocalWeatherNotifications(input);
  assert.equal(JSON.stringify(records()), migrated, "migration must be idempotent");
  // Missing legacy location is never filled from a newly selected location.
  const unscopedKey = "app-high-temperature-v1:heatwave-advisory:2026-07-04";
  values.set(storageKey, { [unscopedKey]: "2026-07-01T00:00:00Z" });
  await reboot().syncLocalWeatherNotifications(input);
  assert.ok(records()[`unknown:v3:${unscopedKey}`]);
  assert.ok(scheduled.has(request.identifier), "unscoped history cannot suppress a scoped place");
  // Explicit OFF cancellation is separate from receipt and can be re-enabled while future.
  await adapter.syncLocalWeatherNotifications({ enabled: false, notifications: [] });
  assert.ok(records()[`cancelled:v3:${advisory.deliveryKey}`]);
  assert.ok(!records()[`received:v3:${advisory.deliveryKey}`]);
  await reboot().syncLocalWeatherNotifications(input);
  assert.ok(records()[`pending:v3:${advisory.deliveryKey}`]);
  assert.ok(!records()[`cancelled:v3:${advisory.deliveryKey}`]);
  // Both OS read failures leave pending requests and durable records exactly untouched.
  for (const fail of ["presented", "scheduled"]) {
    const priorRecords = JSON.stringify(records());
    const priorScheduled = [...scheduled.values()];
    const priorCalls = [scheduleCalls, cancelCalls];
    presentedFailure = fail === "presented";
    scheduledFailure = fail === "scheduled";
    for (const enabled of [true, false]) {
      assert.equal((await adapter.syncLocalWeatherNotifications({ ...input, enabled, notifications: [newLocation] })).status, "verification-failed");
      assert.equal(JSON.stringify(records()), priorRecords);
      assert.deepEqual([...scheduled.values()], priorScheduled);
      assert.deepEqual([scheduleCalls, cancelCalls], priorCalls);
    }
    presentedFailure = false;
    scheduledFailure = false;
  }
  // Failure to read the tray must not turn an absent overdue pending event into anything else.
  scheduled.clear();
  values.set(storageKey, { [`pending:v2:${advisory.deliveryKey}`]: "2026-07-01T00:00:00Z" });
  presentedFailure = true;
  assert.equal((await reboot().syncLocalWeatherNotifications(input)).status, "verification-failed");
  assert.ok(records()[`pending:v2:${advisory.deliveryKey}`]);
  presentedFailure = false;
  await reboot().syncLocalWeatherNotifications(input);
  assert.ok(records()[`unknown:v3:${advisory.deliveryKey}`]);
  assert.equal(scheduled.size, 0);
  // Positive tray evidence upgrades unknown to received and uses the OS receipt date.
  presented = [{ request, date: now - 1000 }];
  await reboot().syncLocalWeatherNotifications(input);
  assert.equal(records()[`received:v3:${advisory.deliveryKey}`], new Date(now - 1000).toISOString());
  assert.ok(!records()[`unknown:v3:${advisory.deliveryKey}`]);
  presented = [];
  await reboot().syncLocalWeatherNotifications(input);
  assert.equal(scheduled.size, 0, "dismissed tray does not erase recorded receipt");
  // Receipts arriving while OS reads are in flight win before reservation changes.
  const duringRead = { ...newLocation, deliveryKey: newLocation.deliveryKey + ":during-read" };
  values.set(storageKey, {});
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [duringRead] });
  const readRequest = scheduled.get(request.identifier);
  onPresented = () => { received({ request: readRequest, date: now }); onPresented = undefined; };
  const callsBeforeReceipt = scheduleCalls;
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [{ ...duringRead, pushBody: "Changed in flight" }] });
  assert.equal(scheduleCalls, callsBeforeReceipt);
  assert.equal(scheduled.size, 0);
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [duringRead] });
  assert.ok(records()[`received:v3:${duringRead.deliveryKey}`]);
  // A receipt fired inside scheduleNotificationAsync removes the just-created replacement.
  const duringSchedule = { ...newLocation, deliveryKey: newLocation.deliveryKey + ":during-schedule" };
  onSchedule = (newRequest) => { received({ request: newRequest, date: now }); onSchedule = undefined; };
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [duringSchedule] });
  assert.equal(scheduled.size, 0);
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [duringSchedule] });
  assert.ok(records()[`received:v3:${duringSchedule.deliveryKey}`]);
  // Partial cancellation persists each confirmed cancellation, retaining failed pending events.
  const first = { ...newLocation, id: "cancel-first", deliveryKey: newLocation.deliveryKey + ":first" };
  const second = { ...newLocation, id: "cancel-second", deliveryKey: newLocation.deliveryKey + ":second" };
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [first, second] });
  failCancelId = "weatheron:smart:cancel-second";
  await assert.rejects(adapter.syncLocalWeatherNotifications({ enabled: false, notifications: [] }), /cancel failed/);
  assert.ok(records()[`cancelled:v3:${first.deliveryKey}`]);
  assert.ok(records()[`pending:v3:${second.deliveryKey}`]);
  assert.equal(scheduled.size, 1);
  failCancelId = undefined;
  await reboot().syncLocalWeatherNotifications({ enabled: false, notifications: [] });
  assert.equal(scheduled.size, 0);
  // A native cancel that resolves but leaves a reservation must never lead to replacement.
  const noCancel = { ...newLocation, deliveryKey: newLocation.deliveryKey + ":uncancelled" };
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [noCancel] });
  ignoreCancel = true;
  const beforeUnverified = scheduleCalls;
  assert.equal((await adapter.syncLocalWeatherNotifications({ ...input, notifications: [{ ...noCancel, pushBody: "changed" }] })).status, "verification-failed");
  assert.equal(scheduleCalls, beforeUnverified);
  ignoreCancel = false;
  await adapter.syncLocalWeatherNotifications({ enabled: false, notifications: [] });

  // Post-cancel verification read failure must stop before scheduling a replacement.
  const interrupted = { ...newLocation, deliveryKey: newLocation.deliveryKey + ":interrupted" };
  await adapter.syncLocalWeatherNotifications({ ...input, notifications: [interrupted] });
  failScheduledReadAt = scheduledReadCount + 2;
  const beforeInterrupted = scheduleCalls;
  assert.equal((await adapter.syncLocalWeatherNotifications({ ...input, notifications: [{ ...interrupted, pushBody: "updated" }] })).status, "verification-failed");
  assert.equal(scheduleCalls, beforeInterrupted);
  assert.ok(records()[`pending:v3:${interrupted.deliveryKey}`], "unverified cancellation retains pending journal");
  failScheduledReadAt = undefined;
  await reboot().syncLocalWeatherNotifications({ ...input, notifications: [interrupted] });
  assert.ok(scheduled.has(request.identifier), "future absent attempt can be recovered after a successful read");
  await adapter.syncLocalWeatherNotifications({ enabled: false, notifications: [] });
  // Scheduling succeeds but final OS verification fails: keep pending, never invent receipt.
  const verificationEvent = { ...newLocation, deliveryKey: newLocation.deliveryKey + ":verification" };
  failScheduledReadAt = scheduledReadCount + 2;
  assert.equal((await adapter.syncLocalWeatherNotifications({ ...input, notifications: [verificationEvent] })).status, "verification-failed");
  assert.ok(records()[`pending:v3:${verificationEvent.deliveryKey}`]);
  assert.ok(!records()[`received:v3:${verificationEvent.deliveryKey}`]);
  failScheduledReadAt = undefined;
  const afterVerificationFailure = scheduleCalls;
  await reboot().syncLocalWeatherNotifications({ ...input, notifications: [verificationEvent] });
  assert.equal(scheduleCalls, afterVerificationFailure, "restart preserves the successfully scheduled attempt");
  // Due-time cancellation cannot prove delivery did not happen between snapshot and cancel.
  const overdue = { ...verificationEvent, scheduledAt: "2026-07-01T00:00:00Z" };
  const pendingRequest = scheduled.get(request.identifier);
  scheduled.set(request.identifier, { ...pendingRequest, content: { ...pendingRequest.content, data: { ...pendingRequest.content.data, scheduledAt: overdue.scheduledAt } } });
  values.set(storageKey, { [`pending:v3:${overdue.deliveryKey}`]: overdue.scheduledAt });
  await adapter.syncLocalWeatherNotifications({ enabled: false, notifications: [] });
  assert.ok(records()[`unknown:v3:${overdue.deliveryKey}`]);
  await reboot().syncLocalWeatherNotifications({ ...input, notifications: [verificationEvent] });
  assert.equal(scheduled.size, 0, "ambiguous due-time cancellation must not resend");

  // A cold-start tap response is positive evidence for its exact key, even after expiry.
  const tapped = { ...newLocation, deliveryKey: newLocation.deliveryKey + ":tapped" };
  values.set(storageKey, { [`unknown:v3:${tapped.deliveryKey}`]: "2026-07-01T00:00:00Z" });
  lastResponse = { notification: { date: now - 2000, request: { ...request, content: { ...request.content, data: { deliveryKey: tapped.deliveryKey } } } }, actionIdentifier: "default" };
  const tapAdapter = reboot();
  await tapAdapter.addLocalNotificationResponseListener(() => {});
  await tapAdapter.syncLocalWeatherNotifications({ ...input, notifications: [tapped] });
  assert.equal(records()[`received:v3:${tapped.deliveryKey}`], new Date(now - 2000).toISOString());
  assert.ok(!records()[`unknown:v3:${tapped.deliveryKey}`]);
  assert.equal(scheduled.size, 0);

} finally { Date.now = originalNow; }
console.log("Weather/outfit regressions passed: original four fixes plus pending content/time/location/timezone replacement, stable inputs, unrelated recurring preservation, exact presented-event identity, receipt dedupe, v3 migration, unknown/cancelled state, failed OS reads, restart, partial cancellation and in-flight receipt races (native mock).");
