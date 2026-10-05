# Widget layout and snapshot-time follow-up

Base: `60dcad9385d4af11f4634c7c0b1c500d76e14296`.

Native weather refresh added attribution below a widget body that already used its available height. This clipped the footer and crowded the upper content. The attribution asset selection also placed a light mark on a light background.

The update adjusts small, medium and large layouts, preserves readable attribution and its legal link, and reduces oversized temperatures, icons and cards to provide outer spacing. Compact precipitation remains visible without displacing the temperature or its unit. The medium layout uses an 18-point horizontal inset, 12-point top inset and 12 points below the footer.

The former long guidance sentence is replaced by a scoped app-snapshot time. `WeatherONEntry.appSnapshotUpdatedAt` retains the actual persisted shared store's `updatedAt`, independently of native weather's `observedAt`. It describes app-delivered outfit, preparation and route information, not the native weather observation or a guarantee that every recommendation was freshly recalculated. Prior-day timestamps include a date; prior-year timestamps include the year. Missing, unparseable or future timestamps show an unavailable label, without substituting the current time. Korean, English, Japanese and accessibility labels preserve this distinction.

Hourly labels previously fell back to the final five characters of a date-time string, displaying minutes and seconds as if they were hours and minutes. The formatter now validates the existing forecast-location wall-time contract and returns its hours and minutes. This includes older snapshots whose wall-time strings carry a suffix; it does not reinterpret those values in the device's timezone. Invalid input produces `--:--`.

The outfit screen's umbrella CTA now uses the destination title, “우산 추천”, with the existing English/Japanese translations and inherited accessibility label. Its route and action are unchanged. The corresponding Android flow selector was updated.

## Validation

| Check | Result and limit |
| --- | --- |
| `node scripts/check-ios-widget-hour-labels.mjs` | 69 production-formatter cases pass. The original local-date input failed before the fix. Covers cached/native strings, midnight, leap date, DST-labelled wall times, device timezones and invalid input. |
| `node scripts/check-ios-widget-guidance-time.mjs` | 162 formatter assertions pass across locales, 12/24-hour preferences, dates, missing/future values and location/device timezones. Source contract checks verify both entry paths use the persisted app timestamp. |
| `node scripts/check-ios-widget-daylight.mjs` | Pass; existing daylight calculations retained. |
| `bash scripts/check-widget-native-weather.sh` | Production coordinator mocks and complete widget/Live Activity Swift typecheck against the iOS Simulator SDK pass. |
| Widget synchronization and Live Activity contract scripts | Pass. |
| Mobile TypeScript and localization checks | Pass for the CTA change; subsequent edits are native-widget-only. |
| Render comparison | 864 final combinations cover today, previous-day and missing timestamps; three widget families; light/dark; Korean/English/Japanese; current/destination; dry/rain; short names with normal text environment and long names with accessibility5. No measured vertical overflow. Synthetic fixtures only. |
| Render limits | macOS SwiftUI rendering of production views with platform adapters, at 158×158, 338×158 and 338×354 points. This is not WidgetKit rendering on every device/display-zoom geometry. Existing fixed-point fonts do not enlarge with accessibility5; no full accessibility certification is claimed. |
| Signed Release iphoneos build | Pass with the existing profiles. Service configuration and installed native-module integration passed preflight; embedded endpoint/token presence was checked without exposing values. |
| Device update and preservation | Same-ID updates succeeded without uninstall/reset. Local Documents SQLite integrity, schema and aggregate row counts matched before/after. This is not a full Keychain or record-by-record audit. |
| Physical-device observations | The assistant directly observed the medium widget's clipping/contrast and density/hour-label improvements. The final concise-guidance build was installed; its last assistant capture was locked. The user subsequently confirmed the screen before authorizing publication. These evidence sources are distinct. Small/large and dark appearance have render evidence only. |

Attribution and legal-link behavior are preserved. [Apple's WeatherKit attribution guidance](https://developer.apple.com/weatherkit/) describes the mark and legal-link requirements; this report does not claim a separately established widget-specific rule.

No profile, credential, permission, server policy or data schema changes are included. Private screenshots, actual user snapshots, backups, environment files, signing material and build products are excluded. PR, main merge and deployment are outside this follow-up.
