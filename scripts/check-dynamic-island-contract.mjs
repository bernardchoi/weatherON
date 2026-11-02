import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import ts from "typescript";

// Swift is inspected as a source/build contract. PNG pixels and the actual
// TypeScript diagnostic parser execute here; no UIKit/ActivityKit rendering.
const live = readFileSync(process.env.DEPARTURE_ISLAND_SOURCE ?? "apps/mobile/ios/WeatherONWidget/WeatherONDepartureLiveActivity.swift", "utf8");
const widget = readFileSync("apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift", "utf8");
const native = readFileSync("apps/mobile/modules/weatheron-widget-data/ios/WeatheronWidgetDataModule.swift", "utf8");
const project = readFileSync("apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj", "utf8");
const appPlist = readFileSync("apps/mobile/ios/WeatherON/Info.plist", "utf8");
const extensionPlist = readFileSync("apps/mobile/ios/WeatherONWidget/Info.plist", "utf8");
assert.match(appPlist, /NSSupportsLiveActivities<\/key>\s*<true\/>/);
assert.match(extensionPlist, /com\.apple\.widgetkit-extension/);
assert.match(project, /WeatherONDepartureLiveActivity\.swift in Sources/);
assert.match(project, /WeatherONWidget\.appex in Embed App Extensions/);
assert.match(project, /AmbientIcons\.xcassets in Resources/);
const bundle = widget.slice(widget.indexOf("struct WeatherONWidgetBundle:"), widget.indexOf("#if DEBUG", widget.indexOf("struct WeatherONWidgetBundle:")));
assert.match(bundle, /WeatherONDepartureLiveActivity\(\)/);
assert.ok(!bundle.includes("supportedFamilies"), "Weather widget family restrictions do not gate the Activity sibling");
assert.match(native, /style: \.standard/);
assert.ok(!native.includes("style: .transient"));
assert.match(native, /staleDate: departureAt, relevanceScore: 80/);

const leading = live.match(/compactLeading: \{([\s\S]*?)\} compactTrailing:/)?.[1];
const trailing = live.match(/compactTrailing: \{([\s\S]*?)\} minimal:/)?.[1];
const minimal = live.match(/minimal: \{([\s\S]*?)\}\s*\.widgetURL/)?.[1];
assert.match(leading ?? "", /WeatherONDepartureGuidanceIcon/);
assert.match(trailing ?? "", /WeatherONDepartureCountdown[\s\S]*style: \.compact/);
assert.match(minimal ?? "", /WeatherONDepartureGuidanceIcon/);
assert.match(live, /DynamicIslandExpandedRegion\(\.leading\)/);
assert.match(live, /DynamicIslandExpandedRegion\(\.trailing\)/);
assert.match(live, /DynamicIslandExpandedRegion\(\.bottom\)/);
const glyph = live.slice(live.indexOf("private struct WeatherONDepartureGuidanceIcon:"), live.indexOf("private struct WeatherONDepartureLockScreenView:"));
assert.match(glyph, /WeatherONAmbientIcon\(symbol: weatherONDepartureIslandSymbol\(symbol\), size: 16\)/, "The icon-only minimal branch must normalize empty/unsupported symbols");
const normalizer = glyph.slice(glyph.indexOf("private func weatherONDepartureIslandSymbol"));
const rules = new Map([...normalizer.matchAll(/case "([^"]+)": return "([^"]+)"/g)].map(match => [match[1], match[2]]));
const fallback = normalizer.match(/default: return "([^"]+)"/)?.[1];
assert.equal(fallback, "figure.walk.departure");
const mappings = widget.slice(widget.indexOf("private var assetName: String?"), widget.indexOf("struct WeatherONAmbientLabel:"));
const assets = new Map();
for (const match of mappings.matchAll(/case ([^\n]+): return "([^"]+)"/g)) {
  for (const symbol of match[1].matchAll(/"([^"]+)"/g)) assets.set(symbol[1], match[2]);
}
for (const symbol of [undefined, "", " ", "unsupported-symbol", "umbrella.fill", "wind", "exclamationmark.clock.fill", "figure.walk.departure"]) {
  const resolved = rules.get(symbol) ?? fallback;
  assert.ok(assets.has(resolved), `${String(symbol)} must resolve to bundled app artwork, never an empty system glyph`);
}
for (const name of new Set([fallback, ...rules.values()].map(symbol => assets.get(symbol)))) {
  const path = `apps/mobile/ios/WeatherONWidget/AmbientIcons.xcassets/ambient-ui-${name}.imageset`;
  const info = JSON.parse(readFileSync(`${path}/Contents.json`, "utf8"));
  assert.equal(info.properties["template-rendering-intent"], "template");
  const img = await loadImage(`${path}/${info.images[0].filename}`);
  const canvas = createCanvas(img.width, img.height), ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  let count = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 0) count++;
  assert.ok(count > 0 && count < img.width * img.height, `${name} has a nonempty transparent silhouette`);
}
assert.match(widget, /\.frame\(width: size, height: size\)/);
assert.match(live, /case \.compact:\s*return 46/);
assert.match(live, /if isCompleted \{[\s\S]*else if isStale \{[\s\S]*else \{\s*Text\(/);
assert.match(live, /timerInterval: Date\(\)\.\.\.max\(Date\(\), departureAt\)/);
const accent = widget.match(/accent = dark \? Color\(red: (\d+)\/255, green: (\d+)\/255, blue: (\d+)\/255\)/);
assert.ok(accent);
const linear = n => n / 255 <= .04045 ? n / 255 / 12.92 : ((n / 255 + .055) / 1.055) ** 2.4;
const luminance = [.2126, .7152, .0722].reduce((sum, weight, i) => sum + weight * linear(Number(accent[i + 1])), 0);
assert.ok((luminance + .05) / .05 >= 4.5, "Island tint has visible contrast against system black");

const shared = {};
new Function("exports", ts.transpileModule(readFileSync("apps/mobile/src/providers/departureLiveActivity.shared.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(shared);
const parse = diagnostics => shared.parseDepartureLiveActivityStatus(JSON.stringify({ supported: true, enabled: true, active: true, diagnostics })).diagnostics;
const counts = { activityCount: 3, activeCount: 1, scheduledCount: 1, staleCount: 1 };
assert.deepEqual(parse(counts), counts);
assert.deepEqual(parse({ ...counts, pushToken: "must-not-propagate", destinationName: "must-not-propagate" }), counts);
for (const bad of [undefined, null, [], {}, { ...counts, activityCount: "3" }, { ...counts, activeCount: -1 }, { ...counts, scheduledCount: .5 }, { ...counts, staleCount: 4 }]) assert.equal(parse(bad), undefined);
const diagnostics = native.slice(native.indexOf("let diagnostics = ["), native.indexOf("]", native.indexOf("let diagnostics = [")));
assert.deepEqual([...diagnostics.matchAll(/"([^"]+)":/g)].map(match => match[1]).sort(), Object.keys(counts).sort(), "New native diagnostic fields contain counts only");
assert.match(native, /for await state in activity\.activityStateUpdates/);
assert.match(native, /departureStateTask\?\.cancel\(\)/);
for (const line of native.split("\n").filter(line => line.includes("departureLogger."))) {
  assert.ok(!/pushToken|activity\.id|attributes|payload|destination|guidance|localizedDescription|departureAt|coordinate/.test(line), "Departure diagnostic logs cannot include tokens, identifiers or trip content");
}
console.log("PASS: Dynamic Island Swift/build contracts, icon-only nil/empty/unsupported fallback, actual bundled alpha pixels, 16pt glyph/46pt timer paths, dark tint contrast, lifecycle observer and executed safe diagnostic parser. No SwiftUI/ActivityKit/device rendering claimed.");
