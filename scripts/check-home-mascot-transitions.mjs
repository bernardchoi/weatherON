// Executes the actual React component against a deterministic native/hook boundary.
// Native compositing and visual quality are intentionally not claimed by this test.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compile = text => ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true } }).outputText;
const rules = {};
new Function('exports', compile(readFileSync('apps/mobile/src/utils/homeMascotState.ts','utf8')))(rules);
let hooks = [], cursor = 0, pending = [], dirty = false, animations = [], tree, appStateListener;
const React = {
 createElement: (type, props, ...children) => ({type,props,children}),
 useRef(value) { const i=cursor++; return hooks[i] ??= {current:value}; },
 useState(value) {const i=cursor++; hooks[i] ??= {value}; return [hooks[i].value, next=>{if(hooks[i].value!==next){hooks[i].value=next;dirty=true;}}];},
 useEffect(fn,deps) {effect(fn,deps);}, useLayoutEffect(fn,deps) {effect(fn,deps);},
};
function effect(fn,deps){const i=cursor++;if(!hooks[i]||!deps||deps.some((v,j)=>v!==hooks[i].deps[j])) {pending.push(()=>{hooks[i]?.cleanup?.();hooks[i]={deps,cleanup:fn()};});}}
const native = {
 Animated: {
  Value: class {constructor(value){this.value=value;} setValue(v){this.value=v;} stopAnimation(){} interpolate(v){return v;}},
  View:'AnimatedView',Image:'AnimatedImage',
  timing(value,config){ const a={config,start(callback){a.callback=callback;animations.push(a);},stop(){a.callback?.({finished:false});}}; return a; },
  sequence:steps=>steps,loop:()=>({start(){},stop(){}}),
 },
 AppState:{currentState:'active',addEventListener:(_event,listener)=>{appStateListener=listener;return {remove(){appStateListener=null;}}}}, Easing:{inOut:x=>x,sin:0},StyleSheet:{absoluteFill:{}},View:'View',
};
const module={};new Function('exports','require',compile(readFileSync('apps/mobile/src/components/HomeWeatherMascot.tsx','utf8')))(module,name=>{
 if(name==='react')return React;
 if(name.includes('localization'))return native;
 if(name.includes('homeMascotState'))return rules;
 if(name.includes('characterAssets'))return {homeCharacterAssets:{base:1,rain:2,cold:3,heat:4}};
 if(name.includes('HomeMascotRainRig'))return {HomeMascotRainRig:'RainRig'};
 if(name.includes('HomeMascotFanRig'))return {HomeMascotFanRig:'FanRig'};
 if(name.includes('HomeMascotClothing')) return {HomeMascotClothing:'Clothing'};
 if(name.includes('mascotBlink'))return {scheduleMascotBlink:()=>()=>{}};
 throw Error(name);
});
let props={state:rules.resolveHomeMascotState({condition:'clear',reliable:true,tempC:18,daylight:'day'}),size:80,active:true,visible:true,reducedMotion:false,lowPowerMode:false};
function render(change={}){props={...props,...change};let count=0;do{dirty=false;cursor=0;pending=[];tree=module.HomeWeatherMascot(props);pending.forEach(fn=>fn());assert.ok(++count<8,'render must settle');}while(dirty);return tree;}
function find(id,node=tree){if(!node||typeof node!=='object')return null;if(node.props?.testID===id)return node;return node.children?.flat(Infinity).map(n=>find(id,n)).find(Boolean) ?? null;}
function state(asset){return {...props.state,asset,weather:asset==='rain'?'rain':asset==='cold'?'snow':'clear'};}
render(); assert.equal(animations.length,0);assert.equal(find('home-mascot-outgoing'),null);
render({state:state('rain')});assert.ok(find('home-mascot-outgoing'));assert.equal(animations.length,1);assert.equal(animations[0].config.duration,180);assert.equal(animations[0].config.useNativeDriver,true);
const oldCallback=animations[0].callback;
render({state:state('cold')});assert.equal(find('home-mascot-outgoing'),null,'rapid replacement settles latest asset');oldCallback({finished:true});render();assert.equal(find('home-mascot-outgoing'),null);
render({state:state('heat')});assert.ok(find('home-mascot-outgoing'));const a=animations.at(-1);a.callback({finished:true});render();assert.equal(find('home-mascot-outgoing'),null,'finished transition removes old rig');
for(const [key,disabled] of [['reducedMotion',true],['reducedMotion',null],['lowPowerMode',true],['scrolling',true],['visible',false],['active',false]]) {
 render({state:state(props.state.asset==='rain'?'cold':'rain')});assert.ok(find('home-mascot-outgoing'));
 render({[key]:disabled});assert.equal(find('home-mascot-outgoing'),null,`${key} cancels in-flight transition`);
 const count=animations.length;render({state:state('base')});assert.equal(animations.length,count,`${key} forbids transition`);
 render({[key]:key==='visible'||key==='active'?true:false});assert.equal(find('home-mascot-outgoing'),null,'resume never replays previous transition');
}
render({state:state('rain')});assert.ok(find('home-mascot-outgoing'));
render({state:{...state('base'),weather:'neutral'}});assert.equal(find('home-mascot-outgoing'),null,'unreliable weather settles immediately');
const count=animations.length;render({state:{...props.state,daylight:'night'}});assert.equal(animations.length,count,'no transition for same asset');
render({state:state('rain')});assert.ok(find('home-mascot-outgoing'));
appStateListener('background');render();assert.equal(find('home-mascot-outgoing'),null,'background cancels transition');
const backgroundCount=animations.length;render({state:state('cold')});assert.equal(animations.length,backgroundCount);
appStateListener('active');render();assert.equal(find('home-mascot-outgoing'),null);
render({darkMode:true});assert.ok(find('home-mascot-dark-contrast'));assert.equal(animations.length,backgroundCount,'contrast backdrop is static');
render({darkMode:false});assert.equal(find('home-mascot-dark-contrast'),null);
render({state:{...state('base'),clothing:'light'}});
animations.at(-1)?.callback?.({finished:true});render();
const clothingCount=animations.length;
render({state:{...props.state,clothing:'outer'}});assert.equal(animations.length,clothingCount+1,'same-pose clothing crossfades');
assert.ok(find('home-mascot-outgoing'));
render({state:{...props.state,clothing:'winter'}});assert.equal(find('home-mascot-outgoing'),null,'rapid clothing replacement settles latest');
render({reducedMotion:true,state:{...props.state,clothing:'raincoat'}});assert.equal(find('home-mascot-outgoing'),null);
for(const hook of hooks)hook?.cleanup?.();
for(const a of animations)a.callback?.({finished:true});
console.log('PASS actual mascot transition: 180ms native dissolve, completion, rapid replacement, stale callbacks, motion policy gates, neutral weather, same-asset update and unmount. Native rendering not verified.');
