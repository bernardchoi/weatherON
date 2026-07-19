# Ambient Surface Experimental Data-to-Atmosphere Mapping v1.1

**Date:** 2026-07-15
**Status:** Experimental add-on
**Output files:** `perfora-air.experimental-data-map.v1.1.json`, `perfora-air.experimental-data-map.v1.1.ts`

## 0. Purpose

This document defines how Ambient Surface converts raw product data into UI atmosphere.

The goal is to prevent Ambient Surface from becoming a decorative layer. Every density field, lumen signal, flow motion, and visual summary sentence must be explainable through data or explicit user context.

```txt
raw data
→ derived pressure metrics
→ Perfora state
→ surface / density / lumen / flow tokens
→ component variant
→ visual summary text
→ recommended action
```

## 1. Inputs

### 1.1 Weather inputs

| Field | Unit | Use |
|---|---:|---|
| `temperatureC` | °C | Main condition and comfort copy |
| `feelsLikeC` | °C | Difference from actual temperature |
| `humidityPct` | % | Surface veil, air weight, dehumidify suggestion |
| `windSpeedMs` | m/s | Flow speed and wind ring intensity |
| `windDirectionDeg` | degrees | Directional flow and ring needle |
| `precipProbabilityPct` | % | Rainy surface mode and timeline intensity |
| `uvIndex` | index | Day mode edge signal, outdoor caution |
| `aqi` | index | Air purity pressure |
| `pm25` | μg/m³ | Air purity pressure and action priority |

### 1.2 Smart home inputs

| Field | Unit | Use |
|---|---:|---|
| `co2ppm` | ppm | Ventilation urgency |
| `indoorHumidityPct` | % | Dehumidify priority |
| `purifierMode` | enum | Device status copy |
| `deviceAlerts` | count | SignalCard urgency |
| `windowOpen` | boolean | Ventilation recommendation state |

### 1.3 Day context inputs

| Field | Unit | Use |
|---|---:|---|
| `eventsNext12h` | count | Schedule pressure and timeline density |
| `focusBlocks` | count | Focus opportunity copy |
| `nextDeadlineHours` | hours | CTA priority |
| `notificationUrgency` | 0–3 | Signal intensity |

## 2. Derived metrics

| Metric | Formula direction | Drives |
|---|---|---|
| `airWeight` | humidity + heat + PM2.5 burden | Surface veil, copy tone |
| `flowEnergy` | wind speed + wind direction clarity | Flow speed, LumenRing emphasis |
| `airPurityPressure` | max(AQI, PM2.5, CO₂) | Signal urgency |
| `schedulePressure` | events + deadline proximity + notifications | AmbientTimeline density |
| `actionUrgency` | max(environmental pressure, schedule pressure) | Overall Perfora state |

## 3. State thresholds

### 3.1 Humidity

| State | Range | UI translation |
|---|---:|---|
| Calm | 35–60% | Clear matte surface |
| Notice | 61–74% | Slight veil and softer contrast |
| Alert | 75–84% | Text-first recommendation for dehumidifying/ventilation |
| Critical | 85%+ | Strong action copy; density does not carry state alone |

### 3.2 Wind speed

| Flow token | Range | UI translation |
|---|---:|---|
| `still` | 0–1.4 m/s | No visible ambient motion |
| `slow` | 1.5–4.9 m/s | Light directional drift |
| `medium` | 5.0–8.9 m/s | Clearer flow curve |
| `gust` | 9.0+ m/s | Short emphasis only; avoid constant motion |

### 3.3 Air purity

| Field | Calm | Normal | Alert | Critical |
|---|---:|---:|---:|---:|
| AQI | 0–30 | 31–50 | 51–100 | 101+ |
| PM2.5 | 0–15 | 16–35 | 36–75 | 76+ |
| CO₂ | <800 | 800–999 | 1000–1499 | 1500+ |

## 4. Token mapping

| Perfora state | Surface | Density | Lumen | Flow | Copy rule |
|---|---|---|---|---|---|
| `calm` | `still` | `calm` | `whisper` | `still` | Reassuring |
| `normal` | `air` | `normal` | `soft` | `drift` | Informative |
| `live` | `air` | `live` | `notice` | `slow` | Observational |
| `alert` | `signal` | `alert` | `alert` | `gust` | Actionable + text required |
| `critical` | `signal` | `critical` | `critical` | `gust` | Direct + text-first |

## 5. Recommendation priority

The UI should not show three competing actions with equal visual weight. Recommendation priority is:

1. CO₂ high → ventilate.
2. Indoor humidity high → dehumidify.
3. PM2.5/AQI high → purify.
4. Schedule pressure high → protect focus time.
5. Otherwise → maintain.

## 6. Copy generation pattern

Every generated status sentence should follow this structure:

```txt
[State sentence]. [Key numbers]. [Why it matters]. [Recommended action].
```

### Example: normal

```txt
공기가 살짝 습하지만 안정적입니다. 24도, 습도 62%, 북서풍 3.2m/s입니다. 짧은 환기 후 집중하기 좋은 상태입니다.
```

### Example: alert

```txt
공기가 무겁고 확인할 항목이 늘었습니다. 26도, 습도 78%, CO₂ 1180ppm입니다. 제습을 먼저 켜고 다음 일정 전 알림을 정리하세요.
```

## 7. Accessibility mapping

Visual elements must use the same state model as their text alternatives.

| Visual layer | Accessibility behavior |
|---|---|
| Density field | `aria-hidden` if it duplicates a described state |
| Lumen ring | `role="img"` with title + description, or meter if interactive |
| Timeline bars | `role="meter"` for individual values; long summary for trend |
| Alert signal | Text required; color/light cannot be the only state carrier |
| Reduced motion | Flow token becomes still; copy remains unchanged |
| Reduced transparency | Surface becomes opaque; density meaning moves to text/structure |

## 8. Review checklist

- [ ] Can every visible density pattern be traced to a metric?
- [ ] Does every alert have an action sentence?
- [ ] Does reduced motion preserve the same decision?
- [ ] Does high contrast mode preserve the same state hierarchy?
- [ ] Are weather, home air, and schedule data mapped by the same state model?

## 9. Files

- `perfora-air.experimental-data-map.v1.1.json` — machine-readable mapping.
- `perfora-air.experimental-data-map.v1.1.ts` — implementation helper for React/SwiftUI parity.
