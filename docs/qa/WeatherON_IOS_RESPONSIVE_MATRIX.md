# WeatherON iOS 반응형 QA 매트릭스

기준일: 2026-07-25

## 화면 등급

| 기준 기기 | 논리 해상도(pt) | 너비 등급 | 높이 등급 | 적용 기준 |
| --- | ---: | --- | --- | --- |
| iPhone SE 3세대 | 375 × 667 | compact | short | 좌우 16pt, 시작 화면 축소 |
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

| 우선순위 | 화면군 | Route | 주요 위험 | SE3 | 17e | Pro Max | iPad mini |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | 진입·앱 소개 | A1, O1 | 고정 높이, 하단 CTA | 통과 | 통과 | 통과 | 부분 |
| P0 | 온보딩 핵심 | O2, O7, O3, O4, O5, O6 | 긴 설명, 선택 카드, 권한 CTA | 통과 | 통과 | 통과 | 부분 |
| P0 | 홈·날씨 | H1, H2, H3, H4, H5, H6, H7 | 카드 밀도, 사이드 패널, 차트 | 통과 | 통과 | 통과 | 부분 |
| P0 | 코디·옷장 | C1, C2, C3, C4 | 2열 카드, 이미지 비율, 상세 CTA | 통과 | 통과 | 통과 | 부분 |
| P0 | 목적지 | G1, G2, P1 | 검색 결과, 시간 선택, 고정 CTA | 대기 | 대기 | 대기 | 대기 |
| P0 | MY·설정 | M1, M2, M3, M4 | 설정 행, 스위치, 하단 내비게이션 | 대기 | 대기 | 대기 | 대기 |
| P1 | 계정·약관 | A2, A3, A4, R1, R2 | 폼, 긴 문서, 고정 CTA | 부분 | 부분 | 부분 | 대기 |
| P1 | 확장 목적지 | G3, G4, G5, G6, P2, P3 | 긴 폼, 프리미엄 카드 | 대기 | 대기 | 대기 | 대기 |
| P2 | 날씨 제보 | W1, W2, W3, W4 | 입력 폼, 완료 상태, 이력 | 대기 | 대기 | 대기 | 대기 |
| P2 | 광고 정책 | R3, R4 | 출시 숨김 화면 | 대기 | 대기 | 대기 | 대기 |

## 현재 적용 범위

| 영역 | 적용 내용 |
| --- | --- |
| 공통 AppScreen | 좌우 여백 반응형 처리, tablet 최대 폭 680pt, 고정 footer 폭 제한 |
| 시작 화면 | 아이콘·워드마크·문구·배경 곡면을 너비/높이 등급별 조정 |
| iOS BottomNav | 기기 등급별 좌우 여백, tablet 최대 폭 680pt |
| 온보딩 O2~O7 | short 대표 이미지·카드 높이 축소, regular 여백·이미지 확대, 44pt 선택 버튼 유지 |
| 홈·날씨 H1~H7 | short 히어로·날씨 패널·차트 축소, regular/tablet 최대 폭 제한, H7 세로 스크롤, 44pt 조작부 유지 |
| 코디·옷장 C1~C4 | SE3 카드 2열, 일반 iPhone 3열, tablet 기준 4열, 이미지 높이·C4 저장 footer·44pt 필터 조정 |
| 계정·약관 A2·A3·A4·R1·R2 | 연결 방법·동의 행·위험 동작·정책 목록·긴 문서의 높이·여백·최대 폭과 44pt 조작부 조정 |
| 개별 화면 | 목적지·MY·확장 목적지 고정 높이·2열 카드 최적화는 브랜치 통합 순서에 맞춰 후속 적용 |

## 현재 검증 증거

| 기기 | 결과 | 증거 |
| --- | --- | --- |
| iPhone SE 3세대 | compact/short 네이티브 렌더링 통과 | `/tmp/weatheron-responsive-after-se3.png` |
| iPhone 17e | compact/standard 네이티브 렌더링 통과 | `/tmp/weatheron-responsive-after-17e.png` |
| iPhone 17 Pro Max | regular/standard 네이티브 렌더링 통과 | `/tmp/weatheron-responsive-after-promax.png` |
| iPad mini | iPhone 호환 창 렌더링 통과, 정식 iPad 전체 화면 미지원 | `/tmp/weatheron-responsive-after-ipadmini-clean.png` |
| iPhone SE 3세대 온보딩 | O2~O7 compact/short 네이티브 렌더링 통과 | `/tmp/weatheron-o2-se3.png` ~ `/tmp/weatheron-o7-se3-clean.png` |
| iPhone 17e 온보딩 | O2~O7 compact/standard 네이티브 렌더링 통과 | `/tmp/weatheron-o2-17e.png` ~ `/tmp/weatheron-o7-17e-clean.png` |
| iPhone 17 Pro Max 온보딩 | O2~O7 regular/standard 네이티브 렌더링 통과 | `/tmp/weatheron-o2-promax-clean.png` ~ `/tmp/weatheron-o7-promax.png` |
| iPhone SE 3세대 홈·날씨 | H1~H7 compact/short 네이티브 렌더링 통과 | `/tmp/weatheron-h1-se3.png` ~ `/tmp/weatheron-h7-se3.png` |
| iPhone 17e 홈·날씨 | H1~H7 compact/standard 네이티브 렌더링 통과 | `/tmp/weatheron-h1-17e.png` ~ `/tmp/weatheron-h7-17e-late.png` |
| iPhone 17 Pro Max 홈·날씨 | H1~H7 regular/standard 네이티브 렌더링 통과 | `/tmp/weatheron-h1-promax.png` ~ `/tmp/weatheron-h7-promax.png` |
| iPhone SE 3세대 코디·옷장 | C1~C4 compact/short 네이티브 렌더링 통과 | `/tmp/weatheron-c1-se3.png` ~ `/tmp/weatheron-c4-se3.png` |
| iPhone 17e 코디·옷장 | C1~C4 compact/standard 네이티브 렌더링 통과 | `/tmp/weatheron-c1-17e.png` ~ `/tmp/weatheron-c4-17e.png` |
| iPhone 17 Pro Max 코디·옷장 | C1~C4 regular/standard 네이티브 렌더링 통과 | `/tmp/weatheron-c1-promax.png` ~ `/tmp/weatheron-c4-promax.png` |
| iPhone SE 3세대 계정·약관 | A2·A3·A4·R1·R2 375 × 667 웹 뷰포트 렌더링 부분 통과 | `/tmp/weatheron-a2-se3-web.png` ~ `/tmp/weatheron-r2-se3-web.png` |
| iPhone 17e 계정·약관 | A2·A3·A4·R1·R2 390 × 844 웹 뷰포트 렌더링 부분 통과 | `/tmp/weatheron-a2-17e-web.png` ~ `/tmp/weatheron-r2-17e-web.png` |
| iPhone 17 Pro Max 계정·약관 | A2·A3·A4·R1·R2 440 × 956 웹 뷰포트 렌더링 부분 통과 | `/tmp/weatheron-a2-promax-web.png` ~ `/tmp/weatheron-r2-promax-web.png` |

온보딩 화면은 GUI 입력이 없는 Xcode beta 환경에서 QA 전용 초기 route 번들을 사용해 직접 시작함. 검증 후 초기 route 분기는 소스에서 제거했으며 화면 렌더링·가로 잘림·고정 CTA 배치만 증거로 사용함.

홈·날씨 화면도 같은 방식의 QA 전용 route 번들로 직접 시작함. H1~H7 렌더링, 세로·가로 잘림, 하단 내비게이션 겹침을 확인했으며 실제 탭·스와이프 동작은 이번 증거 범위에 포함하지 않음. H3 예시 알림 카드의 비활성 삭제 배경 비침도 보정 후 재확인함.

코디·옷장 화면도 QA 전용 route 번들로 직접 시작함. C1~C4 헤더, 카드 열 수, 이미지 비율, C4 고정 저장 footer와 하단 내비게이션 분리를 확인했으며 필터 선택·저장·삭제 동작은 이번 증거 범위에 포함하지 않음.

계정·약관 화면은 QA 전용 초기 route와 실제 화면 이동을 함께 사용함. A2 추가 연결 방법, A3 전체 동의 상태, A4 로그아웃 확인 상태, R1에서 R2 문서 이동을 375·390·440pt에서 확인함. 검증 후 초기 route 분기는 소스에서 제거했으며 네이티브 실행은 이번 증거 범위에 포함하지 않음.

## 기록 규칙

- `통과`: 해당 기기 네이티브 실행과 화면 확인 완료
- `부분`: 정적 검사·웹 검증만 완료했거나 호환 모드만 확인함
- `실패`: 잘림, 접근 불가, 과도한 확장 중 하나 이상 재현
- `대기`: 아직 해당 기기에서 확인하지 않음
