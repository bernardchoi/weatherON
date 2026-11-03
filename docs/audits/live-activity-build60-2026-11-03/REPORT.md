# Live Activity follow-up after TestFlight 1.0(60) — 2026-11-03

## Scope and observed result

The user reports that automatic Live Activity and Dynamic Island behavior remains broken on TestFlight 1.0(60), iPhone 16 Pro Max, reported iOS 27.2. Earlier symptoms distinguish departure-based automatic presentation from arrival-based presentation requiring foreground reopening; Island absence affects both bases. The installed build's exact source commit is unknown. This report does not equate it with current main.

Fetched and independently queried origin/main: `64901d05c7036e04bc97a2525d8faabc78cfec90`, containing prior fix `4961f5604d7c26f1e4d5a41ad59c18a66a9fe057`. Work is on fix branch `fix/live-activity-build60-20261103`. Prior fallback/registration changes and successful Source checks were insufficient evidence of device resolution. The user separately authorized commit/push of this branch on 2026-11-03 after reviewing the repair; that publication is separate from testing or deployment. No main write, merge, PR, build, deployment, simulator or device-setting change was performed.

## Established code-level defect and targeted repair

`useWeatherOnAppState.ts`'s actual automatic Activity builder returned `null` when a route expired, a lookup failed/staled, or matching timing was temporarily unavailable. The actual reconciliation effect forwarded that value. The actual iOS provider treats `null` as an end command, calls `endDepartureActivity`, and the native module immediately ends accepted pending/active Activities. Route refresh is foreground-only. The server endpoint `/live-activities/departure` schedules END pushes only; it cannot recreate a cancelled start reservation while the app is inactive. Scheduled starts use the native iOS 26+ standard Activity request at computed departure minus 60 minutes.

New executed regression: reserve a 10:15 departure at 09:00, using a route that expires at 09:10; before 09:15 activation, feed the expiry through the production builder, production reconciliation effect, and production iOS provider (native bridge mocked). On original main, the test fails with `arrival/active: route expiry must not cancel an accepted OS reservation`, actual `false`, expected `true`. The same path can also cancel an already active Activity. This is not merely a comparison of fresh arrival/departure inputs.

Final repair after independently challenging broad preservation: invalid/mismatched timing remains `null` (explicit end), including mismatched requested date/time or transport. An elapsed computed departure also returns `null`. Known timing with an unverified/expired route or missing weather emits a `preserveExistingOnly` command. Both actual iOS and Android providers accept this command only for an already active/scheduled Activity with the same destination ID and absolute departure (less than one second tolerance). A mismatched accepted Activity is ended; no Activity is created or updated by this command. Thus stale data for B cannot keep A, and stale data for a different departure cannot keep the old countdown. Explicit care OFF, Smart Care OFF, intent removal or saved-destination deletion remain end commands. Fresh matching route and weather are still required for creation/replacement. The 60-minute activation rule, route calculation, server payload and ordinary notification policy are unchanged.

The first broad-defer version would have preserved mismatched timing, and is superseded by the exact-trip guard above. Regression tests now exercise actual production builder/effect plus BOTH providers for time/basis/mode edits, stale different route date, removal, Smart Care OFF, cleared intent, expired different destination, expired different solved departure, missing weather, past departure and repeat-day rollover. Merely browsing another destination retains the explicit saved owner, as before. When origin or target cannot be resolved at all, the existing undefined/defer policy still applies; it does not create or relabel an Activity and is not a guarantee that all pre-existing recovery cases end immediately.

This defect is reproduced for BOTH timing bases. It is consistent with a reservation disappearing and foreground route refresh recreating it, but does not establish why the user's departure-based trial behaved differently. It also explains Island absence when no Activity survives, but does not prove the cause of an ACTIVE Activity being absent from the Island on the user's device.

## Dynamic Island and native configuration review

- `WeatherONDepartureLiveActivity.swift`: Lock Screen and all expanded/compact-leading/compact-trailing/minimal Island closures are present; there is no arrival/departure-specific Island branch or empty active-state branch. Timer and glyph remain available for active content; completed/stale variants have visible content.
- Bundled icon source paths, template rendering, nonempty alpha pixels and dark-background tint contrast pass the existing executable contract. This verifies asset/source constraints, not SwiftUI rendering.
- `WeatherONWidgetBundle` includes the Activity. Xcode target Sources includes its Swift file and the same ActivityAttributes source used by the host module. Extension embedding and app/extension bundle IDs are consistent. App `NSSupportsLiveActivities` is true.
- Immediate request is the standard default. Future reservation explicitly uses `.standard`, an alert configuration and computed start date. There is no transient-style branch. Pending/active/stale are tracked; server end payload and native end deadlines use departure, not activation or target arrival.
- Release app entitlements include production APNs and the shared App Group; extension entitlements include that group and WeatherKit. Existing post-archive hook checks signed entitlements. Source configuration does not establish what was signed/installed in build 60; no IPA/archive was available here.
- The nonidentifying native logger is subsystem `com.weatheron.mobile`, category `DepartureActivity`: scheduled/immediate request, request error codes, state transitions, explicit end. Existing local native status includes active/scheduled/stale lifecycle and four strictly parsed counts; these counts do not prove Island visibility or enumerate other apps.

New diagnostic-only native code logs `event=snapshot total=N active=N pending=N stale=N` on entry to getDepartureActivityStatus, before long-expired recovery or JS reconciliation can change the evidence. No names, identifiers, dates, locations or tokens are included. This addition is local and NOT installed in build 60. Its source order/privacy contract passes, but Swift compilation and runtime remain unverified.

No additional independent Island presentation defect was established from the available source. No speculative SwiftUI rewrite, permission change or claim of device resolution is made.

## Apple documentation checked

- [Displaying live data with Live Activities](https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities): ActivityKit scheduling/lifecycle, presentation constraints and relevance ordering.
- [Scheduled request API](https://developer.apple.com/documentation/activitykit/activity/request(attributes:content:pushtype:style:alertconfiguration:start:)): future start date and required alert configuration; foreground scheduling.
- [Pending lifecycle](https://developer.apple.com/documentation/activitykit/activitystate/pending): pending represents a reservation that has not started.
- [Live Activities essentials, WWDC26](https://developer.apple.com/videos/play/wwdc2026/223/): current Island compact/minimal presentation and iOS 27 width constraints. A video mentioning iOS 27 does not independently verify the user's exact 27.2 version/build.

These support retaining a previously accepted reservation and distinguishing lifecycle from presentation. They do not guarantee the OS selected our Activity for display.

## Verification

Passed on final production change and regression updates:

- `npx tsc -p apps/mobile/tsconfig.json --noEmit`
- `node scripts/check-ios-reliability.mjs`
- `node scripts/check-correctness-batch.mjs`
- `node scripts/check-weather-outfit-regressions.mjs`
- `node scripts/check-review-regressions.mjs` (includes the expanded schedule regression)
- `node scripts/check-departure-activity-schedule.mjs`: actual builder/effect/iOS+Android provider expiry path for arrival/departure and foreground/background; failed refresh preserves only the exact accepted trip; expired route without reservation cannot create one; edits/removal/care-off/different trip/day rollover and passed departure cannot retain an outdated countdown; existing fresh schedule/mode/repeat/foreground-recovery checks retained.
- `node scripts/check-ios-live-activity.mjs`
- `node scripts/check-departure-activity-intent.mjs`
- `node scripts/check-departure-registration-order.mjs`
- `node scripts/check-dynamic-island-contract.mjs`
- `node scripts/check-departure-push-runtime.mjs`
- `TZ=UTC node scripts/check-route-selected-time.mjs`
- `TZ=Asia/Seoul node scripts/check-route-selected-time.mjs`
- `npm run check:android-product-quality`
- `npm run check:mobile-localization` (2262 messages)
- `git diff --check`

Existing tests that expected expiry -> null -> native end were corrected to assert exact-trip preservation only, while timing mismatches remain null/end. Their fresh-route, unsafe creation and notification suppression assertions remain. The new lifecycle regression exposed the former destructive behavior before the production repair.

Not executed: Swift/ActivityKit compilation, actual OS reservation activation, signed build-60 binary inspection, real iPhone/Island rendering. This Linux environment has no xcrun/Apple SDK or attached iPhone. No simulator substitution was attempted. The missing Apple environment is a capability limitation, not an approval denial.

## Smallest remaining real-device evidence

For an already planned test, record the Lock Screen card and then the unlocked Home Screen/another app BEFORE reopening WeatherON. A short recording suffices; do not change schedules/settings or restart a long monitoring trial. This distinguishes the observed surfaces, not the native lifecycle by itself.

If a Mac is available, use Console.app, select the connected/trusted iPhone, start streaming for a short window around the existing reproduction/foreground return, and filter subsystem `com.weatheron.mobile`, category `DepartureActivity`. Provide only that category, with the app-open moment marked. Existing messages are scheduled/immediate request, state changes, explicit end and failure codes; their availability in build 60 depends on its actual included source. Do not require a new source SHA from the user. No logging, connection or setting action was executed here.

The NEW local diagnostic snapshot is not available in build 60 until a separately authorized candidate is compiled and installed. On that candidate, the first snapshot on reopening captures OS enumeration BEFORE automatic repair; later snapshots may already reflect recreation. State-stream messages can be delayed until the app resumes, so their wall-clock logging time is not proof of the original OS transition time.

Interpretation:

| Evidence before reconciliation | What it establishes / next step |
| --- | --- |
| No pending/active/stale tracked Activity | There is no usable countdown reservation then; correlate request failure or explicit end. A visible notification alone does not prove a surviving Activity. |
| pending > 0 after expected activation | Reservation exists but has not transitioned; compare the intended start/departure in the user's existing schedule with OS timing. Counts alone cannot establish a deadline. |
| active > 0 and real Lock Screen Activity, but unlocked Island absent | Registration succeeded; investigate OS selection/presentation/extension rendering. Active does NOT guarantee selected Island visibility. |
| active > 0 plus blank/missing card | May be rendering failure; counts cannot distinguish it from system presentation. Require a matching widget-extension/system render error or crash entry (only relevant WeatherONWidget errors, redact other device logs). |
| active on reopening only after a new immediate request | Foreground creation is recovery, not proof of background automatic activation. |

Request to the user: one short before-app-open Lock Screen-to-unlocked recording from the existing failing trial, plus the narrow native event excerpt if Console is available. Do not ask them to find the new snapshot event in build 60. If they have no Mac, the recording is still useful; precise lifecycle/render diagnosis remains pending rather than inferred from it.

## Final changed paths

- apps/mobile/src/state/useWeatherOnAppState.ts:1088 — mismatched timing end, preserve-only construction for known timing without fresh route/weather.
- apps/mobile/src/providers/departureLiveActivity.shared.ts:10 — optional preserve-only command flag.
- apps/mobile/src/providers/departureLiveActivity.ios.ts:192 — exact native-trip preservation/end guard, before normal replacement logic.
- apps/mobile/src/providers/departureLiveActivity.android.ts:55 — equivalent guard because the state builder is shared.
- apps/mobile/modules/weatheron-widget-data/ios/WeatheronWidgetDataModule.swift:90,217 — pre-recovery count-only snapshot.
- scripts/check-departure-activity-schedule.mjs:134,204 — actual effect/provider lifecycle and edit/removal/rollover regression scenarios.
- scripts/check-route-selected-time.mjs:346 — timing mismatch remains end; unsafe routes can only end or preserve an exact existing trip.
- scripts/check-dynamic-island-contract.mjs:80 — snapshot ordering and existing diagnostic privacy contract.
- This report.
