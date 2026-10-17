import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = "assets/filled-surface-v3-20261015";
const black = "#000000";
const svg = (title, layers) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img"><title>${title} · v3 filled surface</title>${layers.join("")}</svg>`;
const layer = (d, opacity = 1, extra = "") => `<path d="${d}" fill="${black}" fill-opacity="${opacity}" ${extra}/>`;
const circle = (cx, cy, r, opacity = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${black}" fill-opacity="${opacity}"/>`;
const rect = (x, y, width, height, rx, opacity = 1) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${black}" fill-opacity="${opacity}"/>`;
const stroke = (d, opacity = 1) => `<path d="${d}" fill="none" stroke="${black}" stroke-opacity="${opacity}" stroke-width="6" stroke-linecap="round"/>`;

// Each symbol has two or three shallow opaque layers. Black alpha survives Image.tintColor,
// so the screen's semantic tone still controls light/dark contrast without flattening the form.
const icons = {
  add: svg("추가", [rect(27, 9, 12, 46, 6, .38), rect(9, 27, 46, 12, 6, .72), rect(29, 11, 10, 42, 5), rect(11, 29, 42, 10, 5)]),
  back: svg("뒤로", [layer("M39 9 18 30q-3 2-3 5t3 5l21 21q4 4 8 0t0-8L30 35l17-18q4-4 0-8t-8 0Z", .4), layer("M36 7 13 30q-4 5 0 10l23 23q4 4 8 0t0-8L25 35 44 15q4-4 0-8t-8 0Z")]),
  check: svg("확인", [layer("m7 29 14 14q3 3 6 0L57 13q4-4 0-8t-8 0L24 30 15 21q-4-4-8 0t0 8Z", .42), layer("m5 27 15 15q3 3 6 0L56 12q4-4 0-8t-8 0L23 31 13 21q-4-4-8 0t0 6Z")]),
  delete: svg("삭제", [rect(14, 18, 36, 39, 6, .42), rect(24, 7, 16, 7, 3, .55), rect(10, 14, 44, 8, 4, .72), rect(17, 20, 30, 36, 5), rect(25, 27, 5, 21, 2), rect(35, 27, 5, 21, 2)]),
  droplet: svg("강수와 습도", [layer("M32 5C23 18 13 27 13 39a19 19 0 1 0 38 0C51 27 41 18 32 5Z", .42), layer("M32 5C41 18 49 28 49 39a17 17 0 0 1-30 11c9 5 23-2 23-13 0-8-5-16-10-24Z", .68), layer("M29 17C20 29 17 34 17 40a15 15 0 0 0 15 15V17Z")]),
  expand: svg("펼치기", [layer("m9 23 19 19q4 4 8 0l19-19q4-4 0-8t-8 0L32 30 17 15q-4-4-8 0t0 8Z", .42), layer("m7 21 21 21q4 4 8 0l21-21q4-4 0-8t-8 0L32 31 15 13q-4-4-8 0t0 8Z")]),
  notifications: svg("알림", [layer("M16 43h32l-4-9V25a12 12 0 0 0-24 0v9Z", .4), layer("M12 45h40q4 0 4-4 0-2-2-5l-5-8V24a17 17 0 0 0-34 0v4l-5 8q-2 3-2 5 0 4 4 4Z"), layer("M24 51c2 8 14 8 16 0Z", .72), rect(29, 5, 6, 8, 3, .6)]),
  permissions: svg("권한 관리", [layer("M32 5 10 14v16c0 15 10 24 22 30 12-6 22-15 22-30V14Z", .42), layer("M32 5 52 14v16c0 13-9 22-20 28V32l14-11V15Z", .7), layer("M32 5 12 14v16c0 13 9 22 20 28V32L18 21v-6Z"), layer("m21 33 8 8 15-16 5 5-18 19q-2 2-5 0l-10-10Z", .76)]),
  "policy-document": svg("정책 및 법적 고지", [layer("M14 5h24l12 12v38a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5Z", .42), layer("M14 5h22v13h14v37a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5Z"), layer("M36 5v13h14Z", .66), rect(18, 28, 25, 5, 2.5, .45), rect(18, 39, 24, 5, 2.5, .62), rect(18, 50, 16, 5, 2.5, .45)]),
  theme: svg("밝기와 어둠 테마", [circle(32, 32, 25, .38), layer("M32 7a25 25 0 0 1 0 50Z", .76), circle(24, 24, 7, .62), rect(43, 37, 6, 12, 3, .54)]),
  transparency: svg("투명 효과 줄이기", [rect(8, 10, 36, 36, 9, .34), rect(18, 18, 38, 38, 9, .72), rect(22, 22, 30, 30, 7), rect(12, 48, 31, 6, 3, .5)]),
  settings: svg("설정", [layer("M27 5h10l3 8 8 3 7-4 6 10-6 6v8l6 6-6 10-7-4-8 3-3 8H27l-3-8-8-3-7 4-6-10 6-6v-8l-6-6 6-10 7 4 8-3Z", .42), layer("M28 5h8l3 9 9 3 7-4 5 8-6 6v10l6 6-5 8-7-4-9 3-3 9h-8l-3-9-9-3-7 4-5-8 6-6V27l-6-6 5-8 7 4 9-3Z"), circle(32, 32, 10, .5), circle(32, 32, 6)]),
  style: svg("스타일 기준", [rect(8, 12, 48, 7, 3.5, .36), rect(8, 29, 48, 7, 3.5, .54), rect(8, 46, 48, 7, 3.5, .36), circle(24, 15.5, 9, .7), circle(42, 32.5, 9, .7), circle(20, 49.5, 9, .7), circle(24, 15.5, 5), circle(42, 32.5, 5), circle(20, 49.5, 5)]),
  temperature: svg("기온", [rect(24, 7, 16, 35, 8, .42), circle(32, 45, 14, .55), rect(26, 7, 12, 36, 6), circle(32, 45, 11), rect(30, 18, 4, 27, 2, .42)]),
  time: svg("시간", [circle(32, 32, 27, .42), circle(32, 32, 24), rect(29, 15, 6, 20, 3, .5), rect(30, 30, 19, 6, 3, .72), circle(32, 32, 5)]),
  umbrella: svg("우산", [layer("M7 33a25 25 0 0 1 50 0c-8-3-16-4-25-4S15 30 7 33Z", .4), layer("M5 34a27 27 0 0 1 54 0c-9-3-18-4-27-4S14 31 5 34Z"), rect(29, 29, 6, 22, 3, .56), layer("M35 49a7 7 0 0 1-14 0h6a1 1 0 0 0 2 0Z", .74), rect(29, 6, 6, 10, 3, .54)]),
  uv: svg("자외선", [circle(32, 32, 13, .42), circle(32, 32, 10), rect(29, 5, 6, 10, 3, .55), rect(29, 49, 6, 10, 3, .55), rect(5, 29, 10, 6, 3, .55), rect(49, 29, 10, 6, 3, .55), stroke("m13 13 7 7m24 24 7 7m0-38-7 7M20 44l-7 7", .55)]),
  "wardrobe-empty": svg("비어 있는 옷장", [rect(7, 6, 50, 52, 7, .34), layer("M10 9h44v47H10Z", .52), layer("M12 9h20v47H10V11q0-2 2-2Zm20 0h20q2 0 2 2v45H32Z"), rect(19, 28, 7, 13, 3, .45), rect(38, 28, 7, 13, 3, .55), rect(10, 56, 8, 5, 2.5, .52), rect(46, 56, 8, 5, 2.5, .52)]),
  "wardrobe-all": svg("전체 의류", [rect(8, 8, 22, 22, 6, .42), rect(34, 8, 22, 22, 6, .68), rect(8, 34, 22, 22, 6, .68), rect(34, 34, 22, 22, 6, 1)]),
  "wardrobe-outer": svg("아우터", [layer("M23 8 12 14 5 36l12 5 4-9-2 25h26l-2-25 4 9 12-5-7-22-11-6-9 10Z", .42), layer("M23 8 32 18 41 8l10 6 7 22-10 4-5-11 2 28H19l2-28-5 11-10-4 7-22Z"), rect(29, 20, 6, 37, 3, .48)]),
  "wardrobe-bottom": svg("하의", [layer("M17 8h30l4 49H37L32 29 27 57H13Z", .42), layer("M18 8h28l3 46H38L32 25 26 54H15Z"), rect(18, 12, 28, 6, 3, .56)]),
  "wardrobe-shoes": svg("신발", [layer("M8 39c11 0 17-6 21-17l10 9c4 4 8 5 16 5 6 0 8 6 5 12H8Z", .42), layer("M6 41c14 0 19-7 23-20l11 10c4 4 8 6 17 6 5 0 7 5 4 11H6Z"), rect(8, 48, 51, 6, 3, .5)]),
  "wardrobe-accessory": svg("액세서리", [layer("M15 27V20a17 17 0 0 1 34 0v7h4a7 7 0 0 1 7 7v17a7 7 0 0 1-7 7H11a7 7 0 0 1-7-7V34a7 7 0 0 1 7-7Z", .42), layer("M17 27v-7a15 15 0 0 1 30 0v7h6a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V32a5 5 0 0 1 5-5Zm8 0h14v-7a7 7 0 0 0-14 0Z"), rect(27, 39, 10, 9, 4.5, .54)]),
};

const modes = {
  light: { background: "#E9F6F8", ink: "#183844", muted: "#49656F", sky: "#1A6399", gold: "#B87700", warm: "#B63121" },
  dark: { background: "#102B38", ink: "#F4F8F8", muted: "#C4DCE3", sky: "#58BFFF", gold: "#FFCC59", warm: "#FFB52E" },
};

async function render(file, value, size = 192, color = "#183844") {
  const canvas = createCanvas(size, size);
  const context = canvas.getContext("2d");
  const colored = value.replaceAll(black, color);
  context.drawImage(await loadImage(Buffer.from(colored)), 0, 0, size, size);
  writeFileSync(file, canvas.toBuffer("image/png"));
}

async function buildPreviews() {
  const names = ["umbrella", "droplet", "temperature", "theme", "transparency", "time", "settings", "notifications", "permissions", "policy-document", "style", "delete", "wardrobe-outer", "wardrobe-bottom", "wardrobe-shoes", "wardrobe-accessory", "check", "add"];
  for (const [mode, palette] of Object.entries(modes)) {
    const width = 960, cell = 120, rows = Math.ceil(names.length / 8), height = 90 + rows * 132;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    context.fillStyle = palette.background;
    context.fillRect(0, 0, width, height);
    context.fillStyle = palette.ink;
    context.font = "600 28px sans-serif";
    context.fillText(`Filled surface v3 · ${mode}`, 36, 48);
    for (const [index, name] of names.entries()) {
      const x = 18 + (index % 8) * cell;
      const y = 72 + Math.floor(index / 8) * 132;
      context.fillStyle = `${palette.ink}12`;
      context.beginPath(); context.roundRect(x, y, 96, 96, 24); context.fill();
      const icon = await loadImage(Buffer.from(icons[name].replaceAll(black, index % 5 === 0 ? palette.sky : index % 5 === 1 ? palette.gold : index % 5 === 2 ? palette.warm : palette.ink)));
      context.drawImage(icon, x + 20, y + 16, 56, 56);
      context.fillStyle = palette.muted;
      context.font = "500 12px sans-serif";
      context.textAlign = "center";
      context.fillText(name.replace("wardrobe-", ""), x + 48, y + 84);
    }
    writeFileSync(path.join(root, "previews", `filled-ui-${mode}.png`), canvas.toBuffer("image/png"));
  }
  for (const [mode, palette] of Object.entries(modes)) {
    const sizes = [16, 22, 28];
    const names = ["umbrella", "droplet", "temperature", "theme", "transparency", "time", "settings", "permissions", "policy-document", "wardrobe-outer", "wardrobe-bottom", "wardrobe-shoes", "wardrobe-accessory", "check"];
    const canvas = createCanvas(960, 440);
    const context = canvas.getContext("2d");
    context.fillStyle = palette.background;
    context.fillRect(0, 0, 960, 440);
    context.fillStyle = palette.ink;
    context.font = "600 28px sans-serif";
    context.fillText(`Small-size legibility · ${mode}`, 36, 48);
    for (const [index, name] of names.entries()) {
      const x = 25 + (index % 6) * 156;
      const y = 78 + Math.floor(index / 6) * 112;
      context.fillStyle = `${palette.ink}10`;
      context.beginPath(); context.roundRect(x, y, 132, 92, 20); context.fill();
      const icon = await loadImage(Buffer.from(icons[name].replaceAll(black, index % 3 === 0 ? palette.sky : index % 3 === 1 ? palette.gold : palette.ink)));
      context.textAlign = "center";
      context.fillStyle = palette.muted;
      context.font = "500 12px sans-serif";
      context.fillText(name.replace("wardrobe-", ""), x + 66, y + 21);
      sizes.forEach((size, position) => context.drawImage(icon, x + 24 + position * 36 - size / 2 + 4, y + 53 - size / 2, size, size));
      context.font = "500 10px sans-serif";
      sizes.forEach((size, position) => context.fillText(String(size), x + 28 + position * 36, y + 82));
    }
    writeFileSync(path.join(root, "previews", `filled-ui-small-${mode}.png`), canvas.toBuffer("image/png"));
  }
}

for (const [name, value] of Object.entries(icons)) {
  assert.match(value, /fill-opacity=/, `${name} needs layered surfaces`);
  const svgFile = path.join(root, "svg", "ui", `${name}.svg`);
  const pngFile = path.join(root, "png", "ui", `${name}.png`);
  mkdirSync(path.dirname(svgFile), { recursive: true });
  mkdirSync(path.dirname(pngFile), { recursive: true });
  mkdirSync(path.join(root, "previews"), { recursive: true });
  writeFileSync(svgFile, value);
  await render(pngFile, value);
}
await buildPreviews();
console.log(`Rendered ${Object.keys(icons).length} layered UI SVGs, PNG derivatives, and light/dark previews.`);
