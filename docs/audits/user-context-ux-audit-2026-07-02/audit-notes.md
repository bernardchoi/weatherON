# WeatherON User-Context UX Audit

- Date: 2026-07-02 KST
- Scope: first-run onboarding, account connection, permission gate, notification settings, destination search/setup, departure-time calculation
- Capture: in-app browser mobile viewport, `01-initial.png`
- Evidence limits: in-app browser DOM and tap actions timed out during this run. Findings combine the accepted first-screen capture, current source, and existing Android device QA session evidence.

## Flow Steps

| Step | Surface | Health | Notes |
|---:|---|---|---|
| 1 | First-run onboarding | Risky | First screen starts at `O2` and primary CTA says `알림 기준 보기`, jumping to `O5`. A new user may not understand whether this is the start, next, or optional detail. |
| 2 | Account connection | Risky | Provider buttons all trigger the same completion handler. UX looks like real Kakao/Naver/LINE/Google/Apple login, but current level is a simulated account state change. |
| 3 | Account to permission boundary | Improving but still unclear | Copy says account and permissions are separate, but the actual flow can go account -> terms -> permission gate. Users may still read this as one required bundle. |
| 4 | Permission gate | Medium | Permission copy is clearer than before, but `account-setup` requests location and notifications together. If one fails, the result is compressed into one return state. |
| 5 | Notification settings | Risky | UI exposes toggles and test notification, but reliability still depends on native permission/scheduling behavior. Web preview can show unsupported states, so native QA is required before trust claim. |
| 6 | Destination search/setup | Medium | Domestic-first QA policy is documented. Search empty/error copy supports Korean, English, and local-language retry, but result quality and keyboard input still need real-device QA. |
| 7 | Destination detail | Risky | Device QA recorded weather inconsistency across home/departure/detail, awkward labels, and bottom nav overlap. These directly affect trust in destination care. |
| 8 | Departure-time calculation | Medium | Formula is visible, but fallback route estimates still make the result a demo-level calculation when provider status is fallback/error. Needs provider-backed verification before real-use confidence. |

## Priority Findings

1. First-run route and CTA are confusing.
   - Evidence: app state initializes route to `O2`; `O2` CTA is `알림 기준 보기` and navigates to `O5`.
   - User impact: first-time user has no clear `계속`, `시작`, or `건너뛰기` path from the first visible screen.

2. Account login looks real but behaves as a mock completion.
   - Evidence: every provider button calls the same `onComplete`; `completeAccountLink` immediately sets `accountLinked` true before terms/permission.
   - User impact: users may think they authenticated with Kakao/Naver/etc., but no provider-specific auth state exists.

3. Account -> terms -> permission sequence still feels bundled.
   - Evidence: after account completion, route goes to terms, then account setup permission gate if permission/location not ready.
   - User impact: copy says permissions are separate, but flow makes them feel like a required continuation of account setup.

4. Notification settings are not yet trustable as a user promise.
   - Evidence: settings UI has test notification and delivery status, but web preview cannot validate native scheduling; prior QA still requires push reliability verification.
   - User impact: a user can configure alerts without strong proof that alerts will actually arrive.

5. Destination care has data consistency risks.
   - Evidence: Android QA recorded inconsistent Tokyo weather values between home and detail, awkward place labels, and bottom nav overlap.
   - User impact: destination weather and departure advice become hard to trust.

6. Destination search quality is only partially proven.
   - Evidence: domestic-first QA path exists, but Android QA still marks destination search as pending/manual because automated input broke with Korean keyboard.
   - User impact: common domestic places should be validated first; overseas places should remain second-priority until result selection and language handling are stable.

7. Departure-time calculation needs stronger real-world framing.
   - Evidence: formula copy is visible, but fallback estimates use coordinate or fixed international defaults.
   - User impact: users may over-trust a commute/departure time that is not provider-verified.

## Recommended Fix Order

1. Make first-run path explicit: `계속`, `건너뛰기`, and progress meaning.
2. Mark account providers as demo/mock until real auth exists, or wire real provider-specific state.
3. Split account success, terms consent, and permission request into separate completion states.
4. Add native notification QA evidence state before calling alerts reliable.
5. Fix destination weather snapshot consistency and place label formatting.
6. Run domestic place search QA first, then overseas search/language QA.
7. Gate departure-time confidence by route provider status.
