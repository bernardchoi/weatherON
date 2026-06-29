import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const actionBoardPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md");
const storeInputsPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_PACKET.md");
const deviceQaPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_PACKET.md");
const screenshotPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md");
const closedTestPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_PACKET.md");
const playUploadPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md");
const blockersPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_MANUAL_ACTION_PACKET.md");

const actionBoard = readFileSync(actionBoardPath, "utf8");
const storeInputsPacket = readFileSync(storeInputsPacketPath, "utf8");
const deviceQaPacket = readFileSync(deviceQaPacketPath, "utf8");
const screenshotPacket = readFileSync(screenshotPacketPath, "utf8");
const closedTestPacket = readFileSync(closedTestPacketPath, "utf8");
const playUploadPacket = readFileSync(playUploadPacketPath, "utf8");
const blockers = readFileSync(blockersPath, "utf8");

const previewBuildId = normalizeTableValue(tableValue(actionBoard, "최신 preview build"));
const productionBuildId = normalizeTableValue(tableValue(actionBoard, "최신 production build"));
const productionStatus = normalizeTableValue(tableValue(actionBoard, "production build 상태"));
const aabArtifact = normalizeTableValue(tableValue(playUploadPacket, "AAB artifact"));
const apkArtifact = normalizeTableValue(tableValue(deviceQaPacket, "APK artifact"));
const blockerCount = normalizeTableValue(tableValue(actionBoard, "Play 제출 blocker"));
const qaPending = normalizeTableValue(tableValue(actionBoard, "실기기 QA 미검증"));
const screenshotIssues = normalizeTableValue(tableValue(actionBoard, "스토어 스크린샷 issue"));
const inputMissing = normalizeTableValue(tableValue(actionBoard, "local 스토어 입력 누락"));
const closedTestPending = normalizeTableValue(tableValue(actionBoard, "폐쇄 테스트 대기 항목"));

const nextActionRows = extractSectionTable(actionBoard, "## 2. 다음 액션", "## 3. 실행 명령");
const storeReplyRows = extractSectionTable(storeInputsPacket, "## 3. 회신 표", "## 4. JSON 입력 템플릿");
const qaRows = extractSectionTable(deviceQaPacket, "## 3. 필수 QA 결과 기입표", "## 4. 결과 반영 방법");
const screenshotRows = extractSectionTable(screenshotPacket, "## 2. 캡처 목록", "## 3. 캡처 순서");
const closedTestRows = extractSectionTable(closedTestPacket, "## 2. 먼저 확정할 값", "## 3. 진행 순서");
const blockerLines = blockers
  .split("\n")
  .filter((line) => line.startsWith("- "))
  .slice(0, 20);

const report = `# WeatherON Android Manual Action Packet

> 생성일: ${kstDate()}
> 목적: 자동 빌드/검증 이후 사람이 직접 처리해야 하는 Android 출시 액션을 한 장으로 유지한다.

## 1. 현재 출시 상태

| 항목 | 값 |
|---|---|
| preview APK build | \`${previewBuildId}\` |
| APK artifact | ${apkArtifact} |
| production AAB build | \`${productionBuildId}\` |
| production AAB 상태 | ${productionStatus} |
| AAB artifact | ${aabArtifact} |
| Play 제출 blocker | ${blockerCount} |
| 실기기 QA 미검증 | ${qaPending} |
| 스토어 스크린샷 issue | ${screenshotIssues} |
| Play 입력값 누락 | ${inputMissing} |
| 폐쇄 테스트 대기 항목 | ${closedTestPending} |

## 2. 작업 순서

${nextActionRows.length ? nextActionRows.join("\n") : "- Action Board 확인 필요"}

## 3. 실기기 QA 기입표

${qaRows.length ? qaRows.join("\n") : "- Device QA Packet 확인 필요"}

## 4. 스토어 스크린샷 캡처표

${screenshotRows.length ? screenshotRows.join("\n") : "- Screenshot Packet 확인 필요"}

## 5. Play 제출 입력값 회신표

${storeReplyRows.length ? storeReplyRows.join("\n") : "- Store Inputs Packet 확인 필요"}

## 6. 폐쇄 테스트 회신표

${closedTestRows.length ? closedTestRows.join("\n") : "- Closed Test Packet 확인 필요"}

## 7. 현재 blocker

${blockerLines.length ? blockerLines.join("\n") : "- 없음"}

## 8. 반영 명령

\`\`\`bash
npm run sync:android-device-qa-env
npm run apply:android-device-qa-results
npm run check:android-store-screenshots-ready
npm run apply:android-store-safe-defaults
npm run apply:android-store-inputs
npm run check:android-closed-test-ready
npm run check:android-store-submit-ready
npm run report:android-release-action-board
npm run check:android-local-release-ready
\`\`\`

## 9. 참조 문서

| 문서 | 목적 |
|---|---|
| \`WeatherON_ANDROID_DEVICE_QA_PACKET.md\` | 실기기 QA |
| \`WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md\` | 스토어 스크린샷 |
| \`WeatherON_ANDROID_STORE_INPUTS_PACKET.md\` | Play/개인정보 입력값 |
| \`WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md\` | 개인정보처리방침 공개 URL |
| \`WeatherON_ANDROID_CLOSED_TEST_PACKET.md\` | 폐쇄 테스트 |
| \`WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md\` | AAB 업로드 |
| \`WeatherON_ANDROID_RELEASE_ACTION_BOARD.md\` | 전체 상태판 |
`;

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android manual action packet generated: ${reportPath}`);

function extractSectionTable(text, startMarker, endMarker) {
  const section = sectionBetween(text, startMarker, endMarker);
  const rows = section
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .filter((line) => !line.includes("---"));
  if (rows.length < 2) return rows;
  return [rows[0], separatorForRow(rows[0]), ...rows.slice(1)];
}

function sectionBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return "";
  const end = text.indexOf(endMarker, start + startMarker.length);
  return end === -1 ? text.slice(start) : text.slice(start, end);
}

function tableValue(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return match?.[1]?.trim() ?? "";
}

function normalizeTableValue(value) {
  return value.replace(/^`|`$/g, "").trim();
}

function separatorForRow(row) {
  const columnCount = row.split("|").slice(1, -1).length;
  return `|${Array.from({ length: columnCount }, () => "---").join("|")}|`;
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
