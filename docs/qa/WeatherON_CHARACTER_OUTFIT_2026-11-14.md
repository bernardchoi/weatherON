# Home character: representative outfit connection (2026-11-14)

## Scope and state
- Host: user's Mac, `weatheron-character-integration`.
- Branch: `feat/ios-approved-design-character-20261109`, HEAD `4c1b37b8e0a4e4234637fd06dbde984ccb2ba177`.
- Local uncommitted implementation, not pushed/merged into main, not in TestFlight 65.
- Nov 13 palette/blink/contrast/motion edits were preserved in place. No existing artwork bytes changed by this step.
- Native device QA remains deferred until design + character integration is complete, per user direction. No build/deploy was triggered.

## Behavior
- Read the same `state.outfit` result shown by the home outfit card.
- Use `outfitContext.weather` (today's scoped location/time) or the same `state.weather` fallback for clothing and weather props. Do not mix destination outfit with origin rain/heat/wind. Destination daylight is unknown rather than reusing origin daylight.
- Require reliable fresh snapshot, available current temperature, no weather-loading state, matching recommendation weatherSnapshotId, and at least top/outer item. Missing or mismatching data => no clothing inference.
- Map selected outer tags: cold => winter; rain => raincoat; other outer => outer; top without outer => light. This is a representative garment silhouette, not an exact item/color reconstruction. Variant does not override actual selected items.
- Rain/heat rigs keep their existing source geometry, movement/pivot and policy gates; garment draws beneath moving arm/prop and head. A cold waterproof recommendation can wear the winter silhouette and hold an umbrella.
- Snow no longer forces the baked winter-clothing bitmap when outfit mode is applied: use a base pose plus recommendation garment (or no garment if unavailable).
- The 56/80pt slot, face, eyes, and home layout remain unchanged. Representative vector clothing is broad/simple for small sizes. Local-only; no photo analysis/upload, server calls or new dependency.
- Mascot remains decorative/hidden from VoiceOver. Existing outfit card exposes the actual item names, location and forecast status; no duplicate spoken garment summary.

## Checks passed
- `npx tsc --noEmit -p apps/mobile/tsconfig.json`
- `node scripts/check-mascot-outfit.mjs`: item/tag mapping, stale/pending/unavailable/mismatched basis, no photo inference, cold-rain and heat combinations, layer ordering.
- `node scripts/check-home-mascot.mjs`: existing state, asset, motion policy, lifecycle, blink, fan contracts.
- `node scripts/check-home-mascot-transitions.mjs`: existing interruptions/policy cleanup plus same-pose clothing transition, rapid replacement, Reduced Motion.
- `node scripts/check-mascot-artwork-registration.mjs`: previous approved palette edits and other protected artwork unchanged.
- `npm run check:weather-outfit-regressions`: passed.
- `node scripts/render-mascot-outfit-qa.mjs`: actual RN-web component, 36 light/dark samples at 200/80/56pt; clothed umbrella/fan move, garment geometry stays fixed, Reduced Motion stops props, no page errors. Visual inspected; rain garment extended to cover exposed belly slice.
- `node scripts/render-home-mascot-qa.mjs`: existing actual web blink/umbrella/fan motion tests passed.
- `git diff --check`

## Not verified / follow-up
- Native iOS rendering, full home screenshot, VoiceOver behavior on device, performance/battery and real-device weather changes are not tested by web/mocked checks.
- Finer coat/down-jacket/jacket types and exact personal wardrobe photos are not implemented; this is phase 1.
- This check does not certify the separate design branch is integrated or that other subcharacters/profile selector are complete.
- Preview generated locally at `/tmp/weatheron-outfit-render/outfit.png`; actual component demonstration, not a device screenshot.

## Commit/push preparation · 2026-11-14
- Owner subsequently requested review of other latest changes, commit and push. The earlier local-only status above describes the implementation checkpoint, not this later authorization.
- Fetched origin; inspected all three registered Mac worktrees and stash. Character worktree contains the 20 reviewed related files; base worktree and design-release worktree are clean; no stash entries.
- Existing heat/outfit and notification fixes `3c617c7` and `dd4a244` are already ancestors of this branch. Do not duplicate them.
- Design-only refinements `523e064` are already pushed on `release/ios-design-only-20261109`. Remote main is `9f40cb7`. These branches differ from the character branch; they were inspected, not merged or cherry-picked. This commit is NOT a complete integration of latest design/main.
- Palette regeneration and artwork comparison now use the immutable approved-artwork baseline `4c1b37b8e0a4e4234637fd06dbde984ccb2ba177`, rather than HEAD, so committing does not invalidate the test or make subsequent regeneration cumulatively recolor the assets.
- Re-ran TypeScript, mapping, mascot, transitions, artwork registration, weather/outfit regression and whitespace checks: all passed. Prior actual-component browser renders remain the visual evidence; native/device QA remains pending.
- No main merge, build, TestFlight upload or deployment in this commit/push task.
