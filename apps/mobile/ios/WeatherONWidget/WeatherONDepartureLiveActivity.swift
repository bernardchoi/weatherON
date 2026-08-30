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
          WeatherONDepartureExpandedLabel()
        }
        DynamicIslandExpandedRegion(.trailing) {
          WeatherONDepartureCountdown(departureAt: context.attributes.departureAt, style: .expanded)
        }
        DynamicIslandExpandedRegion(.center) {
          Text(context.attributes.destinationName)
            .font(.headline.weight(.semibold))
            .foregroundStyle(.white)
            .lineLimit(1)
            .minimumScaleFactor(0.78)
            .layoutPriority(1)
        }
        DynamicIslandExpandedRegion(.bottom) {
          WeatherONDepartureExpandedSummary(
            guidance: context.state.guidance,
            departureTimeLabel: context.attributes.departureTimeLabel
          )
          .accessibilityElement(children: .combine)
          .accessibilityLabel("날씨 안내, \(context.state.guidance), 권장 출발 시각 \(context.attributes.departureTimeLabel)")
        }
      } compactLeading: {
        Image(systemName: "location.north.fill")
          .foregroundStyle(departureGold)
          .accessibilityLabel("출발 안내")
      } compactTrailing: {
        WeatherONDepartureCountdown(departureAt: context.attributes.departureAt, style: .compact)
      } minimal: {
        Image(systemName: "location.north.fill")
          .foregroundStyle(departureGold)
          .accessibilityLabel("출발 안내")
      }
      .widgetURL(URL(string: context.attributes.deepLink))
      .keylineTint(departureGold)
    }
  }
}

private struct WeatherONDepartureExpandedLabel: View {
  var body: some View {
    Label("출발까지", systemImage: "location.north.fill")
      .font(.caption2.weight(.semibold))
      .foregroundStyle(departureGold)
      .lineLimit(1)
      .fixedSize(horizontal: true, vertical: false)
  }
}

private struct WeatherONDepartureExpandedSummary: View {
  let guidance: String
  let departureTimeLabel: String

  var body: some View {
    HStack(alignment: .center, spacing: 10) {
      Label {
        Text(guidance)
          .lineLimit(1)
          .minimumScaleFactor(0.72)
      } icon: {
        Image(systemName: "cloud.rain.fill")
          .foregroundStyle(departureSky)
      }
      .font(.caption.weight(.medium))
      .foregroundStyle(.white.opacity(0.9))
      .layoutPriority(1)

      Rectangle()
        .fill(Color.white.opacity(0.18))
        .frame(width: 1, height: 26)

      VStack(alignment: .trailing, spacing: 1) {
        Text("출발 시각")
          .font(.caption2)
          .foregroundStyle(.white.opacity(0.62))
        Text(departureTimeLabel)
          .font(.subheadline.weight(.semibold).monospacedDigit())
          .foregroundStyle(departureGold)
          .lineLimit(1)
      }
      .fixedSize(horizontal: true, vertical: false)
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
        WeatherONDepartureCountdown(departureAt: context.attributes.departureAt, style: .lockScreen)
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
  enum Style {
    case compact
    case expanded
    case lockScreen
  }

  let departureAt: Date
  let style: Style

  private var showsHours: Bool {
    style == .lockScreen
  }

  var body: some View {
    Text(
      timerInterval: Date()...max(Date(), departureAt),
      countsDown: true,
      showsHours: showsHours
    )
      .font(countdownFont)
      .foregroundStyle(departureGold)
      .lineLimit(1)
      .minimumScaleFactor(0.7)
      .frame(maxWidth: maximumWidth, alignment: .trailing)
      .accessibilityLabel("출발까지 남은 시간")
  }

  private var countdownFont: Font {
    switch style {
    case .compact:
      return .caption2.weight(.bold).monospacedDigit()
    case .expanded:
      return .title3.weight(.semibold).monospacedDigit()
    case .lockScreen:
      return .title2.weight(.bold).monospacedDigit()
    }
  }

  private var maximumWidth: CGFloat? {
    switch style {
    case .compact:
      return 46
    case .expanded:
      return 68
    case .lockScreen:
      return nil
    }
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
    attributes
      .previewContext(state, viewKind: .dynamicIsland(.compact))
      .previewDisplayName("다이내믹 아일랜드 · 축소")
    attributes
      .previewContext(state, viewKind: .dynamicIsland(.minimal))
      .previewDisplayName("다이내믹 아일랜드 · 최소")
  }
}
#endif
