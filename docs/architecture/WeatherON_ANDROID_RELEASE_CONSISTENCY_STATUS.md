# WeatherON Android Release Consistency Status

> 생성일: 2026-07-03
> 목적: Android 출시 상태 문서 간 build id, build 상태, blocker 수, artifact 접근성 값이 일치하는지 검증한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 일치 여부 | 일치 |
| issue 수 | 0 |

## 2. 비교 결과

| 항목 | 상태 | 비교값 |
|---|---|---|
| preview build id | 통과 | readiness: N/A - local Gradle release APK<br>actionBoard: N/A - local Gradle release APK<br>evidence: N/A - local Gradle release APK<br>previewBuild: N/A - local Gradle release APK |
| preview build status | 통과 | readiness: LOCAL BUILD SUCCESS<br>actionBoard: LOCAL BUILD SUCCESS<br>evidence: LOCAL BUILD SUCCESS<br>previewBuild: LOCAL BUILD SUCCESS |
| production build id | 통과 | readiness: 90912651-fc84-47d0-91ce-9be096c2ff05<br>actionBoard: 90912651-fc84-47d0-91ce-9be096c2ff05<br>evidence: 90912651-fc84-47d0-91ce-9be096c2ff05<br>productionBuild: 90912651-fc84-47d0-91ce-9be096c2ff05 |
| production build status | 통과 | readiness: FINISHED<br>actionBoard: FINISHED<br>evidence: FINISHED<br>productionBuild: FINISHED<br>blockers: FINISHED |
| store blocker count | 통과 | actionBoard: 17<br>evidence: 17<br>blockers: 17 |
| artifact access issue count | 통과 | evidence: 0<br>artifactAccess: 0 |
| device QA pending count | 통과 | actionBoard: 0<br>evidence: 0 |
| screenshot issue count | 통과 | actionBoard: 1<br>evidence: 1<br>screenshotStatus: 1 |
| screenshot ready count | 통과 | actionBoard: 5/5<br>evidence: 5/5<br>screenshotStatus: 5/5 |
| store input missing count | 통과 | actionBoard: 9<br>evidence: 9 |
| store input applied | 통과 | actionBoard: 미적용<br>evidence: 미적용<br>storeInputs: 미적용 |
| store input issue count | 통과 | actionBoard: 9<br>evidence: 9<br>storeInputs: 9 |
| store input missing field count | 통과 | actionBoard: 9<br>evidence: 9<br>storeInputs: 9 |
| store input placeholder count | 통과 | actionBoard: 0<br>evidence: 0<br>storeInputs: 0 |
| store input validation issue count | 통과 | actionBoard: 0<br>evidence: 0<br>storeInputs: 0 |
| closed test pending count | 통과 | actionBoard: 13<br>evidence: 13 |
| closed test input applied | 통과 | actionBoard: 미적용<br>evidence: 미적용<br>closedTestInputs: 미적용 |
| closed test input issue count | 통과 | actionBoard: 13<br>evidence: 13<br>closedTestInputs: 13 |
| closed test operation required | 통과 | actionBoard: 필요<br>evidence: 필요<br>closedTestInputs: 필요<br>closedTestStatus: 필요 |

## 3. Issues

- 없음

## 4. 확인 명령

```bash
npm run check:android-release-consistency
WEATHERON_RELEASE_CONSISTENCY_REPORT_ONLY=1 npm run check:android-release-consistency
```
