import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const mobileDir = join(rootDir, "apps/mobile");
const env = readEnvFile(join(mobileDir, ".env.local"));
const token = env.EXPO_PUBLIC_WEATHER_API_TOKEN;

if (!token) throw new Error("EXPO_PUBLIC_WEATHER_API_TOKEN is missing; run npm run prepare:proxy-access-token first");
if (env.EXPO_PUBLIC_WEATHER_CLIENT !== "proxy") throw new Error("EXPO_PUBLIC_WEATHER_CLIENT must be proxy");
if (!isPublicHttpsUrl(env.EXPO_PUBLIC_WEATHER_API_BASE_URL)) {
  throw new Error("EXPO_PUBLIC_WEATHER_API_BASE_URL must be a public HTTPS URL");
}

const variables = [
  ["EXPO_PUBLIC_WEATHER_CLIENT", "proxy", "plaintext"],
  ["EXPO_PUBLIC_WEATHER_API_BASE_URL", env.EXPO_PUBLIC_WEATHER_API_BASE_URL, "plaintext"],
  ["EXPO_PUBLIC_WEATHER_API_TOKEN", token, "sensitive"],
  ["EXPO_PUBLIC_WEATHER_ALLOW_LOCAL_PROXY", "0", "plaintext"],
  ["EXPO_PUBLIC_WEATHER_TIMEOUT_MS", env.EXPO_PUBLIC_WEATHER_TIMEOUT_MS || "8000", "plaintext"],
];

for (const [name, value, visibility] of variables) {
  await runEas([
    "env:create",
    "--environment",
    "production",
    "--scope",
    "project",
    "--name",
    name,
    "--value",
    value,
    "--visibility",
    visibility,
    "--force",
    "--non-interactive",
  ]);
}

console.log("EAS production proxy config synced; token value omitted");

function isPublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(url.hostname);
  } catch {
    return false;
  }
}

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return readFileSync(path, "utf8").split(/\r?\n/).reduce((result, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return result;
    const index = trimmed.indexOf("=");
    if (index < 1) return result;
    result[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    return result;
  }, {});
}

function runEas(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["--yes", "--cache", "../../.npm-cache", "eas-cli", ...args], {
      cwd: mobileDir,
      stdio: ["ignore", "inherit", "inherit"],
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`eas ${args[0]} exited with ${code}`));
    });
  });
}
