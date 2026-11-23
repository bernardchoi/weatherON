import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';

const source = fs.readFileSync('apps/mobile/src/screens/HomeScreen.tsx', 'utf8');
const ast = ts.createSourceFile('HomeScreen.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const fn = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === 'HomeDecisionHero');
const code = ts.transpileModule(fn.getText(ast) + '\nresult=HomeDecisionHero(input);', {
  compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
}).outputText;
let sizeExpression;
function findSize(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'mascotSize') sizeExpression = node.initializer.getText(ast);
  ts.forEachChild(node, findSize);
}
findSize(ast);
assert.ok(sizeExpression);
const flattenStyle = style => Object.assign({}, ...(Array.isArray(style) ? style.flat(Infinity) : [style]).filter(Boolean));
const descendants = node => {
  if (!node || typeof node !== 'object') return [];
  return [node, ...(node.children ?? []).flat(Infinity).flatMap(descendants)];
};
let cases = 0;
for (const width of [181, 288, 319, 320, 359, 360, 375, 390, 430, 440, 744])
for (const fontScale of [1, 1.3, 1.31, 2, 3.12])
for (const mode of ['light', 'dark'])
for (const language of ['ko', 'en', 'ja'])
for (const withMascot of [true, false])
for (const compact of [true, false]) {
  const layout = { width, isShort: false, homePanelPadding: 12, screenHorizontalPadding: width < 380 ? 16 : width >= 430 ? 28 : 20 };
  const density = { compact: compact && fontScale <= 1.3, mascotMax: compact ? 148 : 176, heroLine: 76, heroTemperature: 76 };
  const mascotSize = vm.runInNewContext(sizeExpression, { layout, density });
  const regions = [];
  let opened = 0;
  const context = {
    useRef: () => ({ current: null }), result: null, LocalizationContext: {}, translateText: v => v,
    React: { use: () => ({ language }), createElement: (type, props, ...children) => ({ type, props, children }) },
    Platform: { OS: 'ios' }, styles: { iosWeatherMain: { flexDirection: 'row', minHeight: 100 }, iosWeatherCopy: { flex: 1, gap: 2 } },
    View: 'View', Text: 'Text', Image: 'Image', FeedbackPressable: 'FeedbackPressable', HomeValueTransition: 'HomeValueTransition',
    useWindowDimensions: () => ({ fontScale }), useResponsiveLayout: () => layout,
    ambientWeatherIcon: () => null, formatTemperature: v => String(v), getConditionLabel: v => v,
    getHeroTemperatureRange: () => '최고 120° · 최저 −98°',
    input: {
      density, mascotSize,
      mascot: withMascot ? { type: 'mascot', props: { size: mascotSize } } : undefined,
      current: { condition: '흐림', tempC: -128, feelsLikeC: -98, rainProbabilityPct: 0 },
      isNight: false, currentLocationName: '테스트', todayMinMax: { minTempC: -98, maxTempC: 120 },
      temperatureUnit: 'fahrenheit', theme: { name: mode }, onOpenForecast() { opened++; },
      onReadingRegion(id) { regions.push(id); },
    },
  };
  vm.runInNewContext(code, context);
  const nodes = descendants(context.result);
  const byId = id => nodes.find(n => n.props?.testID === id);
  const main = byId('home-weather-main');
  const summary = byId('home-weather-summary');
  const details = byId('home-weather-details');
  const temperature = byId('home-current-temperature');
  const slot = byId('home-weather-character-slot');
  const stacked = fontScale > 1.3 || width < (density.compact ? 320 : 360);
  assert.equal(flattenStyle(main.props.style).flexDirection, stacked ? 'column' : 'row');
  assert.ok(main.children.includes(summary), 'summary is one direct weather-row child');
  const summaryNodes = descendants(summary);
  assert.ok(summaryNodes.includes(temperature) && summaryNodes.includes(details), 'temperature and all details share the left column');
  assert.ok(summaryNodes.indexOf(temperature) < summaryNodes.indexOf(details), 'reading order starts with current temperature');
  assert.equal(nodes.some(n => n.props?.testID === 'home-weather-details-character'), false, 'no extra details/character row under temperature');
  assert.ok(flattenStyle(temperature.props.style).fontSize > 0);
  assert.equal(temperature.props.numberOfLines, undefined, 'long temperatures may grow rather than truncate');
  assert.equal(temperature.props.adjustsFontSizeToFit, false);
  for (const node of summaryNodes.filter(n => n.type === 'Text')) {
    assert.equal(node.props.numberOfLines, undefined, 'weather text is not line-clamped');
  }
  for (const node of [context.result, main, summary, details]) {
    const style = flattenStyle(node.props.style);
    assert.equal(style.height, undefined, 'reading regions grow with content');
    assert.equal(style.maxHeight, undefined);
    assert.notEqual(style.overflow, 'hidden');
  }
  assert.ok(byId('home-feels-like'));
  assert.equal(nodes.filter(n => n.type === 'mascot').length, withMascot ? 1 : 0);
  assert.ok(mascotSize <= width - 2 * layout.screenHorizontalPadding, 'character fits even an unusually narrow content pane');
  if (withMascot) {
    assert.ok(main.children.includes(slot), 'character is the right sibling of the complete summary');
    assert.equal(slot.props.pointerEvents, 'none');
    assert.equal(slot.props.style.flexShrink, 0);
    assert.ok(mascotSize >= (density.compact && width < 360 ? 110 : width < 390 ? 120 : 144) || width < 320, 'character remains legible at each density');
  } else {
    assert.equal(slot, undefined);
  }
  nodes.forEach(n => n.props?.onLayout?.());
  assert.ok(regions.includes('hero-copy') && regions.includes('hero-details'), 'ambient reading-region measurements remain registered');
  assert.equal(main.props.accessibilityRole, 'button');
  main.props.onPress();
  assert.equal(opened, 1);
  cases++;
}
assert.doesNotMatch(source.slice(source.indexOf('<View ref={readHeaderRef}'), source.indexOf('testID="home-decision-stack"')), /HomeWeatherMascot/);
assert.match(source, /state=\{mascotState\}/);
assert.match(source, /maxFontSizeMultiplier=\{Platform.OS === "ios" \? 1.3 : undefined\}/);
assert.doesNotMatch(fs.readFileSync('apps/mobile/src/components/HomeWeatherMascot.tsx', 'utf8'), /home-mascot-dark-contrast/);
console.log('PASS: ' + cases + ' actual hero JSX cases; compact shared summary/character row, narrow and large-type fallback, uncropped reading regions, weather action, ambient measurements, larger character and no dark circle. Geometry/native pixels remain unverified.');
