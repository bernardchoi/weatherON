# WeatherON 이동·출발·도착 시간 개선 검증

작업 시작일: 2026-10-28 KST. 완료 확인은 2026-10-29 KST에 이어서 수행했음.
기준 Git: main / 17843e0. 기존 미추적 문서·사진 보존했음. 커밋·push·배포·스토어 제출 수행하지 않았음.

## 계산 변경

- 초 단위 durationSeconds와 시간대가 포함된 ISO 절대시각 사용했음. travelMinutes는 호환/표시 필드로 유지했음.
- 출발 기준: 설정 S 유지, 도착 S + D. 준비 P는 이동시간에 포함하지 않음. 기존 앱에는 별도 P 설정이 없어 기본 0으로 처리했으며 공통 함수에서 S - P 검증했음.
- 도착 기준: A - B를 도착 한계로 사용했음. 최종 도착은 S + D이며 목표 A·여유 B와 구분했음.
- 기존 자동 도착 여유 정책(남은 창에 따라 0/5/10/15/20분) 유지했음. API 요청에 보낸 B를 응답·저장에 보존하여 재차 차감하지 않음.
- leadTimeMinutes는 출발 전 알림 시점임. 준비시간이나 이동시간이 아님. 화면에만 있던 출발 40분/10분 전 가상 알림 표시는 실제 리드타임으로 교체했음.
- 자차 도착 역산은 현재 1회 + 미래 후보 최대 5회, 전체 12초, 개별 최대 4초로 제한했음. API 출발시각 해상도인 1분에 맞춰 후보를 내림했음.
- 잔차 A - B - (S + D)로 후보를 앞/뒤 모두 보정했음. 이미 조회한 시각으로 진동하면 더 이른 미조회 1분 후보를 확인했음. 단조성 가정이나 이분 탐색은 사용하지 않았음.
- 조회로 확인한 충족 후보 중 가장 늦은 S와 그 응답의 D·거리를 함께 반환했음. 안전 잔차 0 이상 60초 미만을 분 단위 종료 조건으로 사용했음.
- 호출/시간 예산 소진·부분 실패 시 제한된 탐색을 표시함. 충족 후보가 없으면 실제 현재 조회의 지금 출발 ETA와 지각 가능성을 표시함. 전역 최적이나 정시 도착 보장하지 않음.
- 지난 권장 시각은 목표를 임의로 다음 날로 넘기지 않음. 지난 권장과 지금 출발 ETA를 별도로 계산함. 반복 요일·시간대는 기존 목적지 시간대의 일정 선택 정책을 공통으로 사용함.

## API와 경로

- 국내 자동차 현재/미래는 Kakao Mobility 공개 자동차·미래 운행 정보 API 사용함.
- 국내 대중교통은 Kakao Maps 공개 /v2/routing/publictraffic 우선 사용함. 시간 지정 요청의 국내 Google 우선 분기 제거했음.
- 국내 도보는 공개 /v2/routing/walk 사용함. 자동차 거리/시간 환산을 사용하지 않음. 도보 선택이 자동차 경로 거리 때문에 자동으로 자동차로 바뀌던 동작도 제거했음. 기존 25km 도보 제한은 도보 결과에만 적용함.
- 제휴 /affiliate/publictransit/v1/multimodal/directions는 호출하지 않았음. 계약·가입·API 활성화 변경하지 않았음.
- 대중교통 totalTime을 그대로 사용함. 도보/환승 중복 가산이나 자동차 × 1.25 + 8분 제거했음. 선택 기준은 총 시간, 환승 수, 거리 순임. 기존에 사용자 경로 선택 상태/호출 인자는 없었음. 경로 옵션·단계·차량·정류장·시간·거리·환승 수 보존했음.
- 공개 대중교통·도보 요청에는 공식 명세에 있는 좌표·명칭만 보냄. 날짜·시각 인자가 없음. 대중교통은 경로 소요시간 기준 예상, 시간대 미반영, 운행·대기시간 확인 필요로 표시함. 대기시간 포함 여부·배차·첫차·막차·지연은 확인 사실로 간주하지 않았음.
- 해외 Google 지원 유지했음. 국내 Kakao로 해외 경로를 대체하지 않음. 해외 자동차 도착 목표의 시간대 예측 제한도 유지하여 표시함.
- 도보 실패 시 직선거리/시속 4.5km의 대략 추정임을 표시함. 자동차의 기존 거리 추정도 fallback으로 구분함. 대중교통 실패는 정상 경로/자동차 환산으로 저장하지 않음.

## 실패·캐시·저장·화면 연결

- 좌표 범위/형식, 이동수단, 절대시각 형식·실제 달력 날짜, 출발/도착 동시 입력, 음수/누락/비정상 지표, 성공 코드를 검사함.
- 시간대 예측/현재 교통/시간대 미반영 경로/거리 추정/조회 실패는 timingBasis·status로, 캐시/이전 결과는 cacheStatus로 보존함. 서버 문구를 클라이언트가 현재 교통/미반영으로 덮어쓰지 않음.
- 캐시 키에 좌표·국가·이동수단·절대 설정시각·여유·고정 TIME 옵션·제공자 포함했음. 원래 updatedAt·expiresAt 유지함. 실패 응답 캐시하지 않으며, 실패 시 이전 성공 결과는 stale로 구분함.
- 활성 상태에서 출발 임박(목표가 앞으로 있고 소요시간을 뺀 창이 1시간 미만)은 최대 1분, 나머지는 최대 10분 간격 갱신함. 재진입 시 제한 상태를 초기화함. 오프라인 복구는 재진입/제한된 재시도로 처리함. 백그라운드 상시 갱신을 보장하지 않음.
- 최신 설정을 effect 정리로 구분하여 늦은 이전 응답이 화면·저장을 덮어쓰지 않음. 취소된 진행 중 요청은 같은 설정으로 돌아와도 즉시 재요청 가능함.
- SQLite에 결과 JSON 컬럼을 추가했음. 기존 typed 컬럼·장소·요일·저장 내용 유지함. 레거시 조회시각을 현재 시각으로 만들어 복원하지 않음.
- getDestinationTiming/resolveTravelTiming 결과를 홈·목적지·알림 예약·위젯·Live Activity 입력에서 사용함. 네이티브가 선택된 시각을 별도 재계산하지 않음.
- 위젯 분 표시도 올림으로 통일했음. 실제 예약·카운트다운에는 초 단위 절대시각을 사용함. 출발 표시를 내림하여 표시 때문에 늦은 권장 시각이 되지 않게 했음.
- 영어/일본어 OS 언어 선택 유지했음. 서버 근거 조합 문구도 번역함. 웹 알림 재시도 중 발견한 기본 타이머 receiver 누락도 수정하고 검증했음.

## 실제 API 대조

원본 키/인증 헤더 저장하지 않았음. 공개 장소 좌표만 사용했음. 검증 시각: 2026-10-28T14:33:50.424Z.
초기 권한 확인 4회 + 아래 실행/증거 저장 8회 호출했음. 브라우저 QA 요청은 별도임.

| 사례 | 공급자 | 소요 초 | 호출 수 | 결과 |
|---|---|---:|---:|---|
| drive-current | kakao | 1582 | 1 | HTTP 200 / ready |
| drive-future | kakao | 1506 | 1 | HTTP 200 / ready |
| drive-arrival | kakao | 1769 | 3 | HTTP 200 / ready |
| transit-transfer | kakao-transit | 1872 | 1 | HTTP 200 / ready |
| transit-single | kakao-transit | 192 | 1 | HTTP 200 / ready |
| walk | kakao | 223 | 1 | HTTP 200 / ready |

도착 목표 2026-10-29 09:00 KST, B=600초에서 S=08:20, D=1769초, 도착=08:49:29 KST 확인했음. 도착+B=08:59:29로 목표를 충족했음. 선택한 후보의 API 응답과 시간·거리가 일치했음.
대중교통 선택 경로는 환승 2회와 무환승 각각 확인했음. 도보 실제 경로는 247m/223초였음.
상세 정제 응답과 계산 결과는 [live-api.json](./live-api.json)에 있음. 실제 이동 기록을 측정한 것이 아니므로 실제 오차율·정시 도착 정확도는 주장하지 않음.

공개 기본 쿼터는 자동차 일 10,000회, 미래 운행 일 5,000회, 대중교통/도보 각 일 1,000회로 문서 확인했음. 첫 활성화 앱 등 무료 적용 조건이 있어 이 앱의 실제 잔여 쿼터/과금 상태를 뜻하지 않음. 현재 키의 4종 API 접근 가능 여부는 실제 HTTP 200으로 확인했음. 계정 콘솔의 잔여량·개별 증설·요금 적용 상태는 미확인임.

## 자동 검증

아래 명령 모두 통과했음. 실행 로그: [checks.txt](./checks.txt).

- npm run check:shared
- node --no-warnings scripts/check-route-selected-time.mjs
- node --no-warnings scripts/check-review-regressions.mjs
- node --no-warnings scripts/check-ios-reliability.mjs
- node --no-warnings scripts/check-correctness-batch.mjs
- node scripts/check-home-outing.mjs
- node scripts/check-ios-live-activity.mjs
- node --no-warnings scripts/check-ios-widget-sync.mjs
- node scripts/check-departure-activity-intent.mjs
- node scripts/check-android-live-update.mjs
- node scripts/check-departure-push.mjs
- node scripts/generate-mobile-locales.mjs --check
- npx tsc --noEmit -p apps/mobile/tsconfig.json
- Xcode 27.1 / xcrun swiftc -parse (Widget/Live Activity Swift)
- git diff --check

기존 review-regressions는 수정 전 코드에서도 hydration fixture가 실제 선택 장소/intent resolver를 제공하지 않아 실패했음. fixture를 실제 resolver와 유효한 장소·새 공통 헬퍼의 실제 바인딩으로 보완했으며 최종 통과했음.
핵심 회귀는 08:00+40분, 09:00/40분/여유10분, P 분리, 증가/감소/진동/예산 소진, 선택 후보 응답 일치, 자정/월말/연말/반복/시간대, 과거/동일/근거리, 경로 없음, 401/403/429/5xx/타임아웃/잘못된 응답, 캐시/오프라인/느린 이전 응답/저장 복원, 화면·알림·네이티브 입력 일치까지 실행했음.

## UI 및 배포 경계

In-app browser 우선 사용했음. 홈/목적지/설정 시트, 저장 복원, 지난 일정과 지금 출발 ETA·자정 날짜 표시 확인했음. 최종 390×844 화면에서 실제 미래 운행 API 결과의 출발 09:21, 도착 예상 09:44, 목표 10:05, 여유 20분, 조회 00:01이 홈과 목적지에서 일치했음. 알림 일정 표시도 실제 리드타임에 따른 08:21로 일치했음. 케어 OFF인 브라우저 전용 테스트이므로 네이티브 알림 예약 성공을 뜻하지 않음. 일부 장소/이동수단 선택 입력은 CDP 시간초과가 발생했음. 대중교통의 최종 브라우저 선택 결과는 미확인이나 실제 API·공통 계산·메시지·입력 테스트는 통과했음. 브라우저 캡처는 네이티브 실행 증거가 아님.

- [홈 390px 캡처](./home-live-route-390.png)
- [목적지 390px 캡처](./destination-live-route-390.png)

로컬 프록시 연결 검증을 위한 임시 mobile .env.local 수정은 원본 바이트와 동일하게 복구했음. 원본/복원 SHA-256: 93788e0ba31b7185f6976b513c9a7ff4003904732e68b81a40aed49f078f8029. 검증용 서버 종료했음.
Xcode 27.1 Swift 문법 검사까지 수행했음. 전체 iOS/Android 빌드·서명·실기기 알림·위젯/Live Activity 렌더링·장기 백그라운드 동작은 확인하지 않았음.
배포 후보는 서버와 앱을 함께 적용한 뒤 Xcode Cloud → TestFlight → 실제 iPhone에서 검증해야 함. 새 배포·main push·스토어 제출은 수행하지 않았음.

## 수정 파일

- apps/mobile/ios/WeatherONWidget/WeatherONDepartureLiveActivity.swift
- apps/mobile/ios/WeatherONWidget/WeatherONWidget.swift
- apps/mobile/modules/weatheron-widget-data/android/src/main/java/com/weatheron/widgetdata/WeatherONDepartureNotification.kt
- apps/mobile/src/data/demoState.ts
- apps/mobile/src/localization/locales/en.json
- apps/mobile/src/localization/locales/ja.json
- apps/mobile/src/localization/localization.ts
- apps/mobile/src/providers/appStorage.ts
- apps/mobile/src/providers/notificationSync.ts
- apps/mobile/src/providers/travelEstimateClient.ts
- apps/mobile/src/providers/widgetSnapshot.shared.ts
- apps/mobile/src/screens/DestinationCareScreen.tsx
- apps/mobile/src/screens/DestinationListScreen.tsx
- apps/mobile/src/screens/HomeScreen.tsx
- apps/mobile/src/state/appStateHelpers.ts
- apps/mobile/src/state/appStateTypes.ts
- apps/mobile/src/state/persistedAppState.ts
- apps/mobile/src/state/useWeatherOnAppState.ts
- apps/mobile/src/utils/travelEstimate.ts
- apps/mobile/src/utils/zonedDateTime.ts
- apps/server/src/proxyCore.mjs
- packages/shared/src/rules/destination.ts
- packages/shared/src/types/recommendation.ts
- scripts/check-correctness-batch.mjs
- scripts/check-ios-widget-sync.mjs
- scripts/check-review-regressions.mjs
- scripts/check-route-selected-time.mjs
- scripts/check-shared-rules.mjs
- scripts/generate-mobile-locales.mjs

새 검증 자료: 본 보고서, checks.txt, live-api.json 및 UI 캡처.

## 공식 근거

- [공개 대중교통/도보 REST API와 요청·응답 스키마](https://developers.kakao.com/docs/ko/kakaomap/rest-api)
- [미래 운행 정보 길찾기와 분 단위 departure_time](https://developers.kakaomobility.com/guide/navi-api/future.html)
- [길찾기 공개 API 시작하기](https://developers.kakaomobility.com/guide/navi-api/start)
- [제휴 대중교통 통합 길찾기](https://developers.kakaomobility.com/affiliate/publictransit/multimodal.html)
- [공개 기본 쿼터](https://developers.kakao.com/docs/ko/getting-started/quota)
- [카카오맵 활성화/무료 적용 조건](https://developers.kakao.com/docs/ko/kakaomap/common)
