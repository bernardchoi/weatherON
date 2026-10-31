// Isolated production callbacks + in-memory SQLite; no real permissions or account requests.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';
import { build } from 'esbuild';

const hookPath = 'apps/mobile/src/state/useWeatherOnAppState.ts';
const source = readFileSync(hookPath, 'utf8');
const ast = ts.createSourceFile(hookPath, source, ts.ScriptTarget.Latest, true);
const compile = code => ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function find(predicate) {
  let result;
  function visit(node) { if (predicate(node)) result = node; ts.forEachChild(node, visit); }
  visit(ast);
  assert.ok(result, 'Missing production callback');
  return result;
}
function callback(name, bindings) {
  let node = find(n => ts.isVariableDeclaration(n) && n.name.getText(ast) === name).initializer;
  if (ts.isCallExpression(node)) node = node.arguments[0];
  return new Function(...Object.keys(bindings), compile(`const run = ${node.getText(ast)};`) + '\nreturn run;')(...Object.values(bindings));
}
function effect(marker, bindings) {
  const node = find(n => ts.isCallExpression(n) && n.expression.getText(ast) === 'useEffect' && n.arguments[0].getText(ast).includes(marker));
  return new Function(...Object.keys(bindings), compile(`const run = ${node.arguments[0].getText(ast)};`) + '\nreturn run();')(...Object.values(bindings));
}
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return { promise, resolve, reject }; };
const tick = () => new Promise(setImmediate);
const noop = () => {};
const load = (path, imports) => {
  const exports = {};
  new Function('exports', 'require', compile(readFileSync(path, 'utf8')))(exports, name => {
    assert.ok(name in imports, `Unexpected import ${name}`);
    return imports[name];
  });
  return exports;
};

const db = new DatabaseSync(':memory:');
const sqlite = {
  execAsync: async sql => db.exec(sql),
  getAllAsync: async (sql,...args) => db.prepare(sql).all(...args),
  getFirstAsync: async (sql,...args) => db.prepare(sql).get(...args) ?? null,
  runAsync: async (sql,...args) => db.prepare(sql).run(...args),
  withTransactionAsync: async run => { db.exec('BEGIN'); try { await run(); db.exec('COMMIT'); } catch(e) { db.exec('ROLLBACK'); throw e; } },
};
const storage = load('apps/mobile/src/providers/appStorage.ts', {
  '../localization/react-native': { Platform: { OS:'ios' } },
  'expo-sqlite': { openDatabaseAsync: async () => sqlite },
  'expo-file-system/legacy': { documentDirectory:'file:///isolated/', getInfoAsync:async()=>({exists:false}) },
});
const bundled = await build({ entryPoints:['apps/mobile/src/state/persistedAppState.ts'], bundle:true, platform:'node', format:'cjs', write:false,
  plugins:[{name:'isolated-platform',setup(b) {
    b.onResolve({filter:/localization\/react-native$/},()=>({path:'platform',namespace:'test'}));
    b.onResolve({filter:/providers\/appStorage$/},()=>({path:'storage',namespace:'test'}));
    b.onLoad({filter:/.*/,namespace:'test'},args=>({contents:args.path==='platform'?'export const Platform = { OS: "ios" };':'export const readAppValue = async () => null; export const writeAppValue = async () => {};'}));
  }}],
});
const module = {exports:{}};
new Function('exports','module',bundled.outputFiles[0].text)(module.exports,module);
const normalize = module.exports.normalizePersistedAppState;
const key='weatheron.appState.v1';
const defaults=normalize({});
assert.deepEqual(defaults.onboardingProgress,{route:'O1',locationHandled:false,notificationHandled:false,destinationSelected:false});
assert.equal(normalize({onboardingProgress:{route:'A3',locationHandled:'true'}}).onboardingProgress.route,'O1');
assert.equal(normalize({onboardingProgress:{route:'O6',destinationSelected:true},selectedDestinationPlace:{id:'bad'}}).onboardingProgress.destinationSelected,false);
for (const route of ['O1','O2','O7','O4','O5','O6']) for (const completed of [false,true]) {
  const progress={route,locationHandled:true,notificationHandled:true,destinationSelected:true};
  const profile=normalize({...defaults,onboardingCompleted:completed,onboardingProgress:progress});
  await storage.writeAppValue(key,profile,true);
  const restored=normalize(await storage.readAppValue(key,true));
  assert.deepEqual(restored.onboardingProgress,{...progress,destinationSelected:!completed},'native SQL round-trip');
  const bindings={active:true,readPersistedWeatherProviderResult:async()=>null,readPersistedAppState:async()=>restored,readPersistedNotificationState:async()=>({readNotificationIds:[],notificationHistory:[]}),
    persistedWeatherProviderResultRef:{},locallyRestoredAccountLinkedRef:{},savedDestinationsRef:{},resolveDepartureActivityIntentDestinationId:()=>null};
  for (const name of [...source.slice(source.indexOf('Promise.all([\n      readPersistedWeatherProviderResult'),source.indexOf('  }, [storageRetryTick]')).matchAll(/\b(set\w+)\(/g)].map(m=>m[1])) bindings[name]=noop;
  let actualRoute,actualSelection;
  bindings.setRoute=v=>{actualRoute=v;}; bindings.setDestinationSelectionReady=v=>{actualSelection=v;};
  const cleanup=effect('readPersistedAppState()',bindings);
  await tick();
  assert.equal(actualRoute,completed?'H1':route,'completed users enter Home; unfinished users resume onboarding');
  assert.equal(actualSelection,!completed,'only unfinished onboarding restores a draft selection');
  cleanup();
}
await storage.writeAppValue(key,{...defaults,onboardingCompleted:true,onboardingProgress:{...defaults.onboardingProgress,route:'O6'}},true);
assert.equal(normalize(await storage.readAppValue(key,true)).onboardingCompleted,true);
console.log('PASS onboarding: legacy/malformed defaults; 6 steps and destination selection survive native SQLite + hydration.');

for (const status of ['granted','denied','error','unavailable']) {
  const updates={}; let calls=0;
  const bindings={locationReadyRef:{current:false},weatherLocationModeRef:{current:'manual'},deviceLocationRequestInFlightRef:{current:false},
    syncDeviceWeatherLocationPermission:async()=>{calls++;return {status,location:status==='granted'?{id:'test'}:undefined};}};
  for(const key of ['DeviceLocationState','LocationReady','DeviceWeatherLocation','WeatherLocationMode','UseDestinationWeather','WeatherRefreshTick']) bindings['set'+key]=value=>{updates[key]=value;};
  await callback('reconcileDeviceLocationPermission',bindings)();
  assert.equal(calls,1,'OS-settings grant is observed after a previous denial/manual mode');
  assert.equal(updates.WeatherLocationMode,undefined,'manual location choice stays manual');
  if(status==='granted') assert.equal(updates.LocationReady,true);
  if(status==='denied') assert.equal(updates.LocationReady,false);
  assert.equal(bindings.deviceLocationRequestInFlightRef.current,false);
}
for (const granted of [true,false]) {
  const progress=[];
  assert.equal(await callback('requestOnboardingNotificationPermission',{requestLocalNotificationPermission:async()=>({granted}),setPermissionReady:v=>assert.equal(v,granted),setOnboardingProgress:f=>progress.push(f(defaults.onboardingProgress))})(),granted);
  assert.equal(progress[0].notificationHandled,true);
}
console.log('PASS permission callbacks: grant/deny/transient failure/settings return; notification decision retained. No OS prompt invoked.');

for(const action of ['signInWithProvider','completeTerms']) for(const outcome of ['accepted','terms-incomplete','cancel','offline']) for(const cancel of [false,true]) {
  const response=deferred(),events=[];
  const revision={current:0},inFlight={current:false};
  let requests=0;
  const request=()=>{requests++;return requests===1?response.promise:Promise.resolve(action==='completeTerms'?{termsAccepted:true}:{account:{termsAccepted:true}});};
  const bindings={accountActionRevisionRef:revision,accountActionInFlightRef:inFlight,gate:{returnTo:'C4',reason:'save-outfit'},
    signInWithAppleAccount:request,signInWithOAuthAccount:request,acceptAccountTerms:request,
    completeAccountAction:()=>{events.push('action');return true;},
    isAccountAuthCancellation:e=>e.code==='cancel',getAccountAuthDisplayMessage:e=>e.message};
  for(const key of ['AccountLinked','AccountProfile','TermsRequiredAccepted','AccountAuthStatus','AccountAuthMessage','Route','Gate'])bindings['set'+key]=v=>events.push([key,v]);
  const run=callback(action,bindings);
  const pending=run('apple');
  await run('apple'); assert.equal(requests,1,'duplicate taps cannot issue parallel account mutations');
  if(cancel) callback('cancelAccountGate',bindings)();
  const before=events.length;
  if(outcome==='cancel'||outcome==='offline')response.reject(Object.assign(new Error(outcome),{code:outcome}));
  else response.resolve(action==='completeTerms'?{termsAccepted:true}:{account:{termsAccepted:outcome==='accepted'}});
  await pending;
  assert.equal(inFlight.current,false,'retry is possible after completion/failure');
  const after=events.slice(before);
  if(cancel||outcome==='cancel'||outcome==='offline') {
    assert.ok(!after.some(e=>e==='action'||e[0]==='Route'),'cancel/failure must not resume the pending action or steal navigation');
  } else if(action==='signInWithProvider'&&outcome==='terms-incomplete') {
    assert.ok(after.some(e=>e[0]==='Route'&&e[1]==='A3'));
    assert.ok(!after.includes('action'));
  } else assert.ok(after.includes('action'));
  if(outcome==='cancel'||outcome==='offline') {
    await run('apple');
    assert.equal(requests,2,'failed/cancelled authentication can be retried');
    assert.ok(events.includes('action'),'successful retry resumes the explicit request');
  }
}
console.log('PASS account: success/incomplete terms/cancel/offline/retry eligibility + late response after cancel; duplicate taps suppressed. Only inert account services used.');
db.close();

for(const status of ['authenticated','offline','signed-out']) for(const superseded of [false,true]) {
  const response=deferred(),events=[];
  const revision={current:0};
  const bindings={appStateHydrated:true,accountActionRevisionRef:revision,locallyRestoredAccountLinkedRef:{current:true},restoreAccountSession:()=>response.promise};
  for(const key of ['AccountLinked','AccountProfile','TermsRequiredAccepted','AccountAuthStatus','AccountAuthMessage'])bindings['set'+key]=v=>events.push([key,v]);
  const cleanup=effect('void restoreAccountSession().then',bindings);
  if(superseded)revision.current++;
  response.resolve({status,account:status==='authenticated'?{termsAccepted:false}:null});
  await tick();
  if(superseded)assert.deepEqual(events,[],'slow launch restore cannot overwrite a newer sign-in');
  else if(status==='offline')assert.ok(!events.some(e=>e[0]==='AccountLinked'&&e[1]===false),'offline restore preserves the locally linked account');
  else assert.ok(events.some(e=>e[0]==='AccountLinked'&&e[1]===(status==='authenticated')));
  cleanup();
}
for(const route of ['A2','A3']) {
  const revision={current:0},events=[];
  assert.equal(callback('goBack',{route,backRoute:'C4',accountActionRevisionRef:revision,setGate:v=>events.push(['gate',v]),setRoute:v=>events.push(['route',v])})(),true);
  assert.equal(revision.current,1);
  assert.deepEqual(events,[['gate',null],['route','C4']]);
}
console.log('PASS cold account restore: offline retains local state, late restoration cannot overwrite a newer auth action, A2/A3 Back cancels pending navigation.');

// Required consent checks remain enforced in the actual JSX, including while saving.
const termsSource=ts.createSourceFile('terms.tsx',readFileSync('apps/mobile/src/screens/TermsConsentScreen.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const termsCode=termsSource.statements.filter(n=>ts.isFunctionDeclaration(n)||ts.isVariableStatement(n)&&n.declarationList.declarations.some(d=>d.name.getText(termsSource)==='consentItems')).map(n=>n.getText(termsSource).replace(/^export /,'')).join('\n');
const jsx=(type,props,...children)=>({type,props:{...props,children}});
const nodes=t=>!t||typeof t!=='object'?[]:Array.isArray(t)?t.flatMap(nodes):[t,...nodes(t.props?.children)];
const style=new Proxy({},{get:()=>({})});
const termsBindings={React:{createElement:jsx},useMemo:f=>f(),useAppTheme:()=>({}),useResponsiveLayout:()=>({}),getRouteLabel:()=>'',Platform:{OS:'ios'},styles:style,pageStyles:style,ambientVisual:style,screenIcons:{},ambientUiIcons:{},AppScreen:'AppScreen',View:'View',Text:'Text',Image:'Image',Pressable:'Pressable'};
const renderTerms=new Function(...Object.keys(termsBindings),ts.transpileModule(termsCode,{compilerOptions:{jsx:ts.JsxEmit.React}}).outputText+'\nreturn TermsConsentScreen;')(...Object.values(termsBindings));
for(let mask=0;mask<16;mask++) for(const status of ['ready','saving-terms','error']) {
  let submits=0;
  const accepted=Object.fromEntries(['age','terms','privacy','location'].map((key,i)=>[key,Boolean(mask&(1<<i))]));
  const n=nodes(renderTerms({accepted,authStatus:status,onComplete:()=>{submits++;}}));
  const button=n.find(n=>n.props.accessibilityState?.busy!==undefined);
  button.props.onPress();
  assert.equal(submits,mask===15&&status!=='saving-terms'?1:0,'all four existing mandatory consent conditions are preserved');
}
console.log('PASS actual terms JSX: all 16 consent combinations across ready/saving/error. No real consent submitted.');
