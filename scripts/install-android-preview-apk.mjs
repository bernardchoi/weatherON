import { spawnSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { get as httpsGet } from "node:https";
import { homedir, tmpdir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";

const rootDir = process.cwd();
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_INSTALL_STATUS.md");
const reportOnly = process.env.WEATHERON_INSTALL_REPORT_ONLY === "1";
const adbCommand = resolveAdbCommand();

const buildStatus = existsSync(buildStatusPath) ? readFileSync(buildStatusPath, "utf8") : "";
const buildId = normalizeTableValue(tableValue(buildStatus, "EAS build id"));
const buildState = normalizeTableValue(tableValue(buildStatus, "Build 상태"));
const buildVersion = normalizeTableValue(tableValue(buildStatus, "Version"));
const artifactUrl = normalizeTableValue(tableValue(buildStatus, "APK artifact"));
const isLocalReleaseBuild = buildId === "N/A - local Gradle release APK" && buildState === "LOCAL BUILD SUCCESS";
const isRemoteArtifact = artifactUrl.startsWith("https://");
const localArtifactPath = isRemoteArtifact ? "" : resolveLocalArtifactPath(artifactUrl);

const issues = [];
let selectedDevice = "";
let installStatus = "미실행";
let apkPath = "";

if (!buildId) issues.push("build id missing in WeatherON_ANDROID_BUILD_STATUS.md");
if (buildState !== "FINISHED" && !isLocalReleaseBuild) issues.push(`build is not FINISHED: ${buildState || "unknown"}`);
if (!artifactUrl || artifactUrl === "미생성") {
  issues.push("APK artifact is missing");
} else if (!isRemoteArtifact && !existsSync(localArtifactPath)) {
  issues.push(`local APK artifact missing: ${localArtifactPath}`);
}

const devices = listAdbDevices();
const readyDevices = devices.filter((device) => device.state === "device");
if (readyDevices.length === 0) issues.push("no Android device detected by adb");
if (readyDevices.length > 1 && !process.env.ANDROID_SERIAL) issues.push("multiple Android devices connected. Set ANDROID_SERIAL.");
selectedDevice = process.env.ANDROID_SERIAL || readyDevices[0]?.id || "";

if (issues.length === 0 && reportOnly) {
  apkPath = localArtifactPath || "";
  installStatus = isExpectedPackageInstalled(selectedDevice, buildVersion) ? "설치됨" : "설치 가능";
}

if (issues.length === 0 && !reportOnly) {
  apkPath = isRemoteArtifact ? join(tmpdir(), `weatheron-${buildId}.apk`) : localArtifactPath;
  if (isRemoteArtifact) await downloadFile(artifactUrl, apkPath);
  const installResult = spawnSync(adbCommand, ["-s", selectedDevice, "install", "-r", apkPath], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (installResult.status === 0) {
    installStatus = "설치됨";
  } else {
    installStatus = "실패";
    issues.push(`adb install failed: ${(installResult.stderr || installResult.stdout).trim() || "unknown error"}`);
  }
}

writeReport();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android preview APK install report generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android preview APK install failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android preview APK install ${reportOnly ? "ready" : "completed"}: ${buildId}`);

function listAdbDevices() {
  const result = spawnSync(adbCommand, ["devices"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    return [];
  }
  return result.stdout
    .split("\n")
    .slice(1)
    .map((line) => line.trim().split(/\s+/))
    .filter(([id, state]) => id && state)
    .map(([id, state]) => ({ id, state }));
}

function downloadFile(url, destinationPath, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const request = httpsGet(url, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location && redirectsLeft > 0) {
        response.resume();
        downloadFile(response.headers.location, destinationPath, redirectsLeft - 1).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`download failed with status ${response.statusCode}`));
        return;
      }
      const file = createWriteStream(destinationPath);
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
      file.on("error", reject);
    });
    request.on("error", reject);
  });
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

function tableValue(text, label) {
  if (!text) return "";
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return match?.[1]?.trim() ?? "";
}

function normalizeTableValue(value) {
  return value.replace(/^`|`$/g, "").trim();
}

function resolveLocalArtifactPath(value) {
  if (!value) return "";
  return isAbsolute(value) ? value : join(rootDir, value);
}

function isExpectedPackageInstalled(deviceId, expectedVersion) {
  if (!deviceId || !expectedVersion) return false;
  const expected = expectedVersion.match(/^(.+?)\s*\((\d+)\)$/);
  if (!expected) return false;
  const [, versionName, versionCode] = expected;
  const result = spawnSync(adbCommand, ["-s", deviceId, "shell", "dumpsys", "package", "com.weatheron.mobile"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) return false;
  return result.stdout.includes(`versionName=${versionName}`) && result.stdout.includes(`versionCode=${versionCode}`);
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function writeReport() {
  const report = `# WeatherON Android Install Status

> 생성일: ${kstDate()}
> 목적: 최신 Android preview APK 실기기 설치 상태와 설치 명령을 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 설치 가능 여부 | ${issues.length === 0 ? "가능" : "불가"} |
| 설치 상태 | ${installStatus} |
| issue 수 | ${issues.length} |
| EAS build id | \`${buildId || "미확인"}\` |
| Build 상태 | ${buildState || "미확인"} |
| Version | ${buildVersion || "미확인"} |
| APK artifact | ${artifactUrl || "미확인"} |
| 선택 기기 | ${selectedDevice || "없음"} |
| adb 경로 | ${adbCommand} |
| 로컬 APK | ${apkPath || "미생성"} |

## 2. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 3. 다음 조치

${nextActions()}

## 4. 실행 명령

\`\`\`bash
npm run check:android-adb-ready
npm run install:android-preview-apk
WEATHERON_INSTALL_REPORT_ONLY=1 npm run install:android-preview-apk
\`\`\`
`;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
}

function nextActions() {
  if (issues.length === 0) {
    if (reportOnly && installStatus === "설치됨") return "- 대상 기기에 기대 버전 설치가 확인됐다.";
    if (reportOnly) return "- 설치 가능 상태다. 실제 설치는 `npm run install:android-preview-apk`로 실행한다.";
    return "- 설치 완료 후 `WeatherON_ANDROID_DEVICE_QA_SESSION.md`에 실기기 QA 결과를 기록한다.";
  }
  if (issues.some((issue) => issue.includes("no Android device detected"))) {
    return [
      "- 먼저 `npm run check:android-adb-ready`로 ADB 연결 상태를 복구한다.",
      "- 실기기 USB 디버깅을 켜고 `adb devices`에서 `device` 상태를 확인한다.",
      "- 연결 복구 후 `npm run install:android-preview-apk`를 다시 실행한다.",
    ].join("\n");
  }
  if (issues.some((issue) => issue.includes("multiple Android devices"))) {
    return "- 대상 기기를 하나만 남기거나 `ANDROID_SERIAL=<device id> npm run install:android-preview-apk`로 실행한다.";
  }
  if (issues.some((issue) => issue.includes("build is not FINISHED") || issue.includes("artifact"))) {
    return "- `WeatherON_ANDROID_BUILD_STATUS.md`의 최신 FINISHED APK artifact를 먼저 갱신한다.";
  }
  return "- Issues 항목을 해소한 뒤 설치 명령을 다시 실행한다.";
}
