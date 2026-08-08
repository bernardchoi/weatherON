import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const appConfig = JSON.parse(readFileSync(join(rootDir, "apps/mobile/app.json"), "utf8")).expo;
const iosInfo = readFileSync(join(rootDir, "apps/mobile/ios/WeatherON/Info.plist"), "utf8");
const xcodeProject = readFileSync(join(rootDir, "apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj"), "utf8");
const androidGradle = readFileSync(join(rootDir, "apps/mobile/android/app/build.gradle"), "utf8");

assert.equal(appConfig.version, "1.0.0", "Android user-facing version must match the 1.0.0 release baseline");
assert.ok(Number.isInteger(appConfig.android.versionCode) && appConfig.android.versionCode >= 10, "Android versionCode must advance past the 0.1.0 (9) private-test baseline");
assert.equal(appConfig.ios.version, "1.0.0", "iOS user-facing version must match the 1.0.0 release baseline");
assert.match(appConfig.ios.buildNumber, /^[1-9]\d*$/, "iOS buildNumber must be a positive integer string");
assert.ok(iosInfo.includes("<string>$(MARKETING_VERSION)</string>"), "Info.plist must use MARKETING_VERSION");
assert.ok(iosInfo.includes("<string>$(CURRENT_PROJECT_VERSION)</string>"), "Info.plist must use CURRENT_PROJECT_VERSION");

assertXcodeSetting("MARKETING_VERSION", appConfig.ios.version);
assertXcodeSetting("CURRENT_PROJECT_VERSION", appConfig.ios.buildNumber);
assert.match(androidGradle, new RegExp(`versionCode\\s+${appConfig.android.versionCode}\\b`));
assert.match(androidGradle, new RegExp(`versionName\\s+"${escapeRegExp(appConfig.version)}"`));

console.log(`platform version check passed: Android ${appConfig.version} (${appConfig.android.versionCode}), iOS ${appConfig.ios.version} (${appConfig.ios.buildNumber})`);

function assertXcodeSetting(key, expected) {
  const values = [...xcodeProject.matchAll(new RegExp(`${key} = ([^;]+);`, "g"))].map((match) => match[1]);
  assert.ok(values.length > 0, `${key} is missing from the Xcode project`);
  assert.deepEqual([...new Set(values)], [expected], `${key} must be ${expected} in every build configuration`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
