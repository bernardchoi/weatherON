const fs=require('fs'),ts=require(process.cwd()+'/node_modules/typescript'),assert=require('node:assert/strict'),vm=require('node:vm');
const jsx=(type,props,...children)=>({type,props:{...props,children:children.length?children:props?.children}});
const nodes=t=>!t||typeof t!=='object'?[]:Array.isArray(t)?t.flatMap(nodes):[t,...nodes(t.props?.children)];
function extract(file,names){const s=fs.readFileSync(file,'utf8'),a=ts.createSourceFile(file,s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);return ts.transpileModule(a.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.includes(n.name?.text)).map(n=>n.getText(a).replace(/^export /,'')).join('\n'),{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;}
const style=new Proxy({},{get:()=>({})}),icons=new Proxy({},{get:(_,k)=>k});
const base={React:{createElement:jsx,use:()=>({language:'ko'})},LocalizationContext:{},translateText:s=>s,Platform:{OS:'ios'},useAppTheme:()=>({background:'#123'}),useResponsiveLayout:()=>({height:844}),useWindowDimensions:()=>({width:390,height:844,fontScale:1}),pageStyles:style,styles:style,ambientVisual:style,ambientUiIcons:icons,uiIconAssets:icons,View:'View',Text:'Text',Image:'Image',ScrollView:'ScrollView',AppButton:'AppButton',AppListRow:'AppListRow',AppListGroup:'AppListGroup',AmbientReveal:'Reveal',AmbientControlSurface:'AmbientControlSurface',FeedbackPressable:'FeedbackPressable',StyleSheet:{hairlineWidth:1},cardShadow:()=>({}),radius:{},spacing:{}};
const m={...base};vm.createContext(m);vm.runInContext(extract('apps/mobile/src/screens/MyScreen.tsx',['MyScreen','getAlertPreferenceSummary','Chevron','getAlertState','getLocationState','getGlobalSettingsSummary','getThemeModeLabel','getProviderLabel']),m);
for(const ready of [false,true])for(const terms of [false,true])for(const locationReady of [false,true])for(const permissionReady of [false,true]){
 let action;const n=nodes(m.MyScreen({accountLinked:ready,termsRequiredAccepted:terms,locationReady,permissionReady,smartCareEnabled:true,alertPreferences:{rainDetail:true,weatherAlerts:true,routine:true,bedtime:true,destination:true},weatherLocationMode:'auto',temperatureUnit:'celsius',distanceUnit:'meter',themeMode:'system',accountProfile:{provider:'apple'},onNavigate:r=>action=r,onRequireAccount:()=>action='gate'}));
 for(const [id,order]of [['my-header',0],['my-profile',1],['my-settings',2]])assert.equal(n.find(x=>x.props.testID===id)?.props.order,order,'Actual MY sections receive staged entrance');
 const button=n.find(n=>n.type==='FeedbackPressable'&&['계정 관리','약관 동의','계정 연결'].includes(n.props.accessibilityLabel));assert.ok(button);button.props.onPress();assert.equal(action,ready&&terms?'A4':'gate');assert.equal(n.filter(n=>n.type==='AmbientControlSurface').length,1);const rows=n.filter(n=>n.type==='AppListRow');assert.equal(rows.length,4);assert.ok(rows.every(row=>row.props.right),'Menu links have chevrons');assert.ok(rows.every(row=>row.props.value===undefined),'No duplicate status/action labels');assert.equal(rows[1].props.subtitle,'날씨 · 일상 준비 · 출발');assert.equal(rows.filter(n=>n.props.contained).length,3);for(const [i,r]of ['M4','M2','M3','R1'].entries()){rows[i].props.onPress();assert.equal(action,r)}
}
// Every legacy notification combination is summarized without changing preferences.
for(let mask=0;mask<32;mask++){
 const keys=['rainDetail','weatherAlerts','routine','bedtime','destination'];
 const preferences=Object.fromEntries(keys.map((key,index)=>[key,Boolean(mask&(1<<index))]));
 const before=JSON.stringify(preferences);
 const expected=[(preferences.rainDetail||preferences.weatherAlerts)&&'날씨',(preferences.routine||preferences.bedtime)&&'일상 준비',preferences.destination&&'출발'].filter(Boolean).join(' · ')||'선택한 알림 없음';
 assert.equal(m.getAlertPreferenceSummary(true,preferences,'ko'),expected);
 assert.equal(m.getAlertPreferenceSummary(false,preferences,'ko'),'알림 꺼짐');
 assert.equal(JSON.stringify(preferences),before);
}
 console.log('PASS actual My JSX: guest/terms/connected × location/notification states preserve account gate and all four management routes; one Glass group and three contained rows.');
let i=0,pending=[],slots=[],feedback=0,action;const react={createElement:jsx,useRef:v=>slots[i++]??={current:v},useEffect(fn,deps){const n=i++,old=slots[n];if(!old||deps.some((v,j)=>old[j]!==v)){pending.push(fn);slots[n]=deps}}};
let cards=['a','b','c'].map(id=>({id,place:{id},careEnabled:true,departureTime:"09:00",arrivalTime:"10:00"}));
const c={...base,ambientVisual:style,React:react,buildDestinationCards:()=>cards,toUserPreferenceProfile:()=>({}),getDestinationResultBanner:()=>null,triggerConfirmedSelectionHaptic:()=>feedback++,AmbientDestinationSummary:'AmbientDestinationSummary',DestinationCard:'DestinationCard',EmptyDestinationState:'EmptyDestinationState',MaterialSnackbar:'MaterialSnackbar'};
vm.createContext(c);vm.runInContext(extract('apps/mobile/src/screens/DestinationListScreen.tsx',['DestinationListScreen']),c);
const props={state:{destinationCare:{}},savedDestinations:cards,selectedDestinationPlace:{id:'b'},permissionReady:true,onSelectDestinationPlace:p=>action=p.id,onNavigate:r=>{assert.equal(r,'G2')},onDismissRemovedDestination(){},onRestoreRemovedDestination(){}};
function render(p=props){i=0;const t=c.DestinationListScreen(p);pending.splice(0).forEach(fn=>fn());return nodes(t)}
let n=render();assert.equal(n.find(x=>x.props.testID==='departure-header')?.props.order,0);assert.equal(n.find(x=>x.props.testID==='departure-content')?.props.order,1);assert.equal(feedback,0);let rows=n.filter(n=>n.type==='AmbientDestinationSummary');assert.deepEqual(rows.map(n=>n.props.item.id),['b','a','c']);assert.equal(rows.filter(n=>n.props.featured).length,1);
rows[1].props.onOpen();assert.equal(action,'a');assert.equal(feedback,0);n=render({...props,selectedDestinationPlace:{id:'a'}});assert.equal(feedback,1);n.find(n=>n.type==='AmbientDestinationSummary').props.onOpen();render({...props,selectedDestinationPlace:{id:'a'}});assert.equal(feedback,1);render({...props,selectedDestinationPlace:{id:'c'}});assert.equal(feedback,1);
c.Platform={OS:'android'};n=render(props);assert.deepEqual(n.filter(n=>n.type==='DestinationCard').map(n=>n.props.item.id),['a','b','c']);assert.equal(n.filter(n=>n.type==='AmbientDestinationSummary').length,0);
c.Platform={OS:'ios'};cards=[];n=render({...props,savedDestinations:[]});assert.equal(n.filter(n=>n.type==='AmbientDestinationSummary').length,0);assert.equal(n.filter(n=>n.type==='EmptyDestinationState').length,1);
console.log('PASS actual Departure JSX with model boundary: selected-first/all 3 destinations, single featured group, empty state, original Android order; haptic only after requested selection confirmation, not repeat/external changes.');
// Execute the actual settings switch effect: unknown/reduced motion settles immediately.
for (const motion of [null,true,false]) for (const enabled of [false,true]) {
 let animations=0,settled;
 class Value { constructor(value){this.value=value} stopAnimation(){} setValue(value){settled=value} interpolate(){return this.value} }
 const settings={...base,React:{createElement:jsx,useRef:value=>({current:value}),useEffect:fn=>fn()},useReducedMotion:()=>motion,Animated:{Value,timing:()=>{animations++;return{start(){},stop(){}}},View:'AnimatedView'},Easing:{out:value=>value,cubic:0},androidMaterialColor:()=> '#123'};
 vm.createContext(settings);vm.runInContext(extract('apps/mobile/src/screens/GlobalSettingsScreen.tsx',['MaterialSwitch']),settings);
 settings.MaterialSwitch({enabled});assert.equal(animations,motion===false?1:0);if(motion!==false)assert.equal(settled,enabled?1:0);
}
console.log('PASS actual iOS settings switch effect: unknown/Reduce Motion settles without animation; normal policy retains bounded transition.');
