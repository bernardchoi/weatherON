import SwiftUI
import WidgetKit

private let appGroupIdentifier = "group.com.weatheron.mobile"
private let snapshotKey = "weatheron.widget.snapshot.v1"
private let homeDeepLink = URL(string: "weatheron://home")!

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
  let entry: WeatherONEntry

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      HStack(spacing: 5) {
        Image(systemName: "location.fill")
          .font(.caption2)
        Text(entry.snapshot.locationName)
          .font(.caption.weight(.semibold))
          .lineLimit(1)
      }
      .foregroundStyle(.secondary)

      HStack(alignment: .firstTextBaseline, spacing: 7) {
        Text("\(entry.snapshot.temperatureC)°")
          .font(.system(size: 38, weight: .bold, design: .rounded))
          .minimumScaleFactor(0.8)
        Label(entry.snapshot.conditionLabel, systemImage: conditionSymbol)
          .font(.caption.weight(.semibold))
          .lineLimit(1)
      }
      .foregroundStyle(Color.primary)

      Spacer(minLength: 0)

      Text(entry.hasSharedSnapshot ? entry.snapshot.advice : "WeatherON에서 업데이트")
        .font(.system(size: 11, weight: .semibold))
        .foregroundStyle(Color.primary.opacity(0.86))
        .lineLimit(1)
        .minimumScaleFactor(0.72)
    }
    .padding(14)
    .widgetURL(homeDeepLink)
    .weatherONWidgetBackground()
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

private extension View {
  @ViewBuilder
  func weatherONWidgetBackground() -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      containerBackground(for: .widget) {
        LinearGradient(
          colors: [Color(red: 0.93, green: 0.97, blue: 1.0), Color.white],
          startPoint: .topLeading,
          endPoint: .bottomTrailing
        )
      }
    } else {
      background(
        LinearGradient(
          colors: [Color(red: 0.93, green: 0.97, blue: 1.0), Color.white],
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
