// Execute production callbacks with deferred services. No account, network or native calls.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const hookPath = 'apps/mobile/src/state/useWeatherOnAppState.ts';
const providerPath = 'apps/mobile/src/providers/accountAuth.ts';
const parse = path => ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
const hook = parse(hookPath), provider = parse(providerPath);
const compile = code => ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function find(ast, predicate) {
  let found;
  function visit(node) { if (predicate(node)) found = node; ts.forEachChild(node, visit); }
  visit(ast); assert.ok(found, 'Production callback must exist'); return found;
}
function callback(name, bindings) {
  let node = find(hook, n => ts.isVariableDeclaration(n) && n.name.getText(hook) === name).initializer;
  if (ts.isCallExpression(node)) node = node.arguments[0];
  return evaluate(node.getText(hook), bindings);
}
function evaluate(code, bindings) {
  return new Function(...Object.keys(bindings), compile(`const run = ${code};`) + '\nreturn run;')(...Object.values(bindings));
}
function restoreEffect(bindings) {
  const node = find(hook, n => ts.isCallExpression(n) && n.expression.getText(hook) === 'useEffect' && n.arguments[0].getText(hook).includes('void restoreAccountSession('));
  return evaluate(node.arguments[0].getText(hook), bindings)();
}
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return {promise,resolve,reject}; };
const tick = () => new Promise(setImmediate);
class AccountAuthError extends Error { constructor(code) { super(code); this.code=code; } }
function harness() {
  const state = {AccountLinked:true,AccountProfile:{userId:'old',provider:'apple'},AccountAuthStatus:'ready',Route:'A2'};
  const events=[];
  const context = {
    appStateHydrated:true, accountActionRevisionRef:{current:0}, accountSessionRevisionRef:{current:0},accountSessionReadyRef:{current:true},accountCleanupPendingRef:{current:false},readPendingAccountDeletion:async()=>null,writePendingAccountDeletion:async()=>{},
    accountActionInFlightRef:{current:false}, accountDataClearingRef:{current:false}, accountDeletionCompletedRef:{current:false}, locallyRestoredAccountLinkedRef:{current:true},
    photoSaveInFlightRef:{current:null}, outfitSaveInFlightRef:{current:null},
    persistedStateRef:{current:{accountLinked:true,photoWardrobeItems:[],wardrobeOwnedItemIds:[],savedDestinations:[],onboardingProgress:{}}}, presetWardrobe:[],
    createClearedAccountState:value=>({...value,accountLinked:false,savedOutfitSnapshot:null,photoWardrobeItems:[],wardrobeOwnedItemIds:[],savedDestinations:[]}),
    savePersistedAppState:async()=>{},
    getSavedOutfitPhotoUris:()=>[], removePersistedWardrobePhotos:()=>{}, updateSavedDestinations:()=>{},
    gate:{reason:'save-outfit',returnTo:'C4'}, accountProfile:state.AccountProfile,
    AccountAuthError, isAccountAuthCancellation:()=>false, getAccountAuthDisplayMessage:e=>e.message,
    completeAccountAction:async()=>true, signOutAccountSession:async()=>{}, deleteAccountSession:async()=>{}, clearLocalAccountSession:async()=>{},
  };
  for (const key of ['AccountLinked','AccountProfile','TermsRequiredAccepted','AccountAuthStatus','AccountAuthMessage','Route','Gate','OutfitSaved','OutfitSaveMessage','SavedOutfitSnapshot','RecentlyRemovedDestination','WardrobeOwnedItemIds','PhotoWardrobeItems','SelectedWardrobeItemId','RecentlyRemovedWardrobeItemId','AccountGateResult','OnboardingProgress','DestinationSelectionReady','SelectedDestinationPlace','DepartureActivityIntentDestinationId','CommittedDepartureDestinationId','DepartureActivityReplacementDestinationId']) {
    context['set'+key]=value=>{state[key]=typeof value==='function'?value(state[key]??[]):value;events.push([key,state[key]]);};
  }
  context.clearLinkedAccountState=callback('clearLinkedAccountState',context);
  return {state,events,context,run:name=>callback(name,context)};
}
const profile={userId:'restored',provider:'apple',termsAccepted:true};
let count=0;
for(const action of ['signOutAccount','deleteAccount']) for(const status of ['authenticated','signed-out','offline']) for(const timing of ['during','after']) {
  const h=harness(), response=deferred(), operation=deferred();
  h.context.restoreAccountSession=()=>response.promise;
  h.context[action==='signOutAccount'?'signOutAccountSession':'deleteAccountSession']=()=>operation.promise;
  const cleanup=restoreEffect(h.context);
  const pending=h.run(action)(); await tick();
  assert.equal(h.context.accountSessionRevisionRef.current,1,'action invalidates restore before awaiting');
  if(timing==='after') {operation.resolve(); await pending;}
  const before=h.events.length;
  response.resolve({status,account:status==='authenticated'?profile:null}); await tick();
  assert.equal(h.events.length,before,`${action}: late ${status} restore cannot change UI ${timing} action`);
  operation.resolve(); await pending;
  assert.equal(h.state.AccountLinked,false); assert.equal(h.state.AccountAuthStatus,'idle');
  cleanup(); count++;
}
// Stale successes, failures and finally blocks cannot alter a newer operation.
for(const oldAction of ['signInWithProvider','completeTerms','deleteAccount','signOutAccount']) for(const outcome of ['resolve','reject']) {
  const h=harness(), old=deferred(), newer=deferred();
  const service={signInWithProvider:'signInWithAppleAccount',completeTerms:'acceptAccountTerms',deleteAccount:'deleteAccountSession',signOutAccount:'signOutAccountSession'}[oldAction];
  h.context[service]=()=>old.promise;
  const first=h.run(oldAction)('apple'); await tick();
  h.context.signOutAccountSession=()=>newer.promise;
  const second=h.run('signOutAccount')(); await tick();
  const before=h.events.length;
  if(outcome==='resolve')old.resolve(oldAction==='completeTerms'?profile:{account:profile}); else old.reject(new Error('stale failure'));
  await first.catch(()=>{});
  assert.equal(h.events.length,before,`${oldAction} stale ${outcome} cannot mutate newer logout`);
  assert.equal(h.context.accountActionInFlightRef.current,true,'old finally cannot unlock newer operation');
  newer.resolve(); await second;
  assert.equal(h.context.accountActionInFlightRef.current,false); count++;
}
for(const action of ['signOutAccount','deleteAccount']) {
  const h=harness(), photo=deferred(), outfit=deferred();
  h.context.photoSaveInFlightRef.current=photo.promise;
  h.context.outfitSaveInFlightRef.current=outfit.promise;
  const pending=h.run(action)(); await tick(); photo.resolve(); await tick();
  h.context.accountSessionRevisionRef.current++;
  const before=h.events.length; outfit.resolve(); await pending;
  assert.equal(h.events.length,before,'clear after disk writes must not clear a newer account'); count++;
}
for(const action of ['signInWithProvider','completeTerms']) for(const cancel of ['cancelAccountGate','goBack']) {
  const h=harness(), auth=deferred();
  h.context.signInWithAppleAccount=()=>auth.promise; h.context.acceptAccountTerms=()=>auth.promise;
  h.context.route='A2';h.context.backRoute='C4';
  let completions=0;h.context.completeAccountAction=async()=>{completions++;return true;};
  const pending=h.run(action)('apple'); h.run(cancel)();
  auth.resolve(action==='completeTerms'?profile:{account:profile}); await pending;
  assert.deepEqual(h.state.AccountProfile,profile,'leaving gate preserves successful authentication');
  assert.equal(h.state.Route,'C4');assert.equal(completions,0); count++;
}
for(const action of ['signInWithProvider','completeTerms']) {
  const h=harness(), save=deferred();
  h.context.signInWithAppleAccount=async()=>({account:profile});h.context.acceptAccountTerms=async()=>profile;
  h.context.completeAccountAction=()=>save.promise;
  const pending=h.run(action)('apple');await tick();
  assert.equal(h.context.accountActionInFlightRef.current,true,'action owns lock through async completion');
  h.run('cancelAccountGate')();save.resolve(true);await pending;
  assert.equal(h.state.Route,'C4');assert.equal(h.state.Gate,null);count++;
}
for(const action of ['signInWithProvider','completeTerms','deleteAccount','signOutAccount']) {
  const h=harness(),response=deferred();
  const service={signInWithProvider:'signInWithAppleAccount',completeTerms:'acceptAccountTerms',deleteAccount:'deleteAccountSession',signOutAccount:'signOutAccountSession'}[action];
  h.context[service]=()=>response.promise;
  const node=find(hook,n=>ts.isCallExpression(n)&&n.expression.getText(hook)==='useEffect'&&n.arguments[0].getText(hook).includes('accountSessionRevisionRef.current += 1')&&!n.arguments[0].getText(hook).includes('restoreAccountSession'));
  const cleanup=evaluate(node.arguments[0].getText(hook),h.context)();
  const pending=h.run(action)('apple');cleanup();const before=h.events.length;
  response.resolve(action==='completeTerms'?profile:{account:profile});await pending;
  assert.equal(h.events.length,before,'unmounted account callbacks cannot update UI');count++;
}
for(const action of ['signInWithProvider','completeTerms']) {
  const h=harness();h.context.signInWithAppleAccount=async()=>({account:profile});h.context.acceptAccountTerms=async()=>profile;
  h.context.completeAccountAction=async()=>false;
  await h.run(action)('apple');
  assert.equal(h.state.Route,'A2');assert.ok(!h.events.some(([key])=>key==='Gate'),'failed persistence keeps gate available for retry');
  assert.equal(h.context.accountActionInFlightRef.current,false);count++;
}
// Test production provider functions and its mutation queue with inert storage.
function providerHarness(rememberWait, durable = { deletion: null, token: "old", identity: "old" }) {
  let token=durable.token, identity=durable.identity; const events=[]; const failures={token:false,identity:false,deleted:false,intent:false,confirmation:false,clear:false,read:false}; const response=deferred();
  const bindings={
    readPendingAccountDeletion:async()=>{if(failures.read)throw new Error('marker unreadable');return durable.deletion;},
    writePendingAccountDeletion:async value=>{if(value==='requested'&&failures.intentWait)await failures.intentWait;if(value==='requested'&&failures.intent||value==='server-deleted'&&failures.confirmation||value===null&&failures.clear)throw new Error('marker write failed');durable.deletion=value;},
    readSessionToken:async()=>token, requireStoredSessionToken:async()=>token,
    accountRequest:async path=>{if(path==='/auth/session')return response.promise;if(path==='/account/delete'){events.push('server-delete');return failures.deleteWait??{deleted:!failures.deleted};}return {};},
    deleteSessionToken:async()=>{events.push('delete');if(failures.token)throw new Error('secure store failed');token=null;durable.token=null;},
    forgetIntegrityUser:async()=>{events.push('forget');if(failures.identity)throw new Error('identity store failed');identity=null;durable.identity=null;},
    writeSessionToken:async value=>{events.push('write');token=value;durable.token=value;},
    rememberIntegrityUser:async value=>{events.push('remember');if(rememberWait)await rememberWait;identity=value;durable.identity=value;},
    ensureAppAttestEnrollment:async()=>{events.push('enroll');},
    normalizeAccountError:error=>error, AccountAuthError,
  };
  const names=['mutateSession','restoreAccountSession','persistAuthenticatedSession','signOutAccountSession','clearLocalAccountSession','deleteAccountSession'];
  const code=names.map(name=>find(provider,n=>ts.isFunctionDeclaration(n)&&n.name?.text===name).getText(provider).replace(/^export /,'')).join('\n');
  const api=new Function(...Object.keys(bindings),compile('let sessionMutationTail = Promise.resolve();\n'+code)+`\nreturn {${names.join(',')}};`)(...Object.values(bindings));
  return {api,response,events,bindings,failures,durable,get token(){return token;},get identity(){return identity;}};
}
for(const outcome of ['success','401','offline']) {
  const h=providerHarness();let current=true;
  const pending=h.api.restoreAccountSession(()=>current);await tick();current=false;
  if(outcome==='success')h.response.resolve({account:profile,expiresAt:'later'});else h.response.reject({status:outcome==='401'?401:0});
  await pending;assert.deepEqual(h.events,[],'invalidated restore cannot remember/enroll/delete/forget');assert.equal(h.token,'old');count++;
}
for(const outcome of ['success','401','offline']) {
  const h=providerHarness();const pending=h.api.restoreAccountSession();await tick();
  if(outcome==='success')h.response.resolve({account:profile,expiresAt:'later'});else h.response.reject({status:outcome==='401'?401:0});
  const result=await pending;
  assert.equal(result.status,{success:'authenticated',401:'signed-out',offline:'offline'}[outcome]);
  assert.deepEqual(h.events,{success:['remember','enroll'],401:['delete','forget'],offline:[]}[outcome]);count++;
}
{
  const h=providerHarness();let current=true;
  const blocker=deferred();const first=h.api.mutateSession(()=>true,()=>blocker.promise);
  const persist=h.api.persistAuthenticatedSession({account:profile,sessionToken:'new'},undefined,()=>current);
  current=false;const logout=h.api.signOutAccountSession();blocker.resolve();await Promise.all([first,persist,logout]);
  assert.equal(h.token,null);assert.equal(h.identity,null);assert.ok(!h.events.includes('write'));count++;
}
// An in-progress native identity write is not abortable. Logout must run after it.
{
  const write=deferred(),h=providerHarness(write.promise);let current=true;
  const restore=h.api.restoreAccountSession(()=>current);
  h.response.resolve({account:profile,expiresAt:'later'});await tick();
  assert.deepEqual(h.events,['remember']);current=false;
  const logout=h.api.signOutAccountSession();await tick();
  assert.deepEqual(h.events,['remember'],'logout cleanup waits behind started identity write');
  write.resolve();await Promise.all([restore,logout]);
  assert.equal(h.token,null);assert.equal(h.identity,null);assert.ok(!h.events.includes('enroll'));count++;
}
for(const outcome of ['resolve','reject']) {
  const h=harness(),reauth=deferred(),logout=deferred();
  h.context.deleteAccountSession=async()=>{throw new AccountAuthError('recent_auth_required');};
  h.context.signInWithAppleAccount=()=>reauth.promise;
  const pending=h.run('deleteAccount')();await tick();
  h.context.signOutAccountSession=()=>logout.promise;
  const next=h.run('signOutAccount')();await tick();const before=h.events.length;
  if(outcome==='resolve')reauth.resolve({account:profile});else reauth.reject(new Error('late reauth'));
  await pending;assert.equal(h.events.length,before);assert.equal(h.context.accountActionInFlightRef.current,true);
  logout.resolve();await next;count++;
}
for(const action of ['signInWithProvider','completeTerms']) {
  const h=harness(),auth=deferred();h.context.restoreAccountSession=()=>auth.promise;
  h.context.signInWithAppleAccount=async()=>({account:profile});h.context.acceptAccountTerms=async()=>profile;
  const cleanup=restoreEffect(h.context);await h.run(action)('apple');const before=h.events.length;
  auth.resolve({status:'signed-out',account:null});await tick();assert.equal(h.events.length,before);cleanup();count++;
}
// A missing/expired session clears only account-owned content, not guest data.
for (const status of ['signed-out','authenticated','offline']) {
  const h=harness();
  h.state.SavedOutfitSnapshot={savedAt:'original'};h.state.PhotoWardrobeItems=[{id:'photo-1'}];h.state.WardrobeOwnedItemIds=['preset-1','photo-1'];
  h.context.presetWardrobe=[{id:'preset-1'}];
  h.context.restoreAccountSession=async()=>({status,account:status==='authenticated'?profile:null});
  const cleanup=restoreEffect(h.context);await tick();
  if(status==='signed-out') {
    assert.equal(h.state.AccountLinked,false);assert.equal(h.state.SavedOutfitSnapshot,null);
    assert.deepEqual(h.state.PhotoWardrobeItems,[]);assert.deepEqual(h.state.WardrobeOwnedItemIds,['preset-1']);
  } else {
    assert.deepEqual(h.state.SavedOutfitSnapshot,{savedAt:'original'});assert.deepEqual(h.state.PhotoWardrobeItems,[{id:'photo-1'}]);
  }
  assert.equal(h.events.some(([name])=>['SelectedDestinationPlace','DepartureActivityIntentDestinationId'].includes(name)),false,'session expiry must not clear guest destinations');
  cleanup();count++;
}
{
  const h=harness(),write=deferred();let signedOut=false;
  h.context.savePersistedAppState=()=>write.promise;
  h.context.clearLinkedAccountState=callback('clearLinkedAccountState',h.context);
  h.context.signOutAccountSession=async()=>{signedOut=true;};
  const pending=h.run('signOutAccount')();await tick();
  assert.equal(signedOut,false);assert.equal(h.state.AccountLinked,true);
  assert.equal(h.context.accountDataClearingRef.current,true);
  write.reject(new Error('disk full'));await pending;
  assert.equal(signedOut,false);assert.equal(h.state.AccountLinked,true);assert.equal(h.state.AccountAuthStatus,'error');
  assert.equal(h.state.Route,'A2');assert.equal(h.context.accountDataClearingRef.current,false);count++;
}
{
  const h=harness();let fail=true,serverDeletes=0;
  h.context.savePersistedAppState=async()=>{if(fail)throw new Error('disk full');};
  h.context.clearLinkedAccountState=callback('clearLinkedAccountState',h.context);
  h.context.deleteAccountSession=async()=>{serverDeletes++;};
  await h.run('deleteAccount')();
  assert.equal(serverDeletes,1);assert.equal(h.state.AccountAuthStatus,'error');assert.equal(h.state.Route,'A2');
  assert.equal(h.context.accountDeletionCompletedRef.current,true);
  fail=false;await h.run('deleteAccount')();
  assert.equal(serverDeletes,1,'retrying local cleanup must not delete the server account twice');
  assert.equal(h.state.AccountLinked,false);assert.equal(h.state.Route,'M1');
  h.context.signInWithAppleAccount=async()=>({account:profile});
  await h.run('signInWithProvider')('apple');
  assert.equal(h.state.AccountLinked,true);assert.equal(h.context.accountDeletionCompletedRef.current,false,'a new login is not stuck in the old deletion state');count++;
}
{
  const h=harness();h.context.signOutAccountSession=async()=>{throw new Error('secure storage unavailable');};
  await h.run('signOutAccount')();
  assert.equal(h.state.AccountAuthStatus,'error');assert.equal(h.state.Route,'A2');assert.equal(h.state.SavedOutfitSnapshot,null);
  h.context.signOutAccountSession=async()=>{};await h.run('signOutAccount')();
  assert.equal(h.state.AccountAuthStatus,'idle');assert.equal(h.state.Route,'M1');count++;
}
{
  let writes=0;
  const bindings={appStateHydrated:true,accountAuthStatus:'ready',accountDataClearingRef:{current:true},photoSaveInFlightRef:{current:null},outfitSaveInFlightRef:{current:null},persistedStateRef:{current:{}},savePersistedAppState:async()=>{writes++;}};
  const node=find(hook,n=>ts.isCallExpression(n)&&n.expression.getText(hook)==='useEffect'&&n.arguments[0].getText(hook).includes('void savePersistedAppState('));
  const persist=()=>evaluate(node.arguments[0].getText(hook),bindings)();
  persist();assert.equal(writes,0,'background autosave cannot overwrite account cleanup with old React state');
  bindings.accountDataClearingRef.current=false;bindings.accountAuthStatus='restoring';persist();assert.equal(writes,0);
  bindings.accountAuthStatus='idle';persist();assert.equal(writes,1,'persistence resumes after cleanup/session reconciliation');count++;
}
// Compose the real provider and hook: server deletion is irreversible even when
// either secure-store cleanup fails afterwards. Retrying must be local only.
for (const failedStore of ['token','identity']) {
  const h=harness(),provider=providerHarness();provider.failures[failedStore]=true;
  h.context.deleteAccountSession=provider.api.deleteAccountSession;
  h.context.clearLocalAccountSession=provider.api.clearLocalAccountSession;
  h.context.readPendingAccountDeletion=provider.bindings.readPendingAccountDeletion;h.context.writePendingAccountDeletion=provider.bindings.writePendingAccountDeletion;
  await h.run('deleteAccount')();
  assert.equal(provider.events.filter(event=>event==='server-delete').length,1);
  assert.equal(h.context.accountDeletionCompletedRef.current,true,'server acknowledgement survives a later secure-store failure');
  assert.equal(h.state.AccountAuthStatus,'error');assert.equal(h.state.Route,'A2');
  assert.equal(h.context.accountSessionReadyRef.current,false,'deleted account data cannot be shown while cleanup is pending');
  assert.ok(provider.events.includes('delete')&&provider.events.includes('forget'),'both independent stores are attempted');
  provider.failures[failedStore]=false;
  await h.run('deleteAccount')();
  assert.equal(provider.events.filter(event=>event==='server-delete').length,1,'cleanup retry never repeats irreversible server deletion');
  assert.equal(provider.token,null);assert.equal(provider.identity,null);
  assert.equal(h.state.AccountLinked,false);assert.equal(h.state.AccountAuthStatus,'idle');assert.equal(h.state.Route,'M1');count++;
}
{
  const provider=providerHarness();provider.failures.deleted=true;let acknowledged=false;
  await assert.rejects(provider.api.deleteAccountSession(()=>true,()=>{acknowledged=true;}));
  assert.equal(acknowledged,false);assert.equal(provider.token,'old');assert.equal(provider.identity,'old');count++;
}
function attachProvider(h, p) {
  h.context.deleteAccountSession=p.api.deleteAccountSession;
  h.context.clearLocalAccountSession=p.api.clearLocalAccountSession;
  h.context.readPendingAccountDeletion=p.bindings.readPendingAccountDeletion;
  h.context.writePendingAccountDeletion=p.bindings.writePendingAccountDeletion;
  h.context.restoreAccountSession=p.api.restoreAccountSession;
}
for (const failedStore of ['token','identity']) {
  const first=harness(),p=providerHarness();attachProvider(first,p);p.failures[failedStore]=true;
  await first.run('deleteAccount')();
  assert.equal(p.durable.deletion,'server-deleted');
  assert.equal(p.events.filter(event=>event==='server-delete').length,1);
  // Fresh provider and hook represent a terminated process. Network never
  // resolves, but the durable guard wins before an offline session fallback.
  const restarted=harness(),p2=providerHarness(undefined,p.durable);attachProvider(restarted,p2);
  const cleanup=restoreEffect(restarted.context);await tick();
  assert.equal(restarted.state.AccountAuthStatus,'error');assert.equal(restarted.state.Route,'A4');
  assert.equal(restarted.context.accountSessionReadyRef.current,false);
  assert.equal(restarted.context.accountCleanupPendingRef.current,true);
  assert.equal(restarted.context.accountDeletionCompletedRef.current,true);
  assert.deepEqual(p2.events,[],'offline restore performs no credential/network mutation before displaying cleanup');
  await restarted.run('deleteAccount')();
  assert.equal(p2.events.includes('server-delete'),false,'confirmed restart retries local cleanup only');
  assert.equal(p2.token,null);assert.equal(p2.identity,null);assert.equal(p2.durable.deletion,null);
  assert.equal(restarted.state.Route,'M1');cleanup();count++;
}
{
  const h=harness(),p=providerHarness();attachProvider(h,p);p.failures.intent=true;
  await h.run('deleteAccount')();
  assert.equal(p.events.includes('server-delete'),false,'intent write failure stops before the irreversible request');
  assert.equal(p.token,'old');assert.equal(p.identity,'old');assert.equal(p.durable.deletion,null);
  assert.equal(h.state.AccountLinked,true);assert.equal(h.context.accountSessionReadyRef.current,true);
  assert.equal(h.state.AccountAuthStatus,'error');
  p.failures.intent=false;await h.run('deleteAccount')();
  assert.equal(p.events.filter(event=>event==='server-delete').length,1);assert.equal(p.durable.deletion,null);count++;
}
{
  const first=harness(),p=providerHarness();attachProvider(first,p);p.failures.confirmation=true;
  await first.run('deleteAccount')();
  assert.equal(p.durable.deletion,'requested');assert.equal(p.token,'old');
  assert.equal(first.context.accountDeletionCompletedRef.current,true,'live acknowledgement is retained despite confirmation-write failure');
  const restarted=harness(),p2=providerHarness(undefined,p.durable);attachProvider(restarted,p2);
  const cleanup=restoreEffect(restarted.context);await tick();
  assert.equal(restarted.context.accountSessionReadyRef.current,false);
  assert.equal(restarted.context.accountCleanupPendingRef.current,true);
  assert.equal(restarted.context.accountDeletionCompletedRef.current,false,'restart cannot invent a lost server acknowledgement');
  p2.response.reject(Object.assign(new Error('offline'),{status:0}));
  await restarted.run('deleteAccount')();
  assert.equal(p2.events.includes('server-delete'),false,'uncertain offline outcome never blindly repeats deletion');
  assert.equal(p2.durable.deletion,'requested');assert.equal(restarted.state.AccountAuthStatus,'error');
  assert.equal(restarted.state.Route,'A4');cleanup();count++;
}
{
  const p=providerHarness();p.durable.deletion='server-deleted';p.failures.read=true;
  const h=harness();attachProvider(h,p);const cleanup=restoreEffect(h.context);await tick();
  assert.equal(h.context.accountSessionReadyRef.current,false);assert.equal(h.context.accountCleanupPendingRef.current,true);
  assert.equal(h.state.AccountAuthStatus,'error');assert.deepEqual(p.events,[],'unreadable guard cannot fall back to cached private data');
  p.failures.read=false;await h.run('deleteAccount')();
  assert.equal(p.events.includes('server-delete'),false);assert.equal(p.durable.deletion,null);cleanup();count++;
}
{
  const p=providerHarness(),h=harness();attachProvider(h,p);p.failures.clear=true;
  await h.run('deleteAccount')();
  assert.equal(p.durable.deletion,'server-deleted');assert.equal(h.state.AccountAuthStatus,'error');
  assert.equal(h.state.SavedOutfitSnapshot,null);assert.equal(h.state.Route,'A2','no completion before final durable guard removal');
  const p2=providerHarness(undefined,p.durable),retry=harness();attachProvider(retry,p2);
  const cleanup=restoreEffect(retry.context);await tick();await retry.run('deleteAccount')();
  assert.equal(p2.events.includes('server-delete'),false);assert.equal(p2.durable.deletion,null);assert.equal(retry.state.Route,'M1');cleanup();count++;
}
{
  const p=providerHarness(),write=deferred();p.failures.intentWait=write.promise;let current=true;
  const deleting=p.api.deleteAccountSession(()=>current);await tick();current=false;write.resolve();await deleting;
  assert.equal(p.events.includes('server-delete'),false);assert.equal(p.durable.deletion,null,'cancellation before the request leaves no ambiguous marker');count++;
}
{
  const p=providerHarness(),response=deferred();p.failures.deleteWait=response.promise;let current=true,notified=false;
  const deleting=p.api.deleteAccountSession(()=>current,()=>{notified=true;});await tick();
  assert.equal(p.durable.deletion,'requested');current=false;response.resolve({deleted:true});await deleting;
  assert.equal(notified,false,'stale acknowledgements never change newer UI');
  assert.equal(p.durable.deletion,'server-deleted','the already-executed server result remains durable across supersession');
  assert.equal(p.token,'old');assert.equal(p.identity,'old','stale completion cannot clear newer credentials');count++;
}
console.log(`PASS account lifecycle: ${count} deterministic production-source deferred cases; durable deletion intent/acknowledgement, offline process restart, failed writes/retries, restore, durable logout/delete retry, guest data preservation, stale completion/errors/locks, gate cancellation, async saves and provider mutation ordering.`);
