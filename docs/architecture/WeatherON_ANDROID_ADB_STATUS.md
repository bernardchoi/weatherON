# WeatherON Android ADB Status

> 생성일: 2026-07-20
> 목적: 실기기 QA와 스토어 스크린샷 캡처 전 ADB 연결 준비 상태를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 준비 상태 | 가능 |
| issue 수 | 0 |
| 선택 기기 | 000841458003652 |
| 화면 크기 | 1084x2412 |
| 화면 밀도 | 420 |
| Android 버전 | 16 |
| WeatherON 설치 | 설치됨 |
| adb 경로 | /Users/daehyeonchoi/Library/Android/sdk/platform-tools/adb |

## 2. ADB devices

| device id | state |
|---|---|
| 000841458003652 | device |

## 3. Issues

- 없음

## 4. 다음 조치

- `npm run install:android-preview-apk`로 최신 preview APK를 설치한다.
- 설치 후 `WeatherON_ANDROID_DEVICE_QA_SESSION.md`의 D1~D13 항목을 실기기 기준으로 판정한다.
- QA 통과 후 `npm run capture:android-store-screenshot -- <filename>`로 스토어 스크린샷 5장을 캡처한다.

## 5. 확인 명령

```bash
npm run check:android-adb-ready
WEATHERON_ADB_REPORT_ONLY=1 npm run check:android-adb-ready
adb devices
adb kill-server
adb start-server
```
