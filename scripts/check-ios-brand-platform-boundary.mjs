import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import ts from "typescript";
const base = "1a258866e016bef65dd794be5981b7900909bf07";
const original = file => execFileSync("git", ["show", base + ":" + file], {encoding:"utf8"});
function load(file, platform, baseline=false, cache=new Map()) {
  if(cache.has(file)) return cache.get(file);
  const exports={};cache.set(file,exports);
  const source=baseline?original(file):fs.readFileSync(file,"utf8");
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function("exports","require",code)(exports,id=>{
    if(id==="../localization/react-native")return {Platform:{OS:platform}};
    assert.ok(id.startsWith("."),id);
    return load(path.posix.join(path.posix.dirname(file),id+".ts"),platform,baseline,cache);
  });
  return exports;
}
const old=load("apps/mobile/src/theme/tokens.ts","android",true);
const next=load("apps/mobile/src/theme/tokens.ts","android");
const oldAmbient=load("apps/mobile/src/theme/ambientSurface.ts","android",true);
const nextAmbient=load("apps/mobile/src/theme/ambientSurface.ts","android");
function sameOldFields(a,b,label){for(const [key,value]of Object.entries(a))assert.deepEqual(b[key],value,label+"."+key);}
for(const mode of ["light","dark"])for(const reduce of [false,true])for(const dynamic of [false,true]){
  const a=old.resolveAppTheme(mode,null,reduce,dynamic),b=next.resolveAppTheme(mode,null,reduce,dynamic);
  sameOldFields(a,b,"Android "+mode+" reduce="+reduce+" dynamic="+dynamic);
  assert.deepEqual(nextAmbient.ambientPalette(b),oldAmbient.ambientPalette(a));
  for(const reading of [false,true])sameOldFields(oldAmbient.ambientHomeTheme(a,reading),nextAmbient.ambientHomeTheme(b,reading),"Android Home");
  sameOldFields(oldAmbient.ambientReadingTheme(a),nextAmbient.ambientReadingTheme(b),"Android reading");
  assert.equal(nextAmbient.ambientBaseGradient(b),oldAmbient.ambientBaseGradient(a));
  for(const role of ["surfacePassive","surfaceSelected","accentTint","accentBorder","infoTint","successTint","outlineSoft","outlineStrong","imagePlaceholder","scrim","glassHighlight","glassBorder","glassBorderStrong"])
    assert.equal(next.semanticColor(b,role),old.semanticColor(a,role),"Android semantic "+role);
}
assert.deepEqual(next.appColors,old.appColors);
const preserved=[
"apps/mobile/src/components/AmbientBaseFlow.tsx","apps/mobile/src/components/AmbientReadingSurface.tsx",
"apps/mobile/src/components/AmbientSurfaceBackground.tsx","apps/mobile/src/components/AmbientWeatherLayer.tsx",
"apps/mobile/src/components/AmbientTouchLayer.tsx","apps/mobile/src/components/AmbientSurfaceTexture.tsx",
"apps/mobile/src/components/HomeAmbientHost.tsx","apps/mobile/src/components/AppAmbientSurface.tsx",
"apps/mobile/src/components/WeatherBackground.tsx","apps/mobile/src/utils/ambientTouch.ts",
"apps/mobile/src/theme/responsiveLayout.ts","apps/mobile/src/navigation/AppNavigator.tsx",
"apps/mobile/src/state/useWeatherOnAppState.ts","apps/mobile/src/theme/androidMaterial.ts"
];
for(const file of preserved)assert.equal(fs.readFileSync(file,"utf8"),original(file),file+" must preserve motion/layout/data/Android material");
const native="apps/mobile/ios/WeatherON/LiquidGlassNavigationView.swift";
assert.equal(fs.readFileSync(native,"utf8"),original(native).replace(
"UIColor(red: 35/255, green: 55/255, blue: 80/255, alpha: 1) : UIColor(red: 233/255, green: 241/255, blue: 248/255, alpha: 1)",
"UIColor(red: 26/255, green: 57/255, blue: 69/255, alpha: 1) : UIColor(red: 221/255, green: 239/255, blue: 242/255, alpha: 1)"),
"Native file may only change the opaque material colors");
const home="apps/mobile/src/screens/HomeScreen.tsx";
const styleSource=s=>s.slice(s.indexOf("const styles = StyleSheet.create("));
assert.equal(styleSource(fs.readFileSync(home,"utf8")),styleSource(original(home)),"Home styles/font sizes/spacing");
const ios=load("apps/mobile/src/theme/tokens.ts","ios");
assert.equal(ios.appThemes.light.background,"#E9F6F8");
assert.equal(ios.appThemes.dark.background,"#102B38");
console.log("PASS Android baseline colors: 8 theme configurations, Home/reading palettes and semantic roles. 14 motion/layout/data files byte-identical; native diff is one opaque material color expression; Home StyleSheet unchanged. iOS uses the new palette.");
console.log(JSON.stringify(preserved.map(file=>({file,sha256:crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}))));


// Dependency lock may add SVG and its dependencies, but must not re-resolve existing packages.
const oldLock=JSON.parse(original("package-lock.json"));
const lock=JSON.parse(fs.readFileSync("package-lock.json","utf8"));
for(const [key,value]of Object.entries(oldLock.packages)) {
  if(key==="apps/mobile") {
    const expected=JSON.parse(JSON.stringify(value));expected.dependencies["react-native-svg"]="15.15.4";
    assert.deepEqual(lock.packages[key],expected,"only SVG dependency may change mobile workspace lock");
  } else assert.deepEqual(lock.packages[key],value,"existing package lock preserved: "+key);
}
assert.equal(lock.packages["node_modules/react-native-svg"].version,"15.15.4");
const component=fs.readFileSync("apps/mobile/src/components/IosHomeWordmark.tsx","utf8");
assert.ok(component.includes('width={180} height={30}'));
assert.ok(component.includes('accessibilityLabel="WeatherON"'));
assert.ok(fs.readFileSync(home,"utf8").includes('Platform.OS === "ios"\n  ? require("../components/IosHomeWordmark")'));
console.log("PASS selected02 SVG is lazily evaluated on iOS only; 180x30 slot and accessibility identity; existing lock entries unchanged.");
