import Foundation
import CryptoKit
import CoreLocation
import WeatherKit

struct WeatherONNativeLocation: Sendable {
  let id: String
  let latitude: Double
  let longitude: Double
  let timeZone: String

  var isValid: Bool {
    !id.isEmpty && latitude.isFinite && longitude.isFinite
      && (-90...90).contains(latitude) && (-180...180).contains(longitude)
      && TimeZone(identifier: timeZone) != nil
  }

  var cacheKey: String {
    SHA256.hash(data: Data("\(id)|\(latitude)|\(longitude)|\(timeZone)".utf8))
      .map { String(format: "%02x", $0) }.joined()
  }
}

struct WeatherONNativeHour: Codable, Sendable {
  let date: Date
  let temperatureC: Double
  let condition: String
  let rainProbabilityPct: Double
}

struct WeatherONNativeAttribution: Codable, Sendable {
  let serviceName: String
  let legalURL: URL
  let darkMark: Data
  let lightMark: Data
}

struct WeatherONNativeForecast: Codable, Sendable {
  let observedAt: Date
  let temperatureC: Double
  let feelsLikeC: Double
  let condition: String
  let rainProbabilityPct: Double
  let humidityPct: Double
  let windMs: Double
  let hourly: [WeatherONNativeHour]
  let attribution: WeatherONNativeAttribution

  func isUsable(at now: Date) -> Bool {
    let age = now.timeIntervalSince(observedAt)
    return age >= -300 && age <= 6 * 3600
      && [temperatureC, feelsLikeC, rainProbabilityPct, humidityPct, windMs].allSatisfy(\.isFinite)
      && (-150...100).contains(temperatureC) && (-150...100).contains(feelsLikeC)
      && (0...100).contains(rainProbabilityPct) && (0...100).contains(humidityPct) && windMs >= 0
      && attribution.legalURL.scheme == "https"
      && !attribution.darkMark.isEmpty && !attribution.lightMark.isEmpty
      && attribution.darkMark.count <= 262_144 && attribution.lightMark.count <= 262_144
      && hourly.allSatisfy { (-150...100).contains($0.temperatureC) && (0...100).contains($0.rainProbabilityPct) }
  }
}

// Only weather and attribution are cached, in the extension's private cache.
// No App Group write, keychain access, proxy token or server credential is used.
actor WeatherONNativeWeatherRefresh {
  typealias Fetch = @Sendable (WeatherONNativeLocation) async throws -> WeatherONNativeForecast
  private struct Record: Codable {
    var attemptedAt: Date
    var forecast: WeatherONNativeForecast?
  }
  private var records: [String: Record]
  private var inFlight: [String: Task<WeatherONNativeForecast?, Never>] = [:]
  private let cacheURL: URL?
  private let fetch: Fetch
  static let refreshInterval: TimeInterval = 30 * 60

  init(cacheURL: URL?, fetch: @escaping Fetch) {
    self.cacheURL = cacheURL
    self.fetch = fetch
    records = cacheURL.flatMap { try? Data(contentsOf: $0) }
      .flatMap { try? JSONDecoder().decode([String: Record].self, from: $0) } ?? [:]
  }

  func refresh(location: WeatherONNativeLocation, appObservedAt: Date?, enabled: Bool, now: Date = Date()) async -> WeatherONNativeForecast? {
    guard enabled, location.isValid else { return nil }
    let key = location.cacheKey
    func newer(_ value: WeatherONNativeForecast?) -> WeatherONNativeForecast? {
      guard let value, value.isUsable(at: now), value.observedAt > (appObservedAt ?? .distantPast) else { return nil }
      return value
    }
    let cached = newer(records[key]?.forecast)
    if let pending = inFlight[key] { return newer(await pending.value) ?? cached }
    if let appObservedAt, (0..<15 * 60).contains(now.timeIntervalSince(appObservedAt)) { return cached }
    if let attempt = records[key]?.attemptedAt,
       (0..<Self.refreshInterval).contains(now.timeIntervalSince(attempt)) { return cached }

    records[key] = Record(attemptedAt: now, forecast: records[key]?.forecast)
    persist(now: now)
    let fetch = self.fetch
    let task = Task { try? await fetch(location) }
    inFlight[key] = task
    let result = await task.value
    inFlight[key] = nil
    if let result, result.isUsable(at: now),
       result.observedAt >= (records[key]?.forecast?.observedAt ?? .distantPast) {
      records[key]?.forecast = result
      persist(now: now)
    }
    return newer(records[key]?.forecast)
  }

  nonisolated static func canApply(_ forecast: WeatherONNativeForecast, requestKey: String?, currentKey: String?, hasSharedSnapshot: Bool, appObservedAt: Date, now: Date) -> Bool {
    hasSharedSnapshot && requestKey != nil && requestKey == currentKey
      && forecast.isUsable(at: now) && forecast.observedAt > appObservedAt
  }

  private func persist(now: Date) {
    records = records.filter { now.timeIntervalSince($0.value.attemptedAt) < 24 * 3600 }
    if records.count > 8 {
      records = Dictionary(uniqueKeysWithValues: records.sorted { $0.value.attemptedAt > $1.value.attemptedAt }.prefix(8).map { ($0.key, $0.value) })
    }
    guard let cacheURL, let data = try? JSONEncoder().encode(records) else { return }
    try? FileManager.default.createDirectory(at: cacheURL.deletingLastPathComponent(), withIntermediateDirectories: true)
    try? data.write(to: cacheURL, options: .atomic)
  }
}

enum WeatherONNativeWeather {
  // Missing/false by default. Turn on only after separately approved extension
  // WeatherKit App ID capability, entitlement and provisioning verification.
  static var enabled: Bool { Bundle.main.object(forInfoDictionaryKey: "WeatherONNativeWeatherEnabled") as? Bool == true }
  static let refresh = WeatherONNativeWeatherRefresh(
    cacheURL: FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first?
      .appendingPathComponent("WeatherON/native-weather-v1.json"),
    fetch: { location in
      try await withThrowingTaskGroup(of: WeatherONNativeForecast.self) { group in
        group.addTask { try await fetch(location) }
        group.addTask {
          try await Task.sleep(nanoseconds: 8_000_000_000)
          throw URLError(.timedOut)
        }
        defer { group.cancelAll() }
        guard let result = try await group.next() else { throw URLError(.cancelled) }
        return result
      }
    }
  )

  private static func fetch(_ location: WeatherONNativeLocation) async throws -> WeatherONNativeForecast {
    let coordinate = CLLocation(latitude: location.latitude, longitude: location.longitude)
    async let data = WeatherService.shared.weather(for: coordinate, including: .current, .hourly)
    let attribution = try await WeatherService.shared.attribution
    async let dark = mark(attribution.combinedMarkDarkURL)
    async let light = mark(attribution.combinedMarkLightURL)
    let (current, hours) = try await data
    let hourly = hours.filter { $0.date >= Date().addingTimeInterval(-3600) }.prefix(7).map {
      WeatherONNativeHour(date: $0.date, temperatureC: $0.temperature.converted(to: .celsius).value,
        condition: condition($0.condition), rainProbabilityPct: $0.precipitationChance * 100)
    }
    return try await WeatherONNativeForecast(
      observedAt: current.date, temperatureC: current.temperature.converted(to: .celsius).value,
      feelsLikeC: current.apparentTemperature.converted(to: .celsius).value,
      condition: condition(current.condition), rainProbabilityPct: hourly.first?.rainProbabilityPct ?? 0,
      humidityPct: current.humidity * 100, windMs: current.wind.speed.converted(to: .metersPerSecond).value,
      hourly: hourly,
      attribution: WeatherONNativeAttribution(serviceName: attribution.serviceName, legalURL: attribution.legalPageURL,
        darkMark: dark, lightMark: light)
    )
  }

  private static func mark(_ url: URL) async throws -> Data {
    guard url.scheme == "https" else { throw URLError(.badURL) }
    var request = URLRequest(url: url)
    request.timeoutInterval = 5
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let response = response as? HTTPURLResponse, response.statusCode == 200,
          !data.isEmpty, data.count <= 262_144 else { throw URLError(.badServerResponse) }
    return data
  }

  static func condition(_ value: WeatherCondition) -> String {
    switch value {
    case .clear, .mostlyClear, .hot, .frigid: return "clear"
    case .rain, .heavyRain, .drizzle, .freezingRain, .freezingDrizzle, .sunShowers: return "rain"
    case .snow, .heavySnow, .blizzard, .blowingSnow, .flurries, .sunFlurries, .sleet, .wintryMix, .hail: return "snow"
    case .thunderstorms, .isolatedThunderstorms, .scatteredThunderstorms, .strongStorms, .tropicalStorm, .hurricane: return "storm"
    case .blowingDust, .smoky: return "dust"
    default: return "cloud"
    }
  }
}
