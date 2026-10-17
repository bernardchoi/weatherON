# iOS Ambient — 옷장·사진 편집 및 전체 31개 소스 적용 대조표

기준 HEAD: 48087358083455041d09865c596db9782f50ba63. Home와 첫 세 묶음의 로컬 변경 보존. 커밋·푸시 없음. 이 기록은 3차 시점의 29/31 상태를 갱신한다.

## 이번 C2/C3 적용

02A 기본 옷장/사진 편집 시안과 02B 사진 metadata light v4, 상태 light v2, 02C 사진 transition dark의 실제 PNG를 확인했다. C2/C3에 reading route를 연결하고 기존 공통 Ambient 토큰을 사용한다.

- C2: 의류 이미지 중심의 열린 그리드, 15pt 이름/14pt 분류, 넓은 이미지와 행 간격. 삭제 버튼은 상단의 44pt 터치 영역을 유지하고 승인 delete 아이콘을 사용. 삭제/복구 이벤트와 빈 옷장/필터 결과 없음 분기 유지. 좁은 폭 또는 큰 글자에서 두 열로 전환한다.
- C3 프리셋: 검색과 사진 진입, 미리보기, 카테고리 아코디언과 프리셋 이미지를 정리. 보유/선택 항목의 표시와 추가/해제 행동 유지. 이름·필터 값은 iOS에서 한 줄로 잘리지 않게 함.
- C3 사진: 정사각형 contain 미리보기, 큰 빈 사진 영역, 상태/안내 글자와 정보 행, 한 행씩 읽는 선택 시트. 기존 BottomSheet와 필수 선택 유지. 촬영/보관함/저장/재시도/취소 콜백 및 권한·승인·busy 조건을 변경하지 않았다.
- 선택/분석/저장/취소 상태 전이 코드 블록은 변경 전과 바이트 동일. 실패 사진의 iOS 저장 차단과 사진 교체 취소 시 기존 사진 유지 정책도 보존. 실제 사진 선택·업로드·수정·삭제, 권한 요청은 실행하지 않음.
- Android는 원래 스타일 분기 유지. Home·계정·정책·이전 묶음의 본문 소스는 수정하지 않음. 새 의존성·숨김 경로 활성화 없음.

## 검사

PASS: mobile TypeScript noEmit; wardrobe-photo-state(경로/렌더링/삭제/복구/undo 만료); wardrobe-analysis 정책 gate; review-regressions(영속 사진 교체 등); native-navigation; localization-native-exports 96; catalog 2176; Ambient 회귀; diff whitespace. 모두 코드/격리 검사이며 개인 사진이나 실제 서비스 조작이 아니다.

추가 정적 계약 검사: 이번 4개 소스의 기존 이벤트 속성·disabled·접근성 역할/상태/이름·JSX 문구 보존, 사진 상태 전이 코드 동일. 승인 CSV의 iOS-light 기본 경로 집합 31개와 Home+Ambient reading route 집합이 정확히 일치한다. 이 검사는 화면 완성도나 픽셀 일치를 증명하지 않는다.

이번 묶음에서는 빌드·설치·미러링을 실행하지 않았다. 3차 로컬 빌드에는 C2/C3 후속 변경이 포함되지 않는다. 사용자 기기 사용 종료 확인 후 전체 소스로 일괄 빌드·설치 및 시각 QA가 필요하다. 현재 iPhone은 2차 설치본 유지.

## 전체 대조표

소스 적용 완료는 승인 방향의 코드 연결과 레이아웃 적용을 뜻한다. 모든 상태/기기/접근성 조합의 시각 검증 완료가 아니다. 원본 경로는 docs/design/ambient-surface-pages-20261009/ 아래 상대 경로.

| 경로 | 화면 | 소스 적용 | 승인 원본 | 실기기 근거/남은 확인 |
| --- | --- | --- | --- | --- |
| H1 | 홈 | 완료 (기존 Home) | WeatherON-01A-Core-Weather-20261009/images/01-core-ios-light-v3.png | 기존 홈 QA 별도 기록; 이번 미조작 |
| C1 | 코디 | 완료 (1차) | WeatherON-01A-Core-Weather-20261009/images/01-core-ios-light-v3.png | 1차 다크 주요 흐름 관찰; 전체 상태 미검증 |
| C4 | 코디 상세 | 완료 (1차) | WeatherON-02A-Outfit-Main-20261009/images/02-outfit-detail-ios-light-v2.png | 1차 다크 주요 흐름 관찰; 전체 상태 미검증 |
| M1 | 마이 | 완료 (1차) | WeatherON-01A-Core-Weather-20261009/images/01-core-ios-light-v3.png | 1차 다크 주요 흐름 관찰; 전체 상태 미검증 |
| G1 | 출발 | 완료 (2차) | WeatherON-01A-Core-Weather-20261009/images/01-core-ios-light-v3.png | 2차 다크 직접 관찰; 전체 상태 미검증 |
| P1 | 목적지 추가 | 완료 (2차) | WeatherON-03A-Destination-Main-20261009/images/05-destination-ios-light.png | 이번 적용본 실기기 미검증 |
| G2 | 목적지 케어 | 완료 (2차) | WeatherON-03A-Destination-Main-20261009/images/05-destination-ios-light.png | 2차 다크 직접 관찰; 전체 상태 미검증 |
| H2 | 위치 변경 | 완료 (2차) | WeatherON-01B-Location-Alerts-20261009/images/04-location-alerts-ios-light.png | 이번 적용본 실기기 미검증 |
| H3 | 알림 센터 | 완료 (2차) | WeatherON-01B-Location-Alerts-20261009/images/04-location-alerts-ios-light.png | 이번 적용본 실기기 미검증 |
| H4 | 우산 추천 | 완료 (2차) | WeatherON-01A-Core-Weather-20261009/images/03-weather-ios-light.png | 이번 적용본 실기기 미검증 |
| H5 | 강수 타임라인 | 완료 (2차) | WeatherON-01A-Core-Weather-20261009/images/03-weather-ios-light.png | 2차 다크 직접 관찰; 전체 상태 미검증 |
| H6 | 날씨 상세 | 완료 (2차) | WeatherON-01A-Core-Weather-20261009/images/03-weather-ios-light.png | 2차 다크 상단 관찰; 하단·전체 상태 미검증 |
| H7 | 내일 브리핑 | 완료 (2차) | WeatherON-01A-Core-Weather-20261009/images/03-weather-ios-light.png | 이번 적용본 실기기 미검증 |
| M2 | 스마트 알림 설정 | 완료 (2차) | WeatherON-01B-Location-Alerts-20261009/images/04-location-alerts-ios-light.png | 이번 적용본 실기기 미검증 |
| M3 | 표시 설정 | 완료 (3차) | WeatherON-04A-Account-iOS-20261009/images/06-settings-ios-light-v3.png | 이번 적용본 실기기 미검증 |
| M4 | 앱 권한 관리 | 완료 (3차) | WeatherON-04A-Account-iOS-20261009/images/06-settings-ios-light-v3.png | 이번 적용본 실기기 미검증 |
| A1 | 보조 앱 진입 소개 | 완료 (3차) | WeatherON-05-Onboarding-20261009/images/07-onboarding-appendix-A1-all-modes.png | 이번 적용본 실기기 미검증 |
| A2 | 계정 연결 | 완료 (3차) | WeatherON-04A-Account-iOS-20261009/images/06-account-consent-ios-light.png | 이번 적용본 실기기 미검증 |
| A3 | 약관 동의 | 완료 (3차) | WeatherON-04A-Account-iOS-20261009/images/06-account-consent-ios-light.png | 이번 적용본 실기기 미검증 |
| A4 | 계정 관리 | 완료 (3차) | WeatherON-04A-Account-iOS-20261009/images/06-settings-ios-light-v3.png | 이번 적용본 실기기 미검증 |
| R1 | 정책 및 법적 고지 | 완료 (3차) | WeatherON-04A-Account-iOS-20261009/images/06-policy-ios-light.png | 이번 적용본 실기기 미검증 |
| R2 | 정책 문서 | 완료 (3차) | WeatherON-04A-Account-iOS-20261009/images/06-policy-ios-light.png | 이번 적용본 실기기 미검증 |
| O1 | 온보딩 시작 | 완료 (3차) | WeatherON-05-Onboarding-20261009/images/07-onboarding-intro-ios-light.png | 이번 적용본 실기기 미검증 |
| O2 | 온보딩 소개 | 완료 (3차) | WeatherON-05-Onboarding-20261009/images/07-onboarding-intro-ios-light.png | 이번 적용본 실기기 미검증 |
| O3 | 권한 gate | 완료 (3차) | WeatherON-05-Onboarding-20261009/images/07-onboarding-care-ios-light-v2.png | 이번 적용본 실기기 미검증 |
| O4 | 코디 기준 수정 | 완료 (3차) | WeatherON-02A-Outfit-Main-20261009/images/02-outfit-wardrobe-ios-light.png | 사용자 실기기 직접 스크롤 정상 확인; 미러링 자동 입력 관찰과 구분. 전체 상태·접근성 미검증 ([근거](WeatherON_IOS_AMBIENT_FINAL31_INSTALL_2026-10-10.md)) |
| O5 | 스마트 케어 | 완료 (3차) | WeatherON-05-Onboarding-20261009/images/07-onboarding-care-ios-light-v2.png | 이번 적용본 실기기 미검증 |
| O6 | 목적지 설정 | 완료 (3차) | WeatherON-05-Onboarding-20261009/images/07-onboarding-care-ios-light-v2.png | 이번 적용본 실기기 미검증 |
| O7 | 코디 안내 | 완료 (3차) | WeatherON-05-Onboarding-20261009/images/07-onboarding-intro-ios-light.png | 이번 적용본 실기기 미검증 |
| C2 | 내 옷장 | 완료 (4차) | WeatherON-02A-Outfit-Main-20261009/images/02-outfit-wardrobe-ios-light.png | 이번 적용본 실기기 미검증 |
| C3 | 아이템 추가 | 완료 (4차) | WeatherON-02A-Outfit-Main-20261009/images/02-outfit-wardrobe-ios-light.png | 이번 적용본 실기기 미검증 |

## 남은 범위

- 31/31 기본 경로 소스 적용. 104 PNG의 모든 상태, 124 모드 뷰와의 완전 일치 또는 출시 QA 완료가 아니다. 특히 3/4차는 설치되지 않았다.
- 실제 사진 선택/취소/권한 거부/분석·저장/복구, 화면 스크롤·큰 글자·VoiceOver·Reduce Motion/Transparency 실기기 검증은 남는다. 계정/개인 사진 조작은 별도 허용 없이 수행하지 않는다.
- 위젯·Live Activity: 앱 내부 31개 화면과 별개다. 이 승인 패키지에는 전용 크기·잠금 화면·Dynamic Island별 시안을 확인하지 못했고 기존 네이티브 표현을 유지했다.
- 출시 숨김 16개(W1–4/G3–6/P2–3/R3–4/S0–3), 미구현 기능, 네이티브 시작 스토리보드/루트 저장소 오류 UI는 새로 활성화하거나 재설계하지 않았다.

Git 외부 검사 증거: ../evidence/ambient-wardrobe-20261010/. 이번 임시 node_modules 링크만 제거했다.

## 후속 설치 기록

사용자 미러링 확인 요청 후 31개 전체 소스와 화면 겹침 수정의 설치가 완료됐다. 후속 사용자 조작 충돌로 직접 검증은 중단했다. 위 표는 소스 적용 시점 기록이며 최신 설치/검증 상태는 [최종 설치 QA](WeatherON_IOS_AMBIENT_FINAL31_INSTALL_2026-10-10.md)를 따른다.
