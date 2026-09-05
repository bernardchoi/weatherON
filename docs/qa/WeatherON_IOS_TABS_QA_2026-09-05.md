# iOS tabs and drag QA — 2026-09-05

## Changes

- iOS Outfit → Departure → MY → detail hierarchy: shared title, card, list styles; larger outfit imagery; departure time first; quieter MY summary. Existing Android presentation branches retained.
- Selected glass capsule follows continuous horizontal drag; intermediate pages no longer mount on boundary crossings. Release commits nearest tab; cancellation restores current tab. Reduced Motion/unknown preference disables the snap spring.
- One persistent native SwiftUI glass capsule moves inside an Animated host; removed discrete per-tab SwiftUI hierarchy/morph animation.

## Verified

- `npm exec --workspace @weatheron/mobile tsc -- --noEmit` passed.
- `node scripts/check-ios-tab-drag.mjs` passed: continuous displacement, edge clamps, release-only navigation, cancel, tap, Android behavior, reduced-motion snap.
- `node scripts/check-ios-home-experience.mjs` passed.
- `git diff --check` passed.
- In-app browser, synthetic iOS platform + sample data: 375×667 Outfit/Departure/MY inspected; 440×956 dark Outfit inspected. MY visible/control DOM targets all >=44 pt. Browser drag from Outfit to MY committed successfully. Native glass is not represented by this browser fixture.
- Physical Debug Xcode build succeeded, iPhone 16 Pro Max / iOS 27 target. Incremental JS-only rebuild skipped signing: re-signed final local app with its existing Apple Development identity and preserved identifier/entitlements/requirements/flags/runtime. `codesign --verify --deep --strict` passed.

## Limitations

- Initial Mirroring connection/capture failure was resolved during the follow-up below. Physical interaction and layout checks passed; frame-by-frame motion quality/FPS and the system Reduce Motion toggle remain unverified.
- No TestFlight/App Store upload. Existing device data retained.
- Browser fixture: `/tmp/weatheron-ios-tabs-preview-20260905` (sample data only).
- Build log: `/tmp/weatheron-tabs-device-resign-build.log`; installation: `/tmp/weatheron-tabs-device-install-final.json`.

Final device result: `devicectl device install app` and `device process launch --terminate-existing com.weatheron.mobile` both succeeded for the signed final build. Launch evidence: `/tmp/weatheron-tabs-device-launch-final.json`.

Follow-up after user unlocked Mac: paired physical device available and WeatherON launch succeeded (`/tmp/weatheron-tabs-device-launch-verify.json`). Mirroring remained blank; quitting and reopening Mirroring resulted in ScreenCaptureKit stream error -3811 (audio/video capture failed). Physical visual/motion QA remains blocked by the capture connection, not validated by app launch.


## Physical follow-up — 23:25–23:29 KST

- User confirmed Mirroring visible. Capture initially grey; refreshing the CUA session and raising the Mirroring window restored actual physical screenshots.
- Inspected Home, Outfit, Departure, MY, outfit detail (C4), departure detail (G2), and display settings (M3) on the installed iPhone. Main tab titles/cards/text and bottom selection capsule visible; no observed main-screen clipping. C4 fixed footer remained above navigation.
- Tap Home → Outfit succeeded; dragged selected capsule Outfit → MY and MY → Home successfully. Short Home drag (~33 screenshot pixels) returned to Home; tapping Departure and entering detail succeeded.
- Native capsule visible at selected tab after gestures. These are screenshot/interaction observations, not a continuous video or FPS trace; no claim of quantitatively verified smoothness.
- No account, permission, theme, or schedule settings changed. Returned to Home with original destination selection preserved.
