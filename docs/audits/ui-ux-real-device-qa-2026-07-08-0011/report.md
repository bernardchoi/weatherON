# WeatherON 실기기 UI/UX QA

- 일시: 2026-07-08 00:11 KST
- 기기: Android real device `000841458003652`
- 앱: `com.weatheron.mobile`
- 버전: `0.1.0`, versionCode `7`
- 커밋: `a59d72636`
- 빌드: Android release APK, `:app:assembleRelease`

## 검증 결과

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 릴리스 빌드 | 통과 | Gradle `BUILD SUCCESSFUL` |
| 실기기 재설치 | 통과 | `adb install -r` 성공 |
| 콜드 스타트 | 통과 | `LaunchState: COLD`, `WaitTime: 279ms` |
| 홈 | 통과 | `screens/01-home.png` |
| 출발 목록 | 통과 | `screens/08-departure-tab-real.png` |
| 신사이바시역 해외 경로 표시 | 통과 | `screens/09-shinsaibashi-detail.png` |
| 도착 시간 편집기 | 통과 | `screens/10-arrival-editor.png` |
| 편집기 + 이동수단 드롭다운 | 통과 | `screens/11-transport-dropdown-with-arrival-editor.png` |
| 장거리 도보 비활성 | 통과 | `screens/12-walk-disabled-tap.png` |
| MY | 통과 | `screens/13-my.png` |
| 스마트 알림 설정 | 개선 필요 | `screens/14-smart-alert-settings.png` |
| 앱 권한 관리 | 통과 | `screens/15-permission-management.png` |
| 크래시/치명 오류 | 통과 | `logs/crash.log`, `logs/pid-28956.log` |

## 확인된 개선 필요점

1. 스마트 알림 설정의 표시 확인 섹션에서 `실제 수신` 라벨이 `실제 수` / `신`으로 분리되어 보임.
   - 영향: 의미는 추정 가능하지만, 실사용자가 설정 상태를 읽을 때 완성도가 낮아 보임.
   - 근거: `screens/14-smart-alert-settings.png`
   - 후속 조치: `AlertSettingsScreen`의 표시 확인 라벨 폭을 보정함. 재실기기 확인 필요.

## 해결 확인된 항목

1. 목적지 상세에서 도착 시간 편집기를 연 상태로 이동수단 드롭다운을 열어도 옵션이 하단 탭바에 걸리지 않음.
   - 근거: `screens/11-transport-dropdown-with-arrival-editor.png`

2. 일본 목적지에서 비현실적인 도보 시간이나 전날 출발 시간이 노출되지 않음.
   - 현재 표시: `경로 확인 전`, `출발 계산 보류`, `해외 경로`, `자동 여유 보류`, `경로 확인 필요`
   - 도보 옵션: `장거리 목적지는 도보 제외`로 비활성화됨.
   - 근거: `screens/09-shinsaibashi-detail.png`, `screens/12-walk-disabled-tap.png`

3. MY의 권한/알림 상태는 현재 권한 상태를 명확히 보여줌.
   - 근거: `screens/13-my.png`, `screens/15-permission-management.png`

## 재현 안 된 문제

- 앱 실행 중 크래시 없음.
- `fatal`, `exception`, `anr`, `crash`, `ReactNativeJS`, `FATAL EXCEPTION` 로그 매칭 없음.
- 하단 탭바와 드롭다운 옵션 겹침 없음.
- 해외 장거리 도보 시간 노출 없음.

## 산출물

- 화면 캡처: `screens/`
- UI 트리: `ui/`
- 로그: `logs/`
