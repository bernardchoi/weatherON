import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { normalizeDeparturePush, getApnsProviderToken, sendDepartureEndPush, DepartureEndScheduler, handleDeparturePushRoute } from '../apps/server/src/departurePushCore.mjs';
const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const env = { APNS_PRIVATE_KEY: privateKey.export({ type: 'pkcs8', format: 'pem' }), APNS_KEY_ID: 'ABCDEFGHIJ', APPLE_TEAM_IDENTIFIER: 'KLMNOPQRST', DEPARTURE_PUSH_RATE_LIMITER: { limit: async () => ({ success: true }) } };
const now = Date.now();
const input = { activityId: 'activity-1', pushToken: 'ab'.repeat(32), departureAt: new Date(now + 60000).toISOString(), bundleId: 'com.weatheron.mobile', pushEnvironment: 'production' };
const job = normalizeDeparturePush(input, env, now);
assert.ok(job);
for (const bad of [{ pushToken: 'bad' }, { bundleId: 'other.app' }, { departureAt: 'bad' }, { departureAt: new Date(now+66*60000).toISOString() }, { pushEnvironment: 'other' }]) assert.equal(normalizeDeparturePush({ ...input, ...bad }, env, now), null);
const jwt = getApnsProviderToken(env, now).split('.');
assert.deepEqual(JSON.parse(Buffer.from(jwt[0], 'base64url')), { alg: 'ES256', kid: env.APNS_KEY_ID });
assert.equal(verify('sha256', Buffer.from(jwt.slice(0,2).join('.')), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(jwt[2], 'base64url')), true);
await sendDepartureEndPush(job, env, async (url, options) => {
  assert.ok(url.startsWith('https://api.push.apple.com/3/device/'));
  assert.equal(options.headers['apns-topic'], 'com.weatheron.mobile.push-type.liveactivity');
  assert.equal(options.headers['apns-push-type'], 'liveactivity');
  const aps = JSON.parse(options.body).aps;
  assert.equal(aps.event, 'end');
  assert.equal(aps['content-state'].isCompleted, true);
  assert.ok(aps['dismissal-date'] < job.departureMs/1000);
  return new Response(null, { status: 200 });
});
const values = new Map();
let alarm;
const storage = { get: async k => values.get(k), put: async (k,v) => values.set(k,v), delete: async k => values.delete(k), deleteAll: async () => values.clear(), setAlarm: async time => { alarm=time; }, deleteAlarm: async () => { alarm=undefined; }, transaction: async callback => callback(storage) };
const scheduler = new DepartureEndScheduler({ storage }, env);
await scheduler.fetch(new Request('https://internal', {method:'POST',body:JSON.stringify(job)}));
const originalFetch = globalThis.fetch;
let sends=0;
try {
  globalThis.fetch = async () => { sends++; return new Response(null,{status:200}); };
  await scheduler.alarm(); assert.equal(sends,0); assert.equal(alarm,job.departureMs);
  values.set('job',{...job,departureMs:now-1000});
  globalThis.fetch = async () => { sends++; return new Response(null,{status:503}); };
  await scheduler.alarm(); assert.ok(values.has('job')); assert.ok(alarm>now);
  globalThis.fetch = async () => {
    await scheduler.fetch(new Request('https://internal',{method:'POST',body:JSON.stringify({...job,pushToken:'cd'.repeat(32),departureMs:now-1000})}));
    return new Response(null,{status:200});
  };
  await scheduler.alarm(); assert.equal(values.get('job').pushToken,'cd'.repeat(32));
  globalThis.fetch = async () => new Response(null,{status:410});
  await scheduler.alarm(); assert.equal(values.size,0); assert.equal(alarm,undefined);
} finally { globalThis.fetch=originalFetch; }
let integrityChecked=false;
env.DEPARTURE_END={idFromName: name=>name,get: name=>({fetch: async request=>{assert.equal(name,'user-1:activity-1');return scheduler.fetch(request);}})};
const dependencies={requireSession:async()=>({user_id:'user-1'}),verifyAppIntegrityRequest:async()=>{integrityChecked=true;}};
const request = body => new Request('https://server/live-activities/departure',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
assert.equal((await handleDeparturePushRoute(request(input),env,dependencies)).payload.scheduled,true);
assert.equal(integrityChecked,true);
assert.equal((await handleDeparturePushRoute(request(input),env,{...dependencies,requireSession:async()=>{throw {status:401};}})).status,401);
assert.equal((await handleDeparturePushRoute(request({large:'x'.repeat(5000)}),env,dependencies)).status,413);
console.log('Departure push: validation, auth, JWT, payload, alarm retry and token rotation passed');

// Run the actual iOS registration bridge with native/auth boundaries replaced.
const { readFileSync } = await import('node:fs');
const ts = (await import('typescript')).default;
const compile = path => ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const shared = {};
new Function('exports',compile('apps/mobile/src/providers/departureLiveActivity.shared.ts'))(shared);
let nativeStatus={supported:true,enabled:true,active:true,...input};
let listener;
let requests=0;
let fail=true;
const bridge={};
new Function('exports','require',compile('apps/mobile/src/providers/departureLiveActivity.ios.ts'))(bridge,name=>{
  if(name==='./departureLiveActivity.shared')return shared;
  if(name==='./accountAuth')return {requestAuthenticatedAccountJson:async(path,body)=>{
    requests++; assert.equal(path,'/live-activities/departure');assert.equal(body.pushToken,nativeStatus.pushToken);assert.equal(body.method,undefined);
    if(fail)throw Error('offline');return {scheduled:true};
  }};
  return {__esModule:true,default:{addListener:(_,callback)=>{listener=callback;},getDepartureActivityStatus:async()=>JSON.stringify(nativeStatus)}};
});
assert.equal((await bridge.getDepartureLiveActivityStatus()).automaticEndScheduled,false);
fail=false;
assert.equal((await bridge.getDepartureLiveActivityStatus()).automaticEndScheduled,true);
await bridge.getDepartureLiveActivityStatus();assert.equal(requests,2);
nativeStatus={...nativeStatus,pushToken:'ef'.repeat(32)};
listener({status:JSON.stringify(nativeStatus)});
assert.equal((await bridge.getDepartureLiveActivityStatus()).automaticEndScheduled,true);
assert.equal(requests,3);
console.log('iOS registration: actual request body, retry, deduplication and token event passed');

env.APNS_SANDBOX_KEY_ID = 'SANDBOXKEY';
env.APNS_SANDBOX_PRIVATE_KEY = env.APNS_PRIVATE_KEY;
await sendDepartureEndPush({ ...job, pushEnvironment: 'sandbox' }, env, async (url, options) => {
  assert.ok(url.startsWith('https://api.sandbox.push.apple.com/'));
  const token = options.headers.authorization.slice(7);
  assert.equal(JSON.parse(Buffer.from(token.split('.')[0], 'base64url')).kid, 'SANDBOXKEY');
  return new Response(null, { status: 200 });
});
assert.equal(JSON.parse(Buffer.from(getApnsProviderToken(env).split('.')[0], 'base64url')).kid, env.APNS_KEY_ID);
console.log('Sandbox and production keys stay separate');
