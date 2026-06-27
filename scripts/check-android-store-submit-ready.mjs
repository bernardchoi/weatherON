import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const storeDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_등록자료.md");
const privacyPolicyPath = join(rootDir, "docs/policy/weatheron_privacy_policy.html");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const reportOnly = process.env.WEATHERON_STORE_SUBMIT_REPORT_ONLY === "1";

const blockers = [];

checkFileExists(storeDocPath, "Google Play 등록자료 문서");
checkFileExists(privacyPolicyPath, "개인정보처리방침 HTML");

if (existsSync(storeDocPath)) {
  const storeDoc = readFileSync(storeDocPath, "utf8");
  addIfIncludes(storeDoc, "개발자 이메일 | 미정", "개발자 이메일 확정 필요");
  addIfIncludes(storeDoc, "개발자 웹사이트 | 미정", "개발자 웹사이트 입력 여부 결정 필요");
  addIfIncludes(storeDoc, "개인정보처리방침 URL | `docs/policy/weatheron_privacy_policy.html` 공개 배포 후 URL 입력", "개인정보처리방침 공개 URL 확정 필요");
  addIfIncludes(storeDoc, "검토 필요", "Play Console 입력 전 검토 필요 항목 남음");
  addIfIncludes(storeDoc, "미완료", "Play Console 제출 전 미완료 항목 남음");
  addIfIncludes(storeDoc, "법무 검토 필요", "정책/연령 문구 법무 검토 필요");
  addIfIncludes(storeDoc, "preview APK 후 캡처", "Android 스크린샷 캡처 필요");
}

if (existsSync(privacyPolicyPath)) {
  const privacyPolicy = readFileSync(privacyPolicyPath, "utf8");
  for (const placeholder of [
    "[YYYY-MM-DD]",
    "[회사명/개인사업자명]",
    "[고객센터 이메일/연락처]",
    "[ ]개월",
    "[이메일 인증 발송 서비스]",
    "[담당자명]",
    "[직책]",
    "[이메일/전화번호]",
  ]) {
    addIfIncludes(privacyPolicy, placeholder, `개인정보처리방침 placeholder 제거 필요: ${placeholder}`);
  }
}

await writeReport();

if (blockers.length > 0) {
  if (reportOnly) {
    console.log(`android store submit blockers report generated: ${blockers.length} blockers`);
    process.exit(0);
  }
  console.error(`android store submit ready check failed: ${blockers.length} blockers`);
  for (const blocker of blockers) console.error(` - ${blocker}`);
  process.exit(1);
}

console.log("android store submit ready check passed");

function checkFileExists(path, label) {
  if (!existsSync(path)) blockers.push(`${label} 없음: ${path}`);
}

function addIfIncludes(text, needle, message) {
  if (text.includes(needle) && !blockers.includes(message)) blockers.push(message);
}

async function writeReport() {
  const report = `# WeatherON Android Store Submission Blockers

> 생성일: 2026-06-27
> 목적: Google Play Console 제출 직전에 반드시 해소해야 하는 문서/정책/등록자료 blocker를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 제출 가능 여부 | ${blockers.length === 0 ? "가능" : "불가"} |
| blocker 수 | ${blockers.length} |

## 2. Blockers

${blockers.length === 0 ? "- 없음" : blockers.map((item) => `- ${item}`).join("\n")}

## 3. 확인 명령

\`\`\`bash
npm run check:android-store-submit-ready
\`\`\`
`;

  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");
}
