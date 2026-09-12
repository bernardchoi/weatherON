import ActivityKit
import Foundation

public struct WeatherONDepartureActivityAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    public let guidance: String
    public let guidanceSymbol: String?
    public let isCompleted: Bool
    public let phase: String?

    public init(guidance: String, guidanceSymbol: String? = nil, isCompleted: Bool, phase: String? = nil) {
      self.guidance = guidance
      self.guidanceSymbol = guidanceSymbol
      self.isCompleted = isCompleted
      self.phase = phase
    }
  }

  public let destinationId: String
  public let destinationName: String
  public let departureAt: Date
  public let departureTimeLabel: String
  public let deepLink: String

  public init(
    destinationId: String,
    destinationName: String,
    departureAt: Date,
    departureTimeLabel: String,
    deepLink: String
  ) {
    self.destinationId = destinationId
    self.destinationName = destinationName
    self.departureAt = departureAt
    self.departureTimeLabel = departureTimeLabel
    self.deepLink = deepLink
  }
}
