import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [native, manifest, strings, platform, appState, screen] = await Promise.all([
  read("apps/mobile/modules/weatheron-widget-data/android/src/main/java/com/weatheron/widgetdata/WeatherONDepartureNotification.kt"),
  read("apps/mobile/modules/weatheron-widget-data/android/src/main/AndroidManifest.xml"),
  read("apps/mobile/modules/weatheron-widget-data/android/src/main/res/values-ko/strings.xml"),
  read("apps/mobile/src/providers/departureLiveActivity.android.ts"),
  read("apps/mobile/src/state/useWeatherOnAppState.ts"),
  read("apps/mobile/src/screens/DestinationCareScreen.tsx"),
]);

assert.match(native, /Notification\.ProgressStyle/);
assert.match(native, /android\.requestPromotedOngoing/);
assert.match(native, /Notification\.BigTextStyle/);
assert.match(native, /setAndAllowWhileIdle/);
assert.match(native, /R\.string\.weatheron_departure_stop/);
assert.match(strings, />종료</);
assert.doesNotMatch(native, /RemoteViews/);
assert.match(manifest, /POST_PROMOTED_NOTIFICATIONS/);
assert.match(manifest, /WeatherONDepartureReceiver/);
assert.match(platform, /startDepartureActivity/);
assert.match(appState, /Platform\.OS !== "ios" && Platform\.OS !== "android"/);
assert.match(screen, /Platform\.OS === "ios" \|\| Platform\.OS === "android"/);

console.log("Android 출발 실시간 업데이트 정적 검증 통과");
