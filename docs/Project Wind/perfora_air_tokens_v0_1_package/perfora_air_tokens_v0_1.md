# Perfora Air Tokens v0.1

**문서 상태:** Draft  
**작성일:** 2026-07-09  
**적용 범위:** Project Wind / Perfora Air 디자인 시스템 연구 트랙  
**목적:** 요코하마 바람의 탑에서 추출한 “공기, 밀도, 빛, 흐름”의 시각 언어를 앱 UI에서 재사용 가능한 디자인 토큰으로 정의한다.

---

## 0. v0.1의 방향

이번 v0.1의 핵심은 **밝고 가볍지만, 번들거리거나 과장되지 않는 UI 재료**를 만드는 것이다.

이전 무드보드에서 도출한 문제는 다음과 같다.

- 과한 글로시 하이라이트는 Liquid Glass와 구분이 약해진다.
- 반짝임이 강하면 환경 데이터보다 장식성이 먼저 보인다.
- 네온/발광이 과하면 바람의 탑의 “시적 인프라”보다 사이버펑크에 가까워진다.
- Material 3와 비교했을 때 단순한 색상·컴포넌트 시스템으로 보이면 차별성이 부족하다.

따라서 v0.1은 다음 방향으로 잡는다.

> **Matte Air, Soft Density, Quiet Signal**  
> 무광에 가까운 공기감, 절제된 밀도, 조용하지만 명확한 신호.

---

## 1. Liquid Glass / Material 3와의 토큰 레벨 차별성

| 구분 | Liquid Glass | Material 3 | Perfora Air v0.1 |
|---|---|---|---|
| 핵심 재료 | 유리, 굴절, 유동성 | 표면, 컬러, elevation | 공기, 펀칭 표피, 밀도, 환경 신호 |
| 주요 토큰 축 | blur, translucency, specular, refraction | color role, shape, elevation, typography | surface, density, lumen, flow, signal |
| 시각 우선순위 | 고급스러운 광학 효과 | 일관된 사용성 및 플랫폼 확장성 | 보이지 않는 맥락의 감지 가능성 |
| 빛의 역할 | 재료감/깊이 강화 | 컬러 체계의 일부 | 상태 피드백과 신호 강도 |
| 모션의 역할 | 유동적 전환 | 목적 기반 transition | 공기 흐름처럼 낮은 존재감의 context motion |
| 위험 요소 | 과한 번들거림, 가독성 저하 | 개성 부족, 일반적인 앱 룩 | 패턴 과잉, 데이터 오해 가능성 |
| v0.1 회피 전략 | refraction/token 미정의, specular cap 적용 | 동적 컬러보다 환경 밀도 중심 | 접근성 모드와 text-first 상태 내장 |

### 핵심 차별점

Perfora Air는 **더 반짝이는 UI**가 아니다.  
Perfora Air는 **정보가 놓이는 표면이 주변 맥락에 따라 조용히 달라지는 UI**다.

---

## 2. 토큰 네이밍 규칙

### 2.1 계층 구조

```txt
pa
├─ ref       // 원시값: color, spacing, radius, blur, shadow, font 등
├─ sys       // 의미값: surface, density, lumen, flow, state 등
├─ component // 컴포넌트별 기본값
└─ mode      // day, dusk, night, rainy, reducedMotion 등
```

### 2.2 CSS 변수 변환 규칙

```txt
pa.sys.surface.air.fill
→ --pa-surface-air-fill

pa.sys.density.live.opacity
→ --pa-density-live-opacity

pa.component.atmospherePanel.radius
→ --pa-atmosphere-panel-radius
```

### 2.3 토큰 작성 원칙

1. **Ref token은 브랜드 감성보다 재사용성을 우선한다.**
2. **System token은 의미를 가져야 한다.**
3. **Component token은 component의 기본값만 정의한다.**
4. **Mode token은 토큰을 덮어쓰는 방식으로 작동한다.**
5. **색상, 빛, 모션만으로 정보를 전달하지 않는다.**

---

## 3. Foundation Tokens

## 3.1 Color Reference

### Paper / Mist

밝은 기본 배경과 무광 표면을 위한 색상이다.

| Token | Value | 용도 |
|---|---:|---|
| `ref.color.paper.0` | `#FCFCF9` | 기본 캔버스 |
| `ref.color.paper.1` | `#F7F8F6` | 살짝 올라온 배경 |
| `ref.color.paper.2` | `#EFF2F0` | 무광 패널 wash |
| `ref.color.paper.3` | `#E6ECEA` | 부드러운 경계 |
| `ref.color.mist.50` | `#F5F9FA` | 차가운 배경 |
| `ref.color.mist.100` | `#ECF3F5` | 비/안개 상태 배경 |
| `ref.color.mist.200` | `#DCE8EC` | 보조 표면 |
| `ref.color.mist.300` | `#C7D8DF` | 경계/패턴 |
| `ref.color.mist.400` | `#9EB6C2` | 약한 텍스트/아이콘 |

### Air / Aqua / Mint

환경 데이터, 바람, 공기질, 흐름을 위한 차가운 색상군이다. 과한 네온을 피하고 채도를 낮춘다.

| Token | Value | 용도 |
|---|---:|---|
| `ref.color.air.50` | `#F4F9FF` | 아주 연한 공기 배경 |
| `ref.color.air.100` | `#E7F1FF` | soft accent |
| `ref.color.air.200` | `#D3E6FF` | whisper lumen |
| `ref.color.air.300` | `#AFCDF7` | soft lumen |
| `ref.color.air.400` | `#83ACE4` | active indicator |
| `ref.color.air.500` | `#5F8FD1` | primary accent |
| `ref.color.air.600` | `#3F6CA9` | pressed/selected |
| `ref.color.aqua.100` | `#DDF2F1` | 공기질 보조 |
| `ref.color.aqua.300` | `#93CECC` | 습도/물성 |
| `ref.color.mint.100` | `#E2F1E8` | 안정/웰니스 |
| `ref.color.mint.300` | `#9FCBB3` | success-adjacent surface |

### Dusk

저녁, 전환, 감정적 완충을 위한 낮은 채도의 warm/cool palette다.

| Token | Value | 용도 |
|---|---:|---|
| `ref.color.dusk.peach` | `#F2D8CD` | warm transition |
| `ref.color.dusk.rose` | `#E9CDD8` | soft alert 배경 |
| `ref.color.dusk.lavender` | `#DCD7F1` | 감성적 보조 |
| `ref.color.dusk.violet` | `#B8B0E1` | dusk accent |
| `ref.color.dusk.sand` | `#F1E4CE` | warm neutral |

### Night

야간 모드는 무조건 어둡게 만들지 않는다. 낮은 주변광에서 읽히는 **절제된 야간 표면**을 만든다.

| Token | Value | 용도 |
|---|---:|---|
| `ref.color.night.900` | `#101827` | 야간 캔버스 |
| `ref.color.night.800` | `#17243A` | 야간 패널 |
| `ref.color.night.700` | `#213652` | 야간 카드 |
| `ref.color.night.600` | `#2D4C70` | 야간 accent |
| `ref.color.night.500` | `#38628A` | 야간 signal |

### Signal

Signal 색상은 눈에 띄어야 하지만 네온처럼 과장되면 안 된다.

| Token | Value | 의미 |
|---|---:|---|
| `ref.color.signal.info` | `#5E8FD4` | 정보 |
| `ref.color.signal.success` | `#4DA479` | 정상/성공 |
| `ref.color.signal.notice` | `#6C9BE0` | 가벼운 주의 |
| `ref.color.signal.warn` | `#D29A4A` | 경고 |
| `ref.color.signal.danger` | `#D46666` | 위험 |
| `ref.color.signal.critical` | `#B23A48` | 즉시 행동 |

---

## 3.2 Typography Tokens

Perfora Air는 표면과 패턴이 존재감을 가지므로 타이포그래피는 장식적이면 안 된다. 숫자와 짧은 상태 문장의 가독성을 우선한다.

| Token | Size / Line | Weight | 용도 |
|---|---:|---:|---|
| `type.display` | `64 / 72` | `400` | 온도, 큰 수치 |
| `type.title1` | `28 / 36` | `500` | 화면 제목 |
| `type.title2` | `22 / 30` | `500` | 카드 제목 |
| `type.body` | `15 / 22` | `400` | 본문 |
| `type.label` | `12 / 16` | `500` | 라벨, 상태값 |
| `type.caption` | `11 / 15` | `400` | 보조 설명 |

```css
--pa-font-sans: Inter, Pretendard, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--pa-type-display-size: 64px;
--pa-type-display-line: 72px;
--pa-type-display-tracking: -2.2px;
```

---

## 3.3 Radius / Spacing / Shadow

### Radius

| Token | Value | 용도 |
|---|---:|---|
| `radius.xs` | `6px` | 작은 chip |
| `radius.sm` | `10px` | input, button |
| `radius.md` | `16px` | 기본 card |
| `radius.lg` | `22px` | signal card |
| `radius.xl` | `30px` | atmosphere panel |
| `radius.full` | `999px` | pill, ring |

### Shadow

Shadow는 깊이감보다 **조용한 분리**를 위해 쓴다.

| Token | Value | 용도 |
|---|---|---|
| `shadow.hairline` | `0 1px 1px rgba(23, 32, 43, 0.04)` | 기본 경계 |
| `shadow.panel` | `0 8px 24px rgba(23, 32, 43, 0.06)` | 패널 |
| `shadow.float` | `0 16px 48px rgba(23, 32, 43, 0.08)` | modal/veil |

---

## 4. System Tokens

## 4.1 Surface Tokens

Surface는 Perfora Air의 가장 중요한 기반이다.  
단, v0.1에서는 **gloss/refraction을 시스템 핵심으로 두지 않는다.**

| Surface | Fill | Blur | Specular Cap | 용도 |
|---|---:|---:|---:|---|
| `surface.still` | `rgba(255,255,255,.82)` | `4px` | `0.02` | 일반 카드/리스트 |
| `surface.air` | `rgba(247,250,252,.76)` | `8px` | `0.04` | 실시간 상태/환경 |
| `surface.signal` | `rgba(255,255,255,.88)` | `4px` | `0.03` | 알림/CTA |
| `surface.veil` | `rgba(252,252,249,.92)` | `12px` | `0.02` | 모달/오버레이 |
| `surface.nocturne` | `rgba(23,36,58,.88)` | `8px` | `0.03` | 야간 패널 |

### Surface 원칙

```txt
blur는 보조값이다.
specular는 하이라이트가 아니라 표면의 숨결 정도로만 쓴다.
정보 위에는 복잡한 반사나 번짐을 올리지 않는다.
```

---

## 4.2 Density Tokens

Density는 Perfora Air의 핵심 차별점이다.  
Material 3가 컬러 role로 상태를 구분한다면, Perfora Air는 **패턴 밀도**로 긴급도와 정보량을 조절한다.

| Density | Dot | Gap | Opacity | 의미 |
|---|---:|---:|---:|---|
| `density.calm` | `1px` | `14px` | `0.10` | 안정, 여백 |
| `density.normal` | `1.2px` | `10px` | `0.16` | 일반 상태 |
| `density.live` | `1.4px` | `8px` | `0.22` | 실시간 변화 |
| `density.alert` | `1.6px` | `7px` | `0.30` | 주의 필요 |
| `density.critical` | `1.8px` | `6px` | `0.38` | 즉시 행동 필요 |

### Density 사용 규칙

1. `density.alert` 이상은 반드시 텍스트 라벨이 필요하다.
2. 중요한 수치 아래에는 `density.live` 이상을 깔지 않는다.
3. 배경 패턴과 데이터 그래프가 동시에 조밀해지지 않게 한다.
4. high contrast 모드에서는 패턴 opacity를 낮춘다.

---

## 4.3 Lumen Tokens

Lumen은 색상이 아니라 **정보 강도를 가진 빛**이다.  
그러나 v0.1에서는 “반짝임”보다 “부드러운 신호”를 우선한다.

| Lumen | Color | Opacity | Spread | Ring |
|---|---:|---:|---:|---:|
| `lumen.none` | - | `0` | `0` | `0` |
| `lumen.whisper` | `air.200` | `0.10` | `12px` | `1px` |
| `lumen.soft` | `air.300` | `0.16` | `20px` | `1px` |
| `lumen.notice` | `signal.notice` | `0.22` | `28px` | `1.5px` |
| `lumen.alert` | `signal.warn` | `0.26` | `32px` | `2px` |
| `lumen.critical` | `signal.critical` | `0.32` | `36px` | `2px` |

### Lumen 사용 규칙

```txt
lumen.opacity 기본 상한은 0.32다.
lumen.alert 이상은 텍스트/아이콘/명도 대비와 함께 사용한다.
lumen은 decoration이 아니라 state feedback으로만 사용한다.
```

---

## 4.4 Flow Tokens

Flow는 공기처럼 느껴지는 방향성이다.  
계속 움직이는 장식 애니메이션이 아니라, 데이터 변화가 있을 때만 감지되는 낮은 강도의 움직임이다.

| Flow | Speed | Amplitude | Duration | 용도 |
|---|---:|---:|---:|---|
| `flow.still` | `0` | `0px` | `0ms` | 정적 |
| `flow.drift` | `0.2` | `2px` | `9000ms` | 배경 상태 |
| `flow.slow` | `0.35` | `3px` | `6500ms` | 실시간 상태 |
| `flow.medium` | `0.55` | `5px` | `4200ms` | 변화 감지 |
| `flow.gust` | `1` | `8px` | `720ms` | 이벤트성 알림 |

### Flow 사용 규칙

1. `flow.gust`는 이벤트성으로만 사용한다.
2. 화면 전체가 동시에 움직이면 안 된다.
3. `prefers-reduced-motion`에서는 모든 flow speed와 amplitude를 `0`으로 만든다.
4. 핵심 데이터가 읽히는 순간에는 motion보다 typography가 우선한다.

---

## 4.5 Composite State Tokens

상태별로 surface, density, lumen, flow를 묶어 사용한다.

| State | Surface | Density | Lumen | Flow | 사용 예 |
|---|---|---|---|---|---|
| `state.calm` | `still` | `calm` | `whisper` | `still` | 안정된 날씨, 빈 일정 |
| `state.normal` | `air` | `normal` | `soft` | `drift` | 일반 상태 |
| `state.live` | `air` | `live` | `notice` | `slow` | 실시간 변화 |
| `state.alert` | `signal` | `alert` | `alert` | `gust` | 주의 필요 |
| `state.critical` | `signal` | `critical` | `critical` | `gust` | 즉시 행동 필요 |

```ts
type PerforaState = {
  surface: 'still' | 'air' | 'signal' | 'veil' | 'nocturne';
  density: 'calm' | 'normal' | 'live' | 'alert' | 'critical';
  lumen: 'none' | 'whisper' | 'soft' | 'notice' | 'alert' | 'critical';
  flow: 'still' | 'drift' | 'slow' | 'medium' | 'gust';
  textFirst?: boolean;
};
```

---

## 5. Mode Tokens

## 5.1 Atmosphere Modes

| Mode | Canvas | Surface Bias | Lumen Temperature | Density Bias |
|---|---:|---|---|---:|
| `mode.day` | `paper.0` | `still` | cool-neutral | `0` |
| `mode.dusk` | `#FBF7F3` | `air` | warm-soft | `-0.05` |
| `mode.night` | `night.900` | `nocturne` | cool | `+0.05` |
| `mode.rainy` | `mist.100` | `veil` | cool-muted | `+0.08` |

### 주의

`night`는 “무겁고 어두운 UI”가 아니라 **주변광이 낮을 때의 명확한 정보 표면**이다.  
`rainy`는 물방울/번쩍임을 과하게 쓰지 않고, mist와 veil 정도로만 표현한다.

---

## 5.2 Accessibility Modes

| Mode | Token Override | 목적 |
|---|---|---|
| `reducedMotion` | flow speed `0`, pulse off, gust off | 멀미/피로 방지 |
| `reducedTransparency` | surface opacity `1`, blur `0` | 가독성 확보 |
| `highContrast` | pattern/lumen 축소, text 우선 | 정보 명확성 |
| `lowPower` | shader/particle off, static pattern | 성능/배터리 |
| `focus` | density cap `normal`, lumen cap `soft` | 집중 방해 최소화 |

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --pa-flow-drift-speed: 0;
    --pa-flow-slow-speed: 0;
    --pa-flow-gust-speed: 0;
  }
}

@media (prefers-reduced-transparency: reduce) {
  :root {
    --pa-surface-air-fill: var(--pa-color-paper-0);
    --pa-surface-air-blur: 0px;
  }
}
```

---

## 6. Component Tokens

## 6.1 Atmosphere Panel

가장 큰 상태 패널.  
날씨, 실내 공기질, 일정 밀도, 하루 컨디션 등 전체 분위기를 표현한다.

| Token | Value |
|---|---:|
| `component.atmospherePanel.radius` | `radius.xl` |
| `component.atmospherePanel.padding` | `24px` |
| `component.atmospherePanel.minHeight` | `520px` |
| `component.atmospherePanel.surface` | `air` |
| `component.atmospherePanel.density` | `normal` |
| `component.atmospherePanel.lumen` | `soft` |
| `component.atmospherePanel.maxSpecular` | `0.04` |

## 6.2 Signal Card

단일 이벤트, 상태 요약, 알림 카드.

| Token | Value |
|---|---:|
| `component.signalCard.radius` | `radius.lg` |
| `component.signalCard.padding` | `16px` |
| `component.signalCard.minHeight` | `112px` |
| `component.signalCard.surface` | `still` |
| `component.signalCard.density` | `calm` |
| `component.signalCard.lumen` | `none` |

## 6.3 Data Veil

모달, 상세, 필터, 설정 오버레이.

| Token | Value |
|---|---:|
| `component.dataVeil.radius` | `radius.xl` |
| `component.dataVeil.padding` | `24px` |
| `component.dataVeil.surface` | `veil` |
| `component.dataVeil.density` | `calm` |
| `component.dataVeil.backgroundSuppression` | `0.72` |

## 6.4 Lumen Ring

풍속, 공기질, 진행률, 집중도, 알림 범위 등을 표현한다.

| Token | Value |
|---|---:|
| `component.lumenRing.sizeSmall` | `48px` |
| `component.lumenRing.sizeMedium` | `96px` |
| `component.lumenRing.sizeLarge` | `160px` |
| `component.lumenRing.strokeWidth` | `1.5px` |
| `component.lumenRing.glowCapOpacity` | `0.22` |

## 6.5 Flow Dock

하단 내비게이션 또는 quick action dock.

| Token | Value |
|---|---:|
| `component.flowDock.height` | `72px` |
| `component.flowDock.radius` | `radius.xl` |
| `component.flowDock.paddingInline` | `12px` |
| `component.flowDock.activeIndicator` | `soft-lumen-pill` |
| `component.flowDock.surface` | `still` |

## 6.6 Context Chip

날씨 세부 상태, 필터, 장치 상태 등 짧은 컨텍스트 표시.

| Token | Value |
|---|---:|
| `component.contextChip.height` | `32px` |
| `component.contextChip.radius` | `radius.full` |
| `component.contextChip.paddingInline` | `12px` |
| `component.contextChip.surface` | `still` |

---

## 7. 데이터 → 토큰 매핑

## 7.1 WeatherON / 날씨 데이터

| 데이터 | Token 영향 | 예시 |
|---|---|---|
| 풍속 | `flow` | 0–2m/s still, 2–6 drift, 6–11 slow, 11+ gust |
| 풍향 | `flowAngleDeg` | NW 315deg |
| 습도 | `surface.veil`, `mist level` | 75% 이상 mist |
| 강수량 | `mode.rainy`, `density` | 1mm 이상 rainy |
| 미세먼지/AQI | `state`, `density`, `lumen` | AQI 101+ alert |
| 자외선 | `lumen` | UV 7+ alert |
| 기온 | typography 중심 | 색보다 숫자/문구 우선 |

```ts
function getWeatherUrgency(input: WeatherContext): PerforaUrgency {
  const aqi = input.aqi ?? 0;
  const rain = input.precipitationMm ?? 0;
  const humidity = input.humidityPercent;
  const wind = input.windSpeedMs;
  const uv = input.uvIndex ?? 0;

  if (aqi >= 151 || rain >= 30 || wind >= 17 || uv >= 9) return 'critical';
  if (aqi >= 101 || rain >= 10 || wind >= 11 || humidity >= 85 || uv >= 7) return 'alert';
  if (aqi >= 51 || rain >= 1 || wind >= 6 || humidity >= 75 || uv >= 5) return 'live';
  if (wind >= 2 || humidity >= 55) return 'normal';
  return 'calm';
}
```

## 7.2 일정 데이터

| 데이터 | Token 영향 |
|---|---|
| 일정 개수 | `density` |
| 다음 일정까지 남은 시간 | `lumen.notice` |
| 일정 충돌 | `state.alert` |
| 집중 가능 시간 | `surface.still` 또는 `density.calm` |

## 7.3 실내 공기질

| 데이터 | Token 영향 |
|---|---|
| CO₂ | `state`, `lumen` |
| PM2.5 | `density`, `signal` |
| 습도 | `surface.veil` |
| VOC | `state.alert` 이상 |

---

## 8. CSS v0.1 핵심 예시

```css
:root {
  --pa-bg-canvas: #FCFCF9;
  --pa-text-primary: #0E131A;

  --pa-surface-air-fill: rgba(247, 250, 252, 0.76);
  --pa-surface-air-border: rgba(95, 143, 209, 0.18);
  --pa-surface-air-blur: 8px;
  --pa-surface-air-specular: 0.04;

  --pa-density-normal-dot-size: 1.2px;
  --pa-density-normal-gap: 10px;
  --pa-density-normal-opacity: 0.16;

  --pa-lumen-soft-color: #AFCDF7;
  --pa-lumen-soft-opacity: 0.16;
  --pa-lumen-soft-spread: 20px;

  --pa-flow-drift-speed: 0.2;
  --pa-flow-drift-amplitude: 2px;
  --pa-flow-drift-duration: 9000ms;
}
```

---

## 9. Figma Variables 구성안

### Collection 1. `Ref`

- `color.paper.*`
- `color.mist.*`
- `color.air.*`
- `color.aqua.*`
- `color.mint.*`
- `color.dusk.*`
- `color.night.*`
- `color.signal.*`
- `space.*`
- `radius.*`
- `blur.*`
- `shadow.*`
- `font.*`

### Collection 2. `System`

- `surface.*`
- `density.*`
- `lumen.*`
- `flow.*`
- `motion.*`
- `type.*`
- `state.*`

### Collection 3. `Component`

- `atmospherePanel.*`
- `signalCard.*`
- `dataVeil.*`
- `lumenRing.*`
- `flowDock.*`
- `contextChip.*`

### Collection 4. `Mode`

- `day`
- `dusk`
- `night`
- `rainy`
- `reducedMotion`
- `reducedTransparency`
- `highContrast`
- `lowPower`
- `focus`

---

## 10. v0.1에서 의도적으로 제외한 것

| 제외 항목 | 이유 |
|---|---|
| 강한 refraction token | Liquid Glass와 유사해지고 가독성 위험이 큼 |
| 높은 specular/highlight | 번들거림과 과장된 느낌을 만든다 |
| 강한 네온 glow | 바람의 탑의 절제된 빛보다 사이버펑크에 가까워짐 |
| 복잡한 particle shader 기본값 | 성능과 접근성 리스크 |
| 브랜드 고정 컬러 | WeatherON 외 다른 앱 적용 가능성을 열어두기 위함 |
| 과한 elevation scale | Material 3의 구조와 겹치며 차별성 약화 |

---

## 11. 구현 우선순위

### Phase 1. Foundation

1. `ref.color`
2. `ref.radius`
3. `ref.space`
4. `sys.surface`
5. `sys.type`

### Phase 2. Perfora Differentiators

1. `sys.density`
2. `sys.lumen`
3. `sys.flow`
4. `sys.state`

### Phase 3. Component

1. `AtmospherePanel`
2. `SignalCard`
3. `DataVeil`
4. `LumenRing`
5. `FlowDock`

### Phase 4. Accessibility

1. reduced motion
2. reduced transparency
3. high contrast
4. low power
5. focus mode

---

## 12. v0.1 요약

Perfora Air Tokens v0.1은 다음을 목표로 한다.

1. **밝고 가벼운 표면**  
   어둡거나 무겁지 않은 atmospheric UI.

2. **무광에 가까운 재료성**  
   과한 glass/refraction/shine을 피한다.

3. **밀도로 전달되는 맥락**  
   패턴은 장식이 아니라 정보량과 긴급도를 표현한다.

4. **빛은 피드백**  
   lumen은 장식 효과가 아니라 상태 신호다.

5. **움직임은 조용하게**  
   flow는 공기처럼 낮은 존재감으로만 사용한다.

6. **접근성 우선 구조**  
   reduced motion/transparency/high contrast를 토큰 레벨에서 제공한다.

---

## 첨부 파일

- `perfora-air.tokens.v0.1.json` — W3C-style 디자인 토큰 JSON
- `perfora-air.v0.1.css` — CSS custom properties
- `perfora-air.token-map.v0.1.ts` — context data → token state 매핑 helper
