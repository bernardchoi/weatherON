import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const buildId = process.argv[2] ?? process.env.EAS_BUILD_ID;

if (!buildId) {
  console.error("usage: npm run check:eas-build-status -- <eas-build-id>");
  process.exit(1);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");
const mobileDir = join(rootDir, "apps/mobile");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const result = spawnSync(
  "npx",
  ["--yes", "--cache", "../../.npm-cache", "eas-cli", "build:view", buildId, "--json"],
  { cwd: mobileDir, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
);

if (result.status !== 0) {
  process.stdout.write(result.stdout);
  process.exit(result.status ?? 1);
}

const build = parseBuildJson(result.stdout);
const owner = build.project?.ownerAccount?.name;
const slug = build.project?.slug;
const buildUrl = owner && slug ? `https://expo.dev/accounts/${owner}/projects/${slug}/builds/${build.id}` : "";
const artifactUrl = build.artifacts?.applicationArchiveUrl ?? build.artifacts?.buildUrl ?? "";
const generatedAt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

console.log(`EAS build: ${build.id}`);
console.log(`status: ${build.status}`);
console.log(`platform: ${build.platform}`);
console.log(`profile: ${build.buildProfile}`);
console.log(`version: ${build.appVersion} (${build.appBuildVersion})`);
if (buildUrl) console.log(`url: ${buildUrl}`);
if (artifactUrl) console.log(`artifact: ${artifactUrl}`);

writeBuildStatusReport({
  build,
  buildUrl,
  artifactUrl,
  generatedAt,
});

function parseBuildJson(stdout) {
  const jsonStart = stdout.indexOf("{");
  if (jsonStart === -1) {
    throw new Error("EAS build:view did not return JSON");
  }
  return JSON.parse(stdout.slice(jsonStart));
}

function writeBuildStatusReport({ build, buildUrl, artifactUrl, generatedAt }) {
  mkdirSync(dirname(reportPath), { recursive: true });
  const previous = existsSync(reportPath) ? "\n" : "";
  const report = `# WeatherON Android Build Status

> 생성일: ${generatedAt}
> 목적: 최신 EAS Android preview 빌드 상태와 artifact 생성 여부를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| EAS build id | \`${build.id}\` |
| Build 상태 | ${build.status} |
| Platform | ${build.platform} |
| Profile | ${build.buildProfile} |
| Version | \`${build.appVersion} (${build.appBuildVersion})\` |
| Build 링크 | ${buildUrl || "미확인"} |
| APK artifact | ${artifactUrl || "미생성"} |

## 2. 확인 명령

\`\`\`bash
npm run check:eas-build-status -- ${build.id}
\`\`\`

## 3. 다음 액션

${build.status === "FINISHED" && artifactUrl
  ? "- APK artifact를 실기기에 재설치하고 `WeatherON_ANDROID_DEVICE_QA_SESSION.md` 기준으로 QA 진행"
  : "- 빌드 완료까지 상태를 재확인하고, artifact 생성 후 QA 대상 문서를 갱신"}

## 4. 변경 이력

| 날짜 | 내용 |
|---|---|
| ${generatedAt} | build \`${build.id}\` 상태 ${build.status} 확인 |
`;

  writeFileSync(reportPath, previous ? report : report, "utf8");
}
