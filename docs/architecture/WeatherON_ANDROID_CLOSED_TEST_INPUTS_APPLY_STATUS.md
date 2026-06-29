# WeatherON Android Closed Test Inputs Apply Status

> 생성일: 2026-06-29
> 목적: 폐쇄 테스트 계정 유형, 테스터, 14일 운영 입력값 적용 상태를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 적용 여부 | 미적용 |
| 입력 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json |
| 샘플 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS.example.json |
| issue 수 | 13 |
| 폐쇄 테스트 운영 요구 | 필요 |
| 테스터 초대 입력 | 0/12 |
| 테스터 opt-in 입력 | 0/12 |
| 14일 운영 입력 | 0/14 |

## 2. Issues

- missing input field: accountType
- missing input field: isNewPersonalDeveloperAccount
- missing input field: closedTestRequired
- missing input field: playAppCreated
- missing input field: privacyPolicyUrlEntered
- missing input field: testerGroupName
- missing input field: testStartDate
- missing input field: testEndDate
- missing input field: closedTrackCreated
- missing input field: optInLinkReady
- testers invited must be at least 12: current 0
- testers opt-in must be at least 12: current 0
- operationDays active records must be at least 14: current 0

## 3. 실행 순서

1. `WeatherON_ANDROID_CLOSED_TEST_INPUTS.example.json`을 복사해 `WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json`을 만든다.
2. Play Console 계정 유형, 폐쇄 테스트 필요 여부, 테스터/운영 값을 채운다.
3. 아래 명령을 실행한다.

```bash
npm run apply:android-closed-test-inputs
npm run check:android-closed-test-ready
npm run report:android-release-action-board
```
