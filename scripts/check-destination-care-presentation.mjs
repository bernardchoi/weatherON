import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Render the actual screen with native/provider boundaries stubbed; no network or device state.
const element = (type, props, ...children) => ({ type, props: props ?? {}, children });
const React = { createElement: element, useState: value => [value, () => {}], useRef: value => ({ current: value }), useEffect() {} };
const icons = new Proxy({}, { get: (_, key) => String(key) });
const native = { ...React, Platform: { OS: 'ios' }, View: 'View', Text: 'Text', RawText: 'Text', LocalizedView: 'View', Image: 'Image', ScrollView: 'ScrollView', Animated: {}, Easing: {}, StyleSheet: { create: x => x, hairlineWidth: 0.5 }, useWindowDimensions: () => ({ width: 390, fontScale: 1 }) };
const boundary = {
  useAppTheme: () => ({}), useResponsiveLayout: () => ({}), useConfirmedOptionFeedback: () => ({}),
  recommendOutfit: () => ({ reasons: [], preparation: { ownedItemCount: 0, totalItemCount: 0, missingItemNames: [] } }),
  toUserPreferenceProfile: () => ({}), getDestinationImageAsset: () => 1,
  uiIconAssets: icons, ambientScreenIconOverrides: {}, spacing: {}, radius: {}, pageStyles: {},
  cardShadow: () => ({}), semanticColor: () => '', iosGlassSurface: () => undefined,
  getTransportModeLabel: () => '대중교통', forecastTime: () => '11/3 08:40', formatRouteClock: value => value.slice(11, 16),
  getRouteArrivalTimeIso: () => '2030-11-03T08:40:00+09:00',
};
const module = { exports: {} };
new Function('module', 'exports', 'require', ts.transpileModule(fs.readFileSync('apps/mobile/src/screens/DestinationCareScreen.tsx', 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.React, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText)(module, module.exports, id => id === 'react' ? React : id.endsWith('/localization/react-native') ? native : boundary);
const place = { id: 'test', name: '목적지', countryCode: 'KR', timezone: 'Asia/Seoul' };
const advice = { travelMinutes: 50, bufferMinutes: 0, recommendedDepartureTime: '07:50', arrivalAt: '2030-11-03T08:40:00+09:00' };
const props = { state: { destinationCare: { destinationWeather: { current: {} }, departureAdvice: advice }, destinationWeatherById: {} }, selectedDestinationPlace: place, savedDestinations: [], selectedDestinationSchedulePreference: { timeBasis: 'arrival', targetArrivalTime: '08:40', transportMode: 'transit', repeatEnabled: false, repeatDays: [] }, selectedDestinationTravelEstimate: { transportMode: 'transit', status: 'ready', message: '시간대 미반영' }, selectedDestinationAlertCondition: { leadTimeMinutes: 20 }, selectedDestinationDepartureAt: '2030-11-03T07:50:00+09:00', destinationCareEnabled: true, permissionReady: true };
function render(overrides = {}) {
  const nodes = [];
  function visit(node) { if (!node || typeof node !== 'object') return; if (Array.isArray(node)) return node.forEach(visit); nodes.push(node); node.children?.forEach(visit); }
  visit(module.exports.DestinationCareScreen({ ...props, ...overrides }));
  const text = nodes.flatMap(n => n.children.filter(x => typeof x === 'string')).join('\n');
  return { nodes, text };
}
const normal = render();
assert.match(normal.text, /출발 예상\n07:50/);
assert.match(normal.text, /11\/3 도착 예상\n08:40/);
assert.doesNotMatch(normal.text, /여유 \d+분/);
assert.match(normal.text, /교통·배차 미반영/);
assert.doesNotMatch(normal.text, /출발 추정|집 또는 회사를 지정/);
const controls = normal.nodes.filter(n => n.props.accessibilityRole === 'switch');
assert.equal(controls.length, 1);
assert.equal(controls[0].props.accessibilityState.checked, true);
let toggled = false;
render({ onToggleDestinationCare: () => { toggled = true; } }).nodes.find(n => n.props.accessibilityRole === 'switch').props.onPress();
assert.equal(toggled, true);
assert.equal(render({ destinationCareEnabled: false }).nodes.find(n => n.props.accessibilityRole === 'switch').props.accessibilityState.checked, false);
const departure = render({ selectedDestinationSchedulePreference: { ...props.selectedDestinationSchedulePreference, timeBasis: 'departure', targetArrivalTime: '07:50' } });
assert.match(departure.text, /출발\n07:50/);
assert.doesNotMatch(departure.text, /여유 20분/);
const unavailable = render({ state: { ...props.state, destinationCare: { ...props.state.destinationCare, departureAdvice: undefined } }, selectedDestinationDepartureAt: undefined });
assert.doesNotMatch(unavailable.text, /07:50|08:40/);
assert.match(unavailable.text, /경로 확인 전/);
const expired = render({ selectedDestinationDepartureAt: '2020-01-01T00:00:00Z' });
assert.match(expired.text, /시간 변경 필요/);
assert.doesNotMatch(expired.text, /07:50|08:40/);
assert.match(render({ selectedDestinationTravelEstimate: { ...props.selectedDestinationTravelEstimate, cacheStatus: 'stale', arrivalFeasible: false } }).text, /이전 조회 결과[\s\S]*출발 예상시각 지남/);
console.log('PASS destination care: timeline, arrival/departure basis, missing/expired timing, stale/late warnings and direct care switch');
