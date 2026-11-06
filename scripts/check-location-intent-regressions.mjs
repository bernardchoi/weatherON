import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';

const hook = stripTypeScriptTypes(readFileSync('apps/mobile/src/state/useWeatherOnAppState.ts', 'utf8'));
function section(from, to) {
  const start = hook.indexOf(from);
  const end = hook.indexOf(to, start);
  assert.ok(start >= 0 && end > start, `production section exists: ${from}`);
  return hook.slice(start, end);
}
const core = section('  const invalidateLocationRequest =', '\n  useEffect(() => {\n    let active = true;');
const actions = section('  const setLocationMode =', '\n  const requestOnboardingNotificationPermission');
const gate = section('  const completePermissionGate =', '\n  const cancelAccountGate');
const startup = section('  useEffect(() => {\n    if (!appStateHydrated || weatherLocationMode !== "auto")', '\n  const resetPlaceSearch');
const navigation = section('  const navigate =', '\n  const returnFromDestinationAdd');
const back = section('  const goBack =', '\n  const canGoBack');
const openGate = section('  const requestPermissionGate =', '\n  const openPolicyDocument');
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const granted = id => ({ status: 'granted', message: 'ok', location: { id } });
function harness({ reason = 'location', cachedLocation = null } = {}) {
  const updates = [], cleanup = [], explicit = [], sync = [];
  let deviceLocationState = { status: 'idle', message: 'check' };
  const refs = Object.fromEntries(Object.entries({
    locationIntentRevisionRef: 0, deviceLocationRequestSequenceRef: 0,
    deviceLocationRequestInFlightRef: null, weatherLocationModeRef: 'auto', locationMountedRef: false,
  }).map(([name, current]) => [name, { current }]));
  const names = ['WeatherLocationMode', 'DeviceLocationState', 'LocationReady', 'DeviceWeatherLocation',
    'UseDestinationWeather', 'WeatherRefreshTick', 'WeatherProviderMode', 'ManualWeatherLocation',
    'OnboardingProgress', 'PermissionGateResult', 'Route', 'PermissionGate', 'AlertSettingsRouteState'];
  const bindings = { ...refs, useCallback: fn => fn, useEffect: fn => { const end = fn(); if (end) cleanup.push(end); },
    ...Object.fromEntries(names.map(name => ['set' + name, value => updates.push([name, value])])),
    initialDeviceLocationState: deviceLocationState,
    setDeviceLocationState: value => {
      deviceLocationState = typeof value === 'function' ? value(deviceLocationState) : value;
      updates.push(['DeviceLocationState', deviceLocationState]);
    },
    requestDeviceWeatherLocation: () => { const d = deferred(); explicit.push(d); return d.promise; },
    syncDeviceWeatherLocationPermission: () => { const d = deferred(); sync.push(d); return d.promise; },
    createWeatherLocationFromPlace: place => place,
    permissionReady: false, locationReady: Boolean(cachedLocation), deviceWeatherLocation: cachedLocation,
    permissionGate: { reason, returnTo: 'H1' },
    route: 'O3', backRoute: 'H1', selectedDestinationPlace: { name: 'place' },
    isP0Route: () => false, isOverlayReturnRouteId: () => false, isLaunchHiddenRoute: () => false,
    createPermissionGateState: (...args) => args,
    createPermissionGateResult: () => 'success', createPermissionGateSkipResult: () => 'skipped',
  };
  const functions = new Function(...Object.keys(bindings), `${core}\n${actions}\n${gate}\n${navigation}\n${back}\n${openGate}\nreturn {
    recordLocationIntent, invalidateLocationRequest, resolveLocationRequest, reconcileDeviceLocationPermission,
    setLocationMode, selectWeatherLocation, applyCurrentLocationWeather, requestCurrentLocation,
    completePermissionGate, skipPermissionGate, navigate, goBack, requestPermissionGate,
    startup: () => { const appStateHydrated = true; const weatherLocationMode = weatherLocationModeRef.current; ${startup} }
  };`)(...Object.values(bindings));
  return { ...functions, ...refs, explicit, sync, updates, get deviceLocationState() { return deviceLocationState; }, unmount: () => cleanup.forEach(fn => fn()) };
}
function noCompletionUpdates(h, before) { assert.deepEqual(h.updates.slice(before), [], 'stale completion must be inert'); }

for (const completion of ['granted', 'denied', 'error', 'throw']) {
  const h = harness();
  const pending = h.applyCurrentLocationWeather('requesting');
  h.selectWeatherLocation({ id: 'manual' });
  assert.equal(h.deviceLocationState.status, 'idle', 'manual selection releases the requesting UI immediately');
  const before = h.updates.length;
  if (completion === 'throw') h.explicit[0].reject(new Error('late failure'));
  else h.explicit[0].resolve(completion === 'granted' ? granted('old') : { status: completion });
  assert.equal(await pending, null);
  noCompletionUpdates(h, before);
  assert.equal(h.weatherLocationModeRef.current, 'manual');
}
console.log('Location: manual choice rejects late GPS success, denial, error and rejection');

{
  const h = harness();
  const old = h.completePermissionGate();
  assert.equal(h.deviceLocationState.status, 'requesting');
  h.goBack();
  assert.equal(h.deviceLocationState.status, 'idle', 'Back leaves location permission controls usable');
  const retry = h.requestCurrentLocation();
  assert.equal(h.deviceLocationState.status, 'requesting');
  const before = h.updates.length;
  h.explicit[0].resolve(granted('cancelled'));
  await old;
  noCompletionUpdates(h, before);
  assert.equal(h.deviceLocationState.status, 'requesting', 'cancelled completion cannot reset the retry UI');
  h.explicit[1].resolve(granted('retry'));
  await retry;
  assert.equal(h.deviceLocationState.status, 'granted');
}

{
  const h = harness();
  const old = h.applyCurrentLocationWeather('first');
  h.setLocationMode('manual');
  h.setLocationMode('auto');
  const current = h.applyCurrentLocationWeather('new');
  const owner = h.deviceLocationRequestInFlightRef.current;
  const before = h.updates.length;
  h.explicit[0].resolve(granted('old'));
  assert.equal(await old, null);
  noCompletionUpdates(h, before);
  assert.equal(h.deviceLocationRequestInFlightRef.current, owner);
  h.explicit[1].resolve(granted('new'));
  assert.equal((await current).location.id, 'new');
  assert.equal(h.deviceLocationRequestInFlightRef.current, null);
}
{
  const h = harness();
  const old = h.applyCurrentLocationWeather('first');
  const current = h.applyCurrentLocationWeather('new');
  h.explicit[1].resolve(granted('new'));
  await current;
  const before = h.updates.length;
  h.explicit[0].reject(new Error('old request finishes last'));
  assert.equal(await old, null);
  noCompletionUpdates(h, before);
  assert.equal(h.deviceLocationRequestInFlightRef.current, null);
}
console.log('Location: auto/manual/auto ABA and old-finally/new-request ownership');

for (const status of ['error', 'unavailable', 'denied', 'granted', 'throw']) {
  const h = harness();
  const pending = h.reconcileDeviceLocationPermission();
  if (status === 'throw') h.sync[0].reject(new Error('transient'));
  else h.sync[0].resolve(status === 'granted' ? granted('here') : { status });
  await pending;
  assert.equal(h.weatherLocationModeRef.current, status === 'denied' ? 'manual' : 'auto');
  assert.equal(h.deviceLocationRequestInFlightRef.current, null);
  if (['error', 'unavailable', 'throw'].includes(status)) {
    assert.ok(!h.updates.some(([key, value]) => key === 'LocationReady' && value === false));
    const retry = h.reconcileDeviceLocationPermission();
    h.sync[1].resolve(granted('recovered'));
    assert.equal((await retry).location.id, 'recovered');
  }
}
for (const status of ['granted', 'denied', 'error', 'unavailable']) {
  const h = harness();
  h.recordLocationIntent('manual');
  const pending = h.reconcileDeviceLocationPermission();
  assert.equal(h.sync.length, 1, 'settings permission changes are observed in manual mode');
  const before = h.updates.length;
  h.sync[0].resolve(status === 'granted' ? granted('settings') : { status });
  await pending;
  assert.equal(h.weatherLocationModeRef.current, 'manual');
  assert.ok(!h.updates.slice(before).some(([key]) => key === 'WeatherLocationMode'));
  if (status === 'granted' || status === 'denied') {
    assert.ok(h.updates.some(([key, value]) => key === 'LocationReady' && value === (status === 'granted')));
  }
  assert.equal(h.deviceLocationRequestInFlightRef.current, null);
}
console.log('Location: denial fallback, transient failure preserves intent/readiness, foreground recovery');

for (const source of ['reconcileDeviceLocationPermission', 'startup']) {
  const h = harness();
  const old = h[source]();
  const current = h.applyCurrentLocationWeather('explicit');
  const owner = h.deviceLocationRequestInFlightRef.current;
  const before = h.updates.length;
  h.sync[0].resolve({ status: 'denied' });
  await old;
  await new Promise(setImmediate);
  noCompletionUpdates(h, before);
  assert.equal(h.deviceLocationRequestInFlightRef.current, owner);
  h.explicit[0].resolve(granted('explicit'));
  await current;
}
console.log('Location: startup and foreground cannot undo a newer explicit request');

for (const source of ['applyCurrentLocationWeather', 'reconcileDeviceLocationPermission', 'requestCurrentLocation', 'completePermissionGate']) {
  const h = harness();
  const pending = h[source]('request');
  const beforeCleanup = h.updates.length;
  h.unmount();
  assert.equal(h.updates.length, beforeCleanup, 'unmount invalidation must not set state');
  const before = h.updates.length;
  (h.explicit[0] ?? h.sync[0]).resolve(granted('late'));
  await pending;
  noCompletionUpdates(h, before);
}
for (const caller of ['requestCurrentLocation', 'completePermissionGate']) {
  for (const cancel of ['selectWeatherLocation', 'skipPermissionGate', 'goBack', 'navigate', 'requestPermissionGate']) {
    const h = harness();
    const pending = h[caller]();
    if (cancel === 'navigate') h.navigate('H1');
    else if (cancel === 'requestPermissionGate') h.requestPermissionGate('notification', 'M2');
    else h[cancel]({ id: 'manual' });
    const before = h.updates.length;
    h.explicit[0].resolve(granted('late'));
    await pending;
    noCompletionUpdates(h, before);
  }
}
{
  const h = harness({ cachedLocation: { id: 'cached' } });
  const pending = h.reconcileDeviceLocationPermission();
  await h.completePermissionGate();
  const before = h.updates.length;
  h.sync[0].resolve({ status: 'denied' });
  assert.equal(await pending, null);
  noCompletionUpdates(h, before);
  assert.equal(h.weatherLocationModeRef.current, 'auto');
}
console.log('Location: unmount, onboarding, gate skip/back invalidation prevent stale navigation or completion');

{
  const h = harness();
  const pending = h.applyCurrentLocationWeather('dialog');
  await h.reconcileDeviceLocationPermission();
  h.startup();
  assert.equal(h.sync.length, 0, 'background sync must not overlap explicit permission dialog');
  h.explicit[0].resolve(granted('here'));
  await pending;
}
console.log('All location intent regressions passed (deferred production functions; no native GPS calls).');
