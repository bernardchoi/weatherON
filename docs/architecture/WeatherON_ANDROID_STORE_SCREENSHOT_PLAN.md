# WeatherON Android Store Screenshot Plan

> 목적: Google Play 휴대전화 스크린샷 캡처 전 필요한 화면, 파일명, 검증 기준을 유지한다.
> 기준일: 2026-07-05

---

## 1. 기준

| 항목 | 값 |
|---|---|
| 기준 APK | `N/A - local Gradle release APK` |
| 앱 버전 | `0.1.0 (6)` |
| 캡처 대상 | Android phone |
| 권장 해상도 | 1080x1920 PNG |
| 저장 위치 | `assets/store/android-screenshots/` |
| manifest | `assets/store/android-screenshots/manifest.json` |
| 상태 리포트 | `WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md` |

공식 기준 참고:
- Google Play preview assets 도움말: https://support.google.com/googleplay/android-developer/answer/9866151

---

## 2. 캡처 목록

| 순서 | 파일명 | 화면 | 앱 내 이동 | 캡처 조건 |
|---|---|---|---|---|
| 1 | `phone-01-home.png` | H1 홈 | 하단 홈 | 현재 날씨, 목적지 상태, 알림 진입이 보임 |
| 2 | `phone-02-destination-search.png` | P1 목적지 검색 | 하단 출발 > 목적지 추가 | Kakao Local 결과 또는 fallback 결과가 보임 |
| 3 | `phone-03-destination-care.png` | G2 목적지 케어 | 하단 출발 > 목적지 카드 | 목적지 날씨와 케어 ON/OFF 상태가 보임 |
| 4 | `phone-04-notification-center.png` | M2 알림 센터 | 홈 알림 > 알림 센터 | 알림 목록과 조건 설정 진입이 보임 |
| 5 | `phone-05-settings-policy.png` | M/R 정책 허브 | 하단 MY > 설정/정책 | 개인정보, 알림, 광고 설정 접근이 보임 |

---

## 3. 캡처 전 QA

1. `WeatherON_ANDROID_DEVICE_QA_SESSION.md`의 D1~D6 통과
2. `npm run check:android-adb-ready`로 연결 기기와 화면 크기 확인
3. 하단 탭 `홈/코디/출발/MY` 확인, 소셜 화면은 캡처하지 않음
4. 내부 코드 `H1`, `Guest`, `READY`, `OUTER` 미노출 확인
5. 앱 아이콘/스플래시 깨짐 없음 확인
6. 작은 화면에서 버튼/텍스트 잘림 없음 확인
7. `manifest.json`의 `readyCount`가 5인지 확인
8. `manifest.json`의 `sourceBuildId`가 기준 APK와 같은지 확인

---

## 4. 검증 명령

```bash
npm run capture:android-store-screenshot -- phone-01-home.png
npm run capture:android-store-screenshot -- phone-02-destination-search.png
npm run capture:android-store-screenshot -- phone-03-destination-care.png
npm run capture:android-store-screenshot -- phone-04-notification-center.png
npm run capture:android-store-screenshot -- phone-05-settings-policy.png
npm run check:android-adb-ready
npm run check:android-store-screenshots-ready
WEATHERON_SCREENSHOT_REPORT_ONLY=1 npm run check:android-store-screenshots-ready
```

캡처 명령은 현재 실기기 화면을 그대로 저장한다. 각 화면을 앱에서 직접 연 뒤 같은 순서의 파일명으로 저장한다.

---

## 5. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-28 | Google Play 휴대전화 스크린샷 캡처 계획 작성 |
| 2026-06-28 | ADB 기반 `capture:android-store-screenshot` 캡처 명령 추가 |
| 2026-06-28 | 각 스크린샷 앱 내 이동 경로 추가 |
| 2026-06-28 | 스크린샷 manifest로 크기와 sha256 추적 추가 |
| 2026-06-28 | 스크린샷 manifest에 기준 build id와 app version 추적 추가 |
| 2026-06-28 | 스토어 스크린샷 기준 APK를 `419e3d2c-135b-41a1-88f6-3321ad5115f1` / `0.1.0 (3)`로 갱신 |
| 2026-06-28 | 홈 화면 날씨 연결 정상 캡처 반영 후 기준 APK를 `29665e88-4da7-41f2-8178-9e85de34ecee` / `0.1.0 (3)`로 갱신 |
| 2026-07-05 | MVP1 기준으로 코디 캡처를 제외하고 알림 센터 캡처로 교체 |
