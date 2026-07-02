const DEFAULT_KMA_FORECAST_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const DEFAULT_OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const DEFAULT_KAKAO_LOCAL_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const DEFAULT_KAKAO_DIRECTIONS_URL = "https://apis-navi.kakaomobility.com/v1/directions";
const DEFAULT_GOOGLE_DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_PLACE_CACHE_TTL_MS = 30 * 60 * 1000;
const DEFAULT_ROUTE_CACHE_TTL_MS = 10 * 60 * 1000;

const forecastCache = new Map();
const placeSearchCache = new Map();
const routeEstimateCache = new Map();

export default {
  async fetch(request, env = {}) {
    return handleWeatherProxyRequest(request, env);
  },
};

export async function handleWeatherProxyRequest(request, env = {}) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405);
    if (url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "weatheron-weather-proxy", runtime: "cloudflare-worker" });
    }
    if (url.pathname === "/weather/kma") {
      return jsonResponse(await fetchKmaForecast(url.searchParams, env));
    }
    if (url.pathname === "/weather/openmeteo") {
      return jsonResponse(await fetchOpenMeteoForecast(url.searchParams, env));
    }
    if (url.pathname === "/places/search") {
      return jsonResponse(await searchPlaces(url.searchParams, env));
    }
    if (url.pathname === "/routes/estimate") {
      return jsonResponse(await estimateRoute(url.searchParams, env));
    }
    return jsonResponse({ error: "not_found" }, 404);
  } catch (error) {
    return jsonResponse(
      { error: "weather_proxy_error", message: error instanceof Error ? error.message : "weather_proxy_error" },
      502,
    );
  }
}

async function fetchKmaForecast(params, env) {
  const serviceKey = readEnv(env, "KMA_SERVICE_KEY");
  if (!serviceKey) throw new Error("KMA_SERVICE_KEY is not configured");
  const nx = getRequiredParam(params, "nx");
  const ny = getRequiredParam(params, "ny");
  const base = getKmaForecastBaseDateTime();
  const url = new URL(readEnv(env, "KMA_FORECAST_URL") ?? DEFAULT_KMA_FORECAST_URL);
  url.searchParams.set("serviceKey", normalizeKmaServiceKey(serviceKey));
  url.searchParams.set("pageNo", params.get("pageNo") ?? "1");
  url.searchParams.set("numOfRows", params.get("numOfRows") ?? "1000");
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("base_date", params.get("baseDate") ?? params.get("base_date") ?? base.baseDate);
  url.searchParams.set("base_time", params.get("baseTime") ?? params.get("base_time") ?? base.baseTime);
  url.searchParams.set("nx", nx);
  url.searchParams.set("ny", ny);
  return fetchCachedJson(forecastCache, getUrlCacheKey("kma", url, ["serviceKey"]), readTtl(env, "WEATHER_CACHE_TTL_MS", DEFAULT_WEATHER_CACHE_TTL_MS), () =>
    fetchJson(url, env),
  );
}

async function fetchOpenMeteoForecast(params, env) {
  const latitude = getRequiredParam(params, "latitude");
  const longitude = getRequiredParam(params, "longitude");
  const url = new URL(readEnv(env, "OPEN_METEO_FORECAST_URL") ?? DEFAULT_OPEN_METEO_FORECAST_URL);
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
  return fetchCachedJson(forecastCache, getUrlCacheKey("openmeteo", url), readTtl(env, "WEATHER_CACHE_TTL_MS", DEFAULT_WEATHER_CACHE_TTL_MS), () =>
    fetchJson(url, env),
  );
}

async function searchPlaces(params, env) {
  const query = params.get("q") ?? "";
  const searchQuery = getPlaceSearchQueryAlias(query);
  const countryCode = normalizeCountryCode(params.get("countryCode")) ?? inferPlaceSearchCountryCode(searchQuery);
  const language = normalizeSearchLanguage(params.get("language") ?? params.get("locale"));
  if (query.trim().length < 2) return [];

  return fetchCachedJson(placeSearchCache, `places:${countryCode}:${language}:${query.trim().toLowerCase()}`, readTtl(env, "PLACE_CACHE_TTL_MS", DEFAULT_PLACE_CACHE_TTL_MS), async () => {
    try {
      if (countryCode === "KR" && readEnv(env, "KAKAO_REST_API_KEY")) return await searchKakaoPlaces(searchQuery, env);
      if (getGoogleMapsApiKey(env)) return await searchGooglePlaces(searchQuery, countryCode, language, env);
    } catch (error) {
      console.warn(`place provider fallback: ${error instanceof Error ? error.message : "unknown_error"}`);
    }
    return searchFixturePlaces(searchQuery);
  });
}

function normalizeCountryCode(value) {
  if (value === "KR" || value === "JP" || value === "GLOBAL") return value;
  return null;
}

function inferPlaceSearchCountryCode(query) {
  const text = query.trim().toLowerCase();
  if (!text) return "KR";
  const jpKeywords = ["tokyo", "osaka", "kyoto", "sapporo", "fukuoka", "japan", "도쿄", "오사카", "교토", "삿포로", "후쿠오카", "일본", "東京", "大阪", "京都"];
  if (jpKeywords.some((keyword) => text.includes(keyword.toLowerCase()))) return "JP";
  const globalKeywords = ["singapore", "marina bay", "bangkok", "taipei", "hong kong", "paris", "london", "new york", "싱가포르", "방콕", "타이베이", "홍콩", "파리", "런던", "뉴욕"];
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
  "도쿄": "Tokyo",
  "도쿄 역": "Tokyo Station",
  "도쿄역": "Tokyo Station",
  "東京駅": "Tokyo Station",
  "시부야": "Shibuya",
  "신주쿠": "Shinjuku",
  "오사카": "Osaka",
  "교토": "Kyoto",
  "삿포로": "Sapporo",
  "후쿠오카": "Fukuoka",
  "싱가포르": "Singapore",
  "마리나베이": "Marina Bay",
  "마리나 베이": "Marina Bay",
  "잠실 야구장": "잠실종합운동장",
  "jamsil stadium": "잠실종합운동장",
  "방콕": "Bangkok",
  "타이베이": "Taipei",
  "홍콩": "Hong Kong",
  "파리": "Paris",
  "런던": "London",
  "뉴욕": "New York",
};

async function searchKakaoPlaces(query, env) {
  const url = new URL(readEnv(env, "KAKAO_LOCAL_KEYWORD_URL") ?? DEFAULT_KAKAO_LOCAL_KEYWORD_URL);
  url.searchParams.set("query", query || "강릉 안목해변");
  url.searchParams.set("size", "8");
  const payload = await fetchJson(url, env, {
    Authorization: `KakaoAK ${readEnv(env, "KAKAO_REST_API_KEY")}`,
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

async function searchGooglePlaces(query, countryCode, language, env) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query || "Tokyo Station");
  url.searchParams.set("key", getGoogleMapsApiKey(env));
  url.searchParams.set("language", language);
  if (countryCode === "JP") {
    url.searchParams.set("components", "country:JP");
    url.searchParams.set("region", "jp");
  }
  const payload = await fetchJson(url, env);
  if (payload.status !== "OK" && payload.status !== "ZERO_RESULTS") throw new Error(`google geocoding failed: ${payload.status ?? "unknown_status"}`);
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

function getGoogleMapsApiKey(env) {
  return readEnv(env, "GOOGLE_MAPS_API_KEY") ?? readEnv(env, "GOOGLE_GEOCODING_API_KEY");
}

function getGooglePlaceName(item) {
  const firstNamedComponent = item.address_components?.find((component) =>
    component.types?.some((type) => ["point_of_interest", "establishment", "premise", "route", "locality"].includes(type)),
  );
  return firstNamedComponent?.long_name ?? item.formatted_address?.split(",")[0] ?? "Google Maps result";
}

async function estimateRoute(params, env) {
  const origin = readCoordinate(params, "origin");
  const destination = readCoordinate(params, "destination");
  const originName = params.get("originName") ?? "현재 위치";
  const destinationName = params.get("destinationName") ?? "목적지";
  const originCountryCode = normalizeCountryCode(params.get("originCountryCode")) ?? "KR";
  const destinationCountryCode = normalizeCountryCode(params.get("destinationCountryCode")) ?? inferPlaceSearchCountryCode(destinationName);
  const cacheKey = `route:${originCountryCode}:${destinationCountryCode}:${formatCoordinateKey(origin)}:${formatCoordinateKey(destination)}`;

  return fetchCachedJson(routeEstimateCache, cacheKey, readTtl(env, "ROUTE_CACHE_TTL_MS", DEFAULT_ROUTE_CACHE_TTL_MS), async () => {
    try {
      if (originCountryCode === "KR" && destinationCountryCode === "KR" && readEnv(env, "KAKAO_REST_API_KEY")) {
        return await estimateKakaoRoute(origin, destination, originName, destinationName, env);
      }
      if (originCountryCode === destinationCountryCode && destinationCountryCode !== "KR" && getGoogleMapsApiKey(env)) {
        return await estimateGoogleRoute(origin, destination, destinationCountryCode, env);
      }
    } catch (error) {
      console.warn(`route provider fallback: ${error instanceof Error ? error.message : "unknown_error"}`);
    }
    return estimateFallbackRoute(origin, destination, destinationCountryCode);
  });
}

async function estimateKakaoRoute(origin, destination, originName, destinationName, env) {
  const url = new URL(readEnv(env, "KAKAO_DIRECTIONS_URL") ?? DEFAULT_KAKAO_DIRECTIONS_URL);
  url.searchParams.set("origin", `${origin.longitude},${origin.latitude},name=${originName}`);
  url.searchParams.set("destination", `${destination.longitude},${destination.latitude},name=${destinationName}`);
  url.searchParams.set("priority", "TIME");
  url.searchParams.set("summary", "true");
  url.searchParams.set("alternatives", "false");
  const payload = await fetchJson(url, env, {
    Authorization: `KakaoAK ${readEnv(env, "KAKAO_REST_API_KEY")}`,
    "Content-Type": "application/json",
  });
  const summary = payload.routes?.find((route) => route?.result_code === 0)?.summary ?? payload.routes?.[0]?.summary;
  const durationSeconds = Number(summary?.duration);
  const distanceMeters = Number(summary?.distance);
  if (!Number.isFinite(durationSeconds) || !Number.isFinite(distanceMeters)) throw new Error("kakao route response is empty");
  return {
    provider: "kakao",
    status: "ready",
    travelMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
    distanceMeters: Math.max(0, Math.round(distanceMeters)),
    message: "Kakao Directions 기준",
  };
}

async function estimateGoogleRoute(origin, destination, destinationCountryCode, env) {
  const url = new URL(readEnv(env, "GOOGLE_DISTANCE_MATRIX_URL") ?? DEFAULT_GOOGLE_DISTANCE_MATRIX_URL);
  url.searchParams.set("origins", `${origin.latitude},${origin.longitude}`);
  url.searchParams.set("destinations", `${destination.latitude},${destination.longitude}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", destinationCountryCode === "JP" ? "ja" : "en");
  url.searchParams.set("key", getGoogleMapsApiKey(env));
  if (destinationCountryCode === "JP") url.searchParams.set("region", "jp");
  const payload = await fetchJson(url, env);
  if (payload.status !== "OK") throw new Error(`google route failed: ${payload.status ?? "unknown_status"}`);
  const element = payload.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") throw new Error(`google route element failed: ${element?.status ?? "empty"}`);
  const durationSeconds = Number(element.duration?.value);
  const distanceMeters = Number(element.distance?.value);
  if (!Number.isFinite(durationSeconds) || !Number.isFinite(distanceMeters)) throw new Error("google route response is empty");
  return {
    provider: "google",
    status: "ready",
    travelMinutes: Math.max(1, Math.ceil(durationSeconds / 60)),
    distanceMeters: Math.max(0, Math.round(distanceMeters)),
    message: "Google Distance Matrix 기준",
  };
}

function estimateFallbackRoute(origin, destination, destinationCountryCode = "KR") {
  const directDistanceMeters = getDistanceMeters(origin, destination);
  const roadDistanceMeters = Math.round(directDistanceMeters * (destinationCountryCode === "KR" ? 1.35 : 1));
  const travelMinutes = destinationCountryCode === "KR" ? Math.max(15, Math.ceil((roadDistanceMeters / 1000 / 32) * 60)) : destinationCountryCode === "JP" ? 150 : 180;
  return {
    provider: "fallback",
    status: "fallback",
    travelMinutes,
    distanceMeters: roadDistanceMeters,
    message: destinationCountryCode === "KR" ? "좌표 거리 기반 추정" : "해외 목적지 기본 이동시간",
  };
}

async function fetchJson(url, env, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), readTtl(env, "WEATHER_TIMEOUT_MS", DEFAULT_TIMEOUT_MS));
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
    address: "Tokyo Station, Marunouchi, Tokyo",
    category: "custom",
    countryCode: "JP",
    coordinate: { latitude: 35.6812, longitude: 139.7671 },
    timezone: "Asia/Tokyo",
    provider: "fixture",
  },
  {
    id: "global-singapore-marina-bay",
    name: "Marina Bay",
    address: "Marina Bay, Singapore",
    category: "custom",
    countryCode: "GLOBAL",
    coordinate: { latitude: 1.2834, longitude: 103.8607 },
    timezone: "Asia/Singapore",
    provider: "fixture",
  },
];

function searchFixturePlaces(query) {
  const normalizedQuery = getPlaceSearchQueryAlias(query).trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalizedQuery) return placeSearchFixtures.slice(0, 3);
  return placeSearchFixtures.filter((place) => {
    const haystack = `${place.name} ${place.address} ${place.category} ${place.countryCode} ${getPlaceSearchQueryAlias(place.name)}`
      .toLowerCase()
      .replace(/\s+/g, " ");
    return haystack.includes(normalizedQuery) || normalizedQuery.split(/\s+/).every((token) => haystack.includes(token));
  });
}

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

function readCoordinate(params, key) {
  const value = getRequiredParam(params, key);
  const [latitudeText, longitudeText] = value.split(",");
  const coordinate = { latitude: Number(latitudeText), longitude: Number(longitudeText) };
  if (!Number.isFinite(coordinate.latitude) || !Number.isFinite(coordinate.longitude)) throw new Error(`${key} coordinate is invalid`);
  return coordinate;
}

function formatCoordinateKey(coordinate) {
  return `${coordinate.latitude.toFixed(5)},${coordinate.longitude.toFixed(5)}`;
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
      baseDate: formatKmaDate({ year: previous.getUTCFullYear(), month: previous.getUTCMonth() + 1, day: previous.getUTCDate() }),
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

function readEnv(env, key) {
  return env?.[key] ?? globalThis.process?.env?.[key];
}

function readTtl(env, key, fallback) {
  return Number(readEnv(env, key)) || fallback;
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(),
      "content-type": "application/json; charset=utf-8",
    },
  });
}
