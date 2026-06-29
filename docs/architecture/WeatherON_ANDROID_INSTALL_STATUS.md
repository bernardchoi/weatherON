# WeatherON Android Install Status

> 생성일: 2026-06-29
> 목적: 최신 Android preview APK 실기기 설치 상태와 설치 명령을 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 설치 가능 여부 | 불가 |
| 설치 상태 | 미실행 |
| issue 수 | 1 |
| EAS build id | `419e3d2c-135b-41a1-88f6-3321ad5115f1` |
| Build 상태 | FINISHED |
| APK artifact | https://expo.dev/artifacts/eas/Cq_28HC_Rdep_5qC2b8n_oGL8K6WC-dgZfFPRyO9Qqc.apk |
| 선택 기기 | 없음 |
| adb 경로 | /Users/daehyeonchoi/Library/Android/sdk/platform-tools/adb |
| 로컬 APK | 미생성 |

## 2. Issues

- no Android device detected by adb

## 3. 다음 조치

- 먼저 `npm run check:android-adb-ready`로 ADB 연결 상태를 복구한다.
- 실기기 USB 디버깅을 켜고 `adb devices`에서 `device` 상태를 확인한다.
- 연결 복구 후 `npm run install:android-preview-apk`를 다시 실행한다.

## 4. 실행 명령

```bash
npm run check:android-adb-ready
npm run install:android-preview-apk
WEATHERON_INSTALL_REPORT_ONLY=1 npm run install:android-preview-apk
```
