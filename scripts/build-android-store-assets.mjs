import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = join(root, "assets/store");
const sourceIconPath = join(root, "assets/icon/icon-primary-512.png");
const appIconPath = join(outputDir, "android-app-icon-512.png");
const featureGraphicPath = join(outputDir, "android-feature-graphic-v1.png");
const manifestPath = join(outputDir, "android-store-assets.json");

const colors = {
  navy: "#10243F",
  ink: "#17324F",
  panel: "#F7FBFF",
  mint: "#67E8D0",
  sky: "#8BC8FF",
  gold: "#F5C85B",
  muted: "#DCE8F4",
  white: "#FFFFFF",
};

await mkdir(outputDir, { recursive: true });

const appIcon = await loadImage(sourceIconPath);
const appIconCanvas = createCanvas(512, 512);
const appIconContext = appIconCanvas.getContext("2d");
appIconContext.drawImage(appIcon, 0, 0, 512, 512);
await writeFile(appIconPath, appIconCanvas.toBuffer("image/png"));

const canvas = createCanvas(1024, 500);
const ctx = canvas.getContext("2d");

drawBackground(ctx);
drawBrand(ctx, appIcon);
drawWeatherCards(ctx);

await writeFile(featureGraphicPath, canvas.toBuffer("image/png"));
await writeFile(
  manifestPath,
  JSON.stringify(
    {
      generatedAt: "2026-06-27",
      assets: [
        {
          id: "android-app-icon-512",
          path: "assets/store/android-app-icon-512.png",
          width: 512,
          height: 512,
          usage: "Google Play app icon candidate",
        },
        {
          id: "android-feature-graphic-v1",
          path: "assets/store/android-feature-graphic-v1.png",
          width: 1024,
          height: 500,
          usage: "Google Play feature graphic candidate",
        },
      ],
      sourceAssets: ["assets/icon/icon-primary-512.png"],
    },
    null,
    2,
  ),
  "utf8",
);

console.log("Generated Android store assets:");
console.log(" - assets/store/android-app-icon-512.png 512x512");
console.log(" - assets/store/android-feature-graphic-v1.png 1024x500");
console.log(" - assets/store/android-store-assets.json");

function drawBackground(context) {
  context.fillStyle = colors.panel;
  context.fillRect(0, 0, 1024, 500);

  context.fillStyle = colors.navy;
  roundedRect(context, 28, 28, 968, 444, 28);
  context.fill();

  context.fillStyle = "rgba(103, 232, 208, 0.16)";
  roundedRect(context, 664, 54, 286, 392, 24);
  context.fill();

  context.fillStyle = "rgba(139, 200, 255, 0.12)";
  roundedRect(context, 612, 86, 316, 100, 18);
  context.fill();

  context.fillStyle = "rgba(245, 200, 91, 0.16)";
  roundedRect(context, 748, 326, 188, 92, 18);
  context.fill();
}

function drawBrand(context, icon) {
  context.drawImage(icon, 80, 88, 152, 152);

  context.fillStyle = colors.white;
  context.font = "800 72px Manrope, Arial, sans-serif";
  context.fillText("WeatherON", 78, 298);

  context.fillStyle = colors.muted;
  context.font = "600 27px Manrope, Arial, sans-serif";
  context.fillText("Dress for the weather", 82, 346);

  context.fillStyle = colors.mint;
  context.font = "800 20px Manrope, Arial, sans-serif";
  context.fillText("OUTFIT  ·  UMBRELLA  ·  DESTINATION CARE", 82, 394);
}

function drawWeatherCards(context) {
  drawCard(context, 590, 126, 300, 86, colors.white, colors.ink, "Outfit", "Rain jacket ready", colors.mint);
  drawCard(context, 632, 226, 300, 86, colors.white, colors.ink, "Umbrella", "Carry before leaving", colors.sky);
  drawCard(context, 566, 326, 300, 86, colors.white, colors.ink, "Destination", "Care ON for Jamsil", colors.gold);

  context.strokeStyle = "rgba(255,255,255,0.34)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(520, 126);
  context.bezierCurveTo(540, 188, 538, 260, 568, 332);
  context.stroke();

  context.fillStyle = colors.mint;
  context.beginPath();
  context.arc(520, 126, 7, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = colors.gold;
  context.beginPath();
  context.arc(568, 332, 7, 0, Math.PI * 2);
  context.fill();
}

function drawCard(context, x, y, width, height, bg, text, title, body, accent) {
  context.fillStyle = "rgba(0,0,0,0.16)";
  roundedRect(context, x + 4, y + 8, width, height, 18);
  context.fill();

  context.fillStyle = bg;
  roundedRect(context, x, y, width, height, 18);
  context.fill();

  context.fillStyle = accent;
  roundedRect(context, x + 18, y + 20, 46, 46, 14);
  context.fill();

  context.fillStyle = text;
  context.font = "800 23px Manrope, Arial, sans-serif";
  context.fillText(title, x + 82, y + 34);

  context.fillStyle = "#5B6B80";
  context.font = "600 17px Manrope, Arial, sans-serif";
  context.fillText(body, x + 82, y + 62);
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}
