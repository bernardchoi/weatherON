# Internal TestFlight release — 2026-11-05 KST

## Authorization and source inventory

User authorized latest-source Xcode Cloud build and internal TestFlight distribution. Target is existing internal group Team (Expo); no external group or App Store publication requested.

Host: Daehyeons-Laptop.local. Repository: bernardchoi/weatherON at `/Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱`. Branch: main. Starting local/remote SHA: `4ea0e9fc97df7963ba0616fd6bc465aad853d0bf` after fresh fetch. No local/remote branch tips outside main ancestry; stash empty.

| Requested work / source | Disposition |
| --- | --- |
| Arrival/departure Live Activity decision-clock repair | main `22d807068391037fa97b24adce0e45ed593e67f2` |
| Compact Home destination and outfit guidance | main `d86d7dbbac40635964afc1d310c3ecbf35f52665` |
| Coordinated motion and final slower pacing | main `4ea0e9fc97df7963ba0616fd6bc465aad853d0bf` |
| Remote chat `01a199a7-f6ff-7401-831a-94a19148b0d5`, `/workspace/weatherON-build62`, uncommitted branch `fix/live-activity-build62-20261104` based on `47b3b4c` | Latest completed turn inspected read-only. Core Activity clock fix and route-test clock injection already in main. Remaining three display/notification decision-clock corrections and privacy-safe native authorization log integrated here. Existing fresh-response test expanded to 24 provider/basis/mode/window combinations; actual projection/notification timing and diagnostic checks brought across. Remote report's installed-device uncertainty retained below; historical uncommitted-status report not copied as current release status. Remote original remains untouched. |
| Remote original `/workspace/weatherON` and `/workspace/weatherON-arrival` | Latest remote turn reports both unchanged/clean; published Ambient source already merged in main. No new remote instructions sent. This is chat evidence, not a new shell inspection of that host. |
| Local `.claude/worktrees/quizzical-nash-2674cc`, `523439e` | Source already integrated/patch-equivalent per prior release record. Only dirty small-screen test preserved: onboarding copy already in main; old populated-list “비 완화” assertion superseded by current selectors. No source overwrite. |
| `/private/tmp/weatheron-ios-release`, detached `2ce655e` | Missing/prunable path, no accessible files. |
| `docs/qa/artifacts/`, `tmp/` | Existing QA/temporary output excluded, untouched. |

Read-only local integration chat `01a19c29-167f-7363-af70-b69d1555b3a0` reports prior build 62 integrated and delivered; no later implementation changes found there. Current root holds only the integration changes listed above plus excluded QA output.

## Validation

Source checks on `4ea0e9f` passed: https://github.com/bernardchoi/weatherON/actions/runs/41857810659 . Previous final motion/browser checks are recorded in `../ambient-motion-stageshow-2026-11-04/REHEARSAL.md`.

After residual integration: mobile TypeScript, Home update-state (actual projection and notification timing with a response newer than the minute tick), expanded departure activity schedule, Dynamic Island contracts, iOS Live Activity contracts, aggregate review regressions, isolated iOS signing-hook checks and `git diff --check` passed. The route timestamp, notification clock and Activity clock reject truly future/expired data while accepting just-completed responses. No dependency, permission, storage schema or account setting changed.

## Release status

Residual integration was committed and pushed as `9bb620986f06c06557d5451cc96b488bbef23398`. Exact-source GitHub Source checks passed: https://github.com/bernardchoi/weatherON/actions/runs/41858982723 . The existing Home/Outfit/motion component, screen and theme files are unchanged from `4ea0e9f`.

Xcode Cloud Default build **63** started at 2026-11-05 00:38:18 KST and its Archive - iOS check completed successfully at 00:53:28 KST. Run UUID `6e1d63fe-4d30-4471-9b23-a5799df30fcc`; action UUID `17629dde-e038-4284-9809-07b2f732bd6d`; GitHub check ID `126678550028`. Both the Cloud summary's full commit link and exact-commit check-runs identify `9bb620986f06c06557d5451cc96b488bbef23398`, matching remote main at build start. Xcode 27.1 (27A9275), macOS Golden Gate 27.2 (26B123). Compile/archive, three archive exports and post-build script passed; 601 warnings remain, not claimed resolved. The workflow has no automatic distribution post-actions; its existing App Store Connect archive preparation was not changed.

TestFlight **1.0.0 (63)** (build resource `f4f63eb3-46c9-4042-beb7-bc3b8428fed6`) finished Apple processing. Korean What to Test notes were saved with the Live Activity response-clock repair, compact Home/Outfit, motion pacing and the reported arrival 08:40/departure 07:50 verification window. Only **Team (Expo)** was selected for addition; build detail showed exactly one group, type Internal, one tester. Group builds subsequently showed **테스트 중**, 90 days remaining, and group build count increased 23 to 24. No external group submission, new tester access or public App Store release was performed.

Delivery screenshot is preserved outside Git at `/Users/daehyeonchoi/.codex/visualizations/2026/11/04/01a1a67b-d384-7480-b531-eec11932da14/testflight63-internal.png`. Existing Safari user tabs were left intact. Session expiry required user login before starting the build; it was resolved. This final record is documentation-only after the binary source; app/native/dependency resources remain byte-identical to `9bb6209`.

Physical iPhone Live Activity/Lock Screen/Dynamic Island resolution and native motion pacing remain unverified for this candidate. Static tests and browser motion checks are not installed-device proof. Native log adds only the existing Activity authorization boolean; no trip content or tokens.
