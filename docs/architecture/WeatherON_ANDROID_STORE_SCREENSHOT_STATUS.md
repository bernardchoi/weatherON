# WeatherON Android Store Screenshot Status

> 생성일: 2026-06-28
> 목적: Google Play 휴대전화 스크린샷 캡처 상태와 파일 검증 결과를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 제출 가능 여부 | 불가 |
| issue 수 | 1 |
| 기준 build id | 802540a2-77a2-40cb-9b3b-15d9b3984ae2 |
| 기준 app version | 0.1.0 (5) |
| 저장 위치 | `assets/store/android-screenshots/` |
| manifest | `assets/store/android-screenshots/manifest.json` |
| 준비 완료 파일 | 5/5 |

## 2. 캡처 상태

| 파일 | 화면 | 앱 내 이동 | 상태 | 크기 |
|---|---|---|---|---|
| phone-01-home.png | H1 홈 | 하단 홈 | 캡처됨 | 1084x2412 |
| phone-02-destination-search.png | P1 목적지 검색 | 하단 출발 > 목적지 추가 | 캡처됨 | 1084x2412 |
| phone-03-destination-care.png | G2 목적지 케어 | 하단 출발 > 목적지 카드 | 캡처됨 | 1084x2412 |
| phone-04-outfit.png | C1 코디 추천 | 하단 홈 > 코디 요약 | 캡처됨 | 1084x2412 |
| phone-05-settings-policy.png | M/R 정책 허브 | 하단 MY > 설정/정책 | 캡처됨 | 1084x2412 |

## 3. Issues

- screenshot plan build id mismatch: expected 802540a2-77a2-40cb-9b3b-15d9b3984ae2

## 4. 확인 명령

```bash
npm run capture:android-store-screenshot -- phone-01-home.png
npm run capture:android-store-screenshot -- phone-02-destination-search.png
npm run capture:android-store-screenshot -- phone-03-destination-care.png
npm run capture:android-store-screenshot -- phone-04-outfit.png
npm run capture:android-store-screenshot -- phone-05-settings-policy.png
npm run check:android-store-screenshots-ready
WEATHERON_SCREENSHOT_REPORT_ONLY=1 npm run check:android-store-screenshots-ready
```
