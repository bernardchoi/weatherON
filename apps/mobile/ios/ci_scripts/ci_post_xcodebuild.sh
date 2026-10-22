#!/bin/sh
set -eu

if [ "${CI_XCODEBUILD_ACTION:-}" != "archive" ]; then
  exit 0
fi

python3 - "$CI_ARCHIVE_PATH/Products/Applications/WeatherON.app" <<'PY'
import plistlib
import subprocess
import sys
from pathlib import Path

app = Path(sys.argv[1])
for bundle, expected in [
    (app, {
        "aps-environment": "production",
        "com.apple.developer.applesignin": ["Default"],
        "com.apple.developer.devicecheck.appattest-environment": "production",
        "com.apple.security.application-groups": ["group.com.weatheron.mobile"],
    }),
    (app / "PlugIns/WeatherONWidget.appex", {
        "com.apple.developer.weatherkit": True,
        "com.apple.security.application-groups": ["group.com.weatheron.mobile"],
    }),
]:
    signed = plistlib.loads(subprocess.check_output([
        "codesign", "--display", "--entitlements", ":-", str(bundle)
    ]))
    for key, value in expected.items():
        if signed.get(key) != value:
            raise SystemExit(f"{bundle.name}: missing or incorrect signed entitlement {key}")
    print(f"{bundle.name}: required signed entitlements verified")
PY
