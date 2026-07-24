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

echo "WeatherON production environment is configured for the Xcode Cloud build."
