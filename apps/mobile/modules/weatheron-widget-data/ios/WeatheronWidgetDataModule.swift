import ActivityKit
import ExpoModulesCore
import Foundation
import OSLog
import WidgetKit

private let appGroupIdentifier = "group.com.weatheron.mobile"
private let widgetSnapshotKey = "weatheron.widget.store.v2"
private let widgetSnapshotRelativePath = "Library/Application Support/WeatherONWidget/weatheron-widget-store-v2.json"
private let widgetKind = "WeatherONLocationWidgetV4"
private let widgetLogger = Logger(subsystem: "com.weatheron.mobile", category: "WidgetSync")
private let departureLogger = Logger(subsystem: "com.weatheron.mobile", category: "DepartureActivity")
private let departureActivityLeadTime: TimeInterval = 60 * 60
private let departureActivityRecoveryGrace: TimeInterval = 2 * 60

private struct DepartureActivityPayload: Decodable {
  let destinationId: String
  let destinationName: String
  let departureAt: String
  let departureTimeLabel: String
  let guidance: String
  let guidanceKind: String?
  let guidanceSymbol: String
  let deepLink: String
}

private enum DepartureActivityError: Error {
  case invalidPayload
  case invalidDepartureDate
  case departureDatePassed
  case activitiesDisabled
}

public final class WeatheronWidgetDataModule: Module, @unchecked Sendable {
  private var departureTokenTask: Task<Void, Never>?
  private var departureStateTask: Task<Void, Never>?
  private var observedActivityId: String?
  private var departureEndWorkItem: DispatchWorkItem?

  public func definition() -> ModuleDefinition {
    Name("WeatheronWidgetData")
    Events("onDeparturePushToken")
    OnDestroy {
      self.departureTokenTask?.cancel()
      self.departureStateTask?.cancel()
    }

    Function("saveSnapshot") { (snapshotJson: String) -> Bool in
      self.saveWidgetJSON(snapshotJson, key: widgetSnapshotKey, relativePath: widgetSnapshotRelativePath)
    }

    Function("saveLocations") { (locationsJson: String) -> Bool in
      self.saveWidgetJSON(
        locationsJson,
        key: "weatheron.widget.locations.v1",
        relativePath: "Library/Application Support/WeatherONWidget/weatheron-widget-locations-v1.json"
      )
    }

    Function("protectWardrobePhoto") { (fileUri: String) -> Bool in
      guard
        let fileURL = URL(string: fileUri),
        fileURL.isFileURL,
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
      else { return false }

      let wardrobeDirectory = documentsURL
        .appendingPathComponent("wardrobe-photos", isDirectory: true)
        .standardizedFileURL
      let protectedURL = fileURL.standardizedFileURL
      guard protectedURL.path.hasPrefix(wardrobeDirectory.path + "/") else { return false }

      do {
        var resourceValues = URLResourceValues()
        resourceValues.isExcludedFromBackup = true
        var mutableURL = protectedURL
        try mutableURL.setResourceValues(resourceValues)
        try FileManager.default.setAttributes(
          [.protectionKey: FileProtectionType.complete],
          ofItemAtPath: protectedURL.path
        )
        return true
      } catch {
        return false
      }
    }

    AsyncFunction("getDepartureActivityStatus") { () async -> String in
      // Capture OS state before recovery/reconciliation can end or recreate it.
      self.logDepartureSnapshot()
      await self.recoverLongExpiredDepartureActivities()
      if let activity = self.currentDepartureActivity() {
        self.observePushToken(for: activity)
      }
      return self.departureActivityStatusJson()
    }

    AsyncFunction("startDepartureActivity") { (payloadJson: String) async throws -> String in
      guard ActivityAuthorizationInfo().areActivitiesEnabled else {
        departureLogger.notice("event=request_disabled")
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

      let attributes = WeatherONDepartureActivityAttributes(
        destinationId: payload.destinationId,
        destinationName: payload.destinationName,
        departureAt: departureAt,
        departureTimeLabel: payload.departureTimeLabel,
        deepLink: payload.deepLink
      )
      let state = WeatherONDepartureActivityAttributes.ContentState(
        guidance: payload.guidance,
        guidanceSymbol: payload.guidanceSymbol,
        guidanceKind: payload.guidanceKind,
        departureTimeLabel: payload.departureTimeLabel,
        isCompleted: false,
        phase: "upcoming"
      )
      let content = ActivityContent(state: state, staleDate: departureAt, relevanceScore: 80)

      if let activity = self.matchingDepartureActivity(attributes: attributes) {
        departureLogger.notice("event=reuse")
        await self.endOtherDepartureActivities(keeping: activity.id)
        await activity.update(content)
        self.observePushToken(for: activity)
        self.scheduleAutomaticEnd(for: activity)
        return self.departureActivityStatusJson(activity: activity)
      }

      let activity: Activity<WeatherONDepartureActivityAttributes>
      do {
        activity = try self.requestDepartureActivity(attributes: attributes, content: content, pushType: .token)
      } catch {
        departureLogger.error("event=token_request_failed code=\((error as NSError).code, privacy: .public)")
        // Push token 생성 실패가 Live Activity 표시 자체를 막으면 로컬 Activity로 계속한다.
        do {
          activity = try self.requestDepartureActivity(attributes: attributes, content: content, pushType: nil)
        } catch {
          departureLogger.error("event=local_request_failed code=\((error as NSError).code, privacy: .public)")
          throw error
        }
      }
      // Preserve the accepted countdown if both replacement requests fail.
      await self.endOtherDepartureActivities(keeping: activity.id)
      self.observePushToken(for: activity)
      self.scheduleAutomaticEnd(for: activity)
      return self.departureActivityStatusJson(activity: activity)
    }

    AsyncFunction("endDepartureActivity") { () async -> Bool in
      let hadActivity = !Activity<WeatherONDepartureActivityAttributes>.activities.isEmpty
      await self.endAllDepartureActivities()
      return hadActivity
    }
  }

  private func saveWidgetJSON(_ json: String, key: String, relativePath: String) -> Bool {
    guard let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier),
          let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
      widgetLogger.error("Widget App Group is unavailable")
      return false
    }
    let data = Data(json.utf8)
    guard (try? JSONSerialization.jsonObject(with: data)) != nil else { return false }
    let fileURL = container.appendingPathComponent(relativePath, isDirectory: false)
    do {
      if (try? Data(contentsOf: fileURL)) != data {
        try FileManager.default.createDirectory(at: fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        try data.write(to: fileURL, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
      }
      defaults.set(json, forKey: key)
      defaults.synchronize()
      // JS deduplicates successful deliveries. Request before returning so suspension
      // cannot strand a delayed work item; identical data can retry a lost reload.
      WidgetCenter.shared.reloadTimelines(ofKind: widgetKind)
      widgetLogger.notice("Widget shared data delivered: \(key, privacy: .public)")
      return true
    } catch {
      // Do not acknowledge an unwritten snapshot: the app will retry.
      widgetLogger.error("Widget shared file write failed: \(error.localizedDescription, privacy: .private)")
      return false
    }
  }

  private func observePushToken(for activity: Activity<WeatherONDepartureActivityAttributes>) {
    guard observedActivityId != activity.id else { return }
    departureTokenTask?.cancel()
    departureStateTask?.cancel()
    observedActivityId = activity.id
    self.logDepartureState(activity.activityState)
    departureStateTask = Task { [weak self] in
      for await state in activity.activityStateUpdates {
        guard !Task.isCancelled, let self else { return }
        self.logDepartureState(state)
      }
    }
    departureTokenTask = Task { [weak self] in
      for await _ in activity.pushTokenUpdates {
        guard !Task.isCancelled, let self else { return }
        self.sendEvent("onDeparturePushToken", ["status": self.departureActivityStatusJson(activity: activity)])
      }
    }
  }

  private func logDepartureSnapshot() {
    let activities = Activity<WeatherONDepartureActivityAttributes>.activities
    let totalCount = activities.count
    let activeCount = activities.filter { $0.activityState == .active }.count
    let staleCount = activities.filter { $0.activityState == .stale }.count
    var pendingCount = 0
    if #available(iOS 26.0, *) { pendingCount = activities.filter { $0.activityState == .pending }.count }
    departureLogger.notice("event=snapshot total=\(totalCount, privacy: .public) active=\(activeCount, privacy: .public) pending=\(pendingCount, privacy: .public) stale=\(staleCount, privacy: .public)")
  }

  private func logDepartureState(_ state: ActivityState) {
    let name: String
    if #available(iOS 26.0, *), state == .pending { name = "scheduled" }
    else {
      switch state {
      case .active: name = "active"
      case .stale: name = "stale"
      case .ended: name = "ended"
      case .dismissed: name = "dismissed"
      default: name = "unknown"
      }
    }
    // No IDs, names, dates, coordinates, content, token or error description.
    departureLogger.notice("event=state state=\(name, privacy: .public)")
  }

  private func pushEnvironment() -> String {
    // Distribution archives may omit the profile; development installs include their APS entitlement.
    if let url = Bundle.main.url(forResource: "embedded", withExtension: "mobileprovision"),
       let data = try? Data(contentsOf: url),
       let text = String(data: data, encoding: .isoLatin1),
       let start = text.range(of: "<?xml"), let end = text.range(of: "</plist>", range: start.lowerBound..<text.endIndex),
       let xml = text[start.lowerBound..<end.upperBound].data(using: .isoLatin1),
       let profile = try? PropertyListSerialization.propertyList(from: xml, format: nil) as? [String: Any],
       let entitlements = profile["Entitlements"] as? [String: Any],
       entitlements["aps-environment"] as? String == "development" {
      return "sandbox"
    }
    return "production"
  }

  private func parseIsoDate(_ value: String) -> Date? {
    let fractional = ISO8601DateFormatter()
    fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return fractional.date(from: value) ?? ISO8601DateFormatter().date(from: value)
  }

  private func localized(_ key: String) -> String {
    NSLocalizedString(key, bundle: .main, value: key, comment: "")
  }

  private func requestDepartureActivity(
    attributes: WeatherONDepartureActivityAttributes,
    content: ActivityContent<WeatherONDepartureActivityAttributes.ContentState>,
    pushType: PushType?
  ) throws -> Activity<WeatherONDepartureActivityAttributes> {
    let startAt = attributes.departureAt.addingTimeInterval(-departureActivityLeadTime)
    if #available(iOS 26.0, *), startAt > Date() {
      departureLogger.notice("event=request mode=scheduled style=standard")
      let alert = AlertConfiguration(
        title: LocalizedStringResource("departure.alert.title", defaultValue: "출발 준비 시작"),
        body: LocalizedStringResource("departure.alert.body", defaultValue: "\(attributes.destinationName) 출발까지 60분 남았어요"),
        sound: .default
      )
      return try Activity<WeatherONDepartureActivityAttributes>.request(
        attributes: attributes,
        content: content,
        pushType: pushType,
        style: .standard,
        alertConfiguration: alert,
        start: startAt
      )
    }
    departureLogger.notice("event=request mode=immediate style=standard")
    return try Activity<WeatherONDepartureActivityAttributes>.request(
      attributes: attributes,
      content: content,
      pushType: pushType
    )
  }

  private func scheduleAutomaticEnd(for activity: Activity<WeatherONDepartureActivityAttributes>) {
    departureEndWorkItem?.cancel()
    let delay = max(0, activity.attributes.departureAt.timeIntervalSinceNow)
    let workItem = DispatchWorkItem {
      Task {
        let finalState = WeatherONDepartureActivityAttributes.ContentState(
          guidance: self.localized("departure.completed"),
          guidanceSymbol: "location.north.fill",
          isCompleted: true,
          phase: "completed"
        )
        let finalContent = ActivityContent(state: finalState, staleDate: nil, relevanceScore: 0)
        await activity.end(finalContent, dismissalPolicy: .immediate)
      }
    }
    departureEndWorkItem = workItem
    DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: workItem)
  }

  private func recoverLongExpiredDepartureActivities() async {
    let now = Date()
    for activity in Activity<WeatherONDepartureActivityAttributes>.activities
      where activity.attributes.departureAt.addingTimeInterval(departureActivityRecoveryGrace) <= now {
      let finalState = WeatherONDepartureActivityAttributes.ContentState(
        guidance: self.localized("departure.expired"),
        guidanceSymbol: "exclamationmark.clock.fill",
        isCompleted: true,
        phase: "expired"
      )
      let finalContent = ActivityContent(state: finalState, staleDate: nil, relevanceScore: 0)
      await activity.end(finalContent, dismissalPolicy: .immediate)
    }
  }

  private func endAllDepartureActivities() async {
    departureLogger.notice("event=explicit_end")
    departureTokenTask?.cancel()
    departureStateTask?.cancel()
    departureStateTask = nil
    departureTokenTask = nil
    observedActivityId = nil
    departureEndWorkItem?.cancel()
    departureEndWorkItem = nil
    for activity in Activity<WeatherONDepartureActivityAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }

  private func endOtherDepartureActivities(keeping activityId: String) async {
    for activity in Activity<WeatherONDepartureActivityAttributes>.activities where activity.id != activityId {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }

  private func matchingDepartureActivity(
    attributes: WeatherONDepartureActivityAttributes
  ) -> Activity<WeatherONDepartureActivityAttributes>? {
    Activity<WeatherONDepartureActivityAttributes>.activities.first {
      self.isTrackedDepartureActivity($0) &&
      $0.attributes.destinationId == attributes.destinationId &&
      abs($0.attributes.departureAt.timeIntervalSince(attributes.departureAt)) < 1 &&
      $0.attributes.destinationName == attributes.destinationName &&
      $0.attributes.deepLink == attributes.deepLink
    }
  }

  private func currentDepartureActivity() -> Activity<WeatherONDepartureActivityAttributes>? {
    Activity<WeatherONDepartureActivityAttributes>.activities
      .filter(self.isTrackedDepartureActivity)
      .max { $0.attributes.departureAt < $1.attributes.departureAt }
  }

  private func isTrackedDepartureActivity(_ activity: Activity<WeatherONDepartureActivityAttributes>) -> Bool {
    if activity.activityState == .active || activity.activityState == .stale { return true }
    if #available(iOS 26.0, *), activity.activityState == .pending { return true }
    return false
  }

  private func departureActivityLifecycle(_ activity: Activity<WeatherONDepartureActivityAttributes>?) -> String {
    guard let activity else { return "inactive" }
    if activity.activityState == .stale { return "stale" }
    if #available(iOS 26.0, *), activity.activityState == .pending { return "scheduled" }
    return activity.activityState == .active ? "active" : "inactive"
  }

  private func departureActivityStatusJson(
    activity: Activity<WeatherONDepartureActivityAttributes>? = nil
  ) -> String {
    let activeActivity = activity ?? self.currentDepartureActivity()
    let lifecycle = self.departureActivityLifecycle(activeActivity)
    let activities = Activity<WeatherONDepartureActivityAttributes>.activities
    var scheduledCount = 0
    if #available(iOS 26.0, *) { scheduledCount = activities.filter { $0.activityState == .pending }.count }
    // Enumeration is native lifecycle evidence, not a claim of screen visibility.
    let diagnostics = [
      "activityCount": activities.count,
      "activeCount": activities.filter { $0.activityState == .active }.count,
      "scheduledCount": scheduledCount,
      "staleCount": activities.filter { $0.activityState == .stale }.count,
    ]
    let payload: [String: Any] = [
      "pushToken": activeActivity?.pushToken?.map { String(format: "%02x", $0) }.joined() ?? "",
      "bundleId": Bundle.main.bundleIdentifier ?? "",
      "pushEnvironment": self.pushEnvironment(),
      "supported": true,
      "enabled": ActivityAuthorizationInfo().areActivitiesEnabled,
      "active": lifecycle == "active",
      "scheduled": lifecycle == "scheduled",
      "automaticStartSupported": ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26,
      "lifecycle": lifecycle,
      "activityId": activeActivity?.id ?? "",
      "destinationId": activeActivity?.attributes.destinationId ?? "",
      "departureAt": activeActivity.map { ISO8601DateFormatter().string(from: $0.attributes.departureAt) } ?? "",
      "guidance": activeActivity?.content.state.guidance ?? "",
      "diagnostics": diagnostics,
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
