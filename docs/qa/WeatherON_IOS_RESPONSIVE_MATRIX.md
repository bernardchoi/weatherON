# WeatherON iOS 반응형 QA 매트릭스

기준일: 2026-07-26

## 화면 등급

| 기준 기기 | 논리 해상도(pt) | 너비 등급 | 높이 등급 | 적용 기준 |
| --- | ---: | --- | --- | --- |
| iPhone SE 3세대 | 375 × 667 | narrow | short | 좌우 16pt, 시작 화면 축소 |
| iPhone 12/13 mini | 375 × 812 | narrow | standard | 좌우 16pt, 2열 카드·가로 액션 밀도 완화 |
| iPhone 17e | 390 × 844 | compact | standard | 좌우 20pt |
| iPhone 17 Pro Max | 440 × 956 | regular | standard | 좌우 28pt, 시작 화면 확대 |
| iPad mini | 744 × 1133 | regular/tablet | standard | 정식 iPad 지원 시 좌우 32pt, 콘텐츠 최대 680pt |

공통 분기값은 `apps/mobile/src/theme/responsiveLayout.ts`를 단일 기준으로 사용함.

현재 배포 설정은 `supportsTablet: false`, Xcode `TARGETED_DEVICE_FAMILY = 1`로 iPhone 전용임. iPad mini에서는 iPhone 호환 창만 검증하며 정식 iPad 전체 화면 검증과 구분함.

## 통과 조건

- 가로 잘림과 의도하지 않은 가로 스크롤 없음
- 상단·하단 안전 영역 침범 없음
- 마지막 콘텐츠와 고정 CTA 접근 가능
- 하단 내비게이션 아이콘·라벨 잘림 없음
- 주요 터치 영역 44 × 44pt 이상 유지
- compact에서 핵심 문구와 버튼이 첫 화면에 표시됨
- regular/tablet에서 콘텐츠가 과도하게 늘어나지 않음
- 큰 글씨와 가로모드는 별도 접근성 단계에서 재검증

## 화면군 매트릭스

| 우선순위 | 화면군 | Route | 주요 위험 | SE3 | mini | 17e | Pro Max | iPad mini |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | 진입·앱 소개 | A1, O1 | 고정 높이, 하단 CTA | 통과 | 부분 | 통과 | 통과 | 부분 |
| P0 | 온보딩 핵심 | O2, O7, O3, O4, O5, O6 | 긴 설명, 선택 카드, 권한 CTA | 통과 | 부분 | 통과 | 통과 | 부분 |
| P0 | 홈·날씨 | H1, H2, H3, H4, H5, H6, H7 | 카드 밀도, 사이드 패널, 차트 | 부분 | 부분 | 부분 | 통과 | 부분 |
| P0 | 코디·옷장 | C1, C2, C3, C4 | 2열 카드, 이미지 비율, 상세 CTA | 통과 | 부분 | 통과 | 통과 | 부분 |
| P0 | 목적지 | G1, G2, P1 | 검색 결과, 시간 선택, 고정 CTA | 대기 | 부분 | 대기 | 대기 | 대기 |
| P0 | MY·설정 | M1, M2, M3, M4 | 설정 행, 스위치, 하단 내비게이션 | 대기 | 부분 | 대기 | 대기 | 대기 |
| P1 | 계정·약관 | A2, A3, A4, R1, R2 | 폼, 긴 문서, 고정 CTA | 부분 | 부분 | 부분 | 부분 | 대기 |
| P1 | 확장 목적지 | G3, G4, G5, G6, P2, P3 | 긴 폼, 프리미엄 카드 | 대기 | 대기 | 대기 | 대기 | 대기 |
| P2 | 날씨 제보 | W1, W2, W3, W4 | 입력 폼, 완료 상태, 이력 | 대기 | 대기 | 대기 | 대기 | 대기 |
| P2 | 광고 정책 | R3, R4 | 출시 숨김 화면 | 대기 | 대기 | 대기 | 대기 | 대기 |

## 현재 적용 범위

| 영역 | 적용 내용 |
| --- | --- |
| 공통 AppScreen | narrow 375pt 이하 좌우 16pt, 일반 compact 20pt, tablet 최대 폭 680pt, 고정 footer 폭 제한 |
| 시작 화면 | 아이콘·워드마크·문구·배경 곡면을 너비/높이 등급별 조정 |
| iOS BottomNav | 기기 등급별 좌우 여백, tablet 최대 폭 680pt |
| 온보딩 O2~O7 | short 대표 이미지·카드 높이 축소, regular 여백·이미지 확대, 44pt 선택 버튼 유지 |
| 홈·날씨 H1~H7 | H1은 기기 높이에 따라 compact/regular 요약 밀도를 분리, short 히어로·날씨 패널·차트 축소, regular/tablet 최대 폭 제한, H7 세로 스크롤, 44pt 조작부 유지 |
| 코디·옷장 C1~C4 | C1은 SE3 한 줄 아이템 요약·mini/17e/Pro Max 2열 카드로 한 페이지 맞춤, C2~C4는 SE3·mini 카드 2열, 일반 iPhone 3열, tablet 기준 4열, 이미지 높이·C4 저장 footer·44pt 필터·소형 버튼 조정 |
| 계정·약관 A2·A3·A4·R1·R2 | 연결 방법·동의 행·위험 동작·정책 목록·긴 문서의 높이·여백·최대 폭과 44pt 조작부 조정 |
| MY·설정 표시 설정 | `GlobalSettingsScreen` 세그먼트 버튼(단위·테마 전환)이 34pt로 44pt 미만이던 것을 확인해 컨트롤 높이 52pt·옵션 44pt로 조정 |
| 개별 화면 | 목적지·MY·확장 목적지의 SE3·17e·Pro Max·iPad mini 네이티브 검증은 브랜치 통합 순서에 맞춰 후속 적용 |

## 현재 검증 증거

| 기기 | 결과 | 증거 |
| --- | --- | --- |
| iPhone SE 3세대 | narrow/short 네이티브 렌더링 통과 | `/tmp/weatheron-responsive-after-se3.png` |
| iPhone 12/13 mini | narrow/standard 375 × 812 웹 뷰포트에서 H1·H3·C1~C4·G1·G2·P1·M1~M4·A2·A4·R1·R2·O1~O5 렌더링·375pt 문서 폭·44pt 터치 영역 부분 통과, 자동화 스크립트(overflow/터치 영역) 이상 없음 | `/tmp/weatheron-iphone-mini-home.png` ~ `/tmp/weatheron-iphone-mini-p1.png` (`npm run check:android-small-screen-layout` + 보조 스크립트 캡처) |
| iPhone 17e | compact/standard 네이티브 렌더링 통과 | `/tmp/weatheron-responsive-after-17e.png` |
| iPhone 17 Pro Max | regular/standard 네이티브 렌더링 통과 | `/tmp/weatheron-responsive-after-promax.png` |
| iPad mini | iPhone 호환 창 렌더링 통과, 정식 iPad 전체 화면 미지원 | `/tmp/weatheron-responsive-after-ipadmini-clean.png` |
| iPhone SE 3세대 온보딩 | O2~O7 narrow/short 네이티브 렌더링 통과 | `/tmp/weatheron-o2-se3.png` ~ `/tmp/weatheron-o7-se3-clean.png` |
| iPhone 17e 온보딩 | O2~O7 compact/standard 네이티브 렌더링 통과 | `/tmp/weatheron-o2-17e.png` ~ `/tmp/weatheron-o7-17e-clean.png` |
| iPhone 17 Pro Max 온보딩 | O2~O7 regular/standard 네이티브 렌더링 통과 | `/tmp/weatheron-o2-promax-clean.png` ~ `/tmp/weatheron-o7-promax.png` |
| iPhone SE 3세대 홈·날씨 | H2~H7 narrow/short 네이티브 렌더링 통과, 현재 H1은 웹 뷰포트 증거로 갱신 | `/tmp/weatheron-h2-se3.png` ~ `/tmp/weatheron-h7-se3.png`, `/private/tmp/weatheron-ios-home-se3.png` |
| iPhone SE 3세대 현재 H1 | 375 × 667 웹 뷰포트에서 마지막 판단 카드 467pt, 하단 내비 기준 581pt, 가로 넘침·44pt 미만 조작부 없음 | `/private/tmp/weatheron-ios-home-se3.png` |
| iPhone 12/13 mini 현재 H1 | 375 × 812 웹 뷰포트에서 마지막 판단 카드 519pt, 하단 내비 기준 726pt, 가로 넘침·44pt 미만 조작부 없음 | `/private/tmp/weatheron-ios-home-mini.png` |
| iPhone 17e 홈·날씨 | H2~H7 compact/standard 네이티브 렌더링 통과, 현재 H1은 웹 뷰포트 증거로 갱신 | `/tmp/weatheron-h2-17e.png` ~ `/tmp/weatheron-h7-17e-late.png`, `/private/tmp/weatheron-ios-home-17e.png` |
| iPhone 17e 현재 H1 | 390 × 844 웹 뷰포트에서 마지막 판단 카드 607pt, 하단 내비 기준 758pt, 가로 넘침·44pt 미만 조작부 없음 | `/private/tmp/weatheron-ios-home-17e.png` |
| iPhone 17 Pro Max 홈·날씨 | H2~H7 regular/standard 네이티브 렌더링 통과, 현재 H1은 웹 뷰포트 증거로 갱신 | `/tmp/weatheron-h2-promax.png` ~ `/tmp/weatheron-h7-promax.png`, `/private/tmp/weatheron-ios-home-promax.png` |
| iPhone 17 Pro Max 현재 H1 | 440 × 956 웹 뷰포트에서 마지막 판단 카드 806pt, 하단 내비 기준 870pt, 가로 넘침·44pt 미만 조작부 없음 | `/private/tmp/weatheron-ios-home-promax.png` |
| iPhone 16 Pro Max 실기기 현재 H1 | Release 로컬 빌드 설치·실행 후 홈 요약 전체가 첫 화면과 하단 내비 위에 표시됨 | `/private/tmp/weatheron-ios-device-home-one-page.png` |
| iPhone SE 3세대 현재 C1 | 375 × 667 웹 뷰포트에서 내부 스크롤 0pt, 코디 CTA 454~468pt, 하단 내비 632~646pt로 한 페이지 표시 | `/private/tmp/weatheron-c1-iphone-se-3.png` |
| iPhone 12/13 mini 현재 C1 | 375 × 812 웹 뷰포트에서 내부 스크롤 0pt, 코디 CTA 656~670pt, 하단 내비 778~791pt로 한 페이지 표시 | `/private/tmp/weatheron-c1-iphone-mini.png` |
| iPhone 17e 현재 C1 | 390 × 844 웹 뷰포트에서 내부 스크롤 0pt, 코디 CTA 661~675pt, 하단 내비 810~823pt로 한 페이지 표시 | `/private/tmp/weatheron-c1-iphone-17e.png` |
| iPhone 17 Pro Max 현재 C1 | 440 × 956 웹 뷰포트에서 내부 스크롤 0pt, 코디 CTA 774~790pt, 하단 내비 922~935pt로 한 페이지 표시 | `/private/tmp/weatheron-c1-iphone-pro-max.png` |
| iPhone SE 3세대 코디·옷장 | C1~C4 narrow/short 네이티브 렌더링 통과 | `/tmp/weatheron-c1-se3.png` ~ `/tmp/weatheron-c4-se3.png` |
| iPhone 17e 코디·옷장 | C1~C4 compact/standard 네이티브 렌더링 통과 | `/tmp/weatheron-c1-17e.png` ~ `/tmp/weatheron-c4-17e.png` |
| iPhone 17 Pro Max 코디·옷장 | C1~C4 regular/standard 네이티브 렌더링 통과 | `/tmp/weatheron-c1-promax.png` ~ `/tmp/weatheron-c4-promax.png` |
| iPhone SE 3세대 계정·약관 | A2·A3·A4·R1·R2 375 × 667 웹 뷰포트 렌더링 부분 통과 | `/tmp/weatheron-a2-se3-web.png` ~ `/tmp/weatheron-r2-se3-web.png` |
| iPhone 17e 계정·약관 | A2·A3·A4·R1·R2 390 × 844 웹 뷰포트 렌더링 부분 통과 | `/tmp/weatheron-a2-17e-web.png` ~ `/tmp/weatheron-r2-17e-web.png` |
| iPhone 17 Pro Max 계정·약관 | A2·A3·A4·R1·R2 440 × 956 웹 뷰포트 렌더링 부분 통과 | `/tmp/weatheron-a2-promax-web.png` ~ `/tmp/weatheron-r2-promax-web.png` |

온보딩 화면은 GUI 입력이 없는 Xcode beta 환경에서 QA 전용 초기 route 번들을 사용해 직접 시작함. 검증 후 초기 route 분기는 소스에서 제거했으며 화면 렌더링·가로 잘림·고정 CTA 배치만 증거로 사용함.

홈·날씨 화면도 같은 방식의 QA 전용 route 번들로 직접 시작함. H1~H7 렌더링, 세로·가로 잘림, 하단 내비게이션 겹침을 확인했으며 실제 탭·스와이프 동작은 이번 증거 범위에 포함하지 않음. H3 예시 알림 카드의 비활성 삭제 배경 비침도 보정 후 재확인함.

현재 H1은 `npm run export:android-web` + 정적 서버(8094) + `WEATHERON_WEB_PREVIEW_URL=http://127.0.0.1:8094/ node /private/tmp/weatheron-check-ios-home-one-page.mjs`로 SE3·mini·17e·Pro Max 논리 해상도를 재검증함. 네 크기 모두 마지막 판단 카드가 하단 내비게이션 위에 남고 가로 넘침·44pt 미만 조작부·버튼 문구 잘림이 없었음. iPhone 16 Pro Max 실기기는 Xcode Release 로컬 빌드 후 설치·실행·스크린샷까지 확인함.

코디·옷장 화면도 QA 전용 route 번들로 직접 시작함. C1~C4 헤더, 카드 열 수, 이미지 비율, C4 고정 저장 footer와 하단 내비게이션 분리를 확인했으며 필터 선택·저장·삭제 동작은 이번 증거 범위에 포함하지 않음.

현재 C1은 `npm run export:android-web` + 정적 서버(8094) + `/private/tmp/weatheron-measure-c1.mjs`로 SE3·mini·17e·Pro Max 논리 해상도를 재검증함. 네 크기 모두 내부 스크롤 0pt로 측정했고, SE3는 첨부 레이아웃을 유지하되 추천 아이템을 한 줄 요약형 카드로 압축해 CTA를 하단 내비게이션 위에 고정함. 네이티브 실기기 재설치는 이번 증거 범위에 포함하지 않음.

계정·약관 화면은 QA 전용 초기 route와 실제 화면 이동을 함께 사용함. A2 추가 연결 방법, A3 전체 동의 상태, A4 로그아웃 확인 상태, R1에서 R2 문서 이동을 375·390·440pt에서 확인함. 검증 후 초기 route 분기는 소스에서 제거했으며 네이티브 실행은 이번 증거 범위에 포함하지 않음.

iPhone 12/13 mini는 375 × 812 웹 뷰포트에서 두 갈래로 검증함. `npm run export:android-web` + 정적 서버(8094) + `WEATHERON_SMALL_SCREEN_VIEWPORT=iphone-mini npm run check:android-small-screen-layout` 자동화로 H1, H3(알림 사이드바), G1(목적지 목록), G2(목적지 케어), M2(알림 설정), O1~O5(온보딩 스플래시~목적지 단계)의 가로 잘림·44pt 미만 터치 영역·중복 접근성 라벨을 점검했으며 레이아웃 관련 이상은 없음(동일 스크립트가 compact·large-phone에서도 실패하는 온보딩 문구 텍스트 불일치 7건은 콘텐츠 카피가 최신 화면과 어긋난 기존 이슈로 이번 반응형 작업과 무관함). 나머지 C1~C4, M1·M3·M4, A2·A4, R1·R2, P1은 In-app browser로 시드된 상태에서 직접 이동해 375pt 문서 폭과 44pt 터치 영역을 확인함. 이 과정에서 `GlobalSettingsScreen`의 표시 설정 세그먼트 버튼이 34pt로 44pt 기준에 못 미치는 것을 발견해 44pt로 수정함(수정 후 재검증 통과). A3(전체 동의 상태)와 네이티브 시뮬레이터 실행은 이번 환경에 iOS 시뮬레이터가 없어 후속 검증 대상으로 남음.

## 기록 규칙

- `통과`: 해당 기기 네이티브 실행과 화면 확인 완료
- `부분`: 정적 검사·웹 검증만 완료했거나 호환 모드만 확인함
- `실패`: 잘림, 접근 불가, 과도한 확장 중 하나 이상 재현
- `대기`: 아직 해당 기기에서 확인하지 않음
