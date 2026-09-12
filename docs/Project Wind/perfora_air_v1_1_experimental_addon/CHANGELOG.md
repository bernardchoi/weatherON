# Changelog

## WeatherON design review — 2026-09-12

- 바람의 탑의 환경 반응 원리와 Quiet Horizon을 연결하고 WeatherON 고유 시각 문법을 구체화함.
- 홈·날씨 상세·출발로 채택 범위를 좁히고 5초 준비 판단·독자성·접근성 검증과 점수표를 갱신함.
- 기존 범용 매핑의 흐름/긴급도 결합, 실내외 혼동, 현재 앱의 풍향·AQI 부재를 제품 적용 제한으로 명시함.
- 문서 개정이며 v1.0 stable 토큰과 기존 starter 코드는 변경하지 않음. 앱 적용·사용자/기기 QA 미완료.


## Naming decision — 2026-07-16

- 프로젝트명은 Project Wind로 유지함.
- 디자인 시스템 공식 명칭을 Ambient Surface로 확정함.
- 시각 재료를 Matte Air로, 핵심 원칙을 Soft Density · Quiet Signal · Text First로 확정함.
- Perfora Air와 `perfora-air`, `--pa-*`, `PA*`, `PerforaAir*` 식별자는 v1.x 호환을 위해 유지하되 신규 표기에는 사용하지 않음.

## 1.1.0-experimental — 2026-07-15

- v0.2 productization draft를 v1.1 experimental add-on으로 승격함.
- v1.0 stable package를 기준 dependency로 명시함.
- 데이터 매핑과 핵심 4개 컴포넌트 파일명을 v1.1 experimental 명명 규칙으로 정리함.
- WeatherON 전체 재테마가 아니라 experimental layer 채택 전략을 유지함.
- React/SwiftUI starter와 사용성 테스트 템플릿을 add-on 산출물로 포함함.
- 구 `perfora_air_v0_2_download_fallback` 폴더는 새 패키지로 흡수함.
