// Preserve the weather/schedule policy while polishing these three reading screens.
import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import ts from 'typescript';
const baseline='02f68c1b5d7240b3e2b62728610c893715334edb';
const old=file=>execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'});
const current=file=>fs.readFileSync(file,'utf8');
function functions(source,names){const ast=ts.createSourceFile('fixture.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);return ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.includes(n.name?.text)).map(n=>n.getText(ast));}
for(const [file,names] of [
 ['apps/mobile/src/screens/OutfitDetailScreen.tsx',['buildWeatherReasons','getRainSignalPct','formatAdviceTime','getTimeAdvicePresentation','formatWindSpeed']],
 ['apps/mobile/src/screens/DestinationListScreen.tsx',['buildDestinationCards','buildDestinationWarning','getDestinationResultBanner','getAreaLabel','getGlobalAreaLabel','getCountryCityLabel','isAdministrativeNoise','trimAdministrativeSuffix','getDestinationActionText','getDestinationSchedule','getRepeatLabel','subtractMinutes','getAlertPillLabel','getStatusColor']],
])assert.deepEqual(functions(current(file),names),functions(old(file),names),file+' policy helpers changed');
for(const file of ['apps/mobile/src/utils/todayOutfit.ts','apps/mobile/src/utils/homeOuting.ts','apps/mobile/src/utils/confirmedInteractionFeedback.ts','apps/mobile/src/components/WardrobeFilterControls.tsx','apps/mobile/src/components/HomePlanMaterial.tsx','apps/mobile/src/navigation/routes.ts'])assert.equal(current(file),old(file),file+' must retain baseline policy/hidden routes/material/filter');
for(const file of ['apps/mobile/src/screens/OutfitDetailScreen.tsx','apps/mobile/src/screens/DestinationListScreen.tsx']){
 const effects=source=>{const ast=ts.createSourceFile('fixture.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const found=[];function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(ast)==='React.useEffect')found.push(node.getText(ast));ts.forEachChild(node,visit);}visit(ast);return found;};
 assert.deepEqual(effects(current(file)),effects(old(file)),file+' confirmed feedback effect changed');
}
console.log('PASS unchanged weather reasons/date/schedule/temperature/action helpers; today scope/presence/stale, confirmed haptic effects, single filter Glass/native material and hidden routes retain exact baseline policy.');
