import ExpoModulesCore
import WidgetKit

private let appGroupIdentifier = "group.com.weatheron.mobile"
private let widgetSnapshotKey = "weatheron.widget.store.v2"
private let widgetKind = "WeatherONSmallWidget"

public class WeatheronWidgetDataModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WeatheronWidgetData")

    Function("saveSnapshot") { (snapshotJson: String) -> Bool in
      guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else { return false }

      if defaults.string(forKey: widgetSnapshotKey) == snapshotJson {
        return false
      }

      defaults.set(snapshotJson, forKey: widgetSnapshotKey)
      WidgetCenter.shared.reloadTimelines(ofKind: widgetKind)
      return true
    }
  }
}
