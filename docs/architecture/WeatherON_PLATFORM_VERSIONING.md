# WeatherON 플랫폼별 버전 관리

> 기준일: 2026-07-13
> 목적: Android 비공개 테스트와 iOS TestFlight의 버전·빌드 번호를 독립적으로 관리한다.

## 현재 기준

| 플랫폼 | 사용자 표시 버전 | 빌드 번호 | 배포 채널 |
|---|---:|---:|---|
| Android | `0.1.0` | `8` | Google Play 비공개 테스트 |
| iOS | `1.0` | `9` | TestFlight |

## 소스 오브 트루스

| 플랫폼 | 사용자 표시 버전 | 빌드 번호 | 적용 파일 |
|---|---|---|---|
| Android | root `expo.version` | `expo.android.versionCode` | `apps/mobile/app.json`, `android/app/build.gradle` |
| iOS | `expo.ios.version` | `expo.ios.buildNumber` | `apps/mobile/app.json`, `ios/WeatherON.xcodeproj/project.pbxproj` |

`Info.plist`는 `$(MARKETING_VERSION)`과 `$(CURRENT_PROJECT_VERSION)`을 사용해 Xcode 빌드 설정을 그대로 반영한다. iOS `version`은 root `expo.version`보다 우선하므로 Android 버전을 변경하지 않는다.

## 운영 규칙

1. Android 비공개 테스트 재업로드 전 `versionCode`를 증가한다.
2. iOS TestFlight 재업로드 전 같은 iOS 버전의 `buildNumber`를 증가한다. 현재 `1.0 (9)` 다음 값은 `1.0 (10)`이다.
3. 사용자 표시 버전은 플랫폼별 신규 릴리스에만 변경한다.
4. EAS production profile은 수동 버전 관리다. 업로드 전 아래 검사를 통과해야 한다.

```bash
npm run check:platform-versions
npm run check:android-release
```
