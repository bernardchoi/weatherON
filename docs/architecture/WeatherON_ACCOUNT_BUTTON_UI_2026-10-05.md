# Account connection button UI — 2026-10-05

Scope: account-button presentation and related regression checks, based on
`4dde47a5f7514bc1a70efef08421107284e47a70`. Authentication, provider availability
and order, token handling, logout, deletion and account-linking logic are unchanged.
This is a verified UI batch with remaining native/accessibility work, not full
account-flow or release acceptance.

## Implementation

- Shared `AccountProviderButton` supplies equal outer bounds, minimum 54-point
  height, radius 12, localized labels, disabled guards and decorative-logo hiding.
  Container/mark scaling is bounded at 1–1.5×; text has a 1.5× maximum multiplier.
- Apple retains the native authentication control. Its internal logo/text sizes
  are not changed, so its text remains visibly larger than other providers.
- Kakao uses the original speech-bubble geometry and system text; Naver uses the
  official N at an 18-point target. Google uses the official gradient G and
  unmodified Google Sans with its bundled SIL OFL 1.1.
- Explicit font families retain their weights instead of being overwritten by
  the global Pretendard patch. Unspecified families keep existing behavior.
  Custom iOS labels compensate for Small Dynamic Type below 1×.
- LINE centers its icon/separator/text group and retains the required text
  padding. Its independent content style avoids inherited flex:1 collapsing
  native Yoga text width to zero. Narrow screens at large text use a short
  visible label while the accessible label still identifies LINE.
- Android disabled opacity applies to the composited control, preventing the
  Naver asset background from appearing as a separate opaque square.
- Account management uses a neutral decorative account illustration with the
  existing provider name, rather than repurposing login marks as profile art.

Asset provenance and usage conditions are in `assets/auth-providers/README.md`.
No QA entry, isolated QA project, private environment, credential, device image,
backup or build artifact is included in this change. Product entry/configuration
files are unchanged from the base.

## Verification matrix

| Check | Result and limits |
| --- | --- |
| Mobile TypeScript `tsc --noEmit` | PASS on final source |
| Font patch, Android account/product-quality, account-region, locale checks | PASS on final source; OAuth is mocked; 2052 locale messages |
| Terms-consent behavior | PASS: all 16 required-consent combinations and handler/guard/navigation cases; see Android check repair note |
| Native Yoga LINE reproduction | PASS at widths 288/385/616: inherited flex produces zero-width text; independent style restores measured text |
| Production element metrics | PASS: iOS/Android × four scales × four custom providers; calculations, not glyph rendering |
| RN Web matrix | PASS: 96 width/language/theme/state/scale cases; native Apple excluded; does not certify UIKit |
| Normal iOS Release build/signature/update | PASS with normal product entry; no QA entry in installed bundle |
| Current iPhone account screen | PASS for full Korean LINE label, 18-point Naver mark and unclipped five-provider display in the observed dark appearance/Small Dynamic Type; see optical note |
| Android native fixture | Earlier centered/compositing version passed 24 cases: ko/en/ja × light/dark × enabled/disabled × native 1/1.5 scales, one Android 16 device at logical width 463 |
| Final-source Android device rerun | NOT RUN after subsequent LINE style and logo-size refinements; earlier native matrix must not be attributed to this exact final source |
| TalkBack | Semantic tree checked with labels/roles/decorative hiding; spoken order/announcements not verified |
| VoiceOver / full iOS Dynamic Type matrix | NOT VERIFIED |
| Real account authentication | NOT PERFORMED for this UI verification |

The Android fixture had inert callbacks and a separate package; the original
Android app was not replaced. The final iOS normal update preserved saved user
values and photos; weather/route-preview caches and timestamps refreshed.
Private evidence remains outside the repository. Current optical differences,
small-screen native coverage and assistive-technology speech remain open.
