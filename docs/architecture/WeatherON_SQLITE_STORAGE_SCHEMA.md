# WeatherON SQLite Storage Schema

Date: 2026-07-16

## Decision

WeatherON native app persistence uses `weatheron.db` through `expo-sqlite`.
Native persistence must not store app state as JSON files or a single JSON blob value.

The native storage entry point is:

- `apps/mobile/src/providers/appStorage.ts`

The web preview fallback remains separate:

- `apps/mobile/src/providers/appStorage.web.ts`

Web fallback uses browser `localStorage` only to keep Expo web export free from the `expo-sqlite` web/WASM path.
It is not the native app storage contract.

## Native Tables

`weatheron.db` stores app data across normalized SQLite tables:

- `app_meta`
- `app_settings`
- `app_list_values`
- `places`
- `weather_locations`
- `destinations`
- `destination_repeat_days`
- `destination_preview`
- `preview_repeat_days`
- `alert_preferences`
- `notification_read_ids`
- `notification_history`
- `special_alert_delivery`
- `weather_provider_result`
- `weather_snapshots`
- `weather_hourly`
- `weather_daily`

## Migration

The app still reads legacy data once from:

- old `app_values` SQLite key-value rows
- old `FileSystem.documentDirectory/weatheron/*.json` files

After successful migration, the app marks:

- `weatheron.storage.sqlite-schema.v2`

Legacy JSON files are deleted after import.
The old `app_values` table is treated as migration input only, not as the active persistence model.

## Rule

New native app persistence must add or extend SQLite tables.
Do not add new native JSON file storage or JSON blob storage for app state.

## Account Sync Boundary

SQLite remains the native local/offline store after account login. Cloudflare D1 is the server source of truth for cross-platform restoration.

Sync candidates:

- user-selected settings and style profile
- wardrobe ownership and saved outfits
- saved destinations, schedules, destination care, and alert conditions

Device-local only:

- location and notification permission state
- weather response cache and provider fallback state
- authentication tokens
- transient route/form state and device-local notification read state

Detailed merge, deletion, and account lifecycle rules are defined in `docs/architecture/WeatherON_ACCOUNT_AUTH_SYNC_SPEC.md`.
