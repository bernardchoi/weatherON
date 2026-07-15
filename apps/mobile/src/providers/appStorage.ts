type AppValueRow = { value: string };

const databaseName = "weatheron.db";
const storageTableName = "app_values";
const legacyMigrationKey = "weatheron.storage.sqlite-migration.v1";
const legacyStorageKeys = [
  "weatheron.appState.v1",
  "weatheron.weatherProviderResult.v1",
  "weatheron.specialAlertDelivery.v1",
  "weatheron.notificationState.v1",
] as const;

let databasePromise: Promise<import("expo-sqlite").SQLiteDatabase | null> | null = null;

export async function readAppValue<T>(key: string): Promise<T | null> {
  const webStorage = getWebStorage();
  if (webStorage) return readWebValue<T>(webStorage, key);

  const database = await getDatabase();
  if (!database) return null;

  try {
    const row = await database.getFirstAsync<AppValueRow>(`SELECT value FROM ${storageTableName} WHERE key = ?`, key);
    return row ? (JSON.parse(row.value) as T) : null;
  } catch {
    return null;
  }
}

export async function writeAppValue<T>(key: string, value: T): Promise<void> {
  const normalizedValue = JSON.stringify(value);
  const webStorage = getWebStorage();
  if (webStorage) {
    try {
      webStorage.setItem(key, normalizedValue);
    } catch {
      // 웹 저장소를 쓸 수 없어도 앱 실행은 유지한다.
    }
    return;
  }

  const database = await getDatabase();
  if (!database) return;

  try {
    await database.runAsync(
      `INSERT INTO ${storageTableName} (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      key,
      normalizedValue,
      Date.now(),
    );
  } catch {
    // SQLite 저장 실패는 화면 상태를 막지 않는다.
  }
}

async function getDatabase(): Promise<import("expo-sqlite").SQLiteDatabase | null> {
  databasePromise ??= openDatabase();
  return databasePromise;
}

async function openDatabase(): Promise<import("expo-sqlite").SQLiteDatabase | null> {
  try {
    const { openDatabaseAsync } = await import("expo-sqlite");
    const database = await openDatabaseAsync(databaseName);
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS ${storageTableName} (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
    await migrateLegacyJsonFiles(database);
    return database;
  } catch {
    return null;
  }
}

async function migrateLegacyJsonFiles(database: import("expo-sqlite").SQLiteDatabase) {
  const migrated = await database.getFirstAsync<AppValueRow>(`SELECT value FROM ${storageTableName} WHERE key = ?`, legacyMigrationKey);
  if (migrated) return;

  const fileSystem = await getFileSystem();
  if (!fileSystem?.documentDirectory) {
    await markLegacyMigrationComplete(database);
    return;
  }
  const documentDirectory = fileSystem.documentDirectory;

  const legacyEntries = await Promise.all(
    legacyStorageKeys.map(async (key) => {
      const uri = getLegacyStorageUri(documentDirectory, key);
      try {
        const info = await fileSystem.getInfoAsync(uri);
        if (!info.exists) return null;
        const value = await fileSystem.readAsStringAsync(uri);
        JSON.parse(value);
        return { key, uri, value };
      } catch {
        return null;
      }
    }),
  );
  const entries = legacyEntries.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  await database.withExclusiveTransactionAsync(async (transaction) => {
    for (const entry of entries) {
      await transaction.runAsync(
        `INSERT INTO ${storageTableName} (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO NOTHING`,
        entry.key,
        entry.value,
        Date.now(),
      );
    }
    await transaction.runAsync(
      `INSERT INTO ${storageTableName} (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      legacyMigrationKey,
      "true",
      Date.now(),
    );
  });

  await Promise.all(entries.map((entry) => fileSystem.deleteAsync(entry.uri, { idempotent: true })));
}

async function markLegacyMigrationComplete(database: import("expo-sqlite").SQLiteDatabase) {
  await database.runAsync(
    `INSERT INTO ${storageTableName} (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    legacyMigrationKey,
    "true",
    Date.now(),
  );
}

function readWebValue<T>(storage: Storage, key: string): T | null {
  try {
    const rawValue = storage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
}

function getLegacyStorageUri(documentDirectory: string, key: string): string {
  const filename = key.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return `${documentDirectory}weatheron/${filename}.json`;
}

function getWebStorage(): Storage | null {
  try {
    const webGlobal = globalThis as typeof globalThis & {
      document?: { defaultView?: { localStorage?: Storage } | null };
      window?: { localStorage?: Storage };
    };
    return webGlobal.localStorage ?? webGlobal.window?.localStorage ?? webGlobal.document?.defaultView?.localStorage ?? null;
  } catch {
    return null;
  }
}

async function getFileSystem() {
  try {
    return await import("expo-file-system");
  } catch {
    return null;
  }
}
