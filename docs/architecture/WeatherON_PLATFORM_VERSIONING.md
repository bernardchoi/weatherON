# WeatherON 플랫폼별 버전 관리

> 기준일: 2026-07-16
> 목적: WeatherON 1.0.0 릴리스 기준으로 Android와 iOS의 버전·빌드 번호를 독립적으로 관리한다.

## 현재 기준

| 플랫폼 | 사용자 표시 버전 | 빌드 번호 | 배포 채널 |
|---|---:|---:|---|
| Android | `1.0.0` | `19` | EAS Build → Google Play 테스트 |
| iOS | `1.0.0` | `40` | Xcode Cloud → TestFlight |

## 소스 오브 트루스

| 플랫폼 | 사용자 표시 버전 | 빌드 번호 | 적용 파일 |
|---|---|---|---|
| Android | root `expo.version` | `expo.android.versionCode` | `apps/mobile/app.json`, `android/app/build.gradle` |
| iOS | `expo.ios.version` | Xcode Cloud/App Store Connect build counter | `apps/mobile/app.json`, `ios/WeatherON.xcodeproj/project.pbxproj`, App Store Connect |

`Info.plist`는 `$(MARKETING_VERSION)`과 `$(CURRENT_PROJECT_VERSION)`을 사용해 Xcode 빌드 설정을 그대로 반영한다.

## 운영 규칙

1. 사용자 표시 버전은 Android/iOS 모두 `1.0.0`으로 통일한다.
2. Android 소스의 현재 `versionCode`는 `19`이며 이후 EAS Build마다 증가시킨다.
3. iOS 소스의 `buildNumber`와 `CURRENT_PROJECT_VERSION`은 현재 `40`으로 맞추고, Xcode Cloud 배포 번호는 App Store Connect의 최신 처리 번호보다 크게 설정한다.
4. Android `versionCode`와 iOS `buildNumber`는 각 스토어별 증가 카운터라 서로 맞추지 않는다.
5. iOS 개발·실기기 디버깅은 로컬 Xcode 27, 자동 빌드·테스트와 TestFlight·App Store 바이너리는 Xcode Cloud를 사용한다.
6. Android 개발·QA·Play AAB 빌드는 EAS Build를 유지한다. 업로드 전 아래 검사를 통과해야 한다.

```bash
npm run check:platform-versions
npm run check:android-release
```
