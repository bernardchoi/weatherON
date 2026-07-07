# WeatherON Android 비공개 테스트 준비

> 생성일: 2026-07-07
> 목적: Google Play 비공개 테스트 시작 전 필요한 자료, 콘솔 입력, 로컬 검증 상태를 한 장으로 유지한다.

## 1. 결론

| 항목 | 상태 |
|---|---|
| 앱 실기기 QA | 통과 |
| AAB 업로드 후보 | 준비됨 |
| 스토어 기본 자산 | 준비됨 |
| 스토어 스크린샷 | MVP1 기준 준비됨 |
| Play 입력값 | 사용자/외부 입력 필요 |
| 폐쇄 테스트 운영 | 계정 유형 확인 필요 |
| 현재 진행 가능 단계 | Play Console 앱 생성, 앱 콘텐츠/스토어 입력, AAB 업로드, 테스터 그룹 준비 |

## 2. 공식 기준

| 기준 | 확인 |
|---|---|
| 앱 테스트 트랙 | Play Console에서 내부 테스트, 폐쇄 테스트, 공개 테스트 트랙 사용 가능 |
| 신규 개인 개발자 계정 | 프로덕션 신청 전 12명 이상 테스터가 14일 이상 폐쇄 테스트 참여 필요 가능 |
| 릴리스 업로드 | Android App Bundle(AAB) 업로드 기준 |
| 스토어 등록정보 | 앱 이름, 간단한 설명, 자세한 설명, 그래픽/스크린샷, 카테고리 필요 |
| 앱 콘텐츠 | 개인정보처리방침 URL, 데이터 보안, 콘텐츠 등급, 타겟층, 광고 포함 여부 등 입력 필요 |

공식 문서:
- https://support.google.com/googleplay/android-developer/answer/9859348
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/googleplay/android-developer/answer/1078870
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/9866151

## 3. 업로드 후보

| 항목 | 값 |
|---|---|
| 패키지 | `com.weatheron.mobile` |
| 버전 | `0.1.0 (7)` |
| production AAB build | `8d392e45-5aae-42a3-a196-59cb00153b28` |
| production AAB version | `0.1.0 (7)` |
| 소스 기준 버전 | `0.1.0 (7)` |
| AAB artifact | https://expo.dev/artifacts/eas/5n1D01__lz03aiLZ6KqtJcTEPTwDEQnJgWCtiyrGNa8.aab |
| 업로드 판정 | 현재 소스와 일치. 비공개 테스트 업로드 후보 |
| 실기기 QA 리포트 | `docs/audits/ui-ux-real-device-qa-2026-07-07-2100/report.md` |

## 4. 콘솔 입력 필요값

| 입력 | 상태 | 문서 |
|---|---|---|
| 공개 개발자 이메일 | 필요 | `WeatherON_ANDROID_STORE_INPUTS_PACKET.md` |
| 개발자 웹사이트 입력 여부 | 필요 | `WeatherON_ANDROID_STORE_INPUTS_PACKET.md` |
| 개인정보처리방침 공개 HTTPS URL | 필요 | `WeatherON_ANDROID_PRIVACY_POLICY_PACKET.md` |
| 운영자명/고객센터 | 필요 | `WeatherON_ANDROID_STORE_INPUTS_PACKET.md` |
| 개인정보 보호책임자 | 필요 | `WeatherON_ANDROID_STORE_INPUTS_PACKET.md` |
| 콘텐츠 등급 설문 | 필요 | `WeatherON_ANDROID_CONTENT_RATING_DRAFT.md` |
| 타겟 연령 | 필요 | `WeatherON_ANDROID_STORE_INPUTS_PACKET.md` |
| Play Console 계정 유형 | 필요 | `WeatherON_ANDROID_CLOSED_TEST_PACKET.md` |

## 5. 비공개 테스트 운영 준비

| 항목 | 기준 |
|---|---|
| 테스터 그룹 | Play Console에서 이메일 목록 또는 Google Group 생성 |
| 최소 테스터 | 신규 개인 개발자 계정이면 12명 이상 |
| 운영 기간 | 신규 개인 개발자 계정이면 14일 이상 |
| 운영 기록 | `WeatherON_ANDROID_폐쇄테스트_운영기록.md`에 Day 1~14 기록 |
| opt-in 링크 | 테스트 트랙 생성 후 링크 저장 |
| 피드백 기록 | 주요 이슈, 수정 여부, 재배포 버전 기록 |

## 6. 실행 순서

1. Play Console 앱 생성
2. 앱 콘텐츠 필수 섹션 입력
3. 개인정보처리방침 공개 URL 확정
4. production AAB artifact 다운로드 가능 여부 확인
5. AAB를 내부 테스트 또는 폐쇄 테스트 트랙에 업로드
6. 테스터 그룹 생성 및 opt-in 링크 공유
7. 12명 이상 opt-in 확인
8. 14일 운영 기록 작성
9. 주요 이슈 수정 후 새 AAB 필요 시 versionCode 증가

## 7. 로컬 명령

```bash
npm run apply:android-store-safe-defaults
npm run apply:android-store-inputs
npm run check:android-store-screenshots-ready
npm run apply:android-closed-test-inputs
npm run check:android-closed-test-ready
npm run check:android-store-submit-ready
npm run report:android-release-action-board
```
