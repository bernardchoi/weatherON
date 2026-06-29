import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();

const requiredFiles = [
  "apps/mobile/src/providers/appStorage.ts",
  "apps/mobile/src/navigation/routeLabels.ts",
  "docs/architecture/WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md",
  "docs/architecture/WeatherON_ANDROID_WEB_EXPORT_QA.md",
];

for (const relativePath of requiredFiles) {
  assert.ok(existsSync(join(rootDir, relativePath)), `required quality artifact is missing: ${relativePath}`);
}

assertSourceIncludes("apps/mobile/src/state/useWeatherOnAppState.ts", [
  'useState<AppRouteId>("O2")',
  "readAppJson",
  "writeAppJson",
  "setRoute(persistedState.onboardingCompleted ? \"H1\" : \"O2\")",
]);

assertSourceIncludes("apps/mobile/src/navigation/AppNavigator.tsx", ["BackHandler", "goBack"]);
assertSourceIncludes("apps/mobile/src/navigation/routeLabels.ts", ["getRouteLabel", "계정 연결", "권한 설정", "정책 허브"]);
assertSourceIncludes("apps/mobile/src/navigation/routes.ts", ['label: "출발"', 'label: "소셜"', 'id: "H3"', 'id: "S1"']);
assertBottomNavRoutes("apps/mobile/src/navigation/routes.ts");

assertSourceIncludes("apps/mobile/src/components/BottomNav.tsx", ["getActiveTabRoute", 'route === "H3" || route === "H4" || route === "H5"', 'route === "G2"']);
assertSourceExcludes("apps/mobile/src/components/BottomNav.tsx", [">{route.id}</Text>", "route.id}</Text>"]);

const visibleCopyPaths = [
  "apps/mobile/src/screens",
  "apps/mobile/src/components",
];

const forbiddenVisibleSnippets = [
  'badge="A2"',
  'badge="A3"',
  'badge="A4"',
  'badge="O3"',
  'badge="P2"',
  "Guest",
  "GUEST",
  "LINKED",
  "READY",
  "ACTIVE",
  "LOADING",
  "OUTER",
  "TOP",
  "BOTTOM",
  "SHOES",
  "ACCESSORY",
  "status.toUpperCase()",
  '? "fallback" : "adapter"',
  "Settings State",
  "Mode A",
  "source ${",
  "fallback 샘플",
  "locationReady ${",
  "permissionReady ${",
  "source.toUpperCase()",
  "날씨 API",
  "정규화 완료",
  "최근 캐시",
  "source preset",
  "gate 결과",
  "권한 gate",
  "코디 variant",
  "P2 범위",
  "O4에서 추천",
  "H1/H3",
  "복귀 화면 {gate",
  'returnTo ?? "H1"',
  'badge="H5"',
];

for (const relativePath of listFiles(visibleCopyPaths)) {
  assertSourceExcludes(relativePath, forbiddenVisibleSnippets);
}

console.log("android product quality check passed");

function assertSourceIncludes(relativePath, snippets) {
  const text = readText(relativePath);
  for (const snippet of snippets) {
    assert.ok(text.includes(snippet), `${relativePath} must include: ${snippet}`);
  }
}

function assertSourceExcludes(relativePath, snippets) {
  const text = readText(relativePath);
  for (const snippet of snippets) {
    assert.ok(!text.includes(snippet), `${relativePath} must not include: ${snippet}`);
  }
}

function assertBottomNavRoutes(relativePath) {
  const text = readText(relativePath);
  const match = text.match(/export const bottomNavRoutes:[\s\S]*?\n\];/);
  assert.ok(match, `${relativePath} must define bottomNavRoutes`);
  const bottomNavText = match[0];
  for (const snippet of ['id: "H1"', 'label: "홈"', 'id: "C1"', 'label: "코디"', 'id: "G1"', 'label: "출발"', 'id: "M1"', 'label: "MY"', 'id: "S1"', 'label: "소셜"']) {
    assert.ok(bottomNavText.includes(snippet), `${relativePath} bottomNavRoutes must include: ${snippet}`);
  }
  for (const snippet of ['id: "H3"', 'id: "H4"', 'id: "H5"', 'label: "우산"', 'label: "강수"']) {
    assert.ok(!bottomNavText.includes(snippet), `${relativePath} bottomNavRoutes must not include: ${snippet}`);
  }
}

function listFiles(relativeDirs) {
  const files = [];
  for (const relativeDir of relativeDirs) {
    const absoluteDir = join(rootDir, relativeDir);
    for (const entry of walk(absoluteDir)) {
      if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
        files.push(entry.slice(rootDir.length + 1));
      }
    }
  }
  return files;
}

function* walk(path) {
  for (const name of readdirSync(path)) {
    const childPath = join(path, name);
    if (statSync(childPath).isDirectory()) yield* walk(childPath);
    else yield childPath;
  }
}

function readText(relativePath) {
  return readFileSync(join(rootDir, relativePath), "utf8");
}
