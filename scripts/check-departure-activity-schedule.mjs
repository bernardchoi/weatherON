import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSync } from "esbuild";
import ts from "typescript";

function load(file) {
  const module = { exports: {} };
  new Function("module", "exports", buildSync({ entryPoints: [file], bundle: true, platform: "node", format: "cjs", write: false }).outputFiles[0].text)(module, module.exports);
  return module.exports;
}
const helpers = load("apps/mobile/src/state/appStateHelpers.ts");
const travel = load("apps/mobile/src/utils/travelEstimate.ts");
const shared = load("apps/mobile/src/providers/departureLiveActivity.shared.ts");
const intent = load("apps/mobile/src/state/departureActivityIntent.ts");
const source = readFileSync(process.env.DEPARTURE_ACTIVITY_STATE_SOURCE ?? "apps/mobile/src/state/useWeatherOnAppState.ts", "utf8");
const ast = ts.createSourceFile("state.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
let builder, requestEffect, foregroundCallback, activityEffect;
const careActions = new Map();
function visit(node) {
  if (ts.isVariableDeclaration(node) && ["saveSelectedDestination", "toggleDestinationCare", "toggleSavedDestinationCare", "restoreRemovedDestination"].includes(node.name.getText(ast))) careActions.set(node.name.getText(ast), node.initializer.arguments[0].getText(ast));
  if (ts.isPropertyAssignment(node) && node.name.getText(ast) === "buildInput" && node.initializer.getText(ast).includes("getDestinationTiming")) builder = node.initializer.getText(ast);
  if (ts.isCallExpression(node) && node.expression.getText(ast) === "useEffect" && node.arguments[0]?.getText(ast).includes("runtimeTravelEstimateClient.estimateRoute")) requestEffect = node.arguments[0].getText(ast);
  if (ts.isCallExpression(node) && node.expression.getText(ast) === "AppState.addEventListener" && node.arguments[1]?.getText(ast).includes("routeAttemptsRef.current.clear()")) foregroundCallback = node.arguments[1].getText(ast);
  if (ts.isCallExpression(node) && node.expression.getText(ast) === "useEffect" && node.arguments[0]?.getText(ast).includes("const syncActivity = async")) activityEffect = node.arguments[0].getText(ast);
  ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(builder, "Execute the actual automatic Activity builder");
assert.ok(requestEffect, "Execute the actual route request lifecycle");
assert.ok(foregroundCallback, "Execute the actual foreground route-recovery callback");
const now = Date.parse("2026-11-02T09:00:00+09:00");
const weather = { locationId: "destination", current: { rainProbabilityPct: 10, windMs: 2 }, hourly: [] };
const context = {
  ...helpers, ...shared, canScheduleTravelEstimate: travel.canScheduleTravelEstimate,
  nowMinuteTick: now, placeSearchOrigin: { locationId: "origin" }, activeWeatherLocation: { countryCode: "KR" },
  weatherProviderResult: { destinationSnapshots: [weather] }, localePolicy: { language: "ko" }, translateText: value => value,
  departureActivityReplacementDestinationId: null, formatDisplayTime: travel.formatRouteClock,
  Date: class extends Date { static now() { return now; } },
};
const code = ts.transpileModule(`const build = ${builder};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const build = new Function(...Object.keys(context), `${code}\nreturn build;`)(...Object.values(context));
const place = { id: "destination", name: "Public test destination", countryCode: "KR", timezone: "Asia/Seoul", coordinate: { latitude: 37.56, longitude: 126.97 } };
const baseEstimate = {
  originPlaceId: "origin", destinationPlaceId: place.id, status: "ready", provider: "kakao", timingBasis: "predicted",
  travelMinutes: 40, durationSeconds: 2400, distanceMeters: 8000, transportMode: "drive", message: "검증용 예정 경로",
  updatedAt: new Date(now - 60_000).toISOString(), expiresAt: new Date(now + 600_000).toISOString(),
};
const alertCondition = { rainThresholdPct: 50, windThresholdMs: 8, leadTimeMinutes: 60 };
let pairs = 0;
for (const repeatEnabled of [false, true]) for (const mode of ["drive", "transit", "walk"]) {
  const commonSchedule = { transportMode: mode, repeatEnabled, repeatDays: ["mon"] };
  const departureAt = "2026-11-02T01:20:00.000Z"; // 10:20 Seoul, activation 09:20.
  const arrival = {
    place, careEnabled: true, alertCondition,
    schedulePreference: { ...commonSchedule, timeBasis: "arrival", targetArrivalTime: "11:00" },
    travelEstimate: { ...baseEstimate, transportMode: mode, provider: mode === "transit" ? "kakao-transit" : "kakao",
      requestArrivalTime: "2026-11-02T02:00:00.000Z", departureAt, bufferSeconds: 300 },
  };
  const departure = {
    ...arrival, schedulePreference: { ...commonSchedule, timeBasis: "departure", targetArrivalTime: "10:20" },
    travelEstimate: { ...arrival.travelEstimate, requestArrivalTime: undefined, requestDepartureTime: departureAt, bufferSeconds: 0 },
  };
  for (const destination of [arrival, departure]) {
    const before = JSON.stringify(destination);
    const input = intent.resolveDepartureActivityReconcileValue({ smartCareEnabled: true, intentDestinationId: place.id, savedDestinations: [destination], buildInput: build });
    assert.equal(input.departureAt, departureAt, `${mode}/${destination.schedulePreference.timeBasis}: use computed departure, never target arrival`);
    assert.equal(input.departureTimeLabel, "10:20");
    assert.equal(shared.getDepartureLiveActivityActivationDelay(input.departureAt, now), 20 * 60_000);
    assert.equal(shared.isDepartureLiveActivityAutoWindow(input.departureAt, now), false);
    assert.equal(shared.isDepartureLiveActivityAutoWindow(input.departureAt, now + 20 * 60_000), true);
    for (const leadTimeMinutes of [10, 30, 120]) {
      const changedNotificationLead = build({ ...destination, alertCondition: { ...alertCondition, leadTimeMinutes } });
      assert.equal(changedNotificationLead.departureAt, departureAt, "Notification lead does not change Activity's departure-minus-60 policy");
    }
    for (const unsafe of [
      { status: "error" }, { cacheStatus: "stale" }, { expiresAt: new Date(now).toISOString() },
      { expiresAt: undefined }, { provider: "fallback", status: "fallback", timingBasis: "distance" },
      { originPlaceId: "another-origin" },
    ]) {
      const changed = { ...destination, travelEstimate: { ...destination.travelEstimate, ...unsafe } };
      const candidate = build(changed);
      if (!helpers.getDestinationTiming(changed.travelEstimate, changed.schedulePreference, place.timezone, now, "KR", "KR", "origin")) {
        assert.equal(candidate, null, "Invalid/mismatched plan explicitly ends the old countdown");
      } else assert.equal(candidate.preserveExistingOnly, true, "Unverified matching timing permits preservation only");
    }
    assert.equal(build({ ...destination, travelEstimate: { ...destination.travelEstimate, requestArrivalTime: "2026-11-03T02:00:00.000Z" } }), null, "A different target/date must end an outdated Activity");
    assert.equal(JSON.stringify(destination), before, "Input construction cannot mutate saved settings");
  }
  pairs++;
}

// The iOS provider receives the same absolute deadline for both bases. Its server
// request is for automatic END only; scheduled start is the native iOS 26 API.
const providerSource = readFileSync("apps/mobile/src/providers/departureLiveActivity.ios.ts", "utf8");
let nativeStatus = { supported: true, enabled: true, active: false, scheduled: false, automaticStartSupported: true };
let nativeClock = now;
const starts = [], registrations = [];
const providerAppState = { currentState: "active" };
const native = {
  addListener() {}, getDepartureActivityStatus: async () => JSON.stringify(nativeStatus),
  startDepartureActivity: async json => {
    const input = JSON.parse(json); starts.push(input);
    const active = shared.isDepartureLiveActivityAutoWindow(input.departureAt, nativeClock);
    nativeStatus = { ...nativeStatus, active, scheduled: !active, activityId: "test-activity", destinationId: input.destinationId,
      departureAt: input.departureAt, guidance: input.guidance, pushToken: "ab".repeat(32), bundleId: "com.weatheron.mobile", pushEnvironment: "production" };
    return JSON.stringify(nativeStatus);
  },
  endDepartureActivity: async () => { nativeStatus = { ...nativeStatus, active: false, scheduled: false }; return true; },
};
const provider = {};
const providerCode = ts.transpileModule(providerSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
new Function("exports", "require", "Date", providerCode)(provider, name => {
  if (name === "./departureLiveActivity.shared") return shared;
  if (name === "../localization/react-native") return { AppState: providerAppState };
  if (name.includes("WeatheronWidgetDataModule")) return { __esModule: true, default: native };
  if (name === "./accountAuth") return { requestAuthenticatedAccountJson: async (path, body) => { registrations.push({ path, body }); return { scheduled: true }; } };
  throw new Error(`Unexpected dependency ${name}`);
}, class extends Date { static now() { return nativeClock; } });
const input = { destinationId: place.id, destinationName: place.name, departureAt: "2026-11-02T01:20:00.000Z", departureTimeLabel: "10:20", guidance: "가볍게 출발해요", guidanceSymbol: "figure.walk.departure", deepLink: "weatheron://destination?id=destination" };
for (let i = 0; i < 2; i++) {
  await provider.endDepartureLiveActivity();
  const result = await provider.syncAutomaticDepartureLiveActivity(input);
  assert.equal(result.scheduled, true);
  assert.equal(result.automaticEndScheduled, true);
  assert.equal(starts.at(-1).departureAt, input.departureAt);
  assert.equal(registrations.at(-1).path, "/live-activities/departure");
  assert.equal(registrations.at(-1).body.departureAt, input.departureAt);
}
// The shared builder is also used by Android; execute its provider's retention
// guard so a preserve-only input can never leak into a native start there.
const androidProvider = {};
new Function("exports", "require", "Date", ts.transpileModule(readFileSync("apps/mobile/src/providers/departureLiveActivity.android.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(androidProvider, name => {
  if (name === "./departureLiveActivity.shared") return shared;
  if (name.includes("WeatheronWidgetDataModule")) return { __esModule: true, default: native };
  throw new Error(`Unexpected Android dependency ${name}`);
}, class extends Date { static now() { return nativeClock; } });
let syncProvider = provider;

// Reproduce the complete builder -> reconciliation effect -> iOS provider path.
// A route TTL is permission to create/replace, not a cancellation deadline for
// an OS-accepted countdown. Run expiry while still foregrounded and backgrounded.
assert.ok(activityEffect, "Execute actual Activity reconciliation effect");
const flushActivity = () => new Promise(resolve => setImmediate(resolve));
async function reconcileAt(destination, tick, options = {}) {
  const { builderContext = {}, clockMs = tick, ...intentOptions } = options;
  nativeClock = clockMs;
  const ctx = { ...context, ...builderContext, nowMinuteTick: tick, Date: class extends Date { static now() { return clockMs; } } };
  const currentBuild = new Function(...Object.keys(ctx), `${code}\nreturn build;`)(...Object.values(ctx));
  const value = intent.resolveDepartureActivityReconcileValue({ smartCareEnabled: true, intentDestinationId: destination.place.id, savedDestinations: [destination], ...intentOptions, buildInput: currentBuild });
  const scope = {
    appStateHydrated: true, automaticDepartureActivityInput: value,
    departureActivitySyncRevisionRef: { current: 0 },
    syncAutomaticDepartureLiveActivity: syncProvider.syncAutomaticDepartureLiveActivity,
    setDepartureActivityReplacementDestinationId() {},
    getDepartureLiveActivityActivationDelay: shared.getDepartureLiveActivityActivationDelay,
    AppState: { addEventListener() { return { remove() {} }; } },
    setTimeout, clearTimeout,
  };
  const compiled = ts.transpileModule(`const effect = ${activityEffect};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const cleanup = new Function(...Object.keys(scope), `${compiled}\nreturn effect();`)(...Object.values(scope));
  await flushActivity(); await flushActivity();
  cleanup();
  return value;
}

// Route responses arrive between minute ticks. Reopening during the reported
// 06:50–07:50 window must accept a fresh 50-minute transit route immediately.
for (const candidateProvider of [provider, androidProvider])
for (const transportMode of ["drive", "transit", "walk"])
for (const timeBasis of ["arrival", "departure"]) for (const minutesBeforeDeparture of [55, 80]) {
  syncProvider = candidateProvider;
  const tick = Date.parse("2026-11-02T07:50:00+09:00") - minutesBeforeDeparture * 60000;
  const responseAt = tick + 5000;
  const destination = {
    place, careEnabled: true, alertCondition,
    schedulePreference: { timeBasis, targetArrivalTime: timeBasis === "arrival" ? "08:40" : "07:50", transportMode, repeatEnabled: false, repeatDays: [] },
    travelEstimate: {
      ...baseEstimate, provider: transportMode === "transit" ? "kakao-transit" : "kakao", transportMode, travelMinutes: 50, durationSeconds: 3000,
      requestArrivalTime: timeBasis === "arrival" ? "2026-11-01T23:40:00.000Z" : undefined,
      requestDepartureTime: timeBasis === "departure" ? "2026-11-01T22:50:00.000Z" : undefined,
      updatedAt: new Date(responseAt).toISOString(), expiresAt: new Date(responseAt + 60000).toISOString(),
    },
  };
  providerAppState.currentState = "active";
  await provider.endDepartureLiveActivity();
  const value = await reconcileAt(destination, tick, { clockMs: responseAt });
  assert.equal(value.preserveExistingOnly, false, `${timeBasis}: a response newer than the minute tick is fresh at reconciliation`);
  assert.equal(nativeStatus.departureAt, "2026-11-01T22:50:00.000Z");
  assert.equal(nativeStatus.active, minutesBeforeDeparture <= 60);
  assert.equal(nativeStatus.scheduled, minutesBeforeDeparture > 60);
  for (const unsafe of [
    { updatedAt: new Date(responseAt + 1).toISOString() },
    { updatedAt: new Date(tick - 30000).toISOString(), expiresAt: new Date(responseAt).toISOString() },
  ]) {
    await provider.endDepartureLiveActivity();
    const blocked = await reconcileAt({ ...destination, travelEstimate: { ...destination.travelEstimate, ...unsafe } }, tick, { clockMs: responseAt });
    assert.equal(blocked.preserveExistingOnly, true, "Future/expired data cannot start an Activity against the actual clock");
    assert.equal(nativeStatus.active || nativeStatus.scheduled, false);
  }
}
console.log("PASS fresh transit response between minute ticks starts/reserves 08:40 arrival -> 07:50 departure immediately; actual-future/expired responses cannot create an Activity");

// Execute explicit care actions through the real builder/effect/iOS provider.
// An older pending trip must not suppress the newly saved/enabled trip.
assert.equal(careActions.size, 4);
for (const minutes of [45, 80]) for (const action of careActions.keys()) {
  syncProvider = provider;
  providerAppState.currentState = "active";
  nativeClock = now;
  await provider.endDepartureLiveActivity();
  await provider.syncAutomaticDepartureLiveActivity({ ...input, destinationId: "old-owner", departureAt: new Date(now + 3 * 3600000).toISOString() });
  const departureAt = new Date(now + minutes * 60000).toISOString();
  const destination = {
    place, careEnabled: false, alertCondition,
    schedulePreference: { timeBasis: "departure", targetArrivalTime: minutes === 45 ? "09:45" : "10:20", transportMode: "drive", repeatEnabled: false, repeatDays: [] },
    travelEstimate: { ...baseEstimate, departureAt, requestDepartureTime: departureAt },
  };
  let saved = [destination], owner = "old-owner", replacement = null;
  const apply = (value, previous) => typeof value === "function" ? value(previous) : value;
  const bindings = {
    selectedDestinationPlace: place, selectedSavedDestination: destination,
    savedDestinations: saved, savedDestinationsRef: { get current() { return saved; } },
    departureActivityIntentDestinationId: owner, destinationCareEnabled: false, destinationSaved: true, permissionReady: true,
    recentlyRemovedDestination: { ...destination, careEnabled: true },
    canSaveDestination: () => true,
    updateSavedDestinations: update => { saved = update(saved); },
    setDepartureActivityIntentDestinationId: value => { owner = apply(value, owner); },
    setDepartureActivityReplacementDestinationId: value => { replacement = apply(value, replacement); },
    setCommittedDepartureDestinationId() {}, setDestinationSelectionReady() {}, setDestinationLimitNotice() {},
    setPreviewDestinationCareEnabled() {}, setSelectedDestinationPlace() {}, setPreviewDestinationAlertCondition() {},
    dismissRemovedDestination() {}, setWeatherProviderMode() {}, setWeatherRefreshTick() {},
  };
  const run = new Function(...Object.keys(bindings), ts.transpileModule(`const run = ${careActions.get(action)};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + "\nreturn run;")(...Object.values(bindings));
  run(action === "toggleSavedDestinationCare" ? place.id : true);
  assert.equal(owner, place.id, `${action}: explicit care action commits the new owner`);
  await reconcileAt(saved[0], now, { intentDestinationId: owner, builderContext: { departureActivityReplacementDestinationId: replacement } });
  assert.equal(nativeStatus.destinationId, place.id, `${action}: old reservation must not block the new trip`);
  assert.equal(nativeStatus.active, minutes === 45, `${action}: an in-window trip must request immediate presentation`);
  assert.equal(nativeStatus.scheduled, minutes === 80);
}
console.log("PASS explicit save/care-on/restore -> actual builder/effect/iOS provider replaces an older reservation for immediate and scheduled trips");

for (const candidateProvider of [provider, androidProvider]) {
syncProvider = candidateProvider;
for (const timeBasis of ["arrival", "departure"]) for (const appState of ["active", "background"]) {
  providerAppState.currentState = "active";
  nativeClock = now;
  await provider.endDepartureLiveActivity();
  const departureAt = "2026-11-02T01:20:00.000Z";
  const target = timeBasis === "arrival" ? "2026-11-02T02:00:00.000Z" : departureAt;
  const destination = {
    place, careEnabled: true, alertCondition,
    schedulePreference: { timeBasis, targetArrivalTime: timeBasis === "arrival" ? "11:00" : "10:20", transportMode: "drive", repeatEnabled: false, repeatDays: [] },
    travelEstimate: { ...baseEstimate, departureAt, bufferSeconds: timeBasis === "arrival" ? 300 : 0,
      requestArrivalTime: timeBasis === "arrival" ? target : undefined,
      requestDepartureTime: timeBasis === "departure" ? target : undefined },
  };
  await reconcileAt(destination, now);
  assert.equal(nativeStatus.scheduled, true);
  const startsBeforeExpiry = starts.length;
  await reconcileAt(destination, now, { builderContext: { weatherProviderResult: { destinationSnapshots: [] } } });
  assert.equal(nativeStatus.scheduled, true, "Missing weather retains only the matching accepted trip");
  assert.equal(starts.length, startsBeforeExpiry, "Missing weather cannot create/update a native Activity");
  providerAppState.currentState = appState;
  const expiredAt = now + 601_000;
  assert.equal(travel.canScheduleTravelEstimate(destination.travelEstimate, expiredAt), false);
  await reconcileAt(destination, expiredAt);
  assert.equal(nativeStatus.scheduled, true, `${timeBasis}/${appState}: route expiry must not cancel an accepted OS reservation`);
  assert.equal(starts.length, startsBeforeExpiry, "Expired route must not create a replacement");
  await reconcileAt({ ...destination, travelEstimate: { ...destination.travelEstimate, cacheStatus: "stale" } }, expiredAt);
  assert.equal(nativeStatus.scheduled, true, "Failed refresh must preserve accepted reservation");
  // With no accepted reservation, an expired route must still not start one.
  await provider.endDepartureLiveActivity();
  await reconcileAt(destination, expiredAt);
  assert.equal(starts.length, startsBeforeExpiry);
  assert.equal(nativeStatus.scheduled, false);
  // The computed trip deadline is still an end even when the route has expired.
  providerAppState.currentState = "active";
  await reconcileAt(destination, now);
  await reconcileAt(destination, Date.parse(departureAt) + 1);
  assert.equal(nativeStatus.scheduled || nativeStatus.active, false, "Past departure still ends the accepted countdown");
  // Independently challenge retention: accepted A may never survive a changed
  // date/time/mode, missing destination, disabled care, or expired B replacement.
  const changedPlanCases = [
    ["time edit", { ...destination, schedulePreference: { ...destination.schedulePreference, targetArrivalTime: "12:00" } }, {}],
    ["basis edit", { ...destination, schedulePreference: { ...destination.schedulePreference, timeBasis: timeBasis === "arrival" ? "departure" : "arrival" } }, {}],
    ["mode edit", { ...destination, schedulePreference: { ...destination.schedulePreference, transportMode: "walk" } }, {}],
    ["different route date", { ...destination, travelEstimate: { ...destination.travelEstimate, requestArrivalTime: "2026-11-03T02:00:00.000Z", cacheStatus: "stale" } }, {}],
    ["destination removal", destination, { savedDestinations: [] }],
    ["Smart Care OFF", destination, { smartCareEnabled: false }],
    ["intent cleared", destination, { intentDestinationId: null }],
    ["different destination expired", { ...destination, place: { ...place, id: "other" }, travelEstimate: { ...destination.travelEstimate, destinationPlaceId: "other", cacheStatus: "stale" } }, {}],
    ["different computed departure expired", { ...destination, schedulePreference: { ...destination.schedulePreference, targetArrivalTime: timeBasis === "departure" ? "10:25" : "11:00" }, travelEstimate: { ...destination.travelEstimate, durationSeconds: 2100, departureAt: "2026-11-02T01:25:00.000Z", requestDepartureTime: timeBasis === "departure" ? "2026-11-02T01:25:00.000Z" : undefined, cacheStatus: "stale" } }, {}],
  ];
  for (const [label, changed, options] of changedPlanCases) {
    providerAppState.currentState = "active";
    await reconcileAt(destination, now);
    const count = starts.length;
    await reconcileAt(changed, expiredAt, options);
    assert.equal(nativeStatus.scheduled || nativeStatus.active, false, label + " cannot retain a misleading old Activity");
    assert.equal(starts.length, count, label + " cannot start from an unverified route");
  }
  if (timeBasis === "arrival") {
    // A persisted reservation at the former 20m-early deadline is a different
    // trip deadline. An expired route cannot preserve it after policy migration.
    const canonical = build(destination);
    providerAppState.currentState = "active";
    nativeClock = now;
    await syncProvider.syncAutomaticDepartureLiveActivity({ ...canonical,
      departureAt: new Date(Date.parse(canonical.departureAt) - 20 * 60000).toISOString() });
    const count = starts.length;
    await reconcileAt(destination, expiredAt);
    assert.equal(nativeStatus.scheduled || nativeStatus.active, false, "legacy early deadline must end when canonical deadline differs");
    assert.equal(starts.length, count, "expired migration must not create the replacement Activity");
  }
  const repeating = { ...destination, schedulePreference: { ...destination.schedulePreference, repeatEnabled: true, repeatDays: ["mon", "tue"] } };
  await reconcileAt(repeating, now);
  await reconcileAt(repeating, now + 24 * 3600000);
  assert.equal(nativeStatus.scheduled || nativeStatus.active, false, "Day rollover cannot retain yesterday's Activity against today's schedule");
  // Explicit care cancellation retains its existing null -> native end contract.
  providerAppState.currentState = "active";
  await reconcileAt(destination, now);
  await reconcileAt({ ...destination, careEnabled: false }, now);
  assert.equal(nativeStatus.scheduled, false);
  assert.equal(nativeStatus.active, false);
}
}
syncProvider = provider;
providerAppState.currentState = "active";
nativeClock = now;
console.log("PASS changed plan/removal/care-off/day rollover guards and exact-trip preservation through actual iOS + Android providers");
console.log("PASS route expiry/refresh failure preserves accepted OS reservations in actual builder/effect/provider paths; expired routes never create, care-off still cancels (arrival/departure, foreground/background)");
const nativeSource = readFileSync("apps/mobile/modules/weatheron-widget-data/ios/WeatheronWidgetDataModule.swift", "utf8");
assert.match(nativeSource, /departureActivityLeadTime: TimeInterval = 60 \* 60/);
assert.match(nativeSource, /let startAt = attributes\.departureAt\.addingTimeInterval\(-departureActivityLeadTime\)/);
assert.match(nativeSource, /if #available\(iOS 26\.0, \*\), startAt > Date\(\)/);
assert.match(nativeSource, /style: \.standard,[\s\S]*alertConfiguration: alert,[\s\S]*start: startAt/);
const widgetSource = readFileSync("apps/mobile/ios/WeatherONWidget/WeatherONDepartureLiveActivity.swift", "utf8");
for (const presentation of [/dynamicIsland: \{ context in/, /compactLeading:/, /compactTrailing:/, /minimal:/,
  /DynamicIslandExpandedRegion\(\.leading\)/, /DynamicIslandExpandedRegion\(\.trailing\)/, /DynamicIslandExpandedRegion\(\.bottom\)/]) assert.match(widgetSource, presentation);
assert.match(widgetSource, /compactTrailing:[\s\S]*WeatherONDepartureCountdown\([\s\S]*departureAt: context\.attributes\.departureAt/);

// Exercise actual retries for both bases with target-aligned timing, including
// old persisted buffer fields. The route expiry inside the activation window
// must still retry after one minute, independently of the legacy fields.
const requestNow = now + 1000;
const absoluteDeparture = "2026-11-02T01:00:00.000Z"; // 10:00 Seoul.
for (const timeBasis of ["arrival", "departure"]) {
  const schedule = { timeBasis, targetArrivalTime: timeBasis === "arrival" ? "10:40" : "10:00", transportMode: "drive", repeatEnabled: false, repeatDays: [] };
  const target = helpers.getRouteArrivalTimeIso(schedule.targetArrivalTime, place.timezone, requestNow, false, []);
  const estimate = {
    ...baseEstimate, requestKind: "scheduled", departureAt: absoluteDeparture, bufferSeconds: timeBasis === "arrival" ? 600 : 0,
    requestArrivalTime: timeBasis === "arrival" ? target : undefined,
    requestDepartureTime: timeBasis === "departure" ? target : undefined,
    updatedAt: new Date(requestNow).toISOString(), expiresAt: new Date(requestNow + 60000).toISOString(),
  };
  let destinations = [{ place, careEnabled: true, alertCondition, schedulePreference: schedule, travelEstimate: estimate }];
  let effectNow = requestNow;
  const attempts = new Map(), requests = [];
  const effectContext = {
    ...load("apps/mobile/src/utils/homeUpdateState.ts"), homeRouteRevisionRef: { current: 0 }, setHomeRouteRequests() {},
    ...helpers, getLeavingNowRouteKey: travel.getLeavingNowRouteKey, isLeavingNowRouteResult: travel.isLeavingNowRouteResult,
    appStateHydrated: true, AppState: { currentState: "active" }, nowMinuteTick: requestNow,
    Date: class extends Date { static now() { return effectNow; } },
    placeSearchOrigin: { locationId: "origin", countryCode: "KR", coordinate: { latitude: 37.5, longitude: 127 } },
    routeRequests: [{ place, schedule }], destinationLeavingNow: {}, leavingNowRoutes: {},
    savedDestinationsRef: { get current() { return destinations; } }, previewDestinationTravelEstimate: estimate,
    selectedDestinationPlace: place, routeAttemptsRef: { current: attempts },
    runtimeTravelEstimateClient: { estimateRoute: async input => { requests.push(input); effectNow += 5000; return { ...estimate, updatedAt: new Date(effectNow).toISOString(), expiresAt: new Date(effectNow + 60000).toISOString() }; } },
    createDestinationTravelEstimate: helpers.createDestinationTravelEstimate,
    setLeavingNowRoutes() { throw new Error("Scheduled request must not mutate leaving-now data"); },
    setDestinationTravelEstimateRequestStatus() {}, setPreviewDestinationTravelEstimate() {},
    updateSavedDestinations: update => { destinations = update(destinations); },
  };
  const compileEffect = overrides => {
    const bindings = { ...effectContext, ...overrides };
    return new Function(...Object.keys(bindings), ts.transpileModule(`const run = ${requestEffect};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + "\nreturn run;")(...Object.values(bindings));
  };
  const cleanup = compileEffect({})();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].arrivalTime, timeBasis === "arrival" ? target : undefined);
  assert.equal(requests[0].departureTime, timeBasis === "departure" ? target : undefined);
  assert.equal(helpers.getDestinationTiming(estimate, schedule, place.timezone, requestNow, "KR", "KR", "origin").departureAt, absoluteDeparture);
  const retryAt = [...attempts.values()][0];
  assert.ok(retryAt <= requestNow + 60000, `${timeBasis}: the real request effect must retry at one minute inside computed departure-minus-60 window; got ${retryAt - requestNow}ms`);
  const buildAt = tick => {
    const bindings = { ...context, nowMinuteTick: tick, Date: class extends Date { static now() { return effectNow; } } };
    return new Function(...Object.keys(bindings), `${code}\nreturn build;`)(...Object.values(bindings));
  };
  await provider.endDepartureLiveActivity();
  nativeClock = effectNow;
  const freshInput = buildAt(requestNow)(destinations[0]);
  assert.equal(freshInput.preserveExistingOnly, false, "The actual route response must be usable before another minute tick");
  assert.equal((await provider.syncAutomaticDepartureLiveActivity(freshInput)).active, true);
  // Without active JS there is no route refresh; do not pretend that the
  // end-only server job can start/recreate an Activity from a stale route.
  effectNow += 60001;
  nativeClock = effectNow;
  compileEffect({ AppState: { currentState: "background" }, nowMinuteTick: effectNow })();
  assert.equal(requests.length, 1, "No route lookup while app is inactive: a missing/cancelled native reservation cannot recover itself");
  const expiredInput = buildAt(effectNow)(destinations[0]);
  assert.equal(expiredInput.preserveExistingOnly, true, "An expired route permits only exact-trip preservation");
  await provider.syncAutomaticDepartureLiveActivity(expiredInput);
  assert.equal(nativeStatus.active, true, "Preserve the accepted active countdown across route expiry");
  let foregroundTick;
  const foregroundBindings = {
    Date: effectContext.Date, appLifecycleStateRef: { current: "background" }, widgetSnapshotContentKeyRef: { current: "old" }, widgetLocationsKeyRef: { current: "old" },
    localNotificationSync: { retry() {} }, routeAttemptsRef: { current: attempts }, setNowMinuteTick: tick => { foregroundTick = tick; },
    weatherRequestInFlightRef: { current: true }, foregroundWeatherRefreshAtRef: { current: requestNow }, setWeatherRefreshTick() { throw new Error("Existing weather request should stay in flight"); },
  };
  const foreground = new Function(...Object.keys(foregroundBindings), ts.transpileModule(`const run = ${foregroundCallback};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + "\nreturn run;")(...Object.values(foregroundBindings));
  foreground("active");
  assert.equal(foregroundTick, effectNow);
  assert.equal(attempts.size, 0, "The actual foreground callback clears the route throttle");
  const foregroundCleanup = compileEffect({ nowMinuteTick: foregroundTick })();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 2);
  nativeClock = effectNow;
  const recoveredInput = buildAt(foregroundTick)(destinations[0]);
  assert.ok(recoveredInput);
  assert.equal(recoveredInput.preserveExistingOnly, false, "A foreground route response is usable immediately after its asynchronous lookup");
  assert.equal((await provider.syncAutomaticDepartureLiveActivity(recoveredInput)).active, true, "Fresh foreground lookup makes a local Activity request possible again");
  foregroundCleanup();
  cleanup();
}
console.log("PASS lifecycle: actual request effects use target-aligned departure for one-minute retries; inactive lookup guard, expiry -> preserve active reservation, and real foreground callback -> throttle clear -> fresh route reconciliation exercised for both bases. Background OS activation remains unverified.");
console.log(`PASS: ${pairs} paired arrival/departure schedules (repeat/nonrepeat, drive/transit/walk), actual Activity builder + iOS provider/native contract, departure-minus-60 window, notification-lead independence, expiry/failure/target mismatch rejection, end-server registration and all Dynamic Island presentations. No physical display or OS scheduling proof.`);
