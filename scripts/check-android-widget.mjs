import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const moduleConfig = JSON.parse(read("apps/mobile/modules/weatheron-widget-data/expo-module.config.json"));
const detail = read("apps/mobile/src/screens/WeatherDetailScreen.tsx");
const appState = read("apps/mobile/src/state/useWeatherOnAppState.ts");
const provider = read("apps/mobile/modules/weatheron-widget-data/android/src/main/java/com/weatheron/widgetdata/WeatherONWidgetProvider.kt");
const manifest = read("apps/mobile/modules/weatheron-widget-data/android/src/main/AndroidManifest.xml");
const widgetInfo = read("apps/mobile/modules/weatheron-widget-data/android/src/main/res/xml/weatheron_widget_info.xml");

assert.ok(moduleConfig.platforms.includes("android"));
assert.deepEqual(moduleConfig.android.modules, ["com.weatheron.widgetdata.WeatheronWidgetDataModule"]);
assert.match(detail, /Platform\.OS === "android" \? null : getUvIndexSummary/u);
assert.match(appState, /Platform\.OS !== "ios" && Platform\.OS !== "android"/u);
assert.match(provider, /selectedDestinationId/u);
assert.match(provider, /WeatherONWidgetProvider::class\.java/u);
assert.match(manifest, /android\.appwidget\.action\.APPWIDGET_UPDATE/u);
assert.match(widgetInfo, /android:updatePeriodMillis="1800000"/u);

console.log("Android widget wiring and Android-only UV cleanup checks passed.");
