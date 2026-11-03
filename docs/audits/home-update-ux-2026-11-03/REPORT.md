# Home update-state UX — 2026-11-03

## Implementation snapshot (2026-11-03): scope and base

Implementation is local/unpublished on `fix/ambient-surface-motion-20261103`, based on remote main `64901d05c7036e04bc97a2525d8faabc78cfec90`. Published Live Activity repair `fix/live-activity-build60-20261103` at `71b8bf711efd62b6bd92419f83ec806bdff61b97` is preserved separately and is NOT incorporated into this branch. No Live Activity implementation, API request policy, main ref, remote branch, PR, deployment, SDK or permission was changed. User approval covers implementation; publication remains a separate action.

Read existing route planning, Ambient foundation, Home return/fresh-data preservation records and current UI/motion specifications first. Source and tests were reviewed against latest main; these findings are not physical-device reproduction.

## Visible behavior

- Header weather state occupies a persistent small slot instead of mounting/unmounting a row for each refresh. Route state has a persistent small area beside the existing result flow, without a new card or overlay.
- A same-request, still-fresh route remains readable while refreshing. Changed requested time/basis/mode still fails existing timing validation and cannot borrow the prior ETA. New destination selection immediately invalidates the previous unsaved preview before effects run; saved destinations retain their own cached results.
- Actual pending over 250ms starts only a small native Animated opacity pulse. Results are never held for a minimum loading duration. Fast completions remain immediate. Reduce Motion/unknown policy stays static.
- Only changed visible ETA identity/value triggers its 160ms opacity treatment. Query timestamp/description changes no longer replay the whole departure control. There is no translation or blank opacity frame; unchanged values and remounts stay settled.
- Route lookup basis and original query time remain visible. Expired/stale results are marked as previous lookup, not latest. Failures remain readable and an explicit retry reuses the existing refresh callback; no new automatic request is added.
- Weather pending is per location; an unfinished destination or alert response does not keep completed current-location weather labelled pending. Route pending follows the displayed committed trip, not a different editor preview. Request ownership prevents an obsolete A request from clearing a newer A in A->B->A changes.
- Fast pull refresh acknowledges an actual completion revision even if React never painted a busy frame. A failed/unreliable current result does not announce success.
- Status text wraps without a fixed clipping height/line cap. Status geometry keeps a minimum footprint while larger text may legitimately grow. Accessibility busy state is exposed; there is no automatic live-region announcement of each timestamp/partial response. Existing controls remain usable.

## State boundaries and cost/privacy

`HomeUpdateState` conveys route/current/destination weather work plus current completion revision. `pendingLocationIds` is transient provider metadata and is stripped from persisted snapshots. Displayed provenance/freshness is independent from work state. Existing route effect, throttle, network clients, server and request counts are unchanged; UI state setters are not fetch dependencies. No tracking, new data collection, SDK, external package or new permissions were added.

## Stageshow principles actually used

Read [Stageshow SKILL.md](https://github.com/benjitaylor/skills/blob/main/stageshow/SKILL.md) and [motion.md](https://github.com/benjitaylor/skills/blob/main/stageshow/references/motion.md) as design references, not overriding instructions. Practical native transfers: animate only meaningful changed content; keep the header/control/container anchor; retain content instead of a blank intermediate surface; show states in the same slot; respond immediately to input. React DOM/CSS kit components, staged cursor actions, looping narratives and simulated progress were not imported into the app. Stageshow is useful for motion prototypes, product demonstrations and communicating native implementation intent; it is not an ActivityKit/RN runtime replacement. No external installer was run here.

## Verification

Passed during implementation and rechecked on final code as listed in the handoff:

- Mobile TypeScript (`npx tsc -p apps/mobile/tsconfig.json --noEmit`).
- Source checks aggregate: ios-reliability, correctness-batch, weather-outfit-regressions, review-regressions; new home-update-state test is included in review-regressions.
- Full route-selected-time in UTC and Asia/Seoul.
- Home refresh, return, plan width (320–440 and 1–2x text), iOS home experience, ambient host.
- Android product-quality and locale catalog consistency (2267 messages; five EN/JA strings manually translated).
- New regression executes the production estimate projection and destination-selection callback, request-key ownership helper and actual status component with deterministic hooks/timers. It covers same-request preservation, new destination, time/basis/mode change, TTL/offline/failure provenance, fast/slow work, old completion races, Reduce Motion, wrapping, explicit retry and cleanup.
- Production provider and weather effect tests cover progressive per-location pending and obsolete response isolation. Existing notification/ETA/Live Activity contracts stay in their baseline suite.
- Diff whitespace checks. No repository lint script/config is configured; no new lint installation was invented.

Browser QA: In-app browser tool was unavailable. Installed Chromium + existing Puppeteer rendered the ACTUAL HomeUpdateStatus component through React Native Web in a temporary fixture page. Header/control anchors, pending/failure result, 320px enlarged wrapping and Reduce Motion change passed without horizontal overflow or page errors. The fixture supplies a Metro-style `global` shim and a fixed public locale. Initial standalone harness runs omitted the shim and failed on RN-web animation cleanup; the harness was corrected, not the product. Two attached PNGs are synthetic component-only evidence, NOT full Home or native screenshots. Pixels were inspected directly.

Not run: Xcode/Apple SDK build, physical iPhone Home layout, VoiceOver/TalkBack interaction, real native line measurement or app deployment. No simulator substitution was used. Native large-text/scroll/contrast behavior still needs the normal authorized device QA. Linux and a component-only browser fixture cannot establish native UI approval.

## Expanded Ambient motion first pass

See `docs/design/WeatherON_AMBIENT_MOTION.md` for the reviewed motion inventory, shared native tokens, implementation boundaries and remaining candidates. The local branch was renamed for the approved expanded scope. Home busy motion additionally stops off Home, in the background and in low-power mode. Shared disclosure, Android sheet and press-feedback lifecycle checks are included in review-regressions. Existing iOS selection gestures and time-wheel selection/haptics remain unchanged.

### Final expanded-pass results

All of the following exited successfully on the final production code:

- `npx tsc -p apps/mobile/tsconfig.json --noEmit`
- `node scripts/check-ios-reliability.mjs`
- `node scripts/check-correctness-batch.mjs`
- `node scripts/check-weather-outfit-regressions.mjs`
- `node scripts/check-review-regressions.mjs` (includes new Home state and Ambient motion executable checks)
- `node scripts/check-ios-selection-ui.mjs`
- `node scripts/check-feedback-pressable-style.mjs`
- `node scripts/check-destination-care-presentation.mjs`
- `node scripts/check-home-return.mjs`
- `node scripts/check-home-refresh.mjs`
- `node scripts/check-home-plan-width.mjs`
- `node scripts/check-ios-home-experience.mjs`
- `node scripts/check-home-explicit-destination-selection.mjs`
- `TZ=UTC node scripts/check-route-selected-time.mjs`
- `TZ=Asia/Seoul node scripts/check-route-selected-time.mjs`
- `npm run check:android-product-quality`
- `npm run check:mobile-localization` (2267 messages)
- `git diff --check`

The related Android source check now refers to shared press timing tokens; actual 80/140 timing and immediate callbacks are executed by check-ambient-motion. The FeedbackPressable style harness now resolves the existing localized RN boundary correctly, preserving its real StyleSheet flatten/transform assertions.

One additional historical check remains failed: `node scripts/check-my-departure-interactions.cjs`, `ReferenceError: useWindowDimensions is not defined` while evaluating MyScreen in its VM. Neither its script nor MyScreen was changed. Their main/current hashes are respectively `de03c98675dac6d6c97d7660739ca5846f04e7bd` and `761e883eefab21a0f3b761a08fd880b1fb4d354b`, identical to origin/main. This separate pre-existing harness defect is not counted as a pass or used as evidence of an application defect.

Additional actual RN-web/Chromium test: AmbientDisclosure at 320px with enlarged text measured 920px natural content (above the former 260pt cap), retained its header anchor, survived a 30ms close/reopen reversal, settled closed under Reduce Motion, and had no horizontal overflow/page errors. `disclosure-large-web.png` is a directly inspected synthetic component fixture screenshot, not the full native destination screen. The temporary preview servers were stopped after QA.

Final remote verification: main remains `64901d05c7036e04bc97a2525d8faabc78cfec90`; published Live Activity branch remains `71b8bf711efd62b6bd92419f83ec806bdff61b97`. All Home/Ambient changes remain local and uncommitted on `fix/ambient-surface-motion-20261103`. No remote CI exists for these unpublished changes and no build/deploy or simulator/device action was attempted.

## Publication review — 2026-11-04 (Asia/Seoul)

The user separately authorized commit/push of the existing Ambient branch. This review keeps its original base `64901d05c7036e04bc97a2525d8faabc78cfec90` and does not merge/rebase main. Latest remote main was verified as `eb7738796da8f350baa59b04f14d71884b9cd3d9`, containing the separate Live Activity and target-arrival repairs. The Mac workflow will integrate and validate this motion commit with that newer main; successful branch checks here do not assert the combined tree is already tested. No PR, main merge, Xcode Cloud/TestFlight build or deployment was performed here.

All 18 commands in “Final expanded-pass results” passed again on the publication tree. Additional direct checks passed: `node scripts/check-home-ambient-host.mjs`, `node scripts/check-ambient-motion.mjs`, and `node scripts/check-home-update-state.mjs` (21 successful command invocations in total). An initial command used the nonexistent name `check-ios-ambient-host.mjs`; it was corrected to the existing `check-home-ambient-host.mjs`, which passed. This was a command-path mistake, not a product failure.

The independently rerun `node scripts/check-my-departure-interactions.cjs` still fails with `ReferenceError: useWindowDimensions is not defined` in its existing VM. Both that script and MyScreen remain byte-identical to latest main `eb773879…` (blob hashes `de03c98675dac6d6c97d7660739ca5846f04e7bd` and `761e883eefab21a0f3b761a08fd880b1fb4d354b`). No unrelated repair was included.

Apple SDK/native build, iPhone rendering, VoiceOver/TalkBack, performance/battery and combined-main validation remain unrun. Earlier RN-web screenshots remain synthetic component-only evidence from the implementation review; they are not new device evidence. Publication branch/SHA and remote CI presence are verified in the delivery response.
