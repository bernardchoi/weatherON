import ActivityKit
import ExpoModulesCore
import Foundation
import WidgetKit

private let appGroupIdentifier = "group.com.weatheron.mobile"
private let widgetSnapshotKey = "weatheron.widget.store.v2"
private let widgetSnapshotRelativePath = "Library/Application Support/WeatherONWidget/weatheron-widget-store-v2.json"
private let widgetKinds = ["WeatherONWeatherWidgetV2", "WeatherONLocationWidgetV3"]

private struct DepartureActivityPayload: Decodable {
  let destinationId: String
  let destinationName: String
  let departureAt: String
  let departureTimeLabel: String
  let guidance: String
  let deepLink: String
}

private enum DepartureActivityError: Error {
  case invalidPayload
  case invalidDepartureDate
  case departureDatePassed
  case activitiesDisabled
}

public final class WeatheronWidgetDataModule: Module, @unchecked Sendable {
  private var departureEndWorkItem: DispatchWorkItem?
  private var widgetReloadWorkItem: DispatchWorkItem?

  public func definition() -> ModuleDefinition {
    Name("WeatheronWidgetData")

    Function("saveSnapshot") { (snapshotJson: String) -> Bool in
      guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else { return false }

      let snapshotData = Data(snapshotJson.utf8)
      let fileURL = FileManager.default
        .containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier)?
        .appendingPathComponent(widgetSnapshotRelativePath, isDirectory: false)
      let previousFileData = fileURL.flatMap { try? Data(contentsOf: $0) }
      let changed = defaults.string(forKey: widgetSnapshotKey) != snapshotJson || previousFileData != snapshotData
      if changed {
        defaults.set(snapshotJson, forKey: widgetSnapshotKey)
      }
      defaults.synchronize()

      if let fileURL {
        try? FileManager.default.createDirectory(
          at: fileURL.deletingLastPathComponent(),
          withIntermediateDirectories: true
        )
        try? snapshotData.write(to: fileURL, options: .atomic)
        try? FileManager.default.setAttributes(
          [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication],
          ofItemAtPath: fileURL.path
        )
      }

      // React 상태가 연달아 바뀔 때 reload 요청이 폭주하면 WidgetKit이 throttle한다.
      // 마지막 스냅샷 저장 뒤 한 번만 타임라인을 갱신한다.
      self.widgetReloadWorkItem?.cancel()
      let reloadWorkItem = DispatchWorkItem {
        widgetKinds.forEach { WidgetCenter.shared.reloadTimelines(ofKind: $0) }
      }
      self.widgetReloadWorkItem = reloadWorkItem
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5, execute: reloadWorkItem)
      return changed
    }

    AsyncFunction("getDepartureActivityStatus") { () async -> String in
      await self.endExpiredDepartureActivities()
      return self.departureActivityStatusJson()
    }

    AsyncFunction("startDepartureActivity") { (payloadJson: String) async throws -> String in
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        throw DepartureActivityError.activitiesDisabled
      }
      guard
        let data = payloadJson.data(using: .utf8),
        let payload = try? JSONDecoder().decode(DepartureActivityPayload.self, from: data)
      else {
        throw DepartureActivityError.invalidPayload
      }
      guard let departureAt = self.parseIsoDate(payload.departureAt) else {
        throw DepartureActivityError.invalidDepartureDate
      }
      guard departureAt > Date() else {
        throw DepartureActivityError.departureDatePassed
      }

      await self.endAllDepartureActivities()
      let attributes = WeatherONDepartureActivityAttributes(
        destinationId: payload.destinationId,
        destinationName: payload.destinationName,
        departureAt: departureAt,
        departureTimeLabel: payload.departureTimeLabel,
        deepLink: payload.deepLink
      )
      let state = WeatherONDepartureActivityAttributes.ContentState(
        guidance: payload.guidance,
        isCompleted: false
      )
      let content = ActivityContent(state: state, staleDate: departureAt, relevanceScore: 80)
      let activity = try Activity<WeatherONDepartureActivityAttributes>.request(
        attributes: attributes,
        content: content,
        pushType: nil
      )
      self.scheduleAutomaticEnd(for: activity)
      return self.departureActivityStatusJson(activity: activity)
    }

    AsyncFunction("endDepartureActivity") { () async -> Bool in
      let hadActivity = !Activity<WeatherONDepartureActivityAttributes>.activities.isEmpty
      await self.endAllDepartureActivities()
      return hadActivity
    }
  }

  private func parseIsoDate(_ value: String) -> Date? {
    let fractional = ISO8601DateFormatter()
    fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return fractional.date(from: value) ?? ISO8601DateFormatter().date(from: value)
  }

  private func scheduleAutomaticEnd(for activity: Activity<WeatherONDepartureActivityAttributes>) {
    departureEndWorkItem?.cancel()
    let delay = max(0, activity.attributes.departureAt.timeIntervalSinceNow)
    let workItem = DispatchWorkItem {
      Task {
        let finalState = WeatherONDepartureActivityAttributes.ContentState(
          guidance: "출발 시각이 되었어요",
          isCompleted: true
        )
        let finalContent = ActivityContent(state: finalState, staleDate: nil, relevanceScore: 0)
        await activity.end(finalContent, dismissalPolicy: .immediate)
      }
    }
    departureEndWorkItem = workItem
    DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: workItem)
  }

  private func endExpiredDepartureActivities() async {
    let now = Date()
    for activity in Activity<WeatherONDepartureActivityAttributes>.activities where activity.attributes.departureAt <= now {
      let finalState = WeatherONDepartureActivityAttributes.ContentState(
        guidance: "출발 시각이 되었어요",
        isCompleted: true
      )
      let finalContent = ActivityContent(state: finalState, staleDate: nil, relevanceScore: 0)
      await activity.end(finalContent, dismissalPolicy: .immediate)
    }
  }

  private func endAllDepartureActivities() async {
    departureEndWorkItem?.cancel()
    departureEndWorkItem = nil
    for activity in Activity<WeatherONDepartureActivityAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }

  private func departureActivityStatusJson(
    activity: Activity<WeatherONDepartureActivityAttributes>? = nil
  ) -> String {
    let activeActivity = activity ?? Activity<WeatherONDepartureActivityAttributes>.activities
      .filter { $0.attributes.departureAt > Date() }
      .max { $0.attributes.departureAt < $1.attributes.departureAt }
    let payload: [String: Any] = [
      "supported": true,
      "enabled": ActivityAuthorizationInfo().areActivitiesEnabled,
      "active": activeActivity != nil,
      "activityId": activeActivity?.id ?? "",
      "destinationId": activeActivity?.attributes.destinationId ?? "",
      "departureAt": activeActivity.map { ISO8601DateFormatter().string(from: $0.attributes.departureAt) } ?? "",
    ]
    guard
      let data = try? JSONSerialization.data(withJSONObject: payload),
      let json = String(data: data, encoding: .utf8)
    else {
      return "{\"supported\":true,\"enabled\":false,\"active\":false}"
    }
    return json
  }
}
