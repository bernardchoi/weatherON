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
fs.writeFileSync(out+'/expo.tsx',`import {View} from './shim'; export const BlurView=View; export const Paths={document:{uri:''}};export const getLocales=()=>[{languageCode:'ko',languageTag:'ko-KR',regionCode:'KR'}];export const getCalendars=()=>[{timeZone:'Asia/Seoul',uses24hourClock:true}]; export const selectionAsync=async()=>{window.haptics++;};export const notificationAsync=async()=>{};export const impactAsync=async()=>{};export const NotificationFeedbackType={Warning:'warning'};export const ImpactFeedbackStyle={Medium:'medium'};`);
fs.writeFileSync(out+'/entry.tsx',`import React from '${root}/node_modules/react/index.js';
import {createRoot} from '${root}/node_modules/react-dom/client.js';
import {View} from './shim';
import {OutfitScreen} from '${root}/apps/mobile/src/screens/OutfitScreen';
import {OutfitDetailScreen} from '${root}/apps/mobile/src/screens/OutfitDetailScreen';
import {DestinationListScreen} from '${root}/apps/mobile/src/screens/DestinationListScreen';
import {WardrobeFilterControls} from '${root}/apps/mobile/src/components/WardrobeFilterControls';
import {presetWardrobe,gangneungClearSnapshot,defaultPreferenceProfile} from '@weatheron/shared';
import {buildTodayOutfit} from '${root}/apps/mobile/src/utils/todayOutfit';
import {AppThemeProvider} from '${root}/apps/mobile/src/theme/AppThemeContext';
import {appThemes} from '${root}/apps/mobile/src/theme/tokens';
import {ambientReadingTheme} from '${root}/apps/mobile/src/theme/ambientSurface';
import {AmbientReadingContext,AmbientReadingSurface} from '${root}/apps/mobile/src/components/AmbientReadingSurface';
import {LocalizationContext} from '${root}/apps/mobile/src/localization/LocalizationProvider';
const q=new URLSearchParams(location.search),now=Date.parse('2026-10-11T12:30:00+09:00');
window.fixture={scale:Number(q.get('scale')||1),motion:true,now};window.actions=[];window.haptics=0;Date.now=()=>window.fixture.now;
const scenario=q.get('scenario')||'standard',count=Number(q.get('count')||3),foreign=q.get('lang')&&q.get('lang')!=='ko';
const wardrobe=presetWardrobe.map((item,i)=>({...item,owned:i<3}));
const weather={...gangneungClearSnapshot,locationId:'synthetic-origin',locationName:'Synthetic city',countryCode:'KR',timezone:'Asia/Seoul',source:'weatherkit',observedAt:new Date(now).toISOString(),stale:scenario==='stale',
current:{...gangneungClearSnapshot.current,tempC:scenario==='zero'?0:18,feelsLikeC:scenario==='zero'?0:18,tempAvailable:scenario!=='missing',feelsLikeAvailable:scenario!=='missing'&&scenario!=='air-only',condition:'cloud',rainProbabilityPct:0,precipitationMm:0},
hourly:scenario==='no-forecast'?[]:Array.from({length:12},(_,i)=>({time:'2026-10-11T'+String(12+i).padStart(2,'0')+':00',tempC:18-i/3,windMs:3.2,rainProbabilityPct:i===2?60:0,precipitationMm:i===2?2:0,condition:i===2?'rain':'cloud',available:{temp:true,wind:true,rainProbability:true,precipitation:true,condition:true}}))};
const today=buildTodayOutfit(weather,defaultPreferenceProfile,wardrobe,now);
const destinations=Array.from({length:count},(_,i)=>({place:{id:'synthetic-'+i,name:q.get('long')==='1'?('Synthetic destination '+i+' with a deliberately very long name for accessibility and layout verification'):foreign?'Synthetic destination '+i:['약속 장소','회사','도서관','연습실','공원'][i]||'합성 목적지 '+i,address:'Fixture city',countryCode:'KR',timezone:'Asia/Seoul',category:'transit',latitude:37,longitude:127},label:i===1?'work':null,careEnabled:i%2===0,alertCondition:{rainThresholdPct:50,windThresholdMs:8},schedulePreference:{timeBasis:i===2?'departure':'arrival',targetArrivalTime:i===1?'09:00':'16:00',transportMode:'transit',repeatEnabled:i===1,repeatDays:['mon','tue','wed','thu','fri']},travelEstimate:{originPlaceId:'synthetic-origin',destinationPlaceId:'synthetic-'+i,provider:'fallback',status:scenario==='route-error'?'error':'ready',travelMinutes:20,distanceMeters:1000},savedAtLabel:'',changeStatus:'saved'}));
let props={state:{weather,...today,destinationCare:{originWeather:weather,destinationWeather:weather},destinationWeatherById:Object.fromEntries(destinations.map(d=>[d.place.id,weather]))},wardrobeItems:wardrobe,
styleProfileSaved:true,selectedStyles:['minimal'],styleGender:'all',ageBand:'20-30',fitPreference:'standard',smartCareScenario:'commute',
accountLinked:q.get('account')!=='guest',termsRequiredAccepted:q.get('account')!=='terms',outfitSaved:q.get('saved')==='1',accountGateResult:null,
savedDestinations:destinations,selectedDestinationPlace:destinations[Number(q.get('selected')||0)]?.place||{id:'none'},placeSearchOrigin:q.get('scenario')==='no-origin'?undefined:{id:'synthetic-origin'},permissionReady:q.get('permission')!=='denied',temperatureUnit:'celsius',recentlyRemovedDestination:null,permissionGateResult:null,destinationLimitNotice:null,
onNavigate:r=>window.actions.push(r),onGoBack:()=>window.actions.push('C1'),onOpenWardrobeAdd:()=>window.actions.push('C3'),onRequireAccount:(...a)=>{window.actions.push(a);if(props.accountLinked&&props.termsRequiredAccepted)update({outfitSaved:true});},onDismissAccountGateResult(){},onRestoreRemovedDestination(){},onDismissRemovedDestination(){},onDismissDestinationLimitNotice(){},onSelectDestinationPlace:place=>{window.actions.push(place.id);update({selectedDestinationPlace:place});}};
const reactRoot=createRoot(document.getElementById('root'));
function update(v){props={...props,...v};render()}
function Filters(){const[c,setC]=React.useState(q.get('active')==='1'?'top':'all'),[s,setS]=React.useState(q.get('active')==='1'?'fall':'all'),[p,setP]=React.useState('all');return <View style={{padding:20}}><WardrobeFilterControls categoryFilter={c} seasonFilter={s} purposeFilter={p} onCategoryChange={setC} onSeasonChange={setS} onPurposeChange={setP}/></View>}
function render(){const theme=ambientReadingTheme({...appThemes[q.get('mode')||'light'],reducedTransparency:q.get('reduce')==='1'});
reactRoot.render(<LocalizationContext value={{language:q.get('lang')||'ko',region:'KR',timeZone:'Asia/Seoul',uses24hourClock:true}}><AppThemeProvider theme={theme}><AmbientReadingContext.Provider value={true}><View style={{flex:1,paddingTop:59,paddingBottom:88,backgroundColor:theme.background}}><AmbientReadingSurface theme={theme} routeId={q.get('route')}/>{q.get('route')==='G1'?<DestinationListScreen {...props}/>:q.get('route')==='C4'?<OutfitDetailScreen {...props}/>:q.get('route')==='filters'?<Filters/>:<OutfitScreen {...props}/>}</View></AmbientReadingContext.Provider></AppThemeProvider></LocalizationContext>)}render();`);
await esbuild.build({entryPoints:[out+'/entry.tsx'],bundle:true,format:'iife',outfile:out+'/bundle.js',jsx:'automatic',nodePaths:[root+'/node_modules'],logLimit:3,define:{'process.env.NODE_ENV':'"development"'},plugins:[{name:'cloud-adapters',setup(b){b.onLoad({filter:/apps\/mobile\/src\/(screens\/(OutfitScreen|OutfitDetailScreen|DestinationListScreen)|components\/(AppButton|OutfitGrid|AmbientReadingSurface|AppScreen|Section))\.tsx$/},a=>process.env.WEATHERON_CLOUD_BASELINE?{contents:execFileSync('git',['show','02f68c1b5d7240b3e2b62728610c893715334edb:'+path.relative(root,a.path)],{cwd:root,encoding:'utf8'}),loader:'tsx'}:undefined);b.onResolve({filter:/^react-native$/},()=>({path:out+'/shim.tsx'}));b.onResolve({filter:/^expo-(haptics|localization|file-system|blur)$/},()=>({path:out+'/expo.tsx'}));b.onLoad({filter:/\.(png|jpg|jpeg|otf|ttf)$/},a=>({contents:`module.exports={uri:${JSON.stringify('/repo/'+path.relative(root,a.path))}}`,loader:'js'}));}}]});
let fonts='';for(const [weight,name] of [[300,'Light'],[400,'Regular'],[500,'SemiBold'],[600,'SemiBold'],[700,'Bold'],[800,'ExtraBold'],[900,'Black']])fonts+=`@font-face{font-family:Pretendard;font-weight:${weight};src:url('/repo/apps/mobile/assets/fonts/Pretendard-${name}.otf')}`;
fs.writeFileSync(out+'/index.html',`<!doctype html><meta charset="utf-8"><style>${fonts}html,body,#root{height:100%;margin:0}#root{display:flex;flex-direction:column}</style><div id="root"></div><script src="/bundle.js"></script>`);
console.log('Built actual C1/C4/G1 and existing filter source with React Native Web; iOS Platform fixture, native Glass tonal fallback, simulated fontScale. No device/runtime claims.');
