import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the production screen and its event handlers, with inert native views.
// No account service, persistence or browser/OAuth module is available to this VM.
const React = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  useMemo: (compute) => compute(),
};
const mocks = {
  react: React,
  "../localization/react-native": {
    Image: "Image", Pressable: "Pressable", Text: "Text", View: "View",
    StyleSheet: { create: (value) => value },
  },
  "../assets": { uiIconAssets: { check: "check" } },
  "../components/AppScreen": { AppScreen: "AppScreen" },
  "../navigation/routeLabels": { getRouteLabel: () => "Return screen" },
  "../theme/AppThemeContext": { useAppTheme: () => ({}) },
  "../theme/pageStyles": { pageStyles: {} },
  "../theme/responsiveLayout": { useResponsiveLayout: () => ({}) },
  "../theme/tokens": { radius: {}, spacing: {} },
};
const source = readFileSync("apps/mobile/src/screens/TermsConsentScreen.tsx", "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText;
const exports = {};
vm.runInNewContext(js, {
  exports, require: (name) => { assert.ok(Object.hasOwn(mocks, name), `Unexpected dependency: ${name}`); return mocks[name]; },
});
const keys = ["age", "terms", "privacy", "location"];
const plain = (value) => JSON.parse(JSON.stringify(value));
const draft = (mask) => Object.fromEntries(keys.map((key, i) => [key, Boolean(mask & (1 << i))]));
assert.deepEqual(plain(exports.emptyTermsConsentDraft), draft(0));

function flatten(node) {
  if (Array.isArray(node)) return node.flatMap(flatten);
  if (!node || typeof node !== "object") return [];
  if (typeof node.type === "function") return flatten(node.type(node.props));
  return [node, ...flatten(node.props.children)];
}
function render(accepted, authStatus = "ready") {
  const events = { drafts: [], documents: [], completed: 0, cancelled: 0 };
  const nodes = flatten(exports.TermsConsentScreen({
    gate: null, authStatus, authMessage: null, accepted,
    onDraftChange: (value) => events.drafts.push(plain(value)),
    onOpenPolicyDocument: (value) => events.documents.push(value),
    onComplete: async () => { events.completed++; },
    onCancel: () => { events.cancelled++; },
  }));
  const checkboxes = nodes.filter((node) => node.props.accessibilityRole === "checkbox");
  const buttons = nodes.filter((node) => node.props.accessibilityRole === "button");
  // The current product has exactly four required consents, no optional marketing CTA.
  assert.equal(checkboxes.length, 5, "Four required toggles plus select-all");
  const primary = buttons.filter((node) => node.props.accessibilityState?.busy !== undefined);
  assert.equal(primary.length, 1, "One guarded completion action");
  return { events, nodes, checkboxes, primary: primary[0], buttons };
}

for (let mask = 0; mask < 16; mask++) {
  const accepted = Object.freeze(draft(mask));
  const { events, checkboxes, primary } = render(accepted);
  const all = mask === 15;
  assert.equal(checkboxes[0].props.accessibilityState.checked, all);
  assert.equal(primary.props.accessibilityState.disabled, !all);
  primary.props.onPress();
  assert.equal(events.completed, all ? 1 : 0, `Completion guard for consent mask ${mask}`);
  assert.deepEqual(events.drafts, [], "Completion must not silently grant consent");
  checkboxes[0].props.onPress();
  assert.deepEqual(events.drafts.pop(), draft(all ? 0 : 15), "Select-all toggles only the four required keys");
  keys.forEach((key, i) => {
    assert.equal(checkboxes[i + 1].props.accessibilityState.checked, accepted[key]);
    checkboxes[i + 1].props.onPress();
    assert.deepEqual(events.drafts.pop(), { ...accepted, [key]: !accepted[key] }, `${key} toggles without changing other consent`);
  });
  assert.deepEqual(accepted, draft(mask), "Input draft remains immutable");
}
for (const mask of [0, 15]) {
  const { events, primary } = render(draft(mask), "saving-terms");
  assert.equal(primary.props.accessibilityState.busy, true);
  assert.equal(primary.props.accessibilityState.disabled, true);
  primary.props.onPress();
  assert.equal(events.completed, 0, "Saving cannot submit again");
}
const inspection = render(draft(0));
const documentButtons = inspection.buttons.filter((node) => node.props.accessibilityLabel.endsWith("내용 보기"));
assert.equal(documentButtons.length, 3, "Age has no policy link; terms/privacy/location do");
for (const button of documentButtons) button.props.onPress();
assert.deepEqual(inspection.events.documents, ["terms", "privacy", "location"]);
assert.deepEqual(inspection.events.drafts, [], "Reading a policy is not consent");
assert.equal(inspection.events.completed, 0);
const cancel = inspection.buttons.find((node) => node.props.accessibilityLabel === "계정 연결 취소");
assert.ok(cancel); cancel.props.onPress();
assert.equal(inspection.events.cancelled, 1);
assert.deepEqual(inspection.events.drafts, [], "Cancel preserves the draft");
const retry = render(draft(15), "error");
retry.primary.props.onPress();
assert.equal(retry.events.completed, 1, "A failed save can be retried explicitly");
console.log("Terms consent behavior passed: 16 combinations, individual/all toggles, no implicit marketing consent, save guard, policy links, cancel and retry");
