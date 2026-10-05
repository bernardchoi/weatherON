#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
check_dir=$(mktemp -d /tmp/weatheron-widget-check.XXXXXX)
trap 'rm -rf "$check_dir"' EXIT
xcrun swiftc -parse-as-library -module-cache-path "$check_dir/modules" \
  -o "$check_dir/tests" \
  apps/mobile/ios/WeatherONWidget/WeatherONNativeWeather.swift \
  scripts/check-widget-native-weather.swift
"$check_dir/tests"
xcrun swiftc -typecheck -target arm64-apple-ios17.0-simulator \
  -sdk "$(xcrun --sdk iphonesimulator --show-sdk-path)" -module-cache-path "$check_dir/modules-ios" \
  apps/mobile/ios/WeatherONWidget/WeatherONNativeWeather.swift \
  apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift \
  apps/mobile/ios/WeatherONWidget/WeatherONDepartureLiveActivity.swift \
  apps/mobile/modules/weatheron-widget-data/ios/WeatherONDepartureActivityAttributes.swift
printf '%s\n' 'Complete widget + Live Activity Swift typecheck passed against iOS Simulator SDK. No WeatherKit requests, credentials, signing or device install.'
