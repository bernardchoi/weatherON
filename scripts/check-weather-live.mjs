import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

loadEnvFile(join(process.cwd(), "apps/server/.env.local"));
loadEnvFile(join(process.cwd(), "apps/server/.env"));
loadEnvFile(join(process.cwd(), "apps/mobile/.env.local"));
loadEnvFile(join(process.cwd(), "apps/mobile/.env"));

if (process.env.WEATHERON_LIVE_SMOKE !== "1") {
  console.log("weather live smoke skipped: set WEATHERON_LIVE_SMOKE=1 to run");
  process.exit(0);
}

assert.ok(process.env.KMA_SERVICE_KEY, "KMA_SERVICE_KEY is required for live smoke");

const outDir = join(process.cwd(), ".tmp-weather-live-check");
const entry = join(outDir, "weather-live-entry.ts");
const bundled = join(outDir, "weather-live-bundle.mjs");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await writeFile(
  entry,
  `
    import { createHttpWeatherClient } from "../apps/mobile/src/providers/weatherClient.ts";
    import { normalizeKmaWeather, normalizeOpenMeteoWeather } from "../packages/shared/src/index.ts";

    const client = createHttpWeatherClient({
      kmaServiceKey: process.env.KMA_SERVICE_KEY,
      kmaForecastUrl: process.env.EXPO_PUBLIC_KMA_FORECAST_URL,
      openMeteoForecastUrl: process.env.EXPO_PUBLIC_OPEN_METEO_FORECAST_URL,
      timeoutMs: Math.max(Number(process.env.EXPO_PUBLIC_WEATHER_TIMEOUT_MS) || 0, 10000),
    });

    const [kmaPayload, openMeteoPayload] = await Promise.all([
      client.fetchKmaForecast({ nx: 61, ny: 125 }),
      client.fetchOpenMeteoForecast({ latitude: 37.7715, longitude: 128.9483, timezone: "Asia/Seoul" }),
    ]);

    export const result = {
      kma: normalizeKmaWeather(kmaPayload, {
        locationId: "kr-seoul-seongsu",
        locationName: "서울 성수동",
        countryCode: "KR",
        timezone: "+09:00",
      }),
      openmeteo: normalizeOpenMeteoWeather(openMeteoPayload, {
        locationId: "kr-gangneung-beach",
        locationName: "강릉 안목해변",
        countryCode: "KR",
      }),
    };
  `,
);

await build({
  entryPoints: [entry],
  outfile: bundled,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "silent",
});

const { result } = await import(pathToFileURL(bundled).href);
assert.equal(result.kma.source, "kma");
assert.equal(result.openmeteo.source, "openmeteo");
assert.ok(result.kma.hourly.length > 0);
assert.ok(result.openmeteo.hourly.length > 0);

await rm(outDir, { recursive: true, force: true });
console.log("weather live smoke passed");

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
