// Source-level guards for the Nov 5–9 approved partial refinements.
// Separate from visual/native iOS checks; never claims screenshot equivalence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = name => fs.readFileSync(`apps/mobile/src/screens/${name}Screen.tsx`, 'utf8');
const home = read('Home');
const parser = home.slice(home.indexOf('const adviceClauses ='), home.indexOf('const itemNames =', home.indexOf('const adviceClauses =')));
const split = new Function('summary', `${parser};return {advice,timedForecast,forecastClock,forecastKind};`);
for (const kind of ['강수 가능', '눈 예보', '비 예보', '얼음·혼합 강수 예보']) {
 const result = split(`움직이기 편한 차림이 좋아요 · 방수 겉옷을 챙겨요 · 오늘 21:00 무렵 ${kind}`);
 assert.equal(result.forecastClock, '21:00'); assert.equal(result.forecastKind, kind);
 assert.deepEqual(result.advice, ['움직이기 편한 차림이 좋아요','방수 겉옷을 챙겨요']);
}
for (const source of ['새로운 중요 경고 · 알 수 없는 예보', '오늘 오후 비 가능', '내일 21:00 무렵 강수 가능']) {
 const result = split(source); assert.equal(result.timedForecast, undefined); assert.equal(result.advice.join(' · '), source);
}
assert.match(home, /Math.max\(20, viewportSpacing.planMargin\)/);
assert.match(home, /HomeWeatherMascot/); // Existing approved character integration is retained.
assert.match(read('AccountManagement'), /ProviderBrandIcon/);
assert.match(read('AccountManagement'), /LINE으로 연결했어요/);
assert.match(read('AccountManagement'), /accountAuthStatus !== "offline"/);
const native = fs.readFileSync('apps/mobile/ios/WeatherON/LiquidGlassNavigationView.swift','utf8');
assert.match(native, /UIGlassEffect\(style: \.regular\)/);
assert.match(native, /isReduceTransparencyEnabled/);
console.log('PASS approved design: four explicit forecast kinds, unknown warnings retained, character integration, account identity/status, native Glass and transparency fallback. Native device appearance remains unverified.');
