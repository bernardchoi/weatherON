# WeatherON 실기기 UI/UX QA

- 일시: 2026-07-08 11:36 KST
- 기기: Android real device `000841458003652`
- 앱: `com.weatheron.mobile`
- 버전: `0.1.0`, versionCode `7`
- 커밋: `885da8aaa`
- 빌드: Android release APK, `:app:assembleRelease`

## 검증 결과

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 정적 검증 | 통과 | `tsc --noEmit`, `check:shared`, `check:android-product-quality` |
| 릴리스 빌드 | 통과 | Gradle `BUILD SUCCESSFUL` |
| 실기기 재설치 | 통과 | `adb install -r` 성공 |
| 콜드 스타트 | 통과 | `LaunchState: COLD`, `WaitTime: 263ms` |
| 홈 | 통과 | `screens/01-home.png` |
| 홈 상단 날씨 아이콘 Pad 확대 | 통과 | `screens/09-home-weather-icon-pad.png`, `ui/09-home-weather-icon-pad.xml` |
| 출발 목록 | 통과 | `screens/02-departure-list.png` |
| 신사이바시역 해외 경로 표시 | 통과 | `screens/03-shinsaibashi-detail.png` |
| 도착 시간 편집기 | 통과 | `screens/04-arrival-editor.png` |
| 편집기 + 이동수단 드롭다운 | 통과 | `screens/05-transport-dropdown.png` |
| MY | 통과 | `screens/06-my.png` |
| 스마트 알림 설정 | 통과 | `screens/07-smart-alert-settings.png` |
| 앱 권한 관리 | 통과 | `screens/08-permission-management.png` |
| 크래시/치명 오류 | 통과 | `logs/crash.log`, `logs/pid-23294.log` |

## 확인한 개선 사항

1. 스마트 알림 설정의 `실제 수신` 라벨 줄바꿈이 해결됨.
   - 이전: `실제 수` / `신`으로 분리.
   - 현재: `실제 수신`으로 한 줄 표시.
   - 근거: `screens/07-smart-alert-settings.png`

2. 목적지 상세에서 도착 시간 편집기를 연 상태로 이동수단 드롭다운을 열어도 옵션이 하단 탭바에 걸리지 않음.
   - 근거: `screens/05-transport-dropdown.png`

3. 일본 목적지에서 비현실적인 도보 시간이나 전날 출발 시간이 노출되지 않음.
   - 현재 표시: `경로 확인 전`, `출발 계산 보류`, `해외 경로`, `자동 여유 보류`, `경로 확인 필요`
   - 도보 옵션: `장거리 목적지는 도보 제외`로 비활성화됨.
   - 근거: `screens/03-shinsaibashi-detail.png`, `screens/05-transport-dropdown.png`

4. 홈 상단 날씨 상태 아이콘이 확대된 Pad 안에서 잘리지 않음.
   - 변경 기준: `weatherOrb` 96px, 내부 아이콘 60px.
   - 실기기 bounds: Pad `[429,377][654,602]`, 아이콘 `[471,419][611,560]`.
   - 근거: `screens/09-home-weather-icon-pad.png`, `ui/09-home-weather-icon-pad.xml`

## 발견된 문제

- 이번 범위에서 새 UI/UX 문제는 확인되지 않음.
- 앱 실행 중 크래시 없음.
- `fatal`, `exception`, `anr`, `crash`, `ReactNativeJS`, `FATAL EXCEPTION` 로그 매칭 없음.

## 산출물

- 화면 캡처: `screens/`
- UI 트리: `ui/`
- 로그: `logs/`
