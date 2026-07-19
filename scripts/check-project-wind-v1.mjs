import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = path.join(root, "docs", "Project Wind", "perfora_air_v1_0_package");
const read = (name) => readFile(path.join(packageDir, name), "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const [tokensText, componentsText, tokenCss, componentCss, types, tokenMap, dashboard, manifestText] = await Promise.all([
  read("perfora-air.tokens.v1.0.json"),
  read("perfora-air.components.v1.0.json"),
  read("perfora-air.v1.0.css"),
  read("perfora-air.components.v1.0.css"),
  read("perfora-air.component-types.v1.0.ts"),
  read("perfora-air.token-map.v1.0.ts"),
  read("reference-dashboard.v1.0.html"),
  read("release-manifest.v1.0.json"),
]);

const tokens = JSON.parse(tokensText);
const components = JSON.parse(componentsText);
const manifest = JSON.parse(manifestText);

check(tokens.$metadata?.version === "1.0.0", "token version must be 1.0.0");
check(tokens.$metadata?.status === "stable", "token status must be stable");
check(tokens.$metadata?.designSystemName === "Ambient Surface", "token design system name mismatch");
check(tokens.$metadata?.visualMaterial === "Matte Air", "token visual material mismatch");
check(JSON.stringify(tokens.$metadata?.principles) === JSON.stringify(["Soft Density", "Quiet Signal", "Text First"]), "token principles mismatch");
check(components.$metadata?.version === "1.0.0", "component version must be 1.0.0");
check(components.$metadata?.status === "stable", "component status must be stable");
check(components.$metadata?.designSystemName === "Ambient Surface", "component design system name mismatch");
check(components.$metadata?.visualMaterial === "Matte Air", "component visual material mismatch");
check(components.$metadata?.tokenDependency === "perfora-air.tokens.v1.0.json", "component token dependency mismatch");
check(manifest.version === "1.0.0" && manifest.status === "stable-internal", "release manifest mismatch");
check(manifest.designSystemName === "Ambient Surface", "manifest design system name mismatch");
check(manifest.visualMaterial === "Matte Air", "manifest visual material mismatch");
check(JSON.stringify(manifest.principles) === JSON.stringify(["Soft Density", "Quiet Signal", "Text First"]), "manifest principles mismatch");

const tokenPaths = new Set();
const aliases = [];
function visitTokens(value, prefix = []) {
  if (!value || typeof value !== "object") return;
  if (Object.hasOwn(value, "$value")) {
    tokenPaths.add(prefix.join("."));
    if (typeof value.$value === "string") {
      for (const match of value.$value.matchAll(/\{([^}]+)\}/g)) aliases.push({ owner: prefix.join("."), target: match[1] });
    }
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith("$")) visitTokens(child, [...prefix, key]);
  }
}
visitTokens(tokens);
for (const alias of aliases) check(tokenPaths.has(alias.target), `missing token alias: ${alias.owner} -> ${alias.target}`);

const requiredModes = ["day", "dusk", "night", "rainy", "reducedMotion", "reducedTransparency", "highContrast", "lowPower", "focus"];
for (const mode of requiredModes) check(Boolean(tokens.mode?.[mode]), `missing mode: ${mode}`);

const requiredComponents = [
  "SurfaceFrame", "DensityField", "AirButton", "ContextChip", "AtmospherePanel",
  "SignalCard", "DataVeil", "LumenRing", "FlowDock", "AmbientTimeline",
];
for (const name of requiredComponents) {
  check(components.components?.[name]?.status === "stable", `component not stable: ${name}`);
  for (const ref of components.components?.[name]?.tokens ?? []) {
    const prefix = ref.endsWith(".*") ? ref.slice(0, -2) : ref;
    check([...tokenPaths].some((tokenPath) => tokenPath === prefix || tokenPath.startsWith(`${prefix}.`)), `missing component token ref: ${name} -> ${ref}`);
  }
}

const css = `${tokenCss}\n${componentCss}`;
const definitions = new Set([...css.matchAll(/(--pa-[a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
const usages = new Set([...css.matchAll(/var\((--pa-[a-z0-9-]+)/gi)].map((match) => match[1]));
for (const name of usages) check(definitions.has(name), `undefined CSS custom property: ${name}`);

for (const [label, value] of [["component CSS", componentCss], ["types", types], ["token map", tokenMap], ["dashboard", dashboard]]) {
  check(!/v0\.1/i.test(value), `${label} still references v0.1`);
}

const dashboardRequirements = [
  ["skip link", 'class="skip-link"'],
  ["live region", 'aria-live="polite"'],
  ["pressed state", "aria-pressed"],
  ["current page", "aria-current"],
  ["reduced motion", "prefers-reduced-motion"],
  ["reduced transparency", "prefers-reduced-transparency"],
  ["44px target", "44px"],
  ["responsive media query", "@media"],
];
for (const [label, needle] of dashboardRequirements) check(dashboard.includes(needle), `reference dashboard missing ${label}`);

for (const file of manifest.files ?? []) {
  const content = await read(file.path);
  check(sha256(content) === file.sha256, `hash mismatch: ${file.path}`);
}

if (failures.length) {
  console.error("PROJECT WIND V1 CHECK FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PROJECT WIND V1 CHECK PASS");
console.log(`tokens=${tokenPaths.size} aliases=${aliases.length} components=${requiredComponents.length} cssVars=${definitions.size}`);
