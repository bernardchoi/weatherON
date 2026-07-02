# WeatherON Android Device QA Packet

> 생성일: 2026-07-02
> 목적: 최신 Android preview APK를 실기기에 직접 설치하고 D1~D13 QA를 바로 수행할 수 있게 한 장으로 정리한다.

## 1. 설치 대상

| 항목 | 값 |
|---|---|
| EAS build id | `802540a2-77a2-40cb-9b3b-15d9b3984ae2` |
| Build 상태 | FINISHED |
| Version | `0.1.0 (5)` |
| 소스 기준 Version | `0.1.0 (5)` |
| QA 대상 일치 | 일치 |
| Build 링크 | https://expo.dev/accounts/weatheron/projects/weatheron/builds/802540a2-77a2-40cb-9b3b-15d9b3984ae2 |
| APK artifact | https://expo.dev/artifacts/eas/c5GZmnH_LlJTr8f3ysnwjX1BTjQGcoiUcfL1DEOayd4.apk |
| ADB 연결 | 가능 |
| ADB 설치 상태 | 설치됨 |
| 실기기 QA 미검증 | 2 |
| 스토어 스크린샷 issue | 0 |

## 2. 실기기 직접 설치


1. Android 기기에서 APK artifact 링크를 연다.
2. 다운로드 후 설치한다.
3. Play Protect 또는 알 수 없는 앱 설치 경고가 나오면 WeatherON preview APK인지 확인하고 계속 설치한다.
4. 설치 후 앱을 실행한다.
5. 아래 D1~D13 결과를 기록한다.

ADB가 연결되면 아래 명령으로 설치/상태 확인을 자동화할 수 있다.

```bash
npm run check:android-adb-ready
npm run sync:android-device-qa-env
npm run install:android-preview-apk
```

주의:
- `sync:android-device-qa-env`는 ADB로 확인 가능한 `device`, `androidVersion`, `screenSize` 등 비어 있는 QA 환경값만 채운다.
- `network`, `installMethod`, `testedAt`은 실기기 확인 후 local JSON에 직접 기록한다.
- 이전 QA 세션 build id가 최신 build와 다르면 결과는 모두 `미검증`으로 되돌린다.

## 3. 필수 QA 결과 기입표

| ID | 항목 | 기대 결과 | 결과 | 메모 |
|---|---|---|---|---|
| D1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 통과 | 기존 서명 불일치 앱 삭제 후 ADB install 완료, 패키지 com.weatheron.mobile 설치 확인 |
| D2 | 첫 실행 | 크래시 없이 온보딩 진입 | 통과 | pm clear 후 MainActivity 실행, O1 온보딩 진입, crash log buffer 비어 있음 |
| D3 | 내부 문구 노출 | `H1`, `Guest`, `READY`, `OUTER` 같은 개발 문구 미노출 | 보류 | H1/Guest/READY/OUTER 등 내부 route/dev label은 미노출. Android 권한 팝업 앱명 WeatherON Dev 노출은 출시 label 확정 필요 |
| D4 | 홈 진입 | 홈 카드, 코디, 우산, 알림, 하단탭 표시 | 통과 | 위치 없이 계속 후 홈 진입, 홈 카드/목적지 필요/날씨 연결됨/하단탭 표시 정상 |
| D4-1 | 하단 탭 IA | MVP 기준 `홈/출발/MY` 표시, `코디/소셜/우산/강수` 직접 탭 없음 | 통과 | 하단 탭 홈/출발/MY 구성 확인, MY 탭과 알림 설정 진입 확인 |
| D4-2 | 핵심 클릭 흐름 | `npm run check:android-core-flow` 기준 홈 CTA, 코디 기준 저장, 옷장 추가, 하단 탭 가림 없음 | 보류 | 온보딩-홈-MY-알림 설정 핵심 연결은 확인. 목적지/코디/소셜 전체 핵심 클릭 플로우는 이번 실기기 세션 미실행 |
| D5 | 상태 저장 | 앱 완전 종료/재실행 후 온보딩/설정 상태 유지 | 미검증 | 최신 빌드 기준 앱 재실행 후 목적지/설정 상태 유지 미실행 |
| D6 | Android 뒤로가기 | 주요 화면에서 예상 경로로 복귀 | 미검증 | 최신 빌드 기준 Android 뒤로가기 QA 미실행 |
| D7 | 위치 권한 허용 | 현재 위치 또는 fallback 메시지 표시, 크래시 없음 | 미검증 | 최신 빌드 기준 위치 허용 플로우 미실행 |
| D8 | 위치 권한 거부 | 앱 사용 가능, 수동 위치/목적지 흐름 유지 | 미검증 | 최신 빌드 기준 위치 거부 fallback 미실행 |
| D9 | 목적지 검색 | 1순위 국내 장소(Kakao Local 또는 fallback) 검색·저장 확인 후 2순위 해외 장소(Google 또는 fallback) 보조 확인 | 미검증 | 최신 빌드 기준 목적지 검색/선택 실기기 QA 미실행 |
| D10 | 화면 밀도 | 작은 화면에서 가로 overflow/버튼 잘림/하단 탭 CTA 가림 없음 | 미검증 | 최신 빌드 기준 작은 화면/긴 텍스트 실기기 QA 미실행 |
| D11 | 다크/라이트 | 텍스트 대비와 버튼 상태 정상 | 미검증 | 최신 빌드 기준 라이트/다크 대비 QA 미실행 |
| D12 | 네트워크 끊김 | 빈 화면 없이 최근/기본 예보 안내 표시 | 미검증 | 최신 빌드 기준 오프라인 상태 QA 미실행 |
| D13 | 알림 신뢰성 | 알림 권한 허용 후 테스트 알림 예약, 5초 내 수신, 알림 탭 딥링크, 앱 재실행 후 예약 상태 확인 | 보류 | 알림 권한 허용, 권한 정상/예약 완료/예약 1건, 테스트 알림 1건 발송 예약, 앱 단독 crash/log 오류 없음 확인. 시스템 알림 수신/알림 탭 딥링크는 다른 앱 알림 노출 위험 때문에 자동 확인 보류 |

## 4. 결과 반영 방법

실기기 QA가 끝나면 `docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json`에 결과를 채운 뒤 실행한다.
`easBuildId`는 `802540a2-77a2-40cb-9b3b-15d9b3984ae2`, `appVersion`은 `0.1.0 (5)`과 일치해야 한다.

```bash
npm run sync:android-device-qa-env
npm run apply:android-device-qa-results
npm run report:android-release-action-board
```

새 템플릿이 필요할 때만 `npm run prepare:android-release-local-files -- --force`를 사용한다. `--force`는 기존 local QA 결과를 덮어쓴다.

## 5. 다음 단계

1. D1~D6 모두 통과 시 스토어 스크린샷 5장 캡처
2. D7~D13 실패/보류 항목은 같은 build id로 원인 기록
3. 스크린샷 완료 후 `npm run check:android-store-screenshots-ready`
4. Play Console 입력값 확정 후 `npm run apply:android-store-inputs`
