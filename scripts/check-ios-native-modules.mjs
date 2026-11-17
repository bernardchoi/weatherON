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
  if (process.platform === "darwin") {
    const podsProjectPath = "apps/mobile/ios/Pods/Pods.xcodeproj/project.pbxproj";
    const { objects } = JSON.parse(execFileSync("plutil", ["-convert", "json", "-o", "-", podsProjectPath],
      { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
    if (/^  - React-Core-prebuilt \(/m.test(lock)) {
      for (const name of ["ExpoSQLite", "ExpoModulesCore", "ExpoModulesWorklets", "ExpoSecureStore"]) {
        const target = Object.values(objects).find(item => item.isa === "PBXNativeTarget" && item.name === name);
        for (const id of objects[target.buildConfigurationList].buildConfigurations) {
          const paths = objects[id].buildSettings.HEADER_SEARCH_PATHS;
          assert.match(paths?.[0] ?? "", /React-Core-prebuilt\/React\.framework\/Headers\/React_Core/u, name);
          assert.ok(paths.includes("$(inherited)"), name);
        }
      }
    }
    const sdk = execFileSync("xcrun", ["--sdk", "iphoneos", "--show-sdk-path"], { encoding: "utf8" }).trim();
    const tasks = "node_modules/expo-file-system/ios/Legacy/EXSessionTasks";
    execFileSync("xcrun", ["clang", "-target", "arm64-apple-ios16.4", "-isysroot", sdk, "-fobjc-arc",
      "-Iapps/mobile/ios/Pods/Headers/Public/ExpoModulesCore", "-Iapps/mobile/ios/Pods/Headers/Public",
      "-Werror=nullability-completeness", "-Werror=nonnull", "-Werror=incompatible-pointer-types",
      "-fsyntax-only", "-x", "objective-c", `${tasks}/EXTaskHandlersManager.m`,
      `${tasks}/EXSessionCancelableUploadTaskDelegate.m`, "-"], {
      input: `#import <ExpoFileSystem/EXSessionCancelableUploadTaskDelegate.h>
#import <ExpoFileSystem/EXSessionResumableDownloadTaskDelegate.h>
void checkTransfers(EXSessionTaskDelegate *delegate, NSURLSession *session, NSURLSessionTask *task,
                    EXPromiseResolveBlock resolve, EXPromiseRejectBlock reject, NSURL *url) {
  [delegate URLSession:session task:task didCompleteWithError:nil];
  (void)[[EXSessionCancelableUploadTaskDelegate alloc] initWithResolve:resolve reject:reject
      onSendCallback:nil resumableManager:nil uuid:@"upload"];
  (void)[[EXSessionResumableDownloadTaskDelegate alloc] initWithResolve:resolve reject:reject localUrl:url
      shouldCalculateMd5:NO onWriteCallback:nil resumableManager:nil uuid:@"download"];
}
`,
    });
  }
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
