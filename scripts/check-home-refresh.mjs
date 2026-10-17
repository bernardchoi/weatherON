import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

// Execute production TypeScript with only platform boundaries replaced. No
// dependencies, generated files, network, device, or installed SQLite required.
const read = (path) => readFileSync(path, "utf8").replaceAll("\r\n", "\n");
function load(path, names, bindings = {}, replacements = []) {
  let source = stripTypeScriptTypes(read(path));
  for (const [before, after] of replacements) source = source.replaceAll(before, after);
  const js = source.replace(/^import[\s\S]*?;\n/gmu, "").replace(/^export /gmu, "");
  return new Function(...Object.keys(bindings), `${js}\nreturn {${names.join(",")}};`)(...Object.values(bindings));
}
const flush = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

const conditions = load("packages/shared/src/weather/condition.ts", ["conditionFromWeatherKit", "conditionFromOpenMeteo"]);
const { isValidIanaTimeZone } = load("packages/shared/src/weather/timezone.ts", ["isValidIanaTimeZone"]);
const { normalizeWeatherKitWeather } = load("packages/shared/src/weather/weatherKitAdapter.ts", ["normalizeWeatherKitWeather"], { ...conditions, isValidIanaTimeZone });
const { normalizeOpenMeteoWeather } = load("packages/shared/src/weather/openMeteoAdapter.ts", ["normalizeOpenMeteoWeather"], conditions);
const location = (id, latitude) => ({ locationId: id, locationName: id, countryCode: "JP", timezone: "Asia/Tokyo", coordinate: { latitude, longitude: 140 } });
const home = location("home", 35), away = location("away", 36), other = location("other", 37);
const now = Date.now();
const payload = (temperature, time = now) => ({ currentWeather: { asOf: new Date(time).toISOString(), temperature, conditionCode: "Clear", humidity: 0.5 } });
const weatherBindings = {
  Platform: { OS: "ios" }, getWeatherRuntimeConfig: () => ({ clientMode: "proxy" }),
  runtimeWeatherClient: {}, fixtureWeatherClient: {},
  defaultSeoulWeatherLocation: home, seongsuWeatherLocation: home,
  defaultGangneungWeatherLocation: away, gangneungWeatherLocation: away,
  normalizeWeatherKitWeather, normalizeOpenMeteoWeather, isValidIanaTimeZone,
  openMeteoFixture: { current: { time: new Date(now).toISOString(), temperature_2m: 10 } },
};
const { createWeatherProvider } = load("apps/mobile/src/providers/weatherProvider.ts", ["createWeatherProvider"], weatherBindings);

const zone=load("apps/mobile/src/utils/zonedDateTime.ts",["addZonedCalendarDays","createDateAtTimeInZone","getZonedDateTimeParts","parseDateTimeInZone"]);
const {buildHomePreparation}=load("apps/mobile/src/utils/homeOuting.ts",["buildHomePreparation"],zone);
let delay=false;let job=deferred();const updates=[];
const provider=createWeatherProvider({fetchWeatherKitForecast:async ({latitude})=>delay&&latitude===36?job.promise:payload(22)});
const options={currentLocation:home,destinationLocation:away};
const first=await provider.getSnapshots('ready',options);
const before=buildHomePreparation(first.destination,undefined,true,now).copy;
delay=true;
const next=provider.getSnapshots('ready',{...options,onUpdate:r=>updates.push(r)});
await flush();
assert.ok(updates.length>0);
assert.equal(updates.at(-1).destination.current.tempC,22);
assert.equal(buildHomePreparation(updates.at(-1).destination,undefined,true,now).copy,before,'Pending refresh with identical fresh destination must not replace Home guidance with neutral copy');
job.resolve(payload(22));await next;
console.log('PASS: actual progressive provider + Home preparation retain identical fresh guidance while destination refresh is pending');


// These boundaries use production provider promises, not a retained UI string.
async function duringRefresh(seed, requested=away, mode='ready') {
  const held=deferred();const seen=[];
  const p=createWeatherProvider({fetchWeatherKitForecast:async ({latitude})=>latitude===35?payload(22):held.promise});
  const promise=p.getSnapshots(mode,{currentLocation:home,destinationLocation:requested,cachedSnapshots:[seed],onUpdate:r=>seen.push(r)});
  await flush();
  return {interim:seen.at(-1),held,promise};
}
const freshSeed=first.destination;
for(const patch of [{stale:true},{observedAt:new Date(now-16*60_000).toISOString()},{observedAt:'invalid'},{observedAt:new Date(now+60_000).toISOString()},{locationUnverified:true},{source:'cache'},{source:'fallback'}]){
 const run=await duringRefresh({...freshSeed,...patch});
 const value=run.interim.destination;
 assert.notEqual(buildHomePreparation(value,undefined,true,now).copy,before,'Invalid/unverified/expired snapshots cannot masquerade as valid guidance');
 run.held.resolve(payload(22));await run.promise;
}
const failure=await duringRefresh(freshSeed);failure.held.reject(new Error('offline'));
const failed=await failure.promise;assert.equal(failed.status,'error');assert.equal(failed.destination.stale,true);
assert.notEqual(buildHomePreparation(failed.destination,undefined,true,now).copy,before,'A completed error must remain visible');
const changed=await duringRefresh(freshSeed);changed.held.resolve(payload(4));
const newResult=await changed.promise;assert.equal(newResult.destination.current.tempC,4);
assert.notEqual(buildHomePreparation(newResult.destination,undefined,true,now).copy,before,'New weather must replace the pending observation');
for(const requested of [other,{...away,timezone:'America/New_York'},{...away,countryCode:'GLOBAL'}]){
 const run=await duringRefresh(freshSeed,requested);
 assert.equal(run.interim.destination.source,'fallback','Changed location context cannot borrow a prior location snapshot');
 assert.notEqual(buildHomePreparation(run.interim.destination,undefined,true,now).copy,before);
 run.held.resolve(payload(22));await run.promise;
}
const {buildRainForecast}=load('apps/mobile/src/utils/homeOuting.ts',['buildRainForecast'],zone);
const hourAt=Math.floor(now/3_600_000)*3_600_000+3_600_000;
const forecast=(at,condition,temp)=>({time:new Date(at).toISOString(),condition,tempC:temp,windMs:1,rainProbabilityPct:condition==='rain'?90:0,precipitationMm:condition==='rain'?2:0,available:{temp:true,wind:true,rainProbability:true,precipitation:true,condition:true}});
const scoped={...freshSeed,hourly:[forecast(hourAt,'rain',22),forecast(hourAt+3_600_000,'clear',22)]};
const scopedRun=await duringRefresh(scoped);
const snapshot=scopedRun.interim.destination;
const rainTarget=new Date(hourAt).toISOString(),clearTarget=new Date(hourAt+3_600_000).toISOString(),missingTarget=new Date(hourAt+4*3_600_000).toISOString();
assert.match(buildHomePreparation(snapshot,rainTarget,true,now).copy,/우산/);
assert.doesNotMatch(buildHomePreparation(snapshot,clearTarget,true,now).copy,/우산/,'Changing target time recalculates from the snapshot rather than preserving prior copy');
assert.match(buildHomePreparation(snapshot,missingTarget,true,now).status,/선택 시각 예보 없음/);
assert.equal(buildRainForecast(snapshot,{locationId:away.locationId,targetAt:missingTarget,basisLabel:'arrival'},now).bars.length,0);
scopedRun.held.resolve(payload(22));const missingResult=await scopedRun.promise;
assert.match(buildHomePreparation(missingResult.destination,rainTarget,true,now).status,/예보 없음/,'New response with missing forecast must not retain old forecast hours');
const legacy=load('apps/mobile/src/providers/weatherProvider.ts',['getPendingSnapshot'],weatherBindings).getPendingSnapshot;
assert.equal(legacy(freshSeed,away,false).stale,true,'Non-iOS and explicit stale/error modes retain legacy behavior');
console.log('PASS: actual provider pending/error/new data/expiry/unverified/location and timezone changes; Home target time/missing forecast recomputation; no false preservation');

let outcome='success';let retryJob=deferred();const retryUpdates=[];
const retryProvider=createWeatherProvider({fetchWeatherKitForecast:async ({latitude})=>{
 if(latitude===35)return payload(22);
 if(outcome==='failure')throw new Error('offline');
 if(outcome==='pending')return retryJob.promise;
 return payload(22);
}});
await retryProvider.getSnapshots('ready',options);outcome='failure';await retryProvider.getSnapshots('ready',options);
outcome='pending';const retry=retryProvider.getSnapshots('ready',{...options,onUpdate:r=>retryUpdates.push(r)});await flush();
assert.equal(retryUpdates.at(-1).destination.stale,true,'Retry must not temporarily revive the snapshot invalidated by an actual error');
retryJob.resolve(payload(22));assert.equal((await retry).destination.stale,false);
console.log('PASS: an actual failed refresh remains stale during retry until a successful response');

let round=0;const lateFailure=deferred(),latestPending=deferred();const concurrentUpdates=[];
const concurrent=createWeatherProvider({fetchWeatherKitForecast:async ({latitude})=>{
 if(latitude===35)return payload(22);
 round++;if(round===2)return lateFailure.promise;if(round===4)return latestPending.promise;
 return payload(round===3?4:22);
}});
await concurrent.getSnapshots('ready',options);
const older=concurrent.getSnapshots('ready',options);await flush();await concurrent.getSnapshots('ready',options);
lateFailure.reject(new Error('late failed old request'));await older;
const newest=concurrent.getSnapshots('ready',{...options,onUpdate:r=>concurrentUpdates.push(r)});await flush();
assert.equal(concurrentUpdates.at(-1).destination.stale,false);
assert.equal(concurrentUpdates.at(-1).destination.current.tempC,4,'Old failure must not invalidate newer successful weather');
latestPending.resolve(payload(4));await newest;
console.log('PASS: late old failure cannot invalidate newer concurrent success');
