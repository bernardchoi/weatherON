import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const inputPath = process.argv[2] || process.env.WEATHERON_STORE_INPUTS_FILE || join(
  rootDir,
  "docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json",
);
const reportOnly = process.env.WEATHERON_STORE_INPUTS_REPORT_ONLY === "1";
const examplePath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS.example.json");
const privacyPolicyPath = join(rootDir, "docs/policy/weatheron_privacy_policy.html");
const storeDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_등록자료.md");
const inputsRequiredPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md");
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md");

const requiredFields = [
  "developerEmail",
  "developerWebsite",
  "privacyPolicyUrl",
  "operatorName",
  "supportContact",
  "privacyOfficerName",
  "privacyOfficerTitle",
  "privacyOfficerContact",
  "privacyPolicyEffectiveDate",
  "logRetentionMonths",
  "emailAuthService",
  "targetAge",
  "playConsoleAccountType",
];

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
    console.log(`android store inputs apply status generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android store inputs apply failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android store inputs applied: ${inputPath}`);

function readInputs(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    issues.push(`input JSON parse failed: ${error.message}`);
    return {};
  }
}

function validateInputs(values) {
  for (const field of requiredFields) {
    if (typeof values[field] !== "string" || values[field].trim() === "") {
      issues.push(`missing input field: ${field}`);
    }
  }
  if (values.privacyPolicyUrl && !values.privacyPolicyUrl.startsWith("https://")) {
    issues.push("privacyPolicyUrl must start with https://");
  }
  if (values.privacyPolicyUrl?.includes("example.com")) {
    issues.push("privacyPolicyUrl must be a real public URL, not example.com");
  }
  if (values.developerWebsite && values.developerWebsite !== "미입력" && !values.developerWebsite.startsWith("https://")) {
    issues.push("developerWebsite must be 미입력 or start with https://");
  }
  if (values.developerEmail && !isEmail(values.developerEmail)) {
    issues.push("developerEmail must be a valid email address");
  }
  if (values.supportContact && !isEmail(values.supportContact) && !isPhoneLike(values.supportContact)) {
    issues.push("supportContact must be an email address or phone-like contact");
  }
  if (values.privacyOfficerContact && !isEmail(values.privacyOfficerContact) && !isPhoneLike(values.privacyOfficerContact)) {
    issues.push("privacyOfficerContact must be an email address or phone-like contact");
  }
  if (values.privacyPolicyEffectiveDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.privacyPolicyEffectiveDate)) {
    issues.push("privacyPolicyEffectiveDate must use YYYY-MM-DD");
  }
  if (values.playConsoleAccountType && !["개인 신규", "개인 기존", "조직"].includes(values.playConsoleAccountType)) {
    issues.push("playConsoleAccountType must be one of 개인 신규, 개인 기존, 조직");
  }
  if (values.targetAge && !values.targetAge.includes("14")) {
    issues.push("targetAge should explicitly include 14 for the current draft policy");
  }
  for (const [field, value] of Object.entries(values)) {
    if (typeof value === "string" && (value.includes("담당자명") || value.includes("example.com"))) {
      issues.push(`placeholder value remains: ${field}`);
    }
  }
  if (values.logRetentionMonths && !/^\d+$/.test(values.logRetentionMonths)) {
    issues.push("logRetentionMonths must be a number string");
  }
  if (/^\d+$/.test(values.logRetentionMonths || "") && Number(values.logRetentionMonths) <= 0) {
    issues.push("logRetentionMonths must be greater than 0");
  }
}

function applyInputs(values) {
  let privacyPolicy = readFileSync(privacyPolicyPath, "utf8");
  privacyPolicy = replaceAll(privacyPolicy, {
    "[YYYY-MM-DD]": values.privacyPolicyEffectiveDate,
    "[회사명/개인사업자명]": values.operatorName,
    "[고객센터 이메일/연락처]": values.supportContact,
    "[ ]개월": `${values.logRetentionMonths}개월`,
    "[이메일 인증 발송 서비스]": values.emailAuthService,
    "[담당자명]": values.privacyOfficerName,
    "[직책]": values.privacyOfficerTitle,
    "[이메일/전화번호]": values.privacyOfficerContact,
  });
  privacyPolicy = appendPrivacyHistory(privacyPolicy, values.privacyPolicyEffectiveDate);
  writeFileSync(privacyPolicyPath, privacyPolicy, "utf8");

  let storeDoc = readFileSync(storeDocPath, "utf8");
  storeDoc = updateMarkdownTableRow(storeDoc, "개인정보처리방침 URL", values.privacyPolicyUrl, "확정");
  storeDoc = updateMarkdownTableRow(storeDoc, "개발자 이메일", values.developerEmail, "확정");
  storeDoc = updateMarkdownTableRow(storeDoc, "개발자 웹사이트", values.developerWebsite, values.developerWebsite === "미입력" ? "미입력" : "확정");
  storeDoc = updateMarkdownTableRow(storeDoc, "타겟 연령", values.targetAge, "법무 검토 필요");
  storeDoc = appendChangeHistory(storeDoc, "사용자 확정 입력값으로 개인정보처리방침/스토어 연락처 반영");
  writeFileSync(storeDocPath, storeDoc, "utf8");

  let inputsRequired = readFileSync(inputsRequiredPath, "utf8");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "Google Play 공개 개발자 이메일", values.developerEmail, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "개발자 웹사이트 URL 또는 미입력", values.developerWebsite, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "개인정보처리방침 공개 URL", values.privacyPolicyUrl, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "운영자명", values.operatorName, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "고객센터 연락처", values.supportContact, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "개인정보 보호책임자 성명", values.privacyOfficerName, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "개인정보 보호책임자 직책", values.privacyOfficerTitle, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "개인정보 보호책임자 연락처", values.privacyOfficerContact, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "개인정보처리방침 시행일", values.privacyPolicyEffectiveDate, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "광고/사용 로그 보유기간", `${values.logRetentionMonths}개월`, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "이메일 인증 발송 서비스", values.emailAuthService, "확정");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "타겟 연령", values.targetAge, "법무 검토 필요");
  inputsRequired = updateMarkdownTableRow(inputsRequired, "Play Console 계정 유형", values.playConsoleAccountType, "확정");
  inputsRequired = appendChangeHistory(inputsRequired, "스토어 입력값 적용 스크립트 실행 기준 추가");
  writeFileSync(inputsRequiredPath, inputsRequired, "utf8");
}

function replaceAll(text, replacements) {
  let next = text;
  for (const [from, to] of Object.entries(replacements)) {
    next = next.split(from).join(to);
  }
  return next;
}

function updateMarkdownTableRow(text, label, value, status) {
  const escaped = escapeRegExp(label);
  const threeColumn = new RegExp(`\\| ${escaped} \\| [^|]* \\| [^|]* \\|`, "g");
  if (threeColumn.test(text)) {
    return text.replace(threeColumn, `| ${label} | ${value} | ${status} |`);
  }
  const twoColumn = new RegExp(`\\| ${escaped} \\| [^|]* \\|`, "g");
  if (twoColumn.test(text)) {
    return text.replace(twoColumn, `| ${label} | ${value} |`);
  }
  return text;
}

function appendPrivacyHistory(text, date) {
  const row = `<tr><td>${date}</td><td>Google Play 제출 입력값 반영</td></tr>`;
  if (text.includes(row)) return text;
  return text.replace(
    /(<section>\s*<h2>9\. 변경 이력<\/h2>[\s\S]*?<tbody>)([\s\S]*?)(\s*<\/tbody>\s*<\/table>\s*<\/section>)/,
    `$1$2\n          ${row}$3`,
  );
}

function appendChangeHistory(text, message) {
  const row = `| ${kstDate()} | ${message} |`;
  if (text.includes(row)) return text;
  return text.replace(/\n$/, `| ${kstDate()} | ${message} |\n`);
}

function writeStatus() {
  const missingFields = issues
    .filter((issue) => issue.startsWith("missing input field: "))
    .map((issue) => issue.replace("missing input field: ", ""));
  const placeholderFields = issues
    .filter((issue) => issue.startsWith("placeholder value remains: "))
    .map((issue) => issue.replace("placeholder value remains: ", ""));
  const validationIssues = issues.filter(
    (issue) => !issue.startsWith("missing input field: ") && !issue.startsWith("placeholder value remains: "),
  );
  const example = existsSync(examplePath) ? JSON.parse(readFileSync(examplePath, "utf8")) : {};
  const report = `# WeatherON Android Store Inputs Apply Status

> 생성일: ${kstDate()}
> 목적: Google Play 제출 입력값 적용 상태와 실행 방법을 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 적용 여부 | ${applied ? "적용됨" : "미적용"} |
| 입력 파일 | ${inputPath} |
| 샘플 파일 | ${examplePath} |
| issue 수 | ${issues.length} |
| 누락 필드 수 | ${missingFields.length} |
| placeholder 필드 수 | ${placeholderFields.length} |
| 형식/검증 issue 수 | ${validationIssues.length} |

## 2. 입력값 분류

| 필드 | 상태 | 초안값 | 메모 |
|---|---|---|---|
${requiredFields.map((field) => storeInputRow(field, inputs[field], example[field], missingFields, placeholderFields, validationIssues)).join("\n")}

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. 실행 순서

1. \`WeatherON_ANDROID_STORE_INPUTS.example.json\`을 복사해 \`WeatherON_ANDROID_STORE_INPUTS.local.json\`을 만든다.
2. 실제 Play Console/개인정보처리방침 값을 채운다.
3. 아래 명령을 실행한다.

\`\`\`bash
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
\`\`\`
`;

  mkdirSync(dirname(statusPath), { recursive: true });
  writeFileSync(statusPath, report, "utf8");
}

function storeInputRow(field, value, exampleValue, missingFields, placeholderFields, validationIssues) {
  const actual = typeof value === "string" ? value.trim() : "";
  const draft = typeof exampleValue === "string" ? exampleValue : "";
  const status = inputStatus(field, actual, missingFields, placeholderFields, validationIssues);
  const note = inputNote(field);
  return `| ${field} | ${status} | ${draft || "-"} | ${note} |`;
}

function inputStatus(field, actual, missingFields, placeholderFields, validationIssues) {
  if (missingFields.includes(field)) return "누락";
  if (placeholderFields.includes(field)) return "placeholder";
  if (validationIssues.some((issue) => issue.includes(field))) return "검증 필요";
  if (!actual) return "미확인";
  return "입력됨";
}

function inputNote(field) {
  const notes = {
    developerEmail: "Play 공개 개발자 이메일",
    developerWebsite: "없으면 미입력",
    privacyPolicyUrl: "공개 HTTPS URL 필요",
    operatorName: "공개 운영자명",
    supportContact: "이메일 또는 전화번호",
    privacyOfficerName: "실명 또는 공개 책임자명 필요",
    privacyOfficerTitle: "공개 직책",
    privacyOfficerContact: "이메일 또는 전화번호",
    privacyPolicyEffectiveDate: "YYYY-MM-DD",
    logRetentionMonths: "1 이상 숫자",
    emailAuthService: "미도입이면 이메일 인증 미도입",
    targetAge: "14 포함 필요",
    playConsoleAccountType: "개인 신규/개인 기존/조직",
  };
  return notes[field] || "";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhoneLike(value) {
  return /^[0-9+()\-\s]{7,}$/.test(value);
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
