import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = "assets/filled-surface-v3-20261015";
const assets = [
  ["compact/light/tab-my", 288],
  ["compact/dark/tab-my", 288],
];

for (const [relativePath, size] of assets) {
  const svg = readFileSync(path.join(root, "svg", `${relativePath}.svg`));
  const canvas = createCanvas(size, size);
  canvas.getContext("2d").drawImage(await loadImage(svg), 0, 0, size, size);
  writeFileSync(path.join(root, "png", `${relativePath}.png`), canvas.toBuffer("image/png"));
}

const preview = createCanvas(960, 400);
const context = preview.getContext("2d");
const styleSvg = readFileSync(path.join(root, "svg/ui/style.svg"));
for (const [index, [name, background, ink]] of [["Light", "#E9F6F8", "#183844"], ["Dark", "#102B38", "#C4DCE3"]].entries()) {
  const x = index * 480;
  context.fillStyle = background;
  context.fillRect(x, 0, 480, 400);
  context.fillStyle = ink;
  context.font = "600 30px sans-serif";
  context.fillText(`${name} · Style criteria`, x + 44, 60);
  context.fillStyle = `${ink}18`;
  context.beginPath(); context.roundRect(x + 44, 104, 392, 208, 34); context.fill();
  context.drawImage(await loadImage(Buffer.from(styleSvg.toString().replaceAll("#000000", ink))), x + 201, 142, 78, 78);
  context.fillStyle = ink;
  context.font = "600 22px sans-serif";
  context.fillText("26pt logical · 78px @3x", x + 118, 266);
  context.fillStyle = ink;
  context.globalAlpha = .72;
  context.font = "500 18px sans-serif";
  context.fillText("192px SVG-derived raster", x + 146, 296);
  context.globalAlpha = 1;
}
mkdirSync(path.join(root, "previews"), { recursive: true });
writeFileSync(path.join(root, "previews/style-density-light-dark.png"), preview.toBuffer("image/png"));

console.log(`Rendered ${assets.length} source-SVG runtime derivatives and a light/dark density preview.`);
