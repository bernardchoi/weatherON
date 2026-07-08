import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const readinessPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md");
const actionBoardPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md");
const artifactAccessPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md");
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const productionBuildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md");
const storeBlockersPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const storeInputsApplyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md");
const closedTestInputsStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md");
const screenshotStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_EVIDENCE_INDEX.md");

const readiness = readFileSync(readinessPath, "utf8");
const actionBoard = readFileSync(actionBoardPath, "utf8");
const artifactAccess = readFileSync(artifactAccessPath, "utf8");
const buildStatus = readFileSync(buildStatusPath, "utf8");
const productionBuildStatus = readFileSync(productionBuildStatusPath, "utf8");
const storeBlockers = readFileSync(storeBlockersPath, "utf8");
const storeInputsApplyStatus = readFileSync(storeInputsApplyStatusPath, "utf8");
const closedTestInputsStatus = readFileSync(closedTestInputsStatusPath, "utf8");
const screenshotStatus = readFileSync(screenshotStatusPath, "utf8");

const appName = normalizeTableValue(tableValue(readiness, "앱 이름"));
const androidPackage = normalizeTableValue(tableValue(readiness, "Android package"));
const versionCode = normalizeTableValue(tableValue(readiness, "Android versionCode"));
const staticChecks = normalizeTableValue(tableValue(readiness, "정적 체크 통과"));
const previewBuildId = normalizeTableValue(tableValue(buildStatus, "EAS build id"));
const previewBuildState = normalizeTableValue(tableValue(buildStatus, "Build 상태"));
const previewArtifact = normalizeTableValue(tableValue(buildStatus, "APK artifact"));
const productionBuildId = normalizeTableValue(tableValue(productionBuildStatus, "EAS build id"));
const productionBuildState = normalizeTableValue(tableValue(productionBuildStatus, "Build 상태"));
const productionArtifact = normalizeTableValue(tableValue(productionBuildStatus, "AAB artifact"));
const artifactIssueCount = normalizeTableValue(tableValue(artifactAccess, "issue 수"));
const storeBlockerCount = normalizeTableValue(tableValue(storeBlockers, "blocker 수"));
const qaPending = normalizeTableValue(tableValue(actionBoard, "실기기 QA 미검증"));
const screenshotIssues = normalizeTableValue(tableValue(actionBoard, "스토어 스크린샷 issue"));
const screenshotReady = normalizeTableValue(tableValue(screenshotStatus, "준비 완료 파일"));
const storeInputMissing = normalizeTableValue(tableValue(actionBoard, "local 스토어 입력 누락"));
const storeInputsApplied = normalizeTableValue(tableValue(storeInputsApplyStatus, "적용 여부"));
const storeInputsIssues = normalizeTableValue(tableValue(storeInputsApplyStatus, "issue 수"));
const storeInputsMissingFields = normalizeTableValue(tableValue(storeInputsApplyStatus, "누락 필드 수"));
const storeInputsPlaceholders = normalizeTableValue(tableValue(storeInputsApplyStatus, "placeholder 필드 수"));
const storeInputsValidationIssues = normalizeTableValue(tableValue(storeInputsApplyStatus, "형식/검증 issue 수"));
const closedTestPending = normalizeTableValue(tableValue(actionBoard, "폐쇄 테스트 대기 항목"));
const closedTestInputsApplied = normalizeTableValue(tableValue(closedTestInputsStatus, "적용 여부"));
const closedTestInputIssues = normalizeTableValue(tableValue(closedTestInputsStatus, "issue 수"));
const closedTestOperationRequired = normalizeTableValue(tableValue(closedTestInputsStatus, "폐쇄 테스트 운영 요구"));

const report = `# WeatherON Android Release Evidence Index

> 생성일: ${kstDate()}
> 목적: Android 출시 준비의 빌드, 검증, 문서 증빙 위치를 한 곳에서 추적한다.

## 1. 현재 증빙 요약

| 항목 | 값 |
|---|---|
| 앱 이름 | ${appName} |
| Android package | \`${androidPackage}\` |
| Android versionCode | \`${versionCode}\` |
| 정적 체크 통과 | ${staticChecks} |
| preview build | \`${previewBuildId}\` / ${previewBuildState} |
| production build | \`${productionBuildId}\` / ${productionBuildState} |
| artifact 접근 issue | ${artifactIssueCount} |
| Play 제출 blocker | ${storeBlockerCount} |
| 실기기 QA 미검증 | ${qaPending} |
| 스토어 스크린샷 issue | ${screenshotIssues} |
| 스토어 스크린샷 준비 | ${screenshotReady} |
| Play 입력값 누락 | ${storeInputMissing} |
| 스토어 입력값 적용 | ${storeInputsApplied} |
| 스토어 입력값 issue | ${storeInputsIssues} |
| 스토어 입력값 누락 필드 | ${storeInputsMissingFields} |
| 스토어 입력값 placeholder | ${storeInputsPlaceholders} |
| 스토어 입력값 형식/검증 issue | ${storeInputsValidationIssues} |
| 폐쇄 테스트 대기 항목 | ${closedTestPending} |
| 폐쇄 테스트 입력값 적용 | ${closedTestInputsApplied} |
| 폐쇄 테스트 입력값 issue | ${closedTestInputIssues} |
| 폐쇄 테스트 운영 요구 | ${closedTestOperationRequired} |

## 2. 빌드 Artifact

| 대상 | Build ID | 상태 | Artifact |
|---|---|---|---|
| Preview APK | \`${previewBuildId}\` | ${previewBuildState} | ${previewArtifact} |
| Production AAB | \`${productionBuildId}\` | ${productionBuildState} | ${productionArtifact} |

## 3. 검증 명령 증빙

| 명령 | 목적 | 최근 상태 문서 |
|---|---|---|
| \`npm run check:android-local-release-ready\` | 로컬 출시 준비 통합 게이트 | \`WeatherON_ANDROID_RELEASE_READINESS_REPORT.md\` |
| \`npm run check:android-release\` | Expo/EAS/스토어 문서 기준 검증 | \`WeatherON_ANDROID_RELEASE_READINESS_REPORT.md\` |
| \`npm run check:android-build-ready\` | Android build readiness 검증 | \`WeatherON_ANDROID_RELEASE_READINESS_REPORT.md\` |
| \`npm run check:android-product-quality\` | 제품 완성도 정적 검증 | \`WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md\` |
| \`npm run check:android-core-flow\` | 홈 판단 CTA와 목적지/알림 설정 실제 클릭 흐름 검증 | \`WeatherON_ANDROID_WEB_EXPORT_QA.md\` |
| \`npm run check:android-web-preview-server\` | 8094 미리보기 서버 산출물 검증 | \`WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md\` |
| \`npm run check:android-device-qa-ready\` | 실기기 QA 대상 APK/문서 검증 | \`WeatherON_ANDROID_DEVICE_QA_PACKET.md\` |
| \`npm run check:android-artifact-access\` | APK/AAB URL 접근성 검증 | \`WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md\` |
| \`npm run check:android-store-submit-ready\` | Play 제출 blocker 검증 | \`WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md\` |

## 4. 문서 증빙 인덱스

| 문서 | 증빙 내용 |
|---|---|
| \`WeatherON_ANDROID_RELEASE_ACTION_BOARD.md\` | 전체 상태판과 다음 액션 |
| \`WeatherON_ANDROID_RELEASE_READINESS_REPORT.md\` | 정적 준비 체크와 최근 검증 명령 |
| \`WeatherON_ANDROID_BUILD_STATUS.md\` | preview APK build 상태 |
| \`WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md\` | production AAB build 상태 |
| \`WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md\` | APK/AAB artifact URL 접근성 |
| \`WeatherON_ANDROID_MANUAL_ACTION_PACKET.md\` | 남은 수동 액션 통합 표 |
| \`WeatherON_ANDROID_DEVICE_QA_PACKET.md\` | 실기기 QA 기입표 |
| \`WeatherON_ANDROID_WEB_EXPORT_STATUS.md\` | mobile web export 번들/하단 탭/목업 혼입 점검 |
| \`WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md\` | 8094 미리보기 서버가 최신 dist를 서빙하는지 점검 |
| \`WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md\` | 스토어 스크린샷 캡처표 |
| \`WeatherON_ANDROID_STORE_INPUTS_PACKET.md\` | Play 제출 입력값 회신표 |
| \`WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md\` | Play 제출/개인정보 입력값 적용 상태 |
| \`WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md\` | 폐쇄 테스트 계정/테스터/운영 입력값 적용 상태 |
| \`WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md\` | 개인정보처리방침 placeholder/URL 준비 |
| \`WeatherON_ANDROID_CLOSED_TEST_PACKET.md\` | 폐쇄 테스트 계정/테스터/운영 기록 |
| \`WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md\` | AAB 업로드 대상과 출시 노트 초안 |

## 5. 완료된 자동화 범위

- preview APK build 완료 및 artifact URL 확보
- production AAB build 완료 및 artifact URL 확보
- APK/AAB URL HTTP 200 접근 확인
- store asset 후보 생성
- Android release config 정적 검증
- 제품 품질 정적 검증
- 수동 액션 패킷 생성 자동화

## 6. 미완료 수동 범위

- 실기기 QA 결과는 \`WeatherON_ANDROID_DEVICE_QA_SESSION.md\`와 최신 audit report에 기록됨. C4 저장 완료 CTA 하단 여백은 보정 후 해결 확인
- Google Play 스크린샷 5장 캡처
- Play 제출/개인정보처리방침 실제 입력값 확정
- 개인정보처리방침 공개 HTTPS URL 배포
- Play Console 계정 유형과 폐쇄 테스트 운영값 확정

## 7. 다음 명령

\`\`\`bash
npm run check:android-local-release-ready
npm run check:android-artifact-access
npm run report:android-manual-action-packet
\`\`\`
`;

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android release evidence index generated: ${reportPath}`);

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
