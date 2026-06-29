const storageDirectoryName = "weatheron";

export async function readAppJson<T>(key: string): Promise<T | null> {
  const webStorage = getWebStorage();
  if (webStorage) {
    try {
      const rawValue = webStorage.getItem(key);
      return rawValue ? (JSON.parse(rawValue) as T) : null;
    } catch {
      return null;
    }
  }

  const fileSystem = await getFileSystem();
  if (!fileSystem?.documentDirectory) return null;

  try {
    const uri = getStorageUri(fileSystem.documentDirectory, key);
    const info = await fileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    return JSON.parse(await fileSystem.readAsStringAsync(uri)) as T;
  } catch {
    return null;
  }
}

export async function writeAppJson<T>(key: string, value: T): Promise<void> {
  const normalizedValue = JSON.stringify(value);
  const webStorage = getWebStorage();
  if (webStorage) {
    try {
      webStorage.setItem(key, normalizedValue);
    } catch {
      // Persistence is best-effort. The app should keep working without local storage.
    }
    return;
  }

  const fileSystem = await getFileSystem();
  if (!fileSystem?.documentDirectory) return;

  try {
    const directory = `${fileSystem.documentDirectory}${storageDirectoryName}/`;
    await fileSystem.makeDirectoryAsync(directory, { intermediates: true });
    await fileSystem.writeAsStringAsync(getStorageUri(fileSystem.documentDirectory, key), normalizedValue);
  } catch {
    // Persistence is best-effort. The app should keep working without local storage.
  }
}

function getStorageUri(documentDirectory: string, key: string): string {
  const filename = key.replace(/[^a-zA-Z0-9_.-]/g, "_");
  return `${documentDirectory}${storageDirectoryName}/${filename}.json`;
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
