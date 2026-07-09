# WeatherON Android Install Status

> 생성일: 2026-07-08
> 목적: 최신 Android preview APK 실기기 설치 상태와 설치 명령을 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 설치 가능 여부 | 가능 |
| 설치 상태 | 설치됨 |
| issue 수 | 0 |
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | LOCAL BUILD SUCCESS |
| Version | 0.1.0 (7) |
| APK artifact | apps/mobile/android/app/build/outputs/apk/release/app-release.apk |
| APK sha256 | 648b3a8343cc3becdfe266e1bcaabe63ee9dafbef2cbc9af3ee478fd105f6ba1 |
| 선택 기기 | 000841458003652 |
| adb 경로 | /Users/daehyeonchoi/Library/Android/sdk/platform-tools/adb |
| 로컬 APK | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/apps/mobile/android/app/build/outputs/apk/release/app-release.apk |
| 최신 QA 리포트 | docs/audits/ui-ux-real-device-qa-2026-07-09-1122/report.md |

## 2. Issues

- 없음

## 3. 다음 조치

- 코디 탭 첫 화면 하단 컷 기준은 다음 UI/UX 보정 때 재검토한다.

## 4. 실행 명령

```bash
npm run check:android-adb-ready
npm run install:android-preview-apk
WEATHERON_INSTALL_REPORT_ONLY=1 npm run install:android-preview-apk
```
