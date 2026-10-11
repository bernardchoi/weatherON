import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'), req=createRequire(root+'/package.json');
const esbuild=req('esbuild');
const out=path.resolve(process.argv[2]||'/tmp/weatheron-ambient-account-cloud');
fs.mkdirSync(out,{recursive:true});
const shim=`import React from '${root}/node_modules/react/index.js';
import * as Web from '${root}/node_modules/react-native-web/dist/index.js';
export * from '${root}/node_modules/react-native-web/dist/index.js';
export const Platform={OS:'ios',Version:26,select:o=>o.ios??o.default};
export const Pressable=React.forwardRef((p,r)=>{const a=p.accessibilityState||{};return <Web.Pressable {...p} ref={r} aria-selected={a.selected} aria-checked={a.checked} aria-disabled={a.disabled}/>});
export const Linking={openSettings:async()=>window.actions.push('settings')};
export const UIManager={getViewManagerConfig:()=>null};
export const requireNativeComponent=()=>Web.View;
export const AccessibilityInfo={isReduceMotionEnabled:async()=>window.fixture.motion!==false,addEventListener:()=>({remove(){}})};
export function useWindowDimensions(){return {...Web.useWindowDimensions(),fontScale:window.fixture.scale};}
export const Text=React.forwardRef((p,r)=>{const s=Web.StyleSheet.flatten(p.style)||{},f=window.fixture.scale;return <Web.Text {...p} ref={r} style={[s,{fontFamily:'Pretendard',fontSize:(s.fontSize||14)*f,lineHeight:(s.lineHeight||20)*f}]} />});
export const View=React.forwardRef((p,r)=>{const s=Web.StyleSheet.flatten(p.style)||{};if(s.experimental_backgroundImage){s.backgroundImage=s.experimental_backgroundImage;delete s.experimental_backgroundImage;}return <Web.View {...p} ref={r} style={s}/>});
`;
fs.writeFileSync(out+'/shim.tsx',shim);
fs.writeFileSync(out+'/expo.tsx',`import {View} from './shim'; export const BlurView=View; export const Paths={document:{uri:''}};export const getLocales=()=>[{languageCode:'ko',languageTag:'ko-KR',regionCode:'KR'}];export const getCalendars=()=>[{timeZone:'Asia/Seoul',uses24hourClock:true}]; export const notificationAsync=async()=>{};export const impactAsync=async()=>{};export const NotificationFeedbackType={Warning:'warning'};export const ImpactFeedbackStyle={Medium:'medium'};`);
fs.writeFileSync(out+'/entry.tsx',`import React from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import {View} from './shim';
import {MyScreen} from '${root}/apps/mobile/src/screens/MyScreen';
import {GlobalSettingsScreen} from '${root}/apps/mobile/src/screens/GlobalSettingsScreen';
import {AppPermissionsScreen} from '${root}/apps/mobile/src/screens/AppPermissionsScreen';
import {AccountManagementScreen} from '${root}/apps/mobile/src/screens/AccountManagementScreen';
import {AppThemeProvider} from '${root}/apps/mobile/src/theme/AppThemeContext';
import {appThemes} from '${root}/apps/mobile/src/theme/tokens';
import {ambientReadingTheme} from '${root}/apps/mobile/src/theme/ambientSurface';
import {AmbientReadingContext,AmbientReadingSurface} from '${root}/apps/mobile/src/components/AmbientReadingSurface';
import {LocalizationContext} from '${root}/apps/mobile/src/localization/LocalizationProvider';
const q=new URLSearchParams(location.search);
window.fixture={scale:Number(q.get('scale')||1),motion:q.get('motion')==='normal'?false:true};
let props={deviceLocationState:{status:q.get('state')==='requesting'?'requesting':'ready'},accountAuthStatus:q.get('status')||'authenticated',accountAuthMessage:q.get('status')==='error'?'회원 탈퇴를 완료하지 못했습니다.':undefined,
onRequestCurrentLocation:()=>window.actions.push('current-location'),onRequestPermissionGate:(...a)=>window.actions.push(a),onSignOutAccount:async()=>window.actions.push('MOCK-signout'),onDeleteAccount:async()=>window.actions.push('MOCK-delete'),
permissionGateResult:q.get('state')==='denied-location'||q.get('state')==='denied-notification'?{returnTo:'M4',reason:q.get('state').slice(7),denied:true,outcome:'skipped'}:q.get('state')==='skipped'?{returnTo:'M4',reason:'location',denied:false,outcome:'skipped'}:null,
accountLinked:['connected','terms'].includes(q.get('account')),termsRequiredAccepted:q.get('account')!=='terms',accountProfile:{provider:'apple'},
locationReady:q.get('needs')!=='location',weatherLocationMode:q.get('state')==='manual'?'manual':'auto',permissionReady:q.get('needs')!=='notification',smartCareEnabled:q.get('state')!=='paused',
temperatureUnit:'celsius',distanceUnit:'meter',themeMode:'system',reducedTransparency:q.get('reduce')==='1',dynamicColorEnabled:false,
onNavigate:r=>window.actions.push(r),onRequireAccount:()=>window.actions.push('gate'),
onSetTemperatureUnit:v=>update({temperatureUnit:v}),onSetDistanceUnit:v=>update({distanceUnit:v}),onSetThemeMode:v=>update({themeMode:v}),onToggleReducedTransparency:()=>update({reducedTransparency:!props.reducedTransparency}),onToggleDynamicColor(){}};
window.actions=[];
const root=createRoot(document.getElementById('root'));
function update(v){props={...props,...v};render()}function render(){
const theme=ambientReadingTheme({...appThemes[q.get('mode')||'light'],reducedTransparency:props.reducedTransparency});
root.render(<LocalizationContext value={{language:q.get('lang')||'ko',region:'KR',timeZone:'Asia/Seoul',uses24hourClock:true}}><AppThemeProvider theme={theme}><AmbientReadingContext.Provider value={true}><View style={{flex:1,paddingTop:59,paddingBottom:88,backgroundColor:theme.background}}><AmbientReadingSurface theme={theme} routeId={q.get('route')}/>{q.get('route')==='M4'?<AppPermissionsScreen {...props}/>:q.get('route')==='A4'?<AccountManagementScreen {...props}/>:q.get('route')==='M3'?<GlobalSettingsScreen {...props}/>:<MyScreen {...props}/>}</View></AmbientReadingContext.Provider></AppThemeProvider></LocalizationContext>)}render();`);
await esbuild.build({entryPoints:[out+'/entry.tsx'],bundle:true,format:'iife',outfile:out+'/bundle.js',jsx:'automatic',nodePaths:[root+'/node_modules'],logLimit:3,define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'cloud-adapters',setup(b){b.onLoad({filter:/apps\/mobile\/src\/(screens\/(MyScreen|GlobalSettingsScreen|AppPermissionsScreen|AccountManagementScreen)|components\/(AppButton|AppListRow|AmbientReadingSurface|AppScreen))\.tsx$/},a=>process.env.WEATHERON_CLOUD_BASELINE?{contents:execFileSync('git',['show','02f68c1b5d7240b3e2b62728610c893715334edb:'+path.relative(root,a.path)],{cwd:root,encoding:'utf8'}),loader:'tsx'}:undefined);b.onResolve({filter:/^react-native$/},()=>({path:out+'/shim.tsx'}));b.onResolve({filter:/^expo-(haptics|localization|file-system|blur)$/},()=>({path:out+'/expo.tsx'}));b.onLoad({filter:/\.(png|jpg|jpeg|otf|ttf)$/},a=>({contents:`module.exports={uri:${JSON.stringify('/repo/'+path.relative(root,a.path))}}`,loader:'js'}));}}]});
let fonts='';for(const [weight,name] of [[300,'Light'],[400,'Regular'],[500,'SemiBold'],[600,'SemiBold'],[700,'Bold'],[800,'ExtraBold'],[900,'Black']])fonts+=`@font-face{font-family:Pretendard;font-weight:${weight};src:url('/repo/apps/mobile/assets/fonts/Pretendard-${name}.otf')}`;
fs.writeFileSync(out+'/index.html',`<!doctype html><meta charset="utf-8"><style>${fonts}html,body,#root{height:100%;margin:0}#root{display:flex;flex-direction:column}</style><div id="root"></div><script src="/bundle.js"></script>`);
console.log('Built actual M1/M3/M4/A4 source with React Native Web; iOS Platform fixture, native Glass tonal fallback, simulated fontScale. No device/runtime claims.');
