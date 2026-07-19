# Ambient Surface Experimental Components v1.1

**Date:** 2026-07-15
**Status:** Experimental add-on
**Depends on:** Ambient Surface v1.0 stable package + Experimental Data-to-Atmosphere Mapping v1.1

## 0. What v1.1 experimental adds

Ambient Surface v1.0 stable components defined the visual grammar. Components v1.1 experimental adds product behavior:

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
