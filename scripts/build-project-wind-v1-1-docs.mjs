import { createHash } from "node:crypto";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const windRoot = path.join(root, "docs", "Project Wind");
const packageDir = path.join(windRoot, "perfora_air_v1_1_experimental_addon");
const stableDir = path.join(windRoot, "perfora_air_v1_0_package");
const referenceDir = path.join(packageDir, "reference_v1_0");
const manifestPath = path.join(packageDir, "release-manifest.v1.1-experimental.json");
const readText = (file) => readFile(file, "utf8");
const writeText = (file, value) => writeFile(file, value.endsWith("\n") ? value : `${value}\n`, "utf8");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

for (const name of [
  "README.md",
  "QUALITY_GATES.md",
  "perfora-air.tokens.v1.0.json",
  "perfora-air.components.v1.0.json",
  "perfora-air.components.schema.v1.0.json",
  "release-manifest.v1.0.json",
]) {
  await copyFile(path.join(stableDir, name), path.join(referenceDir, name));
}

const sections = [
  "README.md",
  "docs/00_perfora_air_v1_1_experimental_index.md",
  "docs/01_experimental_direction_brief.md",
  "docs/02_experimental_data_to_atmosphere_mapping.md",
  "docs/03_experimental_components.md",
  "docs/04_experimental_figma_design_kit.md",
  "docs/05_usability_test_plan.md",
  "docs/06_weatheron_adoption_scope.md",
  "docs/07_implementation_package.md",
  "docs/08_brand_trademark_reexploration.md",
  "docs/09_static_validation_report.md",
];
const combined = (await Promise.all(sections.map((file) => readText(path.join(packageDir, file)))))
  .map((value) => value.trimEnd())
  .join("\n\n---\n\n");
await writeText(path.join(packageDir, "perfora_air_v1_1_experimental_all_docs.md"), combined);

const manifest = JSON.parse(await readText(manifestPath));
Object.assign(manifest, {
  name: "Project Wind / Ambient Surface Experimental Add-on",
  namingDecisionDate: "2026-07-16",
  designSystemName: "Ambient Surface",
  visualMaterial: "Matte Air",
  principles: ["Soft Density", "Quiet Signal", "Text First"],
  legacyCodename: "Perfora Air",
  publicNameStatus: "design-system-name-decided",
});
for (const file of manifest.files ?? []) {
  file.sha256 = sha256(await readText(path.join(packageDir, file.path)));
}
await writeText(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Project Wind v1.1 docs generated: ${path.relative(root, packageDir)}`);
console.log(`Sections: ${sections.length}; manifest files: ${manifest.files.length}`);
