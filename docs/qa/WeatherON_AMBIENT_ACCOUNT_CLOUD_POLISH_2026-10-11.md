# Ambient Surface M1/M3 — 클라우드 완성도 및 정적 깊이 마무리

후속 승인으로 M4/A4도 보완했다. 이 문서의 “다음 제안”은 1차 완료 시점 기록이며 최신 결과·누적 인계는 [M4/A4 QA](WeatherON_AMBIENT_PERMISSION_ACCOUNT_CLOUD_2026-10-11.md)를 참고한다.

기준 `02f68c1b5d7240b3e2b62728610c893715334edb`, 원격 `feat/ambient-surface-foundation-home` 최신 게시 SHA와 일치함을 확인했다. 초기 환경의 `work`는 다른 커밋이었고 작업 트리는 깨끗했다. 지정 SHA에서 `codex/ambient-ui-polish-20261011` 로컬 브랜치를 만들었다. reset·커밋·푸시·PR·병합·배포 없음. 실제 기기 검증은 사용자 결정대로 연기했다.

## 원본과 수정 범위

루트 AGENTS.md를 읽었으며 저장소·상위 작업 공간에서 추가 AGENTS.md/.agents/skills의 SKILL.md는 발견되지 않았다. 패키지 README, 최신 Codi/My/Departure·계정 설정·빛 깊이 QA, Project Wind 원전 및 WeatherON 전용 방향 문서를 확인했다.

실제 픽셀을 연 원본:

- `docs/design/ambient-surface-pages-20261009/WeatherON-01A-Core-Weather-20261009/images/01-core-ios-light-v3.png`
- 같은 폴더 `01-core-ios-dark-v3.png`
- `docs/design/ambient-surface-pages-20261009/WeatherON-04A-Account-iOS-20261009/images/06-settings-ios-light-v3.png`
- 같은 폴더 `06-settings-ios-dark-v3.png`

수정 전 실제 M1/M3 JSX의 React Native Web 렌더를 먼저 열어 비교하고, 두 화면의 제한된 첫 묶음과 수정 항목을 보고한 뒤 구현했다. 1차 완료 후 원본/수정 전/수정 후 비교 PNG를 직접 확인했다. 후속 승인으로 남은 정적 깊이·정책 아이콘을 같은 묶음에서 마무리하고, 원본/1차 수정/최종 수정의 completion 비교 PNG를 다시 확인했다. 원본은 폭만 정규화하고 비율은 유지했으며, 앱 렌더와 원본의 safe area/탭 위치 차이를 픽셀 일치나 실기기 QA로 판정하지 않았다.

## 변경 파일과 결과

| 파일 | 변경 |
| --- | --- |
| `apps/mobile/src/screens/MyScreen.tsx` | iOS 정책 아이콘을 원본 문서 윤곽의 코드 벡터 파생 PNG로 연결. 중앙 계정 아바타 104/120pt, 제목 28/36pt, 계정 행동·관리·정책·버전 사이 여백 정리. 아바타 크기만 화면 높이에 대응하며 글자는 축소하지 않음. 복합 권한/테마 요약의 EN/JA 한글 잔여 수정 |
| `apps/mobile/src/screens/GlobalSettingsScreen.tsx` | 테마를 온도·거리와 같은 설정 행으로 정렬. 제목 26/34pt, 윤곽 아이콘과 얇은 선택 컨트롤. 좁은 폭/큰 글자에서 아래 배치와 세로 선택지. iOS 스위치는 Reduce Motion 상태 미확인/활성 시 즉시 정착 |
| `apps/mobile/src/components/AppListRow.tsx` | M1/M3에서만 선택하는 `ambientLayout`. 32pt 윤곽 아이콘, 17/24pt 제목·14/20pt 보조, 설정 컨트롤 재배치. 다른 reading 화면과 비iOS는 기존 표현 |
| `apps/mobile/src/components/AppButton.tsx` | iOS 계정 행동 전용 opt-in: 둥근 형태와 18/25pt 라벨, 장식 체크 제거. 버튼 기능색과 누름/Reduce Motion 정책 유지. 계정 이동에는 햅틱 없음 |
| `apps/mobile/src/components/AmbientReadingSurface.tsx` | M1/M3에서만 고정 곡면·질감 PNG. Reduce Transparency에서는 단색; 다른 화면은 기존 gradient |
| `apps/mobile/src/ambientAssets.ts` | 코드 기반 문서 윤곽 파생 자산 등록 |
| `apps/mobile/src/components/NavigationStack.tsx`, `apps/mobile/src/navigation/AppNavigator.tsx` | 기존 표면에 현재/각 stack route ID만 전달; 탐색·측정·복귀 로직 유지 |
| `scripts/check-ambient-surface-regressions.mjs` | M1/M3 범위·루트 좌표·투명도 감소·비상호작용 검사 추가 |
| `scripts/build-ambient-account-art.mjs` 및 신규 자산 4개 | 결정적인 곡면/그레인 PNG 2개와 문서 SVG/PNG 생성·바이트 재현·모든 픽셀 대비 검사 |
| `scripts/check-my-departure-interactions.cjs` | 현재 My 의존성 fixture 보완, 실제 M3 스위치 effect의 Reduce Motion/미확인/기본 상태 검사 |
| `scripts/build-ambient-account-cloud.mjs` | 실제 소스 JSX를 RN Web에 연결하는 격리 fixture; 기존 폰트/아이콘·네이티브 재질 fallback 사용 |
| `scripts/check-ambient-account-cloud.mjs` | 기준 SHA/현재 렌더, 30개 합성 사례, 스크롤/크기/번역/콜백 및 비교 PNG·JSON 생성 |

최신 결정 우선: 원본 M1은 열린 관리 행이지만, 10/10에 확정된 **세 관리 항목을 하나의 실제 Glass 묶음으로 구성**하는 결정을 유지했다. 원본의 예시 계정 안내 대신 기존 저장 기능 안내와 실제 권한/계정 상태, 오른쪽 상태값을 보존했다. 설정값·계정 gate·경로·기능·정책 내용은 유지했다.

홈 및 날씨/코디/목적지 모델, 누락 기온과 실제 0도, 오늘 남은 시간 판단, 선택 목적지/시각, stale/예보 부재, 홈 복귀, 비홈 배경 정지, 숨김 경로, 위젯/Live Activity, Swift/Objective-C 네이티브 코드 및 Android 구현은 수정하지 않았다. 공유 컴포넌트의 새 표현은 iOS의 명시적 opt-in으로 제한했다. 새 환경 루프·햅틱·의존성·서비스 호출 없음. 추가한 M1/M3 표면은 날씨 의미와 무관한 정적 재료다.

## 검사와 재현

PASS: mobile TypeScript noEmit, diff whitespace, my-departure-interactions, codi-interactions, weather-outfit-regressions, today-outfit, home-return, home-outing, native-navigation, destination-labels/limit, ambient-surface-regressions, ambient-response, account-auth(격리된 합성 서비스), correctness-batch, review-regressions, localization-native-exports(98 consumers), mobile-localization(KO/EN/JA 2178 messages). 실제 iOS switch effect는 Reduce Motion 활성/미확인에서 애니메이션 없이 정착함을 확인했다.

클라우드 PASS: **30 렌더 = 기준 4 + 현재 26**. 두 화면 × light/dark, 390×844·440×956 기본 글자, 320×568 영문 1.6배/일문 2배, 투명도 감소, 게스트/약관/연결, 위치·알림 확인 상태. 이미지 로드·JS 오류·가로 넘침·44px 미만 조작 영역·끝 항목 접근, 합성 계정/관리/설정 콜백을 검사했다. 설정 선택값/스위치 변경은 fixture 안에서만 반영하며 저장소/실서비스를 사용하지 않는다.

| 기본 390×844 합성 렌더 | 가용 본문 높이 | 수정 전 콘텐츠 | 수정 후 콘텐츠 |
| --- | ---: | ---: | ---: |
| M1 light/dark | 697px | 714px | 697px |
| M3 light/dark | 697px | 716px | 697px |

초기 확대 영문 검사에서 테마 항목의 가로 넘침을 발견하여 세로 선택지로 해결했다. 초기에 RN Web이 RN accessibilityState를 DOM 속성으로 전달하지 않아 콜백 후 검사 대기가 실패했다. fixture 어댑터에 그 매핑을 추가하고 최종 검사에서 통과했다. 앱의 native accessibilityState는 기존 코드 그대로다. 이 매핑 통과는 UIKit/VoiceOver 검증이 아니다.

재현: 기존 저장소 의존성과 Chromium이 있는 환경에서

```sh
node scripts/build-ambient-account-art.mjs --check
node scripts/check-ambient-account-cloud.mjs /tmp/weatheron-ambient-account-cloud
# 1차 렌더 폴더가 있으면 세 번째 인자로 지정하여 completion 비교도 생성
# Chromium 경로가 다르면 CHROMIUM_PATH를 지정
```

생성물: `completion-M1-light/dark.png`, `completion-M3-light/dark.png`는 승인 원본/1차 수정/최종 수정이며, `comparison-M1-light/dark.png`, `comparison-M3-light/dark.png`, 각 합성 사례의 화면/큰 글자 마지막 화면 PNG, `results.json`. 1차 생성물 `/workspace/weatheron-cloud-review-final/`을 보존했다. 최종 결과는 저장소 밖 `/workspace/weatheron-cloud-review-depth/`에 있다. 개인정보·비밀값·실제 계정/장소/기기 로그를 사용하지 않았다. 원본 PNG/승인 자산은 변경하지 않았다.


## 최종 깊이 대조와 검사

1차 비교 후 첫 라이트 깊이 후보가 원본보다 푸른 그림자를 과하게 만들었다. 밝은 바탕/곡면/경계/그레인을 함께 조정하고 최종 30 렌더를 다시 실행했다. 단순 검정/흰 gradient를 하나 덧씌운 변경이 아니다. M1/M3의 정적 PNG를 실제 JSX에서 합성해 원본·1차·최종 비교로 확인했다.

기능·본문·보조 글자의 모든 배경 픽셀 대비 최저값: light **5.83:1**, dark **7.62:1**. 이는 생성 PNG의 불투명 픽셀과 역할 글자색 계산이며 UIKit Glass 합성 대비/전체 접근성 인증이 아니다. 생성 스크립트 --check로 소스 SVG 및 PNG 3개가 결정적으로 바이트 재현됨을 확인했다.

배경만 있는 오른쪽 여백의 평균 RGB 거리(등록되지 않은 보드/viewport, 탐색 지표): M1 light 12.29→2.91, dark 12.47→2.55; M3 light 7.44→2.59, dark 18.45→9.26. light 명암 범위는 1차 2.67에서 최종 10.67로, 원본 약 9.67–10.33에 가까워졌다. dark 최종 범위 14는 원본 약 9.33–10.33보다 크다. 전체 그림의 유사도 점수나 실기기 측색이 아니라, 육안 대조를 보조하는 배경 여백 샘플이다. `surface-margin-comparison.json`에 경계와 수치를 보존했다.

최종 source check 19개(타입·관련 회귀·번역·자산 재현·공백) 및 cloud render 30개 PASS. 현재 `source-check-results.json`/`results.json`에 기록했다. 최초 require 상대 경로와 Image pointerEvents의 타입 문제를 수정한 뒤 통과한 최종 소스다. 커밋·푸시·PR·빌드·설치·Library 업로드 재시도 없음.

## 다음 제안: M4 앱 권한 · A4 계정 관리

같은 06-settings-ios-light/dark-v3 원본과 현재 M4/A4 실제 JSX 합성 렌더 4개를 확인했다. 이 두 화면의 코드는 수정하지 않았고 권한 요청·로그아웃·탈퇴·설정 변경을 실행하지 않았다. `/workspace/weatheron-next-account-audit/proposal-M4-light/dark.png`, `proposal-A4-light/dark.png`는 합성 상태다.

- M4: 원본은 아이콘+제목+상태 뒤 본문/보조/행동이 정렬된 두 권한 영역이다. 현재 알림 본문이 아이콘 옆의 좁은 copy에 걸려 줄바꿈하며, helper 좌측 기준선이 분리된다. 제목 21pt와 작은 상태 pill, 둥글지 않은 넓은 버튼의 무게도 원본과 다르다. 정보/버튼을 지우지 않고 권한 영역의 기준선·윤곽 아이콘·상태/행동 위계를 맞추는 묶음을 제안한다.
- A4: 원본의 원형 계정 표면·정책 문서 윤곽·열린 구분선 대신 작은 계정 실루엣과 구형 정책 아이콘, 압축된 정책/위험 행동이 남아 있다. 현재 제목은 1줄·메타/결과는 2줄 제한이 있어 큰 글자·장문 상태에서 원본 대비 확인이 필요하다. 연결/필수 약관/오프라인/처리중 상태와 로그아웃·탈퇴의 기존 확인 guard를 보존하는 조건으로 재구성을 제안한다.

두 화면의 단순 스킨 교체나 위험 행동 실행을 다음 목표로 삼지 않는다. 후속 승인이 있으면 원본/현재 light-dark 및 큰 글자 대조를 먼저 보고하고 제한된 묶음으로 이어간다.

## 남은 차이와 Mac 인계

- 표면은 원본의 넓은 곡면/얇은 밝은 경계/부드러운 그림자/균형 잡힌 미세 질감을 코드로 재구성했다. 두 고정 PNG(512×1100)는 resize stretch로 화면 비율에 대응하며 runtime 생성·타이머·반복 tile·센서·움직임이 없다. 이미지당 디코드 2.15 MiB, PNG 두 개 합계 약 914 KiB다. 패키지 내 로컬 이미지이며 테마별 동일 source는 캐시를 재사용한다. 실제 iPhone 할당/스크롤 성능은 미검증이다.
- 투명도 감소에서 이미지와 gradient를 제거하고 theme.background만 남긴다. 모션/저전력에서 가동할 루프가 없으며 기존 Home 정책은 변경하지 않았다. 이미지의 부모 View는 touch/focus를 소유하지 않는다.
- 정책 문서는 확정 세트와 같은 24×24·fill none·1.75 stroke·round cap/join 문법으로 작성했다. 원본의 접힌 모서리/문서 세 줄을 재현하고 96×96 PNG를 파생해 기존 Image tint와 iOS 정책 행에 연결했다. 이 신규 코드 벡터가 기존 승인 ZIP에 들어 있었다고 주장하지 않는다. Android와 다른 화면은 기존 자산을 유지한다.
- 원본은 생성된 정적 시안이므로 세부 곡률·입자 위치의 완전 픽셀 일치는 여전히 아니다. iPhone의 실제 Glass 합성과 질감 밀도는 별도 확인이 필요하다.
- 계정 영역과 행 크기는 기본 화면 접근을 위해 반응형으로 조정했다. 원본의 모든 비율/여백을 픽셀 단위로 복제한 것은 아니다. 기존 기능 버튼 색·상태 의미를 유지했다.
- RN Web에는 UIKit `UIGlassEffect`가 없으므로 실제 Glass가 아닌 기존 불투명 fallback으로 검사했다. safe area 59px/하단 88px는 fixture의 가정이며 실제 탭과 네이티브 헤더를 렌더하지 않았다. fontScale은 텍스트 크기 시뮬레이션이다. 실제 Dynamic Type·VoiceOver·터치·햅틱·성능·저전력 검증이 아니다.

Mac에서 나중에 확인할 항목: light/dark 실제 네이티브 재질과 버튼색/대비, 기본 기기 첫 화면과 작은 화면·Dynamic Type의 모든 기능 접근, 계정/권한 상태별 실제 push-pop, VoiceOver 순서·선택/스위치 상태, Reduce Motion/Transparency 및 저전력, iPhone의 눌림과 기존 의미 있는 선택/완료 햅틱 정책. 계정·권한·저장소 설정을 보존하는 검증으로 이어가야 한다.

이번 Xcode 빌드·아이폰 설치·미러링·실제 햅틱은 수행하지 않았다. 위젯/Live Activity 전용 시안과 나머지 화면의 시각 완료는 별도 잔여다.

인계 diff: `/workspace/weatheron-ambient-account-20261011-depth.patch` 및 `.sha256`. 기준 SHA의 깨끗한 임시 디렉터리에 `git apply --check` 후 적용하여 18개 파일 바이트 일치를 확인했다. 초기 1차 patch와 비교 폴더도 보존했다. Library 저장은 승인된 업로드 경로의 네트워크 403으로 완료되지 않았으며 저장 ID가 없다. 재시도·우회 없이 로컬 파일로 인계한다.
