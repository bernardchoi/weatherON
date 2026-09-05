import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const source = readFileSync("apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift", "utf8");
const solar = source.slice(source.indexOf("private struct WeatherONSolarEvents"), source.indexOf("private struct WeatherONWidgetStore"));
const directory = mkdtempSync(join(tmpdir(), "weatheron-daylight-"));
try {
  const file = join(directory, "check.swift");
  writeFileSync(file, `import Foundation
struct WeatherONLocationSnapshot {
  let latitude: Double?
  let longitude: Double?
  let timeZone: String?
}
${solar}
let location = WeatherONLocationSnapshot(latitude: 37.6508, longitude: 126.8889, timeZone: "Asia/Seoul")
let reference = ISO8601DateFormatter().date(from: "2026-08-30T22:29:00+09:00")!
assert(location.isNight(at: reference))
assert(location.isNight(for: "2026-08-30T22:00:00Z", relativeTo: reference))
assert(location.isNight(for: "2026-08-31T00:00", relativeTo: reference))
assert(location.isNight(for: "00:00", relativeTo: reference))
assert(!location.isNight(for: "2026-08-31T12:00:00Z", relativeTo: reference))
let transition = location.nextSolarTransition(after: reference)!
assert(location.isNight(at: transition.addingTimeInterval(-1)))
assert(!location.isNight(at: transition.addingTimeInterval(1)))
print("Widget daylight checks passed")
`);
  execFileSync("xcrun", ["swift", "-module-cache-path", join(directory, "cache"), file], { stdio: "inherit" });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
