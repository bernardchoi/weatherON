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

const buildId = tableValue(buildStatusDoc, "EAS build id").replaceAll("`", "");
const buildStatus = tableValue(buildStatusDoc, "Build 상태").replaceAll("`", "");
const artifact = tableValue(buildStatusDoc, "APK artifact");
const packetBuildId = tableValue(packet, "EAS build id").replaceAll("`", "");

assert.match(buildId, /^[0-9a-f-]{36}$/);
assert.equal(buildStatus, "FINISHED");
assert.match(artifact, /^https:\/\/expo\.dev\/artifacts\/eas\/.+\.apk$/);
assert.equal(packetBuildId, buildId, "device QA packet must target latest build status id");
assert.ok(packet.includes(artifact), "device QA packet must include latest APK artifact URL");

for (const snippet of [
  buildId,
  artifact,
  "EAS archive 업로드",
  "62.6 MB",
  "D1",
  "D12",
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
