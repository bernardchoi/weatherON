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
const domesticPlaceCases = [
  {
    label: "KR primary stadium keyword",
    query: "잠실",
    countryCode: "KR",
    expectedCountryCode: "KR",
    allowedProviders: ["kakao", "fixture"],
  },
  {
    label: "KR primary stadium alias",
    query: "잠실 야구장",
    countryCode: "KR",
    expectedCountryCode: "KR",
    allowedProviders: ["kakao", "fixture"],
  },
];

const overseasPlaceCases = [
  {
    label: "JP English station",
    query: "Tokyo Station",
    expectedCountryCode: "JP",
    allowedProviders: ["google", "fixture"],
    expectGoogleWhenKey: true,
  },
  {
    label: "JP Korean spaced station",
    query: "도쿄 역",
    language: "ja",
    expectedCountryCode: "JP",
    allowedProviders: ["google", "fixture"],
  },
  {
    label: "JP local-language station",
    query: "東京駅",
    language: "ja",
    expectedCountryCode: "JP",
    allowedProviders: ["google", "fixture"],
  },
  {
    label: "GLOBAL Korean Marina Bay alias",
    query: "마리나 베이",
    language: "ko",
    expectedCountryCode: "GLOBAL",
    allowedProviders: ["google", "fixture"],
  },
];

const server = spawn(process.execPath, ["apps/server/src/index.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, WEATHER_SERVER_HOST: host, WEATHER_SERVER_PORT: port },
  stdio: ["ignore", "pipe", "pipe"],
});

try {
  await waitForHealth(`${baseUrl}/health`);
  console.log("place search priority 1: domestic KR destination search and route");
  for (const testCase of domesticPlaceCases) {
    const results = await fetchPlaceResults(testCase);
    assertSelectablePlaceResults(results, testCase);
  }

  const route = await fetchJson(
    `${baseUrl}/routes/estimate?origin=37.5446,127.0557&destination=37.5122,127.0719&originName=%EC%84%B1%EC%88%98&destinationName=%EC%9E%A0%EC%8B%A4%EC%A2%85%ED%95%A9%EC%9A%B4%EB%8F%99%EC%9E%A5`,
  );
  assert.ok(route.travelMinutes > 0, "route estimate should include travel minutes");
  assert.ok(route.distanceMeters >= 0, "route estimate should include distance");
  assert.ok(["kakao", "fallback"].includes(route.provider), "route estimate should use kakao or fallback provider");

  console.log("place search priority 2: overseas destination search and route fallback");
  const googleKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_GEOCODING_API_KEY;
  for (const testCase of overseasPlaceCases) {
    const results = await fetchPlaceResults(testCase);
    assertSelectablePlaceResults(results, testCase);
    if (testCase.expectGoogleWhenKey && googleKey) {
      assert.equal(results[0].provider, "google", `${testCase.label} should use google when key exists`);
    }
  }

  if (googleKey) {
    const global = await fetchJson(`${baseUrl}/places/search?q=Tokyo%20Station&countryCode=JP`);
    assert.ok(global.length > 0, "global place search should return results");
    assert.equal(global[0].provider, "google");

    const koreanTokyo = await fetchJson(`${baseUrl}/places/search?q=%EB%8F%84%EC%BF%84%EC%97%AD&language=ko`);
    assert.ok(koreanTokyo.length > 0, "Korean Tokyo query should return results");
    assert.equal(koreanTokyo[0].countryCode, "JP");
    assert.equal(koreanTokyo[0].provider, "google");

    const englishTokyo = await fetchJson(`${baseUrl}/places/search?q=%EB%8F%84%EC%BF%84%EC%97%AD&language=en`);
    assert.ok(englishTokyo.length > 0, "Korean Tokyo query with English device language should return results");
    assert.equal(englishTokyo[0].countryCode, "JP");
    assert.equal(englishTokyo[0].provider, "google");
  }

  const tokyoRoute = await fetchJson(
    `${baseUrl}/routes/estimate?origin=37.5446,127.0557&destination=35.6812,139.7671&originName=%EC%84%B1%EC%88%98&destinationName=Tokyo&originCountryCode=KR&destinationCountryCode=JP`,
  );
  assert.ok(tokyoRoute.travelMinutes > 0, "Tokyo route estimate should include travel minutes");
  assert.ok(tokyoRoute.distanceMeters >= 0, "Tokyo route estimate should include distance");
  assert.equal(tokyoRoute.provider, "fallback");
  assert.equal(tokyoRoute.travelMinutes, 150, "cross-country fallback should use international default minutes");
  assert.match(tokyoRoute.message, /해외 목적지 기본 이동시간/);

  if (googleKey) {
    const tokyoLocalRoute = await fetchJson(
      `${baseUrl}/routes/estimate?origin=35.6812,139.7671&destination=35.6580,139.7016&originName=Tokyo%20Station&destinationName=Shibuya&originCountryCode=JP&destinationCountryCode=JP`,
    );
    assert.ok(tokyoLocalRoute.travelMinutes > 0, "Tokyo local route estimate should include travel minutes");
    assert.ok(tokyoLocalRoute.distanceMeters >= 0, "Tokyo local route estimate should include distance");
    assert.equal(tokyoLocalRoute.provider, "google");
  }

  console.log("place search smoke passed");
} finally {
  server.kill("SIGTERM");
}

async function fetchPlaceResults(testCase) {
  const url = new URL("/places/search", baseUrl);
  url.searchParams.set("q", testCase.query);
  if (testCase.countryCode) url.searchParams.set("countryCode", testCase.countryCode);
  if (testCase.language) url.searchParams.set("language", testCase.language);
  return fetchJson(url.toString());
}

function assertSelectablePlaceResults(results, testCase) {
  assert.ok(Array.isArray(results), `${testCase.label} should return an array`);
  assert.ok(results.length > 0, `${testCase.label} should return results`);
  const first = results[0];
  assert.equal(first.countryCode, testCase.expectedCountryCode, `${testCase.label} country mismatch`);
  assert.ok(testCase.allowedProviders.includes(first.provider), `${testCase.label} provider unexpected: ${first.provider}`);
  assert.ok(first.id && typeof first.id === "string", `${testCase.label} result id missing`);
  assert.ok(first.name && typeof first.name === "string", `${testCase.label} result name missing`);
  assert.ok(first.address && typeof first.address === "string", `${testCase.label} result address missing`);
  assert.ok(first.category && typeof first.category === "string", `${testCase.label} result category missing`);
  assert.ok(first.timezone && typeof first.timezone === "string", `${testCase.label} result timezone missing`);
  assert.ok(Number.isFinite(first.coordinate?.latitude), `${testCase.label} latitude missing`);
  assert.ok(Number.isFinite(first.coordinate?.longitude), `${testCase.label} longitude missing`);
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
