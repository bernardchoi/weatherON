# WeatherON UI/UX Development Review

- Date: 2026-07-02 KST
- Scope: current wireframe HTML, MY/settings IA, onboarding/account/permission boundary, destination setup, departure-time detail, notification trust state
- Capture status: screenshot capture from the Codex in-app browser was blocked by app safety policy. This review uses current source, wireframe HTML, and automated QA evidence from this run.
- Evidence limit: not a full visual/accessibility audit. Needs fresh mobile screenshots or in-app browser capture before visual polish sign-off.

## Step Health

| Step | Surface | Health | Notes |
|---:|---|---|---|
| 1 | First-run/onboarding | Improved | Wireframe top copy now states `홈/출발/MY` 3-tab MVP and keeps codi/social as expansion layers. Remaining work is visual pass on embedded future mockups. |
| 2 | Account to permission boundary | Improved | Account completion returns to the original function. O3 is framed as single-permission recovery, not account-after combined permission setup. |
| 3 | MY hub | Improved | Status overview moved above menus and reduced to destination/location/notification readiness to avoid repeating display/account rows. |
| 4 | App permissions | Improved | M4 keeps location and notification rows separate and now has separate result copy for location-only vs notification-only recovery. |
| 5 | Display settings | Improved | Weight and permission entries remain removed. Temperature/distance settings now format key home, destination list, destination detail, and guide surfaces. |
| 6 | Notification settings | Improving | UI no longer overstates reliability after permission grant and shows receive QA/test state. D13 native receive/deep-link still requires real-device verification. |
| 7 | Destination search/setup | Improving | API smoke now checks domestic cases first and overseas/local-language cases second, including selectable result fields. Real-device result selection still needs D9 manual proof. |
| 8 | Destination detail/departure-time | Improved | First decision card now focuses on departure time, direct arrival input, transport choice, automatic buffer, and calculation source. Weather/alert details sit lower. |
| 9 | Policy/settings links | Improved | MY remains the primary policy entry. Display settings footer is version-only and no longer links to policy. |
| 10 | Accessibility/touch targets | Improved | Display settings segmented controls now use larger 44px-class press targets. Needs screenshot/focus verification. |

## Findings

1. Wireframe and runtime IA are closer, but old expansion mockups remain.
   - Evidence: top overview now states `홈/출발/MY` 3-tab MVP; later future-flow mockups still include codi/social tabs as expansion references.
   - Impact: reviewers can still confuse MVP runtime with future IA if they jump into later sections.
   - Recommendation: mark future-flow tabbars as post-MVP or create a dedicated MVP-only wireframe excerpt.

2. Display settings now has visible product impact on core surfaces.
   - Evidence: shared unit formatter is used by home weather summary, home decision, destination list, destination detail, and destination guide.
   - Impact: temperature/distance settings no longer look purely decorative in the primary MVP flows.
   - Recommendation: extend the same formatter to hidden trip/codi expansion screens before those surfaces return to navigation.

3. MY status overview is now less redundant.
   - Evidence: overview is `오늘 준비 / 사용 전 확인` and only includes 목적지, 위치, 알림.
   - Impact: profile/account and display settings are no longer repeated in the summary grid.
   - Recommendation: verify small-screen layout so the summary does not push key menu rows too far down.

4. App permission recovery is split by permission type.
   - Evidence: M4 now has separate result copy for location and notification recovery; O3 copy no longer frames account setup as combined permission setup.
   - Impact: location failure and notification failure can be explained independently.
   - Recommendation: connect M4 rows directly to single-permission recovery where native platforms allow it.

5. Destination detail first card now prioritizes the departure decision.
   - Evidence: first panel is `출발시간 역산`, direct arrival input, automatic buffer, transport choice, and calculation/source strip.
   - Impact: the main question, "언제 나가야 함?", is more prominent.
   - Recommendation: use screenshot QA to ensure the first viewport does not still feel cramped on 390px width.

6. Notification trust still needs native proof.
   - Evidence: UI now says `스마트 알림 확인 중`, `테스트 알림 수신 확인 전`, and `수신 QA 필요`; D13 system notification receive/deep-link remains unverified.
   - Impact: user may assume alerts are reliable after toggling settings.
   - Recommendation: show a small `테스트 알림 확인 전` state until native receive and tap deep-link are confirmed.

7. Policy route now has one primary entry.
   - Evidence: MY has `정책 및 법적 고지`; display settings footer is version-only.
   - Impact: settings footer no longer competes with the MY policy hub.
   - Recommendation: keep legal links out of feature settings unless required by platform review.

8. Settings segmented controls have larger touch targets.
   - Evidence: segment option min height is now 40-44px class in `GlobalSettingsScreen`.
   - Impact: touch target may be below comfortable mobile target size.
   - Recommendation: raise segment option min height to at least 40-44px or wrap with larger pressable hit area.

## Recommended Order

1. Verify updated MY, M3, M4, G2 on 390px mobile screenshot.
2. Run native D13 notification receive/deep-link test on device.
3. Run D9 real-device destination search selection proof with the updated QA matrix.
4. Create an MVP-only wireframe excerpt or visually label later codi/social tabbars as post-MVP.
5. Extend unit formatting to hidden expansion screens before restoring them to bottom navigation.

## Verification Needed

- Fresh mobile screenshots for onboarding, MY, M4 app permissions, M3 display settings, destination detail.
- TalkBack/focus order check for MY menu rows and settings segments.
- Native D13 notification receive/deep-link check.
- Real-device destination search QA: `잠실`, `잠실 야구장`, `Tokyo Station`, `도쿄 역`, `東京駅`, `마리나 베이`.
