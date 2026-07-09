# WeatherON 실기기 UI/UX QA

- 일시: 2026-07-09 11:19-11:22 KST
- 기기: Android real device `000841458003652`
- 앱: `com.weatheron.mobile`
- 버전: `0.1.0`, versionCode `7`
- 기준 커밋: `9a744dcf1`
- 빌드: Android release APK, `:app:assembleRelease`
- APK sha256: `648b3a8343cc3becdfe266e1bcaabe63ee9dafbef2cbc9af3ee478fd105f6ba1`

## 검증 결과

| 항목 | 결과 | 근거 |
|---|---|---|
| 정적 검증 | 통과 | `git diff --check`, `tsc --noEmit`, `check:android-product-quality` |
| 릴리즈 빌드 | 통과 | Gradle `BUILD SUCCESSFUL` |
| 실기기 재설치 | 통과 | `adb install -r -d` 성공 |
| 버전 확인 | 통과 | `dumpsys package` 기준 `0.1.0 (7)` |
| 앱 실행 | 통과 | `MainActivity` 실행 후 PID 유지 |
| 홈 | 통과 | `screens/02-home-after-gradient-fix.png`, `ui/02-home-after-gradient-fix.xml` |
| 홈 하단 판단 카드 | 통과 | 첫 화면에서 판단 카드 3개가 탭바 위에 노출됨 |
| 코디 | 통과 | `screens/03-codi.png` |
| 출발 | 통과 | `screens/04-departure.png` |
| MY | 통과 | `screens/05-my.png` |
| 알림 사이드바 | 통과 | `screens/06-alert-sidebar.png`, `screens/07-alert-sidebar-closed.png` |
| 크래시/치명 오류 | 통과 | 수정 후 `logs/crash.log` 비어 있음 |

## QA 중 수정한 항목

1. 릴리즈 앱 첫 실행 크래시 수정.
   - 증상: `ExpoLinearGradient` native ViewManager 미등록으로 `MainActivity` 실행 직후 종료.
   - 조치: `WeatherBackground`에서 `expo-linear-gradient` 의존을 제거하고 순수 React Native View 레이어 배경으로 대체.
   - 결과: 릴리즈 재빌드, 재설치, 실행, 홈/탭/사이드바 확인 통과.

2. 홈 목적지 선택 카드 UX 정리 확인.
   - 선택 목적지를 헤더와 버튼에 중복 노출하지 않고, 저장 목적지 칩 리스트에서 선택 상태를 표시함.
   - 홈 첫 화면 밀도 압축 후 하단 판단 카드가 탭바에 가리는 기존 이슈는 재현되지 않음.

3. 앱 전역 Pretendard 적용 확인.
   - `expo-font`로 Pretendard 정적 웨이트를 로드하고, 전역 Text 렌더에 웨이트별 패밀리를 주입.

## 남은 개선 후보

- 코디 탭 첫 화면 하단에서 다음 카드 일부가 탭바 뒤로 이어져 보임. 홈 이슈와 별개로 코디 탭 스크롤 끝 여백/첫 화면 컷 기준 재검토 필요.

## 산출물

- 화면 캡처: `screens/`
- UI 트리: `ui/`
- 로그: `logs/`
