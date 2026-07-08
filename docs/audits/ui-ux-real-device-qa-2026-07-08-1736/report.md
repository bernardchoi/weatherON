# WeatherON 실기기 UI/UX QA

- 일시: 2026-07-08 17:36-18:11 KST
- 기기: Android real device `000841458003652`
- 앱: `com.weatheron.mobile`
- 버전: `0.1.0`, versionCode `7`
- 커밋: `cdd143b65`
- 빌드: Android release APK, `:app:assembleRelease`
- APK sha256: `97b96dfc5bb4c8ecc6e83ea258916cd935dba3e23afcc37da732e0f8b0c91235`

## 검증 결과

| 항목 | 결과 | 근거 |
|---|---|---|
| 릴리스 빌드 | 통과 | Gradle `BUILD SUCCESSFUL` |
| 버전 확인 | 통과 | `dumpsys package`와 APK badging 모두 `0.1.0 (7)` |
| 실기기 재설치 | 통과 | `npm run install:android-preview-apk` 성공 |
| 앱 실행 | 통과 | `Status: ok`, `LaunchState: WARM`, `WaitTime: 155ms` |
| 홈 | 통과 | `screens/01-home.png`, `ui/01-home.xml` |
| 하단 탭 IA | 통과 | 홈/코디/출발/MY 4탭 표시. 코디 탭 선택 상태 정상 |
| 코디 추천 | 통과 | `screens/02-outfit-tab.png`, `ui/02-outfit-tab.xml` |
| 코디 상세 | 통과 | `screens/03-outfit-detail.png`, `ui/03-outfit-detail.xml` |
| 코디 저장 | 통과 | 저장 완료 상태 반영. 하단 여백 보정 후 저장 완료 버튼 bottom 1745, 탭바 top 2164로 약 419px 여유 확인 |
| 출발 | 통과 | `screens/05-departure.png`, `ui/05-departure.xml` |
| MY | 통과 | `screens/06-my.png`, `ui/06-my.xml` |
| 알림 사이드바 | 통과 | 열림/우측 스와이프 닫힘 확인. `screens/07-notification-sidebar.png` |
| 크래시/치명 오류 | 통과 | `logs/crash.log` 비어 있음. 앱 PID 로그에 JS fatal 없음 |

## 해결된 개선점

1. 코디 상세 저장 완료 상태에서 하단 CTA 영역이 탭바와 너무 가까웠던 문제 해결.
   - 조치: 공통 AppScreen 하단 clearance 확대, C4 저장 흐름 액션 하단 여백 추가.
   - 재확인: `screens/09-outfit-saved-fixed.png`, `ui/09-outfit-saved-fixed.xml`
   - 결과: `저장 완료` 버튼 bottom 1745, 탭바 top 2164로 약 419px 여유 확보.

## 해결 확인된 항목

1. 출시 로드맵 조정 후 하단 탭에 `코디`가 복원됨.
   - 확인: `홈/코디/출발/MY`

2. C1 코디 탭에서 추천 기준, 오늘 입을 세트, 상세 보기 CTA가 표시됨.

3. C4 코디 상세에서 착장 구성과 추천 근거가 표시되고 저장 완료 상태가 반영됨.

4. 알림 사이드바는 닫기 버튼 없이 우측 스와이프로 닫힘.

## 재현 안 된 문제

- 앱 실행 중 크래시 없음.
- `FATAL EXCEPTION`, `AndroidRuntime`, `ANR`, `ReactNativeJS` 치명 로그 없음.
- 홈/코디/출발/MY 탭 전환 중 화면 빈 상태 없음.

## 산출물

- 화면 캡처: `screens/`
- UI 트리: `ui/`
- 로그: `logs/`
