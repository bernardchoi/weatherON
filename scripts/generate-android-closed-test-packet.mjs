import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_STATUS.md");
const playUploadPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_PACKET.md");

const status = readFileSync(statusPath, "utf8");
const playUploadPacket = readFileSync(playUploadPacketPath, "utf8");

const issueCount = normalizeTableValue(tableValue(status, "issue 수")) || "미확인";
const accountType = normalizeTableValue(tableValue(status, "Play Console 계정 유형")) || "미확인";
const closedTestRequired = normalizeTableValue(tableValue(status, "폐쇄 테스트 필요 여부")) || "미확정";
const operationRequired = normalizeTableValue(tableValue(status, "폐쇄 테스트 운영 요구")) || "미확정";
const testerGroup = normalizeTableValue(tableValue(status, "테스터 그룹")) || "미확인";
const invitedCount = normalizeTableValue(tableValue(status, "테스터 초대")) || "0/12";
const optedInCount = normalizeTableValue(tableValue(status, "테스터 opt-in")) || "0/12";
const activeDays = normalizeTableValue(tableValue(status, "14일 운영 기록")) || "0/14";
const aabArtifact = normalizeTableValue(tableValue(playUploadPacket, "AAB artifact"));
const buildId = normalizeTableValue(tableValue(playUploadPacket, "EAS build id"));

const report = `# WeatherON Android Closed Test Packet

> 생성일: ${kstDate()}
> 목적: Google Play 폐쇄 테스트가 필요한 경우 계정 유형 확인부터 14일 운영 기록까지 한 장으로 진행한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| issue 수 | ${issueCount} |
| Play Console 계정 유형 | ${accountType} |
| 폐쇄 테스트 필요 여부 | ${closedTestRequired} |
| 폐쇄 테스트 운영 요구 | ${operationRequired} |
| 테스터 그룹 | ${testerGroup} |
| 테스터 초대 | ${invitedCount} |
| 테스터 opt-in | ${optedInCount} |
| 14일 운영 기록 | ${activeDays} |
| production build | \`${buildId}\` |
| AAB artifact | ${aabArtifact} |

## 2. 먼저 확정할 값

| 항목 | 회신값 |
|---|---|
| Play Console 계정 유형 | 개인 신규 / 개인 기존 / 조직 |
| 신규 개인 개발자 계정 여부 | 예 / 아니오 |
| 폐쇄 테스트 필요 여부 | 필요 / 불필요 / 권장 운영 |
| 테스터 그룹명 |  |
| 테스트 시작일 |  |
| 테스트 종료일 |  |
| opt-in 링크 |  |

## 3. 진행 순서

1. Play Console 계정 유형 확인
2. 신규 개인 계정이면 폐쇄 테스트 필요로 표시
3. 폐쇄 테스트 불필요로 확정되면 테스터/14일 운영 기록은 생략하고 Play 제출 blocker만 해소
4. 폐쇄 테스트가 필요하면 AAB artifact를 폐쇄 테스트 트랙에 업로드
5. 테스터 12명 이상 초대
6. 테스터 12명 이상 opt-in 확인
7. Day 1~14 운영 기록 작성
8. 주요 이슈와 해결 상태 기록

## 4. 운영 기록 최소 항목

폐쇄 테스트 운영 요구가 \`불필요\`이면 이 표는 작성하지 않는다.

| Day | 날짜 | 활성 테스터 | 배포 버전 | 주요 플로우 | 이슈 수 | 메모 |
|---|---|---|---|---|---|---|
| 1 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 2 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 3 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 4 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 5 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 6 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 7 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 8 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 9 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 10 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 11 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 12 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 13 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |
| 14 |  |  | 0.1.0 (2) | 홈/코디/출발/MY/소셜 |  |  |

## 5. 확인 명령

\`\`\`bash
npm run apply:android-closed-test-inputs
npm run check:android-closed-test-ready
WEATHERON_CLOSED_TEST_REPORT_ONLY=1 npm run check:android-closed-test-ready
npm run report:android-release-action-board
\`\`\`
`;

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");

console.log(`android closed test packet generated: ${reportPath}`);

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
