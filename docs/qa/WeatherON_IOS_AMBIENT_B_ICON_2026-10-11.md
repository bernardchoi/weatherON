# iOS Ambient B 앱 아이콘 적용 — 2026-10-11

## 확정 근거와 변경

- 사용자 요청: 새 B안 앱 아이콘을 iOS에 먼저 적용. `feat/ambient-surface-foundation-home`, HEAD `0e804e5dad1747628a25c73c14d95238b23f3de1`에서 시작.
- 최신 런처 원본: `assets/brand/ambient-b-platform-20261008/README.md`와 `docs/platform-handoff.md`. 도입 커밋 `bbfbd64`(2026-10-08). 구름·열린 해 고리·옷자락의 플랫폼별 패키지다. `ambient-surface-ui-icons-final-v1-20261009`는 앱 내부 UI 세트이며 적용 대상이 아니다.
- 패키지는 라이트/다크 레이어와 참고 합성본만 제공했고, `.icon` 및 iOS tinted 완성본은 없었다. 따라서 새 그림을 생성하지 않고 제공 SVG/팔레트를 새 `apps/mobile/ios/WeatherON/WeatherON-Ambient-B.icon`에 구성했다.
- SVG 5개는 제공 light 원본과 바이트 동일. dark와 light의 geometry 동일 확인. dark 원본의 색을 fill-specializations에 지정했다. 전면부터 fold+under, cloud, sun, background 4개 그룹. 전경 glass, 불투명 재질, 절제된 specular/shadow; 배경 glass 없음. OS가 외곽 마스크와 모드별 재질을 적용한다.
- `apps/mobile/ios/WeatherON.xcodeproj/project.pbxproj`: 별도 파일/리소스 참조 추가, Debug·Release의 `ASSETCATALOG_COMPILER_APPICON_NAME`을 `WeatherON-Ambient-B`로 연결.
- 기존 `AppIcon.appiconset`, `WeatherON-App-Icon.icon`, 원본 디자인 패키지는 덮어쓰지 않았다. 로컬 ignored `WeatherONDeviceQA.xcodeproj`에도 같은 아이콘 연결만 적용; 기존 Widget 개발 프로파일 유지.
- Android·앱 기능 소스·발열 보호 코드는 수정하지 않았다. 커밋/푸시/PR/병합 없음. 네이티브 Xcode 프로젝트가 이번 적용의 기준이며 Expo app.json의 기존 일반/Android 아이콘과 splash는 변경하지 않았다. 향후 clean prebuild 때 이 네이티브 `.icon` 연결을 보존해야 한다.

## 파일·형식·컴파일 검사

- 제공 라이트/다크 합성 PNG: 1024×1024, alpha 없음. 레이어 SVG: 1024×1024, 공통 viewBox 0 0 1000 1000, 외곽 마스크/하이라이트를 원본에 굽지 않음.
- `plutil -lint` 프로젝트 파싱과 `git diff --check` 통과.
- 작업 시작 시 미커밋/미추적 23개 소스를 SHA256으로 기록하고 종료 시 모두 바이트 동일 확인.
- Apple Icon Composer 내장 `ictool`: Default, Dark, TintedLight, TintedDark, ClearLight, ClearDark 1024px 렌더 성공. Default/Dark/TintedDark 64px 렌더도 확인.
- Default/Dark에서 구름·열린 고리·옷자락 구분 정상. TintedDark 기본 보라 렌더는 대비가 낮다. tinted는 승인된 별도 시안이 아니라 시스템 자동 변형이며, 품질 최종 PASS나 모든 tint 색상 PASS로 판단하지 않는다. Clear는 Apple 렌더 확인에 한정한다.
- `assetutil`: 새 이름의 1024px Any/Dark/Tintable Icon Image, Light/Dark/Tintable IconGroup·IconImageStack 포함 확인.

## 빌드·설치

- 로컬 Xcode 27.0 (27A266a), 기존 WeatherONDeviceQA workspace, Debug, generic/platform=iOS, ARM64, jobs 1, 기존 DerivedData로 증분 빌드 1회 성공. `codesign --verify --deep --strict` 성공.
- 빌드된 `CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconName = WeatherON-Ambient-B`.
- 전후 `main.jsbundle` SHA256 동일: `f18351c2c393c4022a9fab5d701d9b3fcc98a00081f022903c59cccd0d42c893`. 사용자가 만족한 자연화 설치본 JS 보존.
- 사용자에게 미러링 연결 상태를 알린 뒤 사용자가 “잠갔고 온도 경고 없음” 확인. 기기 thermalState 측정/프로파일링/스트레스/보호코드 변경은 재개하지 않음.
- 기존 페어링된 iPhone에 `devicectl device install app` 데이터 보존 업데이트 성공. bundle ID `com.weatheron.mobile`. 앱 삭제·계정/목적지/알림 데이터 초기화 없음.
- `devicectl device process launch` 일반 실행 성공. 진단 인자 및 Live Activity 시작 없음.

## 실제 시각 확인과 한계

- `devicectl device info appIcon`: non-placeholder, 1024×1024, 실제 설치 앱에서 생성된 B안 아이콘을 픽셀 확인.
- 23:48 KST 공식 Wireless 디스플레이 스크린샷: iPhone 홈 화면 WeatherON 위치에 B안 **다크** 아이콘 표시. 흰 구름, 노란 열린 해 고리, 청록 옷자락과 알림 배지 1이 보이며 구형 OFF/토글 아이콘은 아님. 미러링 창 캡처의 빈 화면과 구분해 기기 측 원본 캡처로 확인했다.
- 홈 화면 테마/크기/설정을 변경하지 않았다. 라이트·tinted·clear의 홈 화면 실기기 전환은 미검증; 라이트는 기기 아이콘 생성 결과, 나머지는 Apple 렌더 및 컴파일 증거다.
- 일반 실행 후 앱 화면 캡처는 Wireless display가 사라져 실패(CoreDeviceError 27001). 실행 명령 성공과 실제 앱 본문 표시 검증은 구분한다. 아이콘 홈 화면 증거는 이미 확보됐으며 이 실패 때문에 재설치/기기 재부팅을 반복하지 않았다.
- 계정·목적지 상세 화면을 탐색하거나 알림 설정을 변경하지 않았다. 기존 데이터 보존 설치 방식은 확인했지만 모든 계정·목적지 내용의 실기기 재검증은 아니다.
- Xcode Cloud/TestFlight/App Store 배포 검증이 아닌 로컬 개발 설치 검증이다.

## 증거

Git 외부 로컬 증거 묶음 `ambient-ios-icon-20261011` (원본 화면·설치 로그는 개인정보 보호를 위해 커밋하지 않음):
`build.log`, `install.json`, `launch.json`, `assets.json`, `preexisting-sha256.json`, 6모드 렌더/64px 렌더, `device-icon.png`, `home-screen.png`.

공식 설명: https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer (단일 Composer 파일로 OS가 appearance/size별 렌더 제공).
