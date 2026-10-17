# Ambient Surface C1·C4·G1 — 원본 대조와 제한된 시각 보완

기준 SHA `02f68c1b5d7240b3e2b62728610c893715334edb`, 로컬 `codex/ambient-ui-polish-20261011`. 누적 M1/M3/M4/A4 24개 변경 파일과 기존 patch/렌더/QA를 보존하고 후속 승인된 코디 메인·상세·출발 메인만 보완했다. root AGENTS.md 및 승인 패키지 README, 최신 코디 시각·오늘 범위·마이/출발 QA를 읽었다. 추가 AGENTS.md/.agents/skills는 발견되지 않았다. 반복 DOM/스크린샷 검사를 위해 Chromium을 사용했다.

## 원본 픽셀과 선택 범위

실제 픽셀을 연 승인 원본:

- `01A-Core-Weather-20261009/images/01-core-ios-light-v3.png`, `01-core-ios-dark-v3.png`의 C1/G1 패널. 경로 접두사는 `docs/design/ambient-surface-pages-20261009/WeatherON-`이다.
- `02A-Outfit-Main-20261009/images/02-outfit-detail-ios-light-v2.png`, `02-outfit-detail-ios-dark-v2.png`.
- `03A-Destination-Main-20261009/images/05-destination-ios-light.png`, `05-destination-ios-dark.png`도 열어 출발 상세와 메인 범위를 구분했다. G2 화면을 이번에 재구성하지 않았다.

기준 소스를 실제 JSX→RN Web로 먼저 6개 렌더하여 대조했다. C1은 제목 대비 이미지/읽기 여백, C4는 두 열 이미지 폭, G1은 제목/선택 표시/정적 깊이가 큰 차이였다. 해당 범위를 짧게 보고한 뒤 구현했다. C4 기준 cloud에서 `flex:0`과 퍼센트 width가 상호작용해 이미지 폭이 0이 되었다. 이것을 같은 iPhone 버그라고 주장하지 않고, 두 열/한 열의 명시적 flex basis/grow/shrink로 의도를 표현했다.

| 화면 | 이번 개선 | 보존한 최신 결정 |
| --- | --- | --- |
| C1 | 제목 28/36pt, main opt-in 의류 높이 124pt/큰 기본 화면 132pt(좁은 폭 112pt), 신발/소품 비율과 contain 유지. 관리 행의 둥근 테두리 잔재를 열린 구분선으로 정리. 확대 글자에서 행동/관리 행의 intrinsic 높이를 확보 | 판단 한 문장 → 네 품목 이미지/이름 → 준비 행동, 시간 조언·상세·우산은 Glass 한 묶음, 옷장/스타일 별도 접근. 기본 440×956 첫 화면 구성 유지. 모든 문자열을 억지로 줄이거나 기능을 지우지 않음 |
| C4 | 퍼센트 열 폭과 intrinsic 높이 명시, column gap12/row gap18. 제목 26/34pt·판단 23/32pt, 의류 150/큰 화면168pt. 보유 윤곽 체크·tonal 표시·준비 요약 수평 경계. 큰 글자 단일 열/저장 영역 세로 행동 | 원본의 4개 가로 품목 대신 최근 확정한 **큰 두 열 실루엣** 유지. 실제 추천 항목을 전부 표시하며 다섯 번째 소품도 남김. 시간 조언/날씨 근거/저장·옷장은 스크롤. 저장 행동만 Glass 한 묶음 |
| G1 | 제목 28/36pt, 선택 체크에 얇은 원형 경계, 추가 행동 17/24pt. 기존 공통 정적 곡면/그레인 표면을 연결 | 현재 선택한 목적지를 먼저·그 목적지만 Glass, 나머지는 열린 행. 출발/도착 목표·예상 구분·기온 비교/차이·강수·반복·알림/경고 모두 기존 모델. 모든 저장 목적지를 map하고 3개를 렌더 상한으로 하드코딩하지 않음 |

C1/C4/G1의 정적 배경은 이미 작성한 512×1100 로컬 PNG 2개를 재사용한다. 원본의 넓은 곡면/그레인에 접근하며 날씨 데이터 의미·시계·움직임·센서·효과 루프가 없다. Reduce Transparency는 단색. 실제 Glass는 기존 HomePlanMaterial/UIGlassEffect 분기 그대로이며, 모든 품목·행을 유리 카드로 만들지 않았다. 홈 배경/레이아웃/워드마크는 변경하지 않았다.

원본 예시와 데이터가 다른 이유: 합성 모델의 이후 강수는 레인 재킷·다른 품목을 고를 수 있다. 실제 추천을 원본 가디건/검정 신발로 강제 교체하지 않았다. 출발 15:17과 예상 도착 16:33 등은 기존 경로/여유/도착·출발 기준 계산의 결과이며 원본 예시 15:30을 복사하지 않았다. 원본 C4의 구름 세부/가로 4열과 완전한 픽셀 일치는 목표를 최신 결정과 충돌시키므로 적용하지 않았다.

## 추가 변경 파일

- `apps/mobile/src/screens/OutfitScreen.tsx`: iOS 제목·mainVisual opt-in·확대 행동/관리 행 및 합성 날씨 문장 표시 번역.
- `apps/mobile/src/components/OutfitGrid.tsx`: C1에서만 mainVisual로 이미지 비율/높이 선택. 다른 사용 화면은 기존 높이. C1의 확대 슬롯명 줄 제한 해제.
- `apps/mobile/src/screens/OutfitDetailScreen.tsx`: iOS 열/높이/판단·준비 상태/접근 구조. preset의 복합 보유/준비 문장 번역, 개인 photo 이름은 RawText로 유지. weather/save 효과·계정 gate는 유지.
- `apps/mobile/src/components/Section.tsx`: optional titleStyle; C4 판단만 선택하고 기본 화면은 undefined.
- `apps/mobile/src/screens/DestinationListScreen.tsx`: iOS 제목·선택 표시·추가 행동, 반복 문장의 삽입값 번역만 보완. 모델·일정·선택 순서·후속 경로·햅틱 effect 유지.
- `apps/mobile/src/components/AmbientReadingSurface.tsx`, `scripts/check-ambient-surface-regressions.mjs`: 동일 정적 PNG 범위 C1/C4/G1 추가 및 범위 회귀.
- `scripts/check-codi-interactions.cjs`: 추가 LocalizationContext/translateText 의존성만 inert fixture에 선언.
- `scripts/build-ambient-outfit-departure-cloud.mjs`, `scripts/check-ambient-outfit-departure-cloud.mjs`: 실제 JSX와 공개 가상 상태/고정 시각/inert 콜백으로 비교·수치·스크롤·언어·선택/저장 경계 검증.
- `scripts/check-outfit-departure-presentation-contracts.mjs`: 상세 날씨 이유·목적지 모델/날짜/시각 함수, TodayOutfit/HomeOuting·필터·Glass·숨김 경로·확인 후 햅틱 효과의 기준 바이트 계약.

UI 복합 문장의 템플릿 값은 자동 재번역되지 않아 영문에서 흐림/주중/없음 등이 남던 것을 렌더 단계에서 번역했다. 공통 번역 규칙을 변경하거나 사용자 지명을 번역하지 않았다. 개인 사진명은 앱 전역에서 재번역하지 않는다. Android 분기의 기존 이미지·배치·모델/행동을 유지하며 Android 작업은 하지 않았다.

## 검사 범위와 재현

```sh
node scripts/check-outfit-departure-presentation-contracts.mjs
node scripts/check-codi-interactions.cjs
node scripts/check-ambient-outfit-departure-cloud.mjs /tmp/weatheron-outfit-departure-cloud
```

Cloud fixture의 상태는 production 소스/설정에 남지 않는다. 생성 entry는 지정한 Git 밖 출력 폴더에만 쓴다. 서버는 출력 HTML/bundle과 공개 앱 자산/폰트만 제공하며 계정·네트워크·저장소 클라이언트를 호출하지 않는다. 날짜는 fixture에서만 고정하여 오늘 남은 범위와 목적지 계산을 재현한다. 실제 위치·목적지·개인 사진·비밀값·기기 로그는 사용하지 않았다.

코드 계약/회귀: TodayOutfit의 날짜·시간대·현재 기온 존재·실제 0·기온 대체·stale/오류/예보 없음 정책은 그대로다. 상세의 weather reason/time presentation 및 목적지 model/warning/schedule/repeat/result 함수를 기준과 바이트 비교했다. 필터 하나의 Glass·복수 선택·confirmed feedback 함수와 C4/G1 React.useEffect 본문, 숨김 route도 동일하다. 실제 JSX 검사는 mount/repeat/unconfirmed/cancel/external hydration/unsaved gate 무햅틱, 요청이 반영된 선택/저장에만 한 번, 동일 결과 중복 억제와 Reduce Motion을 보존한다.

렌더의 기본 모드는 두 테마 × C1/C4/G1, 390×844·440×956 기본 글자, 320×568 기본/영문1.6배/일문2배, Reduce Transparency. 실제 TodayOutfit으로 missing/real-zero/stale/no-forecast 및 air-only 영문 확대를 만들었다. G1은 0/1/2/3/5개 전체 목록, 5개 긴 영문 이름/큰 글자, 경로 오류/출발지 없음, 다른 선택 후 반복 선택을 검사한다. 최대 3개 안내는 그대로 유지하며 5개는 이미 저장된 목록 접근의 방어 사례다.

필터는 출시 화면을 변경하지 않고 실제 WardrobeFilterControls를 별도 합성 fixture로 렌더했다. light/dark의 기본·동시에 두 활성 값·확대 영문, 세 독립 조작과 선택 표시, idle 무햅틱 및 텍스트/표적/가로 접근을 확인했다. 신규 필터를 C1에 추가하거나 숨김 route를 켜지 않았다.

확인 한계: RN Web의 iOS Platform/safe area 59/88px/fontScale 가정이며 UIKit Glass unavailable의 기존 불투명 fallback이다. 실제 native stack/tab/header, iPhone 이미지 할당/프레임 성능, Dynamic Type/VoiceOver/손끝 햅틱은 검증하지 않았다. 원본은 폭 정규화/비율 보존 후 대조하며 원본 생성 시안과 모든 픽셀이 같다고 판단하지 않는다.

Mac에서 나중에 확인할 항목: 두 열/한 열의 실제 native 폭과 의류 contain 실루엣·개인 사진·다섯 소품, 기본 첫 화면과 확대 끝 접근, 준비·저장 영역 및 선택 목적지의 실제 Glass/색/대비, 길고 많은 목적지에서 VoiceOver/selected 상태, 시간대·오늘/목적지 시각·stale/기온 미확인 상태의 실제 공급자 표현, 탭/뒤로/Home 복귀, Reduce Motion/Transparency·저전력/스크롤/메모리, 실제 선택·저장 확인의 햅틱. 실제 저장/인증/권한 작업은 별도 승인과 가상 테스트 계정으로 확인해야 한다.

이번 Xcode 빌드·설치·미러링·실제 햅틱·커밋·푸시·PR·병합·배포 없음. Library 403 재시도·우회 없이 기존 파일과 로컬 증거를 보존했다. 위젯/Live Activity 및 나머지 화면의 시각 완료는 별도 잔여다.

## 최종 결과와 인계

- 최종 실제 JSX cloud 79건(기준 6 + 수정 73) PASS: `/workspace/weatheron-outfit-departure-final/results.json`. 두 테마 비교 `comparison-C1-light/dark.png`, `comparison-C4-light/dark.png`, `comparison-G1-light/dark.png`를 실제 열어 검토했다. 큰 글자 저장 영역의 끝 이미지도 검토했다.
- 최종 440×956 기본 합성 상태 C1/G1의 scroll viewport와 content는 각각 809px/809px로 모든 본문 기능이 첫 화면에 들어온다. C4는 809px/1992px이며 모든 다섯 품목·근거·저장 행동에 스크롤로 접근한다. 390/320px·큰 글자도 끝 접근 PASS. 이는 native 첫 화면 보증이 아니다.
- 소스 검사 24건 전부 exit0: `/workspace/weatheron-outfit-departure-final-source-checks/results.json`. 모바일 TypeScript, 모델/날짜/온도/예보/목적지/번역/사진 상태/확인 후 햅틱/홈 복귀/배경/접근 관련 회귀 포함. `git diff --check` PASS.
- 최종 cloud 결과에서 수정 후 모든 이미지의 실제 폭·높이 >0를 별도 확인했다. 최종 harness의 추가 필터 세 조작/두 활성 표시 assertion은 필터 6건 재실행으로 PASS: `/workspace/weatheron-outfit-departure-filter-final/filter-results.json`. 이 6건은 위 79건과 별도 중복 확인이다.
- 앞선 M1/M3 30건 및 M4/A4 44건 증거·24개 변경 파일을 보존했다. 이번 79건으로 해당 이전 화면 74건까지 다시 실행했다고 주장하지 않는다.
- 누적 34개 파일 인계 patch: `/workspace/weatheron-ambient-outfit-departure-cumulative-20261011.patch`. 같은 경로의 `.sha256` 및 `.manifest.json`에 기준 SHA·파일별 해시·새 기준 디렉터리 적용 검증을 기록한다. 기존 계정/권한 patch를 덮어쓰지 않는다.

남은 시각 차이: 정적 배경은 원본의 날씨별 구름 세부를 완전히 재현하지 않으며, 실제 추천 이미지/개인 사진은 데이터에 따른다. native tab/header/Glass 및 실제 글자/안전 영역 차이는 Mac/iPhone 확인 뒤 평가한다. C4 두 열과 G1 전체 목적지 목록은 최신 사용자 결정을 우선한 의도된 차이이다.
