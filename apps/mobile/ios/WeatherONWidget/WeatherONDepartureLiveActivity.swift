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
          WeatherONDepartureCountdown(
            departureAt: context.attributes.departureAt,
            isStale: context.isStale,
            isCompleted: context.state.isCompleted,
            style: .expanded
          )
        }
        DynamicIslandExpandedRegion(.bottom) {
          WeatherONDepartureExpandedSummary(
            destinationName: context.attributes.destinationName,
            guidance: context.isStale ? weatherONDepartureLocalized("출발 정보가 만료됐어요") : weatherONDepartureGuidance(kind: context.state.guidanceKind, fallback: context.state.guidance),
            guidanceSymbol: context.isStale ? "exclamationmark.clock.fill" : context.state.guidanceSymbol,
            departureTimeLabel: context.state.departureTimeLabel ?? context.attributes.departureTimeLabel
          )
          .accessibilityElement(children: .combine)
          .accessibilityLabel(String(format: weatherONDepartureLocalized("activity.accessibility.summary"), context.state.guidance, context.state.departureTimeLabel ?? context.attributes.departureTimeLabel))
        }
      } compactLeading: {
        WeatherONDepartureGuidanceIcon(
          symbol: context.isStale ? "exclamationmark.clock.fill" : context.state.guidanceSymbol
        )
      } compactTrailing: {
        WeatherONDepartureCountdown(
          departureAt: context.attributes.departureAt,
          isStale: context.isStale,
          isCompleted: context.state.isCompleted,
          style: .compact
        )
      } minimal: {
        WeatherONDepartureGuidanceIcon(
          symbol: context.isStale ? "exclamationmark.clock.fill" : context.state.guidanceSymbol
        )
      }
      .widgetURL(URL(string: context.attributes.deepLink))
      .keylineTint(departureGold)
    }
  }
}

private struct WeatherONDepartureExpandedLabel: View {
  var body: some View {
    Label("출발까지", systemImage: "clock.fill")
      .font(.caption2.weight(.semibold))
      .foregroundStyle(departureGold)
      .lineLimit(1)
      .fixedSize(horizontal: true, vertical: false)
  }
}

private struct WeatherONDepartureExpandedSummary: View {
  let destinationName: String
  let guidance: String
  let guidanceSymbol: String?
  let departureTimeLabel: String

  var body: some View {
    VStack(alignment: .leading, spacing: 7) {
      Text(destinationName)
        .font(.headline.weight(.semibold))
        .foregroundStyle(.white)
        .lineLimit(1)
        .minimumScaleFactor(0.78)

      HStack(spacing: 10) {
        Label(guidance, systemImage: guidanceSymbol ?? "figure.walk.departure")
          .font(.caption.weight(.medium))
          .foregroundStyle(departureSky)
          .lineLimit(1)
          .minimumScaleFactor(0.72)
          .layoutPriority(1)

        Spacer(minLength: 6)

        Label(departureTimeLabel, systemImage: "clock.fill")
          .font(.subheadline.weight(.semibold).monospacedDigit())
          .foregroundStyle(departureGold)
          .lineLimit(1)
          .fixedSize(horizontal: true, vertical: false)
      }
    }
  }
}

private struct WeatherONDepartureGuidanceIcon: View {
  let symbol: String?

  var body: some View {
    Image(systemName: symbol ?? "figure.walk.departure")
      .foregroundStyle(departureGold)
      .accessibilityLabel("출발 날씨 안내")
  }
}

private struct WeatherONDepartureLockScreenView: View {
  let context: ActivityViewContext<WeatherONDepartureActivityAttributes>

  private var displayedGuidance: String {
    context.isStale ? weatherONDepartureLocalized("출발 정보가 만료됐어요") : weatherONDepartureGuidance(kind: context.state.guidanceKind, fallback: context.state.guidance)
  }

  private var displayedGuidanceSymbol: String {
    context.isStale ? "exclamationmark.clock.fill" : context.state.guidanceSymbol ?? "figure.walk.departure"
  }

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
            .minimumScaleFactor(0.68)
            .allowsTightening(true)
        }
        Spacer(minLength: 8)
        WeatherONDepartureCountdown(
          departureAt: context.attributes.departureAt,
          isStale: context.isStale,
          isCompleted: context.state.isCompleted,
          style: .lockScreen
        )
      }

      HStack(spacing: 12) {
        Label(context.state.departureTimeLabel ?? context.attributes.departureTimeLabel, systemImage: "clock.fill")
          .font(.subheadline.bold())
          .foregroundStyle(departureGold)
        Rectangle()
          .fill(Color.white.opacity(0.18))
          .frame(width: 1, height: 18)
        Label(
          displayedGuidance,
          systemImage: displayedGuidanceSymbol
        )
          .font(.caption)
          .foregroundStyle(.white.opacity(0.88))
          .lineLimit(2)
      }
    }
    .padding(16)
    .background(departureCard.opacity(0.34))
    .accessibilityElement(children: .combine)
    .accessibilityLabel(
      String(format: weatherONDepartureLocalized("activity.accessibility.lock"), context.attributes.destinationName, context.isStale ? weatherONDepartureLocalized("출발 정보 만료") : weatherONDepartureLocalized("출발까지 남은 시간"), context.state.departureTimeLabel ?? context.attributes.departureTimeLabel, displayedGuidance)
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
  let isStale: Bool
  let isCompleted: Bool
  let style: Style

  private var showsHours: Bool {
    style == .lockScreen
  }

  var body: some View {
    Group {
      if isCompleted {
        statusText(compact: "출발", regular: "출발 시각")
      } else if isStale {
        statusText(compact: "지남", regular: "출발 시각 지남")
      } else {
        Text(
          timerInterval: Date()...max(Date(), departureAt),
          countsDown: true,
          showsHours: showsHours
        )
      }
    }
      .font(countdownFont)
      .foregroundStyle(departureGold)
      .lineLimit(1)
      .minimumScaleFactor(0.7)
      .frame(maxWidth: maximumWidth, alignment: .trailing)
      .accessibilityLabel(
        isCompleted ? "출발 시각 도달" : isStale ? "출발 시각 지남, 정보 만료" : "출발까지 남은 시간"
      )
  }

  private func statusText(compact: String, regular: String) -> Text {
    Text(LocalizedStringKey(style == .compact ? compact : regular))
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

private func weatherONDepartureLocalized(_ key: String) -> String {
  NSLocalizedString(key, bundle: .main, value: key, comment: "")
}

private func weatherONDepartureGuidance(kind: String?, fallback: String) -> String {
  guard let kind else { return fallback }
  let key = "guidance.\(kind)"
  let localized = weatherONDepartureLocalized(key)
  return localized == key ? fallback : localized
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
    guidance: "우산 챙겨요",
    guidanceSymbol: "umbrella.fill",
    isCompleted: false,
    phase: "upcoming"
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
