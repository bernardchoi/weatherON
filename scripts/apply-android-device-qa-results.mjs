import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const inputPath = process.argv[2] || process.env.WEATHERON_DEVICE_QA_RESULTS_FILE || join(
  rootDir,
  "docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json",
);
const examplePath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.example.json");
const sessionPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md");
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_APPLY_STATUS.md");
const reportOnly = process.env.WEATHERON_DEVICE_QA_REPORT_ONLY === "1";

const requiredResultIds = ["D1", "D2", "D3", "D4", "D4-1", "D4-2", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12"];
const allowedResults = new Set(["통과", "실패", "보류", "미검증"]);

const issues = [];
let applied = false;
let inputs = {};
const buildStatus = existsSync(buildStatusPath) ? readFileSync(buildStatusPath, "utf8") : "";
const expectedBuildId = tableValue(buildStatus, "EAS build id");
const expectedAppVersion = tableValue(buildStatus, "Version");

if (!existsSync(inputPath)) {
  issues.push(`input file missing: ${inputPath}`);
} else {
  inputs = readInputs(inputPath);
  validateInputs(inputs);
  if (issues.length === 0 && !reportOnly) {
    applyResults(inputs);
    applied = true;
  }
}

writeStatus();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android device QA apply status generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android device QA apply failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android device QA results applied: ${inputPath}`);

function readInputs(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    issues.push(`input JSON parse failed: ${error.message}`);
    return {};
  }
}

function validateInputs(values) {
  for (const field of ["easBuildId", "appVersion", "device", "androidVersion", "screenSize", "network", "installMethod", "testedAt"]) {
    if (typeof values[field] !== "string" || values[field].trim() === "") {
      issues.push(`missing input field: ${field}`);
    }
  }
  if (values.easBuildId && expectedBuildId && values.easBuildId !== expectedBuildId) {
    issues.push(`build id mismatch: expected ${expectedBuildId}, got ${values.easBuildId}`);
  }
  if (values.appVersion && expectedAppVersion && values.appVersion !== expectedAppVersion) {
    issues.push(`app version mismatch: expected ${expectedAppVersion}, got ${values.appVersion}`);
  }
  if (!values.results || typeof values.results !== "object" || Array.isArray(values.results)) {
    issues.push("missing input field: results");
    return;
  }
  for (const id of requiredResultIds) {
    const item = values.results[id];
    if (!item || typeof item !== "object") {
      issues.push(`missing QA result: ${id}`);
      continue;
    }
    if (!allowedResults.has(item.result)) {
      issues.push(`invalid QA result for ${id}: ${item.result || "missing"}`);
    }
    if (typeof item.memo !== "string") {
      issues.push(`missing QA memo for ${id}`);
    }
  }
}

function applyResults(values) {
  let session = readFileSync(sessionPath, "utf8");
  session = updateMarkdownTableRow(session, "테스트 기기", values.device);
  session = updateMarkdownTableRow(session, "Android 버전", values.androidVersion);
  session = updateMarkdownTableRow(session, "화면 크기", values.screenSize);
  session = updateMarkdownTableRow(session, "네트워크", values.network);
  session = updateMarkdownTableRow(session, "설치 방식", values.installMethod);
  session = updateMarkdownTableRow(session, "테스트 일시", values.testedAt);

  for (const id of requiredResultIds) {
    session = updateQaResultRow(session, id, values.results[id].result, values.results[id].memo);
  }

  session = appendChangeHistory(session, "실기기 QA 결과 JSON 반영");
  writeFileSync(sessionPath, session, "utf8");
}

function updateMarkdownTableRow(text, label, value) {
  const escaped = escapeRegExp(label);
  return text.replace(new RegExp(`\\| ${escaped} \\| [^|]* \\|`, "g"), `| ${label} | ${value} |`);
}

function updateQaResultRow(text, id, result, memo) {
  const escaped = escapeRegExp(id);
  return text.replace(
    new RegExp(`\\| ${escaped} \\| ([^|]+) \\| ([^|]+) \\| [^|]+ \\| [^|]* \\|`, "g"),
    `| ${id} | $1 | $2 | ${result} | ${memo} |`,
  );
}

function appendChangeHistory(text, message) {
  const row = `| ${kstDate()} | ${message} |`;
  if (text.includes(row)) return text;
  return text.replace(/\n$/, `${row}\n`);
}

function writeStatus() {
  const resultCounts = requiredResultIds.reduce((counts, id) => {
    const result = inputs.results?.[id]?.result || "미기록";
    counts[result] = (counts[result] || 0) + 1;
    return counts;
  }, {});

  const report = `# WeatherON Android Device QA Apply Status

> 생성일: ${kstDate()}
> 목적: 실기기 QA 결과 JSON 적용 상태와 실행 방법을 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 적용 여부 | ${applied ? "적용됨" : "미적용"} |
| 입력 파일 | ${inputPath} |
| 샘플 파일 | ${examplePath} |
| 기대 build id | ${expectedBuildId || "미확인"} |
| 기대 app version | ${expectedAppVersion || "미확인"} |
| issue 수 | ${issues.length} |
| 통과 | ${resultCounts["통과"] || 0} |
| 실패 | ${resultCounts["실패"] || 0} |
| 보류 | ${resultCounts["보류"] || 0} |
| 미검증 | ${resultCounts["미검증"] || 0} |

## 2. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 3. 실행 순서

1. \`npm run prepare:android-release-local-files\` 또는 샘플 복사로 \`WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json\`을 만든다.
2. 실기기에서 D1~D12를 판정하고 결과를 채운다.
3. 아래 명령을 실행한다.

\`\`\`bash
npm run apply:android-device-qa-results
npm run report:android-release-action-board
\`\`\`

주의: \`--force\`는 기존 local QA 결과를 덮어쓰므로 새 템플릿이 필요할 때만 사용한다.
`;

  mkdirSync(dirname(statusPath), { recursive: true });
  writeFileSync(statusPath, report, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tableValue(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return (match?.[1] ?? "").replace(/^`|`$/g, "").trim();
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
