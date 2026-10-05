import Foundation

actor Probe {
  var calls = 0
  var shouldFail = false
  var forecast: WeatherONNativeForecast
  init(_ forecast: WeatherONNativeForecast) { self.forecast = forecast }
  func fetch(_ location: WeatherONNativeLocation) async throws -> WeatherONNativeForecast {
    calls += 1
    await Task.yield()
    if shouldFail { throw URLError(.notConnectedToInternet) }
    return forecast
  }
  func fail(_ value: Bool) { shouldFail = value }
  func setForecast(_ value: WeatherONNativeForecast) { forecast = value }
}

@main struct NativeWeatherTests {
  static func forecast(_ date: Date, temperature: Double = 22) -> WeatherONNativeForecast {
    WeatherONNativeForecast(observedAt: date, temperatureC: temperature, feelsLikeC: 23, condition: "rain",
      rainProbabilityPct: 70, humidityPct: 65, windMs: 3, hourly: [],
      attribution: WeatherONNativeAttribution(serviceName: "Apple Weather", legalURL: URL(string: "https://weatherkit.apple.com/legal-attribution.html")!, darkMark: Data([1]), lightMark: Data([2])))
  }
  static func expect(_ condition: Bool, _ message: String) { precondition(condition, message) }
  static func main() async throws {
    let now = Date(timeIntervalSince1970: 1_800_000_000)
    let old = now.addingTimeInterval(-7200)
    let location = WeatherONNativeLocation(id: "home", latitude: 37, longitude: 127, timeZone: "Asia/Seoul")
    let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    let cache = root.appendingPathComponent("cache.json")
    defer { try? FileManager.default.removeItem(at: root) }
    let probe = Probe(forecast(now))
    let refresh = WeatherONNativeWeatherRefresh(cacheURL: cache, fetch: { try await probe.fetch($0) })
    let disabled = await refresh.refresh(location: location, appObservedAt: old, enabled: false, now: now)
    expect(disabled == nil, "disabled feature must never fetch or expose cache")
    expect(await probe.calls == 0, "disabled query")
    let invalid = WeatherONNativeLocation(id: "bad", latitude: 999, longitude: 127, timeZone: "bad")
    _ = await refresh.refresh(location: invalid, appObservedAt: old, enabled: true, now: now)
    expect(await probe.calls == 0, "invalid coordinate/timezone query")
    _ = await refresh.refresh(location: location, appObservedAt: now.addingTimeInterval(-30), enabled: true, now: now)
    expect(await probe.calls == 0, "fresh app data avoids native request")
    async let first = refresh.refresh(location: location, appObservedAt: old, enabled: true, now: now)
    async let second = refresh.refresh(location: location, appObservedAt: old, enabled: true, now: now)
    let results = await [first, second]
    expect(results.allSatisfy { $0?.temperatureC == 22 }, "native result delivered")
    expect(await probe.calls == 1, "duplicate timeline requests coalesced")
    expect(FileManager.default.fileExists(atPath: cache.path), "private cache persisted")
    let restored = WeatherONNativeWeatherRefresh(cacheURL: cache, fetch: { try await probe.fetch($0) })
    _ = await restored.refresh(location: location, appObservedAt: old, enabled: true, now: now.addingTimeInterval(60))
    expect(await probe.calls == 1, "process restart honors disk throttle")
    await probe.fail(true)
    let offline = await restored.refresh(location: location, appObservedAt: old, enabled: true, now: now.addingTimeInterval(1900))
    expect(offline?.temperatureC == 22, "offline retains newer cached observation")
    _ = await restored.refresh(location: location, appObservedAt: old, enabled: true, now: now.addingTimeInterval(1960))
    expect(await probe.calls == 2, "failure retry bounded")
    let moved = WeatherONNativeLocation(id: "home", latitude: 38, longitude: 127, timeZone: "Asia/Seoul")
    let movedResult = await restored.refresh(location: moved, appObservedAt: old, enabled: true, now: now.addingTimeInterval(1960))
    expect(movedResult == nil, "different coordinates must not reuse old weather")
    expect(location.cacheKey != moved.cacheKey, "cache identity includes coordinates")
    let newerApp = await restored.refresh(location: location, appObservedAt: now.addingTimeInterval(2000), enabled: true, now: now.addingTimeInterval(2010))
    expect(newerApp == nil, "newer app observation wins")
    let expired = await restored.refresh(location: location, appObservedAt: old, enabled: true, now: now.addingTimeInterval(7*3600))
    expect(expired == nil, "expired native cache not shown")
    await probe.fail(false)
    await probe.setForecast(forecast(now.addingTimeInterval(10000)))
    let futureEngine = WeatherONNativeWeatherRefresh(cacheURL: nil, fetch: { try await probe.fetch($0) })
    let future = await futureEngine.refresh(location: location, appObservedAt: old, enabled: true, now: now)
    expect(future == nil, "future-dated observations rejected")
    await probe.setForecast(forecast(now, temperature: .nan))
    let invalidEngine = WeatherONNativeWeatherRefresh(cacheURL: nil, fetch: { try await probe.fetch($0) })
    let malformed = await invalidEngine.refresh(location: location, appObservedAt: old, enabled: true, now: now)
    expect(malformed == nil, "invalid data rejected before persistence and Int conversion")
    for (currentKey, shared, appDate, expected) in [
      (location.cacheKey, true, old, true), (moved.cacheKey, true, old, false),
      (location.cacheKey, false, old, false), (location.cacheKey, true, now.addingTimeInterval(1), false)
    ] {
      expect(WeatherONNativeWeatherRefresh.canApply(forecast(now), requestKey: location.cacheKey, currentKey: currentKey, hasSharedSnapshot: shared, appObservedAt: appDate, now: now) == expected, "late completion must respect removal, moved location and newer app delivery")
    }
    expect(!forecast(now, temperature: 1e300).isUsable(at: now), "finite numeric overflow rejected")
    print("Native widget weather: disabled/invalid/fresh guards, coalescing, disk restart, failure throttle, moved coordinate isolation, newer app precedence, expiry, future and invalid observations passed. Mock provider only.")
  }
}
