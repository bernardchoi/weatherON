import { createCanvas } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "assets/ui-icons");
mkdirSync(outDir, { recursive: true });

const size = 96;
const scale = 4;
const stroke = 1.8 * scale;
const black = "#111827";

const icons = {
  "card-umbrella": drawCardUmbrella,
  "card-trash": drawTrash,
  "my-permissions": drawShieldCheck,
  "my-alerts": drawBell,
  "my-display": drawDisplay,
  "my-policy": drawLegalNotice,
  "policy-privacy": drawShieldLock,
  "policy-terms": drawDocumentCheck,
  "policy-location": drawLocationDocument,
  "policy-oss": drawCodeDocument,
};

for (const [name, draw] of Object.entries(icons)) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  setup(ctx);
  draw(ctx);
  writeFileSync(join(outDir, `${name}.png`), canvas.toBuffer("image/png"));
}

console.log(`generated ${Object.keys(icons).length} ui icons`);

function setup(ctx) {
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = black;
  ctx.fillStyle = black;
}

function path(ctx, commands) {
  ctx.beginPath();
  for (const command of commands) {
    const [type, ...values] = command;
    if (type === "M") ctx.moveTo(values[0], values[1]);
    if (type === "L") ctx.lineTo(values[0], values[1]);
    if (type === "Q") ctx.quadraticCurveTo(values[0], values[1], values[2], values[3]);
    if (type === "C") ctx.bezierCurveTo(values[0], values[1], values[2], values[3], values[4], values[5]);
    if (type === "Z") ctx.closePath();
  }
}

function strokePath(ctx, commands) {
  path(ctx, commands);
  ctx.stroke();
}

function fillCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function strokeCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawShield(ctx) {
  strokePath(ctx, [
    ["M", 12, 3.4],
    ["L", 19.2, 6.2],
    ["L", 19.2, 11.4],
    ["C", 19.2, 16.2, 16.2, 19.1, 12, 21.2],
    ["C", 7.8, 19.1, 4.8, 16.2, 4.8, 11.4],
    ["L", 4.8, 6.2],
    ["L", 12, 3.4],
    ["Z"],
  ]);
}

function drawCardUmbrella(ctx) {
  strokePath(ctx, [
    ["M", 4.5, 11.3],
    ["C", 5.3, 6.8, 8.6, 4.2, 12, 4.2],
    ["C", 15.4, 4.2, 18.7, 6.8, 19.5, 11.3],
    ["L", 4.5, 11.3],
    ["Z"],
  ]);
  strokePath(ctx, [
    ["M", 12, 11.3],
    ["L", 12, 18.1],
    ["C", 12, 19.8, 10.7, 20.8, 9.5, 19.7],
    ["M", 12, 4.4],
    ["L", 12, 2.8],
    ["M", 8, 8.6],
    ["L", 9.9, 11.3],
    ["M", 16, 8.6],
    ["L", 14.1, 11.3],
  ]);
}

function drawTrash(ctx) {
  strokePath(ctx, [["M", 4, 6], ["L", 20, 6]]);
  strokePath(ctx, [
    ["M", 9, 6],
    ["L", 9, 4],
    ["Q", 9, 3, 10, 3],
    ["L", 14, 3],
    ["Q", 15, 3, 15, 4],
    ["L", 15, 6],
  ]);
  strokePath(ctx, [
    ["M", 6.4, 6],
    ["L", 7.3, 20],
    ["Q", 7.4, 21, 8.4, 21],
    ["L", 15.6, 21],
    ["Q", 16.6, 21, 16.7, 20],
    ["L", 17.6, 6],
  ]);
  strokePath(ctx, [["M", 10.2, 10], ["L", 10.5, 17]]);
  strokePath(ctx, [["M", 13.8, 10], ["L", 13.5, 17]]);
}

function drawDocument(ctx) {
  strokePath(ctx, [
    ["M", 7, 3.5],
    ["L", 14.2, 3.5],
    ["L", 18, 7.4],
    ["L", 18, 20.5],
    ["L", 7, 20.5],
    ["Z"],
  ]);
  strokePath(ctx, [
    ["M", 14.2, 3.8],
    ["L", 14.2, 7.5],
    ["L", 17.7, 7.5],
  ]);
}

function drawShieldCheck(ctx) {
  drawShield(ctx);
  strokePath(ctx, [
    ["M", 8.8, 12.1],
    ["L", 11.2, 14.5],
    ["L", 15.8, 9.6],
  ]);
}

function drawBell(ctx) {
  strokePath(ctx, [
    ["M", 18, 9.3],
    ["C", 18, 6, 15.6, 4, 12, 4],
    ["C", 8.4, 4, 6, 6, 6, 9.3],
    ["C", 6, 14.2, 3.8, 16.2, 3.8, 16.2],
    ["L", 20.2, 16.2],
    ["C", 20.2, 16.2, 18, 14.2, 18, 9.3],
  ]);
  strokePath(ctx, [
    ["M", 9.7, 19],
    ["C", 10.3, 20.1, 11, 20.6, 12, 20.6],
    ["C", 13, 20.6, 13.7, 20.1, 14.3, 19],
  ]);
}

function drawDisplay(ctx) {
  strokePath(ctx, [
    ["M", 4, 5],
    ["L", 20, 5],
    ["L", 20, 16],
    ["L", 4, 16],
    ["Z"],
  ]);
  strokePath(ctx, [
    ["M", 9.5, 20],
    ["L", 14.5, 20],
    ["M", 12, 16],
    ["L", 12, 20],
  ]);
  fillCircle(ctx, 9, 10.4, 1.2);
  strokePath(ctx, [
    ["M", 12.2, 10.4],
    ["L", 16.8, 10.4],
  ]);
}

function drawLegalNotice(ctx) {
  drawDocument(ctx);
  strokePath(ctx, [
    ["M", 10.3, 12.1],
    ["L", 8.3, 16.1],
    ["L", 12.3, 16.1],
    ["Z"],
    ["M", 15.7, 12.1],
    ["L", 13.7, 16.1],
    ["L", 17.7, 16.1],
    ["Z"],
    ["M", 13, 9.2],
    ["L", 13, 18.3],
    ["M", 9.2, 12.1],
    ["L", 16.8, 12.1],
  ]);
}

function drawShieldLock(ctx) {
  drawShield(ctx);
  strokePath(ctx, [
    ["M", 9, 12],
    ["L", 15, 12],
    ["L", 15, 16.5],
    ["L", 9, 16.5],
    ["Z"],
  ]);
  strokePath(ctx, [
    ["M", 10.3, 12],
    ["L", 10.3, 10.4],
    ["C", 10.3, 8.6, 11.3, 7.7, 12, 7.7],
    ["C", 12.7, 7.7, 13.7, 8.6, 13.7, 10.4],
    ["L", 13.7, 12],
  ]);
}

function drawDocumentCheck(ctx) {
  drawDocument(ctx);
  strokePath(ctx, [
    ["M", 9.1, 11.5],
    ["L", 11.1, 13.5],
    ["L", 15.2, 9.1],
  ]);
  strokePath(ctx, [
    ["M", 9, 16.7],
    ["L", 15.3, 16.7],
  ]);
}

function drawLocationDocument(ctx) {
  drawDocument(ctx);
  strokeCircle(ctx, 12.5, 11.2, 2.4);
  strokePath(ctx, [
    ["M", 12.5, 13.6],
    ["C", 11.1, 15.3, 10.3, 16.4, 10.3, 17.1],
    ["C", 10.3, 18.3, 11.3, 19, 12.5, 19],
    ["C", 13.7, 19, 14.7, 18.3, 14.7, 17.1],
    ["C", 14.7, 16.4, 13.9, 15.3, 12.5, 13.6],
  ]);
}

function drawCodeDocument(ctx) {
  drawDocument(ctx);
  strokePath(ctx, [
    ["M", 11, 10],
    ["L", 8.4, 12.6],
    ["L", 11, 15.2],
    ["M", 14, 10],
    ["L", 16.6, 12.6],
    ["L", 14, 15.2],
  ]);
  strokePath(ctx, [
    ["M", 13.2, 9.4],
    ["L", 11.8, 15.8],
  ]);
}
