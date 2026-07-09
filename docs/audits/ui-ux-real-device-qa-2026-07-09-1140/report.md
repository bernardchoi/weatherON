# WeatherON 실기기 UI/UX QA

- 일시: 2026-07-09 12:47-12:51 KST
- 기기: Android real device `000841458003652`
- 앱: `com.weatheron.mobile`
- 버전: `0.1.0`, versionCode `7`
- 기준 커밋: `94c48733b`
- 빌드: Android release APK, `:app:assembleRelease`
- APK sha256: `d28c4a5fedbdc11c686512f04bb036afd3087be264b89f8003f22723c354c1f7`

## 검증 결과

| 항목 | 결과 | 근거 |
|---|---|---|
| 정적 검증 | 통과 | `git diff --check`, `tsc --noEmit`, `check:android-product-quality` |
| 릴리즈 빌드 | 통과 | Gradle `BUILD SUCCESSFUL` |
| 실기기 재설치 | 통과 | `adb install -r -d` 성공 |
| 버전 확인 | 통과 | `dumpsys package` 기준 `0.1.0 (7)` |
| 앱 실행 | 통과 | `MainActivity` 실행 후 PID `16000` 유지 |
| 홈 | 개선 필요 | `screens/01-home.png` |
| 코디 | 개선 필요 | `screens/02-codi.png` |
| 출발 | 개선 필요 | `screens/03-departure.png` |
| MY | 개선 필요 | `screens/04-my.png` |
| 알림 사이드바 | 통과 | `screens/05-alert-sidebar.png`, `screens/06-alert-sidebar-closed.png` |
| 크래시/치명 오류 | 통과 | `logs/crash.log` 비어 있음 |

## 강점

1. 홈 첫 화면에서 날씨 카드, 오늘 코디 카드, 목적지 기준 카드, 판단 카드 3개가 한 화면에 들어옴.
2. 목적지 카드는 선택 목적지를 헤더와 버튼에 중복 노출하지 않고 칩 선택 상태로 보여줌.
3. 코디/출발/MY 본문 주요 카드와 CTA는 크래시 없이 렌더링됨.
4. 알림 사이드바는 닫기 버튼 없이 스와이프 닫힘이 정상 동작함.

## UX 리스크

1. 하단 탭 `출발` 라벨이 모든 화면에서 `출`로 잘려 표시됨.
   - 영향: 탭 의미가 불명확해지고 4탭 IA 품질이 낮아 보임.
   - 근거: `screens/01-home.png`, `screens/02-codi.png`, `screens/03-departure.png`, `screens/04-my.png`

2. 코디 탭 첫 화면 하단에서 `오늘의 판단` 카드가 탭바 뒤로 일부 가려짐.
   - 영향: 다음 콘텐츠가 숨은 상태로 보여 화면 마감이 어색함.
   - 근거: `screens/02-codi.png`

3. 홈 목적지 칩 첫 번째 항목이 `대구삼성라이온...`으로 말줄임됨.
   - 영향: 선택 목적지의 실제 이름을 한눈에 확인하기 어려움.
   - 근거: `screens/01-home.png`

## 접근성 리스크

1. 하단 탭 라벨 잘림은 시각 사용자에게 정보 축약으로 보이며, 큰 글꼴/다른 Android 폰트 스케일에서 더 악화될 수 있음.
2. 홈 UI 트리 저장은 `uiautomator`가 `ERROR: could not get idle state.`를 반환해 이번 세션에서 접근성 트리 기반 판정이 제한됨.
3. 스크린샷만으로 TalkBack 읽기 순서, 포커스 순서, 실제 터치 타깃 크기 적합성은 완전 판정하지 않음.

## 권장 조치

1. `BottomNav` 라벨 컨테이너 폭/텍스트 렌더링을 조정해 `출발` 2글자가 항상 표시되도록 수정.
2. 코디 탭 첫 화면 하단 여백 또는 첫 카드 컷 기준을 보정해 다음 카드가 탭바 뒤로 물리지 않게 조정.
3. 목적지 칩은 긴 이름일 때 2줄 허용 또는 선택 칩 폭 보정 검토.
4. 수정 후 같은 기기에서 홈/코디/출발/MY 캡처와 crash log를 재확인.

## 수정 후 재검증

- 일시: 2026-07-09 14:18-14:19 KST
- APK sha256: `ce48b015f9ab32a09eb4d817d8b5e2f87263ccba60ae35fa34abd85761dadbe5`
- 앱 실행: 통과, PID `22149` 유지
- crash log: `logs/crash-after-fix.log` 비어 있음

| 항목 | 결과 | 근거 |
|---|---|---|
| 홈 하단 탭 | 통과 | `fixed-screens-v2/01-home-fixed.png`에서 `출발` 라벨 전체 표시 |
| 코디 하단 탭 | 통과 | `fixed-screens-v2/02-codi-fixed.png`에서 `출발` 라벨 전체 표시 |
| 코디 첫 화면 카드 컷 | 통과 | `fixed-screens-v2/02-codi-fixed.png`에서 다음 카드가 탭바 뒤로 가려지지 않음 |
| 출발 하단 탭 | 통과 | `fixed-screens-v2/03-departure-fixed.png`에서 `출발` 라벨 전체 표시 |
| MY 하단 탭 | 통과 | `fixed-screens-v2/04-my-fixed.png`에서 `출발` 라벨 전체 표시 |

## 산출물

- 화면 캡처: `screens/`
- 수정 후 화면 캡처: `fixed-screens-v2/`
- UI 트리: `ui/`
- 로그: `logs/`
