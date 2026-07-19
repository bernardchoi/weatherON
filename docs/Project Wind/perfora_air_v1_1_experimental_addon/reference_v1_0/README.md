# Project Wind — Ambient Surface Design System v1.0

- 상태: Stable internal design-system release
- 버전: 1.0.0
- 릴리스: 2026-07-10
- 적용 위치: WeatherON 차기 메이저 UI 개편 후보
- 시각 재료: Matte Air
- 핵심 원칙: Soft Density · Quiet Signal · Text First
- 명칭 결정: 2026-07-16 확정. Perfora Air는 레거시 식별자로만 유지

## 목적

Ambient Surface는 Matte Air를 시각 재료로 사용하고 Soft Density / Quiet Signal / Text First를 토큰, 컴포넌트 계약, 접근성 기본값, 참조 화면으로 고정함. 현행 WeatherON MVP UI를 즉시 대체하지 않으며 별도 채택 ADR과 제품 화면 검증 후 적용함.

## v1.0 엔트리포인트

| 산출물 | 역할 |
|---|---|
| perfora-air.tokens.v1.0.json | DTCG 형식 기반 foundation·semantic·mode·component 토큰 |
| perfora-air.v1.0.css | CSS custom properties와 접근성 모드 fallback |
| perfora-air.token-map.v1.0.ts | 날씨·일정·공기질 데이터를 semantic state로 변환 |
| perfora-air.components.v1.0.json | 10개 컴포넌트의 상태·variant·접근성 계약 |
| perfora-air.components.schema.v1.0.json | 컴포넌트 계약 검증용 JSON Schema |
| perfora-air.component-types.v1.0.ts | 프레임워크 비종속 TypeScript 계약 |
| perfora-air.components.v1.0.css | 참조 CSS와 forced-colors fallback |
| reference-dashboard.v1.0.html | 접근성 패치를 포함한 자가완결 참조 화면 |
| release-manifest.v1.0.json | 버전·해시·안정성 범위 |

## 안정성 계약

- 1.x에서 token path, 5단계 state 모델, 9개 mode 이름을 유지함.
- 색상값·모션값은 대비와 정보 전달 회귀 검증을 통과하는 범위에서 조정 가능함.
- alert와 critical은 텍스트 설명이 필수임.
- 상호작용 타깃 44px, 명시적 focus, reduced motion/transparency, forced colors를 기본 계약으로 둠.
- 한 화면의 animated ambient component는 최대 2개로 제한함.

## 컴포넌트

SurfaceFrame, DensityField, AirButton, ContextChip, AtmospherePanel, SignalCard, DataVeil, LumenRing, FlowDock, AmbientTimeline을 stable로 고정함.

## 검증

    npm run build:project-wind-v1
    npm run check:project-wind-v1

검증기는 JSON 파싱, token alias, 컴포넌트 token 참조, CSS custom property, 접근성 필수 훅, 산출물 해시를 확인함.

## 적용 경계

- 현재 WeatherON v1.0 UI의 source of truth는 docs/design/WeatherON_UI_Design_Spec.md임.
- Project Wind는 차기 메이저 UI의 후보 시스템이며 자동 편입되지 않음.
- 공식 표시명은 Ambient Surface이며 Perfora Air와 perfora-air 계열 식별자는 v1.x 코드 호환용으로만 유지함.
- 실제 제품 채택 전 React Native 토큰 변환, 화면별 목업, iOS/Android 기기 QA, 보조공학 수동 테스트가 필요함.
