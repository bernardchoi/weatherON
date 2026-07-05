import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const feedbackDir = join(rootDir, "docs/architecture/mvp1-feedback");
const reportPath = join(rootDir, "docs/architecture/WeatherON_MVP1_PILOT_STATUS.md");

const passCriteria = {
  minTesters: 10,
  minQ6Average: 3.5,
  minPunctualityRate: 90,
  maxNotificationChurn: 0,
};

const feedbackFiles = await listFeedbackFiles();
const sessions = feedbackFiles.map((fileName) => parseFeedbackFile(fileName, readFileSync(join(feedbackDir, fileName), "utf8")));
const testerIds = new Set(sessions.map((session) => session.testerId).filter(Boolean));
const testerCount = testerIds.size || sessions.length;
const qAverages = averageScores(sessions);
const notificationSummary = summarizeNotifications(sessions);
const notificationChurnCount = sessions.filter((session) => session.notificationChurnRisk).length;
const blockers = [];

if (testerCount < passCriteria.minTesters) blockers.push(`테스터 ${passCriteria.minTesters}명 이상 필요`);
if (qAverages.Q6 === null || qAverages.Q6 < passCriteria.minQ6Average) blockers.push("Q6 재방문 의사 평균 3.5 이상 필요");
if (notificationSummary.total === 0 || notificationSummary.punctualityRate < passCriteria.minPunctualityRate) blockers.push("알림 정시율 90% 이상 필요");
if (notificationChurnCount > passCriteria.maxNotificationChurn) blockers.push("알림 실패로 인한 이탈 응답 0건 필요");

const status = blockers.length === 0 ? "통과" : sessions.length === 0 ? "데이터 없음" : "미달";
const report = `# WeatherON MVP1 Pilot Status

> 생성일: ${kstDate()}
> 목적: MVP1 소수 사용자 검증 피드백을 집계해 완료 여부를 판정한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| MVP1 판정 | ${status} |
| 피드백 파일 수 | ${sessions.length} |
| 고유 테스터 수 | ${testerCount} |
| 알림 로그 수 | ${notificationSummary.total} |
| 알림 정시 건수 | ${notificationSummary.onTime} |
| 알림 실패 건수 | ${notificationSummary.failed} |
| 알림 정시율 | ${formatPercent(notificationSummary.punctualityRate)} |
| 알림 실패 이탈 응답 | ${notificationChurnCount} |
| Q6 재방문 의사 평균 | ${formatScore(qAverages.Q6)} |

## 2. MVP1 통과 기준

| 기준 | 현재 | 판정 |
|---|---:|---|
| 테스터 ${passCriteria.minTesters}명 이상 | ${testerCount} | ${testerCount >= passCriteria.minTesters ? "통과" : "미달"} |
| Q6 평균 ${passCriteria.minQ6Average} 이상 | ${formatScore(qAverages.Q6)} | ${qAverages.Q6 !== null && qAverages.Q6 >= passCriteria.minQ6Average ? "통과" : "미달"} |
| 알림 정시율 ${passCriteria.minPunctualityRate}% 이상 | ${formatPercent(notificationSummary.punctualityRate)} | ${notificationSummary.total > 0 && notificationSummary.punctualityRate >= passCriteria.minPunctualityRate ? "통과" : "미달"} |
| 알림 실패 이탈 응답 0건 | ${notificationChurnCount} | ${notificationChurnCount === 0 ? "통과" : "미달"} |

## 3. 설문 평균

| 항목 | 평균 | 응답 수 |
|---|---:|---:|
${["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"].map((key) => `| ${key} | ${formatScore(qAverages[key])} | ${scoreCount(sessions, key)} |`).join("\n")}

## 4. 알림 정시성

| 판정 | 건수 |
|---|---:|
| 정시 | ${notificationSummary.onTime} |
| 지연 | ${notificationSummary.delayed} |
| 실패 | ${notificationSummary.failed} |
| 판정 제외 | ${notificationSummary.unknown} |

## 5. Blockers

${blockers.length === 0 ? "- 없음" : blockers.map((item) => `- ${item}`).join("\n")}

## 6. 입력 파일

${feedbackFiles.length === 0 ? "- 없음. `docs/architecture/mvp1-feedback/`에 `WeatherON_MVP1_피드백_T001_YYYYMMDD.md` 형식으로 추가 필요." : feedbackFiles.map((fileName) => `- \`${fileName}\``).join("\n")}

## 7. 운영 방법

1. \`docs/planning/WeatherON_MVP1_테스트_피드백_기록_양식.md\`을 복사해 테스터별 피드백 파일을 만든다.
2. 파일은 \`docs/architecture/mvp1-feedback/\`에 저장한다.
3. \`npm run report:mvp1-pilot-status\`로 MVP1 판정 문서를 갱신한다.
4. 판정이 \`통과\`가 될 때 MVP1 완료로 기록한다.

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| ${kstDate()} | MVP1 pilot status 자동 집계 생성 |
`;

await mkdir(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, report, "utf8");
console.log(`mvp1 pilot status generated: ${reportPath}`);

async function listFeedbackFiles() {
  if (!existsSync(feedbackDir)) return [];
  const names = await readdir(feedbackDir);
  return names
    .filter((name) => /^WeatherON_MVP1_피드백_.+\.md$/.test(name))
    .filter((name) => !name.endsWith(".example.md"))
    .sort();
}

function parseFeedbackFile(fileName, text) {
  return {
    fileName,
    testerId: tableValue(text, "테스터 ID") || testerIdFromFile(fileName),
    scores: parseScores(text),
    notifications: parseNotificationRows(text),
    notificationChurnRisk: hasNotificationChurnRisk(text),
  };
}

function parseScores(text) {
  const scores = {};
  for (const key of ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]) {
    const match = text.match(new RegExp(`\\|\\s*${key}\\s*\\|[^|]*\\|\\s*([0-5](?:\\.\\d+)?)\\s*(?:/\\s*5)?\\s*\\|`));
    if (match) scores[key] = Number(match[1]);
  }
  return scores;
}

function parseNotificationRows(text) {
  const section = sectionText(text, "## 3.", "## 4.");
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 7)
    .filter((cells) => !["알림 종류", "---"].includes(cells[0]))
    .filter((cells) => cells.some((cell) => cell && cell !== "---"))
    .filter((cells) => !isPlaceholderNotificationRow(cells))
    .map((cells) => classifyNotificationRow(cells));
}

function isPlaceholderNotificationRow(cells) {
  const [type, scheduledAt, actualReceivedAt, delayMinutes, opened, targetScreen, note] = cells;
  return (
    type.includes(" / ") &&
    !scheduledAt &&
    !actualReceivedAt &&
    !delayMinutes &&
    opened === "열람/미열람" &&
    targetScreen.includes("/") &&
    !note
  );
}

function classifyNotificationRow(cells) {
  const [, , actualReceivedAt, delayMinutes, , , note] = cells;
  const joined = cells.join(" ");
  if (/실패|미수신|수신 안|오지 않/.test(joined)) return "failed";
  if (!actualReceivedAt && !delayMinutes && !note) return "unknown";

  const delay = Number(String(delayMinutes).replace(/분/g, "").trim());
  if (Number.isFinite(delay)) {
    if (Math.abs(delay) <= 3) return "onTime";
    if (delay > 15) return "failed";
    return "delayed";
  }
  if (/정시/.test(joined)) return "onTime";
  if (/지연/.test(joined)) return "delayed";
  return "unknown";
}

function hasNotificationChurnRisk(text) {
  const action = tableValue(text, "알림이 제때 오지 않았을 때 한 행동");
  if (action.includes(" / ")) return false;
  return /알림 끔|삭제 고려|삭제|이탈/.test(action);
}

function averageScores(items) {
  const result = {};
  for (const key of ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"]) {
    const values = items.map((item) => item.scores[key]).filter((value) => Number.isFinite(value));
    result[key] = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }
  return result;
}

function summarizeNotifications(items) {
  const counts = { total: 0, onTime: 0, delayed: 0, failed: 0, unknown: 0, punctualityRate: null };
  for (const item of items) {
    for (const status of item.notifications) {
      counts.total += 1;
      counts[status] += 1;
    }
  }
  const denominator = counts.total - counts.unknown;
  counts.punctualityRate = denominator > 0 ? (counts.onTime / denominator) * 100 : null;
  return counts;
}

function scoreCount(items, key) {
  return items.filter((item) => Number.isFinite(item.scores[key])).length;
}

function tableValue(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return match?.[1]?.trim() ?? "";
}

function sectionText(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return "";
  const end = text.indexOf(endMarker, start + startMarker.length);
  return text.slice(start, end === -1 ? undefined : end);
}

function testerIdFromFile(fileName) {
  return fileName.match(/_피드백_(.+?)_\d{8}\.md$/)?.[1] ?? "";
}

function formatScore(value) {
  return value === null ? "미확인" : value.toFixed(2);
}

function formatPercent(value) {
  return value === null ? "미확인" : `${value.toFixed(1)}%`;
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
