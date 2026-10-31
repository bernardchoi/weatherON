// Execute actual JSX/handlers with inert services. Never imports account/OS clients.
const fs=require('fs'),ts=require(process.cwd()+'/node_modules/typescript'),assert=require('node:assert/strict'),vm=require('node:vm'),cp=require('node:child_process');
const jsx=(type,props,...children)=>({type,props:{...props,children:children.length?children:props?.children}});
const nodes=t=>!t||typeof t!=='object'?[]:Array.isArray(t)?t.flatMap(nodes):[t,...nodes(t.props?.children)];
function functions(source,names){const a=ts.createSourceFile('screen.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);return a.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.includes(n.name?.text)).map(n=>n.getText(a).replace(/^export /,'')).join('\n');}
function compile(source,names){return ts.transpileModule(functions(source,names),{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;}
const style=new Proxy({},{get:()=>({})}),icons=new Proxy({},{get:(_,k)=>k});
const base={React:{createElement:jsx,Fragment:'Fragment'},Platform:{OS:'ios'},useAppTheme:()=>({background:'#123456'}),useResponsiveLayout:()=>({width:390}),useWindowDimensions:()=>({fontScale:1}),pageStyles:style,styles:style,ambientVisual:style,ambientUiIcons:icons,screenIcons:icons,View:'View',Text:'Text',Image:'Image',ScrollView:'ScrollView',AppScreen:'AppScreen',BackButton:'BackButton',Pressable:'Pressable',FeedbackPressable:'FeedbackPressable',Modal:'Modal',ActivityIndicator:'ActivityIndicator',cardShadow:()=>({}),radius:{},spacing:{},ambientPalette:()=>({selected:'#123456'})};
const permissionFile='apps/mobile/src/screens/AppPermissionsScreen.tsx',permissionSource=fs.readFileSync(permissionFile,'utf8');
const copyFunctions=['getLocationPermissionCopy','getNotificationPermissionCopy','getPermissionResultCopy'];
assert.equal(functions(permissionSource,copyFunctions),functions(cp.execFileSync('git',['show','02f68c1b5d7240b3e2b62728610c893715334edb:'+permissionFile],{encoding:'utf8'}),copyFunctions),'permission copy/conditions changed');
const p={...base,Linking:{openSettings:()=>actions.push('settings')},PermissionCard:'PermissionCard'};vm.createContext(p);vm.runInContext(compile(permissionSource,['AppPermissionsScreen','PermissionCard',...copyFunctions]),p);
let actions=[];
const props={locationReady:true,weatherLocationMode:'auto',deviceLocationState:{status:'ready'},permissionReady:false,smartCareEnabled:true,permissionGateResult:null,onNavigate:r=>actions.push(r),onRequestCurrentLocation:()=>actions.push('current'),onRequestPermissionGate:(...a)=>actions.push(a)};
const cases=[{}, {deviceLocationState:{status:'requesting'}}, {weatherLocationMode:'manual'}, {locationReady:false}, {smartCareEnabled:false}, {permissionReady:true},
  {permissionGateResult:{returnTo:'M4',reason:'location',denied:true,outcome:'skipped'}}, {permissionGateResult:{returnTo:'M4',reason:'notification',denied:true,outcome:'skipped'}},
  {permissionGateResult:{returnTo:'M4',reason:'location',denied:false,outcome:'skipped'}}];
for(const change of cases){actions=[];const state={...props,...change};const tree=p.AppPermissionsScreen(state),cards=nodes(tree).filter(n=>n.type===p.PermissionCard);assert.equal(cards.length,2);
 const location=cards[0].props,notification=cards[1].props;
 if(state.deviceLocationState.status==='requesting')assert.equal(location.primaryDisabled,true);else location.onPrimaryPress();
 location.onSecondaryPress();notification.onPrimaryPress();notification.onSecondaryPress();nodes(tree).find(n=>n.type==='BackButton').props.onPress();
 assert.ok(actions.includes('H2')&&actions.includes('M2')&&actions.includes('M1'));
 const locationCopy=p.getLocationPermissionCopy(state.locationReady,state.weatherLocationMode,state.deviceLocationState,state.permissionGateResult);
 if(state.deviceLocationState.status==='requesting')assert.ok(!actions.some(a=>Array.isArray(a)&&a[0]==='location'));
 else if(locationCopy.requiresSettings)assert.ok(actions.includes('settings'));
 else if(locationCopy.canRequest&&!state.locationReady)assert.ok(actions.some(a=>Array.isArray(a)&&a.join(',')==='location,M4,general'));
 else assert.ok(actions.includes('current'));
 const notificationCopy=p.getNotificationPermissionCopy(state.permissionReady,state.smartCareEnabled,state.permissionGateResult);
 if(notificationCopy.requiresSettings)assert.ok(actions.includes('settings'));
 else if(notificationCopy.canRequest)assert.ok(actions.some(a=>Array.isArray(a)&&a.join(',')==='notification,M4,general'));
}
console.log('PASS actual M4 JSX/handlers: 9 permission matrices, requesting disabled, gates/OS-settings/current-location/manual/alerts/back, permission copy functions unchanged.');
const accountFile='apps/mobile/src/screens/AccountManagementScreen.tsx',accountSource=fs.readFileSync(accountFile,'utf8'),original=cp.execFileSync('git',['show','02f68c1b5d7240b3e2b62728610c893715334edb:'+accountFile],{encoding:'utf8'});
for(const sentence of ['서버 계정 데이터와 이 기기의 저장 목적지·코디 상태·옷장 사진이 삭제돼요. 되돌릴 수 없어요.','이 기기의 저장 목적지·코디 상태·옷장 사진이 삭제되고 계정 연결이 해제돼요. 서버 계정은 유지돼요.'])assert.ok(original.includes(sentence)&&accountSource.includes(sentence));
let danger=null,changes=0,motion=null;
const a={...base,useState:()=>[danger,value=>{danger=value;changes++;}],useReducedMotion:()=>motion};vm.createContext(a);vm.runInContext(compile(accountSource,['AccountManagementScreen','getProviderConnectedTitle','getProviderLabel','ChevronRight']),a);
const accountProps={accountLinked:true,termsRequiredAccepted:true,accountProfile:{provider:'apple'},accountAuthStatus:'authenticated',onNavigate:r=>actions.push(r),onRequireAccount:(...v)=>actions.push(v),onSignOutAccount:async()=>actions.push('mock-signout'),onDeleteAccount:async()=>actions.push('mock-delete')};
(async()=>{
 for(const linked of [false,true])for(const terms of [false,true]){danger=null;actions=[];let tree=a.AccountManagementScreen({...accountProps,accountLinked:linked,termsRequiredAccepted:terms});let n=nodes(tree);
  const logout=n.find(n=>n.props.accessibilityLabel==='로그아웃'),remove=n.find(n=>n.props.accessibilityLabel==='회원 탈퇴');assert.equal(!!logout,linked);assert.equal(!!remove,linked);
  if(!linked)continue;
  assert.equal(logout.props.hapticFeedback,'none');logout.props.onPress();assert.equal(danger,'logout');assert.deepEqual(actions,[]);
  tree=a.AccountManagementScreen(accountProps);n=nodes(tree);let modal=n.find(n=>n.type==='Modal');assert.equal(modal.props.visible,true);
  const cancel=n.find(n=>n.type==='Pressable'&&!n.props.accessibilityLabel&&!n.props.accessibilityState);cancel.props.onPress();assert.equal(danger,null);assert.deepEqual(actions,[]);
  remove.props.onPress();assert.equal(danger,'delete');assert.deepEqual(actions,[]);
  if(!terms){const termNodes=nodes(a.AccountManagementScreen({...accountProps,termsRequiredAccepted:false}));termNodes.find(n=>n.props.accessibilityLabel==='필수 약관 동의 이어가기').props.onPress();assert.deepEqual(actions,[['account-connect','A4']]);}
 }
 for(const status of ['authenticated','signing-in','signing-out'])for(const choice of ['logout','delete'])for(const reduction of [null,true,false]){
  danger=choice;actions=[];motion=reduction;changes=0;const n=nodes(a.AccountManagementScreen({...accountProps,accountAuthStatus:status}));const modal=n.find(n=>n.type==='Modal');assert.equal(modal.props.animationType,reduction===false?'fade':'none');
  const busy=status!=='authenticated';for(const label of ['로그아웃','회원 탈퇴'])assert.equal(n.find(n=>n.props.accessibilityLabel===label).props.disabled,busy);
  const final=n.find(n=>n.type==='Pressable'&&n.props.accessibilityState?.busy!==undefined);await final.props.onPress();await Promise.resolve();
  assert.deepEqual(actions,busy?[]:[choice==='logout'?'mock-signout':'mock-delete']);
  modal.props.onRequestClose();assert.equal(changes,busy?0:1);
 }
 console.log('PASS actual A4 JSX: guest/terms/connected, open/cancel never invokes account services; destructive callback selection/processing guard and close guard with inert mock callbacks; 18 motion/busy combinations; warning strings preserved. No real account actions.');
})().catch(error=>{console.error(error);process.exitCode=1});
