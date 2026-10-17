import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root='assets/filled-surface-v3-20261015';
const files=fs.readdirSync(root+'/png',{recursive:true}).filter(f=>f.endsWith('.png'));
const uiIcons=['add','back','check','delete','droplet','expand','notifications','permissions','policy-document','settings','style','temperature','theme','time','transparency','umbrella','uv','wardrobe-empty','wardrobe-all','wardrobe-outer','wardrobe-bottom','wardrobe-shoes','wardrobe-accessory'];
const uiFiles=files.filter(file=>file.startsWith('ui/'));
assert.equal(files.length,107);
assert.equal(uiFiles.length,uiIcons.length);
assert.deepEqual(uiFiles.sort(),uiIcons.map(name=>`ui/${name}.png`).sort());
for(const file of files){const b=fs.readFileSync(root+'/png/'+file);assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),192);assert.equal(b.readUInt32BE(20),192);assert.ok(fs.existsSync(root+'/svg/'+file.replace('.png','.svg')));}
for(const name of uiIcons){
 const source=fs.readFileSync(`${root}/svg/ui/${name}.svg`,'utf8');
 assert.match(source,/viewBox="0 0 64 64"/);assert.match(source,/fill-opacity=/);
 assert.doesNotMatch(source,/currentColor/);
}
const platform={OS:'ios'};
function load(file){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(m,m.exports,id=>{
 if(id.endsWith('.png')){assert.ok(fs.existsSync(path.resolve(path.dirname(file),id)));return id;}
 if(id==='./localization/react-native')return {Platform:platform};
 if(id==='./assets')return {uiIconAssets:{wind:'legacy-dust'}};
 if(id==='./filledV3Assets')return load('apps/mobile/src/filledV3Assets.ts');
 throw Error(id);
});return m.exports;}
const {ambientWeatherIcon,ambientUiIcons}=load('apps/mobile/src/ambientAssets.ts');
const {filledV3Tabs}=load('apps/mobile/src/filledV3Assets.ts');
for(const name of ['light','dark'])for(const variant of ['compact','hero']){
 const theme={name,muted:'muted'};
 for(const [condition,asset] of Object.entries({clear:'sun',cloud:'cloud',rain:'rain',snow:'snow',fog:'fog'})){
 const icon=ambientWeatherIcon(condition,false,theme,variant);assert.ok(icon.source.endsWith('/'+variant+'/'+name+'/'+asset+'.png'));assert.equal(icon.tintColor,undefined);
 }
 assert.ok(ambientWeatherIcon('clear',true,theme,variant).source.endsWith('/night.png'));
 assert.ok(ambientWeatherIcon('storm',false,theme,variant).source.includes('ambient-surface-runtime-v1/hero/'+name+'/heavy-rain.png'));
 assert.ok(ambientWeatherIcon('dust',false,theme,variant).source.endsWith(`/${variant}/${name}/wind.png`));
 for(const [condition,asset] of Object.entries({hail:'hail',sleet:'sleet',mixed:'mixed',unknown:'unknown'})){
  const icon=ambientWeatherIcon(condition,false,theme,variant);assert.ok(icon.source.endsWith('/'+variant+'/'+name+'/'+asset+'.png'));assert.equal(icon.tintColor,undefined);
 }
 for(const unsupported of ['thunderstorm',''])assert.ok(ambientWeatherIcon(unsupported,false,theme,variant).source.endsWith(`/${variant}/${name}/unknown.png`));
}
platform.OS='android';
for(const condition of ['sleet','hail','storm-hail','mixed','unknown'])assert.equal(ambientWeatherIcon(condition,false,{name:'light'},'compact'),undefined,'Android must not receive staged V3 state artwork');
assert.ok(ambientWeatherIcon('rain',false,{name:'light'},'compact').source.endsWith('/compact/light/rain.png'));
platform.OS='ios';
assert.ok(ambientUiIcons.tabOutfit.endsWith('/compact/light/tab-outfit.png'));
for(const [name,expected] of Object.entries({
 back:'back',policyDocument:'policy-document',delete:'delete',style:'style',permissions:'permissions',settings:'settings',
 time:'time',umbrella:'umbrella',notifications:'notifications',expand:'expand',add:'add',temperature:'temperature',uv:'uv',
 droplet:'droplet',theme:'theme',transparency:'transparency',check:'check',wardrobeAll:'wardrobe-all',wardrobeOuter:'wardrobe-outer',wardrobeBottom:'wardrobe-bottom',
 wardrobeShoes:'wardrobe-shoes',wardrobeAccessory:'wardrobe-accessory',wardrobeEmpty:'wardrobe-empty',
})) assert.ok(ambientUiIcons[name].endsWith(`/png/ui/${expected}.png`),`${name} must use filled UI derivative`);
const code=fs.readFileSync('apps/mobile/src/components/BottomNav.tsx','utf8');
const fn=ts.transpileModule(code.slice(code.indexOf('function TabIcon('),code.indexOf('function getTabIconSource(')),{compilerOptions:{jsx:ts.JsxEmit.React}}).outputText;
for(const name of ['light','dark'])for(const active of [false,true])for(const [route,key] of Object.entries({H1:'tab-home',C1:'tab-outfit',G1:'tab-depart',M1:'tab-my'})){
 const React={createElement:(type,props)=>({type,props})};
 const render=new Function('React','Image','useAppTheme','filledV3Tabs','Platform','styles','getTabIconSource',fn+';return TabIcon;')(React,'Image',()=>({name}),filledV3Tabs,{OS:'ios'},{},()=> 'legacy');
 const n=render({route,active,color:'tint',useHighContrastSize:true});
 assert.equal(n.props.source,filledV3Tabs[active?'selected':'compact'][name][key]);assert.equal(n.props.style.at(-1).tintColor,undefined);
}
for(const name of ['light','dark'])for(const active of [false,true]){
 const React={createElement:(type,props)=>({type,props})};
 const render=new Function('React','Image','useAppTheme','filledV3Tabs','Platform','styles','getTabIconSource',fn+';return TabIcon;')(React,'Image',()=>({name}),filledV3Tabs,{OS:'android'},{},()=> 'legacy');
 const n=render({route:'H1',active,color:'tint',useHighContrastSize:true});
 assert.equal(n.props.source,'legacy');assert.equal(n.props.style.at(-1).tintColor,'tint');
}
const wardrobe=fs.readFileSync('apps/mobile/src/components/WardrobeCategoryIcon.tsx','utf8');
for(const key of ['wardrobeAll','tabOutfit','wardrobeOuter','wardrobeBottom','wardrobeShoes','wardrobeAccessory'])assert.match(wardrobe,new RegExp(key));
assert.match(wardrobe,/accessibilityElementsHidden/);assert.doesNotMatch(wardrobe,/react-native-svg/);
const back=fs.readFileSync('apps/mobile/src/components/BackButton.tsx','utf8');
assert.match(back,/Platform\.OS === "ios" \? <Image source=\{ambientUiIcons\.back\}/);
const settings=fs.readFileSync('apps/mobile/src/screens/GlobalSettingsScreen.tsx','utf8');
assert.match(settings,/icon=\{ambient \? ambientUiIcons\.temperature : screenIcons\.uv\}/);
assert.match(settings,/icon=\{ambient \? ambientUiIcons\.transparency : screenIcons\.settings\}/);
assert.match(settings,/icon=\{ambientUiIcons\.theme\}/);
for(const mode of ['light','dark'])for(const preview of ['filled-ui','filled-ui-small'])assert.ok(fs.existsSync(`${root}/previews/${preview}-${mode}.png`));
for(const mode of ['light','dark'])for(const preview of ['filled-weather-states','filled-weather-states-small'])assert.ok(fs.existsSync(`${root}/previews/${preview}-${mode}.png`));
console.log('PASS v3: 72 approved weather/tab derivatives + 12 distinct precipitation/unknown derivatives + 23 layered UI derivatives; iOS mappings, untouched Android runtime tabs, category distinction, and accessibility wiring.');
