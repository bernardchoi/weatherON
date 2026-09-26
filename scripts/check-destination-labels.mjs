import assert from "node:assert/strict";
import { build } from "esbuild";

const result = await build({ bundle: true, entryPoints: ["apps/mobile/src/state/appStateTypes.ts"], format: "cjs", platform: "node", write: false });
const module = { exports: {} };
new Function("module", "exports", result.outputFiles[0].text)(module, module.exports);
const { getDestinationLabelText, isDestinationLabel } = module.exports;

assert.equal(isDestinationLabel("home"), true);
assert.equal(isDestinationLabel("work"), true);
assert.equal(isDestinationLabel("other"), false);
assert.equal(isDestinationLabel(null), false);
assert.equal(getDestinationLabelText("home"), "집");
assert.equal(getDestinationLabelText("work"), "회사");
console.log("destination label check passed");
