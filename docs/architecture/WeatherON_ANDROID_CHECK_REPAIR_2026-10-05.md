# Android check repair — 2026-10-05

This follow-up accompanies the account-button UI changes. Production
consent text, authentication code, account state and native configuration were not
changed to satisfy tests. The test repairs use no live OAuth or account data.

## Test changes

- `check-android-account.mjs`: mock the actual imported
  `../localization/react-native` module with the same mutable Platform object.
  The four-provider success cases, cancellation, wrong state, wrong callback,
  provider error, Android Apple exclusion and web exclusion now execute and pass.
  Network, secure storage and browser results remain test doubles.
- `check-android-product-quality.mjs`: replace the obsolete TermsConsent copy
  assertion with execution of `check-terms-consent-behavior.mjs`.
- The new behavior check transpiles the real TSX screen into an isolated VM with
  inert native views, then invokes its rendered event handlers. It covers every
  one of the 16 required-consent combinations, each individual toggle, select-all
  and clear-all, checked/disabled/busy accessibility state, no implicit consent,
  policy navigation without consent, cancellation, duplicate-submit guard during
  saving, and explicit retry after an error.
- The current screen has four required items (age, terms, privacy, location) and
  no optional marketing control. Tests verify that select-all produces only these
  four keys, rather than reintroducing the obsolete marketing expectation.
- A mutation experiment confirms the test rejects all four injected faults:
  bypassing required consent, allowing submission during saving, always clearing
  select-all, and silently adding marketing consent. Mutations were in memory;
  no application source was changed.
- Once the original failure was repaired, three further stale source assertions
  surfaced: policy effective date (privacy/location currently 2026.09.19), home
  outfit copy using `outfit.variant`, and notification history showing the latest
  title with an empty-state fallback. Their expectations were updated to the
  existing implementation; the checks were not removed. No policy date or other
  product behavior was changed.

## Validation matrix

| Check | Result |
| --- | --- |
| `node scripts/check-android-product-quality.mjs` | PASS, including the new consent behavior check |
| `node scripts/check-android-account.mjs` | PASS, isolated mocked OAuth cases only |
| `node scripts/check-terms-consent-behavior.mjs` | PASS, 16 combinations and event-handler cases |
| Four faulty in-memory consent mutations | All rejected by assertions |
| TypeScript mobile `--noEmit` | PASS |
| `check-account-button-font.mjs` | PASS |
| `check-account-region.mjs` | PASS |
| Localization catalog `--check` | PASS, 2052 messages |
| Prior seven button UI/font/locale source files | Byte-for-byte unchanged during this follow-up |
| RN Web button matrix | PASS: 96 combinations (320/375/440/768 × ko/en/ja × light/dark × enabled/disabled × simulated 1.0/1.5 text scale). Production controls on RN Web/headless Chrome; native Apple excluded |
| Android Metro/Hermes export | PASS, 3.1 MB bundle, new font/logo resources included; dotenv disabled |
| Local Expo Android prebuild | PASS in an isolated copy, existing template, `--no-install`; no SDK/package installation |
| Initial native Android APK build | Blocked before compilation by host I/O; later separate fixture built successfully (see below) |
| Android emulator native screen verification | NOT RUN |
| Android physical device verification | Later separate UI fixture only; see current UI verification note |
| Whitespace check | PASS |

## Native follow-up and limits

The initial offline native build was blocked by host I/O before compilation.
A later isolated native fixture built successfully and passed 24 cases on an
Android 16 device (ko/en/ja, light/dark, enabled/disabled, native scale 1/1.5).
That later run supersedes the initial build blocker above, but predates the final
LINE native-layout and mark-size refinements. See
`WeatherON_ACCOUNT_BUTTON_UI_2026-10-05.md` for the current validation scope.
The isolated fixture/project and its test entry are not product code and are not
included here. No production consent or authentication logic was changed.
