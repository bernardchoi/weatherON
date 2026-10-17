# Ambient Surface M4·A4 — 승인 시안 대조와 클라우드 보완

기준 `02f68c1b5d7240b3e2b62728610c893715334edb`, 로컬 `codex/ambient-ui-polish-20261011`. 앞선 M1/M3 작업과 모든 산출물을 보존한 후 후속 승인 범위인 M4 앱 권한·A4 계정 관리만 추가로 재구성했다. root AGENTS.md의 반복 DOM/스크린샷 검사 조건에 따라 Chromium을 사용했다. 추가 저장소 .agents/skills는 없었다. 디자인 패키지 README, 10/10 계정·온보딩 QA 및 Ambient 빛·깊이 QA, 전용 방향/채택 문서를 다시 확인했다.

## 실제 픽셀 대조

승인 원본 `docs/design/ambient-surface-pages-20261009/WeatherON-04A-Account-iOS-20261009/images/06-settings-ios-light-v3.png`와 같은 폴더 `06-settings-ios-dark-v3.png`를 직접 열었다. 이전 제안용 실제 JSX 렌더와 현재 소스를 대조하고 수정 범위를 보고한 뒤 구현했다. 최종 원본/수정 전/후 비교와 확대 영문·일문 확인창 픽셀을 확인했다. 비교 보드는 원본의 해당 패널 폭만 390px로 정규화하고 비율을 유지했다. safe area·네이티브 header/tab 차이를 원본 픽셀 일치 판정으로 사용하지 않았다.

| 대조 축 | M4 확인된 차이와 수정 | A4 확인된 차이와 수정 |
| --- | --- | --- |
| 정렬·여백 | 본문이 아이콘 옆 좁은 copy에 끼고 helper 기준선이 달랐다. 아이콘/제목/상태 → 본문/보조 → 두 행동으로 분리하고 설명 시작선 44pt, 두 권한 영역의 열린 수평 구분선을 적용했다 | 작은 가로 계정 실루엣과 압축된 정책/위험 행동을 중앙 세로 계정 영역, 정책 구분선, 로그아웃 윤곽 버튼과 분리된 탈퇴 행동으로 정리했다 |
| 타이포·접근 | 헤더 26/34pt, 제목 18/26pt, 본문 16/24pt, helper·상태 14/21pt. 작은 화면/확대 글자에서 뒤로가기·제목 및 상태를 세로로 분리하며 본문은 전체 폭을 사용한다 | 헤더 26/34pt, 계정 제목 22/30pt, 안내 14/21pt. iOS 제목·메타·인증 결과의 줄 제한을 해제했다. 작은 화면/확대 글자에서는 헤더를 세로로 배치한다 |
| 표면·아이콘 | 기존 위치·벨 윤곽을 32pt로 표시하고, 전 묶음의 정적 곡면/그레인 배경을 재사용한다. 주 행동은 기존 기능색과 tonal 표면, 보조는 얇은 윤곽의 pill이다 | 80pt 원형 표면/48pt 계정 윤곽, 기존 계정 상태 dot/pill의 의미와 색을 유지. 정책·필수 약관 행은 전 묶음의 24-grid 코드 문서 윤곽 파생 자산을 재사용한다 |
| 위험 행동 위계 | 위치/알림 gate·기기 설정·수동 위치·알림 항목 기능을 모두 유지한다 | 정책은 정상 읽기 행, 로그아웃은 52pt 윤곽 버튼, 탈퇴는 위험색의 별도 48pt 행동. 기존 확인 단계와 경고 원문 유지. 확인창 전체를 스크롤 가능하게 하고 확대 글자에서 확인/취소를 세로로 배치한다 |

최신 결정 우선: 원본 A4는 가로 프로필이나 후속 지시의 중앙 계정 영역 규칙을 적용했다. 원본의 녹색 연결 dot를 그대로 복사하지 않고 실제 구현의 기능색/상태 의미를 유지했다. 원본 예시 문장과 현재 권한 설명의 문구 차이도 현재 의미를 유지했다. 두 권한/정책 행을 전부 Glass 카드로 만들지 않았으며 기존 뒤로가기·탭 등 선택적 Glass 표현을 유지한다. 새 자산·효과·서비스·의존성은 추가하지 않았다.

## 이번 추가 변경 파일

- `apps/mobile/src/screens/AppPermissionsScreen.tsx`: iOS 배치/타이포/버튼/피드백 및 반응형 상태 배치. 기본 화면 하단의 불필요한 42pt spacer를 iOS에서 제거하고 작은 화면/큰 글자의 스크롤 유지.
- `apps/mobile/src/screens/AccountManagementScreen.tsx`: iOS 중앙 계정/정책/위험 행동 재구성 및 긴 문장 읽기. 확인창은 iOS에서만 스크롤; Reduce Motion 활성/미확인 시 fade 없이 표시. 확인창 열기에는 iOS 자동 경고 햅틱을 제거했으며 새 햅틱 호출은 없다. 기존 의미 있는 성공/선택 정책을 수정하지 않았다.
- `apps/mobile/src/components/AppScreen.tsx`: A4가 선택하는 optional titleStyle/stackedHeader; 기본값 false/undefined로 다른 화면 유지.
- `apps/mobile/src/components/AmbientReadingSurface.tsx`: 고정 로컬 PNG 범위를 M1/M3에서 M4/A4까지 확장. Reduce Transparency에서는 기존 단색 fallback. 움직임·센서·루프 없음.
- `scripts/check-ambient-surface-regressions.mjs`: 네 화면의 표면 범위·투명도 감소·touch/focus 차단 검사.
- `scripts/build-ambient-account-cloud.mjs`: M4/A4 실제 JSX와 합성 상태 지원; OS·계정 callback은 메모리 기록만 수행한다.
- `scripts/check-ambient-permission-account-cloud.mjs`: 비교/크기/스크롤/번역/합성 권한 행동/확인창 열기·취소 검사.
- `scripts/check-permission-account-interactions.cjs`: 실제 JSX 함수의 권한 9개 상태, 계정 gate/위험 확인/처리 guard, 모션 18개 조합. 서비스는 inert mock이고 실제 클라이언트를 import하지 않는다.

앞선 M1/M3 파일·정적 자산·QA·렌더 및 기존 patch는 보존했다. 홈 레이아웃/복귀/날씨 정확성, 목적지·코디·stale/예보 부재, 비홈 배경 정지, 사용자 설정, 인증/권한 모델 및 실제 API/저장소/정책 문서는 변경하지 않았다. 숨김 route를 켜지 않았다. Android 표현과 행동 분기를 유지하며 Android 구현·검증 작업을 하지 않았다.

## 의미와 guard 보존

M4의 세 권한 copy 함수 전체를 기준 SHA와 바이트 대조해 동일함을 확인했다. 허용/요청 중/수동 위치/허용 필요/거부/나중에 설정/스마트 알림 중지 조건은 기존 그대로다. requesting primary disabled, location/notification gate의 M4/general 인자, 현재 위치 재확인, H2 수동 위치와 M2 알림 설정/항목, native OS 설정 연결, M1 복귀를 실제 JSX의 inert 경계로 검증했다.

A4의 로그아웃/탈퇴 경고 원문은 기준과 동일하다. 계정 미연결·필수 약관·연결·오프라인·오류·signing-in/out 상태, 필수 약관 gate와 R1 정책 경로를 유지했다. 확인창을 열거나 취소할 때 서비스 호출 0, 최종 확인의 동작 선택/처리 중 guard/닫기 guard는 실제 함수와 mock callback으로 검증했다. 클라우드 브라우저에서는 최종 위험 확인을 누르지 않고 두 확인창을 열고 취소했다. 실제 권한 변경·로그인/로그아웃·연결 해제·데이터 삭제는 전혀 실행하지 않았다.

## 검사·재현·한계

재현:

```sh
node scripts/check-permission-account-interactions.cjs
node scripts/check-ambient-permission-account-cloud.mjs /tmp/weatheron-permission-account-cloud
node scripts/check-ambient-account-cloud.mjs /tmp/weatheron-account-cloud
node scripts/build-ambient-account-art.mjs --check
```

초기 영문 확대에서 M4 header/상태가 가로 공간을 압박하는 것을 발견해 세로 배치로 수정했다. 픽셀 검토에서 확대 글자의 버튼 라벨이 세로로 표면 밖에 나오던 문제도 발견했다. M4 버튼 및 A4 세로 확인 행동에 intrinsic flex basis/padding을 적용해 내용만큼 높이를 확보했고, 조작 영역 안의 텍스트 경계 검사도 추가했다. DOM 모달 확인 타이밍은 고정 지연 대신 해당 확인창의 내용과 닫힘을 기다리도록 fixture를 보완했다. `needs=location`은 알림 허용 fixture이므로 M2로 이어지는 기존 동작을 검사하도록 기대값을 바로잡았다. 앱의 권한·계정 상태 함수를 이 검사 오류에 맞춰 변경하지 않았다.

클라우드는 실제 화면 JSX를 React Native Web로 연결한 합성 iOS Platform 검사다. 안전 영역 59/88px와 fontScale은 가정/크기 시뮬레이션이며 실제 native header/tab·UIKit Glass·Dynamic Type·VoiceOver·터치·햅틱·OS 설정 동작의 검증이 아니다. 공개 앱 자산·가상 상태만 사용했고 실제 사용자 개인정보·비밀값·기기 로그는 산출물에 없다.

남은 차이: A4의 중앙 세로 구성은 원본 가로 비율과 다르며 최신 지시에 따른 의도적 차이다. 표면의 세부 곡률/입자 위치 및 네이티브 재질의 완전 일치는 아니다. 라이트 정상 상태의 예시 파란/녹색을 구현 기능색으로 유지했다. 확대 글자는 한 화면에 억지로 넣지 않고 스크롤한다. 확인창의 원본 전용 위험 상태 시안은 이번 기본 보드에 없으므로 기존 의미/guard와 읽기·조작 접근을 기준으로 보완했다.

나중 Mac/iPhone 확인: 원형 계정/뒤로가기/탭의 실제 재질·색·대비, 기본·작은 화면·Dynamic Type의 끝 행동 접근, VoiceOver 순서와 상태/disabled/busy, 확인창 경고 전체 읽기/취소/처리중 닫기 guard, permission gate에서 돌아온 상태와 기기 설정 연결, 계정/약관/오프라인/오류 표현, Reduce Motion/Transparency와 저전력/메모리/스크롤 성능. 실제 위험 행동은 별도 테스트 계정과 승인 범위에서 확인해야 한다.

이번 Xcode 빌드·설치·미러링·실제 햅틱·커밋·푸시·PR·병합·배포 없음. Library 403을 우회하거나 업로드를 반복하지 않았고 로컬 파일로 인계한다. 위젯·Live Activity 전용 디자인은 별도 잔여다.

## 최종 검사 결과와 누적 인계

PASS: **22개 소스 검사** — mobile TypeScript noEmit, M4/A4 실제 JSX 상호작용, 계정 region/provider font, My/Departure·Codi·weather/today outfit·Home return/outing·native navigation·destination labels/limit·Ambient surface/response·account-auth(격리 synthetic)·correctness/review 회귀, native localization exports 98 consumers, KO/EN/JA catalog 2178 messages, 정적 자산 바이트/대비 재현, diff whitespace. 기록은 `/workspace/weatheron-permission-account-final-source-checks/results.json`이다.

PASS: **M4/A4 44 렌더(기준 4 + 현재 40)**, 두 화면 light/dark와 390×844·440×956 기본 글자, 320×568 기본/EN 1.6배/JA 2배, Reduce Transparency, 권한 requesting/manual/denied location/denied notification/skipped/paused/ready/needed, 계정 guest/terms/connected/offline/error/signing-in/out. JS 오류·이미지 로드·가로 넘침·버튼 안의 텍스트 경계·44px 조작·마지막 행동 접근과 두 위험 확인창의 경고/스크롤/취소를 검사했다. 원본/기준/최종 비교는 `/workspace/weatheron-permission-account-final-expanded/comparison-M4-light/dark.png`, `comparison-A4-light/dark.png`, 개별 확대/끝 화면 및 확인창 PNG, `results.json`에 있다. 초기 후보 폴더도 보존했다.

M1/M3도 최종 공유 컴포넌트로 **30 렌더(기준 4 + 현재 26)** 재검사하여 PASS. `/workspace/weatheron-account-cumulative-cloud/`에 기록했다. 총 74는 합성 사례 수이며 화면/상태 전체 QA 완료 수치가 아니다.

| 기본 390×844 | 기준 콘텐츠/가용 본문 | 최종 콘텐츠/가용 본문 |
| --- | --- | --- |
| M4 light/dark | 702/697px | 697/697px |
| A4 light/dark | 697/697px | 697/697px |
| M1 light/dark | 714/697px | 697/697px |
| M3 light/dark | 716/697px | 697/697px |

누적 기준 SHA 대비 **24개 파일**: 앞선 M1/M3 18개에 이번 AppScreen·M4·A4·두 검사 script·본 QA 6개 추가. `/workspace/weatheron-ambient-account-cumulative-20261011.patch`와 `.sha256`으로 인계한다. 기준 SHA 파일을 깨끗한 임시 디렉터리에 읽어 구성한 뒤 `git apply --check` 및 실제 적용으로 24개 파일의 바이트 일치를 확인했다. 스테이징/커밋/푸시 없이 worktree diff 그대로다. 기존 1차/깊이 patch와 비교 자료는 유지했다.
