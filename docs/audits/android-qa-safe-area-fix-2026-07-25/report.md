# WeatherON Android 안전영역·알림 사이드바 결함 수정 검증

## 1. 결론

2026-07-25 실기기 QA에서 발견된 Android edge-to-edge 안전영역 결함과 Android 제품 품질 게이트 실패를 수정했다.

- 홈 상단 “오늘 알림”과 알림 벨이 상태바 아래에 배치되고 실제 터치가 동작한다.
- 알림 사이드바의 제목·콘텐츠가 상태바와 겹치지 않는다.
- 알림 사이드바 하단 설정 버튼이 시스템 gesture bar 위에 배치된다.
- 하단 내비게이션이 시스템 navigation inset 위에 배치된다.
- `check:android-product-quality`가 통과한다.
- 최종 실기기 로그에서 crash, ANR, React Native/Expo 예외 및 edge-to-edge StatusBar 경고가 모두 0건이다.

## 2. 수정 내용

### 앱 전역 안전영역

- `react-native-safe-area-context@5.7.0`을 Expo SDK 57 호환 버전으로 설치했다.
- 앱 루트에 `SafeAreaProvider`와 `initialWindowMetrics`를 적용했다.
- 기존 React Native 기본 `SafeAreaView`를 safe-area-context 구현으로 교체했다.
- AppNavigator에서 top/right/bottom/left 네 방향 inset을 모두 적용했다.

### 알림 사이드바

- React Native `Modal`은 루트 SafeAreaView의 레이아웃 경계를 직접 상속하지 않으므로 `useSafeAreaInsets()`를 별도로 적용했다.
- 사이드바 패널의 top padding은 `max(insets.top, spacing.xl) + spacing.sm`으로 계산한다.
- bottom padding은 `max(insets.bottom, spacing.xl)`로 계산한다.
- 패널 배경은 edge-to-edge로 유지하고 실제 콘텐츠와 고정 CTA만 안전영역 안에 배치했다.

### Android 시스템 바 및 하단 내비게이션

- Android에서는 React Native `StatusBar` 컴포넌트가 기본 background/translucent 변경을 시도하지 않도록 렌더링하지 않는다.
- Android status bar 아이콘 스타일은 `StatusBar.setBarStyle()`로만 갱신한다.
- `BottomNav`에 `androidMaterialSurface(theme, "navigation")`를 실제 스타일로 적용했다.

### 품질 게이트에서 추가 발견된 항목

- 옷장 추가 CTA를 “내 옷장에 추가”로 명확히 하고 접근성 레이블을 추가했다.
- Firebase 자동 초기화 provider를 manifest merge에서 제거하는 선언을 추가했다.

## 3. 정적 검사와 빌드

| 검사 | 결과 |
|---|---|
| TypeScript `tsc --noEmit` | 통과 |
| `expo install --check` | 통과, dependencies up to date |
| `check:android-product-quality` | 통과 |
| Gradle `:app:assembleRelease` | 통과 |
| Android lintVital release | 통과 |
| R8 코드 축소·리소스 축소 | 통과 |

최초 클린 빌드의 마지막 lint 단계에서 Gradle transform 임시 디렉터리 이동 오류가 한 차례 발생했으나, 동일 산출물의 증분 재시도에서 lintVital과 APK 패키징이 정상 완료됐다. 소스나 lint 규칙 오류는 아니었다.

Expo SDK 57 Android 템플릿으로 전환하면서도 기존 업로드 서명 설정과 ProGuard 규칙을 유지했다. 최종 QA 릴리스는 minify와 resource shrink를 활성화한 프로덕션 조건으로 재빌드했다.

## 4. 최종 APK

| 항목 | 값 |
|---|---|
| APK | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| 크기 | 113,551,747 bytes |
| SHA-256 | `28D389105EABFBD3B8E0C31838E118B228C8CDE6796D6D6F7879BF6AF5616E51` |
| 패키지 | `com.weatheron.mobile` |
| 빌드 플래그 | `WEATHERON_BUILD_VARIANT=qa`, `EAS_BUILD_PROFILE=qa`, `NODE_ENV=production` |

## 5. 실기기 검증

| 항목 | 결과 |
|---|---|
| 기기 | Nothing A142 / Android 16 API 36 |
| 설치 | `adb install -r -d` 성공 |
| 최종 R8 APK 콜드 런치 | 성공, 934ms |
| 홈 알림 벨 | 사이드바 열림 |
| 사이드바 알림 센터 | 알림 센터 화면 이동 성공 |
| 홈 오늘 알림 | 스마트 알림 설정 이동 성공 |
| 상세 화면 뒤로 버튼 | 실제 터치 성공 |
| 하단 내비게이션 | 홈·코디 이동 성공 |
| crash / ANR / JS 예외 | 0건 |
| `StatusBarModule` edge-to-edge 경고 | 0건 |

## 6. UI bounds 전후 비교

| UI | 수정 전 | 수정 후 |
|---|---|---|
| 홈 오늘 알림 | `[47,9][229,113]` | `[47,135][229,239]` |
| 홈 알림 벨 | `[934,9][1037,113]` | `[934,135][1037,239]` |
| 하단 내비게이션 | y=`2261..2397` | y=`2205..2341` |
| 사이드바 첫 액션 | y=`248..351` | y=`327..430` |
| 알림 설정 화면 뒤로 버튼 | 상태바와 겹침 | `[47,175][150,278]` |

## 7. 증거

- 수정된 홈: `screens/01-home.png`
- 홈 알림 사이드바 동작: `screens/02-notification-sidebar.png`
- 최종 안전영역 적용 사이드바: `screens/10-sidebar-safe.png`
- 최종 홈 콜드 런치: `screens/12-final-fixed-home.png`
- 최종 R8 APK 사이드바: `screens/13-r8-sidebar.png`
- UI 트리: `ui/*.xml`
- 최종 R8 APK UI 트리: `ui/13-r8-sidebar.xml`
- 최종 흐름 로그: `logs/final-flow-logcat.txt`
- 최종 crash buffer: `logs/final-crash-logcat.txt`
- 최종 콜드 런치 로그: `logs/final-fixed-cold-launch-logcat.txt`
- 최종 R8 APK 스모크 로그: `logs/r8-smoke-logcat.txt`
- 최종 R8 APK crash buffer: `logs/r8-smoke-crash-logcat.txt`

## 8. 기기 상태 원복

- `window_animation_scale=1`
- `transition_animation_scale=1`
- `animator_duration_scale=1`
- 네트워크, 시스템 테마, 앱 권한은 변경하지 않았다.
- 앱은 최종 콜드 런치 후 홈 화면에 둔 상태다.
