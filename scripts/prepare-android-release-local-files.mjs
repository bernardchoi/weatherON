import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { kstDate, tableValue as sharedTableValue } from "./lib/markdownDoc.mjs";

const rootDir = process.cwd();
const force = process.argv.includes("--force") || process.env.WEATHERON_PREPARE_FORCE === "1";
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_LOCAL_INPUT_FILES_STATUS.md");
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");

const files = [
  {
    label: "스토어 입력값",
    examplePath: join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS.example.json"),
    localPath: join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json"),
    applyCommand: "npm run apply:android-store-inputs",
  },
  {
    label: "실기기 QA 결과",
    examplePath: join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.example.json"),
    localPath: join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json"),
    applyCommand: "npm run apply:android-device-qa-results",
  },
  {
    label: "폐쇄 테스트 입력값",
    examplePath: join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS.example.json"),
    localPath: join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json"),
    applyCommand: "npm run apply:android-closed-test-inputs",
  },
];

const rows = [];
const issues = [];
const readiness = {
  storeMissingFields: 0,
  qaMissingEnvironmentFields: 0,
  qaPendingResults: 0,
  qaAutoFilledMetadata: 0,
  closedTestMissingFields: 0,
  closedTestPendingOperationItems: 0,
};

for (const file of files) {
  if (!existsSync(file.examplePath)) {
    issues.push(`example file missing: ${file.examplePath}`);
    rows.push({ ...file, status: "실패", note: "샘플 없음" });
    continue;
  }

  if (existsSync(file.localPath) && !force) {
    rows.push({ ...file, status: "유지", note: localReadinessNote(file) });
    continue;
  }

  mkdirSync(dirname(file.localPath), { recursive: true });
  writeFileSync(file.localPath, `${JSON.stringify(localTemplate(file), null, 2)}\n`, "utf8");
  rows.push({ ...file, status: force ? "재생성" : "생성", note: "빈 템플릿 생성" });
  localReadinessNote(file);
}

function localTemplate(file) {
  const example = JSON.parse(readFileSync(file.examplePath, "utf8"));
  if (file.label === "스토어 입력값") {
    return Object.fromEntries(Object.keys(example).map((key) => [key, ""]));
  }
  if (file.label === "실기기 QA 결과") {
    const buildStatus = existsSync(buildStatusPath) ? readFileSync(buildStatusPath, "utf8") : "";
    return {
      easBuildId: tableValue(buildStatus, "EAS build id"),
      appVersion: tableValue(buildStatus, "Version"),
      device: "",
      androidVersion: "",
      screenSize: "",
      network: "",
      installMethod: "",
      testedAt: "",
      results: Object.fromEntries(
        Object.keys(example.results).map((id) => [id, { result: "미검증", memo: "" }]),
      ),
    };
  }
  if (file.label === "폐쇄 테스트 입력값") {
    return {
      accountType: "",
      isNewPersonalDeveloperAccount: "",
      closedTestRequired: "",
      testerGroupName: "",
      testStartDate: "",
      testEndDate: "",
      playAppCreated: "",
      closedTrackCreated: "",
      optInLinkReady: "",
      privacyPolicyUrlEntered: "",
      testers: Array.from({ length: 12 }, (_, index) => ({
        testerAlias: `T${String(index + 1).padStart(2, "0")}`,
        deviceOs: "",
        invited: "미초대",
        optIn: "미확인",
        memo: "",
      })),
      operationDays: Array.from({ length: 14 }, (_, index) => ({
        day: index + 1,
        date: "",
        activeTesters: "0",
        version: "0.1.0 (6)",
        flow: "홈/출발/MY + 목적지 알림 설정",
        issueCount: "0",
        status: "미시작",
      })),
    };
  }
  return example;
}

writeStatus();

if (issues.length > 0) {
  console.error(`android release local files prepare failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("android release local files prepared");

function writeStatus() {
  const report = `# WeatherON Android Local Input Files Status

> 생성일: ${kstDate()}
> 목적: 출시 준비에 필요한 로컬 입력 JSON 생성 상태를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| issue 수 | ${issues.length} |
| force 재생성 | ${force ? "예" : "아니오"} |
| 스토어 입력 누락 | ${readiness.storeMissingFields} |
| QA 환경값 누락 | ${readiness.qaMissingEnvironmentFields} |
| QA 미검증 항목 | ${readiness.qaPendingResults} |
| QA 자동 보정 메타 | ${readiness.qaAutoFilledMetadata} |
| 폐쇄 테스트 입력 누락 | ${readiness.closedTestMissingFields} |
| 폐쇄 테스트 운영 미충족 | ${readiness.closedTestPendingOperationItems} |

## 2. 파일 상태

| 항목 | 상태 | local 파일 | 다음 명령 | 메모 |
|---|---|---|---|---|
${rows.map((row) => `| ${row.label} | ${row.status} | \`${relative(row.localPath)}\` | \`${row.applyCommand}\` | ${row.note} |`).join("\n")}

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. 실행 명령

\`\`\`bash
npm run prepare:android-release-local-files
npm run prepare:android-release-local-files -- --force
\`\`\`

주의:
- local JSON은 \`.gitignore\` 대상이다.
- \`--force\`는 기존 local JSON을 빈 템플릿으로 덮어쓴다.
`;

  mkdirSync(dirname(statusPath), { recursive: true });
  writeFileSync(statusPath, report, "utf8");
}

function relative(path) {
  return path.startsWith(`${rootDir}/`) ? path.slice(rootDir.length + 1) : path;
}

function localReadinessNote(file) {
  let local;
  try {
    local = JSON.parse(readFileSync(file.localPath, "utf8"));
  } catch (error) {
    issues.push(`local JSON parse failed: ${file.localPath}: ${error.message}`);
    return "local JSON 파싱 실패";
  }

  if (file.label === "스토어 입력값") {
    const missing = Object.entries(local).filter(([, value]) => typeof value !== "string" || value.trim() === "").length;
    readiness.storeMissingFields = missing;
    return missing === 0 ? "입력값 채움" : `${missing}개 입력 필요`;
  }

  if (file.label === "실기기 QA 결과") {
    const before = JSON.stringify(local);
    const buildStatus = existsSync(buildStatusPath) ? readFileSync(buildStatusPath, "utf8") : "";
    const expectedBuildId = tableValue(buildStatus, "EAS build id");
    const expectedAppVersion = tableValue(buildStatus, "Version");
    if ((!local.easBuildId || local.easBuildId.trim() === "") && expectedBuildId) {
      local.easBuildId = expectedBuildId;
      readiness.qaAutoFilledMetadata += 1;
    }
    if ((!local.appVersion || local.appVersion.trim() === "") && expectedAppVersion) {
      local.appVersion = expectedAppVersion;
      readiness.qaAutoFilledMetadata += 1;
    }
    local = normalizeQaLocalInput(local);
    if (JSON.stringify(local) !== before) {
      writeFileSync(file.localPath, `${JSON.stringify(local, null, 2)}\n`, "utf8");
    }
    const envFields = ["easBuildId", "appVersion", "device", "androidVersion", "screenSize", "network", "installMethod", "testedAt"];
    const missingEnv = envFields.filter((field) => typeof local[field] !== "string" || local[field].trim() === "").length;
    const pendingResults = Object.values(local.results || {}).filter((item) => item?.result === "미검증").length;
    readiness.qaMissingEnvironmentFields = missingEnv;
    readiness.qaPendingResults = pendingResults;
    if (missingEnv === 0 && pendingResults === 0) return "QA 결과 채움";
    return `환경 ${missingEnv}개 · 미검증 ${pendingResults}개`;
  }

  if (file.label === "폐쇄 테스트 입력값") {
    const requiredFields = ["accountType", "isNewPersonalDeveloperAccount", "closedTestRequired", "playAppCreated", "privacyPolicyUrlEntered"];
    const missingBase = requiredFields.filter((field) => typeof local[field] !== "string" || local[field].trim() === "").length;
    const needsOperation = local.closedTestRequired !== "불필요";
    const operationFields = needsOperation ? ["testerGroupName", "testStartDate", "testEndDate", "closedTrackCreated", "optInLinkReady"] : [];
    const missingOperationFields = operationFields.filter((field) => typeof local[field] !== "string" || local[field].trim() === "").length;
    const invited = Array.isArray(local.testers) ? local.testers.filter((tester) => tester.invited === "초대").length : 0;
    const optedIn = Array.isArray(local.testers) ? local.testers.filter((tester) => tester.optIn === "완료").length : 0;
    const activeDays = Array.isArray(local.operationDays)
      ? local.operationDays.filter((day) => day.status === "운영" && Number(day.activeTesters) > 0).length
      : 0;
    const pendingOperation = needsOperation ? Math.max(0, 12 - invited) + Math.max(0, 12 - optedIn) + Math.max(0, 14 - activeDays) : 0;
    readiness.closedTestMissingFields = missingBase + missingOperationFields;
    readiness.closedTestPendingOperationItems = pendingOperation;
    if (readiness.closedTestMissingFields === 0 && pendingOperation === 0) return "폐쇄 테스트 입력값 채움";
    return `입력 ${readiness.closedTestMissingFields}개 · 운영 ${pendingOperation}개`;
  }

  return "확인 완료";
}

function normalizeQaLocalInput(local) {
  const example = JSON.parse(readFileSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.example.json"), "utf8"));
  const normalizedResults = { ...(local.results || {}) };
  for (const id of Object.keys(example.results || {})) {
    if (!normalizedResults[id]) {
      normalizedResults[id] = { result: "미검증", memo: "" };
      readiness.qaAutoFilledMetadata += 1;
    }
  }
  return {
    easBuildId: local.easBuildId || "",
    appVersion: local.appVersion || "",
    device: local.device || "",
    androidVersion: local.androidVersion || "",
    screenSize: local.screenSize || "",
    network: local.network || "",
    installMethod: local.installMethod || "",
    testedAt: local.testedAt || "",
    results: normalizedResults,
  };
}

// 이 파일의 tableValue 호출부는 모두 백틱이 제거된 값을 기대하므로, 공용 파서를
// stripBackticks 옵션으로 감싼 동일 이름 함수를 유지해 호출부를 하나도 바꾸지 않는다.
function tableValue(markdown, label) {
  return sharedTableValue(markdown, label, { stripBackticks: true });
}
