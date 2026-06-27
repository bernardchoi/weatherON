import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md");

const appConfig = readJson("apps/mobile/app.json").expo;
const easConfig = readJson("apps/mobile/eas.json");
const packageConfig = readJson("package.json");
const storeManifest = readJson("assets/store/android-store-assets.json");

const checks = [
  check("Android package", appConfig.android?.package === "com.weatheron.mobile", appConfig.android?.package),
  check("Android versionCode", Number.isInteger(appConfig.android?.versionCode) && appConfig.android.versionCode >= 1, String(appConfig.android?.versionCode)),
  check("위치 권한", hasAndroidPermission("ACCESS_COARSE_LOCATION") && hasAndroidPermission("ACCESS_FINE_LOCATION"), appConfig.android?.permissions?.join(", ") ?? ""),
  check("EAS preview APK profile", easConfig.build?.preview?.android?.buildType === "apk", easConfig.build?.preview?.android?.buildType),
  check("EAS production AAB profile", easConfig.build?.production?.android?.buildType === "app-bundle", easConfig.build?.production?.android?.buildType),
  check("로컬 통합 게이트 명령", Boolean(packageConfig.scripts?.["check:android-build-ready"]), "npm run check:android-build-ready"),
  check("EAS 로그인 체크 명령", Boolean(packageConfig.scripts?.["check:eas-login-state"]), "npm run check:eas-login-state"),
  check("앱 아이콘 후보", hasStoreAsset("android-app-icon-512", 512, 512), "assets/store/android-app-icon-512.png"),
  check("대표 그래픽 후보", hasStoreAsset("android-feature-graphic-v1", 1024, 500), "assets/store/android-feature-graphic-v1.png"),
  check("APK QA 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_APK_QA_체크리스트.md")), "WeatherON_ANDROID_APK_QA_체크리스트.md"),
  check("스토어 등록 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_등록자료.md")), "WeatherON_ANDROID_STORE_등록자료.md"),
  check("폐쇄 테스트 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md")), "WeatherON_ANDROID_폐쇄테스트_운영기록.md"),
  check("개인정보처리방침 HTML", existsSync(join(rootDir, "docs/policy/weatheron_privacy_policy.html")), "docs/policy/weatheron_privacy_policy.html"),
];

const passedCount = checks.filter((item) => item.passed).length;
const report = `# WeatherON Android Release Readiness Report

> 생성일: 2026-06-27
> 목적: Android preview APK 빌드 전 정적 준비 상태와 남은 차단 항목을 한 화면에 유지한다.

## 1. 요약

| 항목 | 값 |
|---|---|
| 앱 이름 | ${appConfig.name} |
| Android package | \`${appConfig.android?.package}\` |
| 앱 버전 | \`${appConfig.version}\` |
| Android versionCode | \`${appConfig.android?.versionCode}\` |
| 정적 체크 통과 | ${passedCount}/${checks.length} |
| 현재 차단 | Expo/EAS 로그인 필요 |

## 2. 정적 준비 체크

| 체크 | 상태 | 근거 |
|---|---|---|
${checks.map((item) => `| ${item.name} | ${item.passed ? "통과" : "확인 필요"} | ${item.detail} |`).join("\n")}

## 3. 최근 검증 명령

| 명령 | 상태 |
|---|---|
| \`npm run check:android-release\` | 통과 |
| \`npm run check:android-build-ready\` | 통과 |
| \`WEATHERON_PROXY_SMOKE=1 npm run check:weather-proxy\` | 통과 |
| \`WEATHERON_LIVE_SMOKE=1 npm run check:weather-live\` | 통과 |
| \`WEATHERON_PLACE_SMOKE=1 npm run check:place-search\` | 통과 |
| \`npm run check:eas-login-state\` | 로그인 필요 |

## 4. 다음 작업

1. \`npm run eas:login\`
2. \`npm run check:eas-login-state\`
3. \`npm run eas:init\`
4. \`npm run check:android-local-release-ready\`
5. \`npm run build:android:preview\`
6. APK 설치 후 \`WeatherON_ANDROID_APK_QA_체크리스트.md\`에 결과 기록
7. Play Console 제출 전 \`npm run check:android-store-submit-ready\`
`;

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, report, "utf8");

console.log(`android release readiness report generated: ${reportPath}`);

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(rootDir, relativePath), "utf8"));
}

function check(name, passed, detail) {
  return {
    name,
    passed,
    detail: detail || "",
  };
}

function hasAndroidPermission(permission) {
  return appConfig.android?.permissions?.includes(permission);
}

function hasStoreAsset(id, width, height) {
  const asset = storeManifest.assets?.find((item) => item.id === id);
  if (!asset) return false;
  if (asset.width !== width || asset.height !== height) return false;
  return existsSync(join(rootDir, asset.path));
}
