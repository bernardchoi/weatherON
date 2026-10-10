import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const cache=new Map();
function load(file,boundaries={}) {
 if(cache.has(file))return cache.get(file);const module={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 new Function('module','exports','require',code)(module,module.exports,id=>id in boundaries?boundaries[id]:load(path.resolve(path.dirname(file),id+'.ts'),boundaries));cache.set(file,module.exports);return module.exports;
}
const base='apps/mobile/src/';
const {createAmbientTouchController}=load(base+'utils/ambientTouch.ts');
const contacts=[],points=[];let measure;
const c=createAmbientTouchController((x,y)=>points.push([x,y]),v=>contacts.push(v));
const sample=(x,y,count=1)=>({identifier:3,pageX:x,pageY:y,count});
c.down(sample(100,200),done=>measure=done);c.move(sample(160,240));measure(20,50,300,500);
assert.deepEqual(points.at(-1),[140,190]);assert.equal(contacts.at(-1).phase,'down');
const id=contacts.at(-1).id;c.move(sample(200,300));assert.deepEqual(points.at(-1),[180,250]);assert.equal(contacts.at(-1).id,id,'hold/move does not restart attack');c.up();assert.equal(contacts.at(-1).phase,'up');
c.down(sample(100,200),done=>measure=done);c.cancel();const before=contacts.length;measure(0,0,300,500);assert.equal(contacts.length,before,'late measurement cannot revive canceled touch');
c.down(sample(100,200),done=>done(0,0,300,500));c.move(sample(100,200,2));assert.equal(contacts.at(-1).phase,'cancel');c.move(sample(200,300));assert.equal(contacts.at(-1).phase,'cancel','background/scroll cancel cannot replay on move');
const {ambientStars,ambientMeteorGap,isAmbientReadingPoint}=load(base+'utils/ambientSky.ts');
assert.equal(ambientStars.length,26);assert.ok(ambientStars.some(s=>s.y<.2)&&ambientStars.some(s=>s.y>.8));assert.ok(ambientStars.some(s=>s.twinkle)&&ambientStars.some(s=>!s.twinkle));assert.equal(ambientMeteorGap(700,[{x:0,y:0,width:400,height:700}]),null);assert.ok(ambientMeteorGap(700,[{x:0,y:0,width:400,height:100}]).height>28);
assert.equal(isAmbientReadingPoint(100,200,[{x:90,y:180,width:80,height:40}]),true);
const {ambientWeatherMotion}=load(base+'utils/ambientWeatherMotion.ts');
assert.equal(ambientWeatherMotion('rain',false,10,8).kind,'none');assert.equal(ambientWeatherMotion('unknown',true,10,8).kind,'none');assert.equal(ambientWeatherMotion('clear',true,0,8).particles,0);
assert.ok(ambientWeatherMotion('rain',true,4,5).particles>ambientWeatherMotion('rain',true,4,1).particles);assert.equal(ambientWeatherMotion('snow',true,Infinity,NaN).particles,12);
const {getAmbientDaylight}=load(base+'utils/weatherDaylight.ts');
const seoul={coordinate:{latitude:37.5665,longitude:126.978},timeZone:'Asia/Seoul'};
assert.equal(getAmbientDaylight(new Date('2026-10-09T03:00:00Z'),seoul).phase,'day');assert.equal(getAmbientDaylight(new Date('2026-10-09T14:00:00Z'),seoul).phase,'night');assert.equal(getAmbientDaylight(new Date('2026-10-09T14:00:00Z'),seoul).season,'autumn');assert.equal(getAmbientDaylight(new Date(),{}).phase,'unknown');
const jsx=(type,props)=>({type,props});
const interpolation=config=>{assert.equal(config.inputRange.length,config.outputRange.length);for(let i=1;i<config.inputRange.length;i++)assert.ok(config.inputRange[i]>config.inputRange[i-1],JSON.stringify(config));return {config,interpolate:interpolation};};
const scalar=v=>typeof v==='number'?v:v.value??0;
function at(c,x){const ir=c.inputRange,or=c.outputRange;if(x<=ir[0])return or[0];if(x>=ir.at(-1))return or.at(-1);for(let i=1;i<ir.length;i++)if(x<=ir[i])return or[i-1]+(or[i]-or[i-1])*(x-ir[i-1])/(ir[i]-ir[i-1]);}
class Value {constructor(value=0){this.value=value} setValue(v){this.value=v} stopAnimation(){} interpolate(c){return {...interpolation(c),value:at(c,this.value)}}}
const effects=[];
const {AmbientWeatherLayer}=load(base+'components/AmbientWeatherLayer.tsx',{'react':{useRef:()=>({current:new Value}),useEffect:fn=>effects.push(fn)},'react/jsx-runtime':{jsx,jsxs:jsx},'../localization/react-native':{View:'View',Animated:{View:'AnimatedView',Value,multiply:(...v)=>new Value(v.reduce((a,b)=>a*scalar(b),1)),subtract:(a,b)=>new Value(scalar(a)-scalar(b)),add:(a,b)=>new Value(scalar(a)+scalar(b))}}});
const all=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(all):[n,...all(n.props?.children)];
for(const dark of [true,false])for(const kind of ['clear','cloud','rain','snow','storm','fog','dust','none'])for(const phase of ['day','twilight','night','unknown']) {
 const weather=ambientWeatherMotion(kind,true,3,2);
 const tree=AmbientWeatherLayer({kind:weather.kind,particles:weather.particles,phase:new Value,moving:false,daylight:{phase,season:'autumn'},region:{x:230,y:90,width:126,height:126},dark});
 if(kind==='none'){assert.equal(tree,null);continue;}assert.equal(tree.props.style.overflow,'hidden');if(kind==='clear'&&phase==='night')assert.equal(tree.props.testID,'ambient-night-sky');
 const nodes=all(tree);const stars=nodes.filter(n=>n.props?.style?.backgroundColor===(dark?'#E4F2FF':'#274A70'));assert.equal(stars.length>0,kind==='clear'&&phase==='night','stars cannot mix with day/overcast/rain');
 if(!dark&&stars.length){const star=stars.find(n=>n.props.style.width===2.4);const alpha=typeof star.props.style.opacity==='number'?star.props.style.opacity:Math.min(...star.props.style.opacity.config.outputRange);const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));const luminance=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);const bg=rgb('#C6DDF5');const fg=rgb(star.props.style.backgroundColor).map((v,i)=>v*alpha+bg[i]*(1-alpha));assert.ok((luminance(bg)+.05)/(luminance(fg)+.05)>=3,'light night stars stay visible on core upper background');}

}
const target=ambientStars[0],sky={x:0,y:0,width:440,height:758};const r={x:target.x*440-8,y:target.y*758-8,width:16,height:16};
const renderSky=y=>AmbientWeatherLayer({kind:'clear',particles:0,phase:new Value(.2),moving:false,daylight:{phase:'night',season:'autumn'},skyRegion:sky,readingAreas:[r],scrollOffset:new Value(y),dark:true});
const opacity=y=>scalar(all(renderSky(y)).find(n=>n.props?.testID==='ambient-sky-star').props.style.opacity);
assert.ok(opacity(80)>opacity(0)*10,'native scroll weight follows the actual measured reading area');
assert.equal(all(renderSky(0)).filter(n=>n.props?.testID==='ambient-sky-star').length,26);assert.equal(all(renderSky(80)).filter(n=>n.props?.testID==='ambient-sky-star').length,26,'scroll never removes sky stars');
const home=fs.readFileSync(base+'screens/HomeScreen.tsx','utf8');assert.ok(home.includes('Animated.event([{ nativeEvent: { contentOffset: { y: ambientScrollOffset } } }]'));assert.equal(home.includes('setAmbientScrollOffset'),false,'no React state update per scroll frame');
const ast=ts.createSourceFile('HomeScreen.tsx',home,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let layoutHandler;function findLayout(n){if(ts.isJsxAttribute(n)&&n.name.getText(ast)==='onReadingLayout')layoutHandler=n.initializer.expression;ts.forEachChild(n,findLayout);}findLayout(ast);assert.ok(layoutHandler);let queued;
const layoutJS=ts.transpileModule('const handler='+layoutHandler.getText(ast)+';',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const runLayout=new Function('Platform','setReadRegions',layoutJS+'return handler;')({OS:'ios'},updater=>queued=updater);
const pooled={nativeEvent:{layout:{x:28,y:490,width:384,height:240}}};runLayout(pooled);pooled.nativeEvent=null;assert.deepEqual(queued({})['outfit-card'],{x:28,y:490,width:384,height:240},'actual measured-region handler snapshots pooled native event synchronously');
console.log('PASS: actual passive controller hold/move/up/multitouch/cancel/late measurement; reliable weather density; timezone solar/season; 64 explicitly labeled weather/day-cycle fixtures with bounded native interpolation. Fixtures are not live weather or physical touch evidence.');
