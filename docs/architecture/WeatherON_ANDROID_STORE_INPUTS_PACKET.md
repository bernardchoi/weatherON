# WeatherON Android Store Inputs Packet

> 생성일: 2026-07-10
> 목적: Google Play 제출과 개인정보처리방침 공개에 필요한 외부 입력값을 한 장에서 회신하고 JSON으로 반영한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| blocker 수 | 11 |
| 입력값 issue 수 | 9 |
| 누락 필드 수 | 9 |
| placeholder 필드 수 | 0 |
| 형식/검증 issue 수 | 0 |
| 실제 입력 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json |
| 누락 필드 | developerEmail, privacyPolicyUrl, operatorName, supportContact, privacyOfficerName, privacyOfficerTitle, privacyOfficerContact, privacyPolicyEffectiveDate, playConsoleAccountType |

## 2. 입력 분류

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

## 3. 회신 표

아래 값이 채워지면 개인정보처리방침 placeholder와 Play 제출 입력값을 동시에 반영할 수 있다.

| 항목 | 회신값 | 메모 |
|---|---|---|
| Google Play 공개 개발자 이메일 |  | 필수 |
| 개발자 웹사이트 URL 또는 미입력 |  | 선택 |
| 개인정보처리방침 공개 URL |  | HTTPS 필수 |
| 운영자명 | 최대현 / WeatherON | 확정 |
| 고객센터 연락처 | support@weatheron.app | 이메일 |
| 개인정보 보호책임자 성명 | 최대현 | 확정 |
| 개인정보 보호책임자 직책 | 개인정보 보호책임자 | 확정 |
| 개인정보 보호책임자 연락처 | support@weatheron.app | 이메일 |
| 개인정보처리방침 시행일 | 비공개 테스트 시작일 | 확정 |
| 광고/사용 로그 보유기간 | 테스트 종료 후 1개월 | 확정 |
| 이메일 인증 발송 서비스 | 현재 이메일 인증 발송 서비스를 사용하지 않습니다. | 미도입 |
| 앱 카테고리 | 날씨 | 1차 제출 기준 |
| 광고 포함 여부 | 아니오 | 현재 APK에 AdMob/광고 SDK 미포함 |
| 타겟 연령 |  | 권장 초안: 만 14세 이상 |
| Play Console 계정 유형 |  | 개인 신규/개인 기존/조직 |

## 4. JSON 입력 템플릿

`docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json`에 아래 형식으로 실제 값을 입력한다.

```json
{
  "developerEmail": "dev@weatheron.app",
  "developerWebsite": "미입력",
  "privacyPolicyUrl": "https://example.com/weatheron/privacy",
  "operatorName": "WeatherON",
  "supportContact": "dev@weatheron.app",
  "privacyOfficerName": "담당자명",
  "privacyOfficerTitle": "개인정보 보호책임자",
  "privacyOfficerContact": "dev@weatheron.app",
  "privacyPolicyEffectiveDate": "2026-07-01",
  "logRetentionMonths": "12",
  "emailAuthService": "이메일 인증 미도입",
  "targetAge": "만 14세 이상",
  "playConsoleAccountType": "개인 신규"
}
```

주의:
- `privacyPolicyUrl`은 실제 공개 HTTPS URL이어야 한다.
- `developerWebsite`는 웹사이트를 쓰지 않으면 `미입력`으로 둔다.
- `privacyOfficerName`에는 실제 담당자명 또는 공개 가능한 책임자명을 넣는다.
- `playConsoleAccountType`은 `개인 신규`, `개인 기존`, `조직` 중 하나로 확정한다.

## 5. 검증 규칙

| 필드 | 규칙 |
|---|---|
| `developerEmail` | 이메일 형식 |
| `developerWebsite` | `미입력` 또는 HTTPS URL |
| `privacyPolicyUrl` | 실제 공개 HTTPS URL, `example.com` 불가 |
| `supportContact` | 이메일 또는 전화번호 형식 |
| `privacyOfficerContact` | 이메일 또는 전화번호 형식 |
| `privacyPolicyEffectiveDate` | `YYYY-MM-DD` |
| `logRetentionMonths` | 1 이상 숫자 문자열 |
| `targetAge` | 현재 정책 초안 기준 `14` 포함 |
| `playConsoleAccountType` | `개인 신규`, `개인 기존`, `조직` 중 하나 |

## 6. 반영 명령

```bash
npm run prepare:android-release-local-files
npm run apply:android-store-safe-defaults
npm run apply:android-store-inputs
npm run check:android-store-submit-ready
npm run report:android-release-action-board
```

## 7. 반영 후 확인

1. `WeatherON_ANDROID_STORE_INPUTS_APPLY_STATUS.md` issue 수 0 확인
2. `weatheron_privacy_policy.html` placeholder 제거 확인
3. 개인정보처리방침 공개 URL 배포 후 Play Console에 입력
4. 콘텐츠 등급/계정 유형/폐쇄 테스트 필요 여부 확정
