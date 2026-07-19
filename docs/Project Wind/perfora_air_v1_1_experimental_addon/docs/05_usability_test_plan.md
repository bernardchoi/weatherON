# Ambient Surface Usability Test Plan v0.1

**Date:** 2026-07-15
**Status:** Ready for lightweight moderated test
**Prototype target:** Ambient Dashboard v1.1 experimental path path

## 0. Objective

Validate the core Ambient Surface assumption:

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
