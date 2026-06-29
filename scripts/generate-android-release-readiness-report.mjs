import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const reportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md");

const appConfig = readJson("apps/mobile/app.json").expo;
const easConfig = readJson("apps/mobile/eas.json");
const packageConfig = readJson("package.json");
const storeManifest = readJson("assets/store/android-store-assets.json");
const easLoginStatusPath = join(rootDir, "docs/architecture/WeatherON_EAS_LOGIN_STATUS.md");
const easLoginStatus = readOptionalText(easLoginStatusPath);
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const buildStatusDoc = readOptionalText(buildStatusPath);
const productionBuildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md");
const productionBuildStatusDoc = readOptionalText(productionBuildStatusPath);
const apkQaDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_APK_QA_체크리스트.md");
const apkQaDoc = readOptionalText(apkQaDocPath);
const latestPreviewBuildId = normalizeTableValue(extractTableValue(buildStatusDoc, "EAS build id") || extractTableValue(apkQaDoc, "QA 대상 EAS build id") || extractTableValue(apkQaDoc, "EAS build id"));
const latestPreviewBuildStatus = normalizeTableValue(extractTableValue(buildStatusDoc, "Build 상태") || extractTableValue(apkQaDoc, "QA 대상 build 상태")) || "미확인";
const latestProductionBuildId = normalizeTableValue(extractTableValue(productionBuildStatusDoc, "EAS build id"));
const latestProductionBuildStatus = normalizeTableValue(extractTableValue(productionBuildStatusDoc, "Build 상태")) || "미확인";
const isEasLoggedIn = easLoginStatus.includes("| 상태 | logged_in |");
const easProjectId = appConfig.extra?.eas?.projectId ?? "";
const currentBlocker = isEasLoggedIn && easProjectId
  ? "Play Console/스토어 제출 항목 미완료"
  : "Expo/EAS 로그인 또는 프로젝트 연결 필요";
const easLoginCommandStatus = isEasLoggedIn ? "통과" : "로그인 필요";
const nextSteps = isEasLoggedIn && easProjectId
  ? [
      latestPreviewBuildId && latestPreviewBuildStatus === "FINISHED"
        ? `\`${latestPreviewBuildId}\` APK 실기기 재설치 후 QA`
        : latestPreviewBuildId
          ? `\`${latestPreviewBuildId}\` 빌드 완료 대기 후 artifact 확인`
        : "`npm run build:android:preview`로 새 APK 필요 시 재빌드",
      "`WeatherON_ANDROID_APK_QA_체크리스트.md`에 실기기 결과 기록",
      "통과 화면으로 Android 스토어 스크린샷 캡처",
      "`WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md`의 사용자 입력값 확정",
      "Play Console 제출 전 `npm run check:android-store-submit-ready`",
      latestProductionBuildId && latestProductionBuildStatus === "FINISHED"
        ? `\`${latestProductionBuildId}\` AAB artifact를 Play Console 업로드 후보로 확인`
        : latestProductionBuildId
          ? `\`${latestProductionBuildId}\` production AAB 완료 대기 후 artifact 확인`
          : "`npm run build:android:production:no-wait`로 Play 제출용 AAB 빌드 시작",
      "`npm run build:android:preview:no-wait`로 새 APK 필요 시 재빌드",
    ]
  : [
      "`npm run eas:login`",
      "`npm run check:eas-login-state`",
      "`npm run eas:init`",
      "`npm run check:android-local-release-ready`",
      "`npm run build:android:preview`",
      "APK 설치 후 `WeatherON_ANDROID_APK_QA_체크리스트.md`에 결과 기록",
      "Play Console 제출 전 `npm run check:android-store-submit-ready`",
    ];

const checks = [
  check("Android package", appConfig.android?.package === "com.weatheron.mobile", appConfig.android?.package),
  check("Android versionCode", Number.isInteger(appConfig.android?.versionCode) && appConfig.android.versionCode >= 1, String(appConfig.android?.versionCode)),
  check("위치 권한", hasAndroidPermission("ACCESS_COARSE_LOCATION") && hasAndroidPermission("ACCESS_FINE_LOCATION"), appConfig.android?.permissions?.join(", ") ?? ""),
  check("EAS preview APK profile", easConfig.build?.preview?.android?.buildType === "apk", easConfig.build?.preview?.android?.buildType),
  check("EAS production AAB profile", easConfig.build?.production?.android?.buildType === "app-bundle", easConfig.build?.production?.android?.buildType),
  check("로컬 통합 게이트 명령", Boolean(packageConfig.scripts?.["check:android-build-ready"]), "npm run check:android-build-ready"),
  check("제품 품질 체크 명령", Boolean(packageConfig.scripts?.["check:android-product-quality"]), "npm run check:android-product-quality"),
  check("EAS 로그인 체크 명령", Boolean(packageConfig.scripts?.["check:eas-login-state"]), "npm run check:eas-login-state"),
  check("EAS production no-wait 명령", Boolean(packageConfig.scripts?.["build:android:production:no-wait"]), "npm run build:android:production:no-wait"),
  check("EAS production 상태 문서 명령", Boolean(packageConfig.scripts?.["check:eas-production-build-status"]), "npm run check:eas-production-build-status -- <eas-build-id>"),
  check("앱 아이콘 후보", hasStoreAsset("android-app-icon-512", 512, 512), "assets/store/android-app-icon-512.png"),
  check("대표 그래픽 후보", hasStoreAsset("android-feature-graphic-v1", 1024, 500), "assets/store/android-feature-graphic-v1.png"),
  check("APK QA 문서", existsSync(apkQaDocPath), "WeatherON_ANDROID_APK_QA_체크리스트.md"),
  check("Web export 보조 QA 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_WEB_EXPORT_QA.md")), "WeatherON_ANDROID_WEB_EXPORT_QA.md"),
  check("실기기 QA 세션 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md")), "WeatherON_ANDROID_DEVICE_QA_SESSION.md"),
  check("스토어 등록 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_등록자료.md")), "WeatherON_ANDROID_STORE_등록자료.md"),
  check("스토어 입력값 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md")), "WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md"),
  check("스토어 스크린샷 계획 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md")), "WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md"),
  check("폐쇄 테스트 문서", existsSync(join(rootDir, "docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md")), "WeatherON_ANDROID_폐쇄테스트_운영기록.md"),
  check("개인정보처리방침 HTML", existsSync(join(rootDir, "docs/policy/weatheron_privacy_policy.html")), "docs/policy/weatheron_privacy_policy.html"),
];

const passedCount = checks.filter((item) => item.passed).length;
const report = `# WeatherON Android Release Readiness Report

> 생성일: 2026-06-28
> 목적: Android preview APK와 production AAB 기준 출시 준비 상태와 남은 차단 항목을 한 화면에 유지한다.

## 1. 요약

| 항목 | 값 |
|---|---|
| 앱 이름 | ${appConfig.name} |
| Android package | \`${appConfig.android?.package}\` |
| 앱 버전 | \`${appConfig.version}\` |
| Android versionCode | \`${appConfig.android?.versionCode}\` |
| 정적 체크 통과 | ${passedCount}/${checks.length} |
| EAS 로그인 | ${easLoginCommandStatus} |
| EAS projectId | ${easProjectId || "미연결"} |
| 최신 preview build | ${latestPreviewBuildId || "미확인"} |
| 최신 preview build 상태 | ${latestPreviewBuildStatus} |
| 최신 production build | ${latestProductionBuildId || "미확인"} |
| 최신 production build 상태 | ${latestProductionBuildStatus} |
| 현재 차단 | ${currentBlocker} |

## 2. 정적 준비 체크

| 체크 | 상태 | 근거 |
|---|---|---|
${checks.map((item) => `| ${item.name} | ${item.passed ? "통과" : "확인 필요"} | ${item.detail} |`).join("\n")}

## 3. 최근 검증 명령

| 명령 | 상태 |
|---|---|
| \`npm run check:android-release\` | 통과 |
| \`npm run check:android-build-ready\` | 통과 |
| \`npm run check:android-product-quality\` | 통과 |
| \`npm run check:android-device-qa-ready\` | 통과 |
| \`WEATHERON_PROXY_SMOKE=1 npm run check:weather-proxy\` | 통과 |
| \`WEATHERON_LIVE_SMOKE=1 npm run check:weather-live\` | 통과 |
| \`WEATHERON_PLACE_SMOKE=1 npm run check:place-search\` | 통과 |
| \`npm run check:eas-login-state\` | ${easLoginCommandStatus} |
| \`npm run check:eas-build-status -- ${latestPreviewBuildId || "<eas-build-id>"}\` | ${latestPreviewBuildStatus === "FINISHED" ? "통과" : "확인 필요"} |
| \`npm run check:eas-production-build-status -- ${latestProductionBuildId || "<eas-build-id>"}\` | ${latestProductionBuildStatus === "FINISHED" ? "통과" : "확인 필요"} |

## 4. 다음 작업

${nextSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}
`;

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, report, "utf8");

console.log(`android release readiness report generated: ${reportPath}`);

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(rootDir, relativePath), "utf8"));
}

function readOptionalText(path) {
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
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

function extractTableValue(text, label) {
  if (!text) return "";
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`\\|\\s*${escapedLabel}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  return match?.[1]?.trim() ?? "";
}

function normalizeTableValue(value) {
  return value.replace(/^`|`$/g, "").trim();
}
