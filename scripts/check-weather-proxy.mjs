import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

loadEnvFile(join(process.cwd(), "apps/server/.env.local"));
loadEnvFile(join(process.cwd(), "apps/server/.env"));
loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

if (process.env.WEATHERON_PROXY_SMOKE !== "1") {
  console.log("weather proxy smoke skipped: set WEATHERON_PROXY_SMOKE=1 to run");
  process.exit(0);
}

assert.ok(process.env.KMA_SERVICE_KEY, "KMA_SERVICE_KEY is required for proxy smoke");

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
  const [kmaResponse, openMeteoResponse, placeResponse] = await Promise.all([
    fetchJson(`${baseUrl}/weather/kma?nx=61&ny=125`),
    fetchJson(`${baseUrl}/weather/openmeteo?latitude=37.7715&longitude=128.9483&timezone=Asia%2FSeoul`),
    fetchJson(`${baseUrl}/places/search?q=%EA%B0%95%EB%A6%89&countryCode=KR`),
  ]);
  assert.ok(kmaResponse.response?.body?.items?.item?.length > 0);
  assert.ok(openMeteoResponse.current);
  assert.ok(Array.isArray(placeResponse) && placeResponse.length > 0);
  assert.ok(["kakao", "fixture", "google"].includes(placeResponse[0]?.provider));
  assert.equal(placeResponse[0]?.countryCode, "KR");
  console.log("weather proxy smoke passed");
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
  throw lastError ?? new Error("weather proxy health check timed out");
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
