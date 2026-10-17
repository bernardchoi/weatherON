# iOS Home Ambient Surface reaction implementation — 2026-10-09

## Follow-up physical verdict — FAIL

The user subsequently reported idle as barely perceptible, no visible hold/move response, and only stars disappearing/reappearing during scrolling. These three experience checks failed. Earlier source/build/pixel passes do not override this verdict. The new user video was prepared through Library but byte transfer returned HTTP403; no readable video exists locally and no video-based diagnosis is claimed. See the subsequent input/scroll/light visibility defect report.

## Result and scope

Implemented the subsequently approved three layers (slow ambient base → current weather/day cycle → local finger response) and supporting weather icon in the isolated `feat/ambient-surface-foundation-home` checkout. Incremental ARM64 jobs1 build, existing signature verification and data-preserving overwrite installation succeeded. Remote main was rechecked and remains `49a628f05649541be4dc1577b18263e606e9af3a`. No commit, push, main merge, deployment, app deletion, data reset, authentication/signing/security setting change or dependency addition occurred. Other screens were not converted.

The original approved 104-PNG core package and Final v1 SVGs remain intact. Previous foundation/Home QA reports describe their pixel inspection and mapping. Latest user approval changes the hero icon's role/size; this is an intentional difference from the static core board.

## Behavior

- `AmbientSurfaceBackground.tsx`: native animation clock, approximately 35–44 seconds according to bounded observed wind and precipitation; diffuse light/density/scale movement continues for a valid calm weather state too. Reading content is stationary. No claimed wind direction or pressure. Existing Android treatment is retained.
- `AmbientWeatherLayer.tsx`: local clipped weather region alongside the temperature, away from reading labels. Current rain/heavy rain flows; snow drifts; cloud/fog planes move. Storm receives restrained local light modulation, not inferred lightning. Actual condition and reliability govern the layer. Unknown/stale/loading data cannot create precipitation.
- Clear daylight has slow light, twilight warm light, clear night stars. Clouds/rain/snow suppress clear-sky effects. A rare meteor waits at least 90 seconds initially and 120 seconds subsequently; a process-wide deadline prevents forced playback on each Home entry. No per-frame JS timer; one bounded timeout schedules a native streak. Calendar season is a subtle secondary color input (currently clearest for winter); it does not manufacture snow/leaves or imply a climate forecast.
- Provider data has no observed sunrise/sunset. Reused existing solar calculation with the **matching observed/selected location coordinates and timezone**. No new API or permission. Missing/polar solar events give unknown/neutral sky. Twilight is within 30 minutes of computed sunrise/sunset.
- `ambientTouch.ts` + Home passive touch listeners: one finger down/hold follows native measured local coordinates through `Animated.ValueXY`, up decays over 420ms; down attack 110ms. No responder claim or preventDefault. Scroll/momentum/multitouch/cancel/background clears contact. Generation checks reject stale asynchronous measurement; canceled contacts cannot replay on foreground. Existing button/tab/scroll handlers remain.
- Reduced Motion and low power stop continuous motion; contact has an immediate static equivalent. Reduce Transparency removes translucent fields and uses a bounded static contact outline. Public `ProcessInfo.isLowPowerModeEnabled` and power-state notification provide low-power detection. AppState stops/restarts ambient and clears touch. Weather text, temperature and accessibility weather-detail label remain readable independently of animation.

## Icon clarity diagnosis and change

Approved hero SVG viewBox is 64×64. Its gradients and cloud-fold `feGaussianBlur stdDeviation=.75` are intentional; the outside silhouette is not blurred. Runtime derivatives are 256×256 PNGs, rendered from those approved vectors with preserved shape/color. Previously 126pt at a 3× device needed 378 physical pixels, above 256; new general supporting icon is **72pt / 216px**, downsampled from 256. The older clear-night source has no matching approved night vector in this package and is only 96×96; it is now **32pt / 96px**, avoiding invented icon design or interpolation upscale. Original asset pixels and actual installed result were inspected. No source asset was overwritten or replaced by a new design. The 126pt surrounding weather frame is retained as bounded atmosphere/spacing; its icon itself is smaller. Temperature's earlier 10% reduction, uncapped two-sentence companion layout and measured single-viewport spacing are preserved.

## Validation

Passed:

- TypeScript `tsc --noEmit -p apps/mobile/tsconfig.json`.
- `check-ambient-response.mjs`: executes actual touch controller for hold/move/up/multitouch/cancel/late measurement; actual reliability/density/solar/timezone/season; actual weather-layer JSX and monotonic native interpolation in **32 labeled weather/day-cycle fixtures**. These are source fixtures, not live-weather/physical-gesture evidence.
- `check-ambient-surface-regressions.mjs`: actual component/hook lifecycle, installed RN native gradient parser, background/Reduced Motion/Reduced Transparency/low-power, current precipitation, safe-area coordinate conversion, no old contact attack after background/foreground. Conservative text/muted/action-label contrast minima dark 7.87/5.19/4.73:1 and light 12.52/5.37/4.57:1; functional light icon/large ON remain ≥3:1. Local weather effects are clipped away from labels.
- Actual Hero JSX checks across iOS/Android, light/dark, weather, KO/EN/JA and font scales 1/1.6/2; measured viewport/overflow source checks; localization/native exports (88 consumers); iOS reliability (76 SQL failure points plus notification/weather races); shared/weather-outfit regressions; `git diff --check`.
- Supplementary DOM model executes actual Hero/styles and actual app fonts at 320/384pt, KO/EN/JA, scales 1/1.6/2, without horizontal overflow. Initial sandbox browser launch failed; approved local browser execution succeeded. It is **not** native Dynamic Type evidence.
- One incremental iOS native build only; `** BUILD SUCCEEDED **`. `codesign --verify --deep --strict` passed. Hermes SHA256 `3ea7fe8664e7b138cccb4b1517d8793c56f474e8f93f7b659eacfa41409b1aa6`.

Actual physical evidence (all outside repository, in `local-evidence/`):

- `ios-ambient-reaction-build.log`, `ios-ambient-reaction-install.json`, `ios-ambient-reaction-console.log`.
- `ios-ambient-reaction-time-0.png`, `...-1.png`, `...-2.png`: actual iPhone16ProMax/iOS27.0.1,1320×2868; file timestamps 23:24:31/23:24:59/23:25:36 KST,65 seconds. Actual current clear night/17°, no weather/settings/touch injection. Source/controller fixtures were not installed as weather values.
- Last actual capture SHA256 `3127fe9b2cd8da45650a42f4fbd5edeb834ab06376a5b87ce218e723e368c1db`.
- `ios-ambient-reaction-temporal-metrics.json`: unchanged reading/content positions; background RGB arithmetic temporal span upper0.774/255, contour1.193/255; bounded star ROI max27.667/255. ROI excludes temperature/labels/moon/status/dock. This demonstrates temporal rendering, **not subjective liveliness or touch latency**. Earlier installed dark baseline was upper0.443/255, contour0.770/255, under different instantaneous weather/phase; this is not a controlled perceptual comparison.
- Actual screen has the existing development warning banner over the lower nav; it remained through the sequence. No automation to physically tap its dismiss button is available, and warning handling/authentication was not altered to create a clean screenshot. Current capture is honestly retained. Screen-recording capability remains unsupported (previous CoreDeviceError1001).

## Remaining physical checks

The user's four earlier physical usability checks remain PASS for the preceding installed build; they are not replayed or expanded here. New native touch experience remains unverified because no real physical input tool is callable. A short new check on the installed build is appropriate: hold a blank area → move → release (follow/fade), scroll or background while holding → return (no old flare), observe idle without touching (does it feel naturally alive?). Reduced Motion/Transparency and low-power live toggles, native day/twilight/rain/snow/cloud visuals, and rare meteor are also not claimed as physical passes. Do not substitute source fixtures or brightness differences for these.

No app rendering error was observed in the captured sequence. Existing debug warning and prior unexplained16-second signal9 termination remain under the earlier read-only diagnosis; no new cause or authentication fix is claimed. The attempted separate parent-thread message returned `thread not found`; final delegated delivery is relied upon instead.

## Changed source and test files for this reaction increment

`apps/mobile/src/components/AmbientSurfaceBackground.tsx`, new `AmbientWeatherLayer.tsx`, `AmbientSurfaceTexture.tsx`; `apps/mobile/src/screens/HomeScreen.tsx`; new `utils/ambientTouch.ts`, `utils/ambientWeatherMotion.ts`, `utils/weatherDaylight.ts`, `utils/useIsNightHour.ts`; `apps/mobile/ios/WeatherON/LiquidGlassNavigationView.{swift,m}`; new `scripts/check-ambient-response.mjs`, updated `scripts/check-ambient-surface-regressions.mjs`. Prior foundation/common component, palette, assets/localization/debug changes are recorded in the earlier stage reports. QA workspace/project has been moved back outside the repository and transient dependency link removed after verification.
