# WeatherON Android Device QA Packet

> 생성일: 2026-07-20
> 목적: 최신 Android preview APK를 실기기에 직접 설치하고 D1~D13 QA를 바로 수행할 수 있게 한 장으로 정리한다.

## 1. 설치 대상

| 항목 | 값 |
|---|---|
| EAS build id | `N/A - local Gradle release APK` |
| Build 상태 | LOCAL BUILD SUCCESS |
| Version | `1.0.0 (10)` |
| 소스 기준 Version | `1.0.0 (10)` |
| QA 대상 일치 | 일치 |
| Build 링크 | N/A |
| APK artifact | apps/mobile/android/app/build/outputs/apk/release/app-release.apk |
| ADB 연결 | 가능 |
| ADB 설치 상태 | 설치됨 |
| 실기기 QA 미검증 | 1 |
| 스토어 스크린샷 issue | 0 |

## 2. 실기기 직접 설치

> 주의: 현재 APK는 qa-local release APK다. EAS `qa` artifact가 필요하면 `npm run build:android:qa`로 별도 생성한다.


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
| D1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 통과 | 기존 서명 불일치 앱 삭제 후 ADB install 완료, 패키지 com.mvp.weatheron 설치 확인 |
| D2 | 첫 실행 | 크래시 없이 온보딩 진입 | 통과 | qa-local APK 1.0.0 (10) COLD launch `TotalTime=205ms`, MainActivity foreground, crash buffer 0 lines |
| D3 | 내부 문구 노출 | `H1`, `Guest`, `READY`, `OUTER` 같은 개발 문구 미노출 | 통과 | 홈/코디/출발/MY/스마트 알림 설정 캡처 기준 route/dev label 미노출 |
| D4 | 홈 진입 | 홈 카드, 코디, 우산, 알림, 하단탭 표시 | 통과 | 홈 카드, 현재 날씨, 목적지 기준 카드, 하단탭 렌더링 |
| D4-1 | 하단 탭 IA | 출시 후보 기준 `홈/코디/출발/MY` 표시, `소셜/우산/강수` 직접 탭 없음 | 통과 | 하단 탭 홈/출발/MY 구성 확인, MY 탭과 알림 설정 진입 확인 |
| D4-2 | 핵심 클릭 흐름 | `npm run check:android-core-flow` 기준 홈 CTA, 코디 탭 추천/상세/저장/옷장 진입, 하단 탭 가림 없음 | 통과 | 2026-07-20 follow-up에서 코디 목록 -> 상세 -> 저장 완료 -> 목록 복귀 확인. 하단 CTA/탭 가림 없음 |
| D4-3 | 홈 목적지 카드 | 상단 현재 위치 날씨, 하단 목적지 선택 카드, 목적지 기준 `나갈 시간/비 그침/챙길 것` 카드 표시 | 통과 | local release APK 재빌드/재설치 후 실기기 홈에서 현재 위치 날씨, 목적지 선택 카드, 목적지 정보 3개 카드 확인. 캡처 `/tmp/weatheron-qa-home.png`, UI tree `/tmp/weatheron-ui-home.xml` |
| D5 | 상태 저장 | 앱 완전 종료/재실행 후 온보딩/설정 상태 유지 | 통과 | qa-local APK 1.0.0 (10) 재설치 후 기존 목적지/권한/MY 버전 상태 유지 |
| D6 | Android 뒤로가기 | 주요 화면에서 예상 경로로 복귀 | 보류 | 2026-07-20 회차에서 별도 back flow 미수행 |
| D7 | 위치 권한 허용 | 현재 위치 또는 fallback 메시지 표시, 크래시 없음 | 통과 | `POST_NOTIFICATIONS`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` granted 확인. 앱 크래시 없음 |
| D8 | 위치 권한 거부 | 앱 사용 가능, 수동 위치/목적지 흐름 유지 | 통과 | ACCESS_FINE_LOCATION/COARSE_LOCATION revoke 후 홈이 `기본 위치 서울`, `수동`으로 유지. crash buffer 0 lines. 테스트 후 권한 복구 |
| D9 | 목적지 검색 | 1순위 국내 장소(Kakao Local 또는 fallback) 검색·저장 확인 후 2순위 해외 장소(Google 또는 fallback) 보조 확인 | 통과 | `Jamsil` 검색 결과에서 `잠실야구장` 선택, `목적지 저장하고 비교` 활성, 저장 후 상세/비교 화면 확인. 테스트 목적지 삭제 완료 |
| D10 | 화면 밀도 | 작은 화면에서 가로 overflow/버튼 잘림/하단 탭 CTA 가림 없음 | 통과 | 1084x2412 실기기 화면에서 홈/코디/출발/MY/알림 설정 주요 카드와 하단 탭 가림 없음 |
| D11 | 다크/라이트 | 텍스트 대비와 버튼 상태 정상 | 통과 | `cmd uimode night yes`에서 홈 텍스트/카드/하단 탭 대비 정상, crash buffer 0 lines. 테스트 후 light mode 복구 |
| D12 | 네트워크 끊김 | 빈 화면 없이 최근/기본 예보 안내 표시 | 통과 | Wi-Fi/data off 후 active default network none. 홈 빈 화면 없음, `최근 예보로 유지 중`/`최근 예보` 표시. 테스트 후 Wi-Fi/data 복구 |
| D13 | 알림 신뢰성 | 알림 권한 허용 후 테스트 알림 예약, 5초 내 수신, 알림 탭 딥링크, 앱 재실행 후 예약 상태 확인 | 통과 | qa-local APK에서 `개발용 알림 QA` 패널 노출. 테스트 알림 5초 내 `weatheron:test:M2:*` 게시, shade 노출, 알림 탭 후 M2 복귀와 `탭 확인됨` 반영 |
| D14 | 이동수단 드롭다운 | G2에서 이동수단 드롭다운 표시, 수단 선택 즉시 리스트 닫힘, 선택값/계산식 반영 | 통과 | 실기기에서 `자동/도보/자차/대중교통` 옵션과 `대중교통은 배차/환승 변동 가능` 문구 확인. `도보` 선택 후 버튼이 `이동수단 도보, 선택 목록 열기`로 돌아오고 옵션 노드 잔존 없음. 캡처 `/tmp/weatheron-qa-g2-transport-open.png`, `/tmp/weatheron-qa-g2-transport-after.png` |

### D9 목적지 검색 상세 케이스

| 우선순위 | 입력 | 기대 결과 | 판정 증거 |
|---|---|---|---|
| 1 | `잠실` | 국내 장소 결과 표시, 주소/국가/카테고리 확인 가능 | 결과 카드 선택 후 `목적지 저장하고 비교` 활성 |
| 1 | `잠실 야구장` | 국내 별칭 검색 결과 표시 | 저장 후 출발 목록/상세에서 같은 목적지 유지 |
| 2 | `Tokyo Station` | 일본 장소 결과 표시 | 국가/주소/시간대가 해외 장소로 보임 |
| 2 | `도쿄 역` | 한국어 해외 별칭 검색 결과 표시 | 결과 선택 및 저장 가능 |
| 2 | `東京駅` | 현지어 검색 결과 표시 | 결과 선택 및 저장 가능 |
| 2 | `센트럴 파크` | 일반 해외 장소 결과 표시 | 결과 선택 및 저장 가능 |

> QA 기준은 국내 장소를 먼저 확인하고 해외/현지어는 보조 확인한다. 이 기준은 테스트 순서일 뿐 앱 화면 문구로 노출하지 않는다.

### D13 알림 신뢰성 상세 케이스

| 단계 | 기대 결과 | 판정 증거 |
|---|---|---|
| 권한 허용 | Android 알림 권한 허용 후 M2에서 권한 정상 표시 | M2 권한 태그, Android 앱 알림 권한 상태 |
| 테스트 발송 | 테스트 알림 버튼 탭 후 예약/발송 이력 표시 | 최근 이력에 `WeatherON 테스트 알림` 또는 발송 상태 기록 |
| 5초 수신 | 5초 내 시스템 알림 수신 | 알림 shade 또는 lockscreen 알림 캡처 |
| 딥링크 | 알림 탭 시 M2 알림 설정으로 이동 | 앱 foreground 전환과 M2 도착 확인 |
| 재실행 | 앱 재실행 후 예약 상태/이력 표시가 깨지지 않음 | M2 재진입 후 빈 화면/중복 예약 없음 |

## 4. 결과 반영 방법

새 preview build 생성 후 실기기 QA가 끝나면 `docs/architecture/WeatherON_ANDROID_DEVICE_QA_RESULTS.local.json`에 결과를 채운 뒤 실행한다.
`easBuildId`와 `appVersion`은 새 preview build 확인 후 갱신된 `WeatherON_ANDROID_BUILD_STATUS.md` 값과 일치해야 한다.

```bash
npm run sync:android-device-qa-env
npm run apply:android-device-qa-results
npm run report:android-release-action-board
```

새 템플릿이 필요할 때만 `npm run prepare:android-release-local-files -- --force`를 사용한다. `--force`는 기존 local QA 결과를 덮어쓴다.

## 5. 다음 단계

1. D6 Android 뒤로가기 follow-up을 같은 build로 별도 확인
2. D1~D6 모두 통과 시 스토어 스크린샷 5장 캡처
3. 스크린샷 완료 후 `npm run check:android-store-screenshots-ready`
4. Play Console 입력값 확정 후 `npm run apply:android-store-inputs`
