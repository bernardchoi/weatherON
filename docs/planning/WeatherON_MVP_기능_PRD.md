# WeatherON — MVP 기능 PRD
**Feature Set: MVP Core Product**
Version 1.1 · July 2026 · Daehyeon

---

## 1. 배경 및 목표

WeatherON MVP의 핵심 목표는 **나갈 시간, 비 타이밍, 챙길 것을 5초 안에 판단**하게 하는 것이다.
사용자는 앱을 열고 목적지 기준 출발시간, 현재 위치와 목적지 날씨 차이, 비 시작/그침 시간, 우산·겉옷·신발 같은 준비물을 빠르게 판단해야 한다.

현재 문서에는 도보여행 PRD가 별도로 존재하지만, MVP 1차 범위의 핵심 기능인 날씨 API, 코디 룰엔진, 옷장, 목적지 케어, 알림, 계정/권한/정책에 대한 개발 PRD가 부족하다.
이 문서는 MVP 개발자가 화면 목업을 실제 기능으로 전환할 때 필요한 최소 기능 명세를 정의한다.

### 제품 원칙

- 정보 나열이 아니라 행동 결정을 제공한다.
- 게스트도 출발시간 역산, 목적지 날씨 비교, 강수 타임라인 미리보기를 바로 경험한다.
- 저장, 동기화, 알림 확장, 이력 관리는 계정 연결 후 제공한다.
- H1 홈은 실시간 의사결정 카드, H3 알림은 이력/딥링크 센터로 분리한다.
- 코디, 우산, 신발 추천은 핵심 출발/강수 판단을 돕는 보조 준비물 기능으로 둔다.
- MVP는 정확한 추천보다 일관된 룰, 실패 대응, 권한 상태 복구를 우선한다.
- UI 디자인 판단은 `docs/design/WeatherON_UI_Design_Spec.md`를 따른다. MVP 범위에서도 목업 기준 탭/아이콘/컴포넌트 스펙을 낮추지 않는다.

### 성공 기준

| 지표 | MVP 목표 |
|---|---|
| 첫 실행 후 핵심 이해 | O2 온보딩에서 출발시간 역산, 목적지 날씨 비교, 비 그침 알림을 이해 |
| 홈 의사결정 | 나갈 시간, 비 시작/그침, 챙길 것을 5초 내 파악 |
| 계정 gate | 저장/동기화/알림 확장 액션에서만 A2/A3 호출 |
| 추천 안정성 | 날씨 API 실패 시 캐시/기본 위치/수동 위치로 빈 화면 방지 |
| 알림 구조 | 출발/강수 알림 조건 저장, H3 이력 유지 |

---

## 2. MVP 범위

### MVP 0~1 포함

| 영역 | 화면 | 역할 |
|---|---|---|
| 계정 | A1/A2/A3/A4 | 스플래시, 계정 연결, 약관, 계정 관리 |
| 온보딩 | O2/O3/O5/O6 | 출발/강수 중심 기능 소개, 계정 연결 후 권한 준비, 알림 기준, 목적지 등록 |
| 홈/날씨 | H1/H2/H3/H4/H5 | 홈, 위치 변경, 알림 센터, 우산 추천, 강수 타임라인 |
| 코디 | C1/C2/C3/C4 | 코디 추천, 옷장, 옷 등록, 코디 상세. MVP에서는 보조 기능 |
| 출발/목적지 | G1/G2/P1/P2/P3 | 목적지 목록, 목적지 케어, 목적지 추가, 준비 가이드, 필터/상세 |
| 설정/정책 | M1/M2/M3/R1/R2/R3/R4 | MY, 알림 설정, 전역 설정, 정책/광고 |

### 현재 MVP 기능 검증 우선순위

2026-07-03 현재 구현 검증은 `H1 홈`, `G1 출발`, `M1 MY`를 우선한다.
단, 탭 구성, 아이콘, 컴포넌트, radius, 상태 톤 같은 디자인 스펙은 `docs/design/WeatherON_UI_Design_Spec.md`가 우선한다.
목업과 와이어프레임 또는 구현이 충돌하면 목업 기준을 따른다.

| 우선 화면 | 현재 역할 | 주요 진입 |
|---|---|---|
| H1 홈 | 날씨 히어로, 목적지/강수 quick-action, 오늘 준비 요약 | H2, H5, G2 또는 P1, M2 |
| G1 출발 | 저장 목적지 목록, 목적지 추가, no-destination empty state | G2, P1 |
| M1 MY | 계정, 준비 상태, 권한, 알림, 표시, 정책 허브 | A4, M2, M3, M4, R1 |

### 현재 시각/상태 톤 기준

- 세부 색상, 탭바, 아이콘, radius, 컴포넌트 기준은 `docs/design/WeatherON_UI_Design_Spec.md`를 따른다.
- Warm Sun/Gold는 ON 상태, 활성 탭, 주요 CTA에 우선 사용한다.
- 알림 미읽음, 경고, 비차단 설정 안내는 Gold 대신 기능색으로 분리한다.
- MY의 `확인` 계열 배지는 blocking 확인에만 강하게 쓰고, 설정 권장/정보 상태는 Sky/Clear 톤으로 낮춘다.
- 홈 첫 화면은 텍스트 설명보다 `나갈 시간 / 비 그침 / 챙길 것` 시각 카드가 먼저 보이게 유지한다.
- 홈 quick-action 문구는 2줄 안에서 잘리지 않게 유지한다.
- G1 목적지 미등록 상태는 CTA만 남기지 않고 출발 시간, 비 그침 같은 첫 사용 이점을 함께 보여준다.

### MVP 이후 제외

- G3/G4/G5/G6 여행/프리미엄 고급 플로우
- W1~W4 날씨 제보
- S0~S3 ON Square
- 도보여행 상세 기능
- 상점, 포인트 경제, 유료 구독 결제 구현

기능 출시 순서는 `docs/planning/WeatherON_기능_출시_로드맵.md`를 따른다.
도보여행은 `WeatherON_도보여행_PRD.md`를 별도 기준으로 유지하되, MVP 사용 지표 확인 전까지 출시 범위에서 제외한다.

---

## 2-1. 기술 ADR 참조

MVP 구현 기준은 `docs/architecture/WeatherON_MVP_기술_ADR.md`를 따른다.
해당 ADR에서 앱 프레임워크, 날씨/위치 API, 룰엔진 실행 구조, 백엔드/계정 구조를 확정했다.
UI 구현 기준은 `docs/design/WeatherON_UI_Design_Spec.md`를 따른다.

| 영역 | ADR 결정 |
|---|---|
| 앱 | React Native + Expo Dev Client + TypeScript |
| 날씨 | 한국 KMA, 일본/글로벌 Open-Meteo |
| 장소 검색 | 한국 Kakao Local, 글로벌 Google Maps Geocoding |
| 룰엔진 | TypeScript deterministic rule engine, 앱/Cloud Functions 공통 shared 모듈 |
| 백엔드/계정 | Firebase Auth + Cloud Functions + Firestore + FCM + Secret Manager + App Check |

---

## 3. 핵심 인터페이스

### WeatherSnapshot

날씨 API와 추천 엔진의 공통 입력이다.

```ts
type WeatherSnapshot = {
  locationId: string;
  locationName: string;
  countryCode: "KR" | "JP" | "GLOBAL";
  observedAt: string;
  current: {
    tempC: number;
    feelsLikeC: number;
    condition: "clear" | "cloud" | "rain" | "snow" | "storm" | "dust";
    precipitationMm: number;
    rainProbabilityPct: number;
    windMs: number;
    humidityPct: number;
    uvIndex?: number;
  };
  hourly: Array<{
    time: string;
    tempC: number;
    rainProbabilityPct: number;
    precipitationMm: number;
    windMs: number;
    condition: string;
  }>;
  source: "kma" | "openmeteo" | "cache" | "fallback";
  stale: boolean;
};
```

### UserPreferenceProfile

MY 설정에서 관리한다. MVP 온보딩에서는 코디/스타일 기준을 요구하지 않는다.

```ts
type UserPreferenceProfile = {
  gender: "male" | "female" | "any";
  ageBand: "10-20" | "20-30" | "30-40" | "40-50" | "50+";
  styleTags: string[];
  fit: "standard" | "relaxed" | "formal" | "outdoor";
  routine: "commute" | "school" | "travel" | "free";
  alertMode: "auto-care";
};
```

### WardrobeItem

프리셋 추가와 직접 촬영 등록이 같은 구조를 사용한다.

```ts
type WardrobeItem = {
  id: string;
  ownerId?: string;
  source: "preset" | "photo";
  category: "outer" | "top" | "bottom" | "shoes" | "accessory";
  name: string;
  seasons: Array<"spring" | "summer" | "fall" | "winter">;
  purposes: Array<"commute" | "school" | "travel" | "outdoor" | "formal" | "daily">;
  weatherTags: Array<"rain" | "wind" | "cold" | "heat" | "dry">;
  imageUrl: string;
  owned: boolean;
};
```

### OutfitRecommendation

H1, C1, C4가 같은 추천 결과를 사용한다.

```ts
type OutfitRecommendation = {
  id: string;
  weatherSnapshotId: string;
  items: {
    outer?: WardrobeItem;
    top: WardrobeItem;
    bottom: WardrobeItem;
    shoes: WardrobeItem;
    accessory?: WardrobeItem;
  };
  matchPct: number;
  decisionText: string;
  timeAdvice: Array<{ time: string; text: string }>;
  reasons: string[];
  variant: "default" | "formal" | "rain" | "cold" | "heat";
};
```

### DestinationCare

G1/G2/P1/P2/P3가 공유한다.

```ts
type DestinationCare = {
  destinationId: string;
  name: string;
  category: "work" | "school" | "airport" | "hotel" | "sports" | "mountain" | "beach" | "custom";
  originWeather: WeatherSnapshot;
  destinationWeather: WeatherSnapshot;
  departureAdvice?: {
    targetArrivalTime?: string;
    recommendedDepartureTime?: string;
    travelMinutes?: number;
    bufferMinutes?: number;
    transportMode?: "auto" | "walk" | "drive" | "transit";
    travelProvider?: "kakao" | "google" | "fallback";
    travelStatus?: "idle" | "loading" | "ready" | "fallback" | "error";
  };
  umbrellaAdvice: RecommendationState;
  shoesAdvice: RecommendationState;
  careOn: boolean;
  nextAlertText?: string;
};
```

### NotificationRule

M2/O5와 H3 이력의 공통 기준이다.

```ts
type NotificationRule = {
  id: string;
  type: "routine" | "rain" | "umbrella" | "shoes" | "destination";
  enabled: boolean;
  triggerWindow: "morning" | "before-departure" | "rain-1h" | "rain-3h" | "destination-change";
  requiresAccount: boolean;
  requiresPushPermission: boolean;
  deepLink: "H1" | "H4" | "H5" | "G2" | "M2";
};

type RecommendationState = {
  level: "none" | "notice" | "recommended" | "required";
  title: string;
  reason: string;
};
```

### AccountConsentState

A2/A3/A4/R/M 화면에서 사용한다.

```ts
type AccountConsentState = {
  accountLinked: boolean;
  provider?: "kakao" | "naver" | "line" | "apple" | "google" | "email";
  termsRequiredAccepted: boolean;
  marketingAccepted: boolean;
  locationPermission: "unknown" | "granted" | "denied";
  pushPermission: "unknown" | "granted" | "denied";
  adConsentStatus: "unknown" | "accepted" | "declined";
};
```

---

## 4. 기능 명세

### F1. 계정/온보딩

**화면**: A1/A2/A3/A4, O2/O3/O5/O6

**요구사항**

- A1 후 회원가입 선택 없이 H1 Guest 홈으로 진입한다.
- A2는 앱 첫 관문이 아니라 저장/동기화/알림 확장/Weather Note 작성 같은 계정 필요 액션에서 호출한다.
- 로그인 수단은 국가 선택 버튼 없이 자동 추천한다.
- 국가 추천 우선순위는 스토어 국가, SIM/전화 국가, OS 지역, 기기 언어, 타임존, 현재 위치 순서다.
- O2는 OS 권한 팝업을 호출하지 않고 핵심 판단 가치와 다음 행동만 소개한다.
- A2/A3 계정 연결과 약관 동의 직후 위치/알림 권한이 비어 있으면 O3 통합 권한 준비 화면으로 이동한다.
- O3는 계정 연결 직후에는 위치 권한과 알림 권한을 함께 요청하고, 설정 진입 시에는 필요한 권한만 복구한다.
- O5는 세부 시간 설정이 아니라 “알아서 챙기기” 기본 기준을 설정한다.
- O6 목적지 등록은 선택이며, 건너뛰어도 Mode A 자동 케어가 작동한다.

**실패/제한**

- 계정 미연결 상태에서는 저장 버튼 탭 시 A2로 이동하고, 완료 후 원래 화면으로 복귀한다.
- 권한 거부 상태에서도 앱 내 추천과 수동 위치 검색은 유지한다.
- 계정 연결 직후 권한을 나중에 설정해도 홈 진입은 막지 않고, 수동 위치/푸시 대기 상태로 운영한다.

---

### F2. 날씨 API 연동

**화면**: H1/H2/H4/H5/G1/G2/P2/P3/C1/C4

**요구사항**

- 한국은 KMA/공공데이터 기반을 우선으로 한다.
- 일본/일반 해외는 Open-Meteo 계열 글로벌 날씨를 1차 기준으로 한다.
- 장소 검색은 한국 Kakao Local 우선, 해외 Google Maps Geocoding 우선으로 설계한다.
- 현재 빌드에 필요한 키가 없는 API는 `docs/architecture/WeatherON_API_연동_대기목록.md`에 기록하고 fixture/고정값 fallback으로 화면 검증을 계속한다.
- 현재 위치, 검색 위치, 목적지 위치 모두 `WeatherSnapshot`으로 정규화한다.
- H1은 현재 위치, G2/P2/P3는 출발지와 목적지 WeatherSnapshot을 비교한다.

**Fallback**

- API 실패 시 마지막 성공 캐시를 표시하고 `stale=true`로 표시한다.
- 캐시가 없으면 기본 위치 날씨와 수동 위치 검색 CTA를 표시한다.
- 시간별 예보가 없으면 현재 날씨 기반 기본 룰 추천만 제공한다.
- 네트워크 오류는 빈 화면이 아니라 “최근 기준 추천”으로 degrade한다.

---

### F3. 코디 추천 룰엔진

**화면**: H1/C1/C4/O4/C2/C3

**입력**

- WeatherSnapshot
- UserPreferenceProfile
- WardrobeItem 목록
- 목적지 카테고리

**룰 기준**

| 조건 | 판단 |
|---|---|
| 최저 15도 이하, 최고 24도 이상 | 아침 레이어링, 낮 단품 전환 |
| 일교차 8도 이상 | 아우터 또는 가디건 추천 |
| 강수확률 60% 이상 또는 강수량 1mm 이상 | 방수 신발, 우산/우비 태그 우선 |
| 풍속 7m/s 이상 | 긴 아우터, 모자/우산 안정성 경고 |
| 체감 30도 이상 | 통기성, 밝은색, 반팔 우선 |
| 체감 5도 이하 | 니트, 패딩, 방한 신발 우선 |

**출력**

- H1: 대표 코디 카드 1개
- C1: 오늘 입을 세트, 판단 칩, 셔플/상세
- C4: 착장 히어로, 시간대별 착용 판단, 아이템별 근거

**옷장 미등록**

- 기본 프리셋 기반 추천을 제공한다.
- 사용자가 프리셋을 내 옷장에 추가하면 개인 옷장 기반 매칭률로 전환한다.

---

### F4. 우산/신발 추천

**우산 추천 화면**: H1/H4/H5/G2/P3

**우산 룰**

| 조건 | 추천 |
|---|---|
| 강수 없음 | 우산 불필요 |
| 강수확률 40~59%, 강수량 1mm 미만 | 소형 3단 우산 선택 |
| 강수확률 60% 이상 또는 강수량 1~5mm | 3단 우산 추천 |
| 강수량 5~10mm 또는 3시간 이상 지속 | 2단/대형 3단 우산 추천 |
| 강수량 10mm 이상 | 장우산 또는 우비 |
| 풍속 8m/s 이상 | 장우산보다 우비/방수 아우터 우선 안내 |

**H1/H3 역할**

- H1 우산 카드는 현재 위치 또는 목적지 비 신호가 있고 미확인일 때만 노출한다.
- H4 열람 후 H1 우산 카드는 숨긴다.
- H3에는 우산 추천 이력을 유지해 다시 H4로 진입할 수 있게 한다.

**신발 룰**

| 조건 | 추천 |
|---|---|
| 비/젖은 노면 | 방수 스니커즈 또는 부츠 |
| 눈/한파 | 미끄럼 방지, 보온 신발 |
| 장거리 이동 | 쿠션 있는 스니커즈 |
| 포멀 목적지 | 로퍼/첼시부츠 계열 |
| 해변/물가 | 샌들/방수 소재 |

신발 추천은 C1/C4 코디와 G2 목적지 케어에 함께 반영한다.

---

### F5. 옷장

**화면**: C2/C3/C4

**요구사항**

- C2는 사용자의 보유 아이템 목록과 필터를 제공한다.
- C3는 프리셋 아이템 추가를 기본 경로로 제공하고 직접 촬영은 보조 옵션으로 둔다.
- 프리셋은 아이템/계절/목적 필터로 탐색한다.
- Guest는 프리셋 미리보기까지 가능하지만 영구 저장은 계정 연결이 필요하다.
- 계정 연결 완료 후 원래 C3 저장 상태로 복귀해 저장 완료 피드백을 보여준다.

**MVP 제약**

- 이미지 자동 배경 제거와 유사 상품 매칭은 MVP 이후로 둔다.
- MVP는 프리셋 이미지와 사용자가 직접 올린 1장 이미지를 그대로 사용한다.

---

### F6. 목적지 케어

**화면**: O6/G1/G2/P1/P2/P3

**요구사항**

- O6/P1에서 등록한 목적지는 G1 목록과 P3 필터에 동시에 반영한다.
- 런치 표면의 기본 출발 탭은 G1이며, P2/P3는 현재 구현에서 숨김 확장 라우트다.
- G2는 출발지와 목적지 날씨 비교, 출발 시각, 우산/신발 알림 상태를 보여준다.
- G2 출발시간 역산은 사용자가 `자동/도보/자차/대중교통` 이동수단을 직접 선택할 수 있어야 한다.
- 이동수단 선택은 카드 4개 나열이 아니라 드롭다운 리스트로 제공하며, 수단 선택 즉시 리스트를 닫고 선택값을 반영한다.
- 도착 희망 시각은 키패드 직접 입력이 아니라 `시/분` 스크롤 선택으로 받는다. 분 선택은 5분 단위로 제공한다.
- 여유시간은 사용자가 직접 고르지 않고 현재시각, 도착 희망 시각, 이동시간 기준으로 자동 계산한다.
- 대중교통 선택 시 `배차/환승 변동 가능` 안내를 표시한다.
- P2는 목적지 카테고리별 준비 가이드를 제공한다.
- P3는 필터 리스트와 목적지 상세 상태를 모두 가진 목적지 허브로 동작한다.
- 목적지 알림 ON/OFF는 `DestinationCare.careOn`으로 공유한다.
- G1 저장 목적지 카드는 요약 역할로 제한한다. 목적지명, 현재 위치 대비 목적지 기온, 강수 확률, 출발/도착 시각, 반복 상태, 경고 문구만 3줄 안에서 보여주고 큰 출발 블록이나 4분할 정보 타일은 사용하지 않는다.
- 저장 목적지가 없을 때 G1은 목적지 추가 CTA와 함께 출발 시간, 비 그침 알림의 이점을 짧은 카드로 보여준다.
- G1 no-destination 화면의 장식은 placeholder처럼 보이지 않게 낮은 대비와 실제 기능 안내를 우선한다.

**Guest/권한**

- Guest는 목적지 조회와 준비 가이드 미리보기 가능하다.
- 목적지 저장과 알림 ON은 계정 연결이 필요하다.
- 푸시 권한이 없으면 O3 권한 요청 후 같은 목적지 상세로 복귀한다.

---

### F7. 스마트 알림

**화면**: O5/M2/H3/H4/H5/G2

**요구사항**

- 사용자가 처음 2~3회 루틴과 알림 기준을 정하면 이후 자동 케어로 운영한다.
- 기본 알림은 외출 준비, 강수, 우산, 신발, 목적지 케어다.
- M2는 모든 알림을 세세히 나열하지 않고 스마트 알림 ON/OFF, 권한/발송 상태 태그, 빠른 액션, 알림 종류 3행만 기본 노출한다.
- 기본 알림 종류는 필수 날씨, 생활 루틴, 목적지 출발 3개로 고정한다.
- 목적지 알림 조건은 별도 게이트 카드로 중복 노출하지 않고 목적지 출발 행에서 계정/권한/목적지 상태를 표시한다.
- 피로도 제어와 세부 시간 조정은 별도 카드가 아니라 고급 설정 안에 접어 둔다.
- H4/H5/G2에서 M2로 이동할 때 `alertFocus`와 `returnTo`를 유지한다.
- H3는 알림 센터로 읽음/미읽음, 예정/완료, 딥링크 대상을 보관한다.

**권한 거부**

- 푸시 권한이 없으면 앱 내 H1/H3 안내는 유지한다.
- 시스템 푸시 발송만 비활성화한다.
- 사용자는 M2/M3에서 권한 재요청 경로를 확인할 수 있다.

---

### F8. MY/정책/광고

**화면**: M1/M2/M3/R1/R2/R3/R4/A4

**요구사항**

- M1은 설정 허브다.
- M1은 계정/준비 상태/권한/알림/표시/정책을 한 화면에 묶되, 같은 강도의 경고 배지를 반복하지 않는다.
- A4는 계정 관리 전용이며 알림 설정/스타일 태그 설정과 중복하지 않는다.
- M2는 알림 설정, M3는 전역 설정과 정책 진입을 담당한다.
- R1은 정책 허브, R2 개인정보, R3 광고 동의, R4 광고 배치 기준을 제공한다.
- 이용약관, 위치기반서비스 약관, 오픈소스 라이선스는 별도 상세 화면 또는 별도 문서로 연결한다.
- Guest 프로필/준비 상태는 Warm Sun 강조 대신 Sky/Clear 정보 톤을 기본으로 한다.
- `설정`은 비차단 권장, `확인`은 차단 또는 즉시 조치가 필요한 상태에만 사용한다.

**MVP 정책 기준**

- 위치 권한, 광고 동의, 개인정보 처리방침, 이용약관, 오픈소스 라이선스 접근 경로를 앱 내에서 확인 가능해야 한다.
- 실제 법무 검토 전 문구는 임시 정책 문구로 표시하되, 출시 전 최종 검토가 필요하다.

---

## 5. 상태 및 데이터 흐름

### 상태 우선순위

| 상태 | 예시 | 유지 범위 |
|---|---|---|
| Session State | accountLinked, permissionReady, locationReady, premiumActive | 앱 전역 |
| Settings State | styleProfileSaved, selectedStyles, smartCareEnabled, alert toggles | 사용자 설정 |
| Route State | returnTo, pendingAction, selectedDestination, outfitVariant | 특정 화면 복귀 |
| Care State | destinationId별 careOn | G1/G2/P3 공유 |
| Review State | umbrellaSignalReviewed | H1/H3/H4 공유 |

### 대표 플로우

1. A1 스플래시 후 H1 Guest 홈 진입
2. H1에서 현재 날씨, 목적지/강수 quick-action, 오늘 준비 요약 확인
3. 목적지 미등록 시 H1 또는 G1에서 P1 목적지 추가로 진입
4. 목적지 등록 후 G1 목록과 G2 목적지 케어 상태로 복귀
5. 저장/알림 확장 액션 탭 시 A2/A3 계정 연결
6. A3 완료 후 원래 화면과 액션 상태로 복귀
7. O3 권한 완료 후 알림/목적지 케어 상태 복귀
8. H4/H5/G2에서 M2 진입 후 원래 추천 화면으로 복귀

---

## 6. 개발 우선순위

### P0 — MVP 0 내부 검증

- O2 온보딩 첫 진입과 핵심 가치 전달
- H1 핵심 검증 카드: 출발시간 역산, 목적지 날씨 비교, 비 그침 확인
- 통합 디자인 스펙과 MVP 기능 검증 화면 정합
- G1 목적지 미등록 empty state와 P1 추가 CTA
- M1 warning/info 톤 분리
- WeatherSnapshot 정규화와 캐시 fallback
- G1/G2 목적지 선택, 목적지 날씨 비교, 출발 추천 시간
- H5 강수 타임라인과 비 그침 알림 토글
- A2/A3 계정 gate와 복귀 상태
- O3 권한 상태 처리
- M2 알림 설정 기본 구조

### P1 — MVP 1 소수 사용자 검증

- 출발 알림 조건 저장과 푸시 딥링크
- 비 시작/그침 알림 조건 저장과 푸시 딥링크
- O6/P1 목적지 추가
- G1/G2 목적지 케어
- H3 알림 센터와 딥링크
- API 실패/권한 거부/fallback 상태 QA
- C1/C4 기본 코디 룰엔진과 C2/C3 옷장 프리셋 추가

### P2 — Beta/출시 후보

- R1~R4 정책/광고 동의 구조
- A4 계정 관리
- M1/M3 설정 허브 정리
- 라이트/다크 접근성 QA
- Play 폐쇄 테스트, 스토어 스크린샷, 개인정보/약관 최종화
- 코디/우산/신발 고도화 여부는 MVP 1 반응 확인 후 결정

---

## 7. 테스트 시나리오

### 기능

- Guest가 앱을 열면 H1 홈에 도달한다.
- 하단 탭과 아이콘은 `docs/design/WeatherON_UI_Design_Spec.md` 기준을 따른다.
- Guest가 코디 추천과 우산 추천을 확인할 수 있다.
- Guest가 코디 저장을 누르면 A2/A3로 이동하고, 완료 후 원래 화면으로 복귀한다.
- 옷장 미등록 상태에서도 기본 코디 추천이 표시된다.
- C3에서 프리셋 아이템을 추가하면 C2와 추천 룰에 반영된다.
- 목적지를 추가하면 G1과 P3에 같은 목적지가 보인다.
- G2 또는 P3에서 목적지 케어를 켜면 G1/G2/P3 상태가 일치한다.
- 목적지가 없으면 G1 empty state에서 목적지 추가 CTA와 출발/강수 이점 카드가 보인다.
- MY에서 비차단 설정 권장은 `설정` 톤으로, blocking 상태만 강한 확인 톤으로 보인다.

### 알림

- H1 우산 카드는 비 신호가 있고 미확인일 때만 표시된다.
- H4 열람 후 H1 우산 카드는 사라진다.
- H3에는 우산 추천 이력이 남아 H4로 다시 진입할 수 있다.
- 푸시 권한 거부 상태에서도 H1/H3 앱 내 알림 안내는 유지된다.
- H4/H5/G2에서 M2로 이동 후 원래 화면으로 복귀한다.

### 실패 대응

- 날씨 API 실패 시 캐시 데이터를 표시한다.
- 캐시도 없으면 기본 위치와 수동 위치 검색 CTA를 표시한다.
- 목적지 날씨만 실패하면 현재 위치 날씨와 목적지 재시도 안내를 분리 표시한다.
- 이미지 로딩 실패 시 아이템명과 카테고리 텍스트 fallback을 표시한다.

---

## 8. 남은 결정

- 프리셋 옷장 기본 세트 수량
- 법무 검토 후 정책 문구 최종화
- KMA/Open-Meteo/Google Maps/Firebase 실제 운영 쿼터와 비용 재산정
- Provider별 Expo Dev Client 호환성 PoC

## 9. 변경 이력

| 날짜 | 내용 |
|---|---|
| 2026-07-03 | 통합 디자인 스펙 참조 추가. MVP 기능 검증 우선순위와 디자인 스펙 우선순위 분리 |
| 2026-07-03 | 현재 구현 기준 반영. H1/G1/M1 기능 검증 우선순위, 숨김 라우트, G1 empty state, MY warning/info 톤, 탭 아이콘 21px 기준 추가 |
| 2026-06 | v1.0 작성. MVP 기능 범위, 데이터 구조, 계정/권한/알림/목적지 케어 기준 정의 |

*WeatherON MVP 기능 PRD v1.1 · July 2026*
