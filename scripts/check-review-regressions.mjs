import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { buildSync } from "esbuild";
import ts from "typescript";

const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function load(path, imports = {}) {
  const exports = {};
  new Function("exports", "require", compile(readFileSync(path, "utf8")))(exports, (name) => {
    if (name in imports) return imports[name];
    throw new Error(`Unexpected import: ${name}`);
  });
  return exports;
}
function expression(path, predicate) {
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found;
  function visit(node) {
    if (predicate(node, source)) found = node;
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(found, `Missing callback in ${path}`);
  return found.getText(source).replace(/^export /, "");
}
function callback(code, context) {
  return new Function(...Object.keys(context), compile(`const run = ${code};`) + "\nreturn run;")(...Object.values(context));
}
const tick = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

// Run the production SQL against an in-memory SQLite database, including migrations and rollback.
const db = new DatabaseSync(":memory:");
let failOpen = true;
let failRead = false;
let failWriteAfter = 0;
const sqlite = {
  execAsync: async (sql) => db.exec(sql),
  getAllAsync: async (sql, ...args) => {
    if (failRead) throw new Error("database is locked");
    return db.prepare(sql).all(...args);
  },
  getFirstAsync: async (sql, ...args) => db.prepare(sql).get(...args) ?? null,
  runAsync: async (sql, ...args) => {
    if (failWriteAfter > 0 && --failWriteAfter === 0) throw new Error("disk full");
    return db.prepare(sql).run(...args);
  },
  withTransactionAsync: async (run) => {
    db.exec("BEGIN");
    try { await run(); db.exec("COMMIT"); }
    catch (error) { db.exec("ROLLBACK"); throw error; }
  },
};
const storage = load("apps/mobile/src/providers/appStorage.ts", {
  "expo-sqlite": { openDatabaseAsync: async () => {
    if (failOpen) { failOpen = false; throw new Error("temporarily unavailable"); }
    return sqlite;
  } },
});
const key = "weatheron.appState.v1";
await assert.rejects(storage.readAppValue(key, true));
assert.equal(await storage.readAppValue(key, true), null, "opening must be retryable");
const persistencePath = "apps/mobile/src/state/persistedAppState.ts";
const persistenceContext = { ...storage, appStateStorageKey: key, normalizePersistedAppState: (state) => state };
const readPersisted = callback(expression(persistencePath, (node) => ts.isFunctionDeclaration(node) && node.name?.text === "readPersistedAppState"), persistenceContext);
const savePersisted = callback(expression(persistencePath, (node) => ts.isFunctionDeclaration(node) && node.name?.text === "savePersistedAppState"), persistenceContext);
const oldItem = { id: "photo-test", source: "photo", imageUrl: "wardrobe-photos/photo-old.jpg", owned: true };
const savedState = { onboardingCompleted: true, photoWardrobeItems: [oldItem], wardrobeOwnedItemIds: [oldItem.id] };
await storage.writeAppValue(key, savedState, true);
failRead = true;
await assert.rejects(storage.readAppValue(key, true), /locked/);
assert.equal(await storage.readAppValue(key), null, "optional cache reads can still fail softly");
failRead = false;
assert.deepEqual((await storage.readAppValue(key, true)).photoWardrobeItems, [oldItem]);

// Execute the actual hydration effect: failure cannot enable automatic persistence, retry restores data.
const statePath = "apps/mobile/src/state/useWeatherOnAppState.ts";
const hydrateCode = expression(statePath, (node, source) => ts.isArrowFunction(node)
  && ts.isCallExpression(node.parent) && node.parent.expression.getText(source) === "useEffect"
  && node.getText(source).includes("readPersistedAppState()"));
const setters = Object.fromEntries([...new Set(hydrateCode.match(/\bset[A-Z]\w*/g))].map((name) => [name, (value) => { restored[name] = value; }]));
const restored = {};
const hydrate = callback(hydrateCode, {
  ...setters, Platform: { OS: "ios" }, persistedWeatherProviderResultRef: {}, locallyRestoredAccountLinkedRef: {},
  readPersistedWeatherProviderResult: async () => null,
  readPersistedAppState: readPersisted,
  readPersistedNotificationState: async () => ({ readNotificationIds: [], notificationHistory: [] }),
});
failRead = true;
hydrate(); await tick();
assert.equal(restored.setStorageLoadError, true);
assert.notEqual(restored.setAppStateHydrated, true);
failRead = false;
hydrate(); await tick();
assert.equal(restored.setAppStateHydrated, true);
assert.equal(restored.setStorageLoadError, false);
assert.deepEqual(restored.setPhotoWardrobeItems, [oldItem]);
assert.equal(restored.setRoute, "H1");

// Photo save must reject bad approval / failed transactions and publish state only after the commit.
const photoCode = expression(statePath, (node) => ts.isArrowFunction(node)
  && ts.isCallExpression(node.parent) && ts.isVariableDeclaration(node.parent.parent)
  && node.parent.parent.name.getText() === "savePhotoWardrobeItem");
const photoChanges = [];
let approved = true;
const inFlight = { current: null };
const savePhoto = callback(photoCode, {
  appStateHydrated: true, photoSaveInFlightRef: inFlight, persistedStateRef: { current: savedState },
  Platform: { OS: "ios" }, consumePersistedWardrobePhotoApproval: () => approved,
  savePersistedAppState: savePersisted,
  ...Object.fromEntries(["setPhotoWardrobeItems", "setWardrobeOwnedItemIds", "setSelectedWardrobeItemId", "setRecentlyRemovedWardrobeItemId", "setRoute"].map((name) => [name, (value) => photoChanges.push([name, value])])),
});
const newItem = { ...oldItem, imageUrl: "wardrobe-photos/photo-new.jpg" };
approved = false;
await assert.rejects(savePhoto(newItem));
assert.equal(photoChanges.length, 0);
approved = true;
failWriteAfter = 4;
await assert.rejects(savePhoto(newItem), /disk full/);
assert.equal(inFlight.current, null);
assert.equal(photoChanges.length, 0);
assert.deepEqual((await storage.readAppValue(key, true)).photoWardrobeItems, [oldItem], "failed transaction must retain old metadata");
const saving = savePhoto(newItem);
assert.equal(photoChanges.length, 0);
await saving;
assert.equal(photoChanges[0][0], "setPhotoWardrobeItems");
assert.deepEqual((await storage.readAppValue(key, true)).photoWardrobeItems, [newItem]);

const registrationCode = expression("apps/mobile/src/components/WardrobePhotoRegistration.tsx", (node) => ts.isArrowFunction(node)
  && ts.isVariableDeclaration(node.parent) && node.parent.name.getText() === "save");
let failPhotoSave = true;
const removedFiles = [];
const commit = deferred();
const registrationSave = callback(registrationCode, {
  previewUri: "prepared.jpg", draft: {}, isDraftReady: () => true, Platform: { OS: "android" },
  preparedPhoto: {}, existingItem: oldItem, setStatus: () => {}, setMessage: () => {}, setDetailsOpen: () => {},
  persistWardrobePhoto: async () => ({ imageUrl: newItem.imageUrl }),
  onSave: async () => { if (failPhotoSave) throw new Error("save failed"); await commit.promise; },
  removePersistedWardrobePhotos: (uris) => removedFiles.push(...uris), replacePreparedPhoto: () => {},
});
await registrationSave();
assert.deepEqual(removedFiles, []);
failPhotoSave = false;
const registering = registrationSave(); await tick();
assert.deepEqual(removedFiles, [], "old file must survive while the commit is pending");
commit.resolve(); await registering;
assert.deepEqual(removedFiles, [oldItem.imageUrl]);

// Browser storage must report denied access/quota errors when durable user state is requested.
const web = load("apps/mobile/src/providers/appStorage.web.ts");
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
try {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("quota"); },
  } });
  await assert.rejects(web.readAppValue(key, true), /denied/);
  await assert.rejects(web.writeAppValue(key, {}, true), /quota/);
} finally {
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else delete globalThis.localStorage;
}

// An older sync cannot recreate notifications after the newer off operation has completed.
const presented = deferred();
const reachedPresented = deferred();
const scheduled = new Map();
const notifications = {
  getPermissionsAsync: async () => ({ granted: true }), setNotificationHandler() {},
  getAllScheduledNotificationsAsync: async () => [...scheduled.values()],
  getPresentedNotificationsAsync: () => { reachedPresented.resolve(); return presented.promise; },
  cancelScheduledNotificationAsync: async (id) => scheduled.delete(id),
  scheduleNotificationAsync: async (request) => { scheduled.set(request.identifier, request); return request.identifier; },
  SchedulableTriggerInputTypes: { DATE: "date", CALENDAR: "calendar" },
};
const local = load("apps/mobile/src/providers/localNotifications.ts", {
  "react-native": { Platform: { OS: "ios" } }, "./appStorage": storage,
  "./notificationPolicy": load("apps/mobile/src/providers/notificationPolicy.ts"), "expo-notifications": notifications,
});
const input = { id: "test", type: "rain", active: true, requiresPushPermission: true,
  scheduledAt: new Date(Date.now() + 60_000).toISOString(), pushTitle: "test", pushBody: "test", deepLink: "H1" };
const enabled = local.syncLocalWeatherNotifications({ enabled: true, reducedInterruptions: false, notifications: [input] });
await reachedPresented.promise;
const disabled = local.syncLocalWeatherNotifications({ enabled: false, notifications: [] });
presented.resolve([]);
await enabled;
assert.equal((await disabled).status, "cancelled");
assert.equal(scheduled.size, 0);
// A failed parallel schedule must drain its siblings before the next queued cancellation begins.
const scheduleReached = deferred();
const scheduleRelease = deferred();
notifications.scheduleNotificationAsync = async (request) => {
  if (request.identifier.endsWith("fail")) throw new Error("native scheduling failed");
  scheduleReached.resolve(); await scheduleRelease.promise;
  scheduled.set(request.identifier, request); return request.identifier;
};
const failed = local.syncLocalWeatherNotifications({ enabled: true, reducedInterruptions: false, notifications: [{ ...input, id: "fail" }, input] });
const rejected = assert.rejects(failed, /native scheduling failed/);
await scheduleReached.promise;
const offAfterFailure = local.syncLocalWeatherNotifications({ enabled: false, notifications: [] });
scheduleRelease.resolve(); await rejected; await offAfterFailure;
assert.equal(scheduled.size, 0);

// Exercise real adapters and notification rules for current/destination weather, summer/winter and persisted cache.
const sharedModule = { exports: {} };
const sharedCode = buildSync({ entryPoints: ["packages/shared/src/index.ts"], bundle: true, platform: "node", format: "cjs", write: false }).outputFiles[0].text;
new Function("module", "exports", sharedCode)(sharedModule, sharedModule.exports);
const shared = sharedModule.exports;
const demo = load("apps/mobile/src/data/demoState.ts", {
  "@weatheron/shared": shared, "../providers/weatherProvider": {},
  "../utils/zonedDateTime": load("apps/mobile/src/utils/zonedDateTime.ts"),
  "../utils/travelEstimate": load("apps/mobile/src/utils/travelEstimate.ts"),
});
for (const [date, utcHour] of [["2026-09-05", 13], ["2026-01-15", 14]]) {
  const now = `${date}T${utcHour}:00:00Z`;
  const weather = shared.normalizeOpenMeteoWeather({
    current: { time: `${date}T09:00`, temperature_2m: 20, precipitation: 0 },
    hourly: { time: [`${date}T09:00`, `${date}T12:00`], temperature_2m: [20, 20], precipitation_probability: [0, 90], weather_code: [0, 61] },
  }, { locationId: "new-york", locationName: "New York", countryCode: "GLOBAL", timezone: "America/New_York", observedAt: now });
  const result = { current: weather, destination: weather, destinationSnapshots: [], status: "ready", message: "", retryable: false, fallbackUsed: false };
  await storage.writeAppValue("weatheron.weatherProviderResult.v1", result, true);
  const cached = await storage.readAppValue("weatheron.weatherProviderResult.v1", true);
  assert.equal(cached.current.timezone, "America/New_York");
  for (const useDestination of [false, true]) {
    const state = demo.buildDemoStateFromWeatherResult(cached, useDestination, { notificationNow: Date.parse(now) });
    const rain = state.notifications.find((item) => item.type === "rain");
    assert.equal(rain.active, true);
    assert.equal(rain.scheduledAt, `${date}T${utcHour + 2}:00:00.000Z`);
  }
  const legacyWeather = { ...weather, timezone: undefined };
  const legacy = demo.buildDemoStateFromWeatherResult({ ...result, current: legacyWeather }, false, { notificationNow: Date.parse(now) });
  assert.equal(legacy.notifications.find((item) => item.type === "rain").active, false);
}
db.close();
console.log("Review regressions passed: storage failure/retry, durable photo replacement, notification races, overseas timezone/cache.");
