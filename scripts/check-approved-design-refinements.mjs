// Source-level guards for the Nov 5–9 approved partial refinements.
// Separate from visual/native iOS checks; never claims screenshot equivalence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = name => fs.readFileSync(`apps/mobile/src/screens/${name}Screen.tsx`, 'utf8');
const home = read('Home');
const precipitation = fs.readFileSync('apps/mobile/src/components/OutfitPrecipitationRow.tsx', 'utf8');
assert.match(home, /marginTop: Platform.OS === "ios" \? \(density.compact \? 2 : viewportSpacing.planMargin\)/);
assert.match(home, /<OutfitPrecipitationRow testID="home-outfit-precipitation" forecast=\{precipitation\}/);
assert.match(read('Outfit'), /<OutfitPrecipitationRow testID="outfit-precipitation"/);
assert.match(precipitation, /borderTopWidth: StyleSheet.hairlineWidth/);
assert.match(home, /HomeWeatherMascot/); // Existing approved character integration is retained.
assert.match(read('AccountManagement'), /ProviderBrandIcon/);
assert.match(read('AccountManagement'), /LINE으로 연결했어요/);
assert.match(read('AccountManagement'), /accountAuthStatus !== "offline"/);
const native = fs.readFileSync('apps/mobile/ios/WeatherON/LiquidGlassNavigationView.swift','utf8');
assert.match(native, /UIGlassEffect\(style: \.regular\)/);
assert.match(native, /isReduceTransparencyEnabled/);
console.log('PASS approved design: four explicit forecast kinds, unknown warnings retained, character integration, account identity/status, native Glass and transparency fallback. Native device appearance remains unverified.');
