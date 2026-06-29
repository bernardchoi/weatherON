# WeatherON Android Store Safe Defaults Status

> 생성일: 2026-06-29
> 목적: 사용자/법무 확정이 필요 없는 Google Play 입력 기본값만 local JSON에 자동 반영한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 상태 | 정상 |
| issue 수 | 0 |
| update 수 | 0 |
| 입력 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json |

## 2. 자동 입력 기준

| 필드 | 값 | 사유 |
|---|---|---|
| developerWebsite | 미입력 | 공개 웹사이트가 확정되지 않은 경우 Play Console에서 미입력 가능 |
| logRetentionMonths | 12 | 정책 초안 권장값 |
| emailAuthService | 이메일 인증 미도입 | 현재 APK에 이메일 인증 발송 서비스 미도입 |
| targetAge | 만 14세 이상 | 현재 정책 초안 기준. 최종 제출 전 법무 검토 필요 |

## 3. Updates

- 없음

## 4. Issues

- 없음

## 5. 주의

- 개발자 이메일, 개인정보처리방침 URL, 운영자명, 고객센터, 개인정보 보호책임자, Play Console 계정 유형은 자동 입력하지 않는다.
- 이 명령은 local JSON만 보정하며 개인정보처리방침/스토어 문서에 적용하지 않는다.
- 실제 반영은 사용자 확정값 입력 후 `npm run apply:android-store-inputs`로 수행한다.
