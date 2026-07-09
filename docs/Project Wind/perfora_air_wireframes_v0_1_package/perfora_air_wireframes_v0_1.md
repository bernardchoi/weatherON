# Perfora Air Screen Wireframes v0.1

**문서 상태:** Draft  
**작성일:** 2026-07-09  
**연결 문서:** `perfora_air_tokens_v0_1.md`, `perfora_air_components_v0_1.md`  
**적용 범위:** Project Wind / WeatherON 차기 UI 연구 트랙  
**목적:** Perfora Air의 토큰·컴포넌트 v0.1을 실제 앱 화면 구조로 번역한다.

---

## 0. v0.1 화면 방향

이번 화면 와이어프레임의 기준은 아래 세 가지다.

```txt
Matte Air
Soft Density
Quiet Signal
```

즉, 화면은 밝고 가벼워야 하지만 번들거리거나 반짝이면 안 된다.  
Perfora Air는 Liquid Glass처럼 강한 유리 굴절과 광택을 핵심으로 삼지 않고, Material 3처럼 컬러·elevation 중심으로만 작동하지도 않는다. 차별점은 **보이지 않는 맥락을 화면의 표면 밀도, 조용한 신호, 낮은 강도의 흐름으로 번역하는 것**이다.

### v0.1 화면 원칙

| 원칙 | 설명 |
|---|---|
| Atmosphere first | 사용자가 숫자를 읽기 전, 상태의 분위기를 먼저 감지한다. |
| Text first | 빛·색·패턴보다 문장과 수치가 우선한다. |
| Density as meaning | 패턴 밀도는 장식이 아니라 정보량·긴급도·변화량을 뜻한다. |
| Quiet motion | 모션은 공기처럼 낮은 존재감으로 작동한다. |
| Matte over glossy | 표면은 유리보다 무광 공기층에 가깝다. |
| Accessible by default | reduced motion/transparency/high contrast 대응을 화면 구조에 포함한다. |

---

## 1. MVP 화면 범위

v0.1에서는 전체 앱을 다 만들지 않고, Perfora Air의 정체성이 가장 잘 드러나는 5개 화면만 정의한다.

| ID | 화면 | 핵심 질문 | 주요 컴포넌트 |
|---|---|---|---|
| S01 | Home / Ambient Dashboard | 지금 전체 상태가 어떤가? | `AtmospherePanel`, `SignalCard`, `AmbientTimeline`, `FlowDock` |
| S02 | Weather Detail / Air Flow | 날씨 데이터가 실제 행동에 어떤 의미인가? | `LumenRing`, `DensityField`, `ContextChip`, `SignalCard` |
| S03 | Smart Home Air | 실내 공기와 기기 상태에서 지금 해야 할 일은 무엇인가? | `AtmospherePanel`, `SignalCard`, `AirButton` |
| S04 | Day Flow / Schedule | 하루의 밀도와 집중 구간은 어떻게 변하는가? | `AmbientTimeline`, `SignalCard`, `ContextChip` |
| S05 | Modes & Accessibility | 사용자가 시각 효과를 어떻게 제어할 수 있는가? | `DataVeil`, `ContextChip`, settings controls |

---

## 2. 공통 화면 구조

### 2.1 Mobile shell

```txt
┌──────────────────────────────┐
│ Status / App Header           │
│ Screen Title / Context        │
├──────────────────────────────┤
│ Primary Context Area          │
│ - AtmospherePanel or Ring     │
├──────────────────────────────┤
│ Secondary Signal Area         │
│ - SignalCards / Chips         │
├──────────────────────────────┤
│ Flow Area                     │
│ - Timeline / density graph    │
├──────────────────────────────┤
│ FlowDock                      │
└──────────────────────────────┘
```

### 2.2 Layout units

| 항목 | 기준 |
|---|---:|
| 기준 화면 | 390 × 844 pt |
| 화면 padding | 24 pt |
| 카드 간격 | 12–16 pt |
| 큰 패널 radius | 28 pt |
| 카드 radius | 18–22 pt |
| FlowDock 높이 | 72 pt |
| 터치 영역 | 최소 44 × 44 pt |
| 패턴 레이어 opacity | calm 0.10 / normal 0.16 / live 0.24 / alert 0.32 이하 |
| blur | 기본 4–8px, 최대 16px 이하 |
| specular/gloss | 사용하지 않음 또는 0.04 이하 |

---

## 3. S01 Home / Ambient Dashboard

### 목적

앱을 열었을 때 사용자가 3초 안에 다음을 판단하게 한다.

1. 지금 밖의 공기/날씨가 어떤지
2. 내 하루가 얼마나 복잡한지
3. 실내 상태나 알림에서 바로 처리할 일이 있는지
4. 추천 액션이 무엇인지

### 구조

```txt
┌──────────────────────────────┐
│ 9:41                         │
│ 홈 대시보드                   │
│ Ambient Dashboard             │
├──────────────────────────────┤
│ AtmospherePanel               │
│ 오늘의 공기는 가볍습니다       │
│ Yokohama · 24° · 맑음         │
│ [DensityField + Air Flow]     │
│ 24°   습도 62% · NW 3.2m/s    │
│ [산책하기 좋은 바람입니다]     │
├──────────────────────────────┤
│ SignalCard  SignalCard        │
│ 공기질 Good  일정 5개         │
│ SignalCard  SignalCard        │
│ 실내 CO₂ 낮음  알림 2개       │
├──────────────────────────────┤
│ FlowDock                      │
└──────────────────────────────┘
```

### 컴포넌트 매핑

| 영역 | 컴포넌트 | 상태 | 설명 |
|---|---|---|---|
| 대표 패널 | `AtmospherePanel` | `normal` | 날씨·공기질·체감 상태를 하나의 분위기로 요약 |
| 공기질 카드 | `SignalCard` | `calm` | 안정 상태이므로 패턴 거의 없음 |
| 일정 카드 | `SignalCard` | `live` | 일정 밀도 변화를 작은 density field로 표시 |
| 실내 카드 | `SignalCard` | `normal` | 실내 공기질 요약 |
| 알림 카드 | `SignalCard` | `calm` | 중요 알림이 없으면 quiet state |
| 하단 | `FlowDock` | `normal` | 홈 활성. 채움보다 작은 air highlight 사용 |

### v0.1 기준

- 홈 화면의 표면은 가장 밝고 조용해야 한다.
- 패턴은 대표 패널 내부에만 넓게 사용하고, 카드에는 필요할 때만 작게 사용한다.
- 배경에는 강한 gradient, gloss, reflection을 넣지 않는다.
- 사용자의 첫 행동은 하나만 제안한다. 예: “10분 환기하기”, “산책하기 좋은 시간”, “집중모드 시작”.

---

## 4. S02 Weather Detail / Air Flow

### 목적

날씨 상세 화면은 숫자를 더 많이 보여주는 화면이 아니라, **날씨 데이터가 사용자의 행동에 어떤 의미인지** 설명하는 화면이다.

### 구조

```txt
┌──────────────────────────────┐
│ 날씨 상세                     │
│ Air Flow                      │
├──────────────────────────────┤
│ LumenRing / Compass           │
│ 바람                          │
│ NW 3.2 m/s                    │
│ [N/E/S/W ring]                │
├──────────────────────────────┤
│ ContextChip                   │
│ 체감 24° · 습도 62% · UV 3    │
├──────────────────────────────┤
│ 시간별 공기 흐름               │
│ [density timeline]            │
├──────────────────────────────┤
│ 권장                          │
│ 오후 3시 전후로 야외 활동이... │
└──────────────────────────────┘
```

### 컴포넌트 매핑

| 영역 | 컴포넌트 | 상태 | 설명 |
|---|---|---|---|
| 바람 방향 | `LumenRing` | `live` | 풍향·풍속을 원형 방향성으로 표현 |
| 주요 조건 | `ContextChip` | `normal` | 체감, 습도, 자외선 등 보조 정보 |
| 시간 흐름 | `AmbientTimeline` | `live` | 시간별 변화량을 선 그래프보다 점 밀도로 표현 |
| 권장 카드 | `SignalCard` | `normal` | 행동 판단 문장 중심 |

### v0.1 기준

- `LumenRing`은 발광 장식이 아니라 방향·강도를 읽는 장치다.
- ring 주변 glow는 최소화하고, 선 두께·arc 길이·점 위치로 정보를 표현한다.
- 상세 정보가 많아질수록 패턴은 줄이고 텍스트/수치를 우선한다.

---

## 5. S03 Smart Home Air

### 목적

실내 공기질, 센서, 기기 상태를 “기기 목록”으로만 보여주지 않고, **집 안의 공기 상태**로 먼저 인식하게 한다.

### 구조

```txt
┌──────────────────────────────┐
│ 공간 상태                     │
│ Smart Home Air                │
├──────────────────────────────┤
│ AtmospherePanel               │
│ 거실 공기가 안정적입니다       │
│ Air Quality · Good 18         │
│ [Room preview + density]      │
├──────────────────────────────┤
│ Device SignalCards            │
│ Air Purifier     Good         │
│ Robot Vacuum     75%          │
│ Humidity Sensor  62%          │
│ Window Sensor    Safe         │
├──────────────────────────────┤
│ [자동 모드 유지]               │
└──────────────────────────────┘
```

### 컴포넌트 매핑

| 영역 | 컴포넌트 | 상태 | 설명 |
|---|---|---|---|
| 대표 패널 | `AtmospherePanel` | `calm` 또는 `normal` | 실내 공기질을 문장으로 요약 |
| 기기 목록 | `SignalCard` | 기기별 state | 작동 중인 기기만 `live` |
| 주요 액션 | `AirButton` | `normal` | 자동 모드 유지, 환기하기, 제습 켜기 등 |

### v0.1 기준

- 기기 아이콘은 장식보다 상태 구분을 돕는 수준으로만 사용한다.
- 안정 상태에서는 카드가 과하게 살아 움직이지 않는다.
- 문제 발생 시에도 먼저 문장으로 설명한다. 예: “CO₂가 높아졌습니다. 10분 환기를 권장합니다.”

---

## 6. S04 Day Flow / Schedule

### 목적

일정을 시간표로만 보여주지 않고, **하루의 밀도와 집중 구간**을 보여준다.

### 구조

```txt
┌──────────────────────────────┐
│ 하루 흐름                     │
│ Day Flow                      │
├──────────────────────────────┤
│ 오늘은 중간 밀도의 하루입니다  │
│ 일정 5개 · 집중 블록 1개      │
│ [small density field]         │
├──────────────────────────────┤
│ AmbientTimeline               │
│ 10:00 Design Sync             │
│ 13:00 Client Meeting          │
│ 15:30 Focus Time              │
│ 19:00 Gym                     │
├──────────────────────────────┤
│ Focus recommendation           │
│ 15:30에는 패턴을 줄이고...     │
└──────────────────────────────┘
```

### 컴포넌트 매핑

| 영역 | 컴포넌트 | 상태 | 설명 |
|---|---|---|---|
| 요약 패널 | `SignalCard` | `normal` | 하루 밀도 요약 |
| 일정 흐름 | `AmbientTimeline` | `live` | 일정 간격과 밀도를 점 패턴으로 표현 |
| 집중 권장 | `SignalCard` | `calm` | focus mode와 연결 |

### v0.1 기준

- 일정이 많다고 화면이 더 화려해지면 안 된다.
- 과밀한 날일수록 오히려 레이아웃을 정리하고 우선순위를 명확히 한다.
- Focus Time에서는 패턴을 줄이는 것이 Perfora Air의 중요한 차별점이다.

---

## 7. S05 Modes & Accessibility

### 목적

Perfora Air는 패턴·투명도·모션을 쓰는 시스템이므로, 사용자가 이를 줄이거나 끌 수 있는 화면을 제품 안에 명확히 포함해야 한다.

### 구조

```txt
┌──────────────────────────────┐
│ 설정                          │
│ Modes & Accessibility         │
├──────────────────────────────┤
│ Surface Preview               │
│ Matte Air · Normal Density    │
├──────────────────────────────┤
│ Reduced Motion        [on/off]│
│ Reduced Transparency  [on/off]│
│ High Contrast         [on/off]│
│ Low Power             [on/off]│
│ Text-first Alert      [on/off]│
├──────────────────────────────┤
│ FlowDock                      │
└──────────────────────────────┘
```

### v0.1 기준

| 설정 | 화면 변화 |
|---|---|
| Reduced Motion | `drift`, `pulse`, `gust` 제거. 상태 변화는 opacity/shape로 대체 |
| Reduced Transparency | blur/alpha 제거. 단색 surface와 명확한 border 사용 |
| High Contrast | lumen 효과 축소. 텍스트와 아이콘 대비 강화 |
| Low Power | 실시간 particle/density animation 대신 정적 패턴 사용 |
| Text-first Alert | alert 이상에서 문장형 경고를 항상 먼저 표시 |

---

## 8. 화면 간 내비게이션 흐름

```txt
Home
 ├─ AtmospherePanel tap → Weather Detail
 ├─ Air Quality SignalCard tap → Smart Home Air or Air Quality Detail
 ├─ Schedule SignalCard tap → Day Flow
 ├─ Device SignalCard tap → Smart Home Air
 └─ FlowDock Settings → Modes & Accessibility
```

### 주요 사용자 시나리오

1. 사용자가 홈에서 “오늘의 공기는 가볍습니다”를 본다.
2. 대표 패널을 눌러 바람·습도·시간별 흐름을 확인한다.
3. 실내 카드에서 “CO₂ 낮음”을 확인하고 별도 행동을 하지 않는다.
4. 일정 카드에서 오후 집중 시간을 확인한다.
5. 모션이나 투명도가 부담스러우면 설정에서 효과를 줄인다.

---

## 9. 상태별 화면 처리

| State | 화면 인상 | 패턴 | 빛 | 모션 | 텍스트 |
|---|---|---|---|---|---|
| `calm` | 넓은 여백, 안정 | 낮음 | whisper | 없음 | 짧은 안내 |
| `normal` | 기본 공기감 | 중간 이하 | soft | drift | 상태 요약 |
| `live` | 변화 감지 | 중간 | notice | slow | 변화 수치 포함 |
| `alert` | 주의 필요 | 높음 | alert | 짧은 gust | 문장형 안내 필수 |
| `critical` | 즉시 행동 | 시각 효과 축소 | critical | 최소화 | 텍스트/아이콘/CTA 우선 |

---

## 10. 반응형 확장

### 10.1 Tablet

```txt
┌────────────────────────────────────────────┐
│ Header                                     │
├──────────────────┬─────────────────────────┤
│ AtmospherePanel  │ SignalCards             │
│                  │ Weather / Air / Devices │
├──────────────────┴─────────────────────────┤
│ AmbientTimeline                            │
└────────────────────────────────────────────┘
```

### 10.2 Desktop / Web Dashboard

```txt
┌────────────────────────────────────────────┐
│ App Rail │ AtmospherePanel │ Detail Panel   │
│          │ Signal Grid     │ Timeline       │
│          │ Flow Dock       │ Settings       │
└────────────────────────────────────────────┘
```

확장 시에도 중심은 동일하다. 큰 화면이라고 해서 더 많은 glow나 장식을 넣지 않는다. 정보량이 늘어날수록 **surface hierarchy**와 **density control**이 더 중요해진다.

---

## 11. 구현 메모

### 11.1 CSS class 구조 예시

```txt
.pa-screen
.pa-app-shell
.pa-atmosphere-panel
.pa-signal-grid
.pa-signal-card
.pa-lumen-ring
.pa-ambient-timeline
.pa-flow-dock
.pa-settings-list
```

### 11.2 데이터 → 화면 매핑 예시

```ts
type HomeContext = {
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'storm';
  };
  indoor: {
    airQuality: 'good' | 'moderate' | 'poor';
    co2Level: number;
  };
  scheduleDensity: 'low' | 'medium' | 'high';
  alertCount: number;
};

function resolveHomeState(context: HomeContext) {
  if (context.indoor.airQuality === 'poor') return 'alert';
  if (context.weather.condition === 'storm') return 'alert';
  if (context.scheduleDensity === 'high') return 'live';
  if (context.alertCount === 0) return 'calm';
  return 'normal';
}
```

---

## 12. 다음 단계

1. **홈 화면 hi-fi draft**  
   S01을 기준으로 실제 컬러·타입·간격을 적용한 1차 시안 제작.

2. **S01 → S02 전환 프로토타입**  
   AtmospherePanel을 눌렀을 때 Weather Detail로 넘어가는 `reorient` 모션 정의.

3. **상태별 화면 변형**  
   calm / normal / live / alert / critical 5개 상태의 홈 화면 변형 제작.

4. **접근성 모드 검증**  
   reduced motion, reduced transparency, high contrast 화면을 별도 보드로 제작.

5. **Figma variables 연동**  
   기존 token v0.1을 Figma variables로 옮기고, 컴포넌트 property로 state/mode/density를 제어한다.
