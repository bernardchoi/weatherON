# WeatherON Android Release Evidence Index

> 생성일: 2026-07-23
> 목적: Android 출시 준비의 빌드, 검증, 문서 증빙 위치를 한 곳에서 추적한다.

## 1. 현재 증빙 요약

| 항목 | 값 |
|---|---|
| 앱 이름 | WeatherON |
| Android package | `com.weatheron.mobile` |
| Android versionCode | `10` |
| 정적 체크 통과 | 23/23 |
| preview build | `N/A - local Gradle release APK` / LOCAL BUILD SUCCESS |
| production build | `f66ecb78-ad9d-4236-be70-ec3530a051f8` / FINISHED |
| artifact 접근 issue | 0 |
| Play 제출 blocker | 9 |
| 실기기 QA 미검증 | 0 |
| 스토어 스크린샷 issue | 0 |
| 스토어 스크린샷 준비 | 5/5 |
| Play 입력값 누락 | 9 |
| 스토어 입력값 적용 | 미적용 |
| 스토어 입력값 issue | 9 |
| 스토어 입력값 누락 필드 | 9 |
| 스토어 입력값 placeholder | 0 |
| 스토어 입력값 형식/검증 issue | 0 |
| 폐쇄 테스트 대기 항목 | 13 |
| 폐쇄 테스트 입력값 적용 | 미적용 |
| 폐쇄 테스트 입력값 issue | 13 |
| 폐쇄 테스트 운영 요구 | 필요 |

## 2. 빌드 Artifact

| 대상 | Build ID | 상태 | Artifact |
|---|---|---|---|
| Preview APK | `N/A - local Gradle release APK` | LOCAL BUILD SUCCESS | apps/mobile/android/app/build/outputs/apk/release/app-release.apk |
| Production AAB | `f66ecb78-ad9d-4236-be70-ec3530a051f8` | FINISHED | https://expo.dev/artifacts/eas/WHsqlrOEq36o5UAgK65yExyFMwm9XIqzecRiNFK8Q08.aab |

## 3. 검증 명령 증빙

| 명령 | 목적 | 최근 상태 문서 |
|---|---|---|
| `npm run check:android-local-release-ready` | 로컬 출시 준비 통합 게이트 | `WeatherON_ANDROID_RELEASE_READINESS_REPORT.md` |
| `npm run check:android-release` | Expo/EAS/스토어 문서 기준 검증 | `WeatherON_ANDROID_RELEASE_READINESS_REPORT.md` |
| `npm run check:android-build-ready` | Android build readiness 검증 | `WeatherON_ANDROID_RELEASE_READINESS_REPORT.md` |
| `npm run check:android-product-quality` | 제품 완성도 정적 검증 | `WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md` |
| `npm run check:android-core-flow` | 홈 판단 CTA와 목적지/알림 설정 실제 클릭 흐름 검증 | `WeatherON_ANDROID_WEB_EXPORT_QA.md` |
| `npm run check:android-web-preview-server` | 8094 미리보기 서버 산출물 검증 | `WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md` |
| `npm run check:android-device-qa-ready` | 실기기 QA 대상 APK/문서 검증 | `WeatherON_ANDROID_DEVICE_QA_PACKET.md` |
| `npm run check:android-artifact-access` | APK/AAB URL 접근성 검증 | `WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md` |
| `npm run check:android-store-submit-ready` | Play 제출 blocker 검증 | `WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md` |

## 4. 문서 증빙 인덱스

| 문서 | 증빙 내용 |
|---|---|
| `WeatherON_ANDROID_RELEASE_ACTION_BOARD.md` | 전체 상태판과 다음 액션 |
| `WeatherON_ANDROID_RELEASE_READINESS_REPORT.md` | 정적 준비 체크와 최근 검증 명령 |
| `WeatherON_ANDROID_BUILD_STATUS.md` | preview APK build 상태 |
| `WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md` | production AAB build 상태 |
| `WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md` | APK/AAB artifact URL 접근성 |
| `WeatherON_ANDROID_MANUAL_ACTION_PACKET.md` | 남은 수동 액션 통합 표 |
| `WeatherON_ANDROID_DEVICE_QA_PACKET.md` | 실기기 QA 기입표 |
| `WeatherON_ANDROID_WEB_EXPORT_STATUS.md` | mobile web export 번들/하단 탭/목업 혼입 점검 |
| `WeatherON_ANDROID_WEB_PREVIEW_SERVER_STATUS.md` | 8094 미리보기 서버가 최신 dist를 서빙하는지 점검 |
| `WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md` | 스토어 스크린샷 캡처표 |
| `WeatherON_ANDROID_STORE_INPUTS_PACKET.md` | Play 제출 입력값 회신표 |
| `WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md` | Play 제출/개인정보 입력값 적용 상태 |
| `WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md` | 폐쇄 테스트 계정/테스터/운영 입력값 적용 상태 |
| `WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md` | 개인정보처리방침 placeholder/URL 준비 |
| `WeatherON_ANDROID_CLOSED_TEST_PACKET.md` | 폐쇄 테스트 계정/테스터/운영 기록 |
| `WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md` | AAB 업로드 대상과 출시 노트 초안 |

## 5. 완료된 자동화 범위

- preview APK build 완료 및 artifact URL 확보
- production AAB build 완료 및 artifact URL 확보
- APK/AAB URL HTTP 200 접근 확인
- store asset 후보 생성
- Android release config 정적 검증
- 제품 품질 정적 검증
- 수동 액션 패킷 생성 자동화

## 6. 미완료 수동 범위

- 실기기 QA 결과는 `WeatherON_ANDROID_DEVICE_QA_SESSION.md`와 최신 audit report에 기록됨. C4 저장 완료 CTA 하단 여백은 보정 후 해결 확인
- Google Play 스크린샷 5장 캡처
- Play 제출/개인정보처리방침 실제 입력값 확정
- 개인정보처리방침 공개 HTTPS URL 배포
- Play Console 계정 유형과 폐쇄 테스트 운영값 확정

## 7. 다음 명령

```bash
npm run check:android-local-release-ready
npm run check:android-artifact-access
npm run report:android-manual-action-packet
```
