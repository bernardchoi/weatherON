import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { kstDate, normalizeTableValue, tableValue } from "./lib/markdownDoc.mjs";

const rootDir = process.cwd();
const planPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md");
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md");
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const adbStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_ADB_STATUS.md");
const deviceQaPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_PACKET.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md");

const plan = readFileSync(planPath, "utf8");
const status = readFileSync(statusPath, "utf8");
const buildStatus = readFileSync(buildStatusPath, "utf8");
const adbStatus = readFileSync(adbStatusPath, "utf8");
const deviceQaPacket = readFileSync(deviceQaPacketPath, "utf8");

const issueCount = normalizeTableValue(tableValue(status, "issue 수")) || "미확인";
const screenshotBuildId = normalizeTableValue(tableValue(status, "기준 build id")) || normalizeTableValue(tableValue(plan, "기준 APK"));
const screenshotAppVersion = normalizeTableValue(tableValue(status, "기준 app version")) || normalizeTableValue(tableValue(plan, "앱 버전"));
const savePath = normalizeTableValue(tableValue(status, "저장 위치")) || "`assets/store/android-screenshots/`";
const adbReadyStatus = normalizeTableValue(tableValue(adbStatus, "준비 상태")) || "미확인";
const adbSelectedDevice = normalizeTableValue(tableValue(adbStatus, "선택 기기")) || "미확인";
const adbIssueCount = normalizeTableValue(tableValue(adbStatus, "issue 수")) || "미확인";
const buildId = normalizeTableValue(tableValue(buildStatus, "EAS build id")) || normalizeTableValue(tableValue(deviceQaPacket, "EAS build id"));
const apkArtifact = normalizeTableValue(tableValue(buildStatus, "APK artifact")) || normalizeTableValue(tableValue(deviceQaPacket, "APK artifact"));
const captureRows = extractCaptureRows(plan);

const report = `# WeatherON Android Store Screenshot Packet

> 생성일: ${kstDate()}
> 목적: Google Play 휴대전화 스크린샷 5장을 같은 기준 APK와 파일명으로 캡처하기 위한 작업 패킷이다.

## 1. 캡처 기준

| 항목 | 값 |
|---|---|
| 기준 preview build | \`${buildId}\` |
| screenshot 기준 build | \`${screenshotBuildId}\` |
| screenshot 기준 app version | \`${screenshotAppVersion}\` |
| APK artifact | ${apkArtifact} |
| 저장 위치 | ${savePath} |
| manifest | \`assets/store/android-screenshots/manifest.json\` |
| 현재 screenshot issue | ${issueCount} |
| ADB 준비 상태 | ${adbReadyStatus} |
| ADB 선택 기기 | ${adbSelectedDevice} |
| ADB issue | ${adbIssueCount} |
| 권장 해상도 | 1080x1920 이상 PNG |

## 2. 캡처 목록

| 순서 | 파일명 | 화면 | 앱 내 이동 | 캡처 조건 |
|---|---|---|---|---|
${captureRows.join("\n")}

## 3. 캡처 순서

1. 최신 preview APK 설치 후 D1~D6 QA 통과 확인
2. \`npm run check:android-adb-ready\`로 ADB 준비 상태 확인
3. Android 기기를 세로 방향으로 고정
4. 각 화면으로 직접 이동
5. 아래 명령을 파일명별로 실행
6. \`npm run check:android-store-screenshots-ready\`로 크기와 누락 여부 확인
7. \`assets/store/android-screenshots/manifest.json\`에서 파일별 크기와 sha256 확인
8. manifest의 \`sourceBuildId\`가 screenshot 기준 build와 같은지 확인

## 4. 명령

\`\`\`bash
npm run check:android-adb-ready
npm run capture:android-store-screenshot -- phone-01-home.png
npm run capture:android-store-screenshot -- phone-02-destination-search.png
npm run capture:android-store-screenshot -- phone-03-destination-care.png
npm run capture:android-store-screenshot -- phone-04-notification-center.png
npm run capture:android-store-screenshot -- phone-05-settings-policy.png
npm run check:android-store-screenshots-ready
\`\`\`

## 5. 주의

- 하단 탭은 \`홈/코디/출발/MY\` 기준이어야 하며, 소셜 화면은 스토어 스크린샷에 포함하지 않는다.
- 개발용 route id, 내부 상태값, placeholder 문구가 보이면 캡처하지 않는다.
- Google Play 업로드 전 파일명은 본 문서와 동일하게 유지한다.
- ADB 준비 상태가 \`불가\`이면 먼저 USB 디버깅 또는 에뮬레이터 연결을 복구한다.
- manifest의 \`readyCount\`가 5가 아니면 제출 파일로 보지 않는다.
- manifest의 \`sourceBuildId\`가 기준 preview build와 다르면 제출 파일로 보지 않는다.
`;

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android store screenshot packet generated: ${reportPath}`);

function extractCaptureRows(markdown) {
  const rows = markdown
    .split("\n")
    .filter((line) => /^\|\s*\d+\s*\|/.test(line));
  return rows.length ? rows : ["| 1 | `phone-01-home.png` | H1 홈 | 하단 홈 | 홈 카드 표시 |"];
}

