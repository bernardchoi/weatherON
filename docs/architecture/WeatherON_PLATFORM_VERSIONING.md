# WeatherON 플랫폼별 버전 관리

> 기준일: 2026-07-16
> 목적: WeatherON 1.0.0 릴리스 기준으로 Android와 iOS의 버전·빌드 번호를 독립적으로 관리한다.

## 현재 기준

| 플랫폼 | 사용자 표시 버전 | 빌드 번호 | 배포 채널 |
|---|---:|---:|---|
| Android | `1.0.0` | `10` | Google Play 테스트 |
| iOS | `1.0.0` | `7` | TestFlight |

## 소스 오브 트루스

| 플랫폼 | 사용자 표시 버전 | 빌드 번호 | 적용 파일 |
|---|---|---|---|
| Android | root `expo.version` | `expo.android.versionCode` | `apps/mobile/app.json`, `android/app/build.gradle` |
| iOS | `expo.ios.version` | `expo.ios.buildNumber` | `apps/mobile/app.json`, `ios/WeatherON.xcodeproj/project.pbxproj` |

`Info.plist`는 `$(MARKETING_VERSION)`과 `$(CURRENT_PROJECT_VERSION)`을 사용해 Xcode 빌드 설정을 그대로 반영한다.

## 운영 규칙

1. 사용자 표시 버전은 Android/iOS 모두 `1.0.0`으로 통일한다.
2. Android `versionCode`는 Play Console에 업로드된 `0.1.0 (9)`보다 커야 하므로 `10`부터 시작한다.
3. iOS `buildNumber`는 현재 TestFlight `1.0.0 (6)` 다음 값인 `7`부터 시작한다.
4. Android `versionCode`와 iOS `buildNumber`는 각 스토어별 증가 카운터라 서로 맞추지 않는다.
5. EAS production profile은 수동 버전 관리다. 업로드 전 아래 검사를 통과해야 한다.

```bash
npm run check:platform-versions
npm run check:android-release
```
