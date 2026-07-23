# WeatherON Android Local Proxy QA Status

> 생성일: 2026-07-23
> 목적: Android 실기기에서 로컬 WeatherON 프록시를 접근할 수 있도록 mobile env를 전환한다.

## 1. 요약

| 항목 | 값 |
|---|---|
| 상태 | 전환 가능 |
| mode | `device` |
| proxy URL | `http://192.168.45.191:8091` |
| detected host | `192.168.45.191` |
| port | `8091` |
| mobile env | `apps/mobile/.env.local` |

## 2. Issues

- 없음

## 3. 실행 명령

```bash
npm run sync:mobile-proxy-env
npm run sync:mobile-proxy-env -- web
WEATHERON_PUBLIC_PROXY_URL=https://example.com npm run sync:mobile-proxy-env -- public
npm run sync:mobile-proxy-env -- openmeteo
```

주의:
- `device` 모드는 Android 실기기 QA용이다.
- `web` 모드는 로컬 브라우저 QA용이다.
- EAS preview/production에는 `public` 모드의 HTTPS 프록시 또는 `openmeteo` 모드가 필요하다.
