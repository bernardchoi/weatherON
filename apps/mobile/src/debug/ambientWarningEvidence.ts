import { File, Paths } from "expo-file-system";

// Development diagnosis only. Preserve warning delivery; record known static categories,
// never formatted arguments, error objects, URLs, user records or authentication values.
if (__DEV__) {
  const originalWarn = console.warn;
  const counts: Record<string, number> = {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  const classify = (value: unknown): string => {
    if (typeof value !== "string") return "non-string-format";
    if (value.startsWith("App Attest enrollment deferred")) return "existing-app-attest-enrollment";
    if (value.startsWith("App Attest unsupported on this device")) return "existing-app-attest-unsupported";
    if (value.startsWith("App Attest assertion unavailable")) return "existing-app-attest-assertion";
    if (/Require cycle/.test(value)) return "require-cycle";
    if (/deprecated|no longer supported/.test(value)) return "deprecated-api";
    if (/ViewManager|view manager|requireNativeComponent|View config/.test(value)) return "native-view-registration";
    if (/NativeEventEmitter/.test(value)) return "native-event-emitter";
    if (/measure.*(view|tag)/.test(value)) return "native-measurement";
    if (/VirtualizedList/.test(value)) return "virtualized-list";
    return "unclassified-format";
  };
  console.warn = (...args: unknown[]) => {
    originalWarn(...args);
    const category = classify(args[0]);
    counts[category] = Math.min(999, (counts[category] ?? 0) + 1);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        new File(Paths.cache, "ambient-home-warning-debug-20261009.json").write(JSON.stringify({ categories: counts, warningDeliveryPreserved: true }));
      } catch { /* Evidence cannot interfere with launch. */ }
    }, 500);
  };
}
