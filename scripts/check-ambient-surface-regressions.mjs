import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { transformSync } from '@babel/core';
const require = createRequire(import.meta.url);
const root = process.cwd();
const rnRoot = path.dirname(require.resolve('react-native/package.json'));
// Execute installed RN gradient/color parsing. Only its platform identity is mocked.
const nativeCache = new Map();
function nativeLoad(file) {
  if (nativeCache.has(file)) return nativeCache.get(file);
  const module = { exports: {} }; nativeCache.set(file, module.exports);
  const code = transformSync(readFileSync(file, 'utf8'), { babelrc: false, configFile: false,
    plugins: ['@babel/plugin-transform-flow-strip-types', '@babel/plugin-transform-modules-commonjs'] }).code;
  new Function('module','exports','require', code)(module,module.exports,id => {
    if (id === '../Utilities/Platform') return { default: { OS: 'ios' } };
    return id.startsWith('.') ? nativeLoad(path.resolve(path.dirname(file), id + '.js')) : require(id);
  }); return module.exports;
}
const parseGradient = nativeLoad(path.join(rnRoot,'Libraries/StyleSheet/processBackgroundImage.js')).default;
function loadTS(file, boundaries, cache = new Map()) {
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} }; cache.set(file,module.exports);
  const code = ts.transpileModule(readFileSync(file,'utf8'), { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  new Function('module','exports','require','__DEV__',code)(module,module.exports,id => {
    if (id in boundaries) return boundaries[id];
    assert.ok(id.startsWith('.'), `unexpected dependency ${id}`);
    return loadTS(path.resolve(path.dirname(file),id+(existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx')),boundaries,cache);
  },true); return module.exports;
}
function harness(options = {}) {
  const h = { slots: [], cursor: 0, pending: [], animations: [], motionEvent: null, appEvent: null,
    reduceMotion: false, appState: 'active', ...options };
  const react = {
    useRef(value) { const i=h.cursor++; return h.slots[i] ??= { current:value }; },
    useState(value) { const i=h.cursor++; const slot=h.slots[i] ??= { value }; return [slot.value, value => { slot.value=typeof value==='function'?value(slot.value):value; }]; },
    useEffect(fn,deps) { const i=h.cursor++; const old=h.slots[i]; if (!old || deps.some((v,n)=>v!==old.deps[n])) h.pending.push({i,fn,deps}); },
    Fragment: 'Fragment',
  };
  class ValueXY { constructor(point) { this.x=new Value(point.x);this.y=new Value(point.y); } getTranslateTransform(){return [{translateX:this.x},{translateY:this.y}];} }
  class Value { constructor(value) { this.value=value; } setValue(value) { this.value=value; } stopAnimation() {} interpolate(config) { return { interpolation:config, interpolate(next) { return { interpolation: next }; } }; } }
  const animation = (kind, config) => { const a={kind,config,starts:0,stops:0,start(){this.starts++;},stop(){this.stops++;}};h.animations.push(a);return a; };
  const native = { View:'View', StyleSheet:{absoluteFill:{position:'absolute',top:0,left:0,right:0,bottom:0}}, Platform:{OS:'ios'},
    Easing:{linear:()=>{},sin:()=>{},inOut:()=>{}}, useWindowDimensions:()=>({width:440,height:956}),
    Animated:{View:'AnimatedView',Value,ValueXY,add:(...nodes)=>({math:'add',nodes,interpolate(config){return {interpolation:config}}}),multiply:(...nodes)=>({math:'multiply',nodes}),subtract:(...nodes)=>({math:'subtract',nodes}),timing:(v,c)=>animation('timing',c),sequence:c=>animation('sequence',c),loop:c=>animation('loop',c)},
    AppState:{currentState:h.appState,addEventListener:(name,fn)=>{h.appEvent=fn;return {remove(){h.appEvent=null;}};}},
    AccessibilityInfo:{isReduceMotionEnabled:()=>h.reduceMotion===null?new Promise(()=>{}):h.reduceMotion==='failure'?Promise.reject(new Error('unavailable')):Promise.resolve(h.reduceMotion),
      addEventListener:(name,fn)=>{h.motionEvent=fn;return {remove(){h.motionEvent=null;}};}},
  };
  const boundaries={'react':react,'react/jsx-runtime':{jsx:(type,props)=>typeof type==='function'?type(props):({type,props}),jsxs:(type,props)=>typeof type==='function'?type(props):({type,props})},'../localization/react-native':native,'./AmbientSurfaceTexture':{AmbientSurfaceTexture:'NativeSurfaceTexture'}};
  const component=loadTS(path.join(root,'apps/mobile/src/components/AmbientSurfaceBackground.tsx'),boundaries).AmbientSurfaceBackground;
  h.props={theme:{name:'dark',reducedTransparency:false},condition:'cloud',windMs:4,precipitationMm:0,reliable:true,touchPulse:0,lowPowerMode:false,touchContact:{id:0,phase:'cancel'},touchPoint:new ValueXY({x:80,y:230})};
  h.render=(props={})=>{h.props={...h.props,...props};h.cursor=0;h.pending=[];h.tree=component(h.props);for(const e of h.pending){h.slots[e.i]?.cleanup?.();h.slots[e.i]={deps:e.deps,cleanup:e.fn()};}return h.tree;};
  h.initialize=async props=>{h.render(props);await Promise.resolve();await Promise.resolve();h.render();return h;};
  h.unmount=()=>h.slots.forEach(s=>s.cleanup?.());
  return h;
}
function nodes(tree,result=[]) { if (!tree || typeof tree !=='object')return result;if(Array.isArray(tree)){tree.forEach(t=>nodes(t,result));return result;}result.push(tree);nodes(tree.props?.children,result);return result; }
const style=node=>Object.assign({},...[node.props?.style].flat(Infinity).filter(Boolean));
const started=h=>h.animations.filter(a=>a.starts);
const gradients=h=>nodes(h.tree).map(n=>({...style(n),testID:n.props?.testID})).filter(s=>s.experimental_backgroundImage);
// Root-mounted sky keeps reading and touch coordinates aligned with safe-area content.
const shifted=await harness().initialize({condition:'clear',daylight:{phase:'night',season:'autumn'},contentOrigin:{x:12,y:62},readingAreas:[{x:0,y:0,width:440,height:758}]});
assert.ok(nodes(shifted.tree).some(n=>style(n).left===12&&style(n).top===62),'local touch canvas retains the content origin');
const skyNode=nodes(shifted.tree).find(n=>n.props?.testID==='ambient-night-sky');
assert.equal(style(skyNode).height,956,'root sky includes status and home-indicator areas');
shifted.unmount();
const h=await harness().initialize();
assert.equal(h.tree.props.pointerEvents,'none');assert.equal(h.tree.props.accessibilityElementsHidden,true);
assert.equal(h.tree.props.importantForAccessibility,'no-hide-descendants');
assert.equal(started(h).length,1);assert.equal(started(h)[0].kind,'loop');
for (const theme of ['dark','light']) { h.render({theme:{name:theme,reducedTransparency:false}});for(const s of gradients(h))assert.ok(parseGradient(s.experimental_backgroundImage).length>0,'real RN must parse every gradient'); }
assert.ok(gradients(h).some(s=>parseGradient(s.experimental_backgroundImage).length>=2),'base surface has multiple moving layers');
const flow=style(nodes(h.tree).find(n=>n.props?.testID==='ambient-base-flow'));assert.ok(flow.transform.some(v=>v.translateY&&Math.max(...v.translateY.interpolation.outputRange)-Math.min(...v.translateY.interpolation.outputRange)>=60),'actual base has surface displacement, not just tiny scale');
const baseQA=await harness().initialize();const qaNative=nodes(baseQA.tree).find(n=>n.type==='NativeSurfaceTexture');qaNative.props.onPowerState({nativeEvent:{lowPower:false,baseOnly:true}});baseQA.render();assert.ok(nodes(baseQA.tree).some(n=>n.props?.testID==='ambient-base-flow'));assert.equal(nodes(baseQA.tree).some(n=>n.props?.testID==='ambient-weather-region'||n.props?.testID==='ambient-night-sky'||n.props?.testID==='ambient-touch-layer'),false,'development base-only mode truly excludes weather and touch');baseQA.unmount();

// Sunlight is weather/solar driven in both UI themes; no icon-sized or opaque panel.
for (const name of ['light','dark']) for (const solar of ['day','twilight','night']) {
 const q=await harness().initialize({theme:{name,reducedTransparency:false},condition:'clear',daylight:{phase:solar,season:'autumn'}});
 const sun=nodes(q.tree).find(n=>n.props?.testID==='ambient-day-sunlight');
 assert.equal(!!sun,solar!=='night','actual night never shows sunlight, regardless of UI theme');
 if(sun){const s=style(sun);assert.ok(s.width>440&&s.height>956,'source spans measured sky with overscan');assert.equal(s.backgroundColor,undefined);const layers=parseGradient(s.experimental_backgroundImage);assert.equal(layers.length,4,'source/halo and two soft rays parse in actual RN');for(const layer of layers)assert.ok(layer.colorStops.some(stop=>typeof stop.color==='number'&&((stop.color>>>24)&255)===0),'each field has transparent falloff');assert.ok(s.transform.some(v=>v.rotate),'rays drift through common native phase');}
 q.unmount();
}
for(const condition of ['cloud','rain','snow','fog']){const q=await harness().initialize({condition,daylight:{phase:'day',season:'autumn'}});assert.equal(nodes(q.tree).some(n=>n.props?.testID==='ambient-day-sunlight'),false);q.unmount();}
console.log('PASS: full-sky transparent sunlight; common phase; solar/UI-theme independence; no sun at night or non-clear weather.');

const loop=started(h)[0];h.appEvent('background');h.render();assert.ok(loop.stops>0,'background stops live field');
h.appEvent('active');h.render();const latest=started(h).at(-1);h.motionEvent(true);h.render();assert.ok(latest.stops>0,'Reduce Motion change stops live field');
for (const reduced of [true,null,'failure']) {const q=await harness({reduceMotion:reduced}).initialize({touchPulse:1});assert.equal(started(q).length,0,`motion ${reduced} remains static`);q.unmount();}
for (const props of [{lowPowerMode:true},{theme:{name:'dark',reducedTransparency:true}}]) {const q=await harness().initialize(props);assert.equal(started(q).length,0);assert.equal(started(q).length,0);q.unmount();}
const reduced=await harness().initialize({theme:{name:'dark',reducedTransparency:true},touchPulse:1});assert.equal(started(reduced).length,0,'transparent touch effect is disabled');
const touch=await harness().initialize({windMs:0,touchContact:{id:1,phase:'down'},touchPosition:{x:80,y:230}});
assert.equal(started(touch).length,2);const local=nodes(touch.tree).find(n=>n.props?.testID==='ambient-touch-layer');assert.ok(local);assert.equal(style(local).width,148);assert.equal(style(local).transform.length,2);
const dry=await harness().initialize({condition:'cloud',precipitationMm:4});
const held=await harness().initialize({touchContact:{id:9,phase:'down'}});const heldStarts=started(held).length;held.appEvent('background');held.render();held.appEvent('active');held.render();assert.equal(started(held).length,heldStarts+1,'foreground restarts ambient only, never old touch');held.unmount();
const rain=await harness().initialize({condition:'rain',precipitationMm:1});const heavy=await harness().initialize({condition:'rain',precipitationMm:5});
const field=q=>({particles:nodes(q.tree).filter(n=>n.props?.testID==='ambient-weather-particle').length,kind:q.props.reliable?q.props.condition:'none'});
assert.equal(field(dry).particles,0);assert.ok(field(heavy).particles>field(rain).particles);rain.render({reliable:false});assert.equal(field(rain).kind,'none');
const wind=await harness().initialize({windMs:100});const timings=wind.animations.filter(a=>a.kind==='timing');assert.ok(timings.every(a=>a.config.duration>=6200));assert.ok(timings.every(a=>a.config.useNativeDriver));
// Run the actual Home handler with a native measurement boundary, including safe-area offset.
const source=ts.createSourceFile('HomeScreen.tsx',readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let handler;function find(n){if(ts.isPropertyAssignment(n)&&n.name.getText(source)==='onTouchStartCapture')handler=n.initializer;ts.forEachChild(n,find);}find(source);assert.ok(handler);
const {createAmbientTouchController}=loadTS(path.join(root,'apps/mobile/src/utils/ambientTouch.ts'),{});
let point,contact,pulse=0;const controller=createAmbientTouchController((x,y)=>point={x,y},v=>contact=v);
new Function('Platform','surfaceRef','touchController','sampleTouch','setTouchPulse','touchEvidence','writeAmbientTouchEvidence',ts.transpileModule('const actualHandler='+handler.getText(source)+';',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText+';return actualHandler;')({OS:'ios'},{current:{measureInWindow:fn=>fn(20,62,400,800)}},controller,e=>e.nativeEvent,fn=>pulse=fn(pulse),{current:{down:0}},()=>{})({nativeEvent:{identifier:1,count:1,pageX:150,pageY:402}});
assert.deepEqual(point,{x:130,y:340});assert.equal(contact.phase,'down');assert.equal(pulse,0);
let scrollHandler;function findScroll(n){if(ts.isJsxAttribute(n)&&n.name.getText(source)==='onScrollBeginDrag')scrollHandler=n.initializer.expression;ts.forEachChild(n,findScroll);}findScroll(source);
assert.ok(scrollHandler);new Function('touchController','setWeatherRegion','Platform','setAmbientScrolling','return ('+scrollHandler.getText(source)+')')(controller,()=>assert.fail('scroll must never remove weather layer'),{OS:'ios'},()=>{})();assert.equal(contact.phase,'cancel');
assert.equal(source.text.includes('setWeatherRegion(undefined)'),false,'weather layer remains mounted during scroll');
const nativeEvents=readFileSync(path.join(rnRoot,'Libraries/NativeComponent/BaseViewConfig.ios.js'),'utf8');
for(const name of ['onTouchStartCapture','onTouchMoveCapture','onTouchEndCapture','onTouchCancelCapture'])assert.ok(nativeEvents.includes(name),'installed RN supports passive '+name);

for(const q of [h,reduced,touch,dry,rain,heavy,wind])q.unmount();
// Conservative contrast bound: assume every layer's brightest point overlaps.
// This exceeds the actual drawing but prevents a touch highlight washing out labels.
const ambientTheme=loadTS(path.join(root,'apps/mobile/src/theme/ambientSurface.ts'),{});
const palette=ambientTheme.ambientPalette;
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const luminance=c=>c.map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
const composite=(background,color,opacity)=>{const alpha=((color>>>24)&255)/255*opacity;return [16,8,0].map((shift,i)=>((color>>>shift)&255)*alpha+background[i]*(1-alpha));};
for(const name of ['dark','light']) for(const condition of ['clear','cloud','rain','snow','storm']) {
  const q=await harness().initialize({theme:{name,reducedTransparency:false},windMs:12,touchPulse:1,condition,daylight:{phase:'day',season:'autumn'}});
  const p={...palette({name}), muted:ambientTheme.ambientHomeTheme({name},true).muted, accent:ambientTheme.ambientHomeTheme({name},true).clear, accentLabel:ambientTheme.ambientHomeTheme({name},true).gold};let background=rgb(p.background);
  for(const s of gradients(q)) {
    const opacity=typeof s.opacity==='number'?s.opacity:s.opacity?.interpolation?Math.max(...s.opacity.interpolation.outputRange):1;
    for(const layer of parseGradient(s.experimental_backgroundImage).toReversed()) {
      const candidates=layer.colorStops.filter(stop=>typeof stop.color==='number').map(stop=>composite(background,stop.color,opacity));
      background=candidates.reduce((worst,c)=>((name==='dark')===(luminance(c)>luminance(worst)))?c:worst);
    }
    if (s.testID === "ambient-base-flow") {
      const texture = nodes(q.tree).find(n => n.type === 'NativeSurfaceTexture');
      const density = texture ? style(texture).opacity : 0;
      // White density can be absent at a pixel, so retain the darker light bound.
      if (name === 'dark') background = composite(background, 0xff8cabca, density * opacity);
    }
  }
  for(const [role,minimum] of [['text',4.5],['muted',4.5],['accentLabel',4.5],['accent',3],['wordmarkOn',3]]) {
    const values=[luminance(rgb(p[role])),luminance(background)].sort((a,b)=>b-a);
    const ratio=(values[0]+0.05)/(values[1]+0.05);
    assert.ok(ratio>=minimum,`${name} ${role} worst-case flow+touch contrast ${ratio.toFixed(2)} must be >=${minimum}`);
    console.log(`${name}/${condition} ${role}: conservative minimum contrast ${ratio.toFixed(2)}:1`);
  }
  q.unmount();
}
console.log('PASS: actual component/hook lifecycle; installed RN gradient parser; wind bounds/current rain; background/Reduce Motion/Reduce Transparency; native touch-origin conversion. Native drawing, physical touch and VoiceOver remain unverified.');

// A retained Home decoration must be inert on other routes, including old touches.
const offHome=await harness().initialize({touchContact:{id:1,phase:'down'}});
const beforeHidden=started(offHome).length;offHome.render({onScreen:false});
assert.equal(style(offHome.tree).opacity,0);
assert.equal(started(offHome).length,beforeHidden);
assert.ok(started(offHome).every(a=>a.stops>0),'Leaving Home stops every active ambient/touch animation');
assert.equal(nodes(offHome.tree).find(n=>n.type==='NativeSurfaceTexture').props.renderingEnabled,false);
offHome.render({onScreen:true});assert.equal(style(offHome.tree).opacity,1);
assert.equal(started(offHome).length,beforeHidden+1,'Returning restarts the base only, not a stale held touch');
const newPoint={session:2,getTranslateTransform:()=>[]};offHome.render({touchPoint:newPoint,touchContact:{id:1,phase:'down'}});
assert.equal(started(offHome).length,beforeHidden+2,'New Home touch session can reuse its local id');offHome.unmount();
console.log('PASS: hidden Home stops motion/touch and native raster work; same-id new touch sessions remain responsive.');
