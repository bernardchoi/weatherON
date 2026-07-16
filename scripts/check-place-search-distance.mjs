import assert from "node:assert/strict";
import worker from "../apps/server/src/worker.mjs";
import { sortPlaceSearchResults } from "../apps/mobile/src/utils/placeSearchRanking.ts";

const originalFetch = globalThis.fetch;
const upstreamUrls = [];

globalThis.fetch = async (input) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  upstreamUrls.push(url);
  return new Response(JSON.stringify({ documents: buildClinicDocuments() }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

try {
  const rankedClinics = sortPlaceSearchResults(buildAppClinicResults(), "한의원", {
    coordinate: { latitude: 37.5446, longitude: 127.0559 },
  });
  assert.equal(rankedClinics[0].name, "성수 가까운 한의원", "app ranking should prefer distance over name prefix relevance");

  const env = {
    KAKAO_REST_API_KEY: "test-key",
    KAKAO_LOCAL_KEYWORD_URL: "https://kakao.test/places",
    PLACE_CACHE_TTL_MS: "1800000",
    WEATHER_TIMEOUT_MS: "8000",
  };
  const query = encodeURIComponent("한의원 거리 회귀");
  const nearSeongsu = await fetchWorkerJson(`/places/search?q=${query}&latitude=37.5446&longitude=127.0559`, env);
  assert.equal(nearSeongsu[0].name, "성수 가까운 한의원", "current-location nearest clinic should be first");

  const nearJamsil = await fetchWorkerJson(`/places/search?q=${query}&latitude=37.5122&longitude=127.0719`, env);
  assert.equal(nearJamsil[0].name, "잠실 가까운 한의원", "cache must not reuse results from another origin");
  assert.equal(upstreamUrls.length, 2, "different origins should use different place-search cache entries");

  for (const url of upstreamUrls) {
    assert.equal(url.searchParams.get("sort"), "distance", "Kakao search should request distance ordering");
    assert.ok(url.searchParams.has("x"), "Kakao search should receive longitude");
    assert.ok(url.searchParams.has("y"), "Kakao search should receive latitude");
  }

  console.log("place search distance check passed");
} finally {
  globalThis.fetch = originalFetch;
}

async function fetchWorkerJson(path, env) {
  const response = await worker.fetch(new Request(`https://weatheron-api.test${path}`), env);
  const bodyText = await response.text();
  if (!response.ok) throw new Error(`request failed: ${response.status} ${bodyText}`);
  return JSON.parse(bodyText);
}

function buildClinicDocuments() {
  return [
    {
      id: "clinic-jamsil",
      place_name: "잠실 가까운 한의원",
      road_address_name: "서울 송파구 올림픽로",
      address_name: "서울 송파구 잠실동",
      category_name: "의료,건강 > 병원 > 한의원",
      category_group_name: "병원",
      x: "127.0718",
      y: "37.5123",
    },
    {
      id: "clinic-seongsu",
      place_name: "성수 가까운 한의원",
      road_address_name: "서울 성동구 성수이로",
      address_name: "서울 성동구 성수동",
      category_name: "의료,건강 > 병원 > 한의원",
      category_group_name: "병원",
      x: "127.0560",
      y: "37.5447",
    },
  ];
}

function buildAppClinicResults() {
  return [
    {
      id: "far-prefix-clinic",
      name: "한의원365",
      address: "서울 송파구 잠실동",
      category: "medical",
      countryCode: "KR",
      coordinate: { latitude: 37.5123, longitude: 127.0718 },
      timezone: "Asia/Seoul",
      provider: "kakao",
    },
    {
      id: "near-clinic",
      name: "성수 가까운 한의원",
      address: "서울 성동구 성수동",
      category: "medical",
      countryCode: "KR",
      coordinate: { latitude: 37.5447, longitude: 127.0560 },
      timezone: "Asia/Seoul",
      provider: "kakao",
    },
  ];
}
