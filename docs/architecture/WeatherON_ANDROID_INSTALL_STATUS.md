# WeatherON Android Install Status

> 생성일: 2026-07-02
> 목적: 최신 Android preview APK 실기기 설치 상태와 설치 명령을 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 설치 가능 여부 | 가능 |
| 설치 상태 | 설치됨 |
| issue 수 | 0 |
| EAS build id | `802540a2-77a2-40cb-9b3b-15d9b3984ae2` |
| Build 상태 | FINISHED |
| APK artifact | https://expo.dev/artifacts/eas/c5GZmnH_LlJTr8f3ysnwjX1BTjQGcoiUcfL1DEOayd4.apk |
| 선택 기기 | 000841458003652 |
| adb 경로 | /Users/daehyeonchoi/Library/Android/sdk/platform-tools/adb |
| 로컬 APK | /var/folders/_5/fb8khc257cn_060s0g93zsdh0000gn/T/weatheron-802540a2-77a2-40cb-9b3b-15d9b3984ae2.apk |

## 2. Issues

- 없음

## 3. 다음 조치

- 설치 완료 후 `WeatherON_ANDROID_DEVICE_QA_SESSION.md`에 실기기 QA 결과를 기록한다.

## 4. 실행 명령

```bash
npm run check:android-adb-ready
npm run install:android-preview-apk
WEATHERON_INSTALL_REPORT_ONLY=1 npm run install:android-preview-apk
```
