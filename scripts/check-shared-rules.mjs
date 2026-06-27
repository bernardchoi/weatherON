import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const outDir = join(process.cwd(), ".tmp-check");
const entry = join(outDir, "shared-check-entry.ts");
const bundled = join(outDir, "shared-check-bundle.mjs");
const mobileBundle = join(outDir, "mobile-app-bundle.mjs");
const providerEntry = join(outDir, "mobile-provider-check-entry.ts");
const providerBundle = join(outDir, "mobile-provider-check-bundle.mjs");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await writeFile(
  entry,
  `
    import {
      buildDestinationCare,
      convertWgs84ToKmaGrid,
      defaultPreferenceProfile,
      evaluateNotificationRules,
      gangneungClearSnapshot,
      kmaForecastFixture,
      normalizeKmaWeather,
      normalizeOpenMeteoWeather,
      openMeteoFixture,
      presetWardrobe,
      recommendOutfit,
      recommendShoes,
      recommendUmbrella,
      searchFixturePlaces,
      seongsuRainSnapshot,
    } from "../packages/shared/src/index.ts";

    export const results = {
      outfit: recommendOutfit(seongsuRainSnapshot, defaultPreferenceProfile, presetWardrobe),
      umbrella: recommendUmbrella(seongsuRainSnapshot),
      shoes: recommendShoes(seongsuRainSnapshot, "work"),
      destination: buildDestinationCare({
        destinationId: "gangneung-beach",
        name: "강릉 안목해변",
        category: "beach",
        originWeather: seongsuRainSnapshot,
        destinationWeather: gangneungClearSnapshot,
        careOn: true,
        travelMinutes: 180,
        targetArrivalTime: "13:00",
      }),
      notifications: evaluateNotificationRules(seongsuRainSnapshot),
      destinationNotificationsStrict: evaluateNotificationRules(seongsuRainSnapshot, {
        destinationWeather: gangneungClearSnapshot,
        destinationCategory: "beach",
        destinationCareOn: true,
        destinationAlertCondition: { rainThresholdPct: 70, leadTimeMinutes: 120, windThresholdMs: 8 },
      }),
      destinationNotificationsWind: evaluateNotificationRules(seongsuRainSnapshot, {
        destinationWeather: gangneungClearSnapshot,
        destinationCategory: "beach",
        destinationCareOn: true,
        destinationAlertCondition: { rainThresholdPct: 70, leadTimeMinutes: 30, windThresholdMs: 5 },
      }),
      kma: normalizeKmaWeather(kmaForecastFixture, {
        locationId: "kr-seoul-seongsu",
        locationName: "서울 성수동",
        countryCode: "KR",
      }),
      openmeteo: normalizeOpenMeteoWeather(openMeteoFixture, {
        locationId: "kr-gangneung-beach",
        locationName: "강릉 안목해변",
        countryCode: "KR",
      }),
      placeSearchDefault: searchFixturePlaces(""),
      placeSearchSports: searchFixturePlaces("잠실"),
      seoulGrid: convertWgs84ToKmaGrid({ latitude: 37.5665, longitude: 126.978 }),
      seongsuGrid: convertWgs84ToKmaGrid({ latitude: 37.5446, longitude: 127.0559 }),
    };
  `,
);

await writeFile(
  providerEntry,
  `
    import { buildDemoState } from "../apps/mobile/src/data/demoState.ts";
    import { createHttpWeatherClient, fixtureWeatherClient, getKmaForecastBaseDateTime } from "../apps/mobile/src/providers/weatherClient.ts";
    import { createWeatherProvider, fixtureWeatherProvider } from "../apps/mobile/src/providers/weatherProvider.ts";
    import { kmaForecastFixture, openMeteoFixture, searchFixturePlaces } from "../packages/shared/src/index.ts";

    const requestedUrls = [];
    const fakeFetch = async (url) => {
      requestedUrls.push(url);
      const payload = String(url).includes("open-meteo") || String(url).includes("forecast?")
        ? openMeteoFixture
        : { response: { body: { items: { item: kmaForecastFixture } } } };
      return {
        ok: true,
        status: 200,
        json: async () => payload,
        text: async () => JSON.stringify(payload),
      };
    };
    const httpClient = createHttpWeatherClient({
      kmaServiceKey: "decoded-key",
      timeoutMs: 1000,
      fetchImpl: fakeFetch,
    });
    const httpProvider = createWeatherProvider(httpClient);
    const gangneungPlace = searchFixturePlaces("강릉")[0];
    const jamsilPlace = searchFixturePlaces("잠실")[0];
    const toWeatherLocation = (place) => ({
      locationId: place.id,
      locationName: place.name,
      countryCode: place.countryCode,
      coordinate: place.coordinate,
      timezone: place.timezone,
    });

    export const demoResults = {
      current: await buildDemoState(false),
      destination: await buildDemoState(true),
      multiDestination: await buildDemoState(false, "ready", {
        savedDestinations: [
          { place: gangneungPlace, careEnabled: true, alertCondition: { rainThresholdPct: 70, leadTimeMinutes: 120, windThresholdMs: 8 } },
          { place: jamsilPlace, careEnabled: true, alertCondition: { rainThresholdPct: 70, leadTimeMinutes: 30, windThresholdMs: 5 } },
        ],
      }),
      stale: await buildDemoState(false, "stale"),
      fallback: await buildDemoState(false, "fallback"),
      error: await buildDemoState(false, "error"),
      kmaPayload: await fixtureWeatherClient.fetchKmaForecast({ nx: 61, ny: 125 }),
      openMeteoPayload: await fixtureWeatherClient.fetchOpenMeteoForecast({ latitude: 37.77, longitude: 128.94 }),
      readyProvider: await fixtureWeatherProvider.getSnapshots("ready"),
      httpProvider: await httpProvider.getSnapshots("ready"),
      parallelProvider: await httpProvider.getSnapshots("ready", {
        destinationLocation: toWeatherLocation(gangneungPlace),
        destinationLocations: [toWeatherLocation(gangneungPlace), toWeatherLocation(jamsilPlace)],
      }),
      httpUrls: requestedUrls,
      kmaBaseEarly: getKmaForecastBaseDateTime(new Date("2026-06-26T01:59:00+09:00")),
      kmaBaseMorning: getKmaForecastBaseDateTime(new Date("2026-06-26T05:10:00+09:00")),
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

await build({
  entryPoints: ["apps/mobile/App.tsx"],
  outfile: mobileBundle,
  bundle: true,
  platform: "neutral",
  format: "esm",
  jsx: "automatic",
  target: "es2022",
  external: ["react", "react/jsx-runtime", "react-native", "expo-location", "expo-status-bar"],
  logLevel: "silent",
});

await build({
  entryPoints: [providerEntry],
  outfile: providerBundle,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  external: ["react", "react/jsx-runtime", "react-native"],
  logLevel: "silent",
});

const { results } = await import(pathToFileURL(bundled).href);
const { demoResults } = await import(pathToFileURL(providerBundle).href);

assert.equal(results.outfit.variant, "rain");
assert.equal(results.outfit.items.shoes.name, "방수 스니커즈");
assert.ok(results.outfit.reasons.some((reason) => reason.includes("강수확률")));
assert.equal(results.umbrella.level, "required");
assert.equal(results.shoes.level, "recommended");
assert.equal(results.destination.careOn, true);
assert.equal(results.destination.umbrellaAdvice.level, "none");
assert.ok(results.notifications.some((item) => item.id === "rain-1h" && item.active));
assert.ok(results.notifications.some((item) => item.ruleVersion === results.outfit.ruleVersion));
assert.ok(results.destinationNotificationsStrict.some((item) => item.id === "destination-change" && !item.active && item.reason.includes("강수 70%")));
assert.ok(results.destinationNotificationsWind.some((item) => item.id === "destination-change" && item.active && item.reason.includes("출발 30분 전")));
assert.equal(results.kma.source, "kma");
assert.equal(results.kma.current.condition, "rain");
assert.equal(results.kma.current.precipitationMm, 2);
assert.equal(results.kma.hourly.length, 3);
assert.deepEqual(results.seoulGrid, { nx: 60, ny: 127 });
assert.equal(results.seongsuGrid.nx, 61);
assert.equal(results.seongsuGrid.ny, 126);
assert.equal(results.openmeteo.source, "openmeteo");
assert.equal(results.openmeteo.current.condition, "clear");
assert.equal(results.openmeteo.current.feelsLikeC, 31);
assert.equal(results.openmeteo.hourly[1].windMs, 4.81);
assert.equal(results.placeSearchDefault[0].name, "강릉 안목해변");
assert.equal(results.placeSearchSports[0].category, "sports");
assert.equal(demoResults.current.weather.source, "kma");
assert.equal(demoResults.destination.weather.source, "openmeteo");
assert.equal(demoResults.current.weatherProvider.currentSource, "kma");
assert.equal(demoResults.current.weatherProvider.destinationSource, "openmeteo");
assert.equal(demoResults.current.destinationCare.originWeather.source, "kma");
assert.equal(demoResults.current.destinationCare.destinationWeather.source, "openmeteo");
assert.equal(demoResults.multiDestination.notifications.filter((item) => item.type === "destination").length, 2);
assert.ok(demoResults.multiDestination.notifications.some((item) => item.id.includes("kr-gangneung") && item.title.includes("강릉")));
assert.ok(demoResults.multiDestination.notifications.some((item) => item.id.includes("kr-jamsil") && item.active && item.reason.includes("출발 30분 전")));
assert.equal(demoResults.stale.weatherProvider.status, "stale");
assert.equal(demoResults.stale.weather.stale, true);
assert.equal(demoResults.fallback.weatherProvider.status, "fallback");
assert.equal(demoResults.fallback.weatherProvider.fallbackUsed, true);
assert.equal(demoResults.error.weatherProvider.status, "error");
assert.equal(demoResults.error.weatherProvider.retryable, true);
assert.equal(demoResults.error.weather.stale, true);
assert.equal(demoResults.kmaPayload[0].category, "TMP");
assert.equal(demoResults.openMeteoPayload.current.weather_code, 0);
assert.equal(demoResults.readyProvider.status, "ready");
assert.equal(demoResults.readyProvider.current.source, "kma");
assert.equal(demoResults.httpProvider.status, "ready");
assert.equal(demoResults.httpProvider.destination.source, "openmeteo");
assert.equal(demoResults.parallelProvider.destinationSnapshots.length, 2);
assert.equal(demoResults.parallelProvider.destinationSnapshots[0].locationId, "kr-gangneung-anmok-beach");
assert.equal(demoResults.parallelProvider.destinationSnapshots[1].locationId, "kr-jamsil-baseball-stadium");
assert.ok(demoResults.httpUrls.some((url) => url.includes("getVilageFcst")));
assert.ok(demoResults.httpUrls.some((url) => url.includes("temperature_2m")));
assert.deepEqual(demoResults.kmaBaseEarly, { baseDate: "20260625", baseTime: "2300" });
assert.deepEqual(demoResults.kmaBaseMorning, { baseDate: "20260626", baseTime: "0500" });

await rm(outDir, { recursive: true, force: true });

console.log("shared rules check passed");
