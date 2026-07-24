#!/bin/sh

set -eu

CI_SCRIPT_DIRECTORY="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
IOS_DIRECTORY="$(CDPATH= cd -- "$CI_SCRIPT_DIRECTORY/.." && pwd)"
REPOSITORY_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(CDPATH= cd -- "$IOS_DIRECTORY/../../.." && pwd)}"

NODE_MAJOR_VERSION="$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)"
if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
  brew install node@20
  export PATH="$(brew --prefix node@20)/bin:$PATH"
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
