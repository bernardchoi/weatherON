# WeatherON Xcode Cloud iOS release

WeatherON iOS TestFlight and App Store binaries are built with Xcode Cloud. Android builds continue to use EAS.

## Project

- Repository: `bernardchoi/weatherON`
- Workspace: `apps/mobile/ios/WeatherON.xcworkspace`
- Scheme: `WeatherON`
- Branch: `main`
- Archive configuration: `Release`
- App version: `1.0.0`
- Next build number: `11`

The shared scheme and CocoaPods lockfile are committed. Xcode Cloud runs
`apps/mobile/ios/ci_scripts/ci_post_clone.sh` after checkout to install the
React Native workspace dependencies and CocoaPods.

## Workflow environment

Configure these variables in the Xcode Cloud workflow:

| Variable | Value | Secret |
| --- | --- | --- |
| `WEATHERON_BUILD_VARIANT` | `production` | No |
| `EXPO_PUBLIC_WEATHER_CLIENT` | `proxy` | No |
| `EXPO_PUBLIC_WEATHER_API_BASE_URL` | Current public HTTPS WeatherON proxy URL | No |
| `EXPO_PUBLIC_WEATHER_API_TOKEN` | Current WeatherON proxy token | Yes |
| `EXPO_PUBLIC_WEATHER_TIMEOUT_MS` | `8000` | No |

Do not print the proxy token in build logs. The pre-Xcodebuild script validates
that the production proxy configuration exists without printing its values.

The iOS client requests WeatherKit data through the WeatherON proxy. Native
WeatherKit entitlement is therefore not required by the current client target.

## Xcode Cloud workflow

1. Open `apps/mobile/ios/WeatherON.xcworkspace` in Xcode.
2. Use Product > Xcode Cloud > Create Workflow.
3. Select the `WeatherON` product and the `main` branch.
4. Add an Archive action using the Release configuration.
5. Add a TestFlight Internal Testing post-action.
6. Add the workflow environment variables above.
7. In App Store Connect > WeatherON > Xcode Cloud > Settings > Build Number,
   set the next build number to `11` before the first distributed build.
8. Start the workflow and confirm that App Store Connect receives
   `1.0.0 (11)`.

Xcode Cloud owns subsequent iOS build-number increments. Keep
`MARKETING_VERSION` and `expo.ios.version` aligned when the app version changes.
