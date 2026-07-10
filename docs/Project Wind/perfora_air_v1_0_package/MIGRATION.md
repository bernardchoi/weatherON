# Perfora Air v0.1 → v1.0 마이그레이션

## 변경 요약

1. 문서 상태를 draft에서 stable internal release로 변경함.
2. 작은 보조 텍스트와 success 색상의 대비를 보강함.
3. Night 모드 secondary/tertiary text를 분리함.
4. 10개 컴포넌트를 stable 계약으로 고정함.
5. interactive target 44px, forced colors, reduced motion/transparency를 필수화함.
6. token path와 state/mode 이름의 1.x 호환 규칙을 도입함.
7. 가짜 원격 component schema 경로를 로컬 JSON Schema로 교체함.

## 교체 경로

| v0.1 | v1.0 |
|---|---|
| perfora-air.tokens.v0.1.json | perfora-air.tokens.v1.0.json |
| perfora-air.v0.1.css | perfora-air.v1.0.css |
| perfora-air.token-map.v0.1.ts | perfora-air.token-map.v1.0.ts |
| perfora-air.components.v0.1.json | perfora-air.components.v1.0.json |
| perfora-air.component-types.v0.1.ts | perfora-air.component-types.v1.0.ts |
| perfora-air.components.v0.1.css | perfora-air.components.v1.0.css |

## 동작 변경

- sys.color.text.tertiary: graphite 500 → 600
- ref.color.signal.success: #4DA479 → #2F805D
- interactive ContextChip: 최소 높이 44px
- data-pa-text-first=true: density/lumen 존재감 자동 축소
- forced-colors 환경: 장식 레이어 제거, 시스템 색상과 outline 사용

기존 v0.1 산출물은 연구 이력으로 보존하며 신규 구현은 v1.0 엔트리포인트만 사용함.
