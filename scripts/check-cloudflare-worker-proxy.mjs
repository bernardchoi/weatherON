import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import worker from "../apps/server/src/worker.mjs";

loadEnvFile(join(process.cwd(), "apps/server/.env.local"));
loadEnvFile(join(process.cwd(), "apps/server/.env"));
loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

const env = {
  PROXY_ACCESS_TOKEN: "",
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

await checkProxyAuthentication();
await checkProxyAuthenticationDiagnostic();
await checkProviderFallbackIsNotCached();

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

async function checkProxyAuthentication() {
  const authEnv = { ...env, PROXY_ACCESS_TOKEN: "test-proxy-token" };
  const unauthorized = await worker.fetch(
    new Request("https://weatheron-api.test/places/search?q=%EC%9E%A0%EC%8B%A4"),
    authEnv,
  );
  assert.equal(unauthorized.status, 401, "missing proxy token should be rejected");

  const queryToken = await worker.fetch(
    new Request("https://weatheron-api.test/places/search?q=%EC%9E%A0%EC%8B%A4&token=test-proxy-token"),
    authEnv,
  );
  assert.equal(queryToken.status, 401, "query-string proxy token should not be accepted");

  const authorized = await worker.fetch(
    new Request("https://weatheron-api.test/places/search?q=%EC%9E%A0%EC%8B%A4", {
      headers: { "x-weatheron-proxy-token": "test-proxy-token" },
    }),
    authEnv,
  );
  assert.equal(authorized.status, 200, "matching proxy token header should be accepted");
  assert.match(
    authorized.headers.get("access-control-allow-headers") ?? "",
    /x-weatheron-proxy-token/i,
    "CORS preflight should allow the proxy token header",
  );
}

async function checkProxyAuthenticationDiagnostic() {
  const diagnosticToken = "test-diagnostic-token";
  const diagnosticTokenDigest = createHash("sha256").update(diagnosticToken).digest("hex");
  const logs = [];
  const originalLog = console.log;
  console.log = (message) => logs.push(String(message));
  try {
    await fetchWorkerJson("/places/search?q=%EC%9E%A0%EC%8B%A4", {
      ...env,
      PROXY_DIAGNOSTIC_TOKEN_SHA256: diagnosticTokenDigest,
      KAKAO_REST_API_KEY: "",
      GOOGLE_MAPS_API_KEY: "",
    }, { "x-weatheron-proxy-token": diagnosticToken });
    await fetchWorkerJson("/routes/estimate?origin=37.5,127.0&destination=37.6,127.1", {
      ...env,
      PROXY_DIAGNOSTIC_TOKEN_SHA256: diagnosticTokenDigest,
      KAKAO_REST_API_KEY: "",
      GOOGLE_MAPS_API_KEY: "",
    }, { "x-weatheron-proxy-token": "wrong-token" });
  } finally {
    console.log = originalLog;
  }

  assert.equal(logs.length, 2, "diagnostic logging should cover only proxy API requests");
  const matched = JSON.parse(logs[0]);
  const mismatched = JSON.parse(logs[1]);
  assert.deepEqual(
    { event: matched.event, path: matched.path, tokenPresent: matched.tokenPresent, tokenMatched: matched.tokenMatched },
    { event: "proxy_auth_diagnostic", path: "/places/search", tokenPresent: true, tokenMatched: true },
  );
  assert.deepEqual(
    { event: mismatched.event, path: mismatched.path, tokenPresent: mismatched.tokenPresent, tokenMatched: mismatched.tokenMatched },
    { event: "proxy_auth_diagnostic", path: "/routes/estimate", tokenPresent: true, tokenMatched: false },
  );
  assert.ok(logs.every((line) => !line.includes(diagnosticToken) && !line.includes("wrong-token")), "token values must not be logged");
}

async function checkProviderFallbackIsNotCached() {
  const originalFetch = globalThis.fetch;
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    if (requestCount === 1) return new Response("provider unavailable", { status: 503 });
    return new Response(
      JSON.stringify({
        documents: [
          {
            id: "recovered-jamsil",
            place_name: "복구된 잠실 장소",
            road_address_name: "서울 송파구 올림픽로",
            address_name: "서울 송파구 잠실동",
            category_name: "스포츠 > 경기장",
            category_group_name: "",
            x: "127.0719",
            y: "37.5122",
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const fallbackEnv = {
    PROXY_ACCESS_TOKEN: "",
    KAKAO_REST_API_KEY: "test-key",
    KAKAO_LOCAL_KEYWORD_URL: "https://kakao.test/places",
    PLACE_CACHE_TTL_MS: "1800000",
    WEATHER_TIMEOUT_MS: "8000",
  };
  try {
    const fallbackPath = "/places/search?q=%EC%9E%A0%EC%8B%A4%20%EC%95%BC%EA%B5%AC%EC%9E%A5";
    const first = await fetchWorkerJson(fallbackPath, fallbackEnv);
    assert.equal(first[0]?.provider, "fixture", "provider failure should return the curated fallback");

    const recovered = await fetchWorkerJson(fallbackPath, fallbackEnv);
    assert.equal(requestCount, 2, "provider fallback must not be cached for the normal TTL");
    assert.ok(recovered.some((place) => place.provider === "kakao"), "the next request should observe provider recovery");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function fetchWorkerJson(path, targetEnv = env, headers) {
  const response = await worker.fetch(new Request(`https://weatheron-api.test${path}`, { headers }), targetEnv);
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
