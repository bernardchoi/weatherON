# WeatherON Android 출시 준비 및 진행 프로세스

> 목적: WeatherON을 Android 우선 출시로 전환하면서 필요한 계정, 빌드, 테스트, 심사, 운영 절차를 한 곳에서 추적한다.
> 기준일: 2026-06-28

---

## 1. 현재 방향

Android를 1차 출시 대상으로 둔다.

| 항목 | 현재 결정 |
|---|---|
| 1차 스토어 | Google Play |
| 앱 프레임워크 | React Native + Expo Dev Client + TypeScript |
| 빌드 방식 | EAS Build |
| 내부 확인 파일 | APK |
| 스토어 제출 파일 | AAB |
| Android package | `com.weatheron.mobile` |
| Android versionCode | `9` |
| EAS 로그인 상태 | `npm run check:eas-login-state` 결과 `logged_in` (`weatheron`, `dev@weatheron.app`) |
| EAS projectId | `3bf39144-92a4-48a9-8bd8-ae09daf2a817` |
| 이전 preview APK | `25a68bd4-6177-49ce-925d-58ff9d643f03` |
| 최신 preview APK | `7c857db8-da31-4c95-88d8-0455546c1c4d` (`FINISHED`) |
| 보조 web export QA | `WeatherON_ANDROID_WEB_EXPORT_QA.md` |
| 스토어 입력값 관리 | `WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md` |
| 출시 전 핵심 검증 | 실제 Android 기기 + In-app browser 우선 QA + 필요 시 에뮬레이터/ADB |

현재 앱 설정은 `apps/mobile/app.json` 기준으로 Android package, versionCode, 위치 권한, adaptive icon이 선언되어 있다.

Base44 관련:
- 현재 워크트리에는 `base44/config.jsonc`가 없다.
- Android 앱 출시 준비는 Base44 배포가 아니라 Expo/EAS Build 기준으로 진행한다.

---

## 2. 출시 기준 요약

### Google Play 기준

- 2026-06-27 기준 신규 Android 앱은 Google Play 제출 시 Android 15, API level 35 이상을 target 해야 한다.
- Google Play 신규 앱은 Android App Bundle, 즉 `.aab`로 배포해야 한다.
- 신규 개인 개발자 계정이 2023-11-13 이후 생성된 경우, 프로덕션 신청 전 폐쇄 테스트가 필요하다.
- 폐쇄 테스트 조건은 최소 12명 테스터가 14일 연속 opt-in 상태여야 한다.

### WeatherON 적용

- production 제출은 `AAB` 기준으로 준비한다.
- 실제 단말 공유/내부 검증은 `APK` preview 빌드로 먼저 진행한다.
- Play Console 계정 유형이 개인 신규 계정이면 최소 14일 테스트 기간을 일정에 반영한다.
- 날씨/장소 provider 키는 앱에 넣지 않고 서버 환경변수 또는 Secret Manager에만 둔다.

---

## 3. 단계별 진행 프로세스

### Phase A. 계정 및 배포 기반

| 순서 | 작업 | 산출물 | 상태 |
|---|---|---|---|
| A1 | Google Play Console 개발자 계정 준비 | Play Console 접근 권한 | 미완료 |
| A2 | Expo 계정/EAS 프로젝트 연결 | EAS project id | 완료 |
| A3 | 앱 생성 | Google Play 앱 대시보드 | 미완료 |
| A4 | 앱 서명 방식 선택 | Play App Signing 사용 | 미완료 |
| A5 | 릴리즈 관리 담당 계정 정리 | 운영 권한 표 | 미완료 |

주의:
- Play Console 계정이 개인 신규 계정인지 먼저 확인한다.
- 개인 신규 계정이면 폐쇄 테스트 14일을 출시 일정의 고정 리드타임으로 본다.
- EAS CLI 로그인과 Play Console 업로드 권한은 별도 관리한다.

### Phase B. Android 앱 설정 정리

| 순서 | 작업 | 대상 | 상태 |
|---|---|---|---|
| B1 | Android package 확정 | `com.weatheron.mobile` | 완료 |
| B2 | 앱 이름/slug/version 확인 | `apps/mobile/app.json` | 완료 |
| B3 | versionCode 정책 추가 | `apps/mobile/app.json` 또는 app config | 완료 |
| B4 | adaptive icon/splash 실기기 확인 | `assets/icon/*` | 진행 필요 |
| B5 | 위치 권한 문구 검수 | `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION` | 진행 필요 |
| B6 | Android 15/API 35 target 확인 | Expo SDK/EAS 빌드 결과 | 진행 필요 |
| B7 | release build minify/shrink 정책 검토 | EAS/Gradle 생성 결과 | 진행 필요 |
| B8 | EAS archive 제외 설정 | `.easignore` | 완료 |

현재 app.json 확인 사항:

```json
{
  "android": {
    "package": "com.weatheron.mobile",
    "versionCode": 9,
    "permissions": ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
  }
}
```

추가 필요:
- Play Console에 표시할 앱 이름 최종안
- 위치 권한 설명 문구와 앱 내 권한 요청 화면 문구 일치 검수
- 릴리즈마다 `expo.version`과 `android.versionCode`를 함께 증가시킨다.

### Phase C. EAS Build 설정

| 순서 | 작업 | 산출물 | 상태 |
|---|---|---|---|
| C1 | `eas.json` 추가 | build profile | 완료 |
| C2 | development build 구성 | dev client APK | 완료 |
| C3 | preview build 구성 | 내부 배포 APK | 완료 |
| C4 | production build 구성 | Google Play 제출 AAB | 완료 |
| C5 | EAS credentials 설정 | Android keystore | 완료 |

권장 profile:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

현재 설정 파일:
- `apps/mobile/eas.json`

명령 기준:

```bash
npm run eas:login
npm run check:eas-login-state
npm run eas:init
npm run build:android:preview
npm run build:android:preview:no-wait
npm run check:eas-build-status -- <eas-build-id>
npm run build:android:production
npm run build:android:production:no-wait
npm run check:eas-production-build-status -- <eas-build-id>
```

주의:
- `preview`는 단말 설치와 QA용 APK.
- `production`은 Play Console 업로드용 AAB.
- production AAB 상태는 `WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md`에 별도 기록하고, preview APK QA 상태 문서와 섞지 않는다.
- EAS 빌드는 Expo 계정 로그인과 네트워크가 필요하므로 로컬 정적 검증과 별도로 실행한다.
- EAS 로그인 확인은 `npm run check:eas-login-state`로 먼저 한다.
- EAS project id 연결은 로그인 후 `npm run eas:init`으로 진행한다.
- 현재 EAS project는 `@weatheron/weatheron`이며 project id는 `3bf39144-92a4-48a9-8bd8-ae09daf2a817`이다.
- preview APK `25a68bd4-6177-49ce-925d-58ff9d643f03`은 EAS Build에서 생성되었고 실기기 설치/실행이 확인되었다.
- 제품 완성도 1차 보정 build `0afbdf0c-f617-43f5-8dd6-5466f862a40b`는 `npm run check:eas-build-status -- 0afbdf0c-f617-43f5-8dd6-5466f862a40b` 기준 `FINISHED` 상태다.
- 최신 완료 preview build `ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a`는 `npm run check:eas-build-status -- ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a` 기준 `FINISHED` 상태다.
- archive 최적화 preview build `8a0b9f32-260b-4b64-b335-b4b30113b3a1`는 `.easignore` 반영 후 업로드 크기 `62.5 MB`로 완료되었다.
- archive 최적화 후속 preview build `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95`는 하단 탭 IA 보정을 포함하고 업로드 크기 `62.5 MB`로 완료되었다.
- 최신 preview APK 링크: https://expo.dev/accounts/weatheron/projects/weatheron/builds/7c857db8-da31-4c95-88d8-0455546c1c4d
- 최신 preview APK artifact: https://expo.dev/artifacts/eas/Xo-hMSzJaJpw--znFpD2N082Pyw1RSF3ynB9Kz1ppCI.apk
- `.easignore`는 docs/mockups/brand/store-only 산출물과 로컬 캐시를 EAS archive에서 제외한다.
- 실기기 완성도 보정 후 시작한 preview build `5e5b8f72-9725-4416-8193-fba3d2a069bb`, `d217ac7e-aee7-48ca-86df-ef927777112f`, `d6b3aa4b-3d8f-46c2-bfd0-edbeb71603ff`는 archive 업로드 크기 `200 MB`로 회귀했다.
- 위 200MB 빌드는 기능 검증용 APK로는 사용할 수 있으나 archive 최적화 기준에서는 superseded 후보로 보고, 다음 EAS 빌드 전 monorepo archive root와 `.easignore` 적용 범위를 inspect한다.
- `.git` ignore 매칭을 `.git/`에서 `.git`까지 보강한 뒤 `eas build:inspect` archive stage가 `64 MB`로 회복되었다.
- 최신 보정본 preview build `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95`는 archive 업로드 크기 `62.5 MB`로 완료되었다.
- 하단 탭은 MVP 기준 `홈 / 출발 / MY`로 고정한다. 소셜/우산/강수는 하단 직접 탭으로 공개하지 않는다.
- `소셜` 탭은 `S1 ON Square` 로컬 체크인/컴패니언 화면으로 분리한다. 알림센터 `H3`는 홈/알림 설정에서만 진입한다.
- `S1 ON Square` 분리 반영 preview build `da28ef88-3adb-4a25-858d-9e2e4ba62245`는 archive 업로드 크기 `62.6 MB`로 완료되었다.
- `H3/H4/H5` 홈 활성 탭 보정 및 Android `versionCode=2` preview build `7c857db8-da31-4c95-88d8-0455546c1c4d`는 `FINISHED` 상태다.
- 위치 권한 실기기 이슈 수정 후 다음 QA build는 Android `versionCode=3` 기준으로 생성한다.
- 2026-06-30 최신 소스 `versionCode=5` preview build 시도는 EAS Free plan Android quota 소진으로 실패했다. 시도 중 archive `892 MB` 회귀가 확인되어 `.easignore`에 Android build 산출물 제외를 추가하고 native `applicationId`를 `com.weatheron.mobile`로 보정했다. 이후 `eas build:inspect --stage archive` 기준 archive stage는 75MB다.
- UI 시각 완성도 개선 후 다음 QA build는 Android `versionCode=4` 기준으로 생성한다.
- UI 문구/하단 탭 후속 보정 재검증 build는 Android `versionCode=5` 기준으로 생성한다.
- D9/D13 실기기 QA 보정 재검증 build는 Android `versionCode=6` 기준으로 생성한다.
- Play Console 비공개 테스트 재업로드 build는 Android `versionCode=9` 기준으로 생성한다.
- 최신 preview APK 설치는 `npm run install:android-preview-apk`로 수행하고 결과는 `WeatherON_ANDROID_INSTALL_STATUS.md`에 남긴다.
- 오래 기다리는 preview 빌드는 `npm run build:android:preview:no-wait`로 시작하고, build id를 `check:eas-build-status`로 추적한다.
- 오래 기다리는 production AAB 빌드는 `npm run build:android:production:no-wait`로 시작하고, build id를 `check:eas-production-build-status`로 추적한다.
- In-app browser 보조 QA는 `WeatherON_ANDROID_WEB_EXPORT_QA.md`에 기록한다.
- Mac 에뮬레이터 자동 설치는 `adb` 미설정이면 실패할 수 있으며, 이 경우 빌드 실패가 아니라 로컬 Android SDK 환경 문제로 본다.
- EAS CLI는 로컬 고정 설치 전까지 `npx --yes --cache ../../.npm-cache eas-cli ...`로 실행해 패키지 설치 확인 프롬프트와 사용자 홈 npm cache 권한 이슈를 피한다.
- `npm run check:eas-login-state`가 `Not logged in`을 반환하면 `npm run eas:login`으로 Expo 계정 로그인 후 다시 확인한다.
- `npm run check:eas-login-state`는 기본 20초 타임아웃으로 EAS 인증 확인 멈춤을 분리한다.
- sandbox 실행에서 EAS 인증 확인이 응답 없이 멈추면 인증/네트워크 접근 제한 가능성이 있으므로 프로젝트 오류로 보지 않고 승격 실행 또는 로컬 터미널에서 재확인한다.

### Phase D. API/서버 운영 준비

| 순서 | 작업 | 상태 |
|---|---|
| D1 | KMA 키 만료/연장 운영 캘린더 등록 | 진행 필요 |
| D2 | Kakao Local API 서버 환경변수 운영 반영 | 로컬 smoke 통과 |
| D3 | Google Maps Geocoding 키 발급 여부 결정 | 해외 목적지 실제 연동 시. 비용 기준은 `WeatherON_MAP_PROVIDER_COST_COMPARISON.md` |
| D4 | Firebase/Cloud Functions/Secret Manager 도입 | 계정/동기화/운영 배포 시 |
| D5 | API 키 앱 미노출 검증 | `check:android-release` 통과 |

현재 활성 API:
- KMA 단기예보 조회서비스
- Kakao Local API
- Open-Meteo

현재 대기 API:
- Google Maps Geocoding API
- Google Places API
- Mapbox Geocoding/Search API(비용 절감 대안. 현재 키 발급 불필요)
- Firebase/Cloud Functions/Secret Manager
- AdMob
- Kakao Directions API
- Google Routes API
- T-map API

운영 원칙:
- `EXPO_PUBLIC_*`에 외부 provider 키를 넣지 않는다.
- 앱은 `/weather/*`, `/places/search` 내부 adapter만 호출한다.
- 운영 배포 전 `apps/server/.env.local` 기반 로컬 키를 Secret Manager로 이관한다.
- 국내는 Kakao/T-map, 해외는 Google Maps를 기준으로 한다. Mapbox는 Google Maps 월 비용이 커질 때만 대안 PoC로 검토한다.

### Phase E. Android QA

| 순서 | 검증 | 도구 | 상태 |
|---|---|---|---|
| E1 | TypeScript 빌드 검증 | `npx tsc -p apps/mobile/tsconfig.json --noEmit` | 통과 |
| E2 | shared rule 검증 | `npm run check:shared` | 통과 |
| E3 | mockup 빌드 검증 | `npm run build:mockups` | 통과 |
| E4 | Android release config 검증 | `npm run check:android-release` | 완료 |
| E5 | Android build readiness 통합 검증 | `npm run check:android-build-ready` | 완료 |
| E6 | EAS 로그인 상태 확인 | `npm run check:eas-login-state` | 통과 |
| E7 | weather proxy smoke | `WEATHERON_PROXY_SMOKE=1 npm run check:weather-proxy` | 통과 |
| E8 | live weather smoke | `WEATHERON_LIVE_SMOKE=1 npm run check:weather-live` | 통과 |
| E9 | place search smoke | `WEATHERON_PLACE_SMOKE=1 npm run check:place-search` | 통과 |
| E10 | Android APK 설치/실행 | 실제 기기 또는 에뮬레이터 | 실기기 1차 통과 |
| E11 | Play pre-launch report 확인 | Play Console | 미완료 |
| E12 | Android local release ready | `npm run check:android-local-release-ready` | 통과 |

필수 플로우:
- H1 홈 진입
- O1~O6 온보딩
- A2/A3 계정 연결 게이트
- O3 위치 권한
- G1/G2 목적지 저장/공유 상태
- P1 목적지 검색
- P3 목적지 허브
- C1/C2/C3/C4 코디/옷장
- R1~R7 정책/알림/광고 관련 화면

Android 실기기 중점:
- 위치 권한 허용/거부/다시 묻지 않음
- 앱 재시작 후 저장 목적지 유지
- 네트워크 불안정 시 fallback
- Android 작은 화면 360x800급 overflow
- 다크/라이트 모드
- 한국어 권한/정책 문구

APK 산출 후 상세 체크는 `docs/architecture/WeatherON_ANDROID_APK_QA_체크리스트.md` 기준으로 기록한다.
실기기 세션별 결과는 `docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md`에 먼저 기록하고, 요약을 APK QA 체크리스트에 반영한다.

### Phase F. 스토어 등록 자료

| 항목 | 필요 내용 | 상태 |
|---|---|---|
| 앱 이름 | WeatherON | 초안 완료 |
| 짧은 설명 | 80자 이내 | 초안 완료 |
| 긴 설명 | 주요 기능/위치/날씨/추천 설명 | 초안 완료 |
| 앱 아이콘 | 512x512 | 후보 생성 완료 |
| feature graphic | 1024x500 | 후보 생성 완료 |
| 스크린샷 | Android phone 최소 세트 | 미완료 |
| 개인정보처리방침 URL | 공개 URL | HTML 초안 완료, 배포 URL 필요 |
| 앱 카테고리 | 날씨 | 1차 제출 기준 |
| 연락처 | 개발자 이메일/웹사이트 | 미완료 |
| 데이터 보안 | 위치, 계정, 알림, 광고 데이터 선언 | 초안 완료 |
| 콘텐츠 등급 | 설문 완료 | 미완료 |
| 광고 포함 여부 | 현재 APK에 AdMob/광고 SDK 미포함 | 1차 제출 기준 `아니오` |

정책 문서 연결:
- `docs/policy/WeatherON_약관_정책.md`
- `docs/policy/weatheron_security_policy.html`
- `docs/policy/weatheron_privacy_policy.html`
- `docs/architecture/WeatherON_ANDROID_EXTERNAL_ACTIONS.md`
- `docs/architecture/WeatherON_ANDROID_STORE_등록자료.md`
- `docs/architecture/WeatherON_ANDROID_CONTENT_RATING_DRAFT.md`
- `docs/architecture/WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md`
- `docs/architecture/WeatherON_ANDROID_RELEASE_ACTION_BOARD.md`
- `docs/architecture/WeatherON_ANDROID_CLOSED_TEST_STATUS.md`
- `docs/architecture/WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md`
- `docs/architecture/WeatherON_ANDROID_DEVICE_QA_SESSION.md`

### Phase G. 폐쇄 테스트 및 프로덕션 신청

| 순서 | 작업 | 상태 |
|---|---|---|
| G1 | 내부 테스트 트랙에 APK/AAB 업로드 | 미완료 |
| G2 | 핵심 플로우 QA 완료 | 미완료 |
| G3 | 폐쇄 테스트 트랙 생성 | 미완료 |
| G4 | 최소 12명 테스터 opt-in 확보 | 미완료 |
| G5 | 14일 연속 테스트 운영 | 미완료 |
| G6 | 피드백 수집/버그 수정 기록 작성 | 미완료 |
| G7 | production access 신청 답변 작성 | 미완료 |
| G8 | 프로덕션 릴리즈 제출 | 미완료 |

폐쇄 테스트 운영 기록에 남길 내용:
- 테스터 모집 방식
- 실제 테스트 기간
- 테스트한 기능 범위
- 주요 피드백
- 수정한 버그
- 남은 제한사항

폐쇄 테스트 상세 기록은 `docs/architecture/WeatherON_ANDROID_폐쇄테스트_운영기록.md`에서 관리한다.

### Phase H. 출시 후 운영

| 순서 | 작업 | 상태 |
|---|---|
| H1 | Crash/ANR 모니터링 | 미완료 |
| H2 | API 오류율 모니터링 | 미완료 |
| H3 | KMA 키 만료 알림 운영 | 진행 필요 |
| H4 | 사용자 피드백 분류 | 미완료 |
| H5 | staged rollout 비율 조정 | 미완료 |
| H6 | 긴급 rollback/중단 절차 정리 | 미완료 |

---

## 4. 바로 다음 작업

1. `7c857db8-da31-4c95-88d8-0455546c1c4d` APK를 실기기에 재설치해 D1~D12 QA
2. 하단 탭 `홈/코디/출발/MY` 구성과 `소셜/우산/강수` 직접 탭 제거 확인
3. 앱 재시작 후 온보딩/목적지/옷장/권한 상태 유지 확인
4. `WeatherON_ANDROID_DEVICE_QA_SESSION.md`에 실기기 QA 상세 결과 기록
5. `WeatherON_ANDROID_APK_QA_체크리스트.md`에 실기기 QA 요약 반영
6. 통과 화면으로 Android 스토어 스크린샷 캡처
7. `WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md` 회신 양식의 외부 입력값 확정
8. Play Console 계정 유형 확인 후 폐쇄 테스트 필요 여부 확정
9. 개인정보처리방침 placeholder 제거 후 공개 HTTPS URL 배포
10. `npm run check:android-store-submit-ready`로 Play 제출 blocker 재확인
11. 스토어 등록 자료 미해결 항목 확정
12. `npm run build:android:production` 실행 전 EAS credentials 확인

---

## 5. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-27 | Android 우선 출시 방향에 맞춰 최초 문서 작성 |
| 2026-06-27 | `apps/mobile/eas.json` 추가, Android `versionCode=1` 반영 |
| 2026-06-27 | Base44 config 부재 확인, Android 출시는 Expo/EAS 기준으로 유지 |
| 2026-06-27 | `npm run check:android-release` 로컬 Android 출시 설정 검증 추가 |
| 2026-06-27 | 루트/package mobile package에 EAS Android 빌드 명령 추가 |
| 2026-06-27 | EAS 명령을 `npx --yes eas-cli` 비대화형 실행으로 보정 |
| 2026-06-27 | EAS 명령 npm cache를 프로젝트 로컬 `.npm-cache`로 보정 |
| 2026-06-27 | `npm run eas:whoami` 실행 결과 `Not logged in` 확인, `npm run eas:login` 추가 |
| 2026-06-27 | sandbox 내 EAS 인증 확인 멈춤 시 승격/로컬 터미널 재확인 원칙 추가 |
| 2026-06-27 | EAS 로그인 상태 전용 체크 `npm run check:eas-login-state` 추가 |
| 2026-06-27 | weather proxy, live weather, place search smoke 승격 실행 통과 |
| 2026-06-27 | EAS CLI 다운로드 캐시인 `.npm-cache/`를 git ignore 처리 |
| 2026-06-27 | Android 빌드 직전 로컬 통합 게이트 `npm run check:android-build-ready` 추가 |
| 2026-06-27 | `npm run eas:init` 추가, Android preview APK QA 체크리스트 문서 작성 |
| 2026-06-27 | EAS 로그인, EAS project 연결, preview APK 빌드, 실기기 설치/실행 1차 성공 기록 |
| 2026-06-27 | Android Google Play 등록 자료 초안 문서 작성 |
| 2026-06-27 | Android 폐쇄 테스트 운영 기록 문서 작성 |
| 2026-06-27 | Play 제출용 개인정보처리방침 HTML 초안 작성 |
| 2026-06-27 | Google Play 대표 그래픽 후보 생성 |
| 2026-06-27 | Google Play 앱 아이콘 후보 `assets/store/android-app-icon-512.png` 생성 기준 추가 |
| 2026-06-27 | Android release readiness 리포트 생성 명령 `npm run report:android-release-readiness` 추가 |
| 2026-06-27 | Android 로컬 출시 준비 통합 게이트 `npm run check:android-local-release-ready` 추가 |
| 2026-06-27 | Google Play 제출 blocker 점검 명령 `npm run check:android-store-submit-ready` 추가 |
| 2026-06-27 | 외부 의존 액션 목록 `WeatherON_ANDROID_EXTERNAL_ACTIONS.md` 추가 |
| 2026-06-27 | preview APK 실기기 확인 후 제품 완성도 감사 문서 추가 |
| 2026-06-27 | 제품 완성도 보정: 온보딩 첫 진입, 내부 코드 제거, UI 밀도 보정, Android 뒤로가기, 상태 영속화 추가 |
| 2026-06-27 | EAS preview no-wait 빌드와 build id 상태 확인 명령 추가 |
| 2026-06-27 | 제품 보정 preview build `0afbdf0c-f617-43f5-8dd6-5466f862a40b` 완료 기록 |
| 2026-06-27 | In-app browser web export QA 문서 추가 |
| 2026-06-27 | Google Play 제출 전 사용자 확정 입력값 문서 추가 |
| 2026-06-27 | 최신 제품 보정 preview build `ffe1ec96-c5a2-44d8-9a7d-b3a3a131d66a` 완료 및 artifact 기록 |
| 2026-06-27 | EAS archive 최적화용 `.easignore` 추가 |
| 2026-06-27 | `.easignore` 반영 preview build `8a0b9f32-260b-4b64-b335-b4b30113b3a1` 완료 및 archive 업로드 62.5MB 확인 |
| 2026-06-27 | 최신 APK 기준 실기기 QA 세션 문서와 `check:android-device-qa-ready` 추가 |
| 2026-06-27 | 실기기 완성도 보정 후 preview build 3건 archive 200MB 회귀 확인, mobile `.easignore` 추가 및 다음 작업을 archive inspect로 조정 |
| 2026-06-27 | `.git` ignore 매칭 보정 후 archive inspect 64MB 및 preview build `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` 62.5MB 업로드 확인 |
| 2026-06-30 | 하단 탭 IA를 MVP 기준 `홈/출발/MY`로 고정하고 미공개 직접 탭을 제거 |
| 2026-06-30 | 소셜 레이어 최초 출시 미공개 기준으로 하단 탭 QA 기준 갱신 |
| 2026-06-28 | preview build `deb142d7-a9a8-44e5-85ba-6eb0e5b0dd95` 완료 및 최신 APK/artifact 기준 갱신 |
| 2026-06-28 | `S1 ON Square` 반영 preview build `da28ef88-3adb-4a25-858d-9e2e4ba62245` 완료 및 최신 APK/artifact 기준 갱신 |
| 2026-06-28 | 최신 preview APK 실기기 설치 자동화와 설치 상태 문서 추가 |
| 2026-06-28 | Android local release ready 통합 게이트 통과 상태와 다음 작업 순서 갱신 |
| 2026-06-28 | 현재 APK 의존성 기준 앱 카테고리 `날씨`, 광고 포함 여부 `아니오`로 1차 제출 기준 확정 |
| 2026-06-28 | Play Console 콘텐츠 등급 설문 답변 초안 문서 추가 |
| 2026-06-28 | Android `versionCode=2` preview build `7c857db8-da31-4c95-88d8-0455546c1c4d` 완료 및 최신 QA 대상 갱신 |
| 2026-06-28 | 위치 권한 실기기 이슈 수정 APK 재빌드를 위해 Android `versionCode=3` 반영 |
| 2026-06-28 | UI 시각 완성도 개선 preview APK 재빌드를 위해 Android `versionCode=4` 반영 |
| 2026-06-29 | UI 문구/하단 탭 후속 보정 재검증 preview APK 생성을 위해 Android `versionCode=5` 반영 |
| 2026-07-02 | D9/D13 실기기 QA 보정 재검증 preview APK 생성을 위해 Android `versionCode=6` 반영 |
| 2026-07-07 | Play Console에 `versionCode=6`이 이미 사용되어 비공개 테스트 재업로드용 Android `versionCode=7` 반영 |
| 2026-07-09 | 비공개 테스트 업데이트 AAB 생성을 위해 Android `versionCode=8` 반영 |
| 2026-07-15 | 비공개 테스트 업데이트 AAB와 local release APK 기준 동기화를 위해 Android `versionCode=9` 반영 |
| 2026-06-28 | Google Play 휴대전화 스크린샷 계획과 상태 리포트 검증 추가 |
| 2026-06-28 | Android release action board 생성 명령과 통합 게이트 연결 |
| 2026-06-28 | 폐쇄 테스트 readiness 상태 리포트와 통합 게이트 연결 |

---

## 6. 참고

- Google Play Target API level requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- Google Play App testing requirements for new personal developer accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Android App Bundle: https://developer.android.com/guide/app-bundle
- Expo EAS `eas.json`: https://docs.expo.dev/build/eas-json/
