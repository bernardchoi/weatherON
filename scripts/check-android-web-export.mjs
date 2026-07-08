import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const rootDir = process.cwd();
const distDir = join(rootDir, "apps/mobile/dist");
const legacyDistWebDir = join(rootDir, "apps/mobile/dist-web");
const indexPath = join(distDir, "index.html");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_WEB_EXPORT_STATUS.md");
const reportOnly = process.env.WEATHERON_WEB_EXPORT_REPORT_ONLY === "1";

const issues = [];
const warnings = [];

let scriptSources = [];
let referencedFiles = [];
let referencedBundleText = "";
let allJsFiles = [];
let auxiliaryJsFiles = [];
let legacyDistWebRisk = "없음";

if (!existsSync(distDir)) {
  issues.push("apps/mobile/dist missing: run Expo web export before web preview QA");
} else if (!existsSync(indexPath)) {
  issues.push("apps/mobile/dist/index.html missing");
} else {
  const html = readFileSync(indexPath, "utf8");
  scriptSources = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)].map((match) => match[1]);
  allJsFiles = listFiles(distDir).filter((file) => file.endsWith(".js"));

  if (scriptSources.length === 0) {
    issues.push("index.html has no referenced JavaScript bundle");
  }

  referencedFiles = scriptSources.map((source) => join(distDir, source.replace(/^\//, "")));
  for (const file of referencedFiles) {
    if (!existsSync(file)) {
      issues.push(`referenced bundle missing: ${relative(file)}`);
      continue;
    }
    referencedBundleText += `\n${readFileSync(file, "utf8")}`;
  }

  const referencedSet = new Set(referencedFiles.map((file) => normalize(file)));
  auxiliaryJsFiles = allJsFiles.filter((file) => !referencedSet.has(normalize(file)));
  const riskyAuxiliaryJsFiles = auxiliaryJsFiles.filter((file) => {
    const text = readFileSync(file, "utf8");
    return ["preview-shell", "mockup screens", "목업"].some((marker) => text.includes(marker));
  });
  if (riskyAuxiliaryJsFiles.length > 0) {
    warnings.push(`unreferenced JS bundle contains mockup markers: ${riskyAuxiliaryJsFiles.map(relative).join(", ")}`);
  }

  assertIncludesAny("mobile AppNavigator", ["AppNavigator"]);
  assertIncludesAny("mobile BottomNav", ["BottomNav"]);
  assertIncludesAny("bottomNavRoutes", ["bottomNavRoutes"]);
  assertIncludesAny("bottom nav home label", ['label:"홈"', 'label:"\\ud648"']);
  assertIncludesAny("bottom nav outfit label", ['label:"코디"', 'label:"\\ucf54\\ub514"']);
  assertIncludesAny("bottom nav departure label", ['label:"출발"', 'label:"\\ucd9c\\ubc1c"']);
  assertIncludesAny("bottom nav MY label", ['label:"MY"']);
  assertExcludes("mockup preview shell", ["preview-shell", "mockup screens", "WeatherON · S3", "WeatherON · S2", "목업"]);
}

if (existsSync(legacyDistWebDir)) {
  const legacyJsFiles = listFiles(legacyDistWebDir).filter((file) => file.endsWith(".js"));
  const riskyLegacyFiles = legacyJsFiles.filter((file) => {
    const text = readFileSync(file, "utf8");
    return [
      'label:"우산"',
      'label:"\\uc6b0\\uc0b0"',
      'label:"강수"',
      'label:"\\uac15\\uc218"',
      'id:"H4"',
      'id:"H5"',
    ].some((marker) => text.includes(marker));
  });
  if (riskyLegacyFiles.length > 0) {
    legacyDistWebRisk = riskyLegacyFiles.map(relative).join("<br>");
    warnings.push(`legacy dist-web contains stale bottom nav markers: ${riskyLegacyFiles.map(relative).join(", ")}`);
  }
}

writeReport();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android web export status generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android web export check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android web export check passed${warnings.length > 0 ? ` with ${warnings.length} warnings` : ""}`);

function assertIncludesAny(label, snippets) {
  if (issues.length > 0 && referencedBundleText.length === 0) return;
  if (!snippets.some((snippet) => referencedBundleText.includes(snippet))) {
    issues.push(`referenced mobile web bundle must include ${label}`);
  }
}

function assertExcludes(label, snippets) {
  for (const snippet of snippets) {
    if (referencedBundleText.includes(snippet)) {
      issues.push(`referenced mobile web bundle must not include ${label}: ${snippet}`);
    }
  }
}

function listFiles(path) {
  const files = [];
  for (const entry of readdirSync(path)) {
    const child = join(path, entry);
    if (statSync(child).isDirectory()) files.push(...listFiles(child));
    else files.push(child);
  }
  return files;
}

function writeReport() {
  const report = `# WeatherON Android Web Export Status

> 생성일: ${kstDate()}
> 목적: 8094 보조 미리보기가 목업 preview가 아니라 실제 mobile web export인지 점검한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 상태 | ${issues.length === 0 ? "정상" : "확인 필요"} |
| issue 수 | ${issues.length} |
| warning 수 | ${warnings.length} |
| index.html | ${existsSync(indexPath) ? relative(indexPath) : "없음"} |
| 참조 JS 번들 | ${referencedFiles.length > 0 ? referencedFiles.map(relative).join("<br>") : "없음"} |
| 보조 JS 번들 | ${auxiliaryJsFiles.length > 0 ? auxiliaryJsFiles.map(relative).join("<br>") : "없음"} |
| 전체 JS 번들 | ${allJsFiles.length} |
| legacy dist-web stale marker | ${legacyDistWebRisk} |

## 2. 판정 기준

| 항목 | 기준 |
|---|---|
| 앱 엔트리 | 참조 JS에 \`AppNavigator\`, \`BottomNav\`, \`bottomNavRoutes\` 포함 |
| 하단 탭 | 참조 JS에 \`홈/코디/출발/MY\` 라벨 포함. 최초 출시에서는 소셜 등 확장 레이어 미공개 |
| 목업 혼입 | 참조 JS에 \`preview-shell\`, \`mockup screens\`, \`목업\` 없음 |
| 보조 JS | index.html이 참조하지 않으면 실제 렌더에는 영향 없음. 목업 마커가 들어 있을 때만 warning으로 기록 |
| legacy dist-web | \`apps/mobile/dist-web\`는 이전 산출물이다. 존재하더라도 \`apps/mobile/dist\`를 기준으로 서빙한다 |

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. Warnings

${warnings.length === 0 ? "- 없음" : warnings.map((warning) => `- ${warning}`).join("\n")}

## 5. 확인 명령

\`\`\`bash
npm run export:android-web
npm run check:android-web-export
WEATHERON_WEB_EXPORT_REPORT_ONLY=1 npm run check:android-web-export
\`\`\`
`;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
}

function relative(path) {
  return path.startsWith(rootDir) ? path.slice(rootDir.length + 1) : path;
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
