import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require=createRequire(import.meta.url), root=process.cwd();
const source=fs.readFileSync("apps/mobile/src/components/IosLaunchSplash.tsx","utf8");
const timelineCode=ts.transpileModule(fs.readFileSync("apps/mobile/src/components/iosSplashTimeline.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const t={};new Function("exports",timelineCode)(t);
function harness({reduced=false,started=false,appState="active",reducedTransparency=false}={}){
 const h={slots:[],cursor:0,effects:[],starts:[],timers:new Map(),frames:new Map(),now:0,id:0,ready:0,finish:0,rerender:false};
 const Animated={
 Value:class {constructor(value){this.value=value;}setValue(v){this.value=v;}interpolate(config){return {value:this,config};}},
 multiply:(a,b)=>({a,b}),
 timing:(value,config)=>({kind:"timing",value,config}),delay:duration=>({kind:"delay",duration}),
 };
 function composite(kind,children){return {kind,children,start(cb){this.callback=cb;h.starts.push(this);},stop(){this.stopped=true;}};}
 Animated.sequence=c=>composite("sequence",c);Animated.parallel=c=>composite("parallel",c);Animated.View="AnimatedView";
 const React={
 useRef:value=>{const i=h.cursor++;return h.slots[i]??=( {current:value} );},
 useState:value=>{const i=h.cursor++;h.slots[i]??={value:typeof value==="function"?value():value};return [h.slots[i].value,v=>{h.slots[i].value=v;h.rerender=true;}];},
 useCallback:(fn,deps)=>{const i=h.cursor++;let slot=h.slots[i];if(!slot||deps.some((x,n)=>x!==slot.deps[n]))slot=h.slots[i]={fn,deps};return slot.fn;},
 useEffect:(fn,deps)=>{const i=h.cursor++;const old=h.slots[i];if(!old||deps.some((x,n)=>x!==old.deps[n])){h.slots[i]={fn,deps};h.effects.push({i,fn});}},
 };
 const nativeAppState={currentState:appState,addEventListener:(_,fn)=>{h.appState=fn;return {remove(){h.removed=true;}};}};
 const dependencies={
 react:{...React,default:React},"react/jsx-runtime":{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},
 "../localization/react-native":{Animated,AppState:nativeAppState,Easing:{out:f=>f,cubic:"cubic"},StyleSheet:{create:s=>s,absoluteFillObject:{}},View:"View"},
 "react-native-svg":{default:"Svg",Path:"Path",Circle:"Circle",Defs:"Defs",Stop:"Stop",RadialGradient:"Gradient"},
 "../../../../assets/splash/ios-brand-02/parts.json":JSON.parse(fs.readFileSync("assets/splash/ios-brand-02/parts.json","utf8")),
 "../hooks/useReducedMotion":{useReducedMotion:()=>h.reduced},
 "../theme/AppThemeContext":{useAppTheme:()=>({name:"light",background:"#E9F6F8",reducedTransparency:h.reducedTransparency})},
 "./IosHomeWordmark":{IosHomeWordmark:"Wordmark"},"./iosSplashTimeline":t,
 };
 const ex={};new Function("exports","require","setTimeout","clearTimeout","requestAnimationFrame","cancelAnimationFrame",ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText)(
 ex,id=>{assert.ok(id in dependencies,id);return dependencies[id];},(fn,ms)=>{const id=++h.id;h.timers.set(id,{fn,at:h.now+ms});return id;},id=>h.timers.delete(id),fn=>{const id=++h.id;h.frames.set(id,fn);return id;},id=>h.frames.delete(id));
 h.started=started;h.reduced=reduced;h.reducedTransparency=reducedTransparency;
 h.render=()=>{h.cursor=0;h.rerender=false;h.tree=ex.IosLaunchSplash({started:h.started,onReady:()=>h.ready++,onFinish:()=>h.finish++});const effects=h.effects.splice(0);for(const e of effects){h.slots[e.i].cleanup=e.fn();}return h.tree;};
 h.advance=ms=>{h.now+=ms;for(const [id,timer]of [...h.timers])if(timer.at<=h.now){h.timers.delete(id);timer.fn();}if(h.rerender)h.render();};
 h.frame=()=>{const frames=[...h.frames];h.frames.clear();for(const [,frame] of frames)frame();if(h.rerender)h.render();};
 h.rerunEffects=()=>{const effects=h.slots.filter(slot=>slot?.fn);for(const effect of effects)effect.cleanup?.();for(const effect of effects)effect.cleanup=effect.fn();};
 h.unmount=()=>{for(const slot of h.slots)slot?.cleanup?.();};
 h.render();return h;
}
const duration=a=>a.kind==="timing"?a.config.duration:a.kind==="delay"?a.duration:a.kind==="parallel"?Math.max(...a.children.map(duration)):a.children.reduce((sum,c)=>sum+duration(c),0);
const idle=harness({started:false});idle.tree.props.onLayout();idle.tree.props.onLayout();assert.equal(idle.ready,0,"layout alone does not hide the native first frame");idle.frame();assert.equal(idle.ready,0);idle.frame();assert.equal(idle.ready,1,"two display callbacks acknowledge the opaque JS splash");idle.advance(1200);assert.equal(idle.starts.length,0,"slow loading does not replay");
const layoutFailure=harness({started:false});layoutFailure.advance(t.iosSplashTimeline.readyFallback);assert.equal(layoutFailure.ready,0,"the no-layout fallback still waits for a frame handoff");layoutFailure.frame();layoutFailure.frame();assert.equal(layoutFailure.ready,1,"a missing layout cannot hold the native splash indefinitely");
const remountedHandoff=harness({started:false});remountedHandoff.tree.props.onLayout();remountedHandoff.rerunEffects();remountedHandoff.tree.props.onLayout();remountedHandoff.frame();remountedHandoff.frame();assert.equal(remountedHandoff.ready,1,"effect remount clears a cancelled frame handoff and reports readiness once");
idle.started=true;idle.render();assert.equal(idle.starts.length,1);assert.equal(duration(idle.starts[0]),1500);
const plan=idle.starts[0];assert.equal(plan.kind,"parallel");assert.equal(plan.children[1].children[0].duration,180);assert.equal(plan.children[3].children[0].duration,530);assert.equal(plan.children[3].children[1].config.useNativeDriver,false,"only the clipping width uses layout driver");
plan.callback({finished:true});plan.callback({finished:true});assert.equal(idle.finish,1,"completion is delivered exactly once");idle.appState("background");idle.appState("active");idle.render();assert.equal(idle.starts.length,1,"ordinary foregrounding cannot replay the splash");
const startupInactive=harness({started:true,appState:"inactive"});assert.equal(startupInactive.starts.length,0);assert.equal(startupInactive.finish,0,"launch-time inactive is not a background dismissal");startupInactive.appState("active");startupInactive.render();assert.equal(startupInactive.starts.length,1,"inactive-to-active startup plays once when active");
const startupActive=harness({started:true});startupActive.appState("inactive");startupActive.render();assert.equal(startupActive.finish,0,"an early active-to-inactive transition does not dismiss the splash");startupActive.appState("active");startupActive.render();assert.equal(startupActive.starts.length,1,"active-to-inactive-to-active startup cannot replay or finish early");
const unknownInitial=harness({started:true,appState:null});assert.equal(unknownInitial.starts.length,0);assert.equal(unknownInitial.finish,0,"unknown initial AppState does not consume playback");unknownInitial.appState("active");unknownInitial.render();assert.equal(unknownInitial.starts.length,1,"unknown initial AppState starts after active arrives");
const background=harness({started:true});background.appState("background");assert.equal(background.finish,1,"a real background interruption dismisses the splash");assert.equal(background.starts[0].stopped,true);background.appState("active");background.render();assert.equal(background.starts.length,1,"a warm foreground return never replays");
const preBackground=harness({started:false});preBackground.appState("background");preBackground.started=true;preBackground.render();assert.equal(preBackground.starts.length,0);assert.equal(preBackground.finish,0);preBackground.appState("active");preBackground.render();assert.equal(preBackground.starts.length,0);assert.equal(preBackground.finish,1,"a real pre-start background transition is safely dismissed");
const delayedPolicy=harness({reduced:null,started:true});assert.equal(delayedPolicy.starts.length,0);delayedPolicy.advance(200);assert.equal(delayedPolicy.starts.length,0,"an unresolved motion lookup cannot take the short path");delayedPolicy.reduced=false;delayedPolicy.render();assert.equal(duration(delayedPolicy.starts[0]),1500,"a delayed non-reduced result keeps the full animation");
const stalledPolicy=harness({reduced:null,started:true});stalledPolicy.advance(1199);assert.equal(stalledPolicy.starts.length,0,"the bounded fallback does not cut short a still-pending lookup");stalledPolicy.advance(1);assert.equal(duration(stalledPolicy.starts[0]),260,"a never-resolving lookup eventually uses the intentional reduced-motion presentation");
const failedPolicy=harness({reduced:null,started:true});failedPolicy.reduced=true;failedPolicy.render();assert.equal(duration(failedPolicy.starts[0]),260,"a rejected accessibility lookup can safely use the reduced-motion presentation");
const reduced=harness({reduced:true,started:true});assert.equal(duration(reduced.starts[0]),260);assert.equal(reduced.starts[0].kind,"sequence","confirmed Reduce Motion uses the opacity-only presentation");
const transparent=harness({reduced:false,started:true,reducedTransparency:true});assert.equal(duration(transparent.starts[0]),1500,"Reduce Transparency removes the glow without forcing a motion shortcut");
const repeated=harness({started:true});repeated.render();repeated.render();assert.equal(repeated.starts.length,1,"repeated effects cannot restart playback");repeated.starts[0].callback({finished:true});repeated.starts[0].callback({finished:true});assert.equal(repeated.finish,1,"repeated completions cannot finish twice");
const strict=harness({started:true});strict.rerunEffects();assert.equal(strict.starts.length,1,"StrictMode effect re-runs cannot replay the splash");assert.equal(strict.finish,1,"StrictMode cleanup settles the launch exactly once");strict.starts[0].callback({finished:true});assert.equal(strict.finish,1);
const failed=harness({started:true});failed.advance(2100);assert.equal(failed.finish,1,"stalled native callback cannot hold indefinitely");failed.starts[0].callback({finished:true});assert.equal(failed.finish,1);
const cancelled=harness({started:true});cancelled.unmount();cancelled.advance(3000);cancelled.starts[0].callback({finished:true});assert.equal(cancelled.finish,0);
assert.doesNotMatch(source,/timing\.policyFallback|reduced !== false \|\| theme\.reducedTransparency/u);
assert.doesNotMatch(source,/Animated\.loop|AnimatedBrandMark|brandAssets\.icon|scale:\s/u);
const legacy=fs.readFileSync("apps/mobile/src/components/LaunchSplash.tsx","utf8");
const baseline=execFileSync("git",["show","1a258866:apps/mobile/src/components/LaunchSplash.tsx"],{encoding:"utf8"});
assert.equal(legacy.slice(legacy.indexOf("function LegacyLaunchSplash(")).replace("function LegacyLaunchSplash(","export function LaunchSplash("),baseline.slice(baseline.indexOf("export function LaunchSplash(")));
const app=JSON.parse(fs.readFileSync("apps/mobile/app.json","utf8"));
const old=JSON.parse(execFileSync("git",["show","1a258866:apps/mobile/app.json"],{encoding:"utf8"}));
assert.deepEqual(app.expo.android,old.expo.android);assert.deepEqual(app.expo.androidStatusBar,old.expo.androidStatusBar);
const getProps=c=>c.expo.plugins.find(x=>Array.isArray(x)&&x[0]==="expo-splash-screen")[1];
const android=require(path.join(path.dirname(require.resolve("expo-splash-screen/package.json")),"plugin/build/getAndroidSplashConfig.js")).getAndroidSplashConfig;
assert.deepEqual(android(getProps(app)),android(getProps(old)),"effective Android splash config");
const parts=JSON.parse(fs.readFileSync("assets/splash/ios-brand-02/parts.json","utf8"));
for(const [name,file]of [["cloud","20-cloud.svg"],["sun","10-sun.svg"]]){
 const svg=fs.readFileSync("assets/brand/ambient-b-platform-20261008/ios/layers/light/"+file,"utf8");
 assert.ok(svg.includes('d="'+parts[name].path+'"'),"original "+name+" contour");
}
console.log("PASS actual iOS launch effects: 1500ms overlap, fixed-width reveal, once-only readiness/completion, delayed/bounded accessibility policy, background/resume, watchdog and unmount. Original Android effect and effective splash config unchanged; B paths unchanged.");
