import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

execFileSync(process.execPath, ["scripts/sync-ios-widget-icons.mjs", "--check"], { stdio: "inherit" });
const widget = readFileSync("apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift", "utf8");
const live = readFileSync("apps/mobile/ios/WeatherONWidget/WeatherONDepartureLiveActivity.swift", "utf8");
const project = readFileSync("apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj", "utf8");
assert.ok(project.includes("AmbientIcons.xcassets in Resources"));
assert.ok(widget.includes('Image("ambient-weather-" + weatherONWeatherAsset'));
assert.ok(live.includes("WeatherONAmbientIcon(symbol:"));
assert.ok(!live.includes("Image(systemName:") && !live.includes("systemImage:"), "Live Activity must use app icon renderer");
for (const language of ["ko", "en", "ja"]) {
  const strings = readFileSync(`apps/mobile/ios/WeatherONWidget/${language}.lproj/Localizable.strings`, "utf8");
  for (const condition of ["clear", "cloud", "rain", "snow", "sleet", "hail", "mixed", "storm", "storm-hail", "dust", "unknown", "fog"]) {
    assert.ok(strings.includes(`"condition.${condition}"`), `${language}: missing condition label ${condition}`);
  }
}
const mapping = widget.slice(widget.indexOf("private func weatherONWeatherAsset("), widget.indexOf("private func transportSymbol("));
const directory = mkdtempSync(join(tmpdir(), "weatheron-icon-check-"));
try {
  const file = join(directory, "check.swift");
  writeFileSync(file, `import Foundation\n${mapping}
for (condition, expected) in [
  ("clear", "sun"), ("cloud", "cloud"), ("rain", "rain"), ("snow", "snow"),
  ("sleet", "sleet"), ("hail", "hail"), ("storm-hail", "hail"), ("mixed", "mixed"),
  ("storm", "heavy-rain"), ("dust", "wind"), ("fog", "fog"), ("unknown", "unknown"), ("invalid", "unknown")
] {
 precondition(weatherONWeatherAsset(condition) == expected, condition)
}
precondition(weatherONWeatherAsset("clear", isNight: true) == "night")
precondition(weatherONWeatherAsset("rain", isNight: true) == "rain")
print("Widget icon semantics: all precipitation states, heavy rain, dust, unknown and night passed.")
`);
  execFileSync("xcrun", ["swift", "-module-cache-path", join(directory, "cache"), file], { stdio: "inherit" });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
