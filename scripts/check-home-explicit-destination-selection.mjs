import assert from "node:assert/strict";
import fs from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const intentSource = stripTypeScriptTypes(fs.readFileSync("apps/mobile/src/state/departureActivityIntent.ts", "utf8"))
  .replace(/^import[^;]+;\n/gmu, "")
  .replace(/^export /gmu, "");
const { resolveDepartureActivityIntentDestinationId, resolveDepartureActivityHomeDestination, resolveDepartureActivityReconcileValue } = new Function(`${intentSource}\nreturn { resolveDepartureActivityIntentDestinationId, resolveDepartureActivityHomeDestination, resolveDepartureActivityReconcileValue };`)();
const saved = [
  { place: { id: "old" }, careEnabled: true },
  { place: { id: "chosen" }, careEnabled: true },
  { place: { id: "preview" }, careEnabled: true },
];
assert.equal(resolveDepartureActivityHomeDestination(true, "old", saved).place.id, "old", "search preview keeps the existing Home owner");
assert.equal(resolveDepartureActivityIntentDestinationId(saved, "chosen", "preview"), "chosen", "a persisted explicit Home choice survives restart even when the editor previews another destination");
assert.equal(resolveDepartureActivityIntentDestinationId(saved, null, "chosen"), "chosen", "rapid repeated Home choices resolve to the latest saved id");
const careOff = [{ place: { id: "off" }, careEnabled: false }];
assert.equal(resolveDepartureActivityReconcileValue({ smartCareEnabled: true, intentDestinationId: "off", savedDestinations: careOff, buildInput: () => ({}) }), null, "care-off selection cannot create an automatic activity");
assert.equal(resolveDepartureActivityReconcileValue({ smartCareEnabled: true, intentDestinationId: "chosen", savedDestinations: saved, buildInput: () => undefined }), undefined, "missing time/origin data never creates an automatic activity");

const stateSource = fs.readFileSync("apps/mobile/src/state/useWeatherOnAppState.ts", "utf8");
const homeSource = fs.readFileSync("apps/mobile/src/screens/HomeScreen.tsx", "utf8");
const navigatorSource = fs.readFileSync("apps/mobile/src/navigation/AppNavigator.tsx", "utf8");
const liveActivitySource = fs.readFileSync("apps/mobile/src/providers/departureLiveActivity.ios.ts", "utf8");
assert.match(stateSource, /const selectDestinationPlace[\s\S]*?setUseDestinationWeather\(false\);[\s\S]*?\}, \[\]\);/, "editor/search selection stays preview-only");
assert.match(stateSource, /const selectHomeDestinationPlace[\s\S]*?departureActivitySyncRevisionRef\.current \+= 1;[\s\S]*?setDepartureActivityIntentDestinationId\(savedDestination\.careEnabled \? savedDestination\.place\.id : null\);[\s\S]*?setCommittedDepartureDestinationId\(savedDestination\.careEnabled \? savedDestination\.place\.id : null\);[\s\S]*?setDepartureActivityReplacementDestinationId\(savedDestination\.careEnabled \? savedDestination\.place\.id : null\);/, "explicit Home selection invalidates an older response, commits its owner, and requests one replacement");
assert.match(stateSource, /const homeDepartureDestination = useMemo\(\(\) => \{\s*return resolveDepartureActivityHomeDestination\([\s\S]*?\);\s*\}, \[committedDepartureDestinationId, savedDestinations, smartCareEnabled\]\);/, "Home values follow the committed owner rather than a stale native destination");
assert.match(stateSource, /replaceExistingActivity: departureActivityReplacementDestinationId === destination\.place\.id/, "only an explicit Home pick can replace an existing Activity");
assert.match(liveActivitySource, /status\.destinationId !== input\.destinationId &&\s*!input\.replaceExistingActivity/, "iOS keeps preview protection but permits the explicit Home replacement");
assert.match(stateSource, /if \(!targetTimeIso \|\| !placeSearchOrigin\) return undefined;/, "missing a valid time/origin blocks automatic activity creation");
assert.match(homeSource, /onSelect=\{onSelectHomeDestinationPlace\}/);
assert.match(navigatorSource, /onSelectHomeDestinationPlace: appState\.selectHomeDestinationPlace/);
console.log("PASS Home selection: explicit Home picks commit and persist the latest saved trip; editor preview/cancel remains owner-preserving.");
