# Android 코디 카드 여백 수정

- 원인: 코디 바로가기 카드에 세로 패딩이 없었음. 상세 카드의 전용 보조 텍스트 크기는 뒤에 적용된 `pageStyles.compactCaption`의 13sp로 덮였고 설명은 한 줄로 제한됐음.
- 수정: 바로가기 카드 세로 패딩 10dp, 긴 안내 줄바꿈 허용. 상세 시간·날씨 설명 12sp/17dp 적용 및 한 줄 제한 제거. 좁은 화면에서 카드 줄바꿈과 최소 폭 88dp 적용.
- 재현: 연결된 A142, 1084×2412, 밀도 375, font_scale 1.0. `python3 scripts/check-android-outfit-spacing.py`가 수정 전 상단 1.3dp/하단 1.7dp로 실패. 수정 후 두 카드 모두 9.8dp/10.7dp로 통과.
- 검증: TypeScript, git diff --check, Android assembleRelease 통과. 별도 QA 앱 `com.weatheron.mobile.designqa` 업데이트 설치 Success, 콜드 실행 성공. 코디→상세 실제 터치 및 두 화면 스크린샷 확인.
- 실시간 날씨 갱신으로 수정 후 추천은 4개 아이템·22도로 변경됨. 원본 3개 아이템·25도 데이터의 완전 동일 재생은 수행하지 않음. 큰 시스템 글꼴·다른 화면 폭과 iOS 기기 검증은 미수행.
- 스토어 배포 없음. 기존 변경사항 위에 코디 화면 두 파일과 회귀 검사 추가. 임시 앱 로그 삽입 없음.

[코디](evidence/android-outfit-spacing-2026-09-06/outfit.png) · [코디 상세](evidence/android-outfit-spacing-2026-09-06/outfit-detail.png)

## 옷 이름 잘림 추가 수정 (20:40)

- 앞선 카드 여백 검사에서 옷 이름의 모서리 잘림을 놓쳤음. 실기기에서 `얇은 가디건`, `슬림 슬랙스`, `탄 로퍼`의 왼쪽 하단 획 잘림 재확인.
- 실제 이름 영역은 카드 왼쪽 끝부터 하단 1px 위까지 배치됨. 투명한 OutfitGrid 카드에 남은 radius 18dp와 Android FeedbackPressable의 overflow hidden이 결합해 글자를 잘랐음.
- OutfitGrid의 투명 외곽만 radius 0으로 변경. 사진 영역 radius 18은 유지. 이름의 한 줄 제한도 제거. 공통 컴포넌트를 쓰는 코디·온보딩·목적지 코디 호출부 확인.
- `node scripts/check-outfit-text-clipping.mjs`: 변경 전 radius 18로 실패, 변경 후 통과. 이름 줄바꿈 설정은 기본·dense·compact·singleRow·onePage 렌더링에서 검사.
- TypeScript, diff 검사, Android assembleRelease 통과. QA 패키지 업데이트 설치 Success, 콜드 실행 성공. 같은 기기/배율에서 코디 탭 터치 후 네 이름 전체 획이 표시됨을 스크린샷으로 확인. 이전 두 바로가기 카드 여백 검사도 통과.
- 임시 디버그 로그 없음. 스토어 배포 및 다른 호출 화면의 실기기 검증은 미수행.

[옷 이름 잘림 수정 후](evidence/android-outfit-spacing-2026-09-06/outfit-unclipped.png)
