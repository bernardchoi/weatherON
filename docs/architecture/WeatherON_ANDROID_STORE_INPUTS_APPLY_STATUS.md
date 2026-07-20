# WeatherON Android Store Inputs Apply Status

> 생성일: 2026-07-20
> 목적: Google Play 제출 입력값 적용 상태와 실행 방법을 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 적용 여부 | 미적용 |
| 입력 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json |
| 샘플 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_STORE_INPUTS.example.json |
| issue 수 | 9 |
| 누락 필드 수 | 9 |
| placeholder 필드 수 | 0 |
| 형식/검증 issue 수 | 0 |

## 2. 입력값 분류

| 필드 | 상태 | 초안값 | 메모 |
|---|---|---|---|
| developerEmail | 누락 | dev@weatheron.app | Play 공개 개발자 이메일 |
| developerWebsite | 입력됨 | 미입력 | 없으면 미입력 |
| privacyPolicyUrl | 누락 | https://example.com/weatheron/privacy | 공개 HTTPS URL 필요 |
| operatorName | 누락 | WeatherON | 공개 운영자명 |
| supportContact | 누락 | dev@weatheron.app | 이메일 또는 전화번호 |
| privacyOfficerName | 누락 | 담당자명 | 실명 또는 공개 책임자명 필요 |
| privacyOfficerTitle | 누락 | 개인정보 보호책임자 | 공개 직책 |
| privacyOfficerContact | 누락 | dev@weatheron.app | 이메일 또는 전화번호 |
| privacyPolicyEffectiveDate | 누락 | 2026-07-01 | YYYY-MM-DD |
| logRetentionMonths | 입력됨 | 12 | 1 이상 숫자 |
| emailAuthService | 입력됨 | 이메일 인증 미도입 | 미도입이면 이메일 인증 미도입 |
| targetAge | 입력됨 | 만 14세 이상 | 14 포함 필요 |
| playConsoleAccountType | 누락 | 개인 신규 | 개인 신규/개인 기존/조직 |

## 3. Issues

- missing input field: developerEmail
- missing input field: privacyPolicyUrl
- missing input field: operatorName
- missing input field: supportContact
- missing input field: privacyOfficerName
- missing input field: privacyOfficerTitle
- missing input field: privacyOfficerContact
- missing input field: privacyPolicyEffectiveDate
- missing input field: playConsoleAccountType

## 4. 실행 순서

1. `WeatherON_ANDROID_STORE_INPUTS.example.json`을 복사해 `WeatherON_ANDROID_STORE_INPUTS.local.json`을 만든다.
2. 실제 Play Console/개인정보처리방침 값을 채운다.
3. 아래 명령을 실행한다.

```bash
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
```
