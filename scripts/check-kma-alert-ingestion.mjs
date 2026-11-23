import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(path, imports = {}) {
  const exports = {};
  const out = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("exports", "require", out)(exports, name => {
    assert.ok(name in imports, "Unexpected dependency: " + name);
    return imports[name];
  });
  return exports;
}
const bulletin = load("apps/mobile/src/providers/kmaAlertBulletin.ts");
const { normalizeKmaOfficialSpecialAlert: normalize } = load("apps/mobile/src/providers/weatherProvider.ts", {
  "@weatheron/shared": {}, "./kmaAlertBulletin": bulletin, "../localization/react-native": {}, "../config/weatherEnv": {},
  "./weatherClient": {}, "./weatherLocations": {},
});
const location = (locationName) => ({ locationName, countryCode: "KR", coordinate: { latitude: 37.6, longitude: 127.1 } });
const now = Date.parse("2026-11-23T08:00:00+09:00");
const issued = { tmFc: "202611230700", tmSeq: 3, tmEf: "202611230730" };
const payload = (...item) => ({ response: { header: { resultCode: "00" }, body: { items: { item } } } });
const record = { ...issued, t6: "o 호우경보 : 경기도(고양, 파주)\n o 폭염주의보 : 서울\n o 강풍주의보 : 부산", t7: "o 호우경보 : 김포", other: "o 폭염경보 : 인천" };
const alert = (name, ...records) => normalize(payload(...records), location(name), now);
const goyang = alert("고양시 삼송동", record);
assert.equal(goyang.title, "호우경보");
assert.equal(goyang.effectiveAt, "2026-11-22T22:30:00.000Z");
assert.equal(alert("파주시 운정동", record).active, true);
assert.equal(alert("서울 성수동", record).title, "폭염주의보");
for (const name of ["김포시", "인천", "부산", "경기도 양주시", "내 위치 주변"]) assert.equal(alert(name, record).active, false);
assert.equal(alert("고양시", record, { ...issued, tmFc: "202611230755", t6: "o 특보 없음" }).active, false, "latest bulletin supersedes earlier alerts");
assert.equal(alert("고양시", record, { ...issued, tmFc: "202611230755", t6: "" }).active, false, "blank newest bulletin cannot resurrect older data");
assert.equal(alert("고양시", { ...record, tmEf: "202611230801" }).active, false);
assert.equal(alert("고양시", { ...record, tmFc: "202611230801" }).active, false);
assert.equal(alert("고양시", { ...record, tmFc: "202611150700", tmEf: "202611150730" }).active, false);
assert.equal(alert("고양시", { ...record, tmEf: "202611310730" }).active, false);
assert.equal(alert("고양시", { ...record, t6: "o 호우경보 : 경기도(김포, 고양 제외)" }).active, false);
assert.equal(alert("김포시", { ...record, t6: "o 호우경보 : 경기도(김포, 고양 제외)" }).active, false);
assert.equal(alert("경기도 광주시", { ...record, t6: "o 호우경보 : 광주" }).active, false);
assert.equal(alert("강원도 고성군", { ...record, t6: "o 호우경보 : 경상남도(고성)" }).active, false);
assert.equal(alert("경상남도 고성군", { ...record, t6: "o 호우경보 : 경상남도(고성)" }).active, true);
assert.equal(alert("서울 성수동", { ...record, t6: "o 호우경보 : 서울(동남권 제외)" }).active, false, "unresolved subregion is not asserted");
assert.equal(alert("고양시", { ...record, t6: "o 호우주의보 : 경기(김포,\n 고양)<br>o 폭염경보 : 고양" }).title, "폭염경보");
assert.equal(normalize({ response: { header: { resultCode: "30" } } }, location("고양시"), now).rawStatus, "feed_unavailable");
assert.equal(alert("고양시", { wrn: "O", lvl: "W", regKo: "고양" }).active, false);
assert.equal(alert("고양시", { wrn: "H", lvl: "W", regKo: "고양" }).title, "폭염경보");
console.log("PASS: KMA ingestion, effective time, snapshot replacement, locally scoped regions, provisional exclusion and structured type codes.");
