# WeatherON Android Release Readiness Report

> 생성일: 2026-06-27
> 목적: Android preview APK 빌드 전 정적 준비 상태와 남은 차단 항목을 한 화면에 유지한다.

## 1. 요약

| 항목 | 값 |
|---|---|
| 앱 이름 | WeatherON |
| Android package | `com.weatheron.mobile` |
| 앱 버전 | `0.1.0` |
| Android versionCode | `1` |
| 정적 체크 통과 | 13/13 |
| 현재 차단 | Expo/EAS 로그인 필요 |

## 2. 정적 준비 체크

| 체크 | 상태 | 근거 |
|---|---|---|
| Android package | 통과 | com.weatheron.mobile |
| Android versionCode | 통과 | 1 |
| 위치 권한 | 통과 | ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION |
| EAS preview APK profile | 통과 | apk |
| EAS production AAB profile | 통과 | app-bundle |
| 로컬 통합 게이트 명령 | 통과 | npm run check:android-build-ready |
| EAS 로그인 체크 명령 | 통과 | npm run check:eas-login-state |
| 앱 아이콘 후보 | 통과 | assets/store/android-app-icon-512.png |
| 대표 그래픽 후보 | 통과 | assets/store/android-feature-graphic-v1.png |
| APK QA 문서 | 통과 | WeatherON_ANDROID_APK_QA_체크리스트.md |
| 스토어 등록 문서 | 통과 | WeatherON_ANDROID_STORE_등록자료.md |
| 폐쇄 테스트 문서 | 통과 | WeatherON_ANDROID_폐쇄테스트_운영기록.md |
| 개인정보처리방침 HTML | 통과 | docs/policy/weatheron_privacy_policy.html |

## 3. 최근 검증 명령

| 명령 | 상태 |
|---|---|
| `npm run check:android-release` | 통과 |
| `npm run check:android-build-ready` | 통과 |
| `WEATHERON_PROXY_SMOKE=1 npm run check:weather-proxy` | 통과 |
| `WEATHERON_LIVE_SMOKE=1 npm run check:weather-live` | 통과 |
| `WEATHERON_PLACE_SMOKE=1 npm run check:place-search` | 통과 |
| `npm run check:eas-login-state` | 로그인 필요 |

## 4. 다음 작업

1. `npm run eas:login`
2. `npm run check:eas-login-state`
3. `npm run eas:init`
4. `npm run check:android-local-release-ready`
5. `npm run build:android:preview`
6. APK 설치 후 `WeatherON_ANDROID_APK_QA_체크리스트.md`에 결과 기록
7. Play Console 제출 전 `npm run check:android-store-submit-ready`
