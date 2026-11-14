# Home mascot layout adjustment (2026-11-14)

Base: main `55635e1359593e2ff4b9c26118f7006c2cc9269c`.

- Moved the iOS decorative mascot out of the location/header row into the weather hero.
- Kept the existing temperature size on its own line. Weather status, feels-like and high/low appear below, with the mascot on the right.
- Character canvas is 144pt, or 120pt below 390pt width (previously 80/56pt).
- Above 1.3x Dynamic Type, weather details use full width and the mascot follows beneath, right aligned. No text truncation was added.
- Removed the dark-mode contrast circle only; original artwork, clothing/forecast mapping, animation policies and light artwork are unchanged.
- Moved the conservative scroll pause threshold to 300pt for the lower placement. Actual visibility/frame pacing still needs native-device QA.

## Verification

Passed: mobile TypeScript, `check-home-mascot-layout` (40 combinations), `check-home-mascot-transitions`, `check-home-mascot`, `check-mascot-outfit`, `check-home-outing`, `git diff --check`.

`check-home-weather-icon` fails a Japanese missing-translation fallback whitespace assertion identically on unchanged main and this branch. Not changed as part of this layout fix.

Safari rendered the actual extracted HomeDecisionHero and actual mascot via RN Web for light/dark, 390pt/320pt and 2x type. No dark circle or overlapping text/character was observed. The harness uses simplified header/card boundaries, fonts and weather-icon boundary, not the full native screen. It is not proof of iOS native rendering, actual Dynamic Type, VoiceOver, animation clipping or frame pacing. The native-device checks remain outstanding.

Reproduce the non-device preview using `node scripts/render-home-hero-layout-qa.mjs`, then open localhost:8786. No generated captures, dependencies, builds or release state are included. No commit, push, merge or deployment performed.


## Extended browser-only size verification

Per the user's restriction, no real iOS device, simulator, emulator, native build or deployment was used.

Product scope from checked-in configuration: `TARGETED_DEVICE_FAMILY = 1`, `supportsTablet: false`, portrait (native Info.plist additionally lists upside-down portrait). iPhone portrait is the supported product target. iPad-like widths and landscape-like short heights below are stress tests, not a claim of tablet/landscape support. No device-model inventory or “every current/future iOS device” guarantee is implied.

AppNavigator subtracts safe-area insets before resolving responsive content width/height. Home uses that container width, responsive padding (16/20/28/32pt), and content max-width (640/680pt), inside the existing vertical scroll view. Browser cases use effective content widths rather than simulating a notch. Native inset delivery/keyboard/rotation rendering is not exercised. Existing `check-ios-resizable-layout` and `check-ios-reserved-regions` passed.

Final RN Web matrix: 9,720 cases = 30 effective widths (288,320,360,375,390,393,402,414,420,428,430,440,568,667,736,744,768,810,820,834,852,874,896,912,926,932,956,1024,1194,1366) × 2 available heights (390,900) × 9 font scales (0.82,1,1.15,1.3,1.31,1.6,2,2.35,3.12) × 3 language-length fixtures (KO/EN/JA weather status/range; stale notice) × 2 themes × 3 mascot assets (base/rain/heat). Fonts use the repository's Pretendard Regular/Light. Language fixtures are stress strings, not complete native localization QA. All cases passed DOM text horizontal-overflow, mascot/details overlap, outside-body, next-card overlap and dark-circle checks. RN Web does not reproduce all UIKit font metrics or auto-fit behavior.

The initial matrix exposed possible giant-temperature overflow at high font scale. Only the iOS giant temperature now caps its multiplier at 1.3; its existing single-line auto-fit remains. Weather detail text remains uncapped and can wrap. Numeric value and accessibility label are unchanged. This is a deliberate tradeoff: giant decorative typography remains readable without crowding the otherwise fully scalable detail text.

Remaining limits: full native Home chrome, genuine Dynamic Type category mapping, VoiceOver, pixel clipping during native motion, native frame timing, actual safe-area transitions and all possible future screen sizes are not established by this browser test. Static motion/transition gating tests passed; browser geometry checks use Reduced Motion for stable measurements.

An additional pre-existing `check-mascot-artwork-registration` script fails identically on main because its hardcoded historical commit lacks profile/frost.png. No artwork changed here; the historical test reference was left outside scope.

## iPhone Duo follow-up (browser-only)

Correction to the ordinary-phone orientation scope above: Apple explicitly says the open Duo still runs an **iPhone app**, so device family 1 / supportsTablet false does not itself exclude Duo. Its inner display can use orientations beyond the app's ordinary supported orientation setting. iPad widths remain stress cases, but Duo inner rotation is a relevant adaptive requirement.

Official references reviewed:
- https://developer.apple.com/iphone-duo/prepare/ (iOS 27 SDK dynamic resizing, earlier-SDK compatibility, iOS 27.1 full-display behavior)
- https://developer.apple.com/videos/play/tech-talks/111461/ (iPhone identity, size classes, inner orientation, asymmetric safe areas/reserved regions)
- https://www.apple.com/iphone-duo/specs/ (physical panel pixels)
- https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/ (app screenshot pixels)

Physical panel pixels and inner app screenshot pixels differ. No official fixed usable logical viewport or safe-area point table was verified. Consequently the following dimensions are explicitly test assumptions, **not native device measurements**: frame sizes 466×678,669×951,951×669 (screenshot-based at assumed 3x), plus475×669 and466×338 reduced-window stress cases. Insets in top/left/bottom/right order: (0,0,0,0),(24,0,34,84),(24,84,34,0),(34,0,24,84). Central full-height division widths0/20pt. All inset/division values are synthetic stress inputs, not Apple-specified Duo constants.

The actual reserved-region and navigation-container resolvers were applied to40 scenarios, yielding effective content widths181–859pt. Initial checks exposed narrow-pane giant-temperature overflow. Temperature base size now also respects available width (available padded width÷3, capped at the existing84/96pt); below320pt weather detail and mascot stack vertically. The1.3 multiplier cap remains restricted to the giant temperature. No value/data/accessibility-label changes.

`check-home-duo-scenarios.mjs`: 2,880 actual extracted Hero/mascot RN Web cases (40 geometries×4 scales1/1.3/1.6/3.12×3 language fixtures×2themes×3assets), zero DOM failures and zero JS errors. No real device or emulator was used. Existing AppNavigator consumes live useWindowDimensions, independent safe insets, reserved-region resolution and responsive navigation/content layout. Native reserved-region delivery and SDK-specific open/close behavior have not been executed or guaranteed; full-app continuity, native animation and VoiceOver still require later permitted native validation.

After the narrow-pane fix, the original9,720-case regression matrix was rerun: zero failures, zero JS errors.

Pre-commit structural coverage expanded to50 combinations including181pt panes; checks also reject non-finite temperature sizes.
