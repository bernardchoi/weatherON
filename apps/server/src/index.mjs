import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOT_DIR = resolve(SERVER_DIR, "../..");
const DEFAULT_KMA_FORECAST_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const DEFAULT_OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const DEFAULT_TIMEOUT_MS = 8000;

loadEnvFile(join(ROOT_DIR, ".env"));
loadEnvFile(join(ROOT_DIR, ".env.local"));
loadEnvFile(join(SERVER_DIR, ".env"));
loadEnvFile(join(SERVER_DIR, ".env.local"));

const host = process.env.WEATHER_SERVER_HOST ?? "127.0.0.1";
const port = Number(process.env.WEATHER_SERVER_PORT) || 8091;
const timeoutMs = Number(process.env.WEATHER_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

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
  return fetchJson(url);
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
  return fetchJson(url);
}

async function searchPlaces(params) {
  const query = params.get("q") ?? "";
  const countryCode = normalizeCountryCode(params.get("countryCode")) ?? inferPlaceSearchCountryCode(query);
  try {
    if (countryCode === "KR" && process.env.KAKAO_REST_API_KEY) {
      return await searchKakaoPlaces(query);
    }
    if (getGoogleMapsApiKey()) {
      return await searchGooglePlaces(query, countryCode);
    }
  } catch (error) {
    console.warn(`place provider fallback: ${error instanceof Error ? error.message : "unknown_error"}`);
  }
  return searchFixturePlaces(query);
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

async function searchKakaoPlaces(query) {
  const url = new URL("https://dapi.kakao.com/v2/local/search/keyword.json");
  url.searchParams.set("query", query || "강릉 안목해변");
  url.searchParams.set("size", "5");
  const payload = await fetchJson(url, {
    Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
  });
  return (payload.documents ?? []).map((item) => ({
    id: `kakao-${item.id}`,
    name: item.place_name,
    address: item.road_address_name || item.address_name,
    category: inferPlaceCategory(`${item.category_name} ${item.place_name}`),
    countryCode: "KR",
    coordinate: {
      latitude: Number(item.y),
      longitude: Number(item.x),
    },
    timezone: "Asia/Seoul",
    provider: "kakao",
  }));
}

async function searchGooglePlaces(query, countryCode) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query || "Tokyo Station");
  url.searchParams.set("key", getGoogleMapsApiKey());
  url.searchParams.set("language", "ko");
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
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return placeSearchFixtures.slice(0, 3);
  return placeSearchFixtures.filter((place) =>
    `${place.name} ${place.address} ${place.category} ${place.countryCode}`.toLowerCase().includes(normalizedQuery),
  );
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
