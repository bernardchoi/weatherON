# iOS Home one-viewport follow-up — 22:21 KST

## Subsequent user verification

On the later installed bundle `bb8f5ab1a65895c2463078be3a6f434f3b3a1ea6383671116bdceedbba21db7b`, the user directly confirmed the shared four-point checklist had no issues. Standard-text Home without clipping, dark readability, each-tab → Home return, and large-text full-content access by scrolling are therefore **PASS — user-performed physical verification**. This supersedes the corresponding pending user checks below. It does not turn this task's numeric0.882 evidence into a measured1.0 pass, nor prove exact design matching, notification delivery, VoiceOver or Reduce Motion. No new build/install occurred after that confirmation. Latest details are in `WeatherON_IOS_HOME_CONTINUED_QA_2026-10-09.md`.

User preference: keep weather → departure/preparation → outfit → navigation visible at a glance on a normal iPhone, while permitting natural scrolling for small screens, large Dynamic Type, long translations and mandatory errors. This is not permission to remove information or globally shrink controls.

## Implementation

The Home ScrollView now measures its own actual native frame with `onLayout`. AppNavigator's SafeAreaView wraps the navigation stack, and BottomNav is its sibling outside the scroll region; this measurement therefore already excludes both safe areas and dock. `resolveHomeViewportSpacing` changes only whitespace based on measured usable height. Under 800pt: section gaps 8→6pt, top padding approximately27.5→16pt, preparation margin26→8pt, preparation gaps14→6pt, hero gap14→10pt, outfit padding16/12→12/8pt. Larger frames use relaxed values. No fixed content height, maximum content height, scroll disabling, text-scale ceiling or text ellipsis was added by this change. Pull refresh, existing forecast/destination/outfit detail actions, empty/loading/stale/error/official alert content remain.

The preceding user-requested type changes remain: normal iOS temperature112/108pt (previous124/120), short variant90/90; guidance30/39pt (previous34/42), full translation before sentence break with uncapped wrapping. High/low16/24, weather condition22/30, hero frame126, existing hit targets and actual outfit photo sizes remain unchanged.

A development-only debounced diagnostic writes just `{viewportHeight, contentHeight, fontScale, overflow}` to a dedicated authored cache JSON. It contains no location, names, weather values, photos, routes, accounts, notification data or DB records. Only this known file was copied for verification. Failures are ignored and do not affect app behavior; the debounce is canceled on unmount. It is inactive in release builds.

## Actual device evidence

Installed one incremental ARM64 jobs1 build for this new layout request; no clean/concurrent build, deletion/reset, signing change, commit/push/merge/deploy. Strict/deep codesign and launch passed. Hermes SHA256 `c9b167047ff11d9042d2c10888a606efe373c9e068daed24f63b73cc62bdc8d2`.

Original physical capture: `local-evidence/ios-home-viewport-light.png`,1320×2868. Actual fresh live weather changed to17° clear/night, confirming that the earlier18° cloud appearance is not a hardcoded layout fixture. Full outfit images are now visible above the dock without scrolling. A renewed development warning banner obscures the dock's bottom; no banner-free latest dock pass is claimed.

Dedicated numeric evidence: `local-evidence/ambient-home-layout-debug-20261009.json`: native viewport758pt, content758pt, overflow0, **actual fontScale0.882**. The content container has flexGrow1, so equal height means no overflow in this observed state, not its unconstrained natural height. On the956pt-tall device, top/bottom safe areas62/34pt and dock102pt leave758pt; the direct native measure agrees. No physical scroll was performed.

This passes the observed current-user-size one-viewport condition. It does **not** prove the requested OS-default fontScale1.0 condition: the actual user setting is smaller, and we did not change it. Earlier screenshots must not be described as proven default-size captures either.

## Source checks and remaining verification

PASS: TypeScript; hero render/translation regression across weather/platform/theme and KO/EN/JA; actual Ambient lifecycle/contrast; viewport policy over450–850pt; source ScrollView retains natural overflow/refresh and required status children; git diff check; incremental build/sign/install/launch/capture. No observed fatal/RedBox. Existing BackgroundModes/Metro inspector warnings remain.

Source fallback checks are separate from physical QA: no native small-screen, Dynamic Type, long translated copy, or error-state scroll test has been performed. Current environment exposes no callable CUA/Mirroring native input. Do not substitute simulator-only taps, private DB editing, generated app mockups or global settings changes. A human/parent with authorized normal UI access should dismiss the warning, select standard app text size (confirm numeric fontScale1.0), leave Home at top and capture/recopy the numeric diagnostic. Then check a small viewport and large text/long translation/error content scroll fully, plus dark and normal physical touch/re-entry checks. Actual original upper-region background remains brighter than approved reference; prior field-fidelity limitation remains open.
