import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');
const ast=ts.createSourceFile('HomeScreen.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='HomeDecisionHero');
assert.ok(fn);
const code=ts.transpileModule(fn.getText(ast)+'\nresult=HomeDecisionHero(input);',{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
const locales={ko:{},en:JSON.parse(fs.readFileSync('apps/mobile/src/localization/locales/en.json','utf8')),ja:JSON.parse(fs.readFileSync('apps/mobile/src/localization/locales/ja.json','utf8'))};
for(const fontScale of [1,1.6,2])for(const language of ['ko','en','ja'])for(const os of ['ios','android'])for(const mode of ['light','dark'])for(const condition of ['clear','cloud','partly-cloudy','rain','snow','storm','fog']){
 const icon={source:'actual-weather-mapping-boundary'};
 const context={useRef:()=>({current:null}),result:null,LocalizationContext:{},translateText:v=>locales[language][v]??v,React:{use:()=>({language}),createElement:(type,props,...children)=>({type,props,children})},Platform:{OS:os},styles:new Proxy({},{get:()=>({})}),View:'View',Text:'Text',RawText:'RawText',Image:'Image',FeedbackPressable:'FeedbackPressable',HomeValueTransition:'HomeValueTransition',useWindowDimensions:()=>({fontScale}),useResponsiveLayout:()=>({width:440,screenHorizontalPadding:28,isShort:false,homePanelPadding:12}),ambientWeatherIcon:()=>icon,formatTemperature:v=>String(v),getConditionLabel:v=>v,getHeroTemperatureRange:()=>'',input:{current:{condition,tempC:18,feelsLikeC:18,rainProbabilityPct:0},isNight:false,currentLocationName:'public-test-location',companionMessage:'선선한 날이에요. 가벼운 겉옷이면 좋아요.',todayMinMax:null,temperatureUnit:'celsius',theme:{name:mode},onOpenForecast(){}}};
 vm.runInNewContext(code,context);
 const nodes=[];const visit=n=>{if(!n||typeof n!=='object')return;nodes.push(n);for(const c of n.children??[])Array.isArray(c)?c.forEach(visit):visit(c)};visit(context.result);
 assert.ok(nodes.some(n=>n.type==='Image'&&n.props.source===icon.source),`${os}/${mode}/${condition}: actual Home hero must render its weather status icon`);
 if(os==='ios'){
  const status=nodes.find(n=>n.props?.testID==='home-weather-status-icon');assert.ok(status);
  assert.equal(status.props.style.width,28);assert.equal(status.props.style.height,28);
  const statusRow=nodes.find(n=>n.type==='View'&&n.children.includes(status));
  assert.ok(statusRow.children.some(n=>n.type==='Text'&&n.children.includes(condition)),'small icon accompanies the actual short condition');
  assert.equal(nodes.some(n=>n.props?.style?.width===126||n.props?.style?.height===126),false,'no reserved large hero icon panel');
 }

 if(os==='ios'&&fontScale>1.3){const main=nodes.find(n=>n.type==='FeedbackPressable');assert.equal(main.props.style.at(-1).flexDirection,'column');}
 if(os==='ios'){const companion=nodes.find(n=>n.type==='Text'&&n.children[0]?.includes('\n'));assert.ok(companion);const original=context.input.companionMessage;const translated=locales[language][original]??original;assert.equal(companion.children[0],translated.replace(/([.!?])\s+|([。！？])(?=\S)/,'$1$2\n'));assert.equal(companion.children[0].replace('\n',language==='ja'?'':' '),translated);assert.equal(companion.props.numberOfLines,undefined);assert.equal(companion.props.adjustsFontSizeToFit,undefined);assert.equal(companion.props.style.at(-1).fontSize,26);assert.equal(companion.props.style.at(-1).lineHeight,34);assert.equal(companion.props.style.at(-1).maxWidth,undefined);}
}
console.log('PASS: actual HomeDecisionHero renders mapped status icon on iOS/Android, light/dark, seven weather conditions; KO/EN/JA intact translation then sentence break; uncapped 26/34pt preparation copy. Native image pixels require physical capture.');
