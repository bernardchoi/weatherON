# WeatherON API 연동 대기목록

> 목적: 단계별 빌드 중 아직 키/계정/약관 확인이 필요한 API를 별도 추적한다. 현재 빌드를 막지 않는 항목은 fixture 또는 고정값 fallback으로 유지한다.

## 현재 활성

| API | 상태 | 사용 위치 | 비고 |
|---|---|---|---|
| KMA 단기예보 조회서비스 | 활성 | 서버 weather proxy, live smoke | Decoding 서비스키 사용. `WEATHERON_PROXY_SMOKE=1`, `WEATHERON_LIVE_SMOKE=1` 통과. 계속 사용하려면 공공데이터포털에서 활용기간 연장신청 필요 |
| Kakao Local API | 활성 | `/places/search?countryCode=KR` | 국내 장소 검색 우선 provider. `WEATHERON_PLACE_SMOKE=1` 통과. REST API 키는 서버 환경변수/Secret Manager에만 보관 |
| Open-Meteo | 활성 | 글로벌/보조 날씨 | 별도 키 없음. 서버 adapter 경유. `WEATHERON_PROXY_SMOKE=1`, `WEATHERON_LIVE_SMOKE=1` 통과 |

## 추후 키 필요

| API | 필요 시점 | 용도 | 현재 fallback |
|---|---|---|---|
| Google Maps Geocoding API | 해외 목적지 검색 실제 연동 시 | 해외 장소 검색, 좌표 변환 | 키 없으면 fixture 결과 유지. 현재 place smoke는 fixture fallback 기준 통과 |
| Google Places API | 해외 POI 검색 품질 고도화 검토 시 | 세밀한 POI 검색, 장소 후보 품질 개선 | Google Maps Geocoding 우선 |
| Kakao Directions API | Phase 2 출발시간 역산 고도화 시 | 국내 목적지 소요시간 계산 | 고정 소요시간/룰 기반 안내 |
| Google Routes API | 해외 이동시간 고도화 검토 시 | 해외 도시/공항 이동시간 | 고정값 처리 |
| T-map API | Phase 4 국내 정밀 소요시간 검토 시 | 국내 주행/대중교통 소요시간 정밀화 | Kakao Directions 또는 고정값 |
| Firebase/Cloud Functions/Secret Manager | 계정·동기화·운영 배포 시 | 서버 adapter, Secret 보관, 계정 동기화 | 로컬 상태/로컬 proxy |
| AdMob | 광고 배치 실제 심사 전 | 배너/네이티브 광고 | mock slot |
| Google Play Console / EAS Submit 권한 | Android 프로덕션 제출 시 | AAB 업로드, 내부/폐쇄 테스트, 프로덕션 배포 | EAS Build 산출물 수동 업로드 |
| Google Calendar API | 프리미엄 캘린더 연동 시 | 코디 캘린더, 일정 기반 알림 | 앱 내부 일정 상태 |
| TourAPI 4.0 | 도보여행 코스 DB 확장 시 | 걷기 코스/관광지 데이터 | 기획 데이터/fixture |

## 운영 규칙

- API 키는 `EXPO_PUBLIC_*`로 저장하지 않는다.
- 앱은 외부 provider 키를 직접 보유하지 않고 서버 adapter의 정규화 결과만 받는다.
- 새 API가 필요해지는 화면을 구현할 때 이 문서에 API명, 필요 시점, fallback, 키 발급 담당 상태를 먼저 추가한다.
- 키가 없어도 화면 빌드와 QA가 가능해야 하며, provider-backed smoke는 키 확보 후 별도 실행한다.
- KMA 키는 만료 전 연장신청이 필요하므로 운영 캘린더에 만료 30일 전, 7일 전 알림을 둔다.
- Android 출시 준비와 테스트/심사 프로세스는 `docs/architecture/WeatherON_ANDROID_출시_준비_프로세스.md`에서 추적한다.
