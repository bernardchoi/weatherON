import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import { DatabaseSync } from "node:sqlite";

// Execute production TypeScript with only platform boundaries replaced. No
// dependencies, generated files, network, device, or installed SQLite required.
const read = (path) => readFileSync(path, "utf8").replaceAll("\r\n", "\n");
function load(path, names, bindings = {}, replacements = []) {
  let source = stripTypeScriptTypes(read(path));
  for (const [before, after] of replacements) source = source.replaceAll(before, after);
  const js = source.replace(/^import[\s\S]*?;\n/gmu, "").replace(/^export /gmu, "");
  return new Function(...Object.keys(bindings), `${js}\nreturn {${names.join(",")}};`)(...Object.values(bindings));
}
const flush = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const appKey = "weatheron.appState.v1";
const markerKey = "weatheron.storage.sqlite-schema.v2";
const legacyState = {
  onboardingCompleted: true, selectedStyles: ["minimal"],
  savedDestinations: ["home", "office"].map((id) => ({
    place: { id, name: id, coordinate: { latitude: 37, longitude: 127 }, timezone: "Asia/Seoul" },
    schedulePreference: { repeatDays: ["mon", "fri"] },
  })),
};
const legacySnapshot = {
  locationId: "home", locationName: "home", countryCode: "JP", timezone: "Asia/Tokyo",
  observedAt: "2026-10-03T01:00:00Z", source: "weatherkit", stale: false,
  current: { tempC: 20, feelsLikeC: 20, condition: "clear", precipitationMm: 0, rainProbabilityPct: 0, windMs: 1, humidityPct: 50 }, hourly: [],
};
function storageHarness({ failSql = 0, failRead = false, failCommit = false, failCleanup = false, invalid = false, table = false } = {}) {
  const db = new DatabaseSync(":memory:");
  if (table) {
    db.exec("CREATE TABLE app_values (key TEXT, value TEXT)");
    db.prepare("INSERT INTO app_values VALUES (?, ?)").run(appKey, JSON.stringify({ ...legacyState, selectedStyles: ["table"] }));
  }
  const files = new Map([
    [`file:///docs/weatheron/${appKey}.json`, invalid ? "{" : JSON.stringify(legacyState)],
    ["file:///docs/weatheron/weatheron.notificationState.v1.json", JSON.stringify({ readNotificationIds: ["read-1"], notificationHistory: [] })],
    ["file:///docs/weatheron/weatheron.weatherProviderResult.v1.json", JSON.stringify({ current: legacySnapshot, destination: legacySnapshot, destinationSnapshots: [legacySnapshot], status: "ready" })],
    ["file:///docs/weatheron/weatheron.specialAlertDelivery.v1.json", JSON.stringify({ alert: "2026-10-03T01:00:00Z" })],
  ]);
  const state = { failSql, failRead, failCommit, failCleanup, operations: 0, committed: false, inTransaction: false };
  const checkpoint = () => {
    if (state.inTransaction && ++state.operations === state.failSql) throw new Error("Injected SQL failure");
  };
  const database = {
    execAsync: async (sql) => db.exec(sql),
    getFirstAsync: async (sql, ...args) => { checkpoint(); return db.prepare(sql).get(...args) ?? null; },
    getAllAsync: async (sql, ...args) => { checkpoint(); return db.prepare(sql).all(...args); },
    runAsync: async (sql, ...args) => { checkpoint(); return db.prepare(sql).run(...args); },
    withTransactionAsync: async (fn) => {
      db.exec("BEGIN"); state.inTransaction = true;
      try {
        await fn();
        if (state.failCommit) throw new Error("Injected commit failure");
        db.exec("COMMIT"); state.committed = true;
      } catch (error) {
        db.exec("ROLLBACK"); throw error;
      } finally { state.inTransaction = false; }
    },
  };
  const fileSystem = {
    documentDirectory: "file:///docs/",
    getInfoAsync: async (uri) => ({ exists: files.has(uri) }),
    readAsStringAsync: async (uri) => {
      if (state.failRead) throw new Error("Injected read failure");
      return files.get(uri);
    },
    deleteAsync: async (uri) => {
      assert.equal(state.committed, true, "never remove a source before commit");
      if (state.failCleanup) throw new Error("Injected cleanup failure");
      files.delete(uri);
    },
  };
  const api = load("apps/mobile/src/providers/appStorage.ts", ["readAppValue", "writeAppValue", "migrateLegacyStorage"], { testDatabase: database, fileSystem }, [
    ['import("expo-sqlite")', "Promise.resolve({ openDatabaseAsync: async () => testDatabase })"],
    ['import("expo-file-system/legacy")', "Promise.resolve(fileSystem)"],
  ]);
  return { db, database, api, files, state };
}
const migrated = storageHarness();
const restored = await migrated.api.readAppValue(appKey, true);
assert.deepEqual(restored.savedDestinations.map((item) => item.place.id), ["home", "office"]);
assert.deepEqual(restored.savedDestinations[0].schedulePreference.repeatDays, ["mon", "fri"]);
assert.deepEqual(restored.readNotificationIds, ["read-1"]);
assert.equal((await migrated.api.readAppValue("weatheron.weatherProviderResult.v1", true)).current.current.tempC, 20);
assert.equal(migrated.files.size, 0);
const operationCount = migrated.state.operations;
migrated.db.close();

// Inject at every SQL write/read in the migration transaction, including the
// verification reads and the completion marker. Exercise a real SQLite rollback.
for (let failSql = 1; failSql <= operationCount; failSql++) {
  const h = storageHarness({ failSql });
  await assert.rejects(h.api.readAppValue(appKey, true));
  assert.equal(h.files.size, 4, `SQL step ${failSql} preserves every source`);
  assert.equal(h.db.prepare("SELECT COUNT(*) AS count FROM app_meta WHERE key=?").get(markerKey).count, 0);
  assert.equal(h.db.prepare("SELECT COUNT(*) AS count FROM destinations").get().count, 0);
  assert.equal(h.db.prepare("SELECT COUNT(*) AS count FROM weather_snapshots").get().count, 0);
  h.state.failSql = 0;
  const retry = await h.api.readAppValue(appKey, true);
  assert.equal(retry.savedDestinations.length, 2);
  assert.equal(h.files.size, 0);
  await h.api.migrateLegacyStorage(h.database);
  assert.equal(h.db.prepare("SELECT COUNT(*) AS count FROM destinations").get().count, 2);
  h.db.close();
}
for (const failure of ["failRead", "failCommit", "invalid"]) {
  const h = storageHarness({ [failure]: true });
  await assert.rejects(h.api.readAppValue(appKey, true));
  assert.equal(h.files.size, 4);
  h.state.failRead = h.state.failCommit = false;
  if (failure === "invalid") h.files.set([...h.files.keys()][0], JSON.stringify(legacyState));
  assert.equal((await h.api.readAppValue(appKey, true)).savedDestinations.length, 2);
  h.db.close();
}
const cleanup = storageHarness({ failCleanup: true, table: true });
assert.deepEqual((await cleanup.api.readAppValue(appKey, true)).selectedStyles, ["table"], "legacy SQL precedence is preserved");
assert.equal(cleanup.files.size, 4);
await cleanup.api.writeAppValue(appKey, { ...legacyState, selectedStyles: ["edited after migration"] }, true);
await cleanup.api.migrateLegacyStorage(cleanup.database);
assert.deepEqual((await cleanup.api.readAppValue(appKey, true)).selectedStyles, ["edited after migration"], "leftover JSON never overwrites committed edits");
cleanup.db.close();
console.log(`Migration: ${operationCount} SQL failure points, read/decode/commit/cleanup and idempotent retries passed.`);

const { createNotificationSync } = load("apps/mobile/src/providers/notificationSync.ts", ["createNotificationSync"]);
function fakeTimers() {
  let next = 0;
  const pending = new Map();
  return {
    pending,
    setTimeout(fn, delay) { const id = ++next; pending.set(id, { fn, delay }); return id; },
    clearTimeout(id) { pending.delete(id); },
    async fire() { const [id, task] = pending.entries().next().value; pending.delete(id); task.fn(); await flush(); },
  };
}
const { applyLocalNotificationPolicy } = load("apps/mobile/src/providers/notificationPolicy.ts", ["applyLocalNotificationPolicy"]);
const nativePending = new Map();
let failSchedule = true, failCancel = false;
const Notifications = {
  setNotificationHandler() {},
  getPermissionsAsync: async () => ({ granted: true }),
  getAllScheduledNotificationsAsync: async () => [...nativePending.values()],
  getPresentedNotificationsAsync: async () => [],
  scheduleNotificationAsync: async (request) => {
    if (failSchedule) throw new Error("Native scheduling failed");
    nativePending.set(request.identifier, request); return request.identifier;
  },
  cancelScheduledNotificationAsync: async (id) => {
    if (failCancel) throw new Error("Native cancellation failed");
    nativePending.delete(id);
  },
  SchedulableTriggerInputTypes: { CALENDAR: "calendar", DATE: "date" },
};
const { syncLocalWeatherNotifications } = load("apps/mobile/src/providers/localNotifications.ts", ["syncLocalWeatherNotifications"], {
  Platform: { OS: "ios" }, Notifications, applyLocalNotificationPolicy,
  readAppValue: async () => ({}), writeAppValue: async () => {}, translateText: (value) => value,
}, [['import("expo-notifications")', "Promise.resolve(Notifications)"]]);
const timer = fakeTimers();
const results = [];
const coordinator = createNotificationSync(syncLocalWeatherNotifications, timer);
const input = { enabled: true, reducedInterruptions: false, notifications: [{
  id: "rain", type: "rain", active: true, requiresPushPermission: true,
  scheduledAt: new Date(Date.now() + 3_600_000).toISOString(), pushTitle: "Rain", pushBody: "Prepare",
}] };
coordinator.request("on", input, (value) => results.push(value.status));
await flush();
assert.equal(results.at(-1), "verification-failed");
failSchedule = false;
coordinator.request("on", input, (value) => results.push(value.status));
await timer.fire();
assert.equal(results.at(-1), "scheduled");
assert.equal(nativePending.size, 1);
failCancel = true;
coordinator.request("off", { ...input, enabled: false }, (value) => results.push(value.status));
await flush();
assert.equal(results.at(-1), "verification-failed");
assert.equal(nativePending.size, 1);
failCancel = false;
await timer.fire();
assert.equal(results.at(-1), "cancelled");
assert.equal(nativePending.size, 0);
coordinator.stop();

// Older completions cannot acknowledge the latest state, including ON/OFF/ON
// while OFF is already in flight (same final key as an older successful ON).
const jobs = [], delivered = [], raceTimer = fakeTimers();
const racer = createNotificationSync((value) => {
  const job = deferred(); jobs.push({ value, ...job }); return job.promise;
}, raceTimer);
const notify = (value) => delivered.push(value.status);
racer.request("on", { enabled: true }, notify);
jobs[0].resolve({ status: "scheduled", scheduledCount: 1 }); await flush();
racer.request("off", { enabled: false }, notify);
racer.request("on", { enabled: true }, notify);
jobs[1].reject(new Error("obsolete cancellation failure")); await flush();
assert.equal(jobs.length, 3);
assert.deepEqual(delivered, ["scheduled"]);
jobs[2].resolve({ status: "scheduled", scheduledCount: 1 }); await flush();
assert.deepEqual(delivered, ["scheduled", "scheduled"]);
assert.equal(raceTimer.pending.size, 0);
racer.retry(); assert.equal(jobs.length, 4);
racer.stop(); jobs[3].resolve({ status: "scheduled", scheduledCount: 1 }); await flush();
assert.equal(delivered.length, 2, "unmounted callbacks do not update state");
const superseded = [], latestOnly = [];
const toggles = createNotificationSync((value) => {
  const job = deferred(); superseded.push({ ...job, value }); return job.promise;
}, fakeTimers());
toggles.request("on", { enabled: true }, (value) => latestOnly.push(value.status));
toggles.request("off", { enabled: false }, (value) => latestOnly.push(value.status));
superseded[0].resolve({ status: "scheduled", scheduledCount: 1 }); await flush();
assert.equal(superseded[1].value.enabled, false);
assert.deepEqual(latestOnly, [], "obsolete success cannot mark the latest disabled intent successful");
superseded[1].resolve({ status: "cancelled", scheduledCount: 0 }); await flush();
assert.deepEqual(latestOnly, ["cancelled"]); toggles.stop();
const retryTimer = fakeTimers(); let attempts = 0;
const verifier = createNotificationSync(async () => { attempts++; return { status: "verification-failed", scheduledCount: 1 }; }, retryTimer);
verifier.request("off", { enabled: false }, () => {}); await flush();
for (let i = 0; i < 3; i++) await retryTimer.fire();
assert.equal(attempts, 4); assert.equal(retryTimer.pending.size, 0, "automatic retries are bounded");
verifier.request("off", { enabled: false }, () => {}); await flush();
assert.equal(attempts, 5, "same input can retry after budget is exhausted");
verifier.stop();
console.log("Notifications: native schedule/cancel failures, verification retries, rapid toggles, foreground reconciliation and stale completions passed.");

const conditions = load("packages/shared/src/weather/condition.ts", ["conditionFromWeatherKit", "conditionFromOpenMeteo"]);
const { isValidIanaTimeZone } = load("packages/shared/src/weather/timezone.ts", ["isValidIanaTimeZone"]);
const { normalizeWeatherKitWeather } = load("packages/shared/src/weather/weatherKitAdapter.ts", ["normalizeWeatherKitWeather"], { ...conditions, isValidIanaTimeZone });
const { normalizeOpenMeteoWeather } = load("packages/shared/src/weather/openMeteoAdapter.ts", ["normalizeOpenMeteoWeather"], conditions);
const location = (id, latitude) => ({ locationId: id, locationName: id, countryCode: "JP", timezone: "Asia/Tokyo", coordinate: { latitude, longitude: 140 } });
const home = location("home", 35), away = location("away", 36), other = location("other", 37);
const now = Date.now();
const payload = (temperature, time = now) => ({ currentWeather: { asOf: new Date(time).toISOString(), temperature, conditionCode: "Clear", humidity: 0.5 } });
const weatherBindings = {
  Platform: { OS: "ios" }, getWeatherRuntimeConfig: () => ({ clientMode: "proxy" }),
  runtimeWeatherClient: {}, fixtureWeatherClient: {},
  defaultSeoulWeatherLocation: home, seongsuWeatherLocation: home,
  defaultGangneungWeatherLocation: away, gangneungWeatherLocation: away,
  normalizeWeatherKitWeather, normalizeOpenMeteoWeather, isValidIanaTimeZone,
  openMeteoFixture: { current: { time: new Date(now).toISOString(), temperature_2m: 10 } },
};
const { createWeatherProvider } = load("apps/mobile/src/providers/weatherProvider.ts", ["createWeatherProvider"], weatherBindings);
const updates = [], slow = deferred();
const provider = createWeatherProvider({ fetchWeatherKitForecast: async ({ latitude }) => latitude === 35 ? payload(21) : slow.promise });
const options = { currentLocation: home, destinationLocation: away };
let finished = false;
const pendingWeather = provider.getSnapshots("ready", { ...options, onUpdate: (value) => updates.push(value) }).then((value) => { finished = true; return value; });
await flush();
assert.equal(finished, false);
assert.equal(updates.at(-1).current.current.tempC, 21, "current is delivered before slow destination");
slow.reject(new Error("destination timeout"));
const partial = await pendingWeather;
assert.equal(partial.current.source, "weatherkit");
assert.equal(partial.current.stale, false);
assert.equal(partial.destination.source, "fallback");
assert.equal(partial.status, "error");
const failedAgain = await provider.getSnapshots("error", options);
assert.equal(failedAgain.current.current.tempC, 21, "successful current cached even when destination failed");
assert.equal(failedAgain.current.stale, true);

let destinationFails = false;
const cached = createWeatherProvider({ fetchWeatherKitForecast: async ({ latitude }) => {
  if (destinationFails && latitude !== 35) throw new Error("destination offline");
  return payload(latitude === 35 ? 22 : 17);
} });
await cached.getSnapshots("ready", options); destinationFails = true;
const byLocation = await cached.getSnapshots("ready", { ...options, destinationLocations: [other, away] });
assert.equal(byLocation.current.current.tempC, 22);
assert.equal(byLocation.destinationSnapshots.find((s) => s.locationId === "away").current.tempC, 17);
assert.equal(byLocation.destinationSnapshots.find((s) => s.locationId === "away").stale, true);
assert.equal(byLocation.destinationSnapshots.find((s) => s.locationId === "other").source, "fallback");

let calls = 0;
const freshness = createWeatherProvider({ fetchWeatherKitForecast: async () => { calls++; return payload(25); } });
const old = normalizeWeatherKitWeather(payload(5, now - 3_600_000), { ...home, timezone: home.timezone });
await freshness.getSnapshots("ready", { ...options, currentSnapshot: old });
assert.equal(calls, 2, "expired supplied snapshot is refetched");
calls = 0;
const fresh = { ...old, observedAt: new Date(now).toISOString() };
await freshness.getSnapshots("ready", { ...options, currentSnapshot: fresh });
assert.equal(calls, 1, "fresh current can be reused for destination-only changes");
const oldJob = deferred(); let round = 0;
const racingWeather = createWeatherProvider({ fetchWeatherKitForecast: async ({ latitude }) => {
  if (latitude === 35 && round++ === 0) return oldJob.promise;
  return payload(30, now + 1_000);
} });
const oldRequest = racingWeather.getSnapshots("ready", options);
await racingWeather.getSnapshots("ready", options);
oldJob.resolve(payload(1, now - 10_000)); await oldRequest;
assert.equal((await racingWeather.getSnapshots("error", options)).current.current.tempC, 30, "late older observation cannot poison cache");

const persistedApi = load("apps/mobile/src/state/persistedAppState.ts", ["shouldKeepPersistedWeatherResult", "savePersistedWeatherProviderResult", "readPersistedWeatherProviderResult"], {
  readAppValue: async () => partial, writeAppValue: async (_, value) => { assert.equal(value, partial); }, weatherProviderResultStorageKey: "weather",
});
assert.equal(persistedApi.shouldKeepPersistedWeatherResult(partial, { ...partial, current: old }), false);
persistedApi.savePersistedWeatherProviderResult(partial);
const persisted = await persistedApi.readPersistedWeatherProviderResult("weatherkit");
assert.equal(persisted.current.current.tempC, 21, "partial WeatherKit result survives persistence");
assert.equal(persisted.current.stale, true);
const offline = createWeatherProvider({ fetchWeatherKitForecast: async () => { throw new Error("offline"); } });
const seeded = await offline.getSnapshots("ready", { ...options, cachedSnapshots: [persisted.current, ...persisted.destinationSnapshots] });
assert.equal(seeded.current.current.tempC, 21);
assert.equal(seeded.destination.source, "fallback");
console.log("Weather: partial/slow failures, location-specific cache, freshness, persistence and late responses passed.");

const currentFailure = createWeatherProvider({ fetchWeatherKitForecast: async ({ latitude }) => {
  if (latitude === 35) throw new Error("current offline");
  return payload(18);
} });
const destinationSuccess = await currentFailure.getSnapshots("ready", options);
assert.equal(destinationSuccess.current.source, "fallback");
assert.equal(destinationSuccess.destination.current.tempC, 18);
assert.equal(destinationSuccess.destination.stale, false);

// Execute the hook's production weather effect. Late progressive/final results
// from an old location must not update UI, loading, refs, or persistent cache.
const hook = stripTypeScriptTypes(read("apps/mobile/src/state/useWeatherOnAppState.ts"));
const effectStart = hook.lastIndexOf("  useEffect(() => {", hook.indexOf("const applyResult"));
const effectEnd = hook.indexOf("\n  }, [", effectStart);
const effectBody = hook.slice(effectStart + "  useEffect(() => {".length, effectEnd);
const hookJobs = [], shown = [], persistedWrites = [], loading = [];
const hookContext = {
  appStateHydrated: true, setIsWeatherLoading: (value) => loading.push(value),
  getActiveWeatherLocation: (_, manual) => manual, weatherLocationMode: "manual", manualWeatherLocation: home, deviceWeatherLocation: null,
  savedDestinationWeatherLocations: [away], fallbackDestinationWeatherLocation: away,
  previousWeatherRequestRef: { current: null }, currentWeatherSnapshotRef: { current: null },
  weatherProviderMode: "ready", weatherRefreshTick: 0, localePolicy: { language: "en" },
  persistedWeatherProviderResultRef: { current: null }, weatherLoadedFromNetworkRef: { current: false },
  shouldKeepPersistedWeatherResult: persistedApi.shouldKeepPersistedWeatherResult,
  setWeatherProviderResult: (value) => shown.push(value), normalizePersistedWeatherProviderResult: (value) => value,
  savePersistedWeatherProviderResult: (value) => persistedWrites.push(value),
  runtimeWeatherProvider: { getSnapshots: (_, opts) => { const job = deferred(); hookJobs.push({ ...job, opts }); return job.promise; } },
};
const effect = new Function(...Object.keys(hookContext), effectBody);
const oldCleanup = effect(...Object.values(hookContext));
oldCleanup();
hookContext.manualWeatherLocation = away;
const newCleanup = effect(...Object.values(hookContext));
hookJobs[0].opts.onUpdate(partial); hookJobs[0].resolve(partial); await flush();
assert.equal(shown.length, 0); assert.equal(persistedWrites.length, 0);
assert.deepEqual(loading, [true, true]);
const latestResult = { ...partial, current: { ...partial.current, locationId: "away" } };
hookJobs[1].opts.onUpdate(latestResult);
assert.equal(shown.at(-1).current.locationId, "away");
hookJobs[1].resolve(latestResult); await flush();
assert.equal(loading.at(-1), false);
newCleanup();
console.log("Weather hook: obsolete progressive/final responses cannot update UI or persistence.");
console.log("iOS reliability checks passed (native boundaries mocked; migration SQL executed by Node SQLite).");
