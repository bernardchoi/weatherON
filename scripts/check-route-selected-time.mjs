import assert from 'node:assert/strict';
import { handleProxyRoute } from '../apps/server/src/proxyCore.mjs';
const originalFetch = globalThis.fetch;
const calls = [];
const target = new Date(Date.now() + 86400000 * 2).toISOString();
const env = { KAKAO_REST_API_KEY: 'test', GOOGLE_MAPS_API_KEY: 'test', ROUTE_CACHE_TTL_MS: '0' };
globalThis.fetch = async input => {
  const url = new URL(input); calls.push(url);
  return new Response(JSON.stringify(url.hostname.includes('googleapis')
    ? { status: 'OK', rows: [{ elements: [{ status: 'OK', duration: { value: 3660 }, distance: { value: 18000 } }] }] }
    : { routes: [{ result_code: 0, summary: { duration: url.pathname.includes('future') ? 4200 : 3000, distance: 18000 } }] }));
};
async function route(mode, basis) {
  return (await handleProxyRoute(new URL(`https://test/routes/estimate?origin=37.54,127.05&destination=37.56,126.97&originCountryCode=KR&destinationCountryCode=KR&transportMode=${mode}&${basis}=${encodeURIComponent(target)}`), key => env[key], () => null)).payload;
}
try {
  for (const basis of ['departureTime', 'arrivalTime']) {
    const result = await route('transit', basis);
    assert.equal(result.provider, 'google-transit');
    assert.equal(result.travelMinutes, 61);
    assert.equal(calls.at(-1).searchParams.get(basis === 'arrivalTime' ? 'arrival_time' : 'departure_time'), String(Math.floor(Date.parse(target) / 1000)));
  }
  assert.equal((await route('drive', 'departureTime')).travelMinutes, 70);
  assert.equal(calls.at(-1).pathname, '/v1/future/directions');
  assert.equal(calls.at(-1).searchParams.get('departure_time'), new Date(Date.parse(target) + 9 * 3600000).toISOString().slice(0,16).replace(/[-T:]/g,''));
  const arrival = await route('drive', 'arrivalTime');
  assert.equal(arrival.travelMinutes, 70);
  assert.match(arrival.message, /역산/);
  assert.equal(calls.at(-1).searchParams.get('departure_time'), new Date(Date.parse(target) - 70 * 60000 + 9 * 3600000).toISOString().slice(0,16).replace(/[-T:]/g,''));
  globalThis.fetch = async () => new Response(JSON.stringify({ status: 'ZERO_RESULTS' }));
  const failed = await handleProxyRoute(new URL(`https://test/routes/estimate?origin=37.55,127.05&destination=37.56,126.97&transportMode=transit&departureTime=${encodeURIComponent(target)}`), key => env[key], () => null);
  assert.equal(failed.payload.status, 'fallback');
  console.log('PASS selected-time transit, future driving, arrival iteration, timezone and unavailable route');
} finally { globalThis.fetch = originalFetch; }
