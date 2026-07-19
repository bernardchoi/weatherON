import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = path.join(root, "docs", "Project Wind", "perfora_air_v1_1_experimental_addon");
const stableDir = path.join(root, "docs", "Project Wind", "perfora_air_v1_0_package");
const read = (name) => readFile(path.join(packageDir, name), "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const requiredFiles = [
  "README.md",
  "CHANGELOG.md",
  "QUALITY_GATES.md",
  "release-manifest.v1.1-experimental.json",
  "docs/00_perfora_air_v1_1_experimental_index.md",
  "docs/01_experimental_direction_brief.md",
  "docs/02_experimental_data_to_atmosphere_mapping.md",
  "docs/03_experimental_components.md",
  "docs/05_usability_test_plan.md",
  "docs/06_weatheron_adoption_scope.md",
  "data/perfora-air.experimental-data-map.v1.1.json",
  "data/perfora-air.experimental-data-map.v1.1.ts",
  "data/perfora-air.experimental-components.v1.1.json",
  "data/perfora-air.experimental-component-types.v1.1.ts",
  "data/perfora-air.experimental-components.v1.1.css",
  "tests/perfora-air.experimental-usability.scorecard.v1.1.json",
  "implementation/react/src/index.ts",
  "implementation/swiftui/PerforaAirComponents.swift",
  "reference_v1_0/release-manifest.v1.0.json",
];

for (const file of requiredFiles) check(existsSync(path.join(packageDir, file)), `missing v1.1 add-on file: ${file}`);
check(existsSync(path.join(stableDir, "release-manifest.v1.0.json")), "missing stable v1.0 package dependency");

const [manifestText, readme, quality, dataMapText, componentsText, adoptionText, reactIndex, swiftui] = await Promise.all([
  read("release-manifest.v1.1-experimental.json"),
  read("README.md"),
  read("QUALITY_GATES.md"),
  read("data/perfora-air.experimental-data-map.v1.1.json"),
  read("data/perfora-air.experimental-components.v1.1.json"),
  read("docs/06_weatheron_adoption_scope.md"),
  read("implementation/react/src/index.ts"),
  read("implementation/swiftui/PerforaAirComponents.swift"),
]);

const manifest = JSON.parse(manifestText);
const dataMap = JSON.parse(dataMapText);
const components = JSON.parse(componentsText);

check(manifest.version === "1.1.0-experimental", "manifest version must be 1.1.0-experimental");
check(manifest.status === "experimental-add-on", "manifest status must be experimental-add-on");
check(manifest.designSystemName === "Ambient Surface", "manifest design system name mismatch");
check(manifest.visualMaterial === "Matte Air", "manifest visual material mismatch");
check(JSON.stringify(manifest.principles) === JSON.stringify(["Soft Density", "Quiet Signal", "Text First"]), "manifest principles mismatch");
check(manifest.currentWeatherOnUiReplacement === false, "v1.1 add-on must not replace current WeatherON UI");
check(manifest.stableDependency === "../perfora_air_v1_0_package/release-manifest.v1.0.json", "manifest stable dependency mismatch");
check(dataMap.$metadata?.version === "1.1.0-experimental", "data map version mismatch");
check(dataMap.$metadata?.status === "experimental-add-on", "data map status mismatch");
check(dataMap.$metadata?.stableDependency === "perfora_air_v1_0_package", "data map stable dependency missing");
check(components.$metadata?.version === "1.1.0-experimental", "components version mismatch");
check(components.$metadata?.status === "experimental-add-on", "components status mismatch");
check(components.$metadata?.dependsOn?.includes("../perfora_air_v1_0_package/perfora-air.tokens.v1.0.json"), "components must depend on v1.0 tokens");

for (const componentName of ["AtmospherePanel", "SignalCard", "LumenRing", "AmbientTimeline"]) {
  check(Boolean(components.components?.[componentName]), `missing experimental component: ${componentName}`);
}

for (const [label, content, needle] of [
  ["README", readme, "v1.0 stable 패키지가 여전히 Project Wind의 공식 기준점"],
  ["README naming", readme, "Ambient Surface는 공식 디자인 시스템명이다."],
  ["QUALITY_GATES", quality, "v1.0 stable token/component 계약"],
  ["WeatherON adoption", adoptionText, "Do **not** replace the current WeatherON MVP/launch UI wholesale."],
  ["React starter", reactIndex, "AtmospherePanel"],
  ["SwiftUI starter", swiftui, "PAAtmospherePanel"],
]) {
  check(content.includes(needle), `${label} missing expected guardrail: ${needle}`);
}

for (const file of manifest.files ?? []) {
  const content = await read(file.path);
  check(sha256(content) === file.sha256, `hash mismatch: ${file.path}`);
}

if (failures.length) {
  console.error("PROJECT WIND V1.1 ADD-ON CHECK FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PROJECT WIND V1.1 ADD-ON CHECK PASS");
console.log(`files=${manifest.files.length} components=4 dependency=${manifest.stableDependency}`);
