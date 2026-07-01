# WeatherON UX / Onboarding Audit

- Date: 2026-06-30
- Target: `http://127.0.0.1:8094/`
- Viewport: `390 x 844`
- Evidence: `docs/audits/ux-onboarding-2026-06-30/screenshots/`

## 1. Captured Flow

| step | screen | health | evidence |
|---|---|---|---|
| 1 | Onboarding intro `O2` | 보통 | `screenshots/01-onboarding-o2.png` |
| 2 | Home after onboarding CTA `H1` | 개선 필요 | `screenshots/02-home-after-onboarding-cta.png` |
| 3 | Departure empty state `G1` | 양호 | `screenshots/03-departure-empty.png` |
| 4 | My `M1` | 양호 | `screenshots/04-my.png` |
| 5 | Outfit `C1` | 보통 | `screenshots/05-outfit.png` |
| 6 | Style profile from outfit `O4` | 개선 필요 | `screenshots/06-style-profile-from-outfit.png` |

## 2. Strengths

- MVP 핵심 축인 `출발 시간 / 목적지 날씨 / 비 그침`은 첫 온보딩과 홈에서 명확하게 보임.
- 하단 탭은 홈, 출발, MY의 3개 축으로 정리되어 복잡도가 낮음.
- 출발 빈 상태는 목적지 추가 행동이 명확하고, 빈 상태 문구도 기능과 잘 연결됨.
- 주요 카드 버튼은 대부분 `accessibilityLabel` 또는 역할이 잡혀 있어 기본 탐색 가능성이 있음.

## 3. UX Risks

### P0. 온보딩이 3단계처럼 보이지만 실제 첫 화면에서 다음 단계로 이어지지 않음

- `O2`에는 `홈에서 먼저 판단`, `위치 설정`, `위치 없이 시작`만 있음.
- `O4`, `O5`, `O6`는 코드상 온보딩 route이지만 `O2`에서 직접 이어지는 CTA가 없음.
- 사용자는 온보딩을 시작했는데 바로 홈으로 빠져, 스타일 기준/스마트 케어/목적지 설정이 온보딩 흐름으로 학습되지 않음.
- 권장: `O2 -> O4 -> O5 -> O6 -> H1` 또는 `O2 -> H1` 중 하나로 출시 방향을 명확히 정해야 함.

### P1. 홈 첫 화면에서 핵심 CTA가 하단 탭과 너무 가깝거나 일부 가려짐

- `H1` 캡처에서 `출발 목록 보기`가 하단 탭 바로 위에 위치함.
- `목적지 비교`, `강수 타임라인`은 첫 viewport 밖으로 밀려 있음.
- 권장: 날씨 히어로 높이를 줄이고 `오늘 바로 결정` 3개 판단을 첫 viewport 안에 더 조밀하게 배치해야 함.

### P1. 온보딩/코디 기준 화면의 문맥이 섞임

- `O4`는 온보딩 단계처럼 `1 / 3`, `다음`을 보여주지만, 코디 화면에서 `기준 수정`으로 들어와도 같은 문구가 노출됨.
- 사용자는 편집 화면인지 온보딩 단계인지 헷갈릴 수 있음.
- 권장: 진입 출처에 따라 타이틀/CTA를 분기해야 함.
  - 온보딩: `내 코디 기준 설정`
  - 코디 편집: `코디 기준 수정`
  - 온보딩 CTA: `다음`
  - 편집 CTA: `저장하고 코디로`

### P2. 온보딩 히어로와 칩 크기가 커서 화면 밀도가 과함

- `O2`는 CTA가 보이지만 히어로 카드가 화면 절반 이상을 차지함.
- `O4`는 칩 크기와 섹션 간격이 커서 저장 액션이 한참 아래로 밀림.
- 권장: 온보딩 전용 compact density를 적용해야 함.

### P2. 일부 버튼 접근성 label이 아직 비어 있음

- `H1`의 `목적지` 버튼 label이 `null`.
- `O4`의 칩 버튼들은 visible text는 있으나 별도 label이 없음.
- 권장: 작은 칩은 `스타일 태그 미니멀 선택됨`처럼 상태 포함 label을 주는 편이 좋음.

## 4. Design Balance Notes

- O2 상단 타이틀은 좋지만 모바일에서 너무 강해 보임. `fontSize`를 10-15% 줄여도 브랜드 힘은 유지됨.
- O2 카드 내부 로고가 연하게 깔리며 장식처럼 보이는데, 실사용 판단에는 도움이 적음.
- O4는 모든 선택지를 같은 무게로 보여줘 의사결정 피로가 큼. 첫 화면은 `스타일 태그`와 `코디 기준`까지만 보이게 압축하는 편이 나음.
- 홈은 날씨 히어로가 시각적으로 좋지만 MVP 판단 화면에서는 너무 많은 높이를 씀.

## 5. Recommendations

1. 온보딩 route를 정리해야 함.
   - 출시형 짧은 온보딩이면 `O2`만 남기고 `O4/O5/O6`는 설정 흐름으로 분리.
   - 단계형 온보딩이면 `O2`의 primary CTA를 `다음`으로 바꿔 `O4`로 연결.

2. 홈 첫 viewport를 압축해야 함.
   - 날씨 히어로의 `23도` 숫자와 카드 높이 축소.
   - 상태 pill 3개는 한 줄 유지.
   - `오늘 바로 결정` 첫 CTA가 하단 탭 위로 충분히 떠야 함.

3. O4 문구를 진입 출처별로 분기해야 함.
   - 코디에서 들어오면 온보딩 progress와 `1 / 3` 제거.
   - 하단 primary는 `저장하고 코디로` 우선.

4. 온보딩 compact 스타일을 별도 적용해야 함.
   - 칩 `minHeight` 축소.
   - 섹션 padding 축소.
   - 저장/다음 CTA를 첫 스크롤 안쪽에 더 빨리 노출.

## 6. Evidence Limits

- 이번 감사는 웹 preview `390 x 844` 캡처 기준임.
- 실제 Android native 렌더와 일부 폰트/스크롤/상태바 높이는 다를 수 있음.
- 스크린샷만으로 색 대비와 TalkBack 전체 순서는 완전 검증하지 않았음.
