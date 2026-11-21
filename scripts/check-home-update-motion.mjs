import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const home = fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx', 'utf8');
assert.ok(/<HomeUpdateRegion\s+testID="home-route-update-region"/.test(home),
  'Route status needs a persistent presence owner outside the pending condition');
assert.ok(/<HomeUpdateRegion\s+testID="home-preparation-update-region"/.test(home),
  'Destination weather status needs the same presence lifecycle');

// Evaluate the actual Home visibility boundary, including failure over a retained ETA.
const homeAst = ts.createSourceFile('HomeScreen.tsx', home, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let routeVisibility;
const busyPolicies = [];
function visit(node) {
  if (ts.isJsxOpeningElement(node) && node.tagName.getText(homeAst) === 'HomeUpdateRegion') {
    const attrs = node.attributes.properties;
    if (attrs.some(attr => attr.name?.getText(homeAst) === 'testID' && attr.initializer?.text === 'home-route-update-region')) {
      routeVisibility = attrs.find(attr => attr.name?.getText(homeAst) === 'visible').initializer.expression.getText(homeAst);
    }
  }
  if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(homeAst) === 'HomeUpdateStatus') {
    const attrs = node.attributes.properties;
    if (attrs.some(attr => attr.name?.getText(homeAst) === 'testID' && ['home-route-update', 'home-preparation-update'].includes(attr.initializer?.text))) {
      busyPolicies.push(attrs.find(attr => attr.name?.getText(homeAst) === 'active').initializer.expression.getText(homeAst));
    }
  }
  ts.forEachChild(node, visit);
}
visit(homeAst);
const routeVisible = (label, extra = {}) => {
  const scope = { destinationReady: true, Platform: { OS: 'ios' }, routePending: false, compactSameDestination: false, showDepartureExplanation: false, routeStatus: label, ...extra };
  return new Function(...Object.keys(scope), `return (${routeVisibility});`)(...Object.values(scope));
};
assert.equal(routeVisible('조회한 경로 기준'), false);
assert.equal(routeVisible('경로 확인 실패 · 다시 시도해 주세요', { compactSameDestination: true }), false);
assert.equal(routeVisible('경로 확인 실패 · 다시 시도해 주세요'), true, 'Failure cannot disappear behind a retained ready ETA');
assert.equal(routeVisible('이전 조회 기준 · 다시 확인 필요'), true);
assert.equal(routeVisible('조회한 경로 기준', { routePending: true }), true);
assert.equal(routeVisible('조회한 경로 기준', { destinationReady: false }), false);
assert.equal(routeVisible('조회한 경로 기준', { Platform: { OS: 'android' } }), true);
assert.equal(busyPolicies.length, 2);
for (const expression of busyPolicies) {
  const busyActive = new Function('present', 'homeMotionActive', 'lowPowerMode', `return (${expression});`);
  assert.equal(busyActive(false, true, false), false, 'Both exiting slots stop busy motion immediately');
  assert.equal(busyActive(true, true, false), true);
}

let owner, reduced = false, active = true, foreground = true, contentPresent;
const content = text => present => { contentPresent = present; return text; };
const animations = [];
const React = {
  createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
  useContext: () => ({ active, motionAllowed: reduced === false && foreground }),
  useRef(initial) { const i = owner.cursor++; return owner.slots[i] ??= { current: initial }; },
  useState(initial) {
    const current = owner, i = current.cursor++;
    if (!(i in current.slots)) current.slots[i] = initial;
    return [current.slots[i], value => {
      const next = typeof value === 'function' ? value(current.slots[i]) : value;
      if (!Object.is(next, current.slots[i])) { current.slots[i] = next; current.dirty = true; }
    }];
  },
  useLayoutEffect(callback, deps) {
    const current = owner, i = current.cursor++, previous = current.slots[i];
    if (!previous || deps.some((value, j) => !Object.is(value, previous.deps[j]))) {
      current.effects.push(() => {
        previous?.cleanup?.();
        current.slots[i] = { deps, cleanup: callback() };
      });
    }
  },
};
class Value {
  constructor(value) { this.value = value; }
  setValue(value) { this.value = value; }
  stopAnimation() {}
}
const native = {
  View: 'View', Easing: { out: x => x, cubic: 0 },
  Animated: {
    View: 'AnimatedView', Value,
    timing(value, config) {
      return { value, config, start() {}, stop() {}, finish() { value.setValue(config.toValue); } };
    },
    parallel(tracks) {
      const animation = {
        tracks, stopped: false,
        start(callback) {
          // RN AnimatedStyle promotes every sibling value when one uses native.
          // A JS layout value on this same view must never be promoted.
          assert.ok(tracks.every(track => track.config.useNativeDriver === false),
            'Measured height/opacity style must remain JS-owned on entry, exit and reversal');
          this.callback = callback;
        },
        stop() { this.stopped = true; this.callback?.({ finished: false }); },
        advance(fraction) {
          for (const track of tracks) track.value.setValue(track.value.value + (track.config.toValue - track.value.value) * fraction);
        },
        finish() { if (!this.stopped) { tracks.forEach(track => track.finish()); this.callback?.({ finished: true }); } },
      };
      animations.push(animation);
      return animation;
    },
  },
};
const source = fs.readFileSync('apps/mobile/src/components/HomeUpdateRegion.tsx', 'utf8');
const code = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React, esModuleInterop: true,
} }).outputText;
const module = { exports: {} };
new Function('module', 'exports', 'require', code)(module, module.exports, id => {
  if (id === 'react') return React;
  if (id.endsWith('/localization/react-native')) return native;
  if (id.endsWith('/AmbientReveal')) return { AmbientMotionContext: {} };
  if (id.endsWith('/ambientMotion')) return { ambientMotion: { disclosureOpen: 220, disclosureClose: 160 } };
  throw Error(id);
});
function runner() {
  const current = { slots: [], effects: [], cursor: 0 };
  return {
    render(props) {
      let tree, count = 0;
      do {
        assert.ok(++count < 15, 'Presence updates settle');
        owner = current; current.cursor = 0; current.effects = []; current.dirty = false;
        tree = module.exports.HomeUpdateRegion(props);
        current.effects.forEach(effect => effect());
      } while (current.dirty);
      return tree;
    },
    dispose() { current.slots.forEach(slot => slot?.cleanup?.()); },
  };
}
const measure = (tree, height) => tree.children[0].props.onLayout({ nativeEvent: { layout: { height } } });
const body = tree => tree.children[0]?.children[0];
const props = { visible: false, contentKey: 'A', spacing: 8, children: content('calculating A') };

// Cached response: real work completes before the entry animation finishes.
let test = runner(), tree = test.render(props);
assert.equal(tree.props.style.height.value, 0);
assert.equal(tree.props.style.marginTop, -8, 'A closed slot cancels its parent gap');
tree = test.render({ ...props, visible: true });
assert.equal(tree.props.style.height.value, 0, 'First measurement must not flash at full height');
measure(tree, 32); tree = test.render({ ...props, visible: true });
let opening = animations.at(-1);
assert.equal(opening.tracks[0].config.toValue, 32);
assert.equal(opening.tracks[0].config.useNativeDriver, false);
assert.equal(opening.tracks[1].config.useNativeDriver, false, 'One measured Animated.View must not mix JS height with native opacity');
assert.ok(opening.tracks.every(track => track.config.isInteraction === false && track.config.delay === undefined));
opening.advance(0.4);
const partial = tree.props.style.height.value;
tree = test.render({ ...props, children: null });
assert.equal(body(tree), 'calculating A', 'Exit retains the displayed content');
assert.equal(contentPresent, false, 'Retained status immediately stops its busy timer/pulse');
assert.equal(tree.props.style.height.value, partial, 'Fast completion reverses at the current height');
assert.equal(tree.props.pointerEvents, 'none');
assert.equal(tree.props.accessibilityElementsHidden, true);
assert.equal(tree.props.importantForAccessibility, 'no-hide-descendants');
let closing = animations.at(-1);
closing.finish(); tree = test.render({ ...props, children: null });
assert.equal(tree.children[0], null, 'Finished exit releases the busy component');
assert.equal(tree.props.style.height.value, 0);

// Repeat / cancellation / A->B->A: stale completions must not clear newer work.
tree = test.render({ ...props, visible: true }); measure(tree, 32);
tree = test.render({ ...props, visible: true }); animations.at(-1).finish();
test.render({ ...props, children: null }); closing = animations.at(-1);
tree = test.render({ ...props, visible: true, children: content('calculating again') });
closing.callback({ finished: true });
tree = test.render({ ...props, visible: true, children: content('calculating again') });
assert.equal(body(tree), 'calculating again');
tree = test.render({ ...props, contentKey: 'B', children: null });
assert.equal(body(tree), undefined, 'Never show A text under destination B');
closing = animations.at(-1);
tree = test.render({ ...props, visible: true, children: content('new A') });
closing.callback({ finished: true });
tree = test.render({ ...props, visible: true, children: content('new A') });
assert.equal(body(tree), 'new A');

// Failure and retry remain live while visible; large type / width changes remeasure.
tree = test.render({ ...props, visible: true, children: content('failure: retry') });
assert.equal(body(tree), 'failure: retry', 'No stale pending copy delays the error');
assert.equal(tree.props.pointerEvents, 'auto');
measure(tree, 156); tree = test.render({ ...props, visible: true, children: content('failure: retry') });
assert.equal(animations.at(-1).tracks[0].config.toValue, 156);
assert.equal(tree.props.style.maxHeight, undefined);
assert.equal(tree.props.style.transform, undefined);
measure(tree, NaN); tree = test.render({ ...props, visible: true });
assert.equal(animations.at(-1).tracks[0].config.toValue, 156, 'Invalid native measurements are ignored');
test.dispose();
assert.equal(animations.at(-1).stopped, true, 'Unmount stops tracks');

// Reduce Motion (including unresolved preference) and a retained inactive Home settle immediately.
for (const policy of [true, null, false]) {
  reduced = policy; active = policy !== false;
  test = runner(); const before = animations.length;
  tree = test.render({ ...props, visible: true }); measure(tree, 88);
  tree = test.render({ ...props, visible: true });
  assert.equal(tree.props.style.height.value, 88);
  assert.equal(tree.props.style.opacity.value, 1);
  tree = test.render({ ...props, children: null });
  assert.equal(tree.props.style.height.value, 0);
  assert.equal(tree.children[0], null);
  assert.equal(animations.length, before);
  test.dispose();
}
reduced = false; active = true; test = runner();
tree = test.render({ ...props, visible: true }); measure(tree, 44);
test.render({ ...props, visible: true }); const interrupted = animations.at(-1);
reduced = true; tree = test.render({ ...props, visible: true });
assert.equal(interrupted.stopped, true);
assert.equal(tree.props.style.height.value, 44, 'Preference changes settle in-flight geometry');
test.dispose();
reduced = false; active = true; foreground = true; test = runner();
tree = test.render({ ...props, visible: true }); measure(tree, 44);
test.render({ ...props, visible: true }); const backgrounded = animations.at(-1);
foreground = false; tree = test.render({ ...props, visible: false });
assert.equal(backgrounded.stopped, true);
assert.equal(tree.props.style.height.value, 0, 'Backgrounding finishes a pending exit');
assert.equal(tree.children[0], null);
test.dispose();
console.log('PASS destination status presence: measured height/opacity, fast completion, retained exit, repeat/cancel/identity races, errors, large type, accessibility, Reduce Motion and cleanup. Native rendering not exercised.');
