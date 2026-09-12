# WeatherON H6/H7 피드백 디자인 QA

source visual truth paths:
- `/var/folders/_5/fb8khc257cn_060s0g93zsdh0000gn/T/codex-clipboard-896ab302-f876-4164-95e8-65b816660d86.png`
- `/var/folders/_5/fb8khc257cn_060s0g93zsdh0000gn/T/codex-clipboard-aed2cc89-dc5a-407e-9764-3cc30a9b549a.png`

implementation screenshot paths:
- `/tmp/weatheron-h7-outfit-fixed.png`
- `/tmp/weatheron-h6-uv-summary-ios.png`

comparison image paths:
- `/tmp/weatheron-h7-design-comparison.png`
- `/tmp/weatheron-h6-design-comparison.png`

viewport: 390x844 CSS px, deviceScaleFactor 1

source pixels: 각 1320x2868, 비교 시 390x844로 정규화

implementation pixels: 각 390x844

state:
- H7 다크 테마, 내일 맑음, 여름 코디 3종 추천
- H6 다크 테마, iOS 분기, 자외선 값 대기 상태

## Full-view comparison evidence

- H7은 피드백 화면의 카드 순서, 카드 폭, 정보 위계와 하단 여백을 유지함.
- H7 수정 렌더의 상의·하의·신발 이미지는 모두 `complete=true`, `naturalWidth=512`, `naturalHeight=512`로 확인됨.
- H6은 별도 생활지수 패널을 제거하고 자외선을 요약카드 우측의 70x72 배지로 통합함.
- H6 iOS 분기는 요약카드 다음에 시간별 예보가 바로 이어지며 가로 넘침이 없음.
- 원본은 iOS 상태 표시줄을 포함하고 웹 렌더는 시스템 크롬을 제외하므로 앱 소유 UI만 비교함.

## Focused region comparison evidence

- H7 코디 히어로와 미니 카드 모두 동일 추천 아이템의 실제 PNG를 사용함. 아이템 ID가 바뀌면 이미지 뷰가 재마운트되고 로드 오류 시 셔츠 아이콘으로 대체됨.
- H6 자외선 배지는 아이콘·라벨·수치·등급을 세로로 묶어 기존 3개 날씨 팩트 폭을 줄이지 않음.
- 별도 확대 비교 없이도 390x844 전체 비교에서 코디 이미지의 깨짐, 자외선 배지 텍스트, 카드 경계가 명확히 판독됨.

## Required fidelity surfaces

- Fonts and typography: 기존 Pretendard 계층, 굵기, 줄높이 유지됨. H6 체감 문구는 한 줄 제한으로 배지와 충돌하지 않음.
- Spacing and layout rhythm: H7 기존 간격 유지. H6 생활지수 패널 제거로 요약에서 시간별 예보로 흐름이 짧아짐.
- Colors and visual tokens: 기존 다크 테마의 clear, sky, gold, cardMuted 토큰만 사용함.
- Image quality and asset fidelity: H7 실제 의류 PNG 3종이 512x512로 정상 로드됨. 누락·오류 시 빈 프레임 대신 기존 셔츠 아이콘을 표시함.
- Copy and content: H7 문구 유지. H6 `생활 지수`는 제거하고 Android 미세먼지 영역만 `대기질`로 명확히 구분함.

## Findings

- P0/P1/P2 잔여 시각 이슈 없음.
- React Native Web의 `BackHandler` 및 native driver 경고가 있으나 이번 H6/H7 변경과 무관한 기존 웹 전용 경고임.
- 실기기 푸시 콜드 스타트는 웹 렌더로 대체할 수 없어 네이티브 회귀 확인이 별도로 필요함.

## Comparison history

- 이전 H7: 푸시 콜드 스타트 후 추천 아이템이 교체될 때 슬롯 키가 유지돼 네이티브 이미지 뷰가 재사용됐고 깨진 이미지가 남을 수 있었음.
- 수정 H7: 슬롯+아이템 ID 키, 이미지 URL 키, `onError` fallback을 적용함.
- 이후 H7: 히어로와 3개 미니 아이템의 실제 PNG 로드 및 390x844 배치를 확인함.
- 이전 H6: 자외선 하나가 넓은 생활지수 패널을 차지함.
- 수정 H6: 자외선을 요약 배지로 이동하고 iOS 생활지수 패널을 제거함.
- 이후 H6: 요약카드와 시간별 예보가 바로 이어지고 가로 넘침이 없음을 확인함.

## Implementation checklist

- [x] H7 추천 아이템 변경 시 이미지 재마운트
- [x] H7 이미지 로드 실패 fallback
- [x] H6 자외선 요약카드 통합
- [x] iOS 생활지수 패널 제거
- [x] Android 미세먼지 `대기질` 유지
- [x] 390x844 렌더 및 이미지 디코딩 확인
- [x] 타입 검사, 공용 규칙 검사, 서버 문법 검사, 웹 export, diff 검사

final result: passed

---

# WeatherON C4 하단 행동 통합 디자인 QA

source visual truth path:
- `/Users/daehyeonchoi/Downloads/IMG_6761.PNG`

implementation screenshot paths:
- `/private/tmp/weatheron-c4-actions-after.png`
- `/private/tmp/weatheron-c4-actions-after-bottom.png`

comparison image path:
- `/private/tmp/weatheron-c4-design-comparison.png`

viewport: 390x844 CSS px, deviceScaleFactor 2

source pixels: 1320x2868

implementation pixels: 780x1688

state note:
- 원본과 현재 미리보기의 추천 아이템, 일치율, 보유 개수는 다름. 이번 비교는 C4 하단 행동 구조와 카드 위계에 한정함.

## Required fidelity surfaces

- Fonts and typography: 기존 Pretendard 계층과 버튼 굵기를 유지함. 통합 카드 제목과 보조 문구 줄바꿈 없음.
- Spacing and layout rhythm: 분리된 고정 푸터를 제거하고 저장 행동을 마지막 카드 안에 배치함. 내부 스크롤 최하단에서 카드와 하단 내비게이션이 겹치지 않음.
- Colors and visual tokens: 저장만 기존 gold 강조를 유지하고 옷장 이동·추가는 outlined 보조 행동으로 낮춤.
- Image quality: 기존 코디 이미지 소스와 크기·비율을 변경하지 않았고 캡처에서 잘림 없음.
- Copy and content: `코디로 돌아가기`를 제거하고 제목을 `저장 및 내 옷장`으로 명확히 변경함. 저장 상태·계정 연결·약관 분기 문구 유지함.

## Findings

- P0/P1/P2 잔여 이슈 없음.
- 원본의 동일 비중 4개 버튼보다 변경안의 1개 주 행동 + 2개 보조 행동이 목적 우선순위를 명확히 함.
- React Native Web `BackHandler` 경고만 확인됐으며 이번 변경과 무관한 기존 웹 전용 경고임.
- `check:android-core-flow`는 기존 `코디 탭` aria 탐색에서 실패함. 이번 C4 버튼 변경 전 구간이며 인앱 브라우저의 실제 코디 탭·상세 진입은 통과함.

## Interaction and responsive checks

- 390x844에서 가로 넘침 없음: scrollWidth 390, innerWidth 390.
- C4 버튼은 저장, 내 옷장 보기, 아이템 추가만 노출되며 `코디로 돌아가기` 없음.
- 저장 버튼 선택 시 `계정 연결` 흐름으로 이동하고 뒤로 가기 시 C4 통합 카드로 복귀함.
- 인앱 브라우저와 반복 캡처에서 상단·하단 스크롤 상태 확인함.

## Implementation checklist

- [x] `코디로 돌아가기` 삭제
- [x] 저장 완료 피드백과 저장 CTA를 내 옷장 카드에 통합
- [x] 옷장 관련 행동을 outlined 보조 CTA로 정리
- [x] TypeScript, web export, diff 검사
- [x] 390x844 레이아웃, 내부 스크롤, 저장 진입 동작 확인

final result: passed
