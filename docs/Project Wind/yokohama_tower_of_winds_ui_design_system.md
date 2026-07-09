# 요코하마 바람의 탑 기반 앱 UI 디자인 시스템 심화 분석

**문서 목적**  
요코하마 바람의 탑(Tower of Winds in Yokohama)을 앱 UI 디자인 언어로 번역하고, Liquid Glass·Material 3처럼 독립적인 디자인 플랫폼으로 발전시킬 수 있는 방향을 정리한다. 특히 **디자인 철학, 시각 언어, 인터랙션 원칙, 디자인 토큰, 컴포넌트 체계, 네이밍 후보군**을 함께 다룬다.

**WeatherON 적용 위치**  
Project Wind는 WeatherON의 현행 MVP/정식 출시 UI 스펙을 즉시 대체하는 문서가 아니다. 이 문서는 출시 후 대규모 UI 업데이트를 위한 신규 디자인 시스템 연구 트랙이며, 현재 구현 기준은 `docs/design/WeatherON_UI_Design_Spec.md`를 유지한다. Project Wind는 별도 검증 단계에서 토큰, 표면, 모션, 컴포넌트로 재정리한 뒤 차기 UI 개편 후보로 편입한다.

**조사 기준일**: 2026-07-09  
**주의**: 네이밍 조사는 일반 웹 검색 기반의 1차 스크리닝이며, 상표권·도메인·법률 검토를 대체하지 않는다. 실제 출시 전에는 USPTO, WIPO Global Brand Database, KIPRIS 등 공식 상표 DB와 법률 검토가 필요하다.[^uspto][^wipo][^kipris]

---

## 1. 출발점: 바람의 탑을 UI로 읽는 방식

요코하마 바람의 탑은 1986년 이토 도요오(Toyo Ito & Associates)가 설계한 프로젝트다. 공식 프로젝트 정보에 따르면 위치는 일본 가나가와현 요코하마시 니시구이며, 기간은 1986년 3월부터 11월, 구조는 철골조로 기록되어 있다.[^toyoito] 여러 건축 매체는 이 작품을 기존 도시 설비를 감싸고, 낮에는 알루미늄 표피를 가진 불투명한 원통으로, 밤에는 바람·소음 등 환경 입력을 빛으로 변환하는 장치로 설명한다.[^archdaily][^architectuul]

이 프로젝트를 UI로 번역할 때 중요한 것은 “탑 모양을 앱에 가져오는 것”이 아니다. 핵심은 다음의 구조적 발상이다.

> **보이지 않는 도시의 상태를, 빛·투명도·밀도·리듬으로 번역한다.**

바람의 탑은 도시 인프라를 숨기는 장식물이 아니라, 인프라를 **도시적 감각 장치**로 바꾼 사례다. 앱 UI에서도 같은 태도가 가능하다. 날씨, 실내 공기질, 일정 밀도, 시장 변동성, 신체 리듬, 알림 강도, 주변 소음 같은 비가시적 데이터를 단순한 숫자와 그래프로만 보여주지 않고, 화면의 표면감·흐름·빛·긴장도로 먼저 감지하게 만드는 것이다.

---

## 2. 기존 디자인 플랫폼과의 비교

Liquid Glass는 Apple이 소개한 동적 재료로, 유리의 광학적 속성과 유동성을 결합한 인터페이스 방향으로 설명된다.[^liquidglass] Material Design 3는 색, 타이포그래피, 레이아웃, 컴포넌트 등을 포괄하는 디자인 시스템이며, 특히 Dynamic color는 사용자 배경화면이나 앱 콘텐츠에서 색을 추출해 접근 가능한 색상 체계를 생성하는 방식으로 설명된다.[^materialcolor]

바람의 탑 기반 시스템은 이 둘과 다른 축을 가져야 한다.

| 플랫폼 | 핵심 메타포 | 주요 작동 방식 | 강점 | 한계 또는 빈틈 |
|---|---|---|---|---|
| Material 3 | 물질, 표면, 색상 체계 | 톤 팔레트, 동적 컬러, 컴포넌트 규칙 | 확장성, 접근성, 안드로이드 생태계 | 분위기·환경성보다 체계와 실용성 중심 |
| Liquid Glass | 유리, 굴절, 유동성 | 투명 재료, 반사·굴절, 유연한 컨트롤 | 고급스러운 공간감, 플랫폼 통합감 | 과하면 가독성·대비·성능 문제가 생길 수 있음 |
| 바람의 탑 기반 UI | 공기, 도시, 센서, 빛 | 환경 입력 → 표면 밀도·빛·움직임으로 변환 | 맥락 반응성, 감각적 정보 전달, 분위기 기반 UX | 접근성·피로도·데이터 오해 방지 설계가 필수 |

따라서 새로운 디자인 플랫폼의 차별점은 “더 투명한 UI”가 아니라 **맥락에 반응하는 UI 표피**다. Material 3가 색을 개인화하고 Liquid Glass가 화면 재료를 유리화한다면, 이 시스템은 화면을 **환경을 읽는 반응형 피부**로 만든다.

---

## 3. 디자인 플랫폼의 핵심 명제

### 3.1 제안 명제

> **A design language for translating invisible context into responsive surfaces.**  
> 보이지 않는 맥락을 반응형 표면으로 번역하는 디자인 언어.

### 3.2 UI 시스템의 기본 질문

이 시스템은 매 화면에서 다음 네 가지 질문에 답해야 한다.

1. 지금 사용자가 알아야 하는 **보이지 않는 상태**는 무엇인가?
2. 그 상태는 숫자, 그래프, 문장 이전에 어떤 **분위기**로 감지되어야 하는가?
3. 그 분위기는 표면의 **투명도, 밀도, 빛, 움직임** 중 무엇으로 표현할 것인가?
4. 표현이 아름다움을 넘어 실제 의사결정에 도움이 되는가?

### 3.3 핵심 키워드

- **Ambient**: 사용자가 명시적으로 해석하기 전에 감지되는 배경 상태
- **Perforated**: 완전한 투명과 완전한 불투명 사이의 중간 표피
- **Signal**: 데이터 변화, 경고, 피드백, 사용자 행동의 시각적 신호
- **Drift**: 장식적 애니메이션이 아니라 공기처럼 흐르는 미세한 방향성
- **Lumen**: 단순 색상이 아니라 정보 강도를 가진 빛
- **Density**: 긴급도·복잡도·정보량을 표현하는 패턴 밀도
- **Quietness**: 기본 상태는 조용하고, 중요한 변화가 있을 때만 살아남

---

## 4. 바람의 탑에서 추출한 6가지 디자인 원리

### 4.1 낮과 밤의 이중성

바람의 탑은 낮에는 금속성 원통, 밤에는 빛의 구조물처럼 작동한다. UI로 옮기면 단순한 라이트모드/다크모드를 넘어 **맥락에 따른 재료 변화**가 된다.

- 낮: 높은 가독성, 낮은 장식성, 정돈된 정보 구조
- 저녁: 전환 상태, 부드러운 대비, 감정적 톤
- 밤: 발광, 집중, 신호성, 낮은 주변광에 맞춘 대비

### 4.2 펀칭 메탈의 표피성

알루미늄 펀칭 표면은 내부를 완전히 드러내지 않는다. 감추면서 비추고, 막으면서 통과시킨다. UI에서는 이 원리를 **Data Veil**로 번역할 수 있다.

- 흐린 배경보다 더 구조적인 반투명
- 점·격자·입자 패턴으로 데이터 밀도 표현
- 카드·패널·모달의 상태를 패턴으로 구분
- 불필요한 유리 효과 대신 의미 있는 표피 사용

### 4.3 환경 입력의 시각화

바람의 탑은 환경 입력을 조명 패턴으로 바꾸는 구조로 설명된다.[^archdaily][^archlab] 앱 UI에서는 다음과 같이 매핑할 수 있다.

| 입력 데이터 | UI 변환 |
|---|---|
| 바람 방향 | 배경 입자 또는 선형 흐름의 방향 |
| 바람 세기 | 흐름 속도, 모션 진폭 |
| 소음 수준 | 표면 노이즈, 가장자리 떨림 |
| 습도 | 빛 번짐, 표면 탁도 |
| 공기질 | 패턴 밀도와 대비 |
| 일정 밀도 | 카드 간격, 타임라인 압축률 |
| 스트레스/심박 | 펄스 리듬, 표면 안정도 |
| 알림 중요도 | 신호광 강도, 링 확산 |

### 4.4 기술을 숨기지 않는 시적 태도

바람의 탑은 기술을 감춘 것이 아니라 기술을 도시와 대화하게 만든 프로젝트다. 앱 UI에서도 센서, 알고리즘, 데이터 흐름을 완전히 숨기는 대신, 사용자가 부담 없이 이해할 수 있는 감각적 피드백으로 노출할 수 있다.

### 4.5 고정 오브제에서 반응형 시스템으로

일반적인 UI 컴포넌트는 정적이다. 버튼, 카드, 탭, 토글이 사전에 정해진 상태만 가진다. 이 디자인 언어에서는 컴포넌트가 **상황에 따른 분위기 상태**를 추가로 갖는다.

예시:

```txt
Button = default / hover / pressed / disabled
Signal Button = default / hover / pressed / disabled / quiet / active / urgent / saturated / reduced-motion
```

### 4.6 도시성

이 시스템은 자연주의 UI가 아니다. 바람개비, 구름, 잔디, 손그림풍 아이콘으로 가면 약해진다. 더 적절한 방향은 **도시 인프라, 야간 조명, 센서, 금속성, 네온이 아닌 절제된 발광**이다.

---

## 5. 디자인 시스템 구조 제안

가칭으로는 아래에서 네이밍 후보를 더 넓게 검토하되, 설명 편의를 위해 이 문서에서는 임시 이름을 **Perfora System**으로 사용한다.

### 5.1 시스템 구성 레이어

```txt
Perfora System
├─ Philosophy
│  ├─ Reveal the invisible
│  ├─ Atmosphere before detail
│  └─ Quiet by default, alive when needed
├─ Foundations
│  ├─ Color / Lumen
│  ├─ Typography
│  ├─ Grid / Density
│  ├─ Shape / Radius
│  ├─ Surface / Opacity
│  └─ Motion / Flow
├─ Tokens
│  ├─ Surface tokens
│  ├─ Density tokens
│  ├─ Light tokens
│  ├─ Flow tokens
│  ├─ Signal tokens
│  └─ Accessibility tokens
├─ Components
│  ├─ Atmosphere Panel
│  ├─ Signal Card
│  ├─ Data Veil
│  ├─ Lumen Ring
│  ├─ Flow Dock
│  ├─ Context Chip
│  └─ Ambient Timeline
└─ Patterns
   ├─ Sensor-to-surface mapping
   ├─ Day/Dusk/Night theming
   ├─ Calm alerting
   ├─ Reduced motion/transparency
   └─ Context-first dashboard
```

---

## 6. 시각 언어

### 6.1 표면: Perforated Surface

핵심 표면은 유리처럼 단순히 흐리게 처리된 카드가 아니다. 다음 세 가지를 조합한다.

| 표면 타입 | 용도 | 시각 특성 |
|---|---|---|
| **Still Surface** | 일반 정보, 설정, 리스트 | 안정적, 거의 움직이지 않음, 패턴 약함 |
| **Air Surface** | 실시간 상태, 환경 데이터 | 미세한 흐름, 패턴 밀도 변화 |
| **Signal Surface** | 경고, CTA, 주요 변화 | 발광, 링, 짧은 확산 모션 |
| **Veil Surface** | 모달, 오버레이, 세부정보 | 배경을 가리되 상태감은 유지 |
| **Nocturne Surface** | 야간·집중 모드 | 낮은 주변광, 강한 정보 대비, 절제된 발광 |

### 6.2 빛: Color가 아니라 Lumen

기존 UI에서 색은 카테고리, 브랜드, 상태를 표현한다. 이 시스템에서 빛은 **상태 강도**를 표현한다.

- `lumen.low`: 안정, 대기, 읽기 중심
- `lumen.medium`: 정보 변화, 실시간 감지
- `lumen.high`: 주의, CTA, 확인 필요
- `lumen.critical`: 위험, 즉시 행동 필요

중요한 점은 색 하나만으로 상태를 전달하지 않는 것이다. WCAG는 웹 콘텐츠 접근성을 위한 국제 표준으로 쓰이며, W3C는 최신 WCAG 사용을 권장한다.[^wcag] 따라서 색상은 텍스트, 아이콘, 패턴, 명도 대비, 설명 문구와 함께 작동해야 한다.

### 6.3 패턴: Density as Meaning

패턴은 장식이 아니라 의미를 가진다.

| 데이터 상태 | 패턴 번역 |
|---|---|
| 안정 | 넓은 간격, 낮은 대비, 정돈된 방향 |
| 증가 | 점 간격이 좁아짐, 흐름이 선명해짐 |
| 불안정 | 패턴이 미세하게 흔들림 |
| 위험 | 조밀한 패턴 + 명확한 텍스트 경고 |
| 정보 과부하 | 패턴 억제, 카드 정리, 우선순위 강조 |

### 6.4 모션: Air-like, not playful

모션은 귀여운 장식이 아니라 정보의 움직임이다.

| 모션 이름 | 용도 | 느낌 |
|---|---|---|
| `drift` | 배경 상태 변화 | 거의 감지되지 않는 이동 |
| `pulse` | 지속 상태, 심박, 신호 | 호흡처럼 반복 |
| `gust` | 알림, 전환, 강조 | 짧고 명확한 확산 |
| `settle` | 완료, 안정화 | 파동이 가라앉음 |
| `reorient` | 화면 전환 | 레이어 방향 재정렬 |
| `dissolve` | 닫힘, 사라짐 | 증발하듯 사라짐 |

모션은 접근성 설정을 반드시 존중해야 한다. W3C의 Animation from Interactions 해설은 비필수 애니메이션을 끌 수 있는 제어를 제공하거나 사용자 에이전트/운영체제의 reduce motion 기능을 활용할 것을 권장한다.[^wcagmotion] MDN도 `prefers-reduced-motion`이 사용자가 비필수 모션을 줄이도록 설정했는지를 감지하는 CSS 미디어 기능이라고 설명한다.[^mdnmotion]

---

## 7. 디자인 토큰 설계

### 7.1 Core Token Groups

```json
{
  "surface": {
    "opacity": "0.72",
    "blur": "16px",
    "grain": "medium",
    "perforation": "0.38"
  },
  "air": {
    "density": "calm | normal | dense | saturated",
    "flowDirection": "0deg - 360deg",
    "flowSpeed": "still | slow | medium | gust"
  },
  "lumen": {
    "intensity": "low | medium | high | critical",
    "spread": "tight | soft | wide",
    "temperature": "cool | neutral | warm"
  },
  "signal": {
    "urgency": "quiet | notice | alert | critical",
    "pulse": "none | slow | regular | fast"
  },
  "motion": {
    "drift": "0 - 1",
    "gust": "0 - 1",
    "duration": "short | medium | long"
  }
}
```

### 7.2 Semantic Tokens

| 토큰 | 의미 | 예시 |
|---|---|---|
| `surface.ambient.default` | 기본 반응형 표면 | 대시보드 배경 |
| `surface.ambient.quiet` | 정보량이 낮은 상태 | 휴식, 야간, 집중 |
| `surface.ambient.saturated` | 정보량이 높은 상태 | 폭우, 일정 과밀, 시장 급변 |
| `lumen.signal.notice` | 부드러운 정보 신호 | 새 알림 1개 |
| `lumen.signal.alert` | 행동을 요구하는 신호 | CO₂ 높음, 일정 충돌 |
| `density.pattern.low` | 여백 중심 | 안정 |
| `density.pattern.high` | 촘촘한 패턴 | 긴장, 복잡도 증가 |
| `flow.direction.context` | 맥락 기반 방향 | 풍향, 시간 흐름 |
| `motion.gust.alert` | 짧은 경고 모션 | 위험 알림 |
| `a11y.reducedMotion` | 모션 감소 모드 | 시스템 설정 반영 |
| `a11y.reducedTransparency` | 투명도 감소 모드 | 고대비/가독성 확보 |

MDN은 `prefers-reduced-transparency`가 투명·반투명 레이어 효과를 줄이고 싶은 사용자 설정을 감지하는 CSS 미디어 기능이라고 설명한다.[^mdntransparency] 이 시스템은 그 기능을 적극적으로 토큰화해야 한다.

---

## 8. 컴포넌트 체계

### 8.1 Atmosphere Panel

메인 상태를 보여주는 가장 큰 패널. 날씨, 홈 상태, 하루 컨디션, 경기 흐름, 시장 분위기처럼 “전체 상태”를 시각화한다.

**구성**

```txt
[상태 라벨]
[대표 수치 또는 한 문장]
[흐름/밀도/빛 표면]
[보조 지표 2~4개]
[권장 액션]
```

**예시**

```txt
공기가 무겁습니다
습도 78% · CO₂ 높음
표면: 탁한 Veil + 느린 Pulse
액션: 10분 환기하기
```

### 8.2 Signal Card

단일 이벤트나 카드형 정보를 담는다. 일반 카드와 달리 오른쪽 또는 상단에 작은 신호광을 가진다.

| 상태 | 표현 |
|---|---|
| Default | 낮은 패턴, 무발광 |
| Live | 미세한 흐름 |
| Notice | 얇은 빛 테두리 |
| Alert | 짧은 gust + 명확한 문구 |
| Critical | 강한 대비 + 아이콘 + 텍스트 우선 |

### 8.3 Data Veil

모달, 상세 정보, 필터, 설정 오버레이에 사용한다. 유리처럼 배경을 흐리는 것을 넘어, 배경 상태를 약하게 유지한다.

- 배경이 완전히 사라지지 않음
- 주요 정보 대비는 충분히 유지
- 투명도 감소 설정에서는 단색 표면으로 전환
- 패턴은 정보 해석에 방해되지 않을 정도로 제한

### 8.4 Lumen Ring

바람의 탑의 네온 링을 UI 컴포넌트로 번역한 요소. 진행률, 실시간 강도, 상태 변화, 알림 범위를 표현한다.

**사용처**

- 날씨: 바람 세기/강수 접근
- 헬스: 호흡/심박 안정도
- 스마트홈: 공기질 순환
- 스포츠: 득점 기대감, 경기 흐름
- 금융: 변동성 링

### 8.5 Flow Dock

하단 내비게이션 또는 빠른 액션 영역. 고정된 탭바가 아니라 현재 맥락에 따라 활성 영역이 빛으로 부드럽게 강조된다.

### 8.6 Ambient Timeline

시간에 따른 상태 변화를 선형 그래프가 아닌 밀도·빛·간격으로 보여주는 타임라인.

---

## 9. 적용 가능 앱 시나리오

### 9.1 날씨 앱

가장 자연스럽다. 기존 날씨 앱이 온도와 아이콘 중심이라면, 이 시스템은 “공기의 체감”을 먼저 보여준다.

| 데이터 | 표현 |
|---|---|
| 풍향 | 배경 흐름 방향 |
| 풍속 | 입자 속도 |
| 습도 | 표면 탁도와 번짐 |
| 미세먼지 | 패턴 조밀도 |
| 폭우 접근 | 어두운 Veil + 강한 Ring |
| 자외선 | 가장자리 Lumen 강도 |

### 9.2 스마트홈 / 공기질 앱

바람의 탑의 원래 기능적 맥락과 잘 맞는다. 환기, 공조, 물탱크, 도시 설비라는 배경을 스마트홈 대시보드로 자연스럽게 확장할 수 있다.

**핵심 UX**

- 사용자는 숫자보다 먼저 “집 안 공기가 답답하다”를 본다.
- 공기청정기, 제습기, 창문 센서가 하나의 분위기 패널에 연결된다.
- 알림은 위협적이지 않고, 조용하지만 명확하게 행동을 유도한다.

### 9.3 스포츠 라이브 앱

경기 흐름을 숫자로만 보여주지 않고 분위기로 보여준다.

| 상황 | 표현 |
|---|---|
| 투수전 | 낮은 채도, 얇은 긴장 패턴 |
| 찬스 | 베이스 주변 Lumen 집중 |
| 득점 | 짧은 빛 파동 |
| 위기 | 패턴 밀도 증가 + 명확한 텍스트 |
| 경기 종료 | settle 모션 |

### 9.4 생산성 / 일정 앱

일정 앱은 “시간표”가 아니라 “하루의 공기”를 보여줄 수 있다.

| 하루 상태 | 표현 |
|---|---|
| 여유 | 넓은 간격, 낮은 패턴 |
| 회의 과밀 | 카드 압축, 밀도 증가 |
| 마감 임박 | CTA 주변 Lumen 증가 |
| 집중 시간 | 패턴 제거, 표면 안정화 |
| 휴식 권장 | 저자극 표면 + 부드러운 문구 |

---

## 10. 접근성·성능 가드레일

이 디자인 언어는 아름답지만 위험할 수 있다. 투명도, 흐림, 발광, 모션은 잘못 쓰면 가독성과 집중력을 해친다.

### 10.1 필수 규칙

1. **정보를 색이나 빛만으로 전달하지 않는다.**
2. **텍스트 대비를 우선한다.**
3. **중요 정보 위에는 복잡한 패턴을 깔지 않는다.**
4. **모션은 사용자가 줄이거나 끌 수 있어야 한다.**
5. **투명도 감소 설정을 지원한다.**
6. **저사양 기기에서는 실시간 파티클보다 정적 패턴을 사용한다.**
7. **알림 강도가 높을수록 시각 효과보다 명확한 문구를 우선한다.**

### 10.2 Reduced Modes

| 모드 | 변화 |
|---|---|
| Reduced Motion | drift/pulse 제거, 상태 변화는 opacity/shape로 대체 |
| Reduced Transparency | blur/alpha 제거, 단색 카드와 명확한 경계 사용 |
| High Contrast | Lumen 효과 축소, 텍스트와 아이콘 대비 강화 |
| Low Power | 입자·실시간 shader 제거, 정적 패턴 사용 |
| Focus Mode | 패턴 최소화, CTA와 핵심 텍스트만 유지 |

---

## 11. 네이밍 후보군 조사

### 11.1 네이밍 평가 기준

| 기준 | 설명 |
|---|---|
| 개념 적합성 | 바람의 탑의 핵심인 공기·빛·펀칭·도시성·반응성을 담는가 |
| 발음/기억성 | 한국어·영어·일본어 환경에서 부르기 쉬운가 |
| 디자인 시스템성 | 단일 앱 이름이 아니라 플랫폼/언어 이름처럼 들리는가 |
| 시각 확장성 | 로고, 토큰, 컴포넌트 명명으로 확장 가능한가 |
| 차별성 | 이미 흔한 디자인 시스템 이름과 겹치지 않는가 |
| 법적/상표 리스크 | 1차 검색에서 강한 충돌 신호가 있는가 |
| 감성의 정확도 | 너무 자연주의적이거나 사이버펑크적이지 않은가 |

### 11.2 기존 사용 신호가 강한 이름들

아래 이름은 감각적으로는 좋지만, 이미 디자인 시스템·UI 프레임워크·브랜드 사용 사례가 많아 그대로 쓰기에는 조심스럽다.

| 이름 | 장점 | 조사상 리스크 |
|---|---|---|
| **Lumen** | 빛의 단위, 시스템성 좋음 | Lumen이라는 오픈소스 디자인 시스템 및 여러 디자인 시스템 사례가 확인됨[^lumen] |
| **Aura** | 분위기, 발광, 감성 좋음 | Rubrik Aura, Cognite Aura 등 디자인 시스템 사용 사례가 확인됨[^aura][^cogniteaura] |
| **Aether** | 공기·공간감과 잘 맞음 | Aether Design System, Aether UI 등 직접 충돌 사례가 있음[^aether] |
| **Atmosphere** | 콘셉트 적합도 높음 | Boeing Atmosphere, IVAO Atmosphere 등 사용 사례가 있음[^atmosphere][^ivao] |
| **Flux** | 흐름, 변화 의미 강함 | Flux UI 라이브러리/디자인 시스템 사례가 다수 있음[^flux] |
| **Zephyr** | 서풍, 가벼운 바람 | Zephyr 디자인 시스템/프레임워크 사례가 있음[^zephyr] |
| **Aeris** | 공기, IoT와도 어울림 | Aeris는 IoT 기업명 등 강한 기존 브랜드가 있음[^aeris] |
| **Atria** | 건축적 공간감 있음 | Banner Atria Design System이 존재함[^atria] |
| **Luma/Lumina** | 빛·명료성 | Luma/Lumina 디자인 시스템·UI 사례가 많음[^luma][^lumina] |
| **Hikari** | 일본어 光, 빛 | Hikari 디자인/컴포넌트 시스템 사례가 있음[^hikari] |
| **Signal** | 데이터 신호와 적합 | Signal 메신저 브랜드가 매우 강함 |

### 11.3 유망 후보군

#### A. Perfora

**어원/느낌**: perforated surface, perforation, 펀칭 메탈  
**핵심 의미**: 구멍이 난 표면, 투과와 차폐 사이의 UI 재료  
**장점**

- 바람의 탑의 물성에서 직접 출발한다.
- “Material”, “Liquid Glass”처럼 UI 재료 이름으로 들린다.
- 표면·밀도·패턴·빛을 모두 포함할 수 있다.
- 컴포넌트 명명도 쉽다: `Perfora Surface`, `Perfora Veil`, `Perfora Ring`.

**리스크**

- 인도의 구강관리 브랜드 Perfora가 확인된다.[^perfora]
- 단일 단어로는 상표 충돌 검토가 필요하다.
- “perforation”의 의학적 의미 때문에 일부 맥락에서는 딱딱하게 들릴 수 있다.

**확장안**

- **Perfora UI**
- **Perfora System**
- **Perfora Air**
- **Perfora Lumen**
- **Perfora Grid**

**평가**: 가장 콘셉트가 정확하다. 다만 단독 이름보다 **Perfora Air** 또는 **Perfora System**처럼 보강하는 편이 안전하다.

---

#### B. Poralux

**어원/느낌**: pore + lux  
**핵심 의미**: 구멍/공극을 통과하는 빛  
**장점**

- 조어라 차별성이 높다.
- 펀칭 표피와 빛을 동시에 담는다.
- 발음이 비교적 간결하다.
- “lux”가 조도/빛의 느낌을 주기 때문에 UI 재료명으로 적합하다.

**리스크**

- 다소 화장품·조명 브랜드처럼 들릴 수 있다.
- 처음 들으면 의미 설명이 필요하다.

**확장안**

- **Poralux Design Language**
- **Poralux UI**
- **Poralux Surface**

**평가**: 법적·검색 차별성 측면에서는 유망하다. 다만 Perfora보다 바람의 탑과의 직접 연결은 약하다.

---

#### C. Vento

**어원/느낌**: 이탈리아어/스페인어권에서 바람을 연상  
**핵심 의미**: 바람, 흐름, 이동성  
**장점**

- 짧고 부르기 쉽다.
- 공기·흐름·바람과 직접 연결된다.
- 앱 이름으로도 좋고 디자인 플랫폼 이름으로도 가능하다.

**리스크**

- 일반 단어이므로 기존 브랜드·프로젝트 충돌 가능성이 있다.
- 펀칭 메탈·빛이라는 핵심 물성은 약하다.
- 자동차, 여행, 스포츠 계열 이름처럼 들릴 수 있다.

**확장안**

- **Vento Surface**
- **Vento UI**
- **Vento System**
- **Vento Lumen**

**평가**: 대중성은 높지만 독자성은 중간이다. 감성은 좋지만 디자인 시스템으로는 조금 일반적이다.

---

#### D. Windframe

**어원/느낌**: wind + frame  
**핵심 의미**: 바람을 구조화하는 프레임워크  
**장점**

- 디자인 시스템·프레임워크 이름처럼 들린다.
- 바람의 탑을 “공기와 구조의 결합”으로 잘 해석한다.
- 개발자 친화적이다.

**리스크**

- 다소 기술 문서/프론트엔드 프레임워크 이름처럼 느껴질 수 있다.
- 감성적 고급감은 Perfora/Poralux보다 약하다.

**확장안**

- **Windframe UI**
- **Windframe Design System**
- **Windframe Tokens**

**평가**: 프로덕트/개발 생태계로 확장하려면 좋다. 다만 프리미엄 감성은 추가 브랜딩이 필요하다.

---

#### E. Lattice Air

**어원/느낌**: lattice + air  
**핵심 의미**: 공기를 통과시키는 격자 구조  
**장점**

- 펀칭·격자·도시 구조·공기 흐름을 모두 담을 수 있다.
- 건축적이고 시스템적이다.
- B2B/스마트홈/도시 데이터 앱에 잘 어울린다.

**리스크**

- Lattice는 HR 플랫폼, 반도체 기업 등 강한 기존 사용 사례가 많다.[^latticehr][^latticesemi]
- 단독 Lattice는 피하고 결합형으로만 검토하는 편이 낫다.

**확장안**

- **Lattice Air UI**
- **Air Lattice System**
- **Lattice Lumen**

**평가**: 건축적 해석에는 강하지만, 이름 자체의 독자성은 보강 필요.

---

#### F. Noctilum

**어원/느낌**: nocturnal + lumen의 조어  
**핵심 의미**: 밤에 드러나는 빛  
**장점**

- 바람의 탑의 야간성을 강하게 담는다.
- 시적이고 기억에 남는다.
- 다크모드·야간 정보·감성적 앱에 적합하다.

**리스크**

- 낮의 금속성, 도시 인프라성은 약해진다.
- 발음이 조금 낯설다.
- 과학/생물발광 쪽 이미지로 오해될 수 있다.

**확장안**

- **Noctilum UI**
- **Noctilum Surface**
- **Noctilum Design Language**

**평가**: 매우 아름답지만 범용 플랫폼 이름보다는 특정 테마나 모드 이름으로 더 적합하다.

---

#### G. Driftlight

**어원/느낌**: drift + light  
**핵심 의미**: 흐르는 빛, 움직이는 신호  
**장점**

- 모션과 빛을 직접 담는다.
- 기억하기 쉽다.
- 스포츠, 날씨, 헬스, 금융 등 실시간 데이터 앱에 잘 맞는다.

**리스크**

- 펀칭·표피성은 약하다.
- 약간 캠페인/앱 이름처럼 들릴 수 있다.

**확장안**

- **Driftlight UI**
- **Driftlight Motion**
- **Driftlight System**

**평가**: 감성은 좋다. 다만 디자인 시스템의 재료명으로는 Perfora가 더 강하다.

---

#### H. Kaze Grid

**어원/느낌**: 일본어 kaze(風, 바람) + grid  
**핵심 의미**: 바람을 구조화한 격자  
**장점**

- 요코하마/일본 레퍼런스와 연결된다.
- 짧고 기억하기 쉽다.
- Grid를 붙이면 시스템성이 생긴다.

**리스크**

- Kaze.ai 등 기존 브랜드가 확인된다.[^kaze]
- 일본어 차용이 브랜드 맥락에 따라 피상적으로 보일 수 있다.
- 글로벌 사용 시 발음 안내가 필요할 수 있다.

**확장안**

- **Kaze Grid**
- **Kaze Lumen**
- **Kaze Surface**

**평가**: 콘셉트 스토리텔링에는 좋지만, 다소 직접적이고 기존 사용이 있다.

---

### 11.4 한국어 기반 후보

영문 시스템 이름과 함께 한국어 별칭을 붙이면 브랜드 깊이가 생긴다.

| 후보 | 의미 | 평가 |
|---|---|---|
| **숨결** | 숨 + 결, 공기와 패턴 | 감성은 강하지만 디자인 시스템 이름으로는 부드러움이 강함 |
| **바람결** | 바람의 질감 | 직관적이고 아름다움, 한국어 캠페인명으로 적합 |
| **빛결** | 빛의 결, 표면 패턴 | UI 표면성과 잘 맞음 |
| **공기층** | 레이어·대기·표면 | 시스템 용어로 적합하지만 시적 매력은 낮음 |
| **풍면** | 바람의 표면 | 조어감이 강하고 건축적, 다소 딱딱함 |
| **투과층** | 통과하는 레이어 | 콘셉트는 정확하나 브랜드명으로는 기술적 |
| **도시숨** | 도시가 숨 쉬는 느낌 | 스마트시티/공기질 앱에 적합 |
| **결광** | 결 + 광 | 짧고 독특하지만 설명 필요 |

추천 조합:

- **Perfora / 바람결**
- **Poralux / 빛결**
- **Windframe / 공기층**
- **Vento / 도시숨**

---

## 12. 이름 후보 종합 점수

5점 만점의 정성 평가다. 상표 판단이 아니라 콘셉트 및 1차 검색 기준이다.

| 후보 | 개념 적합성 | 기억성 | 시스템성 | 차별성 | 리스크 낮음 | 총평 |
|---|---:|---:|---:|---:|---:|---|
| **Perfora** | 5 | 4 | 5 | 4 | 3 | 콘셉트 최강. 상표 검토 필요 |
| **Perfora Air** | 5 | 4 | 5 | 4 | 3.5 | 가장 균형적. 추천 1순위 |
| **Poralux** | 4 | 4 | 4 | 5 | 4 | 조어로 유망. 설명 필요 |
| **Windframe** | 4 | 4 | 5 | 4 | 4 | 개발/플랫폼 확장성 좋음 |
| **Driftlight** | 4 | 5 | 3 | 4 | 4 | 앱/캠페인명으로 좋음 |
| **Lattice Air** | 4 | 3 | 4 | 3 | 2.5 | 건축성 좋지만 Lattice 충돌 가능 |
| **Vento** | 3.5 | 5 | 3 | 3 | 3 | 부르기 쉽지만 일반적 |
| **Noctilum** | 3.5 | 3.5 | 3 | 5 | 4 | 시적. 서브테마로 추천 |
| **Kaze Grid** | 4 | 4 | 4 | 3 | 3 | 일본 맥락은 좋지만 차용감 주의 |
| **Aether** | 4 | 4 | 4 | 2 | 1.5 | 이미 사용 많음 |
| **Aura** | 3 | 5 | 4 | 1.5 | 1 | 충돌 리스크 높음 |
| **Lumen** | 4 | 5 | 4 | 2 | 1.5 | 너무 많이 쓰임 |
| **Flux** | 3 | 5 | 4 | 1.5 | 1 | UI/프레임워크 충돌 많음 |
| **Atmosphere** | 5 | 4 | 4 | 2 | 1.5 | 콘셉트는 좋지만 사용 많음 |

### 12.1 추천 최종 후보

#### 1순위: **Perfora Air**

가장 추천한다. 바람의 탑의 펀칭 알루미늄 표피와 공기 흐름을 모두 담는다. “Liquid Glass”가 유리 재료를 시스템화했다면, “Perfora Air”는 **공기가 통과하는 표피**를 시스템화한다는 점에서 명확한 차별점이 있다.

**포지셔닝 문장**

> **Perfora Air is a responsive UI material that turns invisible context into light, density, and flow.**

한국어:

> **Perfora Air는 보이지 않는 맥락을 빛, 밀도, 흐름으로 번역하는 반응형 UI 재료다.**

#### 2순위: **Poralux**

더 독자적인 조어를 원한다면 좋다. 글로벌 제품명으로 만들기에는 Perfora보다 검색 차별성이 높을 수 있다. 단, 의미를 계속 설명해야 한다.

#### 3순위: **Windframe**

디자인 언어라기보다 프레임워크·라이브러리로 확장할 계획이 강하다면 좋다. 예: `@windframe/tokens`, `@windframe/react`.

#### 4순위: **Driftlight**

메인 시스템보다는 모션 시스템, 캠페인, 프로토타입 앱 이름에 어울린다.

#### 5순위: **Noctilum**

야간 모드, 다크 테마, 발광 모드의 이름으로 매우 좋다. 예: `Noctilum Mode`.

---

## 13. 브랜드 아키텍처 제안

### 13.1 시스템명과 하위 모듈

```txt
Perfora Air
├─ Perfora Surface       // 표면 재료
├─ Perfora Lumen         // 빛/상태 색상
├─ Perfora Flow          // 모션/방향성
├─ Perfora Density       // 패턴/정보 밀도
├─ Perfora Veil          // 오버레이/투명도
├─ Perfora Signal        // 알림/피드백
└─ Noctilum Mode         // 야간 발광 테마
```

### 13.2 모듈별 역할

| 모듈 | 역할 |
|---|---|
| **Surface** | 카드, 패널, 모달의 재료성 |
| **Lumen** | 색보다 넓은 빛의 강도 체계 |
| **Flow** | 바람처럼 느껴지는 모션 원칙 |
| **Density** | 정보량과 긴급도를 패턴 밀도로 표현 |
| **Veil** | 투명도·흐림·차폐의 규칙 |
| **Signal** | 알림·피드백·상태 변화 표현 |
| **Noctilum** | 야간/다크/집중 모드의 발광 원칙 |

---

## 14. 프로토타입 방향

### 14.1 추천 MVP: Ambient Dashboard

처음부터 모든 앱에 적용하려 하기보다, 하나의 대시보드로 철학을 검증한다.

**주제**: 날씨 + 스마트홈 + 일정 + 알림  
**목표**: 하루의 상태를 숫자보다 먼저 분위기로 이해하게 만들기

```txt
[Ambient Header]
현재 위치 · 시간 · 전체 상태 문장

[Atmosphere Panel]
오늘의 공기 / 일정 밀도 / 실내 상태를 하나의 표면으로 통합

[Signal Cards]
날씨, 실내 공기질, 일정, 알림, 기기 상태

[Ambient Timeline]
하루의 변화 흐름

[Flow Dock]
환기하기 · 집중모드 · 일정 보기 · 알림 정리
```

### 14.2 첫 화면 예시

```txt
오늘의 공기는 조금 무겁습니다
습도 78% · 일정 5개 · 실내 CO₂ 높음

[큰 Atmosphere Panel]
- 느린 흐름
- 약간 탁한 Veil
- 낮은 청색 Lumen

권장 액션
[10분 환기하기] [집중모드 45분]
```

---

## 15. 제작 가이드

### 15.1 Figma 설계

- Base color보다 **semantic lumen token** 먼저 정의
- Surface variant를 `Still / Air / Signal / Veil / Nocturne`으로 구분
- Pattern density를 별도 component property로 관리
- Motion spec은 Figma prototype보다 문서와 코드 토큰으로 명확히 정의
- 접근성 모드를 별도 theme로 만들기

### 15.2 프론트엔드 구현

```css
:root {
  --perfora-surface-opacity: 0.72;
  --perfora-surface-blur: 16px;
  --perfora-density: 0.38;
  --perfora-flow-angle: 120deg;
  --perfora-flow-speed: 1;
  --perfora-lumen-intensity: 0.64;
  --perfora-lumen-spread: 24px;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --perfora-flow-speed: 0;
  }
}

@media (prefers-reduced-transparency: reduce) {
  :root {
    --perfora-surface-opacity: 1;
    --perfora-surface-blur: 0px;
  }
}
```

### 15.3 데이터 매핑 예시

```ts
type AirState = {
  windSpeed: number;
  humidity: number;
  noise: number;
  urgency: 'quiet' | 'notice' | 'alert' | 'critical';
};

function mapAirStateToTokens(state: AirState) {
  return {
    density: state.noise > 70 ? 'dense' : 'normal',
    flowSpeed: state.windSpeed > 8 ? 'gust' : 'slow',
    veil: state.humidity > 75 ? 'mist' : 'clear',
    lumen: state.urgency
  };
}
```

---

## 16. 결론

요코하마 바람의 탑을 앱 UI로 번역한다면, 단순히 유리 질감이나 네온 효과를 만드는 것이 아니라 **보이지 않는 맥락을 반응형 표면으로 번역하는 디자인 시스템**을 만드는 것이 핵심이다.

이 시스템의 본질은 다음 네 가지다.

1. **Surface**: 화면은 정보가 놓이는 판이 아니라 반응하는 표피다.
2. **Density**: 패턴 밀도는 긴급도와 정보량을 표현한다.
3. **Lumen**: 빛은 장식이 아니라 상태 피드백이다.
4. **Flow**: 모션은 귀여운 애니메이션이 아니라 맥락의 흐름이다.

네이밍은 현재 기준으로 **Perfora Air**가 가장 설득력 있다. 바람의 탑의 펀칭 메탈, 공기 흐름, 빛의 투과, 반응형 표면이라는 핵심을 모두 담기 때문이다. 더 독창적인 조어를 원하면 **Poralux**, 프레임워크/개발자 생태계로 확장하려면 **Windframe**, 모션·발광 중심의 감성 이름으로는 **Driftlight**, 야간 테마명으로는 **Noctilum**을 추천한다.

---

## 17. 다음 단계 제안

1. **네이밍 2차 검토**  
   Perfora Air, Poralux, Windframe을 중심으로 상표 DB·도메인·GitHub/npm/Figma 커뮤니티 검색.

2. **시각 무드보드 제작**  
   낮의 금속성, 밤의 빛, 펀칭 패턴, 도시 야간 조명, 센서 그래픽을 5개 보드로 분리.

3. **토큰 v0.1 정의**  
   surface, density, lumen, flow, signal, a11y 토큰을 Figma variables와 CSS variables로 병렬 정의.

4. **Ambient Dashboard MVP**  
   날씨·일정·공기질 데이터를 이용해 3개 화면 제작: 홈, 상세, 설정.

5. **접근성 테스트**  
   reduced motion, reduced transparency, high contrast 모드에서 동일 정보가 정확히 전달되는지 검증.

---

## 참고 자료

[^toyoito]: Toyo Ito & Associates, Architects, “Tower of Winds in Yokohama,” official project page. https://www.toyo-ito.co.jp/WWW/Project_Descript/1980-/1980-p_08/1980-p_08_en.html
[^archdaily]: ArchDaily, “AD Classics: Tower of Winds / Toyo Ito & Associates, Architects,” 2013. https://www.archdaily.com/344664/ad-classics-tower-of-winds-toyo-ito
[^architectuul]: Architectuul, “Tower of Winds.” https://architectuul.com/architecture/tower-of-winds
[^archlab]: Architecture Lab, “Tower Of Winds / Toyo Ito & Associates,” updated 2025. https://www.architecturelab.net/tower-of-winds-toyo-ito-and-associates/
[^liquidglass]: Apple Developer Documentation, “Liquid Glass.” https://developer.apple.com/documentation/technologyoverviews/liquid-glass
[^materialcolor]: Material Design 3, “Color overview / Dynamic color.” https://m3.material.io/styles/color/overview
[^wcag]: W3C Web Accessibility Initiative, “WCAG 2 Overview.” https://www.w3.org/WAI/standards-guidelines/wcag/
[^wcagmotion]: W3C WAI, “Understanding SC 2.3.3: Animation from Interactions.” https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
[^mdnmotion]: MDN Web Docs, “prefers-reduced-motion.” https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
[^mdntransparency]: MDN Web Docs, “prefers-reduced-transparency.” https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency
[^uspto]: USPTO. https://www.uspto.gov/
[^wipo]: WIPO, World Intellectual Property Organization. https://www.wipo.int/
[^kipris]: KIPRIS 지식재산정보 검색 서비스. https://www.kipris.or.kr/
[^lumen]: Lumen Design System. https://www.lumen-design-system.com/
[^aura]: Rubrik, “Aura Design System wins the 2026 iF Design Award.” https://www.rubrik.com/blog/company/26/5/rubriks-aura-design-system-wins-the-2026-if-design-award
[^cogniteaura]: Cognite Docs, “Building with the Aura design system.” https://docs.cognite.com/aura-design-system/index
[^aether]: Aether Design System. https://aether.thcl.dev/
[^atmosphere]: Ana Paseiro portfolio, “Boeing Atmosphere Design System.” https://www.anapaseiro.com/projects/boeing-atmosphere
[^ivao]: IVAO Atmosphere Design System GitHub. https://github.com/ivaoaero/atmosphere
[^flux]: Flux UI package/search examples. https://tailkits.com/components/flux-ui/
[^zephyr]: GitHub, “Zephyr design system implementation in Flutter.” https://github.com/breitburg/zephyr
[^aeris]: Aeris IoT Solutions. https://www.aeris.com/
[^atria]: Banner Atria Design System. https://atriadesignsystem.bannerhealth.com/
[^luma]: GitHub, “luma-ui.” https://github.com/lumaui/luma-ui
[^lumina]: Lumina Design System exploration. https://www.redrivera.design/creating-lumina
[^hikari]: Hikari components / Hikari design system examples. https://lib.rs/crates/hikari-components
[^perfora]: Perfora oral care brand. https://perforacare.com/
[^latticehr]: Lattice HR platform. https://lattice.com/
[^latticesemi]: Lattice Semiconductor. https://www.latticesemi.com/
[^kaze]: Kaze.ai. https://kaze.ai/
