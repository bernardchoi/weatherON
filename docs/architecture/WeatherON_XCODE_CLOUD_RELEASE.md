# WeatherON Xcode Cloud iOS release

WeatherON iOS TestFlight and App Store binaries are built with Xcode Cloud. Android builds continue to use EAS.

## Build rules

1. 빠른 개발·실기기 디버깅: 로컬 Xcode 27
2. 자동 빌드·테스트: Xcode Cloud
3. 배포 후보 실기기 QA: Xcode Cloud → TestFlight → 실제 iPhone
4. 최종 App Store 바이너리: Xcode Cloud
5. Android: EAS Build 유지

iOS 바이너리는 EAS Build로 만들거나 제출하지 않는다. Xcode Cloud는 원격 Git
브랜치를 복제하므로 배포 대상 변경은 검증 후 커밋·푸시되어 있어야 한다. 로컬
Xcode 설치 버전과 Cloud 실행 버전은 별개이며, Workflow 환경에서 Xcode 27 정식
버전을 선택한다.

## Project

- Repository: `bernardchoi/weatherON`
- Workspace: `apps/mobile/ios/WeatherON.xcworkspace`
- Scheme: `WeatherON`
- Branch: `main`
- Archive configuration: `Release`
- App version: `1.0.0`
- Current source build number: `40`
- Next distributed build number: App Store Connect의 최신 번호보다 큰 값

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
   set a number greater than the latest processed build before distribution.
8. Start the workflow and confirm the new build reaches App Store Connect and
   the intended TestFlight group.

Xcode Cloud owns subsequent iOS build-number increments. Keep
`MARKETING_VERSION` and `expo.ios.version` aligned when the app version changes.
