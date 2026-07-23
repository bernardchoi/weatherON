import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { kstDate, tableValue as sharedTableValue } from "./lib/markdownDoc.mjs";

const rootDir = process.cwd();
const planPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md");
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md");
const screenshotDir = join(rootDir, "assets/store/android-screenshots");
const manifestPath = join(screenshotDir, "manifest.json");
const contentReviewPath = join(screenshotDir, "content-review.json");
const reportOnly = process.env.WEATHERON_SCREENSHOT_REPORT_ONLY === "1";

const expectedScreenshots = [
  ["phone-01-home.png", "H1 홈", "하단 홈"],
  ["phone-02-destination-search.png", "P1 목적지 검색", "하단 출발 > 목적지 추가"],
  ["phone-03-destination-care.png", "G2 목적지 케어", "하단 출발 > 목적지 카드"],
  ["phone-04-notification-center.png", "M2 알림 센터", "홈 알림 > 알림 센터"],
  ["phone-05-settings-policy.png", "M/R 정책 허브", "하단 MY > 설정/정책"],
];

const issues = [];
const rows = [];
const manifestItems = [];
const contentReview = readContentReview();
const buildStatus = existsSync(buildStatusPath) ? readFileSync(buildStatusPath, "utf8") : "";
const expectedBuildId = tableValue(buildStatus, "EAS build id");
const expectedAppVersion = tableValue(buildStatus, "Version");

if (!existsSync(planPath)) {
  issues.push(`screenshot plan is missing: ${planPath}`);
} else {
  const plan = readFileSync(planPath, "utf8");
  for (const [filename, label] of expectedScreenshots) {
    if (!plan.includes(filename) || !plan.includes(label)) {
      issues.push(`screenshot plan must include ${filename} / ${label}`);
    }
  }
  assert.ok(plan.includes("기준 APK"));
  if (expectedBuildId && !plan.includes(expectedBuildId)) {
    issues.push(`screenshot plan build id mismatch: expected ${expectedBuildId}`);
  }
}

for (const [filename, label, route] of expectedScreenshots) {
  const filePath = join(screenshotDir, filename);
  if (!existsSync(filePath)) {
    issues.push(`missing screenshot: ${filename}`);
    rows.push(`| ${filename} | ${label} | ${route} | 미캡처 | - |`);
    manifestItems.push({
      filename,
      screen: label,
      route,
      status: "missing",
      width: null,
      height: null,
      sha256: null,
    });
    continue;
  }

  const buffer = readFileSync(filePath);
  const dimensions = readPngDimensions(filePath);
  if (!dimensions) {
    issues.push(`screenshot must be PNG: ${filename}`);
    rows.push(`| ${filename} | ${label} | ${route} | 형식 오류 | PNG 아님 |`);
    manifestItems.push({
      filename,
      screen: label,
      route,
      status: "invalid",
      width: null,
      height: null,
      sha256: sha256(buffer),
    });
    continue;
  }

  const { width, height } = dimensions;
  const isPortrait = height > width;
  const isRecommendedSize = width >= 1080 && height >= 1920;
  const review = contentReview[filename];
  if (!isPortrait) issues.push(`screenshot must be portrait: ${filename}`);
  if (!isRecommendedSize) issues.push(`screenshot should be at least 1080x1920: ${filename}`);
  if (review?.status === "blocked") issues.push(`screenshot content blocked: ${filename} - ${review.issue}`);
  rows.push(`| ${filename} | ${label} | ${route} | 캡처됨 | ${width}x${height} |`);
  manifestItems.push({
    filename,
    screen: label,
    route,
    status: issues.some((issue) => issue.includes(filename)) ? "needs-review" : "ready",
    width,
    height,
    sha256: sha256(buffer),
  });
}

const extraFiles = existsSync(screenshotDir)
  ? readdirSync(screenshotDir).filter((filename) => filename.endsWith(".png") && !expectedScreenshots.some(([expected]) => expected === filename))
  : [];
for (const filename of extraFiles) issues.push(`unexpected screenshot file: ${filename}`);

writeManifest();
writeReport();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android store screenshot report generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android store screenshots ready check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("android store screenshots ready check passed");

function readPngDimensions(path) {
  const buffer = readFileSync(path);
  if (buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function writeManifest() {
  mkdirSync(screenshotDir, { recursive: true });
  const manifest = {
    generatedAt: kstDate(),
    sourceBuildId: expectedBuildId || null,
    appVersion: expectedAppVersion || null,
    requiredCount: expectedScreenshots.length,
    readyCount: manifestItems.filter((item) => item.status === "ready").length,
    issueCount: issues.length,
    recommended: {
      format: "PNG",
      orientation: "portrait",
      minWidth: 1080,
      minHeight: 1920,
    },
    contentReview: existsSync(contentReviewPath) ? "assets/store/android-screenshots/content-review.json" : null,
    files: manifestItems,
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function writeReport() {
  const report = `# WeatherON Android Store Screenshot Status

> 생성일: 2026-06-28
> 목적: Google Play 휴대전화 스크린샷 캡처 상태와 파일 검증 결과를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 제출 가능 여부 | ${issues.length === 0 ? "가능" : "불가"} |
| issue 수 | ${issues.length} |
| 기준 build id | ${expectedBuildId || "미확인"} |
| 기준 app version | ${expectedAppVersion || "미확인"} |
| 저장 위치 | \`assets/store/android-screenshots/\` |
| manifest | \`assets/store/android-screenshots/manifest.json\` |
| 준비 완료 파일 | ${manifestItems.filter((item) => item.status === "ready").length}/${expectedScreenshots.length} |

## 2. 캡처 상태

| 파일 | 화면 | 앱 내 이동 | 상태 | 크기 |
|---|---|---|---|---|
${rows.join("\n")}

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. 확인 명령

\`\`\`bash
npm run capture:android-store-screenshot -- phone-01-home.png
npm run capture:android-store-screenshot -- phone-02-destination-search.png
npm run capture:android-store-screenshot -- phone-03-destination-care.png
npm run capture:android-store-screenshot -- phone-04-notification-center.png
npm run capture:android-store-screenshot -- phone-05-settings-policy.png
npm run check:android-store-screenshots-ready
WEATHERON_SCREENSHOT_REPORT_ONLY=1 npm run check:android-store-screenshots-ready
\`\`\`
`;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
}

// 이 파일의 tableValue 호출부는 모두 백틱이 제거된 값을 기대하므로, 공용 파서를
// stripBackticks 옵션으로 감싼 동일 이름 함수를 유지해 호출부를 하나도 바꾸지 않는다.
function tableValue(markdown, label) {
  return sharedTableValue(markdown, label, { stripBackticks: true });
}

function readContentReview() {
  if (!existsSync(contentReviewPath)) return {};
  try {
    return JSON.parse(readFileSync(contentReviewPath, "utf8"));
  } catch {
    issues.push("content review JSON is invalid");
    return {};
  }
}
