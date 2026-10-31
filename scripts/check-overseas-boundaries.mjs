import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { DatabaseSync } from 'node:sqlite';
import { handleProxyRoute } from '../apps/server/src/proxyCore.mjs';

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

const helpers = load('apps/mobile/src/state/appStateHelpers.ts');
const shared = load('packages/shared/src/index.ts');
const persisted = load('apps/mobile/src/state/persistedAppState.ts');
const places = load('apps/mobile/src/providers/placeSearchClient.ts');
const weather = load('apps/mobile/src/providers/weatherProvider.ts');
const demo = load('apps/mobile/src/data/demoState.ts');
const env = { KAKAO_REST_API_KEY: 'fixture', GOOGLE_MAPS_API_KEY: 'fixture' };
const originalFetch = globalThis.fetch;
const calls = [];
let upstream = { status: 'ZERO_RESULTS', results: [] };
const candidate = (id, country, lat, lng, name = 'Cafe') => ({
  place_id: id, formatted_address: id + ', ' + country,
  address_components: [{ long_name: name, types: ['establishment'] }, { short_name: country, types: ['country'] }],
  geometry: { location: { lat, lng } }, types: ['establishment'],
});
async function search(q, extra = {}) {
  const url = new URL('https://fixture/places/search');
  url.search = new URLSearchParams({ q, sort: 'accuracy', language: 'ko', ...extra }).toString();
  return (await handleProxyRoute(url, key => env[key], () => null)).payload;
}
globalThis.fetch = async input => {
  const url = new URL(input); calls.push(url);
  if (url.hostname === 'dapi.kakao.com') return Response.json({ documents: [] });
  if (url.hostname === 'api.open-meteo.com') {
    const zones = url.searchParams.get('latitude').split(',').map(lat => ({ timezone: Number(lat) < 0 ? 'Australia/Sydney' : Number(lat) > 50 ? 'Europe/London' : 'America/New_York' }));
    return Response.json(zones.length === 1 ? zones[0] : zones);
  }
  return Response.json(upstream);
};
let selected;
try {
  upstream = { status: 'OK', results: [candidate('London-cafe', 'GB', 51.5, -.12, 'Tokyo Station Cafe')] };
  [selected] = await search('Tokyo Station Cafe London');
  assert.equal(calls.find(url => url.hostname === 'maps.googleapis.com').searchParams.has('components'), false);
  assert.equal(selected.countryCode, 'GLOBAL');
  assert.equal(selected.countryIsoCode, 'GB');
  assert.equal(selected.timezone, 'Europe/London');
  assert.equal(selected.name, 'Tokyo Station Cafe');
  assert.equal(selected.address, 'London-cafe, GB');
  assert.deepEqual(shared.localizePlaceSearchResult(selected, 'ja'), selected);
  assert.deepEqual(shared.localizePlaceSearchResult({ ...selected, countryCode: 'JP', name: 'Cafe near Tokyo Station', timezone: 'Asia/Tokyo' }, 'ko').name, 'Cafe near Tokyo Station');

  await search('Tokyo Cafe constraint fixture');
  upstream = { status: 'OK', results: [candidate('Japan-cafe', 'JP', 35.68, 139.76)] };
  assert.equal((await search('Tokyo Cafe constraint fixture', { countryCode: 'JP' }))[0].countryCode, 'JP', 'inferred region must not share cache with explicit country filter');
  assert.equal(calls.filter(url => url.hostname === 'maps.googleapis.com').at(-1).searchParams.get('components'), 'country:JP');
  upstream = { status: 'OK', results: [candidate('Sydney', 'AU', -33.8568, 151.2153, '시드니 오페라 하우스')] };
  const [korean] = await search('시드니 오페라 하우스');
  assert.equal(korean.countryIsoCode, 'AU');
  assert.equal(korean.timezone, 'Australia/Sydney');
  upstream = { status: 'OK', results: [candidate('Cambridge-GB', 'GB', 52.2, .13), candidate('Cambridge-US', 'US', 42.37, -71.1)] };
  const ambiguous = await search('Cambridge fixture');
  assert.deepEqual(ambiguous.map(place => place.countryIsoCode), ['GB', 'US']);
  assert.notEqual(ambiguous[0].id, ambiguous[1].id);
  assert.deepEqual(ambiguous.map(place => place.timezone), ['Europe/London', 'America/New_York']);
  upstream = { status: 'OK', results: [{ ...candidate('partial-city', 'GB', 51.5, -.12), partial_match: true, types: ['locality', 'political'] }] };
  assert.deepEqual(await search('fictional venue London'), [], 'partial city must not inherit a venue name');
  upstream = { status: 'ZERO_RESULTS', results: [] };
  assert.deepEqual(await search('no-such-place-fixture'), []);
  upstream = { status: 'REQUEST_DENIED' };
  assert.deepEqual(await search('provider-outage-fixture'), []);
  upstream = { status: 'OK', results: [candidate('recovered', 'GB', 51.5, -.12)] };
  assert.equal((await search('provider-outage-fixture'))[0].provider, 'google', 'outage fallback must not be cached');
  upstream = { status: 'ZERO_RESULTS', rows: [{ elements: [{ status: 'ZERO_RESULTS' }] }] };
  for (const [originCountryCode, destinationCountryCode, origin, destination, mode] of [
    ['KR', 'GLOBAL', '37.5,127', '51.5,-.12', 'drive'],
    ['KR', 'GLOBAL', '37.5,127', '51.5,-.12', 'transit'],
    ['JP', 'JP', '35.68,139.76', '35.7,139.8', 'transit'],
    ['GLOBAL', 'GLOBAL', '51.5,-.12', '42.37,-71.1', 'drive'],
    ['GLOBAL', 'GLOBAL', '51.5,-.12', '42.37,-71.1', 'transit'],
  ]) {
    const url = new URL('https://fixture/routes/estimate');
    url.search = new URLSearchParams({ originCountryCode, destinationCountryCode, origin, destination, transportMode: mode }).toString();
    const estimate = (await handleProxyRoute(url, key => env[key], () => null)).payload;
    assert.notEqual(estimate.status, 'ready');
    assert.equal(helpers.getDestinationTiming(estimate, { timeBasis: 'arrival', targetArrivalTime: '10:00', transportMode: mode, repeatEnabled: false, repeatDays: [] }, 'Asia/Tokyo', Date.parse('2026-10-30T00:00Z'), originCountryCode, destinationCountryCode), undefined);
  }
} finally { globalThis.fetch = originalFetch; }

// Storage is an isolated in-memory adapter: never read or write an account/device destination.
const storage = new Map();
const isolated = load('apps/mobile/src/state/persistedAppState.ts', {
  '../providers/appStorage': { readAppValue: async key => storage.get(key), writeAppValue: async (key, value) => { storage.set(key, JSON.parse(JSON.stringify(value))); } },
});
selected = load('apps/mobile/src/utils/destination-visual-resolver.ts').normalizePlaceSearchResultCategory(selected);
const saved = { place: selected, careEnabled: true, label: 'custom', alertCondition: { rainThresholdPct: 50, leadTimeMinutes: 60, windThresholdMs: 10 }, schedulePreference: { timeBasis: 'arrival', targetArrivalTime: '10:00', transportMode: 'drive', repeatEnabled: false, repeatDays: [] } };
await isolated.savePersistedAppState(persisted.normalizePersistedAppState({ savedDestinations: [saved], selectedDestinationPlace: selected }));
const restored = await isolated.readPersistedAppState();
assert.deepEqual(restored.savedDestinations[0].place, selected);
assert.deepEqual(restored.selectedDestinationPlace, selected);
// Exercise real SQLite migration, close/reopen, and both selected/manual location tables.
const storageSource = fs.readFileSync('apps/mobile/src/providers/appStorage.ts', 'utf8');
const storageAst = ts.createSourceFile('appStorage.ts', storageSource, ts.ScriptTarget.Latest, true);
const sqlNames = ['ensurePlaceCountryColumns', 'writeSavedDestinations', 'readSavedDestinations', 'replaceDestinationRepeatDays', 'readDestinationRepeatDays', 'writePlace', 'readPlace', 'placeFromRow', 'writeWeatherLocation', 'readWeatherLocation', 'alertConditionFromRow', 'travelEstimateFromRow', 'objectRecord', 'textValue', 'numberValue', 'boolValue', 'arrayValue', 'stringArray', 'parseJsonArray'];
const sqlSource = storageAst.statements.filter(node => ts.isFunctionDeclaration(node) && sqlNames.includes(node.name?.text)).map(node => node.getText(storageAst)).join('\n');
const sql = new Function(ts.transpile(sqlSource) + ';return {' + sqlNames.join(',') + '};')();
const sqliteDir = fs.mkdtempSync('/private/tmp/weatheron-overseas-');
let db = new DatabaseSync(path.join(sqliteDir, 'isolated.db'));
const database = { getAllAsync: async (query, ...args) => db.prepare(query).all(...args), getFirstAsync: async (query, ...args) => db.prepare(query).get(...args), runAsync: async (query, ...args) => db.prepare(query).run(...args) };
try {
  for (const statement of storageSource.match(/CREATE TABLE IF NOT EXISTS (?:destinations|destination_repeat_days|places|weather_locations)\s*\([\s\S]*?;/g)) db.exec(statement.replace(/\s*country_iso_code TEXT,/g, ''));
  // Migration must preserve an existing legacy row.
  db.exec("INSERT INTO places VALUES ('legacy','legacy','Legacy','Legacy address','custom','GLOBAL',51.5,-.12,'Europe/London','google',0)");
  await sql.ensurePlaceCountryColumns(database);
  await sql.ensurePlaceCountryColumns(database);
  assert.equal((await sql.readPlace(database, 'legacy')).address, 'Legacy address');
  await sql.writeSavedDestinations(database, [restored.savedDestinations[0]], Date.now());
  await sql.writePlace(database, 'selectedDestination', selected, Date.now());
  await sql.writeWeatherLocation(database, 'manualWeatherLocation', helpers.createWeatherLocationFromPlace(selected), Date.now());
  db.close();
  db = new DatabaseSync(path.join(sqliteDir, 'isolated.db'));
  restored.savedDestinations = await sql.readSavedDestinations(database);
  assert.deepEqual(restored.savedDestinations[0].place, selected);
  assert.deepEqual(await sql.readPlace(database, 'selectedDestination'), selected);
  assert.deepEqual(await sql.readWeatherLocation(database, 'manualWeatherLocation'), helpers.createWeatherLocationFromPlace(selected));
} finally { db.close(); fs.rmSync(sqliteDir, { recursive: true, force: true }); }
const location = helpers.createWeatherLocationFromPlace(restored.savedDestinations[0].place);
const weatherCalls = [];
const provider = weather.createWeatherProvider({ fetchWeatherKitForecast: async params => { weatherCalls.push(params); return shared.weatherKitFixture; } }, { platform: 'ios' });
const result = await provider.getSnapshots('ready', { currentLocation: location, destinationLocation: location });
assert.deepEqual(weatherCalls[0], { latitude: selected.coordinate.latitude, longitude: selected.coordinate.longitude, timezone: selected.timezone, countryCode: 'GB', language: 'en' });
assert.equal(result.destination.locationId, selected.id);
assert.equal(result.destination.timezone, selected.timezone);
const proxy = places.createProxyPlaceSearchClient({ apiBaseUrl: 'https://fixture', fetchImpl: async () => Response.json([selected]) });
assert.deepEqual((await proxy.searchPlaces({ query: selected.name }))[0], selected);
const geocoder = places.createOpenMeteoPlaceSearchClient({ fetchImpl: async () => Response.json({ results: [{ id: 1, name: 'Ordinary overseas place', country_code: 'AU', country: 'Australia', latitude: -33.86, longitude: 151.22, timezone: 'Australia/Sydney' }] }) });
assert.equal((await geocoder.searchPlaces({ query: 'Ordinary overseas place' }))[0].countryIsoCode, 'AU');

// Destination calendar, DST gap/fold, and device zone independence.
for (const deviceZone of ['Asia/Seoul', 'America/Los_Angeles']) {
  process.env.TZ = deviceZone;
  assert.equal(helpers.getRouteArrivalTimeIso('00:15', 'Pacific/Auckland', Date.parse('2026-10-29T11:05Z'), false, []), '2026-10-29T11:15:00.000Z');
  assert.equal(helpers.getRouteArrivalTimeIso('02:30', 'America/New_York', Date.parse('2026-03-08T05:00Z'), false, []), undefined, 'nonexistent DST target must not become 03:30');
  assert.equal(helpers.getRouteArrivalTimeIso('02:30', 'America/New_York', Date.parse('2026-03-08T05:00Z'), true, ['sun']), '2026-03-15T06:30:00.000Z');
  assert.equal(helpers.getRouteArrivalTimeIso('02:30', 'Australia/Sydney', Date.parse('2026-10-03T14:00Z'), false, []), undefined);
  assert.equal(helpers.getRouteArrivalTimeIso('01:30', 'America/New_York', Date.parse('2026-11-01T04:00Z'), false, []), '2026-11-01T05:30:00.000Z', 'fold resolves to first occurrence');
  assert.equal(helpers.getRouteArrivalTimeIso('03:30', 'America/New_York', Date.parse('2026-03-08T05:00Z'), false, []), '2026-03-08T07:30:00.000Z');
}
const foldedWeather = shared.normalizeWeatherKitWeather({
  currentWeather: { ...shared.weatherKitFixture.currentWeather, asOf: '2026-11-01T04:00:00Z' },
  forecastHourly: { hours: ['2026-11-01T05:00:00Z', '2026-11-01T06:00:00Z'].map((forecastStart, index) => ({ ...shared.weatherKitFixture.forecastHourly.hours[0], forecastStart, temperature: 10 + index })) },
}, { locationId: selected.id, locationName: selected.name, countryCode: 'GLOBAL', timezone: 'America/New_York' });
const outing = load('apps/mobile/src/utils/homeOuting.ts');
assert.deepEqual(outing.forecastHours(foldedWeather).map(hour => hour.at), [Date.parse('2026-11-01T05:00Z'), Date.parse('2026-11-01T06:00Z')], 'repeated 01:00 forecasts must preserve both absolute instants');
assert.equal(outing.forecastAt(foldedWeather, '2026-11-01T06:30Z').tempC, 11);
const now = Date.parse('2026-11-01T04:00Z');
const estimate = { provider: 'google', status: 'ready', travelMinutes: 60, durationSeconds: 3600, distanceMeters: 10000, transportMode: 'drive', timingBasis: 'route', updatedAt: new Date(now).toISOString(), expiresAt: new Date(now + 600000).toISOString(), originPlaceId: selected.id };
const schedule = { timeBasis: 'arrival', targetArrivalTime: '01:30', transportMode: 'drive', repeatEnabled: false, repeatDays: [] };
const timing = helpers.getDestinationTiming(estimate, schedule, 'America/New_York', now, 'GLOBAL', 'GLOBAL', selected.id);
assert.equal(timing.targetAt, '2026-11-01T05:30:00.000Z');
assert.equal(Date.parse(timing.arrivalAt) - Date.parse(timing.departureAt), 3600000);
const departureTiming = helpers.getDestinationTiming(estimate, { ...schedule, timeBasis: 'departure' }, 'America/New_York', now, 'GLOBAL', 'GLOBAL', selected.id);
assert.equal(departureTiming.departureAt, '2026-11-01T05:30:00.000Z');
assert.equal(departureTiming.arrivalAt, '2026-11-01T06:30:00.000Z');
const destination = { ...saved, place: { ...selected, timezone: 'America/New_York' }, schedulePreference: schedule, travelEstimate: estimate };
const snapshot = { ...result.destination, timezone: 'America/New_York', observedAt: new Date(now).toISOString(), stale: false, current: { ...result.destination.current, rainProbabilityPct: 100 }, hourly: [{ time: timing.departureAt, tempC: 10, rainProbabilityPct: 100, precipitationMm: 10, windMs: 1, condition: 'rain' }] };
function notification(snapshot, route = estimate) {
  const state = demo.buildDemoStateFromWeatherResult({ ...result, current: snapshot, destination: snapshot, destinationSnapshots: [snapshot] }, false, { hasDestination: true, destination: destination.place, savedDestinations: [{ ...destination, alertCondition: { ...destination.alertCondition, leadTimeMinutes: 0 }, travelEstimate: route }], notificationNow: now });
  return state.notifications.find(item => item.type === 'destination');
}
const active = notification(snapshot);
assert.equal(active.active, true);
assert.equal(active.scheduledAt, timing.departureAt);
for (const bad of [{ ...snapshot, stale: true }, { ...snapshot, source: 'fallback' }, { ...snapshot, locationUnverified: true }, { ...snapshot, locationId: 'other-place' }]) {
  const item = notification(bad);
  assert.equal(item.active, false);
  assert.equal(item.scheduledAt, undefined);
}
assert.equal(notification(snapshot, { ...estimate, provider: 'fallback', status: 'fallback' }).active, false);
console.log('PASS overseas fixture boundaries: search identity/country, isolated save/reload/weather request, no-route, DST/midnight, stale notification exclusion');
