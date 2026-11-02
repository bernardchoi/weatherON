# Home leaving-now display and Live Activity investigation — 2026-11-02

Base: `bcc790f61b339e9b9d3ba739a4edbb23fa6925e0` (HEAD and freshly fetched origin/main matched). The initial working tree was clean. Implementation and investigation below preceded publication. The user subsequently authorized committing and pushing the approved patch to a dedicated branch; this supersedes historical no-commit/no-push notes in earlier sections. PR creation, main merge, build submission, deployment and device testing remain outside this delivery.

Current final status after the focused Dynamic Island request: prior Home, test-contract, arrival-route cadence and native-registration safeguards are preserved. A direct compact/minimal glyph fallback fix and nonidentifying native lifecycle diagnostics are now added; details are in the last section. The latest fetched main remains `bcc790f61b339e9b9d3ba739a4edbb23fa6925e0`. Mobile typecheck, Source checks aggregate, supporting regressions and UTC/Seoul route checks all pass. Absolute trip calculation, notification policy, 60-minute OS activation policy and server payload remain unchanged. The reported normal-input physical Dynamic Island failure is not established as caused by the glyph defect, nor verified resolved. Apple SDK compilation and physical-device verification remain unavailable; Build 59 mapping is not a prerequisite.

## Home fix

The leaving-now audit's state/model contract remains intact, but the simplified iOS Home rendered `departureSummary.body` instead of the already-built `nowArrivalDescription`. Home now renders the current description once, including ETA, latest/reference status and original query time. Without current information it retains the existing schedule guidance. The explanatory row is also eligible whenever a current description exists. Existing typography and untruncated full-width placement remain unchanged.

The initial runtime fix changed only Home rendering. The later A/B investigation also fixes the active app's scheduled-route refresh cadence as described below. Saved schedules, absolute timing, notification/ActivityKit contracts, current-route calculation and background design were not changed.

`check-home-leaving-now.mjs` executes the actual Home declaration block and both platform JSX paths using production timing/description helpers. It checks 216 destination renders plus 216 no-destination guards: iOS/Android/web, arrival/departure bases, before/after scheduled departure, scheduled route ready/fallback/loading, and current latest/error/reference/offline/unavailable/loading/absent information. Query time and fixed reference ETA, duplicate suppression, accessible text and state immutability are checked. Against the original Home source the test fails at the past/latest iOS case; against the patch it passes. This is a JS rendering-path check, not browser/native visual proof.

## Live Activity: arrival-based automatic start — unresolved on device

Existing policy is **computed departure minus 60 minutes**, not target arrival minus 60 minutes and not the independently configurable notification lead. The rule is present in `departureLiveActivity.shared.ts` and native `departureActivityLeadTime`.

Both schedule bases feed `getDestinationTiming` into the same production automatic `buildInput` callback. An arrival target uses the route's departure/seconds/buffer; native ActivityKit receives only an absolute departure, not the time basis. On iOS 26 the native request schedules `start = departureAt - 60 minutes` with `.standard` and an alert configuration. Older iOS uses the existing foreground timer/foreground reconciliation; background activation is not guaranteed by that JS fallback.

The new `check-departure-activity-schedule.mjs` pairs arrival **11:00 / 40 minutes travel / 5 minutes buffer** with explicit departure **10:15**. Both produce departure **10:15**, activation **09:15**, the same iOS provider/native input and the same automatic-end server deadline. The check uses the actual builder and provider, with native/account boundaries mocked, across repeat/nonrepeat and drive/transit/walk. It also checks notification-lead independence and rejects expired/stale/error/fallback/origin/target mismatches for both bases.

The common freshness guard currently emits `null` when timing is invalid or the route expires/fails verification; `null` can cancel a previously active/scheduled countdown through reconciliation. This is an existing explicit policy from the route-connection audit, applies to both bases and is a **possible condition to inspect**, not an established cause of the user's asymmetric report. No freshness guard was removed or weakened.

The server `/live-activities/departure` registers an **end** job at departure. It does not start the Activity an hour beforehand. The server has no arrival/departure scheduling branch; it receives the same departure deadline.

The initial fresh-input comparison found no wrong 60-minute Activity basis or reproducible fresh-input failure. The subsequent A/B lifecycle investigation below identifies a separate arrival-route retry mismatch, reproduces it through the actual request effect and fixes it. Actual installed build, saved route's original query/expiry/selected target, Activity lifecycle at activation, and OS start/presentation evidence remain needed to determine the user's complete cause. No personal schedule/settings or existing long-running test was touched.

## Live Activity: Dynamic Island — unresolved on device

The widget registers `WeatherONDepartureLiveActivity` and provides expanded leading/trailing/bottom, compact leading/trailing and minimal views. Compact trailing uses the same absolute departure countdown as the Lock Screen; minimal uses the guidance icon. The native request uses `.standard`, not a transient presentation. `ActivityContent` sets relevance 80 and staleDate to departure. The authenticated server payload is an ActivityKit `event: end` with `apns-push-type: liveactivity` and the bundle's `.push-type.liveactivity` topic; it is distinct from Expo local notifications.

The added regression asserts all presentation branches and native scheduling contract; existing native/static and mocked push tests pass. There is no device evidence establishing whether the reported Lock Screen item is an active ActivityKit card, a retained ended card or an ordinary notification. No code change claiming to force Dynamic Island display was made.

[Apple's ActivityKit documentation](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities) explains that the system selects presentations, supported hardware is required for Dynamic Island, competing Activities affect selection, and an ended Activity can remain on the Lock Screen after removal from Dynamic Island. These are conditions to check, not a diagnosis of this device. A physical unlocked supported iPhone, installed build/OS and concurrent Activity/lifecycle state are required for verification.

## Validation

| Check | Result |
|---|---|
| `node scripts/check-home-leaving-now.mjs` | PASS; original source negative control FAIL as expected |
| `node scripts/check-home-plan-width.mjs` | PASS, existing 320–440pt / 1–2x text JSX/style checks |
| `node scripts/check-home-outing.mjs` | PASS |
| `node scripts/check-departure-activity-schedule.mjs` | PASS; actual builder/provider + static Swift contract, mocked native/account |
| `node --no-warnings scripts/check-review-regressions.mjs` | PASS; includes both new checks |
| `npx tsc -p apps/mobile/tsconfig.json --noEmit` | PASS |
| `npm run check:shared` | PASS |
| `npm run check:android-product-quality` | PASS |
| `node --no-warnings scripts/check-ios-reliability.mjs` | PASS |
| `node --no-warnings scripts/check-correctness-batch.mjs` | PASS |
| `npm run check:mobile-localization` | PASS, 2238 messages |
| `node scripts/check-ios-live-activity.mjs` | PASS, source contracts |
| `node scripts/check-departure-activity-intent.mjs` | PASS |
| `node scripts/check-departure-push.mjs` | PASS, mocked HTTP/native boundaries, no live APNs |
| `node scripts/check-weather-outfit-regressions.mjs` | PASS after the authorized test-only duration-contract repair described below |
| `TZ=UTC node --no-warnings scripts/check-route-selected-time.mjs` | PASS in full after the authorized fixture repair; includes leaving-now recovery cases |
| `TZ=Asia/Seoul node --no-warnings scripts/check-route-selected-time.mjs` | PASS in full, including the real local quiet-hours boundary assertions |
| `git diff --check` | PASS |

The weather/outfit manual loader now connects real `./zonedDateTime` and `../state/appStateHelpers` dependencies and reuses the connected travel module for its final assertions. No app time-zone logic was changed. Initial zero-minute assertion and timezone-fixture failures were reproduced against HEAD's unchanged runtime sources. Historical failure excerpts are retained in `baseline-weather-loader.txt` and `baseline-route.txt`; these are not final results. After the authorized test-only repairs below, the complete aggregate passes. Final logs: `final-aggregate.txt`, `final-types.txt`, `final-supporting.txt`, `final-route-utc.txt`, `final-route-seoul.txt`. The aggregate log runs all Source checks workflow commands after installation (Android product quality, iOS reliability, correctness, weather/outfit, review and localization); typecheck runs separately and passes.

No In-app browser connector was available, and `xcrun`/`swift` are absent in this Linux environment. Browser visual capture, Apple SDK compilation, physical iPhone/ActivityKit scheduling and Dynamic Island/Lock Screen rendering, live APNs, TestFlight and prolonged/offline device tests are **not run**. No simulator substitute was used. There was no approval denial; the device/native checks remain unavailable, and the two reported Live Activity symptoms remain unconfirmed/unresolved.

## Final read-only diagnosis of the two existing check failures

### Route-selected-time: original host-timezone-dependent fixture, now repaired

- Original failing command in this UTC environment: `node --no-warnings scripts/check-route-selected-time.mjs`.
- `scripts/check-route-selected-time.mjs:255` creates an alarm at Seoul 07:10, which is UTC 22:10 on the preceding day. The native sync at line 418 does not supply `reducedInterruptions`, so the real adapter defaults it to `true` (`localNotifications.ts:119`).
- `notificationPolicy.ts:59–63` reads `Date.getHours()` in the host/device local timezone and excludes 22:00–07:00. Under UTC, the fixture is correctly excluded; the reservation count is zero at the line 419 assertion. This is ordinary notification policy, not the ActivityKit start path.
- Read-only diagnostic command: **`TZ=Asia/Seoul node --no-warnings scripts/check-route-selected-time.mjs` passes the entire script**, including previously unreachable current-route/offline/reference/recovery cases. The complete diagnostic log is `route-kst-diagnostic.txt`.
- Classification: a timezone-dependent test fixture, not evidence of a runtime scheduling defect or the reported arrival-only Activity failure. This does not decide whether a different product timezone policy is desirable.
- Authorized test-only repair applied: absolute DATE-trigger identity/replacement/cancellation calls explicitly use `reducedInterruptions:false`. The same script separately executes the real policy with tomorrow's local wall-clock fixtures at 00:00/06:00/07:00/12:00/21:00/22:00/23:00, checking suppression with policy ON and eligibility with policy OFF. Both full commands `TZ=UTC node --no-warnings scripts/check-route-selected-time.mjs` and `TZ=Asia/Seoul node --no-warnings scripts/check-route-selected-time.mjs` now pass. No user preference or production quiet-hours rule was changed.

### Weather/outfit: original obsolete travel expectations, now repaired

- Original failing command: `node scripts/check-weather-outfit-regressions.mjs`.
- Original main fails earlier on the manual loader's missing `./zonedDateTime` dependency. This patch connects that dependency at both load sites and the newly required real `../state/appStateHelpers`; it does not alter production travel logic or skip assertions.
- With imports fixed, line 421 expects a ready zero-minute transit estimate to be unavailable, while production `travelEstimate.ts:99–101` accepts finite seconds **greater than or equal to zero** and returns seconds / 60. A direct bundled-production diagnostic returns `0 → 0`, `-1/NaN/Infinity → undefined`, `51 → 51`, `51.2 → 51.2`.
- The line 424 assertion (not reached after the first failure) also expects `51.2 → 52`; that conflicts with the seconds-preserving model. `check-route-selected-time.mjs:194` already asserts exact `223 / 60`, and `proxyCore.mjs:341` explicitly supports zero-duration same-coordinate routes (`check-route-selected-time.mjs:97–99`). Existing display rounding is a different layer.
- Classification: stale expectations against the newer zero/seconds contract, not evidence that the Home patch broke travel. The particular test uses distance 1000 with zero minutes, so if rejecting inconsistent nonzero-distance/zero-duration provider results is desired, that is a separate validation-policy change needing its own contract/tests, rather than a reason to reject all zero-duration routes.
- Authorized test-only repair applied: zero minutes and same-point zero seconds are accepted; zero with a failed route stays unavailable. Negative/nonfinite/missing/over-seven-day minutes are rejected; fractional minutes retain precision. Explicit seconds override conflicting minutes, including zero seconds; invalid supplied seconds cannot fall back to valid minutes. Seven days is accepted at the inclusive boundary. No product calculation or global minute rounding was changed. The complete weather/outfit command and aggregate now pass.

### Physical-device evidence still needed

| Evidence | Purpose / code boundary |
|---|---|
| iPhone model, iOS version, actual installed app version/build | Establish Dynamic Island hardware support and iOS 26 scheduled-start API availability; native module lines 223–239, status lines 328–351 |
| Affected destination's saved arrival target, transport, repeat days, computed departure and the time the app was backgrounded | Compare one absolute trip and its start = departure minus 60, not arrival minus 60; state builder lines 1066–1102, shared activation helper lines 50–57 |
| Route status, requestArrivalTime/requestDepartureTime, origin/mode identity, original updatedAt/expiresAt/cacheStatus at registration and activation | Identify timing mismatch, expiry or rejection before ActivityKit; appStateHelpers lines 397–408, travelEstimate lines 108–114, state builder lines 1081–1084 |
| Destination detail's actual status and, when accessible, ActivityKit lifecycle/activity ID/departure deadline before and after activation | Distinguish generic automatic-start text from confirmed scheduled/active state; native lifecycle/status lines 321–351 and iOS provider registration |
| Unlocked Home/Dynamic Island + Lock Screen item at the same timestamp, including whether the item is a persistent countdown card or ordinary notification | Separate ActivityKit surfaces from Expo notification; widget ActivityConfiguration and compact/minimal/expanded declarations, localNotifications scheduling |
| Other active Activities and whether the item has already completed/ended/staled | Distinguish OS selection/retained Lock Screen content from missing app presentation; native lifecycle, widget stale/completed branches and Apple's presentation rules |

No push tokens, authentication credentials or private addresses are required in user-facing evidence. Physical device checks remain unavailable here; no simulator, personal setting change or production-server action was attempted.

## File handoff

The initial Library save attempt failed on a connection/network error before upload preparation, returning no upload/file ID. Following explicit authorization, exactly one retry via the same supported Library helper path was performed after final report/patch generation. It failed at the same pre-upload connection stage (`network`), again returning no upload/file ID. Neither failure is an approval denial or an uncertain successful upload. No further retry, alternate external service or local-path download link was used. The finalized report and patch remain local workspace artifacts.

## Follow-up: user's same-destination A/B reproduction and image access

The user reports that departure-basis activity appears with no app launch, arrival-basis activity requires opening the app at the countdown start, and Dynamic Island is absent for both. This user observation is retained; the earlier pure-input tests are not treated as proof that the real flow works.

Three PNG references were prepared through the current Library resolved-reference materialization route. Library returned the original names `image(20261102-004736).png`, `image(20261102-004737).png`, and `image(20261102-004738).png`. Each complete transfer object was passed once to the current bundled transfer helper. All three downloads returned `library file transfer failed: download failed`; none of the destination files exists. No pixel could be opened. Consequently this report infers no device model, build, time, saved schedule or Activity status from those images. No raw-URL workaround, guessed storage path or repeat download was used.

### Confirmed code defect and scoped fix

The actual route request effect previously set `nearDeparture` from `targetAt - storedDuration`, regardless of time basis and without arrival buffer/provider-solved departure. Consider the same absolute departure at **10:00**, arrival target **10:50**, travel **40 minutes**, buffer **10 minutes**, at **09:00:01**:

- The common timing and native Activity use departure **10:00** and activation **09:00**.
- Server `proxyCore.mjs` computes route TTL from the effective solved departure; inside an hour it returns a **one-minute** expiry.
- The old arrival client used **10:10** for its cadence test and held requests for **ten minutes**. The departure-basis client for the same 10:00 departure retried at **one minute**.
- The route can therefore expire during an avoidable nine-minute arrival retry gap. `canScheduleTravelEstimate` rejects it; automatic input becomes `null`, which ends an existing active/pending Activity. Opening the app clears the throttle and can refresh/recreate it. This is a demonstrated code path compatible with part of the reported behavior, **not proof of this user's device sequence**.

`useWeatherOnAppState.ts` now obtains the same `getDestinationTiming(...).departureAt` used by the Activity and uses its remaining interval for the one-minute/ten-minute decision. The comparison uses the current clock and includes exactly 60 minutes, matching the existing Activity auto-window. When timing is unavailable, the fallback cadence uses a direct target for departure basis and duration subtraction only for arrival basis. No stale route is promoted to verified input; the freshness guard, 60-minute Activity start, native APIs and server payload are unchanged. This changes active-app retry cadence only, within the existing at-most-once-per-minute limit.

### Actual lifecycle regression, beyond pure input comparison

`check-departure-activity-schedule.mjs` now extracts and executes the production route effect, automatic Activity builder, foreground callback and iOS provider. It checks both bases through:

1. A real scheduled request with matched original target and absolute departure; arrival includes the ten-minute buffer.
2. The actual attempt map's retry deadline: one minute for both bases. Against the original main state source, the arrival assertion fails with **600000 ms**; after the fix it passes. Negative-control log: `lifecycle-negative.txt`.
3. The real inactive-app lookup guard: no additional route request in background.
4. A deliberately expired route through the production builder returning `null` and provider reconciliation ending the mocked native Activity. This confirms the existing limitation; it is not suppressed by the new test.
5. The actual foreground callback clearing route-attempt state and updating the minute tick, followed by a fresh request, valid input and local Activity recreation.

Only native/account boundaries are mocked. The test does not simulate or claim successful iOS background execution or physical Dynamic Island rendering. Latest logs `lifecycle-final-aggregate.txt`, `lifecycle-final-types.txt`, `lifecycle-final-routes.txt`, `lifecycle-final-supporting.txt` all completed with exit 0. The routes log runs the complete script under UTC and Asia/Seoul. The aggregate includes the expanded lifecycle test. The Home regression remains intact.

### Remaining hypotheses and physical verification boundary

- Changing arrival/departure basis or target makes an old route's request metadata mismatch the saved schedule. The builder rejects it until a new route arrives. The Kakao arrival path can perform up to six calls within a 12-second budget; the departure path uses one selected-time call. If the app backgrounds before a valid native reservation exists, there is no server push-to-start job to replace it. This is a source-supported timing/race hypothesis, not established device causation.
- Route requests run only while `AppState.currentState` is active. Foreground recovery clears the throttle and retries; `/live-activities/departure` only schedules APNs **end**. An expired/missing activity is not independently recreated by this server while the app is suspended. The cadence repair does not add a background scheduler or guarantee recovery while suspended.
- Dynamic Island has all compact/minimal/expanded branches and receives the same Activity attributes for either basis. No branch specific to arrival or departure explains the common report. It must remain separate from route lookup and from ordinary notifications. No speculative native layout/payload change was applied.
- Needed to finish: accessible pixels and installed model/OS/build; actual confirmed scheduled/active Activity state immediately before backgrounding and at activation; route query/expiry/target and computed departure; simultaneous unlocked Dynamic Island/Lock Screen evidence and other active Activities. No private address, token, account secret or user preference change is required.

No device monitoring, simulator, personal setting or operational server action was performed. Image materialization is blocked at download, not approval-denied; the files are known not to have been installed locally. No successful image inspection or complete Live Activity fix is claimed.

## Follow-up: supplied iPhone / iOS / TestFlight build

User-supplied environment is **iPhone 16 Pro Max, iOS 27.2, TestFlight 1.0(59), displayed code `57256a`**. These are trusted text observations; the image pixels remain inaccessible. The model is listed among Dynamic Island devices in [Apple's Live Activities design guidance](https://developer.apple.com/design/human-interface-guidelines/live-activities); unsupported hardware is excluded from this investigation. Do not ask the user to supply the same environment again.

### Installed-source mapping is not established

- `57256a` is retained exactly as a user-reported display code. It was not found in tracked version/build configuration or git history. `git rev-parse --verify '57256a^{commit}'` did not resolve a commit; the authorized GitHub commit lookup also returned HTTP 422, “No commit found for SHA: 57256a”. A subsequent broader audit-text search found **`WeatherON (57256a)` as the app menu name on the Build 56 screen**, in `docs/audits/live-activity-end-2026-10-23/build56-distribution-entitlements.txt:18–21`, with `1.0.0 (56)` at lines 34–35. Thus it is confirmed as part of that App Store Connect display name and cannot uniquely identify Build 59 or its commit. The earlier broad statement that no repository record contained it is superseded by this finding.
- Current app UI `MyScreen.tsx:224` hardcodes `WeatherON v1.0.0`. The repository's app and extension use source build 41, and the audit explicitly distinguishes that value from Xcode Cloud's incremented distribution build number. Therefore `59` cannot be mapped to a source revision by comparing `app.json`/`CURRENT_PROJECT_VERSION` alone.
- The last repository record with a verified Cloud source mapping is **Build 58 → `e955fc950bf004b7908bc19c984944ce3b2ac6af`**, in the reliability audit's lines 99–102. No Build 59 source-commit/archive mapping is present. Freshly fetched origin/main remains `bcc790f61b339e9b9d3ba739a4edbb23fa6925e0`; local changes remain preserved.
- This environment provides no App Store Connect/Xcode Cloud metadata tool, installed app bundle, Build 59 archive or device access. No build metadata request was denied; the capability/artifact is unavailable. Consequently no claim is made that the user's installation contains current main, these local fixes, or the same extension binary as Build 58.

### Verified source comparison, not a Build 59 binary comparison

Git blob comparison from verified Build 58 source `e955fc9` to current HEAD shows these files are **identical**:

- `WeatherONDepartureLiveActivity.swift` — ActivityConfiguration and compact/minimal/expanded presentations.
- `WeatheronWidgetDataModule.swift` — native request, scheduled start, token observation, status and end paths.
- `WeatherONDepartureActivityAttributes.swift` — ActivityKit data contract.
- `WeatherON.xcodeproj/project.pbxproj` and `WeatherONWidget/Info.plist` — extension source inclusion/embedding and configuration.
- `departureLiveActivity.ios.ts` — JS native request and automatic-end registration.

`WeatherONWidget.swift` changed between those source revisions, but the diff concerns leaving-now weather-widget snapshot/timeline/schedule-card fields, not a new Dynamic Island presentation or altered Activity registration. Source still embeds `WeatherONWidget.appex`, includes both Activity files and registers `WeatherONDepartureLiveActivity()` in the widget bundle. The Cloud archive hook checks app and extension signed entitlements. Its presence is not evidence that Build 59 ran/passed that hook or shipped the expected binary.

### iOS 27.2 and the automatic-start contract

The actual native availability condition is `if #available(iOS 26.0, *), startAt > Date()` and the status reports automatic-start support for major version >= 26. Thus the supplied iOS 27.2 selects the scheduled-start capability in this source; the older-iOS JS fallback does not explain this report if that source is installed.

[Apple's request API documentation](https://developer.apple.com/documentation/activitykit/activity/request(attributes:content:pushtype:style:alertconfiguration:start:)?changes=latest_major,latest_major) states that a scheduled request returns a pending activity and the system starts it at the specified date even while the app is backgrounded. The current official [iOS 27.2 release-notes page](https://developer.apple.com/documentation/ios-ipados-release-notes/ios-ipados-27_2-release-notes) was located; its complete release-note body was not retrieved by the browsing tool. No iOS 27.2-specific ActivityKit/Dynamic Island bug is established or asserted from these checks.

Clarification of the earlier server statement: **in the inspected checkout, the `/live-activities/departure` implementation sends `event:end`; this does not mean automatic background start is absent.** Native iOS 26+ OS scheduling is a separate path. It also does not prove that every deployed service/version lacks a push-to-start implementation. No deployed service or installed Build 59 binary was inspected.

An already accepted native pending reservation does not require the automatic-end server registration to succeed in order to start. Its staleDate is departure, not route expiry. Route expiry cancels an Activity only when JS actually reevaluates the input and invokes null reconciliation; expiry alone while JS is fully suspended does not execute this cancellation. The lifecycle regression intentionally invokes that reconciliation and must not be read as proof of an OS wakeup or automatic cancellation during full suspension.

### Remaining exact evidence, without repeating known device questions

1. **Build 59 identity:** Xcode Cloud source commit/build record and the signed archive's app/extension version and source metadata. This is a release-artifact lookup, not another request for the user's model/OS/build.
2. **Before backgrounding:** whether the affected arrival schedule was actually `scheduled` with the expected activity/departure (confirmed “start reserved” state), or only the generic automatic-start label. Preserve the saved target, computed departure and route original expiry/query metadata.
3. **At the reported missing-display time:** actual Activity lifecycle (`pending`, `active`, `stale`, ended/absent), correct deadline and whether the Lock Screen item is a native Activity or ordinary notification. An app-open observation alone changes the recovery flow and cannot establish the pre-open state.
4. **For the common Dynamic Island issue:** accessible simultaneous unlocked-screen/Lock Screen evidence and Activity lifecycle/other active Activities. Hardware support is known; the remaining issue is runtime state/presentation and the actual extension installed in Build 59.

No further production-code defect is proven by the newly supplied installation details, so no speculative native or scheduling change was added in this follow-up. The existing Home/cadence fixes and their passing validation remain intact. This follow-up performs read-only source/metadata/documentation checks plus this report update; no device/SDK test, deployment or new upload retry was performed.

## Final continuation: latest main, actual OS registration order and replacement

The user explicitly instructed continuing against latest main. A new fetch confirmed origin/main and HEAD still at `bcc790f61b339e9b9d3ba739a4edbb23fa6925e0`; no reset/rebase/checkout or overwrite of existing modifications was needed. AGENTS.md was reread; no repository `.agents/skills` directory exists and the workspace skill directory has no SKILL.md. Installed Build 59 mapping was not used to block implementation and is not requested again.

The new mail-image transfer also failed before a local PNG existed, so its pixels were not inspected. Parent-supplied OCR's destination-timeline/spacing/care-switch release description closely matches `bcc790f` but is not an exact Build 59 source binding. The already-known model/OS/TestFlight information remains accepted. No user metadata is inferred from inaccessible pixels.

### Additional confirmed defects and changes

1. **Server automatic-end acknowledgements blocked new OS start registration.** `performAutomaticDepartureLiveActivitySync` originally called `getDepartureLiveActivityStatus()`, which waits for authenticated end-server registration. The automatic-sync queue also waited for that network response from each previous sync. A delayed old acknowledgement could therefore postpone a new native reservation until the app backgrounded. The new regression holds the real provider's HTTP promise and demonstrates both stalls before the fix. The provider now reads native state directly for mutation decisions and serializes native mutations independently of the existing ordered server-registration queue. Callers still receive the real end-registration outcome; no successful server acknowledgement is fabricated, and token rotation/order/retry contracts remain tested.
2. **Foreground-to-background transition during native status await.** The provider now checks AppState immediately before requesting a new native Activity, including the exported start boundary. A replacement that reaches this point after backgrounding retains the accepted native reservation and defers a new request until foreground. Explicit null/past/care-off reconciliation may still end an Activity while backgrounded. The regression pauses the native status read, backgrounds the app, then verifies zero new native requests and successful replacement after foreground return.
3. **Destructive native replacement before success.** Native Swift previously ended every Activity before requesting the replacement. A failed request (including ActivityKit foreground/authorization/limit errors) could discard a valid accepted reservation. It now requests token-enabled activity, tries the existing local fallback if needed, and ends other activities **only after a replacement request succeeds**. This is verified by the Swift source-order contract; Apple SDK compilation/device execution remains unavailable. At an OS simultaneous-activity limit, replacement can still fail while preserving the previous reservation; it is not reported as successful.
4. **Wrong-time acknowledgement and misleading detail status.** The state effect previously accepted matching destination ID as replacement success even when native status still described the previous time. It now requires active/scheduled state and an absolute-departure match within one second. Destination detail likewise uses current-plan matching before claiming “start reserved” or showing the new deadline; a retained earlier plan uses the existing preserved-countdown copy. No new translations were needed.

Changes are confined to the existing Home/cadence fixes plus `departureLiveActivity.ios.ts`, the native request ordering in `WeatheronWidgetDataModule.swift`, exact-time acknowledgement in `useWeatherOnAppState.ts`, and truthful status selection in `DestinationCareScreen.tsx`. The server, saved schedule schema, target/departure solver, start lead and Dynamic Island Swift layout were not rewritten.

### Expanded regression evidence

`scripts/check-departure-registration-order.mjs` executes the production iOS provider with deferred native/network boundaries and the actual state-effect/detail-status expressions. It checks old public-status and old automatic-sync server-response stalls, independent token-registration ordering, background transition, foreground recovery, explicit background end, exact-time acknowledgement and retained-plan copy. Native Swift replacement ordering is explicitly labeled a static contract, not native runtime proof. Before-fix logs: `registration-order-negative.txt`, `registration-queue-negative.txt`. It is connected to the aggregate review check.

The earlier route lifecycle check still executes actual requests, expiry/null/end and foreground recovery for both arrival/departure bases, while server route/payload checks use existing mock HTTP paths. Home's actual JSX cases, storage preservation, quiet-hours boundaries, route seconds and old ownership/race tests continue to run. No pure-input comparison is presented as end-to-end device proof.

Latest final command groups, all **exit 0**:

| Group | Checks / saved log |
|---|---|
| Typecheck | `npx tsc -p apps/mobile/tsconfig.json --noEmit`; `main-final-types.txt` |
| Source checks aggregate | Android product quality, iOS reliability, correctness batch, weather/outfit, review (all three new checks), localization 2238 messages; `main-final-aggregate.txt` |
| Route/timezone | Complete route-selected-time script with `TZ=UTC` then `TZ=Asia/Seoul`; `main-final-routes.txt` |
| Supporting | shared, Home width/outing, iOS Live Activity contracts, intent, departure push/token rotation, destination presentation and explicit Home ownership; `main-final-supporting.txt` |
| Patch hygiene | `git diff --check` and apply-check against original HEAD archive |

There are no unexpected failures in these final executable checks. Swift SDK compile, physical scheduling/Lock Screen/Dynamic Island, live APNs and TestFlight installation remain **not run**. No simulator was substituted. The exact blocked native action is compilation/device verification of the modified iOS module: this Linux environment has no xcrun/Apple SDK or connected iPhone. This is unavailable capability, not an approval denial.

### Dynamic Island finding and remaining concrete verification

Compact leading/trailing, minimal and expanded regions remain present and use the same activity/departure for either basis. No verified defect in these rendering branches was found. Retaining a valid reservation and avoiding background replacement failures may prevent an Activity from being lost, but this is not claimed to resolve the reported two-basis Dynamic Island absence.

The smallest remaining runtime distinction is whether the correct Activity is actually **pending/active** at the expected deadline or is absent/ended while an ordinary/retained Lock Screen notification is visible. Current native status already exposes lifecycle, activity/destination IDs and departure deadline (`departureActivityStatusJson`); exact-plan UI status now reflects that deadline. Accessible simultaneous unlocked/Lock Screen evidence and native lifecycle before app reopening can distinguish registration/lifecycle failure from OS presentation. The known iPhone 16 Pro Max hardware is supported; no hardware-information repeat or installed-source SHA request is needed to continue verification.

The proven source races/cadence defects are fixed and locally verified. Causation for every reported physical symptom, and actual Dynamic Island presentation, remain unconfirmed. No commit/push/PR/merge/deployment, operational-data or personal-setting change, long-running monitoring, simulator or additional Library upload retry occurred.

## Focused Dynamic Island investigation and direct presentation fix

The user explicitly requested investigating and resolving absent Island output independently of automatic-start fixes. The complete available source/build/asset/state paths were inspected, not just the existence of DynamicIsland closures. The user's report that Lock Screen content is visible is retained; ordinary-notification/ended-Activity distinctions are evidence questions, not a rejection of that report.

### Proven conditional blank-content defect

Compact leading and minimal call `WeatherONDepartureGuidanceIcon`; minimal consists solely of that icon. Its previous `symbol ?? "figure.walk.departure"` handles nil but accepts empty/unknown strings. The shared renderer maps known app symbols to bundled artwork and sends other strings to `Image(systemName:)`. An empty/unsupported symbol can therefore leave the only minimal content empty. This is a source-level missing-fallback defect for malformed/legacy content; no evidence yet proves that the user's actual ContentState contained such a symbol.

`WeatherONDepartureLiveActivity.swift` now normalizes compact/minimal symbols through `weatherONDepartureIslandSymbol`: known rain/wind/stale symbols retain the same app artwork, and nil/empty/unsupported values resolve to the existing bundled departure silhouette. Normal input's 16pt styling, palette, timer and layout are unchanged. No broad redesign, forced foreground presentation, permission change or relevance-score escalation was made. The new regression fails against the original Island source and passes after this fix. This is a direct Island presentation-code change, separate from the earlier registration work.

### Other paths inspected and evidence limits

| Path | Source / quantitative finding |
|---|---|
| Lock Screen vs Island | Separate ActivityConfiguration branches; Island has expanded leading/trailing/bottom, compact leading/trailing and minimal. No active-state/time-basis condition hides the entire Island branch. |
| Content | Compact trailing uses the same required absolute departure and completed/stale/countdown branches. It is bounded to 46pt; the leading/minimal glyph renderer has a fixed 16×16pt frame. Source bounds are not physical SwiftUI measurements. |
| Color | Dark Island accent is RGB 255/209/122, secondary 196/220/227. Computed contrast on black is approximately 14.65:1 and 14.69:1 respectively, so source colors do not explain invisible normal content. |
| Actual images | Opened the existing departure PNG and decoded departure/umbrella/wind/time alpha data. Images are nonempty transparent silhouettes; their 16pt scaled bounds span roughly 10–14pt. Catalog templates and build resource inclusion are correct. |
| Image-size constraint | Bundled source images are 192×192 and explicitly resized to the fixed view frame. Apple's asset-size guidance is relevant, but raw PNG size alone does not prove the rendered presentation violated the limit. The same renderer also has prior Build 56 physical Island evidence. No speculative asset rewrite/downsampling was made. |
| Widget/build | Activity is an unconditional sibling in the WidgetBundle; ordinary weather-widget supportedFamilies do not gate it. Activity source/attributes, catalog resources, extension embedding, WidgetKit extension plist, app Live Activities key, iPhone target and iOS 17 extension deployment configuration are present. Installed Build 59 binary signing/embedding remains uninspected. |
| Native state/style | Scheduled iOS 26+ and immediate requests are standard Activities; no transient-style request exists. Stale date is departure; relevance is 80. Existing server sends end, not a new start. These do not independently prove OS presentation. |
| Earlier physical evidence | Build 56 audit records expanded Island visible before departure and gone after departure. This confirms prior success, not current Build 59/iOS27.2 behavior. |

[Apple's ActivityKit presentation guide](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities?changes=_6) explains system selection of compact/minimal presentations and that an ended activity can remain on the Lock Screen after leaving Dynamic Island. It also requires image dimensions appropriate to the presentation. These conditions were checked against source; no iOS27.2-specific system bug or hardware incompatibility is asserted. Hardware support for the supplied iPhone16ProMax is known.

### Minimal nonidentifying runtime diagnosis added

The native module now observes `activityStateUpdates` alongside its existing token observer, cancels both observers on replacement/end/module destruction, and emits fixed **DepartureActivity** log events for scheduled/immediate request mode, reuse, explicit end, lifecycle state and numeric request-failure codes. It never logs tokens, activity/destination IDs, names, coordinates, departure dates, content or localized error descriptions. These logs help distinguish failed request/pending/active/stale/ended/dismissed states; they do not report whether pixels are actually displayed.

The existing native status JSON additionally includes four counts for this app's Activity type: total, active, scheduled and stale. `departureLiveActivity.shared.ts` validates finite nonnegative integer counts and rejects inconsistent sums; unknown/private fields are not propagated. Old native builds without diagnostics remain supported. This local diagnostic object is not added to server registration, Activity content-state or persisted user data. It cannot enumerate other apps' activities or detect the system's selected Island presentation.

State-observer log timestamps are observation times while the process executes. They do not establish an exact transition time during full suspension, and the observer is not claimed to wake the app or monitor the device continuously. No new background mode, entitlement, settings request or monitoring task was created.

### Latest regression results and exact remaining blocker

`check-dynamic-island-contract.mjs` is added to aggregate review checks. It inspects Swift/build contracts and extracts the actual declarative glyph mapping, decodes real PNG alpha pixels, checks bounds/tint, executes the production TypeScript diagnostic parser on valid/invalid/legacy/private-extra-field cases, and checks the native observer/log-field allowlist. It is explicitly **not a SwiftUI/ActivityKit renderer or Swift compiler**. Icon synchronization remains byte-identical to app artwork. Logs: `island-negative.txt`, `island-final-aggregate.txt`, `island-final-types.txt`, `island-final-routes.txt`, `island-final-supporting.txt`.

All final executable groups passed: mobile typecheck; complete Source checks aggregate including all new checks; full route script in UTC and Asia/Seoul; shared/Home/ownership/destination/Live Activity/push regressions; asset-catalog sync and the focused Island contract. Diff hygiene and original-HEAD patch application checks pass. No unexpected test failure remains.

The precise blocked next stages are **Apple SDK compilation of the modified app module/widget extension**, then **physical iPhone16ProMax/iOS27.2 observation of the correct pending/active Activity and simultaneous unlocked Island/Lock Screen output**. This Linux environment has no xcrun/Apple SDK or connected iPhone; simulator substitution is prohibited. New diagnostics are unshipped and would require a separately authorized internal candidate to run on-device. No build/upload/deployment or device-setting action was attempted, and there was no approval denial.

The investigation found and corrected the conditional blank-glyph path and added a privacy-limited means to distinguish lifecycle and presentation failures. It did **not** establish that this glyph input caused the user's normal-input two-basis failure. The overall reported physical Dynamic Island issue therefore remains **unresolved/unverified**, rather than being declared fixed by source contracts alone. Current-state logs plus an accessible physical screen are the remaining evidence, not another build-SHA prerequisite.

## Commit/push handoff

The user authorized publication on dedicated branch `fix/home-eta-live-activity-20261102`, while reserving actual build/distribution/device checks for their later session. No unrelated working-tree files were present; only the approved source/tests and this task's audit evidence are included. The final exact commit and remote-ref verification are supplied in the handoff response, avoiding a self-referential commit hash in this document.

Before commit, mobile typecheck, the full Source checks aggregate, UTC/Seoul route regressions and supporting checks were rerun against the final source. Logs are `publish-final-types.txt`, `publish-final-aggregate.txt`, `publish-final-routes.txt`, and `publish-final-supporting.txt`. No new native/device success is inferred: Swift compilation is not run here, and the reported physical Dynamic Island issue remains unresolved/unverified.

The current Source checks workflow triggers pushes only to `main`, or pull requests targeting `main`. A feature-branch push without a PR is therefore not expected to launch that workflow. Remote status is checked after push; a missing remote run is not represented as remote CI success. No release workflow is manually triggered.
