import AppIntents
import SwiftUI
import WidgetKit

private let appGroupIdentifier = "group.com.weatheron.mobile"
private let widgetStoreKey = "weatheron.widget.store.v2"
private let widgetStoreRelativePath = "Library/Application Support/WeatherONWidget/weatheron-widget-store-v2.json"
private let legacySnapshotKey = "weatheron.widget.snapshot.v1"
private let currentLocationEntityID = "__current__"
private let homeDeepLink = URL(string: "weatheron://home")!

private let snapshotDateFormatter: ISO8601DateFormatter = {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return formatter
}()

private let fallbackSnapshotDateFormatter = ISO8601DateFormatter()

private struct WeatherONHourlySnapshot: Codable, Hashable, Identifiable {
  let time: String
  let temperatureC: Int
  let condition: String
  let rainProbabilityPct: Int

  var id: String { time }

  private enum CodingKeys: String, CodingKey {
    case time
    case temperatureC
    case condition
    case rainProbabilityPct
  }

  init(time: String, temperatureC: Int, condition: String, rainProbabilityPct: Int) {
    self.time = time
    self.temperatureC = temperatureC
    self.condition = condition
    self.rainProbabilityPct = rainProbabilityPct
  }

  init(from decoder: Decoder) throws {
    let values = try decoder.container(keyedBy: CodingKeys.self)
    time = try values.decodeIfPresent(String.self, forKey: .time) ?? "--:--"
    temperatureC = try values.decodeIfPresent(Int.self, forKey: .temperatureC) ?? 0
    condition = try values.decodeIfPresent(String.self, forKey: .condition) ?? "cloud"
    rainProbabilityPct = try values.decodeIfPresent(Int.self, forKey: .rainProbabilityPct) ?? 0
  }
}

private struct WeatherONOutfitItem: Codable, Hashable, Identifiable {
  let category: String
  let name: String

  var id: String { "\(category):\(name)" }

  private enum CodingKeys: String, CodingKey {
    case category
    case name
  }

  init(category: String, name: String) {
    self.category = category
    self.name = name
  }

  init(from decoder: Decoder) throws {
    let values = try decoder.container(keyedBy: CodingKeys.self)
    category = try values.decodeIfPresent(String.self, forKey: .category) ?? "top"
    name = try values.decodeIfPresent(String.self, forKey: .name) ?? "추천 코디"
  }
}

private struct WeatherONLocationSnapshot: Codable, Hashable {
  let id: String
  let kind: String
  let locationName: String
  let latitude: Double?
  let longitude: Double?
  let timeZone: String?
  let temperatureC: Int
  let feelsLikeC: Int
  let condition: String
  let conditionLabel: String
  let rainProbabilityPct: Int
  let humidityPct: Int
  let windMs: Double
  let umbrellaNeeded: Bool
  let outerNeeded: Bool
  let maskNeeded: Bool
  let outfitSummary: String
  let outfitItems: [WeatherONOutfitItem]
  let outfitVariant: String
  let observedAt: String
  let hourly: [WeatherONHourlySnapshot]
  let departureTime: String?
  let arrivalTime: String?
  let travelMinutes: Int?
  let transportMode: String?
  let deepLink: String

  var isDestination: Bool { kind == "destination" }
  var deepLinkURL: URL { URL(string: deepLink) ?? homeDeepLink }

  private enum CodingKeys: String, CodingKey {
    case id
    case kind
    case locationName
    case latitude
    case longitude
    case timeZone
    case temperatureC
    case feelsLikeC
    case condition
    case conditionLabel
    case rainProbabilityPct
    case humidityPct
    case windMs
    case umbrellaNeeded
    case outerNeeded
    case maskNeeded
    case outfitSummary
    case outfitItems
    case outfitVariant
    case observedAt
    case hourly
    case departureTime
    case arrivalTime
    case travelMinutes
    case transportMode
    case deepLink
  }

  init(
    id: String,
    kind: String,
    locationName: String,
    latitude: Double? = nil,
    longitude: Double? = nil,
    timeZone: String? = nil,
    temperatureC: Int,
    feelsLikeC: Int,
    condition: String,
    conditionLabel: String,
    rainProbabilityPct: Int,
    humidityPct: Int,
    windMs: Double,
    umbrellaNeeded: Bool,
    outerNeeded: Bool,
    maskNeeded: Bool,
    outfitSummary: String,
    outfitItems: [WeatherONOutfitItem],
    outfitVariant: String,
    observedAt: String,
    hourly: [WeatherONHourlySnapshot],
    departureTime: String?,
    arrivalTime: String?,
    travelMinutes: Int?,
    transportMode: String?,
    deepLink: String
  ) {
    self.id = id
    self.kind = kind
    self.locationName = locationName
    self.latitude = latitude
    self.longitude = longitude
    self.timeZone = timeZone
    self.temperatureC = temperatureC
    self.feelsLikeC = feelsLikeC
    self.condition = condition
    self.conditionLabel = conditionLabel
    self.rainProbabilityPct = rainProbabilityPct
    self.humidityPct = humidityPct
    self.windMs = windMs
    self.umbrellaNeeded = umbrellaNeeded
    self.outerNeeded = outerNeeded
    self.maskNeeded = maskNeeded
    self.outfitSummary = outfitSummary
    self.outfitItems = outfitItems
    self.outfitVariant = outfitVariant
    self.observedAt = observedAt
    self.hourly = hourly
    self.departureTime = departureTime
    self.arrivalTime = arrivalTime
    self.travelMinutes = travelMinutes
    self.transportMode = transportMode
    self.deepLink = deepLink
  }

  init(from decoder: Decoder) throws {
    let values = try decoder.container(keyedBy: CodingKeys.self)
    id = try values.decodeIfPresent(String.self, forKey: .id) ?? "current"
    kind = try values.decodeIfPresent(String.self, forKey: .kind) ?? "current"
    locationName = try values.decodeIfPresent(String.self, forKey: .locationName) ?? "WeatherON"
    latitude = try values.decodeIfPresent(Double.self, forKey: .latitude)
    longitude = try values.decodeIfPresent(Double.self, forKey: .longitude)
    timeZone = try values.decodeIfPresent(String.self, forKey: .timeZone)
    temperatureC = try values.decodeIfPresent(Int.self, forKey: .temperatureC) ?? 0
    feelsLikeC = try values.decodeIfPresent(Int.self, forKey: .feelsLikeC) ?? temperatureC
    condition = try values.decodeIfPresent(String.self, forKey: .condition) ?? "cloud"
    conditionLabel = try values.decodeIfPresent(String.self, forKey: .conditionLabel) ?? "날씨 확인 중"
    rainProbabilityPct = try values.decodeIfPresent(Int.self, forKey: .rainProbabilityPct) ?? 0
    humidityPct = try values.decodeIfPresent(Int.self, forKey: .humidityPct) ?? 0
    windMs = try values.decodeIfPresent(Double.self, forKey: .windMs) ?? 0
    umbrellaNeeded = try values.decodeIfPresent(Bool.self, forKey: .umbrellaNeeded) ?? false
    outerNeeded = try values.decodeIfPresent(Bool.self, forKey: .outerNeeded) ?? false
    maskNeeded = try values.decodeIfPresent(Bool.self, forKey: .maskNeeded) ?? false
    outfitSummary = try values.decodeIfPresent(String.self, forKey: .outfitSummary) ?? "코디 준비 중"
    outfitItems = try values.decodeIfPresent([WeatherONOutfitItem].self, forKey: .outfitItems) ?? []
    outfitVariant = try values.decodeIfPresent(String.self, forKey: .outfitVariant) ?? "default"
    observedAt = try values.decodeIfPresent(String.self, forKey: .observedAt) ?? ""
    hourly = try values.decodeIfPresent([WeatherONHourlySnapshot].self, forKey: .hourly) ?? []
    departureTime = try values.decodeIfPresent(String.self, forKey: .departureTime)
    arrivalTime = try values.decodeIfPresent(String.self, forKey: .arrivalTime)
    travelMinutes = try values.decodeIfPresent(Int.self, forKey: .travelMinutes)
    transportMode = try values.decodeIfPresent(String.self, forKey: .transportMode)
    deepLink = try values.decodeIfPresent(String.self, forKey: .deepLink) ?? homeDeepLink.absoluteString
  }
}

private struct WeatherONSolarEvents {
  let sunrise: Date
  let sunset: Date
}

private enum WeatherONSolarClock {
  private static let officialZenith = 90.833

  static func events(
    for date: Date,
    latitude: Double,
    longitude: Double,
    timeZone: TimeZone
  ) -> WeatherONSolarEvents? {
    guard
      latitude.isFinite,
      longitude.isFinite,
      abs(latitude) <= 90,
      abs(longitude) <= 180,
      let sunrise = eventDate(
        for: date,
        latitude: latitude,
        longitude: longitude,
        timeZone: timeZone,
        isSunrise: true
      ),
      let sunset = eventDate(
        for: date,
        latitude: latitude,
        longitude: longitude,
        timeZone: timeZone,
        isSunrise: false
      )
    else {
      return nil
    }
    return WeatherONSolarEvents(sunrise: sunrise, sunset: sunset)
  }

  private static func eventDate(
    for date: Date,
    latitude: Double,
    longitude: Double,
    timeZone: TimeZone,
    isSunrise: Bool
  ) -> Date? {
    var localCalendar = Calendar(identifier: .gregorian)
    localCalendar.timeZone = timeZone
    let components = localCalendar.dateComponents([.year, .month, .day], from: date)
    guard
      let year = components.year,
      let month = components.month,
      let day = components.day,
      let dayOfYear = localCalendar.ordinality(of: .day, in: .year, for: date),
      let localNoon = localCalendar.date(from: DateComponents(year: year, month: month, day: day, hour: 12))
    else {
      return nil
    }

    let longitudeHour = longitude / 15
    let approximateTime = Double(dayOfYear) + ((isSunrise ? 6 : 18) - longitudeHour) / 24
    let meanAnomaly = (0.9856 * approximateTime) - 3.289
    let trueLongitude = normalizedDegrees(
      meanAnomaly
        + 1.916 * sin(degreesToRadians(meanAnomaly))
        + 0.020 * sin(2 * degreesToRadians(meanAnomaly))
        + 282.634
    )

    var rightAscension = normalizedDegrees(
      radiansToDegrees(atan(0.91764 * tan(degreesToRadians(trueLongitude))))
    )
    let longitudeQuadrant = floor(trueLongitude / 90) * 90
    let rightAscensionQuadrant = floor(rightAscension / 90) * 90
    rightAscension = (rightAscension + longitudeQuadrant - rightAscensionQuadrant) / 15

    let sinDeclination = 0.39782 * sin(degreesToRadians(trueLongitude))
    let cosDeclination = cos(asin(sinDeclination))
    let cosHourAngle = (
      cos(degreesToRadians(officialZenith))
        - sinDeclination * sin(degreesToRadians(latitude))
    ) / (cosDeclination * cos(degreesToRadians(latitude)))
    guard cosHourAngle >= -1, cosHourAngle <= 1 else { return nil }

    let hourAngleDegrees = isSunrise
      ? 360 - radiansToDegrees(acos(cosHourAngle))
      : radiansToDegrees(acos(cosHourAngle))
    let localMeanTime = hourAngleDegrees / 15 + rightAscension - 0.06571 * approximateTime - 6.622
    let utcHour = normalizedHours(localMeanTime - longitudeHour)

    var utcCalendar = Calendar(identifier: .gregorian)
    utcCalendar.timeZone = TimeZone(secondsFromGMT: 0) ?? .gmt
    guard let utcMidnight = utcCalendar.date(
      from: DateComponents(timeZone: utcCalendar.timeZone, year: year, month: month, day: day)
    ) else {
      return nil
    }

    var event = utcMidnight.addingTimeInterval(utcHour * 3_600)
    while event.timeIntervalSince(localNoon) <= -43_200 { event = event.addingTimeInterval(86_400) }
    while event.timeIntervalSince(localNoon) > 43_200 { event = event.addingTimeInterval(-86_400) }
    return event
  }

  private static func normalizedDegrees(_ value: Double) -> Double {
    let remainder = value.truncatingRemainder(dividingBy: 360)
    return remainder < 0 ? remainder + 360 : remainder
  }

  private static func normalizedHours(_ value: Double) -> Double {
    let remainder = value.truncatingRemainder(dividingBy: 24)
    return remainder < 0 ? remainder + 24 : remainder
  }

  private static func degreesToRadians(_ value: Double) -> Double { value * .pi / 180 }
  private static func radiansToDegrees(_ value: Double) -> Double { value * 180 / .pi }
}

private extension WeatherONLocationSnapshot {
  var resolvedTimeZone: TimeZone {
    timeZone.flatMap(TimeZone.init(identifier:)) ?? .current
  }

  func isNight(at date: Date) -> Bool {
    if
      let latitude,
      let longitude,
      let events = WeatherONSolarClock.events(
        for: date,
        latitude: latitude,
        longitude: longitude,
        timeZone: resolvedTimeZone
      )
    {
      return date < events.sunrise || date >= events.sunset
    }

    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = resolvedTimeZone
    let hour = calendar.component(.hour, from: date)
    return hour >= 19 || hour < 6
  }

  func isNight(for hourlyTime: String, relativeTo referenceDate: Date) -> Bool {
    isNight(at: date(for: hourlyTime, relativeTo: referenceDate))
  }

  private func date(for hourlyTime: String, relativeTo referenceDate: Date) -> Date {
    if let date = snapshotDateFormatter.date(from: hourlyTime)
      ?? fallbackSnapshotDateFormatter.date(from: hourlyTime)
    {
      return date
    }

    let localDateFormats = [
      "yyyy-MM-dd'T'HH:mm:ss",
      "yyyy-MM-dd'T'HH:mm",
      "yyyy-MM-dd HH:mm:ss",
      "yyyy-MM-dd HH:mm",
    ]
    for format in localDateFormats {
      let formatter = DateFormatter()
      formatter.locale = Locale(identifier: "en_US_POSIX")
      formatter.calendar = Calendar(identifier: .gregorian)
      formatter.timeZone = resolvedTimeZone
      formatter.dateFormat = format
      if let date = formatter.date(from: hourlyTime) {
        return date
      }
    }

    guard hourlyTime.range(of: #"^\d{2}:\d{2}$"#, options: .regularExpression) != nil else {
      return referenceDate
    }

    let parts = hourlyTime.split(separator: ":")
    guard
      parts.count == 2,
      let hour = Int(parts[0]),
      let minute = Int(parts[1])
    else {
      return referenceDate
    }

    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = resolvedTimeZone
    var components = calendar.dateComponents([.year, .month, .day], from: referenceDate)
    components.hour = hour
    components.minute = minute
    guard var date = calendar.date(from: components) else { return referenceDate }

    // 자정을 넘는 단축 시각(예: 23:00 다음 00:00)은 다음 날 예보로 해석한다.
    if date < referenceDate.addingTimeInterval(-2 * 3_600),
      let nextDay = calendar.date(byAdding: .day, value: 1, to: date)
    {
      date = nextDay
    }
    return date
  }

  func nextSolarTransition(after date: Date) -> Date? {
    guard let latitude, let longitude else { return nil }
    var calendar = Calendar(identifier: .gregorian)
    calendar.timeZone = resolvedTimeZone
    var candidates: [Date] = []
    for offset in 0...2 {
      guard
        let targetDate = calendar.date(byAdding: .day, value: offset, to: date),
        let events = WeatherONSolarClock.events(
          for: targetDate,
          latitude: latitude,
          longitude: longitude,
          timeZone: resolvedTimeZone
        )
      else {
        continue
      }
      candidates.append(events.sunrise)
      candidates.append(events.sunset)
    }
    return candidates.filter { $0 > date }.min()
  }
}

private struct WeatherONWidgetStore: Codable {
  let schemaVersion: Int
  let updatedAt: String
  let selectedDestinationId: String?
  let current: WeatherONLocationSnapshot
  let destinations: [WeatherONLocationSnapshot]

  private enum CodingKeys: String, CodingKey {
    case schemaVersion
    case updatedAt
    case selectedDestinationId
    case current
    case destinations
  }

  init(
    schemaVersion: Int,
    updatedAt: String,
    selectedDestinationId: String?,
    current: WeatherONLocationSnapshot,
    destinations: [WeatherONLocationSnapshot]
  ) {
    self.schemaVersion = schemaVersion
    self.updatedAt = updatedAt
    self.selectedDestinationId = selectedDestinationId
    self.current = current
    self.destinations = destinations
  }

  init(from decoder: Decoder) throws {
    let values = try decoder.container(keyedBy: CodingKeys.self)
    schemaVersion = try values.decodeIfPresent(Int.self, forKey: .schemaVersion) ?? 2
    updatedAt = try values.decodeIfPresent(String.self, forKey: .updatedAt) ?? ""
    selectedDestinationId = try values.decodeIfPresent(String.self, forKey: .selectedDestinationId)
    current = try values.decodeIfPresent(WeatherONLocationSnapshot.self, forKey: .current) ?? .currentPlaceholder
    destinations = try values.decodeIfPresent([WeatherONLocationSnapshot].self, forKey: .destinations) ?? []
  }
}

private struct WeatherONLegacySnapshot: Codable {
  let locationName: String
  let temperatureC: Int
  let condition: String
  let conditionLabel: String
  let advice: String
  let observedAt: String
}

private enum WeatherONStoreReader {
  static func load() -> (store: WeatherONWidgetStore, hasSharedSnapshot: Bool) {
    if
      let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier),
      let data = try? Data(contentsOf: containerURL.appendingPathComponent(widgetStoreRelativePath, isDirectory: false)),
      let store = try? JSONDecoder().decode(WeatherONWidgetStore.self, from: data)
    {
      return (store, true)
    }

    guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else { return (.placeholder, false) }

    if
      let json = defaults.string(forKey: widgetStoreKey),
      let data = json.data(using: .utf8),
      let store = try? JSONDecoder().decode(WeatherONWidgetStore.self, from: data)
    {
      return (store, true)
    }

    if
      let json = defaults.string(forKey: legacySnapshotKey),
      let data = json.data(using: .utf8),
      let legacy = try? JSONDecoder().decode(WeatherONLegacySnapshot.self, from: data)
    {
      return (.legacy(legacy), true)
    }

    return (.placeholder, false)
  }

  static func location(for selectionID: String?, in store: WeatherONWidgetStore) -> WeatherONLocationSnapshot {
    guard let selectionID, selectionID != currentLocationEntityID else { return store.current }
    return store.destinations.first(where: { $0.id == selectionID }) ?? store.current
  }
}

private struct WeatherONEntry: TimelineEntry {
  let date: Date
  let location: WeatherONLocationSnapshot
  let hasSharedSnapshot: Bool
  let visualPhase: Int

  static let placeholder = WeatherONEntry(
    date: Date(),
    location: .currentPlaceholder,
    hasSharedSnapshot: true,
    visualPhase: 0
  )
}

private enum WeatherONTimelineFactory {
  static func entry(selectionID: String?, date: Date = Date(), phase: Int = 0) -> WeatherONEntry {
    let loaded = WeatherONStoreReader.load()
    return WeatherONEntry(
      date: date,
      location: WeatherONStoreReader.location(for: selectionID, in: loaded.store),
      hasSharedSnapshot: loaded.hasSharedSnapshot,
      visualPhase: phase
    )
  }

  static func timeline(selectionID: String?) -> Timeline<WeatherONEntry> {
    let now = Date()
    let refresh = Calendar.current.date(byAdding: .minute, value: 90, to: now) ?? now.addingTimeInterval(5_400)
    let loaded = WeatherONStoreReader.load()
    let location = WeatherONStoreReader.location(for: selectionID, in: loaded.store)
    var entryDates = (0..<3).map { phase in
      Calendar.current.date(byAdding: .minute, value: phase * 30, to: now) ?? now
    }
    if let transition = location.nextSolarTransition(after: now), transition <= refresh {
      entryDates.append(transition)
    }
    entryDates.sort()
    let entries = entryDates.enumerated().map { phase, date in
      WeatherONEntry(
        date: date,
        location: location,
        hasSharedSnapshot: loaded.hasSharedSnapshot,
        visualPhase: phase
      )
    }
    return Timeline(entries: entries, policy: .after(refresh))
  }

  static func snapshot(selectionID: String?) -> WeatherONEntry {
    let entry = entry(selectionID: selectionID)
    return entry.hasSharedSnapshot ? entry : .placeholder
  }
}

struct WeatherONLocationEntity: AppEntity, Identifiable {
  static let typeDisplayRepresentation: TypeDisplayRepresentation = "날씨 위치"
  static let defaultQuery = WeatherONLocationQuery()

  let id: String
  let name: String
  let kind: String

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(
      title: "\(name)",
      subtitle: kind == "destination" ? "저장된 목적지" : "현재 위치"
    )
  }
}

struct WeatherONLocationQuery: EntityQuery {
  func entities(for identifiers: [WeatherONLocationEntity.ID]) async throws -> [WeatherONLocationEntity] {
    availableEntities().filter { identifiers.contains($0.id) }
  }

  func suggestedEntities() async throws -> [WeatherONLocationEntity] {
    availableEntities()
  }

  func defaultResult() async -> WeatherONLocationEntity? {
    availableEntities().first
  }

  private func availableEntities() -> [WeatherONLocationEntity] {
    let store = WeatherONStoreReader.load().store
    return [WeatherONLocationEntity(id: currentLocationEntityID, name: store.current.locationName, kind: "current")]
      + store.destinations.map { WeatherONLocationEntity(id: $0.id, name: $0.locationName, kind: "destination") }
  }
}

struct WeatherONWidgetConfigurationIntent: WidgetConfigurationIntent {
  static let title: LocalizedStringResource = "표시할 위치 선택"
  static let description = IntentDescription("현재 위치 또는 저장된 목적지를 선택해요.")

  @Parameter(title: "위치")
  var location: WeatherONLocationEntity?

  init() {
    location = WeatherONLocationEntity(
      id: currentLocationEntityID,
      name: "현재 위치",
      kind: "current"
    )
  }

  init(location: WeatherONLocationEntity) {
    self.location = location
  }

  static var parameterSummary: some ParameterSummary {
    Summary("\(\.$location)의 날씨")
  }
}

private struct WeatherONIntentProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> WeatherONEntry { .placeholder }

  func snapshot(for configuration: WeatherONWidgetConfigurationIntent, in context: Context) async -> WeatherONEntry {
    WeatherONTimelineFactory.snapshot(selectionID: configuration.location?.id)
  }

  func timeline(for configuration: WeatherONWidgetConfigurationIntent, in context: Context) async -> Timeline<WeatherONEntry> {
    WeatherONTimelineFactory.timeline(selectionID: configuration.location?.id)
  }
}

private struct WeatherONWidgetView: View {
  @Environment(\.colorScheme) private var colorScheme
  @Environment(\.widgetFamily) private var family

  let entry: WeatherONEntry

  var body: some View {
    Group {
      switch family {
      case .systemMedium:
        WeatherONMediumView(entry: entry, palette: palette)
      case .systemLarge:
        WeatherONLargeView(entry: entry, palette: palette)
      default:
        WeatherONSmallView(entry: entry, palette: palette)
      }
    }
    .widgetURL(entry.location.deepLinkURL)
    .weatherONWidgetBackground(
      condition: entry.location.condition,
      isNight: isNight,
      palette: palette,
      visualPhase: entry.visualPhase
    )
  }

  private var isNight: Bool {
    entry.location.isNight(at: entry.date)
  }

  private var palette: WeatherONWidgetPalette {
    WeatherONWidgetPalette(colorScheme: colorScheme, condition: entry.location.condition, isNight: isNight)
  }
}

private struct WeatherONSmallView: View {
  let entry: WeatherONEntry
  let palette: WeatherONWidgetPalette

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      WeatherONHeader(entry: entry, palette: palette, compact: true)

      HStack(alignment: .center, spacing: 6) {
        VStack(alignment: .leading, spacing: 0) {
          Text("\(entry.location.temperatureC)°")
            .font(.system(size: 40, weight: .bold, design: .rounded))
            .tracking(-2)
          Text(entry.location.conditionLabel)
            .font(.system(size: 12, weight: .bold, design: .rounded))
            .foregroundStyle(palette.secondaryText)
        }

        Spacer(minLength: 0)

        WeatherONConditionGlyph(
          condition: entry.location.condition,
          isNight: entry.location.isNight(at: entry.date),
          palette: palette,
          size: 42
        )
      }
      .foregroundStyle(palette.primaryText)
      .padding(.top, 5)

      Spacer(minLength: 3)

      if entry.location.isDestination {
        WeatherONSmallDestinationStrip(location: entry.location, palette: palette)
      } else {
        WeatherONPreparationStrip(location: entry.location, palette: palette, compact: true)
      }
    }
    .padding(14)
  }
}

private struct WeatherONMediumView: View {
  let entry: WeatherONEntry
  let palette: WeatherONWidgetPalette

  var body: some View {
    HStack(spacing: 14) {
      VStack(alignment: .leading, spacing: 0) {
        WeatherONHeader(entry: entry, palette: palette, compact: false)
        Spacer(minLength: 4)
        HStack(alignment: .center, spacing: 8) {
          Text("\(entry.location.temperatureC)°")
            .font(.system(size: 44, weight: .bold, design: .rounded))
            .tracking(-2)
          WeatherONConditionGlyph(
            condition: entry.location.condition,
            isNight: entry.location.isNight(at: entry.date),
            palette: palette,
            size: 44
          )
        }
        Text("체감 \(entry.location.feelsLikeC)° · \(entry.location.conditionLabel)")
          .font(.system(size: 11, weight: .semibold, design: .rounded))
          .foregroundStyle(palette.secondaryText)
          .lineLimit(1)
        Spacer(minLength: 5)
        WeatherONPreparationStrip(location: entry.location, palette: palette, compact: true)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      VStack(spacing: 8) {
        if entry.location.isDestination {
          WeatherONScheduleCard(location: entry.location, palette: palette, compact: true)
          WeatherONOutfitCard(location: entry.location, palette: palette, compact: true)
        } else {
          WeatherONHourlyStrip(location: entry.location, palette: palette, limit: 3, referenceDate: entry.date)
          WeatherONOutfitCard(location: entry.location, palette: palette, compact: true)
        }
      }
      .frame(maxWidth: .infinity)
    }
    .foregroundStyle(palette.primaryText)
    .padding(16)
  }
}

private struct WeatherONLargeView: View {
  let entry: WeatherONEntry
  let palette: WeatherONWidgetPalette

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      WeatherONHeader(entry: entry, palette: palette, compact: false)

      HStack(spacing: 12) {
        HStack(spacing: 10) {
          Text("\(entry.location.temperatureC)°")
            .font(.system(size: 48, weight: .bold, design: .rounded))
            .tracking(-2)
            .lineLimit(1)
            .minimumScaleFactor(0.78)
            .allowsTightening(true)
            .fixedSize(horizontal: true, vertical: false)
            .layoutPriority(2)
          VStack(alignment: .leading, spacing: 3) {
            Text(entry.location.conditionLabel)
              .font(.system(size: 16, weight: .bold, design: .rounded))
              .lineLimit(1)
              .minimumScaleFactor(0.8)
            Text("체감 \(entry.location.feelsLikeC)°")
              .font(.system(size: 11, weight: .semibold, design: .rounded))
              .foregroundStyle(palette.secondaryText)
          }
          Spacer(minLength: 0)
          WeatherONConditionGlyph(
            condition: entry.location.condition,
            isNight: entry.location.isNight(at: entry.date),
            palette: palette,
            size: 48
          )
        }
        .frame(maxWidth: .infinity)

        if entry.location.isDestination {
          WeatherONScheduleCard(location: entry.location, palette: palette, compact: false)
            .frame(maxWidth: .infinity)
        }
      }

      WeatherONHourlyStrip(location: entry.location, palette: palette, limit: 5, referenceDate: entry.date)

      HStack(spacing: 10) {
        WeatherONOutfitCard(location: entry.location, palette: palette, compact: false)
          .frame(maxWidth: .infinity)
        VStack(spacing: 8) {
          WeatherONPreparationStrip(location: entry.location, palette: palette, compact: false)
          WeatherONMetricStrip(location: entry.location, palette: palette)
        }
        .frame(maxWidth: .infinity)
      }
    }
    .foregroundStyle(palette.primaryText)
    .padding(18)
  }
}

private struct WeatherONHeader: View {
  let entry: WeatherONEntry
  let palette: WeatherONWidgetPalette
  let compact: Bool

  var body: some View {
    HStack(spacing: 5) {
      Image(systemName: entry.location.isDestination ? "mappin.and.ellipse" : "location.fill")
        .font(.system(size: compact ? 10 : 11, weight: .bold))
      Text(entry.location.locationName)
        .font(.system(size: compact ? 12 : 13, weight: .bold, design: .rounded))
        .lineLimit(1)
      Spacer(minLength: 4)
      Text(entry.hasSharedSnapshot ? updateLabel : "앱에서 업데이트")
        .font(.system(size: compact ? 8 : 9, weight: .semibold, design: .rounded))
        .lineLimit(1)
    }
    .foregroundStyle(palette.secondaryText)
  }

  private var updateLabel: String {
    guard
      let observedAt = snapshotDateFormatter.date(from: entry.location.observedAt)
        ?? fallbackSnapshotDateFormatter.date(from: entry.location.observedAt),
      observedAt <= entry.date
    else {
      return "최근 업데이트"
    }
    let minutes = max(0, Int(entry.date.timeIntervalSince(observedAt) / 60))
    if minutes < 1 { return "방금 전" }
    if minutes < 60 { return "\(minutes)분 전" }
    return "최근 업데이트"
  }
}

private struct WeatherONConditionGlyph: View {
  let condition: String
  let isNight: Bool
  let palette: WeatherONWidgetPalette
  let size: CGFloat

  var body: some View {
    ZStack {
      Circle().fill(palette.accent.opacity(0.18))
      Image(systemName: weatherSymbol(condition, isNight: isNight))
        .font(.system(size: size * 0.50, weight: .semibold))
        .symbolRenderingMode(.monochrome)
        .foregroundStyle(palette.accent)
    }
    .frame(width: size, height: size)
    .accessibilityHidden(true)
  }
}

private struct WeatherONPreparationStrip: View {
  let location: WeatherONLocationSnapshot
  let palette: WeatherONWidgetPalette
  let compact: Bool

  var body: some View {
    HStack(spacing: compact ? 4 : 6) {
      WeatherONPreparationTile(title: "우산", symbol: "umbrella.fill", isNeeded: location.umbrellaNeeded, palette: palette, compact: compact)
      WeatherONPreparationTile(title: "외투", symbol: "tshirt.fill", isNeeded: location.outerNeeded, palette: palette, compact: compact)
      WeatherONPreparationTile(title: "마스크", symbol: "facemask.fill", isNeeded: location.maskNeeded, palette: palette, compact: compact)
    }
  }
}

private struct WeatherONPreparationTile: View {
  let title: String
  let symbol: String
  let isNeeded: Bool
  let palette: WeatherONWidgetPalette
  let compact: Bool

  var body: some View {
    VStack(spacing: 2) {
      Image(systemName: symbol)
        .font(.system(size: compact ? 11 : 13, weight: .semibold))
      Text("\(title) \(isNeeded ? "O" : "X")")
        .font(.system(size: compact ? 8 : 9, weight: .bold, design: .rounded))
        .lineLimit(1)
        .minimumScaleFactor(0.75)
    }
    .foregroundStyle(isNeeded ? palette.accent : palette.secondaryText)
    .frame(maxWidth: .infinity)
    .frame(height: compact ? 34 : 40)
    .weatherONCard(palette: palette, highlighted: isNeeded)
    .accessibilityElement(children: .ignore)
    .accessibilityLabel("\(title), \(isNeeded ? "필요" : "불필요")")
  }
}

private struct WeatherONSmallDestinationStrip: View {
  let location: WeatherONLocationSnapshot
  let palette: WeatherONWidgetPalette

  var body: some View {
    HStack(spacing: 4) {
      WeatherONCompactFact(symbol: transportSymbol(location.transportMode), value: location.departureTime ?? "--:--", label: "출발", palette: palette)
      WeatherONCompactFact(symbol: outfitSymbol(location.outfitVariant), value: "코디", label: "추천", palette: palette)
      WeatherONCompactFact(symbol: "umbrella.fill", value: location.umbrellaNeeded ? "O" : "X", label: "우산", palette: palette)
    }
  }
}

private struct WeatherONCompactFact: View {
  let symbol: String
  let value: String
  let label: String
  let palette: WeatherONWidgetPalette

  var body: some View {
    VStack(spacing: 1) {
      Image(systemName: symbol).font(.system(size: 10, weight: .semibold))
      Text(value).font(.system(size: 9, weight: .bold, design: .rounded)).lineLimit(1)
      Text(label).font(.system(size: 7, weight: .semibold, design: .rounded)).foregroundStyle(palette.secondaryText)
    }
    .frame(maxWidth: .infinity)
    .frame(height: 38)
    .weatherONCard(palette: palette, highlighted: false)
  }
}

private struct WeatherONScheduleCard: View {
  let location: WeatherONLocationSnapshot
  let palette: WeatherONWidgetPalette
  let compact: Bool

  var body: some View {
    VStack(alignment: .leading, spacing: compact ? 4 : 7) {
      HStack {
        Label("이동 계획", systemImage: transportSymbol(location.transportMode))
          .font(.system(size: compact ? 9 : 11, weight: .bold, design: .rounded))
        Spacer(minLength: 2)
        if let travelMinutes = location.travelMinutes {
          Text("\(travelMinutes)분")
            .font(.system(size: compact ? 8 : 10, weight: .semibold, design: .rounded))
            .foregroundStyle(palette.secondaryText)
        }
      }

      HStack(alignment: .firstTextBaseline, spacing: 5) {
        VStack(alignment: .leading, spacing: 1) {
          Text(location.departureTime ?? "--:--")
            .font(.system(size: compact ? 18 : 23, weight: .bold, design: .rounded))
          Text("출발")
            .font(.system(size: 8, weight: .semibold, design: .rounded))
            .foregroundStyle(palette.secondaryText)
        }
        Image(systemName: "arrow.right")
          .font(.system(size: 9, weight: .bold))
          .foregroundStyle(palette.accent)
        VStack(alignment: .leading, spacing: 1) {
          Text(location.arrivalTime ?? "--:--")
            .font(.system(size: compact ? 14 : 18, weight: .bold, design: .rounded))
          Text("도착")
            .font(.system(size: 8, weight: .semibold, design: .rounded))
            .foregroundStyle(palette.secondaryText)
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(compact ? 9 : 12)
    .weatherONCard(palette: palette, highlighted: true)
  }
}

private struct WeatherONOutfitCard: View {
  let location: WeatherONLocationSnapshot
  let palette: WeatherONWidgetPalette
  let compact: Bool

  var body: some View {
    VStack(alignment: .leading, spacing: compact ? 4 : 8) {
      HStack {
        Label("추천 코디", systemImage: outfitSymbol(location.outfitVariant))
          .font(.system(size: compact ? 9 : 11, weight: .bold, design: .rounded))
        Spacer(minLength: 2)
        Text("\(location.outfitItems.count)개")
          .font(.system(size: 8, weight: .semibold, design: .rounded))
          .foregroundStyle(palette.secondaryText)
      }

      HStack(spacing: compact ? 5 : 8) {
        ForEach(location.outfitItems.prefix(compact ? 3 : 4)) { item in
          VStack(spacing: 3) {
            Image(systemName: outfitItemSymbol(item.category))
              .font(.system(size: compact ? 12 : 16, weight: .semibold))
              .foregroundStyle(palette.accent)
            if !compact {
              Text(item.name)
                .font(.system(size: 8, weight: .semibold, design: .rounded))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            }
          }
          .frame(maxWidth: .infinity)
        }
      }

      if compact {
        Text(location.outfitSummary.isEmpty ? "코디 준비 중" : location.outfitSummary)
          .font(.system(size: 8, weight: .semibold, design: .rounded))
          .foregroundStyle(palette.secondaryText)
          .lineLimit(1)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(compact ? 8 : 12)
    .weatherONCard(palette: palette, highlighted: false)
  }
}

private struct WeatherONHourlyStrip: View {
  let location: WeatherONLocationSnapshot
  let palette: WeatherONWidgetPalette
  let limit: Int
  let referenceDate: Date

  var body: some View {
    HStack(spacing: 5) {
      ForEach(Array(location.hourly.prefix(limit))) { hour in
        VStack(spacing: 4) {
          Text(compactHour(hour.time))
            .font(.system(size: 8, weight: .semibold, design: .rounded))
            .foregroundStyle(palette.secondaryText)
          Image(
            systemName: weatherSymbol(
              hour.condition,
              isNight: location.isNight(for: hour.time, relativeTo: referenceDate)
            )
          )
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(palette.accent)
          Text("\(hour.temperatureC)°")
            .font(.system(size: 10, weight: .bold, design: .rounded))
          if hour.rainProbabilityPct > 0 {
            Text("\(hour.rainProbabilityPct)%")
              .font(.system(size: 7, weight: .bold, design: .rounded))
              .foregroundStyle(palette.rain)
          }
        }
        .frame(maxWidth: .infinity)
      }
    }
    .padding(.vertical, 9)
    .padding(.horizontal, 8)
    .weatherONCard(palette: palette, highlighted: false)
  }
}

private struct WeatherONMetricStrip: View {
  let location: WeatherONLocationSnapshot
  let palette: WeatherONWidgetPalette

  var body: some View {
    HStack(spacing: 5) {
      WeatherONMetric(symbol: "drop.fill", value: "\(location.rainProbabilityPct)%", palette: palette)
      WeatherONMetric(symbol: "humidity.fill", value: "\(location.humidityPct)%", palette: palette)
      WeatherONMetric(symbol: "wind", value: String(format: "%.1f", location.windMs), palette: palette)
    }
  }
}

private struct WeatherONMetric: View {
  let symbol: String
  let value: String
  let palette: WeatherONWidgetPalette

  var body: some View {
    HStack(spacing: 3) {
      Image(systemName: symbol).font(.system(size: 9, weight: .semibold))
      Text(value).font(.system(size: 8, weight: .bold, design: .rounded)).lineLimit(1)
    }
    .foregroundStyle(palette.secondaryText)
    .frame(maxWidth: .infinity)
  }
}

private struct WeatherONWeatherBackdrop: View {
  let condition: String
  let isNight: Bool
  let palette: WeatherONWidgetPalette
  let visualPhase: Int

  var body: some View {
    GeometryReader { proxy in
      ZStack {
        LinearGradient(colors: palette.backgroundColors, startPoint: .topLeading, endPoint: .bottomTrailing)

        Circle()
          .fill(palette.accent.opacity(0.16))
          .frame(width: proxy.size.width * 0.72)
          .blur(radius: 18)
          .offset(
            x: proxy.size.width * (visualPhase.isMultiple(of: 2) ? 0.38 : 0.30),
            y: -proxy.size.height * 0.34
          )

        weatherDecoration(size: proxy.size)
      }
      .clipped()
    }
  }

  @ViewBuilder
  private func weatherDecoration(size: CGSize) -> some View {
    switch condition {
    case "clear":
      Image(systemName: isNight ? "moon.stars.fill" : "sun.max.fill")
        .font(.system(size: min(size.width, size.height) * 0.48))
        .foregroundStyle(palette.accent.opacity(0.10))
        .offset(x: size.width * 0.30, y: -size.height * 0.22)
    case "rain", "storm":
      ZStack {
        Image(systemName: condition == "storm" ? "cloud.bolt.rain.fill" : "cloud.rain.fill")
          .font(.system(size: min(size.width, size.height) * 0.48))
          .foregroundStyle(palette.accent.opacity(0.11))
          .offset(x: size.width * 0.26, y: -size.height * 0.20)
        ForEach(0..<8, id: \.self) { index in
          Capsule()
            .fill(palette.rain.opacity(0.10))
            .frame(width: 2, height: 18)
            .rotationEffect(.degrees(18))
            .offset(
              x: -size.width * 0.48 + CGFloat(index) * size.width * 0.15 + CGFloat(visualPhase * 4),
              y: size.height * 0.32 + CGFloat((index + visualPhase).isMultiple(of: 2) ? 10 : -8)
            )
        }
      }
    case "snow":
      ForEach(0..<12, id: \.self) { index in
        Circle()
          .fill(Color.white.opacity(0.14))
          .frame(width: CGFloat(3 + index % 3), height: CGFloat(3 + index % 3))
          .offset(
            x: -size.width * 0.45 + CGFloat(index % 6) * size.width * 0.18,
            y: -size.height * 0.35 + CGFloat(index / 6) * size.height * 0.52 + CGFloat(visualPhase * 5)
          )
      }
    case "dust":
      ForEach(0..<9, id: \.self) { index in
        Circle()
          .fill(palette.accent.opacity(0.09))
          .frame(width: CGFloat(10 + index % 4 * 5), height: CGFloat(10 + index % 4 * 5))
          .offset(
            x: -size.width * 0.42 + CGFloat(index % 5) * size.width * 0.21,
            y: -size.height * 0.25 + CGFloat(index / 5) * size.height * 0.56
          )
      }
    default:
      Image(systemName: "cloud.fill")
        .font(.system(size: min(size.width, size.height) * 0.56))
        .foregroundStyle(palette.accent.opacity(0.09))
        .offset(x: size.width * 0.28, y: -size.height * 0.18)
    }
  }
}

private struct WeatherONWidgetPalette {
  let primaryText: Color
  let secondaryText: Color
  let accent: Color
  let rain: Color
  let cardBackground: Color
  let cardBorder: Color
  let highlightedCard: Color
  let backgroundColors: [Color]

  init(colorScheme: ColorScheme, condition: String, isNight: Bool) {
    let isDark = colorScheme == .dark
    primaryText = isDark ? .white : Color(red: 0.04, green: 0.10, blue: 0.18)
    secondaryText = isDark ? Color.white.opacity(0.70) : Color(red: 0.24, green: 0.32, blue: 0.41)
    rain = isDark ? Color(red: 0.38, green: 0.78, blue: 1.0) : Color(red: 0.05, green: 0.42, blue: 0.86)
    cardBackground = isDark ? Color.white.opacity(0.09) : Color.white.opacity(0.70)
    cardBorder = isDark ? Color.white.opacity(0.12) : Color.black.opacity(0.06)

    switch condition {
    case "clear":
      if isNight {
        accent = isDark ? Color(red: 0.70, green: 0.86, blue: 1.0) : Color(red: 0.27, green: 0.48, blue: 0.82)
        backgroundColors = isDark
          ? [Color(red: 0.02, green: 0.05, blue: 0.13), Color(red: 0.07, green: 0.14, blue: 0.29)]
          : [Color(red: 0.82, green: 0.89, blue: 0.98), Color(red: 0.66, green: 0.77, blue: 0.93)]
      } else {
        accent = isDark ? Color(red: 1.0, green: 0.74, blue: 0.25) : Color(red: 0.95, green: 0.48, blue: 0.05)
        backgroundColors = isDark
          ? [Color(red: 0.04, green: 0.08, blue: 0.16), Color(red: 0.10, green: 0.19, blue: 0.30)]
          : [Color(red: 0.98, green: 0.93, blue: 0.78), Color(red: 0.89, green: 0.96, blue: 1.0)]
      }
    case "rain", "storm":
      accent = rain
      backgroundColors = isDark
        ? [Color(red: 0.03, green: 0.09, blue: 0.16), Color(red: 0.07, green: 0.23, blue: 0.34)]
        : [Color(red: 0.82, green: 0.91, blue: 0.98), Color(red: 0.67, green: 0.80, blue: 0.91)]
    case "snow":
      accent = isDark ? Color(red: 0.60, green: 0.91, blue: 1.0) : Color(red: 0.12, green: 0.54, blue: 0.76)
      backgroundColors = isDark
        ? [Color(red: 0.06, green: 0.13, blue: 0.22), Color(red: 0.17, green: 0.28, blue: 0.39)]
        : [Color(red: 0.92, green: 0.97, blue: 1.0), Color(red: 0.80, green: 0.89, blue: 0.96)]
    case "dust":
      accent = isDark ? Color(red: 1.0, green: 0.72, blue: 0.32) : Color(red: 0.74, green: 0.39, blue: 0.08)
      backgroundColors = isDark
        ? [Color(red: 0.15, green: 0.11, blue: 0.07), Color(red: 0.28, green: 0.20, blue: 0.11)]
        : [Color(red: 0.97, green: 0.91, blue: 0.78), Color(red: 0.90, green: 0.83, blue: 0.70)]
    default:
      accent = isDark ? Color(red: 0.48, green: 0.77, blue: 1.0) : Color(red: 0.12, green: 0.42, blue: 0.75)
      backgroundColors = isDark
        ? [Color(red: 0.04, green: 0.10, blue: 0.18), Color(red: 0.08, green: 0.21, blue: 0.32)]
        : [Color(red: 0.91, green: 0.96, blue: 1.0), Color(red: 0.98, green: 0.99, blue: 1.0)]
    }

    highlightedCard = accent.opacity(isDark ? 0.16 : 0.12)
  }
}

private extension View {
  @ViewBuilder
  func weatherONWidgetBackground(
    condition: String,
    isNight: Bool,
    palette: WeatherONWidgetPalette,
    visualPhase: Int
  ) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      containerBackground(for: .widget) {
        WeatherONWeatherBackdrop(condition: condition, isNight: isNight, palette: palette, visualPhase: visualPhase)
      }
    } else {
      background(WeatherONWeatherBackdrop(condition: condition, isNight: isNight, palette: palette, visualPhase: visualPhase))
    }
  }

  func weatherONCard(palette: WeatherONWidgetPalette, highlighted: Bool) -> some View {
    background(
      highlighted ? palette.highlightedCard : palette.cardBackground,
      in: RoundedRectangle(cornerRadius: 11, style: .continuous)
    )
    .overlay {
      RoundedRectangle(cornerRadius: 11, style: .continuous)
        .stroke(palette.cardBorder, lineWidth: 0.5)
    }
  }
}

private func weatherSymbol(_ condition: String, isNight: Bool = false) -> String {
  switch condition {
  case "clear": return isNight ? "moon.stars.fill" : "sun.max.fill"
  case "cloud": return "cloud.fill"
  case "rain": return "cloud.rain.fill"
  case "snow": return "cloud.snow.fill"
  case "storm": return "cloud.bolt.rain.fill"
  case "dust": return "aqi.medium"
  default: return "cloud.sun.fill"
  }
}

private func transportSymbol(_ mode: String?) -> String {
  switch mode {
  case "walk": return "figure.walk"
  case "transit": return "tram.fill"
  case "drive", "auto": return "car.fill"
  default: return "clock.fill"
  }
}

private func outfitSymbol(_ variant: String) -> String {
  switch variant {
  case "rain": return "umbrella.fill"
  case "cold": return "scarf.fill"
  case "heat": return "sun.max.fill"
  case "formal": return "person.crop.square.fill"
  default: return "tshirt.fill"
  }
}

private func outfitItemSymbol(_ category: String) -> String {
  switch category {
  case "outer": return "jacket.fill"
  case "bottom": return "figure.stand.dress.line.vertical.figure"
  case "shoes": return "shoe.2.fill"
  default: return "tshirt.fill"
  }
}

private func compactHour(_ value: String) -> String {
  if value.range(of: #"^\d{2}:\d{2}$"#, options: .regularExpression) != nil {
    return value
  }
  if let date = snapshotDateFormatter.date(from: value) ?? fallbackSnapshotDateFormatter.date(from: value) {
    let formatter = DateFormatter()
    formatter.dateFormat = "HH시"
    return formatter.string(from: date)
  }
  return String(value.suffix(5))
}

private extension WeatherONLocationSnapshot {
  static let currentPlaceholder = WeatherONLocationSnapshot(
    id: "current-placeholder",
    kind: "current",
    locationName: "서울",
    latitude: 37.5665,
    longitude: 126.9780,
    timeZone: "Asia/Seoul",
    temperatureC: 24,
    feelsLikeC: 25,
    condition: "clear",
    conditionLabel: "맑음",
    rainProbabilityPct: 10,
    humidityPct: 48,
    windMs: 2.4,
    umbrellaNeeded: false,
    outerNeeded: false,
    maskNeeded: false,
    outfitSummary: "반팔 티셔츠 · 슬랙스 · 스니커즈",
    outfitItems: [
      WeatherONOutfitItem(category: "top", name: "반팔 티셔츠"),
      WeatherONOutfitItem(category: "bottom", name: "슬랙스"),
      WeatherONOutfitItem(category: "shoes", name: "스니커즈"),
    ],
    outfitVariant: "default",
    observedAt: Date().ISO8601Format(),
    hourly: [
      WeatherONHourlySnapshot(time: "10:00", temperatureC: 24, condition: "clear", rainProbabilityPct: 10),
      WeatherONHourlySnapshot(time: "11:00", temperatureC: 25, condition: "clear", rainProbabilityPct: 10),
      WeatherONHourlySnapshot(time: "12:00", temperatureC: 26, condition: "cloud", rainProbabilityPct: 20),
      WeatherONHourlySnapshot(time: "13:00", temperatureC: 27, condition: "cloud", rainProbabilityPct: 20),
      WeatherONHourlySnapshot(time: "14:00", temperatureC: 27, condition: "clear", rainProbabilityPct: 10),
    ],
    departureTime: nil,
    arrivalTime: nil,
    travelMinutes: nil,
    transportMode: nil,
    deepLink: "weatheron://home"
  )

  static let destinationPlaceholder = WeatherONLocationSnapshot(
    id: "destination-placeholder",
    kind: "destination",
    locationName: "서울역",
    latitude: 37.5547,
    longitude: 126.9706,
    timeZone: "Asia/Seoul",
    temperatureC: 22,
    feelsLikeC: 21,
    condition: "rain",
    conditionLabel: "비",
    rainProbabilityPct: 70,
    humidityPct: 76,
    windMs: 4.1,
    umbrellaNeeded: true,
    outerNeeded: true,
    maskNeeded: false,
    outfitSummary: "경량 재킷 · 셔츠 · 데님 팬츠",
    outfitItems: [
      WeatherONOutfitItem(category: "outer", name: "경량 재킷"),
      WeatherONOutfitItem(category: "top", name: "셔츠"),
      WeatherONOutfitItem(category: "bottom", name: "데님 팬츠"),
      WeatherONOutfitItem(category: "shoes", name: "방수 스니커즈"),
    ],
    outfitVariant: "rain",
    observedAt: Date().ISO8601Format(),
    hourly: [
      WeatherONHourlySnapshot(time: "17:00", temperatureC: 22, condition: "rain", rainProbabilityPct: 70),
      WeatherONHourlySnapshot(time: "18:00", temperatureC: 21, condition: "rain", rainProbabilityPct: 80),
      WeatherONHourlySnapshot(time: "19:00", temperatureC: 20, condition: "cloud", rainProbabilityPct: 40),
      WeatherONHourlySnapshot(time: "20:00", temperatureC: 19, condition: "cloud", rainProbabilityPct: 30),
      WeatherONHourlySnapshot(time: "21:00", temperatureC: 18, condition: "cloud", rainProbabilityPct: 20),
    ],
    departureTime: "17:40",
    arrivalTime: "18:30",
    travelMinutes: 40,
    transportMode: "transit",
    deepLink: "weatheron://destination?id=destination-placeholder"
  )
}

private extension WeatherONWidgetStore {
  static let placeholder = WeatherONWidgetStore(
    schemaVersion: 2,
    updatedAt: Date().ISO8601Format(),
    selectedDestinationId: WeatherONLocationSnapshot.destinationPlaceholder.id,
    current: .currentPlaceholder,
    destinations: [.destinationPlaceholder]
  )

  static func legacy(_ legacy: WeatherONLegacySnapshot) -> WeatherONWidgetStore {
    let current = WeatherONLocationSnapshot(
      id: "legacy-current",
      kind: "current",
      locationName: legacy.locationName,
      temperatureC: legacy.temperatureC,
      feelsLikeC: legacy.temperatureC,
      condition: legacy.condition,
      conditionLabel: legacy.conditionLabel,
      rainProbabilityPct: legacy.advice.contains("우산 O") ? 60 : 0,
      humidityPct: 0,
      windMs: 0,
      umbrellaNeeded: legacy.advice.contains("우산 O"),
      outerNeeded: legacy.advice.contains("외투 O"),
      maskNeeded: legacy.advice.contains("마스크 O"),
      outfitSummary: "WeatherON에서 코디를 업데이트해요",
      outfitItems: [],
      outfitVariant: "default",
      observedAt: legacy.observedAt,
      hourly: [],
      departureTime: nil,
      arrivalTime: nil,
      travelMinutes: nil,
      transportMode: nil,
      deepLink: "weatheron://home"
    )
    return WeatherONWidgetStore(
      schemaVersion: 2,
      updatedAt: legacy.observedAt,
      selectedDestinationId: nil,
      current: current,
      destinations: []
    )
  }
}

struct WeatherONConfigurableWidget: Widget {
  let kind = "WeatherONLocationWidgetV4"

  var body: some WidgetConfiguration {
    AppIntentConfiguration(
      kind: kind,
      intent: WeatherONWidgetConfigurationIntent.self,
      provider: WeatherONIntentProvider()
    ) { entry in
      WeatherONWidgetView(entry: entry)
    }
    .configurationDisplayName("WeatherON")
    .description("현재 위치 또는 저장한 목적지를 선택해 날씨와 외출 준비 정보를 확인해요.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    .contentMarginsDisabled()
    .containerBackgroundRemovable(false)
  }
}

@main
struct WeatherONWidgetBundle: WidgetBundle {
  var body: some Widget {
    WeatherONConfigurableWidget()
    WeatherONDepartureLiveActivity()
  }
}

#if DEBUG
private struct WeatherONWidgetViewPreviews: PreviewProvider {
  static var previews: some View {
    Group {
      WeatherONWidgetView(entry: .placeholder)
        .previewContext(WidgetPreviewContext(family: .systemSmall))
        .preferredColorScheme(.light)
        .previewDisplayName("현재 위치 · 소형 · 라이트")

      WeatherONWidgetView(
        entry: WeatherONEntry(date: Date(), location: .destinationPlaceholder, hasSharedSnapshot: true, visualPhase: 1)
      )
      .previewContext(WidgetPreviewContext(family: .systemMedium))
      .preferredColorScheme(.dark)
      .previewDisplayName("목적지 · 중형 · 다크")

      WeatherONWidgetView(
        entry: WeatherONEntry(date: Date(), location: .destinationPlaceholder, hasSharedSnapshot: true, visualPhase: 2)
      )
      .previewContext(WidgetPreviewContext(family: .systemLarge))
      .preferredColorScheme(.light)
      .previewDisplayName("목적지 · 대형 · 라이트")
    }
  }
}
#endif
