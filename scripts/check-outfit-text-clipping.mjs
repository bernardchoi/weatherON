import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const flatten = s => Object.assign({}, ...[s].flat(Infinity).filter(Boolean));
const createElement = (type, props, ...children) => ({ type, props: { ...props, children: children.flat() } });
const mocks = {
  react: { createElement },
  'react-native': { Image: 'Image', Text: 'Text', View: 'View', StyleSheet: { create: s => s } },
  './FeedbackPressable': { FeedbackPressable: 'Pressable' },
  '../assets': { getOutfitImageSource: () => null },
  '../theme/AppThemeContext': { useAppTheme: () => ({}) },
  '../theme/pageStyles': { pageStyles: { unboxed: { backgroundColor: 'transparent', borderWidth: 0 } } },
  '../theme/tokens': { radius: { md: 18 }, spacing: { sm: 10 } },
};
const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync('apps/mobile/src/components/OutfitGrid.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
}).outputText, { exports, require: name => { assert.ok(name in mocks, name); return mocks[name]; } });
const outfit = { items: { bottom: { name: '슬림 슬랙스' } } };
const tree = exports.OutfitGrid({ outfit, dense: true });
const card = tree.props.children[0];
const style = flatten(card.props.style);
// Native capture: card [66,767][530,1108], name [66,1067][530,1107].
// Android FeedbackPressable clips to its rounded outline; the name reaches x=0,
// 1px above its bottom, inside the corner cutout whenever the radius is nonzero.
console.log(`Unboxed outfit card clipping radius: ${style.borderRadius ?? 0}dp`);
assert.equal(style.borderRadius ?? 0, 0, 'Rounded parent clips the left/bottom of clothing names');
for (const options of [{}, { dense: true }, { compact: true }, { singleRow: true }, { onePage: true }]) {
  const cell = exports.OutfitGrid({ outfit, ...options }).props.children[0];
  const name = cell.props.children.find(n => n?.type === 'Text' && n.props.children[0] === '슬림 슬랙스');
  assert.equal(name.props.numberOfLines, undefined, 'Long clothing names must wrap');
}
console.log('PASS: clothing names have no rounded clipping or one-line truncation');
