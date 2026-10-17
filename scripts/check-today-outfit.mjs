import assert from "node:assert/strict";
import { buildSync } from "esbuild";
const m = {exports:{}};
new Function("module", "exports", buildSync({entryPoints:["apps/mobile/src/utils/todayOutfit.ts"],bundle:true,platform:"node",format:"cjs",write:false,tsconfig:"apps/mobile/tsconfig.json"}).outputFiles[0].text)(m,m.exports);
const shared = {exports:{}};
new Function("module", "exports", buildSync({entryPoints:["packages/shared/src/index.ts"],bundle:true,platform:"node",format:"cjs",write:false}).outputFiles[0].text)(shared,shared.exports);
const s=shared.exports;
const h=(time,rain=0,amount=0,condition="clear")=>({time,tempC:22,windMs:2,rainProbabilityPct:rain,precipitationMm:amount,condition,available:{temp:true,wind:true,rainProbability:true,precipitation:true,condition:true}});
const now=Date.parse("2026-10-10T23:30:00+09:00");
const base={...s.gangneungClearSnapshot,locationId:"test-location",locationName:"Test",timezone:"Asia/Seoul",source:"weatherkit",observedAt:new Date(now).toISOString(),stale:false,current:{...s.gangneungClearSnapshot.current,condition:"clear",feelsLikeAvailable:true,tempAvailable:true,rainProbabilityPct:0,precipitationMm:0},hourly:[h("2026-10-10T23:00")]};
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
const missing={...base,current:{...base.current,pm25:0,pm10:0,uvIndex:0,feelsLikeC:0,tempC:0,feelsLikeAvailable:false,tempAvailable:false}};
const missingResult=run(missing);
assert.equal(missingResult.outfitContext.currentAvailable,false,"provider missing flags must not expose fallback 0 as a temperature");
assert.equal(missingResult.outfitContext.reliable,true,"missing temperature is not stale weather");
assert.equal(Object.values(missingResult.outfit.items).filter(Boolean).length,0,"defer thermal outfit selection without temperature");

assert.equal(missingResult.outfitContext.weather.hourly.length,1,"keep usable remaining-day forecast");
assert.doesNotMatch(missingResult.outfitContext.status,/최근 자료/);
assert.match(missingResult.outfit.decisionText,/온도를 확인/);
assert.equal(missingResult.outfit.timeAdvice.length,0);
for(const [field,value,basis] of [["feelsLike",0,"feelsLike"],["temp",0,"air"],["temp",30,"air"]]) {
 const r=run({...missing,current:{...missing.current,[field+"C"]:value,[field+"Available"]:true}});
 assert.equal(r.outfitContext.currentAvailable,true); assert.equal(r.outfitContext.temperature.value,value); assert.equal(r.outfitContext.temperature.basis,basis);
 assert.ok(Object.values(r.outfit.items).some(Boolean));
 if(basis==="air") {assert.doesNotMatch(r.outfit.reasons.join(" "),/체감/); assert.match(r.outfit.reasons.join(" "),/현재 기온/);}
}
for(const flags of [{feelsLikeAvailable:false,tempAvailable:false},{feelsLikeAvailable:undefined,tempAvailable:undefined}]) {
 const r=run({...missing,current:{...missing.current,...flags,tempC:30,feelsLikeC:35}});assert.equal(r.outfitContext.currentAvailable,false);
}
const nan=run({...base,current:{...base.current,tempC:NaN,feelsLikeC:NaN}});assert.equal(nan.outfitContext.currentAvailable,false);
const coldZero=run({...base,current:{...base.current,tempC:0,feelsLikeC:0}});assert.equal(coldZero.outfit.variant,"cold");
for(const condition of ["rain","snow"]) {const r=run({...missing,current:{...missing.current,condition}});assert.match(r.outfit.decisionText,condition==="snow"?/현재 눈/:/현재 비/);assert.equal(Object.values(r.outfit.items).filter(Boolean).length,0);}
const uv=run({...missing,current:{...missing.current,uvIndex:8}});assert.match(uv.outfit.decisionText,/햇빛/);
const missingWet=run({...missing,hourly:[h("2026-10-10T23:00",80,2,"rain")]});assert.match(missingWet.outfit.decisionText,/비 예보/);
const staleMissing=run({...missing,stale:true});assert.match(staleMissing.outfitContext.status,/최근 자료/);assert.match(staleMissing.outfit.decisionText,/최신 날씨/);
// Real adapter → today scope, not only handcrafted normalized fixtures.
const adapted=s.normalizeWeatherKitWeather({currentWeather:{asOf:new Date(now).toISOString(),conditionCode:"Cloudy"}}, {locationId:"test",locationName:"Test",countryCode:"KR",timezone:"Asia/Seoul"});
assert.equal(adapted.current.feelsLikeC,0);assert.equal(run(adapted).outfitContext.currentAvailable,false);
const legacy=s.recommendOutfit(base,s.defaultPreferenceProfile,s.presetWardrobe);
assert.ok(legacy.items.top && legacy.items.bottom && legacy.items.shoes,"non-opt-in callers keep complete outfits");
console.log("PASS: provider presence, real zero, air-only basis, missing thermal items, retained wet/UV signals, stale separation and legacy call policy.");
// Execute the actual detail temperature tile, including missing numeric display.
const fs=await import("node:fs");const ts=(await import("typescript")).default;
const detailSource=fs.readFileSync("apps/mobile/src/screens/OutfitDetailScreen.tsx","utf8");
const ast=ts.createSourceFile("detail.tsx",detailSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const pieces=ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&["buildWeatherReasons","getRainSignalPct"].includes(n.name?.text)).map(n=>n.getText(ast)).join("\n");
const detail=new Function("uiIconAssets","formatWindSpeed",ts.transpile(pieces,{target:ts.ScriptTarget.ES2020})+";return buildWeatherReasons;")({},String);
for(const [weather,expectedValue,expectedLabel] of [[missing,"확인 필요","체감 온도"],[{...missing,current:{...missing.current,tempC:30,tempAvailable:true}},"30도","현재 기온"],[{...base,current:{...base.current,tempC:0,feelsLikeC:0}},"0도","체감 온도"]]) {
 const result=run(weather); const tile=detail({weather,...result},{})[0];assert.equal(tile.value,expectedValue);assert.equal(tile.label,expectedLabel);
}
const staleAir={...missing,stale:true,current:{...missing.current,tempC:15,tempAvailable:true}};
assert.equal(detail({weather:staleAir,...run(staleAir)},{})[0].detail,"최근 관측 기준");
console.log("PASS: actual detail tile hides missing 0, labels air-only data, preserves real zero and stale provenance.");
