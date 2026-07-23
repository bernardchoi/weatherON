import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { kstDate } from "./lib/markdownDoc.mjs";

const rootDir = process.cwd();
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_ADB_STATUS.md");
const reportOnly = process.env.WEATHERON_ADB_REPORT_ONLY === "1";
const adbCommand = resolveAdbCommand();

const issues = [];
const adbDevices = run(adbCommand, ["devices"]);
let deviceRows = [];
let selectedDevice = "";
let screenSize = "미확인";
let density = "미확인";
let androidVersion = "미확인";
let packageInstalled = "미확인";

if (adbDevices.errorCode === "ENOENT") {
  issues.push("adb command not found");
} else if (adbDevices.status !== 0) {
  issues.push("adb devices failed");
} else {
  const devices = parseDevices(adbDevices.stdout);
  deviceRows = devices.map((device) => `| ${device.id} | ${device.state} |`);
  const readyDevices = devices.filter((device) => device.state === "device");
  const unauthorizedDevices = devices.filter((device) => device.state === "unauthorized");
  const offlineDevices = devices.filter((device) => device.state === "offline");

  if (devices.length === 0) issues.push("no Android device detected by adb");
  if (unauthorizedDevices.length > 0) issues.push("Android device is unauthorized. Confirm USB debugging prompt on device.");
  if (offlineDevices.length > 0) issues.push("Android device is offline. Reconnect USB or restart adb server.");
  if (readyDevices.length > 1 && !process.env.ANDROID_SERIAL) issues.push("multiple Android devices connected. Set ANDROID_SERIAL.");

  selectedDevice = process.env.ANDROID_SERIAL || readyDevices[0]?.id || "";
  if (selectedDevice) {
    screenSize = normalizeShellValue(runAdb(selectedDevice, ["shell", "wm", "size"]).stdout, "Physical size:");
    density = normalizeShellValue(runAdb(selectedDevice, ["shell", "wm", "density"]).stdout, "Physical density:");
    androidVersion = runAdb(selectedDevice, ["shell", "getprop", "ro.build.version.release"]).stdout.trim() || "미확인";
    packageInstalled = runAdb(selectedDevice, ["shell", "pm", "list", "packages", "com.weatheron.mobile"]).stdout.includes("com.weatheron.mobile")
      ? "설치됨"
      : "미설치";
  }
}

writeReport();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android adb status report generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android adb ready check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("android adb ready check passed");

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

function runAdb(deviceId, args) {
  return run(adbCommand, ["-s", deviceId, ...args]);
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


function writeReport() {
  const report = `# WeatherON Android ADB Status

> 생성일: ${kstDate()}
> 목적: 실기기 QA와 스토어 스크린샷 캡처 전 ADB 연결 준비 상태를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 준비 상태 | ${issues.length === 0 ? "가능" : "불가"} |
| issue 수 | ${issues.length} |
| 선택 기기 | ${selectedDevice || "없음"} |
| 화면 크기 | ${screenSize} |
| 화면 밀도 | ${density} |
| Android 버전 | ${androidVersion} |
| WeatherON 설치 | ${packageInstalled} |
| adb 경로 | ${adbCommand} |

## 2. ADB devices

| device id | state |
|---|---|
${deviceRows.length > 0 ? deviceRows.join("\n") : "| - | 미감지 |"}

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. 다음 조치

${nextActions()}

## 5. 확인 명령

\`\`\`bash
npm run check:android-adb-ready
WEATHERON_ADB_REPORT_ONLY=1 npm run check:android-adb-ready
adb devices
adb kill-server
adb start-server
\`\`\`
`;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
}

function nextActions() {
  if (issues.length === 0) {
    return [
      "- `npm run install:android-preview-apk`로 최신 preview APK를 설치한다.",
      "- 설치 후 `WeatherON_ANDROID_DEVICE_QA_SESSION.md`의 D1~D13 항목을 실기기 기준으로 판정한다.",
      "- QA 통과 후 `npm run capture:android-store-screenshot -- <filename>`로 스토어 스크린샷 5장을 캡처한다.",
    ].join("\n");
  }

  const actions = [];
  if (issues.some((issue) => issue.includes("adb command not found"))) {
    actions.push("- Android Studio SDK Platform-Tools 설치 후 `ANDROID_HOME`과 `PATH`를 확인한다.");
    actions.push("- macOS 기본 경로는 `~/Library/Android/sdk/platform-tools/adb`다.");
  }
  if (issues.some((issue) => issue.includes("no Android device detected"))) {
    actions.push("- 실기기: USB 케이블 연결 후 개발자 옵션 > USB 디버깅을 켠다.");
    actions.push("- 기기 화면의 `USB 디버깅을 허용하시겠습니까?` 팝업에서 허용한다.");
    actions.push("- 연결 후 `adb devices`에 `device` 상태가 보이면 `npm run check:android-adb-ready`를 다시 실행한다.");
    actions.push("- 에뮬레이터: Android Studio Device Manager에서 AVD를 정상 부팅한 뒤 `adb devices`를 확인한다.");
  }
  if (issues.some((issue) => issue.includes("unauthorized"))) {
    actions.push("- 기기 화면의 USB 디버깅 RSA 허용 팝업을 승인한다.");
    actions.push("- 팝업이 없으면 USB를 재연결하거나 `adb kill-server && adb start-server` 후 다시 확인한다.");
  }
  if (issues.some((issue) => issue.includes("offline"))) {
    actions.push("- USB 재연결 또는 에뮬레이터 재부팅 후 `adb kill-server && adb start-server`를 실행한다.");
  }
  if (issues.some((issue) => issue.includes("multiple Android devices"))) {
    actions.push("- 설치/캡처 대상 기기를 하나만 남기거나 `ANDROID_SERIAL=<device id>`를 지정한다.");
  }

  return actions.length > 0 ? actions.join("\n") : "- Issues 항목 확인 후 `adb devices` 상태를 먼저 복구한다.";
}
