import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import worker from "../apps/server/src/worker.mjs";

loadEnvFile(join(process.cwd(), "apps/server/.env.local"));
loadEnvFile(join(process.cwd(), "apps/server/.env"));
loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

const env = {
  KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  KMA_SERVICE_KEY: process.env.KMA_SERVICE_KEY,
  WEATHER_TIMEOUT_MS: process.env.WEATHER_TIMEOUT_MS ?? "8000",
  WEATHER_CACHE_TTL_MS: process.env.WEATHER_CACHE_TTL_MS ?? "600000",
  PLACE_CACHE_TTL_MS: process.env.PLACE_CACHE_TTL_MS ?? "1800000",
  ROUTE_CACHE_TTL_MS: process.env.ROUTE_CACHE_TTL_MS ?? "600000",
};

const health = await fetchWorkerJson("/health");
assert.equal(health.ok, true);
assert.equal(health.runtime, "cloudflare-worker");

if (process.env.WEATHERON_WORKER_SMOKE === "1") {
  const domestic = await fetchWorkerJson("/places/search?q=%EC%9E%A0%EC%8B%A4&countryCode=KR&language=ko");
  assert.ok(domestic.length > 0, "domestic place search should return results");
  assert.equal(domestic[0].provider, "kakao", "domestic place search should use Kakao");

  const tokyo = await fetchWorkerJson("/places/search?q=%EB%8F%84%EC%BF%84%EC%97%AD&language=ko");
  assert.ok(tokyo.length > 0, "Korean Tokyo query should return results");
  assert.equal(tokyo[0].countryCode, "JP");
  assert.equal(tokyo[0].provider, "google", "global place search should use Google");

  const route = await fetchWorkerJson(
    "/routes/estimate?origin=35.6812,139.7671&destination=35.6580,139.7016&originName=Tokyo%20Station&destinationName=Shibuya&originCountryCode=JP&destinationCountryCode=JP",
  );
  assert.ok(route.travelMinutes > 0, "route estimate should include travel minutes");
  assert.equal(route.provider, "google", "global route estimate should use Google");
}

console.log("cloudflare worker proxy check passed");

async function fetchWorkerJson(path) {
  const response = await worker.fetch(new Request(`https://weatheron-api.test${path}`), env);
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
