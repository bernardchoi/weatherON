import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
function load(file) {const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(m,m.exports,id=>load(path.resolve(path.dirname(file),id+'.ts')));return m.exports;}
const api=load('apps/mobile/src/utils/homeOuting.ts');
const now=Date.parse('2026-10-10T09:10:00+09:00');
const hour=(time,temp=22,rain=0,amount=0,wind=2)=>({time,tempC:temp,rainProbabilityPct:rain,precipitationMm:amount,windMs:wind,condition:'clear',available:{temp:true,rainProbability:true,precipitation:true,wind:true}});
const weather={locationId:'origin',locationName:'public-origin',countryCode:'KR',timezone:'Asia/Seoul',observedAt:new Date(now).toISOString(),source:'weatherkit',stale:false,current:{tempC:22,feelsLikeC:21,feelsLikeAvailable:true,precipitationMm:0,rainProbabilityPct:0,windMs:2,condition:'clear'},hourly:[hour('2026-10-10T09:00'),hour('2026-10-10T10:00',18,70,0.5),hour('2026-10-10T12:00',17)],daily:[{date:'2026-10-10',minTempC:0,maxTempC:0,rainProbabilityPct:0,precipitationMm:0,windMs:2,condition:'clear',available:{minTemp:false,maxTemp:true,rainProbability:false}}]};
const target='2026-10-10T10:30:00+09:00';
assert.match(api.buildOutingCheck(weather,target,now),/강수/);
assert.match(api.buildOutingCheck(weather,'2026-10-10T11:30:00+09:00',now),/아직 없어요/);
assert.match(api.buildOutingCheck(weather,'2026-10-11T10:30:00+09:00',now),/아직 없어요/);
assert.match(api.buildOutingCheck(weather,'2026-10-10T08:30:00+09:00',now),/지난 일정/);
assert.match(api.buildOutingCheck({...weather,stale:true},target,now),/최신/);
assert.match(api.buildOutingCheck({...weather,locationUnverified:true},target,now),/최신/);
for(const source of ['fallback','cache'])assert.equal(api.snapshotReliable({...weather,source},now),false);
assert.equal(api.snapshotReliable(weather,now+16*60000),false);
assert.equal(api.snapshotReliable(weather,now-2*60000),false);
const dest={...weather,locationId:'destination',locationName:'public-destination'};
const context={locationId:'destination',targetAt:target,basisLabel:'도착 기준'};
assert.equal(api.resolveRainWeather(context,weather,{destination:dest},weather),dest);
assert.equal(api.resolveRainWeather(context,weather,{},weather),undefined);
assert.equal(api.resolveRainWeather(null,weather,{destination:dest},weather),weather);
assert.equal(api.resolveRainWeather({...context,locationId:'origin'},weather,{destination:dest},dest),weather);
const rain=api.buildRainForecast(dest,context,now);
assert.equal(rain.bars.length,2);assert.equal(rain.missing,true);assert.equal(rain.hasRain,true);
assert.doesNotMatch(rain.title+rain.summary,/완화|그침|이후.*낮/);
const absent=api.buildRainForecast({...weather,hourly:[]},null,now);assert.equal(absent.bars.length,0);assert.match(absent.title,/예보가 없/);
const out=api.buildRainForecast(weather,{...context,targetAt:'2026-10-11T10:30:00+09:00'},now);assert.equal(out.covered,false);assert.equal(out.bars.length,0);
assert.equal(api.buildRainForecast(undefined,context,now).bars.length,0);
const partial={...weather,hourly:[{...weather.hourly[1],available:{temp:true,rainProbability:true,precipitation:false,wind:true}}]};
assert.equal(api.buildRainForecast(partial,{...context,targetAt:target},now).bars.length,0);
assert.match(api.buildOutingCheck(partial,target,now),/一部|일부/);
const missingNumber={...weather,hourly:[{...weather.hourly[1],precipitationMm:NaN}]};assert.equal(api.buildRainForecast(missingNumber,null,now).bars.length,0);
const drop={...weather,current:{...weather.current,tempAvailable:true},hourly:[hour('2026-10-10T10:00',17)]};assert.match(api.buildOutingCheck(drop,target,now),/기온 5°C/);assert.doesNotMatch(api.buildOutingCheck(drop,target,now),/체감/);
assert.match(api.buildOutingCheck(drop,target,now,v=>`${Math.round(v*9/5)}°F`),/9°F/);
assert.doesNotMatch(api.buildOutingCheck({...drop,current:{...drop.current,tempAvailable:undefined}},target,now),/지금보다/, 'unknown current air-temperature presence cannot establish a temperature delta');
const night={...weather,observedAt:'2026-10-10T23:10:00+09:00',hourly:[hour('23:00'),hour('00:00')]};const nh=api.forecastHours(night);assert.equal(nh[1].at-nh[0].at,3600000);assert.match(api.forecastTime(nh[1].at,night),/10\/11 00:00/);
assert.equal(api.forecastAt(night,'2026-10-12T00:30:00+09:00'),undefined);
const invalidZone={...weather,timezone:'invalid-zone'};assert.equal(api.forecastHours(invalidZone).length,0);
for(const value of [undefined,null,NaN,Infinity])assert.equal(api.hasFeelsLike({...weather,current:{...weather.current,feelsLikeC:value}}),false);
assert.equal(api.hasFeelsLike({...weather,current:{...weather.current,feelsLikeC:0}}),true);
assert.equal(api.hasFeelsLike({...weather,current:{...weather.current,feelsLikeAvailable:false}}),false);
assert.equal(api.hasFeelsLike({...weather,current:{...weather.current,feelsLikeAvailable:undefined}}),false);
for(const c of ['clear','rain','snow','storm','dust'])for(const temp of [4,15,22,33])assert.doesNotMatch(api.getCurrentWeatherFeature({...weather,current:{...weather.current,condition:c,feelsLikeC:temp}},true),/우산|겉옷|준비|챙/);
const home=fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');
assert.ok(home.includes('onOpenRainForecast?.(rainContext)'));assert.ok(home.includes('targetAt, basisLabel'));
assert.ok(home.includes('feelsLikeAvailable={hasFeelsLike(currentWeather)}'));
assert.ok(home.includes('체감 정보 없음'));assert.ok(home.includes('fontScale > 1.3 ? "column" : "row"'));
const ios=fs.readFileSync('apps/mobile/src/screens/IosRainForecastScreen.tsx','utf8');assert.doesNotMatch(ios,/향후.*hours|강수 완화 예상|이후 외출 부담/);
const nav=fs.readFileSync('apps/mobile/src/navigation/AppNavigator.tsx','utf8');assert.ok(nav.includes('Platform.OS === "ios" ? <IosRainForecastScreen'));assert.ok(nav.includes('setRainForecastContext(null)'));
console.log('PASS: outing/Rain actual model — scoped location, missing/partial/stale/fallback, gap/out-of-range dates, midnight/timezone, no false rain end, current feels-like provenance and units. Native layout, user perception and navigation remain separate device QA.');

// Execute the actual native Hero JSX with missing/valid apparent temperature, rather than just matching source.
const vm = await import('node:vm');
const ast=ts.createSourceFile('HomeScreen.tsx',home,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='HomeDecisionHero');
const code=ts.transpileModule(fn.getText(ast)+'\nresult=HomeDecisionHero(input);',{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText;
for(const fontScale of [1,1.6,2])for(const mode of ['light','dark'])for(const language of ['ko','en','ja'])for(const reading of [0,-3,24,undefined,NaN])for(const available of [true,false]){
 const catalog=language==='ko'?{}:JSON.parse(fs.readFileSync(`apps/mobile/src/localization/locales/${language}.json`));
 const ctx={result:null,useRef:()=>({current:null}),LocalizationContext:{},translateText:v=>catalog[v]??v,React:{use:()=>({language}),createElement:(type,props,...children)=>({type,props,children})},Platform:{OS:'ios'},styles:new Proxy({},{get:()=>({})}),View:'View',Text:'Text',RawText:'RawText',Image:'Image',FeedbackPressable:'FeedbackPressable',HomeValueTransition:'HomeValueTransition',useWindowDimensions:()=>({fontScale}),useResponsiveLayout:()=>({width:440,screenHorizontalPadding:28,isShort:false}),ambientWeatherIcon:()=>({source:'icon'}),formatTemperature:v=>`${v}°`,getConditionLabel:v=>v,getHeroTemperatureRange:()=>'',input:{current:{condition:'clear',tempC:22,feelsLikeC:reading,rainProbabilityPct:0},feelsLikeAvailable:available,isNight:false,currentLocationName:'public-origin',companionMessage:'온화하게 느껴지는 공기예요',todayMinMax:null,temperatureUnit:'celsius',theme:{name:mode},onOpenForecast(){}}};
 vm.runInNewContext(code,ctx);const nodes=[];function visit(n){if(!n||typeof n!=='object')return;nodes.push(n);for(const c of n.children??[])Array.isArray(c)?c.forEach(visit):visit(c)}visit(ctx.result);
 const feels=nodes.find(n=>n.props?.testID==='home-feels-like');assert.ok(feels);assert.equal(feels.children[0],available&&Number.isFinite(reading)?`체감 ${reading}°`:'체감 정보 없음');assert.equal(feels.props.numberOfLines,undefined);assert.equal(feels.props.adjustsFontSizeToFit,undefined);
 const button=nodes.find(n=>n.type==='FeedbackPressable');assert.doesNotMatch(button.props.accessibilityLabel,/NaN|undefined/);
}
console.log('PASS: actual Home Hero apparent-temperature presence/zero/negative/missing JSX in both themes, three languages, 1–2x font scale and accessible label.');

const normalize=load('packages/shared/src/weather/weatherKitAdapter.ts').normalizeWeatherKitWeather;
const normalized=normalize({currentWeather:{temperature:22,asOf:weather.observedAt},forecastHourly:{hours:[{forecastStart:'2026-10-10T01:00:00Z',temperature:18}]}},{locationId:'origin',locationName:'public-origin',countryCode:'KR',timezone:'Asia/Seoul'});
assert.equal(normalized.current.feelsLikeAvailable,false);assert.equal(api.hasFeelsLike(normalized),false);
assert.equal(normalized.hourly[0].available.precipitation,false);assert.equal(api.buildRainForecast(normalized,null,now).bars.length,0);
// Execute actual navigation callbacks and the context lifecycle effect extracted from the navigator AST.
const navAst=ts.createSourceFile('AppNavigator.tsx',nav,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let propsNode,effect;
function navVisit(node){
 if(ts.isVariableDeclaration(node)&&node.name.getText(navAst)==='screenProps')propsNode=node.initializer;
 if(ts.isCallExpression(node)&&node.expression.getText(navAst)==='useEffect'&&node.getText(navAst).includes('setRainForecastContext(null)'))effect=node.arguments[0];
 ts.forEachChild(node,navVisit);
}navVisit(navAst);
const callbacks=Object.fromEntries(propsNode.properties.filter(p=>['onOpenRainForecast','onNavigate'].includes(p.name?.getText(navAst))).map(p=>[p.name.getText(navAst),p.initializer.getText(navAst)]));
const events=[];let stored=null;const boundary={setRainForecastContext:v=>{stored=v},appState:{navigate:r=>events.push(r)},route:'H5'};
for(const name of Object.keys(callbacks))boundary[name]=vm.runInNewContext(ts.transpileModule('('+callbacks[name]+')',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,boundary);
boundary.onOpenRainForecast(context);assert.equal(stored,context);assert.equal(events.at(-1),'H5');
const context2={...context,locationId:'origin'};boundary.onOpenRainForecast(context2);assert.equal(stored,context2);
boundary.onNavigate('H5');assert.equal(stored,null);
for(const route of ['H5','O3','M2','H1','G1','C1']){
 stored=context;boundary.route=route;
 vm.runInNewContext(ts.transpileModule('('+effect.getText(navAst)+')()',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,boundary);
 assert.equal(stored,['H5','O3','M2'].includes(route)?context:null);
}
console.log('PASS: actual WeatherKit missing-field normalization and navigation callbacks/context replacement/back-entry/overlay lifecycle.');
// Load both actual H5 TSX modules. Only native UI/asset/theme/clock boundaries are mocked.
// Re-render after invoking their real handlers so assertions cover stateful behavior.
{
  let hookState = [], hookCursor = 0, mode = 'light', fontScale = 1;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }),
    useState(initial) {
      const index = hookCursor++;
      if (!(index in hookState)) hookState[index] = initial;
      return [hookState[index], next => { hookState[index] = typeof next === 'function' ? next(hookState[index]) : next; }];
    },
  };
  const native = {
    StyleSheet: { create: value => value, hairlineWidth: 1 },
    useWindowDimensions: () => ({ fontScale }),
    Platform: { OS: 'ios' },
    ...Object.fromEntries(['Image', 'Text', 'View', 'ScrollView', 'Pressable'].map(name => [name, name])),
  };
  const moduleCache = new Map();
  function loadRainModule(file) {
    file = path.resolve(file);
    if (moduleCache.has(file)) return moduleCache.get(file);
    const module = { exports: {} };
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
    } }).outputText;
    new Function('module', 'exports', 'require', compiled)(module, module.exports, id => {
      if (id === 'react') return react;
      if (id.endsWith('/localization/react-native')) return native;
      if (id.endsWith('/AppThemeContext')) return { useAppTheme: () => ({ name: mode, text: '#111', muted: '#777', border: '#aaa', card: '#ddd', gold: '#a40', sky: '#578' }) };
      if (id.endsWith('/FeedbackPressable')) return { FeedbackPressable: 'FeedbackPressable' };
      if (id.endsWith('/AppScreen')) return { AppScreen: 'AppScreen' };
      if (id.endsWith('/useForecastNow')) return { useForecastNow: () => now };
      if (id.endsWith('/assets')) return { uiIconAssets: { drop: 'drop', myAlerts: 'alerts' } };
      if (id.endsWith('/ambientAssets')) return { ambientUiIcons: { droplet: 'filled-drop', notifications: 'filled-alerts' } };
      if (id.endsWith('/locationDisplay')) return { getDisplayLocationName: name => name };
      const base = path.resolve(path.dirname(file), id);
      return loadRainModule(fs.existsSync(`${base}.tsx`) ? `${base}.tsx` : `${base}.ts`);
    });
    moduleCache.set(file, module.exports);
    return module.exports;
  }
  const { IosRainForecastScreen } = loadRainModule('apps/mobile/src/screens/IosRainForecastScreen.tsx');
  const chart = loadRainModule('apps/mobile/src/screens/IosRainForecastChart.tsx');
  function flatten(node, result = []) {
    if (Array.isArray(node)) { node.forEach(child => flatten(child, result)); return result; }
    if (!node || typeof node !== 'object') return result;
    if (typeof node.type === 'function') return flatten(node.type({ ...node.props, children: node.children }), result);
    result.push(node);
    node.children?.forEach(child => flatten(child, result));
    return result;
  }
  function render(props) { hookCursor = 0; return flatten(IosRainForecastScreen(props)); }
  const byId = (nodes, id) => nodes.find(node => node.props.testID === id);
  const buttons = nodes => nodes.filter(node => node.props.testID?.startsWith('rain-hour-'));
  const text = nodes => nodes.filter(node => node.type === 'Text').flatMap(node => node.children.filter(child => typeof child === 'string')).join(' ');
  function propsFor(destination, options = {}) {
    const events = [];
    return { events, props: {
      state: { weather, destinationCare: { originWeather: weather }, destinationWeatherById: destination ? { destination } : {} },
      rainForecastContext: context, onGoBack() {}, alertPreferences: { rainDetail: options.enabled ?? false },
      onToggleAlertPreference: key => events.push(key), permissionReady: options.permitted ?? true,
      smartCareEnabled: options.smartCareEnabled ?? true, onRequestPermissionGate: (...args) => events.push(args),
    } };
  }
  for (mode of ['light', 'dark']) for (fontScale of [1, 1.6, 2]) {
    for (const enabled of [true, false]) for (const permitted of [true, false]) {
      for (const variant of ['valid', 'absent', 'removed', 'stale']) {
        hookState = [];
        const destination = variant === 'removed' ? undefined : variant === 'absent' ? { ...dest, hourly: [] } : variant === 'stale' ? { ...dest, stale: true } : dest;
        const { props, events } = propsFor(destination, { enabled, permitted });
        let nodes = render(props);
        assert.equal(nodes.find(node => node.type === 'AppScreen').props.subtitle, variant === 'removed' ? '위치 확인 필요' : 'public-destination');
        assert.doesNotMatch(text(nodes), /이후 외출 부담 낮음|강수 완화 예상|향후 1시간/);
        assert.match(text(nodes), /이후 비 그침은 확인되지/);
        if (variant === 'absent') assert.match(text(nodes), /시간별 미래 예보가 아니/);
        if (variant === 'stale') assert.match(text(nodes), /최근 기준/);
        if (variant === 'removed') assert.match(text(nodes), /선택한 위치/);
        // Two supplied hours plus the missing 11:00 interval must all remain selectable.
        assert.equal(buttons(nodes).length, ['absent', 'removed'].includes(variant) ? 0 : 3);
        const toggle = byId(nodes, 'rain-alert-toggle');
        assert.equal(toggle.props.accessibilityRole, 'switch');
        assert.equal(toggle.props.accessibilityState.checked, enabled);
        toggle.props.onPress();
        assert.deepEqual(events, !enabled && !permitted ? ['rainDetail', ['notification', 'H5', 'rain']] : ['rainDetail']);
        if (['absent', 'removed'].includes(variant)) continue;
        const ids = buttons(nodes).map(node => node.props.testID);
        assert.match(byId(nodes, 'rain-selected-detail').props.accessibilityLabel, /10\/10 10:00, 강수확률 70%, 시간당 강수량 0.5mm/);
        assert.ok(!byId(nodes, 'rain-details-table'));
        byId(nodes, ids[1]).props.onPress(); nodes = render(props);
        assert.match(byId(nodes, 'rain-selected-detail').props.accessibilityLabel, /11:00–10\/10 12:00, 예보 미확인/);
        assert.doesNotMatch(byId(nodes, 'rain-selected-detail').props.accessibilityLabel, /0mm|0%/);
        assert.equal(buttons(nodes).filter(node => node.props.accessibilityState.selected).length, 1);
        byId(nodes, ids[2]).props.onPress(); nodes = render(props);
        assert.match(byId(nodes, 'rain-selected-detail').props.accessibilityLabel, /12:00, 강수확률 0%, 시간당 강수량 0mm/);
        byId(nodes, 'rain-details-toggle').props.onPress(); nodes = render(props);
        assert.equal(byId(nodes, 'rain-details-toggle').props.accessibilityState.expanded, true);
        const rows = flatten(byId(nodes, 'rain-details-table')).filter(node => node.props.accessibilityLabel);
        assert.equal(rows.length, 3);
        assert.match(rows[0].props.accessibilityLabel, /70%.*0.5mm/);
        assert.match(rows[1].props.accessibilityLabel, /예보 미확인/);
        assert.match(rows[2].props.accessibilityLabel, /0%.*0mm/);
        byId(nodes, 'rain-details-toggle').props.onPress(); nodes = render(props);
        assert.ok(!byId(nodes, 'rain-details-table'));
        nodes.find(node => node.type === 'ScrollView').props.onLayout({ nativeEvent: { layout: { width: 294 } } });
        nodes = render(props);
        const width = buttons(nodes)[0].props.style.width;
        assert.ok(width >= 44 * fontScale);
        assert.ok(Math.abs(294 / width - Math.round(294 / width)) < 1e-6);
        assert.equal(nodes.find(node => node.type === 'ScrollView').props.snapToInterval, width);
      }
    }
  }
  // Partial edge hours, a multi-hour gap and a supplied zero are distinct data states.
  const mixed = { ...dest, hourly: [
    { ...hour('2026-10-10T10:00'), available: { rainProbability: false, precipitation: false } },
    hour('2026-10-10T11:00', 22, 80, 0),
    hour('2026-10-10T14:00', 22, 70, 3),
    { ...hour('2026-10-10T15:00'), precipitationMm: NaN },
  ] };
  hookState = [];
  const mixedProps = propsFor(mixed).props;
  let mixedNodes = render(mixedProps);
  assert.equal(buttons(mixedNodes).length, 5);
  assert.equal(buttons(mixedNodes).filter(node => /예보 미확인/.test(node.props.accessibilityLabel)).length, 3);
  assert.match(byId(mixedNodes, 'rain-selected-detail').props.accessibilityLabel, /예보 미확인/);
  buttons(mixedNodes)[1].props.onPress(); mixedNodes = render(mixedProps);
  assert.match(byId(mixedNodes, 'rain-selected-detail').props.accessibilityLabel, /80%.*0mm/);
  buttons(mixedNodes)[2].props.onPress(); mixedNodes = render(mixedProps);
  assert.match(byId(mixedNodes, 'rain-selected-detail').props.accessibilityLabel, /12:00–10\/10 14:00, 예보 미확인/);
  // An updated snapshot removes the selected hour: selection must fall back to an existing slot.
  buttons(mixedNodes)[3].props.onPress();
  const replacement = propsFor({ ...dest, hourly: [hour('2026-10-10T10:00', 22, 20, 0)] }).props;
  assert.match(byId(render(replacement), 'rain-selected-detail').props.accessibilityLabel, /10:00.*20%.*0mm/);
  for (const destination of [{ ...dest, source: 'fallback' }, { ...dest, locationUnverified: true }]) {
    hookState = []; assert.equal(buttons(render(propsFor(destination).props)).length, 0);
  }
  for (const targetAt of ['2026-10-10T08:30:00+09:00', '2026-10-11T10:30:00+09:00']) {
    hookState = []; const props = propsFor(dest).props; props.rainForecastContext = { ...context, targetAt };
    assert.equal(buttons(render(props)).length, 0);
  }
  for (const maximum of [0, .01, 1, 1.01, 2, 3, 10, 60, 300]) assert.ok(chart.rainAmountCeiling(maximum) >= Math.max(1, maximum));
  console.log('PASS: actual H5 screen + chart modules — selection/reselection, expanded exact rows, alert permissions, missing vs zero, independent probability, stale/removed/out-of-range contexts, both themes, 1–2x type and whole-column touch targets. Native rendering remains separate QA.');
}

assert.match(api.buildOutingCheck(weather,undefined,now),/출발·도착 시간을 확인/);
assert.equal(api.buildRainForecast(weather,{...context,targetAt:'2026-10-10T08:30:00+09:00'},now).bars.length,0);
assert.match(api.buildRainForecast(weather,{...context,targetAt:'2026-10-10T08:30:00+09:00'},now).title,/지난 일정/);
// Use real SQLite and the actual storage functions: append-only migration, round trip and legacy unknowns.
const { DatabaseSync } = await import('node:sqlite');
const storageSource=fs.readFileSync('apps/mobile/src/providers/appStorage.ts','utf8');
const storageAst=ts.createSourceFile('appStorage.ts',storageSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const selectedFunctions=['ensureWeatherSnapshotColumns','writeWeatherSnapshot','readWeatherSnapshotFromRow','hourlyPresence','dailyPresence','weatherPresence','readWeatherPresence','objectRecord','arrayValue','textValue','numberValue','boolValue','removeUndefined','defaultStoredCondition'];
const storageCode=storageAst.statements.filter(n=>ts.isFunctionDeclaration(n)&&selectedFunctions.includes(n.name?.text)).map(n=>n.getText(storageAst)).join('\n');
const sqlite=new DatabaseSync(':memory:');
for(const sql of storageSource.match(/CREATE TABLE IF NOT EXISTS weather_(?:snapshots|hourly|daily)\s*\([\s\S]*?;/g))sqlite.exec(sql);
sqlite.exec("CREATE TABLE user_settings (key TEXT PRIMARY KEY, value TEXT); INSERT INTO user_settings VALUES ('preserve','existing-value')");
const database={getAllAsync:async(sql,...params)=>sqlite.prepare(sql).all(...params),runAsync:async(sql,...params)=>sqlite.prepare(sql).run(...params)};
const storageBoundary={JSON,Array,Object,Set,Platform:{OS:'ios'}};vm.runInNewContext(ts.transpileModule(storageCode,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,storageBoundary);
await storageBoundary.ensureWeatherSnapshotColumns(database);
await storageBoundary.ensureWeatherSnapshotColumns(database);
assert.equal(sqlite.prepare('SELECT value FROM user_settings').get().value,'existing-value');
await storageBoundary.writeWeatherSnapshot(database,'current',0,weather,now);
let row=sqlite.prepare("SELECT * FROM weather_snapshots WHERE role='current'").get();
let restored=await storageBoundary.readWeatherSnapshotFromRow(database,row);
assert.equal(restored.current.feelsLikeC,21);assert.equal(restored.current.feelsLikeAvailable,true);assert.equal(api.hasFeelsLike(restored),true);
assert.deepEqual(JSON.parse(JSON.stringify(restored.hourly[0].available)),weather.hourly[0].available);
assert.deepEqual(JSON.parse(JSON.stringify(restored.daily[0].available)),weather.daily[0].available);
assert.equal(restored.daily[0].minTempC,0);assert.equal(restored.daily[0].maxTempC,0);assert.equal(restored.daily[0].rainProbabilityPct,0);
assert.equal(api.buildRainForecast(restored,null,now).bars.length,3);
const metadata=JSON.parse(row.provider_presence_json);assert.equal(Object.hasOwn(metadata,'coordinate'),false);assert.equal(Object.hasOwn(metadata,'account'),false);
sqlite.prepare("UPDATE weather_snapshots SET provider_presence_json=NULL WHERE role='current'").run();
restored=await storageBoundary.readWeatherSnapshotFromRow(database,sqlite.prepare("SELECT * FROM weather_snapshots WHERE role='current'").get());
assert.equal(restored.current.feelsLikeC,21);assert.equal(restored.current.feelsLikeAvailable,undefined);assert.equal(api.hasFeelsLike(restored),false);assert.equal(api.buildRainForecast(restored,null,now).bars.length,0);
sqlite.prepare("UPDATE weather_snapshots SET provider_presence_json='broken-json' WHERE role='current'").run();
restored=await storageBoundary.readWeatherSnapshotFromRow(database,sqlite.prepare("SELECT * FROM weather_snapshots WHERE role='current'").get());assert.equal(api.hasFeelsLike(restored),false);
await storageBoundary.writeWeatherSnapshot(database,'destination',0,{...partial,locationUnverified:true,current:{...weather.current,feelsLikeAvailable:false}},now);
restored=await storageBoundary.readWeatherSnapshotFromRow(database,sqlite.prepare("SELECT * FROM weather_snapshots WHERE role='destination'").get());assert.equal(restored.current.feelsLikeAvailable,false);assert.equal(restored.locationUnverified,true);assert.equal(restored.hourly[0].available.precipitation,false);
await storageBoundary.writeWeatherSnapshot(database,'destination',1,{...dest,current:{...dest.current,tempAvailable:true,windAvailable:true},hourly:[{...dest.hourly[0],available:{...dest.hourly[0].available,condition:true}}]},now);
restored=await storageBoundary.readWeatherSnapshotFromRow(database,sqlite.prepare("SELECT * FROM weather_snapshots WHERE role='destination' AND seq=1").get());assert.equal(restored.current.tempAvailable,true);assert.equal(restored.current.windAvailable,true);assert.equal(restored.hourly[0].available.condition,true);
await storageBoundary.writeWeatherSnapshot(database,'missing-condition',0,{...weather,current:{...weather.current,condition:undefined},hourly:[{...weather.hourly[0],condition:undefined}],daily:[{date:'2026-10-11',minTempC:10,maxTempC:20,rainProbabilityPct:0,precipitationMm:0,windMs:2,condition:undefined}]},now);
row=sqlite.prepare("SELECT * FROM weather_snapshots WHERE role='missing-condition'").get();assert.equal(row.condition,'unknown');assert.equal(sqlite.prepare("SELECT condition FROM weather_hourly WHERE role='missing-condition'").get().condition,'unknown');assert.equal(sqlite.prepare("SELECT condition FROM weather_daily WHERE role='missing-condition'").get().condition,'unknown');
storageBoundary.Platform.OS='android';
await storageBoundary.writeWeatherSnapshot(database,'android-missing-condition',0,{...weather,current:{...weather.current,condition:undefined},hourly:[{...weather.hourly[0],condition:undefined}],daily:[{date:'2026-10-11',minTempC:10,maxTempC:20,rainProbabilityPct:0,precipitationMm:0,windMs:2,condition:undefined}]},now);
row=sqlite.prepare("SELECT * FROM weather_snapshots WHERE role='android-missing-condition'").get();assert.equal(row.condition,'clear');assert.equal(sqlite.prepare("SELECT condition FROM weather_hourly WHERE role='android-missing-condition'").get().condition,'clear');assert.equal(sqlite.prepare("SELECT condition FROM weather_daily WHERE role='android-missing-condition'").get().condition,'clear');
sqlite.close();console.log('PASS: actual SQLite additive/idempotent presence migration, existing data preservation, observed/hourly field-presence round trip and legacy/malformed cache unknowns.');
// Latest user direction: one friendly action based on destination conditions, readable evidence below.
const preparation=api.buildHomePreparation;
const rainKnown={...dest,hourly:dest.hourly.map(h=>({...h,condition:'rain',available:{...h.available,condition:true}}))};
const arrival=preparation(rainKnown,target,true,now);
assert.match(arrival.copy,/우산/);assert.equal(arrival.basis,'목적지 도착 무렵');assert.equal(arrival.evidence,'강수확률 70%');assert.equal(arrival.rainEvidence,true);
const futureCool={...dest,current:{...dest.current,feelsLikeC:33},hourly:[hour('2026-10-10T10:00',17)]};
const cool=preparation(futureCool,target,true,now);assert.match(cool.copy,/한 겹/);assert.equal(cool.evidence,'기온 17°C');assert.doesNotMatch(cool.evidence,/체감/);assert.doesNotMatch(cool.copy,/물 한 병/);
const windyMissing={...dest,hourly:[{...hour('2026-10-10T10:00',17,70,1,12),condition:'rain',available:{temp:true,rainProbability:true,precipitation:true,wind:false,condition:true}}]};
assert.match(preparation(windyMissing,target,true,now).copy,/우산/);assert.doesNotMatch(preparation(windyMissing,target,true,now).copy,/바람|방수/);assert.match(preparation(windyMissing,target,true,now).status,/일부/);
const windyReal={...windyMissing,hourly:[{...windyMissing.hourly[0],available:{temp:true,rainProbability:true,precipitation:true,wind:true,condition:true}}]};assert.match(preparation(windyReal,target,true,now).copy,/방수/);
// Realistic snow carries precipitation probability/amount; neither means liquid rain.
for (const wind of [2, 9]) for (const probability of [0, 50, 80]) for (const amount of [0, 1]) {
 const snowy={...dest,hourly:[{...hour('2026-10-10T10:00',-2,probability,amount,wind),condition:'snow',available:{temp:true,rainProbability:true,precipitation:true,wind:true,condition:true}}]};
 const result=preparation(snowy,target,true,now);
 assert.match(result.copy,/눈/,`snow ${probability}%/${amount}mm/${wind}mps remains snow`);
 assert.match(result.copy,/미끄럼 적은 신발/);assert.doesNotMatch(result.copy,/비 소식|비와|우산/);
 assert.equal(/바람/.test(result.copy),wind>=8);
 assert.equal(result.basis,'목적지 도착 무렵');
 const currentSnow={...snowy,current:{...snowy.current,condition:'snow',windMs:wind,windAvailable:true}};
 const currentResult=preparation(currentSnow,'2026-10-11T10:30:00+09:00',true,now);
 assert.match(currentResult.copy,/눈/);assert.match(currentResult.copy,/신발/);assert.doesNotMatch(currentResult.copy,/비 소식|비와|우산/);
 assert.equal(currentResult.basis,'목적지 현재 날씨');assert.match(currentResult.status,/예보 없음/);
}
for(const condition of ['snow','rain','clear']) for(const wind of [2,9]) for(const [probability,amount] of [[80,0],[0,1],[80,1]]) {
 const unknown={...dest,hourly:[{...hour('2026-10-10T10:00',-2,probability,amount,wind),condition,available:{temp:true,rainProbability:true,precipitation:true,wind:true,condition:false}}]};
 const p=preparation(unknown,target,true,now);assert.match(p.copy,/강수/);assert.doesNotMatch(p.copy,/비 소식|비와|눈|우산/);assert.equal(p.rainEvidence,true);
 assert.equal(/바람/.test(p.copy),wind>=8);assert.equal(p.basis,'목적지 도착 무렵');
}
const snowNoWind={...dest,hourly:[{...hour('2026-10-10T10:00',-2,80,1,9),condition:'snow',available:{temp:true,rainProbability:true,precipitation:true,wind:false,condition:true}}]};
assert.match(preparation(snowNoWind,target,true,now).copy,/눈.*\n미끄럼 적은 신발/);
assert.doesNotMatch(preparation(snowNoWind,target,true,now).copy,/바람/);
const currentRain={...dest,current:{...dest.current,condition:'rain',windMs:2,windAvailable:true}};
assert.match(preparation(currentRain,undefined,true,now).copy,/지금.*비.*\n우산/);
const currentStorm={...currentRain,current:{...currentRain.current,condition:'storm',windMs:9}};
assert.match(preparation(currentStorm,undefined,true,now).copy,/비와 바람.*\n방수/);
console.log('PASS: realistic snow probability/amount/wind matrix preserves snow footwear; unknown phase uses generic precipitation; current and forecast bases stay distinct.');
const snowMissing={...dest,hourly:[{...hour('2026-10-10T10:00',17),condition:'snow'}]};assert.doesNotMatch(preparation(snowMissing,target,true,now).copy,/눈|신발/);
const snowReal={...snowMissing,hourly:[{...snowMissing.hourly[0],available:{...snowMissing.hourly[0].available,condition:true}}]};assert.match(preparation(snowReal,target,true,now).copy,/신발/);
for(const fixture of [{...dest,stale:true},{...dest,locationUnverified:true},undefined]){
 const p=preparation(fixture,target,true,now);assert.doesNotMatch(p.copy,/최근 기준 날씨|비가|우산|바람|겉옷/);assert.match(p.status,/최근|확인/);
}
assert.match(preparation(dest,target,false,now).status,/목적지 선택/);
const outside=preparation(dest,'2026-10-11T10:30:00+09:00',true,now);assert.equal(outside.basis,'목적지 현재 날씨');assert.match(outside.status,/선택 시각 예보 없음/);assert.equal(outside.evidence,'현재 체감 21°C');
assert.match(preparation(dest,'2026-10-10T08:30:00+09:00',true,now).status,/지난 일정/);
assert.match(home,/fontSize: 20, lineHeight: 28/);assert.match(home,/fontSize: 18, lineHeight: 26/);assert.doesNotMatch(home,/fontSize: 13, lineHeight: 20.*previewNames/);
assert.ok(home.includes('날씨로 골랐어요'));assert.ok(home.includes('weatherBasis={state.weather.locationId'));assert.ok(home.includes('selectedDestinationTargetAt'));assert.ok(home.includes('state.destinationCare.destinationWeather : currentWeather'));
console.log('PASS: friendly destination-based preparation, forecast-first/general temperature, genuine-only wind/condition, current-only fallback, uncertainty as secondary state and readable reduced copy.');

for(const fixture of [{...weather,source:'fallback'},{...weather,locationUnverified:true}]){
 const result=api.buildRainForecast(fixture,null,now);assert.equal(result.usable,false);assert.equal(result.bars.length,0);assert.match(result.title,/다시 확인/);
}
console.log('PASS: fallback and spatially unverified snapshots cannot display forecast numbers or claimed observation time.');

// Execute the real material branch for absent module, older OS, Android and reduced transparency.
const materialCode=ts.transpileModule(fs.readFileSync('apps/mobile/src/components/HomePlanMaterial.tsx','utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
for(const os of ['ios','android'])for(const version of [25,27])for(const available of [false,true])for(const reducedTransparency of [false,true])for(const mode of ['light','dark']){
 const exports={};const rn={Platform:{OS:os,Version:version},UIManager:{getViewManagerConfig:()=>available},View:'View',requireNativeComponent:()=> 'NativeGlass',StyleSheet:{absoluteFill:{position:'absolute'},create:v=>v}};
 const mockReact={createElement:(type,props,...children)=>({type,props,children})};
 vm.runInNewContext(materialCode,{exports,require:id=>id==='react'?{__esModule:true,default:mockReact}:rn});
 const rendered=exports.HomePlanMaterial({theme:{name:mode,reducedTransparency,card:mode==='light'?'#EEF7F9':'#173642'}});
 if(os==='android'){assert.equal(rendered,null);continue;}
 assert.equal(rendered.type,version>=26&&available&&!reducedTransparency?'NativeGlass':'View');
 assert.equal(rendered.props.pointerEvents,'none');assert.equal(rendered.props.accessibilityElementsHidden,true);
 if(rendered.type==='View'){assert.match(rendered.props.style[1].backgroundColor,/^#[A-F0-9]{6}$/);assert.equal(rendered.props.style[1].backgroundColor,mode==='light'?'#EEF7F9':'#173642');}
}
assert.doesNotMatch(home,/시간별 강수 ·/);
assert.ok(home.includes('layout.width < 390 || fontScale > 1.3'));
assert.ok(home.includes('testID="home-weather-details"'));
assert.ok(home.includes('marginTop: 20, marginBottom: 8'));
const nativeHomeGlass=fs.readFileSync('apps/mobile/ios/WeatherON/LiquidGlassNavigationView.swift','utf8').split('final class HomePlanGlassSurfaceView')[1];
assert.ok(nativeHomeGlass.includes('UIGlassEffect(style: .regular)'));assert.ok(nativeHomeGlass.includes('effect.isInteractive = false'));
assert.ok(nativeHomeGlass.includes('UIAccessibility.isReduceTransparencyEnabled'));assert.ok(nativeHomeGlass.includes('isUserInteractionEnabled = false'));assert.doesNotMatch(nativeHomeGlass,/Timer|CADisplayLink|GestureRecognizer/);
console.log('PASS: actual Home material selection across OS/module/theme/transparency combinations; opaque fallback, no hit interception or new animations; responsive grouping and duplicate forecast label removal. Device visual assessment remains separate.');

// Home keeps the same provider theme as app chrome; weather/time never override it.
assert.ok(home.includes('const theme = ambientHomeTheme(useAppTheme(), Platform.OS === "ios");'));
assert.doesNotMatch(home,/qaDarkPreview|onPreviewDarkChange|ambient-dark-preview/);
assert.doesNotMatch(fs.readFileSync('apps/mobile/ios/WeatherON/LiquidGlassNavigationView.swift','utf8'),/ambient-dark-preview|previewDark/);
console.log('PASS: Home derives its display theme from the shared app provider; no temporary body-only dark override remains.');
