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
const models = source.slice(source.indexOf("private struct WeatherONHourlySnapshot"), source.indexOf("private extension WeatherONLocationSnapshot"));
const routeClock = source.slice(source.indexOf("private func weatherONClock("), source.indexOf("private struct WeatherONWeatherBackdrop"));
assert.match(source, /departureAt: departureAt, arrivalAt: arrivalAt/);
assert.equal((source.match(/WeatherONScheduleCard\([^\n]+referenceDate: entry\.date\)/g) ?? []).length, 2);
const scheduleCard = source.slice(source.indexOf("private struct WeatherONScheduleCard"), source.indexOf("private struct WeatherONOutfitCard"));
assert.doesNotMatch(scheduleCard, /referenceDate: Date\(\)/);
const expiryEntry = source.slice(source.indexOf("    if let value = location.nowRouteExpiresAt,"), source.indexOf("    // Keep day/night changes"));
assert.match(expiryEntry, /entryDates\.append\(expiry\)/);
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
private let homeDeepLink = URL(string: "weatheron://home")!
${localization}
${models}
${formatter}
${routeClock}
private func routeEntryDates(_ location: WeatherONLocationSnapshot, now: Date) -> [Date] {
  var entryDates = [now]
${expiryEntry}
  return entryDates
}
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
do {
  let decoder = JSONDecoder()
  let payload = #"{"departureAt":"2026-10-30T14:50:00.000Z","arrivalAt":"2026-10-30T15:30:00.000Z","departureTime":"wrong","arrivalTime":"wrong","timeZone":"Asia/Seoul"}"#
  let location = try decoder.decode(WeatherONLocationSnapshot.self, from: Data(payload.utf8))
  let restored = try decoder.decode(WeatherONLocationSnapshot.self, from: JSONEncoder().encode(location))
  expect(restored.departureAt == location.departureAt && restored.arrivalAt == location.arrivalAt)
  let now = ISO8601DateFormatter().date(from: "2026-10-30T14:00:00Z")!
  let policy = WeatherONWidgetLocalization(languageTag: "en-US", temperatureUnit: "celsius", distanceUnit: "meter", uses24HourClock: true)
  let departure = weatherONRouteClock(restored.departureAt, fallback: restored.departureTime, timeZone: restored.timeZone, referenceDate: now, localization: policy)
  let arrival = weatherONRouteClock(restored.arrivalAt, fallback: restored.arrivalTime, timeZone: restored.timeZone, referenceDate: now, localization: policy)
  expect(departure == "23:50")
  expect(arrival.contains("10/31") && arrival.contains("00:30"))
  let legacy = try decoder.decode(WeatherONLocationSnapshot.self, from: Data(#"{"departureTime":"08:10"}"#.utf8))
  expect(weatherONRouteClock(legacy.departureAt, fallback: legacy.departureTime, timeZone: "Asia/Seoul", referenceDate: now, localization: policy) == "08:10")
  let tokyo = weatherONRouteClock(restored.departureAt, fallback: nil, timeZone: "Asia/Tokyo", referenceDate: now, localization: policy)
  expect(tokyo == departure)
  expect(weatherONRouteClock(restored.departureAt, fallback: nil, timeZone: "America/Los_Angeles", referenceDate: now, localization: policy) == "07:50")
  let currentPayload = #"{"nowArrivalAt":"2026-10-30T14:25:00Z","nowArrivalDescription":"지금 출발 시 2026/10/30 23:25 도착 예상 · 최신 조회 · 조회 2026/10/30 23:00","nowArrivalReferenceDescription":"지금 출발 시 2026/10/30 23:25 도착 예상 · 이전 조회 기준 참고 · 조회 2026/10/30 23:00","nowRouteUpdatedAt":"2026-10-30T14:00:00Z","nowRouteExpiresAt":"2026-10-30T14:01:00Z"}"#
  let current = try decoder.decode(WeatherONLocationSnapshot.self, from: Data(currentPayload.utf8))
  let currentRestored = try decoder.decode(WeatherONLocationSnapshot.self, from: JSONEncoder().encode(current))
  expect(currentRestored.nowArrivalAt == current.nowArrivalAt)
  expect(currentRestored.nowRouteUpdatedAt == current.nowRouteUpdatedAt)
  expect(weatherONNowArrivalDescription(currentRestored, referenceDate: now) == current.nowArrivalDescription)
  let expired = weatherONNowArrivalDescription(currentRestored, referenceDate: now.addingTimeInterval(61))!
  expect(expired.contains("이전 조회 기준 참고") && !expired.contains("최신 조회"))
  expect(expired.contains("23:00") && expired.contains("23:25"))
  expect(weatherONNowArrivalDescription(legacy, referenceDate: now) == nil)
  let entryDates = routeEntryDates(currentRestored, now: now)
  expect(entryDates.count == 2 && entryDates[0] == now)
  expect(entryDates[1] == now.addingTimeInterval(60))
  expect(weatherONNowArrivalDescription(currentRestored, referenceDate: entryDates[0]) == current.nowArrivalDescription)
  expect(weatherONNowArrivalDescription(currentRestored, referenceDate: entryDates[1]) == current.nowArrivalReferenceDescription)
  expect(routeEntryDates(currentRestored, now: now.addingTimeInterval(61)).count == 1)
  expect(routeEntryDates(legacy, now: now).count == 1)
  let invalidExpiry = try decoder.decode(WeatherONLocationSnapshot.self, from: Data(#"{"nowRouteExpiresAt":"invalid"}"#.utf8))
  expect(routeEntryDates(invalidExpiry, now: now).count == 1)
}
print("Widget app snapshot time: \\(checked) checks passed (ko/en/ja, 12/24-hour, prior day/year, missing/future, location/device timezone)")
`);
  execFileSync("xcrun", ["swift", "-module-cache-path", join(directory, "cache"), file], { stdio: "inherit" });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
