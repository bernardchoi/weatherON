const baseUrl = process.env.WEATHERON_PUBLIC_PROXY_URL || process.env.EXPO_PUBLIC_WEATHER_API_BASE_URL || "";
const issues = [];

if (!isPublicHttpsUrl(baseUrl)) {
  issues.push("WEATHERON_PUBLIC_PROXY_URL must be a public https URL");
}

try {
  if (issues.length === 0) {
    const health = await fetchJson(new URL("/health", normalizeBaseUrl(baseUrl)).toString());
    if (!health.ok) issues.push("/health did not return ok=true");

    for (const testCase of [
      { label: "priority 1 KR 잠실", path: "/places/search?q=%EC%9E%A0%EC%8B%A4&countryCode=KR", countryCode: "KR" },
      { label: "priority 1 KR 잠실 야구장", path: "/places/search?q=%EC%9E%A0%EC%8B%A4%20%EC%95%BC%EA%B5%AC%EC%9E%A5&countryCode=KR", countryCode: "KR" },
    ]) {
      const places = await fetchJson(new URL(testCase.path, normalizeBaseUrl(baseUrl)).toString());
      validatePlaceResults(places, testCase);
    }

    const priority1DomesticRoute = await fetchJson(
      new URL(
        "/routes/estimate?origin=37.5446,127.0557&destination=37.5122,127.0719&originName=Seongsu&destinationName=Jamsil&originCountryCode=KR&destinationCountryCode=KR",
        normalizeBaseUrl(baseUrl),
      ).toString(),
    );
    if (!["kakao", "fallback"].includes(priority1DomesticRoute.provider)) {
      issues.push(`priority 1 KR route provider is unexpected: ${priority1DomesticRoute.provider || "unknown"}`);
    }

    for (const testCase of [
      { label: "priority 2 JP Tokyo Station", path: "/places/search?q=Tokyo%20Station&countryCode=JP", countryCode: "JP", provider: "google" },
      { label: "priority 2 JP 도쿄 역", path: "/places/search?q=%EB%8F%84%EC%BF%84%20%EC%97%AD&language=ja", countryCode: "JP" },
      { label: "priority 2 JP 東京駅", path: "/places/search?q=%E6%9D%B1%E4%BA%AC%E9%A7%85&language=ja", countryCode: "JP" },
    ]) {
      const places = await fetchJson(new URL(testCase.path, normalizeBaseUrl(baseUrl)).toString());
      validatePlaceResults(places, testCase);
    }

    const priority2GlobalRoute = await fetchJson(
      new URL(
        "/routes/estimate?origin=35.6812,139.7671&destination=35.6580,139.7016&originName=Tokyo%20Station&destinationName=Shibuya&originCountryCode=JP&destinationCountryCode=JP",
        normalizeBaseUrl(baseUrl),
      ).toString(),
    );
    if (priority2GlobalRoute.provider !== "google") {
      issues.push(`priority 2 JP route provider is not google: ${priority2GlobalRoute.provider || "unknown"}`);
    }
  }
} catch (error) {
  issues.push(error instanceof Error ? error.message : "public weather proxy check failed");
}

if (issues.length > 0) {
  console.error(`public weather proxy check failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`public weather proxy ready: ${maskUrl(baseUrl)}`);

async function fetchJson(url) {
  const response = await fetch(url);
  const bodyText = await response.text();
  if (!response.ok) throw new Error(`request failed: ${response.status} ${bodyText.slice(0, 240)}`);
  return JSON.parse(bodyText);
}

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function isPublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !isPrivateHost(url.hostname);
  } catch {
    return false;
  }
}

function isPrivateHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || isPrivateIpv4(hostname);
}

function isPrivateIpv4(value) {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(value);
}

function maskUrl(value) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "invalid";
  }
}

function validatePlaceResults(places, testCase) {
  if (!Array.isArray(places) || places.length === 0) {
    issues.push(`${testCase.label} returned no place results`);
    return;
  }
  const first = places[0];
  if (first.countryCode !== testCase.countryCode) {
    issues.push(`${testCase.label} country is unexpected: ${first.countryCode || "unknown"}`);
  }
  if (testCase.provider && first.provider !== testCase.provider) {
    issues.push(`${testCase.label} provider is not ${testCase.provider}: ${first.provider || "unknown"}`);
  }
  for (const field of ["id", "name", "address", "category", "timezone", "provider"]) {
    if (!first[field]) issues.push(`${testCase.label} missing ${field}`);
  }
  if (!Number.isFinite(first.coordinate?.latitude) || !Number.isFinite(first.coordinate?.longitude)) {
    issues.push(`${testCase.label} missing coordinate`);
  }
}
