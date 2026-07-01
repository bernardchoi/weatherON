# WeatherON Cloudflare Worker Deploy Packet

> 생성일: 2026-07-01
> 목적: Render 유료 인스턴스 대신 Cloudflare Workers Free 플랜으로 WeatherON public HTTPS 프록시를 배포한다.

## 1. 배포 파일

| 파일 | 역할 |
|---|---|
| `apps/server/src/worker.mjs` | Cloudflare Worker 엔트리 |
| `wrangler.toml` | Worker 배포 설정 |
| `scripts/check-cloudflare-worker-proxy.mjs` | 로컬 Worker 핸들러 smoke test |

Render Blueprint용 `render.yaml`은 제거했다. 이후 public 프록시는 Cloudflare Workers를 기준으로 관리한다.

## 2. 로컬 검증

```bash
node --check apps/server/src/worker.mjs
npm run check:cloudflare-worker-proxy
WEATHERON_WORKER_SMOKE=1 npm run check:cloudflare-worker-proxy
```

## 3. Cloudflare 로그인

```bash
npx wrangler login
```

## 4. Secret 등록

```bash
npx wrangler secret put KAKAO_REST_API_KEY
npx wrangler secret put GOOGLE_MAPS_API_KEY
npx wrangler secret put KMA_SERVICE_KEY
```

## 5. 배포

```bash
npm run deploy:cloudflare-worker
```

배포 URL:

```bash
https://weatheron-api.weatheron.workers.dev
```

workers.dev 서브도메인을 처음 등록한 직후에는 DNS/SSL 전파에 몇 분 걸릴 수 있다.

## 6. Public 프록시 검증

```bash
WEATHERON_PUBLIC_PROXY_URL=https://weatheron-api.weatheron.workers.dev npm run check:public-weather-proxy
```

## 7. Mobile public 모드 전환

```bash
WEATHERON_PUBLIC_PROXY_URL=https://weatheron-api.weatheron.workers.dev npm run sync:mobile-proxy-env -- public
```

이후 EAS preview 재빌드 진행.
