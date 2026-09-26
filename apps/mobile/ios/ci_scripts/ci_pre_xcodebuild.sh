#!/bin/sh

set -eu

if [ "${CI_XCODE_CLOUD:-}" != "TRUE" ]; then
  exit 0
fi

if [ "${EXPO_PUBLIC_WEATHER_CLIENT:-}" != "proxy" ]; then
  echo "EXPO_PUBLIC_WEATHER_CLIENT must be proxy for an Xcode Cloud production build."
  exit 1
fi

case "${EXPO_PUBLIC_WEATHER_API_BASE_URL:-}" in
  https://*)
    ;;
  *)
    echo "EXPO_PUBLIC_WEATHER_API_BASE_URL must be a public HTTPS URL."
    exit 1
    ;;
esac

if [ -z "${EXPO_PUBLIC_WEATHER_API_TOKEN:-}" ]; then
  echo "EXPO_PUBLIC_WEATHER_API_TOKEN must be configured as a secret."
  exit 1
fi

project_file="$CI_PRIMARY_REPOSITORY_PATH/apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj"

sed -i '' \
  -e '/04C57CCC2C0F08A506196E75/,/name = Release;/ { /CODE_SIGN_STYLE = Automatic;/ i\
                CODE_SIGNING_ALLOWED = NO;
  }' \
  -e '/13B07F951A680F5B00A75B9A/,/name = Release;/ { /CODE_SIGN_STYLE = Automatic;/ i\
                CODE_SIGNING_ALLOWED = NO;
  }' \
  "$project_file"

echo "WeatherON production environment is configured for the Xcode Cloud build."
