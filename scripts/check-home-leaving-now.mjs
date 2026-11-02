import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { buildSync } from "esbuild";
import ts from "typescript";

// Run the production Home declarations and both platform rendering paths.
// Only native views, styles and event handlers are replaced; no copied display rule.
const source = readFileSync(process.env.HOME_PLAN_SOURCE ?? "apps/mobile/src/screens/HomeScreen.tsx", "utf8");
const ast = ts.createSourceFile("HomeScreen.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const compile = source => ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
}).outputText;
function load(file) {
  const module = { exports: {} };
  const code = buildSync({ entryPoints: [file], bundle: true, platform: "node", format: "cjs", write: false }).outputFiles[0].text;
  new Function("module", "exports", code)(module, module.exports);
  return module.exports;
}
const { getHomeDepartureSummary } = load("apps/mobile/src/utils/homeCompanion.ts");
const { getDestinationTiming, getDestinationLeavingNowTiming } = load("apps/mobile/src/state/appStateHelpers.ts");
const { forecastTime } = load("apps/mobile/src/utils/homeOuting.ts");
const home = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === "HomeScreen");
const statements = home.body.statements;
const start = statements.findIndex(n => ts.isVariableStatement(n) && n.declarationList.declarations[0].name.getText(ast) === "departureSummary");
const end = statements.findIndex(n => ts.isVariableStatement(n) && n.declarationList.declarations[0].name.getText(ast) === "refreshMessage");
assert.ok(start >= 0 && end > start);
const declarations = statements.slice(start, end).map(n => n.getText(ast)).join("\n");
let control, explanation;
function visit(node) {
  if (ts.isJsxElement(node) && node.openingElement.attributes.getText(ast).includes('testID="home-departure-control"')) control = node;
  if (ts.isJsxElement(node) && node.openingElement.attributes.getText(ast).includes('testID="home-departure-explanation"')) explanation = node.parent;
  ts.forEachChild(node, visit);
}
visit(home);
assert.ok(control && explanation && ts.isConditionalExpression(explanation));
const renderCode = compile(`${declarations}\nresult = [destinationReady ? (${control.getText(ast)}) : null, (${explanation.getText(ast)})];`);
function nodes(value, output = []) {
  if (!value || typeof value !== "object") return output;
  if (Array.isArray(value)) value.forEach(child => nodes(child, output));
  else { output.push(value); nodes(value.children, output); }
  return output;
}
function visibleText(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (!value) return "";
  return (Array.isArray(value) ? value : value.children ?? []).map(visibleText).join("");
}

const now = Date.parse("2026-11-02T09:00:00+09:00");
const currentResult = {
  requestKind: "now", status: "ready", provider: "kakao", timingBasis: "current", durationSeconds: 1500,
  updatedAt: new Date(now - 30_000).toISOString(), expiresAt: new Date(now + 30_000).toISOString(),
};
const cases = [
  ["latest", { status: "ready", result: currentResult }, /최신 조회/],
  ["failed with reference", { status: "error", result: currentResult }, /조회 실패.*이전 조회 기준 참고/],
  ["offline with reference", { status: "offline", result: currentResult }, /오프라인.*이전 조회 기준 참고/],
  ["failed without reference", { status: "error" }, /조회 실패.*확인 불가/],
  ["loading without reference", { status: "loading" }, /조회 중.*확인 불가/],
  ["no information", undefined, undefined],
];
let renders = 0;
for (const platform of ["ios", "android", "web"])
for (const timeBasis of ["arrival", "departure"])
for (const past of [false, true])
for (const [name, routeState, pattern] of cases)
for (const travelStatus of ["ready", "fallback", "loading"])
for (const destinationReady of [true, false]) {
  const schedule = {
    timeBasis, targetArrivalTime: timeBasis === "arrival" ? past ? "08:40" : "10:40" : past ? "08:00" : "10:00",
    transportMode: "drive", repeatEnabled: false, repeatDays: [],
  };
  const estimate = {
    ...currentResult, originPlaceId: "origin", destinationPlaceId: "destination", transportMode: "drive",
    durationSeconds: 2400, travelMinutes: 40, distanceMeters: 8000,
  };
  const planned = getDestinationTiming(estimate, schedule, "Asia/Seoul", now, "KR", "KR", "origin");
  const homeDepartureAt = planned.departureAt;
  const timing = routeState ? getDestinationLeavingNowTiming(estimate, schedule, "Asia/Seoul", now, "KR", "KR", "origin", routeState) : undefined;
  if (routeState) assert.equal(Boolean(timing), past, "The actual state helper gates current guidance on scheduled departure");
  const description = timing?.nowArrivalDescription;
  const routeAdvice = {
    travelStatus, recommendedDepartureTime: "10:00", targetArrivalTime: "10:40",
    arrivalAt: "2026-11-02T10:40:00+09:00", travelMinutes: 40, bufferMinutes: 0,
    routeMessage: "예정 경로 안내", routeUpdatedAt: "2026-11-02T08:00:00+09:00",
    nowArrivalDescription: description,
  };
  const state = { destinationCare: { departureAdvice: routeAdvice } };
  const before = JSON.stringify(state);
  const context = {
    result: null, state, destinationReady, homeDepartureAt, homeSchedulePreference: schedule,
    outingWeather: { countryCode: "KR", timezone: "Asia/Seoul" }, getHomeDepartureSummary, forecastTime,
    Date: class extends Date { static now() { return now; } }, layout: { width: 375 }, fontScale: 1,
    React: { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }) },
    Platform: { OS: platform }, styles: {}, theme: {}, selectedDestination: { place: { id: "test" } },
    HomeValueTransition: "Transition", FeedbackPressable: "Pressable", View: "View", Image: "Image", Text: "Text",
    ambientUiIcons: {}, isHomeTightLayout: () => false, onNavigate() {},
  };
  vm.runInNewContext(renderCode, context);
  const all = nodes(context.result);
  const label = `${platform}/${timeBasis}/${past ? "past" : "future"}/${name}/${travelStatus}/${destinationReady}`;
  assert.equal(JSON.stringify(state), before, `${label}: rendering must not mutate scheduled advice`);
  if (!destinationReady) { assert.equal(all.length, 0, label); continue; }
  const body = getHomeDepartureSummary(state.destinationCare, true, homeDepartureAt, now, timeBasis).body;
  const text = visibleText(context.result);
  if (description) {
    assert.ok(text.includes(description), `${label}: current ETA/status/query time must be visible`);
    assert.equal(text.split(description).length - 1, 1, `${label}: no duplicate current description`);
    assert.match(text, pattern, label);
    assert.doesNotMatch(text, /예정 경로 안내|지난 출발 시간이라/, `${label}: don't repeat scheduled guidance`);
    if (timing.nowArrivalAt) {
      assert.ok(text.includes("조회 2026/11/2 08:59"), label);
      assert.match(text, timing.nowArrivalReference ? /09:24 도착 예상/ : /09:25 도착 예상/, label);
    } else assert.doesNotMatch(text, /최신 조회|이전 조회 기준 참고|조회 2026/, label);
  } else {
    assert.doesNotMatch(text, /지금 출발|최신 조회|이전 조회 기준 참고/, label);
    if (platform !== "ios" || past || travelStatus !== "ready") assert.ok(text.includes(body), label);
    else assert.equal(all.some(n => n.props.testID === "home-departure-explanation"), false, label);
  }
  const button = all.find(n => n.type === "Pressable");
  if (description) assert.ok(button.props.accessibilityLabel.includes(description), label);
  const iosExplanation = all.find(n => n.props.testID === "home-departure-explanation");
  if (iosExplanation) {
    assert.equal(iosExplanation.props.numberOfLines, undefined, `${label}: preserve full status/query time`);
    assert.equal(visibleText(iosExplanation), description ?? body, label);
  }
  renders++;
}
console.log(`PASS: Home leaving-now production declarations/JSX (${renders} destination renders + no-destination guards): latest, failed/offline reference, unavailable/loading/no info; before/after departure, both schedule bases and iOS/Android/web. Native layout remains device QA.`);
