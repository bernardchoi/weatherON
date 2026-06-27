# WeatherON Android Preview APK QA 체크리스트

> 목적: `npm run build:android:preview`로 생성한 Android APK를 실제 기기 또는 에뮬레이터에서 검증하는 기준을 유지한다.
> 기준일: 2026-06-27

---

## 1. QA 전제

| 항목 | 기준 |
|---|---|
| 빌드 산출물 | EAS `preview` profile APK |
| 빌드 명령 | `npm run build:android:preview` |
| 사전 로컬 게이트 | `npm run check:android-build-ready` |
| 설치 대상 | Android 실제 기기 우선, 필요 시 에뮬레이터 |
| 네트워크 | Wi-Fi/LTE 각각 최소 1회 |
| 위치 권한 | 허용/거부/다시 묻지 않음 케이스 확인 |

---

## 2. 빌드 전 확인

```bash
npm run check:android-build-ready
npm run check:eas-login-state
npm run build:android:preview
```

확인 기준:
- `check:android-build-ready`가 통과해야 한다.
- `check:eas-login-state`가 Expo 계정명을 반환해야 한다.
- `build:android:preview`가 APK 다운로드 링크를 반환해야 한다.

---

## 3. 설치/실행 기본 체크

| 순서 | 항목 | 기대 결과 | 상태 |
|---|---|---|---|
| A1 | APK 설치 | 설치 성공, 경고 후 계속 설치 가능 | 미검증 |
| A2 | 첫 실행 | 앱 크래시 없음 | 미검증 |
| A3 | 앱 아이콘 | WeatherON 아이콘 정상 표시 | 미검증 |
| A4 | 스플래시 | 배경색/아이콘 깨짐 없음 | 미검증 |
| A5 | 다크/라이트 모드 | 텍스트 대비와 주요 버튼 정상 | 미검증 |
| A6 | 앱 재시작 | 이전 저장 상태 유지 | 미검증 |

---

## 4. 필수 플로우

| 플로우 | 화면 | 핵심 확인 |
|---|---|---|
| 온보딩 | O1~O6 | 첫 진입, 지역/목적지 안내, 권한 게이트 이동 |
| 홈 | H1 | 현재 날씨, 코디, 우산, 알림 카드 표시 |
| 계정 게이트 | A2/A3 | 저장 액션 후 원래 화면 복귀 |
| 위치 권한 | O3 | 허용/거부/나중에 설정 모두 앱 중단 없음 |
| 목적지 검색 | P1 | Kakao Local 결과, 선택 후 날씨/케어 반영 |
| 목적지 홈 | G1/G2 | 저장 목적지, 케어 ON/OFF, 공유 상태 반영 |
| 목적지 허브 | P3 | 저장 목록, provider, 상태 pill 정상 |
| 코디 | C1/C2/C3/C4 | 추천/상세/옷장/저장 게이트 연결 |
| 정책 | R1~R7 | 약관/개인정보/광고/알림 문구 표시 |

---

## 5. Android 중점 QA

| 항목 | 체크 기준 | 상태 |
|---|---|---|
| 위치 권한 허용 | 현재 위치 날씨 갱신 또는 fallback 메시지 표시 | 미검증 |
| 위치 권한 거부 | 앱 사용 가능, 수동 목적지 검색 가능 | 미검증 |
| 위치 서비스 꺼짐 | fallback 안내 표시, 크래시 없음 | 미검증 |
| 네트워크 끊김 | 캐시/fallback 상태 표시, 빈 화면 없음 | 미검증 |
| 작은 화면 | 360x800급에서 가로 overflow 없음 | 미검증 |
| 큰 화면 | 430x932급에서 카드 간격/버튼 정상 | 미검증 |
| 앱 백그라운드/복귀 | 상태 유지, 중복 알림/중복 저장 없음 | 미검증 |
| Android 뒤로가기 | 주요 화면에서 예상 경로로 이동 | 미검증 |
| 입력 키보드 | P1 검색 입력 시 버튼/결과 가림 없음 | 미검증 |

---

## 6. API/데이터 QA

| 항목 | 기준 | 상태 |
|---|---|---|
| KMA proxy | 한국 현재 위치/기본 위치 날씨 정상 | 미검증 |
| Kakao Local | 국내 장소 검색 결과 provider `kakao` | 미검증 |
| Open-Meteo | 목적지/해외 fallback 날씨 정상 | 미검증 |
| Google Maps | 키 없으면 fixture/fallback 유지 | 미검증 |
| API 키 노출 | APK 앱 환경에 provider secret 미포함 | 미검증 |

사전 smoke:

```bash
WEATHERON_PROXY_SMOKE=1 npm run check:weather-proxy
WEATHERON_PLACE_SMOKE=1 npm run check:place-search
WEATHERON_LIVE_SMOKE=1 npm run check:weather-live
```

---

## 7. 기록 양식

| 항목 | 값 |
|---|---|
| APK 빌드 링크 |  |
| EAS build id |  |
| 테스트 기기 |  |
| Android 버전 |  |
| 테스트 일시 |  |
| 네트워크 | Wi-Fi / LTE |
| 통과 여부 |  |
| 주요 이슈 |  |
| 후속 조치 |  |

---

## 8. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-06-27 | Android preview APK QA 체크리스트 최초 작성 |
| 2026-06-27 | EAS 로그인 확인 명령을 `check:eas-login-state` 기준으로 변경 |
