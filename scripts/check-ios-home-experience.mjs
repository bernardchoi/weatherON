import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync("apps/mobile/src/utils/homeCompanion.ts", "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { getHomeCompanionMessage: message, getHomeDepartureSummary: departure } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
const weather = { stale: false, current: { condition: "clear", precipitationMm: 0, rainProbabilityPct: 0, windMs: 2, feelsLikeC: 22 } };
assert.match(message(weather, false), /다시 확인/);
assert.match(message({ ...weather, stale: true }, true), /다시 확인/);
assert.match(message({ ...weather, current: { ...weather.current, condition: "rain" } }, true), /우산/);
assert.match(message({ ...weather, current: { ...weather.current, condition: "snow", precipitationMm: 2 } }, true), /눈/);
assert.match(message({ ...weather, current: { ...weather.current, rainProbabilityPct: 50 } }, true), /가능성/);
assert.doesNotMatch(message(weather, true), /비가 내려|우산/);
assert.match(message({ ...weather, current: { ...weather.current, feelsLikeC: 33 } }, true), /물/);
const care = { departureAdvice: { recommendedDepartureTime: "08:20", targetArrivalTime: "09:00", travelStatus: "ready" } };
const now = Date.parse("2026-09-06T08:00:00+09:00");
assert.equal(departure(care, true, "2026-09-06T08:20:00+09:00", now).soon, true);
assert.equal(departure(care, true, "2026-09-07T08:20:00+09:00", now).soon, false, "tomorrow must not be urgent");
assert.equal(departure(care, true, "2026-09-06T07:50:00+09:00", now).soon, false);
assert.equal(departure(care, true, "invalid", now).soon, false);
assert.equal(departure(care, true, "2026-09-05T23:20:00Z", now).soon, true, "equivalent timezone offsets must agree");
assert.match(departure(care, false).value, /어디/);
assert.match(departure({ departureAdvice: { ...care.departureAdvice, travelStatus: "loading" } }, true).value, /확인/);
assert.match(departure({ departureAdvice: { ...care.departureAdvice, travelStatus: "fallback" } }, true).body, /예상/);
assert.match(departure({ departureAdvice: { ...care.departureAdvice, recommendedDepartureTime: "25:90" } }, true).value, /확인/);

console.log("Shared home: weather guidance, unavailable routes, schedule dates and timezone checks passed");

const homeSource = readFileSync('apps/mobile/src/screens/HomeScreen.tsx', 'utf8');
const homeAst = ts.createSourceFile('HomeScreen.tsx', homeSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let motionEffect;
function findEffect(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'HomeValueTransition') {
    const visit = (child) => {
      if (ts.isCallExpression(child) && child.expression.getText(homeAst) === 'useEffect') motionEffect = child.arguments[0].getText(homeAst);
      ts.forEachChild(child, visit);
    };
    visit(node);
  }
  ts.forEachChild(node, findEffect);
}
findEffect(homeAst);
assert.ok(motionEffect);
let started = 0, stopped = 0, current = 1;
const progress = {stopAnimation() {}, setValue(value) {current = value;}};
const Animated = {timing: () => ({start() {started++;}, stop() {stopped++;}})};
const runMotion = new Function('reducedMotion', 'progress', 'Animated', 'Easing', `return (${motionEffect})();`);
for (const reduced of [true, null]) runMotion(reduced, progress, Animated, {});
assert.equal(started, 0, 'reduced or unknown motion preference must stay static');
assert.equal(current, 1);
const stop = runMotion(false, progress, Animated, {out: () => {}, cubic: {}});
assert.equal(started, 1);
assert.equal(current, 0);
stop();
assert.equal(stopped, 1, 'changing content or unmounting must stop the prior animation');
console.log('Shared home: reduced motion and transition cancellation passed');
let refreshEffect;
function findRefresh(node) {
  if (ts.isCallExpression(node) && node.expression.getText(homeAst) === 'useEffect' && node.arguments[1]?.getText(homeAst) === '[isPullRefreshing, isWeatherLoading, reliableWeather]') refreshEffect = node.arguments[0].getText(homeAst);
  ts.forEachChild(node, findRefresh);
}
findRefresh(homeAst);
assert.ok(refreshEffect);
let acknowledgements = 0, refreshFinished = 0;
const observed = {current:false};
const runRefresh = new Function('isPullRefreshing','isWeatherLoading','reliableWeather','pullRefreshObservedLoadingRef','setIsPullRefreshing','setRefreshCompletedAt',`return (${refreshEffect})();`);
const refresh = (pull,loading,reliable) => runRefresh(pull,loading,reliable,observed,()=>refreshFinished++,()=>acknowledgements++);
refresh(false,false,true);
refresh(true,false,true);
assert.equal(acknowledgements,0,'must observe a refresh before saying it completed');
refresh(true,true,true);
refresh(true,false,false);
assert.equal(refreshFinished,1);
assert.equal(acknowledgements,0,'failed or stale refresh must not announce success');
observed.current=false;
refresh(true,true,true);
refresh(true,false,true);
assert.equal(acknowledgements,1);
console.log('Shared home: refresh completion and failure acknowledgement passed');
