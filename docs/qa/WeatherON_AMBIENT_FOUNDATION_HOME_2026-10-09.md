# Ambient Surface 첫 단계 — 공통 기반과 홈

**최신 상태: RN 오류 해결·iOS 다크 홈 실행 및 fidelity 수정 확인. 승인 시안 일치 완료가 아님. 라이트 실기기·접근성·전체 터치 QA와 원본 환경 질감 일치가 남아 있음. 아래 초기 결과는 작업 이력이며 최신 절이 우선함.**
2026-10-09. 구현 완료, 실기기 승인 전. 커밋·푸시·병합·배포 없음.

## 작업공간과 원본

- 원격 main 재확인: `49a628f05649541be4dc1577b18263e606e9af3a`.
- 격리 worktree: `isolated-worktree`.
- 브랜치: `feat/ambient-surface-foundation-home`.
- 기존 main 자산 체크아웃과 `original-checkout` 원본 체크아웃의 AGENTS.md를 읽음. `.agents/skills`는 두 위치에 없음. 원본의 미추적 `docs/architecture/WeatherON_IOS_STORE_METADATA.md` 보존.
- 승인 패키지 README·core index·manifest, core v3 네 모드 PNG 픽셀, Final v1 SVG와 전체 아이콘 비교판 PNG, 기존 Ambient Surface 전용 방향서와 바람의 탑 문서를 읽음. 오래된 core 이미지 사용 없음.
- 전체 104 PNG manifest SHA256 일치. 승인 SVG·기존 애셋·CI·네이티브 소스 변경 없음.

## 코드와 시안 매핑

| 승인 기준 | 구현 |
| --- | --- |
| `01-core-ios-light-v3.png`, `01-core-ios-dark-v3.png`, Android 동일 v3 | HomeScreen: 홈 전용 WeatherON·옅은 ON, 위치 변경, 큰 기온·날씨·최고/최저·기존 준비 문장, 목적지 선택·출발·준비물, 읽을 수 있는 실제 코디 사진 |
| Final v1 선형 탭 | BottomNav: 비선택 1.75/선택 2.0 SVG 파생 PNG, 포인트·잔잔한 배경·굵은 라벨·selected 접근성 상태 |
| Final v1 날씨/조작 분리 | ambientAssets: 겹면 날씨는 다색 유지, 조작은 tint 가능한 선형. 밤 맑음·먼지에는 기존 보조 자산 유지. 미확인 상태를 맑음으로 대체하지 않음. provider `storm`은 강한 비로 매핑하고 임의 번개로 바꾸지 않음 |
| 환경·터치 반응 | AmbientSurfaceBackground: 현재 실측 풍속에만 표면 호흡 속도, 현재 비/강한 비와 강수량에만 밀도, 터치에 짧은 빛 응답. 풍향 데이터가 없어 방향성 의미 생성 없음. 오래된/불확실/로딩·백그라운드·Reduce Motion에서 환경 모션 정지 |
| 공유 약70 / 플랫폼 약30 | 공통 팔레트·글리프 + 기존 iOS 글래스 재질/드래그 유지 + Android 톤 표면/선택 영역. 지원 OS 폴백 유지. 투명 효과 줄이기는 네이티브 글래스 대신 불투명 JS 선택면 |
| 점진적 적용 | ambientHomeTheme은 홈에만 적용. 코디·외출·MY·온보딩의 본문은 이번 단계에서 전환하지 않음. 마이 세로형 계정 디자인은 후속 범위 |
| 접근성 | 기존 글자 크기 설정과 스크롤 유지, 탭 글자 크기 상한 1.4배, AppButton에 Reduce Motion와 애니메이션 정리 추가. 주요 텍스트·접근성 레이블 EN/JA 갱신 |

기존 location/weather/notification/widget/outfit provider·추천·저장 로직과 서비스 데이터 경로를 변경하지 않음. 목적지 미등록 상태와 선택 시트, pull refresh·로딩·오류 상태 패널, 특보, 재진입 유지. 홈에서 불필요한 출발 chevron 제거. 버튼 밑줄 없음.

## 변경 파일

- `apps/mobile/src/screens/HomeScreen.tsx`
- `apps/mobile/src/components/BottomNav.tsx`, `AppButton.tsx`
- 신규 `apps/mobile/src/components/AmbientSurfaceBackground.tsx`
- 신규 `apps/mobile/src/theme/ambientSurface.ts`, `apps/mobile/src/ambientAssets.ts`
- `apps/mobile/src/localization/locales/en.json`, `ja.json`
- 신규 `scripts/render-ambient-icons.mjs`와 `assets/ambient-surface-runtime-v1/`: 승인 SVG 60개의 재현 가능한 투명 PNG 파생물, 원본 SHA256 manifest. 기존 canvas 의존성 사용, 의존성 추가 없음.

## 통과

- `tsc -p apps/mobile/tsconfig.json --noEmit`
- `check-android-product-quality.mjs`
- `check-ios-reliability.mjs` (네이티브 경계 mock, SQLite 실행)
- `check-correctness-batch.mjs`
- `check-weather-outfit-regressions.mjs`
- `check-review-regressions.mjs`
- `generate-mobile-locales.mjs --check`: 2062 문구
- `expo export --platform web --platform ios --max-workers 1`: web JS + iOS Hermes bundle 생성. 네이티브 빌드 성공과 다름.
- `git diff --check`; 최신 디자인 PNG 104개 원본 hash 일치
- 팔레트 정적 대비: light 보조/배경 4.93:1, 선택 라벨/배경 5.08:1; dark 10.24:1 / 6.35:1. 실제 기기 글래스 합성 대비는 별도 검증 필요.
- Safari 실제 앱 web 런타임: 소개 건너뛰기→홈, MY·표시 설정·light/dark·투명 효과 줄이기, 재로드 시 저장 테마·홈 재진입, H6 날씨 상세→뒤로, H3 알림 연결. 390×844 및 320×700 viewport.

## 실제 실행 캡처와 로그

새 합성 시안이 아니라 최종 앱 export를 Safari에서 실행하고 Web Inspector의 DOM 스크린샷 기능으로 저장한 원본 PNG. Safari 캡처에는 검은 바깥 여백이 포함됨. 앱의 web 플랫폼 런타임으로, iOS 네이티브/Android 네이티브 캡처가 아님.

- [최종 dark 390px](../../../evidence/home-runtime-final-390.png)
- [최종 light 320px](../../../evidence/home-runtime-final-light-320.png)
- [번들 로그](../../../evidence/export.log)
- [핵심 회귀 로그](../../../evidence/correctness.log)

캡처는 격리된 로컬 웹 저장소의 기본 위치·목적지 미등록 상태임. 실위치·실서비스 연결 성공을 뜻하지 않음. 이 상태를 캡처하기 위해 앱 소스의 데이터를 시안 값으로 교체하지 않았음.

## 실패·미검증과 다음 단계

- 첫 번역 카탈로그 검사는 신규 홈 문구 누락으로 실패했지만 EN/JA 갱신 후 통과.
- web 콘솔에 기존 `notificationSync.ts` default timers 호출의 `Can only call Window.setTimeout on instances of Window` 오류 3회 발견. `timers.setTimeout()`가 Window 타이머를 다른 receiver로 호출하는 기존 경로. 이번 UI diff에 해당 파일 변경 없음. 별도 web 알림 재시도 문제로 남김. native-driver 경고는 RN web의 기존 JS fallback.
- 실제 iPhone에서 새 UI 실행, 네이티브 Liquid Glass 드래그·Reduce Motion·Dynamic Type·VoiceOver·라이브 데이터·목적지 등록·권한·알림·위젯·복귀는 미검증. 기존 iPhone 16 Pro Max는 페어링/available, 설치 앱 `com.weatheron.mobile` build 41만 조회. 설치·삭제·초기화·서명·보안·인증 변경 없음.
- Android 네이티브 실행·TalkBack·Material 실제 합성은 미검증.
- 네이티브 빌드는 실행하지 않았음. 다음 실기기 검증에서도 기존 프로세스 확인 후 증분 ARM64 jobs1만 사용하고 clean/동시 빌드 금지.
- 재현: `apps/mobile`에서 기존 Expo CLI로 `expo export --platform web --platform ios --max-workers 1`; 이번 최종 export는 `local-runtime-final`에 보존. 기존 node_modules를 공유한 임시 symlink는 작업 종료 시 제거.

## 후속 요청: Library·데이터 출처·main 오류 재현

- Library 저장 성공: dark 390 `[private library reference omitted]`, light 320 `[private library reference omitted]`. 원본 로컬 PNG에 반환 version xattr 적용. 공식 Library skill의 prepared helper가 시스템 Python 3.9에서 시작 전 실패했고, 설치된 Python 3.12에서 prepared tool unavailable로 세션을 만들지 못함. prepared 경로 부재 시 지원되는 직접 create batch로 저장 성공을 확인함.
- 같은 실제 Safari 실행 저장소를 Web Inspector 콘솔에서 읽기만 하여 확인: `weatheron.weatherProviderResult.v1`, `ready`, `fallbackUsed=false`, `source=openmeteo`, `stale=false`, 관측 `2026-10-09T18:00`, 기본 위치 서울, 기온 20.8℃/체감22℃/구름/강수0mm/비확률0%/풍속0.92m/s. 캡처 21℃는 반올림 표시. 날씨는 Open-Meteo 서비스 경로 결과이며 fixture로 교체한 캡처가 아님. 사용자 실제 위치 확인 결과는 아님. 코디 사진은 기존 앱의 번들 옷장 자산·기존 추천 경로이며 사용자가 등록한 실제 옷장/목적지를 뜻하지 않음. 읽은 값은 `evidence/web-data-provenance.json`에 보존.
- 타이머: `apps/mobile/src/providers/notificationSync.ts:7`의 `{setTimeout, clearTimeout}`를 `:46`에서 object receiver로 호출. 실패한 알림 동기화 결과의 재시도에서 Safari Window receiver 오류. 작업본과 main `49a628f` 원본은 동일 SHA256 `8b49068bc91368bf327de5cc1d497b2f1a202d3a0cb7b7b51f5ec3b69bf0a09d`. `git show main:path` 원본을 TypeScript transpile만 하여 별도 로컬 probe에서 실패 결과를 주자 같은 Safari `TypeError: Can only call Window.setTimeout on instances of Window`가 재현됨. 전체 main 앱을 새로 빌드한 회귀 실행은 아니며, 변경되지 않은 main 함수의 격리 재현. HTML `local-runtime-final/main-notification-probe.html`, 화면 `evidence/main-notification-timer-safari.png`.
- 승인 core와 남은 차이: 승인 보드의 고정 예시 값/등록 목적지와 달리 실제 기본위치·미등록 목적지 상태를 유지함. 320px에서 코디 영역은 스크롤 아래로 이어지고 긴 실제 안내문은 더 많이 줄바꿈됨(390 dark 마지막 짧은 어절 줄바꿈도 남음). Safari Web에는 네이티브 Liquid Glass 굴절·드래그/Android Material 합성이 없으므로 플랫폼 질감은 동일하다고 판정할 수 없음. 밤 맑음·먼지 글리프는 기존 보조 자산이며 신규 승인 날씨 전체 상태를 실제 서비스 조건별로 검수한 것은 아님.

## 우선 요청: iOS 실기기 시도 — 서명 차단

- 대상은 유일한 연결 실기기 `Daehyeon의 iPhone`, iPhone 16 Pro Max, iOS 27.0.1. `devicectl`에서 `connected`, `paired`, `transportType=localNetwork`, Developer Mode enabled 확인. 기존 무선 연결 사용; USB/새 페어링/보안 변경 요청 없음.
- 실행 중 실제 xcodebuild/Metro 없음 확인. 기존 Pods·generated build를 worktree로 APFS clone하고 기존 node_modules를 임시 참조, 기존 `.env.local` 서비스 설정을 값 노출 없이 복사. Pod install/의존성 추가 없음. 기존 Release 기기 DerivedData 재사용, `-jobs 1 ARCHS=arm64 ONLY_ACTIVE_ARCH=YES`, Metro `--max-workers 1`, 기존 Apple Development 실행 경로로 증분 빌드 1회. clean/동시/반복 실행 없음.
- **빌드 실패**: `iOS Team Provisioning Profile: com.weatheron.mobile.widget`에 WeatherKit capability와 `com.apple.developer.weatherkit` entitlement가 없음. 해당 entitlement는 main에 이미 있는 위젯 요구사항이며 이번 UI 작업으로 변경하지 않음. 로그 `local-evidence/ios-device-build.log`.
- 서명/권한 요구를 제거하거나 새 프로파일 다운로드·생성으로 우회하지 않음. 설치/실행에 도달하지 않았고 설치 앱을 다시 조회하여 기존 1.0.0 build41 그대로 확인. 앱 삭제·초기화·계정/위치/알림 변경 없음. 임시 node_modules symlink 제거.
- 필요한 다음 사용자 작업: 기존 개발 팀의 위젯 App ID `com.weatheron.mobile.widget`에 맞는 **WeatherKit 포함 개발 프로비저닝 프로파일**을 Xcode에 준비해야 함. 현재 프로파일이 capability를 빠뜨린 원인 확인·갱신은 서명/프로비저닝 변경 범위이므로 사용자 조작 또는 별도 승인이 필요. entitlement 제거는 기능 보존 기준에 맞지 않음. 단순 iPhone 잠금 해제나 USB 연결로 해결되는 오류가 아님.
- 신규 홈 네이티브 light/dark·텍스트 크기·탭/스크롤·VoiceOver·실위치/날씨·알림·위젯은 모두 **미검증**. 네이티브 캡처 없음. 다음 화면 전환 작업 보류 유지.

## 서명 차단 정정·기존 정상 경로 비교

앞 절의 프로파일 신규 준비 필요 판단은 **정정됨**. read-only CMS 해석으로 이미 설치된 `WeatherON Widget Development WeatherKit 2026-10-05` (`[local identifier omitted]`)에 위젯 App ID·WeatherKit·현재 기기 포함, 2027-10-05 만료를 확인. Xcode 최초 자동 선택은 WeatherKit 없는 오래된 `iOS Team Provisioning Profile: com.weatheron.mobile.widget` (`[local identifier omitted]`)였음. 앱의 기존 개발 프로파일은 `[local identifier omitted]`.

직전 main 통과 로그 `local-evidence/ios-resume-build.log`는 **Release / iOS Simulator / ARM64 / jobs1 / CODE_SIGNING_ALLOWED=NO**. 실기기 서명 검증과 구분. 최초 이번 빌드는 **Release / iphoneos / Apple Development / 자동 선택**. 기존 Oct5 정상 `WeatherONValidation` 경로는 앱 자동 개발 서명·위젯 위 WeatherKit 프로파일 명시였고, 이를 참고하되 Release entitlement를 바꾸지 않고 **원본 Debug entitlement를 그대로 유지하는 Debug 검증**을 선택함.

추적 원본 프로젝트·entitlement를 변경하지 않은 임시 `WeatherONDeviceQA.xcodeproj/xcworkspace`에서 기존 프로파일 선택. 첫 임시 scheme 참조 문제와 앱 Xcode-managed 프로파일 수동 지정 문제는 컴파일 전 실패하여 기존 경로(앱 자동·위젯 수동)로 바로잡음. 이후 Debug 컴파일은 기존 Pods의 Debug RN 코어 압축 파일 부재로 실패. 해당 Podspec이 지정한 동일 React Native 0.86.0 공식 Maven Debug artifact만 격리 Pods에 준비하고 jobs1 증분 컴파일을 이어감. 의존성 버전 추가·변경, clean, 동시 빌드, 인증서/프로파일 생성·다운로드, 계정 capability 변경, 위젯 제외·entitlement 제거 없음.

## 후속 위젯·Live Activity 디자인 범위 — 읽기만 수행

- `ios/WeatherONWidget/WeatherONWidget.swift`: AppIntent로 현재 위치/저장 목적지 선택, `.systemSmall`, `.systemMedium`, `.systemLarge`. 등록되지 않은 잠금화면 accessory 위젯이나 새 크기는 제안 범위에 추가하지 않음. 소형은 기온·준비물 중심, 중/대형은 출발·시간대·코디 정보까지 기존 구성 보존 가능.
- 데이터: `src/providers/widgetSnapshot.shared.ts` schemaVersion2, App Group `group.com.weatheron.mobile`, 네이티브 모듈 `modules/weatheron-widget-data/ios/WeatheronWidgetDataModule.swift`, `weatheron-widget-store-v2.json`. 현재/목적지 날씨·관측시간·단위·준비물·코디·출발/도착·교통/딥링크 유지. 기존 App Group cache/legacy/placeholder와 별도 WeatherKit 갱신·출처 표시를 보존할 범위.
- `ios/WeatherONWidget/WeatherONDepartureLiveActivity.swift`: 잠금화면과 Dynamic Island expanded leading/trailing/bottom, compact leading/trailing, minimal. Attributes는 목적지ID/이름·출발시각·딥링크, ContentState는 안내·glyph·출발시간라벨·완료·phase. 현재 구현 상태는 upcoming/completed/expired와 stale 처리·카운트다운이며 **실제 이동경로/이동중 진행률 데이터는 없음**. 부모 제안의 ‘이동 상태’는 신규 기능 추가가 필요한 부분과 구분해야 함.
- 현재 구현은 기존 TS tokens 참고 Swift 팔레트·그라데이션/카드·단색 SF Symbol. Live Activity는 navy/gold/sky와 일부 fill 아이콘. 홈 Ambient Surface 변경이 자동 전파되지 않음. placeholder에 평문 `WeatherON` 제목도 있음.
- 후속 디자인 제안: 기존 세 위젯 크기/기존 Activity 상태 내에서 새 공통 색상·글자 위계·승인 날씨/선형 조작 glyph·얕은 표면 적용. 홈 외 브랜드 워드마크 추가 없음; 기존 WeatherKit 출처 표시는 브랜드 워드마크와 별개로 유지. 실제 연속 애니메이션·새 타임라인 주기·신규 이동 상태/기능은 이번 제안·승인 범위 밖. **위젯/Activity 코드 변경은 수행하지 않음**.

## 실기기 빌드·설치·실행 실제 결과

- 최종 기존 빌드 session43841/PID96881: **exit0 / BUILD SUCCEEDED**, 18:39:56 KST. 구성 Debug/iphoneos/arm64/jobs1, 앱 기존 자동 개발 프로파일·위젯 기존 WeatherKit 개발 프로파일. `codesign --verify --deep --strict` 에러 없음. 임시 검증 프로젝트는 아직 재현용으로 유지하며 추적 원본 Xcode 프로젝트·entitlement 변경 없음.
- 내장 main.jsbundle 약5.4MiB, SHA256 `5aaf47d6541a2fd217e4b74bc69e49573dc62a18929646c0475c2c0b408399b1`. 현재 worktree `apps/mobile/index.js` 1333 modules/220 asset files, 로컬 서비스 환경을 로드한 실제 새 번들. 이전 main 테스트 앱/fixture 앱을 설치한 것이 아님.
- **무선 덮어설치 성공**, 동일 `com.weatheron.mobile`, 앱 bundle container `[local identifier omitted]`, install session21942 exit0. `evidence/ios-install.json`, `ios-install.log`. 앱 삭제/초기화/강제 마이그레이션 없음. 실제 저장 상태 무결성은 홈 진입 실패 때문에 아직 미검증.
- 첫 launch는 **Locked/CoreDevice10002/FBS RequestDenied**로 exit1. iPhone 미러링 재연결 후 재요청은 **Launched application**, 실제 앱 PID **68895**, 18:43:40 KST, 내장 JS evaluateJavaScript 확인. 런타임 log session1817은 콘솔 수집을 위해 실행 중. `evidence/ios-runtime-console.log`.
- 기존 BackgroundModes `fetch`/`remote-notification` 안내와 Debug Metro Inspector 접속 재시도 경고 존재. 설정 변경 없음.
- **홈 UI 검증 실패/보류**: 미러링 실제 앱에는 빨간 오류 패널이 보임. 현재 CUA의 해당 창 원본이 60×198 thumbnail만 반환돼 오류 문구를 읽을 수 없음. 이를 실제 앱 정상 홈 캡처나 통과로 표기하지 않음. `evidence/ios-runtime-error-mirroring.jpg`는 실제 실행 오류 화면의 낮은 해상도 원본임. Apple device capture는 1320×2868 primary LCD만 찍어 잠금화면을 보여주며, 연결된 미러링의 별도 실행 화면을 담지 못함. `ios-home-first.png`와 `ios-home-runtime-initial.png` 파일명과 달리 내용은 **잠금화면**이며 사용자에게 정상 홈 증거로 전달하지 않음.
- 필요한 다음 최소 조작: iPhone 잠금 해제 후 WeatherON을 기기에서 직접 열어 primary LCD에 앱 오류/홈을 표시. USB·재페어링·DeveloperMode/프로비저닝·권한 허용은 요구하지 않음. 실행 경로 복구/오류 문구 확보 전 홈 light/dark·스크롤/탭·텍스트/VoiceOver·실위치/날씨·알림/위젯 UI 검증은 여전히 **미검증**.

## 잠금 해제 후 실제 예외·원인 좁힘

사용자가 잠금을 해제한 뒤 primary LCD 원본 1320×2868에서 실제 오류를 읽음: `[runtime not ready]: Invariant Violation: new NativeEventEmitter() requires a non-null argument.` 스택은 NativeEventEmitter → PushNotificationIOS 초기화 → `get PushNotificationIOS` → `registerExportsForReactRefresh`. 파일 `evidence/ios-runtime-unlocked.png`; Library `[private library reference omitted]`, 표시 ID `[private library reference omitted]`.

현재 stdout 로그에는 JS 예외가 기록되지 않았음(기존 8줄). macOS 콘솔에서 해당 iPhone/WeatherON 프로세스만 필터링해 읽었지만 메시지0; 성능 영향을 피하려고 스트리밍을 중지. 화면 해상도가 낮을 때 오류 문구를 추정하지 않았음. 새 빌드/코드 수정/추가 실행 없음. 완료되지 않은 별도 승인 요청 없음. 현재 잠금 상태 조회는 `passcodeRequired=false`, `unlockedSinceBoot=true`. iPhone을 실제 사용하면서 미러링은 정상적으로 종료되었으며 새 페어링/잠금 우회 없음.

실제 빌드의 uncompiled JS `Build/Products/Debug-iphoneos/main.jsbundle` 해당 줄 대조:
- 79866: PushNotificationIOS의 `new NativeEventEmitter(Platform.OS !== 'ios' ? null : NativePushNotificationManagerIOS)`.
- 94659: 앱 localization wrapper가 react-native 전체 내보내기를 live getter로 재노출.
- 600: 실제 Metro Refresh 함수가 `moduleExports[key]`를 읽음.
- 기존 `apps/mobile/src/localization/react-native.tsx:15`의 `export * from "react-native"`가 사용하지 않는 native PushNotificationIOS getter까지 Refresh에 노출. 해당 파일 작업본/main SHA256 모두 `2c497694d99c2f938a9435eb6924fee590cf172b0905012a4d167592ad32cde0`; 홈 UI 변경에서 생긴 새 코드가 아님. 실제 앱 알림 구현은 Expo 경로이며 앱 소스에 PushNotificationIOS 직접 사용 없음.

빠른 재현 command: `node local-evidence/repro-localization-refresh.cjs`. 기존 실제 TSX wrapper를 transpile하고 실제 설치 번들의 Refresh 등록/안전성 함수를 그대로 읽어 사용, native 경계의 PushNotificationIOS 누락만 mock. **RED / exit1**, 동일 NativeEventEmitter 예외 및 getter 읽기 확인. 전체 실기기 오류와 같은 call-site 패턴을 검증하는 최소 probe이며 별도 네이티브 재빌드 없음.

다음 최소 수정 후보는 localization wrapper가 사용하는 RN API를 명시적으로 재노출하여 deprecated/optional getter를 Refresh가 임의로 초기화하지 않게 하는 것. 실제 알림 기능 제거·권한 변경·위젯 제외·새 의존성 추가와 구분. 무관한 기존 공통 초기화 문제이므로 먼저 보고했으며 아직 해당 파일 수정이나 새 빌드는 하지 않음. 홈 검증은 여전히 미완료.

## 승인된 공통 수정 및 재검증 — 초기화 오류 해결

사용자가 기존 공통 오류 최소 수정 후 계속 진행을 승인함. `localization/react-native.tsx`의 runtime `export *`만 실제 사용하는 RN API 23개의 명시적 재노출로 변경. `export type *`로 RN 타입 표면 유지. Text/RawText/Pressable/TextInput/LocalizedView 번역 래퍼 본문·알림 구현·권한·네이티브 모듈·의존성 변경 없음.

- 기존 prototype React Refresh repro **RED/exit1 → GREEN/exit0**.
- 신규 `scripts/check-localization-native-exports.mjs`: 86 실제 사용처 runtime export 호환성, 실제 설치 Metro Refresh 순회 시 optional native PushNotificationIOS/DevSettings getter 미호출, 실제 locale 번역 로직으로 KO/EN/JA Text·접근성·TextInput placeholder·ref/추가 props 검증 통과.
- tsc mobile, 2062 문구 번역 카탈로그, check-ios-reliability, check-review-regressions, check-correctness-batch, diff check 모두 통과.
- 현재 진행 빌드 없음 확인 후 같은 임시 QA 프로젝트/Debug/arm64/jobs1/기존 프로파일/기존 DerivedData로 증분 빌드 **exit0, BUILD SUCCEEDED, 19:03:57 KST**. `evidence/ios-device-fixed-build.log`. clean·동시 빌드·인증 설정 변경 없음.
- 서명 verify와 같은 bundle ID 무선 덮어설치 **exit0**. `evidence/ios-fixed-install.json/log`. 새 main.jsbundle SHA256 `261e08e825018f6725c0b90d2fac213c9349120951dbc8902e02bacf1134b4d3`.
- 실제 새 PID **69199**, 19:04:38 KST launch 성공, JS evaluate 실행. 초기화 오류 사라지고 코디/홈 정상 표시. `evidence/ios-fixed-runtime-console.log`, 수집 session74327 유지. 기존 BackgroundModes·Metro inspector 재시도 안내와 RN dropped-event 진단 메시지는 존재, 새 JS fatal 스택은 관측되지 않음.
- 기존 코디 선택 상태와 사용 중 위치·등록 목적지/출발시간이 표시되어 전부 초기 기본 상태로 돌아간 실행이 아님. 삭제/초기화/계정/알림 토글 없음.
- 기존 `weatheron://home` 딥링크로 같은 앱을 홈에 진입시킨 뒤 안정화된 실제 **다크 홈 1320×2868** 캡처 픽셀 확인. Home wordmark/ON·새 겹면 구름·20℃·현재 위치·목적지·출발·코디·선형 조작·하단 선택 상태 표시. 기존 서비스 env는 fixture가 아닌 **proxy 모드**이며 실제 native API 응답의 source 필드까지 읽은 검증과 구분. 현재 화면에는 ‘내 위치로 보는 중’·20℃·흐림·최고24/최저13·체감20·강수0%, 기존 등록 목적지·추천 출발/도착 설정 (개인 시각 생략)이 표시됨. 정확한 주소/목적지는 보고서에 복제하지 않음.
- 캡처 `evidence/ios-home-dark-ready.png`, Library `[private library reference omitted]`, 표시 ID `[private library reference omitted]`. 홈으로 막 전환되던 `ios-home-dark.png`는 중간 프레임이므로 안정화된 ready 파일을 사용.
- 라이트/스크롤·탭 터치·접근성 추가 검증 진행 중. 실제 기기를 잠금 해제해 사용하는 동안 iPhone 미러링 조작이 정상 종료되므로 MY→표시 설정→라이트→홈 직접 조작을 사용자에게 요청. Web 검증과 native 검증 구분 유지.
- **자동 승인 검토 거부**: 더 정확한 날씨 source 확인을 위해 앱 SQLite 전체를 로컬 복사하려던 동작은 계정·목적지·옷장·알림까지 포함할 수 있어 날씨 검증보다 범위가 넓다는 이유로 거부됨. 명령 실행 전 거부되어 폴더/DB 복사 없음. 우회 없이 중단하고 UI 상태와 기존 빌드 설정만 확인. API 응답 source·raw data를 읽었다고 표현하지 않음. 전체 DB를 원한다면 범위가 구체적인 별도 사용자 승인이 필요하며 이번 검증에는 수행하지 않음.

## 현재 검증 경계·정리

- 최종 다크 홈 캡처와 앱 PID69199 유지 확인. Native 정상 실행/기존 상태 복원/딥링크 홈 재진입/다크 홈 픽셀은 확인됨. 코디 화면이 실제 렌더링되고 홈 선택 상태로 변경된 화면도 확인됐지만, 모든 탭을 직접 터치하여 테스트했다는 의미는 아님.
- iPhone이 사용자 손에서 잠금 해제되어 미러링 입력이 종료된 상태. MY→표시 설정→라이트→홈 직접 조작에 대한 질문을 남겼으나 아직 완료 응답 없음. Native light·하단 코디 전체까지 스크롤·목적지 시트/전환·탭/드래그 터치·Dynamic Type/VoiceOver/Reduce Motion·알림/위젯 실행은 추가 확인 필요. 임의 설정/권한 변경이나 가짜 screenshot 생성 없이 pending으로 표시.
- 새 regression 스크립트도 앱 소스 변경 목록에 포함. 원본 tracked iOS/CI/의존성/승인 애셋은 변경 없음. 빌드 완료 후 temporary QA xcodeproj/xcworkspace를 Git 밖 `task-2/evidence/native-build-config/`에 재현 자료로 이동하고 node_modules 임시 symlink 제거. 기존 Pods/ignored .env.local와 DerivedData는 유지. 현재 branch HEAD/main49a628f 그대로, 커밋/푸시/배포 없음.
- 전체 SQLite 복사는 자동 승인 검토에 의해 차단됐으며 계속 추출하지 않음. 필요 이상으로 가져올 수 있는 계정/목적지/옷장/알림 정보의 위험 때문에, 원시 API response source 검증은 제외하고 실제 UI와 HTTPS proxy 빌드 구성 확인으로 제한. 전체 DB 추가 추출은 이번 결과에 포함하지 않음.

## iOS 우선 fidelity 재작업 — 19:28 KST 실제 실행

사용자 피드백에 따라 Android 작업·다른 화면 전면 전환 중단. 최종 iOS light/dark core 보드 원본 픽셀과 실제 다크 홈을 직접 비교함. 상세 차이 표: `WeatherON_IOS_HOME_FIDELITY_2026-10-09.md`.

- 초기 임의 단순화: 환경빛을 평평한 색 띠로, 출발 칩을 큰 블록으로, 준비물 한 줄을 2열 카드로 바꿈. 코디가 잘리고, 알림 원·탭 선택 원이 추가됨. 플랫폼 70/30 비율을 이 차이의 근거로 쓰지 않음.
- iOS 수정: 기존 RN0.86 네이티브 radial/linear gradient로 경계 없는 빛과 곡면 표현, 실환경 바람 호흡·실강수 밀도·터치광 유지. 별도 의존성 추가 없음. 출발 44pt 칩과 준비물 행/예보 capsule 복원. 경로 fallback·오류 문구는 가시적으로 유지하고 시간/도착 설명은 접근성 label에도 유지. 실제 추천 outer/top + shoes를 겹친 홈 미리보기로 표시. 홈 알림 버튼의 임의 원 제거, 기존 unread badge/handler 보존.
- 하단: iOS JS 아이콘 선택 배경 중복 제거, dock 전체 기존 expo-blur 표면 적용, 기존 네이티브 UIGlassEffect tint만 절제된 기능성 포인트로 수정. `LiquidGlassNavigationView.swift`가 이제 tracked 변경 목록에 추가됨. 앞 절의 'tracked iOS 변경 없음'은 이 재작업 이전 상태임. 기존 drag/tap·Reduce Motion·지원 OS 분기는 유지.
- 1차 수정 빌드와 실제 캡처에서 나란한 옷·평평한 전체 dock을 발견하여 추가 수정함. 동시 빌드 없음 확인 후 ARM64 jobs1 증분만 실행, 두 빌드 모두 BUILD SUCCEEDED. 최신 `evidence/ios-home-fidelity-final-build.log`. clean/Pod install/신규 인증 변경 없음.
- 최신 signature verify·same-bundle-ID 덮어설치 성공, PID69271 실제 실행 성공, JS evaluate 확인, redbox/fatal stack 관측 없음. `evidence/ios-home-fidelity-final-install.json`, `ios-home-fidelity-final-console.log`. bundle SHA256 `8eac56265a22a484f4a0fc4108554a6e98af4f4dcf2e8c7ec4e53d61f6b7d456`.
- 최신 타입·번역2065문구·native exports86소비자/실제MetroRefresh·iOS reliability·review regressions·diff check 통과. reliability는 native boundary mock 기반이며 물리 알림/위젯 성공을 뜻하지 않음.
- 실제 캡처 `evidence/ios-home-fidelity-final-dark.png`, 1320×2868, native 홈·실제 저장 상태·서비스 날씨를 보임. 경계 없는 배경, 출발 칩, 준비물 한 줄, 겹친 겉옷·신발을 첫 화면에 확인. 원본을 픽셀 조작하지 않은 HTML 비교 `evidence/ios-home-fidelity-comparison.html`(승인 Home 영역 CSS 표시/실제 raw capture, equal width, 다른 aspect ratio 명시).
- **남은 차이/대기:** 원본 시안의 미세한 환경 질감까지 같지 않음. 실제 앱 하단 개발 경고 배너가 dock을 가려 전체 최신 dock 픽셀 검수가 미완료. 배너 × 닫기와 MY→표시 설정→라이트→홈 조작을 사용자에게 요청했고 완료 응답 없음. 원래 BackgroundModes/inspector 안내를 숨기거나 기능·보안 설정을 바꾸지 않음. Native light/작은 iPhone/텍스트 확대/Reduce Motion·VoiceOver/스크롤·탭·드래그/알림·위젯은 pending. 완료/시안 sign-off로 보고하지 않음.
- 자동 승인 검토가 전체 앱 DB 복사를 거부한 경계 유지. 사적 계정·목적지·옷장·알림 정보까지 가져올 수 있다는 이유였고 복사/우회 없음. raw SOURCE 확인 제외.
- 커밋·푸시·main 병합·배포 없음, 기존 사용자 문서/원본 승인 애셋/CI manual 설정 보존. 다른 화면은 내용 전면 전환하지 않았고 Android 추가 작업·빌드 없음.
- 최신 실제 다크 fidelity 수정 캡처 Library: `[private library reference omitted]`, 표시 ID `[private library reference omitted]`. 원래 다크 캡처 Library 항목도 수정 전 비교용으로 유지.

## 부모 직접 검수 자료 및 터치 후속 소스 — 19:35 KST

- 최종 승인 다크 보드 Library `[private library reference omitted]`, 라이트 `[private library reference omitted]`. 두 원본은 기존 manifest SHA256 일치 확인, 재인코딩 없음. 전체 core 보드의 첫 Home 패널을 실제 수정본과 비교.
- 실제 수정본 다크 `[private library reference omitted]`, 수정 전 다크 `[private library reference omitted]`.
- 부모에게 구체적 초기 차이표와 최신 남은 차이를 분리해 제공. 배너로 가려진 최신 독, 라이트/터치/접근성은 pass 아님.
- 홈 터치광이 기존 고정 우측 상단이 아닌 실제 터치 지점에서 반응하도록 iOS 소스만 보완. page좌표에서 native safe area를 포함한 실제 Home View 측정 origin을 빼 중심에 적용. Android 기존 배치는 그대로. **tsc 통과, 아직 rebuild/install 하지 않음. 설치 앱/실제 캡처는 앞 절19:28 버전**. 사용자가 배너 ×/라이트를 조작할 차례라 재실행하지 않고 기다림.
- 코드에서 Reduced Motion 초기 unknown/조회 실패 시 정지, background/loading/unreliable일 때 호흡 정지, Reduce Transparency 시 터치광/블러 제거를 확인. 물리 VoiceOver/텍스트 확대/터치 및 저전력 모드 동작 성공으로 표현하지 않음. 현재 저전력 모드 입력은 없어 정지가 입증되지 않았음.

## 픽셀 재검수 정정 — 부모 Library403 이후

부모 materialize403을 우회하는 복사·재업로드·다른경로전송 없음. 이미 이 Mac 작업에 있는 승인 원본/19:28 실제 캡처만 자체 다시 검수함.

**코디 정정:** CSS 사진 영역은 겹쳐도 원본 옷 사진의 투명 여백 때문에 실제 겉옷·신발 픽셀은 떨어져 있음. 앞 절의 '겹친 코디 확인'은 과도한 표현이며, 첫 화면 코디 노출 확인과 구분. iOS 미설치 소스의 신발 right inset10%→20%로 조정. 실제 overlap 확인은 새 빌드/실기기 후 필요. 터치 좌표 수정과 함께 아직 미설치; 설치본/캡처는19:28 버전 유지.

**질감 정정:** 단색 띠의 경계는 제거됐지만 실제 큰 곡면광1개와 승인 보드의 미세 여러 겹 빛결·입상감은 차이가 큼. 전체 환경 질감 일치 pass 아님. 현재 실제 흐림/강수0 데이터에 비오는 시안의 선을 강제로 더하지 않음. 최신 독은 여전히 배너로 가려져 미검증. 경고 닫기/라이트 완료 응답이 없으므로 성공 가정 없음. 현재 Library 보고서는v5이며, 이 정정은 로컬 후속 기록으로 보존하고403 이후 추가업로드하지 않음.

## 환경 표면·터치·코디 후속 소스 보완 완료 — 미설치

부모의 승인에 따라 경고 닫기와 독립적인 iOS 소스 작업을 이어감. 무거운 새 빌드·설치·재실행 없이 진행했고 Library403 이후 복사/재업로드/다른 경로 전송 없음.

- `AmbientSurfaceBackground.tsx`: 큰 밝은 곡면광1개를 얕은 서로 다른 곡률의 빛결2개와 넓은 확산광1개의 네이티브 gradient field로 대체. 기본 독서 표면은 정적·불투명으로 유지, 실제 `current.windMs`가 빛결 강도·확대 진폭·호흡 시간에 반영됨. 풍향 공급이 없어 방향성 이동/풍향 주장 없음. 무풍/신뢰불가 시 빛결 field 없음. 실제 현재 condition/precipitation에 따른 rain density 유지. 기존 RN0.86 gradient 처리 사용, 이미지·셰이더·런타임 의존성 추가 없음.
- Reduced Motion 초기unknown/조회실패/활성화 시 정지. background 전환/로딩/신뢰불가 날씨에서 호흡 정지. iOS Reduce Transparency 시 field와 touch light 제거, touch animation도 시작하지 않음. pointerEvents none 및 접근성 tree 숨김 유지. 앱의 날짜·위치·실날씨/추천/알림 로직은 교체하지 않음.
- iOS 터치광은 실제 page좌표와 Home View 측정 origin으로 접점 중앙에 표시; 안전영역과 글자 크기 재배치에 대응. 코디 신발의right inset20%는 실제 픽셀 겹침 개선을 위한 미설치 수정으로 유지.
- 새 `scripts/check-ambient-surface-regressions.mjs`: 실제 컴포넌트/실제 Reduced Motion 훅을 TS transpile해 hook lifecycle 실행(native boundary mock), 설치된 RN 실제 gradient/color parser 실행, 흐름/강수/모션/투명도/배경 전환/실제 Home touch-handler 좌표 변환 검사. 실제 RN 파서가 모든 빛결 문법 처리. 미래 강수확률로 현재 rain pattern을 만들지 않는 조건, 강수량별 밀도 변화, 풍속 clamp 및 nativeDriver 확인.
- 대비 회귀에서 초기 overlay+touch 최악조건 dark text3.96:1, 이후 functional label4.25:1 실패를 발견해 수정. 글자/기능성 포인트 색을 유지하고 iOS 광량 상한을 제한, 라이트 바탕의 최소명도 확보. **소스 색 합성 보수적 하한**: dark본문7.54·보조4.97·포인트레이블4.53·ON4.45; light본문15.39·보조4.64·포인트레이블5.37·ON3.71. ON은21pt bold의 큰 글자기준3:1, 포인트 선형아이콘 light3.70:1, 보통 본문/보조/포인트레이블4.5:1 기준 통과. 모든 레이어의 가장 불리한 색과 최대풍속/터치광이 한 지점에 겹친 보수적 합성값이며 실제 iPhone color space/렌더링 대체검증 아님.
- 최신 tsc mobile, ambient surface 회귀/대비, native exports86소비자·실MetroRefresh, localization2065, iOS reliability, review regressions, git diff check **전부exit0**. iOS reliability native경계mock/NodeSQLite, 실제 전화기 알림/위젯 성공 의미 아님.
- **설치본 구분:** 설치 앱과 기존 raw 캡처는19:28 KST(hermes SHA8eac56265a22a484f4a0fc4108554a6e98af4f4dcf2e8c7ec4e53d61f6b7d456) 그대로. 새 빛결/접점/코디 간격 소스는 미빌드·미설치. 새 소스의 실제 원본 질감 유사도·사진픽셀 overlap·전체 dock·라이트/큰글자/VoiceOver/모션설정/터치 효과는 pass아님.
- 원본의 photographic grain/미세 복합질감을 완전 재현했다고 주장하지 않음. 저전력 모드 입력은 여전히 없어 정지 미입증. 사용자 경고 × 닫기/라이트 완료 응답 없음; 재실행과 충돌하지 않도록 설치 보류. 커밋/push/main병합/배포/다른화면/Android 새 작업 없음. Library보고서는v5 그대로이며 이 절은 기존 작업 로컬 결과로 보존.

## 최신본 실기기 검증 재개 — 19:59 KST 설치·실행 확인

사용자가 최신본 실기기 검증 재개를 승인함. 중복 xcodebuild/Metro 없음과 physical iPhone connected 확인. 기존 QA 프로젝트·프로파일·DerivedData를 재사용해 **ARM64 jobs1 증분 빌드exit0/BUILD SUCCEEDED**, signature verifyexit0, 동일 bundleID 무선 덮어설치exit0. 앱 삭제/초기화/새 인증/권한 변경 없음. `evidence/ios-ambient-latest-build.log`, `ios-ambient-latest-install.json`.

- 최신 native PID69411 실행 성공, JS evaluate와 정상 Home 딥링크 진입 확인. RN NativeEventEmitter redbox 재발 없음. 기존 BackgroundModes/inspector/droppedHeaderHeight 안내는 남아 있음. `ios-ambient-latest-console.log`.
- 설치된Hermes bundleSHA256 **2f884e2f95c21c6086433cdd967fa544285e936fe726e3fb93eeab54b81c644d**. 이제 여러 빛결/풍속반응/접점/코디간격 보완 소스가 설치본에 포함됨. 앞 절의 '19:28 설치본/소스 미설치'는 이 설치 이전 이력이며 최신상태가 아님.
- 실제 `evidence/ios-ambient-latest-dark-initial.png`,1320×2868 직접 픽셀 확인. 실제19℃/흐림/강수0와 기존 목적지·출발·코디 상태 표시. 장소/목적지의 사적 명칭은 보고서에 복제하지 않음. 실제 옷·신발 픽셀이 이제 겹침 확인(앞19:28 분리 상태와 구분). 첫 화면의 코디 노출·Home전용wordmark·최종lineicons·linebell 표시. 배경의 큰 밝은 곡선이 줄고 부드러운 얕은 밝기 변화로 보이나 원본의 입상감/미세빛결 일치로 평가하지 않음. Wind 값/실제 peak frame을 Home UI만으로 측정했다고 주장하지 않음.
- 하단 회색 **Open debugger to view warnings.**는 일반 개발 안내로 확인. 오른쪽 끝 동그란 × 버튼이 보임. 보안/권한 수락 없음. 현재 iPhone을 사용 중이라 iPhone미러링 정상UI가 '연결하려면 iPhone을 잠그십시오'라고 알려 연결되지 않음; Mac에서 정상버튼tap할 경로 없음. 사용자에게 배너 오른쪽× 닫기와 다크Home유지를 요청, 아직 완료 응답 없음. 이 무응답 때문에 빌드/설치/실행을 보류하지 않았음.
- 정상UI를 통한 탭·스크롤·실제touch·라이트/텍스트확대/ReduceMotion검증은 다음 수동 조작이 필요. 전역 접근성 설정을 임의로 변경하지 않음. Native dock전체가 배너에 가려져 아직 미검수. 경고를 소스ignoreLogs로 숨기거나 새로 합성한 capture 없음.
- 기존 비교HTML의 최신측 참조를 이 rawactual capture로 갱신. 새로운 원본PNG편집·이미지복사·Library재업로드/403우회·앱DB추출 없음. 캡처와비교/로그는 기존Mac작업에 보존. Source검사는 앞 절 전부pass 유지; 현재 코드와설치bundle구분 변경을 명시. Library보고서는v5 그대로.
- 20:03 안정화 재캡처에서도 개발배너는 닫히지 않은 실제 상태로 확인. 무관한 다른 앱 알림이 겹친 프레임은 WeatherON검수/전송 대상에서 제외하고 이 작업이 만든 후보PNG/JSON만 제거. 관련 알림 내용을 보고서/다른경로로 수집·복제·전송하지 않음. 유효한 최신원본캡처는19:59 `ios-ambient-latest-dark-initial.png`로 유지. 사용자닫기 응답은 아직 없음. 정상UI 다음 단계는하단×닫기 → 다크독전체검수 → 앱MY표시설정라이트/홈 → 코디탭·홈/스크롤·터치 → 사용자승인전역텍스트/ReduceMotion조작 순서.

## 사용자의 '아직 많이 다름' 피드백 재평가 — 20:18 실제 캡처

기준README/index/CSV/manifest 모두approved20261009corev3Home로 재확인. 새 `WeatherON_IOS_HOME_REASSESSMENT_2026-10-09.md`에 상위5불일치와 독립적인 영상 측정/플랫폼 구분 기록. 현재 정상홈딥링크/실제캡처 `evidence/ios-home-reassessment-current.png`에서 개발배너가 사라진 것을 직접 확인; 사용자응답 완료가정 아닌 픽셀관찰. 전체독을 이제 검수가능하고, 넓은회색선택캡슐/작은label/icon비율이 승인보다 다름. 원본시안 잘못선택 문제가 아니라 구현전반(글자위계, 추가hero요소/상태행, plan/outfit상대배치, surface밝기/texture, dock형태) 정합성 부족. 홈완료라는 과거평가 철회하며 기능pass를 시안pass로 쓰지 않음.

이 단계는 보고우선 재대조로 앱소스/설치본 변경 없음. 기존비교HTML에 같은내용높이/같은폭 토글 추가해 viewport차이 명시하고 raw현재스크린샷참조. Photoshop/합성된appcapture/원본편집/Library403우회·재업로드·다른경로반출 없음. 다음작업은 승인범위의iOSHome전반구성재조정으로 진행할 수 있으나 비교결과 먼저 부모에게 보고. NativeLight/탭/스크롤/터치/globala11y통과는 여전히아님.
