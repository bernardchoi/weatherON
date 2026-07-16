# WeatherON UI 통합 디자인 스펙

Version 1.0 · 2026-07-03 · Source of Truth

---

## 1. 목적

이 문서는 WeatherON의 앱 UI를 구현할 때 따르는 단일 디자인 스펙이다.
브랜드 문서, 목업, 와이어프레임, 구현 토큰이 서로 다를 때의 우선순위를 고정한다.

핵심 원칙은 두 가지다.

- 목업과 와이어프레임의 구성, 아이콘, 컴포넌트 형태가 다르면 목업 기준을 따른다.
- MVP 범위에서도 이 통합 디자인 스펙을 따른다. 기능 범위 축소가 시각 완성도 축소를 의미하지 않는다.

---

## 2. 기준 우선순위

| 우선 | 기준 | 역할 |
|---:|---|---|
| 1 | `mockups/WeatherON_design_system.jsx` | 컴포넌트 형태, 탭바, 아이콘 path, radius, 상태 레이어의 최상위 기준 |
| 2 | `mockups/WeatherON_theme_tokens.js` | 라이트/다크 토큰, 배경, 패널, 기능색 기준 |
| 3 | 개별 화면 목업 `mockups/WeatherON_*_mockup.jsx` | 화면 구성, 밀도, CTA 위치, 카드 위계 기준 |
| 4 | `brand/WeatherON_디자인_정체성_가이드.md` | 변하지 않는 브랜드 축, 색 의미, 타이포, OS 트렌드 수용 원칙 |
| 5 | `brand/WeatherON_아이콘_시스템.md` | 인앱 아이콘 그리드, 크기, stroke, 컬러 운용 |
| 6 | `docs/wireframes/UIUX_플로우차트.mmd`, `WeatherON_wireframe_template.html` | 화면 흐름, 상태, 라우트, 정보 구조 참고 |
| 7 | `apps/mobile/src/theme/tokens.ts`, 구현 코드 | 실제 구현값. 위 기준과 다르면 수정 대상 |

와이어프레임은 플로우와 상태 정의용이다.
시각 구성, 탭 개수, 아이콘 모양, 컴포넌트 반경, CTA 위계는 목업이 우선한다.

---

## 3. MVP 적용 규칙

MVP는 기능 출시 범위를 줄일 수 있지만 디자인 스펙은 줄이지 않는다.

- MVP에서도 WeatherON 고유의 `Clear Navy + Warm Sun`, 기능색, 아이콘 스케일, 탭바 스타일을 유지한다.
- 기능이 준비되지 않은 화면은 삭제 대신 목업 기준의 empty, gate, disabled, preview 상태로 처리한다.
- 기능 미구현을 이유로 아이콘을 텍스트, 이모지, 임시 기호로 대체하지 않는다.
- 구현 편의를 이유로 목업의 5탭 구조를 임의의 다른 구조로 바꾸지 않는다. 탭 노출을 줄여야 할 때는 별도 제품 예외로 기록한다.
- MVP 문서, 로드맵, 와이어프레임이 이 문서와 충돌하면 이 문서가 우선한다.

### 차기 디자인 시스템 트랙

`docs/Project Wind/`는 출시 후 대규모 UI 업데이트를 위한 신규 디자인 시스템 트랙이다.
현행 MVP, Android 비공개 테스트, v1.0 출시 후보는 이 문서를 기준으로 유지한다.
Project Wind의 Perfora Air v1.0은 토큰, 10개 컴포넌트 계약, 접근성 fallback, 참조 대시보드, 자동 무결성 검증을 완료한 stable internal release다.
단, 현행 화면에 자동 편입하지 않으며 별도 채택 ADR, React Native 변환, 화면별 목업 승인, 실기기·보조공학 QA를 통과한 뒤 차기 메이저 UI 개편 후보로만 적용한다.

### iOS 빌드 한정 Liquid Glass 보조 레이어

iOS 빌드에는 WeatherON 목업 기준을 유지하는 범위에서 Liquid Glass 계열 표현을 일부 적용할 수 있다.
Project Wind 기준의 디자인 시스템은 추후 대규모 업데이트 대상으로 유지하며, 이 항목은 현행 UI 위에 얹는 iOS 전용 보조 레이어로만 취급한다.

- 적용 대상: 상단/하단 바, 뒤로가기 버튼, 하단 메뉴 내비게이션, Sheet/Modal, 날씨 카드 일부.
- 표현 방식: 반투명 surface, 얇은 stroke, iOS shadow, 배경 흐림 또는 대체 tint를 사용한다.
- 금지: 홈 전체 배경, 핵심 CTA, 정보 카드 전체를 glass 표면으로 바꾸지 않는다.
- 조건: React Native 변환 가능성, 접근성 대비, 모션 감소 설정, iOS 실기기 QA를 통과한 항목만 채택한다.

### Android 빌드 한정 Material 3 보조 레이어

Android 빌드에는 WeatherON 목업 기준을 유지하는 범위에서 Material 3 / Material You 계열 표현을 일부 적용할 수 있다.
이 항목은 현행 UI 위에 얹는 Android 전용 보조 레이어로만 취급하며, Dynamic Color를 앱 전체에 자동 적용하지 않는다.

- 적용 대상: 하단 메뉴 내비게이션, 뒤로가기/아이콘 버튼, Sheet/Modal, 날씨 카드 일부, CTA 역할 구분.
- 표현 방식: surface container, state layer/ripple, active indicator, Android elevation, bottom sheet drag handle 감각을 WeatherON 토큰으로 리틴트한다.
- 상단 hero/header는 적용 대상에서 제외한다. 보조 레이어가 브랜드 헤더를 별도 부유 카드로 바꾸지 않게 한다.
- 하단 메뉴 active indicator는 64×32px로 아이콘 뒤에 고정하고 기존 5px Gold active dot을 함께 유지한다.
- Android 네이티브 ripple을 쓰는 요소에는 커스텀 state layer를 중복 적용하지 않는다.
- 뒤로가기/아이콘 버튼은 tonal surface와 ripple을 쓰되 기본 상태 elevation은 0으로 둔다.
- 금지: WeatherON `Clear Navy + Warm Sun` 팔레트, 목업 탭 구조, 아이콘 크기, CTA 위계를 Material 기본값으로 덮어쓰지 않는다.
- 제한: Material 3 Expressive의 강한 색·큰 형태·과한 모션은 MVP에 직접 적용하지 않고, Android 실기기 QA를 통과한 보조 표현만 채택한다.

---

## 4. 제품 디자인 축

### 컨셉

WeatherON은 날씨 데이터를 많이 보여주는 앱이 아니라 오늘 준비 결정을 빠르게 돕는 앱이다.
모든 화면은 `5초 안에 오늘 준비 끝`을 기준으로 정보량을 조절한다.

### 브랜드 톤

- Quiet Horizon
- Clear Navy + Warm Sun
- Sky / Clear / Rain / Mist 기능색
- 토글 + 태양노브 공유 글리프
- OS 트렌드는 그대로 복제하지 않고 WeatherON 토큰으로 리틴트한다.

### 정보 위계

1. 지금 결정해야 하는 것
2. 사용자가 바로 누를 수 있는 행동
3. 판단 근거
4. 세부 설정과 설명

---

## 5. 컬러 토큰

### 다크 모드

| 토큰 | 값 | 용도 |
|---|---|---|
| `NAVY` | `#071E33` | 앱 배경, 브랜드 필드 |
| `NAVY_DARK` | `#0B2E49` | 탭바, 강한 surface |
| `PANEL` | `#103D5F` | 기본 카드 |
| `PANEL_L1` | `#16557F` | 시트, 상위 surface |
| `PANEL_L2` | `#2373A4` | 시트 내부 중첩 요소 |
| `GOLD` | `#FFC758` | ON, 활성, 1차 CTA |
| `SKY` | `#58BFFF` | 비, 흐림, 정보, 알림 |
| `SKY_LITE` | `#D8F3FF` | 작은 라벨 대비 보강 |
| `CLEAR` | `#5DE2C2` | 정상, 안전, 완료 |
| `WARM` | `#FF9A66` | 약한 주의, 따뜻한 정보 |
| `RAIN_RED` | `#FF7F78` | blocking 경고, 위험 |
| `MIST` | `#DCF0FF` | 보조 텍스트, 중성 아이콘 |
| `TEXT` | `#F6FBFF` | 본문 텍스트 |

### 라이트 모드

| 토큰 | 값 | 용도 |
|---|---|---|
| `LIGHT_BG` | `#F5F9FC` | 앱 배경 |
| `LIGHT_SURFACE` | `#FFFFFF` | 기본 카드 |
| `LIGHT_ELEVATED` | `#EAF3FA` | 보조 surface |
| `LIGHT_GOLD` | `#C2410C` | 라이트 CTA, 활성 |
| `LIGHT_SKY` | `#1D6DA8` | 정보, 비/흐림 |
| `LIGHT_CLEAR` | `#007F73` | 정상, 완료 |
| `LIGHT_WARM` | `#C84A2F` | 약한 주의 |
| `LIGHT_TEXT` | `#142033` | 본문 텍스트 |
| `LIGHT_MIST` | `#40536A` | 보조 텍스트 |

### 컬러 사용 규칙

- Gold는 ON, 활성 탭, 1차 CTA에만 우선 사용한다.
- 알림 미읽음, 권한 권장, 정보성 테두리에 Gold를 쓰지 않는다.
- Blocking 오류는 Rain Red, 비차단 권장은 Sky, 정상/완료는 Clear로 나눈다.
- 소형 보조 텍스트는 다크에서 opacity 0.80 이상, 라이트에서 opacity 0.60 이상을 기본값으로 둔다.

---

## 6. 타이포그래피

| 용도 | 폰트 |
|---|---|
| 영문 UI / 숫자 / 라벨 | Plus Jakarta Sans |
| 한글 UI | Noto Sans KR |
| 수치, 시간, 상태 코드 | DM Mono |
| 워드마크 | Manrope 전용 |

규칙:

- OS 기본 폰트로 전체 UI를 대체하지 않는다.
- UI 텍스트 letter spacing은 0을 기본값으로 둔다.
- 워드마크와 로고 락업은 별도 브랜드 규칙을 따른다.
- 작은 라벨은 굵기보다 대비와 간격으로 위계를 만든다.

### 가독성·카드 밀도

텍스트 크기 피드백이 있는 화면은 글자 크기만 키우지 않고, 문장 길이와 카드 위계를 함께 조정한다.

- 홈, 출발, 마이의 주요 카드 제목·수치·상태값은 기존 대비 1~3px 키우되, 보조 문구는 1줄 기준으로 축약한다.
- 긴 설명형 문장은 아이콘, 숫자, pill, 상태 dot, 이미지 슬롯으로 전환한다.
- 핵심 카드는 6~12px 정도 넓게 쓰되 첫 viewport에서 핵심 판단이 보이도록 카드 개수와 본문 줄 수를 제한한다.
- 출발 목적지 카드는 3줄 요약 원칙을 유지한다. 큰 카드로 바꾸더라도 목적지명, 날씨 차이, 강수, 출발/도착, 다음 행동을 한눈에 읽히게 둔다.
- 다크 모드에서는 커진 텍스트가 답답해 보이지 않도록 `MIST`, `SKY_LITE`, `CLEAR` 계열 대비를 우선 사용한다.

---

## 7. 레이아웃 기준

| 항목 | 기준 |
|---|---|
| 모바일 기준 프레임 | 393 × 852 |
| 내부 스크롤 | 화면에 스크롤바 노출 금지 |
| 하단 고정 CTA | 탭바와 겹치지 않게 bottom safe area 확보 |
| 카드 이미지 | `object-fit: contain` 또는 고정 비율 슬롯 |
| 정보 밀도 | 첫 viewport에서 핵심 판단 2~3개까지만 우선 |

고정 CTA와 탭바가 있는 화면은 마지막 콘텐츠가 가려지지 않도록 충분한 하단 padding을 둔다.

---

## 8. Radius, Spacing, Elevation

목업 기준 radius를 따른다.

| 토큰 | 값 | 용도 |
|---|---:|---|
| `RADIUS.card` | 20 | 기본 카드 |
| `RADIUS.cardSm` | 16 | 작은 카드, 칩 그룹 |
| `RADIUS.sheet` | 28 | 바텀시트, 모달 |
| `RADIUS.pill` | 16 또는 999 | pill, 상태 칩 |
| `RADIUS.tab` | 24 | floating tab bar |

구현 토큰이 8px 위주로 줄어든 경우 목업 대비 조정 대상이다.
운영형 리스트나 초밀도 보조 영역만 8px 이하를 예외로 둘 수 있다.

Spacing은 구현 토큰 `xs 6`, `sm 10`, `md 14`, `lg 18`, `xl 24`를 기본으로 사용하되, 화면 단위 구성과 CTA 위치는 목업을 우선한다.

### 카드 그림자 (Elevation)

목업 BrandCard 기준 그림자(`0 6px 16px rgba(0,0,0,0.30)`)는 구현 토큰 `cardShadow(theme)`(`apps/mobile/src/theme/tokens.ts`)로 통일한다.

- 값: shadowColor 순수 블랙, offset 0/6, radius 12, opacity 다크 0.40 / 라이트 0.18, Android `elevation: 4`.
- 적용 대상: 화면 배경 위 **최상위 불투명 카드**에만 적용한다.
- 금지: 카드 안에 중첩된 표면, `cardMuted` 같은 반투명 배경에는 적용하지 않는다. Android elevation이 부모 표면 위로 두꺼운 그림자 아티팩트를 만든다(2026-07-08 실기기 확인).

### 모션 (화면 전환 · 오버레이 · 프레스)

목업은 정적 이미지라 모션을 직접 규정하지 않지만, "실제 앱을 쓰는 느낌"은 정적 화면이 아니라 전환 방식에서 나온다. 아래를 기본 모션 기준으로 둔다.

| 대상 | 방식 | 값 |
|---|---|---|
| 화면 전환 (라우트 변경) | `ScreenTransition`(`apps/mobile/src/components/ScreenTransition.tsx`)이 `key={route}`로 리마운트되며 opacity 0→1, translateY 14→0 | 240ms, `Easing.out(Easing.cubic)` |
| 알림 사이드바 | 스크림 opacity 0→1, 패널 translateX 420→0(닫을 때 역재생 후 언마운트) | 진입 260ms cubic-out, 퇴장 200ms cubic-in |
| 탭바 프레스 | tint overlay opacity 0→0.12 (spec §10과 동일 값을 실제 애니메이션으로 구현) | 120ms |
| 1차 CTA(AppButton) 프레스 | scale 1→0.97 + opacity 1→0.88 | 110ms |
| 일반 탭 요소 | `FeedbackPressable` state layer opacity 0→0.12 | 120ms |

규칙:
- RN `Animated` API만 사용한다(reanimated 등 신규 네이티브 의존성 추가 금지 — Expo 관리형 워크플로에서 추가 네이티브 링킹 없이 즉시 쓸 수 있어야 함).
- 오버레이(Modal 등)는 `visible` prop이 꺼져도 즉시 언마운트하지 말고, 내부 `mounted` state로 퇴장 애니메이션이 끝난 뒤 언마운트한다. 그렇지 않으면 열 때만 애니메이션되고 닫을 때는 순간 사라진다.
- 탭 전환(홈/코디/출발/MY)과 드릴인 전환에 같은 트랜지션을 쓴다. 방향(전진/후진)을 구분하는 슬라이드는 라우터가 실제 네비게이션 스택을 갖지 않아 방향을 신뢰할 수 없으므로 도입하지 않는다 — 잘못된 방향의 슬라이드가 무전환보다 나쁘다.
- OS의 모션 감소 설정이 켜지면 `ScreenTransition`의 페이드·이동을 생략하고 즉시 전환한다.
- 검색 결과, 카드, 리스트 행, 세그먼트, 설정 토글은 공통 `FeedbackPressable`을 사용해 눌림 상태를 일관되게 전달한다.

---

## 9. 아이콘 시스템

### 기본 규칙

| 용도 | 크기 |
|---|---:|
| 탭바 아이콘 | 21px |
| 리스트 행 보조 아이콘 | 18px |
| 헤더/원형 버튼 내부 아이콘 | 16px |
| 홈 히어로 날씨 상태 아이콘 | Pad 96px / icon 60px |
| 쉐브런/보조 인디케이터 | 14px |

아이콘은 24×24 viewBox, strokeWidth 1.8, round cap, round join, fill none을 기본으로 한다.
홈 히어로처럼 날씨 상태를 대표하는 큰 아이콘은 작은 원형 버튼 규격을 쓰지 않고, 별도 Pad를 넉넉하게 잡아 잘림 없이 보여준다.

### 금지

- 이모지를 생산 UI 아이콘으로 사용하지 않는다.
- `비`, `OSS`, `문서` 같은 텍스트를 아이콘 박스 안에 넣어 아이콘처럼 쓰지 않는다.
- 탭바 아이콘 path를 화면별로 다르게 그리지 않는다.
- Gold를 장식 아이콘에 분산하지 않는다.

### 장소/목적지 아이콘

O6/P1/P2/P3의 회사, 학교, 공항, 숙소, 야구장, 등산, 해변, 계절, 문화 아이콘은 `mockups/WeatherON_destination_icons.jsx` 기준을 따른다.

---

## 10. 하단 탭바

목업 기준 탭바는 5개다.

| 순서 | 탭 | 라우트 | 아이콘 기준 |
|---:|---|---|---|
| 1 | 홈 | H1 | home line icon |
| 2 | 코디 | C1 | outfit line icon |
| 3 | 출발 | G1 | depart/navigation line icon |
| 4 | MY | M1 | user line icon |
| 5 | 소셜 | S1 | chat/community line icon |

### 스타일

| 항목 | 값 |
|---|---|
| 위치 | bottom 18, left/right 16 |
| 높이 | 64 |
| radius | 24 |
| 배경 | 다크 `NAVY_DARK`, 라이트 `LIGHT_SURFACE` |
| active 표시 | 5px dot + Gold icon/text |
| inactive | Mist 계열 |
| 아이콘 | 21px, stroke 1.8 |
| 프레스 | tint overlay opacity 0.12, 120ms |

iOS 빌드에서는 하단 메뉴 내비게이션에 Liquid Glass 보조 레이어를 적용할 수 있다.
이때 탭 개수, route, 아이콘 크기, active dot, safe area 기준은 위 표를 유지한다.
배경만 반투명 surface, hairline stroke, iOS shadow 또는 blur fallback으로 조정한다.

Android 빌드에서는 하단 메뉴 내비게이션에 Material 3 보조 레이어를 적용할 수 있다.
이때 탭 개수, route, 아이콘 크기, active dot, safe area 기준은 위 표를 유지한다.
배경만 surface container, active indicator, ripple/state layer, Android elevation으로 조정한다.

MVP에서 기능 노출을 줄이더라도 탭바 스펙은 이 기준을 따른다.
3탭 운영이 필요한 경우는 제품 범위 예외로 별도 기록하고, 아이콘/크기/active 표현은 이 스펙을 유지한다.

---

## 11. 공통 컴포넌트

### BrandCard

- 기본 배경은 `PANEL`.
- radius는 20.
- padding은 14×16 기준.
- 좌측 accent bar는 3px.
- 탭 가능한 카드는 state layer press tint를 적용한다.
- 카드 안에 카드 중첩을 만들지 않는다.

### CTA

- 1차 CTA는 Gold 계열.
- 텍스트는 Navy/onAccent.
- 비차단 설정은 Sky/Clear 계열 보조 버튼으로 둔다.
- CTA와 탭바는 서로 붙지 않게 한다.
- Android 빌드에서는 Material 3 filled / tonal / outlined 역할감을 참고하되, 색상과 위계는 WeatherON 토큰을 우선한다.

### Status Pill

| 상태 | 색 |
|---|---|
| ON / 활성 | Gold |
| 정상 / 완료 | Clear |
| 정보 / 설정 권장 | Sky |
| 약한 주의 | Warm |
| 차단 / 오류 | Rain Red |
| 중성 / 보류 | Mist |

### Sheet / Modal

- radius 28.
- 블러와 투명도는 구조적 chrome으로만 사용한다.
- 시스템 기본 흰색/회색 틴트가 아니라 WeatherON Navy/Sky 토큰으로 리틴트한다.
- Android 빌드에서는 Material 3 bottom sheet처럼 surface container, drag handle, elevation을 보조 적용한다.

---

## 12. 화면별 기준

### H1 홈

- 목적: 현재 날씨, 목적지 차이, 비 시작/그침, 오늘 준비를 5초 안에 판단하게 한다.
- 첫 viewport는 핵심 판단 2~3개만 강하게 보여준다.
- 상단 날씨 상태 아이콘은 `weatherOrb` 96px, 내부 이미지 60px 기준으로 유지해 비/자외선 아이콘이 잘리지 않게 한다.
- quick-action은 문구가 잘리지 않게 2줄 안에서 정리한다.
- 알림 미읽음 테두리에 Gold를 쓰지 않는다.
- 대표 코디가 보일 때는 C1/C4의 outfitVariant와 같은 결과를 쓴다.

### H7 내일 브리핑

- 목적: 매일 21시 자기 전 알림을 누른 직후 다음날 외출 판단을 한 화면에서 끝낸다.
- 진입: `bedtime-check` 로컬 푸시와 알림 사이드바/센터의 `내일 브리핑` 카드가 H7로 연결된다.
- 정보 순서: 다음날 날짜·위치 → 날씨 상태 → 최고/최저 → 강수 확률·예상 강수·바람·강수 시각 → 코디 → 우산 준비.
- 데이터 기준: 일별 예보 중 현재 관측일 다음 날짜를 우선 사용한다. 다음날 시간별 데이터가 없으면 일별 예보를 09시/14시/20시 요약으로 보완한다.
- 코디·우산: 다음날 예보로 재계산한다. 당일 H1/C1 결과를 그대로 재사용하지 않는다.
- 하단 탭: 홈 탭 활성 상태를 유지한다. 페이지 이탈은 뒤로가기 또는 `오늘 홈으로` CTA로 처리한다.

### G1 출발

- 목적: 목적지 날씨 비교와 출발 시간 판단.
- 목적지가 없을 때도 placeholder처럼 비워 두지 않는다.
- empty state에는 첫 목적지 추가 CTA, 출발 시간, 비 그침 이점 카드를 함께 둔다.
- 저장 목적지 카드는 G2/P3의 Destination Care State와 동기화한다.
- 저장 목적지 카드는 요약 카드다. 목적지명, 현재 위치 대비 목적지 기온, 강수, 출발/도착 시각, 반복, 경고만 3줄 안에서 보여주고 큰 출발 블록이나 4개 정보 타일을 기본 노출하지 않는다.

### M1 MY

- 목적: 계정, 권한, 알림, 표시, 정책의 설정 허브.
- 같은 강도의 `확인` 배지를 반복하지 않는다.
- blocking 상태만 강한 확인 톤을 사용한다.
- 비차단 설정 권장은 `설정`/Sky 톤으로 처리한다.
- Guest 프로필 안내는 Gold 강조가 아니라 Sky/Clear 정보 톤을 기본으로 한다.

### C1/C4 코디

- Outfit Spec 기법을 따른다.
- 옷 색상은 브랜드/기능색과 분리된 실제 패션 색상 팔레트를 쓴다.
- Gold/Sky/Clear는 주석, 리더라인, 상태 readout에만 쓴다.

### S1 소셜

- ON Square는 확장 기능이어도 아이콘과 탭 구성은 목업 기준을 보존한다.
- MVP에서 기능이 제한되면 preview/gate 상태를 사용한다.

---

## 13. 구현 정합 체크리스트

구현 전후로 아래를 확인한다.

- 목업과 와이어프레임이 다르면 목업을 따랐는가.
- MVP 범위라는 이유로 탭바, 아이콘, radius, CTA 위계가 축소되지 않았는가.
- 탭바 아이콘은 21px/stroke 1.8인가.
- Gold는 ON/활성/CTA에만 쓰였는가.
- Rain Red는 blocking에만 쓰였는가.
- G1 empty state가 기능 이점과 CTA를 함께 보여주는가.
- G1 저장 목적지 카드가 큰 블록형 카드가 아니라 한눈에 읽히는 3줄 요약형인가.
- M1 경고/정보 톤이 분리됐는가.
- 텍스트 아이콘, 이모지 아이콘, 임시 기호가 남아 있지 않은가.
- fixed CTA와 탭바가 겹치지 않는가.
- 라이트/다크 모두 보조 텍스트 대비가 충분한가.

---

## 14. 현재 구현과의 주요 갭

2026-07-07 시각 완성도 점검 반영 후 상태.

| 영역 | 스펙 | 상태 |
|---|---|---|
| 탭 구성 | 목업 기준 5탭 | 4탭(홈/코디/출발/MY) 운영. 2026-07-08 출시 로드맵에 따라 코디 탭 복원. 소셜은 검증 후 복원(`WeatherON_ANDROID_PRODUCT_QUALITY_AUDIT.md` 하단 탭 IA) |
| 탭 스타일 | floating tab bar, radius 24, active dot | 반영됨. `BottomNav` 좌우 16/하단 18 마진, 높이 64, radius 24, 5px Gold dot, 비활성 Mist |
| 카드 radius | card 20 / cardSm 16 / sheet 28 | 반영됨. `tokens.ts` radius lg 20 / md 16 / sheet 28 / tab 24 |
| 텍스트 아이콘 | 금지 | 반영됨. 알림 센터/권한 게이트/약관·제보 체크는 2026-07-05에 ui-icons 이미지로 교체. 2026-07-07에 날씨 제보(맑음/흐림/비/눈/강풍/천둥), 우산 추천 이유(시간/강수량/바람), 위치 변경 검색·현재 위치, 프리미엄 배지에 남아있던 유니코드 기호(☼▬☔＊≋↯◷⌁⌕현★)를 전부 View 기반 drawn glyph로 교체 완료 |
| 상태 톤 | blocking/info/active 분리 | 알림 센터 미읽음 테두리 Gold→Sky, 이력 dot 톤(발송 Sky/열람 Clear/읽음 중성) 정리. 잔여 화면은 실기기 QA에서 재점검 |
| 홈 위치 라벨 | 보조 텍스트가 잘리지 않아야 함 | 반영됨. `HomeScreen`의 위치명 줄과 `현재 온도` 줄을 분리된 `numberOfLines={1}` 텍스트로 나눠, 긴 주소가 온도 줄을 밀어내던 문제 해소 |

이 표는 구현 작업의 우선순위 목록이다.
스펙 자체를 낮추는 근거로 쓰지 않는다.

---

## 15. 관련 문서

- `mockups/WeatherON_design_system.jsx`
- `mockups/WeatherON_theme_tokens.js`
- `docs/Project Wind/yokohama_tower_of_winds_ui_design_system.md`
- `docs/Project Wind/tower_of_winds_ui_trademark_supplement_2026-07-09.md`
- `docs/Project Wind/README.md`
- `docs/Project Wind/perfora_air_v1_0_package/README.md`
- `docs/Project Wind/PROJECT_WIND_V1_AUDIT.md`
- `brand/WeatherON_디자인_정체성_가이드.md`
- `brand/WeatherON_아이콘_시스템.md`
- `brand/WeatherON_로고_디자인철학.md`
- `brand/WeatherON_BI_CI_로고_워드마크_리뷰.md`
- `docs/wireframes/UIUX_플로우차트.mmd`
- `docs/wireframes/WeatherON_wireframe_template.html`
- `apps/mobile/src/theme/tokens.ts`
- Android Material 3: https://developer.android.com/develop/ui/compose/designsystems/material3
- Material Design 3: https://m3.material.io/

---

## 16. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-07-16 (2차) | 다크모드 배경을 깊은 클리어 네이비로 낮추고 카드 계층은 청색 채도를 유지. SKY·CLEAR·GOLD 포인트를 선명하게 조정하고 날씨 상태 배경과 플랫폼 보조 surface를 동기화 |
| 2026-07-16 | Android Material 3 실기기 회귀 수정. 상단 hero surface 오적용 제거, 하단 active indicator 64×32px 고정, 아이콘 버튼 기본 elevation 제거, 네이티브 ripple과 커스텀 state layer 중복 방지 |
| 2026-07-15 (4차) | 홈/출발/마이 화면의 텍스트 가독성 개선 기준 추가 및 구현 반영. 주요 수치·상태·카드 제목은 확대하고, 설명 문구는 축약하며 아이콘·pill·상태 dot 중심으로 전환. 핵심 카드는 6~12px 확장하되 첫 viewport 판단성을 유지 |
| 2026-07-15 (3차) | iOS/Android 공통 다크모드 팔레트를 더 맑고 가벼운 sky-navy 톤으로 상향. 다크 배경·탭바·카드·시트 surface, 날씨 배경, 목업 토큰, 플랫폼 보조 레이어 surface를 동기화하고 다크 카드 그림자 opacity를 완화 |
| 2026-07-15 (2차) | Android 빌드 한정 Material 3 보조 레이어 적용 범위 추가 및 공통 컴포넌트 구현 반영. 하단 메뉴 내비게이션, 뒤로가기/아이콘 버튼, Sheet/Modal, 날씨 카드 일부, CTA 역할 구분에 제한 적용하며 Dynamic Color와 Material 3 Expressive 전면 적용은 제외 |
| 2026-07-15 | iOS 빌드 한정 Liquid Glass 보조 레이어 적용 범위 추가 및 공통 컴포넌트 구현 반영. 상단/하단 바, 뒤로가기 버튼, 하단 메뉴 내비게이션, Sheet/Modal, 날씨 카드 일부에만 제한하며 Project Wind 기준 디자인 시스템은 추후 대규모 업데이트 대상으로 유지 |
| 2026-07-13 | H7 `내일 브리핑` 추가. 매일 21시 `bedtime-check` 알림을 H1 대신 H7로 연결하고, 다음날 날씨·최고/최저·강수·코디·우산 정보를 한 화면에서 제공. 다음날 예보 기반 코디·우산 재계산과 H1 탭 활성 상태를 명시 |
| 2026-07-12 | 실기기 전체 UI·UX 회귀 반영: `FeedbackPressable` 120ms state layer를 홈·출발·목적지·MY·설정 주요 인터랙션에 확대, 탭/CTA 타이밍을 스펙값으로 통일, 화면 전환 240ms 및 OS 모션 감소 대응, 목적지 검색의 키보드 열린 상태 첫 탭 누락 수정, 투명 효과 설정 명칭·스위치 모션 정리. core-flow·small-screen 게이트를 현행 UI와 동기화 |
| 2026-07-10 | Project Wind Perfora Air v1.0을 stable internal design-system release로 확정. 현행 MVP/v1.0 미적용, 차기 메이저 UI 채택 게이트와 source of truth 연결 |
| 2026-07-09 (3차) | Project Wind를 출시 후 대규모 UI 업데이트용 신규 디자인 시스템 연구 트랙으로 명시. 현행 MVP/v1.0 UI 기준은 본 통합 스펙 유지 |
| 2026-07-09 | QA 빌드 실기기 검증 반영: 홈 첫 화면 밀도 압축으로 하단 판단 카드 탭바 가림 재현 없음 확인, 목적지 선택 카드는 선택 목적지 중복 노출을 제거하고 저장 목적지 칩의 선택 상태로 전환. 전역 Pretendard 로드(`expo-font`) 적용. 릴리즈 크래시 원인이던 `expo-linear-gradient` 의존을 제거하고 `WeatherBackground`를 RN View 레이어 배경으로 대체 |
| 2026-07-09 (2차) | 기존 네이비 배경이 무겁게 보이는 이력에 맞춰 다크 페이지 배경을 `#10243F`에서 `#17365D`로 상향하고, 날씨 배경·목업 토큰을 Clear Weather UI 기준으로 재정렬 |
| 2026-07-08 (5차) | 홈 코디 카드 노출: `HomeScreen.tsx`의 `HOME_OUTFIT_CARD_VISIBLE` 플래그를 `true`로 전환(출시 로드맵 코디 포함 확정에 따라 대기 상태 해제). `check-android-product-quality` 게이트, `UIUX_플로우차트.mmd` NAV3 런치 표면 노드, 본 문서 8장 탭 전환 문구를 `홈/코디/출발/MY` 4탭 기준으로 동기화 |
| 2026-07-08 (4차) | 출시 로드맵 코디 포함 조정 반영: 하단 탭을 `홈/코디/출발/MY` 4탭으로 복원(코디 탭 C1, C1~C4 활성 매핑), 소셜 탭만 검증 후 복원으로 유지. product-quality/web-export/preview-server/core-flow 게이트를 4탭 기준으로 동기화 |
| 2026-07-08 (3차) | 홈 상단 날씨 상태 아이콘 출력 Pad를 80→96px, 내부 아이콘을 46→60px로 확대하고 halo/showcase 여백을 동기화. 실기기 A142에서 Pad bounds `[429,377][654,602]`, 아이콘 bounds `[471,419][611,560]`로 잘림 없음 확인 |
| 2026-07-08 (2차) | 모션 시스템 도입(8장): 화면 전환(`ScreenTransition`, opacity+translateY 240ms), 알림 사이드바 슬라이드(Modal fade → 스크림 페이드+패널 translateX 260/200ms, 닫힘 애니메이션 재생 후 언마운트), 탭바 프레스 tint(0→0.12, 120ms), AppButton 프레스 scale+opacity(110ms)를 RN `Animated`로 구현. 실기기 느낌 부재 피드백에 대응 |
| 2026-07-08 | 카드 그림자 시스템 도입: `cardShadow(theme)` 토큰으로 목업 BrandCard 음영을 v1.0 도달 가능 전 화면(홈/출발/MY/케어/추가/H2~H6/M2~M4/P2~P3/A/O/R 라인) 최상위 카드에 적용, 중첩·반투명 표면 적용 금지 규칙 명문화(8장). 홈 히어로를 목업 원본 세로 중앙 정렬로 재구성(시간별/주간 예보 카드 제거, 히어로 탭→H6 연결, 종 아이콘 재작도). G2 도착/이동 요약 칩을 탭 확장형으로 통합(중복 행·계산식 스트립 제거). 목적지 검색 결과의 Kakao/Google 출처 표기 제거. 선택 상태 색을 Gold→Clear로 분리. E2E(core-flow)와 품질 게이트를 현행 UI에 동기화 |
| 2026-07-07 (3차) | 대비 실측 감사에서 라이트 모드 `LIGHT_SKY`(`#237BBD`) 텍스트가 sky-soft 칩/틴트 배경 위에서 3.8~4.0:1로 WCAG AA 4.5:1 미달 확인. `#1D6DA8`로 조정해 흰 배경·카드·자기 틴트 배경 전 구간 4.5:1 이상 확보(`apps/mobile/src/theme/tokens.ts`) |
| 2026-07-07 (2차) | 정보구조/UX 후속 반영: G2 도착 희망 시간 휠피커를 기본 접힘 토글로 전환(계산 결과 우선 노출), 목적지 저장 직후 완료 배너 추가, 검색 결과 목록에서 카테고리보다 거리·제공처를 우선 노출. 강수 시간 라벨(시작/완화)과 여유시간 근거 표기는 기존 구현이 이미 스펙에 부합함을 확인 |
| 2026-07-07 | 잔여 유니코드 기호 아이콘 전수 정리(제보/우산/위치변경/프리미엄), 홈 위치 라벨 잘림 수정. `tsc --noEmit` 통과 확인 |
| 2026-07-05 | 14장 갭 해소 반영. radius 토큰 스펙화, 플로팅 탭바, 텍스트 아이콘 제거, 알림 센터 상태 톤 정리 |
| 2026-07-03 | v1.0 작성. 목업 우선순위, MVP 적용 규칙, 색/타입/아이콘/탭바/컴포넌트 통합 기준 정의 |
