import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function load(path, requireModule = (name) => { throw new Error(`Unexpected import: ${name}`); }) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("exports", "require", source)(exports, requireModule);
  return exports;
}

const uri = load("apps/mobile/src/utils/wardrobePhotoUri.ts");
const oldPhoto = "file:///var/mobile/Containers/Data/Application/OLD/Documents/wardrobe-photos/photo-abc-123.jpg";
const documentUri = "file:///var/mobile/Containers/Data/Application/NEW/Documents/";
const storedPhoto = "wardrobe-photos/photo-abc-123.jpg";
assert.equal(uri.toStoredWardrobePhotoUri(oldPhoto), storedPhoto);
assert.equal(uri.resolveWardrobePhotoUri(oldPhoto, documentUri), documentUri + storedPhoto);
assert.equal(uri.resolveWardrobePhotoUri(storedPhoto, documentUri), documentUri + storedPhoto);
assert.equal(uri.resolveWardrobePhotoUri(storedPhoto, documentUri.slice(0, -1)), documentUri + storedPhoto);
assert.equal(uri.toStoredWardrobePhotoUri("file:///data/user/0/com.weatheron.mobile/files/" + storedPhoto), storedPhoto);
for (const other of [
  "assets/outfits/preset.png", "https://example.com/" + storedPhoto,
  "file:///cache/photo-abc-123.jpg", "content://media/123", "blob:preview",
  "wardrobe-photos/../private.jpg", "wardrobe-photos/photo-%2e%2e%2fprivate.jpg",
]) {
  assert.equal(uri.toStoredWardrobePhotoUri(other), other);
  assert.equal(uri.resolveWardrobePhotoUri(other, documentUri), other);
}

const platform = { OS: "ios" };
const { getOutfitImageSource } = load("apps/mobile/src/assets.ts", (name) => {
  if (name === "react-native") return { Platform: platform };
  if (name === "./utils/wardrobePhotoUri") return uri;
  if (name === "expo-file-system") return { Paths: { get document() {
    assert.notEqual(platform.OS, "web", "web must not access the native document directory");
    return { uri: documentUri };
  } } };
  if (name.startsWith("../../../assets/")) return 1;
  throw new Error(`Unexpected import: ${name}`);
});
assert.deepEqual(getOutfitImageSource(oldPhoto), { uri: documentUri + storedPhoto });
assert.deepEqual(getOutfitImageSource(storedPhoto), { uri: documentUri + storedPhoto });
platform.OS = "web";
assert.deepEqual(getOutfitImageSource("blob:preview"), { uri: "blob:preview" });

const persistedSource = ts.createSourceFile("persisted.ts", readFileSync("apps/mobile/src/state/persistedAppState.ts", "utf8"), ts.ScriptTarget.Latest, true);
const normalizeSource = persistedSource.statements.filter((node) => ts.isFunctionDeclaration(node) &&
  ["normalizePhotoWardrobeItem", "filterWardrobeValues"].includes(node.name?.text)).map((node) => node.getText(persistedSource)).join("\n");
const normalizePhoto = new Function("toStoredWardrobePhotoUri", ts.transpileModule(normalizeSource, {}).outputText + "\nreturn normalizePhotoWardrobeItem;")(uri.toStoredWardrobePhotoUri);
const photo = { id: "photo-abc", source: "photo", name: "내 옷", category: "top", seasons: ["summer"], purposes: ["daily"], weatherTags: ["dry"], imageUrl: oldPhoto, photoDigest: "a".repeat(64), photoPolicyVersion: "wardrobe-photo-ios-1" };
const savedPhoto = normalizePhoto(photo);
assert.equal(savedPhoto.imageUrl, storedPhoto, "persisted legacy paths must migrate to relative paths");
assert.equal(savedPhoto.photoDigest, photo.photoDigest);
assert.equal(savedPhoto.photoPolicyVersion, photo.photoPolicyVersion);
assert.deepEqual(normalizePhoto(JSON.parse(JSON.stringify(savedPhoto))), savedPhoto, "relaunch must preserve the photo reference");

// Execute the actual app callbacks/effect with a deterministic clock and state setters.
const stateSource = ts.createSourceFile("state.ts", readFileSync("apps/mobile/src/state/useWeatherOnAppState.ts", "utf8"), ts.ScriptTarget.Latest, true);
const callbacks = {};
let undoEffect;
function visit(node) {
  if (ts.isVariableDeclaration(node) && ["removeWardrobeItem", "restoreRemovedWardrobeItem", "setWardrobeItemOwned"].includes(node.name.getText(stateSource))) {
    callbacks[node.name.getText(stateSource)] = node.initializer.arguments[0].getText(stateSource);
  }
  if (ts.isCallExpression(node) && node.expression.getText(stateSource) === "useEffect" &&
    node.arguments[1]?.getText(stateSource).includes("recentlyRemovedWardrobeItemId")) {
    undoEffect = node.arguments[0].getText(stateSource);
  }
  ts.forEachChild(node, visit);
}
visit(stateSource);
assert.ok(undoEffect, "wardrobe undo must expire and clear when leaving the screen");
let owned = ["photo-a", "photo-b"];
let removed = null;
let route = "C2";
const timers = new Map();
let timerId = 0;
const setRemoved = (value) => { removed = value; };
function execute(callback, ...args) {
  const source = ts.transpileModule(`const callback = ${callback};`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return new Function("recentlyRemovedWardrobeItemId", "wardrobeOwnedItemIds", "route", "setRecentlyRemovedWardrobeItemId", "setWardrobeOwnedItemIds", "setTimeout", "clearTimeout", `${source}\nreturn callback;`)(
    removed, owned, route, setRemoved, (update) => { owned = update(owned); },
    (callback, delay) => { assert.equal(delay, 5000); timers.set(++timerId, callback); return timerId; },
    (id) => timers.delete(id),
  )(...args);
}
execute(callbacks.removeWardrobeItem, "photo-a");
assert.deepEqual(owned, ["photo-b"]);
const cleanupA = execute(undoEffect);
execute(callbacks.restoreRemovedWardrobeItem);
assert.deepEqual(owned, ["photo-a", "photo-b"]);
assert.equal(removed, null);
cleanupA();
assert.equal(timers.size, 0);

execute(callbacks.removeWardrobeItem, "photo-a");
const cleanupOld = execute(undoEffect);
execute(callbacks.removeWardrobeItem, "photo-b");
cleanupOld();
const cleanupNew = execute(undoEffect);
assert.equal(timers.size, 1, "rapid deletion must cancel the older undo timeout");
timers.values().next().value();
assert.equal(removed, null);
assert.deepEqual(owned, [], "expiry must not restore deleted items");
cleanupNew();

execute(callbacks.removeWardrobeItem, "photo-a");
route = "C1";
execute(undoEffect);
assert.equal(removed, null);
route = "C2";
execute(callbacks.removeWardrobeItem, "photo-a");
execute(callbacks.setWardrobeItemOwned, "photo-a", true);
execute(undoEffect);
assert.equal(removed, null, "re-adding an item must dismiss undo");
console.log("Wardrobe photo paths, rendering, deletion, restore and undo expiry checks passed.");
