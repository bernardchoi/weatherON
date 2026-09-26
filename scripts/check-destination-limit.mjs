import assert from "node:assert/strict";
import { build } from "esbuild";

const source = "apps/mobile/src/state/destinationLimit.ts";
const result = await build({ bundle: true, entryPoints: [source], format: "cjs", platform: "node", write: false });
const module = { exports: {} };
new Function("module", "exports", result.outputFiles[0].text)(module, module.exports);
const { canSaveDestination, maxSavedDestinations } = module.exports;
const destinations = Array.from({ length: maxSavedDestinations }, (_, index) => ({ place: { id: String(index) } }));
const save = (current, id) => canSaveDestination(current, id) && !current.some((destination) => destination.place.id === id)
  ? [{ place: { id } }, ...current]
  : current;

assert.equal(save([], "0").length, 1);
assert.equal(canSaveDestination(destinations.slice(0, 2), "2"), true);
assert.equal(canSaveDestination(destinations, "3"), false);
assert.equal(canSaveDestination(destinations, "1"), true);
assert.equal(canSaveDestination(destinations.filter((destination) => destination.place.id !== "1"), "3"), true);
assert.equal(canSaveDestination(destinations.map((destination) => destination.place.id === "1" ? { place: { id: "3" } } : destination), "1"), false);
assert.equal(canSaveDestination([...destinations, { place: { id: "legacy" } }], "legacy"), true);
assert.equal(canSaveDestination([...destinations, { place: { id: "legacy" } }], "new"), false);
assert.equal(["0", "1", "2", "3"].reduce(save, []).length, maxSavedDestinations);
console.log("destination limit check passed");
