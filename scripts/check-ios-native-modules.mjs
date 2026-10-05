import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

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

if (process.argv.includes("--installed")) {
  assert.equal(readFileSync("apps/mobile/ios/Pods/Manifest.lock", "utf8"), lock,
    "Installed Pods differ from Podfile.lock; regenerate iOS integration before building");
  const provider = readFileSync("apps/mobile/ios/Pods/Target Support Files/Pods-WeatherON/ExpoModulesProvider.swift", "utf8");
  const unregistered = resolved.modules.flatMap((module) => module.modules
    .filter((entry) => !provider.includes(`module: ${entry.class}.self`))
    .map((entry) => `${module.packageName}: ${entry.class}`));
  assert.deepEqual(unregistered, [], `Native module registration is missing: ${unregistered.join(", ")}`);
}
console.log("iOS native module integration check passed");
