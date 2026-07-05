import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const inputPath = process.env.WEATHERON_DEVICE_QA_RESULTS_FILE || join(
  rootDir,
  "docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json",
);
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_ENV_SYNC_STATUS.md");
const reportOnly = process.env.WEATHERON_DEVICE_QA_ENV_SYNC_REPORT_ONLY === "1";
const adbCommand = resolveAdbCommand();

const issues = [];
const updates = [];
let selectedDevice = "";
let local = {};

if (!existsSync(inputPath)) {
  issues.push(`input file missing: ${inputPath}`);
} else {
  local = readJson(inputPath);
  if (issues.length === 0) syncFromAdb();
}

writeStatus();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android device QA env sync status generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android device QA env sync failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android device QA env synced: ${updates.length} updates`);

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    issues.push(`input JSON parse failed: ${error.message}`);
    return {};
  }
}

function syncFromAdb() {
  const devicesResult = run(adbCommand, ["devices"]);
  if (devicesResult.errorCode === "ENOENT") {
    issues.push("adb command not found");
    return;
  }
  if (devicesResult.status !== 0) {
    issues.push("adb devices failed");
    return;
  }

  const devices = parseDevices(devicesResult.stdout);
  const readyDevices = devices.filter((device) => device.state === "device");
  if (readyDevices.length === 0) {
    issues.push("no Android device detected by adb");
    return;
  }
  if (readyDevices.length > 1 && !process.env.ANDROID_SERIAL) {
    issues.push("multiple Android devices connected. Set ANDROID_SERIAL.");
    return;
  }

  selectedDevice = process.env.ANDROID_SERIAL || readyDevices[0].id;
  const brand = runAdb(["shell", "getprop", "ro.product.brand"]).stdout.trim();
  const model = runAdb(["shell", "getprop", "ro.product.model"]).stdout.trim();
  const androidVersion = runAdb(["shell", "getprop", "ro.build.version.release"]).stdout.trim();
  const screenSize = normalizeShellValue(runAdb(["shell", "wm", "size"]).stdout, "Physical size:");
  const installed = runAdb(["shell", "pm", "list", "packages", "com.weatheron.mobile"]).stdout.includes("com.weatheron.mobile");

  fillIfEmpty("device", [brand, model].filter(Boolean).join(" ").trim());
  fillIfEmpty("androidVersion", androidVersion);
  fillIfEmpty("screenSize", screenSize === "미확인" ? "" : screenSize);
  fillIfEmpty("installMethod", installed ? "ADB 확인: com.weatheron.mobile 설치됨" : "");
  fillIfEmpty("testedAt", `${kstDateTime()} KST`);

  if (!reportOnly && updates.length > 0) {
    writeFileSync(inputPath, `${JSON.stringify(normalizeQaLocalInput(local), null, 2)}\n`, "utf8");
  }
}

function fillIfEmpty(field, value) {
  if (!value) return;
  if (typeof local[field] === "string" && local[field].trim() !== "") return;
  local[field] = value;
  updates.push(`${field}: ${value}`);
}

function runAdb(args) {
  return run(adbCommand, ["-s", selectedDevice, ...args]);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    errorCode: result.error?.code,
  };
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

function parseDevices(stdout) {
  return stdout
    .split("\n")
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([id, state]) => id && state)
    .map(([id, state]) => ({ id, state }));
}

function normalizeShellValue(stdout, prefix) {
  const line = stdout
    .split("\n")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : "미확인";
}

function normalizeQaLocalInput(value) {
  return {
    easBuildId: value.easBuildId || "",
    appVersion: value.appVersion || "",
    device: value.device || "",
    androidVersion: value.androidVersion || "",
    screenSize: value.screenSize || "",
    network: value.network || "",
    installMethod: value.installMethod || "",
    testedAt: value.testedAt || "",
    results: value.results || {},
  };
}

function writeStatus() {
  const report = `# WeatherON Android Device QA Env Sync Status

> 생성일: ${kstDate()}
> 목적: ADB로 확인 가능한 실기기 QA 환경값을 local QA JSON에 자동 반영한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 적용 여부 | ${!reportOnly && updates.length > 0 && issues.length === 0 ? "적용됨" : "미적용"} |
| report only | ${reportOnly ? "예" : "아니오"} |
| issue 수 | ${issues.length} |
| update 수 | ${updates.length} |
| 선택 기기 | ${selectedDevice || "없음"} |
| 입력 파일 | ${inputPath} |
| adb 경로 | ${adbCommand} |

## 2. Updates

${updates.length === 0 ? "- 없음" : updates.map((update) => `- ${update}`).join("\n")}

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. 실행 명령

\`\`\`bash
npm run sync:android-device-qa-env
WEATHERON_DEVICE_QA_ENV_SYNC_REPORT_ONLY=1 npm run sync:android-device-qa-env
npm run apply:android-device-qa-results
\`\`\`

주의:
- 이 명령은 비어 있는 QA 환경값만 채운다.
- 네트워크 상태는 Wi-Fi/LTE 각각 직접 확인해 local JSON의 \`network\`에 수동 기록한다.
`;

  mkdirSync(dirname(statusPath), { recursive: true });
  writeFileSync(statusPath, report, "utf8");
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function kstDateTime() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date()).replace(",", "");
}
