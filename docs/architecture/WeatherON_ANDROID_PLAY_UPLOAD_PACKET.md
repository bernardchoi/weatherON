# WeatherON Android Play Upload Packet

> 생성일: 2026-07-06
> 목적: Play Console 내부/폐쇄 테스트 트랙에 업로드할 production AAB와 업로드 전 확인값을 한 장으로 유지한다.

## 1. AAB 업로드 대상

| 항목 | 값 |
|---|---|
| 앱 이름 | WeatherON |
| Android package | `com.mvp.weatheron` |
| 앱 버전 | `0.1.0` |
| Android versionCode | `6` |
| 소스 기준 버전 | `0.1.0 (6)` |
| EAS build id | `f13ec171-abf6-4cc3-9ea9-91fa055e7613` |
| Build 상태 | FINISHED |
| Build 버전 | `0.1.0 (6)` |
| 소스 일치 | 일치 |
| Build 링크 | https://expo.dev/accounts/weatheron/projects/weatheron/builds/f13ec171-abf6-4cc3-9ea9-91fa055e7613 |
| AAB artifact | https://expo.dev/artifacts/eas/rSNbT6B0AW9GV5pBWlc6VcRkuLmcRVz2S1vY80Ax9Yk.aab |
| 업로드 후보 여부 | 가능 |

## 2. 업로드 전 남은 확인

| 항목 | 상태 |
|---|---|
| Play 제출 blocker | 17 |
| 실기기 QA 미검증 | 0 |
| 스토어 스크린샷 issue | 0 |
| Play 입력값 누락 | 9 |
| 폐쇄 테스트 대기 항목 | 13 |

## 3. Play Console 업로드 순서

1. Play Console에서 WeatherON 앱 선택 또는 신규 앱 생성
2. 테스트 및 출시 > 내부 테스트 또는 폐쇄 테스트 트랙 선택
3. 새 release 생성
4. AAB artifact 업로드
5. release name은 `0.1.0 (6)` 기준으로 입력
6. 출시 노트 초안 입력
7. 저장 후 제출 전 blocker 문서 확인

## 4. 출시 노트 초안

```text
WeatherON Android preview build.
- 날씨 기반 홈/출발 흐름
- 목적지 날씨 케어와 Kakao Local 검색
- MY/정책/권한 설정
- 최초 출시 범위 외 코디/스타일/소셜 레이어 미공개
```

## 5. 확인 명령

```bash
npm run check:eas-production-build-status -- f13ec171-abf6-4cc3-9ea9-91fa055e7613
npm run check:android-store-submit-ready
npm run report:android-release-action-board
```

## 6. 주의

- AAB는 소스 기준 버전과 일치할 때만 Play 테스트 트랙 업로드 후보로 본다.
- 소스 불일치이면 `npm run build:android:production:no-wait`로 새 production AAB를 만든 뒤 build id를 갱신한다.
- AAB artifact URL은 Expo 로그인 세션 또는 권한에 따라 접근이 제한될 수 있으므로 업로드 전 다운로드 가능 여부를 한 번 확인한다.
