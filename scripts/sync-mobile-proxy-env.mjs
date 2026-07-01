import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const mobileEnvPath = join(rootDir, "apps/mobile/.env.local");
const statusPath = join(rootDir, "docs/architecture/WeatherON_ANDROID_LOCAL_PROXY_QA_STATUS.md");
const mode = normalizeMode(process.argv[2] || process.env.WEATHERON_MOBILE_PROXY_MODE || "device");
const port = Number(process.env.WEATHERON_PROXY_PORT || process.env.WEATHER_SERVER_PORT) || 8091;
const timeoutMs = Number(process.env.EXPO_PUBLIC_WEATHER_TIMEOUT_MS) || 8000;
const issues = [];

const currentEnv = readEnvFile(mobileEnvPath);
const nextEnv = { ...currentEnv };
let proxyUrl = "";
let detectedHost = "";

if (mode === "openmeteo") {
  nextEnv.EXPO_PUBLIC_WEATHER_CLIENT = "openmeteo";
  delete nextEnv.EXPO_PUBLIC_WEATHER_API_BASE_URL;
  delete nextEnv.EXPO_PUBLIC_WEATHER_ALLOW_LOCAL_PROXY;
  nextEnv.EXPO_PUBLIC_WEATHER_TIMEOUT_MS = String(timeoutMs);
} else {
  if (mode === "public") {
    proxyUrl = process.env.WEATHERON_PUBLIC_PROXY_URL || "";
    if (!isPublicHttpsUrl(proxyUrl)) issues.push("WEATHERON_PUBLIC_PROXY_URL must be a public https URL");
  } else {
    detectedHost = resolveProxyHost(mode);
    if (!detectedHost) issues.push("local proxy host could not be detected");
    proxyUrl = detectedHost ? `http://${detectedHost}:${port}` : "";
  }

  nextEnv.EXPO_PUBLIC_WEATHER_CLIENT = "proxy";
  nextEnv.EXPO_PUBLIC_WEATHER_API_BASE_URL = proxyUrl;
  nextEnv.EXPO_PUBLIC_WEATHER_ALLOW_LOCAL_PROXY = mode === "public" ? "0" : "1";
  nextEnv.EXPO_PUBLIC_WEATHER_TIMEOUT_MS = String(timeoutMs);
}

writeStatus();

if (issues.length > 0) {
  console.error(`mobile proxy env sync failed: ${issues.length} issues`);
  for (const issue of issues) console.error(` - ${issue}`);
  process.exit(1);
}

writeEnvFile(mobileEnvPath, nextEnv);
console.log(`mobile proxy env synced: ${mode}${proxyUrl ? ` ${maskUrl(proxyUrl)}` : ""}`);

function normalizeMode(value) {
  if (["device", "web", "public", "openmeteo"].includes(value)) return value;
  issues.push(`unsupported mode: ${value}`);
  return "device";
}

function resolveProxyHost(value) {
  if (process.env.WEATHERON_PROXY_HOST) return process.env.WEATHERON_PROXY_HOST;
  if (value === "web") return "127.0.0.1";
  return getPrivateIpv4Address();
}

function getPrivateIpv4Address() {
  const interfaces = networkInterfaces();
  const candidates = [];
  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family !== "IPv4" || entry.internal) continue;
      if (!isPrivateIpv4(entry.address)) continue;
      candidates.push({ name, address: entry.address });
    }
  }
  const preferred = candidates.find((item) => item.name === "en0") || candidates[0];
  return preferred?.address || "";
}

function isPrivateIpv4(value) {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(value);
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

function writeEnvFile(path, env) {
  const orderedKeys = [
    "EXPO_PUBLIC_WEATHER_CLIENT",
    "EXPO_PUBLIC_WEATHER_API_BASE_URL",
    "EXPO_PUBLIC_WEATHER_ALLOW_LOCAL_PROXY",
    "EXPO_PUBLIC_WEATHER_TIMEOUT_MS",
  ];
  const keys = [...orderedKeys, ...Object.keys(env).filter((key) => !orderedKeys.includes(key)).sort()];
  const body = keys
    .filter((key) => env[key] != null && String(env[key]).trim() !== "")
    .map((key) => `${key}=${env[key]}`)
    .join("\n");
  writeFileSync(path, `${body}\n`, "utf8");
}

function writeStatus() {
  const report = `# WeatherON Android Local Proxy QA Status

> 생성일: ${kstDate()}
> 목적: Android 실기기에서 로컬 WeatherON 프록시를 접근할 수 있도록 mobile env를 전환한다.

## 1. 요약

| 항목 | 값 |
|---|---|
| 상태 | ${issues.length === 0 ? "전환 가능" : "확인 필요"} |
| mode | \`${mode}\` |
| proxy URL | \`${proxyUrl ? maskUrl(proxyUrl) : "없음"}\` |
| detected host | \`${detectedHost || "없음"}\` |
| port | \`${port}\` |
| mobile env | \`apps/mobile/.env.local\` |

## 2. Issues

${issues.length === 0 ? "- 없음" : issues.map((issue) => `- ${issue}`).join("\n")}

## 3. 실행 명령

\`\`\`bash
npm run sync:mobile-proxy-env
npm run sync:mobile-proxy-env -- web
WEATHERON_PUBLIC_PROXY_URL=https://example.com npm run sync:mobile-proxy-env -- public
npm run sync:mobile-proxy-env -- openmeteo
\`\`\`

주의:
- \`device\` 모드는 Android 실기기 QA용이다.
- \`web\` 모드는 로컬 브라우저 QA용이다.
- EAS preview/production에는 \`public\` 모드의 HTTPS 프록시 또는 \`openmeteo\` 모드가 필요하다.
`;

  mkdirSync(dirname(statusPath), { recursive: true });
  writeFileSync(statusPath, report, "utf8");
}

function kstDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function maskUrl(value) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "invalid";
  }
}
