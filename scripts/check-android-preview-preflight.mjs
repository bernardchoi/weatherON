import assert from "node:assert/strict";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const appJsonPath = join(rootDir, "apps/mobile/app.json");
const androidBuildGradlePath = join(rootDir, "apps/mobile/android/app/build.gradle");
const rootEasIgnorePath = join(rootDir, ".easignore");
const mobileEasIgnorePath = join(rootDir, "apps/mobile/.easignore");
const mobileEnvPath = join(rootDir, "apps/mobile/.env.local");
const serverEnvPath = join(rootDir, "apps/server/.env.local");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PREVIEW_PREFLIGHT_STATUS.md");

const appConfig = JSON.parse(readFileSync(appJsonPath, "utf8")).expo;
const buildGradle = readFileSync(androidBuildGradlePath, "utf8");
const rootEasIgnore = readFileSync(rootEasIgnorePath, "utf8");
const mobileEasIgnore = readFileSync(mobileEasIgnorePath, "utf8");
const mobileEnv = readEnvFile(mobileEnvPath);
const serverEnv = readEnvFile(serverEnvPath);

const sourceVersion = `${appConfig.version} (${appConfig.android.versionCode})`;
const nativeApplicationId = capture(buildGradle, /applicationId\s+'([^']+)'/);
const nativeVersionCode = Number(capture(buildGradle, /versionCode\s+(\d+)/));
const nativeVersionName = capture(buildGradle, /versionName\s+"([^"]+)"/);
const weatherClientMode = mobileEnv.EXPO_PUBLIC_WEATHER_CLIENT || "openmeteo";
const weatherApiBaseUrl = mobileEnv.EXPO_PUBLIC_WEATHER_API_BASE_URL || "";
const kmaServiceKeyReady = Boolean(serverEnv.KMA_SERVICE_KEY);

const issues = [];
const checks = [];

check("Expo package", appConfig.android.package === "com.weatheron.mobile", appConfig.android.package);
check("Native applicationId", nativeApplicationId === appConfig.android.package, nativeApplicationId);
check("Native versionCode", nativeVersionCode === appConfig.android.versionCode, String(nativeVersionCode));
check("Native versionName", nativeVersionName === appConfig.version, nativeVersionName);
check("Weather client mode", ["openmeteo", "proxy", "fixture"].includes(weatherClientMode), weatherClientMode);

if (weatherClientMode === "proxy") {
  check("Weather proxy base URL", Boolean(weatherApiBaseUrl), weatherApiBaseUrl ? maskUrl(weatherApiBaseUrl) : "empty");
  check("Weather proxy public URL", isPublicHttpsUrl(weatherApiBaseUrl), weatherApiBaseUrl ? maskUrl(weatherApiBaseUrl) : "empty");
  check("KMA service key", kmaServiceKeyReady, kmaServiceKeyReady ? "set" : "empty");
} else {
  checks.push({ name: "Weather proxy base URL", passed: true, detail: weatherApiBaseUrl ? maskUrl(weatherApiBaseUrl) : "not required" });
  checks.push({ name: "KMA service key", passed: true, detail: kmaServiceKeyReady ? "set" : "not required" });
}

for (const snippet of [
  ".git",
  ".git/",
  "node_modules/",
  ".npm-cache/",
  "apps/mobile/dist/",
  "apps/mobile/dist-web/",
  "apps/mobile/web-build/",
  "apps/mobile/android/.gradle/",
  "apps/mobile/android/build/",
  "apps/mobile/android/**/build/",
  "docs/",
  "mockups/",
  "brand/",
  "assets/store/",
]) {
  check(`Root .easignore ${snippet}`, rootEasIgnore.includes(snippet), snippet);
}

for (const snippet of [
  ".git",
  ".git/",
  "node_modules/",
  ".expo/",
  "dist/",
  "dist-web/",
  "web-build/",
  "android/.gradle/",
  "android/build/",
  "android/**/build/",
  "ios/build/",
]) {
  check(`Mobile .easignore ${snippet}`, mobileEasIgnore.includes(snippet), snippet);
}

const riskyDirs = [
  "apps/mobile/android/app/build",
  "apps/mobile/android/.gradle",
  "apps/mobile/android/build",
  "apps/mobile/dist",
  "apps/mobile/dist-web",
  "node_modules",
  ".git",
  ".npm-cache",
];

const riskyRows = riskyDirs.map((relativePath) => {
  const absolutePath = join(rootDir, relativePath);
  return {
    path: relativePath,
    exists: existsSync(absolutePath),
    size: existsSync(absolutePath) ? formatBytes(dirSize(absolutePath)) : "없음",
    ignored: isIgnoredByRequiredRules(relativePath),
  };
});

for (const row of riskyRows) {
  if (row.exists && !row.ignored) issues.push(`${row.path} exists but is not covered by preflight ignore rules`);
}

writeReport();

if (issues.length > 0) {
  console.error(`android preview preflight failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("android preview preflight check passed");

function check(name, passed, detail) {
  checks.push({ name, passed, detail });
  if (!passed) issues.push(`${name}: ${detail}`);
}

function capture(text, pattern) {
  return text.match(pattern)?.[1] ?? "";
}

function isIgnoredByRequiredRules(relativePath) {
  if (relativePath === "apps/mobile/android/app/build") return rootEasIgnore.includes("apps/mobile/android/**/build/");
  if (relativePath === "apps/mobile/android/.gradle") return rootEasIgnore.includes("apps/mobile/android/.gradle/");
  if (relativePath === "apps/mobile/android/build") return rootEasIgnore.includes("apps/mobile/android/build/");
  if (relativePath === "apps/mobile/dist") return rootEasIgnore.includes("apps/mobile/dist/");
  if (relativePath === "apps/mobile/dist-web") return rootEasIgnore.includes("apps/mobile/dist-web/");
  if (relativePath === "node_modules") return rootEasIgnore.includes("node_modules/");
  if (relativePath === ".git") return rootEasIgnore.includes(".git");
  if (relativePath === ".npm-cache") return rootEasIgnore.includes(".npm-cache/");
  return false;
}

function dirSize(path) {
  const stats = statSync(path);
  if (!stats.isDirectory()) return stats.size;
  const stack = [path];
  let total = 0;
  while (stack.length > 0) {
    const current = stack.pop();
    const stats = statSync(current);
    total += stats.size;
    if (!stats.isDirectory()) continue;
    for (const name of readdirSync(current)) stack.push(join(current, name));
  }
  return total;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  for (const unit of units) {
    if (value < 1024) return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
    value /= 1024;
  }
  return `${value.toFixed(1)} TB`;
}

function writeReport() {
  const report = `# WeatherON Android Preview Preflight Status

> 생성일: ${kstDate()}
> 목적: EAS preview build 재시도 전 native package, version, archive 제외 설정을 로컬에서 점검한다.

## 1. 요약

| 항목 | 값 |
|---|---|
| 상태 | ${issues.length === 0 ? "통과" : "확인 필요"} |
| issue 수 | ${issues.length} |
| 소스 기준 Version | \`${sourceVersion}\` |
| Expo android.package | \`${appConfig.android.package}\` |
| Native applicationId | \`${nativeApplicationId}\` |
| Native versionCode | \`${nativeVersionCode}\` |
| Native versionName | \`${nativeVersionName}\` |
| Weather client | \`${weatherClientMode}\` |
| Weather proxy URL | \`${weatherApiBaseUrl ? maskUrl(weatherApiBaseUrl) : "없음"}\` |
| KMA key | \`${kmaServiceKeyReady ? "set" : "empty"}\` |

## 2. 체크

| 체크 | 상태 | 근거 |
|---|---|---|
${checks.map((item) => `| ${item.name} | ${item.passed ? "통과" : "확인 필요"} | \`${item.detail}\` |`).join("\n")}

## 3. 큰 로컬 산출물

| 경로 | 존재 | 크기 | 제외 규칙 |
|---|---|---|---|
${riskyRows.map((item) => `| \`${item.path}\` | ${item.exists ? "예" : "아니오"} | ${item.size} | ${item.ignored ? "있음" : "없음"} |`).join("\n")}

## 4. 다음 명령

\`\`\`bash
npm run check:android-preview-preflight
npm run build:android:preview:no-wait
\`\`\`
`;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return readFileSync(path, "utf8").split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const index = trimmed.indexOf("=");
    if (index < 1) return acc;
    const key = trimmed.slice(0, index).trim();
    acc[key] = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    return acc;
  }, {});
}

function isPublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return !["127.0.0.1", "localhost", "0.0.0.0"].includes(url.hostname);
  } catch {
    return false;
  }
}

function maskUrl(value) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "invalid";
  }
}
