import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const appConfig = JSON.parse(readFileSync(join(rootDir, "apps/mobile/app.json"), "utf8")).expo;
const iosInfo = readFileSync(join(rootDir, "apps/mobile/ios/WeatherON/Info.plist"), "utf8");
const xcodeProject = readFileSync(join(rootDir, "apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj"), "utf8");
const androidGradle = readFileSync(join(rootDir, "apps/mobile/android/app/build.gradle"), "utf8");

assert.equal(appConfig.version, "1.0.0", "Android user-facing version must match the 1.0.0 release baseline");
assert.equal(appConfig.android.versionCode, 10, "Android versionCode must advance past the 0.1.0 (9) private-test baseline");
assert.equal(appConfig.ios.version, "1.0.0", "iOS user-facing version must match the 1.0.0 release baseline");
assert.equal(appConfig.ios.buildNumber, "7", "iOS buildNumber must advance from the latest 1.0.0 (6) TestFlight build");
assert.ok(iosInfo.includes("<string>$(MARKETING_VERSION)</string>"), "Info.plist must use MARKETING_VERSION");
assert.ok(iosInfo.includes("<string>$(CURRENT_PROJECT_VERSION)</string>"), "Info.plist must use CURRENT_PROJECT_VERSION");

assertXcodeSetting("MARKETING_VERSION", appConfig.ios.version);
assertXcodeSetting("CURRENT_PROJECT_VERSION", appConfig.ios.buildNumber);
assert.match(androidGradle, /versionCode\s+10/);
assert.match(androidGradle, /versionName\s+"1\.0\.0"/);

console.log("platform version check passed: Android 1.0.0 (10), iOS 1.0.0 (7)");

function assertXcodeSetting(key, expected) {
  const values = [...xcodeProject.matchAll(new RegExp(`${key} = ([^;]+);`, "g"))].map((match) => match[1]);
  assert.ok(values.length > 0, `${key} is missing from the Xcode project`);
  assert.deepEqual([...new Set(values)], [expected], `${key} must be ${expected} in every build configuration`);
}
