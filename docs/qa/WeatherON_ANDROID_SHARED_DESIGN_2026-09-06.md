# Android 공통 디자인·홈 날씨 모션 검증

2026-09-06 기준. iOS의 정보 배치와 Android Material 표현을 공통 구성으로 적용함.

## 적용

- 홈: 지역 → 현재 날씨 → 목적지·출발 안내 → 코디 순서. 작은 화면은 기존 iOS 축약 배치 공유.
- 코디·출발·MY·설정·관련 상세: 공통 `pageStyles`로 제목·본문·카드 계층 통일. 분기에서 제외된 이전 Android UI와 미사용 스타일 제거.
- Android: Material 타입 스케일, 둥근 카드, 채워진 선택 표시, 리플, 기기 강조색 유지. Liquid Glass는 기존 iOS 전용 경계 유지.
- 최신 공식 명칭은 [Material 3 Expressive](https://m3.material.io/)임.
- 홈 배경: 맑음의 햇살·흐림의 구름·비·눈·뇌우·먼지 띠·맑은 밤의 달빛과 별. `fog`/`haze` 문자열도 먼지 띠로 표시하지만 공급자 상태 분류는 변경하지 않음.
- 배경 색상 투명도와 모션 투명도를 분리해 기존처럼 모션이 거의 사라지는 문제 해소. 카드 뒤에서만 움직이고 터치·스크린리더 탐색에서 제외.
- 배경과 날씨 아이콘에 동일한 지역 좌표·시간대 기반 낮밤 판정 사용. 좌표가 없으면 기존 시간대별 시각 대체 규칙 사용.
- 기존 `useReducedMotion` 재사용. 설정 확인 전·동작 줄이기·백그라운드에서는 정지. 네이티브 transform/opacity와 `isInteraction: false`로 구성, 해제 시 애니메이션 정리.

## 검증 결과

| 구분 | 결과 |
| --- | --- |
| TypeScript | `npx tsc --noEmit -p apps/mobile/tsconfig.json` 통과 |
| 날씨 회귀 | `node scripts/check-weather-scenes.mjs` 통과. 날씨별 분기, 양 테마, 낮밤, 설정 미확정·동작 줄이기·백그라운드, unmount 정리, 입자 수 제한, 비상호작용 네이티브 드라이버 검사 |
| 홈 회귀 | `node scripts/check-ios-home-experience.mjs` 통과. 공통 화면 전환으로 검사 기준 갱신. 새로고침 실패·성공, 시간대·출발 일정 검사 유지 |
| 웹 빌드 | `npm run export:android-web` 통과 |
| 웹 화면 | In-app browser에서 홈·코디·출발·MY 전환 확인. 412×915 홈·코디, 360×640 출발 화면 확인 |
| 웹 날씨 | 실제 WeatherBackground를 불러오는 임시 미리보기에서 7종 렌더링 확인. 구름 transform 변화·별 opacity 변화 확인. 비 16개, 눈 20개, 뇌우 이동 레이어 27개, 먼지 띠 3개 확인 |
| Android 빌드 | 기본 디버그 빌드 통과. 아래 QA 전용 패키지로 번들 포함 빌드도 통과 |
| Android 설치 | Pixel_8 에뮬레이터에 별도 QA 패키지 설치·콜드 런치·홈 진입 통과 |
| Android 터치 | 홈 → 코디 → 출발 → MY → 표시 설정. 접근성 트리 좌표로 터치하고 선택 탭·표시 화면 확인 |
| Android 테마 | 라이트, 다크, 기기 색상 켜짐 확인 |
| Android 크기 | 기본 1080×2400, 작은 화면 945×1680(밀도 420, 약 360×640dp) 확인. 작은 홈에서 날씨·목적지와 탭바 겹침 없음 |
| Android 모션 | 동작 줄이기 정지·해제 후 재개 확인. 상태바를 제외한 날씨 영역 프레임 A/B에서 176,701픽셀 변화 확인. 프레임 변화는 모션 동작 증거이며 성능 벤치마크가 아님 |
| Android 오류 | QA 후 crash log buffer에 출력 없음 |
| Diff | `git diff --check` 통과 |

## 남은 검증 범위

- 기존 `npm run check:android-product-quality`는 수정하지 않은 AppNavigator의 `activeRoute={appState.styleProfileReturnRoute}` 문자열을 요구하며 실패함. 종합 검사 전체 통과로 보고하지 않음.
- 최초 검증 시 물리 Android 기기 미검증. 이후 실기기 검증 결과는 아래 추가 기록 참조. iOS 실기기 재검증과 Play Store 업로드는 수행하지 않음.
- Android 에뮬레이터에서는 현재 맑음의 실제 동작을 확인했으며 나머지 날씨의 렌더링은 웹·회귀 검사로 확인함.

## QA 빌드·환경

- 패키지: `com.weatheron.mobile.designqa`. 기존 `com.weatheron.mobile`와 서명이 달라 별도 패키지 사용. 기존 앱·데이터 보존.
- 앱 식별자와 번들 포함 설정은 `/private/tmp/weatheron-design-qa.gradle`에만 지정. 저장소의 앱 ID·릴리스 설정은 변경하지 않음.
- APK: `apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`. QA 전용 debug 서명, JS 번들 포함.
- 재현 명령: `./gradlew :app:assembleDebug -I /private/tmp/weatheron-design-qa.gradle -PreactNativeArchitectures=arm64-v8a --console=plain --max-workers=2` (apps/mobile/android에서 실행).
- 에뮬레이터 CPU 감지 오류는 제한 환경 밖에서 실행해 해결. Metro watcher 제한은 CI 모드로 확인했으나 최종 QA 앱은 번들을 포함하므로 Metro 없이 실행됨.
- 에뮬레이터 해상도 1080×2400, transition_animation_scale 1.0으로 원복함.

## Android 실기기 추가 검증

2026-09-06 19:28~19:35 KST, A142(Pacman), Android 16, 1084×2412. 기기 기존 밀도 375 유지(물리 밀도 420). 별도 QA 앱의 새 게스트 상태로 디자인·내비게이션·현재 밤 배경 모션 범위 검사함.

- 기존 `com.weatheron.mobile` 업데이트는 `INSTALL_FAILED_UPDATE_INCOMPATIBLE`로 거부됨. 서명이 달라 기존 앱을 삭제하지 않고 `com.weatheron.mobile.designqa`로 설치함. 기존 앱·사용자 데이터 보존.
- release 빌드, JS 번들 포함, 버전 1.0.0(16), 로컬 debug 인증서 서명. 스토어 배포 빌드나 기존 앱 업데이트 검증으로 간주하지 않음.
- APK: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`. SHA-256: `b10e8663d17d66d7bd8f740365a22c2c4e4e16f49beb28604d794e891345dc97`.
- 빌드: `./gradlew :app:assembleRelease -I /private/tmp/weatheron-design-qa.gradle -PreactNativeArchitectures=arm64-v8a --console=plain --max-workers=2`.

| 실기기 항목 | 관찰 결과 |
| --- | --- |
| 설치·콜드 실행 | 설치 Success, COLD / Status ok, TotalTime 869ms. 단일 측정이며 성능 벤치마크 아님 |
| 초기 진입 | 소개 건너뛰기 후 홈 진입. 기본 위치 서울·게스트 상태 |
| 탭 터치 | 홈 → 코디 → 출발 → MY. UI 트리 좌표로 터치하고 각 화면과 selected 상태 확인 |
| 화면 | 홈·코디·출발·MY 스크린샷 육안 확인. 현재 기기 설정에서 내용·탭바 겹침이나 아이콘 누락 발견 안 됨 |
| 테마·강조색 | 시스템 다크 → 라이트 변경, 기기 색상 켜짐과 Material 선택 표시 확인 |
| 뒤로가기 | 표시 설정에서 Android Back으로 MY 복귀, MY 선택 유지 |
| 동작 줄이기 | transition_animation_scale 0에서 홈 영역 두 프레임 변화 0픽셀 |
| 모션 재개 | 원래 값 1로 복원 후 홈 영역 17,361픽셀 변화 |
| 백그라운드 복귀 | 시스템 홈 → 앱 복귀 성공. 복귀 후 두 프레임 75,644픽셀 변화 |
| 앱 로그 | 해당 QA 앱 PID 13695 로그 최대 500줄 수집에서 FATAL/Exception/Error/Unable/error 일치 없음. 전체 장기 안정성 검증 아님 |
| 원복 | 시스템 transition_animation_scale 1 복원. 해상도·밀도 변경 없음. QA 앱은 라이트·기기 색상 켜짐 상태로 남김 |

모션 픽셀 비교 영역은 (0,130)~(1084,2130)으로 상태바·탭바 제외. 실기기에서는 현재 맑은 밤의 달빛·별만 관찰함. 다른 날씨 6종 강제 전환, 로그인·실제 목적지·푸시·사진·기존 사용자 데이터 마이그레이션은 이번 실기기 검사에 포함되지 않음. 다른 날씨는 앞선 웹·회귀 결과와 구분함.

[실기기 홈 다크](evidence/android-physical-2026-09-06/home-reduced.png) · [홈 라이트](evidence/android-physical-2026-09-06/home-light.png) · [코디](evidence/android-physical-2026-09-06/outfit.png) · [출발](evidence/android-physical-2026-09-06/departure.png) · [MY](evidence/android-physical-2026-09-06/my.png) · [기기 강조색](evidence/android-physical-2026-09-06/settings-light-dynamic.png). 같은 폴더에 UI 트리와 모션·정지·복귀 프레임 보관.

## 앞선 에뮬레이터 캡처

[홈 라이트](evidence/android-shared-design-2026-09-06/home-light.png) · [코디](evidence/android-shared-design-2026-09-06/outfit-light.png) · [출발](evidence/android-shared-design-2026-09-06/departure-light.png) · [MY](evidence/android-shared-design-2026-09-06/my-light.png) · [다크·기기 색상](evidence/android-shared-design-2026-09-06/settings-dark-dynamic.png) · [작은 홈·동작 줄이기](evidence/android-shared-design-2026-09-06/home-dark-small-reduced.png) · [모션 A](evidence/android-shared-design-2026-09-06/home-dark-motion-a.png) · [모션 B](evidence/android-shared-design-2026-09-06/home-dark-motion-b.png)
