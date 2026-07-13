import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const appConfig = JSON.parse(readFileSync(join(rootDir, "apps/mobile/app.json"), "utf8")).expo;
const iosInfo = readFileSync(join(rootDir, "apps/mobile/ios/WeatherON/Info.plist"), "utf8");
const xcodeProject = readFileSync(join(rootDir, "apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj"), "utf8");
const androidGradle = readFileSync(join(rootDir, "apps/mobile/android/app/build.gradle"), "utf8");

assert.equal(appConfig.version, "0.1.0", "Android user-facing version must remain the root Expo version");
assert.equal(appConfig.android.versionCode, 8, "Android versionCode must match the private-test baseline");
assert.equal(appConfig.ios.version, "1.0", "iOS user-facing version must override the root Expo version");
assert.equal(appConfig.ios.buildNumber, "9", "iOS build number must match the TestFlight baseline");
assert.ok(iosInfo.includes("<string>$(MARKETING_VERSION)</string>"), "Info.plist must use MARKETING_VERSION");
assert.ok(iosInfo.includes("<string>$(CURRENT_PROJECT_VERSION)</string>"), "Info.plist must use CURRENT_PROJECT_VERSION");

assertXcodeSetting("MARKETING_VERSION", appConfig.ios.version);
assertXcodeSetting("CURRENT_PROJECT_VERSION", appConfig.ios.buildNumber);
assert.match(androidGradle, /versionCode\s+8/);
assert.match(androidGradle, /versionName\s+"0\.1\.0"/);

console.log("platform version check passed: Android 0.1.0 (8), iOS 1.0 (9)");

function assertXcodeSetting(key, expected) {
  const values = [...xcodeProject.matchAll(new RegExp(`${key} = ([^;]+);`, "g"))].map((match) => match[1]);
  assert.ok(values.length > 0, `${key} is missing from the Xcode project`);
  assert.deepEqual([...new Set(values)], [expected], `${key} must be ${expected} in every build configuration`);
}
