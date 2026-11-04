import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { buildSync } from 'esbuild';
function load(file) { const m={exports:{}};new Function('module','exports',buildSync({entryPoints:[file],bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text)(m,m.exports);return m.exports; }
const model=load('apps/mobile/src/utils/homeUpdateState.ts');
const helpers=load('apps/mobile/src/state/appStateHelpers.ts');
const travel=load('apps/mobile/src/utils/travelEstimate.ts');
const key = (id,time='09:00',mode='drive')=>model.homeRouteRequestKey({locationId:'origin'},{id},{timeBasis:'arrival',targetArrivalTime:time,transportMode:mode},'2090-01-01T00:00:00Z');
assert.notEqual(key('A'),key('B'));assert.notEqual(key('A'),key('A','10:00'));assert.notEqual(key('A'),key('A','09:00','walk'));
const a=key('A'), b=key('B');let work={[a]:1};work={...work,[b]:2,[a]:3};
assert.equal(model.finishHomeRouteRequest(work,a,1),work,'A->B->A old completion cannot clear new A');
work=model.finishHomeRouteRequest(work,b,2);assert.equal(work[a],3);work=model.finishHomeRouteRequest(work,a,3);assert.deepEqual(work,{});
const now=Date.parse('2090-01-01T07:00:00+09:00');
const estimate={status:'ready',provider:'kakao',timingBasis:'predicted',transportMode:'drive',originPlaceId:'origin',travelMinutes:40,durationSeconds:2400,distanceMeters:1000,requestArrivalTime:'2090-01-01T00:00:00.000Z',updatedAt:new Date(now).toISOString(),expiresAt:new Date(now+600000).toISOString()};
const schedule={timeBasis:'arrival',targetArrivalTime:'09:00',transportMode:'drive',repeatEnabled:false,repeatDays:[]};
const state=fs.readFileSync('apps/mobile/src/state/useWeatherOnAppState.ts','utf8');const ast=ts.createSourceFile('state.ts',state,ts.ScriptTarget.Latest,true);
let selected,requestEffect,selectPlace;
function walk(n){if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='selectDestinationPlace')selectPlace=n.initializer.arguments[0].getText(ast);if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='selectedDestinationTravelEstimate') selected=n.initializer.getText(ast);if(ts.isCallExpression(n)&&n.expression.getText(ast)==='useEffect'&&n.arguments[0]?.getText(ast).includes('runtimeTravelEstimateClient.estimateRoute')) requestEffect=n.arguments[0].getText(ast);ts.forEachChild(n,walk);}walk(ast);
function project(changes={}){const scope={placeSearchOrigin:{locationId:'origin',countryCode:'KR'},storedDestinationTravelEstimate:estimate,destinationTravelEstimateRequestStatus:'loading',nowMinuteTick:now,selectedDestinationSchedulePreference:schedule,selectedDestinationPlace:{timezone:'Asia/Seoul',countryCode:'KR'},...travel,...helpers,...changes};return new Function(...Object.keys(scope),ts.transpileModule(`const value = ${selected};`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText + ';return value;' )(...Object.values(scope));}
let preview;
const selectScope={selectedDestinationPlaceIdRef:{current:'A'},normalizePlaceSearchResultCategory:x=>x,setSelectedDestinationPlace(){},setPreviewDestinationTravelEstimate:x=>{preview=x;},createDefaultTravelEstimate:helpers.createDefaultTravelEstimate,placeSearchOrigin:{locationId:'origin'},seongsuWeatherLocation:{locationId:'origin'},setPreviewDestinationSchedulePreference(){},getDefaultDestinationSchedulePreference:()=>schedule,setDestinationSelectionReady(){},setPreviewDestinationCareEnabled(){},setUseDestinationWeather(){}};
const selectCallback=new Function(...Object.keys(selectScope),ts.transpileModule(`const select = ${selectPlace};`,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText+';return select;')(...Object.values(selectScope));
for(const id of ['B','A']){selectCallback({id,name:id});assert.equal(preview.destinationPlaceId,id);assert.equal(preview.status,'loading','New destination immediately invalidates old preview ETA before async effects');}
assert.equal(project(),estimate,'A fresh same-request result remains readable during actual request state');
for(const changed of [{...schedule,targetArrivalTime:'10:00'},{...schedule,timeBasis:'departure'},{...schedule,transportMode:'walk'}]) assert.equal(helpers.getDestinationTiming(project({selectedDestinationSchedulePreference:changed}),changed,'Asia/Seoul',now,'KR','KR','origin'),undefined,'Changed request must not show old ETA');
assert.equal(project({storedDestinationTravelEstimate:{...estimate,originPlaceId:'B'}}).status,'loading');
assert.equal(project({storedDestinationTravelEstimate:{...estimate,expiresAt:new Date(now-1).toISOString()}}).status,'loading');
assert.match(model.homeRouteStatus(estimate,false,true,'07:00',now),/조회한 경로 기준/);
assert.match(model.homeRouteStatus({...estimate,expiresAt:new Date(now-1).toISOString()},false,true,'07:00',now),/이전 조회 기준/);
assert.match(model.homeRouteStatus({...estimate,cacheStatus:'stale'},false,true,'07:00',now),/다시 확인 필요/);
assert.match(model.homeRouteStatus({...estimate,status:'error'},false,false),/실패/);
assert.match(model.homeRouteStatus(estimate,true,false),/새 일정/);
assert.match(model.homeRouteStatus(estimate,true,true),/이전 조회 기준/);
// Run the actual component with deterministic hooks/timers and native boundaries.
const source=fs.readFileSync('apps/mobile/src/components/HomeUpdateStatus.tsx','utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
let cursor=0,reduced=false,loops=0,clock=0;const slots=[],effects=[],timers=new Map();let nextTimer=1;
const React={createElement:(type,props,...children)=>({type,props,children}),useRef:v=>{const i=cursor++;return slots[i]??(slots[i]={current:v});},useState:v=>{const i=cursor++;if(!(i in slots))slots[i]=v;return[slots[i],x=>{slots[i]=x;}];},useEffect:(cb,deps)=>{const i=cursor++;const old=effects[i];if(!old||deps.some((d,j)=>d!==old.deps[j])){old?.cleanup?.();effects[i]={deps,cleanup:cb()};}}};
let appStateListener;
const native={AppState:{currentState:'active',addEventListener(_,cb){appStateListener=cb;return{remove(){}};}},Platform:{OS:'ios'},Text:'Text',Pressable:'Pressable',View:'View',Animated:{View:'AnimatedView',Value:class{constructor(v){this.value=v}stopAnimation(){}setValue(v){this.value=v}},timing:()=>({}),sequence:()=>({}),loop:()=>({start(){loops++},stop(){}})},Easing:{inOut:x=>x,quad:0}};
const component={};new Function('exports','require','setTimeout','clearTimeout',code)(component,name=>name.includes('ambientMotion')?load('apps/mobile/src/theme/ambientMotion.ts'):name==='react'?{...React,default:React,__esModule:true}:name.includes('useReducedMotion')?{useReducedMotion:()=>reduced}:native,(cb,ms)=>{const id=nextTimer++;timers.set(id,{at:clock+ms,cb});return id;},id=>timers.delete(id));
const render=(pending,label='조회한 경로 기준',extra={})=>{cursor=0;return component.HomeUpdateStatus({pending,label,color:'#777',...extra});};
function advance(ms){clock+=ms;for(const[id,t]of [...timers])if(t.at<=clock){timers.delete(id);t.cb();}}
let tree=render(false);const stable=JSON.stringify(tree.props.style);
render(true);advance(100);render(false);advance(500);render(false);assert.equal(loops,0,'Fast cached response never starts busy motion');
render(true);advance(249);render(true);assert.equal(loops,0);advance(1);tree=render(true);assert.equal(loops,1,'Only actual pending over 250ms moves');
assert.equal(tree.props.accessibilityState.busy,true);assert.equal(JSON.stringify(tree.props.style),stable,'Pending keeps container geometry');
reduced=true;render(true);advance(1000);render(true);assert.equal(loops,1,'Reduce Motion is static');
reduced=false;render(true,'pending',{active:false});advance(500);render(true,'pending',{active:false});const inactiveLoops=loops;appStateListener('background');render(true,'pending',{active:true});advance(500);render(true,'pending',{active:true});assert.equal(loops,inactiveLoops,'Hidden Home/background must not run a pulse');appStateListener('active');
tree=render(false,'경로 확인 실패 · 다시 시도해 주세요');assert.equal(tree.props.accessibilityState.busy,false);assert.equal(tree.children[1].children[0],'경로 확인 실패 · 다시 시도해 주세요');
assert.equal(tree.children[1].props.numberOfLines,undefined,'Large text wraps instead of truncating');assert.equal(tree.props.style.height,undefined,'No clipping height');assert.equal(tree.props.accessibilityLiveRegion,undefined,'No repeated partial-response announcements');
let retries=0;tree=render(false,'경로 확인 실패',{onRetry:()=>retries++});assert.equal(tree.children[1].props.accessibilityRole,'button');assert.equal(retries,0);tree.children[1].props.onPress();assert.equal(retries,1,'Retry reuses explicit user action, never a new automatic request');
for(const e of effects)e?.cleanup?.();assert.equal(timers.size,0);
const home=fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');assert.match(home,/changeKey=\{`\$\{selectedDestination\?\.place\.id\}:\$\{departureSummary\.value\}`\}/);assert.ok(!home.includes('outputRange: [3, 0]'),'Result transition never translates the control');
assert.match(home,/active=\{homeMotionActive && !lowPowerMode\}/);
assert.match(state,/homeRouteRequests\[destinationLeavingNow\[homeDestinationPlace.id\]/);assert.match(state,/result.pendingLocationIds \?\? \[\]/);
console.log('PASS Home update-state: actual estimate projection, request-key/ownership races, TTL/offline/failure basis, actual busy component fast/slow timers, stable slot, Reduce Motion, wrapping and privacy. Native/device layout remains unverified.');
