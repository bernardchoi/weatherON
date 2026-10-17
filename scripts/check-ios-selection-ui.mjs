import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';

// Execute real component/hook modules with native boundaries mocked. No stored
// app settings, network, device haptics or native rendering are used here.
let os='ios', reduceMotion=true, haptics=0, current, animations=[];
const theme={name:'light',card:'#DEF0F2',text:'#183642',clear:'#AA2C1F',muted:'#526F79',border:'#CDDDE0',subtle:'#526F79'};
const React={isValidElement:v=>Boolean(v && typeof v === "object" && "type" in v),createElement:(type,props,...children)=>({type,props:props??{},children}),
 useMemo(fn,deps){const i=current.cursor++,old=current.slots[i];if(!old||deps.some((v,k)=>v!==old.deps[k]))current.slots[i]={deps,value:fn()};return current.slots[i].value;},
 useCallback(fn,deps){return this.useMemo(()=>fn,deps);},
 useRef(value){const i=current.cursor++;return current.slots[i]??(current.slots[i]={current:value});},
 useState(value){const i=current.cursor++,owner=current;if(!(i in owner.slots))owner.slots[i]=value;return [owner.slots[i],next=>{owner.slots[i]=typeof next==='function'?next(owner.slots[i]):next;}];},
 useEffect(effect,deps){const i=current.cursor++,old=current.slots[i];if(!old||deps.some((v,k)=>v!==old.deps[k])){current.effects.push(()=>{old?.cleanup?.();current.slots[i]={deps,cleanup:effect()};});}},
};
function runner(fn){const owner={slots:[],cursor:0,effects:[]};return {render(props){current=owner;owner.cursor=0;owner.effects=[];const tree=fn(props);for(const effect of owner.effects)effect();return tree;},dispose(){for(const slot of owner.slots)slot?.cleanup?.();}};}
class Value {constructor(v){this.value=v;}stopAnimation(){}setValue(v){this.value=v;}interpolate(config){return config;}}
const rn={PanResponder:{create:handlers=>({panHandlers:handlers})},Platform:{get OS(){return os;}},Image:'Image',RawText:'RawText',Text:'Text',View:'View',Pressable:'Pressable',Modal:'Modal',ScrollView:'ScrollView',StyleSheet:{create:v=>v,hairlineWidth:0.5,absoluteFill:{}},useWindowDimensions:()=>({width:390,height:844}),Easing:{in:v=>v,out:v=>v,cubic:1},Animated:{Value,View:'AnimatedView',timing(value,config){const animation={config,stopped:false,start(cb){this.cb=cb;},stop(){this.stopped=true;this.cb?.({finished:false});},finish(){if(!this.stopped){value.setValue(config.toValue);this.cb?.({finished:true});}}};animations.push(animation);return animation;}}};
const cache=new Map();function load(relative){const file=path.resolve(relative);if(cache.has(file))return cache.get(file);const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;new Function('module','exports','require',code)(m,m.exports,id=>{
 if(id==='react')return React;
 if(id==='react-native-svg')return {__esModule:true,default:'Svg',Path:'Path',Rect:'Rect'};
 if(id.endsWith('/assets'))return {uiIconAssets:{shoe:'existing-shoe'}};
 if(id.endsWith('/tokens'))return {radius:{},spacing:{}};
 if(id.endsWith('/BottomSheet'))return {BottomSheet:'BottomSheet'};
 if(id.endsWith('/IosSelectionRow')||id.endsWith('/WardrobeCategoryIcon'))return load(path.resolve(path.dirname(file),id+'.tsx'));
 if(id.endsWith('/outfitLabels'))return load(path.resolve(path.dirname(file),id+'.ts')); if(id.endsWith('/localization/react-native'))return rn;
 if(id==='react-native-safe-area-context')return {useSafeAreaInsets:()=>({top:24,bottom:24})};
 if(id.endsWith('/AppThemeContext'))return {useAppTheme:()=>theme};if(id.endsWith('/useReducedMotion'))return {useReducedMotion:()=>reduceMotion};
 if(id.endsWith('/confirmedInteractionFeedback'))return {triggerConfirmedSelectionHaptic:()=>haptics++};
 if(id.endsWith('/ambientAssets'))return {ambientUiIcons:{check:'check',tabOutfit:'existing-shirt',wardrobeAll:'all',wardrobeOuter:'outer',wardrobeBottom:'bottom',wardrobeShoes:'shoes',wardrobeAccessory:'accessory'}};
 if(id.endsWith('/HomePlanMaterial'))return {HomePlanMaterial:'NativeOrOpaqueMaterial'};
 if(id.endsWith('/FeedbackPressable'))return {FeedbackPressable:'FeedbackPressable'};
 throw Error('Unmocked boundary '+id);
 });cache.set(file,m.exports);return m.exports;}
const hook=load('apps/mobile/src/hooks/useConfirmedOptionFeedback.ts').useConfirmedOptionFeedback;
for(const platform of ['ios','android']){os=platform;haptics=0;const test=runner(hook);let feedback=test.render('a');assert.equal(haptics,0);feedback.request('a');test.render('a');assert.equal(haptics,0);feedback.request('b');test.render('a');assert.equal(haptics,0);test.render('b');assert.equal(haptics,platform==='ios'?1:0);test.render('b');assert.equal(haptics,platform==='ios'?1:0);feedback=test.render('b');feedback.request('c');feedback.cancel();test.render('c');assert.equal(haptics,platform==='ios'?1:0);test.dispose();}
os='ios';
const Sheet=load('apps/mobile/src/components/IosSelectionSheet.tsx').IosSelectionSheet;
function nodes(tree){const all=[];function visit(n){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(visit);return;}all.push(n);n.children?.forEach(visit);}visit(tree);return all;}
for(const reduced of [true,null,false]){
 reduceMotion=reduced;animations=[];let closed=0;
 const test=runner(Sheet),props={visible:true,onClose:()=>closed++,accessibilityLabel:'Options',children:'rows'};
 let tree=test.render(props);tree.props.onShow();if(reduced===false)animations.at(-1).finish();
 assert.equal(tree.type,'Modal');assert.equal(nodes(tree).filter(n=>n.type==='NativeOrOpaqueMaterial').length,1);
 const panel=nodes(tree).find(n=>n.props.accessibilityViewIsModal);
 panel.props.onLayout({nativeEvent:{layout:{height:350}}});
 tree=test.render(props);
 const transform=nodes(tree).find(n=>n.props.accessibilityViewIsModal).props.style[1].transform[0].translateY;
 assert.equal(transform.outputRange[0],376,'closing must move the entire measured sheet below the bottom inset');
 tree.props.onRequestClose();nodes(tree).find(n=>n.props.accessibilityLabel==='닫기').props.onPress();
 assert.equal(closed,reduced===false?0:1,'dismiss must be coalesced, with parent callback deferred until exit');
 if(reduced===false){assert.equal(test.render(props).type,'Modal');assert.equal(animations.at(-1).config.useNativeDriver,true);animations.at(-1).finish();}
 assert.equal(closed,1);assert.equal(test.render({...props,visible:false}),null);
 // Reopen, interrupt an external close, ignore the stale completion.
 test.render(props);tree=test.render(props);tree.props.onShow();if(reduced===false)animations.at(-1).finish();
 const outgoing=test.render({...props,visible:false,children:'cleared rows'});
 if(reduced===false)assert.equal(nodes(outgoing).find(n=>n.type==='ScrollView').children[0],'rows','parent content reset must not collapse outgoing sheet');
 if(reduced===false){const closing=animations.at(-1);test.render(props);closing.finish();assert.equal(test.render(props).type,'Modal');animations.at(-1).finish();test.render({...props,visible:false});animations.at(-1).finish();}
 assert.equal(test.render({...props,visible:false}),null);test.dispose();
}
// Only header drags capture; tiny, horizontal or upward motions and content scrolling do not.
for(const reduced of [false,true,null]){
 reduceMotion=reduced;let closed=0;
 const test=runner(Sheet),props={visible:true,onClose:()=>closed++,accessibilityLabel:'Options',children:'rows'};
 let tree=test.render(props);tree.props.onShow();if(reduced===false)animations.at(-1).finish();
 const panel=nodes(tree).find(n=>n.props.accessibilityViewIsModal);
 panel.props.onLayout({nativeEvent:{layout:{height:350}}});tree=test.render(props);
 const handle=nodes(tree).find(n=>n.props.testID==='selection-sheet-drag-handle').props;
 assert.equal(nodes(tree).find(n=>n.type==='ScrollView').props.onMoveShouldSetPanResponder,undefined);
 for(const [dx,dy] of [[0,3],[20,10],[0,-30]])assert.equal(handle.onMoveShouldSetPanResponder(null,{dx,dy}),false);
 assert.equal(handle.onMoveShouldSetPanResponder(null,{dx:0,dy:20}),true);
 handle.onPanResponderGrant();handle.onPanResponderMove(null,{dy:20});handle.onPanResponderRelease(null,{dy:20,vy:0.1});
 if(reduced===false)animations.at(-1).finish();assert.equal(closed,0,'short drag returns to origin');
 handle.onPanResponderGrant();handle.onPanResponderTerminate();if(reduced===false)animations.at(-1).finish();
 assert.equal(closed,0,'cancelled gesture returns to origin');
 handle.onPanResponderGrant();handle.onPanResponderMove(null,{dy:110});handle.onPanResponderRelease(null,{dy:110,vy:0.1});
 handle.onPanResponderRelease(null,{dy:110,vy:1});
 if(reduced===false){assert.equal(closed,0);animations.at(-1).finish();}assert.equal(closed,1);
 test.dispose();
}
// Fast downward flick clears the velocity threshold without a long drag.
reduceMotion=false;
{
 let closed=0;const test=runner(Sheet),props={visible:true,onClose:()=>closed++,children:'rows'};
 let tree=test.render(props);tree.props.onShow();animations.at(-1).finish();
 const h=nodes(tree).find(n=>n.props.testID==='selection-sheet-drag-handle').props;
 h.onPanResponderGrant();h.onPanResponderRelease(null,{dy:20,vy:1});animations.at(-1).finish();assert.equal(closed,1);test.dispose();
}
console.log('PASS sheet motion: measured offscreen exit, native settle, delayed/coalesced dismiss, interrupted close/reopen, header-only distance/velocity drag, cancellation/snap-back and Reduce Motion.');
const Row=load('apps/mobile/src/components/IosSelectionRow.tsx').IosSelectionRow;
for(const selected of [true,false])for(const disabled of [true,false]){const tree=Row({label:'A long option label that must wrap without truncation',description:'Supporting explanation',icon:'icon',selected,disabled,onPress(){}});assert.equal(tree.props.disabled,disabled);assert.deepEqual(tree.props.accessibilityState,{selected,disabled});assert.equal(tree.props.hapticFeedback,'none');assert.ok(tree.props.style[0].minHeight>=44);assert.equal(nodes(tree).filter(n=>n.type==='NativeOrOpaqueMaterial').length,0);for(const n of nodes(tree).filter(n=>n.type==='Text'))assert.equal(n.props.numberOfLines,undefined);}
console.log('PASS selection UI: confirmed-only iOS feedback; rejected/same/cancel/Android silent; sheet dismiss and interrupted close/reopen; Reduce Motion/unknown immediate; single shared material; disabled/selected accessibility and wrapping touch rows. Native visuals remain separate QA.');

// Verify every real category option produces a distinct, appropriately sized
// glyph. Filled raster variants remain decorative.
const Icon=load('apps/mobile/src/components/WardrobeCategoryIcon.tsx').WardrobeCategoryIcon;
const Filter=load('apps/mobile/src/components/WardrobeFilterControls.tsx').WardrobeFilterControls;
const filterTest=runner(Filter), filterProps={categoryFilter:'all',seasonFilter:'all',purposeFilter:'all',onCategoryChange(){},onSeasonChange(){},onPurposeChange(){}};
let filterTree=filterTest.render(filterProps);
nodes(filterTree).find(n=>n.type?.name==='WardrobeFilterSelect'&&n.props.label==='종류').props.onPress();
filterTree=filterTest.render(filterProps);
const rows=nodes(filterTree).filter(n=>n.type?.name==='IosSelectionRow');
assert.deepEqual(rows.map(n=>n.props.icon.props.category),['all','outer','top','bottom','shoes','accessory']);
const signatures=new Set();
for(const row of rows){const category=row.props.icon.props.category;const glyph=Icon({category,color:'#123456',size:22});signatures.add(JSON.stringify([glyph.type,glyph.props.source,glyph.children]));
 for(const color of ['#526F79','#AA2C1F','#B9D4DD','#FFB52E'])for(const size of [16,22]){const glyph=Icon({category,color,size});assert.equal(glyph.props.accessible,false);if(glyph.type==='Image'){assert.equal(glyph.props.style.width,size);assert.equal(glyph.props.style.tintColor,color);}else{assert.equal(glyph.props.width,size);assert.equal(glyph.props.stroke,color);assert.equal(glyph.props.strokeWidth,1.75);assert.equal(glyph.props.viewBox,'0 0 24 24');}}
}
assert.equal(signatures.size,6);
filterTest.dispose();
console.log('PASS wardrobe categories: actual six-option mapping, six distinct filled glyphs, 16/22 sizes and selected/unselected light/dark color forwarding.');

// UIVisualEffectView must not inherit partial alpha from any ancestor.
// Apple documents that offscreen composition can suppress the native effect.
function flatStyle(value) { return Array.isArray(value) ? Object.assign({}, ...value.map(flatStyle)) : value ?? {}; }
function checkGlassAncestors(node, ancestors = []) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach(child => checkGlassAncestors(child, ancestors));
  if (node.type === 'NativeOrOpaqueMaterial') for (const ancestor of ancestors) {
    const opacity = flatStyle(ancestor.props?.style).opacity;
    assert.ok(opacity === undefined || opacity === 1, 'Native glass must not inherit animated/partial opacity');
  }
  node.children?.forEach(child => checkGlassAncestors(child, [...ancestors, node]));
}
reduceMotion = false;
const materialTest = runner(Sheet);
checkGlassAncestors(materialTest.render({visible:true,onClose(){},accessibilityLabel:'Options',children:'rows'}));
materialTest.dispose();
console.log('PASS: native glass ancestors retain full alpha while the separate dimming layer can fade.');
