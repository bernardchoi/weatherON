# Visible Ambient motion — 2026-11-04 KST

Four additions and balancing completed/verified on 2026-11-05 KST. The later speed-review adjustment below supersedes the initial timing/capture records.

Implemented locally on `Daehyeons-Laptop.local`, repository `/Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱`, branch `main`, base HEAD `d86d7dbbac40635964afc1d310c3ecbf35f52665`. Changes are uncommitted/unpushed and are not part of a main commit or a new TestFlight binary. The previously pushed Live Activity and compact Home/Outfit changes remain included in the base.

## Reference and installed skill

- Reviewed https://benji.org/stageshow in the in-app browser, including the phone/card interaction example, and read Stageshow's skill/motion/rehearsal guidance.
- Installed `benjitaylor/skills/stageshow` with the system skill installer into `/Users/daehyeonchoi/.codex/skills/stageshow`, version 1.1.0. `SKILL.md` SHA-256: `918f021f7762be90e4c2eb3881057aefbc348f1f2a779281c92b0db69e794f43`.
- The initial Python download hit a local certificate-chain error; the install succeeded using the installer's Git method with certificate verification retained.
- Stageshow is for authored web product demonstrations. Applied its causal movement, grouped/staggered arrivals, complete resting state and frame-review principles to the existing React Native components. The web Stage/kit and its `film.mjs --gate` were not installed into the app or represented as a native verification gate. No application dependency was added.

## Motion and scope

| Trigger | Previous | Implemented |
| --- | --- | --- |
| New iOS screen visit | Primary native stack switches without content choreography | `AmbientMotionContext` identifies a fresh visit; header then content enter over 280ms with a 40ms stagger and 14px travel, at 90–100% opacity |
| Common screens | Content appears together | `AppScreen` header/body choreography covers its 19 screen callers; footer stays outside the moving content |
| Home | Settled cards with weak press feedback | Outfit card enters as one object; destination contents follow it. Measured Home reading anchors and weather hero stay fixed to preserve contrast-region coordinates |
| Outfit | Independent well entrances | Nested entrances are suppressed by the parent group; only actual changed garment identities crossfade/translate 6px over 220ms |
| Departure list/detail | Separate custom layouts | Title/list and detail title/schedule/outfit groups wired directly to the shared entrance |
| MY | Separate custom layout | Title, account/profile and settings group enter in order |
| Press | Scale to 0.985 | Scale to 0.975 over 80ms, release over 180ms; actions still run immediately |

`AmbientReveal`/`useAmbientEntrance` use native-driver opacity/translation and mark the animation non-interactive. No per-frame React state, continuous decorative loop, blur animation, new timer-driven weather effect or request is introduced. The existing background canvas, weather thresholds, routing deadlines, notifications and ActivityKit behavior are preserved.

Motion starts only for a fresh iOS visit with a known normal-motion preference while foregrounded. Initial/unknown-preference content remains a complete static poster. Data updates, unchanged route renders, preference toggles, foreground return and a retained screen revealed by UIKit's interactive pop do not replay entry. Backgrounding, reduced motion or unmount stops the in-flight animation and leaves the complete final state. Native pop/full-screen swipe and hidden-screen input/accessibility gates remain with the existing stack. A valid forward shared-image flight suppresses the native push and target entrance so only one dominant movement plays. Measurement failure uses ordinary navigation.

Android retains its existing screen-transition path; shared press feedback changes there too. No Android-specific page-entry behavior is claimed.

## Verification

Passed:

- Mobile TypeScript; Android product-quality and locale checks (2267 messages).
- Actual entrance hook tests: native driver, stagger/distance, one play per visit, data/foreground/preference non-replay, interruption/cleanup and ref/layout forwarding.
- Actual persistent iOS stack policy: new primary/detail visits, stable viewport, unchanged data and retained pop return; native navigation/back-target tests.
- Actual MY/Departure JSX: account/consent gates, all management routes, selected-first destination order, empty/Android states, confirmed-selection haptics and real staged section wiring. Destination-care presentation/timing/care-switch checks.
- Home plan-width/viewport, persistent canvas, outfit commentary and text-clipping, feedback style composition, Home outing/material checks, review-regression aggregate, iOS reliability and weather/outfit regressions.
- `git diff --check`.

Test boundaries were extended for the new component/context. Existing incomplete fixture fields were corrected (account action revision, semantic color and declared current wind availability), and the Home caption contract was aligned with the already approved compact UI's 18/26 typography. Assertions retain their behavioral coverage and no weather/recommendation production rule was changed for those fixtures.

## Frame rehearsal

In-app browser inspected the reference and the local preview at 440px/dark and 375px/light. An existing Chrome/Puppeteer runtime then captured repeated frames and sampled DOM transforms. The preview uses actual production entrance/press/navigation code and generated actual Home/Outfit JSX/styles, with native screen controllers, glass, haptics and external-data boundaries stubbed. G1/M1 frame-policy probes use simple fixture content in the real common screen component; their actual custom layouts/actions are covered by the JSX tests above, not claimed browser-verified in those probes.

The first-round capture (20px/320ms/55ms) is superseded by `motion-balanced-*`. The previous capture contains 161 changed JPEG frames and exercises Home → Outfit → Detail → changed recommendation → destination selection → wardrobe delete/undo. Browser samples verify:

- One garment travels from its measured source to target with uniform scale and a 420ms ease-out; Home → Outfit and Outfit → Detail have no competing body entrance.
- The changed top moves while the unchanged coat and shoes stay fixed.
- Destination controls, preparation and weather cues use a 40ms sequence; the measured plan parent stays fixed. Actual current values/warnings are rendered immediately.
- Quiet page entry travels 14px, then rests at zero/full opacity. A restored wardrobe card enters while retained cards stay fixed.
- Reduced-motion navigation has no shared flight. No browser page error was captured.

The RN Web image `onLoad` event lacks native intrinsic dimensions; the QA boundary uses the loaded image's actual `Image.getSize` result to supply the native event shape. No invented image size is injected. Native screen controllers, glass, haptics, layout animation and data/persistence remain boundaries. Wardrobe native neighbor relocation/delete animation is **not** browser verified; its configuration and immediate mutation callbacks are exercised by the production-hook tests. Actual row identity/original undo order, hidden-editor additions and filter non-replay are exercised through production Wardrobe JSX.

In-app browser checked the production-generated Home/Outfit/Detail/Wardrobe layouts, destination selection and delete/undo; 375px/light at 1.3x type remained readable. The final contact sheet was visually inspected. Browser captures do not establish native layout/gesture or device performance.

Artifacts outside the source tree:

- `/Users/daehyeonchoi/.codex/visualizations/2026/11/04/01a1a67b-d384-7480-b531-eec11932da14/motion-balanced-preview.gif`
- `motion-balanced-contact.png`, `motion-balanced-browser.json`, `motion-balanced-samples.json`, `motion-balanced-home.png`, `motion-balanced-small-light.png` in the same directory.

## Four approved additions and guardrails

1. `OutfitMotion` carries the same garment from Home to Outfit and Outfit to Detail. Text never scales. Native image/root measurements, matching scene/item/image identities and intrinsic contain geometry determine the path. Clipped/missing/invalid source or target coordinates fall back. Source measurement has an 80ms navigation fallback; target readiness has a 300ms deadline. Latest-action, interrupted route, resize, reduced-motion/background and unmount paths clear decoration. Retained native back gestures are unchanged.
2. `OutfitMotionImage` retains only the old decorative image during a real item/image-identity change; unchanged items and recreated source objects do not replay. Old images cannot intercept input or accessibility. Late animation completion cannot remove a newer swap.
3. `AmbientChange` stages Home destination time, preparation and weather without delaying data. New timestamps alone are not change keys. The preexisting departure fade is disabled on iOS rather than stacked with the new sequence; Android retains its original value fade.
4. Wardrobe reuses native `LayoutAnimation` for immediate add/remove/undo state changes. Only new/restored rows get a settling entrance; other cards keep identity and width. Additions remain pending while a retained wardrobe is hidden behind its editor. Filters do not count as ownership changes. Persistence, photo-save acknowledgment and undo timing are untouched.

User requested earlier effects to be balanced too: entrance distance/duration/stagger and press scale were reduced, nested entrances disabled, and shared flights suppress page entrances. No new decorative loop or application dependency was added.

The GIF/DOM samples are browser evidence, not an iOS frame-rate, GPU, battery or physical-gesture measurement. Actual iPhone Dynamic Type, interrupted native gestures, low-power performance and TestFlight acceptance remain unverified. No local native/Xcode Cloud build, new TestFlight distribution, commit or push was performed. Temporary QA files remain under untracked `tmp/`; existing QA artifacts are not staged. The preview browser tabs were closed and viewport overrides reset after checking; the local server was stopped after the final frame check.


## Applied speed-review adjustment — 2026-11-05 KST

User approved the review recommendations. Current timings: entrance 340ms (14px), changed content 300ms (6px), wardrobe layout 300ms, shared image 500ms, sequence interval 60ms. Press remains 80/180ms at 0.975 scale. Entrances, content changes and image transitions use cubic-bezier(0.3, 0.2, 0.2, 1), reducing the initial speed rather than only extending the slow tail.

Home → Outfit still connects measured positions. Outfit → Detail now fades/scales the same garment inside the measured target image rectangle, with clipping and no translation over the description. Nothing is drawn at the old image position while the target is being measured. Existing interruption/fallback/accessibility behavior remains.

Passed mobile TypeScript, actual motion-hook regressions (including the new detail clipping/no-translation path, waiting-target poster, timing/easing and cleanup), and diff whitespace check. In-app browser checked the updated screen; repeated-frame QA captured 186 frames, no page errors, stable unchanged garments, 60ms destination sequence, selective wardrobe restoration and Reduce Motion. Every sampled detail-reveal frame stayed inside its clipped target. Measured 80%-travel time changed from 105 to 165ms for garment replacement and 126 to 230ms for wardrobe screen entry. These are browser timing samples, not device frame-rate guarantees.

Current artifacts in the same external visualization directory: `motion-adjusted-preview.gif`, `motion-adjusted-contact.png`, `motion-adjusted-browser.json`, `motion-adjusted-samples.json`, `motion-adjusted-detail.png`. Contact sheet reviewed. Preview action pauses were lengthened for review; application inputs/persistence are not delayed. No new dependencies, commit, push or release. Base remains main/d86d7dbbac40635964afc1d310c3ecbf35f52665 on Daehyeons-Laptop.local. Actual iPhone/native LayoutAnimation and TestFlight remain unverified.

## Authorized main commit/push checkpoint — 2026-11-05 KST

User explicitly authorized committing and pushing all final changes. The commit containing this checkpoint includes the final motion components, screen callers, motion tokens, updated regression fixtures/checks and this audit. Earlier Live Activity and compact UI fixes are already in main as `22d8070` and `d86d7db`; they remain ancestors. Prior statements of uncommitted status describe the earlier implementation checkpoints.

Fetched origin and confirmed local main/origin main both at `d86d7db` before committing; no pending main commits or stash existed. The other live worktree (`claude/quizzical-nash-2674cc`, `523439e`) retains one old edit to `scripts/check-android-small-screen-layout.mjs`. Its onboarding copy changes and obsolete rain assertion were already reconciled by the previous release integration, recorded in `docs/audits/release-integration-2026-11-04/REPORT.md`; current main also has newer selectors and viewport coverage. That obsolete worktree copy is intentionally preserved/excluded, not merged over main. The `/private/tmp/weatheron-ios-release` worktree entry is prunable/missing.

Excluded local-only `docs/qa/artifacts/` (1,618 generated/reference files) and `tmp/` (preview harnesses and temporary checks) per repository instructions. No other untracked implementation files remain outside the selected commit. Re-ran the review-regression aggregate with exit-code enforcement and whitespace validation; both passed. Mobile TypeScript and targeted motion/UI checks had passed on the final implementation in the immediately preceding verification. This is source integration only; no build or TestFlight distribution is requested or claimed. Push confirmation is reported after comparing the created commit with the remote main ref.
