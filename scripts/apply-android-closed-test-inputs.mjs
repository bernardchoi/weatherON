import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const inputPath = process.argv[2] || process.env.WEATHERON_CLOSED_TEST_INPUTS_FILE || join(
  rootDir,
  "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json",
);
const examplePath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS.example.json");
const closedTestDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md");
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md");
const reportOnly = process.env.WEATHERON_CLOSED_TEST_INPUTS_REPORT_ONLY === "1";

const accountTypes = new Set(["개인 신규", "개인 기존", "조직"]);
const yesNo = new Set(["예", "아니오"]);
const requiredValues = new Set(["필요", "불필요", "권장 운영"]);
const issues = [];
let applied = false;
let inputs = {};

if (!existsSync(inputPath)) {
  issues.push(`input file missing: ${inputPath}`);
} else {
  inputs = readInputs(inputPath);
  validateInputs(inputs);
  if (issues.length === 0 && !reportOnly) {
    applyInputs(inputs);
    applied = true;
  }
}

writeStatus();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android closed test inputs apply status generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android closed test inputs apply failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android closed test inputs applied: ${inputPath}`);

function readInputs(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    issues.push(`input JSON parse failed: ${error.message}`);
    return {};
  }
}

function validateInputs(values) {
  requireString(values, "accountType");
  requireString(values, "isNewPersonalDeveloperAccount");
  requireString(values, "closedTestRequired");
  requireString(values, "playAppCreated");
  requireString(values, "privacyPolicyUrlEntered");

  if (values.accountType && !accountTypes.has(values.accountType)) {
    issues.push("accountType must be one of 개인 신규, 개인 기존, 조직");
  }
  if (values.isNewPersonalDeveloperAccount && !yesNo.has(values.isNewPersonalDeveloperAccount)) {
    issues.push("isNewPersonalDeveloperAccount must be 예 or 아니오");
  }
  if (values.closedTestRequired && !requiredValues.has(values.closedTestRequired)) {
    issues.push("closedTestRequired must be one of 필요, 불필요, 권장 운영");
  }
  if (values.accountType === "개인 신규" && values.closedTestRequired !== "필요") {
    issues.push("개인 신규 계정은 closedTestRequired를 필요로 입력해야 함");
  }
  if (values.playAppCreated && !yesNo.has(values.playAppCreated)) {
    issues.push("playAppCreated must be 예 or 아니오");
  }
  if (values.closedTrackCreated && !yesNo.has(values.closedTrackCreated)) {
    issues.push("closedTrackCreated must be 예 or 아니오");
  }
  if (values.optInLinkReady && !yesNo.has(values.optInLinkReady)) {
    issues.push("optInLinkReady must be 예 or 아니오");
  }
  if (values.privacyPolicyUrlEntered && !yesNo.has(values.privacyPolicyUrlEntered)) {
    issues.push("privacyPolicyUrlEntered must be 예 or 아니오");
  }

  const needsOperation = values.closedTestRequired !== "불필요";
  if (needsOperation) validateOperationInputs(values);
}

function requireString(values, field) {
  if (typeof values[field] !== "string" || values[field].trim() === "") {
    issues.push(`missing input field: ${field}`);
  }
}

function validateOperationInputs(values) {
  for (const field of ["testerGroupName", "testStartDate", "testEndDate", "closedTrackCreated", "optInLinkReady"]) {
    requireString(values, field);
  }
  if (values.testStartDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.testStartDate)) {
    issues.push("testStartDate must use YYYY-MM-DD");
  }
  if (values.testEndDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.testEndDate)) {
    issues.push("testEndDate must use YYYY-MM-DD");
  }
  if (!Array.isArray(values.testers)) {
    issues.push("testers must be an array");
  } else {
    const invited = values.testers.filter((tester) => tester.invited === "초대").length;
    const optedIn = values.testers.filter((tester) => tester.optIn === "완료").length;
    if (invited < 12) issues.push(`testers invited must be at least 12: current ${invited}`);
    if (optedIn < 12) issues.push(`testers opt-in must be at least 12: current ${optedIn}`);
  }
  if (!Array.isArray(values.operationDays)) {
    issues.push("operationDays must be an array");
  } else {
    const active = values.operationDays.filter((day) => day.status === "운영" && Number(day.activeTesters) > 0).length;
    if (active < 14) issues.push(`operationDays active records must be at least 14: current ${active}`);
  }
}

function applyInputs(values) {
  let doc = readFileSync(closedTestDocPath, "utf8");
  doc = updateMarkdownTableRow(doc, "Play Console 계정 유형", values.accountType);
  doc = updateMarkdownTableRow(doc, "신규 개인 개발자 계정 여부", values.isNewPersonalDeveloperAccount);
  doc = updateMarkdownTableRow(doc, "폐쇄 테스트 필요 여부", values.closedTestRequired);
  doc = updateMarkdownTableRow(doc, "테스터 그룹", values.testerGroupName || "불필요");
  doc = updateMarkdownTableRow(doc, "테스트 시작일", values.testStartDate || "불필요");
  doc = updateMarkdownTableRow(doc, "테스트 종료일", values.testEndDate || "불필요");
  doc = updateChecklistRow(doc, "P7", values.playAppCreated === "예" ? "완료" : "미완료");
  doc = updateChecklistRow(doc, "P8", values.closedTestRequired === "불필요" ? "불필요" : values.closedTrackCreated === "예" ? "완료" : "미완료");
  doc = updateChecklistRow(doc, "P9", values.privacyPolicyUrlEntered === "예" ? "완료" : "미완료");
  if (values.closedTestRequired !== "불필요") {
    doc = replaceTesterRows(doc, values.testers || []);
    doc = replaceOperationRows(doc, values.operationDays || []);
  }
  doc = appendChangeHistory(doc, "폐쇄 테스트 입력값 JSON 반영");
  writeFileSync(closedTestDocPath, doc, "utf8");
}

function updateMarkdownTableRow(text, label, value) {
  const escaped = escapeRegExp(label);
  return text.replace(new RegExp(`\\| ${escaped} \\| [^|]* \\|`, "g"), `| ${label} | ${value} |`);
}

function updateChecklistRow(text, id, status) {
  const escaped = escapeRegExp(id);
  return text.replace(new RegExp(`\\| ${escaped} \\| ([^|]+) \\| ([^|]+) \\| [^|]+ \\|`, "g"), `| ${id} | $1 | $2 | ${status} |`);
}

function replaceTesterRows(text, testers) {
  return replaceRowsInSection(text, "## 3. 테스터 모집 기록", "## 4. 14일 운영 기록", (section) => {
    let next = section;
    testers.slice(0, 12).forEach((tester, index) => {
      const no = index + 1;
      const row = `| ${no} | ${tester.testerAlias || ""} | ${tester.deviceOs || ""} | ${tester.invited || "미초대"} | ${tester.optIn || "미확인"} | ${tester.memo || ""} |`;
      next = next.replace(new RegExp(`\\| ${no} \\|[^\\n]+`), row);
    });
    return next;
  });
}

function replaceOperationRows(text, days) {
  return replaceRowsInSection(text, "## 4. 14일 운영 기록", "## 5. 피드백/버그 기록", (section) => {
    let next = section;
    days.slice(0, 14).forEach((day) => {
      const no = Number(day.day);
      if (!Number.isInteger(no) || no < 1 || no > 14) return;
      const row = `| ${no} | ${day.date || ""} | ${day.activeTesters || "0"} | ${day.version || ""} | ${day.flow || ""} | ${day.issueCount || "0"} | ${day.status || "미시작"} |`;
      next = next.replace(new RegExp(`\\| ${no} \\|[^\\n]+`), row);
    });
    return next;
  });
}

function replaceRowsInSection(text, startMarker, endMarker, replacer) {
  const start = text.indexOf(startMarker);
  if (start === -1) return text;
  const end = text.indexOf(endMarker, start + startMarker.length);
  const sectionEnd = end === -1 ? text.length : end;
  const before = text.slice(0, start);
  const section = text.slice(start, sectionEnd);
  const after = text.slice(sectionEnd);
  return `${before}${replacer(section)}${after}`;
}

function appendChangeHistory(text, message) {
  const row = `| ${kstDate()} | ${message} |`;
  if (text.includes(row)) return text;
  return text.replace(/\n$/, `${row}\n`);
}

function writeStatus() {
  const needsOperation = inputs.closedTestRequired !== "불필요";
  const testerCount = Array.isArray(inputs.testers) ? inputs.testers.filter((tester) => tester.invited === "초대").length : 0;
  const optInCount = Array.isArray(inputs.testers) ? inputs.testers.filter((tester) => tester.optIn === "완료").length : 0;
  const operationCount = Array.isArray(inputs.operationDays)
    ? inputs.operationDays.filter((day) => day.status === "운영" && Number(day.activeTesters) > 0).length
    : 0;
  const report = `# WeatherON Android Closed Test Inputs Apply Status

> 생성일: ${kstDate()}
> 목적: 폐쇄 테스트 계정 유형, 테스터, 14일 운영 입력값 적용 상태를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 적용 여부 | ${applied ? "적용됨" : "미적용"} |
| 입력 파일 | ${inputPath} |
| 샘플 파일 | ${examplePath} |
| issue 수 | ${issues.length} |
| 폐쇄 테스트 운영 요구 | ${needsOperation ? "필요" : "불필요"} |
| 테스터 초대 입력 | ${testerCount}/12 |
| 테스터 opt-in 입력 | ${optInCount}/12 |
| 14일 운영 입력 | ${operationCount}/14 |

## 2. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 3. 실행 순서

1. \`WeatherON_ANDROID_CLOSED_TEST_INPUTS.example.json\`을 복사해 \`WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json\`을 만든다.
2. Play Console 계정 유형, 폐쇄 테스트 필요 여부, 테스터/운영 값을 채운다.
3. 아래 명령을 실행한다.

\`\`\`bash
npm run apply:android-closed-test-inputs
npm run check:android-closed-test-ready
npm run report:android-release-action-board
\`\`\`
`;

  mkdirSync(dirname(statusPath), { recursive: true });
  writeFileSync(statusPath, report, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
