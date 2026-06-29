import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const requiredPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md");
const applyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md");
const blockersPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const examplePath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS.example.json");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_PACKET.md");

const required = readFileSync(requiredPath, "utf8");
const applyStatus = readFileSync(applyStatusPath, "utf8");
const blockers = readFileSync(blockersPath, "utf8");
const example = JSON.parse(readFileSync(examplePath, "utf8"));

const blockerCount = normalizeTableValue(tableValue(blockers, "blocker 수")) || "미확인";
const issueCount = normalizeTableValue(tableValue(applyStatus, "issue 수")) || "미확인";
const missingFieldCount = normalizeTableValue(tableValue(applyStatus, "누락 필드 수")) || "미확인";
const placeholderFieldCount = normalizeTableValue(tableValue(applyStatus, "placeholder 필드 수")) || "미확인";
const validationIssueCount = normalizeTableValue(tableValue(applyStatus, "형식/검증 issue 수")) || "미확인";
const inputFile = normalizeTableValue(tableValue(applyStatus, "입력 파일")) || "미확인";
const missingFields = applyStatus
  .split("\n")
  .filter((line) => line.startsWith("- missing input field: "))
  .map((line) => line.replace("- missing input field: ", "").trim());
const replyRows = extractReplyRows(required);

const report = `# WeatherON Android Store Inputs Packet

> 생성일: ${kstDate()}
> 목적: Google Play 제출과 개인정보처리방침 공개에 필요한 외부 입력값을 한 장에서 회신하고 JSON으로 반영한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| blocker 수 | ${blockerCount} |
| 입력값 issue 수 | ${issueCount} |
| 누락 필드 수 | ${missingFieldCount} |
| placeholder 필드 수 | ${placeholderFieldCount} |
| 형식/검증 issue 수 | ${validationIssueCount} |
| 실제 입력 파일 | ${inputFile} |
| 누락 필드 | ${missingFields.length ? missingFields.join(", ") : "없음"} |

## 2. 입력 분류

| 필드 | 상태 | 초안값 | 메모 |
|---|---|---|---|
${extractInputClassificationRows(applyStatus).join("\n")}

## 3. 회신 표

아래 값이 채워지면 개인정보처리방침 placeholder와 Play 제출 입력값을 동시에 반영할 수 있다.

| 항목 | 회신값 | 메모 |
|---|---|---|
${replyRows.join("\n")}

## 4. JSON 입력 템플릿

\`docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json\`에 아래 형식으로 실제 값을 입력한다.

\`\`\`json
${JSON.stringify(example, null, 2)}
\`\`\`

주의:
- \`privacyPolicyUrl\`은 실제 공개 HTTPS URL이어야 한다.
- \`developerWebsite\`는 웹사이트를 쓰지 않으면 \`미입력\`으로 둔다.
- \`privacyOfficerName\`에는 실제 담당자명 또는 공개 가능한 책임자명을 넣는다.
- \`playConsoleAccountType\`은 \`개인 신규\`, \`개인 기존\`, \`조직\` 중 하나로 확정한다.

## 5. 검증 규칙

| 필드 | 규칙 |
|---|---|
| \`developerEmail\` | 이메일 형식 |
| \`developerWebsite\` | \`미입력\` 또는 HTTPS URL |
| \`privacyPolicyUrl\` | 실제 공개 HTTPS URL, \`example.com\` 불가 |
| \`supportContact\` | 이메일 또는 전화번호 형식 |
| \`privacyOfficerContact\` | 이메일 또는 전화번호 형식 |
| \`privacyPolicyEffectiveDate\` | \`YYYY-MM-DD\` |
| \`logRetentionMonths\` | 1 이상 숫자 문자열 |
| \`targetAge\` | 현재 정책 초안 기준 \`14\` 포함 |
| \`playConsoleAccountType\` | \`개인 신규\`, \`개인 기존\`, \`조직\` 중 하나 |

## 6. 반영 명령

\`\`\`bash
npm run prepare:android-release-local-files
npm run apply:android-store-safe-defaults
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
npm run report:android-release-action-board
\`\`\`

## 7. 반영 후 확인

1. \`WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md\` issue 수 0 확인
2. \`weatheron_privacy_policy.html\` placeholder 제거 확인
3. 개인정보처리방침 공개 URL 배포 후 Play Console에 입력
4. 콘텐츠 등급/계정 유형/폐쇄 테스트 필요 여부 확정
`;

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android store inputs packet generated: ${reportPath}`);

function extractReplyRows(markdown) {
  const start = markdown.indexOf("| Google Play 공개 개발자 이메일 |");
  if (start === -1) return ["| Google Play 공개 개발자 이메일 |  | 필수 |"];
  return markdown
    .slice(start)
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.includes("---"))
    .filter((line) => !line.includes("항목 | 회신값"))
    .slice(0, 15);
}

function extractInputClassificationRows(markdown) {
  const start = markdown.indexOf("| developerEmail |");
  if (start === -1) return ["| developerEmail | 미확인 | - | Play 공개 개발자 이메일 |"];
  return markdown
    .slice(start)
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.includes("---"))
    .slice(0, 13);
}

function tableValue(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return match?.[1]?.trim() ?? "";
}

function normalizeTableValue(value) {
  return value.replace(/^`|`$/g, "").trim();
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
