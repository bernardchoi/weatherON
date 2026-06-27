import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const mobileDir = join(rootDir, "apps/mobile");
const reportPath = join(rootDir, "docs/architecture/WeatherON_EAS_LOGIN_STATUS.md");
const timeoutMs = Number.parseInt(process.env.EAS_WHOAMI_TIMEOUT_MS ?? "20000", 10);

const result = await runWithTimeout(
  "npx",
  ["--yes", "--cache", "../../.npm-cache", "eas-cli", "whoami"],
  {
    cwd: mobileDir,
    timeoutMs,
  },
);

const output = `${result.stdout}\n${result.stderr}`.trim();

if (result.timedOut) {
  await writeStatusReport("timeout", "EAS login check timed out. Sandbox or network/auth access may be blocking EAS CLI.");
  console.error(`EAS login check timed out after ${timeoutMs}ms.`);
  console.error("Sandbox or network/auth access may be blocking EAS CLI.");
  console.error("Next: run `npm run check:eas-login-state` with elevated/local terminal access.");
  process.exit(2);
}

if (result.code === 0) {
  await writeStatusReport("logged_in", "EAS CLI returned an authenticated account.");
  console.log(`EAS logged in: ${output}`);
  process.exit(0);
}

if (output.includes("Not logged in")) {
  await writeStatusReport("not_logged_in", "EAS CLI returned Not logged in.");
  console.error("EAS is not logged in.");
  console.error("Next: run `npm run eas:login`, then `npm run check:eas-login-state`.");
  process.exit(1);
}

await writeStatusReport("failed", output || "EAS login check failed with no output.");
console.error("EAS login check failed.");
if (output) console.error(output);
process.exit(result.code ?? 1);

function runWithTimeout(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: process.env,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      killChild(child);
      resolve({ code: null, stdout, stderr, timedOut: true });
    }, options.timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on("exit", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut: false });
    });
  });
}

function killChild(child) {
  if (process.platform === "win32") {
    child.kill("SIGTERM");
    return;
  }
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
}

async function writeStatusReport(status, detail) {
  const report = `# WeatherON EAS Login Status

> 생성일: 2026-06-27
> 목적: Android preview APK 빌드 전 EAS 인증 상태를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 상태 | ${status} |
| 상세 | ${detail} |
| 확인 명령 | \`npm run check:eas-login-state\` |

## 2. 다음 액션

${status === "logged_in" ? "- \`npm run eas:init\` 실행" : "- \`npm run eas:login\` 실행 후 \`npm run check:eas-login-state\` 재확인"}
`;

  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");
}
