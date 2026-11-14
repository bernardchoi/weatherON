import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const exp={}; new Function('exports',ts.transpileModule(readFileSync('apps/mobile/src/utils/mascotOutfit.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(exp);
const {resolveMascotClothing:r,withMascotClothing:w}=exp;
const context={reliable:true,currentAvailable:true,pending:false,weatherSnapshotId:'destination-today'};
const outfit={weatherSnapshotId:'destination-today',items:{top:{weatherTags:[]}},variant:'default'};
assert.equal(r(outfit,context),'light');
for(const [tags,expected] of [[[],'outer'],[['rain'],'raincoat'],[['cold'],'winter'],[['cold','rain'],'winter']]) assert.equal(r({...outfit,items:{...outfit.items,outer:{weatherTags:tags}}},context),expected);
for(const change of [{reliable:false},{pending:true},{currentAvailable:false},{weatherSnapshotId:'origin-today'}]) assert.equal(r(outfit,{...context,...change}),'none');
assert.equal(r({...outfit,items:{}},context),'none');
assert.equal(r({...outfit,variant:'cold'},context),'light'); // selected items win over generic variant
assert.equal(r({...outfit,items:{outer:{source:'photo',weatherTags:[]}}},context),'outer'); // no photo inference
assert.equal(w({asset:'cold',weather:'snow'},'winter').asset,'base');
assert.equal(w({asset:'rain',weather:'rain'},'winter').asset,'rain');
assert.equal(w({asset:'heat',weather:'clear'},'light').asset,'heat');
assert.equal(w({asset:'cold',weather:'snow'},'none').asset,'base');
const home=readFileSync('apps/mobile/src/screens/HomeScreen.tsx','utf8');
assert.ok(home.includes('state.outfitContext?.weather ?? state.weather'));
assert.ok(home.includes('resolveMascotClothing(state.outfit,'));
assert.ok(home.includes('homeMascotWind(mascotCurrent.windMs'));
for(const name of ['Rain','Fan']) {const s=readFileSync(`apps/mobile/src/components/HomeMascot${name}Rig.tsx`,'utf8'); assert.ok(s.indexOf('<HomeMascotClothing')<s.indexOf(name==='Rain'?'<Animated.View testID="home-mascot-umbrella-part"':'<Animated.Image testID="home-mascot-fan-part"'));}
console.log('PASS outfit mapping, reliable/matching basis, photo non-inference, independent props and layer ordering (21 assertions).');
