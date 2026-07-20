// index.mjs(Node 서버)와 worker.mjs(Cloudflare Worker)가 공유하는 프록시 코어.
// 런타임별 어댑터는 요청/응답 변환과 CORS만 담당하고, 라우팅·업스트림 호출·캐시는 여기서 처리한다.
import { getKmaForecastBaseDateTime } from "./kmaTime.mjs";

const DEFAULT_KMA_FORECAST_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";
const DEFAULT_OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const DEFAULT_KAKAO_LOCAL_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const DEFAULT_KAKAO_DIRECTIONS_URL = "https://apis-navi.kakaomobility.com/v1/directions";
const DEFAULT_GOOGLE_DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_PLACE_CACHE_TTL_MS = 30 * 60 * 1000;
const DEFAULT_ROUTE_CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

export const PROXY_TOKEN_HEADER = "x-weatheron-proxy-token";

const forecastCache = new Map();
const placeSearchCache = new Map();
const routeEstimateCache = new Map();
const pendingCacheFetches = new Map();

// 프로바이더 장애로 만든 대체 응답은 캐시하지 않고 이 에러로 전달해,
// 장애 복구 후에도 TTL 동안 픽스처 결과가 남는 문제를 막는다.
class UncachedFallbackError extends Error {
  constructor(payload) {
    super("provider_fallback");
    this.payload = payload;
  }
}

/**
 * @param {URL} url 요청 URL
 * @param {(key: string) => string | undefined} readEnvValue 런타임별 환경변수 리더
 * @param {(name: string) => string | null | undefined} getRequestHeader 요청 헤더 리더(소문자 이름)
 * @param {{ runtime?: string }} [options] health 응답에 노출할 런타임 식별자
 * @returns {Promise<{ status: number, payload: unknown }>}
 */
export async function handleProxyRoute(url, readEnvValue, getRequestHeader, options = {}) {
  if (url.pathname === "/health") {
    return {
      status: 200,
      payload: {
        ok: true,
        service: "weatheron-weather-proxy",
        ...(options.runtime ? { runtime: options.runtime } : {}),
      },
    };
  }
  if (!isAuthorizedRequest(readEnvValue, getRequestHeader)) {
    return { status: 401, payload: { error: "unauthorized" } };
  }
  if (url.pathname === "/weather/kma") {
    return { status: 200, payload: await fetchKmaForecast(url.searchParams, readEnvValue) };
  }
  if (url.pathname === "/weather/openmeteo") {
    return { status: 200, payload: await fetchOpenMeteoForecast(url.searchParams, readEnvValue) };
  }
  if (url.pathname === "/places/search") {
    return { status: 200, payload: await searchPlaces(url.searchParams, readEnvValue) };
  }
  if (url.pathname === "/routes/estimate") {
    return { status: 200, payload: await estimateRoute(url.searchParams, readEnvValue) };
  }
  return { status: 404, payload: { error: "not_found" } };
}

// PROXY_ACCESS_TOKEN이 설정된 경우에만 검사하는 옵트인 인증.
// 앱 배포와 함께 켜기 전까지는 기존 배포 클라이언트와의 호환을 유지한다.
function isAuthorizedRequest(readEnvValue, getRequestHeader) {
  const requiredToken = readEnvValue("PROXY_ACCESS_TOKEN");
  if (!requiredToken) return true;
  // 쿼리 문자열 토큰은 서버·분석 로그와 공유 URL에 남으므로 허용하지 않는다.
  const providedToken = getRequestHeader?.(PROXY_TOKEN_HEADER);
  return providedToken === requiredToken;
}

async function fetchKmaForecast(params, readEnvValue) {
  const serviceKey = readEnvValue("KMA_SERVICE_KEY");
  if (!serviceKey) throw new Error("KMA_SERVICE_KEY is not configured");
  const nx = getRequiredParam(params, "nx");
  const ny = getRequiredParam(params, "ny");
  const base = getKmaForecastBaseDateTime();
  const url = new URL(readEnvValue("KMA_FORECAST_URL") ?? DEFAULT_KMA_FORECAST_URL);
  url.searchParams.set("serviceKey", normalizeKmaServiceKey(serviceKey));
  url.searchParams.set("pageNo", params.get("pageNo") ?? "1");
  url.searchParams.set("numOfRows", params.get("numOfRows") ?? "1000");
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("base_date", params.get("baseDate") ?? params.get("base_date") ?? base.baseDate);
  url.searchParams.set("base_time", params.get("baseTime") ?? params.get("base_time") ?? base.baseTime);
  url.searchParams.set("nx", nx);
  url.searchParams.set("ny", ny);
  return fetchCachedJson(
    forecastCache,
    getUrlCacheKey("kma", url, ["serviceKey"]),
    readNumberEnv(readEnvValue, "WEATHER_CACHE_TTL_MS", DEFAULT_WEATHER_CACHE_TTL_MS),
    () => fetchJson(url, readEnvValue),
  );
}

async function fetchOpenMeteoForecast(params, readEnvValue) {
  const latitude = getRequiredParam(params, "latitude");
  const longitude = getRequiredParam(params, "longitude");
  const url = new URL(readEnvValue("OPEN_METEO_FORECAST_URL") ?? DEFAULT_OPEN_METEO_FORECAST_URL);
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
  return fetchCachedJson(
    forecastCache,
    getUrlCacheKey("openmeteo", url),
    readNumberEnv(readEnvValue, "WEATHER_CACHE_TTL_MS", DEFAULT_WEATHER_CACHE_TTL_MS),
    () => fetchJson(url, readEnvValue),
  );
}

async function searchPlaces(params, readEnvValue) {
  const query = params.get("q") ?? "";
  const searchQuery = getPlaceSearchQueryAlias(query);
  const countryCode = normalizeCountryCode(params.get("countryCode")) ?? inferPlaceSearchCountryCode(searchQuery);
  const language = normalizeSearchLanguage(params.get("language") ?? params.get("locale"));
  const origin = readOptionalSearchOrigin(params);
  if (query.trim().length < 2) return [];

  const originKey = origin ? formatCoordinateKey(origin) : "none";
  return fetchCachedJson(
    placeSearchCache,
    `places:${countryCode}:${language}:${originKey}:${query.trim().toLowerCase()}`,
    readNumberEnv(readEnvValue, "PLACE_CACHE_TTL_MS", DEFAULT_PLACE_CACHE_TTL_MS),
    async () => {
      const curatedResults = localizePlaceSearchResults(searchFixturePlaces(searchQuery), language);
      try {
        if (countryCode === "KR" && readEnvValue("KAKAO_REST_API_KEY")) {
          return sortPlacesByDistance(
            mergePlaceSearchResults(curatedResults, await searchKakaoPlaces(searchQuery, origin, readEnvValue)),
            origin,
          );
        }
        if (getGoogleMapsApiKey(readEnvValue)) {
          const googleResults = localizePlaceSearchResults(
            await searchGooglePlaces(searchQuery, countryCode, language, readEnvValue),
            language,
          );
          return mergePlaceSearchResults(curatedResults, googleResults);
        }
      } catch (error) {
        console.warn(`place provider fallback: ${error instanceof Error ? error.message : "unknown_error"}`);
        throw new UncachedFallbackError(curatedResults);
      }
      return curatedResults;
    },
  );
}

async function estimateRoute(params, readEnvValue) {
  const origin = readCoordinate(params, "origin");
  const destination = readCoordinate(params, "destination");
  const originName = params.get("originName") ?? "현재 위치";
  const destinationName = params.get("destinationName") ?? "목적지";
  const originCountryCode = normalizeCountryCode(params.get("originCountryCode")) ?? "KR";
  const destinationCountryCode =
    normalizeCountryCode(params.get("destinationCountryCode")) ?? inferPlaceSearchCountryCode(destinationName);
  const cacheKey = `route:${originCountryCode}:${destinationCountryCode}:${formatCoordinateKey(origin)}:${formatCoordinateKey(destination)}`;

  return fetchCachedJson(
    routeEstimateCache,
    cacheKey,
    readNumberEnv(readEnvValue, "ROUTE_CACHE_TTL_MS", DEFAULT_ROUTE_CACHE_TTL_MS),
    async () => {
      try {
        if (shouldUseKakaoRoute(originCountryCode, destinationCountryCode) && readEnvValue("KAKAO_REST_API_KEY")) {
          return await estimateKakaoRoute(origin, destination, originName, destinationName, readEnvValue);
        }
        if (shouldUseGoogleRoute(originCountryCode, destinationCountryCode) && getGoogleMapsApiKey(readEnvValue)) {
          return await estimateGoogleRoute(origin, destination, destinationCountryCode, readEnvValue);
        }
      } catch (error) {
        console.warn(`route provider fallback: ${error instanceof Error ? error.message : "unknown_error"}`);
        throw new UncachedFallbackError(estimateFallbackRoute(origin, destination, destinationCountryCode));
      }
      return estimateFallbackRoute(origin, destination, destinationCountryCode);
    },
  );
}

function shouldUseKakaoRoute(originCountryCode, destinationCountryCode) {
  return originCountryCode === "KR" && destinationCountryCode === "KR";
}

function shouldUseGoogleRoute(originCountryCode, destinationCountryCode) {
  return originCountryCode === destinationCountryCode && destinationCountryCode !== "KR";
}

async function searchKakaoPlaces(query, origin, readEnvValue) {
  const url = new URL(readEnvValue("KAKAO_LOCAL_KEYWORD_URL") ?? DEFAULT_KAKAO_LOCAL_KEYWORD_URL);
  url.searchParams.set("query", query || "강릉 안목해변");
  url.searchParams.set("size", "8");
  if (origin) {
    url.searchParams.set("x", String(origin.longitude));
    url.searchParams.set("y", String(origin.latitude));
    url.searchParams.set("sort", "distance");
  }
  const payload = await fetchJson(url, readEnvValue, {
    Authorization: `KakaoAK ${readEnvValue("KAKAO_REST_API_KEY")}`,
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

async function searchGooglePlaces(query, countryCode, language, readEnvValue) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query || "Tokyo Station");
  url.searchParams.set("key", getGoogleMapsApiKey(readEnvValue));
  url.searchParams.set("language", language);
  if (countryCode === "JP") {
    url.searchParams.set("components", "country:JP");
    url.searchParams.set("region", "jp");
  }
  const payload = await fetchJson(url, readEnvValue);
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

function getGoogleMapsApiKey(readEnvValue) {
  return readEnvValue("GOOGLE_MAPS_API_KEY") ?? readEnvValue("GOOGLE_GEOCODING_API_KEY");
}

function getGooglePlaceName(item) {
  const firstNamedComponent = item.address_components?.find((component) =>
    component.types?.some((type) => ["point_of_interest", "establishment", "premise", "route", "locality"].includes(type)),
  );
  return firstNamedComponent?.long_name ?? item.formatted_address?.split(",")[0] ?? "Google Maps result";
}

async function estimateKakaoRoute(origin, destination, originName, destinationName, readEnvValue) {
  const url = new URL(readEnvValue("KAKAO_DIRECTIONS_URL") ?? DEFAULT_KAKAO_DIRECTIONS_URL);
  url.searchParams.set("origin", `${origin.longitude},${origin.latitude},name=${originName}`);
  url.searchParams.set("destination", `${destination.longitude},${destination.latitude},name=${destinationName}`);
  url.searchParams.set("priority", "TIME");
  url.searchParams.set("summary", "true");
  url.searchParams.set("alternatives", "false");
  const payload = await fetchJson(url, readEnvValue, {
    Authorization: `KakaoAK ${readEnvValue("KAKAO_REST_API_KEY")}`,
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

async function estimateGoogleRoute(origin, destination, destinationCountryCode, readEnvValue) {
  const url = new URL(readEnvValue("GOOGLE_DISTANCE_MATRIX_URL") ?? DEFAULT_GOOGLE_DISTANCE_MATRIX_URL);
  url.searchParams.set("origins", `${origin.latitude},${origin.longitude}`);
  url.searchParams.set("destinations", `${destination.latitude},${destination.longitude}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", getGoogleRouteLanguage(destinationCountryCode));
  url.searchParams.set("key", getGoogleMapsApiKey(readEnvValue));
  if (destinationCountryCode === "JP") url.searchParams.set("region", "jp");
  const payload = await fetchJson(url, readEnvValue);
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

function getGoogleRouteLanguage(countryCode) {
  if (countryCode === "JP") return "ja";
  if (countryCode === "KR") return "ko";
  return "en";
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

// 모바일과 동일한 외부 지오코더용 검색어 별칭.
// TS(shared)와 서버(mjs)는 배포 경계(Docker가 apps/server만 복사)로 사본을 유지한다.
// 수정 시 packages/shared/src/fixtures/placeSearchAliases.ts와 함께 갱신할 것.
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
  return placeSearchFixtures.filter((place) => {
    const haystack = `${place.name} ${place.address} ${place.category} ${place.countryCode} ${getPlaceSearchQueryAlias(place.name)}`
      .toLowerCase()
      .replace(/\s+/g, " ");
    return haystack.includes(normalizedQuery) || normalizedQuery.split(/\s+/).every((token) => haystack.includes(token));
  });
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

function readOptionalSearchOrigin(params) {
  const latitudeText = params.get("latitude");
  const longitudeText = params.get("longitude");
  if (latitudeText === null || longitudeText === null) return null;
  const coordinate = { latitude: Number(latitudeText), longitude: Number(longitudeText) };
  if (
    !Number.isFinite(coordinate.latitude) ||
    !Number.isFinite(coordinate.longitude) ||
    Math.abs(coordinate.latitude) > 90 ||
    Math.abs(coordinate.longitude) > 180
  ) {
    throw new Error("place search origin coordinate is invalid");
  }
  return coordinate;
}

function sortPlacesByDistance(places, origin) {
  if (!origin) return places;
  return places
    .map((place, index) => ({ place, index, distanceMeters: getDistanceMeters(origin, place.coordinate) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters || a.index - b.index)
    .map((item) => item.place);
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

async function fetchJson(url, readEnvValue, headers = {}) {
  const timeoutMs = readNumberEnv(readEnvValue, "WEATHER_TIMEOUT_MS", DEFAULT_TIMEOUT_MS);
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
  const pending = pendingCacheFetches.get(key);
  if (pending) return pending;
  const request = (async () => {
    try {
      const payload = await fetcher();
      cache.set(key, { payload, cachedAt: Date.now() });
      enforceCacheLimit(cache);
      return payload;
    } catch (error) {
      // 만료된 캐시라도 프로바이더 대체 응답(픽스처)보다는 실제 데이터가 낫다.
      if (cached) return cached.payload;
      if (error instanceof UncachedFallbackError) return error.payload;
      throw error;
    } finally {
      pendingCacheFetches.delete(key);
    }
  })();
  pendingCacheFetches.set(key, request);
  return request;
}

function enforceCacheLimit(cache) {
  // Map은 삽입 순서를 유지하므로 앞에서부터 지우면 가장 오래된 항목이 제거된다.
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
}

function getUrlCacheKey(prefix, url, omitParams = []) {
  const normalized = new URL(url.toString());
  for (const param of omitParams) normalized.searchParams.delete(param);
  normalized.searchParams.sort();
  return `${prefix}:${normalized.pathname}?${normalized.searchParams.toString()}`;
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

function readNumberEnv(readEnvValue, key, fallback) {
  return Number(readEnvValue(key)) || fallback;
}
