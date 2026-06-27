import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const rootDir = process.cwd();
const mobileDir = join(rootDir, "apps/mobile");

const appJsonPath = join(mobileDir, "app.json");
const easJsonPath = join(mobileDir, "eas.json");
const packageJsonPath = join(rootDir, "package.json");
const mobilePackageJsonPath = join(mobileDir, "package.json");
const releaseDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_출시_준비_프로세스.md");
const apkQaDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_APK_QA_체크리스트.md");
const storeListingDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_등록자료.md");
const closedTestDocPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md");
const readinessReportPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_RELEASE_READINESS_REPORT.md");
const storeSubmitBlockersPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md");
const externalActionsPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_EXTERNAL_ACTIONS.md");
const easLoginStatusPath = join(rootDir, "docs/architecture/WeatherON_EAS_LOGIN_STATUS.md");
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
assert.equal(Number.isInteger(appConfig.android?.versionCode), true);
assert.ok(appConfig.android.versionCode >= 1);
assert.ok(appConfig.android.permissions.includes("ACCESS_COARSE_LOCATION"));
assert.ok(appConfig.android.permissions.includes("ACCESS_FINE_LOCATION"));
assertAssetExists(appConfig.icon, "expo.icon");
assertAssetExists(appConfig.splash?.image, "expo.splash.image");
assertAssetExists(appConfig.android.adaptiveIcon?.foregroundImage, "android.adaptiveIcon.foregroundImage");

assert.equal(easConfig.cli?.appVersionSource, "local");
assert.equal(easConfig.build?.development?.developmentClient, true);
assert.equal(easConfig.build?.development?.distribution, "internal");
assert.equal(easConfig.build?.development?.android?.buildType, "apk");
assert.equal(easConfig.build?.preview?.distribution, "internal");
assert.equal(easConfig.build?.preview?.android?.buildType, "apk");
assert.equal(easConfig.build?.production?.android?.buildType, "app-bundle");

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
  mobilePackageConfig.scripts?.["build:android:production"],
  "npx --yes --cache ../../.npm-cache eas-cli build --platform android --profile production",
);
assert.equal(packageConfig.scripts?.["check:android-release"], "node scripts/check-android-release-config.mjs");
assert.equal(packageConfig.scripts?.["check:android-build-ready"], "node scripts/check-android-build-ready.mjs");
assert.equal(packageConfig.scripts?.["check:android-local-release-ready"], "node scripts/check-android-local-release-ready.mjs");
assert.equal(packageConfig.scripts?.["check:android-store-submit-ready"], "node scripts/check-android-store-submit-ready.mjs");
assert.equal(packageConfig.scripts?.["check:eas-login-state"], "node scripts/check-eas-login-state.mjs");
assert.equal(packageConfig.scripts?.["build:android-store-assets"], "node scripts/build-android-store-assets.mjs");
assert.equal(packageConfig.scripts?.["report:android-release-readiness"], "node scripts/generate-android-release-readiness-report.mjs");
assert.equal(packageConfig.scripts?.["eas:login"], "npm --workspace @weatheron/mobile run eas:login");
assert.equal(packageConfig.scripts?.["eas:whoami"], "npm --workspace @weatheron/mobile run eas:whoami");
assert.equal(packageConfig.scripts?.["eas:init"], "npm --workspace @weatheron/mobile run eas:init");
assert.equal(
  packageConfig.scripts?.["build:android:preview"],
  "npm --workspace @weatheron/mobile run build:android:preview",
);
assert.equal(
  packageConfig.scripts?.["build:android:production"],
  "npm --workspace @weatheron/mobile run build:android:production",
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
  assert.ok(releaseDoc.includes("versionCode=1") || releaseDoc.includes("versionCode | `1`"));
  assert.ok(releaseDoc.includes("Expo/EAS"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_APK_QA_체크리스트.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_STORE_등록자료.md"));
  assert.ok(releaseDoc.includes("WeatherON_ANDROID_폐쇄테스트_운영기록.md"));
  assert.ok(releaseDoc.includes("weatheron_privacy_policy.html"));
}

assertDocIncludes(apkQaDocPath, ["npm run build:android:preview", "Android Preview APK QA", "WEATHERON_PROXY_SMOKE=1"]);
assertDocIncludes(storeListingDocPath, ["짧은 설명", "긴 설명 초안", "데이터 보안 초안", "weatheron_privacy_policy.html"]);
assertDocIncludes(closedTestDocPath, [
  "14일 운영 기록",
  "Production Access 답변 초안",
  "최소 12명 테스터",
  "npm run check:eas-login-state",
  "npm run check:android-local-release-ready",
]);
assertDocIncludes(readinessReportPath, ["Android Release Readiness Report", "npm run build:android:preview", "Expo/EAS 로그인 필요"]);
assertDocIncludes(storeSubmitBlockersPath, ["Android Store Submission Blockers", "npm run check:android-store-submit-ready"]);
assertDocIncludes(externalActionsPath, ["Android 외부 의존 액션 목록", "npm run eas:login", "npm run check:android-store-submit-ready"]);
assertDocIncludes(easLoginStatusPath, ["WeatherON EAS Login Status", "npm run check:eas-login-state"]);
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
