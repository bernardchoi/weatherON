import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const closedTestDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_STATUS.md");
const reportOnly = process.env.WEATHERON_CLOSED_TEST_REPORT_ONLY === "1";

const issues = [];
let accountType = "미확인";
let closedTestRequired = "미확정";
let testerGroup = "미확인";
let testStartDate = "미정";
let testEndDate = "미정";
let invitedCount = 0;
let optedInCount = 0;
let activeDays = 0;
let operationRequired = "미확정";

if (!existsSync(closedTestDocPath)) {
  issues.push(`closed test operation doc is missing: ${closedTestDocPath}`);
} else {
  const doc = readFileSync(closedTestDocPath, "utf8");
  accountType = tableValue(doc, "Play Console 계정 유형") || "미확인";
  closedTestRequired = tableValue(doc, "폐쇄 테스트 필요 여부") || "미확정";
  testerGroup = tableValue(doc, "테스터 그룹") || "미확인";
  testStartDate = tableValue(doc, "테스트 시작일") || "미정";
  testEndDate = tableValue(doc, "테스트 종료일") || "미정";
  const needsClosedTestOperation = shouldRequireClosedTestOperation(closedTestRequired);
  operationRequired = needsClosedTestOperation ? "필요" : "불필요";

  addIfIncludes(doc, "Play Console 계정 유형 | 미확인", "Play Console 계정 유형 확인 필요");
  addIfIncludes(doc, "신규 개인 개발자 계정 여부 | 미확인", "신규 개인 개발자 계정 여부 확인 필요");
  addIfIncludes(doc, "폐쇄 테스트 필요 여부 | 계정 유형 확인 후 확정", "폐쇄 테스트 필요 여부 확정 필요");
  if (accountType === "개인 신규" && closedTestRequired !== "필요") {
    issues.push("신규 개인 개발자 계정은 폐쇄 테스트 필요로 표시해야 함");
  }
  if (needsClosedTestOperation) {
    addIfIncludes(doc, "테스터 그룹 | 미구성", "테스터 그룹 구성 필요");
    addIfIncludes(doc, "테스트 시작일 | 미정", "폐쇄 테스트 시작일 확정 필요");
    addIfIncludes(doc, "테스트 종료일 | 미정", "폐쇄 테스트 종료일 확정 필요");
  }
  addIfIncludes(doc, "P6 | APK QA", "최신 APK QA 1차 통과 필요");
  addIfIncludes(doc, "P7 | Play 앱 생성", "Play Console 앱 대시보드 생성 필요");
  if (needsClosedTestOperation) {
    addIfIncludes(doc, "P8 | 폐쇄 테스트 트랙", "폐쇄 테스트 트랙과 테스터 링크 준비 필요");
  }
  addIfIncludes(doc, "P9 | 개인정보처리방침 URL", "개인정보처리방침 공개 URL 입력 필요");

  const testerSection = sectionBetween(doc, "## 3. 테스터 모집 기록", "## 4. 14일 운영 기록");
  const operationSection = sectionBetween(doc, "## 4. 14일 운영 기록", "## 5. 피드백/버그 기록");

  const testerRows = testerSection
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line));
  invitedCount = testerRows.filter((line) => !line.includes("미초대")).length;
  optedInCount = testerRows.filter((line) => !line.includes("미확인") && !line.includes("미초대")).length;
  if (needsClosedTestOperation && invitedCount < 12) issues.push(`테스터 초대 12명 필요: 현재 ${invitedCount}명`);
  if (needsClosedTestOperation && optedInCount < 12) issues.push(`테스터 opt-in 12명 필요: 현재 ${optedInCount}명`);

  activeDays = operationSection
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line) && !line.includes("미시작") && !line.includes("| 0 |"))
    .length;
  if (needsClosedTestOperation && activeDays < 14) issues.push(`14일 연속 운영 기록 필요: 현재 ${activeDays}일`);
}

writeReport();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android closed test report generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android closed test ready check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("android closed test ready check passed");

function addIfIncludes(text, needle, issue) {
  if (text.includes(needle) && !issues.includes(issue)) issues.push(issue);
}

function sectionBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return "";
  const end = text.indexOf(endMarker, start + startMarker.length);
  return end === -1 ? text.slice(start) : text.slice(start, end);
}

function tableValue(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return match?.[1]?.trim() ?? "";
}

function shouldRequireClosedTestOperation(value) {
  return value !== "불필요";
}

function writeReport() {
  const report = `# WeatherON Android Closed Test Status

> 생성일: 2026-06-28
> 목적: Google Play 폐쇄 테스트 준비 상태, 테스터 opt-in, 14일 운영 기록 충족 여부를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 제출 가능 여부 | ${issues.length === 0 ? "가능" : "불가"} |
| issue 수 | ${issues.length} |
| 운영 기록 문서 | \`WeatherON_ANDROID_폐쇄테스트_운영기록.md\` |

## 2. 진행 수치

| 항목 | 값 |
|---|---|
| Play Console 계정 유형 | ${accountType} |
| 폐쇄 테스트 필요 여부 | ${closedTestRequired} |
| 폐쇄 테스트 운영 요구 | ${operationRequired} |
| 테스터 그룹 | ${testerGroup} |
| 테스트 시작일 | ${testStartDate} |
| 테스트 종료일 | ${testEndDate} |
| 테스터 초대 | ${invitedCount}/12 |
| 테스터 opt-in | ${optedInCount}/12 |
| 14일 운영 기록 | ${activeDays}/14 |

## 3. 다음 조치

1. Play Console 계정 유형을 확인한다.
2. 개인 신규 계정이면 테스터 12명 opt-in과 14일 운영을 채운다.
3. 폐쇄 테스트가 불필요로 확정되면 테스터/14일 운영은 생략하고 Play 제출 blocker만 해소한다.
4. 최신 APK QA 통과 후 필요한 트랙에 업로드한다.
5. 개인정보처리방침 공개 URL을 Play Console에 입력한다.

## 4. 사용자 회신 최소 양식

아래 값이 확정되면 \`WeatherON_ANDROID_폐쇄테스트_운영기록.md\`에 반영한다.

| 항목 | 회신값 |
|---|---|
| Play Console 계정 유형 | 개인 신규 / 개인 기존 / 조직 |
| 신규 개인 개발자 계정 여부 | 예 / 아니오 |
| 폐쇄 테스트 필요 여부 | 필요 / 불필요 / 권장 운영 |
| 테스터 그룹명 |  |
| 테스트 시작일 |  |
| 테스트 종료일 |  |
| Play Console 앱 대시보드 생성 여부 | 예 / 아니오 |
| 폐쇄 테스트 트랙 생성 여부 | 예 / 아니오 |
| 테스터 opt-in 링크 준비 여부 | 예 / 아니오 |
| 개인정보처리방침 공개 URL 입력 여부 | 예 / 아니오 |

테스터/운영 기록은 직접 식별자 없이 별칭으로 기록한다.

| 항목 | 기준 |
|---|---|
| 테스터 모집 | 12명 이상, 초대 상태와 opt-in 상태 기록 |
| 14일 운영 | Day 1~14 날짜, 활성 테스터 수, 배포 버전, 주요 플로우, 이슈 수 기록 |
| 피드백 | 화면, 심각도, 재현 조건, 조치 상태 기록 |

## 5. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 6. 확인 명령

\`\`\`bash
npm run check:android-closed-test-ready
WEATHERON_CLOSED_TEST_REPORT_ONLY=1 npm run check:android-closed-test-ready
\`\`\`

## 7. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-28 | 폐쇄 테스트 readiness 상태 리포트 최초 생성 |
`;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
}
