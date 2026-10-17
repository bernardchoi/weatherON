import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync("apps/mobile/src/theme/reservedRegionLayout.ts", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const module = { exports: {} };
new Function("module", "exports", compiled)(module, module.exports);

const { resolveReservedContentRegion } = module.exports;
assert.deepEqual(resolveReservedContentRegion(760, 520, []), {
  x: 0, y: 0, width: 760, height: 520, avoidsReservedRegion: false,
});
assert.deepEqual(resolveReservedContentRegion(760, 520, [{ kind: "division", x: 340, y: 0, width: 40, height: 520 }]), {
  x: 380, y: 0, width: 380, height: 520, avoidsReservedRegion: true,
});
assert.deepEqual(resolveReservedContentRegion(760, 520, [{ kind: "occlusion", x: 0, y: 230, width: 760, height: 60 }]), {
  x: 0, y: 290, width: 760, height: 230, avoidsReservedRegion: true,
});
assert.deepEqual(resolveReservedContentRegion(760, 520, [{ kind: "occlusion", x: 200, y: 200, width: 80, height: 80 }]), {
  x: 0, y: 0, width: 760, height: 520, avoidsReservedRegion: false,
});

const nativeSource = readFileSync("apps/mobile/ios/WeatherON/LiquidGlassNavigationView.swift", "utf8");
assert.match(nativeSource, /#available\(iOS 27\.1, \*\)/);
assert.match(nativeSource, /payload\(for: \.occlusion, kind: "occlusion"\)/);
assert.match(nativeSource, /payload\(for: \.division, kind: "division"\)/);
assert.match(nativeSource, /reservedRegions\(kind: kind\)/);
const bridgeSource = readFileSync("apps/mobile/ios/WeatherON/LiquidGlassNavigationView.m", "utf8");
assert.match(bridgeSource, /RCT_EXTERN_MODULE\(ReservedRegionObserverView, RCTViewManager\)/);
assert.match(bridgeSource, /RCT_EXPORT_VIEW_PROPERTY\(onRegionsChange, RCTDirectEventBlock\)/);

console.log("PASS: reserved-region pane selection and the iOS 27.1 native bridge wiring are present; device pose rendering remains separate QA.");
