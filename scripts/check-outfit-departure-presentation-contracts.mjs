// Preserve the weather/schedule policy while polishing these three reading screens.
import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import ts from 'typescript';
const baseline='02f68c1b5d7240b3e2b62728610c893715334edb';
const old=file=>execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'});
const current=file=>fs.readFileSync(file,'utf8');
function functions(source,names){const ast=ts.createSourceFile('fixture.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);return ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.includes(n.name?.text)).map(n=>n.getText(ast));}
for(const [file,names] of [
 ['apps/mobile/src/screens/OutfitDetailScreen.tsx',['buildWeatherReasons','getRainSignalPct','formatAdviceTime','getTimeAdvicePresentation','formatWindSpeed']],
 ['apps/mobile/src/screens/DestinationListScreen.tsx',['buildDestinationCards','buildDestinationWarning','getDestinationResultBanner','getAreaLabel','getGlobalAreaLabel','getCountryCityLabel','isAdministrativeNoise','trimAdministrativeSuffix','getDestinationActionText','getDestinationSchedule','getRepeatLabel','subtractMinutes','getAlertPillLabel','getStatusColor']],
])assert.deepEqual(functions(current(file).replace('      ...getDestinationWeatherPresentation(destinationWeatherById[destination.place.id]),\n', ''),names),functions(old(file),names),file+' policy helpers changed');
for(const file of ['apps/mobile/src/utils/todayOutfit.ts','apps/mobile/src/utils/homeOuting.ts','apps/mobile/src/utils/confirmedInteractionFeedback.ts','apps/mobile/src/components/WardrobeFilterControls.tsx','apps/mobile/src/components/HomePlanMaterial.tsx','apps/mobile/src/navigation/routes.ts'])assert.equal(current(file),file.endsWith('WardrobeFilterControls.tsx') ? execFileSync('git',['show','0e804e5dad1747628a25c73c14d95238b23f3de1:'+file],{encoding:'utf8'}) : old(file),file+' must retain baseline policy/hidden routes/material/filter');
for(const file of ['apps/mobile/src/screens/OutfitDetailScreen.tsx','apps/mobile/src/screens/DestinationListScreen.tsx']){
 const effects=source=>{const ast=ts.createSourceFile('fixture.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const found=[];function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(ast)==='React.useEffect')found.push(node.getText(ast));ts.forEachChild(node,visit);}visit(ast);return found;};
 assert.deepEqual(effects(current(file)),effects(old(file)),file+' confirmed feedback effect changed');
}
console.log('PASS unchanged weather reasons/date/schedule/temperature/action helpers; today scope/presence/stale, confirmed haptic effects, approved independent filters/native material and hidden routes retain exact baseline policy.');

// The sole allowed card extension presents only this destination's own weather.
const helper=functions(current('apps/mobile/src/screens/DestinationListScreen.tsx'),['getDestinationWeatherPresentation'])[0];
const evaluate=new Function(ts.transpileModule(helper,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText+';return getDestinationWeatherPresentation;')();
const fresh={source:'weatherkit',current:{tempC:20,condition:'clear'},hourly:[{time:new Date(Date.now()+86400000).toISOString()}]};
assert.deepEqual(evaluate(fresh),{weatherCondition:'clear',weatherAvailable:true,weatherNotice:null});
for(const value of [undefined,{...fresh,source:'fallback'},{...fresh,locationUnverified:true},{...fresh,current:{...fresh.current,tempAvailable:false}},{...fresh,current:{...fresh.current,tempC:NaN}}])assert.equal(evaluate(value).weatherAvailable,false);
assert.equal(evaluate({...fresh,stale:true}).weatherNotice,'이전 날씨 · 업데이트 필요');
assert.equal(evaluate({...fresh,hourly:[]}).weatherNotice,'시간대별 예보 확인 중');
console.log('PASS destination-only weather presence, fallback, stale and missing forecast presentation.');
