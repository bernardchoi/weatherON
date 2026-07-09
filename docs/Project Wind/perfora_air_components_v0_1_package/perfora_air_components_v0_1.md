# Perfora Air Components v0.1

**문서 상태:** Draft  
**작성일:** 2026-07-09  
**연결 토큰:** `perfora-air.tokens.v0.1.json`, `perfora-air.v0.1.css`  
**적용 범위:** Project Wind / Perfora Air 디자인 시스템 연구 트랙  
**목적:** Perfora Air Tokens v0.1의 `surface`, `density`, `lumen`, `flow`, `state` 축을 실제 앱 UI에서 재사용 가능한 컴포넌트 계약으로 정의한다.

---

## 0. v0.1의 컴포넌트 방향

Perfora Air의 컴포넌트는 단순한 카드, 버튼, 내비게이션이 아니다. 각 컴포넌트는 **보이지 않는 맥락을 읽고, 표면·밀도·빛·흐름으로 번역하는 작은 환경 장치**다.

v0.1에서는 이전 무드보드 피드백을 반영해 다음 방향을 기준으로 한다.

> **Matte Air, Soft Density, Quiet Signal**  
> 무광에 가까운 공기감, 절제된 패턴 밀도, 조용하지만 명확한 신호.

### 0.1 시각 가드레일

| 항목 | v0.1 기준 |
|---|---|
| 광택 | 강한 gloss, specular streak, 반짝임 금지 |
| 유리 효과 | blur는 보조값이며, refraction/강한 굴절은 사용하지 않음 |
| 발광 | CTA·상태 피드백에만 사용, 장식용 glow 금지 |
| 패턴 | 정보 밀도와 상태를 표현할 때만 사용 |
| 모션 | 장식 애니메이션이 아니라 context 변화에 대한 낮은 강도의 반응 |
| 텍스트 | 모든 상태에서 텍스트가 시각 효과보다 우선 |
| 접근성 | reduced motion/transparency/high contrast를 컴포넌트 레벨에서 지원 |

### 0.2 Liquid Glass / Material 3와의 컴포넌트 레벨 차별성

| 구분 | Liquid Glass | Material 3 | Perfora Air Components v0.1 |
|---|---|---|---|
| 컴포넌트 인상 | 유리 재질의 컨트롤, 굴절과 투명감 | 명확한 surface/elevation/color role | 공기감 있는 무광 표면 + 의미 있는 패턴 밀도 |
| 카드/패널 | 배경과 강하게 섞이는 유리 레이어 | elevation과 tonal surface로 분리 | 표면의 밀도·흐름이 상태를 조용히 암시 |
| 버튼 피드백 | 유동적/광학적 변화 | 색상·상태 레이어 변화 | 빛의 압축·완화, 짧은 gust, 텍스트 우선 |
| 데이터 시각화 | 재료감과 깊이 중심 | 차트와 색상 체계 중심 | density field, lumen ring, ambient timeline |
| 핵심 차별점 | 재료의 아름다움 | 시스템 일관성 | 보이지 않는 맥락의 감지 가능성 |

---

## 1. 컴포넌트 아키텍처

v0.1 컴포넌트는 네 계층으로 나눈다.

```txt
Perfora Air Components
├─ Primitive / Internal
│  ├─ SurfaceFrame       // 모든 표면의 기본 프레임
│  └─ DensityField       // 패턴 밀도와 흐름 표현
├─ Controls
│  ├─ AirButton          // 절제된 CTA와 액션 버튼
│  └─ ContextChip        // 짧은 상태/필터/메타 정보
├─ Context Containers
│  ├─ AtmospherePanel    // 전체 상태를 보여주는 대표 패널
│  ├─ SignalCard         // 단일 상태/이벤트 요약 카드
│  └─ DataVeil           // 상세/모달/필터 오버레이
└─ Navigation & Visualization
   ├─ LumenRing          // 원형 상태/진행/방향 표시
   ├─ FlowDock           // 하단 내비게이션/빠른 액션
   └─ AmbientTimeline    // 시간 흐름 기반 상태 시각화
```

### 1.1 공개 컴포넌트와 내부 컴포넌트

| Component | 공개 여부 | 설명 |
|---|---:|---|
| `SurfaceFrame` | Internal | 모든 패널·카드·오버레이의 기반 표면 |
| `DensityField` | Internal / Advanced | 패턴 밀도, 흐름, 마스크를 담당하는 시각 레이어 |
| `AirButton` | Public | 액션 버튼 |
| `ContextChip` | Public | 상태, 필터, 짧은 메타 정보 |
| `AtmospherePanel` | Public | 홈/대시보드의 대표 상태 패널 |
| `SignalCard` | Public | 단일 지표, 장치, 알림, 일정 요약 |
| `DataVeil` | Public | 바텀시트, 모달, 상세 오버레이 |
| `LumenRing` | Public | 상태, 진행률, 방향성 시각화 |
| `FlowDock` | Public | 내비게이션 및 빠른 액션 |
| `AmbientTimeline` | Public | 시간 기반 상태 흐름 |

---

## 2. 공통 컴포넌트 계약

모든 컴포넌트는 아래 개념을 공유한다.

### 2.1 공통 상태

```ts
type PerforaState = 'calm' | 'normal' | 'live' | 'alert' | 'critical';
type PerforaMode = 'day' | 'dusk' | 'night' | 'rainy';
type PerforaDensity = 'calm' | 'normal' | 'live' | 'alert' | 'critical';
type PerforaLumen = 'none' | 'whisper' | 'soft' | 'notice' | 'alert' | 'critical';
type PerforaFlow = 'still' | 'drift' | 'slow' | 'medium' | 'gust';
```

### 2.2 상태 → 토큰 기본 매핑

| State | Surface | Density | Lumen | Flow | 규칙 |
|---|---|---|---|---|---|
| `calm` | `still` | `calm` | `whisper` | `still` | 거의 정적, 여백 중심 |
| `normal` | `air` | `normal` | `soft` | `drift` | 기본 환경 상태 |
| `live` | `air` | `live` | `notice` | `slow` | 실시간 변화 감지 |
| `alert` | `signal` | `alert` | `alert` | `gust` | 텍스트·아이콘 필수 |
| `critical` | `signal` | `critical` | `critical` | `gust` | text-first, 시각 효과 축소 |

### 2.3 공통 props

| Prop | Type | Default | 설명 |
|---|---|---:|---|
| `state` | `PerforaState` | `normal` | 컴포넌트의 의미 상태 |
| `mode` | `PerforaMode` | `day` | day/dusk/night/rainy 분위기 모드 |
| `density` | `PerforaDensity | 'auto'` | `auto` | state 기반 패턴 밀도 |
| `lumen` | `PerforaLumen | 'auto'` | `auto` | state 기반 빛 강도 |
| `flow` | `PerforaFlow | 'auto'` | `auto` | state 기반 움직임 |
| `interactive` | `boolean` | `false` | hover/pressed/focus 상태 사용 여부 |
| `disabled` | `boolean` | `false` | 비활성화 |
| `loading` | `boolean` | `false` | 로딩/skeleton 상태 |
| `reducedMotion` | `boolean | 'system'` | `system` | 사용자/OS 설정 존중 |
| `reducedTransparency` | `boolean | 'system'` | `system` | 사용자/OS 설정 존중 |

### 2.4 콘텐츠 우선순위

Perfora Air는 시각 효과가 강해질 수 있는 시스템이기 때문에, 모든 컴포넌트는 콘텐츠 우선순위를 고정한다.

```txt
1. 상태를 설명하는 텍스트
2. 핵심 수치 또는 액션
3. 보조 지표
4. 패턴/빛/흐름
5. 장식적 표면 효과
```

### 2.5 공통 접근성 규칙

1. 상태를 색, 빛, 패턴만으로 전달하지 않는다.
2. `alert` 이상은 텍스트 라벨과 아이콘을 함께 사용한다.
3. `critical`은 필요 시 `role="alert"` 또는 즉시 읽히는 live region을 사용한다.
4. `DensityField`는 기본적으로 `aria-hidden="true"`다.
5. 포커스 가능한 요소는 최소 44px 터치 영역을 확보한다.
6. reduced motion에서는 `drift`, `pulse`, `gust`를 정적 변화로 대체한다.
7. reduced transparency에서는 blur/alpha를 제거하고 단색 표면과 명확한 경계를 사용한다.

---

## 3. 컴포넌트 요약 매트릭스

| Component | 역할 | 주요 사용처 | 기본 State | 핵심 차별점 |
|---|---|---|---|---|
| `SurfaceFrame` | 표면 프레임 | 모든 container 내부 | `normal` | glass가 아니라 matte air surface |
| `DensityField` | 밀도 패턴 | 배경, 카드 내부, 그래프 보조 | `normal` | 정보량을 패턴 밀도로 표현 |
| `AirButton` | 액션 | CTA, secondary action | `normal` | 빛은 hover 장식이 아니라 action feedback |
| `ContextChip` | 짧은 상태 | 필터, 태그, 조건, 센서 상태 | `calm` | 작지만 상태를 가진 chip |
| `AtmospherePanel` | 대표 상태 | 날씨 홈, 스마트홈, 하루 요약 | `normal` | 숫자보다 먼저 분위기를 보여줌 |
| `SignalCard` | 단일 정보 카드 | 일정, 장치, 지표, 알림 | `calm` | 카드 내부에 작은 signal layer |
| `DataVeil` | 오버레이 | 상세, 필터, 설정, bottom sheet | `normal` | 배경을 지우지 않고 조용히 억제 |
| `LumenRing` | 원형 지표 | 풍향, 진행률, 강도, 상태 | `live` | ring이 장식이 아니라 신호 강도 |
| `FlowDock` | 내비게이션 | 하단 탭, 빠른 액션 | `normal` | active를 색 채움보다 흐름/밀도로 표현 |
| `AmbientTimeline` | 시간 흐름 | 예보, 일정, 경기 흐름, 세션 | `live` | 선 그래프보다 상태 밀도 흐름 중심 |

---

## 4. Component Specs

## 4.1 SurfaceFrame

### 목적

`SurfaceFrame`은 Perfora Air의 모든 카드, 패널, 모달, 내비게이션이 공유하는 내부 기반이다. 제품 화면에서 직접 노출하기보다는 다른 컴포넌트가 합성해서 사용한다.

### 사용해야 할 때

- 카드/패널/오버레이가 `surface`, `density`, `lumen`, `flow` 상태를 가져야 할 때
- 동일한 표면 규칙을 여러 컴포넌트에 적용해야 할 때
- reduced transparency, high contrast 대응을 일관되게 처리해야 할 때

### 사용하지 말아야 할 때

- 단순 텍스트 블록
- 목록의 각 row처럼 surface가 과도하게 반복되는 영역
- 이미 충분한 시각 계층이 있는 차트 내부

### Anatomy

```txt
SurfaceFrame
├─ root
├─ matte fill
├─ quiet border
├─ optional density slot
├─ optional lumen slot
└─ content slot
```

### Variants

| Variant | Surface | 용도 |
|---|---|---|
| `still` | `surface.still` | 일반 카드, 리스트 |
| `air` | `surface.air` | 실시간·환경 데이터 |
| `signal` | `surface.signal` | 알림, CTA, 주의 상태 |
| `veil` | `surface.veil` | 모달/오버레이 |
| `nocturne` | `surface.nocturne` | night mode |

### Token Mapping

| Property | Token |
|---|---|
| radius | `radius.md` ~ `radius.xl` |
| fill | `sys.surface.*.fill` |
| border | `sys.surface.*.border` |
| blur | `sys.surface.*.blur` |
| shadow | `sys.surface.*.shadow` |
| max specular | `sys.surface.*.specular`, cap `0.04` |

### Props

```ts
interface SurfaceFrameProps {
  surface?: 'still' | 'air' | 'signal' | 'veil' | 'nocturne' | 'auto';
  state?: PerforaState;
  density?: PerforaDensity | 'none' | 'auto';
  lumen?: PerforaLumen | 'none' | 'auto';
  flow?: PerforaFlow | 'auto';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  interactive?: boolean;
  children: unknown;
}
```

### Interaction

| Interaction | 변화 |
|---|---|
| hover | border opacity 소폭 증가, lumen은 `whisper` 이하 |
| pressed | scale 대신 background tone만 미세하게 안정화 |
| focused | 명확한 outline, glow로 대체 금지 |
| disabled | opacity 축소, density 제거 |

### Accessibility

- 표면 자체는 의미를 가지지 않는다. 의미는 내부 텍스트와 role이 담당한다.
- `interactive=true`인 경우 실제 DOM은 `button`, `a`, 또는 적절한 role을 가져야 한다.

### Do / Don't

| Do | Don't |
|---|---|
| 무광에 가까운 fill과 조용한 border 사용 | 강한 white highlight, 사선 반사광 사용 |
| density와 lumen을 상태 보조로 사용 | 배경 패턴을 읽기 텍스트 뒤에 과하게 배치 |
| reduced transparency에서 단색화 | blur 없이는 구분되지 않는 구조 만들기 |

---

## 4.2 DensityField

### 목적

`DensityField`는 Perfora Air의 핵심 시각 언어다. 정보량, 긴급도, 공기 흐름, 실시간 변화를 점·격자·흐름 패턴으로 표현한다.

### 사용해야 할 때

- 날씨, 공기질, 일정 밀도, 경기 흐름, 집중도처럼 “상태의 흐름”을 보여줄 때
- 숫자 이전에 분위기를 암시해야 할 때
- 카드/패널의 표면이 context-aware하게 보이도록 할 때

### 사용하지 말아야 할 때

- 텍스트 위 직접 배경
- 복잡한 그래프 위에 중첩
- 아이콘/버튼 안쪽의 작은 영역
- 리스트 row마다 반복되는 장식 패턴

### Anatomy

```txt
DensityField
├─ pattern base
├─ density scale
├─ direction / angle
├─ optional fade mask
└─ optional flow animation
```

### Variants

| Variant | 설명 | 사용처 |
|---|---|---|
| `dot` | 기본 펀칭 패턴 | 카드, panel, chip 배경 |
| `stream` | 방향성이 있는 점/선 흐름 | 바람, 일정 흐름, 실시간 변화 |
| `bar` | 작은 bar cluster | 소음, 조도, 변동성 |
| `ring` | 원형 밀도 | LumenRing 보조, focus session |

### Density States

| Density | 사용 기준 |
|---|---|
| `calm` | 안정, 대기, 여백 중심 |
| `normal` | 일반 상태 |
| `live` | 실시간 변화 |
| `alert` | 주의 필요, 텍스트 필수 |
| `critical` | 즉시 행동 필요, 패턴보다 텍스트 우선 |

### Props

```ts
interface DensityFieldProps {
  density?: PerforaDensity;
  variant?: 'dot' | 'stream' | 'bar' | 'ring';
  angleDeg?: number;
  animated?: boolean;
  mask?: 'none' | 'left' | 'right' | 'top' | 'bottom' | 'radial';
  intensity?: number; // 0..1, token opacity cap 안에서만 조절
  decorative?: boolean; // default true
}
```

### Interaction / Motion

- `calm`: 정적
- `normal`: 대부분 정적, 필요 시 매우 느린 drift
- `live`: slow flow 가능
- `alert`: 이벤트 발생 시 1회 gust 가능
- `critical`: 반복 모션 금지, 정적 경고 우선

### Accessibility

- 기본 `aria-hidden="true"`.
- 패턴이 의미를 보조하는 경우에도 동일 정보를 텍스트로 제공한다.
- high contrast에서는 density opacity를 낮춘다.

### Do / Don't

| Do | Don't |
|---|---|
| 여백 영역에 낮은 대비로 배치 | 숫자와 본문 바로 뒤에 촘촘한 패턴 배치 |
| density를 상태와 연결 | 무작위 장식 텍스처로 사용 |
| state가 높을수록 텍스트를 강화 | state가 높을수록 패턴만 강하게 만들기 |

---

## 4.3 AirButton

### 목적

`AirButton`은 Perfora Air의 액션 컴포넌트다. Material 3의 filled/tonal/outlined 구조를 참고할 수 있지만, Perfora Air에서는 **빛의 피드백을 절제된 행동 신호**로 사용한다.

### 사용해야 할 때

- AtmospherePanel의 추천 액션
- DataVeil의 확인/취소 버튼
- FlowDock의 빠른 액션
- 설정 화면의 주요 조작

### Anatomy

```txt
AirButton
├─ root
├─ optional leading icon
├─ label
├─ optional trailing icon / value
└─ optional lumen feedback layer
```

### Variants

| Variant | 설명 | 사용처 |
|---|---|---|
| `primary` | 가장 중요한 행동 | 환기하기, 저장, 시작 |
| `secondary` | 보조 행동 | 자세히 보기, 나중에 |
| `outline` | 낮은 중요도 | 취소, 필터 |
| `ghost` | 배경 없는 조용한 행동 | toolbar, dock |
| `danger` | 위험 행동 | 삭제, 긴급 중지 |

### Sizes

| Size | Height | Padding | 권장 용도 |
|---|---:|---:|---|
| `sm` | 36px | 12px | 보조 UI |
| `md` | 44px | 16px | 기본 |
| `lg` | 52px | 20px | 대표 CTA |

### Props

```ts
interface AirButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  state?: PerforaState;
  iconLeading?: IconToken;
  iconTrailing?: IconToken;
  loading?: boolean;
  disabled?: boolean;
  children: string;
}
```

### State Behavior

| State | 표현 |
|---|---|
| default | 무광 fill, 얇은 border |
| hover | fill tone +2~4%, border 선명화 |
| pressed | lumen이 안쪽으로 짧게 수축 후 settle |
| loading | label 유지 + 작은 progress indicator |
| disabled | fill muted, density/lumen 제거 |

### Accessibility

- 버튼 label은 반드시 텍스트로 존재해야 한다.
- loading 상태에서도 버튼의 목적이 사라지면 안 된다. 예: `저장 중`.
- `danger`는 색만 다르게 하지 말고 문구도 명확히 한다.

### Do / Don't

| Do | Don't |
|---|---|
| hover/pressed에서 작은 tone 변화만 사용 | 버튼 전체를 번쩍이게 만들기 |
| primary CTA는 하나의 화면에 1개 중심 | 모든 액션을 primary로 만들기 |
| focus ring을 명확히 표시 | glow를 focus 표시로 대체 |

---

## 4.4 ContextChip

### 목적

`ContextChip`은 짧은 상태값, 필터, 조건, 센서 메타데이터를 표시한다. 작지만 `state`를 가질 수 있어야 한다.

### 사용해야 할 때

- `습도 62%`, `NW 3.2m/s`, `AQI 좋음` 같은 메타 정보
- 필터 조건
- 장치 상태
- 일정 태그

### Anatomy

```txt
ContextChip
├─ optional icon
├─ label
├─ optional value
└─ optional status dot
```

### Variants

| Variant | 설명 |
|---|---|
| `status` | 상태 표시 |
| `metric` | 짧은 수치 |
| `filter` | 선택 가능한 조건 |
| `action` | 작은 액션 |

### Props

```ts
interface ContextChipProps {
  variant?: 'status' | 'metric' | 'filter' | 'action';
  state?: PerforaState;
  selected?: boolean;
  icon?: IconToken;
  label: string;
  value?: string | number;
  removable?: boolean;
  disabled?: boolean;
}
```

### Size / Layout

| 항목 | 기준 |
|---|---:|
| visual height | 32px |
| interactive hit area | min 44px |
| radius | `radius.full` |
| label max | 18자 내외 권장 |

### Accessibility

- 선택 가능한 chip은 `button` 또는 checkbox/radio role을 사용한다.
- status dot은 장식이므로 동일 상태가 텍스트에 포함되어야 한다.

---

## 4.5 AtmospherePanel

### 목적

`AtmospherePanel`은 Perfora Air의 대표 컴포넌트다. 날씨, 실내 공기질, 일정 밀도, 하루 컨디션처럼 전체 상태를 숫자보다 먼저 분위기로 보여준다.

### 사용해야 할 때

- 앱 홈의 가장 중요한 상태 요약
- 환경/상황 데이터가 여러 개 섞여 있을 때
- 사용자가 “지금 어떤 상태인가?”를 한눈에 이해해야 할 때

### 사용하지 말아야 할 때

- 단일 수치만 보여주면 충분한 경우
- 긴 설명이나 복잡한 설정 화면
- 표준 리스트/테이블 화면

### Anatomy

```txt
AtmospherePanel
├─ SurfaceFrame(surface=air)
├─ Header
│  ├─ eyebrow / context label
│  └─ optional menu/action
├─ Primary Readout
│  ├─ primary value
│  ├─ unit
│  └─ primary icon
├─ Context Sentence
├─ Metric Cluster
│  ├─ ContextChip[]
│  └─ optional mini values
├─ DensityField
├─ Optional LumenRing / Ambient Object
└─ Recommended Action Row
```

### Variants

| Variant | 설명 | 예시 |
|---|---|---|
| `weather` | 외부 날씨 중심 | 온도, 습도, 풍향, AQI |
| `home` | 실내 상태 중심 | CO₂, 공기청정기, 습도 |
| `day` | 일정/컨디션 중심 | 일정 밀도, 집중 가능 시간 |
| `sports` | 실시간 경기 흐름 | 점수, 찬스, 분위기 |
| `wellness` | 신체 리듬 | 심박, 수면, 스트레스 |

### Sizes

| Size | Width 기준 | Min height | Layout |
|---|---:|---:|---|
| `compact` | 320–430px | 420px | 1 column |
| `regular` | 431–768px | 520px | 1 column + floating visual |
| `expanded` | 769px+ | 520px | 2 column 내부 구성 가능 |

### State Mapping

| State | Panel 표현 |
|---|---|
| `calm` | 거의 정적, density calm, action 약함 |
| `normal` | soft density, 낮은 lumen, 읽기 중심 |
| `live` | flow slow, data 변화 영역만 움직임 |
| `alert` | recommendation 강조, signal chip 표시 |
| `critical` | 큰 문장 + 명확한 CTA, ambient 효과 축소 |

### Props

```ts
interface AtmospherePanelProps {
  variant?: 'weather' | 'home' | 'day' | 'sports' | 'wellness';
  size?: 'compact' | 'regular' | 'expanded';
  state?: PerforaState;
  mode?: PerforaMode;
  eyebrow?: string;
  title?: string;
  primaryValue: string | number;
  primaryUnit?: string;
  summary: string;
  metrics?: ContextMetric[];
  action?: ActionSpec;
  secondaryAction?: ActionSpec;
  visual?: 'density' | 'ring' | 'flow' | 'none';
}
```

### Content Rules

1. `summary`는 반드시 문장형이어야 한다. 예: `공기가 조금 무겁습니다.`
2. `primaryValue`만으로 의미가 완성되지 않으면 `primaryUnit`과 `metrics`를 제공한다.
3. `alert` 이상은 행동 제안이 있어야 한다. 예: `10분 환기하기`.
4. ambient visual은 정보 이해를 방해하면 `none`으로 낮춘다.

### Accessibility

- 대표 상태 문장은 screen reader가 먼저 읽을 수 있어야 한다.
- `primaryValue`는 단위와 함께 읽히도록 accessible label을 제공한다.
- 시각 패턴은 보조이므로 숨긴다.

### Do / Don't

| Do | Don't |
|---|---|
| 숫자보다 상태 문장을 먼저 설계 | 온도만 크게 놓고 나머지를 장식으로 처리 |
| density를 패널 여백에 배치 | 본문 뒤에 조밀한 dot field 배치 |
| alert에서 추천 액션 제공 | 경고 색만 바꾸고 이유/액션을 숨김 |

---

## 4.6 SignalCard

### 목적

`SignalCard`는 하나의 상태, 이벤트, 장치, 일정, 데이터 요약을 보여준다. 일반 카드와 다른 점은 작은 `signal layer`를 가져서 상태 변화를 조용히 드러내는 것이다.

### 사용해야 할 때

- 장치 상태: 공기청정기, 로봇청소기, 센서
- 일정: 다음 미팅, 집중 시간
- 지표: 소음, 조도, AQI, 심박
- 알림: 비 접근, 일정 충돌, 공기질 악화

### Anatomy

```txt
SignalCard
├─ SurfaceFrame
├─ Header
│  ├─ label
│  └─ optional menu
├─ Main Content
│  ├─ title/value
│  └─ subtitle
├─ Optional Mini Visual
│  ├─ DensityField / sparkline / LumenRing small
│  └─ status marker
└─ Optional Action
```

### Variants

| Variant | 설명 |
|---|---|
| `metric` | 숫자/단위 중심 |
| `event` | 일정/이벤트 중심 |
| `device` | 장치 상태 중심 |
| `alert` | 주의/경고 중심 |
| `action` | 누르면 행동하는 카드 |

### Props

```ts
interface SignalCardProps {
  variant?: 'metric' | 'event' | 'device' | 'alert' | 'action';
  state?: PerforaState;
  label?: string;
  title: string;
  value?: string | number;
  unit?: string;
  subtitle?: string;
  icon?: IconToken;
  metric?: ContextMetric;
  action?: ActionSpec;
  miniVisual?: 'none' | 'density' | 'sparkline' | 'ring';
  interactive?: boolean;
}
```

### Layout

| Size | Min height | Padding | 용도 |
|---|---:|---:|---|
| `compact` | 88px | 14px | 작은 대시보드 카드 |
| `regular` | 112px | 16px | 기본 |
| `expanded` | 156px | 20px | mini chart 포함 |

### State Behavior

| State | 표현 |
|---|---|
| `calm` | still surface, density 거의 없음 |
| `normal` | soft edge, 작은 signal dot |
| `live` | mini visual 활성화, 작은 flow |
| `alert` | title보다 reason/CTA를 명확히 |
| `critical` | 카드 전체보다 텍스트 경고 우선, role alert 검토 |

### Accessibility

- interactive card는 card 전체가 button인지, 내부 button이 있는지 명확히 택한다. 둘 다 쓰지 않는다.
- mini visual은 텍스트 대체값을 제공하거나 decorative 처리한다.

---

## 4.7 DataVeil

### 목적

`DataVeil`은 상세 정보, 필터, 설정, 설명을 보여주는 오버레이다. Liquid Glass처럼 배경을 화려하게 비추는 것이 아니라, **배경 맥락은 약하게 유지하되 읽기 표면을 안정화**한다.

### 사용해야 할 때

- 필터 바텀시트
- 날씨/공기질 상세
- 기기 설정
- 알림 상세
- 확인/취소가 필요한 모달

### Anatomy

```txt
DataVeil
├─ backdrop suppression layer
├─ sheet / modal container
├─ drag handle optional
├─ header
│  ├─ title
│  └─ close action
├─ body
└─ action area
```

### Variants

| Variant | 설명 |
|---|---|
| `sheet` | 모바일 바텀시트 |
| `modal` | 중앙 모달 |
| `popover` | 작은 문맥 메뉴/정보 |
| `inlineDetail` | 화면 안에서 확장되는 상세 패널 |

### Props

```ts
interface DataVeilProps {
  variant?: 'sheet' | 'modal' | 'popover' | 'inlineDetail';
  state?: PerforaState;
  mode?: PerforaMode;
  title: string;
  description?: string;
  open: boolean;
  dismissible?: boolean;
  primaryAction?: ActionSpec;
  secondaryAction?: ActionSpec;
  children: unknown;
}
```

### Behavior

| Behavior | 규칙 |
|---|---|
| opening | 240–320ms settle, strong glow 금지 |
| closing | dissolve 또는 vertical settle |
| backdrop | `backgroundSuppression` 기본 0.72 |
| focus | open 시 첫 focusable element로 이동 |
| dismiss | Escape/backdrop/close button 정책 명확히 |

### Accessibility

- `modal`과 `sheet`는 `role="dialog"`, `aria-modal="true"`를 사용한다.
- title은 `aria-labelledby`와 연결한다.
- focus trap 필요.
- reduced transparency에서는 배경 blur 없이 단색 backdrop 사용.

---

## 4.8 LumenRing

### 목적

`LumenRing`은 원형 상태 지표다. 바람의 탑의 링 조명을 UI로 번역한 컴포넌트지만, 장식용 네온 링이 아니라 **방향, 강도, 진행률, 상태 변화를 읽게 하는 구조**다.

### 사용해야 할 때

- 풍향/풍속
- 공기질 또는 환기 순환 상태
- 집중 세션 진행률
- 심박 안정도
- 경기 흐름/승률 같은 순환형 지표

### 사용하지 말아야 할 때

- 단순 yes/no 상태
- 정확한 수치 비교가 중요한 복잡한 데이터
- 작은 리스트 row 내부 반복

### Anatomy

```txt
LumenRing
├─ track
├─ value arc / direction marker
├─ optional density halo
├─ center label
├─ center value
└─ optional compass / tick marks
```

### Variants

| Variant | 설명 | 예시 |
|---|---|---|
| `gauge` | 범위 내 현재값 | AQI, 습도 |
| `progress` | 진행률 | 집중 시간, 다운로드 |
| `compass` | 방향성 | 풍향 |
| `pulse` | 반복 신호 | 심박, 실시간 상태 |
| `status` | 정성 상태 | 좋음/보통/주의 |

### Props

```ts
interface LumenRingProps {
  variant?: 'gauge' | 'progress' | 'compass' | 'pulse' | 'status';
  state?: PerforaState;
  size?: 'sm' | 'md' | 'lg';
  value?: number;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
  directionDeg?: number;
  showTicks?: boolean;
  showValue?: boolean;
}
```

### Visual Rules

- glow opacity는 `0.22`를 넘지 않는다.
- stroke는 기본 `1.5px`, 강조 상태에서도 `2px` 권장.
- 중심 숫자와 label이 항상 ring보다 우선한다.
- ring이 의미를 전달할 경우 숫자 또는 label을 함께 제공한다.

### Accessibility

- 진행률은 `role="progressbar"`와 `aria-valuenow/min/max`를 고려한다.
- compass는 방향을 텍스트로 제공한다. 예: `북서풍 3.2m/s`.
- pulse animation은 reduced motion에서 정적 ring으로 대체한다.

---

## 4.9 FlowDock

### 목적

`FlowDock`은 하단 내비게이션 또는 빠른 액션 영역이다. Perfora Air에서는 활성 탭을 강한 색 채움이나 glossy pill로 강조하지 않고, **조용한 밀도·얇은 lumen·명확한 텍스트**로 표현한다.

### 사용해야 할 때

- 모바일 하단 탭
- 홈 화면의 빠른 액션
- 날씨/기기/일정 등 주요 섹션 이동

### Anatomy

```txt
FlowDock
├─ SurfaceFrame(surface=still)
├─ item list
│  ├─ icon
│  ├─ label
│  └─ active indicator
└─ optional quick action slot
```

### Variants

| Variant | 설명 |
|---|---|
| `navigation` | 탭 이동 중심 |
| `quickAction` | 액션 버튼 중심 |
| `hybrid` | 탭 + 1개 주요 액션 |
| `rail` | 태블릿/데스크톱 좌측 rail |

### Props

```ts
interface FlowDockProps {
  variant?: 'navigation' | 'quickAction' | 'hybrid' | 'rail';
  state?: PerforaState;
  mode?: PerforaMode;
  items: FlowDockItem[];
  activeId?: string;
  primaryAction?: ActionSpec;
}
```

### Interaction

| Interaction | 표현 |
|---|---|
| active | soft fill + tiny density field, label 선명화 |
| hover | icon/label tone 변화 |
| pressed | 짧은 settle, 큰 bounce 금지 |
| notification | 작은 signal dot + 텍스트/배지 |

### Accessibility

- `nav` landmark 사용 권장.
- 각 item은 명확한 accessible name을 가진다.
- 활성 탭은 `aria-current="page"`를 사용한다.
- 터치 영역은 44x44px 이상.

---

## 4.10 AmbientTimeline

### 목적

`AmbientTimeline`은 시간에 따른 상태 변화를 선 그래프보다 더 부드럽고 맥락적으로 보여준다. 예보, 일정, 경기 흐름, 집중 세션, 공기질 변화에 적합하다.

### 사용해야 할 때

- 하루 예보나 시간대별 상태
- 일정 밀도 변화
- 경기/시장/공기질 흐름
- 과거→현재→미래의 맥락이 중요한 경우

### Anatomy

```txt
AmbientTimeline
├─ time axis
├─ density band
├─ event markers
├─ optional value line
├─ current marker
└─ callout / summary
```

### Variants

| Variant | 설명 |
|---|---|
| `forecast` | 날씨/강수/바람 예보 |
| `schedule` | 일정 밀도 |
| `session` | 집중/운동/휴식 세션 |
| `game` | 스포츠 경기 흐름 |
| `metric` | 센서 수치 변화 |

### Props

```ts
interface AmbientTimelineProps {
  variant?: 'forecast' | 'schedule' | 'session' | 'game' | 'metric';
  state?: PerforaState;
  startLabel?: string;
  endLabel?: string;
  currentIndex?: number;
  points: TimelinePoint[];
  showValueLine?: boolean;
  showDensityBand?: boolean;
  summary?: string;
}
```

### Data Rules

| Rule | 설명 |
|---|---|
| 최소 point | 3개 이상 |
| 권장 point | 모바일 6~12개, 데스크톱 12~24개 |
| alert marker | 텍스트 callout 필요 |
| missing data | 선을 연결하지 않고 gap 표시 |

### Accessibility

- 시각적 타임라인과 별개로 요약 문장을 제공한다.
- 상세 모드에서는 데이터 테이블 대체를 제공한다.
- 색상/패턴만으로 특정 시간대를 구분하지 않는다.

---

## 5. 컴포넌트 조합 패턴

## 5.1 Ambient Dashboard Pattern

```txt
Screen
├─ AtmospherePanel
├─ SignalCard Grid
│  ├─ Weather Card
│  ├─ Air Quality Card
│  ├─ Schedule Card
│  └─ Device Card
├─ AmbientTimeline
└─ FlowDock
```

### 사용 시나리오

- WeatherON 홈
- 스마트홈 상태 대시보드
- 하루 컨디션/생산성 홈

### 규칙

1. 화면당 `AtmospherePanel`은 1개만 사용한다.
2. `SignalCard`는 2~6개를 권장한다.
3. 모든 카드가 동시에 `live`가 되면 안 된다. 대표 상태만 `live`, 나머지는 `normal`로 낮춘다.
4. `FlowDock`은 화면의 현재 맥락을 방해하지 않는 낮은 contrast로 유지한다.

## 5.2 Alert Without Panic Pattern

Perfora Air의 alert는 공격적이지 않아야 하지만, 행동은 명확해야 한다.

```txt
SignalCard(state=alert)
├─ reason: "실내 CO₂가 높습니다"
├─ value: "1,240 ppm"
├─ recommendation: "10분 환기를 권장합니다"
└─ action: "환기 타이머 시작"
```

### 규칙

- 색상은 보조다.
- 이유와 권장 행동이 먼저다.
- `critical`이 아니면 반복 pulse를 쓰지 않는다.

## 5.3 Detail Expansion Pattern

```txt
SignalCard → DataVeil(sheet)
```

### 규칙

1. 카드의 title/value가 sheet header로 이어져야 한다.
2. sheet는 배경 context를 약하게 유지한다.
3. 닫을 때는 dissolve보다 vertical settle을 우선한다.

---

## 6. Figma 컴포넌트 구성안

### 6.1 Naming

```txt
PA/SurfaceFrame
PA/DensityField
PA/AirButton
PA/ContextChip
PA/AtmospherePanel
PA/SignalCard
PA/DataVeil
PA/LumenRing
PA/FlowDock
PA/AmbientTimeline
```

### 6.2 Variant Properties

| Property | Values |
|---|---|
| `state` | calm, normal, live, alert, critical |
| `mode` | day, dusk, night, rainy |
| `size` | compact, regular, expanded / sm, md, lg |
| `density` | auto, calm, normal, live, alert, critical, none |
| `lumen` | auto, none, whisper, soft, notice, alert, critical |
| `interactive` | true, false |
| `reduced` | none, motion, transparency, highContrast |

### 6.3 Figma Auto Layout 기준

| Component | Auto Layout | Resize |
|---|---|---|
| AtmospherePanel | vertical, gap 16~20 | hug height / fill width |
| SignalCard | vertical or horizontal hybrid | fill width |
| DataVeil | vertical | fixed max width, hug height |
| FlowDock | horizontal | fill width |
| ContextChip | horizontal | hug contents |
| AirButton | horizontal | hug contents or fill width |

---

## 7. 코드 구현 기준

### 7.1 DOM data attribute 규칙

```html
<section
  class="pa-atmosphere-panel"
  data-pa-state="normal"
  data-pa-mode="day"
  data-pa-surface="air"
  data-pa-density="normal"
>
  ...
</section>
```

### 7.2 CSS 클래스 역할

| Class | 역할 |
|---|---|
| `.pa-surface-frame` | 공통 표면 |
| `.pa-density-field` | 패턴 레이어 |
| `.pa-lumen-layer` | 신호광 레이어 |
| `.pa-content` | 실제 콘텐츠 |
| `.pa-is-interactive` | hover/pressed 가능 |
| `.pa-text-first` | alert/critical 상태에서 효과 축소 |

### 7.3 State Resolution

컴포넌트는 `state`를 먼저 받고, `density/lumen/flow`가 `auto`인 경우 state mapping에서 값을 가져온다.

```ts
resolveComponentTokens({
  state: 'live',
  density: 'auto',
  lumen: 'auto',
  flow: 'auto'
});
```

---

## 8. 접근성 체크리스트

| 항목 | 필수 여부 | 설명 |
|---|---:|---|
| 텍스트 상태 설명 | 필수 | 모든 중요한 상태에 문장형 설명 필요 |
| 색상 외 신호 | 필수 | 아이콘, 문구, 형태, 위치를 함께 사용 |
| reduced motion | 필수 | drift/pulse/gust 제거 |
| reduced transparency | 필수 | 단색 surface fallback |
| high contrast | 필수 | density/lumen 축소, 텍스트 대비 강화 |
| focus visible | 필수 | glow가 아닌 outline 사용 |
| screen reader label | 필수 | LumenRing, chart, timeline 등 시각 요소 |
| touch target | 필수 | interactive element 44px 이상 |
| role consistency | 필수 | card/button 중첩 금지 |

---

## 9. 성능 가드레일

| 위험 | v0.1 대응 |
|---|---|
| 많은 카드의 animated density | 한 화면에서 animated component 최대 2개 |
| blur 과다 | blur cap 16px, 기본 4~8px |
| particle/shader 사용 | 기본 금지, 정적 CSS pattern 우선 |
| box-shadow/glow 중첩 | lumen layer 최대 1개 |
| 저사양 기기 | `lowPower`에서 density static + lumen off |
| list 내부 반복 효과 | row별 density 금지, group surface만 사용 |

---

## 10. 컴포넌트별 구현 우선순위

### Phase 1. Primitive & Controls

1. `SurfaceFrame`
2. `DensityField`
3. `AirButton`
4. `ContextChip`

### Phase 2. Core Dashboard

1. `SignalCard`
2. `AtmospherePanel`
3. `LumenRing`

### Phase 3. Product Patterns

1. `FlowDock`
2. `DataVeil`
3. `AmbientTimeline`

### Phase 4. Accessibility Modes

1. reduced motion 검증
2. reduced transparency 검증
3. high contrast 검증
4. low power mode 검증

---

## 11. WeatherON 기준 적용 예시

### 11.1 Home

```txt
AtmospherePanel(variant=weather, state=normal)
├─ primaryValue: 24
├─ primaryUnit: °
├─ summary: "공기가 선선하고 안정적입니다."
├─ metrics: [습도 62%, 북서풍 3.2m/s, AQI 18]
└─ action: "자세히 보기"

SignalCard(metric: Noise, state=normal)
SignalCard(metric: Light, state=normal)
SignalCard(event: Schedule, state=calm)
AmbientTimeline(variant=forecast, state=live)
FlowDock(variant=navigation)
```

### 11.2 Rain Alert

```txt
AtmospherePanel(variant=weather, state=alert, mode=rainy)
├─ summary: "오후에 비가 강해질 수 있습니다."
├─ metrics: [강수 12mm, 풍속 8m/s, 습도 84%]
└─ action: "시간대별 강수 보기"
```

### 11.3 Indoor Air Quality

```txt
SignalCard(variant=device, state=alert)
├─ title: "실내 CO₂가 높습니다"
├─ value: "1,240"
├─ unit: "ppm"
├─ subtitle: "10분 환기를 권장합니다"
└─ action: "환기 타이머 시작"
```

---

## 12. v0.1에서 의도적으로 제외한 컴포넌트

| 제외 항목 | 이유 |
|---|---|
| Full chart library | v0.1은 분위기 기반 요약에 집중 |
| Complex table | Perfora Air 핵심 언어와 거리가 있음 |
| Toast system | SignalCard/DataVeil 검증 후 별도 정의 |
| Form field 전체 세트 | WeatherON MVP에 필요한 범위부터 추후 정의 |
| Strong 3D material component | Liquid Glass와 차별성 약화 |
| Particle shader component | 성능·접근성 리스크 |

---

## 13. v0.1 요약

Perfora Air Components v0.1은 다음을 목표로 한다.

1. **AtmospherePanel**로 전체 상태를 먼저 느끼게 한다.
2. **SignalCard**로 단일 이벤트와 지표를 조용히 정리한다.
3. **DensityField**로 정보량과 긴급도를 시각화한다.
4. **LumenRing**으로 방향·강도·진행을 절제된 신호로 표현한다.
5. **DataVeil**로 상세 정보를 안정적으로 열어준다.
6. **FlowDock**으로 내비게이션을 화면 분위기와 충돌하지 않게 만든다.
7. **AirButton/ContextChip**으로 액션과 메타 정보를 가볍게 처리한다.
8. **AmbientTimeline**으로 시간 흐름을 선 그래프보다 부드럽게 전달한다.

핵심은 여전히 동일하다.

> Perfora Air는 더 반짝이는 UI가 아니라, 보이지 않는 맥락을 조용한 표면 변화로 번역하는 UI 시스템이다.
