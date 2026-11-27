#!/bin/sh

set -eu

CI_SCRIPT_DIRECTORY="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
IOS_DIRECTORY="$(CDPATH= cd -- "$CI_SCRIPT_DIRECTORY/.." && pwd)"
REPOSITORY_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(CDPATH= cd -- "$IOS_DIRECTORY/../../.." && pwd)}"

# Match the Node 24 runtime used by source-checks and React Native's minimum minor version.
if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major === 24 && minor >= 3 ? 0 : 1)' 2>/dev/null; then
  brew install node@24
  export PATH="$(brew --prefix node@24)/bin:$PATH"
fi

echo "Using Node $(node --version) and npm $(npm --version)"

cd "$REPOSITORY_ROOT"
npm ci \
  --workspace @weatheron/mobile \
  --include-workspace-root=false \
  --no-audit \
  --no-fund

cd "$IOS_DIRECTORY"
pod install
