import assert from "node:assert/strict";
import { buildSync } from "esbuild";
const m = {exports:{}};
new Function("module", "exports", buildSync({entryPoints:["apps/mobile/src/utils/todayOutfit.ts"],bundle:true,platform:"node",format:"cjs",write:false,tsconfig:"apps/mobile/tsconfig.json"}).outputFiles[0].text)(m,m.exports);
const shared = {exports:{}};
new Function("module", "exports", buildSync({entryPoints:["packages/shared/src/index.ts"],bundle:true,platform:"node",format:"cjs",write:false}).outputFiles[0].text)(shared,shared.exports);
const s=shared.exports;
const h=(time,rain=0,amount=0,condition="clear")=>({time,tempC:22,windMs:2,rainProbabilityPct:rain,precipitationMm:amount,condition,available:{temp:true,wind:true,rainProbability:true,precipitation:true,condition:true}});
const now=Date.parse("2026-10-10T23:30:00+09:00");
const base={...s.gangneungClearSnapshot,locationId:"test-location",locationName:"Test",timezone:"Asia/Seoul",source:"weatherkit",observedAt:new Date(now).toISOString(),stale:false,current:{...s.gangneungClearSnapshot.current,condition:"clear",rainProbabilityPct:0,precipitationMm:0},hourly:[h("2026-10-10T23:00")]};
const run=(w=base,n=now)=>m.exports.buildTodayOutfit(w,s.defaultPreferenceProfile,s.presetWardrobe,n);
for(const extra of [h("2026-10-10T22:00",80,2,"rain"),h("2026-10-11T00:00",80,2,"rain")]){
 const r=run({...base,hourly:[extra,...base.hourly]});assert.doesNotMatch(r.outfit.decisionText,/비 소식|비 예보/);assert.equal(r.outfitContext.weather.hourly.length,1);assert.equal(r.outfitContext.complete,true);
}
const dayNow=Date.parse("2026-10-10T12:30:00+09:00");
const full={...base,observedAt:new Date(dayNow).toISOString(),hourly:Array.from({length:12},(_,i)=>h(`2026-10-10T${12+i}:00`,i===2?80:0,i===2?2:0,i===2?"rain":"clear"))};
assert.match(run(full,dayNow).outfit.decisionText,/오늘 14:00.*비 예보/);
assert.equal(run(full,dayNow).outfitContext.reliable,true);
for(const variant of [{stale:true},{observedAt:new Date(dayNow-16*60000).toISOString()},{source:"cache"},{locationUnverified:true}]){
 const r=run({...full,...variant},dayNow);assert.match(r.outfit.decisionText,/최신 날씨/);assert.match(r.outfitContext.status,/최근 자료/);assert.equal(r.outfit.timeAdvice.length,0);
}
for(const hourly of [[],[h("23:00",80,2)],[{...h("2026-10-10T23:00"),available:{temp:true,wind:true,rainProbability:false,precipitation:true}}]]){
 const r=run({...base,hourly});assert.equal(r.outfitContext.complete,false);assert.doesNotMatch(r.outfit.decisionText,/비 없음|걱정 없|비 예보/);
}
for(const timezone of [undefined,"Invalid/Zone"]){const r=run({...base,timezone});assert.match(r.outfitContext.status,/시간대/);assert.equal(r.outfitContext.weather.hourly.length,0);}
const utcNow=Date.parse("2026-10-10T23:30:00Z");
const ny={...base,timezone:"America/New_York",observedAt:new Date(utcNow).toISOString(),hourly:[h("2026-10-11T00:00:00Z",80,2,"rain"),h("2026-10-11T04:00:00Z",90,3,"rain")]};
const nr=run(ny,utcNow);assert.equal(nr.outfitContext.weather.hourly.length,1);assert.match(nr.outfit.decisionText,/20:00/);
// The local midnight changes date independently of the execution machine zone.
const midnight=Date.parse("2026-10-11T00:00:00+09:00");const mr=run({...base,observedAt:new Date(midnight).toISOString(),hourly:[...base.hourly,h("2026-10-11T00:00",80,2,"rain")]},midnight);assert.equal(mr.outfitContext.weather.hourly.length,1);assert.match(mr.outfit.decisionText,/00:00/);
// Missing later hours are not a claim of a rain-free rest of day.
const gap=run({...full,hourly:[full.hourly[0],full.hourly[2]]},dayNow);assert.equal(gap.outfitContext.complete,false);assert.match(gap.outfitContext.status,/일부/);assert.match(gap.outfit.decisionText,/14:00/);
assert.equal(run().outfitContext.observedLabel,"10/10 23:30");
console.log("PASS: today outfit local midnight, past/next-day exclusion, later rain with current clear, stale/cache/unverified, missing fields/timezone/coverage and location-zone display.");

for(const source of ["fallback"]){const r=run({...base,source});assert.equal(r.outfitContext.currentAvailable,false);assert.equal(r.outfitContext.observedLabel,undefined);}
for(const [instant,localDate,zone] of [["2026-03-08T06:30:00Z","2026-03-08","America/New_York"],["2026-11-01T05:30:00Z","2026-11-01","America/New_York"]]){
 const t=Date.parse(instant);const r=run({...base,timezone:zone,observedAt:instant,hourly:[h(`${localDate}T23:00`,80,2,"rain")]},t);assert.equal(r.outfitContext.weather.hourly.length,1);assert.match(r.outfit.decisionText,/23:00/);
}
console.log("PASS: unknown observation provenance and DST calendar-day boundaries.");
