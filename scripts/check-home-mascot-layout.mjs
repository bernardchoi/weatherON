import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');
const ast=ts.createSourceFile('HomeScreen.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='HomeDecisionHero');
const code=ts.transpileModule(fn.getText(ast)+'\nresult=HomeDecisionHero(input);',{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
for(const width of [181,320,375,390,440])for(const fontScale of [1,1.3,1.6,2,3])for(const mode of ['light','dark']){
 const context={useRef:()=>({current:null}),result:null,LocalizationContext:{},translateText:v=>v,React:{use:()=>({language:'ko'}),createElement:(type,props,...children)=>({type,props,children})},Platform:{OS:'ios'},styles:new Proxy({},{get:()=>({})}),View:'View',Text:'Text',Image:'Image',FeedbackPressable:'FeedbackPressable',HomeValueTransition:'HomeValueTransition',useWindowDimensions:()=>({fontScale}),useResponsiveLayout:()=>({width,isShort:false,homePanelPadding:12,screenHorizontalPadding:width<380?16:20}),ambientWeatherIcon:()=>null,formatTemperature:v=>String(v),getConditionLabel:v=>v,getHeroTemperatureRange:()=>'최고 14° · 최저 2°',input:{mascot:{type:'mascot'},current:{condition:'흐림',tempC:11,feelsLikeC:10,rainProbabilityPct:0},isNight:false,currentLocationName:'테스트',todayMinMax:{minTempC:2,maxTempC:14},temperatureUnit:'celsius',theme:{name:mode},onOpenForecast(){}}};
 vm.runInNewContext(code,context);
 const nodes=[];const visit=n=>{if(!n||typeof n!=='object')return;nodes.push(n);for(const c of n.children??[])Array.isArray(c)?c.forEach(visit):visit(c)};visit(context.result);
 const group=nodes.find(n=>n.props?.testID==='home-weather-details-character');
 assert.equal(group.props.style.flexDirection,fontScale>1.3||width<320?'column':'row');
 const temperature=nodes.find(n=>n.props?.testID==='home-current-temperature');
 assert.ok(Number.isFinite(temperature.props.style[1].fontSize)&&temperature.props.style[1].fontSize>0);
 const slot=nodes.find(n=>n.props?.testID==='home-weather-character-slot');
 assert.equal(slot.props.pointerEvents,'none');assert.equal(slot.props.style.flexShrink,0);
 assert.equal(nodes.filter(n=>n.type==='mascot').length,1);
 assert.ok(nodes.find(n=>n.props?.testID==='home-feels-like'));
 assert.equal(nodes.find(n=>n.type==='FeedbackPressable').props.accessibilityRole,'button');
}
assert.doesNotMatch(source.slice(source.indexOf('<View ref={readHeaderRef}'),source.indexOf('testID="home-decision-stack"')),/HomeWeatherMascot/);
assert.match(source,/const mascotSize = layout.width < 390 \? 120 : 144/);
assert.match(source,/state=\{mascotState\}/);
assert.match(source,/maxFontSizeMultiplier=\{Platform.OS === "ios" \? 1.3 : undefined\}/);
assert.doesNotMatch(fs.readFileSync('apps/mobile/src/components/HomeWeatherMascot.tsx','utf8'),/home-mascot-dark-contrast/);
console.log('PASS: 50 hero layout combinations, one non-interactive mascot beside weather details, large-type stack, preserved weather action and no dark circle. Native layout requires visual QA.');
