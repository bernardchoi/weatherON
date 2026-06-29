import { spawn } from "node:child_process";

const rootDir = process.cwd();

await run("npm", ["run", "prepare:android-release-local-files"]);
await run("npm", ["run", "build:android-store-assets"]);
await run("npm", ["run", "report:android-release-readiness"]);
await run("npm", ["run", "check:android-store-submit-ready"], {
  WEATHERON_STORE_SUBMIT_REPORT_ONLY: "1",
});
await run("npm", ["run", "apply:android-store-safe-defaults"]);
await run("npm", ["run", "apply:android-store-inputs"], {
  WEATHERON_STORE_INPUTS_REPORT_ONLY: "1",
});
await run("npm", ["run", "check:android-store-screenshots-ready"], {
  WEATHERON_SCREENSHOT_REPORT_ONLY: "1",
});
await run("npm", ["run", "check:android-web-export"], {
  WEATHERON_WEB_EXPORT_REPORT_ONLY: "1",
});
await run("npm", ["run", "check:android-web-preview-server"], {
  WEATHERON_WEB_PREVIEW_SERVER_REPORT_ONLY: "1",
  WEATHERON_WEB_PREVIEW_SERVER_OPTIONAL: "1",
});
await run("npm", ["run", "apply:android-closed-test-inputs"], {
  WEATHERON_CLOSED_TEST_INPUTS_REPORT_ONLY: "1",
});
await run("npm", ["run", "check:android-closed-test-ready"], {
  WEATHERON_CLOSED_TEST_REPORT_ONLY: "1",
});
await run("npm", ["run", "apply:android-device-qa-results"], {
  WEATHERON_DEVICE_QA_REPORT_ONLY: "1",
});
await run("npm", ["run", "sync:android-device-qa-env"], {
  WEATHERON_DEVICE_QA_ENV_SYNC_REPORT_ONLY: "1",
});
await run("npm", ["run", "check:android-adb-ready"], {
  WEATHERON_ADB_REPORT_ONLY: "1",
});
await run("npm", ["run", "install:android-preview-apk"], {
  WEATHERON_INSTALL_REPORT_ONLY: "1",
});
await run("npm", ["run", "report:android-release-action-board"]);
await run("npm", ["run", "report:android-device-qa-packet"]);
await run("npm", ["run", "report:android-store-inputs-packet"]);
await run("npm", ["run", "report:android-play-upload-packet"]);
await run("npm", ["run", "report:android-store-screenshot-packet"]);
await run("npm", ["run", "report:android-closed-test-packet"]);
await run("npm", ["run", "report:android-manual-action-packet"]);
await run("npm", ["run", "report:android-privacy-policy-packet"]);
await run("npm", ["run", "report:android-release-evidence-index"]);
await run("npm", ["run", "check:android-release-consistency"]);
await run("npm", ["run", "check:android-build-ready"]);
await run("npm", ["run", "check:android-product-quality"]);
await run("npm", ["run", "check:android-device-qa-ready"]);

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
