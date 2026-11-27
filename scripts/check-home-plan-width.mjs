import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const previewCode=ts.transpileModule(fs.readFileSync('apps/mobile/src/utils/homeOutfitSummary.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const previewExports={}; new Function('exports',previewCode)(previewExports);
const source=fs.readFileSync(process.env.HOME_PLAN_SOURCE ?? 'apps/mobile/src/screens/HomeScreen.tsx','utf8');
const ast=ts.createSourceFile('home.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const expressions={};let plan,styles;
function visit(n){
 if(ts.isVariableDeclaration(n)&&['stackedPlanControls','showDepartureExplanation','showPlanPreparation','showFullRouteExplanation','showRouteRegion'].includes(n.name.getText(ast)))expressions[n.name.getText(ast)]=n.initializer.getText(ast);
 if(ts.isVariableDeclaration(n)&&n.name.getText(ast)==='styles')styles=n.initializer.arguments[0];
 if(ts.isJsxElement(n)&&n.openingElement.attributes.getText(ast).includes('testID="home-plan-card"'))plan=n;
 ts.forEachChild(n,visit);
}visit(ast);
assert.ok(expressions.stackedPlanControls&&expressions.showDepartureExplanation,'Plan must split long route explanation from bounded controls');
const jsx=(type,props,...children)=>type==='UpdateRegion' ? (props.visible ? children[0](true) : null) : typeof type === 'function' ? type(props) : ({type,props:props??{},children});
const flatten=s=>Object.assign({},...[s].flat(Infinity).filter(Boolean));
function nodes(n,out=[]){if(!n||typeof n!=='object')return out;if(Array.isArray(n)){n.forEach(x=>nodes(x,out));return out;}out.push(n);nodes(n.children,out);return out;}
function text(n){if(typeof n==='string'||typeof n==='number')return String(n);if(!n)return '';return(Array.isArray(n)?n:n.children??[]).map(text).join('');}
const code=s=>ts.transpileModule(s,{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
for(const width of [320,375,390,440])for(const fontScale of [1,1.3,1.6,2])for(const status of ['ready','fallback','loading','unavailable']){
 const name='검증용 아주 긴 목적지 이름 Test destination';const body='경로를 다시 확인해야 하는 긴 설명입니다. '.repeat(4);
 const selected={place:{id:'test',name}};
 const env={lowPowerMode:false,homeMotionActive:true,HomeUpdateStatus:'UpdateStatus',HomeUpdateRegion:'UpdateRegion',preparationPending:false,preparationStatus:"",useOriginForSamePlace:false,compactSameDestination:false,routePending:false,routeStatus:'조회한 경로 기준',React:{createElement:jsx},Platform:{OS:'ios'},StyleSheet:{hairlineWidth:0.5},theme:{text:'#fff',muted:'#aaa'},spacing:{xs:4,sm:8,md:16},radius:{md:16,pill:999},pageStyles:{},layout:{width,isNarrow:width<390,isShort:false},fontScale,viewportSpacing:{planMargin:18,planGap:12},readPlanRef:{},measureReadArea(){},savedDestinations:[selected],selectedDestination:selected,homeDestinationPlace:selected.place,destinationReady:true,state:{destinationCare:{departureAdvice:{travelStatus:status}}},departureSummary:{value:status==='loading'?'경로 확인 중':'20:17',body},departureSummaryLabel:'도착 예상',departureExplanation:`도착 예상 · 이동 50분 · 여유 20분 · 조회 15:25 · ${body}`,routeAdvice:{travelStatus:status},homeSchedulePreference:{timeBasis:'departure'},isHomeTightLayout:()=>false,ambientUiIcons:{time:'time',location:'location',expand:'expand'},onSelectHomeDestinationPlace(){},onNavigate(){},onOpenRainForecast(){},rainContext:{},rainForecast:{summary:'',maxProbability:0,reliable:true,covered:true},preparation:{status:'',evidence:'',rainEvidence:false},targetAt:undefined,companionMessage:'보온 겉옷',companionBasis:'목적지 도착 무렵',summarizeHomeOutfit:s=>s,forecastNow:0,outingWeather:{locationName:'Test'},getDisplayLocationName:s=>s,basisLabel:'도착 기준',View:'View',Text:'Text',RawText:'RawText',Image:'Image',HomePlanMaterial:'Glass',DestinationSelectorCard:'Selector',HomeValueTransition:'Value',FeedbackPressable:'Pressable',BottomSheet:'Sheet',IosSelectionSheet:'Sheet',IosSelectionRow:'Row',DestinationLabelPill:'Pill',useResponsiveLayout:()=>({width}),useReducedMotion:()=>false,useConfirmedOptionFeedback:()=>({request(){},isConfirmed:()=>false}),useState:v=>[v,()=>{}],getDestinationTypeIcon:()=>'',getDestinationSelectorMeta:()=>'',uiIconAssets:{check:''}};
 Object.assign(env,{compactRoutePendingHere:false,density:{compact:false,cardGap:8},planGap:8,compactRouteRetriesHere:false,preparationBasisInline:false,language:'ko',translateText:s=>s,departureDisplay:env.departureSummary.value});
 env.homeTimingText=status==='loading'?'경로 확인 중':'도착 예상 20:17';
 env.styles={};for(const property of styles.properties){const key=property.name.getText(ast);if(/destinationSelect|destinationChipTitle|destinationEmpty|destinationSheet|iosDeparture|ambientDeparture|iosSecondaryText|homePlanCard/.test(key))env.styles[key]=vm.runInNewContext('('+property.initializer.getText(ast)+')',env);}
 env.onRefreshWeather=()=>{};
 env.AmbientReveal='Reveal';env.AmbientChange='Change';
 const project=extra=>{const x={...env,...extra};for(const [key,value] of Object.entries(expressions))x[key]=vm.runInNewContext('('+value+')',x);return x;};
 Object.assign(env,project());
 const tree=vm.runInNewContext(code('('+plan.getText(ast)+')'),env);const all=nodes(tree);
 const controls=all.find(n=>n.props.testID==='home-plan-controls');const departure=all.find(n=>n.props.testID==='home-departure-control');const explanation=all.find(n=>n.props.testID==='home-departure-explanation');
 assert.equal(flatten(controls.props.style).flexDirection,width<390||fontScale>1.3?'column':'row');
 assert.equal(departure.props.value,'','iOS destination change must not stack the legacy time fade');
 assert.equal(flatten(departure.props.style).maxWidth,width<390||fontScale>1.3?'100%':'48%');
 assert.equal(text(controls).includes('도착 예상 20:17'),status!=='loading','Show estimated arrival in the existing time chip');
 assert.ok(!text(controls).includes(body),'Explanation must not compete for horizontal name width');
 assert.equal(!!explanation,status!=='ready');
 if(explanation){assert.equal(text(explanation),body);assert.equal(explanation.props.numberOfLines,undefined);assert.equal(flatten(explanation.props.style).fontSize,12,'Preserve approved warning text size');}
 assert.ok(!text(tree).includes('목적지 도착 무렵'),'Do not repeat the destination basis beneath the header');
 const routeUpdate=all.find(n=>n.props.testID==='home-route-update');
 assert.equal(!!routeUpdate,status!=='ready','Healthy route provenance does not occupy a separate row');
 assert.ok(!all.some(n=>n.props.testID==='home-preparation-update'),'Healthy weather needs no repeated status row');
 const weatherLink=all.find(n=>n.props.accessibilityLabel?.includes('강수 예보 보기'));
 assert.ok(weatherLink);assert.equal(flatten(weatherLink.props.style).minHeight,44);
 if(width===390&&fontScale===1&&status==='ready')for(const update of [{routePending:true},{routeStatus:'이전 조회 기준 · 다시 확인 필요'},{preparationPending:true}]){
  const updated=nodes(vm.runInNewContext(code('('+plan.getText(ast)+')'),project(update)));
  const id=update.preparationPending?'home-preparation-update':'home-route-update';
  assert.ok(updated.some(n=>n.props.testID===id),'Keep actual loading and stale-weather/route guidance visible');
 }
 if(width===390&&fontScale===1&&status==='ready'){
  const compact={...env,homeTimingText:'현재 위치와 같은 곳',departureDisplay:'현재 위치와 같은 곳',useOriginForSamePlace:true,compactSameDestination:true,showDepartureExplanation:false,routeStatus:'경로 확인 실패 · 다시 시도해 주세요',departureSummary:{value:'현재 위치와 같은 곳',body:''}};
  const render=changes=>nodes(vm.runInNewContext(code('('+plan.getText(ast)+')'),project({...compact,...changes})));
  const same=render({});
  assert.ok(same.some(n=>n.props.accessibilityLabel==='현재 위치와 같은 곳'));
  assert.ok(!same.some(n=>['home-route-update','home-departure-explanation','home-plan-preparation','home-preparation-update'].includes(n.props.testID)));
  assert.ok(same.some(n=>n.props.accessibilityLabel?.includes('강수 예보 보기')));
  assert.ok(render({preparationStatus:'최근 정보 · 새로 확인 필요'}).some(n=>n.props.testID==='home-preparation-update'));
 }
 if(width===390&&fontScale===1&&status==='ready'){
  let retries=0;
  const render=changes=>vm.runInNewContext(code('('+plan.getText(ast)+')'),project({
    ...env,density:{compact:true,cardGap:5},planGap:5,stackedPlanControls:false,
    compactRouteRetriesHere:true,departureDisplay:'경로 확인 실패',
    onRefreshWeather:()=>retries++,preparationStatus:'도착 시각 미확인 · 현재 기준',
    preparationBasisInline:true,routeStatus:'경로 확인 실패 · 다시 시도해 주세요',...changes,
  }));
  const failure=render({});
  const failed=nodes(failure);
  assert.equal(text(failure).split('경로 확인 실패').length,2,'Retry must appear once');
  assert.equal(text(failure).split('현재 기준').length,2,'Weather basis belongs on the forecast action');
  assert.ok(!failed.some(n=>n.props.testID==='home-departure-explanation'||n.props.testID==='home-plan-preparation'));
  const action=failed.find(n=>n.props.accessibilityLabel?.startsWith('경로 확인 실패'));
  action.props.onPress();
  assert.equal(retries,1,'Consolidated error remains retryable');
  const inFlight=nodes(render({compactRouteRetriesHere:false,routePending:true,routeStatus:'새 일정의 이동시간 확인 중'}));
  assert.ok(inFlight.some(n=>n.props.testID==='home-route-update'));
  const inline=nodes(render({compactRouteRetriesHere:false,compactRoutePendingHere:true,routePending:true,departureDisplay:'경로 확인 중'}));
  assert.equal(inline.filter(n=>n.props.testID==='home-route-update').length,1);
  const missing=nodes(render({preparationBasisInline:false,preparationStatus:'준비 판단에 필요한 예보 없음'}));
  assert.ok(missing.some(n=>n.props.testID==='home-preparation-update'));
  const later=nodes(render({compactRouteRetriesHere:false,preparationBasisInline:false,preparationStatus:'',targetAt:'2090-01-01',routeAdvice:{nowArrivalDescription:'지금 출발 · 09:45 도착 예상'}}));
  assert.ok(later.some(n=>n.props.testID==='home-departure-explanation'));
 }
 const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='DestinationSelectorCard');
 env.input={savedDestinations:[selected],selectedDestinationId:'test',theme:env.theme,onSelect(){},onAdd(){}};
 const selector=vm.runInNewContext(code(fn.getText(ast)+'\nDestinationSelectorCard(input)'),env);const children=nodes(selector);
 const button=children.find(n=>n.props.accessibilityLabel?.startsWith('오늘의 목적지'));
 assert.ok(button.props.accessibilityLabel.includes(name),'Full name remains accessible');assert.equal(flatten(button.props.style({pressed:false})).minHeight,44);
 const title=children.find(n=>n.type==='RawText'&&text(n)===name);assert.equal(title.props.numberOfLines,1);assert.equal(flatten(title.props.style).fontSize,24);
 const expand=children.find(n=>n.props.source==='expand');assert.equal(flatten(expand.props.style).flexShrink,0);
}
const outfitCard = ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='HomeOutfitPreviewCard');
const outfitEnv = {
  React:{createElement:jsx}, Platform:{OS:'ios'}, FeedbackPressable:'Pressable', View:'View', Text:'Text', Image:'Image',
  styles:{}, ambientUiIcons:{expand:'expand',droplet:'drop'}, useAmbientEntrance:()=>({}), isHomeTightLayout:()=>false,
  buildOutfitPreview:previewExports.buildOutfitPreview, OutfitPrecipitationRow:({forecast,testID})=>forecast?jsx('View',{testID},jsx('Text',{},forecast)):null,
  translateText:s=>s, getDisplayLocationName:s=>s, getOutfitImageSource:()=>null,
};
for (const width of [320, 390, 440]) for(const fontScale of [1,1.6]) {
  const summary='겉옷을 챙겨요 · 오늘 12:00 무렵 강수 가능';
  const input={density:{compact:false,stackOutfit:width<390||fontScale>1.3,outfitPhotoHeight:96},viewportSpacing:{outfitTop:8,outfitBottom:8},outfit:{decisionText:summary,items:{}},summary,
    weatherBasis:'현재 위치',locationName:'Test',theme:{},onPress(){}};
  const render=changes=>vm.runInNewContext(code(outfitCard.getText(ast)+'\nHomeOutfitPreviewCard(input)'),{
    ...outfitEnv,input:{...input,...changes},useResponsiveLayout:()=>({width}),useWindowDimensions:()=>({fontScale}),
  });
  const withRain=render({}), noRain=render({summary:'겉옷을 챙겨요'});
  const forecast=nodes(withRain).find(n=>n.props.testID==='home-outfit-precipitation');
  assert.equal(text(forecast),'오늘 12:00 무렵 강수 가능');
  assert.equal(nodes(forecast).filter(n=>n.type==='Text').length,1,'One wrapping forecast label rather than a nested mini-card');
  assert.equal(nodes(forecast).find(n=>n.type==='Text').props.numberOfLines,undefined);
  assert.ok(!nodes(noRain).some(n=>n.props.testID==='home-outfit-precipitation'));
  assert.equal(flatten(withRain.props.style).paddingTop,flatten(noRain.props.style).paddingTop,'Forecast must not change outer card padding');
  assert.ok(text(withRain).includes('겉옷을 챙겨요'));
  assert.equal(nodes(withRain).find(n=>n.props.testID==='home-outfit-advice').props.numberOfLines,fontScale>1.3?undefined:2);
}
for(const value of ['경로 확인 필요','도착 시간 변경 필요','출발 시간 변경 필요']) {
 assert.equal(vm.runInNewContext(expressions.showDepartureExplanation,{destinationReady:true,compactSameDestination:false,routeAdvice:{travelStatus:'ready'},departureSummary:{value}}),true,'Ready route must retain invalid/past schedule guidance');
}
assert.equal(vm.runInNewContext(expressions.showDepartureExplanation,{destinationReady:false}),false,'No route warning without a destination');
console.log('PASS: actual Home plan/selector JSX at 320–440pt and 1–2x text; long name accessible, 44pt selector, fixed chevron, bounded time, full-width untruncated status. Native line measurement remains device QA.');
