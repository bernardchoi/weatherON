import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const rootDir = process.cwd();

await run("npm", ["run", "check:android-release"]);
await run("npx", ["tsc", "-p", "apps/mobile/tsconfig.json", "--noEmit"]);
await run("npm", ["run", "check:shared"]);
await run("npm", ["run", "build:mockups"]);

const expoConfig = await runCapture("npx", ["expo", "config", "--json", "--type", "public"], {
  cwd: `${rootDir}/apps/mobile`,
});
const parsedExpoConfig = JSON.parse(expoConfig);

assert.equal(parsedExpoConfig.name, "WeatherON");
assert.equal(parsedExpoConfig.android?.package, "com.weatheron.mobile");
assert.equal(parsedExpoConfig.android?.versionCode, 1);
assert.ok(parsedExpoConfig.android?.permissions?.includes("ACCESS_FINE_LOCATION"));

console.log("android build readiness check passed");

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? rootDir,
      env: process.env,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

function runCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? rootDir,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}\n${stderr}`));
    });
  });
}
