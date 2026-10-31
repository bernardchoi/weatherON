# P2 해외 검색·시간대·날씨 경계 검증 — 2026-10-30

기준: 기존 overseas-search/VALIDATION.md, overseas-flow/VALIDATION.md 읽음. Seoul Station 별칭·파리 성공 흐름 재구현 없음. 실제 계정·사용자 목적지·기기 시계 변경 없음. 운영 배포·커밋·푸시 없음.

## 발견 및 수정

1. 한글 일반 해외 장소가 국내 공급자 빈 응답에서 종료됨. 국가를 명시하지 않은 검색은 국내 빈 결과 뒤 Google 조회하도록 수정함. 명시한 KR·JP 필터는 유지함.
2. `Tokyo` 같은 도시명 포함 문구로 Google 국가 필터까지 강제함. 명시적 국가만 필터에 사용하고, 결과의 실제 국가 주소 요소로 KR·JP·GLOBAL 지역을 결정함. 자동 추정과 명시 국가 필터의 검색 캐시도 분리함.
3. 실제 국가가 GLOBAL로 소실됨. 기존 지역 계약은 유지하고 공급자의 ISO 국가를 `countryIsoCode`로 보존함. Google·Open-Meteo 검색, 목적지/선택 장소/수동 위치 SQLite 저장·읽기, 날씨 위치 변환, WeatherKit 국가 요청까지 연결함. 구버전 행은 국가를 추측하지 않음. 세 테이블에 nullable 컬럼만 추가하는 반복 실행 가능한 마이그레이션 사용함.
4. 장소명·주소 일부에 도쿄역 등이 들어가면 역 이름·주소·국가·시간대로 덮어쓸 수 있었음. 일본의 정확한 역 이름만 번역하고 실제 공급자 주소·지역·시간대는 유지함. 단순 도시명 포함 업체를 역으로 바꾸지 않음.
5. Google 부분 일치 도시를 요청한 장소명으로 표시할 수 있었음. `partial_match` 결과는 제외함. 오타 보정 등 일부 제안도 제외되는 한계 있음. [공식 응답 정의](https://developers.google.com/maps/documentation/geocoding/guides-v3/requests-geocoding) 참고함. 시간대 조회 실패도 기존 공급자 fallback 처리에서 잡히도록 await 보완함.
6. DST 시작 때 존재하지 않는 목표 시각이 다른 현지 시각으로 바뀜. 목표를 현지 날짜·시각으로 역검증하고 불일치 시 계산 보류함. 반복 일정은 해당 날짜를 건너뛰고 다음 허용 날짜를 찾음.
7. WeatherKit 시간별 예보가 UTC 오프셋을 버려 DST 종료의 두 01:00 예보가 하나로 합쳐짐. 현지 날짜·시각에 오프셋을 붙여 두 절대 시각을 보존함. 기존 표시용 현지 날짜/시각은 유지함.
8. 경로가 없을 때 지난 목표 시각도 문자열 존재만으로 미래로 판정함. 실제 목적지 목표 절대 시각과 현재 시각을 비교하도록 수정함. 기존 UI 회귀 검사의 누락된 timing 바인딩과 Node 확장자 없는 직접 import도 보완함.

## 실제 공급자 표본

[수정 전](before.json), [수정 후](after.json). 로컬의 현재 서버 핸들러에서 실제 Kakao·Google·Open-Meteo 시간대 API 호출함. 운영 Worker에 배포된 코드 검증은 아님.

| 입력 | 수정 후 관찰 | 판정 범위 |
| --- | --- | --- |
| Cambridge | GB, 52.1951/0.1313, Europe/London | 공급자의 영국 후보 확인함. 모든 동명 도시 열거 보장 아님 |
| Cambridge Massachusetts | US, 42.3666/-71.1057, America/New_York | 수식어에 따른 다른 국가/좌표 보존 확인함 |
| Sydney Opera House | AU, -33.8568/151.2153, Australia/Sydney | 일반 해외 장소 실제 후보 확인함 |
| 시드니 오페라 하우스 | 영문과 같은 place id·좌표·국가·시간대 | 수정 전 빈 결과, 수정 후 실제 후보 확인함 |
| 베를린 중앙역 | DE, 52.5251/13.3694, Europe/Berlin | 수정 전 빈 결과, 수정 후 실제 후보 확인함 |
| Tokyo Station Cafe London | 빈 결과 | 기존 일본 강제 결과 제거함. 필터 해제만 했을 때도 London 도시/도쿄역 부분 일치가 와서 제외함. 실제 카페 검색 성공 아님 |
| zzqv-no-such-place-983742 | 빈 결과 | 허위 국내 장소/추천 결과 없음 |

[실제 날씨·경로](live-weather-routes.json): 시드니 WeatherKit 좌표 -33.86/151.22, 현재 19.77°C, 원본 시간별 250개 확인함. 한국→시드니는 fallback/국가 간 경로 확인 필요임. 응답에 기존 거리 추정 숫자는 있으나 이를 확정 경로로 인정하지 않으며 공통 계산에서 차단함. 도쿄역→도쿄타워 대중교통은 실제 Google `ZERO_RESULTS`로 error/unavailable임. 일본 경로 성공으로 판정하지 않음.

[실제 검색→격리 저장→재읽기→실제 날씨](live-isolated-flow.json): 한글 시드니 후보의 이름·주소·좌표·AU·IANA 시간대가 JSON 저장 정규화 후 그대로 유지됨. WeatherKit 요청에 같은 좌표·AU·Australia/Sydney 전달되고 같은 location id의 weatherkit 예보 반환됨. 별도의 아래 SQLite 시험으로 실제 저장 함수와 DB 재연결도 확인함. 이 JSON 표본의 재읽기를 네이티브 앱 재시작으로 표현하지 않음.

## Fixture·회귀 검사

`node --no-warnings scripts/check-overseas-boundaries.mjs` 통과함. 공급자 장애를 실제로 발생시키거나 기기 시간을 변경하지 않고 주입한 결과임.

- 동명이름 GB/US 두 후보, 도시명 포함 업체, 한글 일반 해외 장소, 부분 일치 도시, 결과 없음, REQUEST_DENIED 뒤 같은 검색 복구 확인함. 장애 fallback은 캐시하지 않음.
- 실제 SQLite 임시 파일에서 구버전 스키마 생성→기존 행 보존→마이그레이션 두 번→검색 후보 저장→연결 종료/재연결→목적지·선택 장소·수동 위치 읽기→날씨 요청 검사함. 사용자 DB 접근 없음.
- 기기 TZ=Asia/Seoul 및 America/Los_Angeles에서 Auckland 현지 자정, New York/Sydney DST gap, New York fold 검사함. New York 2026-11-01 01:30은 기존 변환 규칙대로 첫 발생 05:30Z 사용함. 중복 시각의 두 번째 발생 선택 UI는 추가하지 않음.
- DST fold의 두 01:00 WeatherKit 예보가 각각 05:00Z·06:00Z로 남고 06:30Z에 두 번째 예보를 선택하는지 확인함. 다른 IANA 시간대의 절대 시각 보존은 기존 공유 검사에서도 확인함.
- 목표·출발·도착의 초 단위 관계와 출발 알림의 절대 시각 일치 확인함. 국가 간/일본 ZERO_RESULTS/GLOBAL끼리 fallback에서 출발 계산 없음 확인함.
- 정상 악천후 예보는 예약 후보 생성되는 양성 대조군 포함함. stale·fallback·위치 미확인·다른 장소 예보와 미확인 경로에서는 목적지 알림 active=false, scheduledAt 없음 확인함. 실제 OS 예약/API 발송 시험 아님.
- In-app browser에서도 실제 목표 계산/화면 판정 함수를 추출한 격리 fixture 검사 통과함. [기록](browser-fixture.txt). 앱 화면 전체/실기기 검증과 구분함.

추가 통과: check-shared-rules, check-route-selected-time, check-ios-uiux, check-home-refresh, check-place-search-english, check-cloudflare-worker-proxy, 모바일 TypeScript, git diff --check. [검사 출력](checks.txt).

## 남은 검증·한계

- Geocoding 표본 검사임. 임의 업체 자동완성·동명이름 전체 후보·검색 정확도 비율을 보장하지 않음. 부분 일치 제외로 검색 결과가 줄어들 수 있음.
- 실제 공급자 장애는 fixture로만 검사함. 실제 국가 간 도로 경로의 성공을 입증하지 않음.
- 네이티브 앱 재시작·기기 TZ 변경·실제 OS 알림 예약/수신·장시간 백그라운드·Xcode Cloud/TestFlight 검증 없음. 실제 사용자 데이터 변경을 피하기 위해 격리 저장/DB 재연결 사용함.
- 이번 DST 예보 절대 시각 보존 수정은 WeatherKit 대상임. Android/Open-Meteo 예보의 DST 실동작 검증은 수행하지 않음.
