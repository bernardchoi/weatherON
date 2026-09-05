export async function readAppValue<T>(key: string, throwOnError = false): Promise<T | null> {
  const storage = getWebStorage();
  if (!storage) {
    if (throwOnError) throw new Error("저장소에 접근할 수 없어요.");
    return null;
  }
  try {
    const rawValue = storage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch (error) {
    if (throwOnError) throw error;
    return null;
  }
}

export async function writeAppValue<T>(key: string, value: T, throwOnError = false): Promise<void> {
  const storage = getWebStorage();
  if (!storage) {
    if (throwOnError) throw new Error("저장소에 접근할 수 없어요.");
    return;
  }
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (throwOnError) throw error;
    // 웹 저장소를 쓸 수 없어도 앱 실행은 유지한다.
  }
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
