# WeatherON Android QA 빌드·실기기 테스트 보고서

> 후속 상태: 이 보고서에서 확인된 QAB-001과 QAB-002는 같은 날 수정·실기기 재검증을 완료했다. 결과는 `../android-qa-safe-area-fix-2026-07-25/report.md`를 참조한다.

## 1. 결론

QA 릴리스 APK 빌드, 실기기 설치, 콜드 런치, 핵심 탭·상세 화면·권한·로컬 알림 흐름은 정상 동작했다. 앱 프로세스 로그와 crash buffer에서 크래시, ANR, React Native 예외는 발견되지 않았다.

다만 현재 빌드는 **조건부 실패(수정 후 재검증 필요)** 로 판정한다.

1. Android edge-to-edge 안전영역이 적용되지 않아 상태바와 홈 상단 컨트롤이 겹치며, 해당 컨트롤을 실기기에서 터치할 수 없다.
2. `check:android-product-quality`가 `BottomNav`의 Android navigation material surface 규칙 누락으로 실패한다.

## 2. 테스트 대상

| 항목 | 값 |
|---|---|
| 빌드 방식 | 로컬 Gradle release APK |
| 빌드 환경 | `WEATHERON_BUILD_VARIANT=qa`, `EAS_BUILD_PROFILE=qa`, `NODE_ENV=production` |
| Gradle 작업 | `:app:assembleRelease` |
| APK | `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` |
| 패키지 | `com.weatheron.mobile` |
| 버전 | `1.0.0 (10)` |
| min / target / compile SDK | 24 / 36 / 36 |
| ABI | arm64-v8a, armeabi-v7a, x86, x86_64 |
| APK 크기 | 119,371,537 bytes |
| SHA-256 | `62A650EBD251F96BC5960026E5BC903C98D3CD342DCCD9E721F76D3F3A538868` |
| 실기기 | Nothing A142, Android 16 / API 36 |
| ADB serial | `000841458003652` |
| 화면 | 1084 × 2412, density override 375 |
| 테스트 일시 | 2026-07-25 KST |

## 3. 빌드 및 정적 검사

| 검사 | 결과 | 비고 |
|---|---|---|
| TypeScript `tsc --noEmit` | 통과 | 오류 없음 |
| `expo install --check` | 통과 | Expo SDK 57 의존성 정합 |
| Expo doctor | 주의 | 19/20, native 폴더와 app config 동기화 경고 1건 |
| Gradle `:app:assembleRelease` | 통과 | `BUILD SUCCESSFUL`, 약 59초 |
| `check:android-product-quality` | 실패 | `BottomNav.tsx must include: androidMaterialSurface(theme, "navigation")` |

## 4. 실기기 QA 결과

| ID | 시나리오 | 결과 | 증거 / 관찰 |
|---|---|---|---|
| D1 | APK 설치 | 통과 | `adb install -r -d` → `Success` |
| D2 | 콜드 런치 | 통과 | 최종 `LaunchState: COLD`, `TotalTime: 623ms`, MainActivity 정상 |
| D3 | 홈 날씨·목적지 렌더링 | 부분 통과 | 주요 콘텐츠 정상. 상단 안전영역 결함은 QAB-001 참조 |
| D4 | 하단 홈·코디·출발·MY 이동 | 통과 | `screens/01-launch.png`, `02-cody.png`, `04-departure.png`, `07-my.png` |
| D5 | 코디 상세 | 통과 | 상세, 옷장, 아이템 추가, 저장 액션 노출 확인. 기존 데이터 보호를 위해 저장은 실행하지 않음 |
| D6 | 목적지 상세·교통수단 시트 | 통과 | 선택 목적지 상세와 자동/도보/자차/대중교통 옵션 확인. 선택값은 변경하지 않음 |
| D7 | 앱 권한 | 통과 | 알림, 정밀 위치, 대략적 위치 권한이 모두 허용 상태 |
| D8 | QA 로컬 알림 | 통과 | 확인 알림 수신 후 탭하여 앱 복귀, “확인 알림 수신·탭 확인됨” 상태 확인 |
| D9 | 알림 예약 상태 | 통과 | 스마트 알림 화면에서 권한 허용 및 예약 3건 확인 |
| D10 | 홈 알림함 버튼 | 실패 | 접근성 노드는 클릭 가능으로 노출되나 상태바와 겹치고 ADB 좌표 탭 3회에 반응 없음 |
| D11 | 앱 안정성 | 통과 | 앱 PID logcat 및 crash buffer에서 fatal/ANR/JS 예외 0건 |

## 5. 발견 이슈

### QAB-001 — Android 시스템 바 안전영역 미적용

- 심각도: **높음**
- 상태: 재현됨
- 영향:
  - 홈 상단의 “오늘 알림” 컨트롤과 알림 벨이 시스템 상태바 아이콘과 겹친다.
  - 두 컨트롤 모두 접근성 트리에는 클릭 가능으로 나타나지만 실기기 터치가 시스템 영역에 가로막힌다.
  - 여러 화면의 헤더 텍스트·뒤로 버튼도 상태바와 시각적으로 겹친다.
  - 하단 내비게이션도 시스템 gesture bar와 시각적으로 겹친다.
- 접근성 bounds:
  - 오늘 알림: `[47,9][229,113]`
  - 알림 벨: `[934,9][1037,113]`
  - 하단 내비게이션: y=`2261..2397`
- 재현:
  1. 앱을 콜드 런치한다.
  2. 홈 상단 상태바 영역의 오늘 알림 또는 알림 벨을 누른다.
  3. 화면 전환이나 알림 사이드바가 열리지 않는다.
- 증거:
  - `screens/10-home-return.png`
  - `screens/12-final-cold-launch.png`
  - `ui/10-home-return.xml`
  - `ui/11b-notification-center-retry.xml`
  - `ui/11c-notification-center-third.xml`
  - `ui/11d-home-top-left.xml`
- 관련 로그:
  - `StatusBarModule: Ignored status bar change, current activity is edge-to-edge.`

### QAB-002 — Android product-quality 정적 게이트 실패

- 심각도: **중간**
- 상태: 재현됨
- 명령: `npm.cmd run check:android-product-quality`
- 결과:

```text
AssertionError [ERR_ASSERTION]:
apps/mobile/src/components/BottomNav.tsx must include:
androidMaterialSurface(theme, "navigation")
```

- 영향: APK 빌드와 실행 자체는 가능하지만 저장소가 정의한 Android 제품 품질 기준을 충족하지 않는다.

## 6. 로그 결과

| 로그 | 결과 |
|---|---|
| `logs/app-logcat.txt` | 크래시·ANR·React Native 예외 0건 |
| `logs/crash-logcat.txt` | 0 bytes, crash buffer 비어 있음 |
| `logs/final-cold-launch-logcat.txt` | 최종 콜드 런치 fatal/error 패턴 0건 |

비차단 경고로 edge-to-edge 상태에서 React Native `StatusBarModule` 변경이 무시되었다는 메시지가 반복 기록됐다. QAB-001과 함께 수정 검토가 필요하다.

## 7. 테스트 범위에서 제외한 항목

- 사용자 기존 데이터 보호를 위해 코디 저장, 목적지 삭제, 권한 거부/회수는 실행하지 않았다.
- 실기기 전체 네트워크를 끊는 오프라인 테스트와 시스템 다크 모드 변경은 이번 실행에서 제외했다.
- EAS 원격 빌드가 아니라 동일 QA 플래그를 사용한 로컬 release APK로 검증했다.

## 8. 기기 상태 원복

- 테스트를 위해 0으로 변경했던 아래 애니메이션 배율을 원래 값 `1`로 복원했다.
  - `window_animation_scale=1`
  - `transition_animation_scale=1`
  - `animator_duration_scale=1`
- 네트워크, 시스템 테마, 앱 권한은 변경하지 않았다.
- 앱은 최종 콜드 런치 후 홈 화면에 둔 상태다.

## 9. 증거 파일

- 화면 캡처: `screens/01-launch.png` ~ `screens/12-final-cold-launch.png`
- UI 트리: `ui/*.xml`
- 앱/크래시 로그: `logs/*.txt`

## 10. 권장 후속 조치

1. Android의 status/navigation bar inset을 루트 레이아웃에 적용해 모든 화면의 상·하단 안전영역을 보장한다.
2. `BottomNav`에 프로젝트 규칙이 요구하는 `androidMaterialSurface(theme, "navigation")`를 적용한다.
3. 동일 실기기에서 홈 상단 두 컨트롤, 각 화면의 뒤로 버튼, 하단 내비게이션을 다시 테스트한다.
4. `check:android-product-quality` 통과 후 QA APK를 재빌드하고 최소 D2, D3, D4, D10, D11을 재검증한다.
