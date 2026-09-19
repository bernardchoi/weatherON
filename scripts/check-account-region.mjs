import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const outputDirectory = "/tmp/weatheron-account-region-check";
const outputFile = `${outputDirectory}/account-region.mjs`;
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await build({
  entryPoints: ["apps/mobile/src/providers/accountRegion.ts"],
  outfile: outputFile,
  bundle: true,
  platform: "node",
  format: "esm",
});
const { resolveAccountButtonLanguage, resolveAccountRegion, orderProvidersForRegion } = await import(`${pathToFileURL(outputFile).href}?v=${Date.now()}`);

assert.equal(resolveAccountButtonLanguage("ko-KR"), "ko");
assert.equal(resolveAccountButtonLanguage("ja_JP"), "ja");
assert.equal(resolveAccountButtonLanguage("en-US"), "en");
assert.equal(resolveAccountButtonLanguage("fr-FR"), "en");
assert.equal(resolveAccountRegion({ locale: "ko-KR", timeZone: "Asia/Tokyo" }), "KR");
assert.equal(resolveAccountRegion({ locale: "ja-JP", timeZone: "Asia/Seoul" }), "JP");
assert.equal(resolveAccountRegion({ locale: "en-US", timeZone: "Asia/Seoul" }), "KR");
assert.equal(resolveAccountRegion({ locale: "en-US", timeZone: "America/New_York" }), "GLOBAL");
assert.deepEqual(orderProvidersForRegion("KR", ["apple", "google", "kakao", "naver"]), ["kakao", "naver", "apple", "google"]);
assert.deepEqual(orderProvidersForRegion("JP", ["apple", "google", "line"]), ["line", "apple", "google"]);
assert.deepEqual(orderProvidersForRegion("GLOBAL", ["apple", "google", "line"]), ["google", "apple", "line"]);

await writeFile(`${outputDirectory}/passed`, "account region check passed\n", "utf8");
console.log("account region check passed");
