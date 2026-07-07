# WeatherON Android Real Device QA - 2026-07-07

> 목적: MVP1 비공개 테스트 중 최신 로컬 release APK를 실기기에 설치해 핵심 흐름, 알림, 화면 표시, 크래시 여부를 확인한다.

## 1. 환경

| 항목 | 값 |
|---|---|
| 기기 serial | `000841458003652` |
| 기기 | `A142 / Pacman` |
| 화면 | `1084x2412`, density override `375` |
| 패키지 | `com.weatheron.mobile` |
| 설치 버전 | `0.1.0 (7)` |
| 설치 파일 | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| 설치 결과 | `adb install -r` 성공 |
| 실행 결과 | `am start -W` 성공, `COLD` launch `214ms` |

## 2. 통과 항목

| 항목 | 결과 | 증거 |
|---|---|---|
| 설치/버전 | 통과 | `versionCode=7`, `versionName=0.1.0` |
| 앱 실행 | 통과 | `com.weatheron.mobile/.MainActivity` foreground 확인 |
| 홈 | 통과 | 현재 날씨, 목적지, 나갈 시간/비 완화/챙길 것 카드 표시 |
| 홈 위치 라벨 | 통과 | `내수동교회`와 `현재 30°`가 별도 줄로 표시됨 |
| 출발 탭 | 통과 | 저장 목적지 2곳, 출발/도착/알림 상태 표시 |
| 목적지 상세 | 통과 | 저장 완료 배너, 출발시간 역산, 도착 희망 접힘 토글 표시 |
| 도착 시간 편집 | 통과 | 시/분 스크롤 선택 UI 표시 |
| 이동수단 드롭다운 | 통과 | 옵션 표시 후 `도보` 선택 시 드롭다운 자동 닫힘 |
| MY | 통과 | 계정/권한/알림/정책 진입점 표시 |
| 권한 관리 | 통과 | 위치 수동 상태와 알림 허용 상태 분리 표시 |
| 알림 수신 | 통과 | WeatherON 확인 알림/목적지 알림/강수 알림이 알림창에 표시됨 |
| 알림 딥링크 | 통과 | 확인 알림 탭 후 스마트 알림 설정 화면 복귀 |
| 크래시 | 통과 | app pid logcat fatal/exception/anr/crash 패턴 없음, crash buffer 0줄 |

## 3. 관찰된 문제/개선 필요

| 우선순위 | 항목 | 관찰 | 상태 |
|---|---|---|---|
| P2 | 목적지 상세 하단 옵션 가림 | 도착 시간 편집기를 연 상태에서 이동수단 드롭다운을 열면 `자차/대중교통` 옵션 일부가 하단 탭 영역에 걸림. 스크롤로 접근 가능해 보이나 기본 노출은 답답함. | 해결 확인 |
| P2 | 장거리 도보 선택 UX | 일본 목적지에서 `도보` 선택 시 이동 시간이 `11077분`, 출발 시간이 전날 `22:53`처럼 표시됨. 계산 자체는 동작하지만 MVP1 사용자에게는 비현실 경로로 보일 수 있음. 장거리 도보는 제한하거나 `도보 권장 안 함` 안내 필요. | 해결 확인 |
| 보류 | 목적지 검색 자동 입력 | ADB `input text Osaka`가 기기 한글 IME에서 `ㅒㄴ맘`로 입력되어 검색 결과 검증 불가. 앱 버그로 판정하지 않음. 수동 입력 또는 테스트 IME로 재검증 필요. |

## 4. 수정 검증 - 2026-07-07

| 항목 | 결과 | 증거 |
|---|---|---|
| 장거리 도보 자동 복구 | 통과 | 신사이바시역 상세에서 `자동` 선택과 `경로 확인 전` 상태 표시. `11077분` 미노출. |
| 장거리 도보 비활성화 | 통과 | 이동수단 드롭다운에서 `도보` 항목 `enabled=false`, `장거리 목적지는 도보 제외` 안내 표시. |
| 비활성 도보 탭 방지 | 통과 | 도보 항목 탭 후에도 `자동` 선택과 `경로 확인 전` 상태 유지. |
| 드롭다운 하단 겹침 | 통과 | 도착 시간 편집기를 연 뒤 이동수단 드롭다운을 열면 편집기가 닫히고 옵션 목록이 탭바 위에서 끝남. |
| 해외 fallback 경로 시간 제거 | 통과 | Google 지도는 신사이바시 경로를 대중교통 약 `18시간 32분`과 시간표 제약으로 표시함. WeatherON은 실제 경로 API 확인 전까지 `150분`/`40분` 같은 기본값을 숨기고 `경로 확인 전`, `출발 계산 보류`, `해외 경로 확인 필요`로 표시. |
| 크래시 | 통과 | fix 검증 중 app pid logcat fatal/exception/anr/crash 패턴 없음, crash buffer 0줄. |

## 5. 증거 파일

- Screenshots: `docs/audits/android-real-device-qa-2026-07-07/screens/`
- UI dumps: `docs/audits/android-real-device-qa-2026-07-07/ui/`
- App logcat: `docs/audits/android-real-device-qa-2026-07-07/logcat-pid-25444.txt`
- Crash buffer: `docs/audits/android-real-device-qa-2026-07-07/logcat-crash.txt`
- Fix verification logcat: `docs/audits/android-real-device-qa-2026-07-07/logs/fix-verification-pid-29115.log`
- Fix verification crash buffer: `docs/audits/android-real-device-qa-2026-07-07/logs/fix-verification-crash.log`
- Fix screenshots: `17-fix-destination-detail.png`, `20-fix-transport-dropdown-open.png`, `21-fix-disabled-walk-tap.png`
- Overseas route fix screenshot: `26-fix-overseas-route-detail-final.png`
- Overseas route fix logcat: `docs/audits/android-real-device-qa-2026-07-07/logs/overseas-route-fix-pid-31922.log`

## 6. 결론

MVP1 비공개 테스트용 핵심 흐름은 실기기에서 진행 가능함. 설치, 실행, 홈, 출발, 목적지 상세, 권한, 알림 수신/탭 복귀는 통과. 추가로 목적지 상세의 하단 옵션 가림과 장거리 도보 선택 UX는 수정 후 실기기에서 해결 확인됨.
