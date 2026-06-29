# WeatherON Android ADB Status

> 생성일: 2026-06-29
> 목적: 실기기 QA와 스토어 스크린샷 캡처 전 ADB 연결 준비 상태를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 준비 상태 | 불가 |
| issue 수 | 1 |
| 선택 기기 | 없음 |
| 화면 크기 | 미확인 |
| 화면 밀도 | 미확인 |
| Android 버전 | 미확인 |
| WeatherON 설치 | 미확인 |
| adb 경로 | /Users/daehyeonchoi/Library/Android/sdk/platform-tools/adb |

## 2. ADB devices

| device id | state |
|---|---|
| - | 미감지 |

## 3. Issues

- adb devices failed

## 4. 다음 조치

- Issues 항목 확인 후 `adb devices` 상태를 먼저 복구한다.

## 5. 확인 명령

```bash
npm run check:android-adb-ready
WEATHERON_ADB_REPORT_ONLY=1 npm run check:android-adb-ready
adb devices
adb kill-server
adb start-server
```
