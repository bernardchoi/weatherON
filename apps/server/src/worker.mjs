// Cloudflare Worker 어댑터. 라우팅·업스트림 호출·캐시는 proxyCore.mjs가 담당한다.
import { handleProxyRoute, PROXY_TOKEN_HEADER } from "./proxyCore.mjs";

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
    await logProxyAuthDiagnostic(request, url, env);
    const result = await handleProxyRoute(
      url,
      (key) => readEnv(env, key),
      (name) => request.headers.get(name),
      { runtime: "cloudflare-worker" },
    );
    return jsonResponse(result.payload, result.status);
  } catch (error) {
    return jsonResponse(
      { error: "weather_proxy_error", message: error instanceof Error ? error.message : "weather_proxy_error" },
      502,
    );
  }
}

async function logProxyAuthDiagnostic(request, url, env) {
  const expectedTokenDigest = readEnv(env, "PROXY_DIAGNOSTIC_TOKEN_SHA256");
  if (!expectedTokenDigest || !isProxyDiagnosticPath(url.pathname)) return;
  const providedToken = request.headers.get(PROXY_TOKEN_HEADER);
  console.log(JSON.stringify({
    event: "proxy_auth_diagnostic",
    method: request.method,
    path: url.pathname,
    routeGroup: url.pathname.startsWith("/weather/") ? "/weather" : url.pathname,
    tokenPresent: Boolean(providedToken),
    tokenMatched: providedToken ? await secureTokenMatchesDigest(providedToken, expectedTokenDigest) : false,
  }));
}

function isProxyDiagnosticPath(pathname) {
  return pathname.startsWith("/weather/") || pathname === "/places/search" || pathname === "/routes/estimate";
}

async function secureTokenMatchesDigest(providedToken, expectedDigestHex) {
  const encoder = new TextEncoder();
  const providedBytes = encoder.encode(providedToken);
  const providedHash = await crypto.subtle.digest("SHA-256", providedBytes);
  const providedDigest = new Uint8Array(providedHash);
  const expectedDigest = hexToBytes(expectedDigestHex);
  if (!expectedDigest || expectedDigest.length !== providedDigest.length) return false;
  let mismatch = 0;
  for (let index = 0; index < providedDigest.length; index += 1) {
    mismatch |= providedDigest[index] ^ expectedDigest[index];
  }
  return mismatch === 0;
}

function hexToBytes(value) {
  if (!/^[a-f0-9]{64}$/i.test(value)) return null;
  return new Uint8Array(value.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16)));
}

function readEnv(env, key) {
  return env?.[key] ?? globalThis.process?.env?.[key];
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": `content-type, ${PROXY_TOKEN_HEADER}`,
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
