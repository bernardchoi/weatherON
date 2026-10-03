import type { LocalNotificationSyncResult } from "./localNotifications";

// Native operations cannot be cancelled once started. Reconcile newer intent
// after the in-flight operation, and acknowledge only a verified latest result.
export function createNotificationSync<Input extends { enabled: boolean }>(
  sync: (input: Input) => Promise<LocalNotificationSyncResult>,
  timers = { setTimeout, clearTimeout },
) {
  let latest: { key: string; input: Input; onResult: (result: LocalNotificationSyncResult) => void; revision: number } | null = null;
  let revision = 0;
  let running = false;
  let successfulKey: string | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let retries = 0;

  function clearRetry() {
    if (retryTimer !== undefined) timers.clearTimeout(retryTimer);
    retryTimer = undefined;
  }

  async function run() {
    if (running || !latest || latest.key === successfulKey) return;
    running = true;
    try {
      while (latest && latest.key !== successfulKey) {
        const request = latest;
        // An obsolete request may change OS state even when it later fails.
        successfulKey = null;
        let result: LocalNotificationSyncResult;
        try {
          result = await sync(request.input);
        } catch {
          result = { status: "verification-failed", scheduledCount: 0 };
        }
        if (!latest || request.revision !== latest.revision) continue;
        const succeeded = request.input.enabled
          ? result.status === "scheduled"
          : result.status === "cancelled" && result.scheduledCount === 0;
        if (succeeded) {
          successfulKey = request.key;
          retries = 0;
        }
        latest.onResult(result);
        if (!succeeded && retries < 3) {
          const delay = 5_000 * 2 ** retries++;
          retryTimer = timers.setTimeout(() => {
            retryTimer = undefined;
            void run();
          }, delay);
        }
        break;
      }
    } finally {
      running = false;
    }
  }

  return {
    request(key: string, input: Input, onResult: (result: LocalNotificationSyncResult) => void) {
      if (latest?.key !== key) {
        clearRetry();
        retries = 0;
        latest = { key, input, onResult, revision: ++revision };
      } else {
        latest = { ...latest, input, onResult };
      }
      if (retryTimer === undefined) void run();
    },
    retry() {
      clearRetry();
      successfulKey = null;
      retries = 0;
      if (latest) latest = { ...latest, revision: ++revision };
      void run();
    },
    stop() {
      clearRetry();
      latest = null;
      successfulKey = null;
      ++revision;
    },
  };
}
