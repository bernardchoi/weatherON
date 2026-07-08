import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md");

const appConfigPath = join(rootDir, "apps/mobile/app.json");
const readinessPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md");
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const productionBuildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md");
const deviceQaPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md");
const deviceQaPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_PACKET.md");
const deviceQaApplyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_APPLY_STATUS.md");
const screenshotStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md");
const adbStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_ADB_STATUS.md");
const installStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_INSTALL_STATUS.md");
const storeBlockersPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const storeInputsPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md");
const storeInputsApplyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md");
const localInputFilesStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_LOCAL_INPUT_FILES_STATUS.md");
const closedTestPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md");
const closedTestStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_STATUS.md");
const closedTestInputsApplyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md");

const appConfig = JSON.parse(readOptional(appConfigPath) || "{}").expo ?? {};
const sourceVersion = appConfig.version && appConfig.android?.versionCode ? `${appConfig.version} (${appConfig.android.versionCode})` : "미확인";
const readiness = readOptional(readinessPath);
const buildStatus = readOptional(buildStatusPath);
const productionBuildStatus = readOptional(productionBuildStatusPath);
const deviceQa = readOptional(deviceQaPath);
const deviceQaPacket = readOptional(deviceQaPacketPath);
const deviceQaApplyStatus = readOptional(deviceQaApplyStatusPath);
const screenshots = readOptional(screenshotStatusPath);
const adbStatus = readOptional(adbStatusPath);
const installStatus = readOptional(installStatusPath);
const storeBlockers = readOptional(storeBlockersPath);
const storeInputs = readOptional(storeInputsPath);
const storeInputsApplyStatus = readOptional(storeInputsApplyStatusPath);
const localInputFilesStatus = readOptional(localInputFilesStatusPath);
const closedTest = readOptional(closedTestPath);
const closedTestStatus = readOptional(closedTestStatusPath);
const closedTestInputsApplyStatus = readOptional(closedTestInputsApplyStatusPath);

const latestBuildId = tableValue(buildStatus, "EAS build id") || tableValue(readiness, "최신 preview build") || tableValue(deviceQa, "EAS build id") || "미확인";
const latestBuildStatus = tableValue(buildStatus, "Build 상태") || tableValue(readiness, "최신 preview build 상태") || tableValue(deviceQa, "Build 상태") || "미확인";
const latestBuildVersion = tableValue(buildStatus, "Version") || tableValue(deviceQaPacket, "Version") || "미확인";
const previewBuildMatchesSource = latestBuildVersion === sourceVersion;
const latestBuildAttemptResult = tableValue(buildStatus, "결과");
const latestBuildFailureReason = tableValue(buildStatus, "실패 원인");
const isQuotaBlocked = latestBuildAttemptResult === "실패" && latestBuildFailureReason.includes("quota");
const latestProductionBuildId = tableValue(productionBuildStatus, "EAS build id") || tableValue(readiness, "최신 production build") || "미확인";
const latestProductionBuildStatus = tableValue(productionBuildStatus, "Build 상태") || tableValue(readiness, "최신 production build 상태") || "미확인";
const staticChecks = tableValue(readiness, "정적 체크 통과") || "미확인";
const storeBlockerCount = tableValue(storeBlockers, "blocker 수") || "미확인";
const screenshotIssueCount = tableValue(screenshots, "issue 수") || "미확인";
const screenshotReadyCount = tableValue(screenshots, "준비 완료 파일") || "미확인";
const adbReadyStatus = tableValue(adbStatus, "준비 상태") || "미확인";
const apkInstallStatus = tableValue(installStatus, "설치 상태") || "미확인";
const deviceQaAppliedStatus = tableValue(deviceQaApplyStatus, "적용 여부") || "미확인";
const storeInputsAppliedStatus = tableValue(storeInputsApplyStatus, "적용 여부") || "미확인";
const storeInputsIssueCount = tableValue(storeInputsApplyStatus, "issue 수") || "미확인";
const storeInputsMissingCount = tableValue(storeInputsApplyStatus, "누락 필드 수") || "미확인";
const storeInputsPlaceholderCount = tableValue(storeInputsApplyStatus, "placeholder 필드 수") || "미확인";
const storeInputsValidationIssueCount = tableValue(storeInputsApplyStatus, "형식/검증 issue 수") || "미확인";
const localInputFilesIssueCount = tableValue(localInputFilesStatus, "issue 수") || "미확인";
const localStoreMissingCount = tableValue(localInputFilesStatus, "스토어 입력 누락") || "미확인";
const localQaMissingEnvironmentCount = tableValue(localInputFilesStatus, "QA 환경값 누락") || "미확인";
const localQaPendingResultCount = tableValue(localInputFilesStatus, "QA 미검증 항목") || "미확인";
const closedTestInvited = tableValue(closedTestStatus, "테스터 초대") || "미확인";
const closedTestOptIn = tableValue(closedTestStatus, "테스터 opt-in") || "미확인";
const closedTestActiveDays = tableValue(closedTestStatus, "14일 운영 기록") || "미확인";
const closedTestInputsAppliedStatus = tableValue(closedTestInputsApplyStatus, "적용 여부") || "미확인";
const closedTestInputsIssueCount = tableValue(closedTestInputsApplyStatus, "issue 수") || "미확인";
const closedTestOperationRequired = tableValue(closedTestInputsApplyStatus, "폐쇄 테스트 운영 요구") || tableValue(closedTestStatus, "폐쇄 테스트 운영 요구") || "미확인";
const deviceQaPendingCount = countQaRowsContaining(deviceQaPacket || deviceQa, "미검증");
const deviceQaD7Result = qaResultFor(deviceQaPacket || deviceQa, "D7");
const deviceQaBlockingFailure = deviceQaD7Result === "실패" && (deviceQaPacket || deviceQa).includes(latestBuildId);
const requiredInputPendingCount = countTableRowsEndingWith(storeInputs, "미정") + countTableRowsContaining(storeInputs, "미확인") + countTableRowsContaining(storeInputs, "미완료");
const closedTestPendingCount = Number(tableValue(closedTestStatus, "issue 수")) || countClosedTestPending(closedTest);

const topActions = [];

if (!previewBuildMatchesSource) {
  topActions.push([
    "최신 MVP preview APK",
    isQuotaBlocked
      ? `현재 소스 ${sourceVersion} 기준 새 APK 필요. ${latestBuildFailureReason}`
      : `현재 소스 ${sourceVersion} 기준 새 APK 필요. EAS 외부 업로드가 포함되므로 사용자 승인 후 \`npm run build:android:preview:no-wait\` 실행`,
    isQuotaBlocked ? `quota 대기 · 현재 APK ${latestBuildVersion}` : `필요 · 현재 APK ${latestBuildVersion}`,
  ]);
}

if (deviceQaBlockingFailure) {
  topActions.push([
    "위치 수정 preview APK",
    "`npm run build:android:preview:no-wait` 실행 후 `npm run check:eas-build-status -- <eas-build-id>`로 완료 확인",
    "필요",
  ]);
}

if (adbReadyStatus !== "가능") {
  topActions.push([
    "ADB/실기기 연결",
    "USB 디버깅 허용 후 `npm run check:android-adb-ready` 재실행",
    adbReadyStatus === "불가" ? "필요" : adbReadyStatus,
  ]);
}

if (previewBuildMatchesSource) {
  topActions.push([
    "최신 MVP preview APK",
    "`npm run build:android:preview:no-wait`는 EAS 외부 업로드가 포함되므로 사용자 승인 후 실행",
    "최신 소스 반영됨",
  ]);
}

topActions.push(
  [
    `실기기 QA`,
    !previewBuildMatchesSource
      ? "새 preview APK 생성 후 D1~D13 판정"
      : deviceQaBlockingFailure
      ? "새 preview APK 설치 후 D7 위치 권한 재검증"
      : latestBuildStatus === "FINISHED"
        ? `${latestBuildId} APK 재설치 후 D1~D13 판정`
        : `${latestBuildId} 빌드 완료 후 APK 재설치`,
    latestBuildStatus === "FINISHED" ? (deviceQaPendingCount === 0 ? "완료" : `${deviceQaPendingCount}개 미검증`) : `빌드 ${latestBuildStatus}`,
  ],
  ["스토어 스크린샷", "`assets/store/android-screenshots/`에 5장 저장", screenshotIssueCount === "0" ? "완료" : `${screenshotIssueCount}개 issue`],
  [
    "Play 제출 입력값",
    "`WeatherON_ANDROID_STORE_INPUTS.local.json` 작성 후 `npm run apply:android-store-inputs` 실행",
    storeInputsAppliedStatus === "적용됨" && storeInputsIssueCount === "0" ? "완료" : `${storeInputsIssueCount}개 issue · 누락 ${storeInputsMissingCount}`,
  ],
  [
    "폐쇄 테스트 준비",
    "`WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json` 작성 후 `npm run apply:android-closed-test-inputs` 실행. 14일 운영 안에 코디 포함 build 검증",
    closedTestInputsAppliedStatus === "적용됨" && closedTestPendingCount === 0 ? "완료" : `${closedTestPendingCount}개 대기 · 입력 ${closedTestInputsIssueCount}개 issue`,
  ],
  ["Production AAB", "`npm run check:eas-production-build-status -- <build-id>` 기준 FINISHED 확인", latestProductionBuildStatus === "FINISHED" ? "완료" : latestProductionBuildStatus],
  ["스토어 blocker", "`npm run check:android-store-submit-ready` 기준 해소", storeBlockerCount === "0" ? "완료" : `${storeBlockerCount}개 잔존`],
);

const report = `# WeatherON Android Release Action Board

> 생성일: ${kstDate()}
> 목적: Android 출시 준비의 다음 행동, QA 상태, 제출 blocker를 한 화면에서 추적한다.

## 1. 현재 요약

| 항목 | 값 |
|---|---|
| 최신 preview build | \`${latestBuildId}\` |
| build 상태 | ${latestBuildStatus} |
| preview build version | \`${latestBuildVersion}\` |
| 소스 기준 version | \`${sourceVersion}\` |
| preview build 소스 일치 | ${previewBuildMatchesSource ? "일치" : "불일치"} |
| 최신 production build | \`${latestProductionBuildId}\` |
| production build 상태 | ${latestProductionBuildStatus} |
| 정적 체크 통과 | ${staticChecks} |
| 실기기 QA 미검증 | ${deviceQaPendingCount} |
| 실기기 QA 결과 적용 | ${deviceQaAppliedStatus} |
| 스토어 스크린샷 issue | ${screenshotIssueCount} |
| 스토어 스크린샷 준비 | ${screenshotReadyCount} |
| ADB 연결 | ${adbReadyStatus} |
| APK 설치 | ${apkInstallStatus} |
| local 입력 파일 issue | ${localInputFilesIssueCount} |
| local 스토어 입력 누락 | ${localStoreMissingCount} |
| local QA 환경/결과 누락 | ${localQaMissingEnvironmentCount}/${localQaPendingResultCount} |
| 스토어 입력값 적용 | ${storeInputsAppliedStatus} |
| 스토어 입력값 issue | ${storeInputsIssueCount} |
| 스토어 입력값 누락 필드 | ${storeInputsMissingCount} |
| 스토어 입력값 placeholder | ${storeInputsPlaceholderCount} |
| 스토어 입력값 형식/검증 issue | ${storeInputsValidationIssueCount} |
| Play 제출 blocker | ${storeBlockerCount} |
| 사용자/외부 입력 미확정 | ${requiredInputPendingCount} |
| 폐쇄 테스트 대기 항목 | ${closedTestPendingCount} |
| 폐쇄 테스트 입력값 적용 | ${closedTestInputsAppliedStatus} |
| 폐쇄 테스트 입력값 issue | ${closedTestInputsIssueCount} |
| 폐쇄 테스트 운영 요구 | ${closedTestOperationRequired} |
| 폐쇄 테스트 초대/opt-in/운영 | ${closedTestInvited} / ${closedTestOptIn} / ${closedTestActiveDays} |

## 2. 다음 액션

| 우선 | 작업 | 완료 기준 | 상태 |
|---|---|---|---|
${topActions.map(([name, action, status], index) => `| ${index + 1} | ${name} | ${action} | ${status} |`).join("\n")}

## 3. 실행 명령

\`\`\`bash
npm run check:android-local-release-ready
npm run prepare:android-release-local-files
npm run build:android:preview:no-wait
npm run check:eas-build-status -- <eas-build-id>
npm run check:android-device-qa-ready
npm run report:android-device-qa-packet
npm run apply:android-device-qa-results
npm run check:android-store-screenshots-ready
npm run check:android-store-submit-ready
npm run report:android-store-inputs-packet
npm run apply:android-store-inputs
npm run apply:android-closed-test-inputs
npm run build:android:production:no-wait
npm run check:eas-production-build-status -- <eas-build-id>
\`\`\`

## 4. 연결 문서

| 문서 | 목적 |
|---|---|
| \`WeatherON_ANDROID_DEVICE_QA_SESSION.md\` | 실기기 D1~D13 결과 기록 |
| \`WeatherON_ANDROID_DEVICE_QA_PACKET.md\` | 최신 APK 설치 링크와 D1~D13 수동 QA 패킷 |
| \`WeatherON_ANDROID_DEVICE_QA_APPLY_STATUS.md\` | 실기기 QA 결과 JSON 적용 상태 |
| \`WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md\` | 스토어 스크린샷 캡처 목록 |
| \`WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md\` | 스토어 스크린샷 캡처 작업 패킷 |
| \`WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md\` | 스크린샷 파일 검증 결과 |
| \`WeatherON_ANDROID_ADB_STATUS.md\` | 실기기/ADB 연결 준비 상태 |
| \`WeatherON_ANDROID_INSTALL_STATUS.md\` | 최신 preview APK 설치 상태 |
| \`WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md\` | 사용자/외부 입력값 회신 양식 |
| \`WeatherON_ANDROID_STORE_INPUTS_PACKET.md\` | Play 제출/개인정보처리방침 입력값 회신 패킷 |
| \`WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md\` | 개인정보처리방침 placeholder와 공개 URL 준비 패킷 |
| \`WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md\` | Play Console AAB 업로드 대상과 출시 노트 초안 |
| \`WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md\` | 스토어 입력값 자동 반영 상태 |
| \`WeatherON_ANDROID_LOCAL_INPUT_FILES_STATUS.md\` | local JSON 템플릿 생성 상태 |
| \`WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md\` | Play 제출 blocker |
| \`WeatherON_ANDROID_폐쇄테스트_운영기록.md\` | 계정 유형, 테스터, 14일 운영 기록 |
| \`WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md\` | 폐쇄 테스트 입력값 자동 반영 상태 |
| \`WeatherON_ANDROID_CLOSED_TEST_PACKET.md\` | 폐쇄 테스트 계정/테스터/14일 운영 패킷 |
| \`WeatherON_ANDROID_CLOSED_TEST_STATUS.md\` | 폐쇄 테스트 readiness 이슈 |
| \`WeatherON_ANDROID_MANUAL_ACTION_PACKET.md\` | 자동 검증 후 남은 수동 액션 통합 패킷 |
| \`WeatherON_ANDROID_CONTENT_RATING_DRAFT.md\` | 콘텐츠 등급 설문 답변 초안 |
| \`WeatherON_ANDROID_BUILD_STATUS.md\` | 최신 EAS Android build 상태 |
| \`WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md\` | Play 제출용 production AAB build 상태 |
| \`WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md\` | preview APK와 production AAB artifact URL 접근성 |
| \`WeatherON_ANDROID_RELEASE_EVIDENCE_INDEX.md\` | 빌드/검증/문서 증빙 인덱스 |
| \`WeatherON_ANDROID_RELEASE_CONSISTENCY_STATUS.md\` | 출시 상태 문서 간 값 일치성 검증 |

## 5. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-28 | Android release action board 최초 생성 |
`;

await mkdir(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android release action board generated: ${reportPath}`);

function readOptional(path) {
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function tableValue(text, label) {
  if (!text) return "";
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return (match?.[1] ?? "").replace(/^`|`$/g, "").trim();
}

function countTableRowsContaining(text, token) {
  if (!text) return 0;
  return text
    .split("\n")
    .filter((line) => line.startsWith("|") && line.includes(token))
    .length;
}

function countQaRowsContaining(text, token) {
  if (!text) return 0;
  return text
    .split("\n")
    .filter((line) => /^\|\s*D[\d-]+\s*\|/.test(line) && line.includes(token))
    .length;
}

function countTableRowsEndingWith(text, token) {
  if (!text) return 0;
  return text
    .split("\n")
    .filter((line) => line.startsWith("|") && line.split("|").map((cell) => cell.trim()).includes(token))
    .length;
}

function qaResultFor(text, id) {
  if (!text) return "";
  const row = text
    .split("\n")
    .find((line) => line.trim().startsWith(`| ${id} |`));
  if (!row) return "";
  return row
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim())[3] ?? "";
}

function countClosedTestPending(text) {
  if (!text) return 0;
  const checks = [
    "Play Console 계정 유형 | 미확인",
    "신규 개인 개발자 계정 여부 | 미확인",
    "폐쇄 테스트 필요 여부 | 계정 유형 확인 후 확정",
    "테스터 그룹 | 미구성",
    "테스트 시작일 | 미정",
    "테스트 종료일 | 미정",
    "P7 | Play 앱 생성",
    "P8 | 폐쇄 테스트 트랙",
    "P9 | 개인정보처리방침 URL",
  ];
  return checks.filter((snippet) => text.includes(snippet)).length;
}
