# Perfora Air — Ambient Dashboard MVP v0.1

## 목적

요코하마 바람의 탑에서 도출한 Perfora Air 디자인 언어를 실제 앱 화면으로 검증하기 위한 정적 웹 MVP다. 핵심 검증 질문은 다음이다.

> 사용자가 숫자와 그래프를 자세히 읽기 전에, 화면의 표면 밀도·흐름·문장으로 현재 상태와 필요한 행동을 이해할 수 있는가?

## 범위

- Home / Ambient Dashboard
- Weather Detail / Air Flow
- Smart Home Air
- Day Flow / Schedule
- Modes & Accessibility

## 디자인 기준

```txt
Matte Air
Soft Density
Quiet Signal
Text First
```

Liquid Glass처럼 강한 굴절, 반짝임, 번들거림을 사용하지 않는다. Material 3처럼 색상/컴포넌트 체계만의 안정감으로 끝내지 않고, 보이지 않는 맥락을 밀도·흐름·문장으로 번역한다.

## MVP 기능

### 1. Scenario 전환

- Calm
- Normal
- Live
- Alert

시나리오를 바꾸면 온도, 습도, 풍속, AQI, 일정 밀도, 추천 문구, 패턴 밀도, Lumen Ring 값이 함께 바뀐다.

### 2. Atmosphere 모드

- Day
- Dusk
- Rainy
- Night

맥락별 표면 톤을 확인한다. Night 모드는 포함하되, 전체 시스템 기본 톤은 밝고 무광에 가깝게 유지한다.

### 3. 화면 탭

- Home
- Flow
- Home Air
- Day
- Modes

### 4. 접근성 제어

- Reduced Motion
- Reduced Transparency
- High Contrast
- Low Power
- Text-first Alert

## 사용한 기존 산출물

- `perfora-air.v0.1.css`
- `perfora-air.components.v0.1.css`
- `perfora-air.tokens.v0.1.json`
- `perfora-air.components.v0.1.json`
- `perfora-air.component-types.v0.1.ts`

## 구조

```txt
perfora_air_ambient_dashboard_mvp_v0_1/
├─ index.html
├─ src/
│  ├─ mvp.css
│  ├─ mvp.js
│  ├─ perfora-air.v0.1.css
│  ├─ perfora-air.components.v0.1.css
│  ├─ perfora-air.tokens.v0.1.json
│  ├─ perfora-air.components.v0.1.json
│  └─ perfora-air.component-types.v0.1.ts
└─ docs/
   └─ mvp_spec.md
```

## 다음 단계

1. 실제 WeatherON 데이터 구조에 맞춘 adapter 작성
2. React/SwiftUI 컴포넌트로 이식
3. 기기별 성능 확인
4. 접근성 모드별 정보 전달 테스트
5. Figma variables와 CSS variables 간 동기화
