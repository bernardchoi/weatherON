import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const projectPath = "apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj";
const hookPath = "apps/mobile/ios/ci_scripts/ci_pre_xcodebuild.sh";
const read = (path) => readFileSync(join(root, path), "utf8");
const project = read(projectPath);
const hook = read(hookPath);
const noUnsignedOverrides = (source) => assert.doesNotMatch(source,
  /CODE_SIGNING_(?:ALLOWED|REQUIRED)["']?\s*(?:=|:)\s*["']?(?:NO|false|0)\b/i,
  "App/extension release signing must not be disabled");

noUnsignedOverrides(hook);
for (const [id, entitlements] of [
  ["13B07F951A680F5B00A75B9A", "WeatherON/WeatherONRelease.entitlements"],
  ["04C57CCC2C0F08A506196E75", "WeatherONWidget/WeatherONWidget.entitlements"],
]) {
  const start = project.indexOf(`${id} /* Release */ = {`);
  assert.ok(start >= 0, `Missing Release configuration ${id}`);
  const end = project.indexOf("name = Release;", start);
  assert.ok(end > start);
  const configuration = project.slice(start, end);
  noUnsignedOverrides(configuration);
  assert.match(configuration, /CODE_SIGN_STYLE = Automatic;/);
  assert.ok(configuration.includes(`CODE_SIGN_ENTITLEMENTS = ${entitlements};`));
  assert.match(read(`apps/mobile/ios/${entitlements}`),
    /<key>com\.apple\.security\.application-groups<\/key>\s*<array>\s*<string>group\.com\.weatheron\.mobile<\/string>\s*<\/array>/);
}

// Run the real hook against an isolated copy; never point it at the checkout.
// Synthetic service values are only input validation fixtures: no API is called.
const directory = mkdtempSync(join(tmpdir(), "weatheron-release-signing-"));
try {
  const fixtureProject = join(directory, projectPath);
  const fixtureHook = join(directory, hookPath);
  mkdirSync(dirname(fixtureProject), { recursive: true });
  mkdirSync(dirname(fixtureHook), { recursive: true });
  writeFileSync(fixtureHook, hook);
  const valid = {
    CI_XCODE_CLOUD: "TRUE",
    EXPO_PUBLIC_WEATHER_CLIENT: "proxy",
    EXPO_PUBLIC_WEATHER_API_BASE_URL: "https://example.invalid",
    EXPO_PUBLIC_WEATHER_API_TOKEN: "synthetic-signing-check-token",
  };
  const cases = [
    ["outside Cloud", { CI_XCODE_CLOUD: "FALSE" }, 0],
    ["valid Cloud", valid, 0],
    ["missing client", { ...valid, EXPO_PUBLIC_WEATHER_CLIENT: "" }, 1],
    ["wrong client", { ...valid, EXPO_PUBLIC_WEATHER_CLIENT: "fixture" }, 1],
    ["missing URL", { ...valid, EXPO_PUBLIC_WEATHER_API_BASE_URL: "" }, 1],
    ["HTTP URL", { ...valid, EXPO_PUBLIC_WEATHER_API_BASE_URL: "http://example.invalid" }, 1],
    ["missing token", { ...valid, EXPO_PUBLIC_WEATHER_API_TOKEN: "" }, 1],
  ];
  for (const [label, env, expected] of cases) {
    writeFileSync(fixtureProject, project);
    const result = spawnSync("sh", [fixtureHook], {
      cwd: directory,
      env: { PATH: process.env.PATH, CI_PRIMARY_REPOSITORY_PATH: directory, ...env },
      encoding: "utf8",
      timeout: 10_000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, expected, `${label}: unexpected hook status`);
    assert.equal(readFileSync(fixtureProject, "utf8"), project,
      `${label}: hook changed project settings`);
    assert.ok(!(result.stdout + result.stderr).includes(valid.EXPO_PUBLIC_WEATHER_API_TOKEN),
      `${label}: hook exposed the token`);
    if (label === "valid Cloud") assert.match(result.stdout, /production environment is configured/);
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
console.log("iOS release signing: source contracts and isolated hook environment checks passed (no Xcode, signing, build or IPA verification).");
