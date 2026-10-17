# Physical failure follow-up: input, scrolling and light sky visibility

## User verdict: FAIL

The user reported (1) idle is barely perceptible, (2) hold/move has no visible response, and (3) scrolling only makes the star image disappear and return. A later report adds that the sunset/night image is not visible for light-theme users. These are failed experience checks on the previous installed build. Source tests and measured pixel changes do not override them. Idle intensity was not increased in this increment; connection and layer lifetime were prioritized.

## New video access — blocked, not analyzed

The new exact Library ID `[private library reference omitted]` was prepared through the current Library skill flow. The authorized record resolved `ScreenRecording_10-09-2026 23-35-18_1.MP4`, backing file `[private library reference omitted]`, 6,618,411 bytes. The current unmodified transfer helper initially needed the bundled Python3.12 runtime instead of system Python3.9. A restricted-network attempt failed; the authorized Mac network attempt returned **HTTP403**. No direct URL transfer, credential reuse, alternate storage path or previous denied-file workaround was attempted.

Expected consumer Mac path:
`local-evidence/user-reaction-video/ScreenRecording_10-09-2026 23-35-18_1.MP4`

An explicit `ls -l` confirmed **No such file or directory**. There are no readable local video bytes/frames and no video-based gesture, timing or visual claim. Metadata is identification only. The earlier unrelated denied file was not accessed.

## Grounded causes and minimal changes

### Scroll makes stars disappear: confirmed source defect

Home `onScrollBeginDrag` and `onMomentumScrollBegin` called `setWeatherRegion(undefined)`. `AmbientWeatherLayer` returns null without a region, removing the entire stars/weather subtree. End handlers measured it again and remounted it. This explains disappearance/return from source and matches the user's report; it is not a video observation. Native common ambient clock itself did not depend on scrolling, and no weather-layer key change was involved.

Both start handlers now cancel **touch only**. They do not change the region or remove/re-measure the weather layer at drag/momentum end. The region is retained as a background atmosphere, independently of scrolling content. Background, Reduced Motion/Transparency and low-power policies remain separate. Regression executes the actual drag handler with a failure boundary on region removal and asserts no source `setWeatherRegion(undefined)` remains.

### Input: delivery failure not yet localized

The old root listened in bubble phase and relied on asynchronous root measurement. Installed RN ScrollView's handlers call their supplied callbacks; inspected source does not prove that it stops propagation. Without accessible video or captured physical gesture events, it would be inaccurate to claim a particular child Pressable/ScrollView intercepted the user's touch.

iOS observation now uses the installed RN native `onTouchStart/Move/End/CancelCapture` phased event registrations. These run before descendant bubbling without claiming a responder or stopping propagation. The root is explicitly `collapsable={false}` to provide a native measurement target. Sample extraction supports active or changed native touches. Android retains the previous bubble pulse.

A development-only numeric diagnostic logs received down/move/up/cancel counts, measured contacts, emitted phase, and low-power/Reduced Motion/Transparency flags. It excludes coordinates, event payloads, user/weather/authentication content. No per-frame logging; move count is reported with subsequent phases. Existing `devicectl --console` output does not currently expose these JS diagnostic lines, so **no physical input count or low-power flag is claimed as collected**. Debugger logging can distinguish missing event, missing measurement, immediate cancel, and policy suppression during a future human test. The actual light reaction intensity and existing hold/release behavior are unchanged. Actual touch delivery/visibility remains pending.

### Light sky: confirmed contrast weakness; twilight/night are distinct

Previously night stars and meteor always used `#E4F2FF` with dark-style low opacity, including on the pale light background. This is a grounded light-night contrast defect. Light night now uses dark blue `#274A70`, opacity0.68–0.92 by star/wave, with a ≥3:1 conservative star contrast check on the core upper background. Dark night retains its existing white-star treatment. This is independent of the UI theme's day/night selection.

Computed `day` has clear sunlight; `twilight` has warm light, **not stars**; `night` has stars/rare meteor. Twilight in light UI now has a faint warm contour and0.18–0.34 warm light, rather than an almost white-only signal. No theme inversion or forced dark mode. No false stars under clouds/precipitation. The actual video was unavailable, so whether the user's “sunset” was calculated twilight or night cannot be established. Location/timezone-based existing solar computation is unchanged.

## Verification and installed artifact

Passed: TypeScript; actual controller lifecycle; **64 labeled actual-component fixtures** across light/dark×day/twilight/night/unknown and eight weather categories; light-star contrast; installed RN native capture registration; actual scroll-handler touch-only cancellation; old-contact replay regression; installed RN gradient parsing/reading contrast; actual Hero KO/EN/JA/icon/large-text source checks; measured viewport/source overflow; localization/native exports (88); `git diff --check`.

A single incremental ARM64 jobs1 build for this defect increment passed (`ios-ambient-input-fix-build.log`), existing signature verification passed, and overwrite install preserved user data (`ios-ambient-input-fix-install.json`). No clean/concurrent build, dependency/permission/haptic/authentication/signing/security change, reset/uninstall, commit/push/merge/deploy, or other-screen conversion.

Installed Hermes SHA256: `f258ddb44421936079415db01f1f9abff2c0124acca2d41285061cedb57db8fc`.

Actual physical screenshot:
`local-evidence/ios-ambient-input-fix-current.png`
1320×2868, current **dark clear night**, 17°, existing content positions retained; viewed pixels, no synthetic weather/touch/theme injection. SHA256 `c5dd06db9f9aaadafa13ed5476fb0c8f280a3e274e73f107e3143e56137582f5`. Existing development warning banner remains over part of the bottom nav. Actual light-theme sky, twilight, scroll continuity and hold/move/up response were not physically exercised by automation. No meteor observed.

## Remaining blockers and verdict

Video-based diagnosis is blocked by the new attachment's HTTP403 and nonexistent local bytes. Physical gesture automation is not available for this iPhone; surfaced Xcode UI touch/gesture workflows are simulator-oriented and were not substituted for physical evidence. Current tests validate the implementation boundary, not subjective liveliness or user gesture delivery. The previous user's FAIL remains authoritative until a new physical evaluation. The installed fix is ready for that evaluation; do not present it as a verified experience pass or repeatedly reinstall while awaiting it.

Changed in this increment: `HomeScreen.tsx`, `AmbientWeatherLayer.tsx`, `check-ambient-response.mjs`, `check-ambient-surface-regressions.mjs`, this report, and the prior reaction report's explicit follow-up FAIL notice. Runtime assets/temperature/companion text/navigation/data logic are preserved. Temporary QA Xcode project/workspace are back outside the repository; transient dependency link removed after verification.
