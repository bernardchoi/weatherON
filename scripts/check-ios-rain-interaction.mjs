import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
// Execute the real chart and its real press wrapper. Mock only native rendering,
// time/data formatting and accessibility preference boundaries.
const animations=[];
const React={createElement:(type,props,...children)=>({type,props:props??{},children}),useState:v=>[v,()=>{}],useRef:v=>({current:v})};
class Value {constructor(value){this.value=value;}stopAnimation(){}setValue(value){this.value=value;}}
const flat=v=>Array.isArray(v)?Object.assign({},...v.map(flat)):v??{};
const rn={View:'View',Text:'Text',Image:'Image',ScrollView:'ScrollView',Pressable:'Pressable',useWindowDimensions:()=>({fontScale:1}),StyleSheet:{create:v=>v,flatten:flat,hairlineWidth:.5},Easing:{out:v=>v,cubic:1},Animated:{Value,createAnimatedComponent:v=>`Animated(${v})`,timing(value,config){animations.push(config);return {start(){value.setValue(config.toValue);}}}}};
const times=[0,3600000], bars=times.map((at,i)=>({at,precipitationMm:i+1,rainProbabilityPct:50}));
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};new Function('module','exports','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(m,m.exports,id=>{
 if(id==='react')return React;
 if(id.endsWith('/localization/react-native'))return rn;
 if(id.endsWith('/useReducedMotion'))return {useReducedMotion:()=>false};
 if(id.endsWith('/interactionFeedback'))return {triggerImportantActionHaptic(){}};
 if(id.endsWith('/AppThemeContext'))return {useAppTheme:()=>({text:'#123',muted:'#456',card:'#def',border:'#789',sky:'#abc',gold:'#a80'})};
 if(id.endsWith('/assets'))return {uiIconAssets:{drop:'drop'}};
 if(id.endsWith('/homeOuting'))return {forecastHours:()=>bars,forecastTime:at=>`10/10 ${at===0?'09:00':'10:00'}`};
 if(id.endsWith('/FeedbackPressable'))return load(path.resolve(path.dirname(file),id+'.tsx'));
 throw Error('Unmocked boundary '+id);
 });cache.set(file,m.exports);return m.exports;}
const Chart=load('apps/mobile/src/screens/IosRainForecastChart.tsx').IosRainForecastChart;
const tree=Chart({weather:{},now:0,forecast:{usable:true,covered:true,bars}});
const columns=[];
function walk(n){if(!n||typeof n!=='object')return;if(Array.isArray(n))return n.forEach(walk);if(n.props.testID?.startsWith('rain-hour-'))columns.push(n);n.children?.forEach(walk);}
walk(tree);assert.equal(columns.length,2);
for(const column of columns){const control=typeof column.type==='function'?column.type(column.props):column;control.props.onPressIn?.({});control.props.onPressOut?.({});assert.equal(animations.length,0,'Chart press must not scale/animate the plotted data and grid');const transform=flat(control.props.style).transform??[];assert.ok(transform.every(t=>!('scale' in t)||t.scale===1),'Chart geometry must remain fixed during selection');assert.equal(control.props.accessibilityRole,'button');assert.equal(typeof control.props.onPress,'function');}
console.log('PASS: real chart press path preserves plot/grid geometry without touch-scale animations; button semantics and selection callbacks retained. Native flicker requires separate visual QA.');
