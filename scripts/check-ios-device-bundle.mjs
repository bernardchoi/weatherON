import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const directory = mkdtempSync(join(tmpdir(), "weatheron-device-bundle-"));
try {
  const node = join(directory, "node");
  const native = join(directory, "native.sh");
  const result = join(directory, "result");
  writeFileSync(node, '#!/bin/bash\nif [[ "$1" == "--print" ]]; then printf "%s\\n" "$NATIVE_STUB"; fi\n', { mode: 0o755 });
  writeFileSync(native, 'printf "%s|%s" "$CONFIGURATION" "${SKIP_BUNDLING:-}" > "$RESULT_FILE"\n');
  for (const [configuration, platform, expected] of [
    ["Debug", "iphoneos", "Release|"],
    ["Debug", "iphonesimulator", "Debug|1"],
    ["Release", "iphoneos", "Release|"],
    ["Release", "iphonesimulator", "Release|"],
  ]) {
    execFileSync("bash", [resolve("apps/mobile/ios/scripts/bundle-react-native.sh")], {
      env: { ...process.env, CONFIGURATION: configuration, PLATFORM_NAME: platform,
        PROJECT_DIR: directory, PODS_ROOT: directory, NODE_BINARY: node,
        ENTRY_FILE: "index.js", CLI_PATH: "stub", NATIVE_STUB: native, RESULT_FILE: result,
        SKIP_BUNDLING: "inherited-value" },
    });
    assert.equal(readFileSync(result, "utf8"), expected, `${configuration}/${platform}`);
  }
  console.log("iOS bundle modes: wired Debug embeds production JS; simulator Debug keeps Metro; Release unchanged.");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
