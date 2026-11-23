import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(path, imports = {}, source = readFileSync(path, "utf8")) {
  const exports = {};
  const out = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("exports", "require", out)(exports, name => {
    assert.ok(name in imports, "Unexpected dependency: " + name);
    return imports[name];
  });
  return exports;
}
const japanAlerts = load("apps/mobile/src/providers/japanWeatherAlerts.ts");
const zones = load("apps/mobile/src/providers/kmaAlertZones.ts");
const bulletin = load("apps/mobile/src/providers/kmaAlertBulletin.ts", { "./kmaAlertZones": zones });
const { normalizeKmaOfficialSpecialAlert: normalize } = load("apps/mobile/src/providers/weatherProvider.ts", {
  "@weatheron/shared": {}, "./japanWeatherAlerts": japanAlerts, "./kmaAlertBulletin": bulletin, "../localization/react-native": {}, "../config/weatherEnv": {},
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
// Trimmed archived bulletin sections, not authenticated API payloads.
// https://www.weatheri.co.kr/special/special01_f.php?go=072810
// https://www.weatheri.co.kr/special/special01_f.php?go=072816
const julyLocation = location("전라남도 광양시");
const july = (...records) => (at) => normalize(payload(...records), julyLocation, Date.parse(at));
const beforeDowngrade = {
  tmFc: "202607281000", tmEf: "202607281100", tmSeq: 1,
  t6: "o 폭염중대경보 : 전라남도(광양)\n o 폭염경보 : 전라남도(담양)",
};
const downgraded = {
  tmFc: "202607281600", tmEf: "202607281600", tmSeq: 2,
  t6: "o 폭염중대경보 : 경상북도(경산)\n o 폭염경보 : 전라남도(광양)",
};
const release = {
  tmFc: "202607281750", tmEf: "202607281800", tmSeq: 3,
  t6: "o 폭염중대경보 : 경상북도(경산)",
};
const chronological = july(release, downgraded, beforeDowngrade);
assert.equal(chronological("2026-07-28T10:59:59+09:00").active, false);
assert.equal(chronological("2026-07-28T11:00:00+09:00").level, "critical");
assert.equal(chronological("2026-07-28T15:59:59+09:00").title, "폭염중대경보");
assert.equal(chronological("2026-07-28T16:00:00+09:00").title, "폭염경보");
assert.equal(chronological("2026-07-28T17:59:59+09:00").level, "warning");
assert.equal(chronological("2026-07-28T18:00:00+09:00").active, false);
assert.equal(alert("고양시", { ...record, t6: "o 폭염 중대 경보： 경기(고양)<br>o 호우경보 : 경기도(고양)" }).title, "폭염중대경보");
assert.equal(alert("고양시", { ...record, t6: "o 호우 중대경보 : 고양" }).active, false);
assert.equal(alert("고양시", { ...record, t6: "o 폭염중대경보 해제 : 고양" }).active, false);
assert.equal(alert("고양시", { ...record, t6: "o 특보 없음", t7: "o 폭염중대경보 : 고양" }).active, false);
assert.equal(alert("고양시", { wrn: "H", lvl: "W", titl: "폭염 중대경보 발표", regKo: "고양" }).level, "critical");
assert.equal(alert("고양시", { wrn: "H", lvl: "W", titl: "폭염중대경보 해제", regKo: "고양" }).active, false);
assert.equal(alert("고양시", { wrn: "H", lvl: "W", content: "폭염중대경보 기준 안내", regKo: "고양" }).level, "warning");
assert.equal(alert("고양시", { wrn: "H", lvl: "4", regKo: "고양" }).active, false, "undocumented codes are not guessed");

const homePath = "apps/mobile/src/screens/HomeScreen.tsx";
const home = ts.createSourceFile(homePath, readFileSync(homePath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const copyFunction = home.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === "getHomeSpecialAlertCopy");
assert.ok(copyFunction);
const { getHomeSpecialAlertCopy: homeCopy } = load(homePath, {}, "export " + copyFunction.getText(home));
assert.deepEqual(homeCopy(chronological("2026-07-28T11:00:00+09:00")), {
  title: "폭염중대경보", body: "야외 활동을 피하고 실내에서 쉬어요",
});
assert.equal(homeCopy(chronological("2026-07-28T16:00:00+09:00")).title, "오늘은 더위 조심해요");

const reading = (area) => ({ ...record, t6: "o 호우주의보 : " + area });
const zoneAlert = (area, locationName, kmaAdministrativeArea) => normalize(
  payload(reading(area)), { ...location(locationName), kmaAdministrativeArea }, now,
);
const cases = [
  ["서울(서울동남권)", "서울특별시 강동구 천호동", true],
  ["서울(동남권)", "서울 송파구 잠실동", true],
  ["서울동남권", "서울특별시 강동구 천호동", true],
  ["서울(서울동남권)", "서울특별시 마포구 공덕동", false],
  ["서울(서울동남권)", "서울특별시", false],
  ["경기도(서울동남권)", "서울특별시 강동구 천호동", false],
  ["서울동북권", "서울특별시 성동구 성수동", true],
  ["서울서남권", "부산광역시 강서구", false],
  ["서울서북권", "서울 중구 명동", true],
  ["서울(동남권 제외)", "서울특별시 마포구 공덕동", true],
  ["서울(동남권 제외)", "서울특별시 강동구 천호동", false],
  ["경기도(파주동북부)", "경기도 파주시 문산읍", true],
  ["경기도(파주동북부)", "경기 파주시 조리읍", false],
  ["파주동북부", "파주시 법원읍", true],
  ["파주(동북부)", "파주시 법원읍", false], // unpublished label, never guess
  ["경기도(파주동북부, 고양)", "고양시 삼송동", true],
  ["파주동북부", "경기도 파주시", false],
  ["파주동북부", "문산읍", false],
  ["파주동북부", "경기도 양주시 문산읍", false],
  ["파주서북부", "경기도 파주시 진동면", true],
  ["파주남부", "경기도 파주시 광탄면", true],
  ["부산(부산동부 제외)", "부산광역시 연제구 거제동", true],
  ["부산(부산동부 제외)", "부산광역시 해운대구 우동", false],
  ["부산(부산동부 제외)", "부산광역시", false],
  ["부산(미확인구역 제외)", "부산 연제구", false],
  ["부산(부산동부 제외, 미확인 제외)", "부산 연제구", false],
  ["부산(부산중부)", "부산광역시 연제구", true],
  ["부산(부산중부)", "광주광역시 북구", false],
  ["완도(여서도 제외)", "전라남도 완도군 완도읍", true],
  ["전라남도(완도(여서도 제외))", "전라남도 완도군 완도읍", true],
  ["전라남도(완도군(여서도 제외))", "전남광주통합특별시 완도군 신지면", true],
  ["완도군(여서도 제외)", "전라남도 완도군 청산면 여서리", false],
  ["완도군(여서도 제외)", "전라남도 완도군 청산면 도청리", true],
  ["완도군(여서도 제외)", "전라남도 완도군 청산면", false],
  ["완도군(여서도 제외)", "전라남도 완도군", false],
  ["완도여서도", "전라남도 완도군 청산면 여서리", true],
  ["완도여서도", "전라남도 완도군 완도읍", false],
  ["완도", "전라남도 완도군 완도읍", true],
  ["전라남도(완도(여서도 제외), 광양)", "전라남도 광양시", true],
];
for (const [area, name, expected] of cases) {
  assert.equal(zoneAlert(area, name).active, expected, area + " / " + name);
}
assert.equal(normalize(payload({ ...record, t6: "o 폭염주의보 : 부산(부산동부 제외)" }), location("부산 연제구"), now).type, "heatwave");
assert.equal(zoneAlert("서울동남권", "카페", zones.readKmaAdministrativeArea("대한민국 서울특별시 강동구 천호대로 100")).active, true);
assert.equal(zoneAlert("서울동남권", "서울 강동구 전시장", "서울특별시 마포구").active, false);
assert.equal(zones.readKmaAdministrativeArea("서울특별시 마포구 공덕동 공덕로 123-4"), "서울특별시 마포구 공덕동");
assert.equal(zones.readKmaAdministrativeArea("부산광역시 연제구 카페 해운대구"), "부산광역시 연제구");
assert.equal(zones.readKmaAdministrativeArea("카페 서울특별시 마포구"), undefined);

const locationProvider = load("apps/mobile/src/providers/weatherLocations.ts", {
  "@weatheron/shared": { convertWgs84ToKmaGrid: () => ({ nx: 60, ny: 127 }) },
});
const { createWeatherLocationFromPlace } = load("apps/mobile/src/state/appStateHelpers.ts", {
  "@weatheron/shared": {}, "../utils/travelEstimate": {}, "../navigation/routes": {},
  "../navigation/routeLabels": {}, "../utils/zonedDateTime": {},
  "../providers/weatherLocations": locationProvider, "../providers/kmaAlertZones": zones,
});
const place = createWeatherLocationFromPlace({
  id: "test", coordinate: location("").coordinate, countryCode: "KR",
  name: "아무 이름", address: "경기도 파주시 문산읍 길 10",
});
assert.equal(place.locationName, "아무 이름");
assert.equal(place.kmaAdministrativeArea, "경기도 파주시 문산읍");
assert.equal(normalize(payload(reading("경기도(파주동북부)")), place, now).active, true);

let geocodes = 0;
const { requestDeviceWeatherLocation } = load("apps/mobile/src/providers/deviceLocation.ts", {
  "expo-location": {
    hasServicesEnabledAsync: async () => true,
    requestForegroundPermissionsAsync: async () => ({ granted: true }),
    getCurrentPositionAsync: async () => ({ coords: location("").coordinate }),
    Accuracy: { Balanced: 3 },
    reverseGeocodeAsync: async () => {
      geocodes++;
      return [{ region: "서울특별시", city: "서울", district: "강동구",
        name: "아무 건물", street: "천호대로", isoCountryCode: "KR" }];
    },
  },
  "./placeSearchClient": {}, "./weatherLocations": locationProvider, "./kmaAlertZones": zones,
});
const device = await requestDeviceWeatherLocation();
assert.equal(device.status, "granted");
assert.equal(geocodes, 1);
assert.equal(device.location.kmaAdministrativeArea, "서울 강동구");
assert.equal(normalize(payload(reading("서울(서울동남권)")), device.location, now).active, true);
console.log(`PASS: KMA bulletin, critical heat lifecycle and Home copy, ${cases.length} named/excluded scopes and existing GPS/search address paths.`);
