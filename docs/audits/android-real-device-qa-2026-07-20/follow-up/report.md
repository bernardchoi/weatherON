# WeatherON Android Real Device QA Follow-up - 2026-07-20

## 1. Target

| 항목 | 값 |
|---|---|
| APK | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| Version | `1.0.0 (10)` |
| SHA-256 | `c4cd28b1c92565710b3d53233019896fdc0c9ac463a88be839f33792bbe82450` |
| Device | A142 / adb `000841458003652` |
| Android | 16 |
| Tested at | 2026-07-20 19:56-20:06 KST |

## 2. Result

| ID | 항목 | 결과 | 증거 |
|---|---|---|---|
| D4-2 | 코디 상세 전체 플로우 | 통과 | `12-cody-list.png` -> `13-cody-detail.png` -> `14-cody-save-result.png` -> `15-cody-return-after-save.png` |
| D8 | 위치 권한 거부 | 통과 | `24-permission-denied-home.png`, `permission-denied-summary.txt`, crash log 0 lines |
| D9 | 목적지 검색 | 통과 | `19-destination-search-jamsil-results.png` -> `22-destination-jamsil-saved.png`, 테스트 목적지 삭제 `23-destination-jamsil-delete-after-test.png` |
| D11 | 다크모드 | 통과 | `25-dark-mode-home.png`, crash log 0 lines |
| D12 | 네트워크 차단 | 통과 | `26-network-off-home.png`, `network-off-summary.txt`, crash log 0 lines |

## 3. Evidence

| 파일 | 내용 |
|---|---|
| `screens/11-home-followup-start.png` | follow-up 시작 홈 |
| `screens/12-cody-list.png` | 코디 탭 리스트와 `상세 보기` |
| `screens/13-cody-detail.png` | 코디 상세, 아이템, 하단 CTA |
| `screens/14-cody-save-result.png` | `코디 저장 완료`, 저장 완료 CTA |
| `screens/15-cody-return-after-save.png` | 코디 저장 후 목록 복귀 |
| `screens/18-destination-search-empty.png` | 목적지 검색 진입 |
| `screens/19-destination-search-jamsil-results.png` | `Jamsil` 검색 결과, `잠실야구장` 후보 |
| `screens/20-destination-jamsil-selected.png` | `잠실야구장 선택됨` |
| `screens/21-destination-jamsil-save-cta.png` | `목적지 저장하고 비교` CTA 활성 |
| `screens/22-destination-jamsil-saved.png` | 저장 후 목적지 상세/비교 화면 |
| `screens/23-destination-jamsil-delete-after-test.png` | 테스트 목적지 삭제 후 원상복구 |
| `screens/24-permission-denied-home.png` | 위치 권한 거부 상태 홈 |
| `screens/25-dark-mode-home.png` | system night mode 홈 |
| `screens/26-network-off-home.png` | Wi-Fi/data off 상태 홈 |
| `logs/permission-denied-summary.txt` | 위치 권한 revoke/복구 요약 |
| `logs/network-off-summary.txt` | 네트워크 차단/복구 요약 |
| `logs/final-restoration-summary.txt` | 최종 권한/네트워크/라이트 모드 복구 요약 |

## 4. State Restoration

- 테스트 목적지 `잠실야구장` 삭제 완료.
- `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` 재허용 완료.
- `cmd uimode night no` 복구 완료.
- Wi-Fi/data 재활성화 후 active default network `129 WIFI` 확인.

## 5. Notes

- `uiautomator dump`는 이전 회차와 동일하게 idle state 이슈가 있어 screenshot, `dumpsys`, crash log 중심으로 판정.
- 개인정보가 섞일 수 있는 launcher screenshot과 원본 device-wide `dumpsys` 로그는 follow-up `.gitignore`로 제외.
