# Xcode Cloud build 63 경고 검토 — 2026-11-05

## 범위와 근거

- 저장소: WeatherON, `Daehyeons-Laptop.local`, `main`.
- 기준 HEAD/원격 main: `63f577902b003e0de0021eb24878d9917bb3020e`.
- 분석 대상: Cloud build 63, 소스 `9bb620986f06c06557d5451cc96b488bbef23398`.
- Cloud 실행: `6e1d63fe-4d30-4471-9b23-a5799df30fcc`, archive action `17629dde-e038-4284-9809-07b2f732bd6d`.
- App Store Connect에서 받은 archive Logs ZIP과 XCResult ZIP의 실제 진단 사용. `xcresulttool get object --legacy --format json`으로 추출.
- Cloud UI는 **601건**, XCResult metrics/warningSummaries는 **613건**. 같은 파일·행·메시지 기준으로 묶으면 **601개**가 됨. 열 위치가 다른 동일 행 진단 12건(헤더 nullability 11건, 이미지 enum 변환 1건)이 차이를 설명함. Apple UI 내부 집계 구현은 확인하지 않음.
- [전체 경고 목록](warnings.csv): 601개 집계 행, `count` 합계 613. 행 번호 1-based. Cloud 임시 경로는 정규화함.
- 이번 수정은 로컬 작업 상태이며 아직 커밋·푸시·Cloud 재빌드하지 않음. 기존 build 63 바이너리에는 포함되지 않음.

## 실제 수정

| 대상 | 원문 건수 | 원인 및 수정 |
| --- | ---: | --- |
| ExpoModulesJSI RuntimeScheduler | 4 | C++ 생성자가 refCount=1로 생성하지만 Swift에 반환 소유권을 알리지 않음. 기존 postinstall 패치에 생성자 2종의 `SWIFT_RETURNS_RETAINED` 선언 추가. 참조 카운트·스케줄링 구현·호스트 포인터 소유권은 유지. |
| WeatheronAppAttestModule | 1 | BaseModule의 `@unchecked Sendable` 계약 재선언 누락. 추가 가변 저장 프로퍼티가 없는 클래스를 final로 제한하고 상속 계약 명시. 입력 해시 검증과 DeviceCheck 호출 유지. |
| SplashScreenLogo imageset | 1 | Contents.json에 없는 과거 image@2x.png, image@3x.png 2개 삭제. 실제 storyboard의 SplashCloud02와 밝은/어두운 이미지 유지. |

Swift 공유 참조 생성자는 소유권 주석이 필요함. 두 생성자가 이미 +1로 시작하므로 retained 선언 적용함. 실제 누수 발생을 입증한 것은 아님. [Swift C++ interoperability 공식 문서](https://www.swift.org/documentation/cxx-interop/#constructing-shared-reference-types-from-swift)

`@unchecked Sendable`은 컴파일러가 스레드 안전성을 검증한다는 뜻이 아님. 여기서는 기존 BaseModule 계약을 상태 추가 없는 final 하위 클래스에서 명시함. [Swift Sendable 공식 문서](https://docs.swift.org/latest/documentation/swift/sendable/)

기존 네이티브 모듈 검사에 설치 패치·재실행 멱등성·삭제된 복사 생성자 보존 검사 추가. 기존 launch 검사에 manifest/실제 이미지 파일 일치 검사 추가. 두 검사를 Source checks의 core regressions에 연결함.

## 전체 분류

| 분류 | XCResult 원문 | 파일·행·메시지 집계 |
| --- | ---: | ---: |
| React·JSI umbrella 헤더 | 300 | 300 |
| 외부 C 숫자·enum 변환 | 52 | 51 |
| 외부 헤더 nullability | 47 | 36 |
| 빈 오브젝트 심볼 | 38 | 38 |
| Hermes 런타임 전역 이름 | 34 | 34 |
| 외부 API·링커·문서 deprecated | 30 | 30 |
| 외부 Swift Sendable 선언 | 27 | 27 |
| SQLite MIN·MAX 매크로 | 26 | 26 |
| 외부 updateProps super 호출 | 26 | 26 |
| SDK·React 타입 선언 | 5 | 5 |
| libwebp 조건부 초기화 | 5 | 5 |
| 외부 C++ 가변 길이 배열 | 5 | 5 |
| 수정: Expo 스케줄러 소유권 | 4 | 4 |
| 외부 미사용 선언 | 3 | 3 |
| 외부 C++ 필드 초기화 순서 | 2 | 2 |
| Cloud Metal toolchain 검색 경로 | 1 | 1 |
| Hermes eval 진단 | 1 | 1 |
| Hermes 빌드 스크립트 출력 의존성 | 1 | 1 |
| Native Tabs none enum | 1 | 1 |
| SVG 상속 프로퍼티 | 1 | 1 |
| libevent 플랫폼 기능 제한 | 1 | 1 |
| 서명된 위젯 strip 생략 | 1 | 1 |
| 수정: App Attest Sendable | 1 | 1 |
| 수정: 미등록 스플래시 이미지 | 1 | 1 |
| **합계** | **613** | **601** |

## 유지한 경고와 판단

- **React/Expo 헤더·Sendable·SDK 선언**: React prebuilt 헤더의 umbrella 누락, nullability 누락, 외부 하위 클래스의 Sendable 재선언 및 SDK 타입 이동. 앱 소스의 누락 import나 실패한 링크로 확인되지 않음. 전역 경고 끄기나 외부 클래스 일괄 unchecked 처리하지 않음. Expo/RN 호환 업데이트 시 재검토 대상.
- **외부 C 변환 52건**: ExpoSQLite amalgamation 45건, SDWebImage/SDWebImageWebPCoder의 CoreGraphics 비트마스크 enum 조합 7건. 자동 형변환 추가는 범위 검증 없이 경고만 숨길 수 있어 유지. SQLite MIN/MAX 26건도 동일 이유로 vendored 소스를 일괄 변경하지 않음.
- **libwebp 1.6.0 초기화 5건**: `DC8_NEON`/`DC16_NEON`의 sum_top/sum_left는 do_top/do_left 조건에서 초기화하고 동일 조건 분기에서 사용함. best_offset은 긴 이전 일치 분기 또는 do_compute 분기에서 설정됨. 읽기까지의 조건 경로 검토에서 미초기화 사용 발견되지 않음. 임의 초기화 패치하지 않음.
- **Native Tabs enum 1건**: 변환 함수는 None을 금지하고 실제 호출부도 `systemItem != None` 검사 후 호출함. 앱은 자체 BottomNav 사용. 의미 없는 대체 탭을 추가하지 않음.
- **SecureStore deprecated API**: 라이브러리가 레거시 옵션을 지원하며 발생. 앱의 appIntegrity/accountAuth는 `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` 사용함. 보안 접근 수준을 낮추거나 인증 동작을 변경하지 않음.
- **나머지 deprecated API·문서, updateProps, SVG 가변 배열/프로퍼티/static 함수, C++ 초기화 순서·미사용 함수**: 외부 패키지 소유 진단. 이번 검토에서 앱 수정으로 해결할 재현 결함 확인되지 않음. SDK/의존성 호환 업그레이드 대상으로 유지. 라이브러리의 모든 실행 경로가 안전하다고 보증하는 것은 아님.
- **Hermes 전역 이름 34건/eval 1건**: 번들 정적 진단. React Native 호스트/런타임 제공 전역을 임의 변수로 덮어쓰지 않음. RN 개발 번들 로더에 eval 사용 확인됨. 개별 번들 위치의 모든 실행 경로를 실기기로 검증하지는 않음.
- **빈 오브젝트 심볼 38건, 서명된 위젯 strip 생략 1건**: 빌드/링크 산출물 진단. 서명·App Group을 변경하거나 strip을 강제로 실행하지 않음.
- **Cloud Metal toolchain 검색 경로 1건**: CocoaPods xcconfig의 `${TOOLCHAIN_DIR}/usr/lib/swift/${PLATFORM_NAME}`가 Cloud의 Metal toolchain 경로로 확장됨. 앱에 Metal mount 경로가 하드코딩된 것은 아님. Cloud archive는 링크 성공. Xcode/Pods 환경 후속 확인 대상으로 유지하며 앱에서 Cloud 임시 경로를 하드코딩하지 않음.
- **Hermes 스크립트 output 의존성 1건**: 매 빌드 실행 관련 진단. 잘못된 캐시로 configuration별 Hermes 교체가 생략되지 않도록 유지.
- **libevent gethostuuid 1건**: 플랫폼에서 비활성화된 기능 알림. 앱 UUID 기능 장애 증거 없음.

## 검증

- 기존 iOS launch-state 검사 통과: 이미지 manifest 일치, 밝은/어두운 리소스, launch readiness/reduced motion/cancel 검증.
- 네이티브 모듈 검사 `--installed` 통과: autolinking/Podfile.lock/Manifest.lock/등록 provider, 설치 패치 및 재실행 동일성 검증.
- 기존 iOS release-signing 소스·격리 훅 검사 통과. 실제 배포 서명 검증 아님.
- 실제 RuntimeScheduler 헤더를 사용한 로컬 Swift/C++ fixture: 두 생성자 각각 정확히 한 번 파괴됨. 관측용 소멸자 카운터만 fixture에 추가했으며 생성자/refCount/retain/release 구현은 유지. iPhone 메모리 프로파일링 대체 아님.
- Swift/C++ 변경 전 fixture에서 생성자별 소유권 경고 2개 재현. 변경 후 동일 호출의 소유권 경고 0개 및 두 객체 정확히 한 번 파괴 확인.
- **로컬 전체 Release / arm64 iOS Simulator build 성공** (`CODE_SIGNING_ALLOWED=NO`). App Attest 실제 모듈 컴파일, ExpoModulesJSI xcframework 재빌드, 앱 링크/asset 처리 포함. 로그에서 소유권 추론 경고·미등록 이미지 경고·WeatheronAppAttestModule Sendable 경고 모두 0건 확인. 다른 라이브러리 경고는 남아 있음.
- 명령: `xcodebuild -workspace apps/mobile/ios/WeatherON.xcworkspace -scheme WeatherON -configuration Release -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath tmp/cloud-warnings-build63/local-derived-data CODE_SIGNING_ALLOWED=NO ARCHS=arm64 ONLY_ACTIVE_ARCH=YES build`.
- 로컬 로그: `tmp/cloud-warnings-build63/local-build.log`; 소유권 fixture/변경 전 진단: 같은 디렉터리의 `scheduler-lifetime/`, `scheduler-baseline/`. 초회 sandbox 실행은 Xcode 서비스 접근 제한으로 실패했고, 권한 있는 재실행에서 성공함.
- `git diff --check` 통과.

## 검증 환경·통합 상태

- Cloud 원본: Xcode 27.1 (27A9275), macOS 27.2 (26B123).
- 로컬: Xcode 27.2 (27B52). Cloud와 컴파일러 버전이 달라 경고 총수가 같을 것으로 단정하지 않음.
- `git fetch origin` 후 main/origin/main 일치. 등록 worktree 모두 조회함.
- 다른 worktree `.claude/worktrees/quizzical-nash-2674cc`에 기존 `scripts/check-android-small-screen-layout.mjs` 수정 남아 있음. 이번 경고 수정에 포함하지 않음.
- `/private/tmp/weatheron-ios-release`는 디렉터리 없는 prunable 등록임. 임의 정리하지 않음. stash 없음.
- 기존 `docs/qa/artifacts/`, `tmp/` 미추적 산출물 유지. 원본 ZIP/로그/로컬 build 산출물은 커밋 대상 아님.
- 새 Cloud 실행·TestFlight 배포·실기기 검증 안 함. Cloud 경고 감소 수와 설치된 앱의 동작은 아직 미확인임.
