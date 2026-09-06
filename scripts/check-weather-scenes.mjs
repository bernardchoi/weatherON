import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

let reduced = false, active = "active", effects = [], starts = 0, stops = 0;
const React = {
  memo: (component) => component,
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  useMemo: (fn) => fn(), useRef: (current) => ({ current }),
  useState: (value) => [typeof value === "function" ? value() : value, () => {}],
  useEffect: (fn) => effects.push(fn),
};
class Value {
  constructor(value) { this.value = value; }
  setValue(value) { this.value = value; }
  interpolate(config) { return config; }
  stopAnimation() { stops++; }
}
const animation = () => ({ start() { starts++; }, stop() { stops++; } });
const native = {
  Animated: { View: "AnimatedView", Value, timing: (_value, config) => {
    assert.equal(config.useNativeDriver, true);
    assert.equal(config.isInteraction, false, "ambient motion must not block interactions or list rendering");
    return animation();
  }, sequence: animation },
  AppState: { get currentState() { return active; }, addEventListener: () => ({ remove() {} }) },
  Easing: { inOut: (v) => v, out: (v) => v, in: (v) => v },
  StyleSheet: { create: (value) => value, absoluteFill: {} }, View: "View",
  useWindowDimensions: () => ({ width: 360, height: 640 }),
};
const exports = {};
const js = ts.transpileModule(readFileSync("apps/mobile/src/components/WeatherBackground.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText;
new Function("exports", "require", "setTimeout", "clearTimeout", js)(exports, (name) => {
  if (name === "react") return React;
  if (name === "react-native") return native;
  if (name.endsWith("useReducedMotion")) return { useReducedMotion: () => reduced };
  throw new Error(name);
}, () => 1, () => {});

function expand(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(expand);
  if (typeof node.type === "function") return expand(node.type(node.props));
  return [node, ...expand(node.props?.children)];
}
const expected = { clear: "clear", cloud: "cloud", rain: "rain", snow: "snow", storm: "storm", dust: "dust", fog: "dust", unknown: "cloud" };
for (const [condition, scene] of Object.entries(expected)) {
  assert.equal(exports.resolveMotionState(condition, false), scene);
  assert.equal(exports.resolveMotionState(condition, true), condition === "clear" ? "night" : scene);
  for (const name of ["light", "dark"]) for (const isNight of [false, true]) {
    for (const preference of [false, true, null]) for (const appState of ["active", "background"]) {
      reduced = preference; active = appState; effects = []; starts = 0; stops = 0;
      const nodes = expand(exports.WeatherBackground({ condition, isNight, subtle: true, theme: { name, sky: "#348ABD", skyLite: "#80BADE", gold: "#DA9950" } }));
      assert.equal(nodes[0].props.pointerEvents, "none");
      assert.equal(nodes[0].props.importantForAccessibility, "no-hide-descendants");
      const cleanup = effects.map((effect) => effect());
      const shouldAnimate = preference === false && appState === "active";
      assert.equal(starts > 0, shouldAnimate, `${condition}/${name}/${isNight}/${preference}/${appState}`);
      cleanup.forEach((fn) => fn?.());
      if (shouldAnimate) assert.ok(stops >= starts, "all active animation values must be stopped on unmount");
      assert.ok(nodes.length < 180, "scene node count must stay bounded on phones");
    }
  }
}
console.log("Weather scenes: all conditions, day/night, both themes, reduced/unknown motion, background suspension and cleanup passed");
