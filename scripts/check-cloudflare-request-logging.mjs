import assert from "node:assert/strict";
import fs from "node:fs";

const config = fs.readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8");
const serverSources = [
  "authCore.mjs",
  "departurePushCore.mjs",
  "integrityCore.mjs",
  "oauthCore.mjs",
  "proxyCore.mjs",
  "wardrobeCore.mjs",
  "worker.mjs",
].map((name) => fs.readFileSync(new URL(`../apps/server/src/${name}`, import.meta.url), "utf8")).join("\n");

assert.match(
  config,
  /\[observability\][\s\S]*?redact_query_string\s*=\s*true/u,
  "Cloudflare observability must redact URL query strings before deployment",
);
assert.match(
  config,
  /\[observability\.logs\][\s\S]*?invocation_logs\s*=\s*false/u,
  "Cloudflare invocation logs must be disabled because request URLs contain coordinates",
);
assert.doesNotMatch(
  serverSources,
  /console\.(?:log|info|warn|error)\([^\n]*(?:request\.url|url\.href|url\.search)/u,
  "Server logs must not emit request URLs or query strings",
);

console.log("Cloudflare request logging check passed: invocation URLs disabled, query strings redacted, server URL logging absent");
