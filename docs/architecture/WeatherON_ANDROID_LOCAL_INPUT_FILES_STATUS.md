# WeatherON Android Local Input Files Status

> 생성일: 2026-07-15
> 목적: 출시 준비에 필요한 로컬 입력 JSON 생성 상태를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| issue 수 | 0 |
| force 재생성 | 아니오 |
| 스토어 입력 누락 | 9 |
| QA 환경값 누락 | 0 |
| QA 미검증 항목 | 0 |
| QA 자동 보정 메타 | 0 |
| 폐쇄 테스트 입력 누락 | 10 |
| 폐쇄 테스트 운영 미충족 | 38 |

## 2. 파일 상태

| 항목 | 상태 | local 파일 | 다음 명령 | 메모 |
|---|---|---|---|---|
| 스토어 입력값 | 유지 | `docs/architecture/WeatherON_ANDROID_STORE_INPUTS.local.json` | `npm run apply:android-store-inputs` | 9개 입력 필요 |
| 실기기 QA 결과 | 유지 | `docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json` | `npm run apply:android-device-qa-results` | QA 결과 채움 |
| 폐쇄 테스트 입력값 | 유지 | `docs/architecture/WeatherON_ANDROID_CLOSED_TEST_INPUTS.local.json` | `npm run apply:android-closed-test-inputs` | 입력 10개 · 운영 38개 |

## 3. Issues

- 없음

## 4. 실행 명령

```bash
npm run prepare:android-release-local-files
npm run prepare:android-release-local-files -- --force
```

주의:
- local JSON은 `.gitignore` 대상이다.
- `--force`는 기존 local JSON을 빈 템플릿으로 덮어쓴다.
