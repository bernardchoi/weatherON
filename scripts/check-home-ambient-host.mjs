import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const compile=s=>ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
function load(source,boundaries){const m={exports:{}};new Function('require','module','exports',compile(source))(id=>{assert.ok(id in boundaries,id);return boundaries[id]},m,m.exports);return m.exports;}
function hooks(){const slots=[];let cursor=0,pending=[];const api={
 useState(v){const i=cursor++;if(!(i in slots))slots[i]=typeof v==='function'?v():v;return[slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v}]},
 useLayoutEffect(fn,deps){const i=cursor++;const old=slots[i];if(!old||deps.some((x,k)=>x!==old.deps[k]))pending.push(()=>{old?.cleanup?.();slots[i]={deps,cleanup:fn()}})},
 render(fn,props){cursor=0;pending=[];const tree=fn(props);pending.forEach(f=>f());return tree},
 dispose(){slots.forEach(s=>s?.cleanup?.())}};api.useEffect=api.useLayoutEffect;return api;}
let current,register;const react={createContext:()=>({Provider:'Provider'}),useContext:()=>register,useState:(...a)=>current.useState(...a),useLayoutEffect:(...a)=>current.useLayoutEffect(...a),memo:(fn,compare)=>Object.assign(fn,{compare})};
const jsx=(type,props)=>({type,props});let daylightEnabled;
const source=fs.readFileSync('apps/mobile/src/components/HomeAmbientHost.tsx','utf8');
const native={Platform:{OS:'ios'},View:'View'};
const m=load(source,{'react':react,'react/jsx-runtime':{jsx,jsxs:jsx},'../localization/react-native':native,'../providers/weatherLocations':{defaultSeoulWeatherLocation:{locationId:'default',timezone:'Asia/Seoul',coordinate:{latitude:37,longitude:127}}},'../theme/ambientSurface':{ambientHomeTheme:t=>t},'../utils/weatherDaylight':{resolveWeatherTimeZone:(c,z)=>z},'../utils/useIsNightHour':{useAmbientDaylight:(context,enabled)=>{daylightEnabled=enabled;return context}},'./AmbientSurfaceBackground':{AmbientSurfaceBackground:'Canvas'}});
const host=hooks(),background=hooks(),portal=hooks();const content={type:'unchanged-content'};
const weather={locationId:'a',countryCode:'KR',timezone:'Asia/Seoul',current:{condition:'cloud',windMs:2,precipitationMm:0}};
let props={enabled:true,backgroundColor:'#000',theme:{name:'dark'},weather,reliable:true,children:content};
function renderHost(){current=host;const provider=host.render(m.HomeAmbientHost,props);register=provider.props.value;const view=provider.props.children;assert.equal(view.props.children[1],content);return view.props.children[0]}
const initial=renderHost();assert.ok(initial,'Root owns a canvas even before Home registers interactions');
current=background;let canvas=background.render(initial.type,initial.props);assert.equal(canvas.type,'Canvas');assert.equal(canvas.props.onScreen,true);
const interaction={touchPulse:1,touchContact:{id:1,phase:'down'},touchPoint:{session:1}};
current=portal;assert.equal(portal.render(m.HomeAmbientPortal,{enabled:true,interaction,children:{type:'fallback'}}),null);
let registered=renderHost();assert.equal(registered.props.interaction,interaction);
portal.dispose();props={...props,enabled:false};const hidden=renderHost();assert.equal(hidden.type,initial.type,'Hiding must retain the same component slot/type');
current=background;canvas=background.render(hidden.type,hidden.props);assert.equal(canvas.props.onScreen,false);assert.equal(canvas.props.touchContact,undefined);assert.equal(daylightEnabled,false);
assert.equal(hidden.type.compare(hidden.props,{...hidden.props,weather:{...weather,current:{condition:'rain'}}}),true,'Hidden root updates do not render decoration');
props={...props,enabled:true,theme:{name:'light'},weather:{...weather,locationId:'new',timezone:'America/New_York',current:{condition:'snow',windMs:8,precipitationMm:2}},location:{locationId:'new',timezone:'America/New_York',coordinate:{latitude:40,longitude:-74}},reliable:false};
const returned=renderHost();assert.equal(returned.type,initial.type);assert.equal(returned.type.compare(hidden.props,returned.props),false);
current=background;canvas=background.render(returned.type,returned.props);
assert.equal(canvas.props.theme.name,'light');assert.equal(canvas.props.condition,'snow');assert.equal(canvas.props.reliable,false);assert.equal(canvas.props.daylight.timeZone,'America/New_York');assert.equal(daylightEnabled,true);assert.equal(canvas.props.touchContact,undefined);
current=portal;const fallback={type:'inline'};assert.equal(portal.render(m.HomeAmbientPortal,{enabled:false,interaction,children:fallback}).props.children,fallback);
native.Platform.OS='android';assert.equal(renderHost(),null,'Android retains inline background ownership');
console.log('PASS: persistent root canvas identity; hidden render suppression; latest returning weather/location/theme; cleared touch session; inline Android fallback.');

// Execute the real daylight hook with a controlled clock and timers.
const day=hooks();let clock=100,intervals=new Map(),listeners=new Set(),serial=0,lastDate;
const RealDate=Date;class FakeDate extends RealDate{constructor(...args){super(...(args.length?args:[clock]))}static now(){return clock}}
const dayModule={exports:{}};const rn={AppState:{currentState:'active',addEventListener:(event,fn)=>{listeners.add(fn);return{remove:()=>listeners.delete(fn)}}}};
new Function('require','module','exports','Date','setInterval','clearInterval',compile(fs.readFileSync('apps/mobile/src/utils/useIsNightHour.ts','utf8')))(id=>id==='react'?day:id==='../localization/react-native'?rn:{getAmbientDaylight:(date,c)=>{lastDate=date.getTime();return c}},dayModule,dayModule.exports,FakeDate,(fn)=>{intervals.set(++serial,fn);return serial},id=>intervals.delete(id));
const hook=dayModule.exports.useAmbientDaylight;
day.render(()=>hook({},true));assert.equal(intervals.size,1);
day.render(()=>hook({},false));assert.equal(intervals.size,0);assert.equal(listeners.size,0);
clock=100000;day.render(()=>hook({timeZone:'Asia/Tokyo'},true));assert.equal(lastDate,clock,'Return render uses current time before the effect tick');assert.equal(intervals.size,1);
[...listeners][0]('background');assert.equal(intervals.size,0);day.dispose();assert.equal(listeners.size,0);
console.log('PASS: daylight timer stops off Home/background; latest clock on first returning render.');
