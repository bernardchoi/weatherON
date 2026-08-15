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
const appState = read("apps/mobile/src/state/useWeatherOnAppState.ts");
const liveActivityProvider = read("apps/mobile/src/providers/departureLiveActivity.ios.ts");
const liveActivityShared = read("apps/mobile/src/providers/departureLiveActivity.shared.ts");
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
assert.match(liveActivity, /timerInterval: Date\(\)\.\.\.max\(Date\(\), departureAt\)/u);
assert.match(liveActivity, /showsHours: !compact/u);
assert.match(liveActivity, /maxWidth: compact \? 46 : nil/u);
assert.match(liveActivity, /context\.attributes\.destinationName/u);
assert.match(liveActivity, /context\.attributes\.departureTimeLabel/u);
assert.match(liveActivity, /context\.state\.guidance/u);
assert.match(widgetBundle, /WeatherONDepartureLiveActivity\(\)/u);
assert.match(widgetBundle, /return entry\.hasSharedSnapshot \? entry : \.placeholder/u);
assert.doesNotMatch(widgetBundle, /context\.isPreview \? \.placeholder/u);
assert.match(widgetBundle, /Library\/Application Support\/WeatherONWidget\/weatheron-widget-store-v2\.json/u);
assert.match(widgetBundle, /let kind = "WeatherONWeatherWidgetV2"/u);
assert.match(widgetBundle, /StaticConfiguration\(/u);
assert.match(widgetBundle, /let kind = "WeatherONLocationWidgetV3"/u);
assert.match(widgetBundle, /AppIntentConfiguration\(/u);
assert.match(widgetBundle, /intent: WeatherONWidgetConfigurationIntent\.self/u);
assert.match(widgetBundle, /WeatherONConfigurableWidget\(\)/u);
assert.match(widgetBundle, /suggestedEntities\(\)/u);
assert.match(widgetBundle, /store\.destinations\.map/u);
assert.match(widgetBundle, /\.contentMarginsDisabled\(\)/u);
assert.match(nativeModule, /widgetKinds = \["WeatherONWeatherWidgetV2", "WeatherONLocationWidgetV3"\]/u);
assert.match(nativeModule, /widgetKinds\.forEach \{ WidgetCenter\.shared\.reloadTimelines\(ofKind: \$0\) \}/u);
assert.match(nativeModule, /widgetReloadWorkItem\?\.cancel\(\)/u);
assert.match(nativeModule, /guard changed else \{ return true \}/u);
assert.doesNotMatch(nativeModule, /WidgetCenter\.shared\.reloadAllTimelines\(\)/u);
assert.match(nativeModule, /Library\/Application Support\/WeatherONWidget\/weatheron-widget-store-v2\.json/u);
assert.match(nativeModule, /createDirectory\(/u);
assert.match(nativeModule, /Data\(snapshotJson\.utf8\)/u);

const nativeBuildVersions = [...project.matchAll(/CURRENT_PROJECT_VERSION = (\d+);/gu)].map((match) => match[1]);
assert.ok(nativeBuildVersions.length > 0, "native build version missing");
assert.ok(
  nativeBuildVersions.every((version) => version === appConfig.expo.ios.buildNumber),
  "Expo and native iOS build versions must match",
);

assert.match(destinationScreen, /실시간 출발 현황/u);
assert.match(destinationScreen, /getDepartureWeatherGuidance/u);
assert.match(destinationScreen, /endDepartureLiveActivity\(\)/u);
assert.doesNotMatch(destinationScreen, /카운트다운 시작/u);
assert.match(appState, /syncAutomaticDepartureLiveActivity\(automaticDepartureActivityInput\)/u);
assert.match(appState, /getDepartureLiveActivityActivationDelay\(automaticDepartureActivityInput\.departureAt\)/u);
assert.match(appState, /widgetSnapshotContentKeyRef\.current === widgetSnapshotContentKey/u);
assert.doesNotMatch(appState, /new Date\(selectedDestinationDepartureAt\)\.getTime\(\) <= nowMinuteTick/u);
assert.match(appState, /repeatDays\.includes\(getWeekdayForZonedDate\(arrivalDate\)\)/u);
assert.match(liveActivityProvider, /isDepartureLiveActivityAutoWindow\(input\.departureAt\)/u);
assert.match(liveActivityShared, /departureLiveActivityAutoLeadMinutes = 60/u);
assert.match(liveActivityShared, /getDepartureLiveActivityActivationDelay/u);
assert.match(iosWidgetSnapshot, /export \* from "\.\/widgetSnapshot\.shared";/u);

for (const source of ["WeatherONDepartureLiveActivity.swift", "WeatherONDepartureActivityAttributes.swift"]) {
  assert.match(project, new RegExp(source.replaceAll(".", "\\."), "u"), `Xcode source missing: ${source}`);
  assert.match(configureTarget, new RegExp(source.replaceAll(".", "\\."), "u"), `target setup missing: ${source}`);
}

console.log("iOS Live Activity check passed");
