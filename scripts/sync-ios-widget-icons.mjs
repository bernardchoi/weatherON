import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Keep the extension's artwork byte-identical to ambientAssets.ts / filledV3Assets.ts.
const catalog = "apps/mobile/ios/WeatherONWidget/AmbientIcons.xcassets";
const v3 = "assets/filled-surface-v3-20261015/png";
const weather = ["sun", "cloud", "night", "rain", "snow", "hail", "sleet", "mixed", "unknown", "fog", "wind"];
const ui = {
  location: `${v3}/compact/light/location.png`,
  outfit: `${v3}/compact/light/tab-outfit.png`,
  depart: `${v3}/compact/light/tab-depart.png`,
  umbrella: `${v3}/ui/umbrella.png`,
  outer: `${v3}/ui/wardrobe-outer.png`,
  bottom: `${v3}/ui/wardrobe-bottom.png`,
  shoes: `${v3}/ui/wardrobe-shoes.png`,
  time: `${v3}/ui/time.png`,
  temperature: `${v3}/ui/temperature.png`,
  droplet: `${v3}/ui/droplet.png`,
  wind: `${v3}/compact/light/wind.png`,
  check: `${v3}/ui/check.png`,
  walk: "assets/ui-icons/card-shoe.png",
  transit: "assets/ui-icons/place-transit.png",
};
const checking = process.argv.includes("--check");
function emit(path, value) {
  const text = JSON.stringify(value, null, 2) + "\n";
  if (checking) assert.equal(readFileSync(path, "utf8"), text, path);
  else writeFileSync(path, text);
}
function imageset(name, sources, template) {
  const folder = join(catalog, `${name}.imageset`);
  if (!checking) mkdirSync(folder, { recursive: true });
  const images = Object.entries(sources).map(([appearance, source]) => {
    const filename = `${appearance}.png`;
    const destination = join(folder, filename);
    if (checking) assert.ok(readFileSync(destination).equals(readFileSync(source)), `${name} differs from app icon`);
    else copyFileSync(source, destination);
    return { idiom: "universal", filename, ...(appearance === "dark" ? { appearances: [{ appearance: "luminosity", value: "dark" }] } : {}) };
  });
  emit(join(folder, "Contents.json"), { images, info: { author: "xcode", version: 1 }, properties: { "template-rendering-intent": template ? "template" : "original" } });
}
if (!checking) mkdirSync(catalog, { recursive: true });
emit(join(catalog, "Contents.json"), { info: { author: "xcode", version: 1 } });
for (const name of [...weather, "heavy-rain"]) {
  const source = (appearance) => name === "heavy-rain"
    ? `assets/ambient-surface-runtime-v1/hero/${appearance}/heavy-rain.png`
    : `${v3}/compact/${appearance}/${name}.png`;
  imageset(`ambient-weather-${name}`, { light: source("light"), dark: source("dark") }, false);
}
for (const [name, source] of Object.entries(ui)) imageset(`ambient-ui-${name}`, { light: source }, true);
console.log(`Widget icons ${checking ? "verified against" : "copied from"} app artwork: ${weather.length + 1} weather / ${Object.keys(ui).length} UI.`);
