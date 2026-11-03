# Build 62 integration record — 2026-11-04 KST

## Authorized release scope

Integrate all discovered residual work into main, validate, push, then use Xcode Cloud for TestFlight build 62 and the existing external tester group. Build 61 must not be distributed externally. This record distinguishes source checks, Cloud compilation, TestFlight availability and physical-device acceptance.

## Inventory and disposition

Host: local Mac, repository `weatherON`; integration branch `codex/release-integration-20261104`, starting main `eb7738796da8f350baa59b04f14d71884b9cd3d9`.

| Source | Disposition |
| --- | --- |
| Home compact outfit layout/friendly varied copy `64901d0` | Already in main; preserved during guidance/motion conflict resolution |
| Live Activity accepted-trip preservation `71b8bf7`, target arrival `d3446dc`, explicit intent `eb77387` | Already in main; preserved and schedule/ownership tests rerun |
| `fix/weather-detail-code-review` `c141c75` | Merged as `0546bb5`; current Ambient layout and missing-temperature handling retained |
| `fix/ios-launch-splash-startup-state` `f7730be` | Merged as `721ed8c`; startup/foreground handoff checks retained |
| `fix/ios-widget-app-group-signing` `3558d34` | Merged as `9198812`; current signing hook preserved, missing regression/CI/docs added |
| `fix/tomorrow-brief-signal-isolation` `38be0a9` | Merged as `bf68eb4`; forecast-only inputs, optional humidity and daily UV, current widget throttling preserved |
| `fix/weather-guidance-context` `35c532e` | Merged as `4239009`; shared validation/thermal logic with current compact/compound guidance and regenerated locales |
| `docs/cost-monetization-review-2026-10-03` `f47bdab` | Merged as `d2c6c57`; dated planning material, not a new financial/provider price verification |
| Remote `fix/ambient-surface-motion-20261103` `5f91e71` | Merged as `32f85fd`; stable Home work states, measured disclosure, interrupted sheet/press cleanup, Reduce Motion |
| `claude/quizzical-nash-2674cc` `523439e` | Patch equivalent to main `097151d` (`git cherry` negative); ancestry merged as `0b69796` with no tree change |
| Dirty Claude worktree small-screen check | Reconciled current onboarding copy; old “비 완화” assertion does not apply to a populated destination list; current timeline selectors retained/updated |

The authorized remote chat `01a199a7-f6ff-7401-831a-94a19148b0d5` (durable host) published Ambient work and reported `/workspace/weatherON` and `/workspace/weatherON-arrival` clean, stash empty, all other local branches already included in remote main. Local fetch confirmed `5f91e71fa8d4523007810510a4ae8b70618fe5f6`.

Local `git for-each-ref --no-merged HEAD` across heads/remotes is empty after integration. Local stash empty. The separate Claude worktree's original dirty test is preserved, with relevant changes reconciled here. Stale `/private/tmp/weatheron-ios-release` worktree path is prunable and has no accessible files. Existing untracked `docs/qa/artifacts/` and `tmp/` are QA/temporary artifacts, excluded from source publication; not deleted or treated as unpublished product changes.

## Integration validation

Passed: mobile TypeScript; source CI commands (Android product quality, iOS release signing, iOS reliability, correctness batch, weather/outfit regressions, review regressions, locale catalog check); splash, Home refresh/return/width/update-state, friendly outfit copy, Ambient motion, press styles, iOS selection, destination care, explicit Home selection, departure activity schedule, route selected-time in UTC and Asia/Seoul. EN/JA catalog contains 2264 source messages.

Two test harness dependencies were repaired: Home refresh now bundles its real shared dependencies; My/departure VM supplies the existing useWindowDimensions hook. Both pass. No application behavior was changed to satisfy those harness failures.

Full web export passed. In-app browser inspected Home ordering and destination timeline/disclosure. Existing small-screen browser checks initially exposed stale UI selectors and undersized label/day controls (40pt high labels, 35pt wide days at 360px). Labels now have 44pt minimum height and day chips wrap while retaining 44pt minimum width. Repeated viewport results are recorded after rerun below.

Native gestures, VoiceOver, battery/performance, physical iPhone launch and Dynamic Island/Lock Screen Live Activity rendering remain unverified for this integrated tree. Static provider/schedule success does not prove OS activation or actual rendering.

## Omission prevention

AGENTS.md now requires cross-host/worktree/branch/stash inventory, explicit patch-equivalence review, source/main/build SHA traceability and a release ledger. Missing requested changes block external distribution; discovery after a build requires a new integrated build. This is a documented release gate, not a claim that Git can automatically inspect uncommitted remote chat files.

## Release state

Build 61: Xcode Cloud successful from `eb77387`; no external distribution performed by this task. Build 62 must use the final published main commit after validation. Cloud, TestFlight group assignment and physical-device results will be recorded separately.

### Final local gate

- Small-screen browser suite passed at 360×800, 375×812 and 430×932 after current UI selectors and minimum touch sizes were corrected. Screenshots were disabled; actual DOM overflow, clipping, accessible-label uniqueness and touch-size assertions executed. Chrome required normal host launch privileges; the sandboxed launch did not run.
- Final mobile typecheck and destination-care source regression passed after the 44pt change. No dependencies added.
- TestFlight UI explicitly shows Build 61 **Internal**, Ready to Test, no assigned group. Build 60 remains internal Team (Expo); Build 59 remains Team (Expo) + external group.
- Cloud Default currently prepares **TestFlight (Internal Testing Only)**. External TestFlight requires the **App Store Connect** archive option; this enables eligibility, not public App Store release. Apple reference: https://help.apple.com/xcode/mac/current/en.lproj/dev31de635e5.html
- Automatic approval review rejected changing this archive option, interpreting “all testers and customers” as exceeding external TestFlight authorization. A retry with Apple documentation was also rejected. No setting change was made and Build 62 has not started; explicit approval of that named workflow option is now required. No public App Store review/release is authorized or attempted.

### Release authorization update

User explicitly approved changing Default from internal-only preparation to App Store Connect. The workflow option was changed and saved in App Store Connect. The earlier automatic-review block is resolved; authorization remains TestFlight external testing only. Integrated source commit `2844973bf02b91ff452d525b6c77c7b822cce6d7` is pushed to main; this documentation-only follow-up is also included before Build 62 starts.

### Post-push CI correction

Source checks run 41663843599 on `2844973` failed because the Android meta-check still required old “확인 알림 / 목적지 출발” strings in the updated small-screen test. The final local multi-command invocation did not propagate this intermediate failure; the earlier broad-source pass preceded the browser-selector correction. The claim of a final Android-quality pass above is superseded by this finding. Updated the two meta-check expectations to actual “비·특보 미리보기 / 출발 타이밍” labels and reran with exit-code enforcement. This changes only test expectations and this record; no app, shared package, dependency or native build inputs change from Build 62 source `92eaab1`. External distribution waits for remote CI success.

### Remote validation and Build 62

GitHub Source checks passed on `5a3647b`: https://github.com/bernardchoi/weatherON/actions/runs/41664574941 (typecheck, Android product quality, core regressions and localization all successful). Build 62 started at 2026-11-04 00:28 KST on main after `92eaab1d5a69e0ca288134e47bebdae2a0534c2b` was verified remotely; Cloud lists its unique commit title “docs: record approved external TestFlight archive preparation”. `git diff 92eaab1 5a3647b -- apps packages package.json package-lock.json` is empty; the only later changes are the meta-test expectations and this record. No app changes were omitted from the binary.

GitHub check-runs on exact commit `92eaab1d5a69e0ca288134e47bebdae2a0534c2b` confirms Cloud action “WeatherON | Default | Archive - iOS”, build UUID `bf28cc6e-7cae-4a6f-bc65-2d0220d4eb09`, action `7355dd22-4d59-469c-8ef4-328c9670aeb2`. This verifies the build-source linkage beyond the visible commit title.

### Confirmed external delivery

Cloud Build 62 succeeded at 2026-11-04 00:45:27 KST, with 0 errors, 0 test failures, 0 analyzer issues and 594 warnings (warnings are not claimed resolved). TestFlight `1.0.0 (62)` was added to existing `외부테스트` group (6 testers), with Korean What to Test notes and automatic tester notification enabled. After submission, the group UI explicitly showed **테스트 중**, 90 days remaining; group build count increased 11 → 12. This is external availability, not proof of tester installation or physical-device rendering. Build 61 remains internal-only and was not assigned externally.

Internal Team (Expo) follow-up was interrupted by the Mac locking before adding Build 62. External group testing status was already confirmed. Internal-group addition is not yet verified. Local preview server was stopped and temporary QA browser tab closed. Original QA artifacts and old worktree files remain preserved.
