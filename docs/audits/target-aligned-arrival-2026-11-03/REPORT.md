# Target-aligned departure calculation — 2026-11-03

Source implementation and local verification complete. Commit/push was subsequently authorized for this fix branch only; the verified publication SHA is recorded in the delivery response. Main merge, deployment and device validation remain outside this work.

## Isolation and basis

- Worktree: `/workspace/weatherON-arrival`; branch: `fix/target-aligned-arrival-20261103`.
- Base HEAD: `71b8bf711efd62b6bd92419f83ec806bdff61b97`, the published Live Activity preservation fix, descending from latest remote main `64901d05c7036e04bc97a2525d8faabc78cfec90`.
- `git ls-remote` confirmed both remote heads unchanged after implementation. This SHA is the implementation base; the publication commit is verified separately.
- Original `/workspace/weatherON` remains on `fix/ambient-surface-motion-20261103` with its uncommitted motion changes; no source edits were made there. Separate dependency links resolve this worktree's shared package, not the original tree's package.

## Confirmed mechanism and policy

The previous algorithm subtracted an automatic 0/5/10/15/20-minute buffer according to the time remaining when queried, and reused a saved matching buffer on subsequent requests. The common resolver also preferred a provider/saved absolute departure. That mechanism reproduced an early-arrival result in source; the user's actual historical response/storage was not collected, so it is not independently established as the exact device event.

The approved policy now uses route duration T, with no automatic arrival margin:

- Arrival basis: D = target arrival − T; estimated arrival = D + T = target arrival.
- Departure basis: D = selected departure; estimated arrival = D + T.
- Provider seconds remain authoritative. Minute display rounding does not enter scheduling arithmetic.
- Notification lead time remains independent; Live Activity's existing D−60-minute activation rule remains independent.
- Example: target 08:40, T=50m ⇒ D=07:50, estimated arrival=08:40. A 60m reminder and Live Activity start are both 06:50.

These are route-duration estimates, not evidence of a guaranteed real arrival or timetable accuracy. No new long disclaimer was added to the app.

## Production changes

| Path | Change |
| --- | --- |
| `apps/mobile/src/utils/travelEstimate.ts:119–136` | Common absolute timing ignores old automatic margins and provider sampled/old departure overrides. Preparation remains separate. |
| `apps/mobile/src/state/appStateHelpers.ts:322–396` | Removes automatic-buffer heuristic; retains timezone/recurrence and request date/time/basis/mode/origin validation. |
| `apps/mobile/src/state/useWeatherOnAppState.ts:1003–1028` | Actual request effect sends zero margin and derives retry windows from the canonical deadline. Selected/Home/widget/Activity inputs use the same resolver. |
| `apps/mobile/src/providers/travelEstimateClient.ts:108–130` | Forces zero request margin and normalizes scheduled-arrival results from older proxies. Retains provider, duration, source message, updatedAt, expiresAt and cache status. |
| `apps/mobile/src/state/persistedAppState.ts:477–509` | Idempotently migrates old saved/preview margins to zero and recomputes scheduled absolute times. Never refreshes freshness timestamps. Drops obsolete buffer-based feasibility. Current-query departure/arrival instants stay intact. |
| `apps/server/src/proxyCore.mjs:328–378,423` | Validates legacy buffer parameter but uses zero; versions the cache policy; normalizes every arrival provider/mode from returned duration. Bounded driving-duration search remains within the existing six-call/12s budget; its sampled departure no longer becomes an extra early margin. |
| `packages/shared/src/rules/destination.ts:49–68` | Removes default ten-minute subtraction in shared/fallback care construction, including legacy explicit automatic-buffer input. |
| `apps/mobile/src/screens/HomeScreen.tsx:197–203,625–653` | Uses concise 출발 예상 and removes artificial margin text/fallback subtraction. |
| `apps/mobile/src/screens/DestinationCareScreen.tsx:84–86,276–300,891–898` | Same fallback calculation and concise labels; removes margin row. Missed planned departure is labeled 출발 예상시각 지남 · 시간 변경 필요, rather than implying a current-departure estimate. |
| `apps/mobile/src/localization/locales/{en,ja}.json`, `scripts/generate-mobile-locales.mjs` | Reviewed English/Japanese catalogs and server-composed segment match the changed concise copy. |

Native ActivityKit/Swift, provider selection, route upstream endpoints, personal settings and actual stored user data were not changed. The new calculation changes the deadline supplied to the existing Activity/notification reconciliation code. A previously accepted early deadline is replaced when fresh data permits; an expired route cannot preserve a different legacy deadline or create its replacement. Exact matching accepted deadlines can still be preserved through expiry, as in the published safety fix. Edits/removal, care OFF, mode/basis changes, mismatched date and day rollover still cancel incompatible activity state.

## Tests and evidence

Final checks all passed (15 commands, exit 0). Native boundaries are mocked; actual SQLite is executed by Node SQLite.

- PASS `npx tsc -p apps/mobile/tsconfig.json --noEmit`
- PASS `env TZ=UTC node --no-warnings scripts/check-route-selected-time.mjs`
- PASS `env TZ=Asia/Seoul node --no-warnings scripts/check-route-selected-time.mjs`
- PASS `node scripts/check-destination-care-presentation.mjs`
- PASS `node scripts/check-home-leaving-now.mjs`
- PASS `npm run check:android-product-quality`
- PASS `node --no-warnings scripts/check-ios-reliability.mjs`
- PASS `node --no-warnings scripts/check-correctness-batch.mjs`
- PASS `node scripts/check-weather-outfit-regressions.mjs`
- PASS `node --no-warnings scripts/check-review-regressions.mjs`
- PASS `node scripts/check-shared-rules.mjs`
- PASS `npm run check:mobile-localization`
- PASS `node scripts/check-ios-live-activity.mjs`
- PASS `node scripts/check-departure-push-runtime.mjs`
- PASS `git diff --check`

Regression additions/updates:

- `scripts/check-route-selected-time.mjs`: actual server requests, old-client 20m→zero cache identity/no extra lookup, domestic Kakao and overseas Google, bounded increasing/decreasing/oscillating driving queries, transport modes, malformed/error/offline/stale provenance, actual request effect sends zero, response cancellation and throttle. The core policy matrix covers old 0/5/20m values, seconds/zero duration, midnight/year/DST instants and four display zones. Saved and preview rows round-trip through actual SQLite; migration is idempotent and preserves age/expiry/stale state. Exact user case is asserted across Home/detail model, local notification, Activity builder/activation and widget payload. Duration increases/decreases/oscillations replace native notification requests without duplicate schedules. UTC and Asia/Seoul executions both pass.
- `scripts/check-departure-activity-schedule.mjs`: updated paired mode deadlines, existing guard/recovery coverage retained, plus legacy 20m-early reservation rejection after migration through the actual iOS and Android provider paths.
- `scripts/check-destination-care-presentation.mjs`: renders production JSX for 07:50/08:40, no margin row, departure mode, unavailable/expired states and stale/late status.
- `scripts/check-home-leaving-now.mjs`: existing production declarations/JSX pass for 216 cases plus no-destination guards across iOS/Android/web; planned and current-departure estimates remain separate.
- `scripts/check-shared-rules.mjs`: arrival reminder updated to 10:00−45m−30m=08:45, while departure-basis assertions remain unchanged.
- `scripts/check-android-product-quality.mjs`: expects approved concise label; all other product checks retained.

Initial failures from old label/buffer expectations were updated to the new explicit contract; no assertion/check was removed or bypassed. Final source checks have no remaining failure. No standalone lint command is defined in this repository; TypeScript and diff checks passed.

## Limits and next validation

- No real provider credentials or historical user response were used in regressions. Kakao transit uses existing route total duration/steps; actual service/wait/transfer variability is not newly fetched or guessed. Overseas Google remains selected by the existing country/mode rules. The bounded car forecast can be sampled at a nearby candidate departure; aligning its returned duration is an estimate, not proof that exact traffic/timetable conditions at the resulting departure are known.
- No extra API calls, SDK, tracking or user-data collection was added. Query timestamps/expiry are retained; stale/fallback/error data is not promoted to verified activity or notification scheduling. Near-departure retry policy remains the existing one.
- Apple SDK/Swift compilation, iPhone/TestFlight rendering, actual OS notification/Activity delivery and Dynamic Island presentation were not run in this Linux environment. No simulator, deployment, personal setting change or monitoring was performed. This calculation repair does not establish resolution of the earlier Dynamic Island/device automatic-start reports.
- After authorized publication/build installation, check target08:40/route50m→07:50/08:40; departure07:50→08:40; confirm reminder and Activity follow the new deadline; restart with old 20m saved data; rapid time/mode changes; missed departure and next repeat day. Keep actual route duration/provider lookup basis visible through the existing short status UI.

Review the patch relative to the base SHA in the isolated worktree; it contains only this repair, related regressions/localization and this report. Main and both prior work branches remain preserved.
