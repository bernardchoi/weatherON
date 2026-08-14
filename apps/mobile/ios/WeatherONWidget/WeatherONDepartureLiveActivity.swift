import ActivityKit
import SwiftUI
import WidgetKit

private let departureNavy = Color(red: 7 / 255, green: 30 / 255, blue: 51 / 255)
private let departureCard = Color(red: 16 / 255, green: 61 / 255, blue: 95 / 255)
private let departureGold = Color(red: 242 / 255, green: 169 / 255, blue: 46 / 255)
private let departureSky = Color(red: 81 / 255, green: 172 / 255, blue: 230 / 255)

struct WeatherONDepartureLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: WeatherONDepartureActivityAttributes.self) { context in
      WeatherONDepartureLockScreenView(context: context)
        .widgetURL(URL(string: context.attributes.deepLink))
        .activityBackgroundTint(departureNavy)
        .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Label("출발", systemImage: "figure.walk.departure")
            .font(.caption.bold())
            .foregroundStyle(departureGold)
        }
        DynamicIslandExpandedRegion(.trailing) {
          WeatherONDepartureCountdown(departureAt: context.attributes.departureAt, compact: true)
        }
        DynamicIslandExpandedRegion(.center) {
          Text(context.attributes.destinationName)
            .font(.headline)
            .lineLimit(1)
        }
        DynamicIslandExpandedRegion(.bottom) {
          HStack(spacing: 8) {
            Image(systemName: "cloud.rain.fill")
              .foregroundStyle(departureSky)
            Text(context.state.guidance)
              .font(.caption)
              .lineLimit(2)
            Spacer(minLength: 0)
            Text(context.attributes.departureTimeLabel)
              .font(.caption.bold())
              .foregroundStyle(departureGold)
          }
          .accessibilityElement(children: .combine)
          .accessibilityLabel("날씨 안내, \(context.state.guidance), 권장 출발 시각 \(context.attributes.departureTimeLabel)")
        }
      } compactLeading: {
        Image(systemName: "figure.walk.departure")
          .foregroundStyle(departureGold)
          .accessibilityLabel("출발 카운트다운")
      } compactTrailing: {
        WeatherONDepartureCountdown(departureAt: context.attributes.departureAt, compact: true)
      } minimal: {
        Image(systemName: "timer")
          .foregroundStyle(departureGold)
          .accessibilityLabel("출발 카운트다운")
      }
      .widgetURL(URL(string: context.attributes.deepLink))
      .keylineTint(departureGold)
    }
  }
}

private struct WeatherONDepartureLockScreenView: View {
  let context: ActivityViewContext<WeatherONDepartureActivityAttributes>

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .firstTextBaseline, spacing: 10) {
        VStack(alignment: .leading, spacing: 3) {
          Text("WEATHERON · 출발 카운트다운")
            .font(.caption2.bold())
            .foregroundStyle(departureSky)
          Text(context.attributes.destinationName)
            .font(.title3.bold())
            .foregroundStyle(.white)
            .lineLimit(1)
        }
        Spacer(minLength: 8)
        WeatherONDepartureCountdown(departureAt: context.attributes.departureAt, compact: false)
      }

      HStack(spacing: 12) {
        Label(context.attributes.departureTimeLabel, systemImage: "clock.fill")
          .font(.subheadline.bold())
          .foregroundStyle(departureGold)
        Rectangle()
          .fill(Color.white.opacity(0.18))
          .frame(width: 1, height: 18)
        Label(context.state.guidance, systemImage: "cloud.rain.fill")
          .font(.caption)
          .foregroundStyle(.white.opacity(0.88))
          .lineLimit(2)
      }
    }
    .padding(16)
    .background(departureCard.opacity(0.34))
    .accessibilityElement(children: .combine)
    .accessibilityLabel(
      "\(context.attributes.destinationName), 권장 출발 시각 \(context.attributes.departureTimeLabel), \(context.state.guidance)"
    )
  }
}

private struct WeatherONDepartureCountdown: View {
  let departureAt: Date
  let compact: Bool

  var body: some View {
    Text(
      timerInterval: Date()...max(Date(), departureAt),
      countsDown: true,
      showsHours: !compact
    )
      .font(compact ? .system(size: 11, weight: .bold, design: .monospaced) : .title2.monospacedDigit().bold())
      .foregroundStyle(departureGold)
      .lineLimit(1)
      .minimumScaleFactor(0.72)
      .frame(maxWidth: compact ? 46 : nil, alignment: .trailing)
      .accessibilityLabel("출발까지 남은 시간")
  }
}

#if DEBUG
private struct WeatherONDepartureLiveActivityPreviews: PreviewProvider {
  static let attributes = WeatherONDepartureActivityAttributes(
    destinationId: "preview-seongsu",
    destinationName: "서울역",
    departureAt: Date().addingTimeInterval(27 * 60),
    departureTimeLabel: "18:20",
    deepLink: "weatheron://destination?id=preview-seongsu"
  )
  static let state = WeatherONDepartureActivityAttributes.ContentState(
    guidance: "비 대비 우산 필요 · 강풍 위험 낮음",
    isCompleted: false
  )

  static var previews: some View {
    attributes
      .previewContext(state, viewKind: .content)
      .previewDisplayName("잠금 화면")
    attributes
      .previewContext(state, viewKind: .dynamicIsland(.expanded))
      .previewDisplayName("다이내믹 아일랜드")
  }
}
#endif
