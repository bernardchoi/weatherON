# Ambient Surface Implementation Package v1.1 experimental

> **2026-09-12 적용 제한:** 아래 예제는 7월 범용 연구 starter의 사용 이력임. `evaluateAtmosphere()`와 SwiftUI mapper를 WeatherON 제품 규칙으로 직접 채택하지 않음. [데이터 매핑의 알려진 차이](02_experimental_data_to_atmosphere_mapping.md)와 [현재 제품 설계](01_experimental_direction_brief.md)를 먼저 확인함. 현재 앱은 React Native이며 기존 WeatherSnapshot·provider·추천 로직을 재사용하는 연결 설계가 필요함. 새 방향의 네이티브 구현 완료를 의미하지 않음.

**Date:** 2026-07-15
**Status:** Experimental starter implementation
**Targets:** React + SwiftUI

## 0. Purpose

This package turns the v1.1 experimental design rules into starter code. It is not a full production library yet, but it gives engineering a concrete shape for testing the system in WeatherON or another prototype.

## 1. Included implementation

```txt
implementation/
├─ react/
│  ├─ package.json
│  ├─ README.md
│  └─ src/
│     ├─ index.ts
│     ├─ types.ts
│     ├─ dataMap.ts
│     ├─ visualSummary.ts
│     ├─ AtmospherePanel.tsx
│     ├─ SignalCard.tsx
│     ├─ LumenRing.tsx
│     ├─ AmbientTimeline.tsx
│     └─ perfora-air-react.css
└─ swiftui/
   ├─ README.md
   └─ PerforaAirComponents.swift
```

## 2. Implementation principles

| Principle | Code rule |
|---|---|
| Matte Air | CSS/SwiftUI backgrounds use opaque or near-opaque surfaces first |
| Soft Density | Pattern layer is a pseudo/background layer and can be hidden |
| Quiet Signal | Alert visual is constrained; text carries state |
| Text First | Components require `summary` or `accessibleSummary` |
| Data Traceability | Use `evaluateAtmosphere()` helper before rendering |

## 3. React usage

```tsx
import { AtmospherePanel, evaluateAtmosphere } from './perfora-air';
import './perfora-air-react.css';

const atmosphere = evaluateAtmosphere({
  weather: { temperatureC: 24, humidityPct: 62, windSpeedMs: 3.2, windDirectionDeg: 315, aqi: 18, pm25: 18 },
  homeAir: { co2ppm: 720, indoorHumidityPct: 62 },
  dayContext: { eventsNext12h: 4, nextDeadlineHours: 9, notificationUrgency: 1 }
});

<AtmospherePanel
  title="Yokohama"
  eyebrow="오늘의 공기"
  state={atmosphere.state}
  summary={atmosphere.summary}
  recommendation={atmosphere.recommendation.label}
  accessibleSummary={atmosphere.accessibleSummary}
  metrics={[
    { label: '습도', value: 62, unit: '%' },
    { label: '풍속', value: 3.2, unit: 'm/s' },
    { label: 'AQI', value: 18 }
  ]}
/>
```

## 4. SwiftUI usage

```swift
let input = PAAtmosphereInput(
    temperatureC: 24,
    humidityPct: 62,
    windSpeedMs: 3.2,
    windDirectionDeg: 315,
    aqi: 18,
    pm25: 18,
    co2ppm: 720,
    eventsNext12h: 4
)
let result = PerforaAirMapper.evaluate(input)

PAAtmospherePanel(result: result)
```

## 5. Validation needed before production

- Run real TypeScript build in the WeatherON stack.
- Run SwiftUI preview on target iOS versions.
- Add visual regression tests.
- Add VoiceOver/TalkBack manual checks.
- Measure animation cost on low-end devices.
