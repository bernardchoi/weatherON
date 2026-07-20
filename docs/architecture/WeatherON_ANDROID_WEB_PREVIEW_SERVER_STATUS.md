# WeatherON Android Web Preview Server Status

> 생성일: 2026-07-20
> 목적: 8094 미리보기가 최신 `apps/mobile/dist` 산출물을 그대로 서빙하는지 확인한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 상태 | 확인 필요 |
| issue 수 | 1 |
| warning 수 | 0 |
| preview URL | `http://127.0.0.1:8094/` |
| 응답 URL | `http://127.0.0.1:8094/` |
| 응답 상태 | 응답 없음 |
| dist index | 있음 |
| index.html 일치 | 미확인 |
| dist script | `/_expo/static/js/web/index-07177d6de106613809cae7baa93df77b.js` |
| served script | 없음 |
| 하단 메뉴 증빙 | 미확인 |

## 2. 판정 기준

| 항목 | 기준 |
|---|---|
| 서버 루트 | 8094 응답 HTML이 `apps/mobile/dist/index.html`과 일치 |
| JS 번들 | 응답 HTML의 script가 dist index의 script와 일치 |
| 하단 메뉴 | dist 번들에 `홈/코디/출발/MY` 포함, 최초 출시 미공개 `소셜` 및 `우산/강수` 하단 라벨 없음 |

## 3. Issues

- preview server unreachable: fetch failed

## 4. Warnings

- 없음

## 5. 확인 명령

```bash
npm run export:android-web
python3 -m http.server 8094 --bind 127.0.0.1 --directory apps/mobile/dist
npm run check:android-web-preview-server
WEATHERON_WEB_PREVIEW_SERVER_OPTIONAL=1 WEATHERON_WEB_PREVIEW_SERVER_REPORT_ONLY=1 npm run check:android-web-preview-server
WEATHERON_WEB_PREVIEW_SERVER_REPORT_ONLY=1 npm run check:android-web-preview-server
```
