# WeatherON Android QA Build Device Test - 2026-07-20 r2

## 1. Target

| 항목 | 값 |
|---|---|
| APK | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| Build 방식 | local Gradle release APK with `WEATHERON_BUILD_VARIANT=qa EAS_BUILD_PROFILE=qa` |
| Version | `1.0.0 (10)` |
| SHA-256 | `1f1f941cc7c2c0b4dec55ec247f6fd2158bee89c0e32dddb02d9e641011c98fc` |
| Size | `100M` |
| Device | A142 / adb `000841458003652` |
| Android | 16 |
| Screen | 1084x2412 |
| Tested at | 2026-07-20 20:27-20:31 KST |

## 2. Result

| ID | 항목 | 결과 | 증거 |
|---|---|---|---|
| D1 | APK 빌드/설치 | 통과 | Gradle `:app:assembleRelease` success, `adb install -r -d` Success |
| D2 | 첫 실행 | 통과 | COLD launch `TotalTime=224ms`, MainActivity foreground |
| D4 | 홈 진입 | 통과 | `screens/01-home.png` |
| D4-1 | 하단 탭 IA | 통과 | `screens/02-cody.png`, `screens/03-departure.png`, `screens/04-my.png` |
| D4-2 | 코디 상세/저장 | 통과 | `screens/05-cody-detail.png`, `screens/06-cody-save-result.png` |
| D8 | 위치 권한 거부 | 통과 | `screens/12-permission-denied-home.png`, crash log 0 lines, 권한 복구 완료 |
| D9 | 목적지 검색 | 통과 | `Jamsil` -> `잠실야구장` 선택/저장, `screens/08-destination-search-results.png`, `screens/10-destination-saved.png`, 테스트 목적지 삭제 `screens/11-destination-deleted.png` |
| D11 | 다크모드 | 통과 | `screens/13-dark-mode-home.png`, crash log 0 lines, light mode 복구 완료 |
| D12 | 네트워크 차단 | 통과 | active default network none, `screens/14-network-off-home.png`, crash log 0 lines, network 복구 완료 |

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
- Wi-Fi/data 재활성화 후 active default network `130` 확인.
