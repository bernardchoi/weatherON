import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import ts from "typescript";

const root = process.cwd();
const sourceRoots = ["apps/mobile/src", "packages/shared/src/rules", "packages/shared/src/fixtures/presetWardrobe.ts"];
const outputDir = path.join(root, "apps/mobile/src/localization/locales");
const languages = ["en", "ja"];
const korean = /[가-힣]/u;
const overrides = {
  en: {
    "기본 위치 서울": "Default location · Seoul",
    "날씨와 출발 시간을 맞춰드림": "Weather and departure guidance, together",
    "더운 날이에요 · 가볍게": "Hot day · Dress light",
    "더운 날이에요. 바람 잘 통하는 차림이 좋아요": "It's hot today. Choose breathable clothing.",
    "다시 시도": "Try again",
    "다음": "Next",
    "뒤로": "Back",
    "맑음": "Clear",
    "바람 잘 통하는 차림이 좋아요": "Choose breathable clothing",
    "나중에": "Later",
    "오늘 나갈 준비, WeatherON이 가볍게 챙겨드려요": "WeatherON helps you get ready for the day.",
    "오늘 날씨에 맞춰, 나갈 준비를 함께해요.": "Get ready for the day with today's weather.",
    "오늘 입기 좋은 코디": "Today's outfit",
    "오늘은 가볍게 나가요": "Keep it light today",
    "완료": "Done",
    "저장": "Save",
    "직접 고른 지역": "Manually selected region",
    "체감 {0} · 강수 {1}%": "Feels like {0} · Precipitation {1}%",
    "최고 {0} · 최저 {1}": "High {0} · Low {1}",
    "홈": "Home",
    "홈 탭": "Home tab",
    "코디": "Outfit",
    "코디 탭": "Outfit tab",
    "출발": "Depart",
    "출발 탭": "Depart tab",
    "{0}개": "plural:{0} item|{0} items",
    "{0}건": "plural:{0} item|{0} items",
    "{0}곳": "plural:{0} location|{0} locations",
    "{0}곳 검색됨": "plural:{0} location found|{0} locations found",
    "{0}곳 저장됨": "plural:{0} location saved|{0} locations saved",
    "{0}개 보유": "plural:{0} item owned|{0} items owned",
    "{0}개 보유 중": "plural:{0} item owned|{0} items owned",
    "내 옷장 {0}개 보기": "plural:View {0} wardrobe item|View {0} wardrobe items",
    "알림 열기, 읽지 않음 {0}개": "plural:Open notifications, {0} unread notification|Open notifications, {0} unread notifications",
    "예약 {0}건": "plural:{0} scheduled notification|{0} scheduled notifications",
    "예약 확인 {0}건": "plural:{0} scheduled notification checked|{0} scheduled notifications checked",
    "남은 예약 {0}건": "plural:{0} scheduled notification remaining|{0} scheduled notifications remaining",
    "저장 위치 {0}곳": "plural:{0} saved location|{0} saved locations",
    "저장한 {0}곳 · 눌러서 바꿔보기": "plural:{0} saved location · Tap to change|{0} saved locations · Tap to change",
  },
  ja: {
    "기본 위치 서울": "デフォルト地点・ソウル",
    "날씨와 출발 시간을 맞춰드림": "天気と出発時刻をまとめて案内",
    "더운 날이에요 · 가볍게": "暑い日・軽めの服装で",
    "더운 날이에요. 바람 잘 통하는 차림이 좋아요": "暑い日は、通気性のよい服がおすすめです",
    "다음": "次へ",
    "바람 잘 통하는 차림이 좋아요": "通気性のよい服がおすすめです",
    "오늘 나갈 준비, WeatherON이 가볍게 챙겨드려요": "今日のお出かけ準備を、WeatherONがサポートします",
    "오늘 입기 좋은 코디": "今日のおすすめコーデ",
    "오늘은 가볍게 나가요": "今日は軽めの服装で",
    "직접 고른 지역": "手動で選んだ地域",
    "체감 {0} · 강수 {1}%": "体感 {0}・降水確率 {1}%",
    "최고 {0} · 최저 {1}": "最高 {0}・最低 {1}",
    "홈": "ホーム",
    "홈 탭": "ホームタブ",
    "코디": "コーデ",
    "코디 탭": "コーデタブ",
    "출발": "出発",
    "출발 탭": "出発タブ",
    "개": "件",
  },
};

const files = (await Promise.all(sourceRoots.map(collectSourceFiles))).flat()
  .filter((file) => !file.includes(`${path.sep}localization${path.sep}`));
const messages = new Set();

for (const file of files) {
  const source = await fs.readFile(file, "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  visit(sourceFile);
}

const orderedMessages = [...messages].filter(isTranslatable).sort((a, b) => a.localeCompare(b, "ko"));
await fs.mkdir(outputDir, { recursive: true });

const messageOutput = process.argv.find((argument) => argument.startsWith("--messages="))?.slice("--messages=".length);
if (messageOutput) {
  await fs.writeFile(messageOutput, `${JSON.stringify(orderedMessages, null, 2)}\n`);
  process.exit(0);
}

if (process.argv.includes("--check")) {
  const catalogs = Object.fromEntries(await Promise.all(languages.map(async (language) => [language, await readCatalog(path.join(outputDir, `${language}.json`))])));
  for (const language of languages) {
    assert.deepEqual(Object.keys(catalogs[language]).sort(), [...orderedMessages].sort(), `${language} catalog keys must match source messages`);
    for (const [source, target] of Object.entries(catalogs[language])) {
      assert.ok(target.trim(), `${language} translation is empty: ${source}`);
      const targets = target.startsWith("plural:") ? target.slice("plural:".length).split("|") : [target];
      targets.forEach((variant) => assert.deepEqual(placeholders(variant).sort(), placeholders(source).sort(), `${language} placeholders differ: ${source}`));
      assert.doesNotMatch(target, korean, `${language} translation still contains Korean: ${source}`);
    }
  }
  const policySource = await fs.readFile(path.join(root, "apps/mobile/src/localization/localePolicy.ts"), "utf8");
  const policyModule = ts.transpileModule(policySource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { resolveLocalePolicy } = await import(`data:text/javascript;base64,${Buffer.from(policyModule).toString("base64")}`);
  const cases = [
    [[{ languageTag: "ko-KR", languageCode: "ko", regionCode: "KR" }], ["ko", "ko-KR", "KR"]],
    [[{ languageTag: "en-US", languageCode: "en", regionCode: "US" }], ["en", "en-US", "US"]],
    [[{ languageTag: "en-GB", languageCode: "en", regionCode: "GB" }], ["en", "en-GB", "GB"]],
    [[{ languageTag: "ja-JP", languageCode: "ja", regionCode: "JP" }], ["ja", "ja-JP", "JP"]],
    [[{ languageTag: "ko-US", languageCode: "ko", regionCode: "US" }], ["ko", "ko-US", "US"]],
    [[{ languageTag: "en-KR", languageCode: "en", regionCode: "KR" }], ["en", "en-KR", "KR"]],
    [[{ languageTag: "fr-FR", languageCode: "fr", regionCode: "FR" }, { languageTag: "ja-JP", languageCode: "ja", regionCode: "JP" }], ["ja", "ja-JP", "FR"]],
    [[{ languageTag: "fr-DE", languageCode: "fr", regionCode: "DE" }], ["en", "en-US", "DE"]],
  ];
  for (const [preferences, expected] of cases) {
    const policy = resolveLocalePolicy(preferences);
    assert.deepEqual([policy.language, policy.languageTag, policy.regionCode], expected);
  }
  const sourceText = (await Promise.all(files.map((file) => fs.readFile(file, "utf8")))).join("\n");
  for (const word of ["취소", "나중에", "우산", "바람", "예약 완료"]) {
    assert.doesNotMatch(sourceText, new RegExp(`(?:includes\\(|[=!]==?\\s*)["'](?:[^"']*)${word}`, "u"), `display string controls logic: ${word}`);
  }
  console.log(`mobile localization check passed (${orderedMessages.length} messages)`);
  process.exit(0);
}

for (const language of languages) {
  const outputPath = path.join(outputDir, `${language}.json`);
  const existing = process.argv.includes("--refresh") ? {} : await readCatalog(outputPath);
  const missing = orderedMessages.filter((message) => !existing[message]);
  let completed = 0;
  for (const batch of chunks(missing, 16)) {
    const translated = await translateBatch(batch, language);
    batch.forEach((message, index) => { existing[message] = translated[index]; });
    completed += batch.length;
    if (completed % 60 === 0 || completed === missing.length) {
      await writeCatalog(outputPath, existing);
      process.stdout.write(`${language}: ${completed}/${missing.length}\n`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  Object.assign(existing, overrides[language]);
  const current = Object.fromEntries(orderedMessages.map((message) => [message, existing[message] ?? message]));
  await writeCatalog(outputPath, current);
}

function visit(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) add(node.text);
  if (ts.isTemplateExpression(node)) {
    let message = node.head.text;
    node.templateSpans.forEach((span, index) => { message += `{${index}}${span.literal.text}`; });
    add(message);
  }
  if (ts.isJsxText(node)) add(node.text.replace(/\s+/gu, " "));
  if (ts.isJsxElement(node) && getJsxTagName(node.openingElement.tagName) === "Text") {
    const composite = getCompositeJsxMessage(node.children);
    if (composite) add(composite);
  }
  ts.forEachChild(node, visit);
}

function getCompositeJsxMessage(children) {
  let message = "";
  let expressionIndex = 0;
  for (const child of children) {
    if (ts.isJsxText(child)) message += child.text.replace(/\s+/gu, " ");
    else if (ts.isJsxExpression(child) && child.expression) message += `{${expressionIndex++}}`;
    else return null;
  }
  return expressionIndex > 0 && korean.test(message) ? message.trim() : null;
}

function getJsxTagName(tagName) {
  return ts.isIdentifier(tagName) ? tagName.text : null;
}

function add(value) {
  const normalized = value.trim().replace(/\r\n/gu, "\n");
  if (normalized) messages.add(normalized);
}

function isTranslatable(value) {
  return korean.test(value) && value.length <= 700 && !/^weatheron[:.]/iu.test(value) && !/^[\w.-]+@[\w.-]+$/u.test(value);
}

async function collectSourceFiles(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const stat = await fs.stat(absolutePath);
  if (stat.isFile()) return [absolutePath];
  const entries = await fs.readdir(absolutePath, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const child = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(path.relative(root, child));
    return /\.tsx?$/u.test(entry.name) ? [child] : [];
  }));
  return nested.flat();
}

async function translateBatch(messages, language) {
  const separator = "<<<WONSEP>>>";
  const protectedMessage = messages.map((message) => message.replace(/\{(\d+)\}/gu, "__WON_$1__")).join(`\n${separator}\n`);
  const params = new URLSearchParams({ client: "dict-chrome-ex", sl: "ko", tl: language, q: protectedMessage });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(`https://clients5.google.com/translate_a/t?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const translated = typeof payload?.[0] === "string" ? payload[0].split(/\s*<{3}WONSEP>{3}\s*/u) : [];
      if (translated.length !== messages.length) throw new Error(`expected ${messages.length} messages, received ${translated.length}`);
      return translated.map((value) => value.trim().replace(/__\s*WON\s*_\s*(\d+)\s*__/giu, "{$1}"));
    } catch (error) {
      if (attempt === 3) throw new Error(`${language} translation failed for batch starting ${JSON.stringify(messages[0])}: ${String(error)}`);
      await new Promise((resolve) => setTimeout(resolve, 2_000 * (attempt + 1)));
    }
  }
  return message;
}

async function readCatalog(file) {
  try { return JSON.parse(await fs.readFile(file, "utf8")); }
  catch { return {}; }
}

async function writeCatalog(file, catalog) {
  const ordered = Object.fromEntries(Object.entries(catalog).sort(([left], [right]) => left.localeCompare(right, "ko")));
  await fs.writeFile(file, `${JSON.stringify(ordered, null, 2)}\n`);
}

function chunks(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

function placeholders(value) {
  return [...value.matchAll(/\{(\d+)\}/gu)].map((match) => match[1]);
}
