# Project Wind — Perfora Air v1.1 Experimental Add-on

**상태:** Experimental add-on for v1.0 stable package
**버전:** 1.1.0-experimental
**정리일:** 2026-07-15
**기준:** `perfora_air_v1_0_package` stable contract
**출처:** v0.2 productization draft promoted into the v1.x line

## 목적

이 패키지는 v1.0 stable 디자인 시스템을 대체하지 않는다. v1.0의 토큰·컴포넌트·접근성 계약을 유지한 상태에서, 데이터 매핑, WeatherON 실험 레이어, 사용성 테스트, React/SwiftUI starter를 v1.1 실험 확장으로 분리한다.

## 버전 정리

| 이전 위치 | 새 위치 | 결정 |
|---|---|---|
| `perfora_air_v0_2_download_fallback/full_package` | `perfora_air_v1_1_experimental_addon` | v1.1 experimental add-on으로 승격 |
| `data/perfora-air.data-map.v0.2.*` | `data/perfora-air.experimental-data-map.v1.1.*` | v1.0 stable 토큰에 의존하는 실험 매핑 |
| `data/perfora-air.components.v0.2.*` | `data/perfora-air.experimental-components.v1.1.*` | stable 10개 컴포넌트 중 4개 제품화 경로 |
| `figma/*v0.1*`, `tests/*v0.1*` | `figma/*v1.1*`, `tests/*v1.1*` | 실험 add-on 산출물로 재라벨 |

## 포함 범위

| 영역 | 산출물 | 역할 |
|---|---|---|
| 방향 | `docs/01_experimental_direction_brief.md` | v1.1 실험 경로 원칙과 성공 기준 |
| 데이터 | `data/perfora-air.experimental-data-map.v1.1.json` | weather/home/day context를 atmosphere state로 변환 |
| 컴포넌트 | `data/perfora-air.experimental-components.v1.1.json` | AtmospherePanel, SignalCard, LumenRing, AmbientTimeline 제품화 계약 |
| WeatherON | `docs/06_weatheron_adoption_scope.md` | 전체 교체가 아닌 experimental layer 채택 범위 |
| 구현 | `implementation/react`, `implementation/swiftui` | React/SwiftUI starter |
| 검증 | `docs/09_static_validation_report.md`, `tests/perfora-air.experimental-usability.scorecard.v1.1.json` | 정적 검증과 사용성 테스트 템플릿 |
| 안정 기준 | `reference_v1_0/` | v1.0 stable 계약 참조 복사본 |

## 적용 경계

- v1.0 stable 패키지가 여전히 Project Wind의 공식 기준점이다.
- v1.1 add-on은 WeatherON 차기 UI 후보 검증용이며 현행 MVP UI를 자동 대체하지 않는다.
- React Native production 적용 전 토큰 변환, 목업 승인, 실제 기기 QA, 보조공학 수동 테스트가 필요하다.
- Perfora Air는 내부 코드명이며 외부 공개명은 별도 상표 검토 후 결정한다.

## 추천 실행 순서

1. v1.0 stable 계약 확인: `../perfora_air_v1_0_package/README.md`
2. 데이터 매핑 검토: `docs/02_experimental_data_to_atmosphere_mapping.md`
3. WeatherON 채택 범위 결정: `docs/06_weatheron_adoption_scope.md`
4. React starter로 내부 prototype 구성
5. `docs/05_usability_test_plan.md` 기준으로 사용성 테스트 진행


---

# Perfora Air v1.1 Experimental Add-on

**Date:** 2026-07-15
**Purpose:** Experimental add-on package for Perfora Air after the v1.0 stable internal design-system release.

## Package contents

| Step | Artifact | Purpose |
|---:|---|---|
| 1 | `docs/01_experimental_direction_brief.md` | Lock v1.1 experimental product direction and review gates |
| 2 | `docs/02_experimental_data_to_atmosphere_mapping.md` | Define data → surface/density/lumen/flow mapping |
| 2 | `data/perfora-air.experimental-data-map.v1.1.json` | Machine-readable mapping |
| 2 | `data/perfora-air.experimental-data-map.v1.1.ts` | TypeScript helper |
| 3 | `docs/03_experimental_components.md` | AtmospherePanel / SignalCard v1.1 experimental spec |
| 3 | `data/perfora-air.experimental-components.v1.1.json` | Component metadata |
| 3 | `data/perfora-air.experimental-component-types.v1.1.ts` | Component prop contracts |
| 3 | `data/perfora-air.experimental-components.v1.1.css` | Starter CSS |
| 4 | `docs/04_experimental_figma_design_kit.md` | Figma kit creation guide |
| 4 | `figma/perfora-air.experimental-figma.variables.v1.1.json` | Figma variable blueprint |
| 4 | `figma/perfora-air.experimental-figma.component-matrix.v1.1.json` | Component matrix |
| 4 | `figma/perfora-air.experimental-figma.preview.v1.1.svg` | Figma kit visual preview |
| 5 | `05_usability_test_plan.md` | Moderated test plan |
| 5 | `tests/perfora-air.experimental-usability.scorecard.v1.1.json` | Test scorecard structure |
| 6 | `06_weatheron_adoption_scope.md` | WeatherON integration recommendation |
| 7 | `07_implementation_package.md` | React/SwiftUI package guide |
| 7 | `implementation/` | Starter code |
| 8 | `08_brand_trademark_reexploration.md` | External naming/trademark preliminary screen |

## Recommended execution order

```txt
1. Review Direction Brief
2. Lock Data Mapping
3. Update Components from Mapping
4. Build Figma Kit
5. Run Usability Test
6. Decide WeatherON scope
7. Move React/SwiftUI starter into target repo
8. Run formal trademark clearance for shortlisted names
```

## Key v1.1 experimental decision

Perfora Air's main differentiator is **not visual polish**. It is this chain:

```txt
invisible data → atmosphere score → surface density → quiet signal → text-first decision
```

If a visual element cannot be traced back to that chain, remove it or demote it.


---

# Perfora Air v1.1 Experimental Direction Brief

**Date:** 2026-07-15
**Status:** Experimental add-on for v1.1 experimental build/review
**Previous baseline:** Ambient Dashboard MVP v0.1, Perfora Air v1.0 stable tokens, Perfora Air v1.0 stable components, Visual Summary Alt Text v0.1

## 0. Purpose

Perfora Air v1.1 experimental moves the project from **visual concept validation** into **product-usable system validation**.

v1.0 stabilized that the Tower of Winds reference can become a coherent UI language: matte surfaces, soft density fields, quiet signal feedback, and text-first accessibility. v1.1 experimental must prove that the language can survive real product constraints: noisy weather data, accessibility modes, component reuse, WeatherON integration, and implementation across React/SwiftUI.

## 1. North Star

> Translate invisible context into calm, decision-ready surfaces.

The system should not feel like glassmorphism, neon dashboards, or decorative ambient art. It should feel like a quiet instrument panel that makes air, weather, schedule pressure, and indoor conditions easier to judge.

## 2. Fixed principles from v0.1

| Principle | v1.1 experimental interpretation | Non-negotiable rule |
|---|---|---|
| **Matte Air** | Soft atmospheric surface, not glossy glass | No strong specular highlight; gloss is capped and optional |
| **Soft Density** | Pattern density reflects context or urgency | No decorative dot field without a data source |
| **Quiet Signal** | Feedback uses small light, rhythm, and text | No oversized glow or alarm-like visual unless critical |
| **Text First** | Every important state has a sentence and an action | Alert/critical states cannot rely on color, ring, or pattern alone |
| **Accessibility Native** | Reduced motion/transparency/high contrast are not afterthoughts | Every component variant must have an accessible fallback |

## 3. What changes in v1.1 experimental

### 3.1 From mood to rules

v0.1 established visual tone. v1.1 experimental defines the rule engine behind that tone.

```txt
data → derived atmosphere metrics → token state → component variant → visual summary text
```

### 3.2 From broad demo to focused scenarios

v0.1 showed five screens. v1.1 experimental should prioritize three high-confidence scenarios:

1. **Morning readiness** — Can I go out comfortably?
2. **Air decision** — Should I ventilate, dehumidify, or run purifier?
3. **Day pressure** — When is the day most dense or interruptive?

### 3.3 From static prototype to implementable components

v1.1 experimental defines React and SwiftUI component contracts for:

- `AtmospherePanel`
- `SignalCard`
- `LumenRing`
- `AmbientTimeline`
- `VisualSummaryText`

## 4. Product hypothesis

### Primary hypothesis

Users can understand the current outdoor/indoor/day state faster when key data is translated into **surface density + short sentence + action**, rather than presented only as isolated numbers.

### Secondary hypotheses

| Hypothesis | What to test |
|---|---|
| Density helps prioritization | Users identify the most pressured time block faster than with a plain list |
| Matte signal feels calmer | Users perceive alerts as useful, not stressful |
| Text-first does not weaken identity | Reduced visual modes still feel recognizably Perfora Air |
| Data mapping prevents decoration drift | Designers can explain why each pattern, ring, or surface state appears |

## 5. Target screens for v1.1 experimental

| Screen | Keep from v0.1 | v1.1 experimental addition |
|---|---|---|
| Home / Ambient Dashboard | Large `AtmospherePanel`, signal cards, flow dock | Real data mapping, recommendation priority, scenario audit |
| Weather Detail / Air Flow | Wind ring, hourly flow | Wind comfort score, ventilation suitability, raw data fallback |
| Smart Home Air | Indoor status cards | CO₂/humidity/device decision tree |
| Day Flow | Timeline density | Schedule pressure score, peak explanation, focus suggestion |
| Modes & Accessibility | Toggles | Explicit parity checks for visual summary text |

## 6. Visual direction guardrails

Perfora Air v1.1 experimental must sit between two failure modes:

```txt
Too strong  → glossy Liquid Glass clone / neon weather dashboard
Too weak    → generic pale card UI / Material-like neutral dashboard
Target zone → matte atmospheric dashboard with meaningful density
```

### 6.1 Visual caps

| Visual property | Recommended cap |
|---|---:|
| Surface blur | 0–8px default, 16px max only for overlays |
| Specular highlight | 0.00–0.04 |
| Lumen opacity | 0.10–0.28 default, 0.32 max for alert |
| Active ambient animations per viewport | 1 primary, 1 secondary max |
| Density field opacity | 0.08–0.32 default, 0.38 max for alert |
| Alert copy length | 1 short state sentence + 1 action sentence |

## 7. Success criteria

| Area | v1.1 experimental success condition |
|---|---|
| Comprehension | 80% of test users correctly identify current state within 8 seconds |
| Actionability | 80% choose the intended action for air/ventilation tasks |
| Differentiation | Majority describe the UI as atmosphere/context-based, not glassy or generic |
| Accessibility | No critical info disappears in reduced motion/transparency/high contrast modes |
| Reuse | Components work with at least weather, smart home, and schedule data |
| Implementation | React and SwiftUI starter components render the same state model |

## 8. v1.1 experimental review gates

| Gate | Question | Pass condition |
|---|---|---|
| Data gate | Is every visual state traceable to data or user context? | Yes/no audit per component |
| Visual gate | Does the screen avoid gloss, sparkle, and excessive glow? | Specular and lumen caps pass |
| Accessibility gate | Is equivalent meaning available without motion/transparency? | Visual summary text + raw data pass |
| Product gate | Does the UI lead to a clear action? | Recommendation or next step is visible |
| Brand gate | Is Perfora Air distinguishable from Liquid Glass/Material 3? | Difference is visible and explainable |

## 9. Recommended v1.1 experimental scope

Build one polished path before expanding:

```txt
Home → Air Flow Detail → Smart Home Air → Modes
```

Do not expand beyond the WeatherON experimental layer until the weather/air use case is validated.

## 10. Decision

Proceed to v1.1 experimental by locking the **Data-to-Atmosphere Mapping** first. The mapping is the core differentiator. Without it, Perfora Air risks becoming only a visual skin.


---

# Perfora Air Experimental Data-to-Atmosphere Mapping v1.1

**Date:** 2026-07-15
**Status:** Experimental add-on
**Output files:** `perfora-air.experimental-data-map.v1.1.json`, `perfora-air.experimental-data-map.v1.1.ts`

## 0. Purpose

This document defines how Perfora Air converts raw product data into UI atmosphere.

The goal is to prevent Perfora Air from becoming a decorative layer. Every density field, lumen signal, flow motion, and visual summary sentence must be explainable through data or explicit user context.

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


---

# Perfora Air Experimental Components v1.1

**Date:** 2026-07-15
**Status:** Experimental add-on
**Depends on:** Perfora Air v1.0 stable package + Experimental Data-to-Atmosphere Mapping v1.1

## 0. What v1.1 experimental adds

Perfora Air v1.0 stable components defined the visual grammar. Components v1.1 experimental adds product behavior:

- Data-bound states.
- Loading / insufficient data / offline states.
- Required action copy for alert and critical states.
- Visual summary accessibility contracts.
- Cross-platform implementation props for React and SwiftUI.

## 1. Component priority

v1.1 experimental should not attempt to polish every component equally. The system should prioritize the components that prove the core idea.

| Priority | Component | Why it matters |
|---:|---|---|
| 1 | `AtmospherePanel` | Main identity and main product value |
| 2 | `SignalCard` | Reusable unit for weather, home, schedule, alerts |
| 3 | `LumenRing` | Differentiates direction/progress from generic charts |
| 4 | `AmbientTimeline` | Shows density over time without becoming a plain bar chart |
| 5 | `DataVeil` | Overlay/detail pattern, important but not identity-critical |
| 6 | `FlowDock` | Navigation layer, lower priority for v1.1 experimental validation |

## 2. AtmospherePanel v1.1 experimental

### 2.1 Purpose

The `AtmospherePanel` is the system's signature component. It turns multiple data points into one judgment:

```txt
What is the state? Why? What should I do next?
```

### 2.2 Anatomy

```txt
[Context label]           [mode/state chip]
[Primary state sentence]
[Hero metric / compact metric row]
[Density field / ring / trend visual]
[Reason sentence]
[Recommended action CTA]
[Raw data disclosure]
```

### 2.3 Required content hierarchy

| Layer | Required? | Rule |
|---|---|---|
| State sentence | Yes | Human-readable state before numbers |
| Key metrics | Yes | 3–5 max in collapsed view |
| Visual summary | Yes | Must be traceable to data mapping |
| Recommendation | Yes | Especially alert/critical |
| Raw data | Optional but recommended | Expandable or secondary row |
| Accessible summary | Yes | Same meaning as visual summary |

### 2.4 States

| State | Visual behavior | Copy behavior |
|---|---|---|
| `calm` | Still surface, low density | Reassuring, no urgency |
| `normal` | Air surface, soft density | Informative, maintenance action |
| `live` | Slight flow, notice lumen | Observational, monitor or light action |
| `alert` | Signal surface, alert density | Actionable sentence required |
| `critical` | Text-first, high contrast | Direct instruction required |
| `loading` | Skeleton without density field | No fake atmosphere |
| `insufficientData` | Neutral surface | Explain missing source |
| `offline` | Matte still surface | Last updated time and retry action |

### 2.5 Acceptance criteria

- The panel must make sense with all decorative layers removed.
- Alert/critical states must have a visible action.
- Density must be derived from a named metric.
- `aria-describedby` must include the visual summary.
- Reduced motion must not remove state meaning.

## 3. SignalCard v1.1 experimental

### 3.1 Purpose

`SignalCard` summarizes one data unit: air quality, humidity, next meeting, purifier status, wind, UV, or notification pressure.

### 3.2 Anatomy

```txt
[Label] [state marker]
[Value + unit]
[Caption / reason]
[Optional mini trend]
[Optional action]
```

### 3.3 Variant rules

| Variant | Use | Rule |
|---|---|---|
| Metric | Weather/environment number | Value and unit required |
| Device | Smart home device | Status + location required |
| Schedule | Event/time pressure | Time + priority required |
| Alert | Requires user action | Action sentence required |
| Insight | Text summary | Must not hide raw basis |

### 3.4 Alert behavior

Do not show a card that only turns orange/red. Use this structure:

```txt
공기질 확인 필요
PM2.5 41
공기청정 모드를 높여 주세요.
[실행]
```

## 4. LumenRing v1.1 experimental

`LumenRing` is not a glow decoration. It is used only when circular direction/progress helps comprehension.

Allowed uses:

- Wind direction and speed.
- Air cycle progress.
- Focus session progress.
- Device purification progress.

Disallowed uses:

- Pure ornament.
- Background decoration.
- Alert without text.

## 5. AmbientTimeline v1.1 experimental

`AmbientTimeline` shows the pressure of a period.

| Data type | Timeline meaning |
|---|---|
| Hourly weather | wind/rain/humidity tendency |
| Day schedule | event density and focus gaps |
| Home air | CO₂ or humidity over time |
| Alert history | event intensity |

The timeline must expose a long description:

```txt
하루 밀도 타임라인: 최고점은 15시, 최저점은 06시입니다. 오후에 일정 압력이 높아집니다.
```

## 6. DataVeil v1.1 experimental

Use for overlays, sheets, detail panels, and filters. In v1.1 experimental, DataVeil must support:

- Reduced transparency: opaque surface.
- High contrast: clear border and text priority.
- Escape/close behavior.
- Focus trap if modal.
- No complex density under text-heavy content.

## 7. FlowDock v1.1 experimental

FlowDock is not a showpiece in v1.1 experimental. Keep it simple and accessible:

- Text label + icon.
- Active state through label weight and small marker.
- `aria-current="page"` for active tab.
- Minimum target size 44px.

## 8. Component QA checklist

- [ ] Component has loading/empty/offline state.
- [ ] Component has reduced motion and reduced transparency behavior.
- [ ] Component does not rely on pattern/color alone.
- [ ] Alert and critical states have action copy.
- [ ] Component is traceable to one or more source metrics.
- [ ] Component has a React prop contract and a SwiftUI equivalent.

## 9. Files

- `perfora-air.experimental-components.v1.1.json`
- `perfora-air.experimental-component-types.v1.1.ts`
- `perfora-air.experimental-components.v1.1.css`


---

# Perfora Air Figma Design Kit v0.1

**Date:** 2026-07-15
**Status:** Build blueprint
**Important:** This package does **not** contain a native `.fig` file. It contains a Figma-ready kit plan, variable blueprint, component matrix, and SVG preview that can be recreated in Figma or imported through a custom plugin/script.

## 0. Purpose

Create a reusable Figma kit that keeps Perfora Air from drifting into either glossy glass UI or generic pale cards.

The kit should make the core system repeatable:

```txt
surface + density + lumen + flow + text summary
```

Figma variables are appropriate here because Figma describes variables as a way to represent design tokens and switch designs between contexts such as themes or modes. The kit uses variables for color, number, radius, opacity, and motion modes.

## 1. File structure in Figma

Recommended page structure:

```txt
00 Cover
01 Foundations
02 Variables
03 Components
04 Patterns
05 Templates
06 Accessibility Modes
07 Handoff
```

## 2. Variable collections

### 2.1 PA Color

Modes:

- Day
- Dusk
- Night
- Rainy
- High Contrast

Key variables:

| Variable | Purpose |
|---|---|
| `surface/canvas` | App background |
| `surface/panel` | Main matte panel |
| `surface/panelRaised` | Signal card surface |
| `text/primary` | Primary text |
| `text/secondary` | Supporting text |
| `signal/notice` | Calm notification/light signal |
| `signal/alert` | Action-required state |
| `density/dot` | Pattern dot color |

### 2.2 PA Number

Modes:

- Default
- Reduced Motion
- Reduced Transparency
- High Contrast

Key variables:

| Variable | Default | Reduced mode behavior |
|---|---:|---|
| `surface/blur` | 8 | 0 under reduced transparency |
| `density/opacity` | 0.16 | 0.08 under high contrast |
| `motion/ambientDuration` | 7200ms | 0 under reduced motion |
| `radius/panel` | 28 | same |
| `radius/card` | 18 | same |

## 3. Component set

### 3.1 AtmospherePanel

Variants:

```txt
state = calm / normal / live / alert / critical / loading / insufficientData / offline
mode = day / dusk / night / rainy
textFirst = false / true
density = calm / normal / live / alert / critical
```

Required slots:

- Eyebrow
- State sentence
- Metric row
- Density visual
- Recommendation
- Primary action
- Visual summary annotation

### 3.2 SignalCard

Variants:

```txt
type = metric / device / schedule / alert / insight
state = calm / normal / live / alert / critical
withAction = true / false
withMeter = true / false
```

### 3.3 LumenRing

Variants:

```txt
use = wind / progress / cycle / focus
state = calm / normal / live / alert / critical
directional = true / false
```

### 3.4 AmbientTimeline

Variants:

```txt
dataType = weather / schedule / homeAir
density = calm / normal / live / alert / critical
withPeakSummary = true / false
```

## 4. Layer naming convention

Use names that help engineering handoff:

```txt
PA/AtmospherePanel/normal/day
PA/SignalCard/metric/alert
PA/LumenRing/wind/live
PA/DensityField/normal
PA/TextSummary/visualAlt
```

## 5. Auto-layout rules

| Component | Layout rule |
|---|---|
| AtmospherePanel | Vertical auto-layout, hero visual absolute/background layer |
| SignalCard | Vertical auto-layout, fixed min height, flexible caption |
| LumenRing | Fixed aspect ratio, text slot outside SVG/ring |
| AmbientTimeline | Horizontal bars + text summary row |
| FlowDock | Horizontal auto-layout, 44px min touch targets |

## 6. Accessibility annotations in Figma

Each component should include a hidden/annotation layer named `A11y Summary`.

Example:

```txt
오늘의 공기 시각 요약: 안정 상태입니다. 24도, 습도 62%, 풍속 3.2m/s, AQI 18입니다. 짧은 환기 후 집중하기 좋은 상태입니다.
```

This keeps designers from treating accessibility text as an engineering-only task.

## 7. Included files

- `figma/perfora-air.experimental-figma.variables.v1.1.json`
- `figma/perfora-air.experimental-figma.component-matrix.v1.1.json`
- `figma/perfora-air.experimental-figma.preview.v1.1.svg`


---

# Perfora Air Usability Test Plan v0.1

**Date:** 2026-07-15
**Status:** Ready for lightweight moderated test
**Prototype target:** Ambient Dashboard v1.1 experimental path path

## 0. Objective

Validate the core Perfora Air assumption:

> Users can make faster and more confident decisions when invisible context is translated into surface density, concise text, and clear action.

## 1. Participants

Recommended sample:

- 5–8 participants for first directional test.
- Mix of weather-app users, smart-home users, and productivity/calendar users.
- Include at least 1 participant who commonly uses accessibility settings such as larger text, reduced motion, high contrast, or screen reader.

## 2. Test format

| Item | Recommendation |
|---|---|
| Format | 30–40 minute moderated remote or in-person test |
| Prototype | v1.1 experimental clickable prototype or local HTML app |
| Recording | Screen + audio + task timing |
| Think-aloud | Encouraged, but do not over-explain visual system first |
| Comparison | Optional: plain card baseline for two tasks |

## 3. Hypotheses

| ID | Hypothesis | Pass condition |
|---|---|---|
| H1 | AtmospherePanel helps users judge current state quickly | 80% correct within 8 seconds |
| H2 | Recommendation priority is clear | 80% choose intended action |
| H3 | Density is understood as meaningful, not decoration | 65% mention density/pressure/context in explanation |
| H4 | Reduced modes preserve the same decision | 80% decision parity |
| H5 | Visual tone is calm, not glossy or overdesigned | Average visual fatigue ≤ 2.5/5 |

## 4. Tasks

### T1 — Morning readiness

Prompt:

```txt
지금 외출하기 좋은 상태인지 판단해 주세요. 어떤 근거로 그렇게 생각했나요?
```

Success:

- User identifies weather/air comfort correctly.
- User can point to at least one reason: humidity, AQI, wind, recommendation, or state sentence.

### T2 — Air decision

Prompt:

```txt
지금 환기, 제습, 공기청정 중 무엇을 먼저 해야 할까요?
```

Success:

- User chooses the intended priority action.
- User can explain why.

### T3 — Day pressure

Prompt:

```txt
오늘 가장 바쁜 시간대는 언제로 보이나요?
```

Success:

- User identifies peak timeline block.
- User understands that density means schedule/attention pressure.

### T4 — Alert comprehension

Prompt:

```txt
이 화면에서 확인해야 할 문제는 무엇이고, 다음 행동은 무엇인가요?
```

Success:

- User explains alert reason.
- User identifies next action.
- User does not rely only on color interpretation.

### T5 — Reduced mode parity

Prompt:

```txt
시각 효과가 줄어든 화면에서도 같은 판단을 할 수 있나요?
```

Success:

- User makes the same decision.
- User can locate text summary or raw data.

### T6 — Differentiation check

Prompt:

```txt
이 UI는 기존 날씨 앱이나 일반적인 유리/카드 UI와 무엇이 달라 보이나요?
```

Success:

- User describes context, atmosphere, air, density, calm signal, or decision guidance.

## 5. Metrics

| Metric | How to measure |
|---|---|
| Decision time | Seconds from screen exposure to answer |
| Accuracy | Correct/incorrect against scenario expected action |
| Confidence | 1–5 self-rating |
| Visual fatigue | 1–5 self-rating; lower is better |
| Differentiation | Qualitative coding |
| Accessibility parity | Same decision before/after reduced mode |

## 6. Moderator script

### Intro

```txt
오늘은 새로운 날씨/공기 상태 대시보드 프로토타입을 보실 거예요. 정답을 맞히는 테스트가 아니라, 화면이 얼마나 빠르고 명확하게 상태를 전달하는지 확인하는 테스트입니다.
```

### Before each task

```txt
화면을 보고 자연스럽게 판단해 주세요. 생각나는 근거를 말해 주시면 됩니다.
```

### After each task

```txt
확신도는 1점부터 5점 중 몇 점인가요? 화면이 과하게 느껴졌는지도 1점부터 5점으로 말해 주세요.
```

## 7. Analysis plan

1. Calculate task accuracy and median decision time.
2. Compare normal vs reduced mode decisions.
3. Code qualitative comments into themes:
   - atmosphere/context understood
   - density understood
   - visual effect distracting
   - copy/action clear
   - generic UI impression
4. Decide v0.3 changes.

## 8. Decision rules after test

| Result | Action |
|---|---|
| T1/T2 fail | Rewrite AtmospherePanel hierarchy before visual polish |
| Density misunderstood | Add legend or reduce pattern prominence |
| Visual fatigue high | Lower density opacity and animation count |
| Reduced mode parity fail | Strengthen textual summaries and raw data disclosure |
| Differentiation weak | Increase data-driven surface behavior, not gloss |

## 9. Included file

- `tests/perfora-air.experimental-usability.scorecard.v1.1.json`


---

# WeatherON Adoption Scope Decision

**Date:** 2026-07-15
**Status:** Experimental recommendation
**Design system:** Perfora Air / Project Wind

## 0. Decision summary

Do **not** replace the current WeatherON MVP/launch UI wholesale.

Recommended adoption strategy:

```txt
Data Visualization Kit first
→ Experimental Mode second
→ Full redesign only after usability validation
```

Perfora Air should enter WeatherON as a targeted layer for weather/air comprehension, not as an immediate full product redesign.

## 1. Why not full redesign now

| Risk | Explanation |
|---|---|
| Launch risk | Full redesign could delay the current WeatherON MVP |
| Brand risk | Perfora Air is still a draft design language |
| Data risk | Mapping rules need real weather data validation |
| Accessibility risk | Visual summaries need screen-reader/manual testing |
| Performance risk | Ambient visuals may need low-end device optimization |

## 2. Recommended integration layers

### Layer 1 — Data Visualization Kit

Adopt only the components that directly improve weather comprehension:

- `AtmospherePanel`
- `LumenRing` for wind
- `AmbientTimeline` for hourly flow
- `SignalCard` for AQI / humidity / precipitation
- `VisualSummaryText` helper

This layer can coexist with the current WeatherON UI.

### Layer 2 — Experimental Mode

Add a user-facing or internal feature flag:

```txt
weatheron.features.perforaAir = true
```

The user can test a Perfora Air home variant while the stable UI remains intact.

### Layer 3 — Full redesign candidate

Only consider this after:

- Usability test passes.
- Accessibility parity is manually verified.
- Performance is acceptable on target devices.
- Brand/trademark direction is clarified.

## 3. Suggested rollout

| Phase | Scope | Success metric |
|---|---|---|
| Phase 0 | Keep current WeatherON UI | No disruption |
| Phase 1 | Add Perfora Air `AtmospherePanel` to internal build | Decision accuracy in tests |
| Phase 2 | Add Air Flow Detail with `LumenRing` | Users understand wind/humidity action |
| Phase 3 | Add `AmbientTimeline` to hourly forecast | Peak/pressure comprehension improves |
| Phase 4 | Experimental mode toggle | Retention and satisfaction monitored |
| Phase 5 | Wider redesign decision | Data-backed decision |

## 4. WeatherON screens and fit

| WeatherON area | Perfora Air fit | Recommendation |
|---|---|---|
| Home current weather | Very high | Use `AtmospherePanel` |
| Hourly forecast | High | Use `AmbientTimeline` |
| Wind detail | Very high | Use `LumenRing` |
| Air quality | High | Use `SignalCard` with text-first alerts |
| Settings | Medium | Use reduced mode controls |
| Onboarding | Low-medium | Use only conceptual illustration, not dense UI |
| Widget | Medium | Use simplified text-first atmosphere |

## 5. Data requirements

WeatherON needs stable fields:

```ts
type WeatherONPerforaInput = {
  temperatureC: number;
  feelsLikeC: number;
  humidityPct: number;
  windSpeedMs: number;
  windDirectionDeg: number;
  precipitationProbabilityPct: number;
  aqi?: number;
  pm25?: number;
  hourly?: Array<{ hour: string; humidityPct: number; windSpeedMs: number; precipProbabilityPct: number }>;
};
```

Missing AQI/PM2.5 should not create fake density. Use `insufficientData` state for unavailable air quality.

## 6. Instrumentation

Track events:

| Event | Purpose |
|---|---|
| `perfora_panel_viewed` | Exposure |
| `perfora_recommendation_clicked` | Action usefulness |
| `perfora_mode_toggled` | User interest in experimental mode |
| `perfora_reduced_mode_enabled` | Accessibility/comfort usage |
| `weather_detail_opened_from_perfora` | Whether atmosphere summary drives exploration |

## 7. Engineering impact

| Area | Impact |
|---|---|
| Design tokens | Low-medium, can map to existing color system |
| Components | Medium, 4–5 new components |
| Data adapter | Medium-high, needs reliable mapping |
| Accessibility | Medium-high, visual summary text required |
| Performance | Medium, avoid heavy shaders/particles |

## 8. Final recommendation

Proceed with **WeatherON Perfora Air Experimental Layer**:

```txt
Home AtmospherePanel + Air Flow Detail + VisualSummaryText
```

Do not re-theme the entire app until usability and accessibility tests confirm that Perfora Air improves comprehension rather than only changing the look.


---

# Perfora Air Implementation Package v1.1 experimental

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


---

# External Brand / Trademark Candidate Re-exploration v1.1 experimental

**Date:** 2026-07-15
**Status:** Preliminary knockout screening, not legal advice

## 0. Scope

This document revisits external naming for the Perfora Air design system. It is a **preliminary knockout screen**, not a legal opinion or clearance memo.

A proper trademark review should be performed by counsel using official trademark databases and jurisdiction-specific analysis.

## 1. Legal screening principles

The key issue is not only whether a name is identical. USPTO guidance frames likelihood of confusion around confusing similarity of marks and relatedness of goods/services; similar commercial impression can matter even when goods or classes are not identical. USPTO also notes that related classes should be considered during search, because class numbers alone do not determine safety.

For this project, the likely filing areas remain:

| Nice class | Why relevant |
|---|---|
| Class 9 | Downloadable UI kits, software, mobile apps, design assets |
| Class 42 | SaaS, non-downloadable software, software design/development services |
| Class 35 | Possible marketplace, business/productivity platform use if expanded |
| Class 41 | Possible education/training content if design system is commercialized |

WIPO's Nice Classification is the international classification system for goods and services used in trademark registration. WIPO's Madrid guidance also emphasizes specifying the function/content/field of software services when classifying Class 42 services.

## 2. Naming strategy update

Previous recommendation:

```txt
Internal concept: Perfora Air
External mark: explore more distinctive coined names
```

This remains the right strategy.

`Perfora Air` is excellent as a design-language codename because it directly explains the concept. But as an external mark, it carries avoidable risk because `Perfora` has existing brand signals in other sectors and the dominant word is not fully unique.

## 3. Candidate screening table

| Candidate | Concept fit | Preliminary risk | Recommendation |
|---|---:|---|---|
| **Poravela** | 4.5/5 | Medium-low | Best new external candidate for further official DB search |
| **Aervel** | 4.2/5 | Medium-low | Good short candidate; verify pronunciation and official DB hits |
| **Luvaira** | 3.9/5 | Medium-low | Soft premium option; needs meaning/story support |
| **AerVeil** | 4.0/5 | Medium | Better as product/module name than master mark |
| **Perfora Air** | 5.0/5 | Medium-high | Keep as internal system/codename until formal clearance |
| **Poralux** | 4.0/5 | Medium-high | Prior lighting/industrial signals; not top external mark |
| **Veyra** | 2.4/5 | High | Avoid; software/services trademark signals found |
| **Aivora** | 2.2/5 | High | Avoid; software services filing signal found |
| **Aevora** | 2.4/5 | High | Avoid; existing brand/trademark-like uses found |
| **Aerium** | 2.0/5 | High | Avoid; technology/avionics brand signals found |

## 4. Recommended shortlist

### 4.1 Poravela

**Why it works**

- Sounds coined and ownable.
- Suggests pores/perforation + veil/air without being too literal.
- Less tied to “wind” as a common word.
- Can support a serious design-system identity.

**Positioning line**

```txt
Poravela — ambient interfaces for invisible context.
```

### 4.2 Aervel

**Why it works**

- Short and system-like.
- Suggests air and veil.
- Could work as a product name, design system, or component library.

**Risk**

- Meaning is less immediately obvious.
- Needs pronunciation guidance: “air-vel” or “ehr-vel”.

### 4.3 Luvaira

**Why it works**

- Softer, premium, more brandable.
- Good if the product aims beyond weather into wellness/smart home.

**Risk**

- Less directly connected to perforated surfaces.
- Could skew beauty/lifestyle if visual identity is not precise.

## 5. Names to avoid for now

- `Veyra`: web search surfaced live/pending or registered software-related trademark signals.
- `Aivora`: web search surfaced software services filing signals.
- `Aevora`: web search surfaced existing brand/trademark-like usage.
- `Aerium`: web search surfaced an existing technology/avionics brand.
- `Windframe`: previously excluded because of direct UI/development tool overlap.
- `Vento`: previously excluded because of air/wind-related product and software overlap.

## 6. Official search workflow before any filing

1. Search exact mark in USPTO, WIPO Global Brand Database, KIPRIS, EUIPO, UKIPO, J-PlatPat.
2. Search phonetic variants and spacing variants.
3. Search related meanings/translations.
4. Check Nice Classes 9 and 42 first, then 35/41 if product strategy requires.
5. Review goods/services descriptions, not just class numbers.
6. Check domains, npm, GitHub, Figma Community, App Store, Google Play.
7. Ask counsel for a full clearance memo before public launch.

## 7. Recommendation

For now:

```txt
Internal name: Perfora Air
External candidates to clear: Poravela, Aervel, Luvaira
Module names: Data Veil, Lumen Ring, Ambient Timeline, Signal Card
```

If the project becomes a public commercial design system, prioritize **Poravela** for formal clearance because it is coined, conceptually connected, and less descriptive than `AerVeil`.

## 8. Source notes

Official/legal reference points used for screening:

- USPTO Likelihood of Confusion guidance: https://www.uspto.gov/trademarks/search/likelihood-confusion
- USPTO coordinated classes guidance: https://www.uspto.gov/trademarks/search/using-coordinated-classes-your-federal-trademark-search
- WIPO Nice Classification: https://www.wipo.int/en/web/classification-nice
- WIPO Global Brand Database: https://www.wipo.int/en/web/global-brand-database
- KIPRIS trademark search: https://www.kipris.or.kr/khome/search/searchResult.do?tab=trademark


---

# Static Validation Report

- `figma/perfora-air.experimental-figma.variables.v1.1.json`: ok
- `figma/perfora-air.experimental-figma.component-matrix.v1.1.json`: ok
- `data/perfora-air.experimental-data-map.v1.1.json`: ok
- `data/perfora-air.experimental-components.v1.1.json`: ok
- `data/perfora-air.experimental-brand-candidates.v1.1.json`: ok
- `tests/perfora-air.experimental-usability.scorecard.v1.1.json`: ok
- `../perfora_air_v1_0_package/perfora-air.tokens.v0.1.json`: ok
- `../perfora_air_v1_0_package/perfora-air.components.v0.1.json`: ok
- `implementation/react/package.json`: ok
- `implementation/react/src/AtmospherePanel.tsx`: exists
- `implementation/react/src/SignalCard.tsx`: exists
- `implementation/react/src/LumenRing.tsx`: exists
- `implementation/react/src/AmbientTimeline.tsx`: exists
- `implementation/swiftui/PerforaAirComponents.swift`: exists
- `implementation/react/src/dataMap.ts + types.ts + visualSummary.ts`: TypeScript syntax check passed with `tsc --noEmit`.
- `figma/perfora-air.experimental-figma.preview.v1.1.svg`: XML parse passed.
- `implementation/swiftui/PerforaAirComponents.swift`: Source file provided; SwiftUI compile was not run in this Linux environment because SwiftUI framework availability is platform-dependent.
