import {
  normalizeKmaWeather,
  normalizeOpenMeteoWeather,
  normalizeWeatherKitWeather,
  openMeteoFixture,
  type WeatherSnapshot,
} from "@weatheron/shared";
import { Platform } from "react-native";
import { getWeatherRuntimeConfig } from "../config/weatherEnv";
import { fixtureWeatherClient, runtimeWeatherClient, type WeatherClient } from "./weatherClient";
import {
  defaultGangneungWeatherLocation,
  defaultSeoulWeatherLocation,
  gangneungWeatherLocation,
  type KmaWeatherLocationPreset,
  type WeatherLocationPreset,
  seongsuWeatherLocation,
} from "./weatherLocations";

export type WeatherLocationKey = "current" | "destination";
export type WeatherProviderStatus = "ready" | "stale" | "fallback" | "error";
export type WeatherProviderMode = WeatherProviderStatus;

export type WeatherProviderResult = {
  current: WeatherSnapshot;
  destination: WeatherSnapshot;
  destinationSnapshots: WeatherSnapshot[];
  status: WeatherProviderStatus;
  message: string;
  retryable: boolean;
  fallbackUsed: boolean;
};

export type WeatherProviderOptions = {
  currentLocation?: WeatherLocationPreset;
  currentSnapshot?: WeatherSnapshot;
  destinationLocation?: WeatherLocationPreset;
  destinationLocations?: WeatherLocationPreset[];
};

export type WeatherProvider = {
  getSnapshots: (mode?: WeatherProviderMode, options?: WeatherProviderOptions) => Promise<WeatherProviderResult>;
};

export type WeatherProviderCreateOptions = {
  preferKma?: boolean;
  platform?: typeof Platform.OS;
};

export function createWeatherProvider(client: WeatherClient = runtimeWeatherClient, createOptions: WeatherProviderCreateOptions = {}): WeatherProvider {
  let cachedResult: WeatherProviderResult | null = null;

  return {
    async getSnapshots(mode = "ready", options = {}) {
      try {
        if (mode === "error") {
          throw new Error("Simulated weather provider error");
        }
        if (mode === "stale" && cachedResult) {
          return markProviderResultStale(cachedResult, "stale", options);
        }
        const stale = mode === "stale";
        const fallback = mode === "fallback";
        const currentLocation = fallback ? defaultSeoulWeatherLocation : options.currentLocation ?? seongsuWeatherLocation;
        const destinationLocation = fallback ? defaultGangneungWeatherLocation : options.destinationLocation ?? gangneungWeatherLocation;
        const destinationLocations = fallback
          ? [defaultGangneungWeatherLocation]
          : getUniqueDestinationLocations(destinationLocation, options.destinationLocations);
        const currentSnapshot =
          (createOptions.platform ?? Platform.OS) === "ios" && options.currentSnapshot?.source !== "weatherkit"
            ? undefined
            : options.currentSnapshot;
        const [current, ...destinationSnapshots] = await Promise.all([
          currentSnapshot ?? fetchWeatherSnapshot(client, currentLocation, stale, createOptions),
          ...destinationLocations.map((location) => fetchWeatherSnapshot(client, location, stale, createOptions)),
        ]);
        const destination = destinationSnapshots[0] ?? normalizeOpenMeteoWeather(openMeteoFixture, {
          locationId: destinationLocation.locationId,
          locationName: destinationLocation.locationName,
          countryCode: destinationLocation.countryCode,
          stale: true,
        });

        const result = {
          current,
          destination,
          destinationSnapshots,
          status: mode,
          message: getProviderMessage(mode, fallback),
          retryable: mode !== "ready",
          fallbackUsed: fallback,
        };
        if (mode === "ready") cachedResult = result;
        return result;
      } catch {
        if (cachedResult) {
          return markProviderResultStale(cachedResult, "error", options);
        }
        return markProviderResultStale(getFallbackSnapshots("error"), "error", options);
      }
    },
  };
}

export const runtimeWeatherProvider = createWeatherProvider();
export const fixtureWeatherProvider = createWeatherProvider(fixtureWeatherClient, { preferKma: true });

export function getFallbackSnapshots(status: WeatherProviderStatus = "fallback"): WeatherProviderResult {
  const current = markSnapshotFallback(normalizeOpenMeteoWeather(openMeteoFixture, {
    locationId: defaultSeoulWeatherLocation.locationId,
    locationName: defaultSeoulWeatherLocation.locationName,
    countryCode: "KR",
    stale: true,
  }));
  const destination = markSnapshotFallback(normalizeOpenMeteoWeather(openMeteoFixture, {
    locationId: "kr-gangneung-beach",
    locationName: "강릉 안목해변",
    countryCode: "KR",
    stale: true,
  }));

  return {
    current,
    destination,
    destinationSnapshots: [destination],
    status,
    message: getProviderMessage(status, true),
    retryable: true,
    fallbackUsed: true,
  };
}

async function fetchWeatherSnapshot(
  client: WeatherClient,
  location: WeatherLocationPreset,
  stale: boolean,
  options: WeatherProviderCreateOptions,
): Promise<WeatherSnapshot> {
  if ((options.platform ?? Platform.OS) === "ios") {
    if (typeof client.fetchWeatherKitForecast !== "function") {
      throw new Error("WeatherKit client is not configured for iOS");
    }
    const payload = await client.fetchWeatherKitForecast({
      latitude: location.coordinate.latitude,
      longitude: location.coordinate.longitude,
      timezone: location.timezone,
      countryCode: location.countryCode === "GLOBAL" ? undefined : location.countryCode,
      language: "ko",
    });
    return normalizeWeatherKitWeather(payload, {
      locationId: location.locationId,
      locationName: location.locationName,
      countryCode: location.countryCode,
      timezone: location.timezone,
      stale,
    });
  }
  if (shouldUseKmaForecast(location, options.preferKma)) {
    try {
      const payload = await client.fetchKmaForecast({
        nx: location.grid.nx,
        ny: location.grid.ny,
      });
      return normalizeKmaWeather(payload, {
        locationId: location.locationId,
        locationName: location.locationName,
        countryCode: location.countryCode,
        timezone: "+09:00",
        stale,
      });
    } catch {
      return fetchOpenMeteoSnapshot(client, location, stale);
    }
  }
  return fetchOpenMeteoSnapshot(client, location, stale);
}

async function fetchOpenMeteoSnapshot(
  client: WeatherClient,
  location: WeatherLocationPreset,
  stale: boolean,
): Promise<WeatherSnapshot> {
  const payload = await client.fetchOpenMeteoForecast({
    latitude: location.coordinate.latitude,
    longitude: location.coordinate.longitude,
    timezone: location.timezone,
  });
  return normalizeOpenMeteoWeather(payload, {
    locationId: location.locationId,
    locationName: location.locationName,
    countryCode: location.countryCode,
    stale,
  });
}

function shouldUseKmaForecast(location: WeatherLocationPreset, preferKma?: boolean): location is KmaWeatherLocationPreset {
  const enabled = preferKma ?? getWeatherRuntimeConfig().clientMode === "proxy";
  return enabled && location.countryCode === "KR" && "grid" in location;
}

function getProviderMessage(status: WeatherProviderStatus, fallbackUsed = false): string {
  if (status === "ready") return "최신 예보 기준으로 추천 준비 완료";
  if (status === "stale") return "최근 예보 기준 추천";
  if (status === "fallback") return "기본 위치 기준 추천";
  return fallbackUsed ? "날씨 갱신 실패. 기본 예보 기준 추천" : "날씨 갱신 실패. 최근 예보 기준 추천";
}

function markProviderResultStale(result: WeatherProviderResult, status: WeatherProviderStatus, options: WeatherProviderOptions = {}): WeatherProviderResult {
  const requestedDestinationLocations = getRequestedDestinationLocations(options);
  const existingDestinationSnapshots = result.destinationSnapshots.length ? result.destinationSnapshots : [result.destination];
  // 위치별로 id를 맞춰 캐시를 재사용해야 한다. 인덱스로만 짝지으면 목적지 목록이
  // 바뀌었을 때 다른 지역의 날씨 데이터가 새 지역 이름표를 달고 나온다.
  const destinationSnapshots = requestedDestinationLocations
    ? requestedDestinationLocations.map((location) => markSnapshotStale(findSnapshotForLocation(existingDestinationSnapshots, location), location))
    : existingDestinationSnapshots.map((snapshot) => markSnapshotStale(snapshot));

  return {
    ...result,
    current: markSnapshotStale(result.current, options.currentLocation),
    destination: destinationSnapshots[0] ?? markSnapshotStale(result.destination, options.destinationLocation),
    destinationSnapshots,
    status,
    message: getProviderMessage(status, result.fallbackUsed),
    retryable: true,
    fallbackUsed: result.fallbackUsed,
  };
}

function findSnapshotForLocation(snapshots: WeatherSnapshot[], location: WeatherLocationPreset): WeatherSnapshot | undefined {
  return snapshots.find((snapshot) => snapshot.locationId === location.locationId);
}

function getUniqueDestinationLocations(
  primaryLocation: WeatherLocationPreset,
  extraLocations: WeatherLocationPreset[] = [],
): WeatherLocationPreset[] {
  const locations = [primaryLocation, ...extraLocations];
  const seen = new Set<string>();
  return locations.filter((location) => {
    if (seen.has(location.locationId)) return false;
    seen.add(location.locationId);
    return true;
  });
}

function getRequestedDestinationLocations(options: WeatherProviderOptions): WeatherLocationPreset[] | null {
  if (!options.destinationLocation && !options.destinationLocations?.length) return null;
  return getUniqueDestinationLocations(options.destinationLocation ?? options.destinationLocations?.[0] ?? gangneungWeatherLocation, options.destinationLocations);
}

function markSnapshotStale(snapshot: WeatherSnapshot | undefined, location?: WeatherLocationPreset): WeatherSnapshot {
  // 캐시가 없거나(snapshot undefined) 캐시된 지역과 요청 지역이 다르면, 다른 지역의
  // 실측 데이터를 새 지역 이름표로 relabel하지 말고 픽스처 기반 폴백을 만들어야 한다.
  if (!snapshot) return buildFallbackSnapshotForLocation(location ?? defaultSeoulWeatherLocation);
  if (location && location.locationId !== snapshot.locationId) return buildFallbackSnapshotForLocation(location);
  return {
    ...snapshot,
    stale: true,
    current: { ...snapshot.current },
    hourly: snapshot.hourly.map((item) => ({ ...item })),
  };
}

function buildFallbackSnapshotForLocation(location: WeatherLocationPreset): WeatherSnapshot {
  return markSnapshotFallback(normalizeOpenMeteoWeather(openMeteoFixture, {
    locationId: location.locationId,
    locationName: location.locationName,
    countryCode: location.countryCode,
    stale: true,
  }));
}

function markSnapshotFallback(snapshot: WeatherSnapshot): WeatherSnapshot {
  return {
    ...snapshot,
    source: "fallback",
  };
}
