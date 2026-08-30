// 로컬/컨테이너용 Node HTTP 어댑터. 라우팅·업스트림 호출·캐시는 proxyCore.mjs가 담당한다.
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { handleProxyRoute, PROXY_TOKEN_HEADER } from "./proxyCore.mjs";
import { handleAccountRoute, isAccountRoute, requireSession } from "./authCore.mjs";
import { handleAppIntegrityRoute, INTEGRITY_HEADERS, isAppIntegrityRoute, verifyAppIntegrityRequest } from "./integrityCore.mjs";
import { handleWardrobeRoute, isWardrobeRoute } from "./wardrobeCore.mjs";

const SERVER_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const ROOT_DIR = resolve(SERVER_DIR, "../..");

loadEnvFile(join(ROOT_DIR, ".env"));
loadEnvFile(join(ROOT_DIR, ".env.local"));
loadEnvFile(join(SERVER_DIR, ".env"));
loadEnvFile(join(SERVER_DIR, ".env.local"));

const host = process.env.WEATHER_SERVER_HOST ?? "127.0.0.1";
const port = Number(process.env.PORT || process.env.WEATHER_SERVER_PORT) || 8091;

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `${host}:${port}`}`);
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (isAppIntegrityRoute(url.pathname)) {
      const body = await readRequestBody(request);
      const webRequest = new Request(url, {
        method: request.method,
        headers: normalizeRequestHeaders(request.headers),
        ...(request.method === "GET" || request.method === "HEAD" ? {} : { body }),
      });
      const result = await handleAppIntegrityRoute(webRequest, process.env, { requireSession });
      sendJson(response, result.status, result.payload);
      return;
    }
    if (isAccountRoute(url.pathname)) {
      const body = await readRequestBody(request);
      const webRequest = new Request(url, {
        method: request.method,
        headers: normalizeRequestHeaders(request.headers),
        ...(request.method === "GET" || request.method === "HEAD" ? {} : { body }),
      });
      const result = await handleAccountRoute(webRequest, process.env);
      if (result.redirect) {
        response.writeHead(result.status, { location: result.redirect });
        response.end();
        return;
      }
      sendJson(response, result.status, result.payload);
      return;
    }
    if (isWardrobeRoute(url.pathname)) {
      const body = await readRequestBody(request, 1_600_000);
      const webRequest = new Request(url, {
        method: request.method,
        headers: normalizeRequestHeaders(request.headers),
        body,
      });
      const result = await handleWardrobeRoute(webRequest, process.env, { requireSession, verifyAppIntegrityRequest });
      sendJson(response, result.status, result.payload);
      return;
    }
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "method_not_allowed" });
      return;
    }
    const result = await handleProxyRoute(
      url,
      (key) => process.env[key],
      (name) => getHeaderValue(request.headers[name]),
    );
    sendJson(response, result.status, result.payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "weather_proxy_error";
    sendJson(response, 502, { error: "weather_proxy_error", message });
  }
});

server.listen(port, host, () => {
  console.log(`weather proxy listening on http://${host}:${port}`);
});

function getHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function setCorsHeaders(response) {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  response.setHeader(
    "access-control-allow-headers",
    `authorization, content-type, ${PROXY_TOKEN_HEADER}, ${Object.values(INTEGRITY_HEADERS).join(", ")}`,
  );
}

function normalizeRequestHeaders(headers) {
  const normalized = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) value.forEach((item) => normalized.append(name, item));
    else if (typeof value === "string") normalized.set(name, value);
  }
  return normalized;
}

async function readRequestBody(request, maxBytes = 32 * 1024) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > maxBytes) throw new Error("request_too_large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
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
