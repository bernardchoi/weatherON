import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import vm from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import { handleProxyRoute } from '../apps/server/src/proxyCore.mjs';

const originalFetch = globalThis.fetch;
const originalDate = globalThis.Date;
let now = Date.parse('2090-01-01T00:00:00Z');
class TestDate extends originalDate { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
globalThis.Date = TestDate;
const calls = [];
let response;
const env = { KAKAO_REST_API_KEY: 'mock', GOOGLE_MAPS_API_KEY: 'mock', WEATHER_TIMEOUT_MS: '20', ROUTE_CACHE_TTL_MS: '600000' };
const current = seconds => ({ routes: [{ result_code: 0, summary: { duration: seconds, distance: 18000 } }] });
const transit = (seconds, transfers = 0) => ({ properties: { type: 'BUS', totalTime: seconds, totalDistance: 8000, transfers }, steps: [{ properties: { type: 'BUS', time: seconds - 60, distance: 7900, stops: [{ name: 'A' }], vehicles: [{ type: 'BUS', name: '1' }] } }, { properties: { type: 'WALKING', time: 60, distance: 100 } }] });
let counter = 0;
async function route(mode, extra = {}, sameKey) {
  const url = new URL('https://test/routes/estimate');
  url.search = new URLSearchParams({ origin: `37.54,${127 + (sameKey ?? counter++) / 100000}`, destination: '37.56,126.97', originCountryCode: 'KR', destinationCountryCode: 'KR', transportMode: mode, ...extra }).toString();
  return (await handleProxyRoute(url, key => env[key], () => null)).payload;
}
globalThis.fetch = async (input, options) => {
  const url = new URL(input); calls.push(url);
  const body = await response(url, options);
  return body instanceof Response ? body : new Response(JSON.stringify(body));
};
try {
  const target = '2090-01-01T09:00:00.000Z';
  for (const basis of ['arrivalTime', 'departureTime']) {
    response = () => ({ status: 'OK', routes: [transit(3000, 1), transit(2400)] });
    const result = await route('transit', { [basis]: target });
    assert.equal(result.provider, 'kakao-transit');
    assert.equal(result.durationSeconds, 2400);
    assert.equal(result.routeOptions[0].transfers, 0);
    assert.deepEqual(result.routeOptions[0].steps.map(step => step.type), ['BUS', 'WALKING']);
    assert.match(result.message, /경로 소요시간 기준 예상/);
    assert.match(result.message, /운행·대기시간 확인 필요/);
    assert.equal(calls.at(-1).pathname, '/v2/routing/publictraffic');
    assert.deepEqual([...calls.at(-1).searchParams.keys()].sort(), ['e_name', 'end_x', 'end_y', 's_name', 'start_x', 'start_y']);
  }
  response = () => ({ status: 'OK', route: { properties: { totalTime: 223, totalDistance: 247 } } });
  const walk = await route('walk', { departureTime: target });
  assert.equal(walk.durationSeconds, 223);
  assert.equal(walk.distanceMeters, 247);
  assert.equal(calls.at(-1).pathname, '/v2/routing/walk');

  // Increase, decrease, oscillation, route changes and nonconvergence use exactly the selected sample.
  for (const sequence of [[3000, 4200, 4200], [4200, 2400, 2400], [2400, 3600, 2400, 3600, 2400, 3600], [2400, 6000, 7200, 8400, 9600, 10800]]) {
    const sampled = []; let index = 0;
    response = url => {
      const duration = sequence[Math.min(index++, sequence.length - 1)];
      sampled.push({ at: url.searchParams.get('departure_time'), duration });
      return current(duration);
    };
    const before = calls.length;
    const result = await route('drive', { arrivalTime: target, arrivalBufferSeconds: '600' });
    assert.ok(calls.length - before <= 6);
    assert.ok(Date.parse(result.arrivalAt) + 600000 <= Date.parse(target));
    assert.equal(Date.parse(result.arrivalAt) - Date.parse(result.departureAt), result.durationSeconds * 1000);
    const korea = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 16).replace(/[-T:]/g, '');
    const selected = Date.parse(result.departureAt) === now ? sampled[0] : sampled.find(sample => sample.at === korea(result.departureAt));
    assert.ok(selected, 'return a route queried at the selected departure');
    assert.equal(result.durationSeconds, selected.duration, 'do not carry old long duration into a new response');
    const feasible = sampled.filter(sample => sample.at).map(sample => {
      const t = sample.at;
      return { ...sample, departure: Date.parse(`${t.slice(0,4)}-${t.slice(4,6)}-${t.slice(6,8)}T${t.slice(8,10)}:${t.slice(10,12)}:00+09:00`) };
    }).filter(sample => sample.departure + sample.duration * 1000 + 600000 <= Date.parse(target));
    if (feasible.length) assert.equal(Date.parse(result.departureAt), Math.max(...feasible.map(sample => sample.departure)));
  }
  response = () => current(2401);
  const rounded = await route('drive', { arrivalTime: target, arrivalBufferSeconds: '600' });
  assert.equal(rounded.durationSeconds, 2401);
  assert.ok(Date.parse(target) - 600000 - Date.parse(rounded.arrivalAt) < 60000);
  const late = await route('drive', { arrivalTime: '2089-12-31T23:50:00Z' });
  assert.equal(late.arrivalFeasible, false);
  assert.equal(late.departureAt, new Date(now).toISOString());
  assert.equal(calls.at(-1).pathname, '/v1/directions');
  assert.match(late.message, /지각 가능/);

  // Validation must fail before any upstream request.
  for (const extra of [{ origin: '91,127' }, { origin: '37,181' }, { origin: ',127' }, { origin: ' ,127' }, { origin: '37,127,0' }, { transportMode: 'car' }, { arrivalTime: 'tomorrow' }, { arrivalTime: '2090-02-30T09:00:00Z' }, { arrivalTime: '2090-01-01T09:00:00' }, { arrivalTime: target, departureTime: target }, { arrivalBufferSeconds: '-1' }]) {
    const before = calls.length;
    await assert.rejects(() => route('drive', extra));
    assert.equal(calls.length, before);
  }
  const same = await route('drive', { origin: '37.56,126.97', destination: '37.56,126.97' });
  assert.equal(same.durationSeconds, 0);
  assert.equal(same.distanceMeters, 0);
  response = () => ({ status: 'OK', route: { properties: { totalTime: 1, totalDistance: 1 } } });
  assert.equal((await route('walk')).durationSeconds, 1);

  for (const status of [401, 403, 429, 500, 503]) {
    response = () => new Response('{}', { status });
    const failed = await route('transit', { arrivalTime: target });
    assert.equal(failed.status, 'error'); assert.equal(failed.travelMinutes, 0);
    assert.equal(failed.failureReason, `upstream_http_${status}`);
  }
  for (const body of [{ status: 'ZERO_RESULTS' }, { status: 'OK', routes: [] }, { status: 'OK', routes: [transit(-1)] }, { status: 'OK', routes: [transit(null)] }, { routes: [transit(2400)] }]) {
    response = () => body;
    assert.equal((await route('transit')).status, 'error');
  }
  for (const body of [{ routes: [{ result_code: 1, summary: { duration: 2400, distance: 1 } }] }, current(-1), current(null), current(99999999), {}]) {
    response = () => body;
    assert.equal((await route('drive')).status, 'fallback');
  }
  response = () => new Response('invalid-json');
  assert.equal((await route('transit')).status, 'error');
  response = (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('timeout'))));
  assert.equal((await route('transit')).status, 'error');
  response = () => { throw new TypeError('offline'); };
  assert.equal((await route('transit')).status, 'error');
  // Failed results are not cached. Cache hits preserve original lookup/expiry and stale state is explicit.
  const key = counter++;
  response = () => ({ status: 'ZERO_RESULTS' });
  assert.equal((await route('transit', {}, key)).status, 'error');
  response = () => ({ status: 'OK', routes: [transit(2400)] });
  const fresh = await route('transit', {}, key); const before = calls.length;
  const cached = await route('transit', {}, key);
  assert.equal(calls.length, before); assert.equal(cached.updatedAt, fresh.updatedAt); assert.equal(cached.expiresAt, fresh.expiresAt); assert.equal(cached.cacheStatus, 'cached');
  now += 601000;
  response = () => { throw new TypeError('offline'); };
  const stale = await route('transit', {}, key);
  assert.equal(stale.updatedAt, fresh.updatedAt); assert.equal(stale.expiresAt, fresh.expiresAt); assert.equal(stale.cacheStatus, 'stale');
  response = () => ({ status: 'OK', routes: [transit(2500)] });
  assert.equal((await route('transit', {}, key)).durationSeconds, 2500);
  console.log('PASS server: public Kakao priority/walk, all solver directions/budget/route identity, seconds/minute tolerance, past/near/same points, input validation, 401/403/429/5xx/timeout/schema/offline and cache provenance/recovery.');
} finally { globalThis.fetch = originalFetch; globalThis.Date = originalDate; }

// Execute production TypeScript with the existing transpile-based regression pattern.
const modules = new Map();
function load(file, mocks = {}) {
  if (file.endsWith(".json")) return { __esModule: true, default: JSON.parse(fs.readFileSync(file, "utf8")) };
  const absolute = path.resolve(file);
  if (modules.has(absolute) && !Object.keys(mocks).length) return modules.get(absolute);
  const module = { exports: {} }; modules.set(absolute, module.exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('module', 'exports', 'require', code)(module, module.exports, id => {
    if (id.endsWith('/localization/react-native')) return { Platform: { OS: 'ios' } };
    if (id.endsWith('/localization/localization')) return { getLocalePolicy: () => ({ language: 'ko', languageTag: 'ko-KR' }), translateText: value => value };
    if (id.endsWith('/LocalizationProvider')) return {};
    if (id in mocks) return mocks[id];
    if (id === '@weatheron/shared') return load('packages/shared/src/index.ts');
    if (!id.startsWith('.')) return {};
    const target = path.resolve(path.dirname(file), id);
    return load([target + '.ts', target + '.tsx', target + '/index.ts'].find(file => fs.existsSync(file)) ?? target);
  });
  return module.exports;
}
const zoned = load('apps/mobile/src/utils/zonedDateTime.ts');
const travel = load('apps/mobile/src/utils/travelEstimate.ts');
const helpers = load('apps/mobile/src/state/appStateHelpers.ts');
const estimate = { originPlaceId: 'origin', destinationPlaceId: 'destination', provider: 'kakao-transit', status: 'ready', travelMinutes: 40, durationSeconds: 2400, distanceMeters: 8000, transportMode: 'transit', timingBasis: 'route', message: 'route', updatedAt: '2090-01-01T00:00:00.000Z', expiresAt: '2090-01-01T00:10:00.000Z' };
const departure = travel.resolveTravelTiming(estimate, '2090-01-01T08:00:00+09:00', 'departure', 40, 10, 15);
assert.equal(travel.formatRouteClock(departure.arrivalAt, 'Asia/Seoul'), '08:40');
assert.equal(travel.formatRouteClock(departure.preparationAt, 'Asia/Seoul'), '07:45');
const arrival = travel.resolveTravelTiming(estimate, '2090-01-01T09:00:00+09:00', 'arrival', 40, 10, 15);
assert.equal(travel.formatRouteClock(arrival.departureAt, 'Asia/Seoul'), '08:10');
assert.equal(travel.formatRouteClock(arrival.arrivalAt, 'Asia/Seoul'), '08:50');
assert.equal(travel.formatRouteClock(arrival.preparationAt, 'Asia/Seoul'), '07:55');
assert.equal(travel.getTravelMinutesForTransport({ ...estimate, provider: 'kakao', transportMode: undefined }, 'walk'), undefined);
assert.equal(travel.getTravelMinutesForTransport({ ...estimate, provider: 'kakao' }, 'transit'), undefined);
assert.equal(travel.getTravelMinutesForTransport({ ...estimate, transportMode: 'walk', durationSeconds: 223, provider: 'kakao' }, 'walk'), 223 / 60);
assert.equal(zoned.addMinutesToTime('23:50', 40), '00:30');
assert.equal(zoned.addMinutesToTime('00:00', -40.1), '23:19');
for (const [at, expected] of [['2090-01-31T23:50:00+09:00', '2090-02-01T00:30:00+09:00'], ['2090-12-31T23:50:00+09:00', '2091-01-01T00:30:00+09:00']]) {
  assert.equal(Date.parse(travel.resolveTravelTiming(estimate, at, 'departure', 40, 0).arrivalAt), Date.parse(expected));
}
for (const zone of ['Asia/Seoul', 'Asia/Tokyo', 'America/Los_Angeles']) {
  const target = helpers.getRouteArrivalTimeIso('09:00', zone, Date.parse('2090-01-01T00:00:00Z'), false, []);
  assert.equal(travel.formatRouteClock(target, zone), '09:00');
}
const friday = Date.parse('2026-10-30T23:59:00+09:00');
assert.equal(helpers.getRouteArrivalTimeIso('08:00', 'Asia/Seoul', friday, true, ['mon']), '2026-11-01T23:00:00.000Z');
assert.equal(helpers.getRouteArrivalTimeIso('08:00', 'Asia/Seoul', friday, false, []), '2026-10-29T23:00:00.000Z', 'past one-off target stays on the same date');
const schedule = { timeBasis: 'arrival', targetArrivalTime: '09:00', transportMode: 'transit', repeatEnabled: false, repeatDays: [] };
const scheduleNow = Date.parse('2090-01-01T05:00:00+09:00');
const actualTarget = helpers.getRouteArrivalTimeIso('09:00', 'Asia/Seoul', scheduleNow, false, []);
const verified = { ...estimate, requestArrivalTime: actualTarget, departureAt: new Date(Date.parse(actualTarget) - 50 * 60000).toISOString(), arrivalAt: new Date(Date.parse(actualTarget) - 10 * 60000).toISOString(), bufferSeconds: 600 };
const timing = helpers.getDestinationTiming(verified, schedule, 'Asia/Seoul', scheduleNow, 'KR', 'KR', 'origin');
assert.equal(travel.formatRouteClock(timing.departureAt, 'Asia/Seoul'), '08:10');
assert.equal(helpers.getDestinationTiming(verified, { ...schedule, targetArrivalTime: '10:00' }, 'Asia/Seoul', scheduleNow), undefined);
assert.equal(helpers.getDestinationTiming(verified, schedule, 'Asia/Seoul', scheduleNow, 'KR', 'KR', 'other-origin'), undefined);
console.log('PASS shared timing: 08:00→08:40, 09:00/40m/10m→08:10/08:50, preparation separate, seconds, midnight/month/year, repeat days/timezones, past targets, mode/origin/time mismatch.');

// SQL migration and persistence use actual SQLite, not an imitation of SQL.
const storageSource = fs.readFileSync('apps/mobile/src/providers/appStorage.ts', 'utf8');
const ast = ts.createSourceFile('appStorage.ts', storageSource, ts.ScriptTarget.Latest, true);
const names = ['ensureDestinationScheduleColumns', 'writeSavedDestinations', 'replaceDestinationRepeatDays', 'writeDestinationPreview', 'travelEstimateFromRow', 'objectRecord', 'textValue', 'numberValue', 'boolValue', 'arrayValue', 'stringArray', 'parseJsonArray', 'resolveStoredTimeZone'];
const selectedCode = ast.statements.filter(node => ts.isFunctionDeclaration(node) && names.includes(node.name?.text)).map(node => node.getText(ast)).join('\n');
const db = new DatabaseSync(':memory:');
for (const sql of storageSource.match(/CREATE TABLE IF NOT EXISTS (?:destinations|destination_preview|destination_repeat_days|preview_repeat_days)\s*\([\s\S]*?;/g)) db.exec(sql.replace(/\s*travel_result_json TEXT NOT NULL DEFAULT '\{\}',/g, ''));
const database = { getAllAsync: async (sql, ...args) => db.prepare(sql).all(...args), runAsync: async (sql, ...args) => db.prepare(sql).run(...args) };
const sqlContext = { JSON, Array, Object, Set };
vm.runInNewContext(ts.transpileModule(selectedCode, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, sqlContext);
await sqlContext.ensureDestinationScheduleColumns(database);
await sqlContext.ensureDestinationScheduleColumns(database);
const place = { id: 'destination', name: 'Public place', address: '', category: 'custom', coordinate: { latitude: 37.56, longitude: 126.97 }, countryCode: 'KR', timezone: 'Asia/Seoul', provider: 'kakao' };
const saved = { place, label: null, careEnabled: true, alertCondition: { rainThresholdPct: 50, leadTimeMinutes: 60, windThresholdMs: 8 }, schedulePreference: schedule, travelEstimate: verified };
await sqlContext.writeSavedDestinations(database, [saved], scheduleNow);
await sqlContext.writeDestinationPreview(database, { previewDestinationSchedulePreference: schedule, previewDestinationTravelEstimate: verified }, scheduleNow);
const persistence = load('apps/mobile/src/state/persistedAppState.ts', { '../providers/appStorage': {}, '../providers/weatherProvider': {} });
for (const table of ['destinations', 'destination_preview']) {
  const row = db.prepare(`SELECT * FROM ${table}`).get();
  const restored = persistence.normalizeDestinationTravelEstimate(sqlContext.travelEstimateFromRow(row), { locationId: 'origin' }, place);
  assert.equal(restored.durationSeconds, 2400); assert.equal(restored.updatedAt, verified.updatedAt); assert.equal(restored.expiresAt, verified.expiresAt);
  assert.equal(restored.requestArrivalTime, verified.requestArrivalTime); assert.equal(restored.bufferSeconds, 600);
  assert.equal(helpers.getDestinationTiming(restored, schedule, place.timezone, scheduleNow, 'KR', 'KR', 'origin').departureAt, timing.departureAt);
}
const legacy = persistence.normalizeDestinationTravelEstimate({ provider: 'kakao', status: 'ready', travelMinutes: 40, distanceMeters: 1000 }, { locationId: 'origin' }, place);
assert.equal(legacy.updatedAt, '', 'unknown original lookup must not become now');
assert.equal(legacy.travelMinutes, 40);
console.log('PASS actual SQLite: additive/idempotent legacy migration, saved/preview round trip, duration/absolute schedule/provenance/expiry preserved, and old data retained.');

// Actual notification scheduling and UI model consume the same result.
const demo = load('apps/mobile/src/data/demoState.ts', { '../providers/weatherProvider': {}, '../localization/react-native': { Platform: { OS: 'ios' } } });
const weather = { locationId: 'origin', locationName: 'Origin', countryCode: 'KR', timezone: 'Asia/Seoul', source: 'weatherkit', observedAt: new Date(scheduleNow).toISOString(), stale: false, current: { tempC: 20, feelsLikeC: 20, precipitationMm: 0, rainProbabilityPct: 80, humidityPct: 50, windMs: 2, condition: 'rain' }, hourly: ['07:00', '08:00', '09:00'].map(time => ({ time: `2090-01-01T${time}`, tempC: 20, rainProbabilityPct: 80, precipitationMm: 1, windMs: 2, condition: 'rain' })), daily: [] };
const destinationWeather = { ...weather, locationId: 'destination', locationName: place.name };
const result = demo.buildDemoStateFromWeatherResult({ current: weather, destination: destinationWeather, destinationSnapshots: [destinationWeather], status: 'ready', fallbackUsed: false }, true, { hasDestination: true, destination: place, destinationCareEnabled: true, destinationSchedule: { ...verified, ...schedule }, savedDestinations: [saved], notificationNow: scheduleNow });
assert.equal(result.destinationCare.departureAdvice.departureAt, timing.departureAt);
assert.equal(result.destinationCare.departureAdvice.arrivalAt, timing.arrivalAt);
assert.equal(result.destinationCare.departureAdvice.recommendedDepartureTime, '08:10');
const notification = result.notifications.find(item => item.id.endsWith(':destination'));
assert.ok(notification); assert.equal(notification.scheduledAt, new Date(Date.parse(timing.departureAt) - 60 * 60000).toISOString());
assert.ok(notification.pushBody.includes(verified.message));
console.log('PASS UI model/notification: identical departure/arrival, separate reminder lead time, and route provenance in notification.');

// Run the real request effect, including cleanup when settings change during a slow response.
const stateSource = fs.readFileSync('apps/mobile/src/state/useWeatherOnAppState.ts', 'utf8');
const stateAst = ts.createSourceFile('state.ts', stateSource, ts.ScriptTarget.Latest, true);
let routeEffect;
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(stateAst) === 'useEffect' && node.arguments[0]?.getText(stateAst).includes('runtimeTravelEstimateClient.estimateRoute')) routeEffect = node.arguments[0].getText(stateAst);
  ts.forEachChild(node, visit);
}
visit(stateAst); assert.ok(routeEffect);
const flush = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { resolve, reject, promise }; };
now = scheduleNow;
globalThis.Date = TestDate;
const effects = [];
let destinations = [saved];
const attempts = { current: new Map() };
const requests = [];
const context = {
  appStateHydrated: true, AppState: { currentState: 'active' }, placeSearchOrigin: { coordinate: { latitude: 37.5, longitude: 127 }, locationId: 'origin', countryCode: 'KR' },
  routeRequests: [{ place, schedule }], nowMinuteTick: scheduleNow,
  savedDestinationsRef: { get current() { return destinations; } }, previewDestinationTravelEstimate: verified,
  routeAttemptsRef: attempts, selectedDestinationPlace: place, getRouteArrivalTimeIso: helpers.getRouteArrivalTimeIso, getAutoBufferMinutes: helpers.getAutoBufferMinutes,
  createDestinationTravelEstimate: helpers.createDestinationTravelEstimate,
  runtimeTravelEstimateClient: { estimateRoute: input => { const pending = deferred(); requests.push({ input, ...pending }); return pending.promise; } },
  setDestinationTravelEstimateRequestStatus: value => effects.push(['status', value]), setPreviewDestinationTravelEstimate: value => effects.push(['preview', value]),
  updateSavedDestinations: update => { destinations = update(destinations); },
};

// Avoid exports boilerplate by compiling just an expression.
const makeEffect = input => new Function(...Object.keys(input), ts.transpileModule(`const run = ${routeEffect};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + '\nreturn run;')(...Object.values(input));
let cleanup = makeEffect(context)();
assert.equal(requests.length, 1);
cleanup();
const laterSchedule = { ...schedule, targetArrivalTime: '10:00' };
cleanup = makeEffect({ ...context, routeRequests: [{ place, schedule: laterSchedule }] })();
assert.equal(requests.length, 2);
const latestResult = { ...verified, requestArrivalTime: helpers.getRouteArrivalTimeIso('10:00', place.timezone, scheduleNow, false, []), durationSeconds: 2500 };
requests[1].resolve(latestResult); await flush();
requests[0].resolve({ ...verified, durationSeconds: 9000 }); await flush();
assert.equal(destinations[0].travelEstimate.durationSeconds, 2500, 'slow obsolete request must not overwrite latest settings');
cleanup();
const beforeThrottle = requests.length;
makeEffect({ ...context, routeRequests: [{ place, schedule: laterSchedule }] })();
assert.equal(requests.length, beforeThrottle, 'far departures are bounded to ten-minute retries');
attempts.current.clear();
makeEffect({ ...context, AppState: { currentState: 'background' } })();
assert.equal(requests.length, beforeThrottle, 'no background refresh guarantee');
cleanup = makeEffect(context)();
requests.at(-1).reject(new TypeError('offline')); await flush();
assert.equal(destinations[0].travelEstimate.cacheStatus, 'stale');
assert.equal(destinations[0].travelEstimate.updatedAt, verified.updatedAt);
cleanup();
attempts.current.clear();
cleanup = makeEffect(context)();
requests.at(-1).resolve(verified); await flush();
assert.equal(destinations[0].travelEstimate.durationSeconds, 2400);
cleanup();
console.log('PASS actual request effect: fast setting changes reject obsolete responses, ten-minute throttle, background guard, offline provenance and recovery. Foreground/restart clear/requery is covered separately by lifecycle/storage checks.');

globalThis.Date = originalDate;

// Native inputs and widget payload share exactly the same timing result.
now = scheduleNow; globalThis.Date = TestDate;
let buildInputSource;
function findBuilder(node) {
  if (ts.isPropertyAssignment(node) && node.name.getText(stateAst) === 'buildInput' && node.initializer.getText(stateAst).includes('getDestinationTiming')) buildInputSource = node.initializer.getText(stateAst);
  ts.forEachChild(node, findBuilder);
}
findBuilder(stateAst); assert.ok(buildInputSource);
const nativeContext = {
  getRouteArrivalTimeIso: helpers.getRouteArrivalTimeIso, getDestinationTiming: helpers.getDestinationTiming,
  nowMinuteTick: scheduleNow, placeSearchOrigin: context.placeSearchOrigin, activeWeatherLocation: { countryCode: 'KR' },
  weatherProviderResult: { destinationSnapshots: [destinationWeather] }, getDepartureWeatherGuidance: () => 'rain',
  getDepartureWeatherGuidanceKind: () => 'rain', getDepartureGuidanceSymbol: () => 'umbrella',
  localePolicy: { language: 'ko' }, translateText: value => value,
  departureActivityReplacementDestinationId: null, formatDisplayTime: travel.formatRouteClock,
};
const buildInput = new Function(...Object.keys(nativeContext), ts.transpileModule(`const run = ${buildInputSource};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText + '\nreturn run;')(...Object.values(nativeContext));
assert.equal(buildInput(saved).departureAt, timing.departureAt);
assert.equal(buildInput(saved).departureTimeLabel, '08:10');
assert.ok(buildInput(saved).guidance.includes(verified.message));
assert.equal(buildInput({ ...saved, schedulePreference: { ...schedule, transportMode: 'walk' } }), null);
const serializers = load('apps/mobile/src/providers/widgetSnapshot.shared.ts');
const widget = serializers.createWeatheronWidgetLocationSnapshot(destinationWeather, result.outfit, result.umbrella, { departureTime: travel.formatRouteClock(timing.departureAt, place.timezone), arrivalTime: travel.formatRouteClock(timing.arrivalAt, place.timezone), departureAt: timing.departureAt, arrivalAt: timing.arrivalAt, durationSeconds: timing.durationSeconds, bufferSeconds: timing.bufferSeconds, travelMinutes: 2401/60, routeMessage: verified.message, routeUpdatedAt: verified.updatedAt });
assert.equal(widget.departureAt, buildInput(saved).departureAt);
assert.equal(widget.arrivalAt, result.destinationCare.departureAdvice.arrivalAt);
assert.equal(widget.routeUpdatedAt, verified.updatedAt);
assert.equal(widget.travelMinutes, 41);
const past = helpers.getDestinationTiming(verified, schedule, place.timezone, Date.parse('2090-01-01T10:00:00+09:00'), 'KR', 'KR', 'origin');
assert.equal(travel.formatRouteClock(past.nowArrivalAt, place.timezone), '10:40');
assert.equal(travel.formatRouteClock(past.departureAt, place.timezone), '08:10', 'past recommendation must not become tomorrow');
globalThis.Date = originalDate;
console.log('PASS native input/widget payload: same departure/arrival/duration/buffer as UI and notification, provenance preserved, conservative minute display, and leaving-now ETA separated from past recommendation.');

const clients = load('apps/mobile/src/providers/travelEstimateClient.ts', { '../config/weatherEnv': { DEFAULT_WEATHER_TIMEOUT_MS: 15000, getWeatherRuntimeConfig: () => ({ clientMode: 'fixture' }) } });
let clientRequest;
const proxy = clients.createProxyTravelEstimateClient({ apiBaseUrl: 'https://mock', fetchImpl: async input => { clientRequest = new URL(input); return new Response(JSON.stringify({ ...verified, cacheStatus: 'cached' })); } });
const fromClient = await proxy.estimateRoute({ origin: { latitude: 37.5, longitude: 127 }, destination: place.coordinate, transportMode: 'transit', arrivalTime: actualTarget, arrivalBufferSeconds: 600 });
assert.equal(clientRequest.searchParams.get('arrivalBufferSeconds'), '600');
assert.equal(fromClient.message, verified.message, 'client must not overwrite server prediction provenance');
assert.equal(fromClient.updatedAt, verified.updatedAt, 'cache read must not fabricate a lookup timestamp');
assert.equal(fromClient.expiresAt, verified.expiresAt);
const invalidClient = clients.createProxyTravelEstimateClient({ apiBaseUrl: 'https://mock', fetchImpl: async () => new Response(JSON.stringify({ ...verified, durationSeconds: -1 })) });
await assert.rejects(() => invalidClient.estimateRoute({ origin: place.coordinate, destination: place.coordinate }), /Invalid route response/);
assert.equal((await clients.fallbackTravelEstimateClient.estimateRoute({ origin: place.coordinate, destination: place.coordinate, transportMode: 'transit' })).status, 'error');
const localization = load('apps/mobile/src/localization/localization.ts');
for (const language of ['en', 'ja']) {
  const text = localization.translateText('이전 조회 결과 · 시간대 교통 예측 반영 · 제한된 탐색', language);
  assert.doesNotMatch(text, /[가-힣]/u);
  assert.doesNotMatch(localization.translateText('지금 출발 시 10:40 도착 예상 · 지각 가능', language), /[가-힣]/u);
}
// Browser timers require the global receiver even when supplied as object properties.
const timerContext = { marker: true, exports: {}, setTimeout: function () { assert.equal(this.marker, true); return 1; }, clearTimeout: function () { assert.equal(this.marker, true); } };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('apps/mobile/src/providers/notificationSync.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, timerContext);
const notificationSync = timerContext.exports.createNotificationSync(async () => ({ status: 'unavailable', scheduledCount: 0 }));
notificationSync.request('test', { enabled: false }, () => {}); await flush(); notificationSync.stop();
console.log('PASS client/localization: server provenance/timestamps preserved, malformed result rejected, no fabricated transit fallback, composed route messages use OS language catalogs, and browser notification timer receiver retained.');
