# iOS Ambient Surface — 코디·상세·마이 1차 적용

기준 HEAD: 48087358083455041d09865c596db9782f50ba63. 승인된 첫 묶음만 적용. 커밋·푸시 없음.

## 기준과 범위

승인 패키지 README, core iOS light/dark v3, 코디 상세 light v2의 실제 픽셀과 Final v1 아이콘 기준을 대조했다. Project Wind의 WeatherON 방향서·채택 범위와 최신 Home/코디 온도 QA도 읽었다. 초기 실험 문서보다 후속 사용자의 명시적 적용 승인과 최신 Home 확정 레이아웃을 우선한다.

- iOS C1/C4/M1에만 Ambient reading 팔레트와 정적인 넓은 빛결을 연결. 루트 safe-area, native stack, scroll, 탭 래퍼를 연결했다. Home 환경·날씨·터치 애니메이션은 복제하지 않는다. 읽기 표면은 타이머·터치 가로채기·접근성 요소가 없으며 Reduce Transparency 시 단색이다.
- C1은 기존 추천 결과 그대로, 톤 이미지 박스를 제거하고 이미지/이름/준비 문장/시간 조언의 간격을 조정. 기존 코디 상세·우산·옷장·스타일 진입을 유지한다.
- C4는 이미지 → 보유/추가 준비 → 시간별 조언 → 날씨 근거 → 저장 순서. 시간 조언과 근거는 넓은 행이며 중첩 카드 대신 구분선 사용. 좁은 폭 또는 큰 글자에서는 의류를 두 열로 표시한다. 계정 게이트, 품목 유보, 누락/실제 0도/기온 대체/stale 정책은 유지한다.
- M1 계정 영역은 중앙 세로형. 실제 게스트/약관 미완료/연결 완료 상태의 제목·설명·버튼/경로를 보존한다. 기존 인증 공급자 버튼과 인증 로직은 변경하지 않았다. 관리 목록은 선형 아이콘과 행 중심으로 정리했다.
- Home 소스와 실제 UIKit Glass 패널, 워드마크, 홈 복귀용 persistent 환경 레이어의 구현은 변경하지 않았다. Android는 기존 분기를 유지. 옷장·아이템 추가·계정 연결 화면 등 하위 화면 본문은 다음 묶음이다. 숨김 경로 활성화, 새로운 기능·의존성·권한·원격 비용 없음.

## 검사

PASS: mobile TypeScript noEmit, today-outfit(실제 어댑터 존재 플래그/실제 0/누락/기온 대체/stale 및 실제 상세 근거 함수), weather-outfit-regressions, home-outing, home-return, home-ambient-host, native-navigation, localization-native-exports(96), KO/EN/JA catalog(2176), diff whitespace.

Ambient 회귀는 기존 Home 검사를 유지하며 새 reading 컴포넌트를 실제 RN gradient parser로 light/dark 및 투명 효과 줄이기 네 조합 검사. 배경 장식이 터치/접근성 트리에 들어가지 않음도 확인. 보수적 광색 합성 대비: light 본문16.34/보조7.02/기능6.37, dark 본문12.23/보조8.06/기능9.06. 실제 색공간 합성 측정을 대체하지 않는다.

실제 My JSX를 네이티브 경계 mock으로 실행하여 light/dark × 게스트/약관 미완료/연결 완료의 기존 account-connect 게이트 또는 A4 관리 경로, 버튼 하나 및 설정행 네 개를 확인했다. 이 검사는 화면 픽셀이나 인증 서비스 성공을 뜻하지 않는다.

기존 native-navigation 검사는 이번 변경 전 추가된 onLayout 속성과 policyDocumentReturnRoute 인자를 반영하지 않아 실패했다. 검사 정규식과 실행 fixture 인자를 현재 계약에 맞춘 후 통과. 앱의 탐색 정책은 수정하지 않았다.

## 빌드와 직접 기기 확인

기존 Xcode27·DerivedData·프로파일, ARM64 jobs1. 일반 프로젝트 복사로 시작한 최초 시도는 위젯 WeatherKit entitlement/기존 프로파일 불일치로 컴파일 전 중단. 새 프로파일을 만들지 않고 기존 ../evidence/native-build-config의 QA 프로젝트를 정확히 복원했다. 이후 증분 빌드·서명 확인·데이터 보존 설치 성공. 첫 직접 관찰에서 C4 시간/근거 열이 좁아진 것을 발견해 레이아웃을 보완한 뒤 변경분을 다시 증분 빌드·설치했다. 동시/중복 빌드 없음.

최종 bundle SHA256: dd2b581d65fd60bb5e2f4eeaacec1da0dcbfe6bd8811d3d928f586976ba74de0.

현재 기기의 다크 설정을 유지하고 iPhone 미러링 정상 UI로 확인:
- Home → C1 → C4, 의류 이미지의 상세 진입, 상세 뒤로 및 탭 복귀, M1 → Home.
- C1 사진·이름·주요 행동, C4 이미지·보유 설명·넓은 시간 행·근거·저장/옷장 버튼을 스크롤 끝까지 관찰. 새 구조의 좁은 열 문제 해소.
- M1의 실제 연결 완료 상태와 중앙 계정 영역, 관리 목록 표시. 실제 로그인/연결 해제/저장/데이터 삭제를 실행하지 않았다.
- Home 복귀 시 기존 기온/작은 날씨 아이콘/체감/최고최저, 목적지 준비와 Glass, 홈 전용 워드마크 유지. 사적 위치와 목적지 이름은 문서에 복제하지 않는다.
- 일반 개발 경고 배너는 UI의 닫기 버튼으로 닫았다. 소스에서 경고를 숨기지 않았다.

실기기 미검증: 라이트, 큰 글자, VoiceOver, Reduce Motion/Transparency 설정을 켠 상태, 누락/stale/빈 응답 강제 주입, 전체 제스처와 프레임 단위 성능. 기기 설정/권한과 테마 override를 변경하지 않았다. 정지 화면 관찰과 자동 회귀를 실제 체감 전체 PASS로 확대하지 않는다. 승인 PNG와 완전한 질감/픽셀 일치 또는 31개 화면 전체 적용 완료가 아니다.

로그와 상태 검사: Git 밖 ../evidence/ambient-codi-my-20261010/. 이번 임시 node_modules 링크와 DeviceQA 프로젝트 복사본은 종료 시 제거한다.
