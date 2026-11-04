# Compact Home destination and outfit copy — 2026-11-04 KST

Implemented locally on `Daehyeons-Laptop.local`, repository `/Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱`, branch `main`, base HEAD `47b3b4c104b355dd50a5733f60fa0690edf44099`. This work is uncommitted/unpushed and is not included in a main commit or TestFlight binary. The existing Live Activity clock repair and its tests/report remain preserved as separate pending changes. Local HEAD matches the local upstream ref; no fresh remote/deployment inventory is claimed.

## Changes

- iOS Home destination card: remove the repeated destination/time basis and normal completed-route/weather status rows. Keep request-in-progress, stale, failure and unavailable-data guidance, including retry actions. Combine temperature/other preparation evidence and maximum precipitation probability into the existing forecast link. Reduce vertical padding/gaps; retain 44pt controls and natural text wrapping.
- Reuse `summarizeHomeOutfit` on the Outfit page. Merge repeated cold/light-layer and temperature-swing advice into one sentence, such as `따뜻하게 겹쳐 입고, 겉옷으로 조절해요`. Shorten previously unmapped heat/freezing clauses while retaining water/scarf actions. Preserve separate rain, wind, snow, hail, partial-data and timed forecast warnings. Unknown copy remains intact.
- Update reviewed English/Japanese translations and focused regressions. Recommendation rules, selected clothes/images, weather thresholds, route calculations and native ActivityKit implementation are unchanged by this UI work.

## Verification

Passed mobile TypeScript, Home plan-width JSX checks (320–440pt / 1–2x type), outfit commentary and actual Home/Outfit headline JSX, reviewed localization (2267 messages), Android product-quality checks, weather-guidance matrix, review-regression aggregate (including the pending Activity repair), and `git diff --check`.

In-app browser used a temporary fixture harness generated from the actual production Home card/selector JSX, styles, Outfit screen and OutfitGrid. Native surfaces, navigation, status animation and external data are stubbed; this is browser layout evidence, not a full running iOS app or device verification. No personal locations/schedules or third-party requests are used by the harness.

- Same 440px fixture, same weather/trip: destination card 328px before → 158px after (about 52% shorter).
- Reported cold/swing headline: one line at 440px, two lines at 360px (64px / 32px line height), no horizontal text overflow.
- Inspected 375px/light, 360px/long-name/stale, and 360px/2x-type/loading cases. The 2x card grows vertically without horizontal overflow; the full truncated destination name remains in its accessible label. Native Dynamic Type line measurement is not established by the browser scale approximation.
- Screenshots: `/Users/daehyeonchoi/.codex/visualizations/2026/11/04/01a1a67b-d384-7480-b531-eec11932da14/home-compact.jpg` and `outfit-compact.jpg` in the same directory.

Temporary browser tab and preview server were closed/stopped after inspection. Harness files stay under existing untracked `tmp/`; existing QA artifacts were not added or deleted. No commit, push, native build, TestFlight distribution or physical-device check was performed. A corrected binary is still required for device acceptance.

## Subsequent publication authorization

The user explicitly authorized committing/pushing this UI work together with the separately committed Live Activity repair. Fresh origin/main verification matched base `47b3b4c104b355dd50a5733f60fa0690edf44099`. The uncommitted/unpushed statements above describe implementation closeout before that authorization; final publication SHAs and remote-main verification are reported in the delivery response. No new build/distribution or physical-device acceptance is implied.
