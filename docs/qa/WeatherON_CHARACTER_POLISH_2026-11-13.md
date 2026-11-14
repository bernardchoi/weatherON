# Character polish checkpoint · 2026-11-13

## Scope and integration
- Host: user's Mac, `weatheron-character-integration`.
- Branch: `feat/ios-approved-design-character-20261109`, base `4c1b37b`.
- Local uncommitted changes only. No commit, push, main integration, build or deployment.
- Initial working tree was clean. Separate design-release worktree untouched.

## Implemented
- Short 180ms asset transition, with only one static outgoing pose. The latest state wins when changes repeat; stale animation completion cannot remove the latest transition.
- Reduced Motion (including unresolved permission), background, hidden/inactive, scrolling and low-power states skip/cancel transitions. Neutral/unreliable weather is not decorated as confirmed weather.
- Dark-theme-only static 7% cream backdrop behind body for edge separation, keeping approved artwork, small matte eyes, silhouette and palette unchanged. No new network access or stored user data.
- Existing fan two strokes / four-second rest and rain source-mask geometry preserved.

## Deliberately not applied / remaining
- Face/cheek color consistency, fine small-size illustration simplification and expression variants are NOT complete.
- A generated rain recolor candidate was rejected: 1108×1420 output rather than source 1199×1312; eye/face geometry moved. It is not part of app assets. Replacing the registered source with this image would break the masks and umbrella/arm alignment.
- Original rain uses `rain-rig-source.png`, not static `main-rain.png`: 1199×1312 source, 1024 canvas, pivot (720,940), ±0.6°. All 13 approved artwork/contract files remain byte-identical to base.
- Do not mark these visual refinements complete or ship the rejected candidate. A geometry-preserving artwork workflow remains necessary before completing face/expression work.

## Verification
- `node scripts/check-mascot-artwork-registration.mjs`: 13 originals/contracts unchanged, registration preserved.
- `node scripts/check-home-mascot.mjs`: existing state/animation/rig checks.
- `node scripts/check-home-mascot-transitions.mjs`: actual component lifecycle, repeated/interrupted states and motion policy checks.
- Native iPhone and full Home screen verification deliberately deferred until all character/design work is complete, per user direction. Browser harness is not device proof.

### Results from this session
- PASS: all 120 existing mascot assertions, new transition lifecycle checks, artwork registration check, TypeScript (`tsc --noEmit`), `git diff --check`.
- Missing local SVG dependency was an existing broken symlink; resolved to the already installed declared 15.15.4 in design-release. No package/lockfile change or new installation.
- Browser harness bundled successfully but Chrome process exited with Code:null. IAB is unavailable and browser inventory is empty. New pixel output was therefore NOT verified; older Nov 9 screenshots must not be reused as current evidence.
- These code refinements are pending visual verification and are not a complete character-polish delivery.

## Resumed validation (later same day)
- Retried Chrome under the permitted local execution context: browser launch and full component harness PASS. Earlier Code:null blocker is resolved for this verification workflow.
- Inspected current light/dark, 56/80 and enlarged component render: umbrella/arm source-mask connections and fan layering are intact; dark backdrop remains behind the body. Browser output is still not native iOS proof.
- Added night expression cadence using existing approved half/closed/open overlays only: 8000ms pause, 110/140/110ms blink. No eye enlargement, new catchlights or permanent closed eyes. Existing day cadence remains 6000/60/80/60ms.
- At size <=64, independent wind decoration is a single stroke instead of three to reduce visual clutter. Main character art and fan spokes are unchanged.
- Existing 120 assertions plus three night-cadence/cancellation checks PASS; transition checks, registration protection, TypeScript and diff checks PASS.
- Face/belly palette correction remains pending explicit permission for coordinate-preserving script processing; no generated candidate applied. Fine illustration cleanup is not claimed complete.

## Approved palette correction completed
User subsequently approved script-based color correction limited to rain face/belly while preserving original shape, coordinates and alpha. `polish-rain-palette.mjs` uses original committed pixels (idempotent, not cumulative) and a bounded skin selection. Only green/blue color bytes change. Cream and subtle peach are brought closer to the base character without changing eyes, mouth, hair accent, umbrella, arm, body, rig masks, source dimensions or pivot.

- `rain-rig-source.png`: 201,595 face/belly skin pixels corrected.
- `main-rain.png`: 109,111 matching skin pixels corrected.
- Every alpha byte and red byte unchanged; all non-skin pixels unchanged, including small dark eyes and umbrella/arm.
- 11 other assets/contracts byte-identical. Generated replacement candidates remain excluded.
- Raw source and static asset visually inspected; no crop, scaling or geometry replacement.
- Existing stray transparency-edge pixels in static artwork were preserved as required, not represented as new correction; runtime rain uses the source-mask rig.
- Final scope: face/belly color consistency, dark contrast, small-size wind simplification, calmer night expression and safe state transition implemented. No new hot/cold facial artwork was invented; existing approved expressions and fan motion retained.
- Native device review remains deliberately deferred until combined design/character review. This checkpoint is implementation and non-device component verification, not a release.
