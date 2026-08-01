import {
  applyLifestyleIndex,
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

export type OfficialSpecialAlert = {
  source: "kma";
  active: boolean;
  type?: "heatwave" | "heavy-rain";
  level?: "advisory" | "warning";
  title?: string;
  reason?: string;
  issuedAt?: string;
  regionName?: string;
  rawStatus?: string;
};

export type WeatherProviderResult = {
  current: WeatherSnapshot;
  destination: WeatherSnapshot;
  destinationSnapshots: WeatherSnapshot[];
  officialSpecialAlert: OfficialSpecialAlert;
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
        const [weatherSnapshots, officialSpecialAlert] = await Promise.all([
          Promise.all([
            resolveCurrentWeatherSnapshot(client, currentLocation, currentSnapshot, stale, createOptions),
            ...destinationLocations.map((location) => fetchWeatherSnapshot(client, location, stale, createOptions)),
          ]),
          fetchOfficialSpecialAlert(client, currentLocation),
        ]);
        const [current, ...destinationSnapshots] = weatherSnapshots;
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
          officialSpecialAlert,
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
    officialSpecialAlert: createInactiveOfficialSpecialAlert(),
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
      return enhanceAirQuality(client, location, normalizeKmaWeather(payload, {
        locationId: location.locationId,
        locationName: location.locationName,
        countryCode: location.countryCode,
        timezone: "+09:00",
        stale,
      }));
    } catch {
      return fetchOpenMeteoSnapshot(client, location, stale);
    }
  }
  return fetchOpenMeteoSnapshot(client, location, stale);
}

async function resolveCurrentWeatherSnapshot(
  client: WeatherClient,
  location: WeatherLocationPreset,
  currentSnapshot: WeatherSnapshot | undefined,
  stale: boolean,
  options: WeatherProviderCreateOptions,
): Promise<WeatherSnapshot> {
  if (!currentSnapshot) return fetchWeatherSnapshot(client, location, stale, options);
  if (currentSnapshot.locationId !== location.locationId) return fetchWeatherSnapshot(client, location, stale, options);
  if (shouldRefreshLifestyleIndex(currentSnapshot, location, options)) {
    return enhanceAirQuality(client, location, currentSnapshot);
  }
  return currentSnapshot;
}

function shouldRefreshLifestyleIndex(
  snapshot: WeatherSnapshot,
  location: WeatherLocationPreset,
  options: WeatherProviderCreateOptions,
): boolean {
  if ((options.platform ?? Platform.OS) === "ios") return false;
  if (location.countryCode !== "KR") return false;
  const current = snapshot.current;
  return typeof current.uvIndex !== "number" || typeof current.pm10 !== "number" || typeof current.pm25 !== "number";
}

async function fetchOfficialSpecialAlert(client: WeatherClient, location: WeatherLocationPreset): Promise<OfficialSpecialAlert> {
  if (location.countryCode !== "KR" || typeof client.fetchKmaSpecialAlert !== "function") {
    return createInactiveOfficialSpecialAlert();
  }
  try {
    return normalizeKmaOfficialSpecialAlert(await client.fetchKmaSpecialAlert(), location);
  } catch {
    return createInactiveOfficialSpecialAlert("fetch_failed");
  }
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
  return enhanceAirQuality(client, location, normalizeOpenMeteoWeather(payload, {
    locationId: location.locationId,
    locationName: location.locationName,
    countryCode: location.countryCode,
    stale,
  }));
}

async function enhanceAirQuality(
  client: WeatherClient,
  location: WeatherLocationPreset,
  snapshot: WeatherSnapshot,
): Promise<WeatherSnapshot> {
  if (typeof client.fetchLifestyleIndex !== "function" || location.countryCode !== "KR") return snapshot;
  try {
    const payload = await client.fetchLifestyleIndex({
      latitude: location.coordinate.latitude,
      longitude: location.coordinate.longitude,
      timezone: location.timezone,
      countryCode: location.countryCode,
      locationName: location.locationName,
      areaNo: inferKmaLifestyleAreaNo(location),
    });
    return applyLifestyleIndex(snapshot, payload);
  } catch {
    return snapshot;
  }
}

function inferKmaLifestyleAreaNo(location: WeatherLocationPreset): string {
  if (location.locationName.includes("송파") || location.locationName.includes("잠실")) return "1171000000";
  if (location.locationName.includes("강릉")) return "4215000000";
  if (
    location.locationName.includes("서울") ||
    (location.coordinate.latitude >= 37.4 &&
      location.coordinate.latitude <= 37.72 &&
      location.coordinate.longitude >= 126.75 &&
      location.coordinate.longitude <= 127.2)
  ) {
    return "1100000000";
  }
  return "1100000000";
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
    officialSpecialAlert: createInactiveOfficialSpecialAlert(),
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

function createInactiveOfficialSpecialAlert(rawStatus?: string): OfficialSpecialAlert {
  return { source: "kma", active: false, ...(rawStatus ? { rawStatus } : {}) };
}

function normalizeKmaOfficialSpecialAlert(payload: unknown, location: WeatherLocationPreset): OfficialSpecialAlert {
  const candidates = extractKmaAlertRecords(payload)
    .map(parseKmaOfficialSpecialAlertRecord)
    .filter((alert): alert is OfficialSpecialAlert => Boolean(alert))
    .filter((alert) => matchesOfficialAlertLocation(alert, location));
  const activeAlerts = candidates.filter((alert) => alert.active && alert.type && alert.level);
  if (!activeAlerts.length) return createInactiveOfficialSpecialAlert();
  activeAlerts.sort(compareOfficialSpecialAlerts);
  return activeAlerts[0];
}

function extractKmaAlertRecords(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) return value.flatMap(extractKmaAlertRecords);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const nestedCandidates = [
    readFieldValue(record, ["response.body.items.item"]),
    readFieldValue(record, ["response.body.items"]),
    readFieldValue(record, ["body.items.item"]),
    readFieldValue(record, ["items.item"]),
    readFieldValue(record, ["items"]),
    readFieldValue(record, ["item"]),
  ];
  const nestedRecords = nestedCandidates.flatMap(extractKmaAlertRecords);
  if (nestedRecords.length) return nestedRecords;
  return [record];
}

function parseKmaOfficialSpecialAlertRecord(record: Record<string, unknown>): OfficialSpecialAlert | null {
  const title = readStringField(record, ["title", "TITLE", "titl", "wrnTitle"]);
  const contents = readStringField(record, ["contents", "content", "body", "reason", "rem", "text"]);
  const typeRaw = readStringField(record, ["wrn", "warnVar", "warnCode", "warningCode", "warn"]);
  const levelRaw = readStringField(record, ["lvl", "level", "warnStress", "warningLevel"]);
  const commandRaw = readStringField(record, ["cmd", "command", "status", "warningStatus"]);
  const regionName = readStringField(record, ["regKo", "regName", "areaName", "regionName", "stnName", "region"]);
  const issuedAt = readStringField(record, ["tmFc", "tmFcStr", "announceTime", "issuedAt", "issueTime"]);
  const haystack = cleanKmaText([typeRaw, levelRaw, commandRaw, title, contents].filter(Boolean).join(" "));
  if (isReleasedOrPreliminaryKmaAlert(commandRaw, haystack)) return null;

  const type = resolveKmaSpecialAlertType(typeRaw, haystack);
  const level = resolveKmaSpecialAlertLevel(levelRaw, haystack);
  if (!type || !level) return null;

  const officialTitle = `${type === "heavy-rain" ? "호우" : "폭염"}${level === "warning" ? "경보" : "주의보"}`;
  const reason = cleanKmaText(contents ?? title ?? [regionName, issuedAt].filter(Boolean).join(" · "));
  return {
    source: "kma",
    active: true,
    type,
    level,
    title: officialTitle,
    reason: reason || officialTitle,
    ...(issuedAt ? { issuedAt } : {}),
    ...(regionName ? { regionName } : {}),
    rawStatus: cleanKmaText(commandRaw ?? title ?? officialTitle),
  };
}

function resolveKmaSpecialAlertType(raw: string | undefined, haystack: string): OfficialSpecialAlert["type"] | undefined {
  const code = raw?.trim().toUpperCase();
  if (code === "R" || code === "2" || code === "02" || haystack.includes("호우")) return "heavy-rain";
  if (code === "H" || code === "O" || code === "12" || haystack.includes("폭염")) return "heatwave";
  return undefined;
}

function resolveKmaSpecialAlertLevel(raw: string | undefined, haystack: string): OfficialSpecialAlert["level"] | undefined {
  const code = raw?.trim().toUpperCase();
  if (code === "3" || code === "W" || code === "WARNING" || haystack.includes("경보")) return "warning";
  if (code === "2" || code === "A" || code === "ADVISORY" || haystack.includes("주의보")) return "advisory";
  return undefined;
}

function isReleasedOrPreliminaryKmaAlert(commandRaw: string | undefined, haystack: string): boolean {
  const command = commandRaw?.trim();
  return command === "3" || command === "4" || command === "7" || haystack.includes("해제") || haystack.includes("예비");
}

function matchesOfficialAlertLocation(alert: OfficialSpecialAlert, location: WeatherLocationPreset): boolean {
  if (!alert.regionName) return true;
  const region = normalizeKoreanRegionText(alert.regionName);
  const locationName = normalizeKoreanRegionText(location.locationName);
  const locationParts = locationName.split(/\s+/u).filter(Boolean);
  const city = locationParts[0];
  const district = locationParts[1];
  const coordinateRegions = inferKoreanRegionNamesFromCoordinate(location);
  return Boolean(
    (city && region.includes(city)) ||
    (district && region.includes(district)) ||
    region.includes(locationName.replace(/\s+/gu, "")) ||
    coordinateRegions.some((name) => region.includes(normalizeKoreanRegionText(name))),
  );
}

function inferKoreanRegionNamesFromCoordinate(location: WeatherLocationPreset): string[] {
  if (location.countryCode !== "KR") return [];
  const { latitude, longitude } = location.coordinate;
  if (latitude >= 37.4 && latitude <= 37.72 && longitude >= 126.75 && longitude <= 127.2) return ["서울"];
  if (latitude >= 37.68 && latitude <= 37.86 && longitude >= 128.78 && longitude <= 129.08) return ["강릉", "강원"];
  return [];
}

function compareOfficialSpecialAlerts(left: OfficialSpecialAlert, right: OfficialSpecialAlert): number {
  const leftLevel = left.level === "warning" ? 2 : 1;
  const rightLevel = right.level === "warning" ? 2 : 1;
  if (leftLevel !== rightLevel) return rightLevel - leftLevel;
  const leftType = left.type === "heavy-rain" ? 2 : 1;
  const rightType = right.type === "heavy-rain" ? 2 : 1;
  return rightType - leftType;
}

function readStringField(record: Record<string, unknown>, keys: string[]): string | undefined {
  const value = readFieldValue(record, keys);
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return String(value);
  return undefined;
}

function readFieldValue(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const pathValue = readFieldPath(record, key);
    if (pathValue !== undefined && pathValue !== null) return pathValue;
    const normalizedKey = normalizeFieldName(key);
    const entry = Object.entries(record).find(([name]) => normalizeFieldName(name) === normalizedKey);
    if (entry?.[1] !== undefined && entry[1] !== null) return entry[1];
  }
  return undefined;
}

function readFieldPath(record: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[part];
  }, record);
}

function normalizeFieldName(value: string): string {
  return value.replace(/[^a-z0-9]/giu, "").toLowerCase();
}

function cleanKmaText(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function normalizeKoreanRegionText(value: string): string {
  return value
    .replace(/특별시|광역시|특별자치시|특별자치도|자치도|도|시|군|구/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}
