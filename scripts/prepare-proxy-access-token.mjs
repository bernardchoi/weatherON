import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const mobileEnvPath = join(rootDir, "apps/mobile/.env.local");
const serverEnvPath = join(rootDir, "apps/server/.env.local");
const mobileEnv = readEnvFile(mobileEnvPath);
const serverEnv = readEnvFile(serverEnvPath);
const mobileToken = mobileEnv.EXPO_PUBLIC_WEATHER_API_TOKEN;
const serverToken = serverEnv.PROXY_ACCESS_TOKEN;

if (mobileToken && serverToken && mobileToken !== serverToken) {
  throw new Error("mobile/server proxy access tokens do not match");
}

const token = mobileToken || serverToken || randomBytes(32).toString("base64url");
writeEnvFile(mobileEnvPath, { ...mobileEnv, EXPO_PUBLIC_WEATHER_API_TOKEN: token }, [
  "EXPO_PUBLIC_WEATHER_CLIENT",
  "EXPO_PUBLIC_WEATHER_API_BASE_URL",
  "EXPO_PUBLIC_WEATHER_API_TOKEN",
  "EXPO_PUBLIC_WEATHER_ALLOW_LOCAL_PROXY",
  "EXPO_PUBLIC_WEATHER_TIMEOUT_MS",
]);
writeEnvFile(serverEnvPath, { ...serverEnv, PROXY_ACCESS_TOKEN: token }, [
  "PROXY_ACCESS_TOKEN",
]);

console.log(`proxy access token prepared: ${mobileToken || serverToken ? "existing token reused" : "new token generated"}`);
console.log("token value omitted; apps/mobile/.env.local and apps/server/.env.local match");

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  return readFileSync(path, "utf8").split(/\r?\n/).reduce((env, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return env;
    const index = trimmed.indexOf("=");
    if (index < 1) return env;
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    return env;
  }, {});
}

function writeEnvFile(path, env, orderedKeys) {
  const keys = [...orderedKeys, ...Object.keys(env).filter((key) => !orderedKeys.includes(key)).sort()];
  const body = keys
    .filter((key) => env[key] != null && String(env[key]).trim() !== "")
    .map((key) => `${key}=${env[key]}`)
    .join("\n");
  writeFileSync(path, `${body}\n`, { encoding: "utf8", mode: 0o600 });
}
