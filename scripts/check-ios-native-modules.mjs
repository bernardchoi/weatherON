import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

// A JS bundle can compile even when its required Expo module is absent from iOS.
// Compare the actual Expo autolinking resolution with the committed Pod graph.
const resolved = JSON.parse(execFileSync(process.execPath, [
  "node_modules/expo-modules-autolinking/bin/expo-modules-autolinking.js",
  "resolve", "--platform", "apple", "--project-root", "apps/mobile", "--json",
], { encoding: "utf8" }));
const lock = readFileSync("apps/mobile/ios/Podfile.lock", "utf8");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const missing = resolved.modules.flatMap((module) => module.pods
  .filter((pod) => !new RegExp(`^  - ${escape(pod.podName)} \\(`, "m").test(lock))
  .map((pod) => `${module.packageName}: ${pod.podName}`));
assert.deepEqual(missing, [], `iOS Pods do not include declared native modules: ${missing.join(", ")}`);

const notificationScheduler = readFileSync("node_modules/expo-notifications/ios/ExpoNotifications/Notifications/Scheduling/SchedulerModule.swift", "utf8");
assert.match(notificationScheduler, /let record: \(any TriggerRecord\)\? = switch triggerType/u);
const safeArea = readFileSync("node_modules/react-native-safe-area-context/ios/Fabric/RNCSafeAreaProviderComponentView.mm", "utf8");
assert.match(safeArea, /\.top = safeAreaInsets\.top,\s*\.right = safeAreaInsets\.right,\s*\.bottom = safeAreaInsets\.bottom,\s*\.left = safeAreaInsets\.left,/u);
const svg = readFileSync("node_modules/react-native-svg/apple/Utils/RNSVGFabricConversions.h", "utf8");
assert.match(svg, /static inline id RNSVGConvertFollyDynamicToId\(/u);
assert.match(svg, /static inline RNSVGVBMOS intToRNSVGVBMOS\(/u);
const screenHeader = readFileSync("node_modules/react-native-screens/ios/RNSScreenStackHeaderConfig.mm", "utf8");
assert.match(screenHeader, /#ifndef NDEBUG\nstatic RCTResizeMode resizeModeFromCppEquiv\(/u);

// Check the install patch against the installed header, including repeat installs.
const schedulerPath = "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h";
const scheduler = readFileSync(schedulerPath, "utf8");
const fixture = mkdtempSync(join(tmpdir(), "weatheron-native-patch-"));
try {
  mkdirSync(join(fixture, "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI"), { recursive: true });
  const header = join(fixture, schedulerPath);
  mkdirSync(dirname(header), { recursive: true });
  writeFileSync(header, scheduler.replaceAll("SWIFT_RETURNS_RETAINED ", ""));
  const patch = () => execFileSync(process.execPath, [resolve("scripts/patch-expo-modules-jsi-swift.mjs")], { cwd: fixture });
  patch();
  const patched = readFileSync(header, "utf8");
  assert.match(patched, /SWIFT_RETURNS_RETAINED RuntimeScheduler\(\)/u);
  assert.match(patched, /SWIFT_RETURNS_RETAINED RuntimeScheduler\(void \*scheduler, ScheduleFn fn\)/u);
  assert.match(patched, /  RuntimeScheduler\(const RuntimeScheduler &\) = delete;/u);
  assert.equal(scheduler, patched, "postinstall must apply the ownership patch to the installed header");
  patch();
  assert.equal(readFileSync(header, "utf8"), patched, "repeat installs must not duplicate annotations");
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

if (process.argv.includes("--installed")) {
  assert.equal(readFileSync("apps/mobile/ios/Pods/Manifest.lock", "utf8"), lock,
    "Installed Pods differ from Podfile.lock; regenerate iOS integration before building");
  const podsProject = readFileSync("apps/mobile/ios/Pods/Pods.xcodeproj/project.pbxproj", "utf8");
  const sqliteConfig = JSON.parse(readFileSync("apps/mobile/ios/Podfile.properties.json", "utf8"));
  if (sqliteConfig["expo.sqlite.useLibSQL"] !== "true" && sqliteConfig["expo.sqlite.useSQLCipher"] !== "true") {
    assert.match(podsProject, /\/\* sqlite3\.c in Sources \*\/ = \{[^\n]*COMPILER_FLAGS = "[^"]*-include sys\/param\.h -DHAVE_GETHOSTUUID=0/u);
  }
  const provider = readFileSync("apps/mobile/ios/Pods/Target Support Files/Pods-WeatherON/ExpoModulesProvider.swift", "utf8");
  const unregistered = resolved.modules.flatMap((module) => module.modules
    .filter((entry) => !provider.includes(`module: ${entry.class}.self`))
    .map((entry) => `${module.packageName}: ${entry.class}`));
  assert.deepEqual(unregistered, [], `Native module registration is missing: ${unregistered.join(", ")}`);
}
console.log("iOS native module integration check passed");
