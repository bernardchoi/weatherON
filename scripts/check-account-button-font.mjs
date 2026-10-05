import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
// Exercise the real global Text patch without native modules or an account session.
const source = stripTypeScriptTypes(readFileSync("apps/mobile/src/theme/fonts.ts", "utf8"))
  .replace(/^import .*;$/m, "").replace(/^export /gm, "");
const Text = { render: (props) => props };
const flatten = (style) => Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : style ?? {};
const apply = new Function("Text", "StyleSheet", "require", `${source}; return applyPretendardToText;`)(Text, { flatten }, () => "fixture-font");
apply(); const patched = Text.render; apply(); assert.equal(Text.render, patched);
for (const fontFamily of ["GoogleSans", "System", "sans-serif"]) {
  const props = { style: [{ fontSize: 14 }, { fontFamily, fontWeight: "500" }] };
  assert.equal(Text.render(props), props, "Explicit font and weight pass through unchanged");
}
assert.equal(flatten(Text.render({ style: { fontWeight: "800" } }).style).fontFamily, "Pretendard-ExtraBold");
assert.equal(flatten(Text.render({}).style).fontFamily, "Pretendard");
console.log("PASS: explicit provider/system fonts, default Pretendard weights, idempotent patch");
