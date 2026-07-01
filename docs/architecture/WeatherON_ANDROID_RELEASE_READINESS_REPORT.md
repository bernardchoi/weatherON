# WeatherON Android Release Readiness Report

> 생성일: 2026-06-30
> 목적: Android preview APK와 production AAB 기준 출시 준비 상태와 남은 차단 항목을 한 화면에 유지한다.

## 1. 요약

| 항목 | 값 |
|---|---|
| 앱 이름 | WeatherON |
| Android package | `com.weatheron.mobile` |
| 앱 버전 | `0.1.0` |
| Android versionCode | `5` |
| 정적 체크 통과 | 22/23 |
| EAS 로그인 | 통과 |
| EAS projectId | 3bf39144-92a4-48a9-8bd8-ae09daf2a817 |
| 최신 preview build | 419e3d2c-135b-41a1-88f6-3321ad5115f1 |
| 최신 preview build 상태 | FINISHED |
| 최신 preview build version | `0.1.0 (3)` |
| 소스 기준 version | `0.1.0 (5)` |
| preview build 소스 일치 | 불일치 |
| 최신 production build | 90912651-fc84-47d0-91ce-9be096c2ff05 |
| 최신 production build 상태 | FINISHED |
| 현재 차단 | EAS Android build quota reset 대기 |

## 2. 정적 준비 체크

| 체크 | 상태 | 근거 |
|---|---|---|
| Android package | 통과 | com.weatheron.mobile |
| Android versionCode | 통과 | 5 |
| 위치 권한 | 통과 | ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION |
| EAS preview APK profile | 통과 | apk |
| EAS production AAB profile | 통과 | app-bundle |
| 로컬 통합 게이트 명령 | 통과 | npm run check:android-build-ready |
| 제품 품질 체크 명령 | 통과 | npm run check:android-product-quality |
| Preview preflight 명령 | 통과 | npm run check:android-preview-preflight |
| 핵심 클릭 흐름 체크 명령 | 통과 | npm run check:android-core-flow |
| EAS 로그인 체크 명령 | 통과 | npm run check:eas-login-state |
| EAS production no-wait 명령 | 통과 | npm run build:android:production:no-wait |
| EAS production 상태 문서 명령 | 통과 | npm run check:eas-production-build-status -- <eas-build-id> |
| Preview APK 소스 일치 | 확인 필요 | 0.1.0 (3) vs 0.1.0 (5) |
| 앱 아이콘 후보 | 통과 | assets/store/android-app-icon-512.png |
| 대표 그래픽 후보 | 통과 | assets/store/android-feature-graphic-v1.png |
| APK QA 문서 | 통과 | WeatherON_ANDROID_APK_QA_체크리스트.md |
| Web export 보조 QA 문서 | 통과 | WeatherON_ANDROID_WEB_EXPORT_QA.md |
| 실기기 QA 세션 문서 | 통과 | WeatherON_ANDROID_DEVICE_QA_SESSION.md |
| 스토어 등록 문서 | 통과 | WeatherON_ANDROID_STORE_등록자료.md |
| 스토어 입력값 문서 | 통과 | WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md |
| 스토어 스크린샷 계획 문서 | 통과 | WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md |
| 폐쇄 테스트 문서 | 통과 | WeatherON_ANDROID_폐쇄테스트_운영기록.md |
| 개인정보처리방침 HTML | 통과 | docs/policy/weatheron_privacy_policy.html |

## 3. 최근 검증 명령

| 명령 | 상태 |
|---|---|
| `npm run check:android-release` | 통과 |
| `npm run check:android-build-ready` | 통과 |
| `npm run check:android-product-quality` | 통과 |
| `npm run check:android-preview-preflight` | 통과 |
| `npm run check:android-core-flow` | 통과 |
| `npm run check:android-device-qa-ready` | 통과 |
| `WEATHERON_PROXY_SMOKE=1 npm run check:weather-proxy` | 통과 |
| `WEATHERON_LIVE_SMOKE=1 npm run check:weather-live` | 통과 |
| `WEATHERON_PLACE_SMOKE=1 npm run check:place-search` | 통과 |
| `npm run check:eas-login-state` | 통과 |
| `npm run check:eas-build-status -- 419e3d2c-135b-41a1-88f6-3321ad5115f1` | 통과 |
| `npm run check:eas-production-build-status -- 90912651-fc84-47d0-91ce-9be096c2ff05` | 통과 |

## 4. 다음 작업

1. 현재 소스 0.1.0 (5) 기준 새 preview APK 필요. EAS Free plan Android build quota 소진. 2026-07-01 reset 후 재시도 필요. reset 후 `npm run build:android:preview:no-wait` 재실행
2. `WeatherON_ANDROID_APK_QA_체크리스트.md`에 실기기 결과 기록
3. 통과 화면으로 Android 스토어 스크린샷 캡처
4. `WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md`의 사용자 입력값 확정
5. Play Console 제출 전 `npm run check:android-store-submit-ready`
6. `90912651-fc84-47d0-91ce-9be096c2ff05` AAB artifact를 Play Console 업로드 후보로 확인
