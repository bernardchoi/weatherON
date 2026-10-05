> Current status (October 5, final): signed Release iPhone build and strict/deep verification PASS. Startup and service configuration regressions in the isolated validation build were fixed; the user confirmed account connection, actual weather refresh and widgets normal. Native widget WeatherKit success was independently observed. The current working phone installation is preserved. Repeated warm deep-link handling and Release build guards are additional source changes, tested but not installed. The user also confirmed Live Activity and Dynamic Island working; individual remote delivery scenarios were not separately instrumented. Private signing and device diagnostics are excluded from this public report.


# Mac correctness batch — 2026-10-05

## Checkout and scope

Base: `4f60d982e4f745d78811ffbd3e87ea494dd6e635`, verified against remote `fix/ios-data-notification-weather`. Local working branch: `fix/mac-correctness-batch`. Publication of this batch to the existing fix branch was subsequently approved. PR, main merge and deployment are outside scope; no new certificate/device or paid quota change.

The original checkout and its pre-existing user changes remain unchanged. Work is in the isolated `weatherON` clone under this task. Existing Mac dependencies were initially linked, then copied into the isolated checkout for native builds; no new dependency versions were downloaded; later offline CocoaPods integration used already installed local modules. Main and the cost/roadmap branch were not merged.

## Implementation

| Area | Result |
| --- | --- |
| Auto location | Cold-start and explicit current-location requests preserve auto intent and last readiness/location after `error`/`unavailable`. Only actual `denied` results switch to manual. Existing foreground permission reconciliation can now recover. |
| Tomorrow | Uses the current calendar date in the weather location's IANA timezone, then matches exactly the next date. No substitution of today, an arbitrary later day, or current weather when tomorrow is missing. The screen shows an unavailable message instead of recommendations. UTC-offset hours are matched by local date. Daily-only data no longer creates artificial hourly entries or a 09:00 rain start. |
| Account deletion | `recent_auth_required` starts same-provider reauthentication without logout or local cleanup. Expected user ID is checked before saving the replacement session/integrity identity; mismatch best-effort revokes only the new session. Cancel/error keeps the existing local data. Successful reauth returns to the existing deletion dialog and requires another explicit tap. Server 15-minute boundary unchanged. |
| Route time | App/client forward selected departure time, server cache separates selected times, existing Google Distance Matrix receives supported transit arrival/departure or driving departure. Past driving requests fall back rather than silently requesting now. Domestic estimates and Google driving arrival-based calculations disclose unsupported selected times in the internal calculation screen. |
| H5 rain | Replaces the disconnected local toggle with persisted `rainDetail`, shared with alert settings. Enabling without permission opens the existing permission flow. Permission/master-switch status is disclosed. This is the supported rain forecast alert, **not a newly implemented rain-ending alert**; misleading rain-ending promises were removed from H5 and settings. |
| Independent widget weather | Native WeatherKit query, bounded private cache, late-result protection, attribution and timeline integration implemented. Matching development profile, signed WeatherKit entitlement and runtime flag are enabled after authorization. Actual native provider success was observed; timed refresh after host termination remains unverified. No secrets or credentials are shared with the widget. |
| Scene links | Cold-start URLs and universal-link activities enter React launch options; warm Scene events forward through AppDelegate, retaining Expo and React linking handlers. |
| Foreground weather | Existing return-to-foreground refresh retained. A still-open active app now checks the existing 15-minute TTL on the minute tick. Retries after failures are bounded to 15 minutes and do not run in background or during an active request. |
| Xcode scheme | Removed dangling WeatherONTests reference: its target does not exist in project.pbxproj. This does not create an XCTest suite or claim native test coverage. |
| Privacy manifest | Replaced empty collected-data list with directly evidenced account name/email/user ID and linked App Attest device ID, for app functionality, linked to user, not tracking. Evidence: migrations 0001_account_auth and 0002_app_integrity. Existing required-reason API declarations retained. This is a minimum code-grounded correction, not a full release privacy audit. |
| Notification timezone | Carries forecast schedule timezone into iOS recurring calendar triggers and persisted notification metadata; a changed timezone replaces old reservations. Absolute DATE notifications already preserve their instant. Android DAILY still follows device timezone; see remaining work. |
| Accessibility/resources | Localized Text now translates explicit accessibilityLabel/accessibilityHint, like Pressable and LocalizedView. ScreenTransition and wardrobe accordions start with motion disabled until preference resolves and tolerate query failure. Added/reviewed en/ja strings for changed flows. Existing Live Activities preserved. |

## Provider evidence and limits

- [Google Distance Matrix request documentation](https://developers.google.com/maps/documentation/distance-matrix/distance-matrix): transit supports arrival or departure, driving supports present/future departure. The existing paid endpoint is retained; no new service/key/quota was introduced. Tests mock requests and do not exercise billing.
- [Kakao Mobility API guide](https://developers.kakaomobility.com/guide/navi-api/start): `/v1/directions` is current-time routing; `/v1/future/directions` is separate. This batch does not enable that API. No supported selected-time contract was established for the existing `dapi.kakao.com/v2/routing/publictraffic` endpoint, so its estimate explicitly says selected time is not applied.
- [Apple privacy manifest documentation](https://developer.apple.com/documentation/bundleresources/describing-data-use-in-privacy-manifests): data-use declarations belong in the app manifest; final aggregate SDK/provider disclosure still requires review.

## Validation matrix

Mac: Node 24.15.0, Xcode 27.0 (27A266a). Existing TypeScript/esbuild available on this Mac.

| Command/check | Result | Scope |
| --- | --- | --- |
| `npm run check:correctness-batch` | PASS | Production cold-start effect, local dates/midnight/DST/year rollover/stale and missing day/hourly offsets, same-account session guard and deletion flow, route HTTP params/cache separation/past driving fallback, iOS trigger timezone, foreground TTL guards, H5 preference/permission callback. Native boundaries mocked. |
| `node node_modules/typescript/bin/tsc --noEmit -p apps/mobile/tsconfig.json` | PASS | Mobile and imported shared TypeScript. |
| `npm run check:shared` | PASS | Shared rules, provider/companion checks and mobile bundle compilation via esbuild. |
| `npm run check:account-auth` | PASS | Mock fetch and in-memory SQLite only. Added 16-minute stale session rejection with account still present and no provider unlink, then fresh-session deletion of synthetic fixture. |
| `npm run check:ios-reliability` | PASS | 76 storage migration SQL failure points, notification retry/races, partial weather/cache/persistence, obsolete hook responses. |
| `npm run check:ios-widget-sync` | PASS | JS behavior and native source contracts; not Swift runtime execution. |
| `npm run check:ios-live-activity` | PASS | Existing contract assertions. |
| `npm run check:ios-launch-state` | PASS | Launch-state assertions. |
| `npm run check:mobile-localization` | PASS | 2,052 en/ja entries; keys, placeholders, overrides, locale cases. |
| `npm run check:cloudflare-worker-proxy` | PASS | Mock provider fallback/cache/timezone tests; live smoke disabled. |
| `npm run check:weather-proxy-cache` | PASS | Local mock HTTP server; rerun with loopback access after sandbox EPERM. |
| `npm run check:ios-widget-native` | PASS | Executes production Swift refresh coordinator with a mock provider on Mac, then typechecks all widget/Live Activity Swift against iOS Simulator SDK. No native WeatherKit service request. |
| Unsigned widget-only simulator build | PASS | `xcodebuild -project .../WeatherON.xcodeproj -target WeatherONWidget -configuration Debug -sdk iphonesimulator SYMROOT=/tmp/weatheron-widget-build OBJROOT=/tmp/weatheron-widget-obj CODE_SIGNING_ALLOWED=NO build`; compiled and linked extension for simulator. No install or signing. |
| Swift frontend parse of SceneDelegate | PASS | Syntax only, not native typecheck/link. |
| `plutil -lint .../PrivacyInfo.xcprivacy` | PASS | Manifest syntax. |
| `git diff --check` | PASS | Whitespace. No standalone lint script is configured. |
| Full native builds | PASS / LIMITED | Release simulator and signed Release iphoneos builds passed in later follow-ups. Debug cache unavailable; isolated simulator runtime startup was blocked. Physical app startup subsequently passed after local module integration. |
| `npm run check:android-product-quality` | BASELINE FAIL | TermsConsentScreen missing literal `필수 4개와 선택 마케팅 1개를 함께 변경`. Reproduced in separate pristine archive of 4f60d982, as well as modified clone. No unrelated assertion weakening. |

The location regression was observed failing before the fix (`error must preserve auto intent`). Other tests exercise production code with local synthetic fixtures, not real accounts or user content.

## Remaining exact blockers / follow-up

1. **Widget background scheduling:** native WeatherKit is activated, signed and successful on the device. User confirmed widgets normal. A refresh specifically after host termination was not observed; WidgetKit controls scheduling, so no fixed refresh interval is guaranteed.
2. **Remaining device QA:** synthetic-account deletion reauthentication/cancellation/mismatch/second confirmation; denied vs transient GPS recovery; notification timezone transitions; VoiceOver en/ja and Reduce Motion; repeated deep-link fix after a future authorized installation. The user confirmed Live Activity and Dynamic Island working; no further device verification is requested for this batch. Individual APNs termination and expiry scenarios were not separately measured. Do not delete a real account or change an existing departure plan for testing without authorization.
3. **Rain-ending alerts:** deliberately not claimed. An independently persisted end-of-rain preference, forecast-end detection and rescheduling/cancellation would be separate feature work. The H5 setting now truthfully controls the existing supported rain forecast alert.
4. **Routing:** chosen-time domestic support is not added. Future Kakao endpoint entitlement/cost verification is needed before enabling it. Driving arrival targets remain reverse estimates from current traffic; no claim of arrival-constrained routing. No live paid-provider verification was run.
5. **Notifications:** Android DAILY triggers lack an explicit timezone in the current Expo API. Choose whether cross-zone reminders should follow the device or become one-shot absolute triggers rescheduled by the app; this batch does not silently change recurrence behavior. Quiet hours/daily caps currently use the device's local clock. Recurring notification bodies are still last-known content, not independent closed-app weather fetches.
6. **Privacy/legal:** minimum manifest corrections do not settle all SDK, analytics/diagnostic, provider location/photo processing, or retention classifications. Review aggregate archive manifests and actual production logging/provider practices before release. PolicyDocumentScreen's existing support address/responsible-person, retention, D1 region and deletion statements were not newly verified or invented; treat them as owner-confirmation items. No contacts or retention periods were changed.
7. **Native test target:** dangling reference removed; native XCTest target remains absent. JavaScript and native source contracts are not substitutes for an installed iOS runtime suite.

Multi-device sync rollout, AdMob, premium pricing and travel expansion are outside this batch. No business implementation was added.


## Final follow-up: startup, service restoration and Live Activity review

### Root causes and installed result

The isolated validation build initially reused Pods that omitted declared ExpoLocalization and ExpoHaptics modules. The JavaScript entry import failed at ExpoLocalization, before normal React startup. Offline CocoaPods integration with already installed modules corrected Podfile.lock and generated integration. A new native-module check compares Expo autolinking with the lockfile and, with `--installed`, the installed manifest and generated module provider. The regression failed before the correction and passes afterward. The integration retained dependency versions; the existing React Native integration also added its required `RCTNewArchEnabled` plist flag.

The subsequent weather/account failure was a separate validation-build configuration omission: the original project's ignored `.env.local` had not been copied into the isolated build. After explicit user approval, the existing endpoint and existing token were applied only to the private local build. No new token, server policy or account setting was created. The file is ignored and restricted; its values are excluded from this patch/report. The existing client architecture embeds this token in the app bundle, as disclosed before approval. An initial automatic-review rejection was resolved by that explicit approval, then the same narrow action succeeded.

The corrected signed Release app was installed as a compatible same-ID update without uninstall/reset. All temporary startup diagnostic source was removed. The user subsequently confirmed account connection, actual weather refresh and widgets normal. App shared weather advanced to 2026-10-05T05:40:49Z. The independent widget cache recorded native WeatherKit weather at 2026-10-05T05:32:44Z, with hourly entries and Apple attribution, matching the current shared location via a local hash comparison. No coordinates, credentials or screenshots are published. A desktop unauthenticated `/auth/providers` probe returned 403; this limited probe does not negate the user's successful real-app account connection.

The current working installation is preserved. No additional reinstall/force-quit was performed for the final review. Build artifacts and local validation evidence are outside the source patch. Small fixed-phase diagnostic files may remain in the phone's Documents directory; no production diagnostic code remains.

### Additional source protections, not yet installed

- `check-ios-service-env.mjs` rejects missing/invalid production proxy configuration before an iphoneos Release bundle. Diagnostics identify keys only, never values. Self-tests cover absent configuration and unsafe URLs. `bundle-react-native.sh` runs both service configuration and installed native-module checks; CI can supply existing environment values without a checked-in env file.
- `AppNavigator.tsx` previously ignored every later occurrence of a previously handled deep-link URL. A second tap on the same widget/Live Activity could therefore fail to navigate. Warm events now navigate again, while initial-URL replay stays suppressed. Malformed URLs and stale asynchronous effects are ignored. The production-effect regression failed before the fix and passes for cold restore, repeated warm taps, hydration, malformed URL and cancelled effect.

### Live Activity / Dynamic Island: evidence and limits

| Check | Result | Evidence limit |
| --- | --- | --- |
| Native/JS activity contract | PASS | Source contract checks; no real activity created |
| Registration, auth, APNs payload/JWT, retry, token rotation, deduplication | PASS | Production functions with synthetic credentials and mocked APNs only |
| Widget and Live Activity Swift SDK typecheck | PASS | iOS Simulator SDK; does not prove visible presentation |
| Repeated identical deep-link taps | FIXED / regression PASS | Source change not yet installed |
| Current visible Dynamic Island | No WeatherON activity visible in read-only capture | Does not establish ActivityKit internal state |
| Live Activity / Dynamic Island functional acceptance | USER CONFIRMED PASS | Direct user confirmation; individual display states and APNs termination were not separately instrumented |

The user subsequently confirmed Live Activity and Dynamic Island working. Account connection, weather refresh, widgets, Live Activity and Dynamic Island all have user acceptance. No additional device action or confirmation is requested.

Existing activity creation can replace other WeatherON departure activities; no synthetic activity or saved departure was created during this review. The countdown uses system timer rendering. A host DispatchWorkItem alone cannot guarantee termination while suspended; authenticated server registration and APNs end delivery provide the remote path. Development builds use the sandbox APNs path with separate server credentials. Their deployment availability was not asserted or changed. Weather/guidance content is app-updated; no continuous background weather update is promised by the Live Activity.

Latest rerun: correctness batch, deep-link regression, installed native-module integration, service-env self-tests, Live Activity contracts, departure-push mocks and mobile TypeScript all PASS. Earlier full regression results remain in the matrix above. The baseline Android TermsConsent assertion remains unrelated and unresolved. No standalone lint command is configured.

Local tooling limitation: several task-owned filesystem rename operations became uninterruptible during native dependency staging; targeted termination was requested, without resetting the Mac or unrelated processes. Copy-based staging in ignored local dependency copies allowed the successful build. These local workarounds are not source deliverables.

The user authorized committing and pushing this batch to the existing public fix branch. PR, main merge and deployment remain outside scope. Legal/privacy owner confirmation, release distribution provisioning, Android reminder semantics and the remaining device checks are not represented as completed.
