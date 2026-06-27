import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const fonts = {
  300: fontkit.openSync(join(root, "node_modules/@fontsource/manrope/files/manrope-latin-300-normal.woff")),
  800: fontkit.openSync(join(root, "node_modules/@fontsource/manrope/files/manrope-latin-800-normal.woff")),
};

const svgJobs = [
  ["assets/wordmark/wordmark-h-dark.svg", "assets/wordmark/wordmark-h-dark-outline.svg"],
  ["assets/wordmark/wordmark-h-light.svg", "assets/wordmark/wordmark-h-light-outline.svg"],
  ["assets/wordmark/wordmark-h-light-v2.svg", "assets/wordmark/wordmark-h-light-v2-outline.svg"],
  ["assets/wordmark/wordmark-v-dark.svg", "assets/wordmark/wordmark-v-dark-outline.svg"],
  ["assets/wordmark/wordmark-v-light.svg", "assets/wordmark/wordmark-v-light-outline.svg"],
  ["assets/wordmark/wordmark-v-light-v2.svg", "assets/wordmark/wordmark-v-light-v2-outline.svg"],
  ["assets/lockup/lockup-h-dark.svg", "assets/lockup/lockup-h-dark-outline.svg"],
  ["assets/lockup/lockup-h-light.svg", "assets/lockup/lockup-h-light-outline.svg"],
  ["assets/lockup/lockup-h-light-v2.svg", "assets/lockup/lockup-h-light-v2-outline.svg"],
  ["assets/lockup/lockup-v-dark.svg", "assets/lockup/lockup-v-dark-outline.svg"],
  ["assets/lockup/lockup-v-light.svg", "assets/lockup/lockup-v-light-outline.svg"],
  ["assets/lockup/lockup-v-light-v2.svg", "assets/lockup/lockup-v-light-v2-outline.svg"],
];

const pngJobs = [
  ["assets/wordmark/wordmark-h-dark-outline.svg", "assets/wordmark/wordmark-h-dark-preview.png", 500, 160],
  ["assets/wordmark/wordmark-h-light-outline.svg", "assets/wordmark/wordmark-h-light-preview.png", 500, 160],
  ["assets/wordmark/wordmark-h-light-v2-outline.svg", "assets/wordmark/wordmark-h-light-v2-preview.png", 500, 160],
  ["assets/wordmark/wordmark-v-dark-outline.svg", "assets/wordmark/wordmark-v-dark-preview.png", 360, 300],
  ["assets/wordmark/wordmark-v-light-outline.svg", "assets/wordmark/wordmark-v-light-preview.png", 360, 300],
  ["assets/wordmark/wordmark-v-light-v2-outline.svg", "assets/wordmark/wordmark-v-light-v2-preview.png", 360, 300],
  ["assets/lockup/lockup-h-dark-outline.svg", "assets/lockup/lockup-h-dark-preview.png", 640, 240],
  ["assets/lockup/lockup-h-light-outline.svg", "assets/lockup/lockup-h-light-preview.png", 640, 240],
  ["assets/lockup/lockup-h-light-v2-outline.svg", "assets/lockup/lockup-h-light-v2-preview.png", 640, 240],
  ["assets/lockup/lockup-v-dark-outline.svg", "assets/lockup/lockup-v-dark-preview.png", 440, 600],
  ["assets/lockup/lockup-v-light-outline.svg", "assets/lockup/lockup-v-light-preview.png", 440, 600],
  ["assets/lockup/lockup-v-light-v2-outline.svg", "assets/lockup/lockup-v-light-v2-preview.png", 440, 600],
];

const iconPngSizes = [16, 24, 32, 48, 64, 128, 180, 192, 256, 512, 1024];

function attrValue(attrs, name, fallback = "") {
  const match = attrs.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match ? match[1] : fallback;
}

function numAttr(attrs, name, fallback = 0) {
  const value = attrValue(attrs, name);
  return value ? Number.parseFloat(value) : fallback;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function textToPaths(text, attrs) {
  const weight = text === "N" ? 800 : 300;
  const font = fonts[weight];
  const fontSize = numAttr(attrs, "font-size", 44);
  const letterSpacing = numAttr(attrs, "letter-spacing", 0);
  const fill = attrValue(attrs, "fill", "#000");
  const anchor = attrValue(attrs, "text-anchor", "start");
  const x = numAttr(attrs, "x", 0);
  const y = numAttr(attrs, "y", 0);
  const run = font.layout(text);
  const scale = fontSize / font.unitsPerEm;
  const totalAdvance =
    run.positions.reduce((sum, position) => sum + position.xAdvance * scale, 0) +
    letterSpacing * Math.max(0, run.glyphs.length - 1);
  const baseX = anchor === "middle" ? x - totalAdvance / 2 : x;

  let cursor = 0;
  const paths = run.glyphs
    .map((glyph, index) => {
      const position = run.positions[index];
      const tx = baseX + cursor + position.xOffset * scale;
      const ty = y - position.yOffset * scale;
      cursor += position.xAdvance * scale;
      if (index < run.glyphs.length - 1) cursor += letterSpacing;

      return `  <path d="${escapeAttr(glyph.path.toSVG())}" transform="matrix(${round(scale)} 0 0 ${round(
        -scale,
      )} ${round(tx)} ${round(ty)})"/>`;
    })
    .join("\n");

  return `<g class="wordmark-outline-${weight}" fill="${escapeAttr(fill)}">\n${paths}\n</g>`;
}

function round(value) {
  return Number.parseFloat(value.toFixed(4));
}

async function buildOutlineSvg(sourcePath, targetPath) {
  const absoluteSource = join(root, sourcePath);
  const absoluteTarget = join(root, targetPath);
  const source = await readFile(absoluteSource, "utf8");
  const outlined = source
    .replace(/\s*<style>[\s\S]*?<\/style>\s*/g, "\n  ")
    .replace(/<text\b([^>]*)>([^<]+)<\/text>/g, (_, attrs, text) => textToPaths(text, attrs));

  await mkdir(dirname(absoluteTarget), { recursive: true });
  await writeFile(absoluteTarget, outlined, "utf8");
}

async function renderPng(sourcePath, targetPath, width, height) {
  const source = await readFile(join(root, sourcePath), "utf8");
  const image = await loadImage(Buffer.from(source));
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  await writeFile(join(root, targetPath), canvas.toBuffer("image/png"));
}

for (const [sourcePath, targetPath] of svgJobs) {
  await buildOutlineSvg(sourcePath, targetPath);
}

for (const [sourcePath, targetPath, width, height] of pngJobs) {
  await renderPng(sourcePath, targetPath, width, height);
}

for (const size of iconPngSizes) {
  await renderPng("assets/icon/icon-light-v2.svg", `assets/icon/icon-light-v2-${size}.png`, size, size);
}

console.log(`Generated ${svgJobs.length} outline SVGs, ${pngJobs.length} preview PNGs, and ${iconPngSizes.length} light v2 icon PNGs.`);
