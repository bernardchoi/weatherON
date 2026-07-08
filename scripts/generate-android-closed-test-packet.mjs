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
const sourceVersion = normalizeTableValue(tableValue(playUploadPacket, "소스 기준 버전")) || "0.1.0 (6)";
// 2026-07-08 출시 로드맵: 14일 운영 안에 코디 포함 build로 전환해야 한다.
// 운영 표의 버전은 코디 포함 후속 build를 뜻하는 `+` 표기를 사용한다.
const outfitBuildVersion = sourceVersion.endsWith(")") ? sourceVersion.replace(/\)$/, "+)") : `${sourceVersion}+`;

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
| 14일 내 코디 포함 | 필요 |

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
2. 2023-11-13 이후 생성된 신규 개인 계정이면 폐쇄 테스트 필요로 표시
3. 폐쇄 테스트 불필요로 확정되면 테스터/14일 운영 기록은 생략하고 Play 제출 blocker만 해소
4. 폐쇄 테스트가 필요하면 AAB artifact를 폐쇄 테스트 트랙에 업로드
5. 테스터 12명 이상 초대
6. 테스터 12명 이상 opt-in 확인
7. Day 1~14 운영 중 코디 포함 build로 전환
8. 코디 추천/상세/저장 gate/옷장 프리셋 검증 기록
9. 주요 이슈와 해결 상태 기록

## 4. 운영 기록 최소 항목

폐쇄 테스트 운영 요구가 \`불필요\`이면 이 표는 작성하지 않는다.

| Day | 날짜 | 활성 테스터 | 배포 버전 | 주요 플로우 | 이슈 수 | 메모 |
|---|---|---|---|---|---|---|
| 1 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 목적지 알림 설정 + 코디 추천 |  |  |
| 2 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 상세 |  |  |
| 3 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 저장 gate |  |  |
| 4 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 옷장 프리셋 |  |  |
| 5 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 추천 |  |  |
| 6 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 상세 |  |  |
| 7 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 저장 gate |  |  |
| 8 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 옷장 프리셋 |  |  |
| 9 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 추천 |  |  |
| 10 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 상세 |  |  |
| 11 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 저장 gate |  |  |
| 12 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 옷장 프리셋 |  |  |
| 13 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 추천/상세 회귀 |  |  |
| 14 |  |  | ${outfitBuildVersion} | 홈/출발/MY + 코디 출시 후보 점검 |  |  |

## 5. 공식 기준 확인

- Google Play 신규 개인 개발자 계정은 프로덕션 신청 전 12명 이상 테스터로 14일 이상 폐쇄 테스트가 필요할 수 있다.
- 조직 계정 또는 기존 계정도 품질 검증을 위해 내부/폐쇄 테스트 트랙 운영은 유지한다.
- Play Console 업로드 대상은 source version과 일치하는 production AAB artifact를 사용한다.

## 6. 확인 명령

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
