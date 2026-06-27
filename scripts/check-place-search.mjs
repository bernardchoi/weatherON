import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

loadEnvFile(join(process.cwd(), "apps/server/.env.local"));
loadEnvFile(join(process.cwd(), "apps/server/.env"));
loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

if (process.env.WEATHERON_PLACE_SMOKE !== "1") {
  console.log("place search smoke skipped: set WEATHERON_PLACE_SMOKE=1 to run");
  process.exit(0);
}

const host = process.env.WEATHER_SERVER_HOST ?? "127.0.0.1";
const port = String(Number(process.env.WEATHER_SERVER_PORT) || 8091);
const baseUrl = `http://${host}:${port}`;
const server = spawn(process.execPath, ["apps/server/src/index.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, WEATHER_SERVER_HOST: host, WEATHER_SERVER_PORT: port },
  stdio: ["ignore", "pipe", "pipe"],
});

try {
  await waitForHealth(`${baseUrl}/health`);
  const domestic = await fetchJson(`${baseUrl}/places/search?q=%EC%9E%A0%EC%8B%A4&countryCode=KR`);
  assert.ok(domestic.length > 0, "domestic place search should return results");
  assert.ok(["kakao", "fixture"].includes(domestic[0].provider));

  const googleKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_GEOCODING_API_KEY;
  const autoGlobal = await fetchJson(`${baseUrl}/places/search?q=Tokyo%20Station`);
  assert.ok(autoGlobal.length > 0, "auto global place search should return results");
  assert.equal(autoGlobal[0].countryCode, "JP");
  assert.ok(googleKey ? autoGlobal[0].provider === "google" : autoGlobal[0].provider === "fixture");

  if (googleKey) {
    const global = await fetchJson(`${baseUrl}/places/search?q=Tokyo%20Station&countryCode=JP`);
    assert.ok(global.length > 0, "global place search should return results");
    assert.equal(global[0].provider, "google");
  }

  console.log("place search smoke passed");
} finally {
  server.kill("SIGTERM");
}

async function waitForHealth(url) {
  const deadline = Date.now() + 8000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const payload = await fetchJson(url);
      if (payload.ok) return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw lastError ?? new Error("place search health check timed out");
}

async function fetchJson(url) {
  const response = await fetch(url);
  const bodyText = await response.text();
  if (!response.ok) throw new Error(`request failed: ${response.status} ${bodyText.slice(0, 240)}`);
  return JSON.parse(bodyText);
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] ??= value;
  }
}
