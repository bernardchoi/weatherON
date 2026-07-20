type SQLiteDatabase = import("expo-sqlite").SQLiteDatabase;

type SQLiteExecutor = Pick<SQLiteDatabase, "getAllAsync" | "getFirstAsync" | "runAsync">;

type AppSettingRow = {
  key: string;
  text_value: string | null;
  number_value: number | null;
  bool_value: number | null;
};
type AlertPreferenceRow = { key: string; enabled: number };
type TextRow = { value: string };
type DestinationRow = {
  seq: number;
  place_id: string;
  name: string;
  address: string;
  category: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
  provider: string;
  care_enabled: number;
  alert_rain_threshold_pct: number;
  alert_lead_time_minutes: number;
  alert_wind_threshold_ms: number;
  schedule_target_arrival_time: string;
  schedule_transport_mode: string;
  schedule_repeat_enabled: number;
  travel_origin_place_id: string;
  travel_destination_place_id: string;
  travel_provider: string;
  travel_status: string;
  travel_minutes: number;
  travel_distance_meters: number;
  travel_message: string;
  travel_updated_at: string;
  saved_at_label: string;
};
type PlaceRow = {
  kind: string;
  place_id: string;
  name: string;
  address: string;
  category: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
  provider: string;
};
type LocationRow = {
  kind: string;
  location_id: string;
  location_name: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
};
type DestinationPreviewRow = {
  id: number;
  care_enabled: number;
  alert_rain_threshold_pct: number;
  alert_lead_time_minutes: number;
  alert_wind_threshold_ms: number;
  schedule_target_arrival_time: string;
  schedule_transport_mode: string;
  schedule_repeat_enabled: number;
  travel_origin_place_id: string;
  travel_destination_place_id: string;
  travel_provider: string;
  travel_status: string;
  travel_minutes: number;
  travel_distance_meters: number;
  travel_message: string;
  travel_updated_at: string;
};
type NotificationHistoryRow = {
  seq: number;
  id: string;
  notification_id: string;
  title: string;
  action: string;
  route: string | null;
  status_label: string;
  occurred_at: string | null;
};
type WeatherProviderRow = {
  id: number;
  status: string;
  message: string;
  retryable: number;
  fallback_used: number;
};
type WeatherSnapshotRow = {
  role: string;
  seq: number;
  snapshot_id: string | null;
  location_id: string;
  location_name: string;
  country_code: string;
  observed_at: string;
  temp_c: number;
  feels_like_c: number;
  condition: string;
  precipitation_mm: number;
  rain_probability_pct: number;
  wind_ms: number;
  humidity_pct: number;
  uv_index: number | null;
  source: string;
  stale: number;
};
type HourlyWeatherRow = {
  role: string;
  snapshot_seq: number;
  seq: number;
  time: string;
  temp_c: number;
  rain_probability_pct: number;
  precipitation_mm: number;
  wind_ms: number;
  condition: string;
};
type DailyWeatherRow = {
  role: string;
  snapshot_seq: number;
  seq: number;
  date: string;
  min_temp_c: number;
  max_temp_c: number;
  rain_probability_pct: number;
  precipitation_mm: number;
  wind_ms: number;
  condition: string;
};

const databaseName = "weatheron.db";
const legacyAppValueTableName = "app_values";
const schemaVersionKey = "weatheron.storage.sqlite-schema.v2";
const appStateStorageKey = "weatheron.appState.v1";
const notificationStateStorageKey = "weatheron.notificationState.v1";
const weatherProviderResultStorageKey = "weatheron.weatherProviderResult.v1";
const specialAlertDeliveryStorageKey = "weatheron.specialAlertDelivery.v1";
const legacyStorageKeys = [
  appStateStorageKey,
  weatherProviderResultStorageKey,
  specialAlertDeliveryStorageKey,
  notificationStateStorageKey,
] as const;

let databasePromise: Promise<SQLiteDatabase | null> | null = null;
let writeQueue: Promise<void> = Promise.resolve();

export async function readAppValue<T>(key: string): Promise<T | null> {
  const database = await getDatabase();
  if (!database) return null;

  try {
    const value = await readStructuredValue(database, key);
    return value as T | null;
  } catch {
    return null;
  }
}

export async function writeAppValue<T>(key: string, value: T): Promise<void> {
  const database = await getDatabase();
  if (!database) return;

  // 저장은 DELETE 후 INSERT 다발로 이루어져, 동시 호출이 서로 끼어들면 키 충돌로 일부 행이
  // 조용히 유실될 수 있다. 큐로 직렬화하고, 중간 종료 시 부분 저장이 남지 않게 트랜잭션으로 묶는다.
  const run = writeQueue.then(() =>
    database.withTransactionAsync(async () => {
      await writeStructuredValue(database, key, value);
    }),
  );
  writeQueue = run.catch(() => {});
  try {
    await run;
  } catch {
    // SQLite 저장 실패는 화면 상태를 막지 않는다.
  }
}

async function getDatabase(): Promise<SQLiteDatabase | null> {
  databasePromise ??= openDatabase();
  return databasePromise;
}

async function openDatabase(): Promise<SQLiteDatabase | null> {
  try {
    const { openDatabaseAsync } = await import("expo-sqlite");
    const database = await openDatabaseAsync(databaseName);
    await database.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        text_value TEXT,
        number_value REAL,
        bool_value INTEGER,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_list_values (
        list_key TEXT NOT NULL,
        seq INTEGER NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (list_key, seq)
      );

      CREATE TABLE IF NOT EXISTS places (
        kind TEXT PRIMARY KEY NOT NULL,
        place_id TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        category TEXT NOT NULL,
        country_code TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timezone TEXT NOT NULL,
        provider TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weather_locations (
        kind TEXT PRIMARY KEY NOT NULL,
        location_id TEXT NOT NULL,
        location_name TEXT NOT NULL,
        country_code TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timezone TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS destinations (
        place_id TEXT PRIMARY KEY NOT NULL,
        seq INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        category TEXT NOT NULL,
        country_code TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timezone TEXT NOT NULL,
        provider TEXT NOT NULL,
        care_enabled INTEGER NOT NULL,
        alert_rain_threshold_pct REAL NOT NULL,
        alert_lead_time_minutes REAL NOT NULL,
        alert_wind_threshold_ms REAL NOT NULL,
        schedule_target_arrival_time TEXT NOT NULL,
        schedule_transport_mode TEXT NOT NULL,
        schedule_repeat_enabled INTEGER NOT NULL,
        travel_origin_place_id TEXT NOT NULL,
        travel_destination_place_id TEXT NOT NULL,
        travel_provider TEXT NOT NULL,
        travel_status TEXT NOT NULL,
        travel_minutes REAL NOT NULL,
        travel_distance_meters REAL NOT NULL,
        travel_message TEXT NOT NULL,
        travel_updated_at TEXT NOT NULL,
        saved_at_label TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS destination_repeat_days (
        place_id TEXT NOT NULL,
        seq INTEGER NOT NULL,
        day TEXT NOT NULL,
        PRIMARY KEY (place_id, seq)
      );

      CREATE TABLE IF NOT EXISTS destination_preview (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        care_enabled INTEGER NOT NULL,
        alert_rain_threshold_pct REAL NOT NULL,
        alert_lead_time_minutes REAL NOT NULL,
        alert_wind_threshold_ms REAL NOT NULL,
        schedule_target_arrival_time TEXT NOT NULL,
        schedule_transport_mode TEXT NOT NULL,
        schedule_repeat_enabled INTEGER NOT NULL,
        travel_origin_place_id TEXT NOT NULL,
        travel_destination_place_id TEXT NOT NULL,
        travel_provider TEXT NOT NULL,
        travel_status TEXT NOT NULL,
        travel_minutes REAL NOT NULL,
        travel_distance_meters REAL NOT NULL,
        travel_message TEXT NOT NULL,
        travel_updated_at TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS preview_repeat_days (
        seq INTEGER PRIMARY KEY NOT NULL,
        day TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS alert_preferences (
        key TEXT PRIMARY KEY NOT NULL,
        enabled INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notification_read_ids (
        seq INTEGER PRIMARY KEY NOT NULL,
        notification_id TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notification_history (
        seq INTEGER PRIMARY KEY NOT NULL,
        id TEXT NOT NULL,
        notification_id TEXT NOT NULL,
        title TEXT NOT NULL,
        action TEXT NOT NULL,
        route TEXT,
        status_label TEXT NOT NULL,
        occurred_at TEXT
      );

      CREATE TABLE IF NOT EXISTS special_alert_delivery (
        alert_key TEXT PRIMARY KEY NOT NULL,
        delivered_at TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weather_provider_result (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        status TEXT NOT NULL,
        message TEXT NOT NULL,
        retryable INTEGER NOT NULL,
        fallback_used INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weather_snapshots (
        role TEXT NOT NULL,
        seq INTEGER NOT NULL,
        snapshot_id TEXT,
        location_id TEXT NOT NULL,
        location_name TEXT NOT NULL,
        country_code TEXT NOT NULL,
        observed_at TEXT NOT NULL,
        temp_c REAL NOT NULL,
        feels_like_c REAL NOT NULL,
        condition TEXT NOT NULL,
        precipitation_mm REAL NOT NULL,
        rain_probability_pct REAL NOT NULL,
        wind_ms REAL NOT NULL,
        humidity_pct REAL NOT NULL,
        uv_index REAL,
        source TEXT NOT NULL,
        stale INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (role, seq)
      );

      CREATE TABLE IF NOT EXISTS weather_hourly (
        role TEXT NOT NULL,
        snapshot_seq INTEGER NOT NULL,
        seq INTEGER NOT NULL,
        time TEXT NOT NULL,
        temp_c REAL NOT NULL,
        rain_probability_pct REAL NOT NULL,
        precipitation_mm REAL NOT NULL,
        wind_ms REAL NOT NULL,
        condition TEXT NOT NULL,
        PRIMARY KEY (role, snapshot_seq, seq)
      );

      CREATE TABLE IF NOT EXISTS weather_daily (
        role TEXT NOT NULL,
        snapshot_seq INTEGER NOT NULL,
        seq INTEGER NOT NULL,
        date TEXT NOT NULL,
        min_temp_c REAL NOT NULL,
        max_temp_c REAL NOT NULL,
        rain_probability_pct REAL NOT NULL,
        precipitation_mm REAL NOT NULL,
        wind_ms REAL NOT NULL,
        condition TEXT NOT NULL,
        PRIMARY KEY (role, snapshot_seq, seq)
      );
    `);
    await migrateLegacyStorage(database);
    return database;
  } catch {
    return null;
  }
}

async function readStructuredValue(database: SQLiteExecutor, key: string): Promise<unknown | null> {
  if (key === appStateStorageKey) return readPersistedAppState(database);
  if (key === notificationStateStorageKey) return readNotificationState(database);
  if (key === weatherProviderResultStorageKey) return readWeatherProviderResult(database);
  if (key === specialAlertDeliveryStorageKey) return readSpecialAlertDeliveryRecords(database);
  return null;
}

async function writeStructuredValue(database: SQLiteExecutor, key: string, value: unknown): Promise<void> {
  if (key === appStateStorageKey) {
    await writePersistedAppState(database, value);
    return;
  }
  if (key === notificationStateStorageKey) {
    await writeNotificationState(database, value);
    return;
  }
  if (key === weatherProviderResultStorageKey) {
    await writeWeatherProviderResult(database, value);
    return;
  }
  if (key === specialAlertDeliveryStorageKey) {
    await writeSpecialAlertDeliveryRecords(database, value);
  }
}

async function readPersistedAppState(database: SQLiteExecutor): Promise<Record<string, unknown> | null> {
  const settings = await readSettings(database);
  if (settings.size === 0) return null;
  const selectedStyles = await readListValues(database, "selectedStyles");
  const wardrobeOwnedItemIds = await readListValues(database, "wardrobeOwnedItemIds");
  const selectedDestinationPlace = await readPlace(database, "selectedDestination");
  const manualWeatherLocation = await readWeatherLocation(database, "manualWeatherLocation");
  const destinations = await readSavedDestinations(database);
  const preview = await readDestinationPreview(database);
  const notificationState = await readNotificationState(database);
  const alertPreferences = await readAlertPreferences(database);

  return removeUndefined({
    onboardingCompleted: boolSetting(settings, "onboardingCompleted"),
    smartCareEnabled: boolSetting(settings, "smartCareEnabled"),
    accountLinked: boolSetting(settings, "accountLinked"),
    termsRequiredAccepted: boolSetting(settings, "termsRequiredAccepted"),
    locationReady: boolSetting(settings, "locationReady"),
    permissionReady: boolSetting(settings, "permissionReady"),
    outfitSaved: boolSetting(settings, "outfitSaved"),
    styleProfileSaved: boolSetting(settings, "styleProfileSaved"),
    styleGender: textSetting(settings, "styleGender"),
    ageBand: textSetting(settings, "ageBand"),
    fitPreference: textSetting(settings, "fitPreference"),
    selectedStyles,
    smartCareScenario: textSetting(settings, "smartCareScenario"),
    wardrobeOwnedItemIds,
    selectedWardrobeItemId: textSetting(settings, "selectedWardrobeItemId"),
    savedDestinations: destinations,
    selectedDestinationPlace,
    previewDestinationCareEnabled: preview?.careEnabled,
    previewDestinationAlertCondition: preview?.alertCondition,
    previewDestinationSchedulePreference: preview?.schedulePreference,
    previewDestinationTravelEstimate: preview?.travelEstimate,
    weatherLocationMode: textSetting(settings, "weatherLocationMode"),
    manualWeatherLocation,
    temperatureUnit: textSetting(settings, "temperatureUnit"),
    weightUnit: textSetting(settings, "weightUnit"),
    distanceUnit: textSetting(settings, "distanceUnit"),
    themeMode: textSetting(settings, "themeMode"),
    reducedTransparency: boolSetting(settings, "reducedTransparency"),
    dynamicColorEnabled: boolSetting(settings, "dynamicColorEnabled"),
    adConsentMode: textSetting(settings, "adConsentMode"),
    readNotificationIds: notificationState.readNotificationIds,
    notificationHistory: notificationState.notificationHistory,
    alertPreferences,
  });
}

async function writePersistedAppState(database: SQLiteExecutor, value: unknown) {
  const record = objectRecord(value);
  const now = Date.now();
  await writeSettings(database, {
    onboardingCompleted: boolValue(record.onboardingCompleted),
    smartCareEnabled: boolValue(record.smartCareEnabled),
    accountLinked: boolValue(record.accountLinked),
    termsRequiredAccepted: boolValue(record.termsRequiredAccepted),
    locationReady: boolValue(record.locationReady),
    permissionReady: boolValue(record.permissionReady),
    outfitSaved: boolValue(record.outfitSaved),
    styleProfileSaved: boolValue(record.styleProfileSaved),
    styleGender: textValue(record.styleGender),
    ageBand: textValue(record.ageBand),
    fitPreference: textValue(record.fitPreference),
    smartCareScenario: textValue(record.smartCareScenario),
    selectedWardrobeItemId: textValue(record.selectedWardrobeItemId),
    weatherLocationMode: textValue(record.weatherLocationMode),
    temperatureUnit: textValue(record.temperatureUnit),
    weightUnit: textValue(record.weightUnit),
    distanceUnit: textValue(record.distanceUnit),
    themeMode: textValue(record.themeMode),
    reducedTransparency: boolValue(record.reducedTransparency),
    dynamicColorEnabled: boolValue(record.dynamicColorEnabled),
    adConsentMode: textValue(record.adConsentMode),
  }, now);
  await replaceListValues(database, "selectedStyles", stringArray(record.selectedStyles));
  await replaceListValues(database, "wardrobeOwnedItemIds", stringArray(record.wardrobeOwnedItemIds));
  await writePlace(database, "selectedDestination", record.selectedDestinationPlace, now);
  await writeWeatherLocation(database, "manualWeatherLocation", record.manualWeatherLocation, now);
  await writeSavedDestinations(database, arrayValue(record.savedDestinations), now);
  await writeDestinationPreview(database, record, now);
  await writeNotificationState(database, {
    readNotificationIds: record.readNotificationIds,
    notificationHistory: record.notificationHistory,
  });
  await writeAlertPreferences(database, record.alertPreferences, now);
}

async function readSettings(database: SQLiteExecutor): Promise<Map<string, AppSettingRow>> {
  const rows = await database.getAllAsync<AppSettingRow>("SELECT key, text_value, number_value, bool_value FROM app_settings");
  return new Map(rows.map((row) => [row.key, row]));
}

async function writeSettings(database: SQLiteExecutor, settings: Record<string, string | number | boolean | null>, now: number) {
  for (const [key, value] of Object.entries(settings)) {
    await database.runAsync(
      `INSERT INTO app_settings (key, text_value, number_value, bool_value, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET text_value = excluded.text_value, number_value = excluded.number_value, bool_value = excluded.bool_value, updated_at = excluded.updated_at`,
      key,
      typeof value === "string" ? value : null,
      typeof value === "number" ? value : null,
      typeof value === "boolean" ? (value ? 1 : 0) : null,
      now,
    );
  }
}

function textSetting(settings: Map<string, AppSettingRow>, key: string): string | undefined {
  const value = settings.get(key)?.text_value;
  return value ?? undefined;
}

function boolSetting(settings: Map<string, AppSettingRow>, key: string): boolean | undefined {
  const value = settings.get(key)?.bool_value;
  return typeof value === "number" ? value === 1 : undefined;
}

async function readListValues(database: SQLiteExecutor, listKey: string): Promise<string[]> {
  const rows = await database.getAllAsync<TextRow>("SELECT value FROM app_list_values WHERE list_key = ? ORDER BY seq", listKey);
  return rows.map((row) => row.value);
}

async function replaceListValues(database: SQLiteExecutor, listKey: string, values: string[]) {
  await database.runAsync("DELETE FROM app_list_values WHERE list_key = ?", listKey);
  await Promise.all(values.map((value, index) => database.runAsync(
    "INSERT INTO app_list_values (list_key, seq, value) VALUES (?, ?, ?)",
    listKey,
    index,
    value,
  )));
}

async function readSavedDestinations(database: SQLiteExecutor): Promise<unknown[]> {
  const rows = await database.getAllAsync<DestinationRow>("SELECT * FROM destinations ORDER BY seq");
  return Promise.all(rows.map(async (row) => ({
    place: placeFromRow(row),
    careEnabled: row.care_enabled === 1,
    alertCondition: alertConditionFromRow(row),
    schedulePreference: {
      targetArrivalTime: row.schedule_target_arrival_time,
      transportMode: row.schedule_transport_mode,
      repeatEnabled: row.schedule_repeat_enabled === 1,
      repeatDays: await readDestinationRepeatDays(database, row.place_id),
    },
    travelEstimate: travelEstimateFromRow(row),
    savedAtLabel: row.saved_at_label,
  })));
}

async function writeSavedDestinations(database: SQLiteExecutor, destinations: unknown[], now: number) {
  await database.runAsync("DELETE FROM destinations");
  await database.runAsync("DELETE FROM destination_repeat_days");
  for (const [index, value] of destinations.entries()) {
    const destination = objectRecord(value);
    const place = objectRecord(destination.place);
    const alertCondition = objectRecord(destination.alertCondition);
    const schedulePreference = objectRecord(destination.schedulePreference);
    const travelEstimate = objectRecord(destination.travelEstimate);
    const placeId = textValue(place.id) ?? `destination-${index}`;
    await database.runAsync(
      `INSERT INTO destinations (
        place_id, seq, name, address, category, country_code, latitude, longitude, timezone, provider,
        care_enabled, alert_rain_threshold_pct, alert_lead_time_minutes, alert_wind_threshold_ms,
        schedule_target_arrival_time, schedule_transport_mode, schedule_repeat_enabled,
        travel_origin_place_id, travel_destination_place_id, travel_provider, travel_status, travel_minutes, travel_distance_meters, travel_message, travel_updated_at,
        saved_at_label, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      placeId,
      index,
      textValue(place.name) ?? "",
      textValue(place.address) ?? "",
      textValue(place.category) ?? "custom",
      textValue(place.countryCode) ?? "GLOBAL",
      numberValue(objectRecord(place.coordinate).latitude),
      numberValue(objectRecord(place.coordinate).longitude),
      textValue(place.timezone) ?? "UTC",
      textValue(place.provider) ?? "fixture",
      boolValue(destination.careEnabled) ? 1 : 0,
      numberValue(alertCondition.rainThresholdPct),
      numberValue(alertCondition.leadTimeMinutes),
      numberValue(alertCondition.windThresholdMs),
      textValue(schedulePreference.targetArrivalTime) ?? "10:00",
      textValue(schedulePreference.transportMode) ?? "auto",
      boolValue(schedulePreference.repeatEnabled) ? 1 : 0,
      textValue(travelEstimate.originPlaceId) ?? "",
      textValue(travelEstimate.destinationPlaceId) ?? placeId,
      textValue(travelEstimate.provider) ?? "fallback",
      textValue(travelEstimate.status) ?? "fallback",
      numberValue(travelEstimate.travelMinutes),
      numberValue(travelEstimate.distanceMeters),
      textValue(travelEstimate.message) ?? "",
      textValue(travelEstimate.updatedAt) ?? "",
      textValue(destination.savedAtLabel) ?? "저장됨",
      now,
    );
    await replaceDestinationRepeatDays(database, placeId, stringArray(schedulePreference.repeatDays));
  }
}

async function readDestinationRepeatDays(database: SQLiteExecutor, placeId: string): Promise<string[]> {
  const rows = await database.getAllAsync<TextRow>("SELECT day AS value FROM destination_repeat_days WHERE place_id = ? ORDER BY seq", placeId);
  return rows.map((row) => row.value);
}

async function replaceDestinationRepeatDays(database: SQLiteExecutor, placeId: string, days: string[]) {
  await Promise.all(days.map((day, index) => database.runAsync(
    "INSERT INTO destination_repeat_days (place_id, seq, day) VALUES (?, ?, ?)",
    placeId,
    index,
    day,
  )));
}

async function readDestinationPreview(database: SQLiteExecutor): Promise<Record<string, unknown> | null> {
  const row = await database.getFirstAsync<DestinationPreviewRow>("SELECT * FROM destination_preview WHERE id = 1");
  if (!row) return null;
  const repeatDays = await readPreviewRepeatDays(database);
  return {
    careEnabled: row.care_enabled === 1,
    alertCondition: alertConditionFromRow(row),
    schedulePreference: {
      targetArrivalTime: row.schedule_target_arrival_time,
      transportMode: row.schedule_transport_mode,
      repeatEnabled: row.schedule_repeat_enabled === 1,
      repeatDays,
    },
    travelEstimate: travelEstimateFromRow(row),
  };
}

async function writeDestinationPreview(database: SQLiteExecutor, record: Record<string, unknown>, now: number) {
  const alertCondition = objectRecord(record.previewDestinationAlertCondition);
  const schedulePreference = objectRecord(record.previewDestinationSchedulePreference);
  const travelEstimate = objectRecord(record.previewDestinationTravelEstimate);
  await database.runAsync(
    `INSERT INTO destination_preview (
      id, care_enabled, alert_rain_threshold_pct, alert_lead_time_minutes, alert_wind_threshold_ms,
      schedule_target_arrival_time, schedule_transport_mode, schedule_repeat_enabled,
      travel_origin_place_id, travel_destination_place_id, travel_provider, travel_status, travel_minutes, travel_distance_meters, travel_message, travel_updated_at,
      updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      care_enabled = excluded.care_enabled,
      alert_rain_threshold_pct = excluded.alert_rain_threshold_pct,
      alert_lead_time_minutes = excluded.alert_lead_time_minutes,
      alert_wind_threshold_ms = excluded.alert_wind_threshold_ms,
      schedule_target_arrival_time = excluded.schedule_target_arrival_time,
      schedule_transport_mode = excluded.schedule_transport_mode,
      schedule_repeat_enabled = excluded.schedule_repeat_enabled,
      travel_origin_place_id = excluded.travel_origin_place_id,
      travel_destination_place_id = excluded.travel_destination_place_id,
      travel_provider = excluded.travel_provider,
      travel_status = excluded.travel_status,
      travel_minutes = excluded.travel_minutes,
      travel_distance_meters = excluded.travel_distance_meters,
      travel_message = excluded.travel_message,
      travel_updated_at = excluded.travel_updated_at,
      updated_at = excluded.updated_at`,
    boolValue(record.previewDestinationCareEnabled) ? 1 : 0,
    numberValue(alertCondition.rainThresholdPct),
    numberValue(alertCondition.leadTimeMinutes),
    numberValue(alertCondition.windThresholdMs),
    textValue(schedulePreference.targetArrivalTime) ?? "10:00",
    textValue(schedulePreference.transportMode) ?? "auto",
    boolValue(schedulePreference.repeatEnabled) ? 1 : 0,
    textValue(travelEstimate.originPlaceId) ?? "",
    textValue(travelEstimate.destinationPlaceId) ?? "",
    textValue(travelEstimate.provider) ?? "fallback",
    textValue(travelEstimate.status) ?? "fallback",
    numberValue(travelEstimate.travelMinutes),
    numberValue(travelEstimate.distanceMeters),
    textValue(travelEstimate.message) ?? "",
    textValue(travelEstimate.updatedAt) ?? "",
    now,
  );
  await database.runAsync("DELETE FROM preview_repeat_days");
  await Promise.all(stringArray(schedulePreference.repeatDays).map((day, index) => database.runAsync(
    "INSERT INTO preview_repeat_days (seq, day) VALUES (?, ?)",
    index,
    day,
  )));
}

async function readPreviewRepeatDays(database: SQLiteExecutor): Promise<string[]> {
  const rows = await database.getAllAsync<TextRow>("SELECT day AS value FROM preview_repeat_days ORDER BY seq");
  return rows.map((row) => row.value);
}

async function readPlace(database: SQLiteExecutor, kind: string): Promise<Record<string, unknown> | undefined> {
  const row = await database.getFirstAsync<PlaceRow>("SELECT * FROM places WHERE kind = ?", kind);
  return row ? placeFromRow(row) : undefined;
}

async function writePlace(database: SQLiteExecutor, kind: string, value: unknown, now: number) {
  const place = objectRecord(value);
  if (!textValue(place.id)) return;
  await database.runAsync(
    `INSERT INTO places (kind, place_id, name, address, category, country_code, latitude, longitude, timezone, provider, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(kind) DO UPDATE SET
       place_id = excluded.place_id,
       name = excluded.name,
       address = excluded.address,
       category = excluded.category,
       country_code = excluded.country_code,
       latitude = excluded.latitude,
       longitude = excluded.longitude,
       timezone = excluded.timezone,
       provider = excluded.provider,
       updated_at = excluded.updated_at`,
    kind,
    textValue(place.id) ?? "",
    textValue(place.name) ?? "",
    textValue(place.address) ?? "",
    textValue(place.category) ?? "custom",
    textValue(place.countryCode) ?? "GLOBAL",
    numberValue(objectRecord(place.coordinate).latitude),
    numberValue(objectRecord(place.coordinate).longitude),
    textValue(place.timezone) ?? "UTC",
    textValue(place.provider) ?? "fixture",
    now,
  );
}

async function readWeatherLocation(database: SQLiteExecutor, kind: string): Promise<Record<string, unknown> | undefined> {
  const row = await database.getFirstAsync<LocationRow>("SELECT * FROM weather_locations WHERE kind = ?", kind);
  if (!row) return undefined;
  return {
    locationId: row.location_id,
    locationName: row.location_name,
    countryCode: row.country_code,
    coordinate: { latitude: row.latitude, longitude: row.longitude },
    timezone: row.timezone,
  };
}

async function writeWeatherLocation(database: SQLiteExecutor, kind: string, value: unknown, now: number) {
  const location = objectRecord(value);
  if (!textValue(location.locationId)) return;
  await database.runAsync(
    `INSERT INTO weather_locations (kind, location_id, location_name, country_code, latitude, longitude, timezone, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(kind) DO UPDATE SET
       location_id = excluded.location_id,
       location_name = excluded.location_name,
       country_code = excluded.country_code,
       latitude = excluded.latitude,
       longitude = excluded.longitude,
       timezone = excluded.timezone,
       updated_at = excluded.updated_at`,
    kind,
    textValue(location.locationId) ?? "",
    textValue(location.locationName) ?? "",
    textValue(location.countryCode) ?? "GLOBAL",
    numberValue(objectRecord(location.coordinate).latitude),
    numberValue(objectRecord(location.coordinate).longitude),
    textValue(location.timezone) ?? "UTC",
    now,
  );
}

async function readAlertPreferences(database: SQLiteExecutor): Promise<Record<string, boolean> | undefined> {
  const rows = await database.getAllAsync<AlertPreferenceRow>("SELECT key, enabled FROM alert_preferences");
  if (rows.length === 0) return undefined;
  return rows.reduce<Record<string, boolean>>((acc, row) => {
    acc[row.key] = row.enabled === 1;
    return acc;
  }, {});
}

async function writeAlertPreferences(database: SQLiteExecutor, value: unknown, now: number) {
  const preferences = objectRecord(value);
  await database.runAsync("DELETE FROM alert_preferences");
  for (const [key, enabled] of Object.entries(preferences)) {
    if (typeof enabled !== "boolean") continue;
    await database.runAsync(
      "INSERT INTO alert_preferences (key, enabled, updated_at) VALUES (?, ?, ?)",
      key,
      enabled ? 1 : 0,
      now,
    );
  }
}

async function readNotificationState(database: SQLiteExecutor): Promise<Record<string, unknown>> {
  const readRows = await database.getAllAsync<TextRow>("SELECT notification_id AS value FROM notification_read_ids ORDER BY seq");
  const historyRows = await database.getAllAsync<NotificationHistoryRow>("SELECT * FROM notification_history ORDER BY seq");
  return {
    readNotificationIds: readRows.map((row) => row.value),
    notificationHistory: historyRows.map((row) => removeUndefined({
      id: row.id,
      notificationId: row.notification_id,
      title: row.title,
      action: row.action,
      route: row.route ?? undefined,
      statusLabel: row.status_label,
      occurredAt: row.occurred_at ?? undefined,
    })),
  };
}

async function writeNotificationState(database: SQLiteExecutor, value: unknown) {
  const record = objectRecord(value);
  await database.runAsync("DELETE FROM notification_read_ids");
  await database.runAsync("DELETE FROM notification_history");
  await Promise.all(stringArray(record.readNotificationIds).map((id, index) => database.runAsync(
    "INSERT INTO notification_read_ids (seq, notification_id) VALUES (?, ?)",
    index,
    id,
  )));
  for (const [index, item] of arrayValue(record.notificationHistory).entries()) {
    const history = objectRecord(item);
    await database.runAsync(
      "INSERT INTO notification_history (seq, id, notification_id, title, action, route, status_label, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      index,
      textValue(history.id) ?? "",
      textValue(history.notificationId) ?? "",
      textValue(history.title) ?? "",
      textValue(history.action) ?? "",
      textValue(history.route) ?? null,
      textValue(history.statusLabel) ?? "",
      textValue(history.occurredAt) ?? null,
    );
  }
}

async function readSpecialAlertDeliveryRecords(database: SQLiteExecutor): Promise<Record<string, string>> {
  const rows = await database.getAllAsync<{ alert_key: string; delivered_at: string }>(
    "SELECT alert_key, delivered_at FROM special_alert_delivery ORDER BY updated_at",
  );
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.alert_key] = row.delivered_at;
    return acc;
  }, {});
}

async function writeSpecialAlertDeliveryRecords(database: SQLiteExecutor, value: unknown) {
  const records = objectRecord(value);
  const now = Date.now();
  await database.runAsync("DELETE FROM special_alert_delivery");
  for (const [key, deliveredAt] of Object.entries(records)) {
    if (typeof deliveredAt !== "string") continue;
    await database.runAsync(
      "INSERT INTO special_alert_delivery (alert_key, delivered_at, updated_at) VALUES (?, ?, ?)",
      key,
      deliveredAt,
      now,
    );
  }
}

async function readWeatherProviderResult(database: SQLiteExecutor): Promise<Record<string, unknown> | null> {
  const result = await database.getFirstAsync<WeatherProviderRow>("SELECT * FROM weather_provider_result WHERE id = 1");
  if (!result) return null;
  const current = await readWeatherSnapshot(database, "current", 0);
  const destination = await readWeatherSnapshot(database, "destination", 0);
  const destinationSnapshots = await readWeatherSnapshots(database, "destinationSnapshot");
  if (!current || !destination) return null;
  return {
    current,
    destination,
    destinationSnapshots,
    status: result.status,
    message: result.message,
    retryable: result.retryable === 1,
    fallbackUsed: result.fallback_used === 1,
  };
}

async function writeWeatherProviderResult(database: SQLiteExecutor, value: unknown) {
  const record = objectRecord(value);
  const now = Date.now();
  await database.runAsync(
    `INSERT INTO weather_provider_result (id, status, message, retryable, fallback_used, updated_at)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status = excluded.status, message = excluded.message, retryable = excluded.retryable, fallback_used = excluded.fallback_used, updated_at = excluded.updated_at`,
    textValue(record.status) ?? "ready",
    textValue(record.message) ?? "",
    boolValue(record.retryable) ? 1 : 0,
    boolValue(record.fallbackUsed) ? 1 : 0,
    now,
  );
  await database.runAsync("DELETE FROM weather_snapshots");
  await database.runAsync("DELETE FROM weather_hourly");
  await database.runAsync("DELETE FROM weather_daily");
  await writeWeatherSnapshot(database, "current", 0, record.current, now);
  await writeWeatherSnapshot(database, "destination", 0, record.destination, now);
  for (const [index, snapshot] of arrayValue(record.destinationSnapshots).entries()) {
    await writeWeatherSnapshot(database, "destinationSnapshot", index, snapshot, now);
  }
}

async function readWeatherSnapshots(database: SQLiteExecutor, role: string): Promise<Record<string, unknown>[]> {
  const rows = await database.getAllAsync<WeatherSnapshotRow>("SELECT * FROM weather_snapshots WHERE role = ? ORDER BY seq", role);
  return Promise.all(rows.map((row) => readWeatherSnapshotFromRow(database, row)));
}

async function readWeatherSnapshot(database: SQLiteExecutor, role: string, seq: number): Promise<Record<string, unknown> | null> {
  const row = await database.getFirstAsync<WeatherSnapshotRow>("SELECT * FROM weather_snapshots WHERE role = ? AND seq = ?", role, seq);
  return row ? readWeatherSnapshotFromRow(database, row) : null;
}

async function readWeatherSnapshotFromRow(database: SQLiteExecutor, row: WeatherSnapshotRow): Promise<Record<string, unknown>> {
  const hourly = await database.getAllAsync<HourlyWeatherRow>(
    "SELECT * FROM weather_hourly WHERE role = ? AND snapshot_seq = ? ORDER BY seq",
    row.role,
    row.seq,
  );
  const daily = await database.getAllAsync<DailyWeatherRow>(
    "SELECT * FROM weather_daily WHERE role = ? AND snapshot_seq = ? ORDER BY seq",
    row.role,
    row.seq,
  );
  return removeUndefined({
    id: row.snapshot_id ?? undefined,
    locationId: row.location_id,
    locationName: row.location_name,
    countryCode: row.country_code,
    observedAt: row.observed_at,
    current: {
      tempC: row.temp_c,
      feelsLikeC: row.feels_like_c,
      condition: row.condition,
      precipitationMm: row.precipitation_mm,
      rainProbabilityPct: row.rain_probability_pct,
      windMs: row.wind_ms,
      humidityPct: row.humidity_pct,
      uvIndex: row.uv_index ?? undefined,
    },
    hourly: hourly.map((item) => ({
      time: item.time,
      tempC: item.temp_c,
      rainProbabilityPct: item.rain_probability_pct,
      precipitationMm: item.precipitation_mm,
      windMs: item.wind_ms,
      condition: item.condition,
    })),
    daily: daily.length > 0 ? daily.map((item) => ({
      date: item.date,
      minTempC: item.min_temp_c,
      maxTempC: item.max_temp_c,
      rainProbabilityPct: item.rain_probability_pct,
      precipitationMm: item.precipitation_mm,
      windMs: item.wind_ms,
      condition: item.condition,
    })) : undefined,
    source: row.source,
    stale: row.stale === 1,
  });
}

async function writeWeatherSnapshot(database: SQLiteExecutor, role: string, seq: number, value: unknown, now: number) {
  const snapshot = objectRecord(value);
  const current = objectRecord(snapshot.current);
  await database.runAsync(
    `INSERT INTO weather_snapshots (
      role, seq, snapshot_id, location_id, location_name, country_code, observed_at,
      temp_c, feels_like_c, condition, precipitation_mm, rain_probability_pct, wind_ms, humidity_pct, uv_index,
      source, stale, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    role,
    seq,
    textValue(snapshot.id) ?? null,
    textValue(snapshot.locationId) ?? "",
    textValue(snapshot.locationName) ?? "",
    textValue(snapshot.countryCode) ?? "GLOBAL",
    textValue(snapshot.observedAt) ?? "",
    numberValue(current.tempC),
    numberValue(current.feelsLikeC),
    textValue(current.condition) ?? "clear",
    numberValue(current.precipitationMm),
    numberValue(current.rainProbabilityPct),
    numberValue(current.windMs),
    numberValue(current.humidityPct),
    typeof current.uvIndex === "number" ? current.uvIndex : null,
    textValue(snapshot.source) ?? "cache",
    boolValue(snapshot.stale) ? 1 : 0,
    now,
  );
  for (const [index, item] of arrayValue(snapshot.hourly).entries()) {
    const hourly = objectRecord(item);
    await database.runAsync(
      "INSERT INTO weather_hourly (role, snapshot_seq, seq, time, temp_c, rain_probability_pct, precipitation_mm, wind_ms, condition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      role,
      seq,
      index,
      textValue(hourly.time) ?? "",
      numberValue(hourly.tempC),
      numberValue(hourly.rainProbabilityPct),
      numberValue(hourly.precipitationMm),
      numberValue(hourly.windMs),
      textValue(hourly.condition) ?? "clear",
    );
  }
  for (const [index, item] of arrayValue(snapshot.daily).entries()) {
    const daily = objectRecord(item);
    await database.runAsync(
      "INSERT INTO weather_daily (role, snapshot_seq, seq, date, min_temp_c, max_temp_c, rain_probability_pct, precipitation_mm, wind_ms, condition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      role,
      seq,
      index,
      textValue(daily.date) ?? "",
      numberValue(daily.minTempC),
      numberValue(daily.maxTempC),
      numberValue(daily.rainProbabilityPct),
      numberValue(daily.precipitationMm),
      numberValue(daily.windMs),
      textValue(daily.condition) ?? "clear",
    );
  }
}

async function migrateLegacyStorage(database: SQLiteDatabase) {
  const migrated = await database.getFirstAsync<TextRow>("SELECT value FROM app_meta WHERE key = ?", schemaVersionKey);
  if (migrated) return;

  const legacyValues = new Map<string, unknown>();
  const hasLegacyTable = await database.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    legacyAppValueTableName,
  );
  if (hasLegacyTable) {
    const rows = await database.getAllAsync<{ key: string; value: string }>(`SELECT key, value FROM ${legacyAppValueTableName}`);
    for (const row of rows) {
      const parsed = parseLegacyValue(row.value);
      if (parsed !== undefined) legacyValues.set(row.key, parsed);
    }
  }

  const fileSystem = await getFileSystem();
  if (fileSystem?.documentDirectory) {
    const documentDirectory = fileSystem.documentDirectory;
    const entries = await Promise.all(
      legacyStorageKeys.map(async (key) => {
        const uri = getLegacyStorageUri(documentDirectory, key);
        try {
          const info = await fileSystem.getInfoAsync(uri);
          if (!info.exists) return null;
          const value = await fileSystem.readAsStringAsync(uri);
          const parsed = parseLegacyValue(value);
          if (parsed === undefined) return null;
          return { key, uri, value: parsed };
        } catch {
          return null;
        }
      }),
    );
    for (const entry of entries) {
      if (!entry) continue;
      if (!legacyValues.has(entry.key)) legacyValues.set(entry.key, entry.value);
    }
    await Promise.all(entries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)).map((entry) =>
      fileSystem.deleteAsync(entry.uri, { idempotent: true })
    ));
  }

  for (const [key, value] of legacyValues) {
    await writeStructuredValue(database, key, value);
  }
  await database.runAsync(
    `INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    schemaVersionKey,
    "complete",
    Date.now(),
  );
}

function parseLegacyValue(value: string): unknown | undefined {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function getLegacyStorageUri(documentDirectory: string, key: string): string {
  const filename = key.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return `${documentDirectory}weatheron/${filename}.json`;
}

async function getFileSystem() {
  try {
    return await import("expo-file-system");
  } catch {
    return null;
  }
}

function placeFromRow(row: PlaceRow | DestinationRow): Record<string, unknown> {
  return {
    id: row.place_id,
    name: row.name,
    address: row.address,
    category: row.category,
    countryCode: row.country_code,
    coordinate: { latitude: row.latitude, longitude: row.longitude },
    timezone: row.timezone,
    provider: row.provider,
  };
}

function alertConditionFromRow(row: DestinationRow | DestinationPreviewRow): Record<string, number> {
  return {
    rainThresholdPct: row.alert_rain_threshold_pct,
    leadTimeMinutes: row.alert_lead_time_minutes,
    windThresholdMs: row.alert_wind_threshold_ms,
  };
}

function travelEstimateFromRow(row: DestinationRow | DestinationPreviewRow): Record<string, unknown> {
  return {
    originPlaceId: row.travel_origin_place_id,
    destinationPlaceId: row.travel_destination_place_id,
    provider: row.travel_provider,
    status: row.travel_status,
    travelMinutes: row.travel_minutes,
    distanceMeters: row.travel_distance_meters,
    message: row.travel_message,
    updatedAt: row.travel_updated_at,
  };
}

function objectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function textValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function boolValue(value: unknown): boolean {
  return value === true;
}

function removeUndefined<T extends Record<string, unknown>>(record: T): T {
  return Object.entries(record).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {}) as T;
}
