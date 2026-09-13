import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync("apps/mobile/src/components/FeedbackPressable.tsx", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { esModuleInterop: true, jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS },
}).outputText;

const flattenModule = { exports: {} };
vm.runInNewContext(
  require("@babel/core").transformFileSync(require.resolve("react-native/Libraries/StyleSheet/flattenStyle"), {
    babelrc: false,
    configFile: false,
    presets: [require.resolve("babel-preset-expo", { paths: [`${process.cwd()}/apps/mobile`] })],
  }).code,
  flattenModule,
);
const flatten = flattenModule.exports.default;
const componentModule = { exports: {} };
const scale = { __testAnimatedValue: true };
const reactNative = {
  Animated: { createAnimatedComponent: (component) => component },
  Easing: {},
  Pressable: () => null,
  StyleSheet: { flatten },
};
const localRequire = (id) => {
  if (id === "react") return { __esModule: true, default: {}, useRef: () => ({ current: scale }), useState: () => [false, () => {}] };
  if (id === "react-native") return reactNative;
  return id.includes("useReducedMotion")
    ? { useReducedMotion: () => false }
    : { triggerImportantActionHaptic: () => {} };
};
vm.runInNewContext(`${compiled}\nmodule.exports.resolveFeedbackPressableStyle = resolveFeedbackPressableStyle;`, {
  module: componentModule,
  exports: componentModule.exports,
  require: localRequire,
});

const resolveStyle = componentModule.exports.resolveFeedbackPressableStyle;
assert.equal(typeof resolveStyle, "function", "FeedbackPressable must resolve function styles before Animated receives them");

const staticStyle = flatten(resolveStyle({ flexDirection: "row" }, { pressed: false }, scale));
assert.equal(staticStyle.flexDirection, "row");

const arrayStyle = flatten(resolveStyle([{ padding: 12 }, { transform: [{ translateX: 3 }] }], { pressed: false }, scale));
assert.equal(arrayStyle.padding, 12);
assert.deepEqual(JSON.parse(JSON.stringify(arrayStyle.transform)), [{ translateX: 3 }, { scale }]);

const functionStyle = flatten(resolveStyle(({ pressed }) => ({ opacity: pressed ? 0.5 : 1 }), { pressed: true }, scale));
assert.equal(functionStyle.opacity, 0.5);
assert.equal(typeof functionStyle, "object", "Animated must receive a style object or array, not a callback");
assert.match(source, /style=\{resolvedStyle as /);
assert.doesNotMatch(source, /style=\{\(state\)/);

console.log("FeedbackPressable preserves static, array, function and transform styles before Animated delivery");
