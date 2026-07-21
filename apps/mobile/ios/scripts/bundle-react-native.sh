#!/bin/bash

set -e

if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

# Xcode reports Korean paths in UTF-8-MAC form. Normalize them before Expo resolves
# the entry file so Node receives the same path representation as the checkout.
project_root="$PROJECT_DIR/.."
if normalized_root=$(printf '%s' "$project_root" | iconv -f UTF-8-MAC -t UTF-8 2>/dev/null); then
  project_root="$normalized_root"
fi
export PROJECT_ROOT="$project_root"

# Simulator Debug uses Metro. Physical-device Debug embeds the JS bundle so a
# wired QA build starts without Metro or Local Network permission.
if [[ "$CONFIGURATION" = *Debug* && "$PLATFORM_NAME" == *simulator* ]]; then
  export SKIP_BUNDLING=1
else
  unset SKIP_BUNDLING
fi

if [[ -z "$ENTRY_FILE" ]]; then
  export ENTRY_FILE="$("$NODE_BINARY" -e "require('expo/scripts/resolveAppEntry')" "$PROJECT_ROOT" ios absolute | tail -n 1)"
fi

if [[ -z "$CLI_PATH" ]]; then
  export CLI_PATH="$("$NODE_BINARY" --print "require.resolve('@expo/cli', { paths: [require.resolve('expo/package.json')] })")"
fi
if [[ -z "$BUNDLE_COMMAND" ]]; then
  export BUNDLE_COMMAND="export:embed"
fi

react_native_xcode_script="$("$NODE_BINARY" --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'")"
bash "$react_native_xcode_script"
