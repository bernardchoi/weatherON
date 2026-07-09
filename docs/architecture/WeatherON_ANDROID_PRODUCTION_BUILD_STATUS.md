# WeatherON Android Production Build Status

> 생성일: 2026-07-07
> 목적: Play Console 업로드용 EAS Android production AAB 빌드 상태와 artifact 생성 여부를 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| EAS build id | `5d7ddb0e-334d-4663-bfa9-5a90d50eb8f1` |
| Build 상태 | LOCAL BUILD SUCCESS / EAS IN_QUEUE |
| Platform | ANDROID |
| Profile | production |
| Version | `0.1.0 (8)` |
| Build 링크 | https://expo.dev/accounts/weatheron/projects/weatheron/builds/5d7ddb0e-334d-4663-bfa9-5a90d50eb8f1 |
| AAB artifact | `builds/weatheron-v0.1.0-versionCode8.aab` |
| AAB SHA-256 | `a5673b88cfa10e15918408b8fc91eafdcf01fc9a7beac7c2a0eb0b64be107f34` |

## 2. 확인 명령

```bash
npm run check:eas-production-build-status -- 5d7ddb0e-334d-4663-bfa9-5a90d50eb8f1
```

## 3. 다음 액션

- 로컬 signed AAB artifact를 Play Console 내부/폐쇄 테스트 트랙 업로드 후보로 사용
- EAS 원격 build가 FINISHED로 전환되면 원격 artifact URL로 보조 갱신

## 4. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-07-07 | production build `8d392e45-5aae-42a3-a196-59cb00153b28` 상태 FINISHED 확인 |
| 2026-07-09 | versionCode 8 production local AAB `builds/weatheron-v0.1.0-versionCode8.aab` 생성, EAS build `5d7ddb0e-334d-4663-bfa9-5a90d50eb8f1`은 IN_QUEUE |
