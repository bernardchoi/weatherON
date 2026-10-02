# iOS widget synchronization investigation

Baseline: `015e8adc4e4ee32f02203f8bc1dde9ce92fd387e` (remote main supplied and confirmed by the user).
Branch: `fix/ios-widget-sync`.

## Architecture and findings

- `useWeatherOnAppState.ts` builds widget weather from `weatherProviderResult.current` and destination snapshots, the same provider result used by home. The widget's configured location is independent of the location selected on home; compare the same location when checking parity.
- The Expo native module writes the v2 JSON store to App Group defaults and an atomic file. App Debug/Release and widget entitlements all declare `group.com.weatheron.mobile`; the writer and widget both use `WeatherONLocationWidgetV4`. No source-level group/kind mismatch was found. Signed device entitlements were not inspected.
- Previously, the editor derived destinations only from weather snapshots. Missing destination weather, including during loading, therefore removed saved places from Edit Widget. The entire weather export was also blocked by `isWeatherLoading`.
- Native file-write errors were ignored and successful delivery was reported anyway. The app then deduplicated subsequent attempts. Reload was deferred by 0.5 seconds, leaving an app-suspension window. These are code-level failure paths, not device-confirmed diagnoses of this installation.
- `travelMinutes` crossed the JS bridge as an unrestricted number but Swift decodes an integer. A fractional value can reject the entire store. It is now rounded before serialization.
- Missing stores previously supplied preview destinations to the editor, and a missing selected destination silently fell back to current-location weather. Snapshot previews also substituted sample weather. Those substitutions are now avoided in real entries.

## Changes

- A separate versioned saved-location catalog is written after app-state hydration, independently of network/weather availability. Additions, renames, deletions, and the empty list are published. Older installations without a catalog still read choices from the v2 store.
- iOS exports usable current weather even while destination requests are pending, but does not publish launch fixtures or associate new coordinates with weather for an old location. Android retains its loading gate.
- Atomic file delivery must succeed before the bridge reports success. Reload is requested before returning; identical deliveries can retry a reload. JS still deduplicates successful deliveries, retries failures on the existing minute tick, and resets delivery keys on foreground entry.
- Missing/deleted destination weather displays an update-in-app state. Old observation times display their date instead of the ambiguous “recently updated” label.
- The timeline requests a shared-cache reread after 15 minutes rather than 90. This is a requested earliest reload, not a guaranteed schedule or network fetch. Solar transitions remain scheduled.
- Live Activity entry points and helper implementations are unchanged. No credentials, entitlements, provisioning, or server configuration were changed.

## Unresolved: new weather while the app stays closed

This patch fixes app-to-widget synchronization; it does **not** implement independent network weather acquisition. Existing timelines reuse the saved observations. A shorter cache reread interval cannot produce new observations.

The iOS app explicitly uses `fetchWeatherKitForecast` in `weatherProvider.ts`, via `/weather/weatherkit` in `weatherClient.ts`. Runtime API base URL and optional proxy token are supplied through `weatherEnv.ts`; `proxyCore.mjs` requires that token when `PROXY_ACCESS_TOKEN` is configured. The widget has no shared network configuration/authentication contract, network client, or WeatherKit response adapter. Direct native WeatherKit is not configured in the widget's entitlements either.

Completing closed-app refresh requires an authorized extension authentication/configuration design for the existing proxy (or WeatherKit capability/provisioning), a bounded network request in the timeline provider, matching weather normalization and cache precedence, and offline behavior. Sharing a token or adding capabilities was not introduced under this task's no-credentials/no-permissions-change constraint. Switching the widget to an unrelated public weather provider would undermine app/widget parity. This remaining symptom must not be reported as fully fixed.

## Verification

Available environment: Windows, Node 24.18.1, Git. No software installed.

- `npm run check:ios-widget-sync`: executes the actual TypeScript catalog/serialization functions and synchronization effect bodies with test doubles; also parses edited TypeScript and checks native source contracts. Requires Node >= 22.13. It does not execute Swift or typecheck the application.
- `node scripts/check-ios-live-activity.mjs`: existing source-contract regression suite, with widget expectations updated for intentional changes.
- `node scripts/check-android-widget.mjs`: existing Android wiring check.
- `git diff --check`: whitespace validation.

Swift/Xcode builds, native unit execution, simulator/device checks, and the Swift daylight harness are not run. They are explicitly deferred; Swift, Xcode, and the app's installed TypeScript dependencies are unavailable here. Device follow-up should cover adding/removing/renaming locations during a failed request, same-location app/widget parity, immediately backgrounding after a weather update, switching location, offline launch, a deleted configured destination, and Live Activity smoke checks. WidgetKit reload timing and actual signed App Group access remain unverified until then.
