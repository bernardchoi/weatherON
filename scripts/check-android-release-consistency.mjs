import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_CONSISTENCY_STATUS.md");
const reportOnly = process.env.WEATHERON_RELEASE_CONSISTENCY_REPORT_ONLY === "1";

const paths = {
  readiness: join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md"),
  actionBoard: join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md"),
  evidence: join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_EVIDENCE_INDEX.md"),
  previewBuild: join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md"),
  productionBuild: join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md"),
  artifactAccess: join(rootDir, "docs/architecture/WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md"),
  blockers: join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md"),
  screenshotStatus: join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md"),
  storeInputs: join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md"),
  closedTestInputs: join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md"),
  closedTestStatus: join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_STATUS.md"),
};

const docs = Object.fromEntries(
  Object.entries(paths).map(([key, path]) => [key, existsSync(path) ? readFileSync(path, "utf8") : ""]),
);
const issues = [];
const rows = [];

for (const [key, path] of Object.entries(paths)) {
  if (!docs[key]) issues.push(`required status doc missing: ${path}`);
}

compare("preview build id", [
  ["readiness", value(docs.readiness, "최신 preview build")],
  ["actionBoard", value(docs.actionBoard, "최신 preview build")],
  ["evidence", splitBuild(value(docs.evidence, "preview build")).id],
  ["previewBuild", value(docs.previewBuild, "EAS build id")],
]);
compare("preview build status", [
  ["readiness", value(docs.readiness, "최신 preview build 상태")],
  ["actionBoard", value(docs.actionBoard, "build 상태")],
  ["evidence", splitBuild(value(docs.evidence, "preview build")).status],
  ["previewBuild", value(docs.previewBuild, "Build 상태")],
]);
compare("production build id", [
  ["readiness", value(docs.readiness, "최신 production build")],
  ["actionBoard", value(docs.actionBoard, "최신 production build")],
  ["evidence", splitBuild(value(docs.evidence, "production build")).id],
  ["productionBuild", value(docs.productionBuild, "EAS build id")],
]);
compare("production build status", [
  ["readiness", value(docs.readiness, "최신 production build 상태")],
  ["actionBoard", value(docs.actionBoard, "production build 상태")],
  ["evidence", splitBuild(value(docs.evidence, "production build")).status],
  ["productionBuild", value(docs.productionBuild, "Build 상태")],
  ["blockers", value(docs.blockers, "Production AAB 상태")],
]);
compare("store blocker count", [
  ["actionBoard", value(docs.actionBoard, "Play 제출 blocker")],
  ["evidence", value(docs.evidence, "Play 제출 blocker")],
  ["blockers", value(docs.blockers, "blocker 수")],
]);
compare("artifact access issue count", [
  ["evidence", value(docs.evidence, "artifact 접근 issue")],
  ["artifactAccess", value(docs.artifactAccess, "issue 수")],
]);
compare("device QA pending count", [
  ["actionBoard", value(docs.actionBoard, "실기기 QA 미검증")],
  ["evidence", value(docs.evidence, "실기기 QA 미검증")],
]);
compare("screenshot issue count", [
  ["actionBoard", value(docs.actionBoard, "스토어 스크린샷 issue")],
  ["evidence", value(docs.evidence, "스토어 스크린샷 issue")],
  ["screenshotStatus", value(docs.screenshotStatus, "issue 수")],
]);
compare("screenshot ready count", [
  ["actionBoard", value(docs.actionBoard, "스토어 스크린샷 준비")],
  ["evidence", value(docs.evidence, "스토어 스크린샷 준비")],
  ["screenshotStatus", value(docs.screenshotStatus, "준비 완료 파일")],
]);
compare("store input missing count", [
  ["actionBoard", value(docs.actionBoard, "local 스토어 입력 누락")],
  ["evidence", value(docs.evidence, "Play 입력값 누락")],
]);
compare("store input applied", [
  ["actionBoard", value(docs.actionBoard, "스토어 입력값 적용")],
  ["evidence", value(docs.evidence, "스토어 입력값 적용")],
  ["storeInputs", value(docs.storeInputs, "적용 여부")],
]);
compare("store input issue count", [
  ["actionBoard", value(docs.actionBoard, "스토어 입력값 issue")],
  ["evidence", value(docs.evidence, "스토어 입력값 issue")],
  ["storeInputs", value(docs.storeInputs, "issue 수")],
]);
compare("store input missing field count", [
  ["actionBoard", value(docs.actionBoard, "스토어 입력값 누락 필드")],
  ["evidence", value(docs.evidence, "스토어 입력값 누락 필드")],
  ["storeInputs", value(docs.storeInputs, "누락 필드 수")],
]);
compare("store input placeholder count", [
  ["actionBoard", value(docs.actionBoard, "스토어 입력값 placeholder")],
  ["evidence", value(docs.evidence, "스토어 입력값 placeholder")],
  ["storeInputs", value(docs.storeInputs, "placeholder 필드 수")],
]);
compare("store input validation issue count", [
  ["actionBoard", value(docs.actionBoard, "스토어 입력값 형식/검증 issue")],
  ["evidence", value(docs.evidence, "스토어 입력값 형식/검증 issue")],
  ["storeInputs", value(docs.storeInputs, "형식/검증 issue 수")],
]);
compare("closed test pending count", [
  ["actionBoard", value(docs.actionBoard, "폐쇄 테스트 대기 항목")],
  ["evidence", value(docs.evidence, "폐쇄 테스트 대기 항목")],
]);
compare("closed test input applied", [
  ["actionBoard", value(docs.actionBoard, "폐쇄 테스트 입력값 적용")],
  ["evidence", value(docs.evidence, "폐쇄 테스트 입력값 적용")],
  ["closedTestInputs", value(docs.closedTestInputs, "적용 여부")],
]);
compare("closed test input issue count", [
  ["actionBoard", value(docs.actionBoard, "폐쇄 테스트 입력값 issue")],
  ["evidence", value(docs.evidence, "폐쇄 테스트 입력값 issue")],
  ["closedTestInputs", value(docs.closedTestInputs, "issue 수")],
]);
compare("closed test operation required", [
  ["actionBoard", value(docs.actionBoard, "폐쇄 테스트 운영 요구")],
  ["evidence", value(docs.evidence, "폐쇄 테스트 운영 요구")],
  ["closedTestInputs", value(docs.closedTestInputs, "폐쇄 테스트 운영 요구")],
  ["closedTestStatus", value(docs.closedTestStatus, "폐쇄 테스트 운영 요구")],
]);

writeReport();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android release consistency report generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android release consistency check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("android release consistency check passed");

function compare(label, entries) {
  const normalized = entries.map(([source, raw]) => [source, normalize(raw)]);
  const present = normalized.filter(([, item]) => item);
  const unique = [...new Set(present.map(([, item]) => item))];
  const status = unique.length === 1 ? "통과" : "불일치";
  if (status !== "통과") {
    issues.push(`${label} mismatch: ${present.map(([source, item]) => `${source}=${item || "미확인"}`).join(", ")}`);
  }
  rows.push(`| ${label} | ${status} | ${present.map(([source, item]) => `${source}: ${item || "미확인"}`).join("<br>")} |`);
}

function value(text, label) {
  if (!text) return "";
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return match?.[1] ?? "";
}

function splitBuild(raw) {
  const normalized = normalize(raw);
  const separator = " / ";
  const separatorIndex = normalized.lastIndexOf(separator);
  if (separatorIndex === -1) return { id: normalized, status: "" };
  return {
    id: normalized.slice(0, separatorIndex).trim(),
    status: normalized.slice(separatorIndex + separator.length).trim(),
  };
}

function normalize(raw) {
  return String(raw ?? "")
    .replace(/^`|`$/g, "")
    .replace(/`/g, "")
    .trim();
}

function writeReport() {
  const report = `# WeatherON Android Release Consistency Status

> 생성일: ${kstDate()}
> 목적: Android 출시 상태 문서 간 build id, build 상태, blocker 수, artifact 접근성 값이 일치하는지 검증한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 일치 여부 | ${issues.length === 0 ? "일치" : "불일치"} |
| issue 수 | ${issues.length} |

## 2. 비교 결과

| 항목 | 상태 | 비교값 |
|---|---|---|
${rows.join("\n")}

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. 확인 명령

\`\`\`bash
npm run check:android-release-consistency
WEATHERON_RELEASE_CONSISTENCY_REPORT_ONLY=1 npm run check:android-release-consistency
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
