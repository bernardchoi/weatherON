# WeatherON Android Artifact Access Status

> 생성일: 2026-06-28
> 목적: EAS preview APK와 production AAB artifact URL이 다운로드 가능한지 추적한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 접근 가능 여부 | 가능 |
| issue 수 | 0 |

## 2. Artifact 접근 결과

| 대상 | URL | 응답 | 상태 | 최종 URL |
|---|---|---|---|---|
| preview APK | https://expo.dev/artifacts/eas/bxWR-_rZCG9X8TmXwj_ni6LS1m_5BR5egVy3X8X-HQE.apk | HTTP 200 | 통과 | https://wf-artifacts.eascdn.net/builds/internal-st/3bf39144-92a4-48a9-8bd8-ae09daf2a817/819b6cba-7757-48a3-9f8e-92a4efd9c17c/019f0e83-8a53-75aa-bf44-827c38b43bb1/application-819b6cba-7757-48a3-9f8e-92a4efd9c17c.apk |
| production AAB | https://expo.dev/artifacts/eas/qCf2bVWNWVs_bgzWZlbMvlacPn0Y3OyxPo0rUvSQHa4.aab | HTTP 200 | 통과 | https://wf-artifacts.eascdn.net/builds/store-rg/3bf39144-92a4-48a9-8bd8-ae09daf2a817/90912651-fc84-47d0-91ce-9be096c2ff05/019f0a3f-203a-77fe-8cdd-886e5f7051da/application-90912651-fc84-47d0-91ce-9be096c2ff05.aab |

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
