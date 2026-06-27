# WeatherON BI/CI 로고 · 워드마크 리뷰

검토일: 2026-06-23  
조치일: 2026-06-23  
대상: 앱 아이콘, 워드마크, 락업 에셋  
기준 문서: `brand/weatheron_ci_bi.html`, `brand/WeatherON_로고_디자인철학.md`, `brand/WeatherON_아이콘_시스템.md`, `docs/planning/WeatherON_경쟁사_비교_통합분석.md`

## 1. 총평

WeatherON의 현재 BI/CI 방향은 유지해도 된다. 네이비 `#0C1F3F`와 골드 `#F0A020` 조합, 토글+태양 노브, 구름 보조 요소는 "Quiet Horizon"과 "오늘을 켠다"는 제품 메시지를 잘 연결한다.

다만 앱 아이콘과 달리 워드마크/락업 미리보기 PNG는 최종 승인 상태로 보면 안 된다. 기존 `assets/wordmark/*-preview.png`, `assets/lockup/*-preview.png`는 Manrope 미설치 환경에서 대체 폰트로 렌더링되어 `weather` 글자가 겹쳐 보였다.

2026-06-23 조치로 `*-outline.svg`를 생성하고, 해당 아웃라인 소스 기준으로 preview PNG를 재생성했다. 이후 배포/외부 전달용은 원본 SVG가 아니라 `*-outline.svg`를 우선 사용한다.

## 2. 판정

| 항목 | 판정 | 이유 |
|---|---|---|
| 앱 아이콘 `icon-primary` | 승인 가능 | 작은 크기에서도 토글 필+골드 노브+구름 실루엣이 유지되고, 브랜드 컬러와 의미가 일관됨 |
| 아이콘 변형 `light/dark/mono` | 승인 가능 | 용도별 매핑이 이미 정리되어 있고, 런처/소셜/모노 컨텍스트 대응 가능 |
| 워드마크 SVG 원본 | 조건부 승인 | 구조와 의미는 적절하나 `<text>` + 웹폰트 의존 상태라 외부 전달용으로는 불안정 |
| 워드마크/락업 outline SVG | 승인 가능 | `<text>`, `font-family`, `@import` 없이 패스만 남도록 생성 완료 |
| 워드마크/락업 preview PNG | 승인 가능 | 아웃라인 소스 기준으로 재생성해 글자 겹침 제거 |
| 가로형 락업 | 승인 가능 | 아이콘-워드마크 의미 연결이 유지되고 정상 렌더 기준 간격/무게가 안정적 |
| 세로형 락업 | 제한 사용 | 인트로/문서/소셜용으로 적합. 앱 상단 헤더에는 공간 효율이 낮음 |

## 3. 주요 확인 사항

### P1. 워드마크 아웃라인 버전 제작 완료

- 현재 SVG는 `Manrope`를 `@import`하고 `<text>` 요소로 `weather`와 `N`을 렌더링한다.
- 폰트가 로드되지 않는 환경에서는 자간과 글자 폭이 바뀌며, 기존 미리보기 PNG에서도 `weather`가 겹쳐 보였다.
- BI/CI 문서도 외부 전달용으로 텍스트를 벡터 패스로 고정한 `*-outline.svg` 제작을 요구한다.
- `npm run build:brand`로 outline SVG 12개, preview PNG 12개, 라이트 v2 앱 아이콘 PNG 11개를 재생성하도록 자동화했다.

생성된 산출물:

1. `assets/wordmark/wordmark-h-dark-outline.svg`
2. `assets/wordmark/wordmark-h-light-outline.svg`
3. `assets/wordmark/wordmark-v-dark-outline.svg`
4. `assets/wordmark/wordmark-v-light-outline.svg`
5. `assets/lockup/lockup-h-dark-outline.svg`
6. `assets/lockup/lockup-h-light-outline.svg`
7. `assets/lockup/lockup-v-dark-outline.svg`
8. `assets/lockup/lockup-v-light-outline.svg`
9. `assets/wordmark/wordmark-h-light-v2-outline.svg`
10. `assets/wordmark/wordmark-v-light-v2-outline.svg`
11. `assets/lockup/lockup-h-light-v2-outline.svg`
12. `assets/lockup/lockup-v-light-v2-outline.svg`

### P1. preview PNG 재생성 완료

`assets/wordmark/*-preview.png`, `assets/lockup/*-preview.png`는 아웃라인 SVG 기준으로 재생성했다. 기존에 보였던 `weather` 글자 겹침은 제거됐다.

향후 preview PNG를 다시 만들 때는 수동 캡처 대신 `npm run build:brand`를 사용한다.

### P1-2. 라이트 v2 애셋 추가

라이트모드 포인트 컬러를 Clear Weather UI 기준으로 조정하면서 기존 `icon-light`/`wordmark-light`의 `#F0A020`, `#0C1F3F` 조합이 새 UI 토큰과 어긋나는 문제가 있었다. 기존 에셋은 호환용으로 유지하고, 신규 라이트 UI에는 v2 에셋을 우선 사용한다.

- Navy: `#1F4E79`
- Accent: `#C2410C`
- Paper/Cloud: `#F8FBFF`
- 앱 아이콘: `assets/icon/icon-light-v2.svg`, `assets/icon/icon-light-v2-{16…1024}.png`
- 워드마크: `assets/wordmark/wordmark-h-light-v2.svg`, `assets/wordmark/wordmark-v-light-v2.svg`
- 락업: `assets/lockup/lockup-h-light-v2.svg`, `assets/lockup/lockup-v-light-v2.svg`

### P2. 앱 아이콘은 방향성 유지

앱 아이콘은 네이비 배경, 크림 토글 트랙, 골드 노브+광선, 페이퍼 구름의 조합이 명확하다. 날씨 앱 카테고리에서 흔한 하늘색/시안 계열을 피하면서도 구름과 태양으로 카테고리 인지는 확보한다.

소형 사이즈에서는 16px에서 광선 디테일이 거의 사라지지만, 토글 필+골드 노브+구름 실루엣은 유지된다. 파비콘/앱 리스트용으로는 허용 가능하다.

### P2. 골드는 계속 "ON/활성"에만 제한

골드는 현재 브랜드의 가장 강한 기억 장치다. 임의 장식, 일반 배지, 비활성 UI에 확산되면 앱 아이콘과 워드마크의 "켜짐" 의미가 약해진다.

운영 원칙:

- 앱 아이콘, 워드마크의 `O`, 주요 CTA, 활성 탭에 우선 사용
- 경고/프로모션/장식 배지에는 사용 자제
- 다크/primary 브랜드 모먼트에서는 `#F0A020`을 유지하되, 라이트 UI 전용 v2에서는 새 포인트 토큰 `#C2410C`을 사용

### P3. 락업 사용 범위를 분리

- 가로형 락업: 스플래시, 앱 소개, 웹/문서 헤더에 적합
- 세로형 락업: 앱 첫 실행 인트로, 브랜드 보드, 소셜 이미지에 적합
- 앱 내부 상단 헤더: 전체 락업보다 작은 워드마크 또는 아이콘 단독이 더 안정적

## 4. 최종 권장안

1. 앱 로고는 `icon-primary`를 기본안으로 유지한다.
2. 워드마크는 현재 구조를 유지하되, 프로덕션/외부 전달용은 `*-outline.svg`를 사용한다.
3. 워드마크/락업 preview PNG는 아웃라인 소스 기준으로 생성된 현재 버전을 사용한다.
4. 온보딩 첫 화면이나 스플래시에서는 아이콘 단독보다 가로형 락업을 1회 노출해 "토글+태양=ON" 의미를 학습시킨다.
5. 16px 이하 파비콘/알림 환경에서는 전체 디테일보다 단순 실루엣 인지를 우선하고, 문제가 생기면 `icon-mono-16-simplified`를 별도 제작한다.

## 5. 참고 근거

- `brand/WeatherON_로고_디자인철학.md`: Quiet Horizon, Horizon/Dawn 컬러, 1:1 앱 아이콘 프레임, 작은 화면에서 무너지는 디테일 최소화 원칙
- `brand/weatheron_ci_bi.html`: 아이콘과 워드마크의 골드 O/태양 글리프 의미 정합성, 프로덕션용 아웃라인 필요성
- `brand/WeatherON_아이콘_시스템.md`: 골드는 ON/활성 의미 전용, 런처 아이콘 변형별 사용처, Android adaptive/notification 아이콘 운용
- `assets/icon/legibility/README.md`: 16/24/32px 소형 가독성 검증 결과
- `docs/planning/WeatherON_경쟁사_비교_통합분석.md`: 네이비+골드 듀오톤, 추상 기하학 모티프의 시장 내 차별점
