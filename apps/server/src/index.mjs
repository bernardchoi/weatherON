import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOT_DIR = resolve(SERVER_DIR, "../..");
const DEFAULT_KMA_FORECAST_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const DEFAULT_OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const DEFAULT_KAKAO_LOCAL_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const DEFAULT_KAKAO_DIRECTIONS_URL = "https://apis-navi.kakaomobility.com/v1/directions";
const DEFAULT_GOOGLE_DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_PLACE_CACHE_TTL_MS = 30 * 60 * 1000;
const DEFAULT_ROUTE_CACHE_TTL_MS = 10 * 60 * 1000;

loadEnvFile(join(ROOT_DIR, ".env"));
loadEnvFile(join(ROOT_DIR, ".env.local"));
loadEnvFile(join(SERVER_DIR, ".env"));
loadEnvFile(join(SERVER_DIR, ".env.local"));

const host = process.env.WEATHER_SERVER_HOST ?? "127.0.0.1";
const port = Number(process.env.PORT || process.env.WEATHER_SERVER_PORT) || 8091;
const timeoutMs = Number(process.env.WEATHER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;
const weatherCacheTtlMs = Number(process.env.WEATHER_CACHE_TTL_MS) || DEFAULT_WEATHER_CACHE_TTL_MS;
const placeCacheTtlMs = Number(process.env.PLACE_CACHE_TTL_MS) || DEFAULT_PLACE_CACHE_TTL_MS;
const routeCacheTtlMs = Number(process.env.ROUTE_CACHE_TTL_MS) || DEFAULT_ROUTE_CACHE_TTL_MS;
const forecastCache = new Map();
const placeSearchCache = new Map();
const routeEstimateCache = new Map();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "method_not_allowed" });
      return;
    }
    if (url.pathname === "/health") {
      sendJson(response, 200, { ok: true, service: "weatheron-weather-proxy" });
      return;
    }
    if (url.pathname === "/weather/kma") {
      const payload = await fetchKmaForecast(url.searchParams);
      sendJson(response, 200, payload);
      return;
    }
    if (url.pathname === "/weather/openmeteo") {
      const payload = await fetchOpenMeteoForecast(url.searchParams);
      sendJson(response, 200, payload);
      return;
    }
    if (url.pathname === "/places/search") {
      const payload = await searchPlaces(url.searchParams);
      sendJson(response, 200, payload);
      return;
    }
    if (url.pathname === "/routes/estimate") {
      const payload = await estimateRoute(url.searchParams);
      sendJson(response, 200, payload);
      return;
    }
    sendJson(response, 404, { error: "not_found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "weather_proxy_error";
    sendJson(response, 502, { error: "weather_proxy_error", message });
  }
});

server.listen(port, host, () => {
  console.log(`weather proxy listening on http://${host}:${port}`);
});

async function fetchKmaForecast(params) {
  const serviceKey = process.env.KMA_SERVICE_KEY;
  if (!serviceKey) throw new Error("KMA_SERVICE_KEY is not configured");
  const nx = getRequiredParam(params, "nx");
  const ny = getRequiredParam(params, "ny");
  const base = getKmaForecastBaseDateTime();
  const url = new URL(process.env.KMA_FORECAST_URL ?? DEFAULT_KMA_FORECAST_URL);
  url.searchParams.set("serviceKey", normalizeKmaServiceKey(serviceKey));
  url.searchParams.set("pageNo", params.get("pageNo") ?? "1");
  url.searchParams.set("numOfRows", params.get("numOfRows") ?? "1000");
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("base_date", params.get("baseDate") ?? params.get("base_date") ?? base.baseDate);
  url.searchParams.set("base_time", params.get("baseTime") ?? params.get("base_time") ?? base.baseTime);
  url.searchParams.set("nx", nx);
  url.searchParams.set("ny", ny);
  return fetchCachedJson(forecastCache, getUrlCacheKey("kma", url, ["serviceKey"]), weatherCacheTtlMs, () => fetchJson(url));
}

async function fetchOpenMeteoForecast(params) {
  const latitude = getRequiredParam(params, "latitude");
  const longitude = getRequiredParam(params, "longitude");
  const url = new URL(process.env.OPEN_METEO_FORECAST_URL ?? DEFAULT_OPEN_METEO_FORECAST_URL);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("timezone", params.get("timezone") ?? "Asia/Seoul");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "wind_speed_10m",
      "relative_humidity_2m",
      "uv_index",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "relative_humidity_2m",
      "uv_index",
    ].join(","),
  );
  url.searchParams.set("forecast_days", params.get("forecastDays") ?? "1");
  return fetchCachedJson(forecastCache, getUrlCacheKey("openmeteo", url), weatherCacheTtlMs, () => fetchJson(url));
}

async function searchPlaces(params) {
  const query = params.get("q") ?? "";
  const searchQuery = getPlaceSearchQueryAlias(query);
  const countryCode = normalizeCountryCode(params.get("countryCode")) ?? inferPlaceSearchCountryCode(searchQuery);
  const language = normalizeSearchLanguage(params.get("language") ?? params.get("locale"));
  if (query.trim().length < 2) return [];
  return fetchCachedJson(placeSearchCache, `places:${countryCode}:${language}:${query.trim().toLowerCase()}`, placeCacheTtlMs, async () => {
    const curatedResults = localizePlaceSearchResults(searchFixturePlaces(searchQuery), language);
    try {
      if (countryCode === "KR" && process.env.KAKAO_REST_API_KEY) {
        return mergePlaceSearchResults(curatedResults, await searchKakaoPlaces(searchQuery));
      }
      if (getGoogleMapsApiKey()) {
        const googleResults = localizePlaceSearchResults(await searchGooglePlaces(searchQuery, countryCode, language), language);
        return mergePlaceSearchResults(curatedResults, googleResults);
      }
    } catch (error) {
      console.warn(`place provider fallback: ${error instanceof Error ? error.message : "unknown_error"}`);
    }
    return curatedResults;
  });
}

function normalizeCountryCode(value) {
  if (value === "KR" || value === "JP" || value === "GLOBAL") return value;
  return null;
}

function inferPlaceSearchCountryCode(query) {
  const text = query.trim().toLowerCase();
  if (!text) return "KR";
  const jpKeywords = ["tokyo", "osaka", "kyoto", "sapporo", "fukuoka", "japan", "shinsaibashi", "namba", "nankai namba", "도쿄", "오사카", "교토", "삿포로", "후쿠오카", "일본", "신사이바시", "난바", "난카이난바", "東京", "大阪", "京都", "心斎橋", "難波", "なんば"];
  if (jpKeywords.some((keyword) => text.includes(keyword.toLowerCase()))) return "JP";
  const globalKeywords = ["bangkok", "paris", "london", "new york", "central park", "방콕", "파리", "런던", "뉴욕", "센트럴파크", "센트럴 파크"];
  if (globalKeywords.some((keyword) => text.includes(keyword.toLowerCase()))) return "GLOBAL";
  if (/[a-z]/.test(text) && !/[가-힣]/.test(text)) return "GLOBAL";
  return "KR";
}

function normalizeSearchLanguage(value) {
  const language = String(value || "ko").split("-")[0].toLowerCase();
  if (language === "ja") return "ja";
  if (language === "en") return "en";
  return "ko";
}

function getPlaceSearchQueryAlias(query) {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, " ");
  return placeSearchQueryAliases[normalized] ?? query;
}

const placeSearchQueryAliases = {
  "잠실": "잠실야구장",
  "jamsil": "Jamsil Baseball Stadium",
  "jamsil baseball stadium": "잠실야구장",
  "도쿄": "Tokyo",
  "tokyo station": "Tokyo Station",
  "tokyostation": "Tokyo Station",
  "도쿄 역": "Tokyo Station",
  "도쿄역": "Tokyo Station",
  "東京駅": "Tokyo Station",
  "시부야": "Shibuya",
  "신주쿠": "Shinjuku",
  "오사카": "Osaka",
  "신사이바시": "Shinsaibashi Station",
  "신사이바시역": "Shinsaibashi Station",
  "shinsaibashi": "Shinsaibashi Station",
  "shinsaibashi station": "Shinsaibashi Station",
  "心斎橋": "Shinsaibashi Station",
  "心斎橋駅": "Shinsaibashi Station",
  "난바": "Namba Station",
  "난바역": "Namba Station",
  "난카이난바": "Namba Station",
  "난카이난바역": "Namba Station",
  "namba": "Namba Station",
  "namba station": "Namba Station",
  "nankai namba": "Namba Station",
  "nankai namba station": "Namba Station",
  "難波": "Namba Station",
  "難波駅": "Namba Station",
  "なんば": "Namba Station",
  "なんば駅": "Namba Station",
  "교토": "Kyoto",
  "삿포로": "Sapporo",
  "후쿠오카": "Fukuoka",
  "잠실 야구장": "잠실야구장",
  "잠실야구장": "Jamsil Baseball Stadium",
  "잠실종합운동장": "잠실야구장",
  "jamsil stadium": "Jamsil Baseball Stadium",
  "방콕": "Bangkok",
  "파리": "Paris",
  "런던": "London",
  "뉴욕": "New York",
  "센트럴파크": "Central Park",
  "센트럴 파크": "Central Park",
};

async function searchKakaoPlaces(query) {
  const url = new URL(process.env.KAKAO_LOCAL_KEYWORD_URL ?? DEFAULT_KAKAO_LOCAL_KEYWORD_URL);
  url.searchParams.set("query", query || "강릉 안목해변");
  url.searchParams.set("size", "8");
  const payload = await fetchJson(url, {
    Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
  });
  return (payload.documents ?? [])
    .map((item) => ({
      id: `kakao-${item.id}`,
      name: item.place_name,
      address: item.road_address_name || item.address_name || "주소 정보 없음",
      category: inferPlaceCategory(`${item.category_name} ${item.category_group_name} ${item.place_name}`),
      countryCode: "KR",
      coordinate: {
        latitude: Number(item.y),
        longitude: Number(item.x),
      },
      timezone: "Asia/Seoul",
      provider: "kakao",
    }))
    .filter((place) => Number.isFinite(place.coordinate.latitude) && Number.isFinite(place.coordinate.longitude));
}

async function searchGooglePlaces(query, countryCode, language = "ko") {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query || "Tokyo Station");
  url.searchParams.set("key", getGoogleMapsApiKey());
  url.searchParams.set("language", language);
  if (countryCode === "JP") {
    url.searchParams.set("components", "country:JP");
    url.searchParams.set("region", "jp");
  }
  const payload = await fetchJson(url);
  if (payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
    throw new Error(`google geocoding failed: ${payload.status ?? "unknown_status"}`);
  }
  return (payload.results ?? []).slice(0, 5).map((item) => ({
    id: `google-${item.place_id}`,
    name: getGooglePlaceName(item),
    address: item.formatted_address,
    category: inferPlaceCategory(`${item.types?.join(" ")} ${item.formatted_address}`),
    countryCode: countryCode === "JP" ? "JP" : "GLOBAL",
    coordinate: {
      latitude: Number(item.geometry?.location?.lat),
      longitude: Number(item.geometry?.location?.lng),
    },
    timezone: countryCode === "JP" ? "Asia/Tokyo" : "UTC",
    provider: "google",
  }));
}

function getGoogleMapsApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_GEOCODING_API_KEY;
}

function getGooglePlaceName(item) {
  const firstNamedComponent = item.address_components?.find((component) =>
    component.types?.some((type) => ["point_of_interest", "establishment", "premise", "route", "locality"].includes(type)),
  );
  return firstNamedComponent?.long_name ?? item.formatted_address?.split(",")[0] ?? "Google Maps result";
}

async function estimateRoute(params) {
  const origin = readCoordinate(params, "origin");
  const destination = readCoordinate(params, "destination");
  const originName = params.get("originName") ?? "현재 위치";
  const destinationName = params.get("destinationName") ?? "목적지";
  const originCountryCode = normalizeCountryCode(params.get("originCountryCode")) ?? "KR";
  const destinationCountryCode = normalizeCountryCode(params.get("destinationCountryCode")) ?? inferPlaceSearchCountryCode(destinationName);
  const cacheKey = `route:${originCountryCode}:${destinationCountryCode}:${formatCoordinateKey(origin)}:${formatCoordinateKey(destination)}`;

  return fetchCachedJson(routeEstimateCache, cacheKey, routeCacheTtlMs, async () => {
    try {
      if (shouldUseKakaoRoute(originCountryCode, destinationCountryCode) && process.env.KAKAO_REST_API_KEY) {
        return await estimateKakaoRoute(origin, destination, originName, destinationName);
      }
      if (shouldUseGoogleRoute(originCountryCode, destinationCountryCode) && getGoogleMapsApiKey()) {
        return await estimateGoogleRoute(origin, destination, originCountryCode, destinationCountryCode);
      }
    } catch (error) {
      console.warn(`route provider fallback: ${error instanceof Error ? error.message : "unknown_error"}`);
    }
    return estimateFallbackRoute(origin, destination, destinationCountryCode);
  });
}

function shouldUseKakaoRoute(originCountryCode, destinationCountryCode) {
  return originCountryCode === "KR" && destinationCountryCode === "KR";
}

function shouldUseGoogleRoute(originCountryCode, destinationCountryCode) {
  return originCountryCode === destinationCountryCode && destinationCountryCode !== "KR";
}

async function estimateKakaoRoute(origin, destination, originName, destinationName) {
  const url = new URL(process.env.KAKAO_DIRECTIONS_URL ?? DEFAULT_KAKAO_DIRECTIONS_URL);
  url.searchParams.set("origin", formatKakaoRouteCoordinate(origin, originName));
  url.searchParams.set("destination", formatKakaoRouteCoordinate(destination, destinationName));
  url.searchParams.set("priority", "TIME");
  url.searchParams.set("summary", "true");
  url.searchParams.set("alternatives", "false");
  const payload = await fetchJson(url, {
    Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
    "Content-Type": "application/json",
  });
  const summary = payload.routes?.find((route) => route?.result_code === 0)?.summary ?? payload.routes?.[0]?.summary;
  const durationSeconds = Number(summary?.duration);
  const distanceMeters = Number(summary?.distance);
  if (!Number.isFinite(durationSeconds) || !Number.isFinite(distanceMeters)) {
    throw new Error("kakao route response is empty");
  }
  return {
    provider: "kakao",
    status: "ready",
    travelMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
    distanceMeters: Math.max(0, Math.round(distanceMeters)),
    message: "Kakao Directions 기준",
  };
}

function estimateFallbackRoute(origin, destination, destinationCountryCode = "KR") {
  const directDistanceMeters = getDistanceMeters(origin, destination);
  const roadDistanceMeters = Math.round(directDistanceMeters * (destinationCountryCode === "KR" ? 1.35 : 1));
  const travelMinutes = destinationCountryCode === "KR"
    ? Math.max(15, Math.ceil((roadDistanceMeters / 1000 / 32) * 60))
    : getInternationalFallbackTravelMinutes(destinationCountryCode);
  return {
    provider: "fallback",
    status: "fallback",
    travelMinutes,
    distanceMeters: roadDistanceMeters,
    message: destinationCountryCode === "KR" ? "좌표 거리 기반 추정" : "해외 목적지 기본 이동시간",
  };
}

function getInternationalFallbackTravelMinutes(countryCode) {
  if (countryCode === "JP") return 150;
  return 180;
}

async function estimateGoogleRoute(origin, destination, originCountryCode, destinationCountryCode) {
  const url = new URL(process.env.GOOGLE_DISTANCE_MATRIX_URL ?? DEFAULT_GOOGLE_DISTANCE_MATRIX_URL);
  url.searchParams.set("origins", formatGoogleRouteCoordinate(origin));
  url.searchParams.set("destinations", formatGoogleRouteCoordinate(destination));
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", getGoogleRouteLanguage(destinationCountryCode));
  url.searchParams.set("key", getGoogleMapsApiKey());
  if (destinationCountryCode === "JP") url.searchParams.set("region", "jp");
  const payload = await fetchJson(url);
  if (payload.status !== "OK") throw new Error(`google route failed: ${payload.status ?? "unknown_status"}`);
  const element = payload.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") {
    throw new Error(`google route element failed: ${element?.status ?? "empty"}`);
  }
  const durationSeconds = Number(element.duration?.value);
  const distanceMeters = Number(element.distance?.value);
  if (!Number.isFinite(durationSeconds) || !Number.isFinite(distanceMeters)) {
    throw new Error("google route response is empty");
  }
  return {
    provider: "google",
    status: "ready",
    travelMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
    distanceMeters: Math.max(0, Math.round(distanceMeters)),
    message: "Google Distance Matrix 기준",
  };
}

function readCoordinate(params, key) {
  const value = getRequiredParam(params, key);
  const [latitudeText, longitudeText] = value.split(",");
  const coordinate = {
    latitude: Number(latitudeText),
    longitude: Number(longitudeText),
  };
  if (!Number.isFinite(coordinate.latitude) || !Number.isFinite(coordinate.longitude)) {
    throw new Error(`${key} coordinate is invalid`);
  }
  return coordinate;
}

function formatCoordinateKey(coordinate) {
  return `${coordinate.latitude.toFixed(5)},${coordinate.longitude.toFixed(5)}`;
}

function formatKakaoRouteCoordinate(coordinate, name) {
  return `${coordinate.longitude},${coordinate.latitude},name=${name}`;
}

function formatGoogleRouteCoordinate(coordinate) {
  return `${coordinate.latitude},${coordinate.longitude}`;
}

function getGoogleRouteLanguage(countryCode) {
  if (countryCode === "JP") return "ja";
  if (countryCode === "KR") return "ko";
  return "en";
}

function getDistanceMeters(origin, destination) {
  const radiusMeters = 6371000;
  const fromLat = toRadians(origin.latitude);
  const toLat = toRadians(destination.latitude);
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLon / 2) ** 2;
  return radiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

async function fetchJson(url, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    const bodyText = await response.text();
    if (!response.ok) throw new Error(`upstream request failed: ${response.status} ${bodyText.slice(0, 240)}`);
    return JSON.parse(bodyText);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCachedJson(cache, key, ttlMs, fetcher) {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.cachedAt <= ttlMs) return cached.payload;
  try {
    const payload = await fetcher();
    cache.set(key, { payload, cachedAt: now });
    return payload;
  } catch (error) {
    if (cached) return cached.payload;
    throw error;
  }
}

function getUrlCacheKey(prefix, url, omitParams = []) {
  const normalized = new URL(url.toString());
  for (const param of omitParams) normalized.searchParams.delete(param);
  normalized.searchParams.sort();
  return `${prefix}:${normalized.pathname}?${normalized.searchParams.toString()}`;
}

const placeSearchFixtures = [
  {
    id: "kr-gangneung-anmok-beach",
    name: "강릉 안목해변",
    address: "강원 강릉시 창해로14번길",
    category: "beach",
    countryCode: "KR",
    coordinate: { latitude: 37.7715, longitude: 128.9483 },
    timezone: "Asia/Seoul",
    provider: "fixture",
  },
  {
    id: "kr-jamsil-baseball-stadium",
    name: "잠실야구장",
    address: "서울 송파구 올림픽로 25",
    category: "sports",
    countryCode: "KR",
    coordinate: { latitude: 37.5122, longitude: 127.0719 },
    timezone: "Asia/Seoul",
    provider: "fixture",
  },
  {
    id: "jp-tokyo-station",
    name: "도쿄역",
    address: "일본 도쿄도 지요다구 마루노우치",
    category: "custom",
    countryCode: "JP",
    coordinate: { latitude: 35.6812, longitude: 139.7671 },
    timezone: "Asia/Tokyo",
    provider: "fixture",
  },
  {
    id: "jp-shinsaibashi-station",
    name: "신사이바시역",
    address: "일본 오사카부 오사카시 주오구 신사이바시스지",
    category: "custom",
    countryCode: "JP",
    coordinate: { latitude: 34.675, longitude: 135.5006 },
    timezone: "Asia/Tokyo",
    provider: "fixture",
  },
  {
    id: "jp-namba-station",
    name: "난바역",
    address: "일본 오사카부 오사카시 주오구 난바",
    category: "custom",
    countryCode: "JP",
    coordinate: { latitude: 34.6663, longitude: 135.5001 },
    timezone: "Asia/Tokyo",
    provider: "fixture",
  },
  {
    id: "global-new-york-central-park",
    name: "Central Park",
    address: "Central Park, New York",
    category: "custom",
    countryCode: "GLOBAL",
    coordinate: { latitude: 40.7829, longitude: -73.9654 },
    timezone: "America/New_York",
    provider: "fixture",
  },
];

function mergePlaceSearchResults(...groups) {
  const seen = new Set();
  return groups.flat().filter((place) => {
    const key = getPlaceIdentityKey(place);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getPlaceIdentityKey(place) {
  const lat = Number(place.coordinate?.latitude);
  const lon = Number(place.coordinate?.longitude);
  return [
    place.countryCode,
    normalizePlaceIdentityText(place.name),
    Number.isFinite(lat) ? lat.toFixed(4) : "",
    Number.isFinite(lon) ? lon.toFixed(4) : "",
  ].join(":");
}

function normalizePlaceIdentityText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function searchFixturePlaces(query) {
  const normalizedQuery = getPlaceSearchQueryAlias(query).trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalizedQuery) return placeSearchFixtures.slice(0, 3);
  return placeSearchFixtures.filter((place) =>
    `${place.name} ${place.address} ${place.category} ${place.countryCode} ${getPlaceSearchQueryAlias(place.name)}`
      .toLowerCase()
      .replace(/\s+/g, " ")
      .includes(normalizedQuery) ||
    normalizedQuery.split(/\s+/).every((token) =>
      `${place.name} ${place.address} ${place.category} ${place.countryCode}`.toLowerCase().includes(token),
    ),
  );
}

function localizePlaceSearchResults(places, language) {
  return places.map((place) => localizePlaceSearchResult(place, language));
}

function localizePlaceSearchResult(place, language = "ko") {
  const key = getKnownStationKey(place);
  if (!key) return place;
  const label = localizedStationLabels[key][language] ?? localizedStationLabels[key].ko;
  return {
    ...place,
    name: label.name,
    address: label.address,
    countryCode: "JP",
    timezone: "Asia/Tokyo",
  };
}

function getKnownStationKey(place) {
  if (Object.prototype.hasOwnProperty.call(localizedStationLabels, place.id)) return place.id;
  const text = String(`${place.name ?? ""} ${place.address ?? ""} ${place.id ?? ""}`).trim().toLowerCase().replace(/\s+/g, " ");
  const compact = text.replace(/\s+/g, "");
  const stationLike = /station|stn|역|駅|nankai/.test(text);
  if ((compact.includes("tokyostation") || compact.includes("도쿄역") || compact.includes("東京駅")) && stationLike) return "jp-tokyo-station";
  if ((compact.includes("shinsaibashi") || compact.includes("신사이바시") || compact.includes("心斎橋")) && stationLike) return "jp-shinsaibashi-station";
  if ((compact.includes("nambastation") || compact.includes("nankainamba") || compact.includes("난바역") || compact.includes("난카이난바") || compact.includes("難波駅") || compact.includes("なんば駅")) && stationLike) return "jp-namba-station";
  return null;
}

const localizedStationLabels = {
  "jp-tokyo-station": {
    ko: { name: "도쿄역", address: "일본 도쿄도 지요다구 마루노우치" },
    en: { name: "Tokyo Station", address: "Tokyo Station, Marunouchi, Tokyo" },
    ja: { name: "東京駅", address: "東京都千代田区丸の内" },
  },
  "jp-shinsaibashi-station": {
    ko: { name: "신사이바시역", address: "일본 오사카부 오사카시 주오구 신사이바시스지" },
    en: { name: "Shinsaibashi Station", address: "Shinsaibashi Station, Chuo Ward, Osaka" },
    ja: { name: "心斎橋駅", address: "大阪府大阪市中央区心斎橋筋" },
  },
  "jp-namba-station": {
    ko: { name: "난바역", address: "일본 오사카부 오사카시 주오구 난바" },
    en: { name: "Namba Station", address: "Namba Station, Chuo Ward, Osaka" },
    ja: { name: "なんば駅", address: "大阪府大阪市中央区難波" },
  },
};

function inferPlaceCategory(value) {
  const text = value.toLowerCase();
  if (text.includes("beach") || text.includes("해변") || text.includes("바다")) return "beach";
  if (text.includes("stadium") || text.includes("야구") || text.includes("sports") || text.includes("스포츠")) return "sports";
  if (text.includes("mountain") || text.includes("산")) return "mountain";
  if (text.includes("airport") || text.includes("공항")) return "airport";
  if (text.includes("hotel") || text.includes("호텔")) return "hotel";
  if (text.includes("school") || text.includes("학교")) return "school";
  return "custom";
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function setCorsHeaders(response) {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET, OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type");
}

function getRequiredParam(params, key) {
  const value = params.get(key);
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function normalizeKmaServiceKey(serviceKey) {
  try {
    return serviceKey.includes("%") ? decodeURIComponent(serviceKey) : serviceKey;
  } catch {
    return serviceKey;
  }
}

function getKmaForecastBaseDateTime(now = new Date()) {
  const parts = getSeoulDateTimeParts(now);
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let selectedHour;
  for (const hour of baseTimes) {
    if (parts.hour > hour || (parts.hour === hour && parts.minute >= 10)) selectedHour = hour;
  }
  if (selectedHour == null) {
    const previous = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - 1));
    return {
      baseDate: formatKmaDate({
        year: previous.getUTCFullYear(),
        month: previous.getUTCMonth() + 1,
        day: previous.getUTCDate(),
      }),
      baseTime: "2300",
    };
  }
  return {
    baseDate: formatKmaDate(parts),
    baseTime: `${String(selectedHour).padStart(2, "0")}00`,
  };
}

function getSeoulDateTimeParts(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const entries = formatter.formatToParts(date).map((part) => [part.type, part.value]);
  const parts = Object.fromEntries(entries);
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function formatKmaDate(parts) {
  return `${parts.year}${String(parts.month).padStart(2, "0")}${String(parts.day).padStart(2, "0")}`;
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
