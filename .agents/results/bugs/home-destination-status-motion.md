# Bug: Home destination calculation status appears and disappears abruptly

Date: 2026-11-16
Severity: LOW
Status: Implemented locally; not integrated into main

## Source and scope

- Repository: bernardchoi/weatherON, /workspace/weatherON
- Host: 7038af94e887 (Linux cloud workspace)
- Branch: fix/destination-status-motion
- Base HEAD and fetched origin/main: 07dcadbb07fb5546fda3af529ef3503afcc34657
- Initial checkout was work at 63f577902b003e0de0021eb24878d9917bb3020e with a clean working tree. Fetched main and created the scoped branch from origin/main.
- No commit, push, PR, build, deployment, physical device, or iOS simulator was used.
- Home character and overall Home layout are outside this change.

## Root cause

HomeScreen conditionally mounted/unmounted the route status block and destination-weather status row (base lines 425–431). HomeUpdateStatus only animated its dot after sustained work; it had no owner retaining the disappearing row or animating its height. A successful response removed the entire row and its parent gap in one render. Wrapping the same conditional with an opacity animation would still remove it before an exit could run.

## Fix

HomeUpdateRegion stays in the card stack and measures an unconstrained, full-width content view. Height and opacity open over 220ms and close over 160ms using existing disclosure timing. The stack gap is included in the measured track and cancelled on the wrapper, so the final gap does not snap after exit. There is no fixed height, scaling, request delay, or minimum pending duration.

Visible content always uses live data. Only the departing presentation is retained until exit completes. Its render callback receives present=false immediately to disable the existing busy timer/pulse. Hidden/exiting content cannot take touches or accessibility focus. Finished exit releases the child and retained callback. Interrupted animations keep their current values; revision and destination identity guards reject stale completion callbacks and previous-destination copy. Failure/retry remains visible even if an older ready ETA survives.

The existing navigation motion policy supplies foreground, active-screen and Reduce Motion behavior. Disabled/unknown motion settles immediately. Existing HomeUpdateStatus request and pulse logic is unchanged.

## Changed files and integration overlap

- apps/mobile/src/components/HomeUpdateRegion.tsx (new)
- apps/mobile/src/screens/HomeScreen.tsx: import near base line 7 and destination status block at base lines 425–431 only
- scripts/check-home-update-motion.mjs (new)
- This report

The HomeScreen character/hero section and shared Home styles are untouched. Another HomeScreen change only needs to preserve the new import and replace these two destination status conditions with the presence owners; apply this patch rather than replacing the full file.

## Verification

- RED: node scripts/check-home-update-motion.mjs failed before implementation: "Route status needs a persistent presence owner outside the pending condition".
- PASS: node scripts/check-home-update-motion.mjs — actual component hooks with deterministic Animated/native boundaries; first entry, partially opened fast completion, retained exit, gap ownership, immediate busy deactivation, repeat/cancel/A→B→A races, stale completion, immediate error content, failure visibility with retained ETA, large text remeasurement, invalid measurement, hidden accessibility/touch, Reduce Motion including unresolved policy, foreground interruption and cleanup.
- PASS: node scripts/check-home-update-state.mjs — existing real request-key ownership, ETA freshness, busy timing, background policy, retry and accessibility checks.
- PASS: node scripts/check-ambient-motion.mjs — existing disclosure, motion interruption, retained sheet, press and outfit motion checks.
- PASS: node node_modules/typescript/bin/tsc --noEmit -p apps/mobile/tsconfig.json.
- PASS: git diff --check.

These are static/unit checks with mocked native boundaries. Native Yoga layout, perceived animation smoothness, VoiceOver and device frame timing were not exercised. Device/simulator QA is explicitly prohibited by the request; no native validation is claimed.

## Prevention

Keep transient status presentation owned by a stable measured region. Request state should publish immediately; retain only departing visual content, disable its work indicators, and guard interrupted completion callbacks.
