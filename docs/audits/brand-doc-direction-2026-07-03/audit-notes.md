# WeatherON Brand Docs Direction Audit

- Date: 2026-07-03 KST
- Scope: brand docs, current mobile web dist, 390x844 viewport
- Docs reviewed:
  - `brand/WeatherON_디자인_정체성_가이드.md`
  - `brand/WeatherON_로고_디자인철학.md`
  - `brand/WeatherON_아이콘_시스템.md`
  - `brand/WeatherON_BI_CI_로고_워드마크_리뷰.md`
- Evidence:
  - `screenshots/00-splash.png`
  - `screenshots/01-home.png`
  - `screenshots/02-departure.png`
  - `screenshots/03-my.png`

## Verdict

디자인 방향성은 맞음.

현재 구현은 `Quiet Horizon`, `Clear Navy + Warm Sun`, `5초 안에 오늘 준비`, `홈/출발/MY` MVP 구조와 대체로 정합함. 로고, 워드마크, 앱 아이콘도 문서의 토글+태양노브, 구름, 네이비/골드 조합을 잘 유지함.

시각 완성도는 아직 출시 폴리시 수준은 아님. 현재 홈/출발/MY 기준으로는 약 65% 수준으로 판단함.

## Step Health

| Step | Surface | Health | Notes |
|---:|---|---|---|
| 1 | Splash / logo | Good | 앱 아이콘, 워드마크, Warm Sun CTA가 문서 방향과 잘 맞음. |
| 2 | Home | Improving | 브랜드 색과 기능색 분리는 좋음. 다만 카드 문구 일부 잘림과 상태 정보 과밀이 남음. |
| 3 | Departure | Mixed | 목적지 추가 CTA는 명확함. 빈 하단 공간과 큰 아크가 미완성 화면처럼 보임. |
| 4 | MY | Improving | 정보 구조는 정리됨. 붉은 `확인` 배지가 반복돼 경고감이 과함. |

## Matches

1. 색상 토큰 정합성 좋음.
   - 구현 토큰은 문서의 다크 `#10243F`, `#1F4E79`, `#214A78`, `#F4B63F`, `#4AA3DF`, `#2FC6A3` 계열과 맞음.
   - 라이트 v2 워드마크도 `#1F4E79`, `#C2410C` 방향과 맞음.

2. 브랜드 모티프 정합성 좋음.
   - 앱 아이콘의 토글 트랙, 태양 노브, 구름 조합이 문서 의도와 맞음.
   - 스플래시의 로고 노출도 `오늘을 켠다` 메시지와 맞음.

3. MVP IA 정합성 좋음.
   - 하단 탭은 현재 `홈/출발/MY` 3개라 MVP 구조와 맞음.
   - 숨김 라우트가 많아도 현재 탭 표면에는 노출되지 않음.

## Gaps

1. 아이콘 크기 기준 미세 불일치.
   - 문서 기준 탭바 아이콘은 21px.
   - 초기 캡처 기준 구현 `BottomNav`는 23px였고, 후속 수정에서 21px로 조정함.
   - 큰 문제는 아니지만 디자인 시스템 기준으로는 추적 필요함.

2. 골드 사용 범위가 살짝 넓음.
   - 문서는 골드를 `ON/활성/주요 CTA` 중심으로 제한함.
   - 현재 홈 알림 버튼 테두리와 일부 주목 UI에도 골드가 보여 활성 의미가 약간 흐려질 수 있음.

3. Home 정보 밀도 높음.
   - `5초 결정` 원칙과 비교하면 홈 하단 상태문구가 길고, `강수 타임라인` 카드 문구가 잘림.
   - 완성도 저하 요인임.

4. Departure empty state 약함.
   - 목적지 추가 행동은 명확함.
   - 하단 절반의 장식 아크와 빈 공간이 많아 제품 화면보다 placeholder 느낌이 남음.

5. MY warning tone 과함.
   - 권한/알림/오늘 준비의 `확인` 상태가 반복됨.
   - 실제 차단 상태와 단순 권장 상태를 시각적으로 나눠야 함.

## Accessibility Limits

- 스크린샷 기준 터치 타겟은 대체로 충분해 보임.
- 다만 실제 contrast ratio, VoiceOver/TalkBack 순서, 동적 글자 크기, 포커스 복귀는 이번 캡처만으로 확정 불가.

## Recommended Order

1. `BottomNav` 탭 아이콘은 문서 기준 21px 유지.
2. 골드 사용처를 CTA/활성/ON으로 재정리하고 알림 주목 상태는 Rain Red 또는 Clear/Sky 계열로 분리.
3. 홈 quick-action 카드 문구 잘림 수정.
4. 출발 empty state 하단 공간 재구성.
5. MY 확인 배지 톤을 blocking / warning / info로 분리.

## Follow-up Applied

- Date: 2026-07-03 KST
- Evidence: `../product-design-polish-2026-07-03/screenshots/01-home-after.png`, `02-departure-after.png`, `03-my-after.png`

| Item | Status | Applied 기준 |
|---|---|---|
| BottomNav icon | Done | 탭 아이콘 21px 기준으로 조정 |
| Gold scope | Done | Gold는 ON/활성/CTA 중심, 홈 알림 주목 테두리는 alert tone으로 분리 |
| Home quick-action | Done | quick-action 본문 2줄 처리와 문구 축약 적용 |
| Departure empty state | Done | 목적지 없음 상태에 출발 시간/비 그침 이점 카드 추가, 장식 대비 축소 |
| MY warning tone | Done | `확인` 반복을 줄이고 비차단 권장은 `설정`/Sky 정보 톤으로 분리 |

Remaining: light mode, dynamic text, contrast ratio, TalkBack/VoiceOver 순서는 별도 QA 필요.

## Superseding Design Spec

- Date: 2026-07-03 KST
- Source: `docs/design/WeatherON_UI_Design_Spec.md`
- 이 감사의 `홈/출발/MY` 정합 판단은 당시 구현 표면 기준임.
- 목업과 와이어프레임/구현이 다른 경우에는 통합 디자인 스펙의 목업 우선순위를 따른다.
