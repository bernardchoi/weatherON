import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function validateIosServiceEnvironment(env) {
  const errors = [];
  if (env.EXPO_PUBLIC_WEATHER_CLIENT !== "proxy") errors.push("EXPO_PUBLIC_WEATHER_CLIENT must be proxy");
  const publicHttps = (value) => {
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return url.protocol === "https:" && !url.username && !url.password
        && !["localhost", "[::1]", "0.0.0.0"].includes(host)
        && !host.endsWith(".localhost") && !host.endsWith(".local")
        && !/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
    } catch { return false; }
  };
  if (!publicHttps(env.EXPO_PUBLIC_WEATHER_API_BASE_URL)) errors.push("EXPO_PUBLIC_WEATHER_API_BASE_URL must be public HTTPS");
  if (!env.EXPO_PUBLIC_WEATHER_API_TOKEN?.trim()) errors.push("EXPO_PUBLIC_WEATHER_API_TOKEN must be configured");
  if (env.EXPO_PUBLIC_ACCOUNT_API_BASE_URL !== undefined && !publicHttps(env.EXPO_PUBLIC_ACCOUNT_API_BASE_URL)) {
    errors.push("EXPO_PUBLIC_ACCOUNT_API_BASE_URL must be public HTTPS when set");
  }
  return errors;
}

if (process.argv.includes("--self-test")) {
  const valid = { EXPO_PUBLIC_WEATHER_CLIENT: "proxy", EXPO_PUBLIC_WEATHER_API_BASE_URL: "https://api.example.test", EXPO_PUBLIC_WEATHER_API_TOKEN: "synthetic-test-value" };
  assert.deepEqual(validateIosServiceEnvironment(valid), []);
  assert.equal(validateIosServiceEnvironment({}).length, 3, "the omitted local build environment must fail before bundling");
  for (const key of Object.keys(valid)) assert.ok(validateIosServiceEnvironment({ ...valid, [key]: "" }).length);
  for (const url of ["http://api.example.test", "https://localhost", "https://192.168.1.2", "https://[::1]", "https://name:synthetic-secret@api.example.test"]) {
    const errors = validateIosServiceEnvironment({ ...valid, EXPO_PUBLIC_WEATHER_API_BASE_URL: url });
    assert.ok(errors.length);
    assert.ok(!errors.join().includes(url), "diagnostics must not expose supplied values");
  }
  assert.ok(validateIosServiceEnvironment({ ...valid, EXPO_PUBLIC_ACCOUNT_API_BASE_URL: "" }).length);
  console.log("iOS service environment regression checks passed");
} else {
  const require = createRequire(import.meta.url);
  require("@expo/env").loadProjectEnv(resolve(root, "apps/mobile"), { mode: "production", silent: true });
  const errors = validateIosServiceEnvironment(process.env);
  if (errors.length) {
    console.error(`iOS service environment is incomplete:\n${errors.map((error) => `- ${error}`).join("\n")}`);
    process.exitCode = 1;
  } else {
    console.log("iOS service environment validated (values withheld)");
  }
}
