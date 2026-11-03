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
let builder, requestEffect, foregroundCallback;
function visit(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(ast) === "buildInput" && node.initializer.getText(ast).includes("getDestinationTiming")) builder = node.initializer.getText(ast);
  if (ts.isCallExpression(node) && node.expression.getText(ast) === "useEffect" && node.arguments[0]?.getText(ast).includes("runtimeTravelEstimateClient.estimateRoute")) requestEffect = node.arguments[0].getText(ast);
  if (ts.isCallExpression(node) && node.expression.getText(ast) === "AppState.addEventListener" && node.arguments[1]?.getText(ast).includes("routeAttemptsRef.current.clear()")) foregroundCallback = node.arguments[1].getText(ast);
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
  const departureAt = "2026-11-02T01:15:00.000Z"; // 10:15 Seoul, activation 09:15.
  const arrival = {
    place, careEnabled: true, alertCondition,
    schedulePreference: { ...commonSchedule, timeBasis: "arrival", targetArrivalTime: "11:00" },
    travelEstimate: { ...baseEstimate, transportMode: mode, provider: mode === "transit" ? "kakao-transit" : "kakao",
      requestArrivalTime: "2026-11-02T02:00:00.000Z", departureAt, bufferSeconds: 300 },
  };
  const departure = {
    ...arrival, schedulePreference: { ...commonSchedule, timeBasis: "departure", targetArrivalTime: "10:15" },
    travelEstimate: { ...arrival.travelEstimate, requestArrivalTime: undefined, requestDepartureTime: departureAt, bufferSeconds: 0 },
  };
  for (const destination of [arrival, departure]) {
    const before = JSON.stringify(destination);
    const input = intent.resolveDepartureActivityReconcileValue({ smartCareEnabled: true, intentDestinationId: place.id, savedDestinations: [destination], buildInput: build });
    assert.equal(input.departureAt, departureAt, `${mode}/${destination.schedulePreference.timeBasis}: use computed departure, never target arrival`);
    assert.equal(input.departureTimeLabel, "10:15");
    assert.equal(shared.getDepartureLiveActivityActivationDelay(input.departureAt, now), 15 * 60_000);
    assert.equal(shared.isDepartureLiveActivityAutoWindow(input.departureAt, now), false);
    assert.equal(shared.isDepartureLiveActivityAutoWindow(input.departureAt, now + 15 * 60_000), true);
    for (const leadTimeMinutes of [10, 30, 120]) {
      const changedNotificationLead = build({ ...destination, alertCondition: { ...alertCondition, leadTimeMinutes } });
      assert.equal(changedNotificationLead.departureAt, departureAt, "Notification lead does not change Activity's departure-minus-60 policy");
    }
    for (const unsafe of [
      { status: "error" }, { cacheStatus: "stale" }, { expiresAt: new Date(now).toISOString() },
      { expiresAt: undefined }, { provider: "fallback", status: "fallback", timingBasis: "distance" },
      { originPlaceId: "another-origin" },
    ]) assert.equal(build({ ...destination, travelEstimate: { ...destination.travelEstimate, ...unsafe } }), null, "Both schedule bases require a verified fresh matching route");
    assert.equal(build({ ...destination, travelEstimate: { ...destination.travelEstimate, requestArrivalTime: "2026-11-03T02:00:00.000Z" } }), null, "A different target/date cannot start an Activity");
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
  if (name === "../localization/react-native") return { AppState: { currentState: "active" } };
  if (name.includes("WeatheronWidgetDataModule")) return { __esModule: true, default: native };
  if (name === "./accountAuth") return { requestAuthenticatedAccountJson: async (path, body) => { registrations.push({ path, body }); return { scheduled: true }; } };
  throw new Error(`Unexpected dependency ${name}`);
}, class extends Date { static now() { return nativeClock; } });
const input = { destinationId: place.id, destinationName: place.name, departureAt: "2026-11-02T01:15:00.000Z", departureTimeLabel: "10:15", guidance: "가볍게 출발해요", guidanceSymbol: "figure.walk.departure", deepLink: "weatheron://destination?id=destination" };
for (let i = 0; i < 2; i++) {
  await provider.endDepartureLiveActivity();
  const result = await provider.syncAutomaticDepartureLiveActivity(input);
  assert.equal(result.scheduled, true);
  assert.equal(result.automaticEndScheduled, true);
  assert.equal(starts.at(-1).departureAt, input.departureAt);
  assert.equal(registrations.at(-1).path, "/live-activities/departure");
  assert.equal(registrations.at(-1).body.departureAt, input.departureAt);
}
const nativeSource = readFileSync("apps/mobile/modules/weatheron-widget-data/ios/WeatheronWidgetDataModule.swift", "utf8");
assert.match(nativeSource, /departureActivityLeadTime: TimeInterval = 60 \* 60/);
assert.match(nativeSource, /let startAt = attributes\.departureAt\.addingTimeInterval\(-departureActivityLeadTime\)/);
assert.match(nativeSource, /if #available\(iOS 26\.0, \*\), startAt > Date\(\)/);
assert.match(nativeSource, /style: \.standard,[\s\S]*alertConfiguration: alert,[\s\S]*start: startAt/);
const widgetSource = readFileSync("apps/mobile/ios/WeatherONWidget/WeatherONDepartureLiveActivity.swift", "utf8");
for (const presentation of [/dynamicIsland: \{ context in/, /compactLeading:/, /compactTrailing:/, /minimal:/,
  /DynamicIslandExpandedRegion\(\.leading\)/, /DynamicIslandExpandedRegion\(\.trailing\)/, /DynamicIslandExpandedRegion\(\.bottom\)/]) assert.match(widgetSource, presentation);
assert.match(widgetSource, /compactTrailing:[\s\S]*WeatherONDepartureCountdown\([\s\S]*departureAt: context\.attributes\.departureAt/);

// Exercise the request effect, not just already-fresh inputs. With a ten-minute
// arrival buffer, target-minus-duration is ten minutes later than true departure.
// The old client throttled this arrival route for ten minutes even after the
// server supplied a one-minute expiry inside the Activity's activation window.
const requestNow = now + 1000;
const absoluteDeparture = "2026-11-02T01:00:00.000Z"; // 10:00 Seoul.
for (const timeBasis of ["arrival", "departure"]) {
  const schedule = { timeBasis, targetArrivalTime: timeBasis === "arrival" ? "10:50" : "10:00", transportMode: "drive", repeatEnabled: false, repeatDays: [] };
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
    runtimeTravelEstimateClient: { estimateRoute: async input => { requests.push(input); return { ...estimate, updatedAt: new Date(effectNow).toISOString(), expiresAt: new Date(effectNow + 60000).toISOString() }; } },
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
    const bindings = { ...context, nowMinuteTick: tick, Date: class extends Date { static now() { return tick; } } };
    return new Function(...Object.keys(bindings), `${code}\nreturn build;`)(...Object.values(bindings));
  };
  await provider.endDepartureLiveActivity();
  nativeClock = effectNow;
  assert.equal((await provider.syncAutomaticDepartureLiveActivity(buildAt(effectNow)(destinations[0]))).active, true);
  // Without active JS there is no route refresh; do not pretend that the
  // end-only server job can start/recreate an Activity from a stale route.
  effectNow += 60001;
  nativeClock = effectNow;
  compileEffect({ AppState: { currentState: "background" }, nowMinuteTick: effectNow })();
  assert.equal(requests.length, 1, "No route lookup while app is inactive: a missing/cancelled native reservation cannot recover itself");
  const expiredInput = buildAt(effectNow)(destinations[0]);
  assert.equal(expiredInput, null, "The existing freshness contract rejects the expired route for either basis");
  await provider.syncAutomaticDepartureLiveActivity(expiredInput);
  assert.equal(nativeStatus.active || nativeStatus.scheduled, false, "A null reconciliation ends the native Activity; background recovery isn't provided");
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
  const recoveredInput = buildAt(effectNow)(destinations[0]);
  assert.ok(recoveredInput);
  assert.equal((await provider.syncAutomaticDepartureLiveActivity(recoveredInput)).active, true, "Fresh foreground lookup makes a local Activity request possible again");
  foregroundCleanup();
  cleanup();
}
console.log("PASS lifecycle: actual request effects use solved departure + buffer for one-minute retries; inactive lookup guard, expiry -> null -> native end, and real foreground callback -> throttle clear -> fresh route -> local Activity recreation exercised for both bases. Background OS activation remains unverified.");
console.log(`PASS: ${pairs} paired arrival/departure schedules (repeat/nonrepeat, drive/transit/walk), actual Activity builder + iOS provider/native contract, departure-minus-60 window, notification-lead independence, expiry/failure/target mismatch rejection, end-server registration and all Dynamic Island presentations. No physical display or OS scheduling proof.`);
