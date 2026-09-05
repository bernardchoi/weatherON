import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
function sourceFunction(path, name) {
  const source = readFileSync(path, 'utf8');
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const node = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === name);
  assert.ok(node, name);
  return ts.transpileModule(node.getText(ast).replace('export ', ''), {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
}
const path = 'apps/mobile/src/components/NavigationStack.tsx';
const reconcile = new Function(`${sourceFunction(path,'reconcileScreenStack')} return reconcileScreenStack;`)();
let stack = ['M1'];
stack = reconcile(stack, 'A4', 'M1');
assert.deepEqual(stack, ['M1','A4']);
assert.equal(reconcile(stack, 'A4','M1'), stack, 'cancelled gesture must retain stack identity');
assert.deepEqual(reconcile(stack, 'M1'), ['M1']);
stack = reconcile(stack, 'R1', 'A4');
assert.deepEqual(stack, ['M1','A4','R1']);
assert.deepEqual(reconcile(stack,'A4','M1'), ['M1','A4']);
assert.deepEqual(reconcile(stack,'H1'), ['H1'], 'tab switch resets detail history');
assert.deepEqual(reconcile(['H1'],'H4','C1'), ['C1','H4'], 'dynamic return target must be under the detail');
const navPath = 'apps/mobile/src/navigation/AppNavigator.tsx';
const resolve = new Function('isLaunchVisibleP0Route', `${sourceFunction(navPath,'getBottomNavActiveRoute')} return getBottomNavActiveRoute;`)(r=>['H1','M1','C1','G1','H4','M2'].includes(r));
for (const route of ['A4','R1','R2','M1']) assert.equal(resolve(route),'M1');
assert.equal(resolve('H4',undefined,'C1'),'C1');
assert.equal(resolve('M2','G2'),'G1');
const nav = ts.createSourceFile(navPath,readFileSync(navPath,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let dockCount=0;
function visit(node) {
  if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(nav)==='BottomNav') dockCount++;
  ts.forEachChild(node,visit);
}
visit(nav);
assert.equal(dockCount,1,'all routes must share one mounted tab bar');
console.log('Native navigation: MY/account/policy push-pop, gesture cancellation identity, tab reset, contextual back targets and persistent dock passed');
const statePath='apps/mobile/src/state/useWeatherOnAppState.ts';
const stateSource=readFileSync(statePath,'utf8');
const stateAst=ts.createSourceFile(statePath,stateSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let backExpression, backCallback;
function findBack(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(stateAst)==='backRoute') backExpression=node.initializer.getText(stateAst);
  if (ts.isVariableDeclaration(node) && node.name.getText(stateAst)==='goBack') backCallback=node.initializer.arguments[0].getText(stateAst);
  ts.forEachChild(node,findBack);
}
findBack(stateAst);
assert.ok(backExpression && backCallback);
const getBackRoute=new Function(`${sourceFunction('apps/mobile/src/state/appStateHelpers.ts','getBackRoute')} return getBackRoute;`)();
const dynamicBack=new Function('route','gate','permissionGate','policyHubReturnRoute','styleProfileReturnRoute','destinationAddReturnRoute','isOverlayReturnRouteId','overlayReturnRoutes','getBackRoute', `return (${backExpression});`);
const resolveBack=(route)=>dynamicBack(route,{returnTo:'C1'},{returnTo:'M4'},'A4','C1','G1',r=>r==='H4',{H4:'C1'},getBackRoute);
for (const [from,to] of [['A4','M1'],['A2','C1'],['O3','M4'],['R2','R1'],['R1','A4'],['O4','C1'],['H4','C1']]) assert.equal(resolveBack(from),to);
for (const route of ['A4','A2','O3','H1']) {
  let destination,accountCleared=false,permissionCleared=false;
  const back=new Function('route','backRoute','setRoute','setGate','setPermissionGate',`return (${backCallback})();`);
  back(route,resolveBack(route),r=>destination=r,()=>accountCleared=true,()=>permissionCleared=true);
  assert.equal(destination,route==='H1'?undefined:resolveBack(route));
  assert.equal(accountCleared,route==='A2');
  assert.equal(permissionCleared,route==='O3');
}
console.log('Back actions: shared native/explicit destinations and gate cleanup passed');
