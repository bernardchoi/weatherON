# WeatherON Android Device QA Env Sync Status

> 생성일: 2026-07-20
> 목적: ADB로 확인 가능한 실기기 QA 환경값을 local QA JSON에 자동 반영한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 적용 여부 | 미적용 |
| report only | 예 |
| issue 수 | 0 |
| update 수 | 0 |
| 선택 기기 | 000841458003652 |
| 입력 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json |
| adb 경로 | /Users/daehyeonchoi/Library/Android/sdk/platform-tools/adb |

## 2. Updates

- 없음

## 3. Issues

- 없음

## 4. 실행 명령

```bash
npm run sync:android-device-qa-env
WEATHERON_DEVICE_QA_ENV_SYNC_REPORT_ONLY=1 npm run sync:android-device-qa-env
npm run apply:android-device-qa-results
```

주의:
- 이 명령은 비어 있는 QA 환경값만 채운다.
- 네트워크 상태는 Wi-Fi/LTE 각각 직접 확인해 local JSON의 `network`에 수동 기록한다.
