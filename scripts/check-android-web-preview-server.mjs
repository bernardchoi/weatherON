import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const previewUrl = process.env.WEATHERON_WEB_PREVIEW_URL ?? "http://127.0.0.1:8094/";
const distIndexPath = join(rootDir, "apps/mobile/dist/index.html");
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md");
const reportOnly = process.env.WEATHERON_WEB_PREVIEW_SERVER_REPORT_ONLY === "1";
const optionalServer = process.env.WEATHERON_WEB_PREVIEW_SERVER_OPTIONAL === "1";
const issues = [];
const warnings = [];

let responseStatus = "응답 없음";
let responseUrl = previewUrl;
let servedScriptSources = [];
let distScriptSources = [];
let indexMatchesDist = "미확인";
let bottomNavEvidence = "미확인";

if (!existsSync(distIndexPath)) {
  issues.push("apps/mobile/dist/index.html missing: run npm run export:android-web first");
} else {
  const distHtml = readFileSync(distIndexPath, "utf8");
  distScriptSources = scriptSources(distHtml);

  try {
    const response = await fetchWithTimeout(previewUrl, 5000);
    responseStatus = `${response.status} ${response.statusText}`;
    responseUrl = response.url;
    const servedHtml = await response.text();
    servedScriptSources = scriptSources(servedHtml);

    if (!response.ok) {
      issues.push(`preview server returned ${responseStatus}`);
    }

    indexMatchesDist = normalizeHtml(servedHtml) === normalizeHtml(distHtml) ? "일치" : "불일치";
    if (indexMatchesDist !== "일치") {
      issues.push("8094 preview server response does not match apps/mobile/dist/index.html");
    }

    const missingScripts = distScriptSources.filter((source) => !servedScriptSources.includes(source));
    const extraScripts = servedScriptSources.filter((source) => !distScriptSources.includes(source));
    if (missingScripts.length > 0) issues.push(`preview server missing dist script: ${missingScripts.join(", ")}`);
    if (extraScripts.length > 0) warnings.push(`preview server has extra script: ${extraScripts.join(", ")}`);

    bottomNavEvidence = checkBottomNavBundle(distScriptSources);
  } catch (error) {
    const message = `preview server unreachable: ${error.message}`;
    if (optionalServer) warnings.push(message);
    else issues.push(message);
  }
}

writeReport();

if (issues.length > 0) {
  if (reportOnly) {
    console.log(`android web preview server status generated: ${issues.length} issues`);
    process.exit(0);
  }
  console.error(`android web preview server check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`android web preview server check passed${warnings.length > 0 ? ` with ${warnings.length} warnings` : ""}`);

function scriptSources(html) {
  return [...html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)].map((match) => match[1]);
}

function normalizeHtml(html) {
  return html.replace(/\s+/g, " ").trim();
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function checkBottomNavBundle(sources) {
  const bundleTexts = sources
    .map((source) => join(rootDir, "apps/mobile/dist", source.replace(/^\//, "")))
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  const bottomNavText = bottomNavRoutesText(bundleTexts);

  const required = [
    ['label:"홈"', 'label:"\\ud648"'],
    ['label:"코디"', 'label:"\\ucf54\\ub514"'],
    ['label:"출발"', 'label:"\\ucd9c\\ubc1c"'],
    ['label:"MY"'],
  ];
  const stale = ['label:"소셜"', 'label:"\\uc18c\\uc15c"', 'label:"우산"', 'label:"\\uc6b0\\uc0b0"', 'label:"강수"', 'label:"\\uac15\\uc218"'];
  const missing = required.filter((snippets) => !snippets.some((snippet) => bottomNavText.includes(snippet)));
  const staleFound = stale.filter((snippet) => bottomNavText.includes(snippet));

  if (missing.length > 0) {
    issues.push("dist bundle does not prove bottom nav labels 홈/코디/출발/MY");
  }
  if (staleFound.length > 0) {
    issues.push(`dist bundle contains stale bottom nav labels: ${staleFound.join(", ")}`);
  }
  return missing.length === 0 && staleFound.length === 0 ? "홈/코디/출발/MY 확인" : "확인 필요";
}

function bottomNavRoutesText(bundleTexts) {
  const minifiedMatch = bundleTexts.match(/bottomNavRoutes=\[([\s\S]*?)\]\}/);
  if (minifiedMatch) return minifiedMatch[1];

  const sourceMatch = bundleTexts.match(/bottomNavRoutes:[\s\S]*?\[([\s\S]*?)\];/);
  if (sourceMatch) return sourceMatch[1];

  issues.push("dist bundle does not expose bottomNavRoutes section");
  return "";
}

function writeReport() {
  const report = `# WeatherON Android Web Preview Server Status

> 생성일: ${kstDate()}
> 목적: 8094 미리보기가 최신 \`apps/mobile/dist\` 산출물을 그대로 서빙하는지 확인한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 상태 | ${statusLabel()} |
| issue 수 | ${issues.length} |
| warning 수 | ${warnings.length} |
| preview URL | \`${previewUrl}\` |
| 응답 URL | \`${responseUrl}\` |
| 응답 상태 | ${responseStatus} |
| dist index | ${existsSync(distIndexPath) ? "있음" : "없음"} |
| index.html 일치 | ${indexMatchesDist} |
| dist script | ${distScriptSources.length > 0 ? distScriptSources.map((source) => `\`${source}\``).join("<br>") : "없음"} |
| served script | ${servedScriptSources.length > 0 ? servedScriptSources.map((source) => `\`${source}\``).join("<br>") : "없음"} |
| 하단 메뉴 증빙 | ${bottomNavEvidence} |

## 2. 판정 기준

| 항목 | 기준 |
|---|---|
| 서버 루트 | 8094 응답 HTML이 \`apps/mobile/dist/index.html\`과 일치 |
| JS 번들 | 응답 HTML의 script가 dist index의 script와 일치 |
| 하단 메뉴 | dist 번들에 \`홈/코디/출발/MY\` 포함, 최초 출시 미공개 \`소셜\` 및 \`우산/강수\` 하단 라벨 없음 |

## 3. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 4. Warnings

${warnings.length === 0 ? "- 없음" : warnings.map((warning) => `- ${warning}`).join("\n")}

## 5. 확인 명령

\`\`\`bash
npm run export:android-web
python3 -m http.server 8094 --bind 127.0.0.1 --directory apps/mobile/dist
npm run check:android-web-preview-server
WEATHERON_WEB_PREVIEW_SERVER_OPTIONAL=1 WEATHERON_WEB_PREVIEW_SERVER_REPORT_ONLY=1 npm run check:android-web-preview-server
WEATHERON_WEB_PREVIEW_SERVER_REPORT_ONLY=1 npm run check:android-web-preview-server
\`\`\`
`;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, report, "utf8");
}

function statusLabel() {
  if (issues.length > 0) return "확인 필요";
  if (warnings.length > 0) return "미확인";
  return "정상";
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
