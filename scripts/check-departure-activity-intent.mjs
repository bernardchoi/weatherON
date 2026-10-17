import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync("apps/mobile/src/state/departureActivityIntent.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const intent = {};
new Function("exports", compiled)(intent);

const destination = (id, careEnabled = true) => ({ place: { id }, careEnabled });
const savedA = destination("A");
const savedB = destination("B");

const resolveIntent = (savedDestinations, persistedIntentDestinationId, selectedDestinationId) => (
  intent.resolveDepartureActivityIntentDestinationId(savedDestinations, persistedIntentDestinationId, selectedDestinationId)
);
const reconcile = (savedDestinations, intentDestinationId, buildInput) => (
  intent.resolveDepartureActivityReconcileValue({
    smartCareEnabled: true,
    intentDestinationId,
    savedDestinations,
    buildInput,
  })
);
const homeDestination = (smartCareEnabled, savedDestinations, intentDestinationId) => (
  intent.resolveDepartureActivityHomeDestination(smartCareEnabled, intentDestinationId, savedDestinations)
);

// Saved A remains the activity owner while an unsaved B is previewed, cancelled,
// or fails to load. This is also the restart path: selected B is only UI state.
for (const previewResult of ["loading", "cancelled", "failed"]) {
  const activeIntent = resolveIntent([savedA], "A", "B");
  assert.equal(activeIntent, "A", `A must survive B preview ${previewResult}`);
  assert.equal(reconcile([savedA], activeIntent, (item) => `activity:${item.place.id}`), "activity:A");
}

// Saving B transfers ownership, but its loading gap must preserve A rather than
// send a null reconciliation that would end it.
assert.equal(resolveIntent([savedA, savedB], "A", "B"), "A", "selection alone must not transfer ownership");
assert.equal(reconcile([savedA, savedB], "B", () => undefined), undefined, "B loading must preserve the native activity");
assert.equal(reconcile([savedA, savedB], "B", (item) => `activity:${item.place.id}`), "activity:B", "saving B may replace A once input is ready");

// Rapid browsing never changes the persisted owner.
for (const previewId of ["B", "C", "B", "A", "C"]) {
  assert.equal(resolveIntent([savedA], "A", previewId), "A", `rapid preview ${previewId} must not alter A`);
}
assert.equal(homeDestination(true, [savedA, savedB], "A").place.id, "A", "Home follows the committed Activity owner, not the preview");
assert.equal(homeDestination(false, [savedA], "A"), null, "Home falls back when Smart Care is disabled");
assert.equal(homeDestination(true, [destination("A", false)], "A"), null, "care-off removes the Home Activity owner");

// Explicit care-off (or a now-past trip) is a real end signal.
assert.equal(reconcile([destination("A", false)], "A", () => "unreachable"), null, "care-off must end A");
assert.equal(reconcile([savedA], "A", () => null), null, "a completed/past A trip must end A");

console.log("Departure Activity intent: preview preservation, save replacement, restart, rapid browsing and care-off passed");
