# WeatherON Android Real Device QA - v8

- Date: 2026-07-10 KST
- Device: `000841458003652`
- Screen: `1084x2412`
- Package: `com.weatheron.mobile`
- Installed version: `0.1.0`, `versionCode=8`
- Build source: local release APK from `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- Product Design context preflight: no saved context found; current repo and captured screens used.

## Result

Conditional pass for private-test smoke QA.

The v8 build installed, launched, and key Home/Cody/Departure/MY/notification screens rendered on device without observed crash or ANR. One interaction needs follow-up before calling the Cody flow clean: the Cody `상세 보기` button did not change screen after two device taps.

## Steps

1. Home
   - Evidence: `screens/01-home.png`
   - Health: Pass
   - Notes: Weather card, today Cody preview, destination chips, summary cards, and bottom navigation rendered without visible overlap.

2. Cody tab
   - Evidence: `screens/02-cody.png`
   - Health: Pass
   - Notes: Expanded outfit preset assets rendered with transparent backgrounds. Card density is high but usable on this device size.

3. Cody detail action
   - Evidence: `screens/03-cody-detail.png`, `screens/03-cody-detail-tap-no-change.png`
   - Health: Needs fix
   - Notes: `상세 보기` was tapped twice, but the screen stayed on the Cody list. Treat as a real-device interaction issue unless intentionally disabled by account/save state.

4. Departure list
   - Evidence: `screens/04-departure.png`
   - Health: Pass
   - Notes: Destination cards, alert state, departure/arrival time, rain probability, and add-destination CTA rendered correctly.

5. Departure detail
   - Evidence: `screens/05-departure-detail.png`
   - Health: Pass
   - Notes: First destination opened correctly. Arrival/departure summary, transport buffer, repeat state, weather comparison, and destructive actions were visible.

6. MY
   - Evidence: `screens/06-my.png`
   - Health: Pass
   - Notes: Account, readiness, permission, notification, display, policy, and app version sections rendered cleanly.

7. Notification sidebar
   - Evidence: `screens/07-notification-sidebar.png`, `ui/07-notification-sidebar.xml`
   - Health: Pass
   - Notes: Sidebar opened from Home. Read state, empty sections, recent completed notifications, and bottom CTA were visible.

## Logs

- Full log: `logs/logcat-full.txt`
- App PID log: `logs/logcat-weatheron-pid-9981.txt`
- Package dump: `logs/package-com.weatheron.mobile.txt`
- App PID scan result: no `FATAL EXCEPTION`, `ANR`, or React Native error pattern found.

## Follow-Up

1. Fix or explain Cody `상세 보기` no-op on real device.
2. Re-run Cody detail/save flow after the fix.
3. For Play private-test submission, v8 is acceptable as a smoke-tested build after acknowledging the Cody detail issue.
