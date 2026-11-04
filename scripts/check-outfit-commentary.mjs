import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSync } from 'esbuild';
import ts from 'typescript';
function bundle(file, external = []) {
  const m = { exports: {} };
  const code = buildSync({ entryPoints: [file], bundle: true, platform: 'node', format: 'cjs', write: false, external, tsconfig: 'apps/mobile/tsconfig.json' }).outputFiles[0].text;
  new Function('module', 'exports', 'require', code)(m, m.exports, () => ({getLocales: () => [{languageCode:'ko',languageTag:'ko-KR',regionCode:'KR'}],getCalendars:()=>[]}));
  return m.exports;
}
const s = bundle('packages/shared/src/index.ts');
const { summarizeHomeOutfit } = bundle('apps/mobile/src/utils/homeOutfitSummary.ts');
const { buildTodayOutfit } = bundle('apps/mobile/src/utils/todayOutfit.ts');
const { buildHomePreparation } = bundle('apps/mobile/src/utils/homeOuting.ts');
const { translateText } = bundle('apps/mobile/src/localization/localization.ts', ['expo-localization']);
const now = Date.parse('2026-10-31T12:30:00+09:00');
const hour = (tempC, at = 12, rain = false, windMs = 2) => ({time:`2026-10-31T${at}:00:00+09:00`,tempC,windMs,condition:rain?'rain':'clear',rainProbabilityPct:rain?80:0,precipitationMm:rain?2:0,available:{temp:true,wind:true,condition:true,rainProbability:true,precipitation:true}});
function weather(tempC, rain = false, windMs = 2, temps = [tempC]) {
  return {...s.gangneungClearSnapshot,locationId:'p2',locationName:'P2',source:'weatherkit',timezone:'Asia/Seoul',observedAt:new Date(now).toISOString(),stale:false,daily:undefined,
    current:{...s.gangneungClearSnapshot.current,tempC,feelsLikeC:tempC,tempAvailable:true,feelsLikeAvailable:true,condition:rain?'rain':'clear',windMs,windAvailable:true,rainProbabilityPct:rain?80:0,precipitationMm:rain?2:0,uvIndex:0,pm10:0,pm25:0,humidityPct:40},
    hourly:Array.from({length:12},(_,i)=>hour(temps[i%temps.length],12+i,rain,windMs))};
}
const samples = [];
for (const [name,w,base,extra] of [
 ['cold rain',weather(3,true),/보온 겉옷/,/우산/],
 ['hot rain',weather(32,true),/통풍/,/우산/],
 ['wind chill',{...weather(12,false,9),current:{...weather(12,false,9).current,feelsLikeC:3}},/보온 겉옷/,/겉옷을 여며/],
 ['swing',weather(19,false,2,[12,24]),/한 겹/,/기온 차/],
 ['calm',weather(22),/편한 차림/,/^온화한[^·]+$/],
 ['wind rain',weather(3,true,9),/보온 겉옷/,/방수 겉옷/],
]) {
 const {outfit,outfitContext} = buildTodayOutfit(w,s.defaultPreferenceProfile,s.presetWardrobe,now);
 assert.match(outfit.decisionText,base,name);assert.match(outfit.decisionText,extra,name);
 if(name==='wind rain') assert.doesNotMatch(outfit.decisionText+outfit.reasons.join(' '),/우산/);
 if(name==='calm') {assert.equal(outfit.items.outer,undefined);assert.equal(outfit.items.accessory,undefined);assert.equal(outfit.timeAdvice.length,0);}
 if(name==='cold rain') for(const item of [outfit.items.outer,outfit.items.top]) assert.ok(item.weatherTags.includes('cold'));
 if(name==='hot rain') for(const item of Object.values(outfit.items).filter(Boolean)) assert.ok(!item.weatherTags.includes('cold'));
 for(const item of Object.values(outfit.items).filter(Boolean)) assert.ok(fs.existsSync(item.imageUrl),item.imageUrl);
 assert.equal(outfitContext.weather.locationId,w.locationId);assert.equal(outfitContext.weather.hourly.length,12);
 samples.push({name,copy:outfit.decisionText});
}
for(const value of [8,8.01,12,12.01,18,18.01,26.99,27,28.99,29,30]) {
 const w=weather(value);const outfit=s.recommendOutfit({...w,hourly:[]},s.defaultPreferenceProfile,s.presetWardrobe);
 const home=buildHomePreparation(w,new Date(now).toISOString(),true,now);
 assert.equal(home.copy,outfit.decisionText,`shared instant thresholds ${value}`);
 samples.push({name:`boundary ${value}`,copy:home.copy});
}
const heavy=weather(3,true);heavy.current.precipitationMm=6;heavy.hourly=heavy.hourly.map(h=>({...h,precipitationMm:6}));
const heavyResult=buildTodayOutfit(heavy,s.defaultPreferenceProfile,s.presetWardrobe,now);
assert.match(heavyResult.outfit.decisionText,/보온.*강한 강수.*방수/);samples.push({name:'heavy cold rain',copy:heavyResult.outfit.decisionText});
const cold=weather(3,true);
for(const variant of [{stale:true},{source:'cache'},{source:'fallback'},{locationUnverified:true},{observedAt:new Date(now-16*60_000).toISOString()}]) {
 const w={...cold,...variant};const r=buildTodayOutfit(w,s.defaultPreferenceProfile,s.presetWardrobe,now);
 assert.match(r.outfit.decisionText,/최신 날씨/);assert.equal(r.outfit.timeAdvice.length,0);assert.deepEqual(r.outfit.reasons,[]);
 if(variant.observedAt===undefined) assert.deepEqual(s.recommendOutfit(w,s.defaultPreferenceProfile,s.presetWardrobe).reasons,[]);
 const p=buildHomePreparation(w,new Date(now).toISOString(),true,now);assert.doesNotMatch(p.copy,/겉옷|우산|따뜻/);
}
const missing={...cold,current:{...cold.current,tempAvailable:false,feelsLikeAvailable:false}};
const m=buildTodayOutfit(missing,s.defaultPreferenceProfile,s.presetWardrobe,now);
assert.match(m.outfit.decisionText,/온도를 확인/);assert.ok(Object.values(m.outfit.items).every(v=>!v));
const futureWind=weather(3,false,9);futureWind.hourly[2]=hour(3,14,true,9);
const futureWindResult=buildTodayOutfit(futureWind,s.defaultPreferenceProfile,s.presetWardrobe,now);
assert.match(futureWindResult.outfit.decisionText,/보온.*방수.*14:00/);assert.doesNotMatch(futureWindResult.outfit.decisionText,/우산/);
const unknownPhase=weather(22);unknownPhase.hourly[2]={...hour(22,14),condition:'snow',available:{...hour(22).available,condition:false}};
assert.doesNotMatch(buildTodayOutfit(unknownPhase,s.defaultPreferenceProfile,s.presetWardrobe,now).outfit.decisionText,/눈|14:00/);
const changing=weather(22);changing.hourly=changing.hourly.map((h,i)=>({...h,tempC:i<2?22:15}));
const advice=buildTodayOutfit(changing,s.defaultPreferenceProfile,s.presetWardrobe,now).outfit.timeAdvice;
assert.equal(advice.length,1);assert.match(advice[0].time,/14:00/);assert.match(advice[0].text,/한 겹/);
const missingWind=weather(3);missingWind.hourly[0].windMs=NaN;
const missingWindCopy=buildHomePreparation(missingWind,new Date(now).toISOString(),true,now);
assert.match(missingWindCopy.status,/일부/);assert.doesNotMatch(missingWindCopy.copy,/바람/);
const instant=buildHomePreparation({...cold,hourly:[hour(3)]},new Date(now).toISOString(),true,now);
assert.doesNotMatch(instant.copy,/기온 차|오후|저녁|최저/);
const partial=buildTodayOutfit({...weather(19),hourly:[hour(12),hour(24,14)]},s.defaultPreferenceProfile,s.presetWardrobe,now);
assert.equal(partial.outfitContext.complete,false);assert.match(partial.outfitContext.status,/일부/);assert.doesNotMatch(partial.outfit.decisionText,/일교차|저녁/);
for (const sample of samples) {
 const summary = summarizeHomeOutfit(sample.copy);
 assert.ok(summary.length <= sample.copy.length, sample.name);
 const mergedLayering = /^(추운 날씨라|서늘함에)/.test(sample.copy) && sample.copy.includes('확인된 기온 차가 커서');
 assert.equal(summary.split(' · ').length, sample.copy.split(' · ').length - Number(mergedLayering), 'Only repeated layering advice may merge; keep separate warnings');
 for (const language of ['en', 'ja']) assert.doesNotMatch(translateText(summary, language), /[가-힣]/u);
}
assert.equal(summarizeHomeOutfit('추운 날씨라 보온 겉옷과 따뜻한 상의가 좋아요'), '따뜻한 상의와 겉옷을 챙겨요');
assert.match(summarizeHomeOutfit(heavyResult.outfit.decisionText), /따뜻.*강한 강수.*방수/);
assert.match(summarizeHomeOutfit(futureWindResult.outfit.decisionText), /따뜻.*방수.*14:00/);
assert.equal(summarizeHomeOutfit(m.outfit.decisionText), m.outfit.decisionText);
assert.equal(summarizeHomeOutfit('새로운 경고 문구'), '새로운 경고 문구');
const screenshotCopy = '추운 날씨라 보온 겉옷과 따뜻한 상의가 좋아요 · 확인된 기온 차가 커서 겉옷을 벗고 입으며 조절해요';
assert.equal(summarizeHomeOutfit(screenshotCopy), '따뜻하게 겹쳐 입고, 겉옷으로 조절해요');
assert.ok(summarizeHomeOutfit(screenshotCopy).length <= 24, 'The reported long headline becomes one short sentence');
const layeredRain = summarizeHomeOutfit(`${screenshotCopy.split(' · ')[0]} · 강수와 강한 바람에 대비해 방수 겉옷을 챙겨요 · ${screenshotCopy.split(' · ')[1]} · 오늘 14:00 무렵 비 예보`);
assert.match(layeredRain, /따뜻.*조절.*강수·강풍.*방수.*14:00.*비 예보/, 'Merging thermal advice cannot remove rain/wind protection or forecast time');
assert.match(summarizeHomeOutfit('영하의 추위라 두툼한 보온 겉옷과 목도리를 챙겨요'), /두툼.*목도리/);
assert.match(summarizeHomeOutfit('더운 날씨라 통풍이 잘되는 가벼운 차림에 물도 챙겨요'), /시원.*물/);
// Every thermal group has three short, stable expressions; warnings keep their meaning and order.
const thermalBases = [
 '추운 날씨라 보온 겉옷과 따뜻한 상의가 좋아요',
 '더운 날씨라 통풍이 잘되는 가벼운 차림이 좋아요',
 '서늘함에 대비해 가볍게 걸칠 한 겹이 좋아요',
 '온화한 기온에 맞춰 편한 차림으로 나가요',
];
for (const base of thermalBases) {
 const variants = new Set();
 for (const day of [1, 2, 3]) {
  const instant = Date.parse(`2026-11-0${day}T12:00:00+09:00`);
  const copy = summarizeHomeOutfit(base, instant, 'Asia/Seoul');
  variants.add(copy);
  assert.ok(copy.length <= base.length);
  assert.match(copy, /요$/);
  assert.equal(summarizeHomeOutfit(base, instant + 3600000, 'Asia/Seoul'), copy);
  for (const language of ['en', 'ja']) assert.doesNotMatch(translateText(copy, language), /[가-힣]/u);
  for (const sample of samples) {
   const combined = `${base} · ${sample.copy.split(' · ').slice(1).join(' · ')}`;
   assert.equal(summarizeHomeOutfit(combined, instant, 'Asia/Seoul').split(' · ').slice(1).join(' · '), summarizeHomeOutfit(combined).split(' · ').slice(1).join(' · '));
  }
  for (const copy of [m.outfit.decisionText, '최신 날씨를 확인한 뒤 코디를 안내해요', '새로운 경고 문구']) {
   assert.equal(summarizeHomeOutfit(copy, instant, 'Asia/Seoul'), copy);
  }
 }
 assert.equal(variants.size, 3);
 const midnight = Date.parse('2026-11-02T00:00:00+09:00');
 assert.notEqual(summarizeHomeOutfit(base, midnight - 1, 'Asia/Seoul'), summarizeHomeOutfit(base, midnight, 'Asia/Seoul'));
 assert.equal(summarizeHomeOutfit(base, midnight, 'America/New_York'), summarizeHomeOutfit(base, midnight - 1, 'Asia/Seoul'));
 assert.equal(summarizeHomeOutfit(base, midnight, 'invalid-zone'), summarizeHomeOutfit(base));
}
console.log('PASS: 12 friendly thermal phrases, per-location daily stability/midnight, unchanged warnings and unknown states, KO/EN/JA.');
assert.ok(homeOrder());
function homeOrder() {
 const source = fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx', 'utf8');
 assert.ok(source.indexOf('<HomeDecisionHero') < source.indexOf('<HomeOutfitPreviewCard'));
 assert.ok(source.indexOf('<HomeOutfitPreviewCard') < source.indexOf('testID="home-plan-card"'));
 assert.match(source, /companionMessage=\{Platform.OS === "ios" \? undefined : companionMessage\}/);
 return true;
}
for(const sample of samples) for(const language of ['ko','en','ja']) {
 const translated=translateText(sample.copy,language);assert.ok(translated.length);
 if(language!=='ko') assert.doesNotMatch(translated,/[가-힣]/u,`${sample.name} ${language}`);
}
// Execute the real preview JSX: item images, shared decision, provenance and uncapped text.
const home=fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');
const ast=ts.createSourceFile('home.tsx',home,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='HomeOutfitPreviewCard');
const jsx=ts.transpileModule(fn.getText(ast),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText;
const createElement=(type,props,...children)=>({type,props,children});
for(const fontScale of [1,1.6,2]) for(const language of ['ko','en','ja']) {
 const {outfit,outfitContext}=buildTodayOutfit(cold,s.defaultPreferenceProfile,s.presetWardrobe,now);
 const render=new Function('React','useResponsiveLayout','isHomeTightLayout','useWindowDimensions','Platform','getOutfitImageSource','translateText','summarizeHomeOutfit','getDisplayLocationName','FeedbackPressable','View','Text','Image','styles','ambientUiIcons','const useAmbientEntrance = () => ({});const useOutfitNavigation=()=> (_id,_target,navigate)=>navigate();const OutfitMotionImage=Image;'+jsx+';return HomeOutfitPreviewCard;')({createElement},()=>({width:390}),()=>false,()=>({fontScale}),{OS:'ios'},url=>url,v=>translateText(v,language),summarizeHomeOutfit,v=>v,'button','div','span','img',new Proxy({},{get:()=>({})}),{expand:'expand'});
 const tree=render({outfit,summary:summarizeHomeOutfit(outfit.decisionText),forecastStatus:outfitContext.status,locationName:'P2',weatherBasis:'목적지',theme:{},onPress(){}});
 const nodes=[];function visit(n){if(Array.isArray(n))return n.forEach(visit);if(!n||typeof n!=='object')return;nodes.push(n);n.children?.forEach(visit);}visit(tree);
 const comment=nodes.find(n=>n.children?.includes(summarizeHomeOutfit(outfit.decisionText)));assert.ok(comment);assert.equal(comment.props.numberOfLines,undefined);assert.equal(comment.props.adjustsFontSizeToFit,undefined);
 const images=nodes.filter(n=>n.type==='img'&&n.props.resizeMode==='contain');assert.deepEqual(images.map(n=>n.props.source),[outfit.items.outer.imageUrl,outfit.items.shoes.imageUrl]);
 const row=nodes.find(n=>n.props?.style?.flexDirection);assert.equal(row.props.style.flexDirection,fontScale>1.3?'column':'row');
}
console.log('PASS: compound conditions, item assets/thermal consistency, instant thresholds, missing/stale/partial defenses, action-only hourly advice, ko/en/ja and real Home preview JSX at 1–2x type.');
const outfitSource = fs.readFileSync('apps/mobile/src/screens/OutfitScreen.tsx', 'utf8');
const outfitAst = ts.createSourceFile('outfit.tsx', outfitSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let headline;
function findHeadline(node) {
 if (ts.isJsxElement(node) && node.openingElement.attributes.getText(outfitAst).includes('testID="outfit-summary"')) headline = node.getText(outfitAst);
 ts.forEachChild(node, findHeadline);
}
findHeadline(outfitAst); assert.ok(headline);
const renderHeadline = new Function('React', 'Text', 'pageStyles', 'theme', 'ambient', 'state', 'forecastNow', 'summarizeHomeOutfit', ts.transpileModule(`const headline = (${headline});`, { compilerOptions: { jsx: ts.JsxEmit.React } }).outputText + '\nreturn headline;');
const rendered = renderHeadline({ createElement }, 'Text', { body: {} }, {}, true, { outfit: { decisionText: screenshotCopy }, weather: { timezone: 'Asia/Seoul' } }, now, summarizeHomeOutfit);
assert.equal(rendered.children[0], summarizeHomeOutfit(screenshotCopy, now, 'Asia/Seoul'));
assert.equal(rendered.props.numberOfLines, undefined, 'The shorter headline still wraps at large text sizes');
console.log('PASS reported cold/swing headline uses the same short copy on Home and Outfit; hydration, freezing, rain/wind and future forecast warnings remain visible.');
