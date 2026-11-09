import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const exports = {};
const source = readFileSync('apps/mobile/src/utils/homeMascotState.ts', 'utf8');
new Function('exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports);
const { resolveHomeMascotState: resolve, canAnimateHomeMascot: canAnimate, homeMascotMotion: motion } = exports;
let checks = 0;
const equal = (a,b) => { assert.deepEqual(a,b); checks++; };
const base = { condition: 'clear', reliable: true, tempC: 18, daylight: 'day' };
equal(resolve(base), { weather:'clear', thermal:'normal', daylight:'day', asset:'base' });
for (const condition of ['rain','storm','thunder']) {
 const state = resolve({...base, condition, tempC: 0, daylight:'night'});
 equal(state.asset,'rain'); equal(state.thermal,'normal'); equal(state.daylight,'night');
}
equal(resolve({...base, condition:'snow', tempC:10}).asset,'cold');
equal(resolve({...base, tempC:5}).asset,'base');
equal(resolve({...base, tempC:5.1}).asset,'base');
equal(resolve({...base, tempC:35}).thermal,'hot');
equal(resolve({...base, tempC:34.9}).thermal,'normal');
equal(resolve({...base, tempC:NaN}).thermal,'normal');
for (const change of [{reliable:false},{pending:true},{condition:'unknown'}]) {
 equal(resolve({...base, ...change}), { weather:'neutral', thermal:'normal', daylight:'unknown', asset:'base' });
}
for (const condition of ['partly-cloudy','cloud','fog','dust']) equal(resolve({...base, condition}).asset,'base');
const policy = {active:true, appActive:true, visible:true, reducedMotion:false, lowPowerMode:false, scrolling:false};
equal(canAnimate(policy),true);
for (const change of [{active:false},{appActive:false},{visible:false},{reducedMotion:null},{reducedMotion:true},{lowPowerMode:true},{scrolling:true}]) equal(canAnimate({...policy,...change}),false);
equal(motion(resolve({...base,reliable:false})).lift,0);
for (const condition of ['clear','rain','snow','storm','fog']) {
 const m = motion(resolve({...base,condition})); assert.ok(m.lift <= 1 && m.tilt <= .6 && m.duration >= 4200); checks++;
}
// Assets are transparent RGBA PNGs with an identical normalized canvas.
for (const name of ['main-fullbody','main-rain','main-cold','main-heat']) {
 const png = readFileSync(`apps/mobile/assets/characters/${name}.png`);
 equal(png.subarray(1,4).toString(),'PNG'); equal(png.readUInt32BE(16),1024); equal(png.readUInt32BE(20),1024); equal(png[25],6);
}
const home = readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');
for (const required of ['!currentWeather.locationUnverified','currentWeather.source !== "fallback"','current.atmosphere?.conditionAvailable !== false','active={homeMotionActive}','visible={mascotVisible}','scrolling={ambientScrolling}']) { assert.ok(home.includes(required)); checks++; }
const component = readFileSync('apps/mobile/src/components/HomeWeatherMascot.tsx','utf8');
for (const required of ['subscription.remove()','animation.stop()','phase.stopAnimation()','useNativeDriver: true','isInteraction: false','pointerEvents="none"','accessibilityElementsHidden']) { assert.ok(component.includes(required)); checks++; }
console.log(`PASS: ${checks} home mascot state/asset/integration checks. Device rendering and performance remain unverified.`);
// Execute the actual component with a tiny native boundary, rather than only source checks.
const effects = []; let starts = 0, stops = 0, removals = 0;
const fakeAnimated = {
  Value: class { stopAnimation() {} setValue() {} interpolate(value) { return value; } },
  Image: 'AnimatedImage', timing: () => ({}), sequence: () => ({}),
  loop: () => ({ start() { starts++; }, stop() { stops++; } }),
};
const React = { createElement: (type, props, ...children) => ({type,props,children}),
  useRef: value => ({current:value}), useState: value => [value,()=>{}], useEffect: fn => effects.push(fn) };
const native = { Animated: fakeAnimated, AppState: {currentState:'active', addEventListener:()=>({remove(){removals++;}})},
  Easing:{inOut:x=>x,sin:0}, StyleSheet:{absoluteFill:{}}, View:'View' };
const rendered = {};
const js = ts.transpileModule(component,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
new Function('exports','require',js)(rendered,name => {
 if(name==='react') return React;
 if(name.includes('localization')) return native;
 if(name.includes('characterAssets')) return {homeCharacterAssets:{base:1,rain:2,cold:3,heat:4}};
 if(name.includes('homeMascotState')) return exports;
 if(name.includes('HomeMascotFanRig')) return {HomeMascotFanRig:'FanRig'};
 if(name.includes('HomeMascotRainRig')) return {HomeMascotRainRig:'RainRig'};
 if(name.includes('mascotBlink')) return {scheduleMascotBlink:()=>()=>{}};
 throw new Error(name);
});
for (const change of [{},{active:false},{visible:false},{reducedMotion:null},{reducedMotion:true},{lowPowerMode:true},{scrolling:true}]) {
 effects.length=0; const before=starts; const p={...policy,...change,state:resolve(base),size:80};
 const result=rendered.HomeWeatherMascot(p); const cleanups=effects.map(fn=>fn());
 equal(starts-before,canAnimate({...p,appActive:true})?1:0);
 equal(result.props.pointerEvents,'none');
 cleanups.forEach(fn=>fn?.());
}
equal(stops,1); equal(removals,7);
console.log(`PASS: actual component animation gating/cleanup; ${checks} total assertions.`);

equal(resolve({...base,tempC:35}).asset,'heat');
equal(resolve({...base,condition:'rain',tempC:35}).asset,'rain');
equal(exports.homeMascotWind(20,true),1);
equal(exports.homeMascotWind(3,true),.25);
equal(exports.homeMascotWind(-1,true),0);
equal(exports.homeMascotWind(NaN,true),0);
equal(exports.homeMascotWind(12,false),0);
console.log(`PASS: heat and independent wind; ${checks} total assertions.`);

const blinkExports={};
new Function('exports',ts.transpileModule(readFileSync('apps/mobile/src/utils/mascotBlink.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(blinkExports);
let pending; const frames=[]; const delays=[]; let canceledTimer;
const stop=blinkExports.scheduleMascotBlink(frame=>frames.push(frame),{set(fn,ms){pending=fn;delays.push(ms);return delays.length;},clear(id){canceledTimer=id;}});
for(let i=0;i<4;i++)pending();
equal(frames,['half','closed','half','open']); equal(delays,[6000,60,80,60,6000]);
stop();pending();equal(frames.length,4);equal(canceledTimer,5);
const rig=JSON.parse(readFileSync('apps/mobile/assets/characters/rain-rig-contract.json','utf8'));
equal(rig.maxAngleDegrees,.6);equal(rig.rotationOrigin,[720,940]);
const rigSource=readFileSync('apps/mobile/src/components/HomeMascotRainRig.tsx','utf8');
assert.ok(rigSource.includes('useId()') && rigSource.includes('maskUnits="userSpaceOnUse"'));checks++;
console.log(`PASS: blink lifecycle and source-mask rig contract; ${checks} assertions.`);

// A provider may fill tempC from hourly fallback while current temperature is unavailable.
equal(resolve({...base,tempC:36,tempAvailable:false}).thermal,'normal');
equal(resolve({...base,tempC:36,tempAvailable:false}).asset,'base');
equal(resolve({...base,tempC:36,tempAvailable:true}).asset,'heat');
assert.ok(home.includes('tempAvailable: current.tempAvailable'));checks++;
console.log(`PASS: unavailable current temperature never selects heat; ${checks} assertions.`);

const fan=JSON.parse(readFileSync('apps/mobile/assets/characters/heat-fan-contract.json','utf8'));
equal(fan.canvas,[1024,1024]);equal(fan.maxAngleDegrees,5);equal(fan.noNativeMaskOrFilterNeeded,true);
for(const name of ['heat-fan-underlay','heat-fan-sprite','heat-head-front','heat-fan-front']){const png=readFileSync(`apps/mobile/assets/characters/${name}.png`);equal(png.readUInt32BE(16),1024);equal(png.readUInt32BE(20),1024);equal(png[25],6);}
const fanSource=readFileSync('apps/mobile/src/components/HomeMascotFanRig.tsx','utf8');
assert.ok(fanSource.includes('step(0, 4000)')&&fanSource.includes('angle.setValue(0)')&&fanSource.includes('if (!moving || failed) return'));checks++;
console.log(`PASS: fan v11 contract, buffers, pause and stop policy; ${checks} assertions.`);
const fanModule={};
new Function('exports','require',ts.transpileModule(fanSource,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText)(fanModule,name=>{
 if(name==='react')return React;
 if(name.includes('localization'))return {...native,Image:'Image'};
 if(name.includes('heat-fan-contract'))return fan;
 if(name.includes('characterAssets'))return {homeCharacterAssets:{heat:4}};
 if(name.endsWith('.png'))return name;
 throw Error(name);
});
for(const moving of [true,false]){effects.length=0;const before=starts;fanModule.HomeMascotFanRig({size:80,moving});const cleanup=effects.map(fn=>fn());equal(starts-before,moving?1:0);cleanup.forEach(fn=>fn?.());}
console.log(`PASS: actual fan component motion gate/cleanup; ${checks} assertions.`);

equal(fan.rotationOrigin,[391.05759162303667,731.2513089005236]);
equal((fanSource.match(/frame, movingStyle/g)||[]).length,2);
console.log(`PASS: v11 shared transform/pivot and four-layer buffers; ${checks} assertions.`);
