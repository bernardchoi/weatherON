# WeatherON Android QA Build Device Test - 2026-07-20 r3

## 1. Target

| 항목 | 값 |
|---|---|
| APK | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| Build 방식 | local Gradle release APK with `WEATHERON_BUILD_VARIANT=qa EAS_BUILD_PROFILE=qa` |
| Version | `1.0.0 (10)` |
| SHA-256 | `da404203b4e9582eb40aa7ccb6985174a5d97fc450c9fc9082041697b5e96e6e` |
| Size | `100M` |
| Device | A142 / adb `000841458003652` |
| Android | 16 |
| Screen | 1084x2412 |
| Tested at | 2026-07-20 21:48-21:56 KST |

## 2. Result

| ID | 항목 | 결과 | 증거 |
|---|---|---|---|
| D1 | APK 빌드/설치 | 통과 | Gradle `:app:assembleRelease` success, `adb install -r -d` Success |
| D2 | 첫 실행 | 통과 | COLD launch `TotalTime=296ms`, onboarding 화면 진입 후 `건너뛰기`로 홈 진입 |
| D4 | 홈 진입 | 통과 | `screens/02-home-after-skip.png` |
| D4-1 | 하단 탭 IA | 통과 | `screens/03-cody.png`, `screens/04-departure.png`, `screens/05-my.png` |
| D4-2 | 코디 상세/계정 게이트 | 통과 | `screens/06-cody-detail.png`, `screens/08-cody-save-gate.png` |
| D8 | 위치 권한 거부 | 통과 | `screens/15-permission-denied-home.png`, crash log 0 lines, 위치 권한 복구 완료 |
| D9 | 목적지 검색 | 통과 | `Jamsil` -> `잠실야구장` 선택/저장, `screens/11-destination-search-results.png`, `screens/13-destination-saved.png`, 테스트 목적지 삭제 `screens/23-destination-deleted-final.png` |
| D11 | 다크모드 | 통과 | `screens/16-dark-mode-home.png`, crash log 0 lines, light mode 복구 완료 |
| D12 | 네트워크 차단 | 통과 | active default network none, `screens/17-network-off-home.png`, crash log 0 lines, network 복구 완료 |

## 3. Validation

```bash
npm run check:platform-versions
npm run check:android-build-ready
npm run check:android-product-quality
WEATHERON_BUILD_VARIANT=qa EAS_BUILD_PROFILE=qa ./gradlew :app:assembleRelease --console=plain
adb -s 000841458003652 install -r -d apps/mobile/android/app/build/outputs/apk/release/app-release.apk
```

## 4. Restoration

- 테스트 목적지 `잠실야구장` 삭제 완료.
- `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` 재허용 완료.
- `cmd uimode night no` 복구 완료.
- Wi-Fi/data 재활성화 후 active default network `131` 확인.
- 새 온보딩 상태라 `POST_NOTIFICATIONS`는 미허용 상태 유지. OS 알림 수신 딥링크는 이번 r3에서 반복하지 않음.
