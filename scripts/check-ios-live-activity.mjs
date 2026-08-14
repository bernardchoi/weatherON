import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const appConfig = JSON.parse(read("apps/mobile/app.json"));
const appPlist = read("apps/mobile/ios/WeatherON/Info.plist");
const attributes = read("apps/mobile/modules/weatheron-widget-data/ios/WeatherONDepartureActivityAttributes.swift");
const nativeModule = read("apps/mobile/modules/weatheron-widget-data/ios/WeatheronWidgetDataModule.swift");
const liveActivity = read("apps/mobile/ios/WeatherONWidget/WeatherONDepartureLiveActivity.swift");
const widgetBundle = read("apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift");
const destinationScreen = read("apps/mobile/src/screens/DestinationCareScreen.tsx");
const iosWidgetSnapshot = read("apps/mobile/src/providers/widgetSnapshot.ios.ts");
const project = read("apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj");
const configureTarget = read("apps/mobile/ios/scripts/configure-widget-target.rb");

assert.equal(appConfig.expo.ios.infoPlist.NSSupportsLiveActivities, true);
assert.match(appPlist, /<key>NSSupportsLiveActivities<\/key>\s*<true\/>/u);

for (const field of ["destinationName", "departureAt", "departureTimeLabel", "guidance"]) {
  assert.match(attributes, new RegExp(`let ${field}:`, "u"), `ActivityKit field missing: ${field}`);
}

assert.match(nativeModule, /ActivityAuthorizationInfo\(\)\.areActivitiesEnabled/u);
assert.match(nativeModule, /AsyncFunction\("startDepartureActivity"\)/u);
assert.match(nativeModule, /pushType: nil/u);
assert.match(nativeModule, /staleDate: departureAt/u);
assert.match(nativeModule, /dismissalPolicy: \.immediate/u);
assert.match(nativeModule, /endExpiredDepartureActivities/u);

assert.match(liveActivity, /ActivityConfiguration\(for: WeatherONDepartureActivityAttributes\.self\)/u);
assert.match(liveActivity, /Text\(timerInterval:/u);
assert.match(liveActivity, /context\.attributes\.destinationName/u);
assert.match(liveActivity, /context\.attributes\.departureTimeLabel/u);
assert.match(liveActivity, /context\.state\.guidance/u);
assert.match(widgetBundle, /WeatherONDepartureLiveActivity\(\)/u);

assert.match(destinationScreen, /startDepartureLiveActivity\(\{/u);
assert.match(destinationScreen, /실시간 출발 현황/u);
assert.match(destinationScreen, /getDepartureWeatherGuidance/u);
assert.match(destinationScreen, /endDepartureLiveActivity\(\)/u);
assert.match(iosWidgetSnapshot, /export \* from "\.\/widgetSnapshot\.shared";/u);

for (const source of ["WeatherONDepartureLiveActivity.swift", "WeatherONDepartureActivityAttributes.swift"]) {
  assert.match(project, new RegExp(source.replaceAll(".", "\\."), "u"), `Xcode source missing: ${source}`);
  assert.match(configureTarget, new RegExp(source.replaceAll(".", "\\."), "u"), `target setup missing: ${source}`);
}

console.log("iOS Live Activity check passed");
