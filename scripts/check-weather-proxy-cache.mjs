import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { createServer } from "node:http";
import { kmaForecastFixture, openMeteoFixture, weatherKitFixture } from "../packages/shared/src/fixtures/weatherApiFixtures.ts";

const upstreamHost = "127.0.0.1";
const upstreamPort = 19092;
const proxyHost = "127.0.0.1";
const proxyPort = 19091;
let kmaRequestCount = 0;
let weatherKitRequestCount = 0;
let kakaoTransitRequestCount = 0;
let googleTransitRequestCount = 0;
const { privateKey: weatherKitPrivateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const weatherKitPrivateKeyPem = weatherKitPrivateKey.export({ type: "pkcs8", format: "pem" });

const upstream = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${upstreamHost}:${upstreamPort}`}`);
  if (url.pathname === "/kma") {
    kmaRequestCount += 1;
    if (kmaRequestCount === 1) {
      sendJson(response, 200, { response: { body: { items: { item: kmaForecastFixture } } } });
      return;
    }
    sendText(response, 429, "API rate limit exceeded");
    return;
  }
  if (url.pathname === "/openmeteo") {
    sendJson(response, 200, openMeteoFixture);
    return;
  }
  if (url.pathname.startsWith("/weatherkit/")) {
    weatherKitRequestCount += 1;
    assert.ok(request.headers.authorization?.startsWith("Bearer "));
    assert.equal(url.searchParams.get("dataSets"), "currentWeather,forecastHourly,forecastDaily");
    sendJson(response, 200, weatherKitFixture);
    return;
  }
  if (url.pathname === "/kakao-transit") {
    kakaoTransitRequestCount += 1;
    assert.ok(request.headers.authorization?.startsWith("KakaoAK "));
    assert.equal(url.searchParams.get("start_x"), "127.0559");
    assert.equal(url.searchParams.get("end_x"), "126.9769");
    sendJson(response, 200, {
      status: "OK",
      routes: [
        { properties: { totalTime: 3300, totalDistance: 18500, type: "SUBWAY", transfers: 1 } },
        { properties: { totalTime: 3900, totalDistance: 21000, type: "BUS_AND_SUBWAY", transfers: 2 } },
      ],
    });
    return;
  }
  if (url.pathname === "/google-distance") {
    googleTransitRequestCount += 1;
    assert.equal(url.searchParams.get("mode"), "transit");
    assert.ok(url.searchParams.get("arrival_time"));
    sendJson(response, 200, {
      status: "OK",
      rows: [
        {
          elements: [
            {
              status: "OK",
              duration: { value: 2760 },
              distance: { value: 14200 },
            },
          ],
        },
      ],
    });
    return;
  }
  sendJson(response, 404, { error: "not_found" });
});

await listen(upstream, upstreamPort, upstreamHost);

const proxy = spawn(process.execPath, ["apps/server/src/index.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    WEATHER_SERVER_HOST: proxyHost,
    WEATHER_SERVER_PORT: String(proxyPort),
    PROXY_ACCESS_TOKEN: "",
    WEATHER_TIMEOUT_MS: "3000",
    WEATHER_CACHE_TTL_MS: "1",
    KMA_SERVICE_KEY: "decoded-test-key",
    KMA_FORECAST_URL: `http://${upstreamHost}:${upstreamPort}/kma`,
    OPEN_METEO_FORECAST_URL: `http://${upstreamHost}:${upstreamPort}/openmeteo`,
    KAKAO_REST_API_KEY: "test-kakao-key",
    KAKAO_PUBLIC_TRANSIT_URL: `http://${upstreamHost}:${upstreamPort}/kakao-transit`,
    GOOGLE_MAPS_API_KEY: "test-google-key",
    GOOGLE_DISTANCE_MATRIX_URL: `http://${upstreamHost}:${upstreamPort}/google-distance`,
    WEATHERKIT_WEATHER_URL: `http://${upstreamHost}:${upstreamPort}/weatherkit`,
    WEATHERKIT_TEAM_ID: "TEAM123456",
    WEATHERKIT_SERVICE_ID: "com.weatheron.test.weatherkit",
    WEATHERKIT_KEY_ID: "KEY1234567",
    WEATHERKIT_PRIVATE_KEY: weatherKitPrivateKeyPem,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

try {
  await waitForHealth(`http://${proxyHost}:${proxyPort}/health`);
  const firstKma = await fetchJson(`http://${proxyHost}:${proxyPort}/weather/kma?nx=61&ny=125`);
  assert.equal(firstKma.response?.body?.items?.item?.[0]?.category, "TMP");

  await new Promise((resolve) => setTimeout(resolve, 10));
  const fallbackKma = await fetchJson(`http://${proxyHost}:${proxyPort}/weather/kma?nx=61&ny=125`);
  assert.equal(fallbackKma.response?.body?.items?.item?.[0]?.category, "TMP");
  assert.equal(kmaRequestCount, 2);

  const openMeteo = await fetchJson(`http://${proxyHost}:${proxyPort}/weather/openmeteo?latitude=37.7715&longitude=128.9483`);
  assert.ok(openMeteo.current);
  const weatherKit = await fetchJson(`http://${proxyHost}:${proxyPort}/weather/weatherkit?latitude=37.7715&longitude=128.9483&timezone=Asia%2FSeoul&countryCode=KR`);
  assert.ok(weatherKit.currentWeather);
  assert.equal(weatherKitRequestCount, 1);
  const kakaoTransit = await fetchJson(
    `http://${proxyHost}:${proxyPort}/routes/estimate?origin=37.5446,127.0559&destination=37.5665,126.9769&originCountryCode=KR&destinationCountryCode=KR&transportMode=transit`,
  );
  assert.equal(kakaoTransit.provider, "kakao-transit");
  assert.equal(kakaoTransit.travelMinutes, 55);
  assert.equal(kakaoTransitRequestCount, 1);
  const googleTransit = await fetchJson(
    `http://${proxyHost}:${proxyPort}/routes/estimate?origin=35.6812,139.7671&destination=35.6580,139.7016&originCountryCode=JP&destinationCountryCode=JP&transportMode=transit&arrivalTime=2026-07-23T23%3A45%3A00.000Z`,
  );
  assert.equal(googleTransit.provider, "google-transit");
  assert.equal(googleTransit.travelMinutes, 46);
  assert.equal(googleTransitRequestCount, 1);
  console.log("weather proxy cache check passed");
} finally {
  proxy.kill("SIGTERM");
  await close(upstream);
}

function listen(server, port, host) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
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
      await new Promise((resolve) => setTimeout(resolve, 150));
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

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text) {
  response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  response.end(text);
}
