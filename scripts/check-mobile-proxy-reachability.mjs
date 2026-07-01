import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const mobileEnv = readEnvFile(join(rootDir, "apps/mobile/.env.local"));
loadEnvFile(join(rootDir, "apps/server/.env.local"));
loadEnvFile(join(rootDir, "apps/server/.env"));
loadEnvFile(join(rootDir, ".env.local"));
loadEnvFile(join(rootDir, ".env"));

const baseUrl = mobileEnv.EXPO_PUBLIC_WEATHER_API_BASE_URL || "";
const clientMode = mobileEnv.EXPO_PUBLIC_WEATHER_CLIENT || "openmeteo";
const issues = [];

if (clientMode !== "proxy") issues.push(`mobile weather client is not proxy: ${clientMode}`);
if (!baseUrl) issues.push("EXPO_PUBLIC_WEATHER_API_BASE_URL is empty");

let server;

try {
  if (issues.length === 0) {
    const url = new URL(baseUrl);
    const port = url.port || "8091";
    server = spawn(process.execPath, ["apps/server/src/index.mjs"], {
      cwd: rootDir,
      env: {
        ...process.env,
        WEATHER_SERVER_HOST: "0.0.0.0",
        WEATHER_SERVER_PORT: port,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await waitForHealth(new URL("/health", normalizeBaseUrl(baseUrl)).toString());
  }
} catch (error) {
  issues.push(error instanceof Error ? error.message : "mobile proxy reachability check failed");
} finally {
  if (server) server.kill("SIGTERM");
}

if (issues.length > 0) {
  console.error(`mobile proxy reachability failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

console.log(`mobile proxy reachable: ${maskUrl(baseUrl)}`);

async function waitForHealth(url) {
  const deadline = Date.now() + 8000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const payload = await fetchJson(url);
      if (payload.ok) return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw lastError ?? new Error("mobile proxy health check timed out");
}

async function fetchJson(url) {
  const response = await fetch(url);
  const bodyText = await response.text();
  if (!response.ok) throw new Error(`request failed: ${response.status} ${bodyText.slice(0, 240)}`);
  return JSON.parse(bodyText);
}

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return readFileSync(path, "utf8").split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const index = trimmed.indexOf("=");
    if (index < 1) return acc;
    acc[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    return acc;
  }, {});
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

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function maskUrl(value) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "invalid";
  }
}
