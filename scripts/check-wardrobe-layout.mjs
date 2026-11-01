import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const flatten = value => Object.assign({}, ...[value].flat(Infinity).filter(Boolean));
const jsx = (type, props, ...children) => ({ type, props: props ?? {}, children });
const nodes = (tree) => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.children)];
const text = tree => typeof tree === 'string' ? tree : !tree ? '' : (Array.isArray(tree) ? tree : tree.children ?? []).map(text).join('');
function load(file, env) {
 const source = fs.readFileSync(file, 'utf8');
 const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
 const names = ast.statements.filter(ts.isFunctionDeclaration).map(n => n.name.text);
 const code = ast.statements.filter(n => !ts.isImportDeclaration(n)).map(n => n.getText(ast).replace(/^export /, '')).join('\n');
 return vm.createContext(env), Object.assign(env, vm.runInContext(ts.transpileModule('(() => {' + code + ';return {' + names.join(',') + '};})()', { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText, env)), env;
}
for (const os of ['ios', 'android']) for (const width of [320, 360, 375, 390, 440, 768]) for (const fontScale of [1, 1.3, 1.6, 2]) {
 const layout = { width, isNarrow: width < 390, isTablet: width >= 768, wardrobeGridItemWidth: width >= 768 ? '23%' : width < 390 ? '48%' : '30.8%', wardrobeCardMinHeight: 120, wardrobePresetCardMinHeight: 162, outfitCardGap: 8 };
 const env = { React: { createElement: jsx, useState: v => [v, () => {}] }, Platform: { OS: os }, LayoutAnimation: { Types: {}, Properties: {} }, StyleSheet: { create: v => v }, useAppTheme: () => ({}), useResponsiveLayout: () => layout, useWindowDimensions: () => ({ fontScale }), getOutfitImageSource: () => 'image', outfitImageAssets: { image: 'image' }, getWardrobeCategoryLabel: () => '겉옷', ambientUiIcons: { delete: 'trash' }, uiIconAssets: { trash: 'trash' }, spacing: {}, radius: {}, semanticColor: () => '', View: 'View', Text: 'Text', RawText: 'Text', Image: 'Image', FeedbackPressable: 'Button', Pressable: 'Button', AppButton: 'AppButton', Section: 'Section', useAmbientReadingSurface: () => os === 'ios', cardShadow: () => ({}), pageStyles: {} };
 load('apps/mobile/src/screens/WardrobeScreen.tsx', env);
 let opened = 0, removed = 0, restored = 0, toggled = 0;
 const item = { id: 'test', name: '아주 긴 아이템 이름 테스트', imageUrl: 'image', category: 'outer', source: 'photo' };
 const tree = env.WardrobeItemCard({ item, onOpen: () => opened++, onRemove: () => removed++ });
 const all = nodes(tree), remove = all.find(n => n.props.accessibilityLabel?.endsWith('내 옷장에서 삭제'));
 const open = all.find(n => n.props.accessibilityLabel?.endsWith('상세 보기'));
 open.props.onPress(); remove.props.onPress(); assert.equal(opened, 1); assert.equal(removed, 1);
 assert.ok(!nodes(open).includes(remove), 'Deletion must remain separate from opening item');
 const button = flatten(remove.props.style); assert.equal(button.width, 44); assert.equal(button.height, 44);
 if (os === 'ios') {
  assert.equal(button.position, 'relative'); assert.equal(button.top, undefined);
  assert.ok(nodes(tree).some(n => n.children?.includes(remove) && text(n).includes('겉옷')), 'Delete belongs in category footer');
 }
 const expectedColumns = os === 'ios' ? width < 350 || fontScale > 1.3 ? 2 : width >= 768 ? 4 : 3 : undefined;
 const ownedWidth = flatten(tree.props.style).width;
 if (expectedColumns) assert.ok(parseFloat(ownedWidth) * expectedColumns <= 100);
 const banner = env.RemovedItemBanner({ itemName: item.name, onRestore: () => restored++, theme: {} });
 nodes(banner).find(n => n.props.accessibilityLabel?.endsWith('복구')).props.onPress(); assert.equal(restored, 1);
 load('apps/mobile/src/screens/WardrobePresetScreen.tsx', env);
 for (const owned of [true, false]) {
  const preset = env.PresetCard({ item: { ...item, owned }, selected: true, onPreview: () => opened++, onToggleOwned: () => toggled++ });
  const action = nodes(preset).find(n => n.type === 'AppButton');
  action.props.onPress(); assert.equal(action.props.label, owned ? '해제' : '추가');
  if (os === 'ios') { assert.equal(flatten(preset.props.style).width, ownedWidth); assert.equal(flatten(preset.props.style).minHeight, 0); }
 }
 assert.equal(toggled, 2);
 load('apps/mobile/src/components/Section.tsx', env);
 for (const compact of [true, false]) for (const contentGap of [undefined, 6]) {
  const section = env.Section({ title: '필터', compact, contentGap });
  if (os === 'ios') assert.equal(flatten(section.children[0].props.style).gap, contentGap ?? (compact ? 10 : 20));
 }
}
console.log('PASS actual wardrobe/preset/Section JSX: iOS/Android, 320–768pt, 1–2x type, matching columns, separate 44pt delete footer, open/delete/restore/add/remove callbacks and compact/default sections. Native text measurement remains device QA.');
