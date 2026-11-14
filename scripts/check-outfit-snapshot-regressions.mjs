import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";
import { build } from "esbuild";

const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
function load(path, imports = {}) {
  const exports = {};
  new Function("exports", "require", compile(readFileSync(path, "utf8")))(exports, name => {
    assert.ok(name in imports, `Unexpected import ${name}`); return imports[name];
  });
  return exports;
}
const photoUri = load("apps/mobile/src/utils/wardrobePhotoUri.ts");
const snapshots = load("apps/mobile/src/utils/savedOutfit.ts", { "./wardrobePhotoUri": photoUri });
const { createSavedOutfitSnapshot, normalizeSavedOutfitSnapshot, isCurrentOutfitSaved, getSavedOutfitPhotoUris, getUnusedOutfitPhotoUris } = snapshots;
const weather = { locationId: "seoul", locationName: "서울", observedAt: "2026-11-05T01:00:00Z", timezone: "Asia/Seoul" };
const item = { id: "shirt", source: "preset", category: "top", name: "셔츠", seasons: ["fall"], purposes: ["daily"], weatherTags: ["dry"], imageUrl: "shirt.png", owned: true };
const outfit = { id: "outfit-seoul-v1", weatherSnapshotId: "seoul", items: { top: item }, preparation: { ownedItemCount: 1, totalItemCount: 1, missingItemNames: [], rainProtectionGaps: [] }, decisionText: "셔츠를 준비해요", reasons: ["맑음"], timeAdvice: [{ time: "12:00", text: "셔츠" }], variant: "default", ruleVersion: "v1" };
const snapshot = createSavedOutfitSnapshot(outfit, weather, "2026-11-05T01:01:00Z");
assert.ok(snapshot);
assert.equal(isCurrentOutfitSaved(snapshot, outfit, weather), true);
assert.notEqual(snapshot.outfit.items.top, outfit.items.top);
assert.notEqual(snapshot.outfit.items.top.seasons, item.seasons);
assert.equal(isCurrentOutfitSaved(snapshot, { ...outfit, items: { top: { ...item, id: "other-shirt" } } }, weather), false, "same recommendation ID does not identify a changed outfit");
assert.equal(isCurrentOutfitSaved(snapshot, outfit, { ...weather, locationId: "busan" }), false);
assert.equal(isCurrentOutfitSaved(snapshot, outfit, { ...weather, observedAt: "2026-11-05T02:00:00Z" }), false);
assert.equal(isCurrentOutfitSaved(snapshot, { ...outfit, variant: "rain" }, weather), false);
for (const value of [true, { outfitSaved: true }, {}, { ...snapshot, schemaVersion: 2 }, { ...snapshot, savedAt: "bad" }, { ...snapshot, outfit: { ...outfit, items: {} } }, { ...snapshot, outfit: { ...outfit, preparation: { ...outfit.preparation, totalItemCount: 99 } } }]) {
  assert.equal(normalizeSavedOutfitSnapshot(value), null);
}
const photo = createSavedOutfitSnapshot({ ...outfit, items: { top: { ...item, source: "photo", imageUrl: "file:///old-container/wardrobe-photos/photo-shirt.jpg" } } }, weather);
assert.equal(photo.outfit.items.top.imageUrl, "wardrobe-photos/photo-shirt.jpg");
assert.equal(isCurrentOutfitSaved(photo, { ...outfit, items: { top: { ...item, source: "photo", imageUrl: "file:///new-container/wardrobe-photos/photo-shirt.jpg" } } }, weather), true);

// Bundle actual normalization with only OS/storage boundaries replaced.
const bundle = await build({ entryPoints: ["apps/mobile/src/state/persistedAppState.ts"], bundle: true, platform: "node", format: "cjs", write: false,
  plugins: [{ name: "platform-boundaries", setup(b) {
    b.onResolve({ filter: /localization\/react-native$/ }, () => ({ path: "platform", namespace: "test" }));
    b.onResolve({ filter: /providers\/appStorage$/ }, () => ({ path: "storage", namespace: "test" }));
    b.onLoad({ filter: /.*/, namespace: "test" }, ({ path }) => ({ contents: path === "platform" ? 'export const Platform = { OS: "ios" };' : 'export const readAppValue = async () => null; export const writeAppValue = async () => {};' }));
  } }],
});
const module = { exports: {} }; new Function("exports", "module", bundle.outputFiles[0].text)(module.exports, module);
const normalize = module.exports.normalizePersistedAppState;
assert.equal(normalize({ outfitSaved: true }).savedOutfitSnapshot, null, "legacy booleans cannot manufacture a snapshot");
const db = new DatabaseSync(":memory:");
let failWrite = false;
const sqlite = {
  execAsync: async sql => db.exec(sql),
  getFirstAsync: async (sql, ...args) => db.prepare(sql).get(...args) ?? null,
  getAllAsync: async (sql, ...args) => db.prepare(sql).all(...args),
  runAsync: async (sql, ...args) => { if (failWrite) throw new Error("disk full"); return db.prepare(sql).run(...args); },
  withTransactionAsync: async fn => { db.exec("BEGIN"); try { await fn(); db.exec("COMMIT"); } catch (e) { db.exec("ROLLBACK"); throw e; } },
};
const storage = load("apps/mobile/src/providers/appStorage.ts", {
  "../state/profileCharacter": load("apps/mobile/src/state/profileCharacter.ts"),
  "../localization/react-native": { Platform: { OS: "ios" } },
  "expo-sqlite": { openDatabaseAsync: async () => sqlite },
  "expo-file-system/legacy": { documentDirectory: "file:///test/", getInfoAsync: async () => ({ exists: false }) },
});
const key = "weatheron.appState.v1";
await storage.writeAppValue(key, normalize({ savedOutfitSnapshot: snapshot }), true);
assert.deepEqual(normalize(await storage.readAppValue(key, true)).savedOutfitSnapshot, snapshot, "native SQLite round-trip preserves the full snapshot");
failWrite = true;
await assert.rejects(storage.writeAppValue(key, normalize({ savedOutfitSnapshot: photo }), true), /disk full/);
failWrite = false;
assert.deepEqual(normalize(await storage.readAppValue(key, true)).savedOutfitSnapshot, snapshot, "failed transaction preserves previous save");
const values = new Map();
const oldStorage = globalThis.localStorage;
globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
try {
  const web = load("apps/mobile/src/providers/appStorage.web.ts");
  await web.writeAppValue(key, normalize({ savedOutfitSnapshot: snapshot }), true);
  assert.deepEqual(normalize(await load("apps/mobile/src/providers/appStorage.web.ts").readAppValue(key, true)).savedOutfitSnapshot, snapshot, "web module restart restores snapshot");
} finally { if (oldStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = oldStorage; }

const hookPath = "apps/mobile/src/state/useWeatherOnAppState.ts";
const hook = readFileSync(hookPath, "utf8");
const ast = ts.createSourceFile(hookPath, hook, ts.ScriptTarget.Latest, true);
function callback(name, bindings) {
  let found;
  function visit(node) { if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) found = node.initializer; ts.forEachChild(node, visit); }
  visit(ast); assert.ok(found, name);
  if (ts.isCallExpression(found)) found = found.arguments[0];
  return new Function(...Object.keys(bindings), compile(`const run = ${found.getText(ast)};`) + "\nreturn run;")(...Object.values(bindings));
}
function deferred() { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; }
const noop = () => {};
function saveHarness() {
  const write = deferred(); const events = [];
  const bindings = { getUnusedOutfitPhotoUris, removePersistedWardrobePhotos: uris => events.push(["removed", uris]), appStateHydrated: true, accountSessionReadyRef: { current: true }, accountCleanupPendingRef: { current: false }, accountDataClearingRef: { current: false }, accountDeletionCompletedRef: { current: false }, outfitSaveInFlightRef: { current: null }, photoSaveInFlightRef: { current: null }, accountSessionRevisionRef: { current: 0 }, persistedStateRef: { current: normalize({}) },
    savePersistedAppState: value => { events.push(["write", value]); return write.promise; },
    setOutfitSavePending: value => events.push(["pending", value]), setOutfitSaveMessage: value => events.push(["message", value]), setAccountAuthMessage: noop,
    setSavedOutfitSnapshot: value => events.push(["saved", value]),
  };
  return { bindings, events, write, save: callback("saveOutfitSnapshot", bindings) };
}
for (const outcome of ["success", "failure", "logout"]) {
  const h = saveHarness(); const result = h.save(snapshot);
  assert.equal(h.events.some(([type]) => type === "saved"), false, "no saved UI before durable commit");
  assert.equal(await h.save(snapshot), false, "duplicate click does not enqueue a second transaction");
  assert.equal(h.events.filter(([type]) => type === "write").length, 1);
  if (outcome === "failure") h.write.reject(new Error("disk full"));
  else { if (outcome === "logout") h.bindings.accountSessionRevisionRef.current++; h.write.resolve(); }
  assert.equal(await result, outcome === "success");
  assert.equal(h.events.some(([type]) => type === "saved"), outcome === "success");
  assert.equal(h.bindings.outfitSaveInFlightRef.current, null);
}

// Capture the original content before account navigation, not after login/weather refresh.
let gate;
const guestBindings = { accountAuthStatus: "ready", state: { outfit, weather }, accountLinked: false, termsRequiredAccepted: false, createSavedOutfitSnapshot, setOutfitSaveMessage: noop,
  startAccountGate: (reason, returnTo, selectedDestinationName, outfitSnapshot) => { gate = { reason, returnTo, outfitSnapshot }; }, selectedDestinationPlace: { name: "서울" },
};
await callback("requestAccountGate", guestBindings)("save-outfit", "C4");
const captured = gate.outfitSnapshot;
guestBindings.state.outfit = { ...outfit, items: { top: { ...item, id: "new-shirt" } } };
let actuallySaved;
const complete = callback("completeAccountAction", { saveOutfitSnapshot: async value => { actuallySaved = value; return true; }, setAccountGateResult: noop, createAccountGateResult: (reason, returnTo) => ({ reason, returnTo }) });
assert.equal(await complete(gate), true);
assert.equal(actuallySaved, captured);
assert.equal(actuallySaved.outfit.items.top.id, "shirt");
assert.equal(isCurrentOutfitSaved(actuallySaved, guestBindings.state.outfit, weather), false);
let successResult = false;
const direct = callback("requestAccountGate", { ...guestBindings, accountLinked: true, termsRequiredAccepted: true, saveOutfitSnapshot: async () => false, setAccountGateResult: () => { successResult = true; }, createAccountGateResult: noop });
await direct("save-outfit", "C4");
assert.equal(successResult, false, "failed save cannot emit a completion result");
assert.doesNotMatch(hook, /setOutfitSaved\(/, "every save path must use a snapshot, never a boolean");
console.log("Outfit snapshot regressions passed: content identity, capture-before-login, immutable data, native/web restore, corruption/legacy migration, durable commit, duplicate/failure/logout protection.");

// Replacing a wardrobe photo must retain the old file while a saved outfit uses it.
for (const retain of [false, true]) {
  const oldPhoto = { ...item, source: "photo", imageUrl: "file:///old-container/wardrobe-photos/photo-shirt.jpg" };
  const changedPhoto = { ...oldPhoto, imageUrl: "wardrobe-photos/photo-new.jpg" };
  const removed = [];
  const context = { appStateHydrated: true, accountSessionReadyRef: { current: true }, accountCleanupPendingRef: { current: false }, accountDataClearingRef: { current: false }, accountDeletionCompletedRef: { current: false }, photoSaveInFlightRef: { current: null }, outfitSaveInFlightRef: { current: null },
    persistedStateRef: { current: { photoWardrobeItems: [oldPhoto], wardrobeOwnedItemIds: [oldPhoto.id], savedOutfitSnapshot: retain ? photo : null } },
    Platform: { OS: "ios" }, consumePersistedWardrobePhotoApproval: () => true, savePersistedAppState: async () => {},
    getSavedOutfitPhotoUris, toStoredWardrobePhotoUri: photoUri.toStoredWardrobePhotoUri, removePersistedWardrobePhotos: uris => removed.push(...uris),
    setPhotoWardrobeItems: noop, setWardrobeOwnedItemIds: noop, setSelectedWardrobeItemId: noop, setRecentlyRemovedWardrobeItemId: noop, setRoute: noop,
  };
  await callback("savePhotoWardrobeItem", context)(changedPhoto);
  assert.deepEqual(removed, retain ? [] : [oldPhoto.imageUrl]);
}
assert.deepEqual(getUnusedOutfitPhotoUris(photo, snapshot, []), ["wardrobe-photos/photo-shirt.jpg"]);
assert.deepEqual(getUnusedOutfitPhotoUris(photo, snapshot, [{ ...item, imageUrl: "file:///new-container/wardrobe-photos/photo-shirt.jpg" }]), []);
assert.deepEqual(getUnusedOutfitPhotoUris(photo, photo, []), []);
assert.doesNotMatch(readFileSync("apps/mobile/src/components/WardrobePhotoRegistration.tsx", "utf8"), /removePersistedWardrobePhotos/, "component cannot delete an image behind the saved snapshot owner's back");
console.log("Outfit photo retention passed: keep snapshot references, release unused files after replacement, preserve current wardrobe files.");

// Execute the retrieval component's real render and interaction handlers. Native
// sheet animation, image rendering and hooks are boundaries, not a simulator run.
function previewHarness() {
  const h = { slots: [], cursor: 0, effects: [], active: true, fontScale: 1 };
  const react = {
    Fragment: "Fragment",
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    useContext: () => ({ active: h.active }),
    useState(initial) {
      const index = h.cursor++;
      if (!(index in h.slots)) h.slots[index] = initial;
      return [h.slots[index], value => { h.slots[index] = value; }];
    },
    useEffect(effect, deps) {
      const index = h.cursor++;
      if (!h.slots[index] || deps.some((value, i) => value !== h.slots[index][i])) {
        h.slots[index] = deps;
        h.effects.push(effect);
      }
    },
  };
  const { SavedOutfitPreview } = load("apps/mobile/src/components/SavedOutfitPreview.tsx", {
    react,
    "../localization/react-native": { Image: "Image", RawText: "RawText", Text: "Text", View: "View", StyleSheet: { create: value => value, hairlineWidth: 1 }, useWindowDimensions: () => ({ fontScale: h.fontScale }) },
    "../assets": { getOutfitImageSource: uri => ({ uri }), uiIconAssets: { shirt: "shirt" } },
    "../localization/localization": { formatDisplayDate: value => value },
    "../theme/AppThemeContext": { useAppTheme: () => ({}) },
    "../theme/pageStyles": { pageStyles: {} },
    "../theme/tokens": { radius: { md: 12 }, spacing: { xs: 4, sm: 8, md: 12 }, semanticColor: () => "background" },
    "../utils/outfitLabels": { getOutfitSlotLabel: slot => slot },
    "./AmbientReveal": { AmbientMotionContext: {} },
    "./AppButton": { AppButton: "AppButton" },
    "./BottomSheet": { BottomSheet: "BottomSheet" },
  });
  h.render = snapshot => {
    h.cursor = 0; h.effects = [];
    h.tree = SavedOutfitPreview({ snapshot });
    h.effects.forEach(effect => effect());
    return h.tree;
  };
  return h;
}
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return tree && typeof tree === "object" ? [tree, ...nodes(tree.children)] : [];
}
const button = (h, label) => nodes(h.tree).find(node => node.type === "AppButton" && node.props.label === label);
const sheet = h => nodes(h.tree).find(node => node.type === "BottomSheet");
const restored = normalize(await storage.readAppValue(key, true)).savedOutfitSnapshot;
const preview = previewHarness();
preview.render(restored);
assert.equal(sheet(preview).props.visible, false);
button(preview, "저장한 코디 보기").props.onPress();
button(preview, "저장한 코디 보기").props.onPress();
preview.render(restored);
assert.equal(sheet(preview).props.visible, true, "repeated open is idempotent");
assert.equal(sheet(preview).props.accessibilityLabel, "저장한 코디");
let shown = JSON.stringify(sheet(preview));
for (const original of ["셔츠", "서울", snapshot.savedAt, "셔츠를 준비해요", "저장 당시 보유"]) assert.ok(shown.includes(original));
assert.equal(shown.includes("new-shirt"), false, "retrieval uses restored content, not the changed live recommendation");
assert.ok(nodes(sheet(preview)).some(node => node.type === "Image" && node.props.source.uri === "shirt.png"));
for (const close of [() => button(preview, "닫기").props.onPress(), () => sheet(preview).props.onClose()]) {
  close(); preview.render(restored);
  assert.equal(sheet(preview).props.visible, false, "Close and sheet dismissal both close the preview");
  button(preview, "저장한 코디 보기").props.onPress(); preview.render(restored);
  assert.equal(sheet(preview).props.visible, true, "reopening restores the same saved content");
}
preview.active = false; preview.render(restored);
assert.equal(sheet(preview).props.visible, false, "a retained background route cannot keep a modal open");
preview.active = true; preview.render(restored);
assert.equal(sheet(preview).props.visible, false, "returning to C4 does not reopen an old sheet");
preview.fontScale = 2;
preview.render(photo);
button(preview, "저장한 코디 보기").props.onPress(); preview.render(photo);
assert.ok(nodes(sheet(preview)).some(node => node.type === "Image" && node.props.source.uri === "wardrobe-photos/photo-shirt.jpg"), "saved photo references are handed to the app image resolver");
assert.ok(nodes(sheet(preview)).some(node => node.type === "View" && node.props.style?.some?.(style => style?.flexDirection === "column")), "large text gets a stacked item layout");
assert.equal(nodes(sheet(preview)).some(node => node.props.numberOfLines), false, "saved names and historical copy are not truncated");
const restarted = previewHarness(); restarted.render(restored);
assert.ok(button(restarted, "저장한 코디 보기"), "fresh screen after app restart still exposes restored save");
button(restarted, "저장한 코디 보기").props.onPress(); restarted.render(restored);
assert.equal(sheet(restarted).props.visible, true);
assert.match(readFileSync("apps/mobile/src/navigation/AppNavigator.tsx", "utf8"), /savedOutfitSnapshot: appState\.savedOutfitSnapshot/);
assert.match(readFileSync("apps/mobile/src/screens/OutfitDetailScreen.tsx", "utf8"), /savedOutfitSnapshot \? <SavedOutfitPreview snapshot=\{savedOutfitSnapshot\} \/> : null/, "account cleanup unmounts the entire preview, including cached sheet content");
console.log("Saved outfit retrieval passed: restored original items/photos/location/time, duplicate open, Close/dismiss/reopen, restart, hidden-route reset, large text, and account-cleanup unmount wiring.");

// Actual native transaction failure + process reload. A logout is not successful
// until its entire data cleanup commits, and failed writes cannot delete files
// or revoke the still-recoverable local session.
const createClearedAccountState = module.exports.createClearedAccountState;
const presetId = "outer-cardigan";
const accountPhoto = { ...item, id: "photo-shirt", source: "photo", imageUrl: "wardrobe-photos/photo-shirt.jpg" };
const storedAccount = normalize({ accountLinked: true, termsRequiredAccepted: true, savedOutfitSnapshot: photo,
  photoWardrobeItems: [accountPhoto], wardrobeOwnedItemIds: [presetId, accountPhoto.id], selectedWardrobeItemId: accountPhoto.id,
  savedDestinations: [{ place: normalize({}).selectedDestinationPlace, careEnabled: true, alertCondition: normalize({}).previewDestinationAlertCondition }],
  themeMode: "dark", selectedStyles: ["캐주얼"], weatherLocationMode: "manual", onboardingCompleted: true,
});
assert.equal(storedAccount.savedDestinations.length, 1);
const guest = createClearedAccountState(storedAccount, false);
assert.equal(guest.savedOutfitSnapshot, null);
assert.deepEqual(guest.photoWardrobeItems, []);
assert.deepEqual(guest.wardrobeOwnedItemIds, [presetId]);
assert.deepEqual(guest.savedDestinations, storedAccount.savedDestinations, "ordinary signed-out hydration must preserve guest destinations");
assert.equal(guest.themeMode, "dark");
assert.deepEqual(guest.selectedStyles, storedAccount.selectedStyles);
assert.equal(guest.weatherLocationMode, "manual");
await storage.writeAppValue(key, storedAccount, true);
const durableBeforeFailure = normalize(await storage.readAppValue(key, true));
const logoutEvents = [];
let sessionPresent = true;
const cleanupBindings = {
  photoSaveInFlightRef: { current: null }, outfitSaveInFlightRef: { current: null },
  accountSessionRevisionRef: { current: 0 }, accountActionRevisionRef: { current: 0 },
  accountActionInFlightRef: { current: false }, accountSessionReadyRef: { current: true }, accountCleanupPendingRef: { current: false }, accountDataClearingRef: { current: false }, accountDeletionCompletedRef: { current: false },
  persistedStateRef: { current: storedAccount }, createClearedAccountState, getSavedOutfitPhotoUris,
  savePersistedAppState: async value => { await storage.writeAppValue(key, normalize(value), true); logoutEvents.push(["commit"]); },
  removePersistedWardrobePhotos: uris => logoutEvents.push(["delete-files", uris]),
  updateSavedDestinations: update => logoutEvents.push(["destinations", update(storedAccount.savedDestinations)]),
  signOutAccountSession: async () => { sessionPresent = false; logoutEvents.push(["delete-session"]); },
};
for (const name of ["AccountLinked", "AccountProfile", "TermsRequiredAccepted", "SavedOutfitSnapshot", "OutfitSaveMessage", "RecentlyRemovedDestination", "WardrobeOwnedItemIds", "PhotoWardrobeItems", "SelectedWardrobeItemId", "OnboardingProgress", "DestinationSelectionReady", "SelectedDestinationPlace", "DepartureActivityIntentDestinationId", "CommittedDepartureDestinationId", "DepartureActivityReplacementDestinationId", "RecentlyRemovedWardrobeItemId", "AccountGateResult", "AccountAuthStatus", "AccountAuthMessage", "Route"]) {
  cleanupBindings[`set${name}`] = value => logoutEvents.push([name, value]);
}
cleanupBindings.clearLinkedAccountState = callback("clearLinkedAccountState", cleanupBindings);
const logout = callback("signOutAccount", cleanupBindings);
failWrite = true;
await logout();
assert.equal(sessionPresent, true, "failed cleanup must not revoke the session, allowing retry or restart");
assert.equal(logoutEvents.some(([event]) => ["delete-files", "Route", "SavedOutfitSnapshot"].includes(event)), false);
assert.ok(logoutEvents.some(([event, value]) => event === "AccountAuthStatus" && value === "error"));
assert.deepEqual(normalize(await storage.readAppValue(key, true)), durableBeforeFailure, "restart after a failed logout retains the original data, not a falsely completed logout");
assert.equal(cleanupBindings.accountDataClearingRef.current, false);
failWrite = false;
logoutEvents.length = 0;
await logout();
assert.equal(sessionPresent, false);
const committedIndex = logoutEvents.findIndex(([event]) => event === "commit");
for (const event of ["delete-files", "delete-session", "Route"]) assert.ok(logoutEvents.findIndex(([name]) => name === event) > committedIndex);
const afterLogoutRestart = normalize(await storage.readAppValue(key, true));
assert.equal(afterLogoutRestart.accountLinked, false);
assert.equal(afterLogoutRestart.savedOutfitSnapshot, null);
assert.deepEqual(afterLogoutRestart.photoWardrobeItems, []);
assert.deepEqual(afterLogoutRestart.savedDestinations, []);
assert.deepEqual(afterLogoutRestart.wardrobeOwnedItemIds, [presetId]);
assert.equal(afterLogoutRestart.themeMode, "dark");
assert.deepEqual(afterLogoutRestart.selectedStyles, storedAccount.selectedStyles);
assert.ok(logoutEvents.some(([event, route]) => event === "Route" && route === "M1"));
for (const [accountLinked, accountAuthStatus, pendingDeletion, expected] of [
  [true, "restoring", false, false], [false, "idle", false, false], [false, "error", false, false],
  [true, "signing-out", false, false], [true, "error", true, false], [true, "offline", false, true], [true, "ready", false, true],
]) {
  assert.equal(callback("canReadAccountData", { accountLinked, accountAuthStatus, accountSessionReadyRef: { current: true }, accountCleanupPendingRef: { current: false }, accountDeletionCompletedRef: { current: pendingDeletion } }), expected);
}
console.log("Logout durability passed: actual SQLite failure/restart preserves data+session, retry commits before files/session/success, successful restart has no outfit/photos, guest destinations/presets/preferences survive signed-out boundaries.");

const webValues = new Map();
let webWriteFails = false;
globalThis.localStorage = {
  getItem: key => webValues.get(key) ?? null,
  setItem: (key, value) => { if (webWriteFails) throw new Error("quota exceeded"); webValues.set(key, value); },
};
try {
  const web = load("apps/mobile/src/providers/appStorage.web.ts");
  await web.writeAppValue(key, storedAccount, true);
  webWriteFails = true;
  await assert.rejects(web.writeAppValue(key, createClearedAccountState(storedAccount), true), /quota exceeded/);
  const restarted = load("apps/mobile/src/providers/appStorage.web.ts");
  assert.deepEqual(normalize(await restarted.readAppValue(key, true)).savedOutfitSnapshot, storedAccount.savedOutfitSnapshot);
  webWriteFails = false;
  await restarted.writeAppValue(key, createClearedAccountState(storedAccount), true);
  assert.equal(normalize(await load("apps/mobile/src/providers/appStorage.web.ts").readAppValue(key, true)).savedOutfitSnapshot, null);
} finally { if (oldStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = oldStorage; }
console.log("Web cleanup durability passed: failed write retains original record; successful retry stays cleared after module restart.");

// Compose the actual restore effect with an already-started durable save. Even
// if a stale caller began saving, signed-out restoration owns the final result.
{
  const h = saveHarness(), response = deferred();
  let restoreNode;
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === "useEffect" && node.arguments[0].getText(ast).includes("void restoreAccountSession(")) restoreNode = node.arguments[0];
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const bindings = { ...h.bindings, accountActionRevisionRef: { current: 0 }, locallyRestoredAccountLinkedRef: { current: true },
    restoreAccountSession: () => response.promise, setAccountLinked: noop, setAccountProfile: noop,
    setTermsRequiredAccepted: noop, setAccountAuthStatus: noop, setPhotoWardrobeItems: noop, setRoute: noop,
    setWardrobeOwnedItemIds: noop, presetWardrobe: [],
  };
  const restore = new Function(...Object.keys(bindings), compile(`const run = ${restoreNode.getText(ast)};`) + "\nreturn run;")(...Object.values(bindings));
  const cleanup = restore();
  const saving = h.save(snapshot);
  response.resolve({ status: "signed-out", account: null });
  await new Promise(setImmediate);
  assert.equal(h.bindings.accountSessionReadyRef.current, false);
  assert.equal(h.bindings.accountSessionRevisionRef.current, 1);
  h.write.resolve();
  assert.equal(await saving, false);
  assert.equal(h.events.some(([type, value]) => type === "saved" && value !== null), false, "late save completion cannot resurrect signed-out content");
  cleanup();
}
{
  const h = saveHarness();h.bindings.accountSessionReadyRef.current = false;
  assert.equal(await h.save(snapshot), false);
  assert.equal(h.events.some(([type]) => type === "write"), false, "unresolved sessions cannot start a durable outfit save");
  let started = false;
  await callback("requestAccountGate", { ...guestBindings, accountAuthStatus: "restoring", startAccountGate: () => { started = true; } })("save-outfit", "C4");
  assert.equal(started, false, "restoring save does not start another account flow");
  const detailPath = "apps/mobile/src/screens/OutfitDetailScreen.tsx";
  const detail = ts.createSourceFile(detailPath, readFileSync(detailPath, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let disabled;
  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name.getText(detail) === "disabled" && node.initializer?.getText(detail).includes("outfitSavePending")) disabled = node.initializer.expression;
    ts.forEachChild(node, visit);
  }
  visit(detail);assert.ok(disabled);
  const isDisabled = new Function("accountAuthStatus", "outfitSaved", "outfitSavePending", `return ${disabled.getText(detail)};`);
  assert.equal(isDisabled("restoring", false, false), true);
  assert.equal(isDisabled("ready", false, false), false);
}
console.log("Restore/save race passed: real signed-out effect invalidates an in-flight save; unresolved sessions are blocked at button, gate, and durable-save boundaries.");

// Real deletion marker module + real native SQLite boundary, independently of
// app-state autosaves. A fresh module/process must observe the same barrier.
const markerPath = "apps/mobile/src/providers/accountDeletionState.ts";
const nativeMarker = load(markerPath, { "./appStorage": storage });
assert.equal(await nativeMarker.readPendingAccountDeletion(), null);
failWrite = true;
await assert.rejects(nativeMarker.writePendingAccountDeletion("requested"));
assert.equal(await nativeMarker.readPendingAccountDeletion(), null);
failWrite = false;
await nativeMarker.writePendingAccountDeletion("requested");
await storage.writeAppValue(key, storedAccount, true);
assert.equal(await load(markerPath, { "./appStorage": storage }).readPendingAccountDeletion(), "requested", "ordinary app-state writes cannot erase the deletion barrier");
failWrite = true;
await assert.rejects(nativeMarker.writePendingAccountDeletion("server-deleted"));
assert.equal(await load(markerPath, { "./appStorage": storage }).readPendingAccountDeletion(), "requested", "failed confirmation write retains the conservative requested barrier");
failWrite = false;
await nativeMarker.writePendingAccountDeletion("server-deleted");
failWrite = true;
await assert.rejects(nativeMarker.writePendingAccountDeletion(null));
assert.equal(await load(markerPath, { "./appStorage": storage }).readPendingAccountDeletion(), "server-deleted");
failWrite = false;
assert.equal(db.prepare("SELECT value FROM app_meta WHERE key = ?").get("weatheron.accountDeletion.v1").value, '"server-deleted"', "persistent marker contains only status, never credentials or identity");
await nativeMarker.writePendingAccountDeletion(null);
assert.equal(await nativeMarker.readPendingAccountDeletion(), null);
globalThis.localStorage = { getItem: key => webValues.get(key) ?? null, setItem: (key, value) => webValues.set(key, value) };
try {
  const web = load("apps/mobile/src/providers/appStorage.web.ts");
  await load(markerPath, { "./appStorage": web }).writePendingAccountDeletion("server-deleted");
  assert.equal(await load(markerPath, { "./appStorage": load("apps/mobile/src/providers/appStorage.web.ts") }).readPendingAccountDeletion(), "server-deleted");
  webValues.set("weatheron.accountDeletion.v1", '"corrupt"');
  await assert.rejects(load(markerPath, { "./appStorage": web }).readPendingAccountDeletion(), "malformed markers fail closed instead of exposing cached account data");
} finally { if (oldStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = oldStorage; }
console.log("Durable deletion marker passed: native SQLite/web module restart, pre-request failure, failed acknowledgement/removal, autosave isolation, malformed-state rejection, and status-only contents.");
