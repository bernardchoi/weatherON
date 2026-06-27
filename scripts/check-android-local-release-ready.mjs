import { spawn } from "node:child_process";

const rootDir = process.cwd();

await run("npm", ["run", "build:android-store-assets"]);
await run("npm", ["run", "report:android-release-readiness"]);
await run("npm", ["run", "check:android-store-submit-ready"], {
  WEATHERON_STORE_SUBMIT_REPORT_ONLY: "1",
});
await run("npm", ["run", "check:android-build-ready"]);

console.log("android local release ready check passed");

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: { ...process.env, ...env },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}
