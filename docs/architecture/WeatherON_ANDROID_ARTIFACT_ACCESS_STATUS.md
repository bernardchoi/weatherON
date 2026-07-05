# WeatherON Android Artifact Access Status

> 생성일: 2026-07-06
> 목적: EAS preview APK와 production AAB artifact URL이 다운로드 가능한지 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 접근 가능 여부 | 가능 |
| issue 수 | 0 |

## 2. Artifact 접근 결과

| 대상 | URL | 응답 | 상태 | 최종 URL |
|---|---|---|---|---|
| preview APK | apps/mobile/android/app/build/outputs/apk/release/app-release.apk | 로컬 파일 확인 | 통과 | apps/mobile/android/app/build/outputs/apk/release/app-release.apk |
| production AAB | https://expo.dev/artifacts/eas/rSNbT6B0AW9GV5pBWlc6VcRkuLmcRVz2S1vY80Ax9Yk.aab | HTTP 200 | 통과 | https://wf-artifacts.eascdn.net/builds/store-rg/3bf39144-92a4-48a9-8bd8-ae09daf2a817/f13ec171-abf6-4cc3-9ea9-91fa055e7613/019f32ce-4fd7-75bf-86d3-e821c3827597/application-f13ec171-abf6-4cc3-9ea9-91fa055e7613.aab |

## 3. Issues

- 없음

## 4. 확인 명령

```bash
npm run check:android-artifact-access
WEATHERON_ARTIFACT_ACCESS_REPORT_ONLY=1 npm run check:android-artifact-access
```

## 5. 주의

- 이 검증은 네트워크와 Expo artifact URL 접근 권한이 필요하다.
- sandbox에서 네트워크가 제한되면 프로젝트 오류가 아니라 실행 환경 제한으로 본다.
