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
