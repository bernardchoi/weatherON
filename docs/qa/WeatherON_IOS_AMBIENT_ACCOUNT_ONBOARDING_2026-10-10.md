# iOS Ambient Surface — 계정·설정·정책·권한·온보딩 3차 적용

기준 HEAD: 48087358083455041d09865c596db9782f50ba63. Home와 앞선 두 묶음의 로컬 변경을 보존했다. 커밋·푸시 없음. 이번 설치·실기기 조작 없음.

## 출시 경로와 원본 대조

routes.ts의 출시 숨김 16개는 그대로 유지. 승인 패키지의 route-mode-index.csv와 실제 소스 연결을 대조했다. C1/C4/M1 및 G1/P1/G2/H2/H3/H4/H5/H6/H7/M2는 앞선 두 묶음이다.

| 이번 소스 적용 경로 | 실제 화면 | 승인 원본 |
| --- | --- | --- |
| M3/M4/A4 | 표시 설정 / 앱 권한 / 계정 관리 | 04A 06-settings-ios-light/dark-v3 |
| A2/A3 | 계정 연결 / 약관 동의 | 04A 06-account-consent-ios-light |
| R1/R2 | 정책 목록 / 정책 문서 | 04A 06-policy-ios-light |
| A1 | 보조 앱 진입 소개 | 05 07-onboarding-appendix-A1-all-modes |
| O1/O2/O7 | 시작 / 소개 / 코디 안내 | 05 07-onboarding-intro-ios-light |
| O3/O5/O6 | 권한 gate / 스마트 케어 / 목적지 설정 | 05 07-onboarding-care-ios-light-v2, permission-contexts-ios-light |
| O4 | 코디 기준 수정 | 02A 02-outfit-wardrobe-ios-light |

위 원본 PNG의 실제 픽셀을 확인했다. 15개 경로가 14개 소스 파일로 연결된다(A1/O1은 SplashScreens 공유). A1은 일반 최초 실행 화면이 아니라 기존 보조 진입 경로이며 활성화 조건을 바꾸지 않았다.

## 구현

읽기 표면 route 목록에 이번 15개 경로 추가. 홈과 같은 Ambient 역할 토큰을 사용하되 정적 reading 배경이며 Home 동적 환경을 복제하지 않는다. iOS 패널의 중첩 테두리·그림자를 줄이고 문장 16pt/보조 14pt 중심으로 간격과 넓은 읽기 행을 적용했다. 기능 강조·선택·위험 행동의 기존 역할 유지. Android에는 기존 스타일 분기를 유지한다.

- A2는 중앙 계정 아이콘과 기존 연결 안내 문장. 제공자 순서/가용성/로딩·실패/재시도 로직과 AccountProviderButton은 변경하지 않았다. Apple 시스템 버튼과 각 제공자 규격 유지.
- A3는 동의 항목과 내용 보기의 수직 읽기 공간을 확보. 4개 필수 동의, 전체 동의, 완료 조건·busy·취소·정책 링크를 유지.
- A4의 실제 게스트/필수 약관 미완료/연결/오프라인 상태와 로그아웃·탈퇴 확인 단계 및 경고 원문 유지. 실제 행동 실행 없음. M1의 기존 중앙 세로형 구조 유지.
- M3/M4는 설정·권한 행의 기능 아이콘과 글자/간격을 정리. 긴 권한 설명은 iOS에서 한 줄 제한을 해제했다. 설정값·권한 요청 조건·OS 설정 연결은 변경하지 않았다.
- R1/R2는 목록과 번호 문단 중심. 약관·개인정보·위치 문서와 MIT 전문, 시행일 및 미확정/구현 필요 문구는 바이트 단위로 동일. 법적 검토/확정으로 취급하지 않는다.
- O1/A1은 테마별 승인 날씨 일러스트, iOS 워드마크 제거. O2는 역할 아이콘 안내를 세로로 배치. O7/O5/O6/O3/O4는 기존 상태와 행동을 보존하며 중첩 표면과 작은 보조 글자를 정리. 데모 값이나 새 약속 문구를 추가하지 않음.
- 공통 AppScreen은 reading 표면에서 footer를 배경에 연결하고 compact subtitle 줄바꿈을 허용한다. 루트 reading 불투명 베이스와 Reduce Transparency 단색 fallback 유지. 전용 네이티브 시작 스토리보드와 저장소 로드 실패 UI는 이번 변경 범위가 아니다.

## 검사와 빌드

PASS: mobile TypeScript noEmit; 약관 동의 실제 JSX 이벤트 16가지 조합·개별/전체 토글·저장 guard·정책 링크·취소·재시도; account-auth(격리된 서버/SQLite 검사); account-region; account-button-font; native-navigation; ios-launch-state; home-outing; localization-native-exports 96; catalog 2176; Ambient 회귀; diff whitespace.

추가 정적 계약 비교: 변경 전 14개 소스와 현재의 이벤트 속성, disabled/accessibilityRole/accessibilityState/accessibilityLabel 및 JSX 문구 동일. 정책/라이선스 블록 바이트 동일. 숨김 16개 유지. 실제 서비스 호출 또는 픽셀/터치 검사는 아니다.

약관 검사 harness에는 새 시각 의존성(Platform/ambient 아이콘)만 inert mock으로 추가. 앱의 인증 제공자/정책 모델/상태 로직을 변경하지 않았다. 라이트/다크 보수적 reading 대비는 기존 검사 결과(light 본문16.34, 보조7.02, 기능6.37 / dark 12.23, 8.06, 9.06) 유지. 모든 개별 화면의 실기기 측색 결과는 아니다.

기존 Xcode27·QA 프로젝트·프로파일·DerivedData, ARM64 jobs1, generic/platform=iOS 대상으로 로컬 빌드 1회 성공. 기기 설치·실행·미러링·설정 변경을 수행하지 않았다. iPhone에는 앞선 2차 설치본이 유지된다.

로컬 빌드 bundle SHA256: f7dce4b84907d921e2f07e20d4cf8053fe04390894a70f6c7174e35a3f9dd8fb.

## 완료·부분·미검증 구분

- 이번 15개 경로: 소스 적용 및 위 검사/로컬 빌드 완료. 실기기 화면·터치·스크롤·큰 글자·VoiceOver·Reduce Motion/Transparency 조합은 전부 미검증. 따라서 시각 QA 완료나 원본 픽셀 일치로 보고하지 않는다.
- Home + 1차 3개 + 2차 10개 + 이번 15개 = 승인 기본 31개 중 29개 경로에 소스 적용. 이 수치는 전체 상태군의 완전 적용 또는 기기 QA 완료 수치가 아니다.
- 남은 C2/C3(옷장/아이템 추가·사진 편집): 승인 원본과 사진/필터/전환 상태 시안은 존재하지만 이번 계정·설정 묶음에서 소스 변경하지 않음. 미적용 범위로 남는다.
- 위젯/Live Activity: 이 31개 앱 화면용 승인 패키지에서 전용 크기·잠금 화면·Dynamic Island 상태별 시안을 확인하지 못함. 코드의 기존 네이티브 표현을 유지. C2/C3의 구현 잔여와 별도의 시안 부족 항목이다.
- 계정 연결/로그인/로그아웃/탈퇴, 권한 변경, 알림 설정 변경, 데이터 삭제는 실행하지 않음. 새로운 기능·권한·의존성·숨김 경로 활성화 없음.

Git 밖 증거: ../evidence/ambient-account-onboarding-20261010/ (검사/빌드 로그와 정적 계약 비교 도구·변경 전 소스). 임시 node_modules 링크와 이번 DeviceQA 복사본은 종료 시 제거했다.
