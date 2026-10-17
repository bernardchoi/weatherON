# iOS 코디 완성도 1차 — 시각·선택·Glass·햅틱

기준 HEAD 48087358083455041d09865c596db9782f50ba63. 기존 31개 기본 화면 미커밋 변경 위에 적용. 커밋·푸시 없음. 사용자 후속 승인 Sentinel_8d999b14d8288191bc66026ac6766b12에 따라 필터바/의미 있는 햅틱 제안도 구현 범위로 전환했다. 마이·출발의 후속 디자인 재구성은 이번 범위 밖이다.

## 구현

- C1은 판단 문장 → 네 품목 이미지 → 준비 행동으로 읽힌다. 기존 이미지 박스 없는 구조를 유지하면서 이미지 실루엣 높이/너비를 품목별로 조율하고 라벨·이름을 중앙 정렬했다. 작은 새 글자는 추가하지 않았으며 iOS 품목명은 14/19pt로 유지/상향했다. 시간 조언과 코디 상세/우산 동작은 아이콘을 포함하는 실제 Glass 한 묶음, 옷장/스타일은 별도의 조용한 관리 행이다. 현재 날씨·관측 시각·추천 근거·보유 수와 기존 경로를 보존한다.
- C4는 판단 문장을 제목으로, 두 열의 큰 실루엣과 아이콘+tonal 보유 상태를 먼저 표시한다. 시간 조언은 실제 추천 모델의 문장과 시각으로 표시하며, 날씨 근거와 저장/옷장 행동은 스크롤로 접근한다. 저장 행동 영역만 하나의 실제 Glass 묶음이다. 큰 글자에서는 한 열로 확장한다.
- C2/C3 공유 필터는 종류·계절·목적 전체에 얇은 Glass 하나를 사용한다. 개별 버튼/옵션을 유리 카드로 반복하지 않는다. 각 필터의 독립된 체크/현재값을 유지하여 복수 조건이 동시에 적용된다. 기존 선택 시트와 즉시 적용 동작은 그대로다. 폭 360pt 미만 또는 fontScale 1.3 초과에서는 필터를 세로 배치한다.
- `AmbientControlSurface`는 기존 `HomePlanMaterial`/`HomePlanGlassView`를 재사용한다. iOS26+의 실제 UIGlassEffect(.regular), 네이티브 모듈 사용 불가/하위 iOS/Reduce Transparency의 불투명 fallback을 보존했다. HomePlanMaterial과 홈 네이티브 소스는 변경하지 않았다. 재질은 터치/접근성 초점을 소유하지 않는다.
- 선택 표시의 4pt 국소 이동은 실제 값 변경 시에만 160ms로 정착한다. 기존 누름 압축은 유지한다. Reduce Motion이 false로 확인되지 않으면 이동하지 않는다. 환경 루프나 전체 밝기 변화는 추가하지 않았다.
- 필터는 요청한 선택값이 controlled props에 반영된 뒤에만 UIKit selection haptic을 호출한다. 저장은 이 화면의 저장 요청 또는 저장 복귀 결과와 실제 outfitSaved를 함께 확인한다. 탭 즉시 나던 라벨 기반 저장 햅틱은 이 iOS 버튼에서만 끈다. 같은 값 재선택, 취소, 외부 복원, 미확정/미저장 결과, 반복 렌더에는 햅틱이 없다. 같은 저장 복귀 결과와 250ms 이내 중복도 억제한다. 기존 Expo Haptics의 UISelectionFeedbackGenerator를 사용하며 권한/의존성/강제 vibration 추가 없이 OS 가용성 정책에 맡긴다. 앱에 별도 햅틱 설정은 발견되지 않았고 시스템 설정은 변경하지 않았다.
- Android는 기존 버튼·필터·이미지 분기와 기본 햅틱 정책을 유지한다. 공유 버튼에는 기본값이 이전과 같은 opt-out 인자만 추가했다.

## 검증

원래 의존성 경로 `/Users/daehyeonchoi/Documents/Codex/2026-10-05/task/weatheron/node_modules`에서 PASS:

- mobile TypeScript noEmit, diff whitespace.
- today-outfit, weather-outfit-regressions, home-outing, home-return, native-navigation.
- ambient-surface-regressions: 기존 Home 회귀, reading light/dark, RN gradient parser, 대비의 보수적 계산, 모션/투명성 fallback. 실제 UIKit Glass 합성 대비나 전체 접근성 PASS를 뜻하지 않는다.
- wardrobe-photo-state, review-regressions, localization-native-exports 98, KO/EN/JA 2176.
- 새 `scripts/check-codi-interactions.cjs`: 실제 filter/detail JSX와 marker effect 실행. mount/repeat/unconfirmed/cancel/hydration/unsaved gate 무햅틱, 선택·저장 확인 시 한 번, 동일 결과 중복 억제, Android 무변경, Reduce Motion/설정 조회 완료 시 불필요한 선택 애니메이션 없음.

Home 복귀 검사는 기존 NavigationStack 변경에 추가된 safe-area/window/reading 경계를 fixture에 선언하지 않아 처음 실패했다. 해당 검사 경계만 현재 소스에 맞춰 보완한 뒤 통과했다. 탐색 구현을 바꾼 것은 아니다.

## 빌드·설치

Xcode27, 기존 WeatherONDeviceQA 설정/프로파일/DerivedData, ARM64 jobs1. 처음 의존성 링크를 다른 기존 작업 폴더에 연결해 불필요한 재컴파일이 발생했다. 중단을 시도할 때 이미 빌드는 끝났으며 **그 산출물은 설치하지 않았다**. 직전 설치본 로그의 원래 의존성 경로로 복구하고 검사 후 단일 빌드를 다시 수행했다. 동시 빌드, 패키지 설치, 프로파일 생성 없음.

원래 경로의 최종 빌드·codesign verify·기존 데이터 보존 설치·정상 실행 성공.

최종 main.jsbundle SHA256: `50b85ed53c3ec1f5b2be6cb56c8542248477f733eb226dce24158d4faae9ff6d`.

로그와 재현 검사: `/Users/daehyeonchoi/Documents/Codex/2026-10-10/task-2/design-audit/codi-polish-evidence/` (`build.log`, `build-unused-dependencies.log`, `install.log`, `launch.log`, `bundle.sha256`, `interactions.log`). 작업용 node_modules 링크와 QA 프로젝트/워크스페이스 복사본은 종료 시 제거했다.

## 실제 iPhone 관찰

현재 시스템 다크·기본 글자를 유지하고 승인된 iPhone 미러링으로 직접 관찰했다. 처음에는 잠금 해제가 필요했으나 이후 연결이 가능해졌다. 설정 변경/테스트 테마 override 없음. 아래는 이 상태의 관찰이며 다른 테마/상태로 확대하지 않는다.

- 설치 전 C1은 하단 관리 설명이 첫 화면 밖에 걸쳤다. 설치 후 C1은 판단, 실제 네 품목과 이름, 근거, Glass 준비 행동, 옷장/스타일 설명 및 탭이 **첫 화면에 모두 보인다**. 440×956pt 대상의 목표를 해당 현재 상태에서 시각적으로 확인했다. 모든 긴 문장/기기 조합의 높이 측정이나 무스크롤 보장은 아니다.
- 의류 이미지를 눌러 C4 진입. 두 열 이미지, 추가 준비 표시, 실제 보유 0개, 시간 조언과 날씨 근거를 확인했다. 상세를 끝까지 스크롤하면 Glass 저장/옷장 영역이 잘리지 않고 도달한다. 기존 ‘저장 완료’ 상태가 보존되어 있으며 새 저장/계정 변경을 실행하지 않았다.
- C4의 내 옷장 보기 → C2. 종류 ‘상의’와 계절 ‘가을’을 선택해 두 활성 표시가 동시에 유지됨을 확인했다. 종류/계절 모두 원래 ‘전체’로 복원했다.
- C2의 기존 아이템 추가 → C3. 공유 Glass 필터바 표시를 확인하고 종류 ‘상의’를 선택했다. 필터 결과 13개와 실제 상의 이미지 목록, 스크롤을 확인했다. 원래 전체 54개로 복원했다. 프리셋 추가·개인 사진 선택/분석·저장은 실행하지 않았다.
- Home 탭 복귀 후 확정된 기온·작은 날씨 아이콘·체감/최고최저·목적지 준비 문장·실제 Glass·코디 표면을 확인했다. 마지막에는 코디 탭으로 복귀했다.
- 도구에 표시된 전후 정지 캡처를 직접 확인했다. 별도의 로컬 PNG 파일로 저장한 증거는 아니다. 움직임의 프레임 성능·실제 손끝 압력/촉감을 정지 캡처로 검증했다고 주장하지 않는다.

미검증: 라이트, 작은 실기기, Dynamic Type/VoiceOver/Reduce Motion/Transparency를 켠 실제 기기, 장시간 성능, 실제 햅틱 촉감/사용자 체감, 신규 저장과 인증 왕복 성공. 계정·권한·사진·데이터 삭제·시스템 설정은 조작하지 않았다. 모든 화면의 디자인 완성 또는 접근성 전체 PASS가 아니다.
