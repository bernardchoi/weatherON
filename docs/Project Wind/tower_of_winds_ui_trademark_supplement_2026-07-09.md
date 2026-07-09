# 바람의 탑 기반 UI 디자인 시스템 상표 검토 보충 리포트

**작성일**: 2026-07-09  
**대상**: 요코하마 바람의 탑(Tower of Winds) 기반 앱 UI 디자인 플랫폼 / 디자인 시스템 네이밍  
**이전 문서**: `yokohama_tower_of_winds_ui_design_system.md`의 네이밍 파트를 상표 관점에서 재평가

**WeatherON 적용 위치**: Project Wind는 WeatherON 출시 후 대규모 UI 업데이트를 위한 신규 디자인 시스템 연구 프로젝트다. 이 문서는 실제 앱 반영 전 네이밍/상표 리스크를 선별하기 위한 보충 자료이며, 현재 출시 후보 UI 스펙을 즉시 변경하지 않는다.

---

## 0. 결론 요약

이번 추가 조사 기준으로는, 기존 후보 중 **완전히 안전해 보이는 “그린라이트” 후보는 아직 없다.**

가장 중요한 판단 변화는 다음과 같다.

1. **Perfora Air**  
   - 콘셉트 적합도는 여전히 높다.
   - 그러나 `PERFORA`라는 동일 핵심어의 실제 출원·등록·상업적 사용 흔적이 있어, **법적·브랜드 리스크를 중간 이상으로 재조정**한다.
   - 최종 상표로 쓰기 전에는 반드시 공식 DB + 변리사 검토가 필요하다.

2. **Windframe**  
   - 동일명에 가까운 실제 UI/개발자용 툴이 존재한다.
   - **주요 후보에서 제외**하는 것이 맞다.

3. **Vento**  
   - 공기·바람·팬·풍환경 시뮬레이션과 직접적으로 연결된 기존 사용 사례가 많다.
   - 디자인 시스템 이름으로는 **회피 권고**.

4. **Poralux**  
   - 처음에는 비교적 유망해 보였으나, 추가 조사에서 LED 조명 회사, 석재 연마재 제품 등 실제 사용 사례가 확인된다.
   - UI/소프트웨어와 직접 충돌은 낮을 수 있으나, “빛” 콘셉트와 맞물려 **브랜드 혼동·검색 노이즈가 있다**.

5. **Yokaze / Kazeto**  
   - 공개 웹 검색 기준으로는 직접적인 UI/소프트웨어 충돌 신호가 상대적으로 약하다.
   - 다만 일본어 의미, 기존 호텔/개인명/게임 계정 등의 사용 흔적이 있어 **공식 상표 DB 검토 전 조건부 후보**로만 본다.

**실무적 제안**:  
`Perfora Air`는 내부 코드명 또는 컨셉명으로 유지하고, 실제 출원용 브랜드는 한 차례 더 **완전 조어형 네이밍 라운드**를 진행하는 것이 안전하다. 상표 출원 가능성을 높이려면 `Wind`, `Air`, `Light`, `Lumen`, `Glass`, `Flux`, `Grid`, `Surface`, `Kaze`, `Vento`처럼 의미가 직접적인 단어를 핵심 상표로 쓰는 것을 피하는 편이 좋다.

---

## 1. 법적 판단 프레임

### 1.1 상표의 핵심 기준

상표는 상품·서비스의 출처를 식별하고 경쟁자와 구분하게 하는 표지다. 상표 등록 거절에서 가장 자주 문제가 되는 것은 **혼동 가능성(likelihood of confusion)**이다. 즉, 기존 상표와 발음, 외관, 의미, 전체적인 상업적 인상이 유사하고, 상품·서비스도 관련되어 있으면 소비자가 동일 출처로 오인할 수 있다.

따라서 이번 검토에서는 단순히 “동일 이름이 있는지”만 보지 않고 다음을 함께 본다.

- 동일·유사 명칭 존재 여부
- 발음·철자·의미·상업적 인상 유사성
- UI 디자인 시스템과 관련될 수 있는 상품·서비스 분류
- 소프트웨어, SaaS, 디자인 툴, 개발자 툴, 시각 디자인, 조명/공기/센서 영역과의 거리
- 공식 등록 여부뿐 아니라 일반 웹상 사용, 제품명, 회사명, 도메인, 앱명, 게임명 등 common-law 리스크

### 1.2 이번 프로젝트의 예상 상품·서비스 분류

이 디자인 시스템이 실제 제품으로 발전할 경우, 다음 분류가 중요하다.

| 분류 | 적용 가능성 | 예시 |
|---|---:|---|
| Class 9 | 높음 | 다운로드 가능한 UI 컴포넌트 라이브러리, 디자인 토큰 패키지, 플러그인, 앱, 소프트웨어 |
| Class 42 | 매우 높음 | SaaS, 온라인 디자인 시스템 플랫폼, UI/UX 디자인 서비스, 소프트웨어 디자인·개발, 비다운로드형 디자인 툴 |
| Class 41 | 중간 | 디자인 시스템 교육, 워크숍, 온라인 강의, 출판 콘텐츠 |
| Class 35 | 낮음~중간 | 디자인 컨설팅의 사업·마케팅 측면, 브랜드 컨설팅, 광고/홍보 서비스 |

**핵심은 Class 9와 Class 42다.** 특히 디자인 시스템이 Figma kit, npm package, 웹 기반 플랫폼, AI UI builder, 디자인 토큰 관리 도구 등으로 확장되면 기존 소프트웨어·디자인 툴 상표와 충돌할 가능성이 커진다.

---

## 2. 후보별 상표 리스크 재평가

### 리스크 등급 기준

| 등급 | 의미 |
|---|---|
| Low | 공개 검색상 직접 충돌이 약함. 그래도 공식 DB 검토 필요 |
| Low-Medium | 직접 충돌은 약하지만 동일·유사 사용이 일부 있음 |
| Medium | 유사 사용·상업적 사용이 확인되며 브랜드 리스크 존재 |
| Medium-High | 직접 관련 분야 또는 강한 동일 핵심어가 존재 |
| High | 동일/유사 명칭이 관련 시장에서 사용됨. 회피 권고 |
| Very High | 사실상 같은 시장·고객층에서 사용 중. 사용 회피가 합리적 |

---

### 2.1 Perfora / Perfora Air

| 항목 | 판단 |
|---|---|
| 콘셉트 적합도 | 매우 높음 |
| 식별력 | 중간~높음. 다만 `perforation`에서 연상되어 완전 조어는 아님 |
| 확인된 사용 | 미국 `PERFORA` 출원, 인도 `Perfora` 구강관리 브랜드/상표 사용 흔적 |
| 관련성 | 직접 UI/소프트웨어는 아니지만, 핵심 단어가 동일 |
| 리스크 | **Perfora 단독: High / Perfora Air: Medium-High** |
| 권고 | 최종 브랜드로 바로 채택하지 말 것. 내부 코드명 또는 컨셉명으로만 유지 권고 |

`PERFORA`는 미국에서 종이 베이킹컵 관련 출원 흔적이 있고, 인도에서는 구강관리 브랜드 `Perfora`의 상표 등록/상업적 사용 흔적이 확인된다. 상품군은 UI/소프트웨어와 직접 같지는 않지만, `Perfora Air`의 지배적 요소가 `Perfora`라는 점이 문제다. 상표 심사에서는 단어를 그대로 포함하는 복합표지가 기존 표지와 유사한 상업적 인상을 만들 수 있는지 검토될 수 있다.

**법적 판단**:  
`Perfora Air`는 완전히 배제할 후보는 아니지만, “가장 안전한 출원 후보”는 아니다. 특히 인도, 글로벌 소비자 시장, 웰니스/공기질 앱, 스마트홈/헬스 영역으로 확장할 경우 기존 구강관리 브랜드와 검색·브랜드 충돌이 생길 수 있다.

---

### 2.2 Poralux

| 항목 | 판단 |
|---|---|
| 콘셉트 적합도 | 높음. `pore + lux` 구조로 펀칭·빛을 잘 암시 |
| 식별력 | 중간~높음 |
| 확인된 사용 | LED 조명 회사, Tenax 석재 연마재 제품, 오래된 법률 문헌상 `Poralux/Luxafor` 언급 |
| 관련성 | 직접 UI/소프트웨어는 아니나, `lux`와 조명 사용례가 콘셉트상 가까움 |
| 리스크 | **Medium** |
| 권고 | 조건부 후보. 공식 Class 9/42 검색이 깨끗할 때만 유지 |

`Poralux`는 조어감이 있고 컨셉과도 잘 맞지만, 실제 조명·연마재 영역에서 사용이 확인된다. UI 디자인 시스템이 “빛”을 핵심 은유로 쓰기 때문에 조명 영역과 완전히 무관하다고 보기 어렵다. 다만 법적 혼동 가능성은 상품·서비스의 관련성에 크게 좌우되므로, 소프트웨어/디자인 시스템 영역에서 공식 등록 충돌이 없다면 사용 가능성은 남아 있다.

**법적 판단**:  
`Poralux`는 `Perfora Air`보다 콘셉트 설명력이 강하지만, 상표적으로 아주 깨끗하지는 않다. “출원 검토 후보”로는 둘 수 있으나 1순위로 밀기에는 애매하다.

---

### 2.3 Windframe

| 항목 | 판단 |
|---|---|
| 콘셉트 적합도 | 중간~높음 |
| 식별력 | 중간. `wind + frame` 구성이라 설명적 요소가 있음 |
| 확인된 사용 | Tailwind CSS 기반 AI visual builder / 개발자·디자이너용 툴 |
| 관련성 | UI, 웹 제작, 개발자 도구, 디자인 툴과 직접 관련 |
| 리스크 | **Very High** |
| 권고 | 주요 후보에서 제외 |

`Windframe`은 이미 Tailwind CSS 기반의 AI/visual builder로 사용되고 있으며, 개발자와 디자이너를 대상으로 한다. 우리가 만들려는 디자인 시스템·UI 플랫폼의 시장과 거의 겹친다.

**법적 판단**:  
`Windframe`은 회피가 맞다. 상표 등록 가능성뿐 아니라 제품 검색, 커뮤니티 인지도, 오인 가능성 측면에서도 손해가 크다.

---

### 2.4 Driftlight

| 항목 | 판단 |
|---|---|
| 콘셉트 적합도 | 높음. 빛의 흐름, 부유감 표현에 적합 |
| 식별력 | 중간~높음 |
| 확인된 사용 | Steam 게임, Driftlight App Studio, 레스토랑/의류 등 다중 사용 |
| 관련성 | 앱 스튜디오 및 디지털 콘텐츠 사용례가 있음 |
| 리스크 | **Medium-High** |
| 권고 | 메인 상표로 비추천. 내부 모션 원칙 또는 테마명 정도는 가능 |

`Driftlight`는 감성적으로 좋지만 이미 게임과 앱 스튜디오 등 디지털 영역에서 사용된다. 법적 충돌 가능성과 별개로, 디자인 시스템의 독자 브랜드로 쓰기엔 검색 노이즈가 많다.

---

### 2.5 Noctilum

| 항목 | 판단 |
|---|---|
| 콘셉트 적합도 | 중간~높음. 야간 발광, nocturnal + lumen 연상 |
| 식별력 | 중간~높음 |
| 확인된 사용 | 시계/리미티드 에디션, 게임·팬덤 관련 사용 흔적 |
| 관련성 | UI/소프트웨어와 직접 충돌은 낮아 보임 |
| 리스크 | **Medium** |
| 권고 | 메인 상표보다는 `Night mode`, `dark theme`, `lighting engine`의 서브 브랜드로 적합 |

`Noctilum`은 디자인 언어의 야간 모드 이름으로는 매력적이다. 다만 메인 플랫폼명으로 쓰기에는 어둡고 특정 감성에 치우치며, 기존 사용 흔적도 있다.

---

### 2.6 Kaze Grid / Kazelight / Kaze 계열

| 항목 | 판단 |
|---|---|
| 콘셉트 적합도 | 높음. 일본어 `風` 맥락과 직접 연결 |
| 식별력 | 낮음~중간. `Kaze`는 의미가 명확하고 사용 사례가 많음 |
| 확인된 사용 | KAZE/Kaze Light 계열 마스크, 뷰티, 라이프스타일 제품 등 |
| 관련성 | 직접 UI는 아니나, 상업적 사용과 일반명성/검색 노이즈가 큼 |
| 리스크 | **Medium-High** |
| 권고 | 메인 상표로 비추천. 디자인 원칙 용어로만 제한 권고 |

`Kaze`는 컨셉에는 딱 맞지만, 바로 그 점 때문에 상표로는 약하다. 일본어로 바람을 뜻하는 단어라 콘셉트 설명성이 크고, 다양한 제품에서 이미 사용된다.

---

### 2.7 Vento

| 항목 | 판단 |
|---|---|
| 콘셉트 적합도 | 중간~높음. 이탈리아어/스페인어권에서 바람 연상 |
| 식별력 | 낮음~중간. 의미가 직접적이고 기존 사용 많음 |
| 확인된 사용 | 천장팬 브랜드, CFD 풍환경 시뮬레이션 소프트웨어 등 |
| 관련성 | 공기·바람·건축·시뮬레이션 영역과 매우 가까움 |
| 리스크 | **High** |
| 권고 | 회피 권고 |

`Vento`는 이미 공기·팬·풍환경 시뮬레이션과 연결되어 있다. 바람의 탑 기반 UI라는 콘셉트와 너무 직접적으로 겹쳐 상표 식별력과 충돌 위험이 모두 좋지 않다.

---

### 2.8 Porelight / Perfolux / Oriflux / Aerolattice 등 추가 탐색 후보

| 후보 | 확인된 신호 | 리스크 | 판단 |
|---|---|---:|---|
| Porelight | Swissreg 기반 active trademark 흔적 | High | 회피 |
| Perfolux | 러시아 상표·스위스 회사 등 확인 | High | 회피 |
| Oriflux | 유량 측정 장비, 앱/도메인 사용 | Medium-High | 회피 권고 |
| Aerolattice | 항공/유동 제어 기술 브랜드 사용 | Medium-High | 회피 권고 |
| Aerlumen/Aerlume 계열 | 레스토랑 `Aerlume` 등 유사 사용 | Medium | 보류 |
| Poreon | 일부 비상표적 사용 흔적 | Low-Medium | 추가 조사 가능하나 이름 매력 약함 |

---

## 3. 현재 후보 재순위

### 3.1 법적 리스크까지 반영한 순위

| 순위 | 후보 | 상태 | 이유 |
|---:|---|---|---|
| 1 | **Yokaze** | 조건부 신규 후보 | 공개 검색상 직접 UI/소프트웨어 충돌이 약함. 다만 일본어 일반어이므로 공식 검토 필요 |
| 2 | **Kazeto** | 조건부 신규 후보 | 호텔/개인명/구 상표 흔적은 있으나 직접 UI 충돌은 약함. `Kaze` 기반이라 식별력은 제한적 |
| 3 | **Poralux** | 조건부 후보 | 조어감은 좋으나 조명/연마재 사용 흔적 존재 |
| 4 | **Perfora Air** | 컨셉명/보류 | 콘셉트 최적. 하지만 `Perfora` 기존 사용 때문에 최종명으로는 위험 관리 필요 |
| 5 | **Noctilum** | 서브 브랜드 후보 | 야간/발광 테마명으로 적합. 메인명으론 제한적 |
| 제외 | Windframe | 제외 | 직접 관련 UI/개발툴 사용 중 |
| 제외 | Vento | 제외 | 공기/팬/풍환경 시뮬레이션 사용과 직접 가까움 |
| 제외 | Driftlight | 제외 권고 | 앱/게임/기타 상업 사용 다수 |
| 제외 | Kaze Grid | 제외 권고 | `Kaze`의 설명성·사용 사례 많음 |

### 3.2 현실적인 브랜드 전략

가장 합리적인 방향은 다음과 같다.

```txt
Main Mark: 완전 조어형 이름
Descriptor: Atmospheric UI System / Responsive Surface Design System
Internal Concept: Perfora Air / Wind Interface / Ambient Surface
Component Terms: Air Surface, Signal Surface, Data Veil, Lumen Field, Drift Motion
```

즉, **상표는 더 추상적이고 고유하게**, 디자인 철학은 `perforated surface`, `air`, `lumen`, `drift`, `ambient` 같은 설명적 용어로 풀어내는 구조가 좋다.

예를 들어:

```txt
Yokaze
An atmospheric UI system for responsive surfaces.
```

또는:

```txt
Kazeto
A design language for light, density, and invisible context.
```

다만 이 두 후보도 최종 출원 전에는 공식 검색이 필수다.

---

## 4. 출원 전략 제안

### 4.1 우선 출원 대상

제품화한다면 다음 순서로 검토한다.

1. **Word mark / Standard character mark**  
   - 로고보다 먼저 단어 자체를 보호한다.
   - `Perfora Air`, `Yokaze`, `Kazeto` 등은 로고 스타일보다 단어 표장이 중요하다.

2. **Class 42**  
   - 비다운로드형 온라인 디자인 시스템 플랫폼, SaaS, UI/UX 디자인 시스템 서비스, 소프트웨어 디자인·개발 관련 서비스.

3. **Class 9**  
   - 다운로드 가능한 UI kit, 디자인 토큰 패키지, 플러그인, 앱, 컴포넌트 라이브러리.

4. **Class 41**  
   - 디자인 시스템 교육·워크숍·온라인 콘텐츠를 본격 운영할 경우.

5. **Class 35**  
   - 브랜드/디자인 컨설팅, 상업적 운영 컨설팅, 광고성 서비스가 핵심 사업이 될 경우.

### 4.2 출원 전 검색 루틴

최소한 아래 순서가 필요하다.

1. **KIPRIS**  
   - 한글, 영문, 로마자, 유사 발음 검색
   - 예: `YOKAZE`, `요카제`, `夜風`, `KAZETO`, `카제토`, `PERFORA`, `PERFORA AIR`

2. **USPTO**  
   - exact, plural, spacing, hyphen, phonetic variant 검색
   - 예: `PERFORA`, `PERFORA AIR`, `PORALUX`, `YOKAZE`, `KAZETO`, `KAZE`, `KAZELIGHT`

3. **WIPO Global Brand Database / Madrid Monitor**  
   - 국제 출원, 마드리드 기반 출원, 참여 국가 DB 통합 검색

4. **EUIPO / UKIPO / J-PlatPat / CNIPA / IP India**  
   - 출시 지역이 미국·한국만이 아니라면 개별 국가 DB 검색 필요

5. **Common-law 검색**  
   - Google, App Store, Google Play, GitHub, npm, Figma Community, Product Hunt, LinkedIn, domain/social handle

### 4.3 우선권 전략

한국에서 먼저 출원하고 해외 확장을 고려한다면, 최초 출원일을 기준으로 **6개월 우선권 기간**을 관리해야 한다. 이후 Madrid System을 통한 국제출원 또는 국가별 직접 출원을 검토할 수 있다. 글로벌 출시 가능성이 있으면 한국만 먼저 쓰기보다, 한국·미국·일본·EU 중 핵심 시장을 동시에 설계하는 것이 안전하다.

---

## 5. 지금 단계의 법적 판단

### 5.1 바로 버릴 후보

다음 이름은 최종 상표 후보에서 제외하는 것이 합리적이다.

- **Windframe**: 기존 UI/개발자 도구와 직접 충돌 가능성 높음
- **Vento**: 바람·팬·풍환경 소프트웨어와 관련성이 너무 큼
- **Porelight**: active trademark 흔적
- **Perfolux**: 기존 상표·회사 사용 흔적
- **Kaze Grid**: 설명성·다중 사용·검색 노이즈 큼
- **Driftlight**: 앱/게임/상업 사용 다수

### 5.2 조건부로 살릴 후보

- **Perfora Air**  
  - 디자인 컨셉과 가장 강하게 맞지만 법적 리스크가 있다.  
  - 변리사 검토 전에는 외부 공개 브랜드로 확정하지 않는 것이 좋다.

- **Poralux**  
  - 조어감과 시각성이 좋지만 조명/연마재 사용례가 있다.  
  - Class 9/42 공식 검색이 깨끗할 때만 유지.

- **Yokaze**  
  - 직접 충돌 신호는 상대적으로 약하지만 일본어 일반어다.  
  - 일본 시장까지 고려하면 식별력·문화적 적합성 검토 필요.

- **Kazeto**  
  - 직접 소프트웨어 충돌은 약해 보이나 호텔/옛 상표/개인명 사용이 있다.  
  - 발음과 기억성은 괜찮지만, 디자인 시스템의 철학을 충분히 설명하려면 강한 서브카피가 필요하다.

### 5.3 최종 권고

현재 상태에서는 다음 결론이 가장 안전하다.

> **“Perfora Air”를 컨셉명으로 유지하되, 최종 상표는 새 조어 후보군으로 다시 탐색한다.**

새 조어 후보를 만들 때는 다음 원칙을 적용한다.

- 5~8자 정도의 짧은 단어
- 영어·일본어·이탈리아어·라틴어의 일반 단어 직접 사용 회피
- `air`, `wind`, `light`, `lumen`, `flux`, `glass`, `grid`, `surface` 단어를 핵심 상표로 직접 넣지 않기
- 의미는 태그라인과 제품 설명에서 풀기
- 단어 표장으로 봤을 때 발음·철자·검색성이 좋아야 함
- Figma, npm, GitHub, design system, UI builder 시장의 기존 명칭과 멀어야 함

---

## 6. 다음 네이밍 라운드 방향

### 6.1 피해야 할 네이밍 패턴

| 패턴 | 이유 |
|---|---|
| Wind + 명사 | 기존 사용 많고 설명적 |
| Air + 명사 | Apple Air, 항공·공조·공기청정 관련 충돌 많음 |
| Lumen/Luma/Lux + 명사 | 조명·디자인·뷰티·테크 사용이 많음 |
| Flux + 명사 | 개발자/AI/테크 제품명에서 과밀 |
| Glass + 명사 | Liquid Glass와 너무 가까워 독립성 약함 |
| Kaze + 명사 | 일본어 바람 의미가 직접적이고 사용 사례 많음 |
| Material + 명사 | Google Material Design 연상 강함 |

### 6.2 좋은 방향

| 방향 | 예시 구조 | 설명 |
|---|---|---|
| 완전 조어 | `Cavora`, `Avenri`, `Solvra`류 | 의미를 직접 담지 않고 브랜드가 의미를 획득하게 함 |
| 약한 암시형 조어 | `Yokaze`, `Kazeto`류 | 문화적 맥락은 있으나 직접 기술어는 아님 |
| 내부 용어 분리 | `Main brand + Air Surface` | 상표는 추상화하고 컨셉 용어는 설명적으로 사용 |
| 제품군 구조 | `Main brand Studio`, `Main brand Tokens` | 메인 상표 보호 후 모듈 확장 용이 |

---

## 7. 참고 자료

- USPTO, “Likelihood of confusion”  
  https://www.uspto.gov/trademarks/search/likelihood-confusion
- USPTO, “Why search for similar trademarks?”  
  https://www.uspto.gov/trademarks/basics/why-search-similar-trademarks
- USPTO, “Basis”  
  https://www.uspto.gov/trademarks/apply/basis
- WIPO, “Global Brand Database”  
  https://www.wipo.int/en/web/global-brand-database
- WIPO, “Nice Classification”  
  https://www.wipo.int/en/web/classification-nice
- WIPO, “Madrid System”  
  https://www.wipo.int/en/web/madrid-system
- WIPO, Paris Convention, priority period  
  https://www.wipo.int/wipolex/en/text/288514
- KIPO, “Requirements for trademark registration”  
  https://www.kipo.go.kr/en/HtmlApp?c=930005&catmenu=ek04_01_01
- Windframe official site  
  https://windframe.dev/
- Devwares / Windframe  
  https://www.devwares.com/
- Justia, PERFORA trademark application  
  https://trademarks.justia.com/990/23/perfora-99023312.html
- QuickCompany, Perfora / IP India mirror  
  https://www.quickcompany.in/trademarks/5393360-perfora
- Vento ceiling fan brand  
  https://en.ventotw.com/data-36588
- Vento CFD  
  https://www.vento-cfd.com/
- Steam, Driftlight  
  https://store.steampowered.com/app/4535350/Driftlight/
- Driftlight App Studio  
  https://driftlightapps.com/
- Moneyhouse / Swissreg reference, PORELIGHT  
  https://www.moneyhouse.ch/en/company/topakustik-ag-4585295741
- LinkedIn, PORALUX TECHNOLOGY CO., LTD.  
  https://www.linkedin.com/company/poralux-outdoorlighting

---

## 8. 한 줄 결론

**디자인적으로는 `Perfora Air`가 가장 강하지만, 상표적으로는 아직 위험하다. 지금은 `Perfora Air`를 컨셉명으로만 두고, 공식 출원 후보는 더 고유한 조어형 이름으로 새로 만드는 것이 가장 안전하다.**
