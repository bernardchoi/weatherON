export async function readAppValue<T>(key: string): Promise<T | null> {
  const storage = getWebStorage();
  if (!storage) return null;
  try {
    const rawValue = storage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
}

export async function writeAppValue<T>(key: string, value: T): Promise<void> {
  const storage = getWebStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
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
