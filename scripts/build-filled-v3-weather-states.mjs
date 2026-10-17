import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = "assets/filled-surface-v3-20261015";
const palettes = {
  light: { cloud: "#547F94", front: "#4B9EAD", info: "#1A6399", pale: "#D5EAEC", ink: "#183844", bg: "#E9F6F8" },
  dark: { cloud: "#4097AA", front: "#F4F8F8", info: "#58BFFF", pale: "#244854", ink: "#F4F8F8", bg: "#102B38" },
};
const cloud = (palette) => `<path d="M10 34C7 25 16 17 24 20C28 9 43 8 48 20C57 20 61 27 57 34Z" fill="${palette.cloud}"/><path d="M15 43C7 43 5 38 6 33C7 28 11 25 17 25C18 17 24 13 31 14C38 14 42 19 43 25C50 23 57 28 58 34C59 40 54 44 48 44H15Z" fill="${palette.front}"/>`;
const svg = (title, body, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img"><title>${title} · v3 ${size}</title>${body}</svg>`;

function content(name, palette, size) {
  const scale = size === "hero" ? "translate(-1 -1) scale(1.03)" : "";
  if (name === "sleet") return svg("진눈깨비", `<g transform="${scale}">${cloud(palette)}<path d="m16 49 6-6m7 13 6-6m7 7 6-6" fill="none" stroke="${palette.info}" stroke-width="4" stroke-linecap="round"/><circle cx="19" cy="53" r="2.8" fill="${palette.pale}"/><circle cx="32" cy="57" r="2.8" fill="${palette.pale}"/><circle cx="45" cy="51" r="2.8" fill="${palette.pale}"/></g>`, size);
  if (name === "mixed") return svg("비와 눈", `<g transform="${scale}">${cloud(palette)}<path d="M18 46c-3 5-4 7-4 9a4 4 0 0 0 8 0c0-2-1-4-4-9Z" fill="${palette.info}"/><path d="m37 47 8 8m0-8-8 8m4-11v14" stroke="${palette.ink}" stroke-width="3" stroke-linecap="round"/></g>`, size);
  return svg("날씨 확인 중", `<g transform="${scale}"><circle cx="32" cy="32" r="26" fill="${palette.cloud}" opacity=".46"/><path d="M32 8a24 24 0 0 1 0 48Z" fill="${palette.front}"/><path d="M23 25c1-7 17-8 18 1 1 7-7 7-7 13" fill="none" stroke="${palette.ink}" stroke-width="6" stroke-linecap="round"/><circle cx="34" cy="48" r="3.5" fill="${palette.ink}"/></g>`, size);
}

async function render(svgValue, target) {
  const canvas = createCanvas(192, 192);
  canvas.getContext("2d").drawImage(await loadImage(Buffer.from(svgValue)), 0, 0, 192, 192);
  writeFileSync(target, canvas.toBuffer("image/png"));
}

async function preview(mode) {
  const canvas = createCanvas(720, 240);
  const context = canvas.getContext("2d");
  const palette = palettes[mode];
  context.fillStyle = palette.bg; context.fillRect(0, 0, 720, 240);
  context.fillStyle = palette.ink; context.font = "600 28px sans-serif"; context.fillText(`New weather states · ${mode}`, 28, 42);
  for (const [index, name] of ["hail", "sleet", "mixed", "unknown"].entries()) {
    const x = 28 + index * 170;
    context.fillStyle = `${palette.ink}12`; context.beginPath(); context.roundRect(x, 64, 132, 132, 30); context.fill();
    const file = name === "hail" ? path.join(root, "svg", "compact", mode, "hail.svg") : null;
    const image = file ? await loadImage(file) : await loadImage(Buffer.from(content(name, palette, "compact")));
    context.drawImage(image, x + 28, 78, 76, 76);
    context.fillStyle = palette.ink; context.font = "600 16px sans-serif"; context.textAlign = "center"; context.fillText(name, x + 66, 178);
  }
  writeFileSync(path.join(root, "previews", `filled-weather-states-${mode}.png`), canvas.toBuffer("image/png"));
}

async function smallPreview(mode) {
  const canvas = createCanvas(720, 250);
  const context = canvas.getContext("2d");
  const palette = palettes[mode];
  context.fillStyle = palette.bg; context.fillRect(0, 0, 720, 250);
  context.fillStyle = palette.ink; context.font = "600 28px sans-serif"; context.fillText(`Weather legibility · ${mode}`, 28, 42);
  const sizes = [16, 22, 28];
  for (const [index, name] of ["hail", "sleet", "mixed", "unknown"].entries()) {
    const x = 28 + index * 170;
    context.fillStyle = `${palette.ink}12`; context.beginPath(); context.roundRect(x, 64, 132, 142, 30); context.fill();
    const file = name === "hail" ? path.join(root, "svg", "compact", mode, "hail.svg") : null;
    const image = file ? await loadImage(file) : await loadImage(Buffer.from(content(name, palette, "compact")));
    context.fillStyle = palette.ink; context.font = "600 16px sans-serif"; context.textAlign = "center"; context.fillText(name, x + 66, 92);
    for (const [position, size] of sizes.entries()) {
      context.drawImage(image, x + 30 + position * 36 - size / 2, 138 - size / 2, size, size);
      context.fillStyle = palette.ink; context.font = "500 11px sans-serif"; context.fillText(String(size), x + 30 + position * 36, 180);
    }
  }
  writeFileSync(path.join(root, "previews", `filled-weather-states-small-${mode}.png`), canvas.toBuffer("image/png"));
}

for (const [mode, palette] of Object.entries(palettes)) for (const size of ["compact", "hero"]) for (const name of ["sleet", "mixed", "unknown"]) {
  const value = content(name, palette, size);
  assert.match(value, /<title>/);
  const svgTarget = path.join(root, "svg", size, mode, `${name}.svg`);
  const pngTarget = path.join(root, "png", size, mode, `${name}.png`);
  mkdirSync(path.dirname(svgTarget), { recursive: true }); mkdirSync(path.dirname(pngTarget), { recursive: true });
  writeFileSync(svgTarget, value); await render(value, pngTarget);
}
mkdirSync(path.join(root, "previews"), { recursive: true });
for (const mode of Object.keys(palettes)) { await preview(mode); await smallPreview(mode); }
console.log("Rendered filled v3 sleet, mixed precipitation, and unknown weather assets with light/dark previews.");
