import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const secretNames = ["KAKAO_REST_API_KEY", "GOOGLE_MAPS_API_KEY", "KMA_SERVICE_KEY"];
// 옵트인 프록시 인증 토큰: 로컬 env에 있을 때만 동기화한다.
const optionalSecretNames = ["PROXY_ACCESS_TOKEN"];
const weatherKitSecretNames = [
  "WEATHERKIT_TEAM_ID",
  "WEATHERKIT_SERVICE_ID",
  "WEATHERKIT_KEY_ID",
  "WEATHERKIT_PRIVATE_KEY",
];
const proxyOnly = process.argv.includes("--proxy-only");

loadEnvFile(join(process.cwd(), "apps/server/.env.local"));
loadEnvFile(join(process.cwd(), "apps/server/.env"));
loadEnvFile(join(process.cwd(), ".env.local"));
loadEnvFile(join(process.cwd(), ".env"));

if (!proxyOnly) {
  for (const name of secretNames) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is missing from local env files`);
    await putSecret(name, value);
  }
}

for (const name of optionalSecretNames) {
  const value = process.env[name];
  if (proxyOnly && !value) throw new Error(`${name} is missing from local env files`);
  if (value) await putSecret(name, value);
}

if (!proxyOnly && weatherKitSecretNames.some((name) => process.env[name])) {
  for (const name of weatherKitSecretNames) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is missing from local env files`);
    await putSecret(name, value);
  }
}

console.log(proxyOnly ? "cloudflare proxy access token synced" : "cloudflare worker secrets synced");

function putSecret(name, value) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "npx",
      ["--yes", "--cache", "./.npm-cache", "wrangler", "secret", "put", name],
      {
        cwd: process.cwd(),
        stdio: ["pipe", "inherit", "inherit"],
      },
    );
    child.stdin.end(`${value}\n`);
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`wrangler secret put ${name} exited with ${code}`));
    });
  });
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
