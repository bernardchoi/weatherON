# WeatherON Android Store Screenshot Packet

> 생성일: 2026-07-03
> 목적: Google Play 휴대전화 스크린샷 5장을 같은 기준 APK와 파일명으로 캡처하기 위한 작업 패킷이다.

## 1. 캡처 기준

| 항목 | 값 |
|---|---|
| 기준 preview build | `N/A - local Gradle release APK` |
| screenshot 기준 build | `N/A - local Gradle release APK` |
| screenshot 기준 app version | `0.1.0 (6)` |
| APK artifact | apps/mobile/android/app/build/outputs/apk/release/app-release.apk |
| 저장 위치 | assets/store/android-screenshots/ |
| manifest | `assets/store/android-screenshots/manifest.json` |
| 현재 screenshot issue | 1 |
| ADB 준비 상태 | 가능 |
| ADB 선택 기기 | 000841458003652 |
| ADB issue | 0 |
| 권장 해상도 | 1080x1920 이상 PNG |

## 2. 캡처 목록

| 순서 | 파일명 | 화면 | 앱 내 이동 | 캡처 조건 |
|---|---|---|---|---|
| 1 | `phone-01-home.png` | H1 홈 | 하단 홈 | 현재 날씨, 코디 요약, 우산/알림 진입이 보임 |
| 2 | `phone-02-destination-search.png` | P1 목적지 검색 | 하단 출발 > 목적지 추가 | Kakao Local 결과 또는 fallback 결과가 보임 |
| 3 | `phone-03-destination-care.png` | G2 목적지 케어 | 하단 출발 > 목적지 카드 | 목적지 날씨와 케어 ON/OFF 상태가 보임 |
| 4 | `phone-04-outfit.png` | C1 코디 추천 | 하단 홈 > 코디 요약 | 날씨 기반 착장과 추천 사유가 보임 |
| 5 | `phone-05-settings-policy.png` | M/R 정책 허브 | 하단 MY > 설정/정책 | 개인정보, 알림, 광고 설정 접근이 보임 |

## 3. 캡처 순서

1. 최신 preview APK 설치 후 D1~D6 QA 통과 확인
2. `npm run check:android-adb-ready`로 ADB 준비 상태 확인
3. Android 기기를 세로 방향으로 고정
4. 각 화면으로 직접 이동
5. 아래 명령을 파일명별로 실행
6. `npm run check:android-store-screenshots-ready`로 크기와 누락 여부 확인
7. `assets/store/android-screenshots/manifest.json`에서 파일별 크기와 sha256 확인
8. manifest의 `sourceBuildId`가 screenshot 기준 build와 같은지 확인

## 4. 명령

```bash
npm run check:android-adb-ready
npm run capture:android-store-screenshot -- phone-01-home.png
npm run capture:android-store-screenshot -- phone-02-destination-search.png
npm run capture:android-store-screenshot -- phone-03-destination-care.png
npm run capture:android-store-screenshot -- phone-04-outfit.png
npm run capture:android-store-screenshot -- phone-05-settings-policy.png
npm run check:android-store-screenshots-ready
```

## 5. 주의

- 하단 탭은 `홈/출발/MY` 기준이어야 하며, 코디 캡처는 홈의 코디 요약 카드 기준으로 진행한다.
- 개발용 route id, 내부 상태값, placeholder 문구가 보이면 캡처하지 않는다.
- Google Play 업로드 전 파일명은 본 문서와 동일하게 유지한다.
- ADB 준비 상태가 `불가`이면 먼저 USB 디버깅 또는 에뮬레이터 연결을 복구한다.
- manifest의 `readyCount`가 5가 아니면 제출 파일로 보지 않는다.
- manifest의 `sourceBuildId`가 기준 preview build와 다르면 제출 파일로 보지 않는다.
