# Project Wind — Ambient Surface v1.1 Experimental Add-on

**상태:** Experimental add-on for v1.0 stable package
**버전:** 1.1.0-experimental
**정리일:** 2026-07-15
**기준:** `perfora_air_v1_0_package` stable contract
**출처:** v0.2 productization draft promoted into the v1.x line
**공식 명칭:** Ambient Surface
**시각 재료:** Matte Air
**핵심 원칙:** Soft Density · Quiet Signal · Text First
**명칭 결정:** 2026-07-16

## 2026-09-12 WeatherON 설계 갱신

[디자인 방향과 개선 검토](docs/01_experimental_direction_brief.md)를 먼저 읽음. 컨셉 출발점과 Quiet Horizon을 연결하고, 홈 → 날씨 상세 → 출발의 시각 문법·데이터 계약·5초 준비 판단 검증을 갱신함. 기존 범용 매핑과 React/SwiftUI starter는 연구 이력이며 이번 제품 설계를 구현한 상태가 아님.

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
- Ambient Surface는 공식 디자인 시스템명이다. Perfora Air와 `perfora-air` 계열은 v1.x 호환용 레거시 식별자로만 유지한다.

## 추천 실행 순서

1. WeatherON 방향·채택 범위 확인: `docs/01_experimental_direction_brief.md`, `docs/06_weatheron_adoption_scope.md`
2. v1.0 stable 계약 및 범용 매핑과의 차이 확인
3. 실제 제공 데이터로 홈·상세·출발 목업 구성
4. 기존 WeatherON 프리뷰에서 내부 프로토타입 비교
5. `docs/05_usability_test_plan.md` 기준 검증 후 네이티브 채택 범위 결정

---

# Ambient Surface v1.1 Experimental Add-on

**Date:** 2026-09-12 (WeatherON design review; package version unchanged)
**Purpose:** Experimental add-on package for Ambient Surface after the v1.0 stable internal design-system release.

## Package contents

| Step | Artifact | Purpose |
|---:|---|---|
| 1 | `docs/01_experimental_direction_brief.md` | Lock v1.1 experimental product direction and review gates |
| 2 | `docs/02_experimental_data_to_atmosphere_mapping.md` | Define data → surface/density/lumen/flow mapping |
| 2 | `data/perfora-air.experimental-data-map.v1.1.json` | Machine-readable mapping |
| 2 | `data/perfora-air.experimental-data-map.v1.1.ts` | TypeScript helper |
| 3 | `docs/03_experimental_components.md` | AtmospherePanel / SignalCard v1.1 experimental spec |
| 3 | `data/perfora-air.experimental-components.v1.1.json` | Component metadata |
| 3 | `data/perfora-air.experimental-component-types.v1.1.ts` | Component prop contracts |
| 3 | `data/perfora-air.experimental-components.v1.1.css` | Starter CSS |
| 4 | `docs/04_experimental_figma_design_kit.md` | Figma kit creation guide |
| 4 | `figma/perfora-air.experimental-figma.variables.v1.1.json` | Figma variable blueprint |
| 4 | `figma/perfora-air.experimental-figma.component-matrix.v1.1.json` | Component matrix |
| 4 | `figma/perfora-air.experimental-figma.preview.v1.1.svg` | Figma kit visual preview |
| 5 | `05_usability_test_plan.md` | Moderated test plan |
| 5 | `tests/perfora-air.experimental-usability.scorecard.v1.1.json` | Test scorecard structure |
| 6 | `06_weatheron_adoption_scope.md` | WeatherON integration recommendation |
| 7 | `07_implementation_package.md` | React/SwiftUI package guide |
| 7 | `implementation/` | Starter code |
| 8 | `08_brand_trademark_reexploration.md` | External naming/trademark preliminary screen |

## Recommended execution order

1. Read the WeatherON direction and adoption scope (01, 06).
2. Check stable contracts and the documented gaps in the legacy mapping (02).
3. Make matched home/detail/departure mockups with supported WeatherON data.
4. Compare the internal prototype using the updated plan and scorecard (05).
5. Validate native accessibility and performance, then record the adoption ADR.

## Current decision — 2026-09-12

Translate invisible weather changes into preparation decisions. Keep the Tower of Winds response principle and Quiet Horizon identity together through horizontal structure, a focused ON accent, and a bounded data surface. Generic indoor/schedule mapping and starter code remain research references, not the current WeatherON implementation.

---

# Ambient Surface v1.1 — WeatherON 디자인 방향과 개선 검토

**갱신일:** 2026-09-12
**상태:** WeatherON 전용 설계 기준 갱신. 구현·목업·사용자 검증 미완료
**명칭:** Project Wind / Ambient Surface / Matte Air
**원칙:** Soft Density · Quiet Signal · Text First

## 1. 판단과 컨셉 출발점

Project Wind의 자산은 무광 카드가 아니라 **환경을 읽어 표면으로 드러내는 작동 원리**임. 기존 연구의 바람의 탑 해석인 “보이지 않는 도시의 상태를 빛·투명도·밀도·리듬으로 번역”을 유지함. 탑의 원통, 금속 구멍, 야경을 그대로 앱 장식으로 옮기는 방식은 채택하지 않음.

WeatherON에서는 이를 **“보이지 않는 날씨의 변화를 드러내, 오늘 준비할 행동을 빠르게 정하게 함”**으로 좁힘. 범용 스마트홈·일정 대시보드로의 확장보다 WeatherON의 외출·옷차림·출발 판단을 먼저 완성함.

브랜드 관계는 다음과 같음.

| 층 | 역할 | 화면에서 확인할 것 |
|---|---|---|
| Quiet Horizon | 하루를 켜는 조용한 첫 신호라는 브랜드 태도 | 넓은 여백, 수평 구조, 한곳에 집중된 Warm Sun |
| 바람의 탑 | 환경 입력에 따라 달라지는 표면이라는 작동 원리 | 같은 화면에서 데이터가 바뀌면 해당 표현만 달라짐 |
| Ambient Surface | 이를 반복 가능한 규칙으로 고정하는 시스템 | 데이터·문장·표면·접근성 대체 표현의 일치 |
| Matte Air | 읽기 좋은 재질 | 선명한 글자, 불투명 본문, 낮은 광택 |
| WeatherON | 사용자가 얻는 결과 | 현재 상태와 준비할 행동을 5초 안에 파악하는 것이 목표 |

‘분위기를 먼저 감지’는 애니메이션을 기다리거나 패턴을 해독하라는 뜻이 아님. **첫 프레임부터 상태 문장과 수치가 읽히고**, 분위기가 같은 판단을 주변에서 보조해야 함. Text First는 온도를 무조건 작게 만들라는 규칙도 아님.

## 2. 검토 결과와 우선순위

이번 검토는 원전 문서·무드보드·stable 토큰·experimental 매핑 및 앱 계약의 대조임. 새로운 화면 QA나 사용자 조사 결과가 아님.

| 우선 | 발견과 근거 | 개선 결정 |
|---|---|---|
| P0 | 기존 방향서·채택서가 환기, 실내 기기, 일정 압력 중심임 | 첫 검증 흐름을 홈 → 날씨 상세 → 출발로 변경함 |
| P0 | 무드보드에는 큰 기온·공극·흐름이 있으나 WeatherON 공유 글리프와 준비 행동의 결합 규칙이 없음 | 아래 3장의 수평 구조·ON 포인트·환경 영역을 공통 문법으로 지정함 |
| P0 | `data/perfora-air.experimental-data-map.v1.1.ts`와 React `src/dataMap.ts`에서 `flowEnergy`를 계산하지만 `flow`는 종합 긴급도에서 선택됨 | 바람 표현과 경고 신호를 분리함. 일정·습도 증가로 바람이 강해 보이면 실패임 |
| P0 | 같은 두 매핑의 `pickRecommendation`이 실외 습도를 실내 습도 대체값으로 쓰고, `scoreAirPurity`는 누락 CO₂를 650으로 채움 | 실외→실내 추론 및 측정값 기본 생성 금지. 기존 helper는 제품 채택 대상에서 제외함 |
| P0 | 앱 `WeatherSnapshot`에 풍향·AQI·시간별 습도가 없는데 기존 채택서는 이를 필수처럼 요구함 | 현재 제공 필드로 검증함. 풍향 링은 공급 계약 확보 전 보류함 |
| P1 | 기존 성공 기준 8초, 범용 테스트 참가자, 비교 화면 선택 사항 | 5초 준비 판단, WeatherON 사용 맥락, 동일 정보 비교와 교차 순서를 기준으로 변경함 |
| P1 | 브랜드 가이드 서체, stable의 Inter/Pretendard, 앱의 Pretendard가 다름. 색상값도 문서와 앱 간 차이 있음 | 역할 기반 매핑 후 한 화면에서 비교함. 문서만으로 최종 폰트·색상을 확정하거나 앱을 교체하지 않음 |
| P1 | day/night 재료와 라이트/다크 설정을 혼동할 여지 있음 | 지역의 실제 낮/밤, 앱 표시 테마, 데이터 신선도를 독립 축으로 고정함 |
| P1 | ‘유리 같지 않다’가 독자성 판단의 큰 부분임 | 로고·모션을 제거해도 같은 제품으로 묶이는 형태·위계 검증을 추가함 |
| P2 | 컴포넌트 수·토큰 수·정적 검증 통과가 제품 완성도로 읽힐 수 있음 | stable은 패키지 호환 기준임을 유지하고, WeatherON 채택 검증은 별도로 기록함 |

## 3. WeatherON 고유 시각 문법

다음은 **목업으로 검증할 설계 결정**임. 독자성이 입증됐다는 선언이 아님. 새 로고나 별도 서브브랜드를 만들지 않음.

### 3.1 수평 구조 + ON 포인트 + 환경 영역

- **수평 구조:** 현재 상태와 다음 행동 사이에 여백과 짧은 수평 경계를 둠. Quiet Horizon의 수평선에서 가져온 고정 구성 요소임. 숫자·눈금 없는 장식 선을 예보 그래프나 진행률처럼 표시하지 않음.
- **ON 포인트:** 기존 토글+태양노브 글리프는 브랜드 표시에 유지함. 선택한 시간은 타임라인의 점 하나, 준비 행동은 주 CTA 하나로 강조함. 태양·골드 원을 모든 카드에 반복하지 않음. 선택점이 인터랙션이면 실제 선택 시각을 가리켜야 함.
- **환경 영역:** 히어로 우측 또는 하단의 제한된 영역에 공극·흐름을 배치함. 글자 뒤에는 패턴을 깔지 않음. 정상 날씨에서도 유효한 예보 변화가 있으면 정적인 밀도 차이를 허용함. 근거가 없으면 매끈한 무광 여백으로 남김.
- **연속성:** 홈의 선택 시간·변화 이유가 상세와 출발에서도 같은 문장·시각 신호로 이어져야 함. 화면마다 다른 링·입자·글로우를 새로 고안하지 않음.

공극·흐름을 모두 없앤 기본 화면에서도 수평 구조, 숫자와 준비 문장의 위계, 절제된 ON 포인트로 제품 인상이 유지되어야 함. 반대로 무광 카드에 색만 바꾼 화면이면 개발 방향을 다시 검토함.

### 3.2 형태·레이아웃 기준

| 항목 | 첫 목업 기준 | 이유 |
|---|---|---|
| 히어로 | 큰 상태 영역 1개, 내부 소형 카드 중첩 최소화 | 하나의 환경을 읽는 인상 유지 |
| 나머지 정보 | 구분선과 정렬된 행 우선, 독립 행동만 카드 | 모든 수치를 같은 둥근 카드로 분해하지 않음 |
| 반경 | stable `xl=30`, `lg=22`, `md=16` 중 히어로·카드·컨트롤 역할로 선택 | 새로운 반경 팔레트 추가 방지 |
| 여백 | stable spacing 사용, 본문 좌측 기준선 공유 | 건축적 질서와 읽기 속도 확보 |
| 축약 정보 | 현재 기온·상태 + 준비 한 문장 + 판단 근거 2개 이내 | 첫 화면이 센서 대시보드로 변하지 않게 함 |
| 터치 영역 | iOS 최소 44pt, Android 최소 48dp를 프로젝트 목표로 사용 | 작은 신호도 조작 면적은 확보 |
| 큰 글자 | 고정 높이 해제, 세로 재배치·스크롤 허용 | 모든 정보를 한 화면에 넣으려고 글자를 줄이지 않음 |

본문은 blur 0, 불투명 표면을 기본으로 함. 겹침을 설명하는 시트에서만 기존 blur 토큰 사용 가능함. Soft Density의 밀도는 **패턴 내부** 속성임. 날씨가 바뀔 때 카드 간격·버튼 위치·글자 대비가 바뀌면 안 됨.

### 3.3 컬러·타이포·일러스트

- Clear Navy는 글자·구조·브랜드 신뢰, Warm Sun/Dawn Orange는 준비 행동과 선택 포인트에 사용함. 기능색은 강수·주의 등 의미를 가짐. 위험색을 주 CTA 기본색처럼 재사용하지 않음.
- 라이트 화면은 맑은 백색/청백색과 Navy 글자로, 다크 화면은 Navy 표면의 명도 단계로 구성함. Matte Air를 베이지 필터나 흐린 글자로 해석하지 않음.
- 색 값은 `apps/mobile/src/theme/tokens.ts`와 stable 토큰을 역할별로 대조한 뒤 합성 배경에서 대비 확인함. 기존 브랜드 가이드의 날짜별 hex를 최신 구현값으로 간주하지 않음.
- 앱 본문 첫 비교안은 이미 등록된 Pretendard로 제작함. 브랜드 가이드의 Plus Jakarta Sans/Noto Sans KR/DM Mono 및 워드마크용 Manrope는 기존 의도·자산으로 보존함. 최종 본문 서체 채택은 한글·숫자·큰 글자 비교 후 결정하고, 그 전 새 폰트 의존성을 추가하지 않음.
- 기온은 화면의 숫자 기준점으로 크게 두되 준비 문장은 그 아래 첫 읽기 순서에 둠. 소수·단위·시간은 정렬하며 한글 본문을 자간으로 억지 확장하지 않음.
- ON Square는 친근함을 담당하는 별도 일러스트 영역임. 환경 표면의 주역이나 경고 전달 수단으로 쓰지 않음. ‘도시적 UI’가 기존 캐릭터를 삭제하라는 뜻은 아니며, 공극 패턴을 캐릭터 몸에 덧씌우지도 않음.

## 4. 화면별 적용 기획

기존 홈·코디·출발·MY 구조와 화면 기능을 유지함. 내부 명칭 Project Wind, Matte Air, AtmospherePanel은 사용자 UI에 노출하지 않음.

| 화면 | 첫 판단 | 적용 | 보존·실패 처리 |
|---|---|---|---|
| 홈 H1 | 지금 상태와 준비할 것 | AtmospherePanel 1개, 기온·상태·준비 문장, 짧은 시간별 변화 | 위치·갱신 정보, 목적지 준비·코디 요약을 밀어내지 않음. 긴 본문은 스크롤 |
| 날씨 상세 H6 | 언제 무엇이 변하는지 | AmbientTimeline의 한 가지 선택 지표와 실제 값, 필요한 SignalCard | 현재·체감·강수·UV·주간 예보 유지. 없는 UV는 정보 없음 |
| 출발 G2 | 언제 출발하고 무엇을 준비할지 | 출발 시각과 준비 문장을 같은 수평 구조로 연결 | `지도 앱에서 길찾기` 주 행동 1개. 경로 후보·도보 구간·구간별 날씨 생성 금지 |
| 코디 | 날씨에 맞는 옷차림 | 이유 문장·사진·선택 상태를 공통 표면으로 정리 | 옷 사진은 패턴 없이 읽힘. 날씨 대시보드를 복제하지 않음 |
| MY·설정 | 상태 확인과 설정 변경 | 정적 무광 행, 공통 타입·선택 포인트 | 환경 애니메이션 없음. 플랫폼 접근성·기본 컨트롤 사용 |

주 CTA 1개는 다른 화면으로 가는 링크를 없애라는 뜻이 아님. 현재 판단을 실행하는 행동에만 가장 높은 시각 무게를 부여함. 이상 없음 상태에 불필요한 ‘유지하기’ 버튼을 만들지 않음.

## 5. WeatherON 전용 데이터 → 표현 계약

아래는 기존 범용 매핑보다 우선하는 **제품 설계 계약**임. `data/*.ts`, React/SwiftUI starter에 구현됐다는 뜻이 아님.

```txt
위치·시각·출처·가용성 확인
→ 기존 WeatherON 날씨/추천 규칙
→ 상태 문장 + 준비 행동 + 근거
→ 같은 근거에 한해 밀도·흐름·빛 적용
```

| 입력 | 표현 규칙 | 금지·결측 처리 |
|---|---|---|
| `current.condition` | 현재 날씨 아이콘·상태 문장 | 미래 강수확률로 현재 비 아이콘을 만들지 않음 |
| `current.windMs` | 풍속 숫자. 풍속 전용 흐름 강도만 변화 | `actionUrgency`·습도·일정으로 바람을 움직이지 않음 |
| 시간별 `rainProbabilityPct` | 강수확률을 선택했을 때 고정 0–100% 척도와 값에 맞춘 점밀도 | 강수량과 합산하지 않음. 80%를 폭우 강도로 표현하지 않음 |
| 시간별 `precipitationMm` | 강수량 선택 시 mm와 별도 척도 명시 | 확률·바람을 하나의 출처 불명 ‘압력 점수’로 합치지 않음 |
| 현재 습도·체감 | 실제 수치와 기존 준비 조언의 근거 | 실내 상태·환기·제습으로 추론하지 않음. 텍스트 명도는 고정 |
| 선택한 예보 시각 | 타임라인 ON 포인트의 위치 | 로딩·데이터 부족을 임의 진행률로 표시하지 않음 |
| 유효한 공식 특보·기존 추천 | 경고 문장과 관련 SignalCard의 한정된 신호 | 높은 습도나 임의 AQI 점수만으로 공식 위험처럼 표현하지 않음 |
| `observedAt`, `source`, `stale`, provider status | 출처·갱신 시각·이전 정보 표시 | fallback/샘플을 현재 위치 실시간 관측처럼 표시하지 않음 |

**현재 공급 범위:** `packages/shared/src/types/weather.ts`의 WeatherSnapshot은 풍속·습도·시간별 강수 등을 제공하지만 풍향·AQI·시간별 습도는 정의하지 않음. `pm25`는 선택 필드임. 첫 목업의 실제 데이터 경로에서는 풍향 화살표·방향성 흐름·AQI 등급을 만들지 않음. 풍향 공급 계약이 확보되면 유입 방향과 화면 이동 방향의 의미부터 정의한 뒤 LumenRing을 검증함. 단위가 다른 지표의 원시값을 `max()`로 비교하지 않음.

**시간과 테마:** 라이트/다크는 사용자 표시 설정, 낮/밤은 해당 위치의 시간·좌표 문맥임. 낮+다크에서도 현재 맑음 아이콘을 달로 바꾸지 않음. 기존 `weatherDaylight.ts`를 재사용하며 별도 고정 19시 판정을 새로 만들지 않음. 시각/좌표 근거가 없으면 낮/밤을 확정하는 표현을 유보함.

**가용성 우선순위:** 로딩은 중립 표면, 부분 결측은 해당 지표만 정보 없음, 오래된 값은 시각을 명시한 정적 표시, 오류/오프라인은 읽을 수 있는 이전 정보와 재시도임. 알 수 없음을 ‘좋음/잔잔함’으로 바꾸지 않음. 새 위치 로딩 중 이전 위치 값을 새 지역 제목 아래 보여주지 않음.

**움직임:** WeatherON 첫 실험은 한 뷰포트에서 환경 애니메이션 최대 1개로 제한함(stable 상한 2개보다 보수적). 초기에는 정적 점밀도·짧은 상태 전환으로 검증함. 경고는 반복 점멸하지 않으며 백그라운드·저전력·동작 줄이기에서는 정지함. 모션을 꺼도 상태·행동·선택 시각이 같아야 함.

## 6. 구현 전 비교안과 완료 조건

1. **동일 데이터의 홈 라이트/다크 쌍:** 현재 상태·예보·선택·줄바꿈을 동일하게 두고 표시 테마만 바꿈.
2. **같은 홈의 상태 세트:** 정상, 현재 맑음+오후 강수, 강풍 정보, 부분 결측, 오래된 값, 특보를 비교함. 예제 데이터는 문서에 시각·출처·단위를 적고 실제 관측처럼 주장하지 않음.
3. **날씨 상세·출발 연결:** 홈 준비 문장의 근거가 상세에서 확인되고, G2의 실제 행동으로 이어지는지 검증함.
4. **정적·큰 글자·투명도 감소:** 같은 판단이 유지되는지, 첫 행동과 마지막 콘텐츠가 내비게이션에 가리지 않는지 확인함.
5. **사용자 비교:** 같은 정보·기능의 현재 UI와 후보를 교차 순서로 비교함. 과제와 수치는 [사용성 계획](docs/05_usability_test_plan.md), 채택 절차는 [채택 범위](docs/06_weatheron_adoption_scope.md)를 따름.

5초 준비 판단과 로고 없이 화면군을 알아보는 결과는 **검증 목표**임. 5–8명 탐색 테스트로 출시 성과나 시장 전체 독창성을 입증했다고 쓰지 않음. 조작·보조공학·성능은 실제 iOS/Android 검증 결과로만 완료 처리함.

## 7. 기준 문서와 유지 범위

- [컨셉 원전](../yokohama_tower_of_winds_ui_design_system.md), [무드보드](../mood_board.png): 출발점·형태 연구 이력.
- [브랜드 정체성](../../../brand/WeatherON_디자인_정체성_가이드.md), [Quiet Horizon](../../../brand/WeatherON_로고_디자인철학.md), [ON Square](../../../brand/WeatherON_ONSquare_캐릭터_아트바이블.md): 브랜드 축과 역할.
- [v1.0 stable](../perfora_air_v1_0_package/README.md): 토큰 경로·컴포넌트 호환 기준. 이번 검토에서 변경하지 않음.
- [기존 범용 매핑과 차이](docs/02_experimental_data_to_atmosphere_mapping.md): 연구 코드의 적용 제한.

이번 갱신은 문서·기획·검증 기준에 한정함. 네이밍 재탐색, 신규 컴포넌트 라이브러리, 공개 실험모드 설정, 앱 전체 재테마는 추가하지 않음.

---

# Ambient Surface Experimental Data-to-Atmosphere Mapping v1.1

> **2026-09-12 적용 상태:** 아래 내용과 `data/*.json`, `data/*.ts`는 7월의 **범용 연구 매핑 이력**임. WeatherON 제품 매핑에는 [방향서 5장](docs/01_experimental_direction_brief.md#5-weatheron-전용-데이터--표현-계약)을 우선함. 원시 습도/AQI/PM2.5/CO₂ 임계값은 검증된 건강·기상 경고 기준이 아니며 이번 갱신에서 제품 기준으로 승인하지 않음.
>
> **구현 차이:** TS의 `flowEnergy`는 출력되지만 `flow`는 `actionUrgency` 상태에서 정해짐. `pickRecommendation`은 실외 습도를 실내 대체값으로 사용하고, 누락 CO₂는 기본값으로 보완됨. 날씨·일정·실내 압력을 합친 단일 상태, 고정 환기 우선순위, 풍향·AQI 필수 입력은 현재 WeatherON에 적용하지 않음. 코드 변경은 이번 문서 작업에 포함하지 않았음.
>
> **제품화 조건:** 위치·시각·출처·가용성 검증 → 기존 추천 규칙 → 동일 근거의 문장과 표현 순으로 재설계해야 함. 신규 데이터 어댑터는 이 차이를 해소하기 전까지 제품에 연결하지 않음.

**Date:** 2026-07-15
**Status:** Experimental add-on
**Output files:** `perfora-air.experimental-data-map.v1.1.json`, `perfora-air.experimental-data-map.v1.1.ts`

## 0. Purpose

This document defines how Ambient Surface converts raw product data into UI atmosphere.

The goal is to prevent Ambient Surface from becoming a decorative layer. Every density field, lumen signal, flow motion, and visual summary sentence must be explainable through data or explicit user context.

```txt
raw data
→ derived pressure metrics
→ Perfora state
→ surface / density / lumen / flow tokens
→ component variant
→ visual summary text
→ recommended action
```

## 1. Inputs

### 1.1 Weather inputs

| Field | Unit | Use |
|---|---:|---|
| `temperatureC` | °C | Main condition and comfort copy |
| `feelsLikeC` | °C | Difference from actual temperature |
| `humidityPct` | % | Surface veil, air weight, dehumidify suggestion |
| `windSpeedMs` | m/s | Flow speed and wind ring intensity |
| `windDirectionDeg` | degrees | Directional flow and ring needle |
| `precipProbabilityPct` | % | Rainy surface mode and timeline intensity |
| `uvIndex` | index | Day mode edge signal, outdoor caution |
| `aqi` | index | Air purity pressure |
| `pm25` | μg/m³ | Air purity pressure and action priority |

### 1.2 Smart home inputs

| Field | Unit | Use |
|---|---:|---|
| `co2ppm` | ppm | Ventilation urgency |
| `indoorHumidityPct` | % | Dehumidify priority |
| `purifierMode` | enum | Device status copy |
| `deviceAlerts` | count | SignalCard urgency |
| `windowOpen` | boolean | Ventilation recommendation state |

### 1.3 Day context inputs

| Field | Unit | Use |
|---|---:|---|
| `eventsNext12h` | count | Schedule pressure and timeline density |
| `focusBlocks` | count | Focus opportunity copy |
| `nextDeadlineHours` | hours | CTA priority |
| `notificationUrgency` | 0–3 | Signal intensity |

## 2. Derived metrics

| Metric | Formula direction | Drives |
|---|---|---|
| `airWeight` | humidity + heat + PM2.5 burden | Surface veil, copy tone |
| `flowEnergy` | wind speed + wind direction clarity | Flow speed, LumenRing emphasis |
| `airPurityPressure` | max(AQI, PM2.5, CO₂) | Signal urgency |
| `schedulePressure` | events + deadline proximity + notifications | AmbientTimeline density |
| `actionUrgency` | max(environmental pressure, schedule pressure) | Overall Perfora state |

## 3. State thresholds

### 3.1 Humidity

| State | Range | UI translation |
|---|---:|---|
| Calm | 35–60% | Clear matte surface |
| Notice | 61–74% | Slight veil and softer contrast |
| Alert | 75–84% | Text-first recommendation for dehumidifying/ventilation |
| Critical | 85%+ | Strong action copy; density does not carry state alone |

### 3.2 Wind speed

| Flow token | Range | UI translation |
|---|---:|---|
| `still` | 0–1.4 m/s | No visible ambient motion |
| `slow` | 1.5–4.9 m/s | Light directional drift |
| `medium` | 5.0–8.9 m/s | Clearer flow curve |
| `gust` | 9.0+ m/s | Short emphasis only; avoid constant motion |

### 3.3 Air purity

| Field | Calm | Normal | Alert | Critical |
|---|---:|---:|---:|---:|
| AQI | 0–30 | 31–50 | 51–100 | 101+ |
| PM2.5 | 0–15 | 16–35 | 36–75 | 76+ |
| CO₂ | <800 | 800–999 | 1000–1499 | 1500+ |

## 4. Token mapping

| Perfora state | Surface | Density | Lumen | Flow | Copy rule |
|---|---|---|---|---|---|
| `calm` | `still` | `calm` | `whisper` | `still` | Reassuring |
| `normal` | `air` | `normal` | `soft` | `drift` | Informative |
| `live` | `air` | `live` | `notice` | `slow` | Observational |
| `alert` | `signal` | `alert` | `alert` | `gust` | Actionable + text required |
| `critical` | `signal` | `critical` | `critical` | `gust` | Direct + text-first |

## 5. Recommendation priority

The UI should not show three competing actions with equal visual weight. Recommendation priority is:

1. CO₂ high → ventilate.
2. Indoor humidity high → dehumidify.
3. PM2.5/AQI high → purify.
4. Schedule pressure high → protect focus time.
5. Otherwise → maintain.

## 6. Copy generation pattern

Every generated status sentence should follow this structure:

```txt
[State sentence]. [Key numbers]. [Why it matters]. [Recommended action].
```

### Example: normal

```txt
공기가 살짝 습하지만 안정적입니다. 24도, 습도 62%, 북서풍 3.2m/s입니다. 짧은 환기 후 집중하기 좋은 상태입니다.
```

### Example: alert

```txt
공기가 무겁고 확인할 항목이 늘었습니다. 26도, 습도 78%, CO₂ 1180ppm입니다. 제습을 먼저 켜고 다음 일정 전 알림을 정리하세요.
```

## 7. Accessibility mapping

Visual elements must use the same state model as their text alternatives.

| Visual layer | Accessibility behavior |
|---|---|
| Density field | `aria-hidden` if it duplicates a described state |
| Lumen ring | `role="img"` with title + description, or meter if interactive |
| Timeline bars | `role="meter"` for individual values; long summary for trend |
| Alert signal | Text required; color/light cannot be the only state carrier |
| Reduced motion | Flow token becomes still; copy remains unchanged |
| Reduced transparency | Surface becomes opaque; density meaning moves to text/structure |

## 8. Review checklist

- [ ] Can every visible density pattern be traced to a metric?
- [ ] Does every alert have an action sentence?
- [ ] Does reduced motion preserve the same decision?
- [ ] Does high contrast mode preserve the same state hierarchy?
- [ ] Are weather, home air, and schedule data mapped by the same state model?

## 9. Files

- `perfora-air.experimental-data-map.v1.1.json` — machine-readable mapping.
- `perfora-air.experimental-data-map.v1.1.ts` — implementation helper for React/SwiftUI parity.

---

# Ambient Surface Experimental Components v1.1

> **2026-09-12 WeatherON 적용 프로필:** 아래는 범용 컴포넌트 계약임. WeatherON 화면 구성은 [전용 방향 3–5장](docs/01_experimental_direction_brief.md), 적용 순서는 [채택 범위](docs/06_weatheron_adoption_scope.md)를 우선함. 홈은 기온·상태·준비 문장과 근거 2개 이내, 같은 목적의 주 CTA 최대 1개로 축약함. `LumenRing`은 현재 풍향 공급 계약 부재로 보류하고 `AmbientTimeline`은 단일 지표·단위·시간을 표시함. 정상 상태의 권장 행동은 문장으로 충분하면 버튼을 만들지 않음. 결측·오래된 값은 해당 지표를 중립·정적으로 표시함. 이 프로필은 아직 JSON/React/SwiftUI 구현에 반영되지 않았음.

**Date:** 2026-07-15
**Status:** Experimental add-on
**Depends on:** Ambient Surface v1.0 stable package + Experimental Data-to-Atmosphere Mapping v1.1

## 0. What v1.1 experimental adds

Ambient Surface v1.0 stable components defined the visual grammar. Components v1.1 experimental adds product behavior:

- Data-bound states.
- Loading / insufficient data / offline states.
- Required action copy for alert and critical states.
- Visual summary accessibility contracts.
- Cross-platform implementation props for React and SwiftUI.

## 1. Component priority

v1.1 experimental should not attempt to polish every component equally. The system should prioritize the components that prove the core idea.

| Priority | Component | Why it matters |
|---:|---|---|
| 1 | `AtmospherePanel` | Main identity and main product value |
| 2 | `SignalCard` | Reusable unit for weather, home, schedule, alerts |
| 3 | `LumenRing` | Differentiates direction/progress from generic charts |
| 4 | `AmbientTimeline` | Shows density over time without becoming a plain bar chart |
| 5 | `DataVeil` | Overlay/detail pattern, important but not identity-critical |
| 6 | `FlowDock` | Navigation layer, lower priority for v1.1 experimental validation |

## 2. AtmospherePanel v1.1 experimental

### 2.1 Purpose

The `AtmospherePanel` is the system's signature component. It turns multiple data points into one judgment:

```txt
What is the state? Why? What should I do next?
```

### 2.2 Anatomy

```txt
[Context label]           [mode/state chip]
[Primary state sentence]
[Hero metric / compact metric row]
[Density field / ring / trend visual]
[Reason sentence]
[Recommended action CTA]
[Raw data disclosure]
```

### 2.3 Required content hierarchy

| Layer | Required? | Rule |
|---|---|---|
| State sentence | Yes | Human-readable state before numbers |
| Key metrics | Yes | 3–5 max in collapsed view |
| Visual summary | Yes | Must be traceable to data mapping |
| Recommendation | Yes | Especially alert/critical |
| Raw data | Optional but recommended | Expandable or secondary row |
| Accessible summary | Yes | Same meaning as visual summary |

### 2.4 States

| State | Visual behavior | Copy behavior |
|---|---|---|
| `calm` | Still surface, low density | Reassuring, no urgency |
| `normal` | Air surface, soft density | Informative, maintenance action |
| `live` | Slight flow, notice lumen | Observational, monitor or light action |
| `alert` | Signal surface, alert density | Actionable sentence required |
| `critical` | Text-first, high contrast | Direct instruction required |
| `loading` | Skeleton without density field | No fake atmosphere |
| `insufficientData` | Neutral surface | Explain missing source |
| `offline` | Matte still surface | Last updated time and retry action |

### 2.5 Acceptance criteria

- The panel must make sense with all decorative layers removed.
- Alert/critical states must have a visible action.
- Density must be derived from a named metric.
- `aria-describedby` must include the visual summary.
- Reduced motion must not remove state meaning.

## 3. SignalCard v1.1 experimental

### 3.1 Purpose

`SignalCard` summarizes one data unit: air quality, humidity, next meeting, purifier status, wind, UV, or notification pressure.

### 3.2 Anatomy

```txt
[Label] [state marker]
[Value + unit]
[Caption / reason]
[Optional mini trend]
[Optional action]
```

### 3.3 Variant rules

| Variant | Use | Rule |
|---|---|---|
| Metric | Weather/environment number | Value and unit required |
| Device | Smart home device | Status + location required |
| Schedule | Event/time pressure | Time + priority required |
| Alert | Requires user action | Action sentence required |
| Insight | Text summary | Must not hide raw basis |

### 3.4 Alert behavior

Do not show a card that only turns orange/red. Use this structure:

```txt
공기질 확인 필요
PM2.5 41
공기청정 모드를 높여 주세요.
[실행]
```

## 4. LumenRing v1.1 experimental

`LumenRing` is not a glow decoration. It is used only when circular direction/progress helps comprehension.

Allowed uses:

- Wind direction and speed.
- Air cycle progress.
- Focus session progress.
- Device purification progress.

Disallowed uses:

- Pure ornament.
- Background decoration.
- Alert without text.

## 5. AmbientTimeline v1.1 experimental

`AmbientTimeline` shows the pressure of a period.

| Data type | Timeline meaning |
|---|---|
| Hourly weather | wind/rain/humidity tendency |
| Day schedule | event density and focus gaps |
| Home air | CO₂ or humidity over time |
| Alert history | event intensity |

The timeline must expose a long description:

```txt
하루 밀도 타임라인: 최고점은 15시, 최저점은 06시입니다. 오후에 일정 압력이 높아집니다.
```

## 6. DataVeil v1.1 experimental

Use for overlays, sheets, detail panels, and filters. In v1.1 experimental, DataVeil must support:

- Reduced transparency: opaque surface.
- High contrast: clear border and text priority.
- Escape/close behavior.
- Focus trap if modal.
- No complex density under text-heavy content.

## 7. FlowDock v1.1 experimental

FlowDock is not a showpiece in v1.1 experimental. Keep it simple and accessible:

- Text label + icon.
- Active state through label weight and small marker.
- `aria-current="page"` for active tab.
- Minimum target size 44px.

## 8. Component QA checklist

- [ ] Component has loading/empty/offline state.
- [ ] Component has reduced motion and reduced transparency behavior.
- [ ] Component does not rely on pattern/color alone.
- [ ] Alert and critical states have action copy.
- [ ] Component is traceable to one or more source metrics.
- [ ] Component has a React prop contract and a SwiftUI equivalent.

## 9. Files

- `perfora-air.experimental-components.v1.1.json`
- `perfora-air.experimental-component-types.v1.1.ts`
- `perfora-air.experimental-components.v1.1.css`

---

# Ambient Surface Figma Design Kit v0.1

**Date:** 2026-07-15
**Status:** Build blueprint
**Important:** This package does **not** contain a native `.fig` file. It contains a Figma-ready kit plan, variable blueprint, component matrix, and SVG preview that can be recreated in Figma or imported through a custom plugin/script.

## 0. Purpose

Create a reusable Figma kit that keeps Ambient Surface from drifting into either glossy glass UI or generic pale cards.

The kit should make the core system repeatable:

```txt
surface + density + lumen + flow + text summary
```

Figma variables are appropriate here because Figma describes variables as a way to represent design tokens and switch designs between contexts such as themes or modes. The kit uses variables for color, number, radius, opacity, and motion modes.

## 1. File structure in Figma

Recommended page structure:

```txt
00 Cover
01 Foundations
02 Variables
03 Components
04 Patterns
05 Templates
06 Accessibility Modes
07 Handoff
```

## 2. Variable collections

### 2.1 PA Color

Modes:

- Day
- Dusk
- Night
- Rainy
- High Contrast

Key variables:

| Variable | Purpose |
|---|---|
| `surface/canvas` | App background |
| `surface/panel` | Main matte panel |
| `surface/panelRaised` | Signal card surface |
| `text/primary` | Primary text |
| `text/secondary` | Supporting text |
| `signal/notice` | Calm notification/light signal |
| `signal/alert` | Action-required state |
| `density/dot` | Pattern dot color |

### 2.2 PA Number

Modes:

- Default
- Reduced Motion
- Reduced Transparency
- High Contrast

Key variables:

| Variable | Default | Reduced mode behavior |
|---|---:|---|
| `surface/blur` | 8 | 0 under reduced transparency |
| `density/opacity` | 0.16 | 0.08 under high contrast |
| `motion/ambientDuration` | 7200ms | 0 under reduced motion |
| `radius/panel` | 28 | same |
| `radius/card` | 18 | same |

## 3. Component set

### 3.1 AtmospherePanel

Variants:

```txt
state = calm / normal / live / alert / critical / loading / insufficientData / offline
mode = day / dusk / night / rainy
textFirst = false / true
density = calm / normal / live / alert / critical
```

Required slots:

- Eyebrow
- State sentence
- Metric row
- Density visual
- Recommendation
- Primary action
- Visual summary annotation

### 3.2 SignalCard

Variants:

```txt
type = metric / device / schedule / alert / insight
state = calm / normal / live / alert / critical
withAction = true / false
withMeter = true / false
```

### 3.3 LumenRing

Variants:

```txt
use = wind / progress / cycle / focus
state = calm / normal / live / alert / critical
directional = true / false
```

### 3.4 AmbientTimeline

Variants:

```txt
dataType = weather / schedule / homeAir
density = calm / normal / live / alert / critical
withPeakSummary = true / false
```

## 4. Layer naming convention

Use names that help engineering handoff:

```txt
PA/AtmospherePanel/normal/day
PA/SignalCard/metric/alert
PA/LumenRing/wind/live
PA/DensityField/normal
PA/TextSummary/visualAlt
```

## 5. Auto-layout rules

| Component | Layout rule |
|---|---|
| AtmospherePanel | Vertical auto-layout, hero visual absolute/background layer |
| SignalCard | Vertical auto-layout, fixed min height, flexible caption |
| LumenRing | Fixed aspect ratio, text slot outside SVG/ring |
| AmbientTimeline | Horizontal bars + text summary row |
| FlowDock | Horizontal auto-layout, 44px min touch targets |

## 6. Accessibility annotations in Figma

Each component should include a hidden/annotation layer named `A11y Summary`.

Example:

```txt
오늘의 공기 시각 요약: 안정 상태입니다. 24도, 습도 62%, 풍속 3.2m/s, AQI 18입니다. 짧은 환기 후 집중하기 좋은 상태입니다.
```

This keeps designers from treating accessibility text as an engineering-only task.

## 7. Included files

- `figma/perfora-air.experimental-figma.variables.v1.1.json`
- `figma/perfora-air.experimental-figma.component-matrix.v1.1.json`
- `figma/perfora-air.experimental-figma.preview.v1.1.svg`

---

# Ambient Surface — WeatherON 사용성 검증 계획 v1.1

**갱신일:** 2026-09-12
**상태:** 테스트 설계 완료, 실행·결과 없음
**대상:** 홈 → 날씨 상세 → 출발의 내부 프로토타입

## 1. 목적과 참가자

환경 표현이 WeatherON의 준비 판단을 돕는지, 정적 상태에도 고유 디자인이 유지되는지 확인함. 초기 5–8명은 탐색 표본임. 날씨를 보고 옷차림·우산·출발을 정하는 사용자를 모집하고, 큰 글자·동작 감소·화면 읽기를 사용하는 참가자를 포함함. 이 표본으로 전체 사용자 접근성을 대표하지 않음.

## 2. 비교 방식

- A는 현재 WeatherON UI, B는 Ambient Surface 후보임. 기능·문구·데이터·지역·시각·기기 크기를 같게 유지함.
- 참가자 절반은 A→B, 나머지는 B→A 순서로 제시함. 동등 난도의 시나리오를 교차 배정해 정답 학습을 줄임.
- T1의 5초 노출 동안 설명·발화 요청을 하지 않음. 화면을 가린 뒤 준비 행동과 근거를 물음. 이유 설명은 시간 측정 종료 후 받음.
- 태스크 전에 패턴 의미나 브랜드 컨셉을 가르치지 않음. ‘바람의 탑’ 설명을 이해해야 쓸 수 있다면 실패임.
- 데이터·기대 행동·정답 근거를 시나리오 시트에 먼저 적음. 답이 여러 개면 허용 답을 사전 정의함. 출처·시각·단위가 없는 테스트 데이터는 사용하지 않음.

## 3. 과제와 목표

| ID | 과제 | 성공 조건 | 탐색 목표 |
|---|---|---|---|
| T1 | 홈을 5초 보고 오늘 준비할 것 말하기 | 행동과 화면 속 근거 1개를 올바르게 말함 | 80% 이상, 현재 UI보다 정답률이 낮지 않음 |
| T2 | 현재 맑음·오후 강수 예보 구분하기 | 현재 비로 오해하지 않고 해당 예보 시각·확률을 찾음 | 80% 이상 |
| T3 | 출발 화면에서 다음 행동 찾기 | 출발 시각·준비 이유를 읽고 지도 앱에서 길찾기 선택 | 80% 이상, 허구 경로를 읽었다는 오해 없음 |
| T4 | 정보 없음·오래된 값·특보 구분하기 | 미확인을 좋음으로 해석하지 않고 시각/특보 이유와 가능한 행동을 찾음 | 80% 이상, 샘플·결측을 실시간 정상으로 오인한 사례 0 |
| T5 | 정적·동작 감소·투명도 감소·큰 글자에서 반복하기 | 상태·근거·행동이 보존되고 조작 가능 | 참가자 판단 일치 80% 이상, 구현의 중요 정보 손실 0 |
| T6 | 로고·제품명·모션 없이 화면군 묶기 | 같은 WeatherON 후보의 홈·상세·출발을 묶고 공통 형태·위계 이유 설명 | 80% 이상, 단순 색상 일치만 성공 근거로 인정하지 않음 |

T6는 같은 데이터로 만든 일반 무광 카드 비교군도 함께 섞어 수행함. 기본 테마를 맞춘 뒤 흑백 보조 비교로 색상 암기 영향을 확인함. ‘네온이 아니다’, ‘차분하다’만으로 WeatherON 독자성을 통과 처리하지 않음. 대표 이유는 수평 구조·ON 포인트·준비 위계·환경 표현과의 연결인지 기록함. 이는 프로젝트 내 일관성 검증이며 시장 전체의 독창성 증명은 아님.

## 4. 기록과 판정

[점수표](tests/perfora-air.experimental-usability.scorecard.v1.1.json)에 맞춰 참가자별 순서·태스크·성공 여부·결정 시간·오해·확신도·피로도를 기록함. 결과는 `성공 인원/전체 인원`과 중앙값을 함께 제시함. 80% 조건의 최소 인원은 올림 처리함(5명 중 4명, 8명 중 7명).

- T1–T4 실패: 정보 위계·문장·근거 노출부터 수정함.
- T5 실패: 정보 손실·읽기 순서·터치 영역을 수정함. 패턴을 강화하지 않음.
- T6 실패: 수평 구조·ON 포인트·화면 간 연결을 수정함. 블러·글로우 추가로 대응하지 않음.
- 시각 피로도 평균 목표는 5점 중 2.5 이하임. 심한 불편 사례는 평균에 묻지 않고 개별 원인을 기록함.
- 색/패턴만으로 정답을 유도했거나 중요한 정보가 사라졌으면 전체 평균과 무관하게 해당 변형의 채택을 보류함.

## 5. 별도 필수 QA

사용성 테스트와 별도로 라이트/다크 × 지역 낮/밤, 부분 결측·오프라인·새 지역 로딩, 큰 글자, VoiceOver/TalkBack, 저전력 상태를 검사함. 모션·투명도를 꺼도 문장·단위·선택 시각이 같아야 함. 스크린샷으로 화면 읽기 동작이나 접근성 적합성을 확정하지 않음.

프로토타입 UI 검증은 In-app browser 우선임. React Native 후보는 실제 iOS/Android에서 별도 확인함. 웹·iOS 결과로 Android 통과를 대신하지 않음.

---

# WeatherON Adoption Scope Decision

**갱신일:** 2026-09-12
**상태:** 실험 설계 기준. 제품 채택·앱 적용은 미완료
**기준:** [WeatherON 디자인 방향](docs/01_experimental_direction_brief.md)

## 1. 결정

Do **not** replace the current WeatherON MVP/launch UI wholesale.

Project Wind는 WeatherON 고유 디자인을 만드는 트랙임. 첫 실험은 **홈 → 날씨 상세 → 출발**에서 환경 변화가 준비 행동으로 이어지는지 확인함. 스마트홈·실내 공기·일정 관리 확장은 보류함.

```txt
기존 데이터·기능 확인 → 동일 정보 목업 비교 → 내부 프로토타입
→ 사용성·접근성·기기 검증 → 채택 ADR → 제품 적용
```

사용자 설정에 새 디자인 실험 토글을 추가하지 않음. 내부 프리뷰에서 비교하며, 이후 제한 배포가 필요할 때만 배포 수단을 결정함.

## 2. 단계와 산출물

| 단계 | 작업 | 다음 단계 진입 기준 |
|---|---|---|
| 0 | 이번 문서·기획 갱신 | 컨셉·브랜드·데이터 제한을 하나의 기준으로 연결 |
| 1 | 홈 라이트/다크, 동일 상태의 상세·출발 목업 | 고유 문법과 실제 기능 보존, 정상·결측·오래된 값 상태 포함 |
| 2 | 기존 WeatherON 프리뷰에 내부 프로토타입 구성 | 기존 provider/추천 결과 재사용, 별도 범용 압력 점수 배제 |
| 3 | 비교 사용성·정적/동작 감소·큰 글자 검증 | 사용성 계획의 준비 판단·독자성 목표 확인, 정보 손실 0 |
| 4 | React Native 적용 후보를 iOS/Android에서 검증 | 화면 읽기·VoiceOver/TalkBack·성능·데이터 일치 기록 |
| 5 | 채택 ADR로 범위 확정 | 통과·미통과 항목과 남은 범위를 명시 후 제품 적용 결정 |

2026-09-12 현재 완료 범위는 단계 0임. 목업 승인과 기기 검증을 이번 문서 변경으로 대체하지 않음.

## 3. 화면별 채택 범위

| 영역 | 첫 적용 후보 | 경계 |
|---|---|---|
| 홈 | AtmospherePanel의 상태·기온·준비 문장 | 홈 기능과 목적지·코디 진입 보존 |
| 날씨 상세 | AmbientTimeline, 필요한 SignalCard | 현재·시간별·주간 예보 보존. 단일 지표와 단위 명시 |
| 바람 | 풍속 수치와 정적 변화 표현 | 풍향 계약 없는 동안 LumenRing·방향 화살표 보류 |
| 출발 | 준비 문장과 출발 시각의 공통 위계 | 지도 앱에서 길찾기 주 행동 하나. 실제 추정 계약 이상 정보 생성 금지 |
| 코디·MY | 검증 후 표면·타입·선택 상태 확장 | 첫 단계에서 새 기능이나 전용 환경 그래프 추가 없음 |
| ON Square | 기존 아트 바이블의 일러스트 | 공극·경고·날씨 수치 대신 캐릭터를 쓰지 않음 |

## 4. 데이터와 구현 경계

- `WeatherSnapshot` + `WeatherProviderResult` + 기존 추천 결과를 입력으로 삼음. 필요한 표현별 필드·단위·시각·지역·가용성을 [방향서 5장](docs/01_experimental_direction_brief.md#5-weatheron-전용-데이터--표현-계약)에 정의함.
- 현재 없는 풍향·AQI·시간별 습도·실내 센서를 필수로 요구하지 않음. 대체값을 만들어 채우지 않음.
- `data/*.ts`, React `src/dataMap.ts`, SwiftUI starter는 이전 범용 실험임. 이번 WeatherON 설계의 완성 구현으로 가져오지 않음.
- 토큰 경로·컴포넌트 계약은 v1.0 stable 기준을 유지함. WeatherON 색·타입 매핑은 목업 비교 후 확정함.
- 네이밍은 Ambient Surface로 결정된 상태임. 이번 디자인 개선에서 명칭 변경을 채택 조건으로 다시 열지 않음.

## 5. 검증·계측

첫 검증은 [사용성 계획](docs/05_usability_test_plan.md)과 [점수표](tests/perfora-air.experimental-usability.scorecard.v1.1.json)로 기록함. 신규 분석 이벤트·원격 수집은 이번 범위에 추가하지 않음. 실제 제한 배포가 결정되면 기존 계측의 재사용 여부부터 확인함.

실험 통과는 전면 교체 승인을 뜻하지 않음. 검증된 화면·상태 범위만 채택 ADR에 기록함.

---

# Ambient Surface Implementation Package v1.1 experimental

> **2026-09-12 적용 제한:** 아래 예제는 7월 범용 연구 starter의 사용 이력임. `evaluateAtmosphere()`와 SwiftUI mapper를 WeatherON 제품 규칙으로 직접 채택하지 않음. [데이터 매핑의 알려진 차이](docs/02_experimental_data_to_atmosphere_mapping.md)와 [현재 제품 설계](docs/01_experimental_direction_brief.md)를 먼저 확인함. 현재 앱은 React Native이며 기존 WeatherSnapshot·provider·추천 로직을 재사용하는 연결 설계가 필요함. 새 방향의 네이티브 구현 완료를 의미하지 않음.

**Date:** 2026-07-15
**Status:** Experimental starter implementation
**Targets:** React + SwiftUI

## 0. Purpose

This package turns the v1.1 experimental design rules into starter code. It is not a full production library yet, but it gives engineering a concrete shape for testing the system in WeatherON or another prototype.

## 1. Included implementation

```txt
implementation/
├─ react/
│  ├─ package.json
│  ├─ README.md
│  └─ src/
│     ├─ index.ts
│     ├─ types.ts
│     ├─ dataMap.ts
│     ├─ visualSummary.ts
│     ├─ AtmospherePanel.tsx
│     ├─ SignalCard.tsx
│     ├─ LumenRing.tsx
│     ├─ AmbientTimeline.tsx
│     └─ perfora-air-react.css
└─ swiftui/
   ├─ README.md
   └─ PerforaAirComponents.swift
```

## 2. Implementation principles

| Principle | Code rule |
|---|---|
| Matte Air | CSS/SwiftUI backgrounds use opaque or near-opaque surfaces first |
| Soft Density | Pattern layer is a pseudo/background layer and can be hidden |
| Quiet Signal | Alert visual is constrained; text carries state |
| Text First | Components require `summary` or `accessibleSummary` |
| Data Traceability | Use `evaluateAtmosphere()` helper before rendering |

## 3. React usage

```tsx
import { AtmospherePanel, evaluateAtmosphere } from './perfora-air';
import './perfora-air-react.css';

const atmosphere = evaluateAtmosphere({
  weather: { temperatureC: 24, humidityPct: 62, windSpeedMs: 3.2, windDirectionDeg: 315, aqi: 18, pm25: 18 },
  homeAir: { co2ppm: 720, indoorHumidityPct: 62 },
  dayContext: { eventsNext12h: 4, nextDeadlineHours: 9, notificationUrgency: 1 }
});

<AtmospherePanel
  title="Yokohama"
  eyebrow="오늘의 공기"
  state={atmosphere.state}
  summary={atmosphere.summary}
  recommendation={atmosphere.recommendation.label}
  accessibleSummary={atmosphere.accessibleSummary}
  metrics={[
    { label: '습도', value: 62, unit: '%' },
    { label: '풍속', value: 3.2, unit: 'm/s' },
    { label: 'AQI', value: 18 }
  ]}
/>
```

## 4. SwiftUI usage

```swift
let input = PAAtmosphereInput(
    temperatureC: 24,
    humidityPct: 62,
    windSpeedMs: 3.2,
    windDirectionDeg: 315,
    aqi: 18,
    pm25: 18,
    co2ppm: 720,
    eventsNext12h: 4
)
let result = PerforaAirMapper.evaluate(input)

PAAtmospherePanel(result: result)
```

## 5. Validation needed before production

- Run real TypeScript build in the WeatherON stack.
- Run SwiftUI preview on target iOS versions.
- Add visual regression tests.
- Add VoiceOver/TalkBack manual checks.
- Measure animation cost on low-end devices.

---

# Ambient Surface Naming Decision and Trademark Record

**Screening date:** 2026-07-15

**Decision date:** 2026-07-16

**Status:** Naming decided; historical screening retained

**Source of truth:** `../../NAMING.md`

## 0. Final naming system

| Role | Final name |
|---|---|
| Project | Project Wind |
| Design system | Ambient Surface |
| Visual material | Matte Air |
| Core principles | Soft Density · Quiet Signal · Text First |

`Ambient Surface` is the official design-system name. It was selected because it directly describes an interface layer that responds to environmental context without competing with content.

`Matte Air` names the visual material inside Ambient Surface: diffused light, low-glare translucency, restrained depth, and soft atmospheric separation.

`Perfora Air` is no longer a public-name candidate. It remains only as a legacy codename and compatibility namespace in v1.x files, tokens, CSS custom properties, and implementation types.

## 1. Naming architecture

Use the hierarchy as written:

```txt
Project Wind
└─ Ambient Surface — design system
   ├─ Matte Air — visual material
   └─ Soft Density · Quiet Signal · Text First — core principles
```

Preferred display form:

```txt
Project Wind — Ambient Surface
Built with Matte Air
Soft Density · Quiet Signal · Text First
```

Do not use `Matte Air` as the design-system name or append `Design System` to every product-facing mention. Use `Ambient Surface Design System` only when the category needs to be explicit.

## 2. Legacy compatibility

The following identifiers remain frozen through the v1.x line to avoid breaking existing adopters:

- package and file paths containing `perfora_air` or `perfora-air`
- CSS custom properties beginning with `--pa-`
- Swift/TypeScript identifiers beginning with `PA` or `PerforaAir`
- package scopes such as `@perfora-air/*`

New prose, release titles, Figma descriptions, and metadata display names must use `Ambient Surface`. Renaming compatibility identifiers requires a separately versioned migration plan.

## 3. Historical candidate screening

The earlier search was a preliminary knockout screen, not a legal opinion or clearance memo. Its purpose was to reduce obviously crowded candidates before the naming decision.

| Candidate | Historical outcome |
|---|---|
| Ambient Surface | Selected as the descriptive design-system name |
| Matte Air | Selected as the visual-material name |
| Perfora Air | Retained only as a legacy codename and namespace |
| Poravela | Not selected |
| Aervel | Not selected; later exact-name software usage increased collision risk |
| Luvaira | Not selected; later exact-name commercial usage increased collision risk |
| AerVeil, Poralux | Not selected |
| Veyra, Aivora, Aevora, Aerium | Avoided because existing software, service, or technology signals were found |

The previous recommendation to develop a separate coined external mark is superseded by the 2026-07-16 decision. No candidate shortlist remains active.

## 4. Trademark boundary

`Ambient Surface` and `Matte Air` are intentionally intuitive and descriptive. The decision establishes the project's naming system; it does not claim exclusive trademark availability.

Before a public commercial launch or filing:

1. Search exact, phonetic, spacing, and translation variants in official trademark databases.
2. Review goods and services in relevant Nice classes, especially Classes 9 and 42.
3. Check domains, package registries, design communities, and app stores.
4. Obtain jurisdiction-specific legal clearance.

## 5. Official search references

- USPTO Likelihood of Confusion guidance: https://www.uspto.gov/trademarks/search/likelihood-confusion
- WIPO Nice Classification: https://www.wipo.int/en/web/classification-nice
- WIPO Global Brand Database: https://www.wipo.int/en/web/global-brand-database
- KIPRIS trademark search: https://www.kipris.or.kr/khome/search/searchResult.do?tab=trademark

---

# Static Validation Report

- `figma/perfora-air.experimental-figma.variables.v1.1.json`: ok
- `figma/perfora-air.experimental-figma.component-matrix.v1.1.json`: ok
- `data/perfora-air.experimental-data-map.v1.1.json`: ok
- `data/perfora-air.experimental-components.v1.1.json`: ok
- `data/perfora-air.experimental-brand-candidates.v1.1.json`: ok
- `tests/perfora-air.experimental-usability.scorecard.v1.1.json`: ok
- `../perfora_air_v1_0_package/perfora-air.tokens.v0.1.json`: ok
- `../perfora_air_v1_0_package/perfora-air.components.v0.1.json`: ok
- `implementation/react/package.json`: ok
- `implementation/react/src/AtmospherePanel.tsx`: exists
- `implementation/react/src/SignalCard.tsx`: exists
- `implementation/react/src/LumenRing.tsx`: exists
- `implementation/react/src/AmbientTimeline.tsx`: exists
- `implementation/swiftui/PerforaAirComponents.swift`: exists
- `implementation/react/src/dataMap.ts + types.ts + visualSummary.ts`: TypeScript syntax check passed with `tsc --noEmit`.
- `figma/perfora-air.experimental-figma.preview.v1.1.svg`: XML parse passed.
- `implementation/swiftui/PerforaAirComponents.swift`: Source file provided; SwiftUI compile was not run in this Linux environment because SwiftUI framework availability is platform-dependent.
