# WeatherON Android Play Upload Packet

> 생성일: 2026-07-08
> 목적: Play Console 내부/폐쇄 테스트 트랙에 업로드할 production AAB와 업로드 전 확인값을 한 장으로 유지한다.

## 1. AAB 업로드 대상

| 항목 | 값 |
|---|---|
| 앱 이름 | WeatherON |
| Android package | `com.weatheron.mobile` |
| 앱 버전 | `0.1.0` |
| Android versionCode | `8` |
| 소스 기준 버전 | `0.1.0 (8)` |
| EAS build id | `5d7ddb0e-334d-4663-bfa9-5a90d50eb8f1` |
| Build 상태 | LOCAL BUILD SUCCESS / EAS IN_QUEUE |
| Build 버전 | `0.1.0 (8)` |
| 소스 일치 | 일치 |
| Build 링크 | https://expo.dev/accounts/weatheron/projects/weatheron/builds/5d7ddb0e-334d-4663-bfa9-5a90d50eb8f1 |
| AAB artifact | `builds/weatheron-v0.1.0-versionCode8.aab` |
| AAB SHA-256 | `a5673b88cfa10e15918408b8fc91eafdcf01fc9a7beac7c2a0eb0b64be107f34` |
| 업로드 후보 여부 | 가능 |

## 2. 업로드 전 남은 확인

| 항목 | 상태 |
|---|---|
| Play 제출 blocker | 9 |
| 실기기 QA 미검증 | 0 |
| 스토어 스크린샷 issue | 0 |
| Play 입력값 누락 | 9 |
| 폐쇄 테스트 대기 항목 | 13 |

## 3. Play Console 업로드 순서

1. Play Console에서 WeatherON 앱 선택 또는 신규 앱 생성
2. 테스트 및 출시 > 내부 테스트 또는 폐쇄 테스트 트랙 선택
3. 새 release 생성
4. AAB artifact 업로드
5. release name은 `0.1.0 (8)` 기준으로 입력
6. 출시 노트 초안 입력
7. 저장 후 제출 전 blocker 문서 확인

## 4. 출시 노트 초안

```text
WeatherON Android 비공개 테스트 업데이트 0.1.0 (8)
- 코디 프리셋 아이템을 확장해 추천/옷장 화면의 선택 폭을 넓혔습니다.
- 코디 탭, 코디 상세, 저장 완료 상태, 홈 대표 코디 노출 흐름을 보정했습니다.
- 목적지 케어의 도착 시각/이동수단 설정 동작과 화면 전환감을 다듬었습니다.
- 홈, 출발, MY, 알림 사이드바, 권한/정책 화면의 실기기 QA 결과를 반영했습니다.
- 접근성/스토어 제출 점검 자료와 Android AAB 업로드 패킷을 최신화했습니다.
```

## 5. 확인 명령

```bash
npm run check:eas-production-build-status -- 5d7ddb0e-334d-4663-bfa9-5a90d50eb8f1
npm run check:android-store-submit-ready
npm run report:android-release-action-board
```

## 6. 주의

- AAB는 소스 기준 버전과 일치할 때만 Play 테스트 트랙 업로드 후보로 본다.
- 소스 불일치이면 `npm run build:android:production:no-wait`로 새 production AAB를 만든 뒤 build id를 갱신한다.
- AAB artifact URL은 Expo 로그인 세션 또는 권한에 따라 접근이 제한될 수 있으므로 업로드 전 다운로드 가능 여부를 한 번 확인한다.
