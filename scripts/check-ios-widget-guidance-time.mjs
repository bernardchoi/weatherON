import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const source = readFileSync("apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift", "utf8");
// Both normal snapshots and native-weather timelines must retain the persisted app delivery time.
assert.equal((source.match(/appSnapshotUpdatedAt: loaded\.store\.updatedAt/g) ?? []).length, 2);
assert.doesNotMatch(source, /appSnapshotUpdatedAt:\s*(?:Date\(|[^\n]*observedAt)/);
assert.match(source, /entry\.appSnapshotUpdatedAt, referenceDate: entry\.date/);
const localization = source.slice(source.indexOf("private struct WeatherONWidgetLocalization"), source.indexOf("private struct WeatherONHourlySnapshot"));
const formatter = source.slice(source.indexOf("private func weatherONAppSnapshotTime("), source.indexOf("private struct WeatherONWidgetFooter"));
const directory = mkdtempSync(join(tmpdir(), "weatheron-guidance-time-"));
try {
  const file = join(directory, "check.swift");
  writeFileSync(file, `import Foundation
private let snapshotDateFormatter: ISO8601DateFormatter = {
  let value = ISO8601DateFormatter()
  value.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return value
}()
private let fallbackSnapshotDateFormatter = ISO8601DateFormatter()
${localization}
${formatter}
var checked = 0
var context = ""
func expect(_ condition: @autoclosure () -> Bool, line: Int = #line) {
  checked += 1
  if !condition() { print("FAIL: guidance timestamp assertion at generated Swift line \\(line), \\(context)"); exit(1) }
}
let reference = ISO8601DateFormatter().date(from: "2026-10-05T08:00:00Z")!
let seoul = TimeZone(identifier: "Asia/Seoul")!
for deviceZone in ["Asia/Seoul", "America/Los_Angeles", "UTC"] {
  NSTimeZone.default = TimeZone(identifier: deviceZone)!
  for language in ["ko-KR", "en-US", "ja-JP"] {
    for clock24 in [true, false] {
      let policy = WeatherONWidgetLocalization(languageTag: language, temperatureUnit: "celsius", distanceUnit: "meter", uses24HourClock: clock24)
      func label(_ value: String?, zone: TimeZone = seoul, now: Date = reference) -> String? {
        weatherONAppSnapshotTime(value, referenceDate: now, timeZone: zone, localization: policy)
      }
      context = "\\(deviceZone), \\(language), 24h=\\(clock24)"
      let current = label("2026-10-05T07:40:00Z")!
      expect(current.contains(clock24 ? "16:40" : "4:40"))
      expect(label("2026-10-05T07:40:00.000Z") == current)
      let yesterday = label("2026-10-04T07:40:00Z")!
      expect(yesterday != current && yesterday.contains("10"))
      expect(label("2025-12-31T07:40:00Z")!.contains("2025"))
      expect(label(nil) == nil && label("") == nil && label("invalid") == nil)
      expect(label("2026-10-05T08:01:00Z") == nil)
      expect(label("2026-10-05T07:40:00") == nil) // no invented timezone
      let losAngeles = label("2026-10-05T07:40:00Z", zone: TimeZone(identifier: "America/Los_Angeles")!)!
      expect(losAngeles.contains(language == "ja-JP" ? "0:40" : (clock24 ? "00:40" : "12:40")))
      let midnightReference = ISO8601DateFormatter().date(from: "2026-10-05T01:00:00Z")!
      let sameLocalDay = label("2026-10-04T23:30:00Z", now: midnightReference)!
      expect(sameLocalDay.contains("8:30") && !sameLocalDay.contains("10"))
    }
  }
}
print("Widget app snapshot time: \\(checked) checks passed (ko/en/ja, 12/24-hour, prior day/year, missing/future, location/device timezone)")
`);
  execFileSync("xcrun", ["swift", "-module-cache-path", join(directory, "cache"), file], { stdio: "inherit" });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
