# WeatherON Android Web Export Status

> 생성일: 2026-07-08
> 목적: 8094 보조 미리보기가 목업 preview가 아니라 실제 mobile web export인지 점검한다.

## 1. 현재 상태

| 항목 | 값 |
|---|---|
| 상태 | 정상 |
| issue 수 | 0 |
| warning 수 | 1 |
| index.html | apps/mobile/dist/index.html |
| 참조 JS 번들 | apps/mobile/dist/_expo/static/js/web/index-49344638a25fc0256629d7497cf7e017.js |
| 보조 JS 번들 | apps/mobile/dist/_expo/static/js/web/index-557f0c1f3e8ae9e1b1ce55d686dca3da.js<br>apps/mobile/dist/_expo/static/js/web/index-bf232c36d8dca39cd37f35f07452406a.js |
| 전체 JS 번들 | 3 |
| legacy dist-web stale marker | apps/mobile/dist-web/_expo/static/js/web/index-e66bb30f16a8f0efa5d87aff1bfa73e0.js |

## 2. 판정 기준

| 항목 | 기준 |
|---|---|
| 앱 엔트리 | 참조 JS에 `AppNavigator`, `BottomNav`, `bottomNavRoutes` 포함 |
| 하단 탭 | 참조 JS에 `홈/출발/MY` 라벨 포함. 최초 출시에서는 코디/소셜 등 확장 레이어 미공개 |
| 목업 혼입 | 참조 JS에 `preview-shell`, `mockup screens`, `목업` 없음 |
| 보조 JS | index.html이 참조하지 않으면 실제 렌더에는 영향 없음. 목업 마커가 들어 있을 때만 warning으로 기록 |
| legacy dist-web | `apps/mobile/dist-web`는 이전 산출물이다. 존재하더라도 `apps/mobile/dist`를 기준으로 서빙한다 |

## 3. Issues

- 없음

## 4. Warnings

- legacy dist-web contains stale bottom nav markers: apps/mobile/dist-web/_expo/static/js/web/index-e66bb30f16a8f0efa5d87aff1bfa73e0.js

## 5. 확인 명령

```bash
npm run export:android-web
npm run check:android-web-export
WEATHERON_WEB_EXPORT_REPORT_ONLY=1 npm run check:android-web-export
```
