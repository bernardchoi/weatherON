import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const rootDir = process.cwd();
const mobileDir = join(rootDir, "apps/mobile");

const appJsonPath = join(mobileDir, "app.json");
const easJsonPath = join(mobileDir, "eas.json");
const easIgnorePath = join(rootDir, ".easignore");
const mobileEasIgnorePath = join(mobileDir, ".easignore");
const packageJsonPath = join(rootDir, "package.json");
const mobilePackageJsonPath = join(mobileDir, "package.json");
const androidAppBuildGradlePath = join(mobileDir, "android/app/build.gradle");
const releaseDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_출시_준비_프로세스.md");
const apkQaDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_APK_QA_체크리스트.md");
const storeListingDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_등록자료.md");
const storeInputsRequiredPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md");
const storeInputsPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_PACKET.md");
const privacyPolicyPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md");
const playUploadPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md");
const storeInputsExamplePath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS.example.json");
const storeInputsApplyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md");
const storeSafeDefaultsStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SAFE_DEFAULTS_STATUS.md");
const localInputFilesStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_LOCAL_INPUT_FILES_STATUS.md");
const contentRatingDraftPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CONTENT_RATING_DRAFT.md");
const storeScreenshotPlanPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md");
const storeScreenshotStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md");
const storeScreenshotPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md");
const closedTestDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md");
const closedTestPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_PACKET.md");
const closedTestStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_STATUS.md");
const closedTestInputsExamplePath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS.example.json");
const closedTestInputsApplyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md");
const manualActionPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_MANUAL_ACTION_PACKET.md");
const releaseEvidenceIndexPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_EVIDENCE_INDEX.md");
const releaseConsistencyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_CONSISTENCY_STATUS.md");
const readinessReportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md");
const releaseActionBoardPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md");
const previewPreflightStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PREVIEW_PREFLIGHT_STATUS.md");
const storeSubmitBlockersPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const externalActionsPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_EXTERNAL_ACTIONS.md");
const easLoginStatusPath = join(rootDir, "docs/architecture/WeatherON_EAS_LOGIN_STATUS.md");
const productionBuildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md");
const artifactAccessStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md");
const productQualityAuditPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md");
const webExportQaPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_WEB_EXPORT_QA.md");
const webExportStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_WEB_EXPORT_STATUS.md");
const webPreviewServerStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md");
const mapProviderCostComparisonPath = join(rootDir, "docs/architecture/WeatherON_MAP_PROVIDER_COST_COMPARISON.md");
const deviceQaSessionPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md");
const deviceQaPacketPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_PACKET.md");
const deviceQaResultsExamplePath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.example.json");
const deviceQaApplyStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_APPLY_STATUS.md");
const deviceQaEnvSyncStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_ENV_SYNC_STATUS.md");
const adbStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_ADB_STATUS.md");
const installStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_INSTALL_STATUS.md");
const privacyPolicyHtmlPath = join(rootDir, "docs/policy/weatheron_privacy_policy.html");
const androidAppIconPath = join(rootDir, "assets/store/android-app-icon-512.png");
const androidFeatureGraphicPath = join(rootDir, "assets/store/android-feature-graphic-v1.png");
const androidStoreAssetsManifestPath = join(rootDir, "assets/store/android-store-assets.json");

const appConfig = readJson(appJsonPath).expo;
const easConfig = readJson(easJsonPath);
const packageConfig = readJson(packageJsonPath);
const mobilePackageConfig = readJson(mobilePackageJsonPath);

assert.ok(appConfig, "apps/mobile/app.json must contain expo config");
assert.equal(appConfig.name, "WeatherON");
assert.equal(appConfig.slug, "weatheron");
assert.equal(appConfig.scheme, "weatheron");
assert.match(appConfig.version, /^\d+\.\d+\.\d+$/);

assert.equal(appConfig.android?.package, "com.weatheron.mobile");
assertDocIncludes(androidAppBuildGradlePath, ["namespace 'com.weatheron.mobile'", "applicationId 'com.weatheron.mobile'", "versionCode 5", 'versionName "0.1.0"']);
assert.equal(Number.isInteger(appConfig.android?.versionCode), true);
assert.ok(appConfig.android.versionCode >= 1);
assert.ok(appConfig.android.permissions.includes("ACCESS_COARSE_LOCATION"));
assert.ok(appConfig.android.permissions.includes("ACCESS_FINE_LOCATION"));
assertAssetExists(appConfig.icon, "expo.icon");
assertAssetExists(appConfig.splash?.image, "expo.splash.image");
assertAssetExists(appConfig.android.adaptiveIcon?.foregroundImage, "android.adaptiveIcon.foregroundImage");
assert.equal(mobilePackageConfig.dependencies?.["expo-file-system"], "~18.1.11");

assert.equal(easConfig.cli?.appVersionSource, "local");
assert.equal(easConfig.build?.development?.developmentClient, true);
assert.equal(easConfig.build?.development?.distribution, "internal");
assert.equal(easConfig.build?.development?.android?.buildType, "apk");
assert.equal(easConfig.build?.preview?.distribution, "internal");
assert.equal(easConfig.build?.preview?.android?.buildType, "apk");
assert.equal(easConfig.build?.production?.android?.buildType, "app-bundle");
assertDocIncludes(easIgnorePath, [".git", ".git/", "node_modules/", ".npm-cache/", "dist/", "apps/mobile/dist/", "apps/mobile/dist-web/", "apps/mobile/android/**/build/", "docs/", "mockups/", "brand/", "assets/store/"]);
assertDocIncludes(mobileEasIgnorePath, [".git", ".git/", "node_modules/", ".expo/", "dist/", "dist-web/", "web-build/", "android/.gradle/", "android/**/build/", "ios/build/"]);

assert.equal(mobilePackageConfig.scripts?.["eas:login"], "npx --yes --cache ../../.npm-cache eas-cli login");
assert.equal(mobilePackageConfig.scripts?.["eas:whoami"], "npx --yes --cache ../../.npm-cache eas-cli whoami");
assert.equal(mobilePackageConfig.scripts?.["eas:init"], "npx --yes --cache ../../.npm-cache eas-cli init");
assert.equal(
  mobilePackageConfig.scripts?.["build:android:development"],
  "npx --yes --cache ../../.npm-cache eas-cli build --platform android --profile development",
);
assert.equal(
  mobilePackageConfig.scripts?.["build:android:preview"],
  "npx --yes --cache ../../.npm-cache eas-cli build --platform android --profile preview",
);
assert.equal(
  mobilePackageConfig.scripts?.["build:android:preview:no-wait"],
  "npx --yes --cache ../../.npm-cache eas-cli build --platform android --profile preview --no-wait",
);
assert.equal(
  mobilePackageConfig.scripts?.["build:android:production"],
  "npx --yes --cache ../../.npm-cache eas-cli build --platform android --profile production",
);
assert.equal(
  mobilePackageConfig.scripts?.["build:android:production:no-wait"],
  "npx --yes --cache ../../.npm-cache eas-cli build --platform android --profile production --no-wait",
);
assert.equal(packageConfig.scripts?.["check:android-release"], "node scripts/check-android-release-config.mjs");
assert.equal(packageConfig.scripts?.["check:android-build-ready"], "node scripts/check-android-build-ready.mjs");
assert.equal(packageConfig.scripts?.["check:android-product-quality"], "node scripts/check-android-product-quality.mjs");
assert.equal(packageConfig.scripts?.["check:android-preview-preflight"], "node scripts/check-android-preview-preflight.mjs");
assert.equal(packageConfig.scripts?.["check:android-core-flow"], "node scripts/check-android-core-flow.mjs");
assert.equal(packageConfig.scripts?.["check:android-small-screen-layout"], "node scripts/check-android-small-screen-layout.mjs");
assert.equal(packageConfig.scripts?.["check:android-web-export"], "node scripts/check-android-web-export.mjs");
assert.equal(packageConfig.scripts?.["check:android-web-preview-server"], "node scripts/check-android-web-preview-server.mjs");
assert.equal(packageConfig.scripts?.["check:android-device-qa-ready"], "node scripts/check-android-device-qa-ready.mjs");
assert.equal(packageConfig.scripts?.["sync:android-device-qa-env"], "node scripts/sync-android-device-qa-env.mjs");
assert.equal(packageConfig.scripts?.["apply:android-device-qa-results"], "node scripts/apply-android-device-qa-results.mjs");
assert.equal(packageConfig.scripts?.["check:android-adb-ready"], "node scripts/check-android-adb-ready.mjs");
assert.equal(packageConfig.scripts?.["check:android-local-release-ready"], "node scripts/check-android-local-release-ready.mjs");
assert.equal(packageConfig.scripts?.["check:android-store-submit-ready"], "node scripts/check-android-store-submit-ready.mjs");
assert.equal(packageConfig.scripts?.["apply:android-store-safe-defaults"], "node scripts/apply-android-store-safe-defaults.mjs");
assert.equal(packageConfig.scripts?.["apply:android-store-inputs"], "node scripts/apply-android-store-inputs.mjs");
assert.equal(packageConfig.scripts?.["check:android-store-screenshots-ready"], "node scripts/check-android-store-screenshots-ready.mjs");
assert.equal(packageConfig.scripts?.["capture:android-store-screenshot"], "node scripts/capture-android-store-screenshot.mjs");
assert.equal(packageConfig.scripts?.["install:android-preview-apk"], "node scripts/install-android-preview-apk.mjs");
assert.equal(packageConfig.scripts?.["check:android-closed-test-ready"], "node scripts/check-android-closed-test-ready.mjs");
assert.equal(packageConfig.scripts?.["apply:android-closed-test-inputs"], "node scripts/apply-android-closed-test-inputs.mjs");
assert.equal(packageConfig.scripts?.["check:eas-login-state"], "node scripts/check-eas-login-state.mjs");
assert.equal(packageConfig.scripts?.["check:eas-build-status"], "node scripts/check-eas-build-status.mjs");
assert.equal(packageConfig.scripts?.["check:eas-production-build-status"], "node scripts/check-eas-production-build-status.mjs");
assert.equal(packageConfig.scripts?.["check:android-artifact-access"], "node scripts/check-android-artifact-access.mjs");
assert.equal(packageConfig.scripts?.["check:android-release-consistency"], "node scripts/check-android-release-consistency.mjs");
assert.equal(packageConfig.scripts?.["build:android-store-assets"], "node scripts/build-android-store-assets.mjs");
assert.equal(packageConfig.scripts?.["export:android-web"], "node scripts/export-android-web.mjs");
assert.equal(packageConfig.scripts?.["report:android-release-readiness"], "node scripts/generate-android-release-readiness-report.mjs");
assert.equal(packageConfig.scripts?.["report:android-release-action-board"], "node scripts/generate-android-release-action-board.mjs");
assert.equal(packageConfig.scripts?.["report:android-device-qa-packet"], "node scripts/generate-android-device-qa-packet.mjs");
assert.equal(packageConfig.scripts?.["report:android-store-inputs-packet"], "node scripts/generate-android-store-inputs-packet.mjs");
assert.equal(packageConfig.scripts?.["report:android-play-upload-packet"], "node scripts/generate-android-play-upload-packet.mjs");
assert.equal(packageConfig.scripts?.["report:android-store-screenshot-packet"], "node scripts/generate-android-store-screenshot-packet.mjs");
assert.equal(packageConfig.scripts?.["report:android-closed-test-packet"], "node scripts/generate-android-closed-test-packet.mjs");
assert.equal(packageConfig.scripts?.["report:android-manual-action-packet"], "node scripts/generate-android-manual-action-packet.mjs");
assert.equal(packageConfig.scripts?.["report:android-privacy-policy-packet"], "node scripts/generate-android-privacy-policy-packet.mjs");
assert.equal(packageConfig.scripts?.["report:android-release-evidence-index"], "node scripts/generate-android-release-evidence-index.mjs");
assert.equal(packageConfig.scripts?.["prepare:android-release-local-files"], "node scripts/prepare-android-release-local-files.mjs");
assert.equal(packageConfig.scripts?.["eas:login"], "npm --workspace @weatheron/mobile run eas:login");
assert.equal(packageConfig.scripts?.["eas:whoami"], "npm --workspace @weatheron/mobile run eas:whoami");
assert.equal(packageConfig.scripts?.["eas:init"], "npm --workspace @weatheron/mobile run eas:init");
assert.equal(
  packageConfig.scripts?.["build:android:preview"],
  "npm --workspace @weatheron/mobile run build:android:preview",
);
assert.equal(
  packageConfig.scripts?.["build:android:preview:no-wait"],
  "npm --workspace @weatheron/mobile run build:android:preview:no-wait",
);
assert.equal(
  packageConfig.scripts?.["build:android:production"],
  "npm --workspace @weatheron/mobile run build:android:production",
);
assert.equal(
  packageConfig.scripts?.["build:android:production:no-wait"],
  "npm --workspace @weatheron/mobile run build:android:production:no-wait",
);

assertNoMobileSecretNames([
  "apps/mobile/app.json",
  "apps/mobile/eas.json",
  "apps/mobile/.env",
  "apps/mobile/.env.local",
  "apps/mobile/src/config/weatherEnv.ts",
]);

if (existsSync(releaseDocPath)) {
  const releaseDoc = readFileSync(releaseDocPath, "utf8");
  assert.ok(releaseDoc.includes("apps/mobile/eas.json"));
  assert.ok(
    releaseDoc.includes(`versionCode=${appConfig.android.versionCode}`) ||
      releaseDoc.includes(`versionCode | \`${appConfig.android.versionCode}\``),
  );
  assert.ok(releaseDoc.includes("Expo/EAS"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_APK_QA_체크리스트.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_STORE_등록자료.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_폐쇄테스트_운영기록.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_WEB_EXPORT_QA.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_DEVICE_QA_SESSION.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_CONTENT_RATING_DRAFT.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md"));
  assert.ok(releaseDoc.includes("weatheron_privacy_policy.html"));
}

assertDocIncludes(apkQaDocPath, ["npm run build:android:preview", "Android Preview APK QA", "WEATHERON_PROXY_SMOKE=1", "WeatherON_ANDROID_WEB_EXPORT_QA.md"]);
assertDocIncludes(storeListingDocPath, ["짧은 설명", "긴 설명 초안", "데이터 보안 초안", "weatheron_privacy_policy.html", "WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md"]);
assertDocIncludes(storeInputsRequiredPath, ["WeatherON Android Store Inputs Required", "개발자 이메일", "개인정보처리방침 URL"]);
assertDocIncludes(storeInputsPacketPath, ["WeatherON Android Store Inputs Packet", "입력 분류", "JSON 입력 템플릿", "검증 규칙", "apply:android-store-inputs"]);
assertDocIncludes(privacyPolicyPacketPath, ["WeatherON Android Privacy Policy Packet", "남은 placeholder", "privacyPolicyUrl", "check:android-store-submit-ready"]);
assertDocIncludes(playUploadPacketPath, ["WeatherON Android Play Upload Packet", "AAB artifact", "Play Console 업로드 순서", "출시 노트 초안"]);
assertDocIncludes(storeInputsExamplePath, ["developerEmail", "privacyPolicyUrl", "operatorName", "logRetentionMonths"]);
assertDocIncludes(storeInputsApplyStatusPath, ["WeatherON Android Store Inputs Apply Status", "입력값 분류", "누락 필드 수", "placeholder 필드 수", "apply:android-store-inputs"]);
assertDocIncludes(storeSafeDefaultsStatusPath, ["WeatherON Android Store Safe Defaults Status", "developerWebsite", "logRetentionMonths", "emailAuthService", "targetAge"]);
assertDocIncludes(localInputFilesStatusPath, ["WeatherON Android Local Input Files Status", "prepare:android-release-local-files", "QA 자동 보정 메타"]);
assertDocIncludes(contentRatingDraftPath, ["WeatherON Android Content Rating Draft", "사용자 생성 콘텐츠", "광고 SDK", "Google Play 콘텐츠 등급"]);
assertDocIncludes(storeScreenshotPlanPath, ["WeatherON Android Store Screenshot Plan", "phone-01-home.png", "1080x1920", "Google Play preview assets", "capture:android-store-screenshot", "앱 내 이동", "manifest.json", "sourceBuildId"]);
assertDocIncludes(storeScreenshotStatusPath, ["WeatherON Android Store Screenshot Status", "manifest", "준비 완료 파일", "기준 build id", "기준 app version", "manifest.json"]);
assertDocIncludes(storeScreenshotPacketPath, [
  "WeatherON Android Store Screenshot Packet",
  "캡처 목록",
  "screenshot 기준 build",
  "capture:android-store-screenshot",
  "홈/출발/MY",
  "MY > 코디·옷장",
  "ADB 준비 상태",
  "check:android-adb-ready",
  "manifest",
]);
assertDocIncludes(closedTestDocPath, [
  "14일 운영 기록",
  "Production Access 답변 초안",
  "최소 12명 테스터",
  "npm run check:eas-login-state",
  "npm run check:android-local-release-ready",
]);
assertDocIncludes(closedTestPacketPath, ["WeatherON Android Closed Test Packet", "Play Console 계정 유형", "폐쇄 테스트 운영 요구", "14일 운영 기록", "AAB artifact", "apply:android-closed-test-inputs"]);
assertDocIncludes(closedTestStatusPath, ["WeatherON Android Closed Test Status", "issue 수", "check:android-closed-test-ready", "폐쇄 테스트 운영 요구", "테스터 초대", "14일 운영 기록", "사용자 회신 최소 양식"]);
assertDocIncludes(closedTestInputsExamplePath, ["accountType", "closedTestRequired", "testers", "operationDays"]);
assertDocIncludes(closedTestInputsApplyStatusPath, ["WeatherON Android Closed Test Inputs Apply Status", "apply:android-closed-test-inputs"]);
assertDocIncludes(manualActionPacketPath, ["WeatherON Android Manual Action Packet", "실기기 QA 기입표", "스토어 스크린샷 캡처표", "Play 제출 입력값 회신표", "폐쇄 테스트 회신표"]);
assertDocIncludes(releaseEvidenceIndexPath, [
  "WeatherON Android Release Evidence Index",
  "빌드 Artifact",
  "검증 명령 증빙",
  "미완료 수동 범위",
  "스토어 스크린샷 준비",
  "스토어 입력값 적용",
  "스토어 입력값 issue",
  "스토어 입력값 누락 필드",
  "스토어 입력값 placeholder",
  "스토어 입력값 형식/검증 issue",
  "폐쇄 테스트 입력값 적용",
  "폐쇄 테스트 입력값 issue",
  "폐쇄 테스트 운영 요구",
]);
assertDocIncludes(releaseConsistencyStatusPath, [
  "WeatherON Android Release Consistency Status",
  "일치 여부",
  "check:android-release-consistency",
  "screenshot ready count",
  "store input issue count",
  "store input missing field count",
  "store input placeholder count",
  "store input validation issue count",
  "closed test input issue count",
  "closed test operation required",
]);
assertDocIncludes(readinessReportPath, ["Android Release Readiness Report", "npm run build:android:preview", "현재 차단"]);
assertDocIncludes(previewPreflightStatusPath, ["WeatherON Android Preview Preflight Status", "Native applicationId", "npm run check:android-preview-preflight"]);
assertDocIncludes(releaseActionBoardPath, [
  "WeatherON Android Release Action Board",
  "실기기 QA",
  "스토어 스크린샷",
  "스토어 스크린샷 준비",
  "Play 제출 blocker",
  "스토어 입력값 적용",
  "스토어 입력값 issue",
  "스토어 입력값 누락 필드",
  "스토어 입력값 placeholder",
  "local 입력 파일",
  "local 스토어 입력 누락",
  "폐쇄 테스트 입력값 적용",
  "폐쇄 테스트 운영 요구",
  "apply:android-closed-test-inputs",
  "폐쇄 테스트 초대",
]);
assertDocIncludes(storeSubmitBlockersPath, ["Android Store Submission Blockers", "npm run check:android-store-submit-ready", "Production AAB"]);
assertDocIncludes(externalActionsPath, ["Android 외부 의존 액션 목록", "npm run eas:login", "npm run check:android-store-submit-ready"]);
assertDocIncludes(easLoginStatusPath, ["WeatherON EAS Login Status", "npm run check:eas-login-state"]);
assertDocIncludes(productionBuildStatusPath, ["WeatherON Android Production Build Status", "Profile", "production", "AAB artifact"]);
assertDocIncludes(artifactAccessStatusPath, ["WeatherON Android Artifact Access Status", "preview APK", "production AAB", "check:android-artifact-access"]);
assertDocIncludes(productQualityAuditPath, ["WeatherON Android 제품 완성도 감사", "preview APK", "상태 영속화", "npm run check:android-product-quality", "다음 개선 순서"]);
assertDocIncludes(webExportQaPath, ["WeatherON Android Web Export QA", "In-app browser", "390x844", "Android 실기기 재QA 필요", "WeatherON_ANDROID_WEB_EXPORT_STATUS.md", "WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md", "npm run export:android-web", "npm run check:android-core-flow"]);
assertDocIncludes(webExportStatusPath, ["WeatherON Android Web Export Status", "AppNavigator", "BottomNav", "bottomNavRoutes", "preview-shell", "legacy dist-web", "npm run export:android-web"]);
assertDocIncludes(webPreviewServerStatusPath, ["WeatherON Android Web Preview Server Status", "8094", "apps/mobile/dist/index.html", "홈/출발/MY", "check:android-web-preview-server"]);
assertDocIncludes(mapProviderCostComparisonPath, ["WeatherON Map Provider Cost Comparison", "Google Maps Geocoding 우선", "Mapbox", "비용 절감 대안", "Mapbox 키는 대안 PoC가 확정되기 전까지 발급하지 않는다"]);
assertDocIncludes(deviceQaSessionPath, [
  "WeatherON Android Device QA Session",
  "EAS build id",
  "APK artifact",
  "D1",
  "D12",
  "D4-1",
  "홈/출발/MY",
  "코디·옷장",
  "check:android-core-flow",
  "apply:android-device-qa-results",
]);
assertDocIncludes(deviceQaPacketPath, ["WeatherON Android Device QA Packet", "APK artifact", "D1", "D12", "sync:android-device-qa-env", "apply:android-device-qa-results"]);
assertDocIncludes(deviceQaResultsExamplePath, ["easBuildId", "appVersion", "D1", "D12", "result", "memo"]);
assertDocIncludes(deviceQaApplyStatusPath, ["WeatherON Android Device QA Apply Status", "기대 build id", "기대 app version", "apply:android-device-qa-results"]);
assertDocIncludes(deviceQaEnvSyncStatusPath, ["WeatherON Android Device QA Env Sync Status", "sync:android-device-qa-env", "network"]);
assertDocIncludes(adbStatusPath, ["WeatherON Android ADB Status", "check:android-adb-ready", "ADB devices"]);
assertDocIncludes(installStatusPath, ["WeatherON Android Install Status", "install:android-preview-apk", "APK artifact"]);
assertDocIncludes(privacyPolicyHtmlPath, ["WeatherON 개인정보처리방침", "Google Play 제출용 공개 페이지 초안", "개인정보 보호책임자"]);
assertPngDimensions(androidAppIconPath, 512, 512);
assertPngDimensions(androidFeatureGraphicPath, 1024, 500);
assertDocIncludes(androidStoreAssetsManifestPath, ["android-app-icon-512", "512", "android-feature-graphic-v1", "1024", "500"]);

console.log("android release config check passed");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertAssetExists(assetPath, label) {
  assert.ok(assetPath, `${label} must be configured`);
  const absolutePath = resolve(mobileDir, assetPath);
  assert.ok(existsSync(absolutePath), `${label} asset does not exist: ${assetPath}`);
}

function assertDocIncludes(path, snippets) {
  assert.ok(existsSync(path), `required doc is missing: ${path}`);
  const text = readFileSync(path, "utf8");
  for (const snippet of snippets) {
    assert.ok(text.includes(snippet), `${path} must include: ${snippet}`);
  }
}

function assertPngDimensions(path, expectedWidth, expectedHeight) {
  assert.ok(existsSync(path), `required PNG is missing: ${path}`);
  const buffer = readFileSync(path);
  assert.equal(buffer.toString("ascii", 1, 4), "PNG", `${path} must be a PNG file`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  assert.equal(width, expectedWidth, `${path} width must be ${expectedWidth}`);
  assert.equal(height, expectedHeight, `${path} height must be ${expectedHeight}`);
}

function assertNoMobileSecretNames(paths) {
  const forbiddenNames = [
    "KMA_SERVICE_KEY",
    "KAKAO_REST_API_KEY",
    "GOOGLE_MAPS_API_KEY",
    "GOOGLE_GEOCODING_API_KEY",
  ];

  for (const relativePath of paths) {
    const absolutePath = join(rootDir, relativePath);
    if (!existsSync(absolutePath)) continue;
    const text = readFileSync(absolutePath, "utf8");
    for (const forbiddenName of forbiddenNames) {
      assert.ok(
        !text.includes(forbiddenName),
        `${forbiddenName} must stay server-only and must not appear in ${relativePath}`,
      );
    }
  }
}
