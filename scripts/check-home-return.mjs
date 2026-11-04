import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
const home=fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');
const ast=ts.createSourceFile('home.tsx',home,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const fn=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='HomeValueTransition');
const refs=[],effects=[];let cursor=0, reduced=null, animations=0;
const timingModule={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('apps/mobile/src/theme/ambientMotion.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(timingModule,timingModule.exports);
const context={ambientMotion:timingModule.exports.ambientMotion,Platform:{OS:'ios'},React:{createElement:()=>null},useReducedMotion:()=>reduced,useRef:v=>refs[cursor++]??(refs[cursor-1]={current:v}),useEffect:(cb,deps)=>{const index=cursor++;const prev=effects[index];if(!prev||deps.some((d,i)=>d!==prev.deps[i])){prev?.cleanup?.();effects[index]={deps,cleanup:cb()};}},Animated:{Value:class{constructor(v){this.v=v}stopAnimation(){}setValue(v){this.v=v}interpolate(){return this.v}},View:'View',timing:()=>({start(){animations++},stop(){}})},Easing:{out:x=>x,cubic:0}};
vm.createContext(context);vm.runInContext(ts.transpileModule(fn.getText(ast),{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText,context);
function render(value){cursor=0;context.HomeValueTransition({value,children:null})}
render('21:celsius');reduced=false;render('21:celsius');
assert.equal(animations,0,'Returning Home: unchanged visible temperature must not fade/translate when the async Reduce Motion query resolves');
render('22:celsius');assert.equal(animations,1,'Actual value changes retain the existing animation');
reduced=true;render('22:celsius');render('23:celsius');assert.equal(animations,1,'Reduce Motion disables animation');
reduced=false;render('23:celsius');assert.equal(animations,1,'Accessibility preference changes do not animate unchanged content');
console.log('PASS actual HomeValueTransition lifecycle: mount/query/unchanged/value change/reduced motion');

// Execute the real persistent stack and Home's viewport binding across tab remounts.
const stackSource=fs.readFileSync('apps/mobile/src/components/NavigationStack.tsx','utf8');
const stackAst=ts.createSourceFile('stack.tsx',stackSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const stackCode=stackAst.statements.filter(n=>ts.isFunctionDeclaration(n)&&['IosStack','reconcileScreenStack'].includes(n.name?.text)).map(n=>n.getText(stackAst).replace(/^export /,'')).join('\n');
let slot=0;const slots=[];
const stackContext={useSafeAreaInsets:()=>({top:62,bottom:34}),useWindowDimensions:()=>({height:956,width:440}),ambientReadingRouteIds:['C1','M1'],AmbientReadingSurface:'AmbientReadingSurface',React:{createElement:(type,props,...children)=>({type,props,children})},useState:v=>{const i=slot++;if(!(i in slots))slots[i]=typeof v==='function'?v():v;return[slots[i],v=>{slots[i]=v}]},useRef:v=>{const i=slot++;return slots[i]??(slots[i]={current:v})},useAppTheme:()=>({background:'#000'}),useReducedMotion:()=>false,HomeViewportContext:{Provider:'ViewportProvider'},View:'View',ScreenStack:'ScreenStack',ScreenStackItem:'ScreenStackItem',styles:{fill:{}},StyleSheet:{absoluteFill:{}}};
stackContext.OutfitMotionContext={Provider:'OutfitProvider'};stackContext.useOutfitTransitionHost=()=>({root:{current:null},context:{},onLayout(){},overlay:null});
stackContext.useEffect=()=>{};stackContext.AppState={currentState:'active',addEventListener:()=>({remove(){}})};stackContext.AmbientMotionContext={Provider:'MotionProvider'};
vm.createContext(stackContext);vm.runInContext(ts.transpileModule(stackCode,{compilerOptions:{jsx:ts.JsxEmit.React,target:ts.ScriptTarget.ES2022}}).outputText,stackContext);
function stackRender(route,backRoute){slot=0;return stackContext.IosStack({route,backRoute,onGoBack(){},renderScreen:()=>null})}
let frame=stackRender('H1');assert.equal(typeof frame.props.onLayout,'function','Measure viewport at persistent stack, not remounted Home');
frame.props.onLayout({nativeEvent:{layout:{height:757}}});
for(const route of ['H1','C1','H1','D1','H1']){
 frame=stackRender(route);const provider=frame.children[0];assert.equal(provider.type,'ViewportProvider');assert.equal(provider.props.value,757,'Tab changes must retain measured Home spacing from the first returning render');
}
frame.props.onLayout({nativeEvent:{layout:{height:850}}});assert.equal(stackRender('H1').children[0].props.value,850,'Real viewport changes remain responsive');
assert.match(home,/const viewportHeight = useContext\(HomeViewportContext\)/);
assert.doesNotMatch(home,/\[viewportHeight, setViewportHeight\] = useState\(0\)/);
console.log('PASS actual persistent iOS stack measurement across Home/Codi/Departure/Home and resized viewport');
function motionValues(tree,out=[]){if(!tree||typeof tree!=='object')return out;if(Array.isArray(tree)){tree.forEach(n=>motionValues(n,out));return out;}if(tree.type==='MotionProvider')out.push(tree.props.value);motionValues(tree.children,out);return out;}
frame=stackRender('M1');let policies=motionValues(frame);assert.equal(policies.find(p=>p.active).enabled,true,'A new primary tab gets staged content');
const visit=policies.find(p=>p.active).visit;frame=stackRender('M1');assert.equal(motionValues(frame).find(p=>p.active).visit,visit,'Unchanged route/data renders keep the visit identity');
frame=stackRender('A4','M1');policies=motionValues(frame);assert.equal(policies.filter(p=>p.active).length,1);assert.equal(policies.find(p=>p.active).enabled,true,'Fresh detail content can overlap the native push');
frame=stackRender('M1');assert.equal(motionValues(frame).find(p=>p.active).enabled,false,'A retained screen must not replay entrance after an interactive pop');
console.log('PASS actual stack entrance policy: primary tab visits, unchanged data, detail push and retained native-pop return.');
