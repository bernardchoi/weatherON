# Perfora Air Ambient Dashboard MVP v0.1 — 접근성 테스트 리포트

- 테스트 대상: `perfora_air_ambient_dashboard_mvp_v0_1_app.html`
- 개선 산출물: `perfora_air_ambient_dashboard_mvp_v0_1_a11y_patched.html`
- 테스트 일자: 2026-07-09
- 범위: 정적 웹 MVP, 단일 HTML 프로토타입
- 목표: Perfora Air의 핵심 미학인 **Matte Air / Soft Density / Quiet Signal / Text First**를 유지하면서, 텍스트 대비·키보드 조작·모션/투명도 제어·상태 전달을 접근성 기준에 맞게 보강한다.

> 이 리포트는 자동/정적 점검과 브라우저 기반 계산 결과다. 실제 WCAG 적합성 인증이나 보조공학 전체 호환성 인증은 아니며, VoiceOver, TalkBack, NVDA, JAWS, 실제 저시력 사용자 테스트가 추가로 필요하다.

---

## 1. 테스트 기준

주요 기준은 다음 항목을 중심으로 잡았다.

| 영역 | 기준 | 적용 방식 |
|---|---|---|
| 텍스트 대비 | WCAG 2.2 SC 1.4.3 Contrast Minimum | 일반 텍스트 4.5:1 이상, 큰 텍스트 3:1 이상 기준으로 계산 |
| 색상 의존성 | WCAG SC 1.4.1 Use of Color | 경고/상태를 색상만으로 전달하지 않고 텍스트·아이콘·상태 라벨 병행 |
| 키보드 접근 | WCAG SC 2.1.1 Keyboard, SC 2.4.7 Focus Visible | 모든 조작 요소를 버튼/체크박스로 유지하고 `:focus-visible` 보강 |
| 포커스 표시 | WCAG 2.2 Focus Appearance 관련 권고 | 2px 이상 outline, 3px offset 적용 |
| 이름/역할/상태 | WCAG SC 4.1.2 Name, Role, Value | aria-label, aria-current, aria-pressed, aria-live 상태 점검 |
| 모션 감소 | OS/browser motion preference | `prefers-reduced-motion` 및 UI 내 Reduced Motion 토글 점검 |
| 투명도 감소 | OS/browser transparency preference | `prefers-reduced-transparency` 및 UI 내 Reduced Transparency 토글 점검 |

참고 자료:

- W3C WCAG 2.2 — https://www.w3.org/TR/WCAG22/
- W3C Understanding SC 1.4.3 Contrast Minimum — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- W3C Understanding SC 2.4.7 Focus Visible — https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- W3C Understanding SC 2.4.13 Focus Appearance — https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- MDN prefers-reduced-motion — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- MDN prefers-reduced-transparency — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-transparency

---

## 2. 테스트 방법

브라우저 기반 자동 점검 스크립트를 작성해 Chromium에서 MVP를 로드하고 다음을 검사했다.

1. 문서 메타 정보
   - `html[lang]`
   - `<title>`
   - viewport meta

2. 구조/랜드마크
   - `main`, `nav`, `header`, `aside`
   - heading hierarchy
   - `aria-labelledby`, `aria-describedby` 참조 무결성

3. 조작 요소
   - 버튼/체크박스/링크의 accessible name 존재 여부
   - `aria-current`, `aria-pressed` 등 상태 표현
   - 44px 기준 터치 타깃 크기
   - 포커스 outline 유무

4. 텍스트 대비
   - Day / Dusk / Rainy / Night 모드
   - Normal / Alert 시나리오
   - 총 8개 조합에서 visible text element의 전경색/배경색 대비 계산

5. 모션/투명도 제어
   - UI 내 Reduced Motion 토글
   - UI 내 Reduced Transparency 토글
   - 브라우저의 `prefers-reduced-motion: reduce` 에뮬레이션

---

## 3. 1차 테스트 결과: 원본 MVP

| 항목 | 결과 |
|---|---:|
| 조작 요소 수 | 14 |
| accessible name 누락 | 0 |
| 깨진 ARIA 참조 | 0 |
| 44px 미만 조작 타깃 | 9 |
| Day Normal 대비 실패 | 15 |
| Day Alert 대비 실패 | 15 |
| Dusk Normal 대비 실패 | 15 |
| Rainy Normal 대비 실패 | 15 |
| Night Normal 대비 실패 | 46 |
| Night Alert 대비 실패 | 42 |

### 주요 이슈

#### 3.1 작은 보조 텍스트 대비 부족

`--pa-text-tertiary`가 `#73808D`로 지정되어 있었고, 11–12px 라벨에서 약 3.9:1 수준까지 떨어졌다. 작은 라벨이 장식에 가까운 경우도 있었지만, `습도`, `AQI`, `Air Quality`, `Schedule`처럼 정보 구조를 설명하는 텍스트도 포함되어 있어 개선이 필요했다.

#### 3.2 조작 타깃 높이 부족

Scenario, Atmosphere 버튼은 높이 36px, gust icon button은 42px였다. 모바일 앱형 프로토타입이라는 점을 고려해 44px 기준으로 상향 조정이 필요했다.

#### 3.3 포커스 표시의 일관성 부족

하단 Flow Dock 버튼은 명시적 `:focus-visible` 스타일이 있었지만, Scenario/Atmosphere 버튼과 icon button은 브라우저 기본 outline에 가까웠다. 시스템 전체의 접근성 품질을 맞추기 위해 공통 포커스 규칙이 필요했다.

#### 3.4 Night 모드 내부 카드 대비 불안정

Night 모드에서 일부 내부 카드와 pill은 밝은 배경을 유지하면서 텍스트가 밝은 색으로 전환되어 대비가 불안정했다. 특히 status pill, metric row, recommendation card, token readout 계열에서 문제가 발생했다.

#### 3.5 상태 버튼의 선택 상태 전달 부족

시각적으로는 `.is-active`가 있었지만 보조공학에 전달되는 눌림/선택 상태가 없었다. Scenario와 Atmosphere 버튼은 상호 배타적 선택에 가깝지만, MVP 구조에서는 `aria-pressed`를 통해 현재 활성 상태를 전달하도록 개선했다.

#### 3.6 시스템 Reduced Motion에서 일부 애니메이션 유지

UI 내부의 Reduced Motion 토글은 잘 작동했지만, 브라우저/OS 설정의 `prefers-reduced-motion: reduce` 상태에서는 `.ambient-flow`와 화면 전환 애니메이션이 남아 있었다.

---

## 4. 적용한 개선 사항

### 4.1 대비 토큰 보강

```css
--pa-text-tertiary: var(--pa-color-graphite-600);
--pa-color-signal-success: #2F805D;
```

- 작은 라벨과 보조 텍스트의 기본 대비를 개선했다.
- 기존의 부드럽고 흐린 톤은 유지하되, 정보 텍스트로 쓰이는 색상은 WCAG 대비 기준을 넘기도록 조정했다.

### 4.2 Night 모드 별도 대비 규칙 추가

```css
[data-pa-mode="night"] {
  --pa-text-secondary: rgba(247, 250, 255, 0.78);
  --pa-text-tertiary: rgba(247, 250, 255, 0.76);
}
```

추가로 Night 모드에서 다음 요소의 배경/텍스트 색상을 별도 정의했다.

- `.seg-btn`
- `.mode-swatch`
- `.icon-button`
- `.metric-row span`
- `.recommendation-card`
- `.token-row`
- `.pa-context-chip`
- `.status-pill`
- `.recommendation-icon`
- `.device-icon`
- `.schedule-time`

### 4.3 조작 타깃 상향

```css
.seg-btn,
.mode-swatch {
  min-height: 44px;
}
.icon-button {
  width: 44px;
  height: 44px;
}
```

Skip link도 44px 높이로 맞췄다.

### 4.4 포커스 표시 통합

```css
button:focus-visible,
input:focus-visible,
.seg-btn:focus-visible,
.mode-swatch:focus-visible,
.icon-button:focus-visible,
.setting-row input:focus-visible {
  outline: 2px solid var(--pa-color-air-600);
  outline-offset: 3px;
}
```

Night 모드에서는 focus outline을 `--pa-color-air-300`으로 전환해 어두운 배경에서 식별성을 높였다.

### 4.5 Skip link 추가

```html
<a class="skip-link" href="#main-content">본문으로 건너뛰기</a>
<main id="main-content" tabindex="-1" ...>
```

키보드 사용자가 좌측 설명 패널을 건너뛰고 앱 본문으로 바로 이동할 수 있도록 했다.

### 4.6 Live region 추가

```html
<div id="a11yStatus" class="sr-only" aria-live="polite" aria-atomic="true"></div>
```

다음 변경이 스크린리더에 전달되도록 했다.

- 화면 전환
- Scenario 변경
- Atmosphere mode 변경
- 접근성 토글 변경

### 4.7 상태 버튼 ARIA 보강

Scenario/Atmosphere 버튼에 `aria-pressed`를 추가하고, JS 업데이트 시 활성 버튼의 상태를 동기화했다.

```js
btn.setAttribute('aria-pressed', active ? 'true' : 'false');
```

### 4.8 하단 Dock accessible name 개선

기존에는 `Home`이 두 번 등장했다. 두 번째 Home을 `Air`로 바꾸고, 각 버튼에 명확한 `aria-label`을 부여했다.

- Home dashboard
- Air Flow detail
- Smart Home Air
- Day Flow schedule
- Modes and accessibility settings

### 4.9 Reduced Motion 미디어 쿼리 보강

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition-duration: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

브라우저/OS의 motion preference에서도 ambient flow와 화면 전환 애니메이션이 제거되도록 수정했다.

---

## 5. 개선 후 테스트 결과

| 항목 | 원본 | 개선 후 |
|---|---:|---:|
| 조작 요소 수 | 14 | 15 |
| accessible name 누락 | 0 | 0 |
| 깨진 ARIA 참조 | 0 | 0 |
| 44px 미만 조작 타깃 | 9 | 0 |
| Day Normal 대비 실패 | 15 | 0 |
| Day Alert 대비 실패 | 15 | 0 |
| Dusk Normal 대비 실패 | 15 | 0 |
| Dusk Alert 대비 실패 | 15 | 0 |
| Rainy Normal 대비 실패 | 15 | 0 |
| Rainy Alert 대비 실패 | 15 | 0 |
| Night Normal 대비 실패 | 46 | 0 |
| Night Alert 대비 실패 | 42 | 0 |

### 모션/투명도 체크

| 상태 | 결과 |
|---|---|
| 기본 상태 | ambient flow animation: `drift`, view animation: `viewIn`, backdrop blur: `blur(8px)` |
| UI Reduced Motion ON | ambient flow animation: `none`, view animation: `none` |
| OS/browser `prefers-reduced-motion: reduce` | ambient flow animation: `none`, view animation: `none` |
| UI Reduced Transparency ON | backdrop-filter: `none`, surface background: solid paper color |

---

## 6. 접근성 관점에서 유지된 디자인 차별성

이번 개선은 Perfora Air의 시각 언어를 단순히 고대비 UI로 평평하게 만든 것이 아니다. 핵심 차별성은 유지했다.

| Perfora Air 원칙 | 접근성 반영 방식 |
|---|---|
| Matte Air | blur와 투명도는 유지하되, Reduced Transparency에서 단색 표면으로 대체 |
| Soft Density | 패턴은 유지하되 텍스트 위에서 정보 인지를 방해하지 않도록 낮은 opacity 유지 |
| Quiet Signal | 빛/색만으로 상태를 전달하지 않고 텍스트와 상태 라벨 병행 |
| Text First | alert 상태는 시각 효과보다 실제 문장과 액션을 우선 |
| Ambient Feedback | 화면/상태 변경은 live region으로 보조공학에도 전달 |

---

## 7. 남은 수동 테스트 권장 항목

자동 점검 기준에서는 개선 후 주요 실패 항목이 0으로 줄었다. 다만 다음은 실제 기기/보조공학 테스트가 필요하다.

1. VoiceOver iOS / macOS
   - 하단 Flow Dock 읽기 순서
   - Scenario/Atmosphere 버튼의 `aria-pressed` 읽힘
   - live region의 과잉 알림 여부

2. Android TalkBack
   - 커스텀 checkbox/switch 조작감
   - 하단 Dock 탐색 순서
   - label과 value 읽힘 방식

3. Windows NVDA / JAWS
   - screen region 변경 시 문맥 이해 가능성
   - chart-like timeline이 장식/정보 중 어떤 방식으로 읽히는지 검토

4. 실제 저시력 사용자 테스트
   - 11–12px 라벨 크기 자체의 체감 가독성
   - Night 모드와 Rainy 모드의 배경 패턴 피로도
   - DensityField가 정보 보조인지 장식인지 명확히 느껴지는지

5. 데이터 시각화 대체 텍스트
   - 현재 timeline과 density pattern은 대부분 시각적 요약에 가깝다.
   - 정식 제품에서는 시간대별 변화 요약을 텍스트로 별도 제공하는 것이 좋다.

---

## 8. 최종 판단

개선 후 MVP는 정적/자동 점검 기준에서 다음 수준까지 올라왔다.

```txt
Contrast: Pass in tested mode/scenario combinations
Target Size: Pass at 44px product baseline
Keyboard Focus: Pass with explicit :focus-visible
ARIA References: Pass
Accessible Names: Pass
Reduced Motion: Pass for UI toggle and system preference
Reduced Transparency: Pass for UI toggle and CSS media support
```

따라서 현재 산출물은 **프로토타입 리뷰용 접근성 기준을 통과한 상태**로 볼 수 있다. 다음 단계에서는 보조공학 수동 테스트와 실제 사용자 테스트를 통해 live region 강도, 화면 전환 문맥, chart-like 요소의 대체 설명을 조정하는 것이 좋다.
