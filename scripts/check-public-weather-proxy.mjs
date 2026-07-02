const baseUrl = process.env.WEATHERON_PUBLIC_PROXY_URL || process.env.EXPO_PUBLIC_WEATHER_API_BASE_URL || "";
const issues = [];

if (!isPublicHttpsUrl(baseUrl)) {
  issues.push("WEATHERON_PUBLIC_PROXY_URL must be a public https URL");
}

try {
  if (issues.length === 0) {
    const health = await fetchJson(new URL("/health", normalizeBaseUrl(baseUrl)).toString());
    if (!health.ok) issues.push("/health did not return ok=true");

    const priority1DomesticPlaces = await fetchJson(
      new URL("/places/search?q=%EC%9E%A0%EC%8B%A4&countryCode=KR", normalizeBaseUrl(baseUrl)).toString(),
    );
    if (!Array.isArray(priority1DomesticPlaces) || priority1DomesticPlaces.length === 0) {
      issues.push("priority 1 KR place search returned no results");
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

    const priority2GlobalPlaces = await fetchJson(
      new URL("/places/search?q=Tokyo%20Station&countryCode=JP", normalizeBaseUrl(baseUrl)).toString(),
    );
    if (!Array.isArray(priority2GlobalPlaces) || priority2GlobalPlaces.length === 0) {
      issues.push("priority 2 JP place search returned no results");
    } else if (priority2GlobalPlaces[0]?.provider !== "google") {
      issues.push(`priority 2 JP place search provider is not google: ${priority2GlobalPlaces[0]?.provider || "unknown"}`);
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
