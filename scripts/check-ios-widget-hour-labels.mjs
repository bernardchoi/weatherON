import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

// Execute the production formatter with synthetic cached/native snapshot values.
const source = readFileSync("apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift", "utf8");
const formatter = source.slice(source.indexOf("private func compactHour("), source.indexOf("private extension WeatherONLocationSnapshot {\n  static let currentPlaceholder"));
const directory = mkdtempSync(join(tmpdir(), "weatheron-hour-labels-"));
try {
  const file = join(directory, "check.swift");
  writeFileSync(file, `import Foundation
private let snapshotDateFormatter: ISO8601DateFormatter = {
  let value = ISO8601DateFormatter()
  value.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return value
}()
private let fallbackSnapshotDateFormatter = ISO8601DateFormatter()
${formatter}
let cases: [(String, String)] = [
  ("2026-10-05T15:00:00", "15:00"),
  ("2026-10-05T16:00:00", "16:00"),
  ("2026-10-05T17:00:00", "17:00"),
  ("2026-10-05T15:30:00", "15:30"),
  ("2026-12-31T23:00:00", "23:00"),
  ("2027-01-01T00:00:00", "00:00"),
  ("2026-10-05T15:30", "15:30"),
  ("2026-10-05 15:30:00", "15:30"),
  ("2024-02-29T12:00:00", "12:00"),
  ("15:30", "15:30"), ("00:00", "00:00"),
  // Existing snapshots use location wall time, even older Z/offset-labelled values.
  ("2026-10-05T15:30:00Z", "15:30"),
  ("2026-10-05T15:30:00.123Z", "15:30"),
  ("2026-10-05T15:30:00+09:00", "15:30"),
  ("2026-11-01T01:30:00-04:00", "01:30"),
  ("2026-11-01T01:30:00-05:00", "01:30"),
  ("", "--:--"), ("garbage00:00", "--:--"),
  ("24:00", "--:--"), ("15:60", "--:--"),
  ("2026-02-29T12:00:00", "--:--"),
  ("2026-10-05T15:30:99", "--:--"),
  ("2026-10-05T15:30:00garbage", "--:--")
]
for zone in ["Asia/Seoul", "America/Los_Angeles", "UTC"] {
  NSTimeZone.default = TimeZone(identifier: zone)!
  for (input, expected) in cases {
    let actual = compactHour(input)
    guard actual == expected else {
      print("FAIL: \\(input) in \\(zone): expected \\(expected), got \\(actual)")
      exit(1)
    }
  }
}
print("Widget hour labels: 69 cases passed (cached/native wall times, midnight, leap date, DST, device zones, invalid input)")
`);
  execFileSync("xcrun", ["swift", "-module-cache-path", join(directory, "cache"), file], { stdio: "inherit" });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
