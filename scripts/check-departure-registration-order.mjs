import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const shared = {};
new Function("exports", compile(readFileSync("apps/mobile/src/providers/departureLiveActivity.shared.ts", "utf8")))(shared);
const providerSource = readFileSync(process.env.DEPARTURE_PROVIDER_SOURCE ?? "apps/mobile/src/providers/departureLiveActivity.ios.ts", "utf8");
const flush = () => new Promise(resolve => setImmediate(resolve));
const now = Date.parse("2026-11-02T09:00:00+09:00");
const oldDeparture = new Date(now + 3 * 3600000).toISOString();
const newDeparture = new Date(now + 2 * 3600000).toISOString();
const input = { destinationId: "same-destination", destinationName: "Public test destination", departureAt: newDeparture, departureTimeLabel: "11:00", guidance: "가볍게 출발해요", guidanceSymbol: "figure.walk.departure", deepLink: "weatheron://destination?id=same-destination", replaceExistingActivity: true };
function harness() {
  const appState = { currentState: "active" };
  let status = { supported: true, enabled: true, active: false, scheduled: true, automaticStartSupported: true,
    activityId: "old-activity", destinationId: input.destinationId, departureAt: oldDeparture, guidance: input.guidance,
    pushToken: "ab".repeat(32), bundleId: "com.weatheron.mobile", pushEnvironment: "production" };
  let holdRegistration, holdStatus;
  const starts = [], posts = [], timers = new Map();
  const native = {
    addListener() {},
    getDepartureActivityStatus: async () => { if (holdStatus) await holdStatus; return JSON.stringify(status); },
    startDepartureActivity: async json => {
      starts.push(JSON.parse(json));
      assert.equal(appState.currentState, "active", "Never request a new Activity from background");
      status = { ...status, ...JSON.parse(json), activityId: "new-activity", pushToken: "cd".repeat(32) };
      return JSON.stringify(status);
    },
    endDepartureActivity: async () => { status = { ...status, active: false, scheduled: false }; return true; },
  };
  const bridge = {};
  new Function("exports", "require", "Date", "setTimeout", "clearTimeout", compile(providerSource))(bridge, name => {
    if (name === "./departureLiveActivity.shared") return shared;
    if (name === "../localization/react-native") return { AppState: appState };
    if (name.includes("WeatheronWidgetDataModule")) return { __esModule: true, default: native };
    if (name === "./accountAuth") return { requestAuthenticatedAccountJson: async (path, body) => {
      posts.push({ path, body });
      if (holdRegistration) await holdRegistration;
      return { scheduled: true };
    } };
    throw new Error(`Unexpected dependency ${name}`);
  }, class extends Date { static now() { return now; } }, callback => { const key = {}; timers.set(key, callback); return key; }, key => timers.delete(key));
  return { bridge, appState, starts, posts, get status() { return status; }, holdRegistration(value) { holdRegistration = value; }, holdStatus(value) { holdStatus = value; } };
}

// A slow end-server acknowledgement for an existing trip must not postpone the
// OS reservation for a new arrival/departure time until the app is reopened.
{
  const h = harness();
  let release;
  h.holdRegistration(new Promise(resolve => { release = resolve; }));
  const oldRead = h.bridge.getDepartureLiveActivityStatus();
  await flush();
  assert.equal(h.posts.length, 1);
  const sync = h.bridge.syncAutomaticDepartureLiveActivity(input);
  await flush();
  assert.equal(h.starts.length, 1, "OS replacement must be requested before the old automatic-END server acknowledgement");
  h.holdRegistration(undefined);
  release();
  await oldRead;
  const result = await sync;
  assert.equal(result.activityId, "new-activity");
  assert.equal(result.departureAt, newDeparture);
  assert.equal(h.posts.at(-1).body.activityId, "new-activity", "End-server tokens still register against their own Activity");
}

// Automatic synchronizations serialize native mutations, not server latency.
{
  const h = harness();
  let release;
  h.holdRegistration(new Promise(resolve => { release = resolve; }));
  const oldSync = h.bridge.syncAutomaticDepartureLiveActivity({ ...input, departureAt: oldDeparture });
  await flush();
  const newSync = h.bridge.syncAutomaticDepartureLiveActivity(input);
  await flush();
  assert.equal(h.starts.length, 1, "A previous automatic-sync END acknowledgement cannot hold the native mutation queue");
  h.holdRegistration(undefined);
  release();
  await oldSync;
  assert.equal((await newSync).activityId, "new-activity");
}

// Backgrounding while the native status read is in flight must leave the
// accepted reservation intact and defer the replacement to foreground.
{
  const h = harness();
  let release;
  h.holdStatus(new Promise(resolve => { release = resolve; }));
  const pending = h.bridge.syncAutomaticDepartureLiveActivity(input);
  await flush();
  h.appState.currentState = "background";
  release();
  const result = await pending;
  assert.equal(h.starts.length, 0, "A status await must not turn into a background Activity.request");
  assert.equal(result.activityId, "old-activity");
  assert.equal(result.scheduled, true);
  h.holdStatus(undefined);
  h.appState.currentState = "active";
  assert.equal((await h.bridge.syncAutomaticDepartureLiveActivity(input)).activityId, "new-activity");
  h.appState.currentState = "background";
  assert.equal((await h.bridge.syncAutomaticDepartureLiveActivity(null)).scheduled, false, "Explicit end still works in background");
}

// Native replacement must keep the old Activity until a new request succeeds.
// This is a Swift source-order contract, not Apple SDK/device execution.
const native = readFileSync("apps/mobile/modules/weatheron-widget-data/ios/WeatheronWidgetDataModule.swift", "utf8");
const start = native.slice(native.indexOf('AsyncFunction("startDepartureActivity")'), native.indexOf('AsyncFunction("endDepartureActivity")'));
const replacement = start.slice(start.indexOf("let activity: Activity<"));
assert.ok(replacement.indexOf("requestDepartureActivity(") >= 0);
assert.ok(replacement.indexOf("endOtherDepartureActivities(keeping: activity.id)") > replacement.indexOf("pushType: nil"), "End old Activities only after token/local replacement request succeeds");
assert.ok(!start.includes("endAllDepartureActivities()"), "A failed replacement cannot erase the previously accepted reservation");

// A deferred native replacement of the same destination is not an acknowledgement
// of a new time. Execute the actual state effect with the older scheduled status.
const stateSource = readFileSync("apps/mobile/src/state/useWeatherOnAppState.ts", "utf8");
const ast = ts.createSourceFile("state.ts", stateSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
let effect;
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(ast) === "useEffect" && node.arguments[0]?.getText(ast).includes("const syncRevision = ++departureActivitySyncRevisionRef.current")) effect = node.arguments[0].getText(ast);
  ts.forEachChild(node, visit);
}
visit(ast); assert.ok(effect);
for (const [status, expected] of [
  [{ destinationId: input.destinationId, departureAt: oldDeparture, scheduled: true }, 0],
  [{ destinationId: input.destinationId, departureAt: newDeparture, scheduled: false, active: false }, 0],
  [{ destinationId: input.destinationId, departureAt: newDeparture, scheduled: true }, 1],
]) {
  let acknowledgements = 0;
  const bindings = { appStateHydrated: true, departureActivitySyncRevisionRef: { current: 0 }, automaticDepartureActivityInput: input,
    syncAutomaticDepartureLiveActivity: async () => ({ ...status, automaticStartSupported: true }),
    setDepartureActivityReplacementDestinationId: () => { acknowledgements++; },
    AppState: { addEventListener: () => ({ remove() {} }) }, clearTimeout() {},
    getDepartureLiveActivityActivationDelay: shared.getDepartureLiveActivityActivationDelay, setTimeout() { throw new Error("Native scheduling needs no JS timer"); } };
  const cleanup = new Function(...Object.keys(bindings), `${compile(`const run = ${effect};`)}\nreturn run;`)(...Object.values(bindings))();
  await flush();
  assert.equal(acknowledgements, expected, "Replacement acknowledgement requires active/scheduled state and matching absolute departure");
  cleanup();
}
console.log("PASS: actual iOS provider status/network/background races, end registration ordering, foreground replacement, explicit background end, exact-time native acknowledgement and non-destructive Swift replacement source contract. Native compilation/presentation remain device QA.");

// Detail status must not present an old accepted time as the newly edited plan.
const screenSource = readFileSync("apps/mobile/src/screens/DestinationCareScreen.tsx", "utf8");
const screenAst = ts.createSourceFile("screen.tsx", screenSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const labels = [];
function findLabels(node) {
  if (ts.isVariableDeclaration(node) && ["departureActivityMatchesDestination", "departureActivityMatchesCurrentPlan", "departureActivityPreservedForOtherPlan", "liveActivityMeta"].includes(node.name.getText(screenAst))) labels.push(`const ${node.getText(screenAst)};`);
  ts.forEachChild(node, findLabels);
}
findLabels(screenAst);
assert.equal(labels.length, 4);
const labelFor = status => {
  const bindings = { departureActivityStatus: status, selectedDestinationPlace: { id: input.destinationId }, selectedDestinationDepartureAt: newDeparture,
    departureTime: "11:00", destinationCareEnabled: true, departureReady: true, departureLiveActivityAutoLeadMinutes: 60 };
  return new Function(...Object.keys(bindings), `${compile(labels.join("\n"))}\nreturn liveActivityMeta;`)(...Object.values(bindings));
};
assert.match(labelFor({ supported: true, enabled: true, destinationId: input.destinationId, departureAt: oldDeparture, scheduled: true }), /기존 카운트다운.*아직 적용 안 됨/);
assert.equal(labelFor({ supported: true, enabled: true, destinationId: input.destinationId, departureAt: newDeparture, scheduled: true }), "출발 60분 전 시작 예약됨");
assert.equal(labelFor({ supported: true, enabled: true, destinationId: input.destinationId, departureAt: newDeparture, active: true }), "11:00까지 표시 중");
console.log("PASS: actual destination-detail status expressions require the native absolute time to match the edited plan before claiming start reservation/current display.");
