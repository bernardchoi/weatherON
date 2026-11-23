import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const spacingSource=fs.readFileSync('apps/mobile/src/theme/homeViewport.ts','utf8');
const context={exports:{}};
vm.runInNewContext(ts.transpileModule(spacingSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
const resolve=context.exports.resolveHomeViewportSpacing;
for(const available of [450,600,757,790,850]){
  const values=resolve(available);
  assert.ok(Object.values(values).every(v=>Number.isFinite(v)&&v>=6));
  assert.equal(values.planMargin,available<800?8:12);
  assert.ok(!('fontSize' in values)&&!('height' in values));
}
const density=context.exports.resolveHomeCardDensity;
for(const height of [0,390,580,679,680,757,799,800,950])
for(const width of [288,320,335,375,390,440,744])
for(const scale of [1,1.3,1.31,2,3.12]) {
 const d=density(height,width,scale);
 assert.equal(d.compact,height>0&&height<800&&scale<=1.3);
 assert.equal(d.stackOutfit,scale>1.3||width<(d.compact?335:390));
 if (d.compact) assert.ok(d.outfitPhotoHeight<96&&d.heroLine<92);
 if (scale>1.3) assert.equal(d.outfitPhotoHeight,96);
}
const source=fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');
const ast=ts.createSourceFile('HomeScreen.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let scroll;
function visit(node){if(ts.isJsxOpeningElement(node)&&node.tagName.getText(ast)==='AmbientHomeScrollView'&&node.attributes.getText(ast).includes('home-scroll'))scroll=node;ts.forEachChild(node,visit)}visit(ast);
assert.ok(scroll);assert.ok(source.includes('Platform.OS === "ios" ? Animated.ScrollView : ScrollView'));
const attrs=scroll.attributes.getText(ast);
assert.ok(source.includes('const viewportHeight = useContext(HomeViewportContext)'));
const stackSource=fs.readFileSync('apps/mobile/src/components/NavigationStack.tsx','utf8');
assert.ok(stackSource.includes('setViewportHeight(event.nativeEvent.layout.height)'));
assert.ok(stackSource.includes('outfitMotion.onLayout(event)'), 'Image-flight coordinates also follow the persistent viewport resize');
assert.ok(stackSource.includes('<HomeViewportContext.Provider value={viewportHeight}>'));
assert.ok(attrs.includes('onContentSizeChange={(_, height) => setContentHeight(height)}'));
assert.ok(!/scrollEnabled|maximumZoomScale|height:|maxHeight:|overflow:/.test(attrs),'Keep natural scrolling and uncapped content for small screens, large text, translated/status content.');
assert.ok(source.includes('state.weatherProvider.status !== "ready"'));
assert.ok(source.includes('<SpecialWeatherAlertCard'));
console.log('PASS: real measured viewport drives spacing and compact visual density; 450–850pt bounds; ScrollView retains natural overflow and refresh; mandatory weather states remain. Physical small-screen/large-font scrolling is not proven by this source check.');
