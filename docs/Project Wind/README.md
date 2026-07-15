# Project Wind

Project Wind는 WeatherON 차기 메이저 UI 개편을 위한 디자인 시스템 트랙임.

## 현재 기준

- 상태: Perfora Air Design System v1.0 stable internal release
- 릴리스: 2026-07-10
- 실험 확장: v1.1 experimental add-on, 2026-07-15
- 현재 WeatherON MVP/v1.0 UI 대체 여부: 대체하지 않음
- 외부 네이밍: 미확정. Perfora Air는 내부 코드명으로만 사용

## Source of truth

| 문서·패키지 | 역할 |
|---|---|
| `perfora_air_v1_0_package/README.md` | v1.0 사용·안정성·적용 경계 |
| `perfora_air_v1_0_package/release-manifest.v1.0.json` | 버전·엔트리포인트·해시 |
| `perfora_air_v1_1_experimental_addon/README.md` | v1.0 기준을 깨지 않는 제품화 실험 확장 |
| `perfora_air_v1_1_experimental_addon/release-manifest.v1.1-experimental.json` | v1.1 실험 산출물·엔트리포인트·해시 |
| `PROJECT_WIND_V1_AUDIT.md` | v0.1 감사 결과와 v1.0 조치 |
| `yokohama_tower_of_winds_ui_design_system.md` | 디자인 철학과 연구 근거 |
| `tower_of_winds_ui_trademark_supplement_2026-07-09.md` | 외부 네이밍·상표 리스크 |

## 버전 정책

`perfora_air_*_v0_1_package` 폴더는 연구 이력과 비교 근거로 보존함. 신규 안정 구현은 `perfora_air_v1_0_package`를 기준으로 삼고, 제품화 실험은 `perfora_air_v1_1_experimental_addon`에서만 진행함.

`perfora_air_v1_1_experimental_addon`은 기존 v0.2 제품화 문서를 v1.x 라인으로 승격한 패키지임. v1.0 stable 패키지를 대체하지 않으며, WeatherON에는 experimental layer로만 검토함.

## 검증

```bash
npm run build:project-wind-v1
npm run check:project-wind-v1
npm run check:project-wind-v1-1-addon
```

실제 WeatherON 제품에 적용하려면 별도 채택 ADR, React Native 변환, 화면 목업 승인, 실제 기기·보조공학 QA가 필요함.
