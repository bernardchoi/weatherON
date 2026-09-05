// Cloudflare Worker 어댑터. 라우팅·업스트림 호출·캐시는 proxyCore.mjs가 담당한다.
import { handleProxyRoute, PROXY_TOKEN_HEADER } from "./proxyCore.mjs";
import { handleAccountRoute, isAccountRoute, requireSession } from "./authCore.mjs";
import { handleAppIntegrityRoute, INTEGRITY_HEADERS, isAppIntegrityRoute, verifyAppIntegrityRequest } from "./integrityCore.mjs";
import { handleWardrobeRoute, isWardrobeRoute } from "./wardrobeCore.mjs";

import { DEPARTURE_PUSH_ROUTE, handleDeparturePushRoute } from "./departurePushCore.mjs";
export { DepartureEndScheduler } from "./departurePushCore.mjs";

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
    if (isAppIntegrityRoute(url.pathname)) {
      const result = await handleAppIntegrityRoute(request, env, { requireSession });
      return jsonResponse(result.payload, result.status);
    }
    if (isAccountRoute(url.pathname)) {
      const result = await handleAccountRoute(request, env);
      if (result.redirect) return Response.redirect(result.redirect, result.status);
      return jsonResponse(result.payload, result.status);
    }
    if (isWardrobeRoute(url.pathname)) {
      const result = await handleWardrobeRoute(request, env, { requireSession, verifyAppIntegrityRequest });
      return jsonResponse(result.payload, result.status);
    }
    if (url.pathname === DEPARTURE_PUSH_ROUTE) {
      const result = await handleDeparturePushRoute(request, env, { requireSession, verifyAppIntegrityRequest });
      return jsonResponse(result.payload, result.status);
    }
    if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405);
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

function readEnv(env, key) {
  return env?.[key] ?? globalThis.process?.env?.[key];
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": `authorization, content-type, ${PROXY_TOKEN_HEADER}, ${Object.values(INTEGRITY_HEADERS).join(", ")}`,
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
