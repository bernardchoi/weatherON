import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import ts from 'typescript';
let current,reduced=false,animations=[];
const React={createElement:(type,props,...children)=>({type,props:props??{},children}),
 useRef(v){const i=current.cursor++;return current.slots[i]??(current.slots[i]={current:v});},
 useState(v){const i=current.cursor++,owner=current;if(!(i in owner.slots))owner.slots[i]=v;return[owner.slots[i],next=>{owner.slots[i]=typeof next==='function'?next(owner.slots[i]):next;}];},
 useEffect(cb,deps){const i=current.cursor++,old=current.slots[i];if(!old||deps.some((x,j)=>x!==old.deps[j]))current.effects.push(()=>{old?.cleanup?.();current.slots[i]={deps,cleanup:cb()};});},
};
React.createContext=value=>({value});React.useContext=context=>context.value;React.useLayoutEffect=React.useEffect;React.forwardRef=fn=>fn;
function runner(fn){const owner={slots:[],effects:[],cursor:0};return{render(p){current=owner;owner.cursor=0;owner.effects=[];const tree=fn(p);for(const e of owner.effects)e();return tree;},dispose(){for(const s of owner.slots)s?.cleanup?.();}};}
class Value{constructor(v){this.value=v;}setValue(v){this.value=v;}stopAnimation(){}interpolate(c){return c;}}
const Animated={Value,Image:'AnimatedImage',View:'AnimatedView',createAnimatedComponent:c=>c,timing(value,config){const a={value,config,stopped:false,start(cb){this.cb=cb;},stop(){this.stopped=true;this.cb?.({finished:false});},finish(){if(!this.stopped){value.setValue(config.toValue);this.cb?.({finished:true});}}};animations.push(a);return a;},parallel(children){return{start(){for(const a of children)a.start();},stop(){for(const a of children)a.stop();}};}};
let layouts=[];
const rn={Image:{resolveAssetSource:()=>({width:100,height:200})},LayoutAnimation:{Types:{easeInEaseOut:'ease'},Properties:{opacity:'opacity'},configureNext:c=>layouts.push(c)},Animated,Platform:{OS:'android'},View:'View',Pressable:'Pressable',ScrollView:'ScrollView',Modal:'Modal',StyleSheet:{create:x=>x,flatten:x=>Object.assign({},...[x].flat(Infinity).filter(Boolean)),absoluteFill:{}},useWindowDimensions:()=>({height:800}),Easing:{bezier:(...v)=>v,in:x=>x,out:x=>x,cubic:0,exp:0}};
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
new Function('module','exports','require',code)(m,m.exports,id=>{if(id==='react')return React;if(id.endsWith('/localization/react-native'))return rn;if(id.endsWith('/AmbientReveal'))return load('apps/mobile/src/components/AmbientReveal.tsx');if(id.endsWith('/ambientMotion'))return load('apps/mobile/src/theme/ambientMotion.ts');if(id.endsWith('/useReducedMotion'))return{useReducedMotion:()=>reduced};if(id.endsWith('/AppThemeContext'))return{useAppTheme:()=>({})};if(id.endsWith('/tokens'))return{radius:{},spacing:{}};if(id.endsWith('/androidMaterial'))return{androidMaterialColor:()=>'',androidMaterialSurface:()=>({})};if(id.endsWith('/iosGlass'))return{iosGlassSurface:()=>undefined};if(id.endsWith('/IosSelectionSheet'))return{IosSelectionSheet:'IosSelectionSheet'};if(id.endsWith('/IosGlassBackdrop'))return{IosGlassBackdrop:'IosGlassBackdrop'};if(id.endsWith('/interactionFeedback'))return{triggerImportantActionHaptic(){}};throw Error(id);});cache.set(file,m.exports);return m.exports;}
function nodes(t,out=[]){if(!t||typeof t!=='object')return out;if(Array.isArray(t)){t.forEach(x=>nodes(x,out));return out;}out.push(t);nodes(t.children,out);return out;}
const tokens=load('apps/mobile/src/theme/ambientMotion.ts').ambientMotion;assert.equal(tokens.result,160);assert.equal(tokens.busyDelay,250);
const entranceModule=load('apps/mobile/src/components/AmbientReveal.tsx');
const motion=entranceModule.AmbientMotionContext;
for(const enabled of [false,true]){
 animations=[];motion.value={enabled,active:true,visit:1};
 const entry=runner(()=>entranceModule.useAmbientEntrance(2));
 const style=entry.render();assert.equal(style.transform[0].translateY.outputRange[0],14,'Entrance must visibly travel, not only change opacity');
 assert.equal(animations.length,enabled?1:0);
 if(enabled){const animation=animations.at(-1);assert.equal(animation.config.delay,120);assert.equal(animation.config.duration,340);assert.equal(animation.config.useNativeDriver,true);assert.equal(animation.value.value,0);}
 entry.render();assert.equal(animations.length,enabled?1:0,'Weather/data rerenders must not replay page entrance');
 motion.value={enabled:false,active:true,visit:1};entry.render();
 if(enabled){assert.equal(animations[0].stopped,true);assert.equal(animations[0].value.value,1,'Reduce Motion/background interruption lands on the full poster');}
 motion.value={enabled:true,active:true,visit:1};entry.render();assert.equal(animations.length,enabled?1:0,'Enabling motion must not replay a previously shown visit');
 motion.value={enabled:true,active:true,visit:2};entry.render();assert.equal(animations.length,enabled?2:1,'A new navigation visit gets a new entrance');
 motion.value={enabled:true,active:false,visit:2};entry.render();assert.equal(animations.at(-1).stopped,true);assert.equal(animations.at(-1).value.value,1);
 motion.value={enabled:true,active:true,visit:2};entry.render();assert.equal(animations.length,enabled?2:1,'Returning from background or a retained screen must not restart the entrance');
 entry.dispose();assert.ok(animations.every(a=>a.stopped));
}
const reveal=runner(()=>entranceModule.AmbientReveal({order:1,style:{gap:8},testID:'card',children:'readable content'},'native-ref'));
const revealed=reveal.render();assert.equal(revealed.props.ref,'native-ref');assert.equal(revealed.props.testID,'card');assert.equal(revealed.props.style[0].gap,8);assert.equal(revealed.children[0].children[0],'readable content');assert.equal(revealed.children[0].props.value.enabled,false,'Nested entrances do not multiply the page motion');reveal.dispose();
const Disclosure=load('apps/mobile/src/components/AmbientDisclosure.tsx').AmbientDisclosure;
for(const policy of [false,true,null]){reduced=policy;animations=[];const t=runner(Disclosure);let p={visible:false,children:'schedule controls'};let tree=t.render(p);tree.children[0].props.onLayout({nativeEvent:{layout:{height:120}}});tree=t.render(p);assert.equal(tree.props.pointerEvents,'none');assert.equal(tree.props.accessibilityElementsHidden,true);
p={...p,visible:true};tree=t.render(p);if(policy===false){for(const a of animations)a.finish();assert.equal(animations.at(-2).config.toValue,120);}else assert.equal(tree.props.style.height.value,120);
// Text growth is measured, not clipped to the old 260pt cap or scaled.
tree.children[0].props.onLayout({nativeEvent:{layout:{height:480}}});tree=t.render(p);if(policy===false){for(const a of animations)a.finish();assert.equal(animations.at(-2).config.toValue,480);}else assert.equal(tree.props.style.height.value,480);assert.equal(tree.props.style.maxHeight,undefined);assert.equal(tree.props.style.transform,undefined);
t.render({...p,visible:false});const closing=animations.slice(-2);tree=t.render(p);for(const a of closing)a.finish();tree=t.render(p);assert.notEqual(tree,null,'Interrupted close never unmounts reopened content');assert.equal(tree.props.pointerEvents,'auto');t.dispose();}
const Wrapper=load('apps/mobile/src/components/BottomSheet.tsx').BottomSheet;const Legacy=Wrapper({}).type;
for(const policy of [false,true,null]){reduced=policy;animations=[];const t=runner(Legacy);const p={visible:true,onClose(){},accessibilityLabel:'Options',children:'chosen rows'};t.render(p);let tree=t.render(p);if(policy===false&&animations.length)animations.at(-1).finish();tree=t.render({...p,visible:false,children:null});if(policy===false){assert.equal(nodes(tree).find(n=>n.type==='ScrollView').children[0],'chosen rows','Closing keeps content instead of blanking the panel');const closing=animations.at(-1);t.render(p);closing.cb({finished:true});assert.notEqual(t.render(p),null,'Stale close completion cannot unmount reopened sheet');animations.at(-1).finish();t.render({...p,visible:false});animations.at(-1).finish();}assert.equal(t.render({...p,visible:false}),null);t.dispose();}
const Feedback=load('apps/mobile/src/components/FeedbackPressable.tsx').FeedbackPressable;reduced=false;animations=[];const press=runner(Feedback);let actions=0;let tree=press.render({onPress:()=>actions++,style:{transform:[{translateX:2}]}});tree.props.onPressIn({});assert.equal(animations.at(-1).config.duration,tokens.pressIn);assert.equal(animations.at(-1).config.toValue,0.975,'Press feedback is now visibly tactile');tree.props.onPress({});assert.equal(actions,1,'Input is delivered before animation finishes');tree.props.onPressOut({});assert.equal(animations.at(-1).config.toValue,1);reduced=true;tree=press.render({onPress:()=>actions++});assert.equal(tree.props.style[1].transform.at(-1).scale.value,1,'Reduce Motion change releases an in-flight press');press.dispose();
console.log('PASS actual entrance hook: staggered native transforms, one play per route visit, no data/foreground/preference replay, interrupted cleanup, ref/layout forwarding and balanced immediate press response.');
console.log('PASS actual Ambient disclosure measurement, large type, rapid reversals, hidden accessibility; Android sheet retained content/close-reopen guards and Reduce Motion; immediate press actions/reset/cleanup. Native layout/gestures remain device QA.');

// Run the actual identity/measurement path, not a source-code contract.
const outfitModule=load('apps/mobile/src/components/OutfitMotion.tsx');
assert.deepEqual(outfitModule.fitOutfitImage({x:10,y:20,width:100,height:100},{width:100,height:200}),{x:35,y:20,width:50,height:100});
for(const width of [0,-1,NaN,Infinity]) assert.equal(outfitModule.fitOutfitImage({x:0,y:0,width,height:100},{width:100,height:200}),null);
const imageMotion=outfitModule.OutfitMotionContext;
let registrations=0,unregistrations=0;
imageMotion.value={transfer:null,register(){registrations++;return()=>unregistrations++;},layout(){}};
motion.value={enabled:false,motionAllowed:true,active:true,visit:1,scene:'C1'};
animations=[];
const itemImage=runner(outfitModule.OutfitMotionImage);
const itemProps=id=>({outfitItemId:id,imageKey:id+'.png',source:{uri:id+'.png'},style:{transform:[{rotate:'2deg'}]},resizeMode:'contain'});
let imageTree=itemImage.render(itemProps('coat'));
imageTree.children[0].props.onLayout({nativeEvent:{layout:{x:4,y:6,width:80,height:120}}});
itemImage.render(itemProps('coat'));assert.equal(animations.length,0,'Recreated source objects and unchanged recommendations stay fixed');assert.equal(registrations,1);
imageTree=itemImage.render(itemProps('shirt'));imageTree=itemImage.render(itemProps('shirt'));
assert.equal(animations.length,1);assert.equal(animations[0].config.duration,tokens.change);
assert.equal(imageTree.children[0].props.source.uri,'shirt.png','Current recommendation is published immediately');
assert.equal(imageTree.children[0].props.style[1].transform[0].rotate,'2deg');
assert.equal(imageTree.children[1].props.pointerEvents,'none');assert.equal(imageTree.children[1].props.accessibilityElementsHidden,true);
const staleSwap=animations[0];itemImage.render(itemProps('boots'));staleSwap.cb({finished:true});
assert.notEqual(itemImage.render(itemProps('boots')).children[1],null,'Stale completion cannot erase a newer swap');
motion.value={...motion.value,motionAllowed:false};itemImage.render(itemProps('boots'));
assert.equal(itemImage.render(itemProps('boots')).children[1],null,'Reduce Motion immediately clears retained decoration');
assert.equal(animations.at(-1).stopped,true);
motion.value={...motion.value,motionAllowed:true,active:false};itemImage.render(itemProps('scarf'));assert.equal(animations.length,2,'Hidden screens never animate changed items');
itemImage.dispose();assert.equal(registrations,unregistrations,'Native image registrations clean up');

const host=runner(p=>outfitModule.useOutfitTransitionHost(p.route,p.enabled));
let hostProps={route:'H1',enabled:true},h=host.render(hostProps),navigations=0;
h.root.current={measureInWindow:cb=>cb(0,0,440,800)};
const sourceRef={current:{measureInWindow:cb=>cb(200,220,100,100)}};
h.context.register('H1','coat',{ref:sourceRef,source:{uri:'coat.png'},imageKey:'coat',natural:()=>({width:100,height:200})});
h.context.open('H1','coat','C1',()=>navigations++);assert.equal(navigations,1);
h=host.render(hostProps);assert.equal(h.pendingRoute,'C1');
h.context.register('C1','coat',{ref:{current:{measureInWindow:cb=>cb(20,100,180,240)}},source:{uri:'coat.png'},imageKey:'coat',natural:()=>({width:100,height:200})});
hostProps={...hostProps,route:'C1'};host.render(hostProps);h=host.render(hostProps);
assert.deepEqual(h.context.transfer.to,{x:50,y:100,width:120,height:240});
assert.equal(h.overlay.props.transfer.from.width,50);assert.equal(h.overlay.props.transfer.to.width,120,'Image grows with intrinsic aspect ratio');
const flightProps={...h.overlay.props,transfer:{...h.overlay.props.transfer,toScene:'C4'}};
const detailFlight=runner(h.overlay.type);
assert.equal(detailFlight.render({...flightProps,transfer:{...flightProps.transfer,to:undefined}}),null,'No detail overlay may occupy the old headline position while measuring');
const detailTree=detailFlight.render(flightProps);
assert.equal(detailTree.props.style.overflow,'hidden');assert.equal(detailTree.props.style.top,flightProps.transfer.to.y);assert.equal(detailTree.props.style.left,flightProps.transfer.to.x);
assert.equal(detailTree.children[0].props.testID,'outfit-detail-reveal');assert.equal(detailTree.children[0].props.style[1].transform.length,1,'Detail image only scales inside its target, never travels over text');
assert.equal(animations.at(-1).config.duration,500);assert.deepEqual(animations.at(-1).config.easing,[.3,.2,.2,1]);detailFlight.dispose();
h.overlay.props.onComplete();h=host.render(hostProps);assert.equal(h.context.transfer,null);
// No native response still delivers input once, including accessibility interruption.
hostProps={route:'H1',enabled:true};h=host.render(hostProps);
let lateMeasure;sourceRef.current={measureInWindow:cb=>lateMeasure=cb};
h.context.open('H1','coat','C1',()=>navigations++);hostProps.enabled=false;host.render(hostProps);
await new Promise(r=>setTimeout(r,100));assert.equal(navigations,2,'Changing Reduce Motion cannot trap pending navigation');
lateMeasure(200,220,100,100);assert.equal(navigations,2,'Late measurement cannot deliver twice');
// A later direct fallback cancels the prior pending action.
hostProps.enabled=true;h=host.render(hostProps);h.context.open('H1','coat','C1',()=>navigations++);
h.context.open('H1','missing','C4',()=>navigations++);await new Promise(r=>setTimeout(r,100));assert.equal(navigations,3);
sourceRef.current={measureInWindow:cb=>cb(500,0,100,100)};h.context.open('H1','coat','C1',()=>navigations++);
h=host.render(hostProps);assert.equal(h.context.transfer,null,'Offscreen images use ordinary navigation');assert.equal(navigations,4);
sourceRef.current={measureInWindow:cb=>cb(200,220,100,100)};h.context.open('H1','coat','C1',()=>navigations++);
h=host.render(hostProps);hostProps.route='C4';host.render(hostProps);h=host.render(hostProps);assert.equal(h.context.transfer,null,'Unrelated navigation clears the image');
hostProps.route='H1';h=host.render(hostProps);h.context.open('H1','coat','C1',()=>navigations++);
h=host.render(hostProps);h.onLayout({nativeEvent:{layout:{width:440,height:800}}});h.onLayout({nativeEvent:{layout:{width:800,height:440}}});assert.equal(host.render(hostProps).context.transfer,null,'Rotation discards old coordinates');
h=host.render(hostProps);sourceRef.current={measureInWindow:cb=>lateMeasure=cb};let replacementNavigations=0;
h.context.open('H1','coat','C1',()=>replacementNavigations++);
h.context.register('H1','coat',{ref:sourceRef,source:{uri:'updated.png'},imageKey:'updated',natural:()=>({width:100,height:200})});
lateMeasure(200,220,100,100);assert.equal(replacementNavigations,1);assert.equal(host.render(hostProps).context.transfer,null,'A recommendation changed during measurement cannot fly the old image');
host.dispose();

animations=[];motion.value={enabled:false,motionAllowed:true,active:true,visit:1,scene:'H1'};
const changed=runner(entranceModule.AmbientChange);
let changedTree=changed.render({changeKey:'A',order:2,children:'A weather'});assert.equal(animations.length,0);
changedTree=changed.render({changeKey:'B',order:2,children:'B warning'});assert.equal(changedTree.props.children,'B warning','Warnings/data never wait for their visual cue');assert.equal(animations[0].config.delay,120);
changed.render({changeKey:'B',order:2});assert.equal(animations.length,1,'Unchanged destination/weather does not replay');
motion.value={...motion.value,motionAllowed:false};changed.render({changeKey:'B',order:2});assert.equal(animations[0].stopped,true);assert.equal(animations[0].value.value,1);changed.dispose();
const wardrobeMotion=load('apps/mobile/src/components/useWardrobeMotion.ts').useWardrobeMotion;
let mutations=0;rn.Platform.OS='ios';
for(const allowed of [false,true]){motion.value={active:true,motionAllowed:allowed};const update=wardrobeMotion();layouts=[];update(()=>mutations++);assert.equal(layouts.length,allowed?1:0);if(allowed)assert.equal(layouts[0].duration,300);}
assert.equal(mutations,2,'Wardrobe persistence/delete/undo are invoked immediately');
motion.value={active:false,motionAllowed:true};layouts=[];wardrobeMotion()(()=>mutations++);assert.equal(layouts.length,0);
console.log('PASS actual outfit motion: intrinsic geometry, unchanged-item stability, rapid swaps, decorative accessibility, native registration cleanup, source/target measurement, timeout/late callback, reduced motion, latest action, offscreen, route interruption and rotation. Destination cues are immediate/one-shot; wardrobe mutations never wait.');
