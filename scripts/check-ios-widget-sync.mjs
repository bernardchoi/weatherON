import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const read = (path) => readFileSync(path, "utf8").replaceAll("\r\n", "\n");
const state = read("apps/mobile/src/state/useWeatherOnAppState.ts");
const widget = read("apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift");
const nativePath = "apps/mobile/modules/weatheron-widget-data/ios/WeatheronWidgetDataModule.swift";
const native = read(nativePath);
// Syntax parsing only, not a TypeScript typecheck. Requires Node >= 22.13.
for (const path of [
  "apps/mobile/src/state/useWeatherOnAppState.ts",
  "apps/mobile/src/providers/widgetLocations.ts",
  "apps/mobile/src/providers/widgetSnapshot.shared.ts",
  "apps/mobile/src/providers/widgetSnapshot.ios.ts",
  "apps/mobile/src/providers/widgetSnapshot.android.ts",
  "apps/mobile/src/providers/widgetSnapshot.ts",
  "apps/mobile/modules/weatheron-widget-data/src/WeatheronWidgetDataModule.ts",
]) stripTypeScriptTypes(read(path));
async function loadTS(path, prelude = "") {
  const source = read(path).replace(/^import[\s\S]*?;\n/gmu, "");
  return import(`data:text/javascript;base64,${Buffer.from(prelude + stripTypeScriptTypes(source)).toString("base64")}`);
}
const { createWidgetLocations } = await loadTS("apps/mobile/src/providers/widgetLocations.ts");
const saved = [{ place: { id: "tokyo", name: "Tokyo" } }, { place: { id: "seoul", name: "Seoul" } }];
assert.deepEqual(createWidgetLocations("Home", saved).map(({ id }) => id), ["__current__", "tokyo", "seoul"]);
assert.deepEqual(createWidgetLocations("Home", []).map(({ id }) => id), ["__current__"]);
assert.equal(createWidgetLocations("Home", [{ place: { id: "tokyo", name: "Renamed" } }])[1].name, "Renamed");

// Execute the actual hook effect bodies without React/native dependencies.
function runEffect(marker, context) {
  const start = state.lastIndexOf("  useEffect(() => {", state.indexOf(marker));
  const end = state.indexOf("\n  }, [", start);
  assert.ok(start >= 0 && end > start);
  return new Function("context", `with (context) {${state.slice(start + "  useEffect(() => {".length, end)}\n}`)(context);
}
const locationsContext = {
  appStateHydrated: true, Platform: { OS: "ios" },
  activeWeatherLocation: { locationName: "Home", locationId: "home" }, savedDestinations: saved,
  widgetLocationsKeyRef: { current: "" }, createWidgetLocations,
  // Deliberately no weather result: catalog delivery cannot depend on weather.
  saveWeatheronWidgetLocations: () => false,
};
runEffect("const locations = createWidgetLocations", locationsContext);
assert.equal(locationsContext.widgetLocationsKeyRef.current, "", "failed delivery must remain retryable");
let catalogSaves = 0;
locationsContext.saveWeatheronWidgetLocations = () => { catalogSaves++; return true; };
runEffect("const locations = createWidgetLocations", locationsContext);
runEffect("const locations = createWidgetLocations", locationsContext);
assert.equal(catalogSaves, 1, "unchanged catalog must not flood WidgetKit");
locationsContext.savedDestinations = [];
runEffect("const locations = createWidgetLocations", locationsContext);
assert.equal(catalogSaves, 2, "deleting the last destination must publish the empty list");
locationsContext.appStateHydrated = false;
locationsContext.widgetLocationsKeyRef.current = "";
runEffect("const locations = createWidgetLocations", locationsContext);
assert.equal(catalogSaves, 2, "launch defaults must not erase the saved catalog before hydration");

let snapshotSaves = 0;
const snapshotContext = {
  appStateHydrated: true, Platform: { OS: "ios" }, isWeatherLoading: true,
  weatherProviderResult: { current: { source: "weatherkit", locationId: "home" } },
  activeWeatherLocation: { locationId: "home" },
  widgetSnapshotContentKeyRef: { current: "" }, widgetSnapshotContentKey: "weather-v1",
  widgetStoreSnapshot: { current: { temperatureC: 21 } },
  saveWeatheronWidgetSnapshot: () => false,
};
const snapshotMarker = "if (widgetSnapshotContentKeyRef.current === widgetSnapshotContentKey)";
runEffect(snapshotMarker, snapshotContext);
assert.equal(snapshotContext.widgetSnapshotContentKeyRef.current, "");
snapshotContext.saveWeatheronWidgetSnapshot = (snapshot) => {
  assert.strictEqual(snapshot, snapshotContext.widgetStoreSnapshot);
  snapshotSaves++; return true;
};
runEffect(snapshotMarker, snapshotContext);
assert.equal(snapshotSaves, 1, "iOS must export usable home weather while destinations load");
runEffect(snapshotMarker, snapshotContext);
assert.equal(snapshotSaves, 1);
snapshotContext.widgetSnapshotContentKeyRef.current = "";
snapshotContext.weatherProviderResult.current.source = "fallback";
runEffect(snapshotMarker, snapshotContext);
assert.equal(snapshotSaves, 1, "fixture weather must not overwrite the widget");
snapshotContext.weatherProviderResult.current.source = "weatherkit";
snapshotContext.activeWeatherLocation.locationId = "other";
runEffect(snapshotMarker, snapshotContext);
assert.equal(snapshotSaves, 1, "old weather must not receive newly selected coordinates");
snapshotContext.activeWeatherLocation.locationId = "home";
snapshotContext.Platform.OS = "android";
runEffect(snapshotMarker, snapshotContext);
assert.equal(snapshotSaves, 1, "Android loading behavior is preserved");

let onChange;
const lifecycleContext = {
  AppState: { addEventListener: (_, callback) => { onChange = callback; return { remove() {} }; } },
  appLifecycleStateRef: { current: "background" },
  widgetSnapshotContentKeyRef: { current: "delivered" }, widgetLocationsKeyRef: { current: "delivered" },
  setWeatherRefreshTick: () => {},
  localNotificationSync: { retry() {} },
};
runEffect('const previousState = appLifecycleStateRef.current;', lifecycleContext);
onChange("active");
assert.equal(lifecycleContext.widgetSnapshotContentKeyRef.current, "");
assert.equal(lifecycleContext.widgetLocationsKeyRef.current, "");

const serializers = await loadTS("apps/mobile/src/providers/widgetSnapshot.shared.ts", `
const resolveWeatherTimeZone = (_, zone) => zone;
const getConditionLabel = (value) => value;
const translateText = (value) => value;
const getLocalePolicy = () => ({ languageTag: 'en-US', temperatureUnit: 'celsius', distanceUnit: 'meter', uses24HourClock: true });
`);
const weather = { locationId: "home", locationName: "Home", countryCode: "KR", observedAt: "2026-10-02T12:00:00Z",
  current: { tempC: 21.6, feelsLikeC: 20.2, condition: "clear", rainProbabilityPct: 10.4, humidityPct: 50.6, windMs: 2.15 },
  hourly: [{ time: "13:00", tempC: 22.2, condition: "clear", rainProbabilityPct: 12.4 }] };
const item = { name: "Item", source: "preset" };
const outfit = { items: { top: item, bottom: item, shoes: item }, variant: "default" };
const snapshot = serializers.createWeatheronWidgetLocationSnapshot(weather, outfit, { level: "none" }, { travelMinutes: 12.7 });
assert.equal(snapshot.temperatureC, Math.round(weather.current.tempC));
assert.equal(snapshot.observedAt, weather.observedAt);
assert.equal(snapshot.travelMinutes, 13, "a fractional route must not reject the entire Swift store");
assert.equal(serializers.createWeatheronWidgetLocationSnapshot(weather, outfit, { level: "none" }, { travelMinutes: NaN }).travelMinutes, undefined);
assert.equal(serializers.createWeatheronWidgetStoreSnapshot(snapshot, []).current, snapshot);

// Native contracts only: these checks do NOT execute or compile Swift/WidgetKit.
for (const path of ["apps/mobile/ios/WeatherON/WeatherON.entitlements", "apps/mobile/ios/WeatherON/WeatherONRelease.entitlements", "apps/mobile/ios/WeatherONWidget/WeatherONWidget.entitlements"]) {
  assert.ok(read(path).includes("group.com.weatheron.mobile"));
}
assert.ok(native.includes('widgetKind = "WeatherONLocationWidgetV4"'));
assert.ok(widget.includes('let kind = "WeatherONLocationWidgetV4"'));
assert.ok(native.includes('Function("saveLocations")'));
assert.ok(widget.includes("if let locations = WeatherONStoreReader.locations() { return locations }"));
assert.ok(widget.includes("return identifiers.map { id in"), "unresolved installed selections must retain their IDs");
assert.ok(widget.includes("guard loaded.hasSharedSnapshot else"), "preview destinations must never enter the editor");
assert.ok(widget.includes("if !entry.hasSharedSnapshot"));
assert.ok(widget.includes("!catalog.contains(where: { $0.id == selectionID })"));
assert.ok(widget.includes("store.destinations.contains(where: { $0.id == selectionID })"));
assert.ok(widget.includes("now.addingTimeInterval(15 * 60)"));
assert.ok(native.includes("try data.write(to: fileURL, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])"));
assert.ok(native.indexOf("try data.write") < native.indexOf("WidgetCenter.shared.reloadTimelines"));
assert.ok(!native.includes("widgetReloadWorkItem"));
assert.ok(native.includes("// Do not acknowledge an unwritten snapshot"));
console.log("iOS widget sync: behavior checks and native source contracts passed (Swift not executed).");
