# WeatherON Android Device QA Apply Status

> 생성일: 2026-06-29
> 목적: 실기기 QA 결과 JSON 적용 상태와 실행 방법을 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 적용 여부 | 미적용 |
| 입력 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json |
| 샘플 파일 | /Users/daehyeonchoi/Claude/Projects/스마트 날씨 앱/docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.example.json |
| 기대 build id | 419e3d2c-135b-41a1-88f6-3321ad5115f1 |
| 기대 app version | 0.1.0 (3) |
| issue 수 | 2 |
| 통과 | 10 |
| 실패 | 2 |
| 보류 | 2 |
| 미검증 | 0 |

## 2. Issues

- build id mismatch: expected 419e3d2c-135b-41a1-88f6-3321ad5115f1, got 819b6cba-7757-48a3-9f8e-92a4efd9c17c
- app version mismatch: expected 0.1.0 (3), got 0.1.0 (4)

## 3. 실행 순서

1. `npm run prepare:android-release-local-files` 또는 샘플 복사로 `WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json`을 만든다.
2. 실기기에서 D1~D12를 판정하고 결과를 채운다.
3. 아래 명령을 실행한다.

```bash
npm run apply:android-device-qa-results
npm run report:android-release-action-board
```

주의: `--force`는 기존 local QA 결과를 덮어쓰므로 새 템플릿이 필요할 때만 사용한다.
