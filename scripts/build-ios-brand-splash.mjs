import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = process.cwd();
const dir = path.join(root, "assets/splash/ios-brand-02");
const parts = JSON.parse(fs.readFileSync(path.join(dir, "parts.json"), "utf8"));
const native = path.join(root, "apps/mobile/ios/WeatherON/Images.xcassets/SplashCloud02.imageset");
fs.mkdirSync(native, { recursive: true });
const images = [];
for (const mode of ["light", "dark"]) for (const scale of [1, 2, 3]) {
  const width = 180 * scale, height = 124 * scale;
  const sourceY = parts.initialCloudY / (180 / 900);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${parts.viewBox}"><g opacity="${parts.initialCloudOpacity}" transform="translate(0 ${sourceY})"><path d="${parts.cloud.path}" fill="${parts.cloud[mode]}"/></g></svg>`;
  const canvas = createCanvas(width, height);
  canvas.getContext("2d").drawImage(await loadImage(Buffer.from(svg)), 0, 0);
  const filename = `cloud-first-${mode}${scale === 1 ? "" : "@" + scale + "x"}.png`;
  const bytes = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(dir, filename), bytes);
  fs.writeFileSync(path.join(native, filename), bytes);
  if (scale === 1) fs.writeFileSync(path.join(dir, `cloud-first-${mode}.svg`), svg + "\n");
  images.push({ idiom: "universal", filename, scale: `${scale}x`,
    ...(mode === "dark" ? { appearances: [{ appearance: "luminosity", value: "dark" }] } : {}) });
}
const contents = { images, info: { version: 1, author: "weatheron" } };
fs.writeFileSync(path.join(native, "Contents.json"), JSON.stringify(contents, null, 2) + "\n");
fs.writeFileSync(path.join(dir, "native-imageset.json"), JSON.stringify(contents, null, 2) + "\n");
console.log("Generated transparent original-cloud first frame at 1x/2x/3x, light/dark. No icon box or raster icon enlargement.");
