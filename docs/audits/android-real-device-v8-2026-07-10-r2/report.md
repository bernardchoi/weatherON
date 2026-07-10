# WeatherON Android Real Device QA - v8 (re-test after icon polish)

- Date: 2026-07-10 11:38-11:44 KST
- Device: `000841458003652` (A142, Android 16, 1084x2412)
- Package: `com.weatheron.mobile`
- Installed version: `0.1.0`, `versionCode=8`
- Build source: local release APK rebuilt from `apps/mobile/android` at commit `c98a58ad5` ("Polish mobile UI icon affordances"), installed via `adb install -r`
- APK sha256: `b659ebbdb843be6cffbbc6a6578055d6cb4493e53b7a1ef34a1a077c8ea81fcd`
- Reason for re-test: prior v8 evidence (`docs/audits/android-real-device-v8-2026-07-10/report.md`) flagged Cody `상세 보기` as a no-op on real device. The app was not installed on the device at the start of this session (removed since the last pass), and source had since gained an icon-affordance polish commit touching `AppButton`, `Section`, `DestinationListScreen`, and `OutfitScreen`. Rebuilt and reinstalled before re-testing.

## Result

Pass. Cody `상세 보기` navigated to the Cody detail screen (C4) correctly on this build; the previously reported no-op did not reproduce. No crash, ANR, or fatal exception observed across the full session.

## Steps

1. Home
   - Evidence: `screens/01-home.png`
   - Health: Pass
   - Notes: Prior app state preserved (saved destinations 내수동교회 / 신사이바시역), weather card, today Cody preview, destination chips, 3 summary cards, bottom nav all rendered.

2. Cody tab
   - Evidence: `screens/02-cody.png`
   - Health: Pass
   - Notes: Icon-polish render confirmed — `기준 수정` button, criteria stat icons (shirt/settings/check), section checkmark, and `상세 보기`/`우산 확인` button icons all rendered with correct tint colors.

3. Cody detail action (`상세 보기` → C4)
   - Evidence: `screens/03-cody-detail.png`
   - Health: Pass
   - Notes: Tapped the button using pixel-verified bounds (button spans x≈51-351, y≈2000-2105 at 1084x2412). Screen transitioned to `코디 상세` immediately, showing 겉옷/상의/하의/신발/소품 breakdown, hourly advice, tags, and `코디 저장` / `코디로 돌아가기` actions. This directly re-tests the issue flagged in the prior v8 report and it did not reproduce here.

4. Cody detail back button
   - Evidence: `screens/04-cody-detail-back.png`
   - Health: Pass
   - Notes: Back chevron returned cleanly to the Cody list (C1) with state intact.

5. Departure tab
   - Evidence: `screens/05-departure.png`
   - Health: Pass
   - Notes: Both saved destinations rendered with pin icons, temperature comparison, departure/arrival time, precipitation chip, and add-destination CTA.

6. MY tab
   - Evidence: `screens/06-my.png`
   - Health: Pass
   - Notes: Account, readiness, permission, notification, display, and policy sections rendered with new icon frames; app version footer visible.

7. Notification sidebar (from Home)
   - Evidence: `screens/07-notification-sidebar.png`
   - Health: Pass
   - Notes: Opened via bell icon. Pre-permission example alerts, upcoming/recent sections, and bottom CTA displayed correctly.

8. Notification sidebar close (Android back)
   - Evidence: `screens/08-back-close-sidebar.png`
   - Health: Pass
   - Notes: Hardware back closed the sidebar and returned to Home without residual overlay.

## Logs

- Full log: `logs/logcat-full.txt`
- App PID log (pid 31488): `logs/logcat-weatheron-pid-31488.txt`
- Package dump: `logs/package-com.weatheron.mobile.txt`
- Scan result: no `FATAL EXCEPTION`, `ANR`, or crash pattern found in either the PID-scoped or full log across the session.

## Follow-Up

1. The Cody `상세 보기` no-op from the prior v8 report did not reproduce after reinstalling a fresh build. Root cause is unconfirmed — candidates are a transient real-device tap miss during the original session, or a side-effect of the icon-affordance commit (larger hit area from `flexDirection: row` + icon/label padding in `AppButton`). No code change was made in this session since the flow now passes; treat as resolved unless it recurs.
2. No new issues found in this pass. Untested this session: O-series onboarding, destination search (D9), notification delivery (D13), and permission-revoked states — carried over from the existing device QA session doc if a full regression pass is needed before store submission.
