# Build 60 device follow-up — 2026-11-03

Status: a further code defect is fixed locally; the complete reported display failure is not resolved or verified on a new binary.

## Device evidence

`devicectl device info apps --bundle-id com.weatheron.mobile --include-default-apps` confirmed installed 1.0.0 (60) on the connected iPhone 16 Pro Max. Initial connection attempts failed; after the user connected USB and unlocked the phone, app inspection, launch and screenshot capture succeeded. No binary was installed and no schedule/settings were changed by the agent.

The user reports no Dynamic Island presentation and inconsistent Lock Screen presentation, both with and without reopening the app. During this session the user opened a saved care trip. Device screenshots at 23:16 and 23:19 KST showed Care ON, a 23:20 departure, a freshly queried transit estimate, and weekday repetition. These screenshots contain private locations and remain in `/private/tmp`, outside the tracked audit.

Console observations from the installed build (KST, selected events only):

| Time | Observation |
| --- | --- |
| 23:14:58.922302 | `event=request mode=scheduled style=standard` |
| 23:15:59.187526 | `event=request mode=immediate style=standard` |
| 23:15:59.252878 | `event=state state=active` |
| 23:16:43.316838 | another immediate request |
| 23:17:43.585726 | `event=explicit_end` |
| 23:17:43.613234 | `event=state state=dismissed` |
| 23:18:43.348047 | `event=state state=active` |
| 23:19:43.570375 | `event=explicit_end` |
| 23:19:43.595439 | `event=state state=dismissed` |

ActivityKit system messages also confirmed accepted active and pending activities for WeatherON. This rules out universal failure to request an Activity in this trial. It does not prove rendered visibility. The two explicit ends above precede the departure shown on the phone. Their exact JavaScript decision reason is not logged in build 60, so do not attribute every end to route TTL or exclude user actions solely from these messages.

Renderer messages included missing initial/content archive files (NSCocoaErrorDomain 4), with the system saying that it may produce the content shortly. These alone do not establish a widget crash or explain Island absence. A system presentation descriptor contained `Should Show System Aperture: false`; its private diagnostic semantics are not established, so no private-API workaround or speculative layout change was made.

The user also reported that explicitly selecting the trip on Home did not show either surface. That reply arrived after the initial 23:20 departure, so its precise observation time is not established. A second trial was then requested for 23:40. At 23:24:24, system logs recorded an immediate Activity request with stale/departure date 14:40 UTC and creation of a new activity. A device screenshot at 23:26 showed the iPhone Home Screen without visible WeatherON Island content. The Activity's lifecycle at that exact screenshot time was not independently established; no user settings or schedule were changed by the agent.

The user subsequently confirmed setting 23:40 and leaving the app. Further screenshots at 23:33 and 23:37 showed the Home Screen without WeatherON Island content. Before 23:40 the user explicitly confirmed that the Lock Screen card was also absent. At 23:38:35, SpringBoard logged the same activity's list-item controller with `presenter = (null)`, `view = 0x0`, and `appearState = UIViewControllerDisappeared`. These are observations of absent presentation, not proof of a particular application or OS cause. Console streaming was paused around 23:33–23:37; the trial is not a continuous lifecycle trace.

Observation continued through 23:40. No new end/state event was captured in the inspected activity-ID and DepartureActivity filters at the deadline; absence of a captured event does not prove that the activity remained active. Streaming was stopped and the temporary Include Info Messages option restored afterward. The user-controlled test departure remains 23:40 unless the user restores it.

Console's retained filtered records changed while streaming, so this is a selected observation record, not a complete exported timeline. Filtered historical `log collect --device-udid ... --predicate ...` was attempted, but macOS required root; `sudo -n` reported that a password was required. No password was requested/entered, no privilege configuration changed, and no log archive was collected.

## Code findings and repair

Build 60 source at `64901d0` returns an explicit end command when route freshness expires. `71b8bf7`, already included in current main `d3446dc`, preserves an exact accepted trip instead. Existing executed lifecycle regressions cover the builder, reconciliation effect and iOS/Android providers. This change is not installed in the observed build 60.

A further defect remained on main: saving a destination, enabling care in either care screen, or restoring a care-enabled destination updated the intended owner without setting `replaceExistingActivity`. The iOS provider consequently retained an older different destination, including a pending reservation, instead of requesting the selected trip. Only the direct Home picker supplied the replacement flag.

The local change supplies that existing flag for all four explicit care actions and clears a matching flag on care-off. Preview behavior, foreground-only request checks, valid-route creation gates and native implementation are unchanged.

`scripts/check-departure-activity-schedule.mjs` now executes the actual four callbacks through the production builder/effect/iOS provider with a mocked native boundary, checking both immediate and future-start trips. Against unmodified `d3446dc`, it fails with `saveSelectedDestination: old reservation must not block the new trip` (actual old owner, expected new destination). Against the working tree, all eight cases pass. This establishes the code defect, not that the user's entire incident followed that path.

Passed: TypeScript, review regressions, departure schedule/intent, iOS Live Activity source contracts, Dynamic Island source/asset contracts, push registration/ordering, iOS reliability, Android product quality, and diff whitespace checks. Push tests use mocks, not real APNs delivery.

Remaining: corrected-binary compilation/installation, actual scheduled activation and foreground/background continuity, stable Lock Screen rendering, and Dynamic Island visibility. At the conclusion of device investigation, no commit, push, Xcode Cloud build or deployment had been performed. The user subsequently requested committing and pushing this scoped code change, regression test and audit; that does not establish a new binary or verified display fix.
