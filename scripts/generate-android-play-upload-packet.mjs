import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const productionBuildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md");
const actionBoardPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md");
const blockersPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const appJsonPath = join(rootDir, "apps/mobile/app.json");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md");

const productionBuildStatus = readFileSync(productionBuildStatusPath, "utf8");
const actionBoard = readFileSync(actionBoardPath, "utf8");
const blockers = readFileSync(blockersPath, "utf8");
const appConfig = JSON.parse(readFileSync(appJsonPath, "utf8")).expo;

const buildId = normalizeTableValue(tableValue(productionBuildStatus, "EAS build id"));
const buildState = normalizeTableValue(tableValue(productionBuildStatus, "Build 상태"));
const buildVersion = normalizeTableValue(tableValue(productionBuildStatus, "Version"));
const buildUrl = normalizeTableValue(tableValue(productionBuildStatus, "Build 링크"));
const artifactUrl = normalizeTableValue(tableValue(productionBuildStatus, "AAB artifact"));
const blockerCount = normalizeTableValue(tableValue(blockers, "blocker 수")) || "미확인";
const screenshotIssues = normalizeTableValue(tableValue(actionBoard, "스토어 스크린샷 issue")) || "미확인";
const storeInputMissing = normalizeTableValue(tableValue(actionBoard, "local 스토어 입력 누락")) || "미확인";
const qaPending = normalizeTableValue(tableValue(actionBoard, "실기기 QA 미검증")) || "미확인";
const closedTestPending = normalizeTableValue(tableValue(actionBoard, "폐쇄 테스트 대기 항목")) || "미확인";
const sourceVersion = `${appConfig.version} (${appConfig.android?.versionCode})`;
const releaseVersion = sourceVersion;
const sourceMatchesBuild = buildVersion === sourceVersion;
const readyForUpload = buildState === "FINISHED" && /^https:\/\/expo\.dev\/artifacts\/eas\/.+\.aab$/.test(artifactUrl) && sourceMatchesBuild;

const report = `# WeatherON Android Play Upload Packet

> 생성일: ${kstDate()}
> 목적: Play Console 내부/폐쇄 테스트 트랙에 업로드할 production AAB와 업로드 전 확인값을 한 장으로 유지한다.

## 1. AAB 업로드 대상

| 항목 | 값 |
|---|---|
| 앱 이름 | ${appConfig.name} |
| Android package | \`${appConfig.android?.package}\` |
| 앱 버전 | \`${appConfig.version}\` |
| Android versionCode | \`${appConfig.android?.versionCode}\` |
| 소스 기준 버전 | \`${sourceVersion}\` |
| EAS build id | \`${buildId}\` |
| Build 상태 | ${buildState} |
| Build 버전 | \`${buildVersion || "미확인"}\` |
| 소스 일치 | ${sourceMatchesBuild ? "일치" : "불일치"} |
| Build 링크 | ${buildUrl} |
| AAB artifact | ${artifactUrl} |
| 업로드 후보 여부 | ${readyForUpload ? "가능" : "불가"} |

## 2. 업로드 전 남은 확인

| 항목 | 상태 |
|---|---|
| Play 제출 blocker | ${blockerCount} |
| 실기기 QA 미검증 | ${qaPending} |
| 스토어 스크린샷 issue | ${screenshotIssues} |
| Play 입력값 누락 | ${storeInputMissing} |
| 폐쇄 테스트 대기 항목 | ${closedTestPending} |

## 3. Play Console 업로드 순서

1. Play Console에서 WeatherON 앱 선택 또는 신규 앱 생성
2. 테스트 및 출시 > 내부 테스트 또는 폐쇄 테스트 트랙 선택
3. 새 release 생성
4. AAB artifact 업로드
5. release name은 \`${releaseVersion}\` 기준으로 입력
6. 출시 노트 초안 입력
7. 저장 후 제출 전 blocker 문서 확인

## 4. 출시 노트 초안

\`\`\`text
WeatherON 비공개 테스트 v${releaseVersion}
- 홈 화면에서 당겨서 최신 날씨 새로고침
- 내일 날씨 브리핑과 강한 날씨 알림 개선
- 목적지 알림과 출발 시간 계산 안정화
- 코디·옷장 탐색 편의성과 화면 반응 개선
- 화면 전환, 완료 안내, 접근성 설정 보완
\`\`\`

## 5. 확인 명령

\`\`\`bash
npm run check:eas-production-build-status -- ${buildId || "<eas-build-id>"}
npm run check:android-store-submit-ready
npm run report:android-release-action-board
\`\`\`

## 6. 주의

- AAB는 소스 기준 버전과 일치할 때만 Play 테스트 트랙 업로드 후보로 본다.
- 소스 불일치이면 \`npm run build:android:production:no-wait\`로 새 production AAB를 만든 뒤 build id를 갱신한다.
- AAB artifact URL은 Expo 로그인 세션 또는 권한에 따라 접근이 제한될 수 있으므로 업로드 전 다운로드 가능 여부를 한 번 확인한다.
`;

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android play upload packet generated: ${reportPath}`);

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
