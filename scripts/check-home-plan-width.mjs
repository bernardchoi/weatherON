import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=fs.readFileSync(process.env.HOME_PLAN_SOURCE ?? 'apps/mobile/src/screens/HomeScreen.tsx','utf8');
const ast=ts.createSourceFile('home.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const expressions={};let plan,styles;
function visit(n){
 if(ts.isVariableDeclaration(n)&&['stackedPlanControls','showDepartureExplanation'].includes(n.name.getText(ast)))expressions[n.name.getText(ast)]=n.initializer.getText(ast);
 if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='styles')styles=n.initializer.arguments[0];
 if(ts.isJsxElement(n)&&n.openingElement.attributes.getText(ast).includes('testID="home-plan-card"'))plan=n;
 ts.forEachChild(n,visit);
}visit(ast);
assert.ok(expressions.stackedPlanControls&&expressions.showDepartureExplanation,'Plan must split long route explanation from bounded controls');
const jsx=(type,props,...children)=>({type,props:props??{},children});
const flatten=s=>Object.assign({},...[s].flat(Infinity).filter(Boolean));
function nodes(n,out=[]){if(!n||typeof n!=='object')return out;if(Array.isArray(n)){n.forEach(x=>nodes(x,out));return out;}out.push(n);nodes(n.children,out);return out;}
function text(n){if(typeof n==='string')return n;if(!n)return '';return(Array.isArray(n)?n:n.children??[]).map(text).join('');}
const code=s=>ts.transpileModule(s,{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
for(const width of [320,375,390,440])for(const fontScale of [1,1.3,1.6,2])for(const status of ['ready','fallback','loading']){
 const name='검증용 아주 긴 목적지 이름 Test destination';const body='경로를 다시 확인해야 하는 긴 설명입니다. '.repeat(4);
 const selected={place:{id:'test',name}};
 const env={React:{createElement:jsx},Platform:{OS:'ios'},StyleSheet:{hairlineWidth:0.5},theme:{text:'#fff',muted:'#aaa'},spacing:{xs:4,sm:8,md:16},radius:{md:16,pill:999},pageStyles:{},layout:{width,isNarrow:width<390,isShort:false},fontScale,viewportSpacing:{planMargin:18,planGap:12},readPlanRef:{},measureReadArea(){},savedDestinations:[selected],selectedDestination:selected,destinationReady:true,state:{destinationCare:{departureAdvice:{travelStatus:status}}},departureSummary:{value:status==='loading'?'경로 확인 중':'20:17',body},departureSummaryLabel:'도착 예정 시간',selectedDestinationSchedulePreference:{timeBasis:'departure'},isHomeTightLayout:()=>false,ambientUiIcons:{time:'time',location:'location',expand:'expand'},onSelectDestinationPlace(){},onNavigate(){},onOpenRainForecast(){},rainContext:{},rainForecast:{summary:'',maxProbability:0,reliable:true,covered:true},preparation:{status:'',evidence:'',rainEvidence:false},outingWeather:{locationName:'Test'},getDisplayLocationName:s=>s,basisLabel:'도착 기준',View:'View',Text:'Text',RawText:'RawText',Image:'Image',HomePlanMaterial:'Glass',DestinationSelectorCard:'Selector',HomeValueTransition:'Value',FeedbackPressable:'Pressable',BottomSheet:'Sheet',DestinationLabelPill:'Pill',useResponsiveLayout:()=>({width}),useReducedMotion:()=>false,useState:v=>[v,()=>{}],getDestinationTypeIcon:()=>'',getDestinationSelectorMeta:()=>'',uiIconAssets:{check:''}};
 env.styles={};for(const property of styles.properties){const key=property.name.getText(ast);if(/destinationSelect|destinationChipTitle|destinationEmpty|destinationSheet|iosDeparture|ambientDeparture|iosSecondaryText|homePlanCard/.test(key))env.styles[key]=vm.runInNewContext('('+property.initializer.getText(ast)+')',env);}
 for(const [key,value] of Object.entries(expressions))env[key]=vm.runInNewContext('('+value+')',env);
 const tree=vm.runInNewContext(code('('+plan.getText(ast)+')'),env);const all=nodes(tree);
 const controls=all.find(n=>n.props.testID==='home-plan-controls');const departure=all.find(n=>n.props.testID==='home-departure-control');const explanation=all.find(n=>n.props.testID==='home-departure-explanation');
 assert.equal(flatten(controls.props.style).flexDirection,width<390||fontScale>1.3?'column':'row');
 assert.equal(flatten(departure.props.style).maxWidth,width<390||fontScale>1.3?'100%':'48%');
 assert.ok(!text(controls).includes(body),'Explanation must not compete for horizontal name width');
 assert.equal(!!explanation,status!=='ready');
 if(explanation){assert.equal(text(explanation),body);assert.equal(explanation.props.numberOfLines,undefined);assert.equal(flatten(explanation.props.style).fontSize,12,'Preserve approved warning text size');}
 const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='DestinationSelectorCard');
 env.input={savedDestinations:[selected],selectedDestinationId:'test',theme:env.theme,onSelect(){},onAdd(){}};
 const selector=vm.runInNewContext(code(fn.getText(ast)+'\nDestinationSelectorCard(input)'),env);const children=nodes(selector);
 const button=children.find(n=>n.props.accessibilityLabel?.startsWith('오늘의 목적지'));
 assert.ok(button.props.accessibilityLabel.includes(name),'Full name remains accessible');assert.equal(flatten(button.props.style({pressed:false})).minHeight,44);
 const title=children.find(n=>n.type==='RawText'&&text(n)===name);assert.equal(title.props.numberOfLines,1);assert.equal(flatten(title.props.style).fontSize,24);
 const expand=children.find(n=>n.props.source==='expand');assert.equal(flatten(expand.props.style).flexShrink,0);
}
console.log('PASS: actual Home plan/selector JSX at 320–440pt and 1–2x text; long name accessible, 44pt selector, fixed chevron, bounded time, full-width untruncated status. Native line measurement remains device QA.');
