import { rmSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();
const mobileDir = join(rootDir, "apps/mobile");
const mobileDistDir = join(mobileDir, "dist");
const expoBin = join(rootDir, "node_modules/.bin/expo");

rmSync(mobileDistDir, { recursive: true, force: true });

await run(expoBin, ["export", "--platform", "web", "--output-dir", "dist"], {
  cwd: mobileDir,
});

console.log(`android web export generated: ${mobileDistDir}`);

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
