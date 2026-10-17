import assert from "node:assert/strict";
import { build } from "esbuild";
const bundled = (await build({ entryPoints: ["apps/mobile/src/theme/tokens.ts"], bundle: true, platform: "node", format: "cjs", write: false, plugins: [{ name: "platform", setup(build) { build.onResolve({filter: /localization\/react-native$/}, () => ({path: "platform", namespace: "qa"})); build.onLoad({filter: /.*/, namespace: "qa"}, () => ({contents: "export const Platform={OS:\"ios\"};", loader: "js"})); }}] })).outputFiles[0].text;
const module = { exports: {} };
new Function("module", "exports", bundled)(module, module.exports);
const { appThemes, resolveAppTheme, semanticColor } = module.exports;
const luminance = hex => {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  return rgb.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
};
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((a,b)=>b-a); return (hi+.05)/(lo+.05); };
for (const mode of ["light", "dark"]) {
  const theme = appThemes[mode];
  let textMin = Infinity, onMin = Infinity;
  for (const surface of [theme.background, theme.backgroundAlt, theme.card, theme.cardSoft]) {
    for (const role of ["text", "muted", "clear", "gold", "success", "wordmarkOn", "sky", "warm", "alert"]) {
      const ratio = contrast(theme[role], surface);
      assert.ok(ratio >= 4.5, mode + " " + role + " on " + surface + ": " + ratio);
      textMin = Math.min(textMin, ratio);
      if (role === "wordmarkOn") onMin = Math.min(onMin, ratio);
    }
  }
  assert.ok(contrast(theme.onAlert, theme.alert) >= 4.5, mode + " destructive action foreground");
  assert.ok(contrast(theme.onAccent, theme.actionFill) >= 4.5, mode + " filled action foreground");
  for (const configured of [resolveAppTheme(mode, null, true), resolveAppTheme(mode, null, true, true)]) {
    assert.equal(configured.background, theme.background);
    assert.equal(configured.nav, theme.background, "opaque navigation must keep the common base");
    assert.equal(configured.materialTint, theme.materialTint);
  }
  assert.notEqual(theme.wordmarkOn, theme.actionFill, "wordmark must not recolor action controls");
  assert.notEqual(theme.success, theme.actionFill, "ready/completion status must not inherit action accent");
  assert.notEqual(semanticColor(theme, "successTint"), semanticColor(theme, "accentTint"));
  assert.notEqual(theme.materialTint, theme.skyLite, "weather information hue must not define Glass");
  assert.notEqual(theme.alert, theme.success);
  assert.notEqual(theme.warm, theme.success);
  console.log(mode + ": worst solid-surface text/label " + textMin.toFixed(2) + ":1; ON " + onMin.toFixed(2) + ":1; filled action " + contrast(theme.onAccent, theme.actionFill).toFixed(2) + ":1");
}
console.log("PASS brand identity, semantic roles, reduced-transparency navigation and solid-surface contrast. Native Glass/weather composition is checked separately.");
