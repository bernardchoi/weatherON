# WeatherON iOS brand palette — 2026-10-12

This is the current mobile color implementation on the local brand-alignment branch, based on feature commit `1a258866e016bef65dd794be5981b7900909bf07`. It supersedes the older UI Design Spec color tables for app presentation. Original icon packages and approved October09 static PNG boards remain historical evidence and are unchanged.

The source of truth is [brandPalette.ts](../../apps/mobile/src/theme/brandPalette.ts), mapped into [tokens.ts](../../apps/mobile/src/theme/tokens.ts). On iOS both themes, every route and the non-Ambient/reduced-transparency fallback share the same identity. Android/web retain all original color roles from feature 1a258866; Platform.OS selects iosAppThemes versus androidAppThemes. The icon's neutral sea-teal base connects the app to the Ambient B launcher; it does not prescribe every weather, action or status hue.

| Role | Light | Dark |
|---|---|---|
| Brand base (actual B icon background) | #E9F6F8 | #102B38 |
| Base variation | #D5EAEC | #21414C |
| Surface | #DDEFF2 | #1A3945 |
| Elevated surface | #F4FAFB | #244854 |
| Main text | #183844 | #F4F8F8 |
| Neutral text | #49656F | #C4DCE3 |
| Glass material tint | #B6D0DA | #B6D0DA |
| Border | #B8D2D8 | #3D606D |
| Home ON only | #80591F | #D8BB7A |
| Action fill | #DA3622 | #FFB52E |
| Action label / gold compatibility | #AA2C1F | #FFD17A |
| Success / completion | #006D63 | #5DE2C2 |
| Information / rain | #1A6399 | #58BFFF |
| Warning / warm | #B43F28 | #FF9A66 |
| Error / destructive | #B42318 | #FF9A94 |

## Role mapping and scope

- `background/card/cardStrong/cardSoft/nav`: brand base and surfaces. Safe areas, startup/background, navigation and reduced-transparency variants use the same identity. Card surface is a role, not an arbitrary blue weather tint.
- `materialTint`: neutral material color used by Glass derivations, separate from `sky/skyLite`. The native weather material fallback uses the same surface RGB values. Native UIGlassEffect and the OS blur/render are unchanged.
- `actionFill`: saturated CTA fill. `clear` remains a legacy action-label/selection API (light #AA2C1F, dark #FFB52E); small text no longer relies on a fill hue with insufficient contrast. AppButton and primary Glass overlays use the explicit fill.
- `success`: ready/complete/permission state. StatusPill, completion feedback, weather ready, location status, permission/account ready and saved/accepted states use it. Action/selection controls keep action colors.
- `gold/warm/alert/sky`: compatibility semantic colors. Error and warning retain their separate hues, and rain/cold/information remain independent. Ambient reading adapters no longer collapse sky/warm/clear onto neutral/action values.
- `wordmarkOn`: quiet sun-family brand exception. Weather uses the neutral foreground; only the iOS Home SVG ON path reads this token; Android retains its original text and palette. The existing Home StyleSheet and other text sizes are unchanged. The approved logo uses its own180×30 viewport (actual ink23.272pt high), preserving the former24pt impression. The source workspace supplied selected02 contours directly after inspecting the approved original. Home now renders the preserved JSON paths through IosHomeWordmark; see assets/wordmark/home-02/README.md. No substitute font or curve edits were introduced.
- Only iOS base-gradient color stops change. Original light/airflow/reading-fold tints, positions, opacity, motion phase, touch observers and timing are preserved byte-for-byte. Weather/daylight/sun/rain/particle shaders, condition mapping, data and layout are unchanged.
- Review covered all main/detail/settings/account/onboarding/hidden-route components through shared theme use and the remaining inline-color inventory. Auth-provider brand colors, white switch thumbs, white destructive-action text, black scrims/shadows and weather illustration pixels remain intentional exceptions. Android material and inverse snackbar surfaces are restored byte-for-byte to feature 1a258866.
- Widgets/Live Activity have independent native palettes and are outside this mobile-screen implementation. Launcher icon SVG/PNG/.icon assets are preserved; only non-icon native chrome/fallback color code changes.

## Reference and history

Ambient B `.icon/icon.json` layer specializations:
background #E9F6F8/#102B38; sun #FFC650/#FFCC59; fold #4B9EAD/#4097AA; cloud #547F94/#F4F8F8.
Source: `assets/brand/ambient-b-platform-20261008/` and `apps/mobile/ios/WeatherON/WeatherON-Ambient-B.icon/`.

Old base #071E33 and card #103D5F predate Ambient. `0036062` introduced #0C2035 / #142D46 with independently selected UI colors. `0e804e5` added the still-blue common gradient. This work makes the identity relationship explicit for iOS first.

The audit proposal's #91652A light ON and #54717B light neutral were darkened to #80591F/#49656F to cover darker gradient stops. Dark muted #B6D0DA was raised to #C4DCE3 after the conservative flow+touch overlap test measured only 4.33:1. The threshold was kept at 4.5:1. Material tint remains #B6D0DA. Light success/information/warm text shades were also deepened within their original hue families for the new surfaces; filled action saturation was retained. Dark error was lightened within red to #FF9A94 and destructive filled controls use a dedicated onAlert foreground, keeping their text readable.

## Verification boundary

Run `node scripts/check-brand-palette.mjs` for solid-surface text/ON/filled action contrast and semantic/reduced-transparency invariants, and `node scripts/check-ambient-surface-regressions.mjs` for actual component lifecycle, installed RN gradient parser and conservative flow/weather/touch overlap bounds.

Android/web code renders provide baseline-equivalent H1/C1/G1/M1 light/dark at 390×844: all eight images have zero changed pixels. iOS Home is separately rendered with actual iOS branch JSX, fixed fixture weather, a React Native Web adapter and 24px wordmark text. Selected02 is now included from the source-provided contour data, using native SVG Path with explicit fills. The consuming environment still has not opened the original PNG; producer-disclosed raster extraction/smoothing is not claimed pixel-identical. Synthetic iOS Platform/RN Web harnesses inspect details/settings/permissions/account and inert callbacks. These do not reproduce UIKit Glass, physical touch, device fontScale, native status bars, live services or device thermal behavior. No device install, commit, push, PR, merge or deployment is included.


## Platform and behavior boundary

Run `node scripts/check-ios-brand-platform-boundary.mjs`. It compares all original Android theme keys in eight light/dark + transparency/dynamic settings, Home/reading palettes and semantic colors against immutable baseline 1a258866. Fourteen motion/layout/data files and Android material are byte-identical. The native Swift file differs only in the opaque HomePlan material RGB expression. Home StyleSheet and accessibilityLabel WeatherON are unchanged. No mascot asset is referenced by the app patch.

Mac is offline: Xcode build, installation and physical-device rendering remain incomplete. This is source preparation, not completed iOS installation. Original iOS artwork is preserved. The selected02 contour data was handed off directly from the source workspace and is rendered in Home only; native build/device verification remains pending.
