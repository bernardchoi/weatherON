# 경로 계산 연결 검증 — 2026-10-30

기준: `d16ae98fc92f210ae2bae02f1d5c471e0847c48c` + 이번 작업의 미커밋 변경임. 기존 미추적 파일은 보존했음. 커밋·push·서버 배포·Xcode Cloud 실행·TestFlight 배포는 하지 않았음.

## 버전별 증거 경계

파일·번들·네이티브 바이너리 SHA-256은 [versions.json](./versions.json)에 고정했음. 동일한 `1.0.0`이나 빌드 숫자로 소스 일치를 판단하지 않았음.

| 대상 | 현재 확인 | 증거로 인정한 범위 |
|---|---|---|
| 로컬 Git / 원격 main | 모두 d16ae98, 이번 소스 변경은 로컬에만 있음 | 이번 자동 검사·로컬 빌드의 기준 |
| 운영 Worker | `/health` 200, 국내 선택시간 대중교통이 `google-transit`, 분 필드만 반환함 | 구형 동작 확인. 최신 경로 구현 적용 안 됨. 배포 커밋은 미확인 |
| 로컬 서버 코어 | d16ae98의 `proxyCore.mjs`를 그대로 사용함 | 모의 upstream 회귀 및 공개 API 응답 재생 검증 |
| 연결된 iPhone | iPhone 16 Pro Max / iOS 27.2 (24B119), 설치 WeatherON 1.0.0 (56) | 설치 버전·실행 확인만. 최신 변경의 실기기 검증으로 합산하지 않음 |
| 로컬 iOS 산출물 | Xcode 27.1 (27A9275), Release 1.0.0 (41), 서명 OFF, 최종 BUILD SUCCEEDED | 앱 JS 번들·Widget 확장 컴파일. 41은 로컬 설정값이며 설치 56과 다른 바이너리임 |
| 브라우저 | 별도 QA 정적 웹 번들·프로필·localhost endpoint 사용함 | 대중교통 선택·홈·재시작 저장 복원. 최종 번들 SHA와 browser-transit.json의 번들 일치 확인 |

운영 응답: [production-probe.json](./production-probe.json). Cloudflare 배포 메타데이터 조회는 인증 정보가 없어 실패했음. 응답 스키마와 제공자 동작은 최신 로컬 구현과 다르며, 특정 운영 커밋을 추정하지 않았음.

## 수정한 결함

1. **홈 일정 전달 시 반복 설정 누락**: 선택 목적지와 Live Activity 소유 목적지의 `destinationSchedule`에 `repeatEnabled`·`repeatDays`가 빠졌음. 공통 계산은 다음 반복일을 선택했으나 홈 모델은 오늘로 재해석해 경로를 거부할 수 있었음. 일정 객체를 그대로 전달하도록 수정했음. 새 이동수단·시간으로 펼친 props가 공통 함수에서 거부된 이전 경로를 다시 유효하게 만들지 않도록 계산 가능 여부도 전달했음.
2. **추정·실패·오프라인·만료 결과의 자동 예약**: 표시용 거리 추정이나 stale 결과도 알림·Live Activity에 넘어갈 수 있었음. 기존 `getDestinationTiming` 계산은 유지하고, 자동 예약에만 `canScheduleTravelEstimate`를 적용했음. 정상 제공자/ready, 유효한 조회·미래 만료시각, stale 아님을 요구함. 메타데이터 없는 레거시 결과는 읽을 수 있으나 새 조회 전 자동 예약하지 않음. 무효화되면 기존 알림 예약을 취소하고 자동 Activity 입력도 null로 내보냄. 위젯 전달 메시지에도 만료·이전 결과를 표시함.
3. **알림 재시도 소진 후 재렌더링 재시작**: 동일 key를 다시 `request`하면 한도 소진 뒤에도 네이티브 호출이 다시 시작됐음. 반복 렌더링이 실패를 무한 재시도로 바꾸지 못하도록 막았음. 새 key·기존 `retry()`·포그라운드 복구는 새 재시도 예산을 받음.
4. **Widget의 절대 날짜 소실**: JS가 보낸 `departureAt`·`arrivalAt`을 Swift decoder가 버리고 `HH:mm`만 표시했음. Codable과 네이티브 날씨 갱신 경로에 절대시각을 보존하고, 목적지 시간대로 같은 날은 시각, 다른 날/연도는 날짜와 시각을 표시함. 예전 payload의 시·분 문자열은 계속 읽음. 새 경로 계산은 추가하지 않았음.

사용자 장소·설정·DB를 삭제하거나 스키마를 변경하지 않았음. 외부 의존성·경로 공급자·임의 배차/대기시간도 추가하지 않았음.

## 연결 추적

| 구간 | 실제 호출/저장 경로 | 확인 |
|---|---|---|
| 계산 | `proxyCore.mjs` → `travelEstimateClient` → `getDestinationTiming` / `resolveTravelTiming` | 초·절대 ISO·선택 요청시각·여유 유지 |
| 저장/복원 | `createDestinationTravelEstimate` → `persistedAppState` → SQLite typed 컬럼 + `travel_result_json` | 실제 Node SQLite로 가산/idempotent 마이그레이션, 저장 목적지·미리보기 round trip 실행 |
| 홈/목적지 | 두 실제 `destinationSchedule` props builder → `buildDemoStateFromWeatherResult`, 목록·상세의 공통 timing | 반복 월요일·다른 편집 대상·공통 계산 거부 결과까지 실행 |
| 로컬 알림 | `getDestinationNotificationTiming` → `notificationSync` → `syncLocalWeatherNotifications` → Expo DATE trigger | 실제 어댑터를 실행하되 Expo OS 경계만 대역 사용함. 트리거 epoch·본문 metadata·취소·동일 ID 교체 확인 |
| 위젯 | 공통 timing → `createWeatheronWidgetLocationSnapshot` → App Group 직렬화 → Swift Codable / 네이티브 날씨 갱신 | JS payload 검사 + 실제 Swift decoder/formatter 실행 + iOS 확장 컴파일 |
| Live Activity | 실제 `buildInput` → 기존 iOS/Android 자동 reconcile → 네이티브 절대 출발시각 | 입력 절대시각·부적합 결과 null·기존 소유권/교체/재시작 회귀 확인. 실제 OS 예약·표시는 아래 미검증임 |

## 회귀 검사 행렬

원래 검사를 재작성하지 않고 빠진 연결 사례를 보완했음. 실행 로그: [checks.txt](./checks.txt).

| 요구 사례 | 검사와 결과 |
|---|---|
| 출발 08:00 + 2,400초 = 도착 08:40 | 기존 공통 계산 실행 PASS |
| 목표 09:00 / 2,400초 / 여유 600초 = 출발 08:10 / 도착 08:50 | 기존 계산·SQLite·화면 모델·Activity 입력 PASS. 알림 lead 60분이면 DATE 07:10으로 일치 |
| 자정·월말·연말·반복 요일·시간대 | 기존 공통 검사 PASS. 두 실제 홈 props의 월요일 전달 추가 PASS. 실제 Swift 23:50→다음 날 00:30, Seoul/Tokyo/Los Angeles 및 레거시 시각 PASS |
| 지난 권장 시각 | 오늘/기존 목표 유지와 지금 출발 ETA 분리 PASS. 과거 알림/Activity 예약하지 않음 |
| 소요시간 증가·감소·진동 | 서버 제한 탐색의 선택 응답 동일성 기존 PASS. 3,000→1,800→2,400→3,000→2,400초로 알림 DATE 교체와 Activity 입력 일치, 예약 1건 유지 추가 PASS |
| 빠른 설정 변경 | 실제 요청 effect 정리·늦은 응답 거부 기존 PASS. 거부한 경로가 홈 props에서 살아나지 않음 추가 PASS |
| 캐시 만료·오프라인 | 실제 서버 캐시 만료/stale/복구 및 앱 effect 실패 근거 보존 PASS. stale·만료 경로 자동 예약 차단 추가 PASS |
| 앱 재시작·기존 DB | 실제 SQLite 가산/idempotent·기존 typed 데이터/조회시각 유지 PASS. 브라우저 저장 복원은 별도 증거 |
| 실패/거리 추정을 정상처럼 예약하지 않음 | error, fallback, ready+fallback provider, stale, 만료, 조회시각/만료 없는 레거시를 실제 모델과 Activity builder로 검사 PASS |
| 알림 재시도 한도 | 동일 key 재렌더링은 4회(최초+재시도 3회)에서 정지, 명시적 retry와 새 key는 재개 PASS |

기존 shared fixture의 `provider=fallback,status=ready` 가짜 정상 값을 정상 Kakao 제공자와 명시적 조회·만료시각으로 수정했음. 기대 예약시각을 완화하지 않았음.

추가로 shared, review-regressions, ios-reliability, correctness-batch, Home outing, widget-sync, Widget Swift 168건, Live Activity, Activity intent, Android live-update, departure-push, TypeScript 검사와 diff 공백 검사를 통과했음. Android 검사는 정적/경계 대역이며 Android APK·실기기 증거가 아님.

## 공식 API 표본과 브라우저

[카카오 공식 공개 REST 명세](https://developers.kakao.com/docs/ko/kakaomap/rest-api)를 10/30 재확인했음. `publictraffic` 요청은 좌표·명칭이며 `totalTime`은 초임. 임의의 배차·대기·선택 시간대 데이터를 추가하지 않았음.

공개 장소 성수역→서울역 표본으로 운영 서버 1회와 현재 로컬 키의 공개 대중교통 API 1회만 명시적 대조했음. 직접 호출은 HTTP 200/OK, 선택 경로 1,518초·9,466m·환승 1회였음. 정제 자료: [live-transit.json](./live-transit.json). 이 API 접근 성공은 잔여 쿼터·과금·제휴 권한 확인을 뜻하지 않음.

브라우저 초기 탐색에서 기존 Metro 캐시/기존 프로필과 구형 운영 endpoint가 섞일 가능성을 발견했음. 그 결과는 최신 연결 증거로 사용하지 않았음. 초기 브라우저 탐색의 정확한 외부 호출 총수는 계수하지 못했음. 이후 `EXPO_NO_DOTENV=1`, QA-only endpoint/token, 별도 정적 export와 격리 프로필로 분리했음. 최종 번들에 운영 endpoint가 없음을 확인했음. 최종 검증 번들은 `index-73241cd89705cb0d18032d8e9433d098.js`이며, `browser-transit.json`과 `versions.json`의 번들/소스 파일 해시가 일치함. 재생 시각의 updatedAt/expiresAt은 로컬 코어의 QA 응답 생성·캐시 시각이며 실제 upstream 재조회시각이 아님. 경로 upstream은 저장한 공개 응답만 재생하고 다른 upstream은 거부했으므로 이 단계에는 외부 경로 API 호출이 없음.

In-app browser의 CDP 시간초과가 반복돼 복구를 시도한 후 Puppeteer/설치된 Chromium으로 DOM과 반복 캡처를 검증했음. 브라우저는 지원되는 모션 감소·투명도 감소 설정으로 시작 애니메이션을 제외했음. 일반 모션의 릴리스 웹 시작/탭 전환에서는 입력이 누락되는 탐색이 있었고 이 부분은 경로 계산 PASS에 합산하지 않았음. 최종 흐름은 출발 탭→상세→이동수단 시트→대중교통 선택→저장 확인→페이지 재시작→홈 표시·저장 복원 순서로 완료했음. 브라우저의 날씨는 실패/fallback fixture이며, 실시간 날씨 품질이나 네이티브 알림 성공 증거로 사용하지 않았음.

- [브라우저 응답·표시·저장/복원 기록](./browser-transit.json)
- [대중교통 선택 후 상세 390px](./browser-transit-selected-390.png)
- [홈 390px](./browser-transit-home-390.png)
- [재시작 복원 390px](./browser-transit-restored-390.png)

표본의 출발 18:00 + 1,518초 = 18:25:18임. 화면의 도착 시각은 분 표시 18:25, 이동시간은 올림 26분임. 이 표시 차이는 초를 버린 재계산이 아님. 시간대 미반영·운행/대기 확인 필요 문구와 선택 상태·저장 복원도 기록했음. 알림 일정 17:00은 출발 60분 전의 계획 표시이며, 권한 OFF인 브라우저에서 실제 예약 성공을 의미하지 않음.

실제 이동 기록은 측정하지 않았음. API 응답·계산·표시 일치를 실제 이동 정확도·정시 도착 보장으로 표현하지 않음.

## 내부 TestFlight 적용 순서·호환성·복구

1. **기준 고정**: 이번 변경만 별도 검토·커밋하고 파일 해시를 재기록함. 배포 권한이 생기면 Worker 배포 ID·소스 커밋·바인딩/마이그레이션 이력·되돌릴 이전 version ID부터 조회함. 현재 운영 소스가 미확인이므로 바로 덮어쓰지 않음.
2. **서버 먼저 격리 적용**: d16ae98 서버 코어를 내부 QA 전용 Worker에 적용하고 HTTPS endpoint를 고정함. 인증·App Attest·쿼터 정책을 유지함. route 변경 자체는 D1 마이그레이션이 필요하지 않으므로 무관한 원격 마이그레이션을 실행하지 않음. 명시적 공개 표본 1~2개로 새 필드·provider·오류·캐시 형태를 확인함. 상시 호출/모니터를 만들지 않음.
3. **앱 후보**: 해당 QA HTTPS endpoint를 Xcode Cloud의 환경에 지정함. `WeatherON` Release Archive, 기존 서명 capability/App Group 확인, 사용하지 않은 build number 확인 후 빌드함. `ci_pre_xcodebuild.sh`·`ci_post_xcodebuild.sh` 환경/서명 검사를 통과해야 함. iOS EAS Build/Submit은 사용하지 않음.
4. **내부만 배포**: Xcode Cloud Archive의 **TestFlight (Internal Testing Only)** 선택 후 post-action을 기존 내부 tester group에만 연결함. App Store Connect에서 빌드의 Internal 표시·처리 완료·그룹 할당·실제 TestFlight 설치 버전을 각각 확인함. 외부 그룹·공개 링크·Beta App Review·App Store 제출은 수행하지 않음. Apple 근거: [Xcode Cloud actions](https://developer.apple.com/documentation/xcode/configuring-your-xcode-cloud-workflow-s-actions), [내부 테스터](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers).
5. **조합 고정**: 각 시험에 앱 build/commit, Worker version/commit/endpoint, 기기 OS, 목적지 시간대, 요청/결과의 초·절대시각·조회/만료시각을 함께 기록함. 설치 56이나 구형 운영 결과를 새 후보의 PASS로 복사하지 않음.
6. **운영 적용**: 아래 내부 시험을 통과한 동일 서버/앱 조합만 운영 적용 대상으로 삼음. 운영 서버를 먼저 적용한 뒤 앱을 순차 적용함. 기존 앱은 분 필드를 계속 읽지만 초·근거·새 보호 조건은 제공하지 않으며, 구형 앱의 도보 환산/시간 처리는 이 서버 배포만으로 수정되지 않음. 새 앱+구형 서버는 조회·만료 정보가 없어 목적지 자동 예약을 차단하므로 서버 선적용이 필요함.
7. **복구**: 먼저 내부 build 자동 배포/그룹 할당을 중단함. 문제가 서버에 있으면 기록한 Worker version으로 롤백함. 앱 문제면 테스트 가능한 이전 내부 빌드가 남아 있는지 확인 후 복원하고, 없으면 이전 소스를 Xcode Cloud에서 새 내부 빌드로 빌드함. 앱/서버는 함께 원래 검증 조합으로 돌림. SQLite/App Group 데이터 삭제나 컬럼 제거는 하지 않음. 구형 앱이 JSON 메타데이터를 잃어도 typed 데이터는 유지되며 새 앱은 재조회 전 자동 예약하지 않음. 재실행해 OS 예약·Activity가 이전 의도와 일치하는지 확인함. 이미 OS에 등록된 알림은 서버 롤백만으로 취소되지 않음.

## 내부 TestFlight 실기기 시험표 — 실행 전

전제: Xcode Cloud 내부 전용 후보 + 적용 확인된 QA Worker 조합임. 로컬 unsigned 산출물을 설치하거나 기존 56을 최신 후보로 취급하지 않음. 아래는 현재 모두 **미실행**임.

| ID | 조작 | 필수 대조 / 통과 기준 |
|---|---|---|
| TF-01 | 새 후보 설치·실행 | TestFlight build, commit, OS, Worker version/endpoint 고정. 56과 분리 |
| TF-02 | 출발 기준 공개 경로 | D를 초로 기록, 홈·상세·목록·Widget의 S/S+D 일치. 08:00/2,400초 기준은 자동 고정 fixture PASS와 구분 |
| TF-03 | 도착 목표·여유 | A/B/D/S/ETA 초 대조. 09:00/40분/10분 고정 fixture 기대 08:10/08:50. 실제 API의 D가 다르면 그 응답으로 계산 |
| TF-04 | 알림 허용, lead 설정 | 실제 pending OS DATE trigger epoch와 S−lead 대조. 화면 계획 문구/예약 개수만으로 통과 처리하지 않음. readback 확보가 안 되면 미확인 유지 |
| TF-05 | 짧은 미래 출발, 전경→잠금 | 예약 시각과 실제 수신 시각을 따로 기록. OS 지연 포함, 중복 0, 올바른 목적지·본문·딥링크 |
| TF-06 | Widget 저장·picker·홈 렌더링 | App Group의 절대시각/조회시각, 실제 선택 Widget의 장소·날짜·시각 대조. 갱신 뒤에도 유지 |
| TF-07 | Activity 미래 예약·시작·종료 | native scheduled/active departureAt·표시·실제 시작/종료 시각 기록. push 자동 종료 등록 성공/실패도 분리 |
| TF-08 | 자정·요일·시간대 | 다음 날 도착 날짜, 반복 다음 월요일, Seoul/Tokyo/Los Angeles. 기기 시간대를 바꾸면 원래 값 기록 후 복원 |
| TF-09 | 지난 권장 시각 | 임의 다음 날 이동 없음, 지금 출발 ETA 분리, 과거 예약 0 |
| TF-10 | 느린 응답 중 시간/수단/목적지 빠른 변경 | 최신 설정만 저장·표시·예약. 이전 알림/Activity 제거, 다른 소유 목적지 보존 |
| TF-11 | D 증가·감소·진동 | QA 고정 응답으로 OS 예약·Activity 시각 변경과 중복 0 확인. 실제 API 예측 변동과 구분 |
| TF-12 | 캐시 만료·오프라인·복구 | 이전 결과 표시, 잘못된 새 예약 0, 전경에서 기존 예약 취소·재조회. 장기 백그라운드는 별도 기록 |
| TF-13 | 기존 DB 업그레이드·재실행 | 기존 장소·요일·시간·설정 유지, 조회시각 조작 없음, 레거시 재조회 전 자동 예약 0 |
| TF-14 | 공개 transit 실패 / drive·walk 거리 추정 | 정상 경로로 오표시하지 않음. 목적지 자동 알림·Activity 예약 0. 성공 복구 후에만 예약 |
| TF-15 | 15분 이상 백그라운드·강제 종료 후 재실행 | 경과시간·네트워크·앱 상태별 실제 관찰값 기록. 자동 갱신/전달 보장 주장 금지 |
| TF-16 | 원래 설정으로 복원 | 사용자 일정·알림·Widget 선택 복원 후 pending 예약·Activity 재대조 |

브라우저 최종 실행 시각은 2026-10-30 17:14 KST이며 선택 시트가 닫힌 상세 화면, 재시작 홈, 저장 복원까지 확인했음. 임시 Metro·재생 서버·정적 서버는 종료했고 mobile `.env.local`은 수정하지 않았음.

현재 남은 P1은 동일 새 후보/서버 조합의 **실제 OS 예약 readback·수신·Widget 렌더링·Activity 동작·장기 백그라운드**임. 컴파일·대역 검사·브라우저 캡처로 이 항목들을 통과 처리하지 않았음.
