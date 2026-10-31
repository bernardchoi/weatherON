// Run from repository root: node docs/audits/uiux-review-2026-10-17/main-8217078/review2-repro.mjs
// Audit evidence for existing behavior; these assertions reproduce defects, not fixes.
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { buildSync } from "esbuild";

function functionsFrom(file, names, bindings = {}) {
  const source = fs.readFileSync(file, "utf8");
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const selected = ast.statements.filter(n => ts.isFunctionDeclaration(n) && names.includes(n.name?.text));
  assert.equal(selected.length, names.length);
  const code = ts.transpile(selected.map(n => n.getText(ast).replace(/^export\s+/, "")).join("\n"), { target: ts.ScriptTarget.ES2020 });
  return new Function(...Object.keys(bindings), code + `;return {${names.join(",")}};`)(...Object.values(bindings));
}
const shared = { exports: {} };
new Function("module", "exports", buildSync({ entryPoints: ["packages/shared/src/index.ts"], bundle: true, platform: "node", format: "cjs", write: false }).outputFiles[0].text)(shared, shared.exports);
const snapshot = shared.exports.normalizeWeatherKitWeather({ currentWeather: { asOf: "2026-10-17T03:00:00Z", conditionCode: "Clear" } }, { locationId: "audit", locationName: "Seoul", countryCode: "KR", timezone: "Asia/Seoul" });
const detail = functionsFrom("apps/mobile/src/screens/WeatherDetailScreen.tsx", ["getHourlyForecast", "formatTimeLabel"]);
assert.equal(snapshot.current.tempAvailable, false);
assert.equal(snapshot.current.tempC, 0);
assert.equal(snapshot.hourly.length, 0);
const fallback = detail.getHourlyForecast(snapshot);
assert.equal(fallback.length, 1);
assert.equal(detail.formatTimeLabel(fallback[0].time), "03:00");
const seoulClock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(snapshot.observedAt));
assert.equal(seoulClock, "12:00");

const { inferPlaceCategory } = functionsFrom("apps/server/src/proxyCore.mjs", ["inferPlaceCategory"]);
const serviceCategory = inferPlaceCategory("서비스,산업 > 여행사 모두투어 타조투어");
assert.equal(serviceCategory, "mountain");

const searchSource = fs.readFileSync("apps/mobile/src/screens/DestinationAddScreen.tsx", "utf8");
assert.match(searchSource, /searchControlGlass = Platform\.OS === "ios" \? undefined : iosGlassSurface/);
assert.match(searchSource, /searchControlGlass && placeSearchQuery\.length > 0/);
const clearButton = {};
for (const os of ["ios"]) {
  const { iosGlassSurface } = functionsFrom("apps/mobile/src/theme/iosGlass.ts", ["iosGlassSurface"], { Platform: { OS: os } });
  const surface = os === "ios" ? undefined : iosGlassSurface({}, "control");
  clearButton[os] = Boolean(surface && "서울역".length > 0);
  assert.equal(clearButton[os], false);
}
console.log(JSON.stringify({ commit: "8217078", missingForecast: { hourlyCount: snapshot.hourly.length, displayedFallbackCount: fallback.length, tempAvailable: snapshot.current.tempAvailable, tempValue: fallback[0].tempC, displayedTime: detail.formatTimeLabel(fallback[0].time), locationTime: seoulClock }, serviceCategory, clearButton }, null, 2));
