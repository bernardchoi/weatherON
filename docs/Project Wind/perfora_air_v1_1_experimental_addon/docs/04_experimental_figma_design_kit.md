# Ambient Surface Figma Design Kit v0.1

**Date:** 2026-07-15
**Status:** Build blueprint
**Important:** This package does **not** contain a native `.fig` file. It contains a Figma-ready kit plan, variable blueprint, component matrix, and SVG preview that can be recreated in Figma or imported through a custom plugin/script.

## 0. Purpose

Create a reusable Figma kit that keeps Ambient Surface from drifting into either glossy glass UI or generic pale cards.

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
