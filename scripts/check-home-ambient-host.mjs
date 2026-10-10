import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=fs.readFileSync('apps/mobile/src/components/HomeAmbientHost.tsx','utf8');
let effects=[],registered=[],state=null;
const register=v=>registered.push(v);
const react={createContext:()=>({Provider:'Provider'}),useContext:()=>register,useState:()=>[state,register],useLayoutEffect:f=>effects.push(f)};
const jsx=(type,props)=>({type,props});const m={exports:{}};
new Function('require','module','exports',ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(id=>id==='react'?react:id==='react/jsx-runtime'?{jsx,jsxs:jsx}:{View:'View'},m,m.exports);
const {HomeAmbientPortal,HomeAmbientHost}=m.exports;
const canvas={type:'ambient'};assert.equal(HomeAmbientPortal({enabled:true,children:canvas}),null);const cleanups=effects.map(f=>f());assert.equal(registered.at(-1),canvas);cleanups.forEach(f=>f?.());assert.equal(registered.at(-1),null);
effects=[];registered=[];assert.equal(HomeAmbientPortal({enabled:false,children:canvas}).props.children,canvas);effects.forEach(f=>f());assert.equal(registered.length,0);
state=canvas;const content={type:'safe-content'};for(const enabled of [true,false]){const root=HomeAmbientHost({enabled,backgroundColor:'#fff',children:content}).props.children;assert.equal(root.props.children[0],enabled?canvas:null);assert.equal(root.props.children[1],content);assert.deepEqual(root.props.style,{flex:1,backgroundColor:'#fff'});}
console.log('PASS: root host mounts one decorative canvas behind unchanged content, gates it outside Home, unregisters on unmount, and preserves inline fallback.');
