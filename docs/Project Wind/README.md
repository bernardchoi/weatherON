# Project Wind

Project Wind는 WeatherON 차기 메이저 UI 개편을 위한 디자인 시스템 트랙임.

## 현재 기준

- 상태: Perfora Air Design System v1.0 stable internal release
- 릴리스: 2026-07-10
- 현재 WeatherON MVP/v1.0 UI 대체 여부: 대체하지 않음
- 외부 네이밍: 미확정. Perfora Air는 내부 코드명으로만 사용

## Source of truth

| 문서·패키지 | 역할 |
|---|---|
| `perfora_air_v1_0_package/README.md` | v1.0 사용·안정성·적용 경계 |
| `perfora_air_v1_0_package/release-manifest.v1.0.json` | 버전·엔트리포인트·해시 |
| `PROJECT_WIND_V1_AUDIT.md` | v0.1 감사 결과와 v1.0 조치 |
| `yokohama_tower_of_winds_ui_design_system.md` | 디자인 철학과 연구 근거 |
| `tower_of_winds_ui_trademark_supplement_2026-07-09.md` | 외부 네이밍·상표 리스크 |

## v0.1 보존 정책

`perfora_air_*_v0_1_package` 폴더는 연구 이력과 비교 근거로 보존함. 신규 구현과 문서는 `perfora_air_v1_0_package`만 참조함.

## 검증

```bash
npm run build:project-wind-v1
npm run check:project-wind-v1
```

실제 WeatherON 제품에 적용하려면 별도 채택 ADR, React Native 변환, 화면 목업 승인, 실제 기기·보조공학 QA가 필요함.
