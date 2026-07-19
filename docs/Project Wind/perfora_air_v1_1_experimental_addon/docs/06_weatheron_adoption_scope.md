# WeatherON Adoption Scope Decision

**Date:** 2026-07-15
**Status:** Experimental recommendation
**Design system:** Ambient Surface / Project Wind

## 0. Decision summary

Do **not** replace the current WeatherON MVP/launch UI wholesale.

Recommended adoption strategy:

```txt
Data Visualization Kit first
→ Experimental Mode second
→ Full redesign only after usability validation
```

Ambient Surface should enter WeatherON as a targeted layer for weather/air comprehension, not as an immediate full product redesign.

## 1. Why not full redesign now

| Risk | Explanation |
|---|---|
| Launch risk | Full redesign could delay the current WeatherON MVP |
| Brand risk | Ambient Surface is still a draft design language |
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

The user can test a Ambient Surface home variant while the stable UI remains intact.

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
| Phase 1 | Add Ambient Surface `AtmospherePanel` to internal build | Decision accuracy in tests |
| Phase 2 | Add Air Flow Detail with `LumenRing` | Users understand wind/humidity action |
| Phase 3 | Add `AmbientTimeline` to hourly forecast | Peak/pressure comprehension improves |
| Phase 4 | Experimental mode toggle | Retention and satisfaction monitored |
| Phase 5 | Wider redesign decision | Data-backed decision |

## 4. WeatherON screens and fit

| WeatherON area | Ambient Surface fit | Recommendation |
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

Proceed with **WeatherON Ambient Surface Experimental Layer**:

```txt
Home AtmospherePanel + Air Flow Detail + VisualSummaryText
```

Do not re-theme the entire app until usability and accessibility tests confirm that Ambient Surface improves comprehension rather than only changing the look.
