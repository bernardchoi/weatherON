import https from "node:https";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { kstDate, normalizeTableValue, tableValue } from "./lib/markdownDoc.mjs";

const rootDir = process.cwd();
const previewBuildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const productionBuildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md");
const reportOnly = process.env.WEATHERON_ARTIFACT_ACCESS_REPORT_ONLY === "1";

const issues = [];
const targets = [
  {
    label: "preview APK",
    expectedExtension: ".apk",
    sourcePath: previewBuildStatusPath,
    urlLabel: "APK artifact",
  },
  {
    label: "production AAB",
    expectedExtension: ".aab",
    sourcePath: productionBuildStatusPath,
    urlLabel: "AAB artifact",
  },
];

const rows = [];

for (const target of targets) {
  if (!existsSync(target.sourcePath)) {
    issues.push(`${target.label} source doc missing`);
    rows.push(`| ${target.label} | 미확인 | 문서 없음 | 실패 | - |`);
    continue;
  }
  const doc = readFileSync(target.sourcePath, "utf8");
  const url = normalizeTableValue(tableValue(doc, target.urlLabel));
  if (url && !url.startsWith("https://") && url.endsWith(target.expectedExtension)) {
    if (existsSync(join(rootDir, url))) {
      rows.push(`| ${target.label} | ${url} | 로컬 파일 확인 | 통과 | ${url} |`);
      continue;
    }
    issues.push(`${target.label} local artifact missing`);
    rows.push(`| ${target.label} | ${url} | 로컬 파일 없음 | 실패 | - |`);
    continue;
  }
  if (!url || !url.startsWith("https://") || !url.endsWith(target.expectedExtension)) {
    issues.push(`${target.label} artifact URL invalid`);
    rows.push(`| ${target.label} | ${url || "미확인"} | URL 오류 | 실패 | - |`);
    continue;
  }

  const result = await checkUrl(url);
  const ok = result.statusCode >= 200 && result.statusCode < 400;
  if (!ok) issues.push(`${target.label} artifact access failed: HTTP ${result.statusCode || "unknown"}`);
  rows.push(`| ${target.label} | ${url} | HTTP ${result.statusCode || "unknown"} | ${ok ? "통과" : "실패"} | ${redactSignedUrl(result.finalUrl || url)} |`);
}

writeReport();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android artifact access report generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android artifact access check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("android artifact access check passed");

function checkUrl(url, redirects = 0) {
  return new Promise((resolve) => {
    const request = https.request(url, { method: "HEAD", timeout: 15000 }, (response) => {
      const location = response.headers.location;
      if ([301, 302, 303, 307, 308].includes(response.statusCode ?? 0) && location && redirects < 5) {
        response.resume();
        resolve(checkUrl(new URL(location, url).toString(), redirects + 1));
        return;
      }
      response.resume();
      resolve({ statusCode: response.statusCode ?? 0, finalUrl: url });
    });
    request.on("timeout", () => {
      request.destroy();
      resolve({ statusCode: 0, finalUrl: url });
    });
    request.on("error", () => resolve({ statusCode: 0, finalUrl: url }));
    request.end();
  });
}

function writeReport() {
  const report = `# WeatherON Android Artifact Access Status

> 생성일: ${kstDate()}
> 목적: EAS preview APK와 production AAB artifact URL이 다운로드 가능한지 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 접근 가능 여부 | ${issues.length === 0 ? "가능" : "확인 필요"} |
| issue 수 | ${issues.length} |

## 2. Artifact 접근 결과

| 대상 | URL | 응답 | 상태 | 최종 URL |
|---|---|---|---|---|
${rows.join("\n")}

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. 확인 명령

\`\`\`bash
npm run check:android-artifact-access
WEATHERON_ARTIFACT_ACCESS_REPORT_ONLY=1 npm run check:android-artifact-access
\`\`\`

## 5. 주의

- 이 검증은 네트워크와 Expo artifact URL 접근 권한이 필요하다.
- sandbox에서 네트워크가 제한되면 프로젝트 오류가 아니라 실행 환경 제한으로 본다.
`;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
}

function redactSignedUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}
