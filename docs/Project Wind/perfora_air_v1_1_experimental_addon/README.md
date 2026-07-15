# Project Wind — Perfora Air v1.1 Experimental Add-on

**상태:** Experimental add-on for v1.0 stable package
**버전:** 1.1.0-experimental
**정리일:** 2026-07-15
**기준:** `perfora_air_v1_0_package` stable contract
**출처:** v0.2 productization draft promoted into the v1.x line

## 목적

이 패키지는 v1.0 stable 디자인 시스템을 대체하지 않는다. v1.0의 토큰·컴포넌트·접근성 계약을 유지한 상태에서, 데이터 매핑, WeatherON 실험 레이어, 사용성 테스트, React/SwiftUI starter를 v1.1 실험 확장으로 분리한다.

## 버전 정리

| 이전 위치 | 새 위치 | 결정 |
|---|---|---|
| `perfora_air_v0_2_download_fallback/full_package` | `perfora_air_v1_1_experimental_addon` | v1.1 experimental add-on으로 승격 |
| `data/perfora-air.data-map.v0.2.*` | `data/perfora-air.experimental-data-map.v1.1.*` | v1.0 stable 토큰에 의존하는 실험 매핑 |
| `data/perfora-air.components.v0.2.*` | `data/perfora-air.experimental-components.v1.1.*` | stable 10개 컴포넌트 중 4개 제품화 경로 |
| `figma/*v0.1*`, `tests/*v0.1*` | `figma/*v1.1*`, `tests/*v1.1*` | 실험 add-on 산출물로 재라벨 |

## 포함 범위

| 영역 | 산출물 | 역할 |
|---|---|---|
| 방향 | `docs/01_experimental_direction_brief.md` | v1.1 실험 경로 원칙과 성공 기준 |
| 데이터 | `data/perfora-air.experimental-data-map.v1.1.json` | weather/home/day context를 atmosphere state로 변환 |
| 컴포넌트 | `data/perfora-air.experimental-components.v1.1.json` | AtmospherePanel, SignalCard, LumenRing, AmbientTimeline 제품화 계약 |
| WeatherON | `docs/06_weatheron_adoption_scope.md` | 전체 교체가 아닌 experimental layer 채택 범위 |
| 구현 | `implementation/react`, `implementation/swiftui` | React/SwiftUI starter |
| 검증 | `docs/09_static_validation_report.md`, `tests/perfora-air.experimental-usability.scorecard.v1.1.json` | 정적 검증과 사용성 테스트 템플릿 |
| 안정 기준 | `reference_v1_0/` | v1.0 stable 계약 참조 복사본 |

## 적용 경계

- v1.0 stable 패키지가 여전히 Project Wind의 공식 기준점이다.
- v1.1 add-on은 WeatherON 차기 UI 후보 검증용이며 현행 MVP UI를 자동 대체하지 않는다.
- React Native production 적용 전 토큰 변환, 목업 승인, 실제 기기 QA, 보조공학 수동 테스트가 필요하다.
- Perfora Air는 내부 코드명이며 외부 공개명은 별도 상표 검토 후 결정한다.

## 추천 실행 순서

1. v1.0 stable 계약 확인: `../perfora_air_v1_0_package/README.md`
2. 데이터 매핑 검토: `docs/02_experimental_data_to_atmosphere_mapping.md`
3. WeatherON 채택 범위 결정: `docs/06_weatheron_adoption_scope.md`
4. React starter로 내부 prototype 구성
5. `docs/05_usability_test_plan.md` 기준으로 사용성 테스트 진행
