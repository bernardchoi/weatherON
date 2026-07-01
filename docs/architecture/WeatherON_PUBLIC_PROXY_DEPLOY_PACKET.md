# WeatherON Public Proxy Deploy Packet

> 생성일: 2026-07-01
> 목적: EAS preview/production APK에서 Kakao/Google 서버 연동을 사용하기 위한 public HTTPS 프록시 배포 절차

## 1. 현재 상태

| 항목 | 상태 |
|---|---|
| 서버 실행 파일 | `apps/server/src/index.mjs` |
| Docker 배포 설정 | `Dockerfile` |
| Render Blueprint | `render.yaml` |
| public 프록시 검증 | `npm run check:public-weather-proxy` |
| 로컬 Kakao/Google smoke | 통과 |

## 2. 배포 환경변수

배포 플랫폼에는 아래 값을 Secret/Environment Variable로 등록한다.

```bash
WEATHER_SERVER_HOST=0.0.0.0
WEATHER_TIMEOUT_MS=8000
WEATHER_CACHE_TTL_MS=600000
PLACE_CACHE_TTL_MS=1800000
ROUTE_CACHE_TTL_MS=600000
KAKAO_REST_API_KEY=...
GOOGLE_MAPS_API_KEY=...
KMA_SERVICE_KEY=...
```

주의:
- API 키는 앱 번들에 넣지 않는다.
- Google API 키는 `Geocoding API`, `Distance Matrix API`만 허용한다.
- 서버 고정 IP가 생기면 Google API 키에 IP 제한을 추가한다.

## 3. Render 배포

1. GitHub repo 연결
2. Render에서 Blueprint 배포 선택
3. `render.yaml` 감지 확인
4. Secret env 등록
5. 배포 완료 후 public URL 확인

예상 URL:

```bash
https://weatheron-api.onrender.com
```

## 4. Public 프록시 검증

```bash
WEATHERON_PUBLIC_PROXY_URL=https://weatheron-api.example.com node scripts/check-public-weather-proxy.mjs
```

검증 항목:
- `/health`
- 국내 장소검색
- 일본 장소검색
- 국내 경로
- 일본 내부 경로

## 5. Mobile public 모드 전환

```bash
WEATHERON_PUBLIC_PROXY_URL=https://weatheron-api.example.com npm run sync:mobile-proxy-env -- public
```

전환 후 `apps/mobile/.env.local` 기준:

```bash
EXPO_PUBLIC_WEATHER_CLIENT=proxy
EXPO_PUBLIC_WEATHER_API_BASE_URL=https://weatheron-api.example.com
EXPO_PUBLIC_WEATHER_ALLOW_LOCAL_PROXY=0
EXPO_PUBLIC_WEATHER_TIMEOUT_MS=8000
```

## 6. EAS preview 재빌드

```bash
npm run check:android-preview-preflight
npm run build:android:preview:no-wait
```

빌드 완료 후 실기기 QA:
- 잠실 검색
- 도쿄 검색
- 목적지 저장 후 홈 비교 반영
- 출발시간 음수 미발생 확인
- 알림 사이드바 열기/닫기
