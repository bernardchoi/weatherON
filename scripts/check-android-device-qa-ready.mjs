import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const apkQaPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_APK_QA_체크리스트.md");
const sessionPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md");

assert.ok(existsSync(apkQaPath), "APK QA checklist is missing");
assert.ok(existsSync(sessionPath), "Android device QA session doc is missing");

const apkQa = readFileSync(apkQaPath, "utf8");
const session = readFileSync(sessionPath, "utf8");

const buildId = tableValue(apkQa, "QA 대상 EAS build id").replaceAll("`", "");
const buildStatus = tableValue(apkQa, "QA 대상 build 상태").replaceAll("`", "");
const artifact = tableValue(apkQa, "APK artifact");

assert.match(buildId, /^[0-9a-f-]{36}$/);
assert.equal(buildStatus, "FINISHED");
assert.match(artifact, /^https:\/\/expo\.dev\/artifacts\/eas\/.+\.apk$/);

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
  assert.ok(session.includes(snippet), `device QA session must include: ${snippet}`);
}

console.log("android device QA ready check passed");

function tableValue(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`\\|\\s*${escaped}\\s*\\|\\s*([^|]+?)\\s*\\|`));
  assert.ok(match, `missing table row: ${label}`);
  return match[1].trim();
}
