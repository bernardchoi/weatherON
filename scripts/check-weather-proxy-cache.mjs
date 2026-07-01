import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { kmaForecastFixture, openMeteoFixture } from "../packages/shared/src/fixtures/weatherApiFixtures.ts";

const upstreamHost = "127.0.0.1";
const upstreamPort = 19092;
const proxyHost = "127.0.0.1";
const proxyPort = 19091;
let kmaRequestCount = 0;

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
  sendJson(response, 404, { error: "not_found" });
});

await listen(upstream, upstreamPort, upstreamHost);

const proxy = spawn(process.execPath, ["apps/server/src/index.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    WEATHER_SERVER_HOST: proxyHost,
    WEATHER_SERVER_PORT: String(proxyPort),
    WEATHER_TIMEOUT_MS: "3000",
    WEATHER_CACHE_TTL_MS: "1",
    KMA_SERVICE_KEY: "decoded-test-key",
    KMA_FORECAST_URL: `http://${upstreamHost}:${upstreamPort}/kma`,
    OPEN_METEO_FORECAST_URL: `http://${upstreamHost}:${upstreamPort}/openmeteo`,
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
