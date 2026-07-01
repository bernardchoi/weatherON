import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const rootDir = process.cwd();
const screenshotDir = join(rootDir, "assets/store/android-screenshots");

const expectedScreenshots = new Map([
  ["phone-01-home.png", "H1 홈 / 하단 홈"],
  ["phone-02-destination-search.png", "P1 목적지 검색 / 하단 출발 > 목적지 추가"],
  ["phone-03-destination-care.png", "G2 목적지 케어 / 하단 출발 > 목적지 카드"],
  ["phone-04-outfit.png", "C1 코디 추천 / MY > 코디·옷장"],
  ["phone-05-settings-policy.png", "M/R 정책 허브 / 하단 MY > 설정/정책"],
]);

const filename = process.argv[2];
const deviceId = process.env.ANDROID_SERIAL;
const adbCommand = resolveAdbCommand();

if (!filename || !expectedScreenshots.has(filename)) {
  console.error("usage: npm run capture:android-store-screenshot -- <filename>");
  console.error("allowed filenames:");
  for (const [name, label] of expectedScreenshots) console.error(` - ${name} (${label})`);
  process.exit(1);
}

const devices = listAdbDevices();
if (devices.length === 0) {
  console.error("No Android device is connected through adb.");
  console.error("Next: connect a device, enable USB debugging, then run `adb devices`.");
  process.exit(1);
}
if (!deviceId && devices.length > 1) {
  console.error(`Multiple Android devices found: ${devices.join(", ")}`);
  console.error("Set ANDROID_SERIAL=<device-id> before running this command.");
  process.exit(1);
}

const targetDeviceId = deviceId || devices[0];
const adbArgs = ["-s", targetDeviceId, "exec-out", "screencap", "-p"];
const result = spawnSync(adbCommand, adbArgs, {
  encoding: "buffer",
  stdio: ["ignore", "pipe", "pipe"],
  maxBuffer: 30 * 1024 * 1024,
});

if (result.status !== 0) {
  const stderr = result.stderr.toString("utf8").trim();
  console.error("adb screencap failed.");
  if (stderr) console.error(stderr);
  process.exit(result.status ?? 1);
}

const png = result.stdout;
if (!isPng(png)) {
  console.error("Captured output is not a PNG.");
  process.exit(1);
}

const dimensions = readPngDimensions(png);
mkdirSync(screenshotDir, { recursive: true });
const outPath = join(screenshotDir, filename);
writeFileSync(outPath, png);

console.log(`captured ${filename} (${expectedScreenshots.get(filename)}) from ${targetDeviceId}`);
console.log(`saved: ${outPath}`);
console.log(`size: ${dimensions.width}x${dimensions.height}`);
if (dimensions.height <= dimensions.width) console.warn("warning: screenshot is not portrait");
if (dimensions.width < 1080 || dimensions.height < 1920) console.warn("warning: Google Play recommended minimum is 1080x1920");
refreshScreenshotStatus();

function listAdbDevices() {
  const result = spawnSync(adbCommand, ["devices"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    const stderr = result.stderr.trim();
    console.error("adb devices failed.");
    if (stderr) console.error(stderr);
    process.exit(result.status ?? 1);
  }
  return result.stdout
    .split("\n")
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([id, state]) => id && state === "device")
    .map(([id]) => id);
}

function resolveAdbCommand() {
  const candidates = [
    "adb",
    process.env.ANDROID_HOME ? join(process.env.ANDROID_HOME, "platform-tools/adb") : "",
    process.env.ANDROID_SDK_ROOT ? join(process.env.ANDROID_SDK_ROOT, "platform-tools/adb") : "",
    join(homedir(), "Library/Android/sdk/platform-tools/adb"),
  ].filter(Boolean);
  return candidates.find((candidate) => candidate !== "adb" && existsSync(candidate)) || "adb";
}

function isPng(buffer) {
  return buffer.length > 24 && buffer.toString("ascii", 1, 4) === "PNG";
}

function readPngDimensions(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function refreshScreenshotStatus() {
  const result = spawnSync(process.execPath, ["scripts/check-android-store-screenshots-ready.mjs"], {
    cwd: rootDir,
    env: { ...process.env, WEATHERON_SCREENSHOT_REPORT_ONLY: "1" },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    console.warn("warning: screenshot status refresh failed");
    if (result.stderr.trim()) console.warn(result.stderr.trim());
    return;
  }
  const output = result.stdout.trim();
  if (output) console.log(output);
}
