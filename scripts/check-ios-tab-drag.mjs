import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Execute the actual responder callbacks, without a renderer or a device.
const source = readFileSync('apps/mobile/src/components/BottomNav.tsx', 'utf8');
const ast = ts.createSourceFile('BottomNav.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let responder, hitTest;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'dragResponder') responder = node.initializer.arguments[0].getText(ast);
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'getTabIndexAtPosition') hitTest = node.getText(ast);
  ts.forEachChild(node, visit);
}
visit(ast);
assert.ok(responder && hitTest);
const transpile = (code) => ts.transpileModule(code, {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
const routes = ['H1', 'C1', 'G1', 'M1'].map(id => ({id}));
function harness(isIos = true, index = 0) {
  const navigations = [], snaps = [], positions = [];
  const metrics = {current: {windowX: 20, width: 402, measuredInWindow: true}};
  const active = {current: index};
  const selection = {stopAnimation(callback) { callback?.(index * 100); }, setValue(x) {positions.push(x);}};
  const create = new Function('isIos', 'bottomNavRoutes', 'dockMetricsRef', 'activeIndexRef', 'navigateRef', 'draggedIndexRef', 'didSwitchTabRef', 'draggingRef', 'dragStartRef', 'selectionX', 'snapSelection', 'PanResponder', `${transpile(hitTest)}\n${transpile(`const responder = ${responder};`)}\nreturn responder();`);
  const callbacks = create(isIos, routes, metrics, active, {current: id => navigations.push(id)}, {current:index}, {current:false}, {current:false}, {current:0}, selection, i => snaps.push(i), {create: x => x});
  const event = x => ({nativeEvent: {pageX: x + 20, locationX: x}});
  return {callbacks, event, navigations, snaps, positions, metrics};
}
const h = harness();
assert.equal(h.callbacks.onStartShouldSetPanResponderCapture(h.event(40)), true);
assert.equal(h.callbacks.onStartShouldSetPanResponderCapture(h.event(140)), false);
h.callbacks.onPanResponderGrant(h.event(40));
h.callbacks.onPanResponderMove(h.event(177), {dx:137});
assert.equal(h.positions.at(-1), 137, 'finger displacement must stay continuous between tabs');
assert.deepEqual(h.navigations, [], 'dragging must not mount intermediate pages');
h.callbacks.onPanResponderMove(h.event(900), {dx:860});
assert.equal(h.positions.at(-1), 300, 'right edge must clamp');
h.callbacks.onPanResponderRelease();
assert.deepEqual(h.navigations, ['M1']);
assert.deepEqual(h.snaps, [3]);
const cancel = harness(true, 2);
cancel.callbacks.onPanResponderGrant(cancel.event(230));
cancel.callbacks.onPanResponderMove(cancel.event(-90), {dx:-320});
assert.equal(cancel.positions.at(-1), 0);
cancel.callbacks.onPanResponderTerminate();
assert.deepEqual(cancel.navigations, []);
assert.deepEqual(cancel.snaps, [2]);
const tap = harness(true, 1);
tap.callbacks.onPanResponderGrant(tap.event(170));
tap.callbacks.onPanResponderRelease();
assert.deepEqual(tap.navigations, ['C1']);
const android = harness(false);
android.callbacks.onPanResponderGrant(android.event(30));
android.callbacks.onPanResponderMove(android.event(230), {dx:200});
assert.deepEqual(android.navigations, ['G1'], 'Android behavior remains unchanged');
console.log('Tab drag: continuous displacement, edge clamps, release-only navigation, cancellation and Android regression passed');

let snapSource;
function findSnap(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'snapSelection') snapSource = node.initializer.getText(ast);
  ts.forEachChild(node, findSnap);
}
findSnap(ast);
assert.ok(snapSource);
for (const reduced of [null, true, false]) {
  let value, animated = false;
  const snap = new Function('selectionX', 'dockMetricsRef', 'bottomNavRoutes', 'reducedMotionRef', 'Animated', `${transpile(`const snap = ${snapSource};`)} return snap;`)(
    {stopAnimation() {}, setValue(x) {value = x;}}, {current:{width:402}}, routes, {current:reduced},
    {spring: (_value, config) => ({start() {animated = true; value = config.toValue;}})},
  );
  snap(2);
  assert.equal(value, 200);
  assert.equal(animated, reduced === false, 'unknown or reduced motion must snap without a spring');
}
console.log('Tab snap: reduced motion and unknown accessibility preference passed');
