# WeatherON — MVP 기술 ADR
**Architecture Decision Record**
Version 1.0 · June 2026

---

## 1. 목적

WeatherON MVP 구현 착수 전 모바일 앱 기술스택, 날씨/위치 API, 추천 룰엔진, 백엔드/계정 구조를 확정한다.
본 ADR은 `docs/planning/WeatherON_MVP_기능_PRD.md`의 구현 기준 문서이며, MVP 1차 범위인 A/O/H/C/G1-G2/P/M/R 화면군을 대상으로 한다.

---

## 2. 결정 요약

| 영역 | 결정 | 상태 |
|---|---|---|
| 앱 프레임워크 | React Native + Expo Dev Client + TypeScript | 채택 |
| 1차 출시 플랫폼 | Android 우선, Google Play 기준 | 채택 |
| 날씨 API | 한국 KMA, 일본/글로벌 Open-Meteo | 채택 |
| 위치/장소 API | 한국 Kakao Local + T-map 전환 검토, 글로벌 Google Maps Platform | 채택 |
| 룰엔진 | TypeScript deterministic rule engine | 채택 |
| 백엔드 | Firebase/Google Cloud 기반 | 채택 |
| 계정 | Firebase Auth + Cloud Functions auth broker + OAuth2/OIDC PKCE | 채택 |

---

## ADR-001. 모바일 앱 프레임워크

### Context

WeatherON은 iOS/Android 동시 출시가 필요하고, 현재 목업과 문서화된 UI 설계가 React 기반으로 구성되어 있다.
MVP 핵심은 복잡한 3D/게임 렌더링보다 날씨 데이터, 추천 카드, 저장/알림, 권한 상태 복구를 안정적으로 제공하는 것이다.

### Decision

`React Native + Expo Dev Client + TypeScript`를 채택한다.

- Expo Go가 아니라 Expo Dev Client/EAS 기준으로 개발한다.
- 푸시, 딥링크, 소셜 로그인, 네이티브 권한, 앱 아이콘/스플래시 검증은 Dev Client 빌드에서 확인한다.
- TypeScript를 앱, shared 룰엔진, Cloud Functions에서 공통 사용한다.

### Alternatives

| 대안 | 판단 |
|---|---|
| Flutter | UI 성능과 크로스플랫폼 안정성은 좋지만 기존 React 목업/TypeScript 룰 재사용성이 낮다. MVP 1차에서는 제외한다. |
| Native iOS/Android | 품질은 높지만 초기 구현 비용과 동시 출시 비용이 크다. MVP 범위에 맞지 않는다. |

### Consequences

- 목업의 React 컴포넌트 구조와 디자인 토큰을 실제 앱으로 옮기기 쉽다.
- 추천 룰과 데이터 정규화 로직을 TypeScript shared 모듈로 유지할 수 있다.
- 네이티브 기능은 Expo Dev Client 기준으로 검증해야 하므로 Expo Go만으로 QA하지 않는다.
- Android 우선 출시 준비와 진행 상태는 `docs/architecture/WeatherON_ANDROID_출시_준비_프로세스.md`에서 관리한다.

---

## ADR-002. 날씨/위치 API

### Context

WeatherON 추천 품질은 현재 위치/목적지 날씨, 강수, 바람, 체감온도, 시간대별 예보의 안정적인 정규화에 달려 있다.
한국, 일본, 일반 해외를 1차 제공 범위로 두고 중국권 등 특수 네트워크/인증 환경 국가는 제외한다.

### Decision

날씨 데이터는 한국과 글로벌을 분리하고, 앱 내부에서는 모두 `WeatherSnapshot`으로 정규화한다.

| 범위 | 1차 API | 역할 |
|---|---|---|
| 한국 날씨 | 기상청 단기예보 조회서비스(KMA/공공데이터) | 현재/초단기/단기 예보 |
| 일본/글로벌 날씨 | Open-Meteo | 현재/시간별/일별 예보 |
| 한국 장소 검색 | Kakao Local | 국내 장소/주소 검색 |
| 글로벌 장소 검색 | Google Maps Geocoding | 해외 목적지 검색 |

비용 기준은 `docs/architecture/WeatherON_MAP_PROVIDER_COST_COMPARISON.md`를 따른다. Google Maps는 Mapbox보다 Geocoding 단가가 높지만 해외 POI 품질과 장소 데이터 신뢰도를 우선해 1차 provider로 유지한다. Mapbox는 기본 스택이 아니라 월 Google Maps 비용이 커질 때 검토하는 비용 절감 대안으로만 둔다.

### Data Flow

1. 앱이 현재 위치 또는 목적지 좌표를 요청한다.
2. Cloud Functions weather adapter가 국가/좌표 기준으로 KMA 또는 Open-Meteo를 호출한다.
3. 원본 응답을 `WeatherSnapshot`으로 정규화한다.
4. 정규화 결과를 캐시하고 앱, 룰엔진, 알림 작업이 같은 구조로 사용한다.

### 체감온도 정규화

- Open-Meteo는 원본 `apparent_temperature`를 사용한다.
- KMA 단기예보는 체감온도 필드가 없으므로 `TMP`·`REH`·`WSD`로 계산한다. 겨울은 풍속 기반 풍랭, 여름은 기온 27℃ 이상·습도 40% 이상에서만 열지수를 적용한다.
- 열지수는 그늘·무풍 환경의 극한값이므로 격자 예보 화면에서는 실제 기온보다 최대 6℃까지만 높게 표시한다. 예: 34℃·습도 70%·풍속 2.9m/s는 기존 46.8℃ 대신 40.0℃로 표시한다.

### Fallback

- API 실패 시 마지막 성공 캐시를 표시하고 `stale=true`를 부여한다.
- 캐시가 없으면 기본 위치 날씨와 수동 위치 검색 CTA를 제공한다.
- 목적지 날씨만 실패하면 현재 위치 추천은 유지하고 목적지 재시도만 분리한다.
- 시간별 예보가 없으면 현재 날씨 기반 기본 룰로 degrade한다.

### OS Location Permission

- 앱 위치 권한은 `expo-location` foreground permission으로 요청한다.
- 앱 첫 진입 즉시 권한 팝업을 띄우지 않고 사용자가 `현재 위치`를 선택할 때만 요청한다.
- 권한 허용 시 WGS84 좌표를 KMA 격자로 변환해 현재 위치 날씨를 갱신한다.
- 권한 거부, 위치 서비스 꺼짐, 위치 취득 실패 시 성수동 기준 fallback을 사용하고 상태 메시지로 이유를 표시한다.
- iOS는 `NSLocationWhenInUseUsageDescription`, Android는 `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION`을 선언한다.

### Place Search Adapter

- 앱은 `/places/search?q=` 내부 API를 통해 장소 검색 결과만 받는다.
- 서버는 한국 검색은 Kakao Local 우선, 글로벌 검색은 Google Maps Geocoding 우선으로 확장한다.
- 앱이 `countryCode`를 넘기지 않는 검색은 서버가 검색어 기반으로 KR/JP/GLOBAL을 추정한다.
- 외부 장소 검색 키가 없으면 fixture 결과를 반환해 P1/G1/G2/P3 플로우를 계속 검증 가능하게 한다.
- 검색 결과는 `PlaceSearchResult`로 정규화하고, 선택된 장소의 좌표/카테고리/timezone을 목적지 날씨와 목적지 케어에 반영한다.
- `KAKAO_REST_API_KEY`, `GOOGLE_MAPS_API_KEY`는 서버 환경변수 또는 Secret Manager에만 보관한다.
- 아직 키/계정/약관 확인이 필요한 API는 `docs/architecture/WeatherON_API_연동_대기목록.md`에서 별도 추적한다.
- Google Maps와 Mapbox 비용/키 필요성은 `WeatherON_MAP_PROVIDER_COST_COMPARISON.md`에서 추적한다. 현재 Mapbox 키는 발급하지 않는다.

### KMA API Key 운영

- KMA는 공공데이터포털 `기상청 단기예보 조회서비스` 활용신청으로 발급받은 Decoding 서비스키를 사용한다.
- 해당 서비스키는 계속 사용하려면 공공데이터포털에서 일정 기간마다 활용기간 연장신청이 필요하다.
- 운영 캘린더에 만료 30일 전, 7일 전 알림을 등록하고 만료 전에 연장 상태를 확인한다.
- 연장 누락 또는 키 만료로 KMA 호출이 실패하면 마지막 성공 캐시를 `stale=true`로 표시하고 Open-Meteo/기본 위치 fallback 정책을 따른다.
- 앱 런타임은 KMA 키를 직접 들고 있지 않고 서버 프록시 또는 Cloud Functions weather adapter를 통해 호출한다.
- 로컬 proxy smoke test는 `WEATHERON_PROXY_SMOKE=1 npm run check:weather-proxy`, adapter 직접 smoke test는 `WEATHERON_LIVE_SMOKE=1 npm run check:weather-live`로 확인한다.
- 키는 `apps/server/.env.local`, 서버 환경변수, Secret Manager에만 보관하고 `EXPO_PUBLIC_*` 이름으로 저장하지 않는다.

### Consequences

- 앱은 API 벤더별 필드 차이를 직접 다루지 않는다.
- KMA 격자 좌표 변환, Open-Meteo timezone 처리, Google Maps 결과 저장 정책은 백엔드 adapter에서 관리한다.
- 날씨 API 벤더 변경 시 앱 UI와 룰엔진 영향이 작다.

---

## ADR-003. 추천 룰엔진 구조

### Context

MVP는 “정확한 AI 추천”보다 사용자가 납득 가능한 일관된 판단이 중요하다.
코디, 우산, 신발, 목적지 케어는 모두 날씨 입력과 사용자 선호를 기반으로 즉시 설명 가능한 결과를 내야 한다.

### Decision

`TypeScript deterministic rule engine`을 채택한다.

- 룰엔진은 `shared` 모듈로 분리해 React Native 앱과 Cloud Functions에서 같은 로직을 사용한다.
- MVP 룰은 기온, 체감온도, 일교차, 강수확률, 강수량, 바람, 목적지 카테고리, 스타일 태그, 옷장 보유 여부를 기준으로 한다.
- ML/AI 개인화 추천은 MVP 이후 P2로 미룬다.

### Engine Output

| 출력 | 사용 화면 |
|---|---|
| `OutfitRecommendation` | H1/C1/C4 |
| `UmbrellaRecommendation` | H1/H4/H5/G2/P3 |
| `ShoeRecommendation` | C1/C4/G2 |
| `DestinationCare` | G1/G2/P1/P2/P3 |
| `NotificationRuleEvaluation` | O5/M2/H3 |

### Execution Policy

- 실시간 화면 렌더링용 추천은 앱에서 실행 가능해야 한다.
- 푸시 알림, 예약 작업, 목적지 케어 갱신은 Cloud Functions에서 같은 룰엔진으로 실행한다.
- 룰 버전은 결과 payload에 포함해 추천 이력과 알림 판단을 추적한다.

### Consequences

- 추천 결과를 사용자가 이해할 수 있는 짧은 근거로 표시할 수 있다.
- 초기 데이터가 적어도 프리셋 옷장과 기본 룰로 서비스가 동작한다.
- 룰 변경 시 앱/서버 동시 반영을 위한 버전 관리가 필요하다.

---

## ADR-004. 백엔드/계정 구조

### Context

WeatherON은 Guest 홈 우선 진입을 유지하되, 저장·동기화·알림 확장·이력·구독 같은 기능에서는 계정 연결이 필요하다.
소셜 로그인 제공자는 한국/일본/일반 해외에 맞춰 카카오, 네이버, LINE, Google, Apple, 이메일 코드를 사용한다.

### Decision

`Firebase Auth + Cloud Functions + Firestore + FCM + Secret Manager + App Check`를 채택한다.

- Cloud Functions는 OAuth2/OIDC + PKCE 기반 auth broker 역할을 한다.
- Provider token은 클라이언트로 반환하지 않고 서버에서만 교환·보관·폐기한다.
- 앱은 Firebase Auth session/custom token 기준으로 로그인 상태를 유지한다.
- Firestore는 사용자별 데이터 저장소로 사용하고 Security Rules로 본인 데이터만 접근하게 한다.
- FCM/APNs는 Cloud Functions를 통해 발송한다.
- 제3자 API key와 Provider secret은 Secret Manager에서 관리한다.

### Account State

| 상태 | 저장 위치 | 정책 |
|---|---|---|
| Guest session | 앱 로컬 저장소 | 홈/코디/우산/목적지 미리보기 가능 |
| Account session | Firebase Auth | 저장/동기화/알림 확장 가능 |
| Wardrobe/Destination/Profile | Firestore | 계정 연결 후 영구 저장 |
| Provider token | 서버 전용 | 앱 미노출, 연결 해제 시 revoke |
| Push token | Firestore 사용자 하위 컬렉션 | 알림 권한 동의 후 저장 |

### Security Policy

- 앱 첫 실행에 계정 연결을 강제하지 않는다.
- 계정 필요 액션에서 A2/A3를 호출하고 완료 후 원래 화면으로 복귀한다.
- Firebase App Check로 비정상 클라이언트 요청을 차단한다.
- 모든 서버 함수는 `context.auth.uid`와 요청 userId 일치를 검증한다.
- 계정 삭제 시 Firestore 사용자 데이터, push token, provider 연결 정보를 함께 삭제한다.

### Consequences

- MVP에서 별도 백엔드 서버를 크게 운영하지 않아도 인증, DB, 알림, 서버 작업을 구성할 수 있다.
- Firebase 의존도가 생기므로 비용/쿼터/락인 리스크는 운영 문서에서 추적한다.
- Provider별 세부 로그인 정책은 보안 정책서와 앱스토어 심사 기준에 맞춰 추가 검증이 필요하다.

---

## 3. 구현 기준

- 앱: React Native + Expo Dev Client + TypeScript
- 상태 관리: Zustand 우선 검토, 서버 상태는 query 계열 라이브러리 도입 검토
- 공통 모듈: `shared/weather`, `shared/rules`, `shared/types` 구조 권장
- 백엔드: Firebase Functions for Node.js, Firestore, FCM, Secret Manager, App Check
- 테스트: 룰엔진 단위 테스트, WeatherSnapshot adapter fixture 테스트, auth gate 복귀 시나리오 테스트

---

## 4. 남은 리스크

- KMA 격자 변환과 실시간성 한계는 실제 API 테스트로 보정해야 한다.
- Google Maps Geocoding 결과 저장 정책은 요금제와 약관 확인 후 캐시 정책을 확정해야 한다.
- Firebase 비용은 사용자 수, 날씨 캐시 주기, 알림 배치 빈도에 따라 재산정해야 한다.
- 카카오/네이버/LINE SDK의 Expo Dev Client 호환성은 구현 착수 전 PoC로 확인해야 한다.

---

## 5. 참고 근거

- Expo Development Builds: https://docs.expo.dev/develop/development-builds/introduction/
- React Native New Architecture: https://reactnative.dev/architecture/landing-page
- 기상청 단기예보 조회서비스: https://www.data.go.kr/data/15084084/openapi.do
- Open-Meteo Docs: https://open-meteo.com/en/docs
- Firebase Docs: https://firebase.google.com/docs
- Google Maps Geocoding API: https://developers.google.com/maps/documentation/geocoding

*WeatherON MVP 기술 ADR v1.0 · June 2026*
