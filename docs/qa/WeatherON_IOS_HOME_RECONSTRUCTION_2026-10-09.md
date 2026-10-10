# iOS Home coordinated reconstruction — physical dark reviewed, final acceptance pending

## Reference and installed result

Approved final October09 package104 PNG, core H1 `01-core-ios-dark-v3.png` / `01-core-ios-light-v3.png`; both original pixels reviewed again. Final v1 line SVGs retained. Main base49a628f05649541be4dc1577b18263e606e9af3a, isolated branch `feat/ambient-surface-foundation-home`. No commit/push/merge/deploy.

Physical iPhone16ProMax/iOS27.0.1, wireless overwrite install, same bundle ID and existing app data. Latest20:50KST runtime screenshot1320×2868: `local-evidence/ios-home-reconstruction-refinement-dark.png`. HermesSHA `59f8d778a619aa532a569dd4cccfbcec724451e18f688adcb525b56402386482`. It is an actual capture, not a synthetic board. The development warning toast remains visible and covers dock lower pixels. A prior20:18 screenshot without a banner belongs to the previous installation and cannot validate this dock.

## Five areas: actual pixel decisions

Original panel352×851; physical app content+dock440×860pt (system safe areas excluded only in CSS comparison). Equal-content-height scale851/860. Original full images remain unchanged; comparisonHTML performs only CSS framing. Measurements below are approximate bright bitmap glyph bounds (>210 RGB), not original design font metadata. Live data and actual garment assets differ legitimately from the example board.

|Area|Actual pixel evidence|Decision / residual|
|---|---|---|
|Temperature/outfit type hierarchy|Reference glyph heights79/27/24 (temperature/companion/outfit title). Latest actual normalized78.5/26.4/23.1. Relative tops reference119/291/560, actual normalized111.5/285.6/549.5.|Major undersizing corrected; hierarchy passes this default-size dark comparison. Remaining vertical offsets~5–11 and registered-font letter metrics differ; not pixel-identical. Wordmark is quieter, ON subdued only here. DynamicType and light pixels pending.|
|Basic weather composition|Large real temperature, condition and min/max, compact normal preparation phrase. Floating weather image and normal auto-location status, repeated feels/rain row removed on iOS only.|Normal dark composition passes. Forecast accessibility retains feels/rain and forecast screen retains details. Manual/unknown location, refreshing, loading, cached/unreliable companion messages and WeatherStatusPanel retained in source. Physical error-state transitions still pending.|
|Destination/outfit placement and rhythm|Name followed immediately by down outline; time and prep controls below. Outfit heading normalized~549.5 vsreference560, actual garments overlap above dock; redundant outfit footer removed on iOS, semantics retained in button label/detail.|Major rhythm/selector defects corrected. Residual: destination bitmap glyph~15.5 vsreference19 and top~371.1 vs385, so its typography/placement is not a full fidelity pass yet. Long names/large text/empty sheet and physical navigation pending. Initial compact flex regression made name disappear; fixed and visible in final actual capture.|
|Dark light field|Upper-right broad bright peak replaced with darker middle-height diffuse field. Current wind controls native gradient opacity/tempo/scale, current rain controls density, no example wet pattern in dry weather; touch follows measured actual surface coordinates.|Background color/peak improved; fine uneven photographic light/grain of approved board is still not matched. Native faint gradients now visible but restrained. Overall surface fidelity remains partial; light actual pixels and physical moving/touch tests pending. No raster board background or fabricated wind bearing.|
|Quiet round selected dock|UIKit and JS fallback use a centered round selected diameter min(tabWidth−8,height−8), native drag inset/snap math updated; icons/labels larger, subdued blue blur and hairline border. Latest capture shows round upper selection instead of broad pill.|Native installed geometry visible, but toast hides the label/lower boundary. Entire dock color/roundness/fidelity remains unverified until banner-free latest capture; no claimed pass based on source or previous screenshot. Tab taps/drag/VoiceOver pending.|

## Source changes in this reconstruction

- `apps/mobile/src/screens/HomeScreen.tsx`: iOS hierarchy/composition, conditional normal status, forecast accessibility, destination inline selector, photo/title rhythm; weather/outfit/destination values, routing, alerts and pull refresh preserved.
- `apps/mobile/src/components/AmbientSurfaceBackground.tsx`: stable darker middle reading field, bounded weather-driven diffuse wind field; existing reduced-motion/app-state freeze and actual-coordinate touch retained.
- `apps/mobile/src/components/BottomNav.tsx` and `apps/mobile/ios/WeatherON/LiquidGlassNavigationView.swift`: round selection geometry with drag math, restrained border/blur, readable icons/labels. Common iOS navigation only; other screen content unchanged.
- `apps/mobile/src/localization/locales/en.json` / `ja.json`: normal shortened preparation and expanded accessible descriptions. Source catalogs2066 messages.

Earlier foundation changes remain staged nowhere: scoped `ambientSurface.ts`, final SVG PNG derivatives/source manifest and `ambientAssets.ts`, AppButton underline cleanup, safe localization native explicit runtime exports, actual lifecycle/source checks and previous QA reports. Original assets not overwritten. Dependencies/CI/manualAndroid/XcodeCloud settings unchanged. Android full work paused.

## Validation

PASS: mobile TypeScript; localization2066; actual Metro/localization exports86 consumers; Ambient actual component/hook lifecycle, installed RN native gradient parser, current-rain/wind bounds, background/Reduce Motion/Reduce Transparency freeze, actual Home touch-coordinate conversion; iOS reliability76 SQLite failure cases/weather stale/races and native notification boundary regressions; review storage/photo/notification/timezone regressions; git diff check.

Conservative brightest-flow+touch contrast: dark body7.65, muted5.04, functional accent label4.60; light body15.32, muted4.62, accent label5.34. Light functional icon3.69 and large wordmarkON3.69. First increased dark flow trial failed accent4.38; capped to pass4.60 before build. These are source drawing bounds, not native VoiceOver or display measurements.

Three sequential ARM64 jobs1 incremental builds, each after process inspection; no clean/concurrent build. First reconstructed layout built/installed, second fixed the actually observed disappearing destination name, third corrected measured small companion/weak field. All BUILD SUCCEEDED and codesign strict/deep passed. New changes and actual findings justified each increment; no repeated unchanged build. Final logs in task-2/evidence: `ios-home-reconstruction-refinement-build.log`, `...-install.json`, `...-console.log`, `...-capture.json`, `ios-home-reconstruction-pixel-measures.json`. RN JS bundle evaluated; no observed fatal/redbox. Existing BackgroundModes and Metro-inspector warnings retained, not suppressed.

## Remaining manual QA / concrete blocker

Latest banner-free screenshot unavailable: warning toast must be closed on the physical iPhone. Mac iPhone Mirroring cannot take over while this phone is in use; no security/auth changes or alternate tap hacks. User action requested: close banner ×, leave Home; then switch app appearance to light and return Home. Global DynamicType/VoiceOver/Reduce Motion tests require user action or explicit approval first. No such global changes made. Touch/tabs/drag/pull refresh/re-entry/error/empty/loading physical matrix remains pending; source mocks do not replace it.

No private database was copied; earlier automatic rejection boundary respected. No Library403 workaround/reupload/alternative export. Latest results are local-only. Overall fidelity sign-off and later screen migrations remain paused until latest banner-free dark/light review and residual corrections.
