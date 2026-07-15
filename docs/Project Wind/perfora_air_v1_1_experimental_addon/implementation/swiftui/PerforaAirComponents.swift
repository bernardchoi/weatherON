import SwiftUI

public enum PAState: String {
    case calm, normal, live, alert, critical, loading, insufficientData, offline
}

public struct PAAtmosphereInput {
    public var temperatureC: Double
    public var humidityPct: Double
    public var windSpeedMs: Double
    public var windDirectionDeg: Double
    public var aqi: Double
    public var pm25: Double
    public var co2ppm: Double?
    public var eventsNext12h: Int?

    public init(temperatureC: Double, humidityPct: Double, windSpeedMs: Double, windDirectionDeg: Double, aqi: Double, pm25: Double, co2ppm: Double? = nil, eventsNext12h: Int? = nil) {
        self.temperatureC = temperatureC
        self.humidityPct = humidityPct
        self.windSpeedMs = windSpeedMs
        self.windDirectionDeg = windDirectionDeg
        self.aqi = aqi
        self.pm25 = pm25
        self.co2ppm = co2ppm
        self.eventsNext12h = eventsNext12h
    }
}

public struct PAAtmosphereResult {
    public var state: PAState
    public var summary: String
    public var recommendation: String
    public var accessibleSummary: String
}

public enum PerforaAirMapper {
    static func scoreAirPurity(aqi: Double, pm25: Double, co2ppm: Double?) -> Double {
        let aqiScore = aqi <= 30 ? 10 : aqi <= 50 ? 30 : aqi <= 100 ? 65 : 90
        let pmScore = pm25 <= 15 ? 10 : pm25 <= 35 ? 32 : pm25 <= 75 ? 68 : 92
        let co2 = co2ppm ?? 650
        let co2Score = co2 < 800 ? 10 : co2 < 1000 ? 35 : co2 < 1500 ? 72 : 94
        return max(aqiScore, pmScore, co2Score)
    }

    static func state(from score: Double) -> PAState {
        if score < 25 { return .calm }
        if score < 45 { return .normal }
        if score < 65 { return .live }
        if score < 85 { return .alert }
        return .critical
    }

    public static func evaluate(_ input: PAAtmosphereInput) -> PAAtmosphereResult {
        let humidityScore: Double = input.humidityPct <= 60 ? 12 : input.humidityPct <= 74 ? 35 : input.humidityPct <= 84 ? 68 : 88
        let purityScore = scoreAirPurity(aqi: input.aqi, pm25: input.pm25, co2ppm: input.co2ppm)
        let scheduleScore: Double = (input.eventsNext12h ?? 0) >= 5 ? 70 : 20
        let score = max(humidityScore, purityScore, scheduleScore)
        let state = state(from: score)
        let recommendation: String
        if let co2 = input.co2ppm, co2 >= 1000 {
            recommendation = "10분 환기를 먼저 권장합니다."
        } else if input.humidityPct >= 75 {
            recommendation = "제습을 먼저 켜는 편이 좋습니다."
        } else if input.pm25 >= 36 || input.aqi >= 51 {
            recommendation = "공기청정 모드를 높여 주세요."
        } else {
            recommendation = "현재 상태를 유지해도 좋습니다."
        }
        let stateText: String = {
            switch state {
            case .calm: return "공기가 안정적입니다."
            case .normal: return "공기가 살짝 습하지만 안정적입니다."
            case .live: return "공기와 일정 흐름이 조금 활발합니다."
            case .alert: return "확인할 공기 상태가 늘었습니다."
            case .critical: return "즉시 확인이 필요한 상태입니다."
            default: return "상태를 확인하는 중입니다."
            }
        }()
        let accessible = "오늘의 공기 시각 요약: \(stateText) \(Int(input.temperatureC))도, 습도 \(Int(input.humidityPct))퍼센트, 풍속 \(String(format: "%.1f", input.windSpeedMs))미터 매초, AQI \(Int(input.aqi))입니다. \(recommendation)"
        return PAAtmosphereResult(state: state, summary: stateText, recommendation: recommendation, accessibleSummary: accessible)
    }
}

public struct PAAtmospherePanel: View {
    public var result: PAAtmosphereResult
    public var title: String
    public var metrics: [(String, String)]

    public init(result: PAAtmosphereResult, title: String = "Yokohama", metrics: [(String, String)] = []) {
        self.result = result
        self.title = title
        self.metrics = metrics
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("오늘의 공기").font(.caption).foregroundStyle(.secondary).textCase(.uppercase)
            Text(title).font(.title3.weight(.semibold))
            Text(result.summary).font(.system(size: 34, weight: .regular, design: .default)).tracking(-1.2)
            HStack {
                ForEach(metrics, id: \.0) { metric in
                    VStack(alignment: .leading) {
                        Text(metric.1).font(.title3.weight(.semibold))
                        Text(metric.0).font(.caption).foregroundStyle(.secondary)
                    }
                    .padding(12)
                    .background(Color.white.opacity(0.75))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            }
            Text(result.recommendation).font(.body).foregroundStyle(.secondary)
        }
        .padding(24)
        .background(Color(red: 0.98, green: 0.99, blue: 0.99))
        .overlay(RoundedRectangle(cornerRadius: 28, style: .continuous).stroke(Color.black.opacity(0.08)))
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(result.accessibleSummary))
    }
}

public struct PASignalCard: View {
    public var label: String
    public var value: String
    public var caption: String
    public var state: PAState

    public init(label: String, value: String, caption: String = "", state: PAState = .normal) {
        self.label = label
        self.value = value
        self.caption = caption
        self.state = state
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            Text(value).font(.title2.weight(.semibold))
            if !caption.isEmpty { Text(caption).font(.caption).foregroundStyle(.secondary) }
        }
        .padding(16)
        .background(Color.white.opacity(0.88))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(state == .alert || state == .critical ? Color.orange.opacity(0.55) : Color.black.opacity(0.08)))
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .accessibilityElement(children: .combine)
    }
}
