# WeatherON Android Release Action Board

> 생성일: 2026-07-20
> 목적: Android 출시 준비의 다음 행동, QA 상태, 제출 blocker를 한 화면에서 추적한다.

## 1. 현재 요약

| 항목 | 값 |
|---|---|
| 최신 preview build | `N/A - local Gradle release APK` |
| build 상태 | LOCAL BUILD SUCCESS |
| preview build version | `1.0.0 (10)` |
| 소스 기준 version | `1.0.0 (10)` |
| preview build 소스 일치 | 일치 |
| 최신 production build | `f66ecb78-ad9d-4236-be70-ec3530a051f8` |
| production build 상태 | FINISHED |
| 정적 체크 통과 | 23/23 |
| 실기기 QA 미검증 | 0 |
| 실기기 QA 결과 적용 | 적용됨 |
| 스토어 스크린샷 issue | 0 |
| 스토어 스크린샷 준비 | 5/5 |
| ADB 연결 | 가능 |
| APK 설치 | 설치됨 |
| local 입력 파일 issue | 0 |
| local 스토어 입력 누락 | 9 |
| local QA 환경/결과 누락 | 0/0 |
| 스토어 입력값 적용 | 미적용 |
| 스토어 입력값 issue | 9 |
| 스토어 입력값 누락 필드 | 9 |
| 스토어 입력값 placeholder | 0 |
| 스토어 입력값 형식/검증 issue | 0 |
| Play 제출 blocker | 9 |
| 사용자/외부 입력 미확정 | 5 |
| 폐쇄 테스트 대기 항목 | 13 |
| 폐쇄 테스트 입력값 적용 | 미적용 |
| 폐쇄 테스트 입력값 issue | 13 |
| 폐쇄 테스트 운영 요구 | 필요 |
| 폐쇄 테스트 초대/opt-in/운영 | 0/12 / 0/12 / 0/14 |

## 2. 다음 액션

| 우선 | 작업 | 완료 기준 | 상태 |
|---|---|---|---|
| 1 | 최신 MVP preview APK | `npm run build:android:preview:no-wait`는 EAS 외부 업로드가 포함되므로 사용자 승인 후 실행 | 최신 소스 반영됨 |
| 2 | 실기기 QA | N/A - local Gradle release APK 빌드 완료 후 APK 재설치 | 빌드 LOCAL BUILD SUCCESS |
| 3 | 스토어 스크린샷 | `assets/store/android-screenshots/`에 5장 저장 | 완료 |
| 4 | Play 제출 입력값 | `WeatherON_ANDROID_STORE_INPUTS.local.json` 작성 후 `npm run apply:android-store-inputs` 실행 | 9개 issue · 누락 9 |
| 5 | 폐쇄 테스트 준비 | `WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json` 작성 후 `npm run apply:android-closed-test-inputs` 실행. 14일 운영 안에 코디 포함 build 검증 | 13개 대기 · 입력 13개 issue |
| 6 | Production AAB | `npm run check:eas-production-build-status -- <build-id>` 기준 FINISHED 확인 | 완료 |
| 7 | 스토어 blocker | `npm run check:android-store-submit-ready` 기준 해소 | 9개 잔존 |

## 3. 실행 명령

```bash
npm run check:android-local-release-ready
npm run prepare:android-release-local-files
npm run build:android:preview:no-wait
npm run check:eas-build-status -- <eas-build-id>
npm run check:android-device-qa-ready
npm run report:android-device-qa-packet
npm run apply:android-device-qa-results
npm run check:android-store-screenshots-ready
npm run check:android-store-submit-ready
npm run report:android-store-inputs-packet
npm run apply:android-store-inputs
npm run apply:android-closed-test-inputs
npm run build:android:production:no-wait
npm run check:eas-production-build-status -- <eas-build-id>
```

## 4. 연결 문서

| 문서 | 목적 |
|---|---|
| `WeatherON_ANDROID_DEVICE_QA_SESSION.md` | 실기기 D1~D13 결과 기록 |
| `WeatherON_ANDROID_DEVICE_QA_PACKET.md` | 최신 APK 설치 링크와 D1~D13 수동 QA 패킷 |
| `WeatherON_ANDROID_DEVICE_QA_APPLY_STATUS.md` | 실기기 QA 결과 JSON 적용 상태 |
| `WeatherON_ANDROID_STORE_SCREENSHOT_PLAN.md` | 스토어 스크린샷 캡처 목록 |
| `WeatherON_ANDROID_STORE_SCREENSHOT_PACKET.md` | 스토어 스크린샷 캡처 작업 패킷 |
| `WeatherON_ANDROID_STORE_SCREENSHOT_STATUS.md` | 스크린샷 파일 검증 결과 |
| `WeatherON_ANDROID_ADB_STATUS.md` | 실기기/ADB 연결 준비 상태 |
| `WeatherON_ANDROID_INSTALL_STATUS.md` | 최신 preview APK 설치 상태 |
| `WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md` | 사용자/외부 입력값 회신 양식 |
| `WeatherON_ANDROID_STORE_INPUTS_PACKET.md` | Play 제출/개인정보처리방침 입력값 회신 패킷 |
| `WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md` | 개인정보처리방침 placeholder와 공개 URL 준비 패킷 |
| `WeatherON_ANDROID_PLAY_UPLOAD_PACKET.md` | Play Console AAB 업로드 대상과 출시 노트 초안 |
| `WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md` | 스토어 입력값 자동 반영 상태 |
| `WeatherON_ANDROID_LOCAL_INPUT_FILES_STATUS.md` | local JSON 템플릿 생성 상태 |
| `WeatherON_ANDROID_STORE_SUBMISSION_BLOCKERS.md` | Play 제출 blocker |
| `WeatherON_ANDROID_폐쇄테스트_운영기록.md` | 계정 유형, 테스터, 14일 운영 기록 |
| `WeatherON_ANDROID_CLOSED_TEST_INPUTS_APPLY_STATUS.md` | 폐쇄 테스트 입력값 자동 반영 상태 |
| `WeatherON_ANDROID_CLOSED_TEST_PACKET.md` | 폐쇄 테스트 계정/테스터/14일 운영 패킷 |
| `WeatherON_ANDROID_CLOSED_TEST_STATUS.md` | 폐쇄 테스트 readiness 이슈 |
| `WeatherON_ANDROID_MANUAL_ACTION_PACKET.md` | 자동 검증 후 남은 수동 액션 통합 패킷 |
| `WeatherON_ANDROID_CONTENT_RATING_DRAFT.md` | 콘텐츠 등급 설문 답변 초안 |
| `WeatherON_ANDROID_BUILD_STATUS.md` | 최신 EAS Android build 상태 |
| `WeatherON_ANDROID_PRODUCTION_BUILD_STATUS.md` | Play 제출용 production AAB build 상태 |
| `WeatherON_ANDROID_ARTIFACT_ACCESS_STATUS.md` | preview APK와 production AAB artifact URL 접근성 |
| `WeatherON_ANDROID_RELEASE_EVIDENCE_INDEX.md` | 빌드/검증/문서 증빙 인덱스 |
| `WeatherON_ANDROID_RELEASE_CONSISTENCY_STATUS.md` | 출시 상태 문서 간 값 일치성 검증 |

## 5. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-28 | Android release action board 최초 생성 |
