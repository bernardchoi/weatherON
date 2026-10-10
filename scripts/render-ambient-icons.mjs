import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Deterministic runtime derivatives; the approved source SVGs are never modified.
const source = "assets/brand/ambient-surface-ui-icons-final-v1-20261009";
const target = "assets/ambient-surface-runtime-v1";
const inventory = [];
for (const folder of ["ui-outline", "tabs-selected", "hero/light", "hero/dark", "compact-32/light", "compact-32/dark"]) {
  const { readdirSync } = await import("node:fs");
  for (const name of readdirSync(`${source}/${folder}`).filter(n => n.endsWith(".svg"))) {
    const original = readFileSync(`${source}/${folder}/${name}`);
    const size = folder.startsWith("hero") ? 256 : 96;
    const svg = original.toString().replaceAll("currentColor", "#111111").replace("<svg ", `<svg width="${size}" height="${size}" `);
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(await loadImage(Buffer.from(svg)), 0, 0, size, size);
    const outputFolder = `${target}/${folder}`;
    mkdirSync(outputFolder, { recursive: true });
    writeFileSync(`${outputFolder}/${name.replace(".svg", ".png")}`, canvas.toBuffer("image/png"));
    inventory.push({ source: `${folder}/${name}`, sha256: createHash("sha256").update(original).digest("hex"), pixels: size });
  }
}
writeFileSync(`${target}/source-manifest.json`, JSON.stringify(inventory, null, 2) + "\n");
console.log(`Rendered ${inventory.length} approved SVGs without modifying the sources.`);
