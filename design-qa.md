# WeatherON C1 헤더 간격 디자인 QA

source visual truth path: `/var/folders/_5/fb8khc257cn_060s0g93zsdh0000gn/T/codex-clipboard-d0f74a13-5c59-4332-ac95-91c4b6a50bab.png`
implementation screenshot path: `design-qa-screenshots/c1-header-spacing-after.png`
comparison image path: `design-qa-screenshots/c1-header-spacing-comparison.png`
viewport: 브라우저 및 앱 콘텐츠 393x852 CSS px, deviceScaleFactor 1
source pixels: 944x2048, 393x852로 정규화
implementation pixels: 393x852
state: 다크 테마 C1 코디 메인, 기본 옷장 추천 상태

## Full-view comparison evidence

- 원본과 구현을 각각 393x852로 정규화해 한 이미지 안에서 비교함.
- 원본은 iOS 상태 표시줄을 포함하고 구현은 웹 프리뷰이므로 시스템 크롬 차이는 앱 소유 UI 비교에서 제외함.
- 현재 데이터 차이로 의류명과 시간 문구 일부가 다르지만, 이번 변경 대상인 헤더·첫 카드·추천 카드 구조는 동일함.
- 수정 후 첫 카드부터 하단 CTA까지 393x852 뷰포트 안에 표시되며 하단 탭과 겹치지 않음.

## Focused region comparison evidence

- 헤더 부제 하단 좌표: 58px.
- 첫 기준 카드 상단 좌표: 74px.
- 수정 후 헤더와 첫 카드 사이 실측 간격: 16px.
- 카드 간 기존 간격은 유지하고 첫 카드에만 상단 여백을 추가함.

## Required fidelity surfaces

- Fonts and typography: 기존 Pretendard 계층, 크기, 굵기, 줄바꿈 유지됨.
- Spacing and layout rhythm: 헤더-첫 카드 간격만 8px에서 16px로 확장됨. 카드 내부와 카드 사이 리듬은 유지됨.
- Colors and visual tokens: 기존 다크 테마 토큰과 카드 색상 변경 없음.
- Image quality and asset fidelity: 기존 의류 및 아이콘 자산 변경 없음.
- Copy and content: 사용자 노출 문구 변경 없음.

## Findings

- P0/P1/P2 잔여 이슈 없음.
- 웹 프리뷰에서 React Native Web의 `BackHandler` 및 native driver 관련 경고가 발생하지만 iOS 레이아웃 변경과 무관함.

## Comparison history

- 이전: `contentGap` 8px만 적용되어 헤더 설명과 첫 카드가 같은 밀도로 붙어 보였음.
- 수정: 첫 기준 카드에 8px 상단 여백 추가함.
- 이후: 실측 간격 16px 확보, CTA·하단 탭 겹침 없음.

## Implementation checklist

- [x] 헤더와 첫 카드 간격 확대
- [x] 카드 간 기존 밀도 유지
- [x] 타입 검사 및 웹 번들 생성
- [x] 393x852 렌더링 캡처
- [x] 주요 버튼 활성 상태 확인

final result: passed
