import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const require = createRequire(import.meta.url);
const wrapperPath = "apps/mobile/src/localization/react-native.tsx";
const parse = (file, source) => ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
const runtimeNames = new Set();
const consumers = [];
function collectConsumers(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { collectConsumers(file); continue; }
    if (!/\.tsx?$/.test(file)) continue;
    for (const node of parse(file, readFileSync(file, "utf8")).statements) {
      if (!ts.isImportDeclaration(node) || !/(?:^|\/)localization\/react-native$/.test(node.moduleSpecifier.text)) continue;
      const clause = node.importClause;
      assert.ok(clause?.namedBindings && ts.isNamedImports(clause.namedBindings), `Unhandled import shape: ${file}`);
      if (clause.isTypeOnly) continue;
      const names = clause.namedBindings.elements.filter((item) => !item.isTypeOnly).map((item) => (item.propertyName ?? item.name).text);
      consumers.push({ file, names });
      for (const name of names) runtimeNames.add(name);
    }
  }
}
collectConsumers("apps/mobile/src");
const native = Object.fromEntries([...runtimeNames].map((name) => [name, { nativeName: name }]));
Object.assign(native, { Text: "NativeText", Pressable: "NativePressable", TextInput: "NativeTextInput", View: "NativeView" });
let optionalReads = 0;
for (const name of ["PushNotificationIOS", "DevSettings"]) {
  Object.defineProperty(native, name, { enumerable: true, get() {
    optionalReads++;
    throw new Error(`Optional native module ${name} was initialized during Refresh`);
  } });
}
let language = "ko";
const react = { forwardRef: (render) => ({ render }), use: () => ({ language }), Fragment: Symbol("Fragment") };
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith(".json")) return JSON.parse(readFileSync(file, "utf8"));
  const module = { exports: {} };
  cache.set(file, module.exports);
  const compiled = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const localRequire = (id) => {
    if (id === "react-native") return native;
    if (id === "react") return react;
    if (id === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (id === "expo-localization") return { getLocales: () => [{ languageCode: "ko", languageTag: "ko-KR" }], getCalendars: () => [] };
    if (id === "./LocalizationProvider") return { LocalizationContext: {} };
    assert.ok(id.startsWith("."), `Unexpected platform boundary: ${id}`);
    const resolved = path.resolve(path.dirname(file), id);
    return load(id.endsWith(".json") ? resolved : resolved + ".ts");
  };
  new Function("module", "exports", "require", compiled)(module, module.exports, localRequire);
  return module.exports;
}
const wrapper = load(path.resolve(wrapperPath));
assert.equal(wrapper.View, native.View);
assert.equal(wrapper.RawText, native.Text);
assert.notEqual(wrapper.Text, native.Text);
for (const { file, names } of consumers) for (const name of names) assert.notEqual(wrapper[name], undefined, `Missing runtime export ${name} consumed by ${file}`);
// Execute the installed Metro implementation instead of a test copy of its loop.
const metroFile = path.join(path.dirname(require.resolve("metro-runtime/package.json")), "src/polyfills/require.js");
const metroTree = parse(metroFile, readFileSync(metroFile, "utf8"));
const expressions = new Map();
function find(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) expressions.set(node.name.text, node.initializer.getText(metroTree));
  ts.forEachChild(node, find);
}
find(metroTree);
const safeName = expressions.has("isExportSafeToAccess") ? "isExportSafeToAccess" : "isSpecifierSafeToCheck";
assert.ok(expressions.has(safeName) && expressions.has("registerExportsForReactRefresh"));
const register = new Function(`const ${safeName}=${expressions.get(safeName)};return ${expressions.get("registerExportsForReactRefresh")};`)();
register({ register() {} }, wrapper, "localization-wrapper");
assert.equal(optionalReads, 0, "Refresh must leave unused native APIs uninitialized");
assert.equal("PushNotificationIOS" in wrapper, false);
const localization = load(path.resolve("apps/mobile/src/localization/localization.ts"));
const ref = {};
for (language of ["ko", "en", "ja"]) {
  const translated = localization.translateText("홈", language);
  if (language !== "ko") assert.notEqual(translated, "홈");
  const text = wrapper.Text.render({ children: "홈", accessibilityLabel: "홈", accessibilityHint: "홈", testID: "preserved" }, ref);
  assert.equal(text.props.children, translated);
  assert.equal(text.props.accessibilityLabel, translated);
  assert.equal(text.props.accessibilityHint, translated);
  assert.equal(text.props.ref, ref);
  assert.equal(text.props.testID, "preserved");
  assert.equal(wrapper.TextInput.render({ placeholder: "홈" }, ref).props.placeholder, translated);
  for (const component of [wrapper.Pressable, wrapper.LocalizedView]) assert.equal(component.render({ accessibilityLabel: "홈" }, ref).props.accessibilityLabel, translated);
}
console.log(`PASS: ${consumers.length} consumers, actual Metro Refresh, optional native getters untouched, KO/EN/JA text/accessibility/placeholder/ref compatibility`);
