import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(path, imports = {}) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  new Function("exports", "require", code)(exports, name => {
    assert.ok(name in imports, "Unexpected dependency " + name);
    return imports[name];
  });
  return exports;
}
const source = load("apps/mobile/src/providers/japanWeatherAlerts.ts");
const { normalizeJapanWeatherAlerts: normalize } = source;
const now = Date.now();
const iso = ms => new Date(ms).toISOString();
const url = "https://weatherkit.apple.com/alertDetails/index.html?ids=osaka-rain&lang=ja";
const example = { id: "osaka-rain", countryCode: "JP", description: "大雨警報　（浸水害）", source: "気象庁", detailsUrl: "#osaka-rain", effectiveTime: iso(now - 60_000), expireTime: iso(now + 10 * 60_000) };
const response = (alerts, extra = {}) => ({ weatherAlerts: { alerts, detailsUrl: url, ...extra } });
const read = payload => normalize(payload, "jp-osaka", now);
const result = read(response([example, example], { metadata: { expireTime: iso(now + 300_000) } }));
assert.deepEqual(result, { locationId: "jp-osaka", status: "active", alerts: [{ id: example.id, description: example.description, agency: example.source, detailsUrl: url + "#osaka-rain", expiresAt: now + 300_000 }] });
assert.equal(read(response([{ ...example, detailsUrl: undefined }])).alerts[0].detailsUrl, url);
assert.equal(read(response([])).status, "none");
assert.equal(read(response([], { metadata: { temporarilyUnavailable: true } })).status, "unavailable");
assert.equal(read(response([example], { metadata: { expireTime: iso(now) } })).status, "unavailable");
assert.equal(read(response([{ ...example, expireTime: iso(now) }])).status, "none");
assert.equal(read(response([{ ...example, effectiveTime: iso(now + 1) }])).status, "none");
for (const payload of [
  {}, null, { weatherAlerts: {} }, response([{}]), response([{ ...example, countryCode: "US" }]),
  response([{ ...example, source: "" }]), response([{ ...example, expireTime: "not-a-date" }]),
  response([{ ...example, detailsUrl: "https://weatherkit.apple.com.evil.invalid/alertDetails/index.html" }], { detailsUrl: undefined }),
  response([{ ...example, detailsUrl: "javascript:alert(1)" }], { detailsUrl: undefined }),
  response([{ ...example, detailsUrl: "https://weatherkit.apple.com/auth" }], { detailsUrl: undefined }),
]) assert.equal(read(payload).status, "unavailable");

const tokyo = { locationId: "jp-tokyo", countryCode: "JP", timezone: "Asia/Tokyo", coordinate: { latitude: 35.68, longitude: 139.65 } };
const osaka = { ...tokyo, locationId: "jp-osaka", coordinate: { latitude: 34.69, longitude: 135.50 } };
const kr = { ...tokyo, locationId: "kr", countryCode: "KR", timezone: "Asia/Seoul" };
let seenUrl;
const net = load("apps/mobile/src/providers/weatherClient.ts", {
  "@weatheron/shared": { isValidIanaTimeZone: zone => zone === "Asia/Tokyo" },
  "../config/weatherEnv": { getWeatherRuntimeConfig: () => ({ clientMode: "fixture" }) },
  "../utils/httpJson": { normalizeBaseUrl: value => value, fetchJsonWithTimeout: async value => {
    seenUrl = new URL(value);
    return response([example]);
  } },
});
const transport = net.createProxyWeatherClient({ weatherApiBaseUrl: "https://weather.example" });
await transport.fetchWeatherKitJapanAlerts({ ...osaka.coordinate, timezone: osaka.timezone, language: "en" });
assert.equal(seenUrl.pathname, "/weather/weatherkit");
assert.deepEqual(Object.fromEntries(seenUrl.searchParams), { latitude: "34.69", longitude: "135.5", timezone: "Asia/Tokyo", language: "en", countryCode: "JP", dataSets: "weatherAlerts" });

const { createWeatherProvider } = load("apps/mobile/src/providers/weatherProvider.ts", {
  "./japanWeatherAlerts": source, "./kmaAlertBulletin": { normalizeKmaBulletin: () => undefined },
  "../localization/react-native": { Platform: { OS: "ios" } },
  "../config/weatherEnv": { getWeatherRuntimeConfig: () => ({ clientMode: "proxy" }) },
  "./weatherClient": {},
  "./weatherLocations": { defaultSeoulWeatherLocation: kr, seongsuWeatherLocation: kr, defaultGangneungWeatherLocation: kr, gangneungWeatherLocation: kr },
  "@weatheron/shared": { isValidIanaTimeZone: () => true, normalizeOpenMeteoWeather: (_, params) => ({ ...params, source: "openmeteo", observedAt: iso(now), current: {} }), normalizeWeatherKitWeather: (_, params) => ({
    ...params, source: "weatherkit", observedAt: iso(now), current: {},
  }) },
});
let release, calls = 0;
const client = {
  fetchWeatherKitForecast: async () => ({}),
  fetchWeatherKitJapanAlerts: async ({ latitude, language }) => {
    calls++;
    assert.equal(latitude, tokyo.coordinate.latitude);
    assert.equal(language, "ja");
    return new Promise(resolve => { release = resolve; });
  },
};
const stages = [];
const pendingTokyo = createWeatherProvider(client, { platform: "ios" }).getSnapshots("ready", {
  currentLocation: tokyo, destinationLocation: osaka, language: "ja", onUpdate: state => stages.push(state),
});
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(stages.at(-1).japanWeatherAlerts.status, "checking");
assert.equal(stages.at(-1).current.source, "weatherkit");
assert.equal(calls, 1, "destination alerts were not requested");
release(response([example]));
assert.equal((await pendingTokyo).japanWeatherAlerts.status, "active");
const rejected = await createWeatherProvider({ ...client, fetchWeatherKitJapanAlerts: async () => { throw new Error("401"); } }, { platform: "ios" })
  .getSnapshots("ready", { currentLocation: osaka, destinationLocation: tokyo });
assert.equal(rejected.current.source, "weatherkit");
assert.equal(rejected.japanWeatherAlerts.status, "unavailable");
await createWeatherProvider(client, { platform: "android" }).getSnapshots("ready", { currentLocation: tokyo, destinationLocation: osaka });
await createWeatherProvider(client, { platform: "ios" }).getSnapshots("ready", { currentLocation: kr, destinationLocation: osaka });
assert.equal(calls, 1, "no Japan request for Android or Korean current location");

// Render the release component with a small synchronous JSX recorder. The raw
// strings must remain unmodified and links must be the actual provider URLs.
const opened = [];
const jsx = (type, props) => ({ type, props });
const { JapanWeatherAlertCard } = load("apps/mobile/src/components/JapanWeatherAlertCard.tsx", {
  react: { useState: initial => [initial, () => {}], useEffect: () => {} },
  "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
  "../localization/react-native": { Linking: { openURL: async value => opened.push(value) }, RawText: "raw", Text: "text", View: "view", StyleSheet: { create: value => value } },
  "../providers/japanWeatherAlerts": source, "./FeedbackPressable": { FeedbackPressable: "link" },
});
const flatten = tree => Array.isArray(tree) ? tree.flatMap(flatten) : tree?.props ? [tree, ...flatten(tree.props.children)] : [];
const theme = { text: "#111111", muted: "#333333", warm: "#dd7700" };
const cards = flatten(JapanWeatherAlertCard({ result, now, theme }));
assert.deepEqual(cards.filter(node => node.type === "raw").map(node => node.props.children), [example.description, example.source]);
assert.ok(cards.filter(node => node.type === "raw").every(node => node.props.numberOfLines === undefined));
cards.find(node => node.type === "link").props.onPress();
assert.deepEqual(opened, [url + "#osaka-rain"]);
const expired = flatten(JapanWeatherAlertCard({ result, now: now + 300_000, theme }));
assert.equal(expired.filter(node => node.type === "raw").length, 0);
expired.find(node => node.type === "link").props.onPress();
assert.equal(opened[1], source.japanWeatherAgencyUrl);
assert.equal(JapanWeatherAlertCard({ result: read(response([])), now, theme }), null);
assert.equal(JapanWeatherAlertCard({ result: source.japanWeatherAlertStatus("jp-osaka", "checking"), now, theme }), null);
console.log("PASS: Japan WeatherKit transport, availability, time and source validation, provider isolation, and Home links.");
