import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
const read = p => readFileSync(p, 'utf8');
const hook = stripTypeScriptTypes(read('apps/mobile/src/state/useWeatherOnAppState.ts'));
const marker = hook.indexOf('if (!appStateHydrated || weatherLocationMode !== "auto")');
const start = hook.lastIndexOf('useEffect(() => {', marker) + 'useEffect(() => {'.length;
const end = hook.indexOf('\n  }, [', marker);
for (const status of ['error', 'unavailable', 'denied', 'granted']) {
 const updates = {};
 const bindings = { appStateHydrated:true, weatherLocationMode:'auto', deviceWeatherLocation:null, locationReady:true,
 deviceLocationRequestInFlightRef:{current:false}, syncDeviceWeatherLocationPermission:async()=>({status,location:status==='granted'?{id:'here'}:undefined}),
 ...Object.fromEntries(['DeviceLocationState','LocationReady','DeviceWeatherLocation','WeatherLocationMode','WeatherRefreshTick'].map(k=>['set'+k,v=>{updates[k]=v;}])) };
 new Function(...Object.keys(bindings), hook.slice(start,end))(...Object.values(bindings));
 await new Promise(setImmediate);
 if (status==='error'||status==='unavailable') {
 assert.notEqual(updates.WeatherLocationMode,'manual', `${status} must preserve auto intent`);
 assert.notEqual(updates.LocationReady,false, `${status} must preserve readiness`);
 } else if(status==='denied') assert.equal(updates.WeatherLocationMode,'manual');
 else assert.equal(updates.LocationReady,true);
}
console.log('Cold-start location transitions passed');
function load(path, names, bindings={}) {
 const source=stripTypeScriptTypes(read(path)).replace(/^import[\s\S]*?;\n/gmu,'').replace(/^export /gmu,'');
 return new Function(...Object.keys(bindings), `${source}\nreturn {${names.join(',')}}`)(...Object.values(bindings));
}
const {buildTomorrowWeather}=load('apps/mobile/src/utils/tomorrowWeather.ts',['buildTomorrowWeather'],{formatDisplayDate:()=>'',translateText:x=>x});
const daily=date=>({date,minTempC:10,maxTempC:20,condition:'clear'});
for(const [timezone, now, target] of [
 ['Asia/Seoul','2026-10-03T15:01:00Z','2026-10-05'],
 ['America/Los_Angeles','2026-10-04T01:00:00Z','2026-10-04'],
 ['America/New_York','2026-11-01T05:30:00Z','2026-11-02'],
 ['Pacific/Kiritimati','2026-12-31T12:30:00Z','2027-01-02'],
]) {
 const weather={timezone,observedAt:'2026-09-01T00:00:00Z',current:{},hourly:[],daily:[daily(target)]};
 assert.equal(buildTomorrowWeather(weather,new Date(now)).summary.date,target);
 assert.equal(buildTomorrowWeather({...weather,daily:[daily('2026-09-02')]},new Date(now)),null);
}
const sample={timezone:'Asia/Seoul',current:{},daily:[daily('2026-10-05')],hourly:[{time:'2026-10-04T16:00:00Z'},{time:'2026-10-05T23:00:00Z'}]};
assert.deepEqual(buildTomorrowWeather(sample,new Date('2026-10-04T01:00:00Z')).weather.hourly,[sample.hourly[0]]);
console.log('Tomorrow: local midnight, stale observation, missing day, DST, year rollover and hourly offsets passed');
const authSource = stripTypeScriptTypes(read('apps/mobile/src/providers/accountAuth.ts'), {mode:'transform'});
const authClass = authSource.slice(authSource.indexOf('export class AccountAuthError'),authSource.indexOf('export function isAccountAuthCancellation')).replace('export ','');
const AccountAuthError = new Function(`${authClass}; return AccountAuthError;`)();
const persistSource = authSource.slice(authSource.indexOf('async function persistAuthenticatedSession'),authSource.indexOf('function isProviderAvailability'));
const written=[], identities=[], revoked=[];
const persist = new Function('AccountAuthError','writeSessionToken','rememberIntegrityUser','ensureAppAttestEnrollment','accountRequest', `${persistSource};return persistAuthenticatedSession;`)(AccountAuthError,async t=>written.push(t),async id=>identities.push(id),async()=>{},async(_,opts)=>revoked.push(opts.token));
await assert.rejects(persist({sessionToken:'new-other',account:{userId:'other'}},'original'),e=>e.code==='reauth_account_mismatch');
assert.deepEqual(written,[]);assert.deepEqual(identities,[]);assert.deepEqual(revoked,['new-other']);
await persist({sessionToken:'new-same',account:{userId:'original'}},'original');
assert.deepEqual(written,['new-same']);assert.deepEqual(identities,['original']);
const deleteSource=hook.slice(hook.indexOf('  const deleteAccount = async () => {'),hook.indexOf('\n  const completeTerms'));
for(const result of ['same','cancel','mismatch']) {
 const events=[];
 const bindings={AccountAuthError,accountAuthStatus:'ready',accountProfile:{userId:'original',provider:'apple'},
 setAccountAuthStatus:s=>events.push(s),setAccountAuthMessage:m=>events.push(m),setAccountProfile:()=>events.push('profile'),setRoute:()=>events.push('route'),
 deleteAccountSession:async()=>{events.push('delete-attempt');throw new AccountAuthError('recent_auth_required','recent',401);},
 clearLinkedAccountState:async()=>events.push('clear'),
 signInWithAppleAccount:async id=>{assert.equal(id,'original');if(result!=='same')throw new AccountAuthError(result,'mock');return {account:{userId:id}};},
 getAccountAuthDisplayMessage:e=>e.code};
 await new Function(...Object.keys(bindings),`${deleteSource};return deleteAccount();`)(...Object.values(bindings));
 assert.equal(events.filter(e=>e==='delete-attempt').length,1,'never auto-delete after reauth');
 assert.ok(!events.includes('clear'));assert.ok(!events.includes('route'));
 assert.ok(events.includes(result==='same'?'ready':'error'));
}
console.log('Reauth: same-account token guard, mismatch cleanup, cancellation, local data retention and explicit second confirmation passed');
const {handleProxyRoute}=await import('../apps/server/src/proxyCore.mjs');
const originalFetch=globalThis.fetch;
const requests=[];
globalThis.fetch=async url=>{
 requests.push(new URL(url));
 return new Response(JSON.stringify({status:'OK',rows:[{elements:[{status:'OK',duration:{value:1800},distance:{value:2000}}]}]}),{status:200});
};
try {
 const env=k=>({GOOGLE_MAPS_API_KEY:'mock-only',ROUTE_CACHE_TTL_MS:'600000'})[k];
 const base='https://example.invalid/routes/estimate?origin=35,139&destination=36,140&originCountryCode=JP&destinationCountryCode=JP';
 const times=['2090-01-01T01:00:00Z','2090-01-01T02:00:00Z'];
 for(const time of times) {
   const result=await handleProxyRoute(new URL(`${base}&transportMode=transit&departureTime=${time}`),env,()=>null);
   assert.equal(result.payload.provider,'google-transit');
   assert.equal(requests.at(-1).searchParams.get('departure_time'),String(Date.parse(time)/1000));
   assert.equal(requests.at(-1).searchParams.has('arrival_time'),false);
 }
 assert.equal(requests.length,2,'selected time must partition cache');
 await handleProxyRoute(new URL(`${base}&transportMode=transit&arrivalTime=${times[0]}&departureTime=${times[1]}`),env,()=>null);
 assert.equal(requests.at(-1).searchParams.get('arrival_time'),String(Date.parse(times[0])/1000));
 assert.equal(requests.at(-1).searchParams.has('departure_time'),false);
 await handleProxyRoute(new URL(`${base}&transportMode=car&departureTime=${times[0]}`),env,()=>null);
 assert.equal(requests.at(-1).searchParams.get('departure_time'),String(Date.parse(times[0])/1000));
 const result=await handleProxyRoute(new URL(`${base}&transportMode=car&arrivalTime=${times[0]}`),env,()=>null);
 assert.match(result.payload.message,/미반영/);
} finally { globalThis.fetch=originalFetch; }
console.log('Routing: selected departure, arrival precedence, driving support, unsupported arrival disclosure and cache isolation passed (mock HTTP only)');
const {getNotificationTrigger}=load('apps/mobile/src/providers/localNotifications.ts',['getNotificationTrigger'],{Platform:{OS:'ios'}});
const triggers={SchedulableTriggerInputTypes:{CALENDAR:'calendar',DATE:'date'}};
for (const timezone of ['Asia/Seoul','America/Los_Angeles','Asia/Tokyo']) {
 const result=getNotificationTrigger(triggers,{type:'bedtime',scheduleTimeZone:timezone,scheduledAt:'2090-01-01T00:00:00Z'});
 assert.equal(result.timezone,timezone);assert.equal(result.hour,21);assert.equal(result.repeats,true);
}
console.log('iOS reminder calendar trigger retains the forecast location timezone');
const ttlMarker=hook.indexOf('const expired = snapshot.stale');
const ttlStart=hook.lastIndexOf('useEffect(() => {',ttlMarker)+'useEffect(() => {'.length;
const ttlEnd=hook.indexOf('\n  }, [',ttlMarker);
for(const [age,attemptAge,active,loading,expected] of [
 [16*60_000,16*60_000,true,false,1], [14*60_000,16*60_000,true,false,0],
 [16*60_000,60_000,true,false,0], [16*60_000,16*60_000,false,false,0], [16*60_000,16*60_000,true,true,0],
]) {
 let refreshes=0;const now=Date.now();
 const bindings={appStateHydrated:true,AppState:{currentState:active?'active':'background'},isWeatherLoading:loading,
 nowMinuteTick:now,currentWeatherSnapshotRef:{current:{observedAt:new Date(now-age).toISOString()}},weatherRefreshAttemptAtRef:{current:now-attemptAge},setWeatherRefreshTick:()=>refreshes++};
 new Function(...Object.keys(bindings),hook.slice(ttlStart,ttlEnd))(...Object.values(bindings));
 assert.equal(refreshes,expected);
}
console.log('Foreground TTL: expired vs fresh, bounded retry, background and in-flight guards passed');
const rain=read('apps/mobile/src/screens/RainTimelineScreen.tsx');
const rainStart=rain.indexOf('          onPress={() => {')+'          onPress={() => {'.length;
const rainEnd=rain.indexOf('\n          }}',rainStart);
for(const enabled of [false,true])for(const permitted of [false,true]) {
 const events=[];
 new Function('onToggleAlertPreference','rainAlertEnabled','permissionReady','onRequestPermissionGate',rain.slice(rainStart,rainEnd))(
 key=>events.push(key),enabled,permitted,(...args)=>events.push(args));
 assert.equal(events[0],'rainDetail');
 assert.equal(events.length,!enabled&&!permitted?2:1);
 if(events.length===2)assert.deepEqual(events[1],['notification','H5','rain']);
}
console.log('H5: existing persisted rain preference callback and permission gate on enable passed');
// A past departure must not silently turn into a 'now' driving estimate.
globalThis.fetch=async()=>{throw new Error('past driving must not call a provider');};
try {
 const result=await handleProxyRoute(new URL('https://example.invalid/routes/estimate?origin=35,139&destination=36,140&originCountryCode=JP&destinationCountryCode=JP&transportMode=car&departureTime=2000-01-01T00:00:00Z'), k=>k==='GOOGLE_MAPS_API_KEY'?'mock-only':undefined,()=>null);
 assert.equal(result.payload.status,'fallback');
} finally {globalThis.fetch=originalFetch;}
assert.deepEqual(buildTomorrowWeather({...sample,hourly:[]},new Date('2026-10-04T01:00:00Z')).weather.hourly,[], 'daily-only forecast must not invent a 09:00 rain onset');
