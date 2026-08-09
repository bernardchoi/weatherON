import SwiftUI
import WidgetKit

private let appGroupIdentifier = "group.com.weatheron.mobile"
private let snapshotKey = "weatheron.widget.snapshot.v1"
private let homeDeepLink = URL(string: "weatheron://home")!
private let snapshotDateFormatter: ISO8601DateFormatter = {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return formatter
}()

private struct WeatherONSnapshot: Codable {
  let schemaVersion: Int
  let locationName: String
  let temperatureC: Int
  let condition: String
  let conditionLabel: String
  let advice: String
  let observedAt: String
}

private struct WeatherONEntry: TimelineEntry {
  let date: Date
  let snapshot: WeatherONSnapshot
  let hasSharedSnapshot: Bool
}

private struct WeatherONProvider: TimelineProvider {
  func placeholder(in context: Context) -> WeatherONEntry {
    WeatherONEntry(date: Date(), snapshot: .placeholder, hasSharedSnapshot: true)
  }

  func getSnapshot(in context: Context, completion: @escaping (WeatherONEntry) -> Void) {
    completion(loadEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WeatherONEntry>) -> Void) {
    let entry = loadEntry()
    let nextSuggestedRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date().addingTimeInterval(3_600)
    completion(Timeline(entries: [entry], policy: .after(nextSuggestedRefresh)))
  }

  private func loadEntry() -> WeatherONEntry {
    guard
      let defaults = UserDefaults(suiteName: appGroupIdentifier),
      let json = defaults.string(forKey: snapshotKey),
      let data = json.data(using: .utf8),
      let snapshot = try? JSONDecoder().decode(WeatherONSnapshot.self, from: data)
    else {
      return WeatherONEntry(date: Date(), snapshot: .empty, hasSharedSnapshot: false)
    }

    return WeatherONEntry(date: Date(), snapshot: snapshot, hasSharedSnapshot: true)
  }
}

private struct WeatherONWidgetView: View {
  @Environment(\.colorScheme) private var colorScheme

  let entry: WeatherONEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(spacing: 4) {
        Image(systemName: "location.fill")
          .font(.system(size: 10, weight: .bold))

        Text(entry.snapshot.locationName)
          .font(.system(size: 12, weight: .bold, design: .rounded))
          .lineLimit(1)

        Spacer(minLength: 4)

        Text(entry.hasSharedSnapshot ? updateLabel : "업데이트 필요")
          .font(.system(size: 9, weight: .semibold, design: .rounded))
          .lineLimit(1)
      }
      .foregroundStyle(palette.secondaryText)

      HStack(alignment: .center, spacing: 8) {
        Text("\(entry.snapshot.temperatureC)°")
          .font(.system(size: 42, weight: .bold, design: .rounded))
          .tracking(-2)
          .minimumScaleFactor(0.72)

        VStack(alignment: .leading, spacing: 2) {
          Text(entry.snapshot.conditionLabel)
            .font(.system(size: 13, weight: .bold, design: .rounded))
            .lineLimit(1)

          Text(entry.hasSharedSnapshot ? "현재 날씨" : "앱을 열어주세요")
            .font(.system(size: 9, weight: .medium, design: .rounded))
            .foregroundStyle(palette.secondaryText)
            .lineLimit(1)
        }

        Spacer(minLength: 0)

        ZStack {
          Circle()
            .fill(palette.accent.opacity(colorScheme == .dark ? 0.20 : 0.14))
          Image(systemName: conditionSymbol)
            .font(.system(size: 22, weight: .semibold))
            .symbolRenderingMode(.monochrome)
            .foregroundStyle(palette.accent)
        }
        .frame(width: 42, height: 42)
      }
      .foregroundStyle(palette.primaryText)
      .padding(.top, 7)

      Spacer(minLength: 0)

      HStack(spacing: 5) {
        ForEach(preparationItems) { item in
          WeatherONPreparationTile(item: item, palette: palette)
        }
      }
    }
    .padding(14)
    .widgetURL(homeDeepLink)
    .weatherONWidgetBackground(palette: palette)
  }

  private var palette: WeatherONWidgetPalette {
    WeatherONWidgetPalette(colorScheme: colorScheme, condition: entry.snapshot.condition)
  }

  private var preparationItems: [WeatherONPreparationItem] {
    [
      WeatherONPreparationItem(id: "umbrella", title: "우산", symbol: "umbrella.fill", isNeeded: entry.snapshot.advice.contains("우산 O")),
      WeatherONPreparationItem(id: "outer", title: "외투", symbol: "tshirt.fill", isNeeded: entry.snapshot.advice.contains("외투 O")),
      WeatherONPreparationItem(id: "mask", title: "마스크", symbol: "facemask.fill", isNeeded: entry.snapshot.advice.contains("마스크 O")),
    ]
  }

  private var updateLabel: String {
    guard
      let observedAt = snapshotDateFormatter.date(from: entry.snapshot.observedAt),
      observedAt <= entry.date
    else {
      return "최근 업데이트"
    }

    let minutes = max(0, Int(entry.date.timeIntervalSince(observedAt) / 60))
    if minutes < 1 { return "방금 전" }
    if minutes < 60 { return "\(minutes)분 전" }
    return "최근 업데이트"
  }

  private var conditionSymbol: String {
    switch entry.snapshot.condition {
    case "clear": return "sun.max.fill"
    case "cloud": return "cloud.fill"
    case "rain": return "cloud.rain.fill"
    case "snow": return "cloud.snow.fill"
    case "storm": return "cloud.bolt.rain.fill"
    case "dust": return "aqi.medium"
    default: return "cloud.sun.fill"
    }
  }
}

private struct WeatherONPreparationItem: Identifiable {
  let id: String
  let title: String
  let symbol: String
  let isNeeded: Bool
}

private struct WeatherONPreparationTile: View {
  let item: WeatherONPreparationItem
  let palette: WeatherONWidgetPalette

  var body: some View {
    VStack(spacing: 3) {
      Image(systemName: item.symbol)
        .font(.system(size: 12, weight: .semibold))
      Text("\(item.title) \(item.isNeeded ? "O" : "X")")
        .font(.system(size: 9, weight: .bold, design: .rounded))
        .lineLimit(1)
        .minimumScaleFactor(0.8)
    }
    .foregroundStyle(item.isNeeded ? palette.accent : palette.secondaryText)
    .frame(maxWidth: .infinity)
    .frame(height: 37)
    .background(palette.tileBackground, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
    .overlay {
      RoundedRectangle(cornerRadius: 10, style: .continuous)
        .stroke(palette.tileBorder, lineWidth: 0.5)
    }
    .accessibilityElement(children: .ignore)
    .accessibilityLabel("\(item.title), \(item.isNeeded ? "필요" : "불필요")")
  }
}

private struct WeatherONWidgetPalette {
  let primaryText: Color
  let secondaryText: Color
  let accent: Color
  let tileBackground: Color
  let tileBorder: Color
  let backgroundStart: Color
  let backgroundEnd: Color

  init(colorScheme: ColorScheme, condition: String) {
    let isDark = colorScheme == .dark
    primaryText = isDark ? .white : Color(red: 0.05, green: 0.12, blue: 0.22)
    secondaryText = isDark ? Color.white.opacity(0.68) : Color(red: 0.26, green: 0.34, blue: 0.44)
    tileBackground = isDark ? Color.white.opacity(0.09) : Color.white.opacity(0.72)
    tileBorder = isDark ? Color.white.opacity(0.12) : Color(red: 0.08, green: 0.25, blue: 0.42).opacity(0.08)
    backgroundStart = isDark
      ? Color(red: 0.035, green: 0.10, blue: 0.18)
      : Color(red: 0.91, green: 0.96, blue: 1.0)
    backgroundEnd = isDark
      ? Color(red: 0.05, green: 0.20, blue: 0.32)
      : Color(red: 0.98, green: 0.99, blue: 1.0)

    switch condition {
    case "clear": accent = isDark ? Color(red: 1.0, green: 0.72, blue: 0.24) : Color(red: 0.95, green: 0.48, blue: 0.06)
    case "rain", "storm": accent = isDark ? Color(red: 0.35, green: 0.75, blue: 1.0) : Color(red: 0.08, green: 0.43, blue: 0.86)
    case "snow": accent = isDark ? Color(red: 0.55, green: 0.90, blue: 1.0) : Color(red: 0.12, green: 0.55, blue: 0.78)
    case "dust": accent = isDark ? Color(red: 1.0, green: 0.72, blue: 0.32) : Color(red: 0.78, green: 0.40, blue: 0.08)
    default: accent = isDark ? Color(red: 0.48, green: 0.76, blue: 1.0) : Color(red: 0.12, green: 0.43, blue: 0.76)
    }
  }
}

private extension View {
  @ViewBuilder
  func weatherONWidgetBackground(palette: WeatherONWidgetPalette) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      containerBackground(for: .widget) {
        LinearGradient(
          colors: [palette.backgroundStart, palette.backgroundEnd],
          startPoint: .topLeading,
          endPoint: .bottomTrailing
        )
      }
    } else {
      background(
        LinearGradient(
          colors: [palette.backgroundStart, palette.backgroundEnd],
          startPoint: .topLeading,
          endPoint: .bottomTrailing
        )
      )
    }
  }
}

private extension WeatherONSnapshot {
  static let placeholder = WeatherONSnapshot(
    schemaVersion: 1,
    locationName: "서울",
    temperatureC: 24,
    condition: "clear",
    conditionLabel: "맑음",
    advice: "우산 X · 외투 X · 마스크 X",
    observedAt: ""
  )

  static let empty = WeatherONSnapshot(
    schemaVersion: 1,
    locationName: "WeatherON",
    temperatureC: 0,
    condition: "cloud",
    conditionLabel: "업데이트 필요",
    advice: "WeatherON을 열어 최신 날씨를 받아요",
    observedAt: ""
  )
}

@main
struct WeatherONSmallWidget: Widget {
  let kind = "WeatherONSmallWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: WeatherONProvider()) { entry in
      WeatherONWidgetView(entry: entry)
    }
    .configurationDisplayName("WeatherON 현재 날씨")
    .description("현재 위치 날씨와 외출 준비 추천을 확인해요.")
    .supportedFamilies([.systemSmall])
  }
}
