import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root='assets/filled-surface-v3-20261015';
const files=fs.readdirSync(root+'/png',{recursive:true}).filter(f=>f.endsWith('.png'));
assert.equal(files.length,72);
for(const file of files){const b=fs.readFileSync(root+'/png/'+file);assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),192);assert.equal(b.readUInt32BE(20),192);assert.ok(fs.existsSync(root+'/svg/'+file.replace('.png','.svg')));}
function load(file){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(m,m.exports,id=>{
 if(id.endsWith('.png')){assert.ok(fs.existsSync(path.resolve(path.dirname(file),id)));return id;}
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
 assert.equal(ambientWeatherIcon('dust',false,theme,variant).source,'legacy-dust');
 for(const unknown of ['unknown','hail','mixed','sleet','thunderstorm',''])assert.equal(ambientWeatherIcon(unknown,false,theme,variant),undefined);
}
assert.ok(ambientUiIcons.tabOutfit.endsWith('/compact/light/tab-outfit.png'));
const code=fs.readFileSync('apps/mobile/src/components/BottomNav.tsx','utf8');
const fn=ts.transpileModule(code.slice(code.indexOf('function TabIcon('),code.indexOf('function getTabIconSource(')),{compilerOptions:{jsx:ts.JsxEmit.React}}).outputText;
for(const name of ['light','dark'])for(const active of [false,true])for(const [route,key] of Object.entries({H1:'tab-home',C1:'tab-outfit',G1:'tab-depart',M1:'tab-my'})){
 const React={createElement:(type,props)=>({type,props})};
 const render=new Function('React','Image','useAppTheme','filledV3Tabs','Platform','styles','getTabIconSource',fn+';return TabIcon;')(React,'Image',()=>({name}),filledV3Tabs,{OS:'ios'},{},()=> 'legacy');
 const n=render({route,active,color:'tint',useHighContrastSize:true});
 assert.equal(n.props.source,filledV3Tabs[active?'selected':'compact'][name][key]);assert.equal(n.props.style.at(-1).tintColor,undefined);
}
console.log('PASS v3: 72 transparent-size derivatives and source pairs; exact weather semantics/fallbacks; actual tab JSX uses theme/state assets without tint; wardrobe shirt mapping.');
