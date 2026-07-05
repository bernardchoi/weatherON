# WeatherON Android Store Screenshot Status

> 생성일: 2026-06-28
> 목적: Google Play 휴대전화 스크린샷 캡처 상태와 파일 검증 결과를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 제출 가능 여부 | 가능 |
| issue 수 | 0 |
| 기준 build id | N/A - local Gradle release APK |
| 기준 app version | 0.1.0 (6) |
| 저장 위치 | `assets/store/android-screenshots/` |
| manifest | `assets/store/android-screenshots/manifest.json` |
| 준비 완료 파일 | 5/5 |

## 2. 캡처 상태

| 파일 | 화면 | 앱 내 이동 | 상태 | 크기 |
|---|---|---|---|---|
| phone-01-home.png | H1 홈 | 하단 홈 | 캡처됨 | 1084x2412 |
| phone-02-destination-search.png | P1 목적지 검색 | 하단 출발 > 목적지 추가 | 캡처됨 | 1084x2412 |
| phone-03-destination-care.png | G2 목적지 케어 | 하단 출발 > 목적지 카드 | 캡처됨 | 1084x2412 |
| phone-04-notification-center.png | M2 알림 센터 | 홈 알림 > 알림 센터 | 캡처됨 | 1084x2412 |
| phone-05-settings-policy.png | M/R 정책 허브 | 하단 MY > 설정/정책 | 캡처됨 | 1084x2412 |

## 3. Issues

- 없음

## 4. 확인 명령

```bash
npm run capture:android-store-screenshot -- phone-01-home.png
npm run capture:android-store-screenshot -- phone-02-destination-search.png
npm run capture:android-store-screenshot -- phone-03-destination-care.png
npm run capture:android-store-screenshot -- phone-04-notification-center.png
npm run capture:android-store-screenshot -- phone-05-settings-policy.png
npm run check:android-store-screenshots-ready
WEATHERON_SCREENSHOT_REPORT_ONLY=1 npm run check:android-store-screenshots-ready
```
