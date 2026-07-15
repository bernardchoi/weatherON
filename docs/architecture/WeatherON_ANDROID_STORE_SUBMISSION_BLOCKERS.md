# WeatherON Android Store Submission Blockers

> 생성일: 2026-06-28
> 목적: Google Play Console 제출 직전에 반드시 해소해야 하는 문서/정책/등록자료 blocker를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 제출 가능 여부 | 불가 |
| blocker 수 | 9 |
| Production AAB 상태 | FINISHED |
| Production AAB artifact | https://expo.dev/artifacts/eas/WHsqlrOEq36o5UAgK65yExyFMwm9XIqzecRiNFK8Q08.aab |

## 2. Blockers

- 개발자 이메일 확정 필요
- 개발자 웹사이트 입력 여부 결정 필요
- 개인정보처리방침 공개 URL 확정 필요
- 콘텐츠 등급 설문 완료 필요
- 정책/연령 문구 법무 검토 필요
- Android 스크린샷 캡처 필요
- Play Console 계정 유형 확인 필요
- 폐쇄 테스트 필요 여부 확정 필요
- 폐쇄 테스트 테스터 그룹 준비 필요

## 3. 처리 순서

1. Production AAB build `FINISHED`와 `.aab` artifact URL 확인
2. 최신 APK 실기기 QA 통과 후 스토어 스크린샷 캡처
3. `WeatherON_ANDROID_STORE_INPUTS_REQUIRED.md` 회신 양식에 개발자 연락처, 운영자명, 개인정보 보호책임자 입력값 확정
4. 개인정보처리방침 placeholder 제거 후 공개 HTTPS URL 배포
5. Play Console 콘텐츠 등급과 타겟 연령 문구 확정
6. Play Console 계정 유형 확인 후 폐쇄 테스트 필요 여부와 테스터 운영 계획 확정

## 4. 상세 분류

| Blocker | 분류 | 해소 방법 |
|---|---|---|
| 개발자 이메일 확정 필요 | 사용자 입력 | Play Console 공개 개발자 연락처 이메일 확정 |
| 개발자 웹사이트 입력 여부 결정 필요 | 사용자 입력 | 웹사이트를 입력할지, 입력한다면 공개 HTTPS URL 확정 |
| 개인정보처리방침 공개 URL 확정 필요 | 외부 배포 | HTML 초안을 공개 HTTPS URL로 배포 후 스토어 문서에 반영 |
| 콘텐츠 등급 설문 완료 필요 | 외부 작업 | Play Console 콘텐츠 등급 설문 완료 |
| 정책/연령 문구 법무 검토 필요 | 정책 검토 | 타겟 연령과 개인정보/광고 문구 최종 검토 |
| Android 스크린샷 캡처 필요 | 실기기 QA | 최신 APK 통과 후 휴대전화 스크린샷 세트 캡처 |
| Play Console 계정 유형 확인 필요 | 외부 작업 | 개인 신규/개인 기존/조직 계정 여부 확인 |
| 폐쇄 테스트 필요 여부 확정 필요 | 외부 작업 | 계정 유형 기준으로 폐쇄 테스트 의무 여부 확정 |
| 폐쇄 테스트 테스터 그룹 준비 필요 | 외부 작업 | 필요 시 최소 12명 테스터 opt-in 준비 |

## 5. 사용자 회신 최소 양식

아래 값이 확정되면 개인정보처리방침 placeholder와 Play 제출 입력값을 동시에 해소한다.

| 항목 | 회신값 |
|---|---|
| Google Play 공개 개발자 이메일 |  |
| 개발자 웹사이트 URL 또는 미입력 |  |
| 개인정보처리방침 공개 URL |  |
| 운영자명 |  |
| 고객센터 연락처 |  |
| 개인정보 보호책임자 성명 |  |
| 개인정보 보호책임자 직책 |  |
| 개인정보 보호책임자 연락처 |  |
| 개인정보처리방침 시행일 |  |
| 광고/사용 로그 보유기간 | 권장 초안: 12개월 |
| 이메일 인증 발송 서비스 | 미도입이면 `이메일 인증 미도입` |
| 타겟 연령 | 권장 초안: 만 14세 이상 |
| Play Console 계정 유형 | 개인 신규 / 개인 기존 / 조직 |

## 6. 자동 반영 명령

`WeatherON_ANDROID_STORE_INPUTS.example.json`을 기준으로 실제 입력값 JSON을 만든 뒤 실행한다.

```bash
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
```

## 7. 확인 명령

```bash
npm run check:android-store-submit-ready
```
