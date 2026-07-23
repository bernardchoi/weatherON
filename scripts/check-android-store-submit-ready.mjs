import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { normalizeTableValue, tableValue } from "./lib/markdownDoc.mjs";

const rootDir = process.cwd();
const storeDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_등록자료.md");
const storeInputsRequiredPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md");
const closedTestDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md");
const privacyPolicyPath = join(rootDir, "docs/policy/weatheron_privacy_policy.html");
const productionBuildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const reportOnly = process.env.WEATHERON_STORE_SUBMIT_REPORT_ONLY === "1";

const blockers = [];
let productionBuildStatus = "미확인";
let productionAabArtifact = "미확인";
const blockerDetails = new Map([
  ["Production AAB build 완료 필요", ["빌드", "Play Console 업로드용 production AAB build 상태를 FINISHED로 갱신"]],
  ["Production AAB artifact URL 확인 필요", ["빌드", "production AAB artifact URL을 확인하고 상태 문서에 반영"]],
  ["개발자 이메일 확정 필요", ["사용자 입력", "Play Console 공개 개발자 연락처 이메일 확정"]],
  ["개발자 웹사이트 입력 여부 결정 필요", ["사용자 입력", "웹사이트를 입력할지, 입력한다면 공개 HTTPS URL 확정"]],
  ["개인정보처리방침 공개 URL 확정 필요", ["외부 배포", "HTML 초안을 공개 HTTPS URL로 배포 후 스토어 문서에 반영"]],
  ["콘텐츠 등급 설문 완료 필요", ["외부 작업", "Play Console 콘텐츠 등급 설문 완료"]],
  ["정책/연령 문구 법무 검토 필요", ["정책 검토", "타겟 연령과 개인정보/광고 문구 최종 검토"]],
  ["Android 스크린샷 캡처 필요", ["실기기 QA", "최신 APK 통과 후 휴대전화 스크린샷 세트 캡처"]],
  ["Play Console 계정 유형 확인 필요", ["외부 작업", "개인 신규/개인 기존/조직 계정 여부 확인"]],
  ["폐쇄 테스트 필요 여부 확정 필요", ["외부 작업", "계정 유형 기준으로 폐쇄 테스트 의무 여부 확정"]],
  ["폐쇄 테스트 테스터 그룹 준비 필요", ["외부 작업", "필요 시 최소 12명 테스터 opt-in 준비"]],
]);

checkFileExists(storeDocPath, "Google Play 등록자료 문서");
checkFileExists(storeInputsRequiredPath, "Google Play 제출 입력값 문서");
checkFileExists(closedTestDocPath, "폐쇄 테스트 운영 기록 문서");
checkFileExists(privacyPolicyPath, "개인정보처리방침 HTML");
checkFileExists(productionBuildStatusPath, "Production AAB 상태 문서");

if (existsSync(productionBuildStatusPath)) {
  const productionBuildDoc = readFileSync(productionBuildStatusPath, "utf8");
  productionBuildStatus = normalizeTableValue(tableValue(productionBuildDoc, "Build 상태")) || "미확인";
  productionAabArtifact = normalizeTableValue(tableValue(productionBuildDoc, "AAB artifact")) || "미확인";
  if (productionBuildStatus !== "FINISHED") {
    blockers.push("Production AAB build 완료 필요");
  }
  if (!/^https:\/\/expo\.dev\/artifacts\/eas\/.+\.aab$/.test(productionAabArtifact)) {
    blockers.push("Production AAB artifact URL 확인 필요");
  }
}

if (existsSync(storeDocPath)) {
  const storeDoc = readFileSync(storeDocPath, "utf8");
  addIfIncludes(storeDoc, "개발자 이메일 | 미정", "개발자 이메일 확정 필요");
  addIfIncludes(storeDoc, "개발자 웹사이트 | 미정", "개발자 웹사이트 입력 여부 결정 필요");
  addIfIncludes(storeDoc, "개인정보처리방침 URL | `docs/policy/weatheron_privacy_policy.html` 공개 배포 후 URL 입력", "개인정보처리방침 공개 URL 확정 필요");
  addIfIncludes(storeDoc, "| 콘텐츠 등급 | 날씨/라이프스타일 비게임 앱 기준 설문 진행 | 미완료 |", "콘텐츠 등급 설문 완료 필요");
  addIfIncludes(storeDoc, "법무 검토 필요", "정책/연령 문구 법무 검토 필요");
  addIfIncludes(storeDoc, "preview APK 후 캡처", "Android 스크린샷 캡처 필요");
}

if (existsSync(closedTestDocPath)) {
  const closedTestDoc = readFileSync(closedTestDocPath, "utf8");
  addIfIncludes(closedTestDoc, "Play Console 계정 유형 | 미확인", "Play Console 계정 유형 확인 필요");
  addIfIncludes(closedTestDoc, "폐쇄 테스트 필요 여부 | 계정 유형 확인 후 확정", "폐쇄 테스트 필요 여부 확정 필요");
  addIfIncludes(closedTestDoc, "테스터 그룹 | 미구성", "폐쇄 테스트 테스터 그룹 준비 필요");
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

> 생성일: 2026-06-28
> 목적: Google Play Console 제출 직전에 반드시 해소해야 하는 문서/정책/등록자료 blocker를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 제출 가능 여부 | ${blockers.length === 0 ? "가능" : "불가"} |
| blocker 수 | ${blockers.length} |
| Production AAB 상태 | ${productionBuildStatus} |
| Production AAB artifact | ${productionAabArtifact} |

## 2. Blockers

${blockers.length === 0 ? "- 없음" : blockers.map((item) => `- ${item}`).join("\n")}

## 3. 처리 순서

1. Production AAB build \`FINISHED\`와 \`.aab\` artifact URL 확인
2. 최신 APK 실기기 QA 통과 후 스토어 스크린샷 캡처
3. \`WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md\` 회신 양식에 개발자 연락처, 운영자명, 개인정보 보호책임자 입력값 확정
4. 개인정보처리방침 placeholder 제거 후 공개 HTTPS URL 배포
5. Play Console 콘텐츠 등급과 타겟 연령 문구 확정
6. Play Console 계정 유형 확인 후 폐쇄 테스트 필요 여부와 테스터 운영 계획 확정

## 4. 상세 분류

| Blocker | 분류 | 해소 방법 |
|---|---|---|
${blockers.length === 0 ? "| 없음 | - | - |" : blockers.map((item) => {
    const [category, action] = classifyBlocker(item);
    return `| ${item} | ${category} | ${action} |`;
  }).join("\n")}

## 5. 사용자 회신 최소 양식

아래 값이 확정되면 개인정보처리방침 placeholder와 Play 제출 입력값을 동시에 해소한다.

| 항목 | 회신값 |
|---|---|
| Google Play 공개 개발자 이메일 |  |
| 개발자 웹사이트 URL 또는 미입력 |  |
| 개인정보처리방침 공개 URL |  |
| 운영자명 |  |
| 고객센터 연락처 |  |
| 개인정보 보호책임자 성명 |  |
| 개인정보 보호책임자 직책 |  |
| 개인정보 보호책임자 연락처 |  |
| 개인정보처리방침 시행일 |  |
| 광고/사용 로그 보유기간 | 권장 초안: 12개월 |
| 이메일 인증 발송 서비스 | 미도입이면 \`이메일 인증 미도입\` |
| 타겟 연령 | 권장 초안: 만 14세 이상 |
| Play Console 계정 유형 | 개인 신규 / 개인 기존 / 조직 |

## 6. 자동 반영 명령

\`WeatherON_ANDROID_STORE_INPUTS.example.json\`을 기준으로 실제 입력값 JSON을 만든 뒤 실행한다.

\`\`\`bash
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
\`\`\`

## 7. 확인 명령

\`\`\`bash
npm run check:android-store-submit-ready
\`\`\`
`;

  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");
}

function classifyBlocker(blocker) {
  if (blockerDetails.has(blocker)) return blockerDetails.get(blocker);
  if (blocker.includes("개인정보처리방침 placeholder")) {
    return ["사용자 입력", "placeholder 값을 확정해 개인정보처리방침 HTML에 반영"];
  }
  return ["확인 필요", "관련 문서의 미정/미완료 항목 확인"];
}
