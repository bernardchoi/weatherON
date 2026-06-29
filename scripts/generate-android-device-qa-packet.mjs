import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const actionBoardPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md");
const qaSessionPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_PACKET.md");

const buildStatus = readFileSync(buildStatusPath, "utf8");
const actionBoard = readFileSync(actionBoardPath, "utf8");
const qaSession = readFileSync(qaSessionPath, "utf8");

const buildId = normalizeTableValue(tableValue(buildStatus, "EAS build id"));
const buildState = normalizeTableValue(tableValue(buildStatus, "Build 상태"));
const version = normalizeTableValue(tableValue(buildStatus, "Version"));
const buildUrl = normalizeTableValue(tableValue(buildStatus, "Build 링크"));
const artifactUrl = normalizeTableValue(tableValue(buildStatus, "APK artifact"));
const adbState = normalizeTableValue(tableValue(actionBoard, "ADB 연결")) || "미확인";
const installState = normalizeTableValue(tableValue(actionBoard, "APK 설치")) || "미확인";
const unverifiedCount = normalizeTableValue(tableValue(actionBoard, "실기기 QA 미검증")) || "미확인";
const screenshotIssues = normalizeTableValue(tableValue(actionBoard, "스토어 스크린샷 issue")) || "미확인";

const qaRows = extractQaRows(qaSession);

const report = `# WeatherON Android Device QA Packet

> 생성일: ${kstDate()}
> 목적: 최신 Android preview APK를 실기기에 직접 설치하고 D1~D12 QA를 바로 수행할 수 있게 한 장으로 정리한다.

## 1. 설치 대상

| 항목 | 값 |
|---|---|
| EAS build id | \`${buildId}\` |
| Build 상태 | ${buildState} |
| Version | \`${version}\` |
| Build 링크 | ${buildUrl} |
| APK artifact | ${artifactUrl} |
| ADB 연결 | ${adbState} |
| ADB 설치 상태 | ${installState} |
| 실기기 QA 미검증 | ${unverifiedCount} |
| 스토어 스크린샷 issue | ${screenshotIssues} |

## 2. 실기기 직접 설치

1. Android 기기에서 APK artifact 링크를 연다.
2. 다운로드 후 설치한다.
3. Play Protect 또는 알 수 없는 앱 설치 경고가 나오면 WeatherON preview APK인지 확인하고 계속 설치한다.
4. 설치 후 앱을 실행한다.
5. 아래 D1~D12 결과를 기록한다.

ADB가 연결되면 아래 명령으로 설치/상태 확인을 자동화할 수 있다.

\`\`\`bash
npm run check:android-adb-ready
npm run sync:android-device-qa-env
npm run install:android-preview-apk
\`\`\`

주의:
- \`sync:android-device-qa-env\`는 ADB로 확인 가능한 \`device\`, \`androidVersion\`, \`screenSize\` 등 비어 있는 QA 환경값만 채운다.
- \`network\`, \`installMethod\`, \`testedAt\`은 실기기 확인 후 local JSON에 직접 기록한다.

## 3. 필수 QA 결과 기입표

| ID | 항목 | 기대 결과 | 결과 | 메모 |
|---|---|---|---|---|
${qaRows.join("\n")}

## 4. 결과 반영 방법

실기기 QA가 끝나면 \`docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json\`에 결과를 채운 뒤 실행한다.
\`easBuildId\`는 \`${buildId}\`, \`appVersion\`은 \`${version}\`과 일치해야 한다.

\`\`\`bash
npm run sync:android-device-qa-env
npm run apply:android-device-qa-results
npm run report:android-release-action-board
\`\`\`

새 템플릿이 필요할 때만 \`npm run prepare:android-release-local-files -- --force\`를 사용한다. \`--force\`는 기존 local QA 결과를 덮어쓴다.

## 5. 다음 단계

1. D1~D6 모두 통과 시 스토어 스크린샷 5장 캡처
2. D7~D12 실패/보류 항목은 같은 build id로 원인 기록
3. 스크린샷 완료 후 \`npm run check:android-store-screenshots-ready\`
4. Play Console 입력값 확정 후 \`npm run apply:android-store-inputs\`
`;

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android device QA packet generated: ${reportPath}`);

function extractQaRows(markdown) {
  const lines = markdown.split("\n");
  const rows = lines.filter((line) => /^\| D\d/.test(line.trim()));
  if (rows.length === 0) {
    return ["| D1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 미검증 |  |"];
  }
  return rows.map((line) => {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    const result = cells[3] && cells[3] !== "미검증" ? cells[3] : "미검증";
    const memo = cells[4] ?? "";
    return `| ${cells[0]} | ${cells[1]} | ${cells[2]} | ${result} | ${memo} |`;
  });
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
