import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { kstDate, normalizeTableValue, tableValue } from "./lib/markdownDoc.mjs";

const rootDir = process.cwd();
const privacyPolicyPath = join(rootDir, "docs/policy/weatheron_privacy_policy.html");
const storeInputsPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_PACKET.md");
const storeBlockersPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md");

const privacyPolicy = readFileSync(privacyPolicyPath, "utf8");
const storeInputsPacket = readFileSync(storeInputsPacketPath, "utf8");
const storeBlockers = readFileSync(storeBlockersPath, "utf8");

const placeholders = [
  "[YYYY-MM-DD]",
  "[회사명/개인사업자명]",
  "[고객센터 이메일/연락처]",
  "[ ]개월",
  "[이메일 인증 발송 서비스]",
  "[담당자명]",
  "[직책]",
  "[이메일/전화번호]",
];
const remainingPlaceholders = placeholders.filter((placeholder) => privacyPolicy.includes(placeholder));
const blockerCount = normalizeTableValue(tableValue(storeBlockers, "blocker 수")) || "미확인";
const inputFile = normalizeTableValue(tableValue(storeInputsPacket, "실제 입력 파일")) || "미확인";
const replyRows = extractSectionTable(storeInputsPacket, "## 2. 회신 표", "## 3. JSON 입력 템플릿")
  .filter((row) =>
    row.includes("개인정보처리방침") ||
    row.includes("운영자명") ||
    row.includes("고객센터") ||
    row.includes("개인정보 보호책임자") ||
    row.includes("광고/사용 로그") ||
    row.includes("이메일 인증"),
  );

const report = `# WeatherON Android Privacy Policy Packet

> 생성일: ${kstDate()}
> 목적: Google Play 제출 전 개인정보처리방침 placeholder 제거와 공개 HTTPS URL 준비를 별도로 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 개인정보처리방침 파일 | \`docs/policy/weatheron_privacy_policy.html\` |
| Play 제출 blocker | ${blockerCount} |
| 남은 placeholder 수 | ${remainingPlaceholders.length} |
| 입력 JSON 파일 | ${inputFile} |

## 2. 남은 placeholder

${remainingPlaceholders.length ? remainingPlaceholders.map((placeholder) => `- ${placeholder}`).join("\n") : "- 없음"}

## 3. 개인정보처리방침 회신값

| 항목 | 회신값 | 메모 |
|---|---|---|
${replyRows.length ? replyRows.join("\n") : "| 개인정보처리방침 공개 URL |  | HTTPS 필수 |"}

## 4. 공개 전 확인

1. 위 회신값으로 \`WeatherON_ANDROID_STORE_INPUTS.local.json\` 작성
2. \`npm run apply:android-store-inputs\` 실행
3. \`docs/policy/weatheron_privacy_policy.html\`에서 placeholder 0개 확인
4. HTML 파일을 공개 HTTPS URL에 배포
5. 공개 URL을 Play Console 앱 콘텐츠 > 개인정보처리방침에 입력
6. \`npm run check:android-store-submit-ready\` 재실행

## 5. 확인 명령

\`\`\`bash
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
npm run report:android-privacy-policy-packet
\`\`\`

## 6. 주의

- \`privacyPolicyUrl\`은 \`https://\` 공개 URL이어야 한다.
- \`example.com\`, \`담당자명\` 같은 샘플 값은 적용 스크립트에서 실패 처리된다.
- 정식 제출 전 법무 검토 필요.
`;

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android privacy policy packet generated: ${reportPath}`);

function extractSectionTable(text, startMarker, endMarker) {
  const section = sectionBetween(text, startMarker, endMarker);
  return section
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .filter((line) => !line.includes("---"))
    .filter((line) => !line.includes("항목 | 회신값"));
}

function sectionBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return "";
  const end = text.indexOf(endMarker, start + startMarker.length);
  return end === -1 ? text.slice(start) : text.slice(start, end);
}

