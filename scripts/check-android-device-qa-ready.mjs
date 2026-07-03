import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const apkQaPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_APK_QA_체크리스트.md");
const sessionPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md");
const buildStatusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_BUILD_STATUS.md");
const packetPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_PACKET.md");

assert.ok(existsSync(apkQaPath), "APK QA checklist is missing");
assert.ok(existsSync(sessionPath), "Android device QA session doc is missing");
assert.ok(existsSync(buildStatusPath), "Android build status doc is missing");
assert.ok(existsSync(packetPath), "Android device QA packet is missing");

const apkQa = readFileSync(apkQaPath, "utf8");
const session = readFileSync(sessionPath, "utf8");
const buildStatusDoc = readFileSync(buildStatusPath, "utf8");
const packet = readFileSync(packetPath, "utf8");
const appConfig = JSON.parse(readFileSync(join(rootDir, "apps/mobile/app.json"), "utf8")).expo;
const sourceVersion = `${appConfig.version} (${appConfig.android.versionCode})`;

const buildId = tableValue(buildStatusDoc, "EAS build id").replaceAll("`", "");
const buildStatus = tableValue(buildStatusDoc, "Build 상태").replaceAll("`", "");
const artifact = tableValue(buildStatusDoc, "APK artifact");
const packetBuildId = tableValue(packet, "EAS build id").replaceAll("`", "");
const packetBuildStatus = tableValue(packet, "Build 상태").replaceAll("`", "");
const packetVersion = tableValue(packet, "Version").replaceAll("`", "");
const packetSourceVersion = tableValue(packet, "소스 기준 Version").replaceAll("`", "");
const packetArtifact = tableValue(packet, "APK artifact").replaceAll("`", "");

if (packetBuildId === "N/A - local Gradle release APK") {
  assert.equal(packetBuildStatus, "LOCAL BUILD SUCCESS");
  assert.equal(packetVersion, sourceVersion);
  assert.equal(packetSourceVersion, sourceVersion);
  assert.equal(packetArtifact, "apps/mobile/android/app/build/outputs/apk/release/app-release.apk");
} else {
  assert.match(buildId, /^[0-9a-f-]{36}$/);
  assert.equal(buildStatus, "FINISHED");
  assert.match(artifact, /^https:\/\/expo\.dev\/artifacts\/eas\/.+\.apk$/);
  assert.equal(packetBuildId, buildId, "device QA packet must target latest build status id");
  assert.ok(packet.includes(artifact), "device QA packet must include latest APK artifact URL");
}

for (const snippet of [
  packetBuildId === "N/A - local Gradle release APK" ? sourceVersion : buildId,
  packetBuildId === "N/A - local Gradle release APK" ? packetArtifact : artifact,
  "EAS archive 업로드",
  "62.6 MB",
  "D1",
  "D13",
  "D9 목적지 검색 상세 케이스",
  "Tokyo Station",
  "도쿄 역",
  "東京駅",
  "센트럴 파크",
  "앱 화면 문구로 노출하지 않는다",
  "D13 알림 신뢰성 상세 케이스",
  "테스트 알림",
  "5초 내 시스템 알림 수신",
  "알림 탭",
  "M2 알림 설정으로 이동",
  "내부 문구 노출",
  "상태 저장",
  "Android 뒤로가기",
  "WeatherON_ANDROID_APK_QA_체크리스트.md",
]) {
  assert.ok(packet.includes(snippet) || session.includes(snippet), `device QA docs must include: ${snippet}`);
}

console.log("android device QA ready check passed");

function tableValue(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  assert.ok(match, `missing table row: ${label}`);
  return match[1].trim();
}
