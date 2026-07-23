# WeatherON Android ADB Status

> 생성일: 2026-07-23
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

- no Android device detected by adb

## 4. 다음 조치

- 실기기: USB 케이블 연결 후 개발자 옵션 > USB 디버깅을 켠다.
- 기기 화면의 `USB 디버깅을 허용하시겠습니까?` 팝업에서 허용한다.
- 연결 후 `adb devices`에 `device` 상태가 보이면 `npm run check:android-adb-ready`를 다시 실행한다.
- 에뮬레이터: Android Studio Device Manager에서 AVD를 정상 부팅한 뒤 `adb devices`를 확인한다.

## 5. 확인 명령

```bash
npm run check:android-adb-ready
WEATHERON_ADB_REPORT_ONLY=1 npm run check:android-adb-ready
adb devices
adb kill-server
adb start-server
```
