# iOS Ambient Surface — 목적지·날씨·위치·알림 2차 적용

기준 HEAD: 48087358083455041d09865c596db9782f50ba63. 앞선 C1/C4/M1 미커밋 변경을 보존한 승인 후속 묶음. 커밋·푸시 없음.

## 구현 범위

G1/P1/G2/H2/H3/H4/H5/H6/H7/M2의 iOS 본문을 공통 Ambient reading 표면에 연결했다. 승인된 core/destination/location-alerts/weather 원본과 상태 시안을 읽고 실제 PNG를 확인했다. Home 전용 워드마크와 동적 환경은 복제하지 않는다. Android 기존 분기, Home와 첫 묶음 구현을 유지한다.

- 출발 목록은 넓은 목적지 행, 각 행의 실제 출발/도착/날씨 상태 유지. 목적지가 있을 때 중복 상단 요약만 iOS에서 숨김.
- 목적지 추가는 검색/결과 행, 케어는 출발지·목표 시각·이동 수단과 반복 설정을 넓은 행으로 정리. 검색/저장/경로/요일/알림 콜백과 의미는 유지.
- 날씨 상세·우산·내일은 요약과 예보 근거 중심으로 배경과 간격 정리. 기존 날씨/night 조건에 맞는 승인 아이콘 사용. 내일 예보 부재 문구와 분기 유지.
- H5의 locationId/targetAt/basisLabel, 실제 유효 시간만 표시, 누락/stale/범위 밖 처리를 유지. 시간별 실제 강수량 막대와 확률/mm 값을 가로 행으로 표시. 마지막 비 항목에서 비 그침을 추론하지 않음.
- 위치·알림·알림 설정은 넓은 행과 기능 색상 유지. 기존 권한/알림/설정 동작 변경 없음. Reduce Transparency는 기존 reading 단색 fallback 유지.

## 자동 검사

통과: mobile TypeScript noEmit, home-outing(실제 H5 JSX와 위치/시각/누락/stale), weather-outfit-regressions(알림 예약 경합 포함), home-ambient-host, native-navigation, today-outfit, review-regressions, destination-labels, destination-limit, ios-native-modules --installed, localization-native-exports 96, KO/EN/JA catalog 2176, diff whitespace.

Ambient 회귀에서 실제 RN gradient parser, 읽기 표면의 투명 효과 줄이기 단색과 비상호작용 속성을 확인. 보수적 대비는 light 본문16.34/보조7.02/기능6.37, dark 본문12.23/보조8.06/기능9.06. 이 값은 네이티브 캡처 색 측정이나 모든 개별 텍스트의 실기기 인증이 아니다.

## 빌드 및 실기기 관찰

기존 QA 프로젝트 백업·프로파일·DerivedData, Xcode27, ARM64 jobs1 증분 빌드 1회 성공. codesign 검증 및 기존 앱 데이터 보존 설치 성공. 동시/중복 빌드 없음. 최초 CLI 실행은 기기 잠김으로 실패했으며, 미러링 재개 후 홈 화면의 설치된 WeatherON 아이콘을 눌러 정상 실행했다. 테마 override/기기 설정/권한 변경 없음.

설치 bundle SHA256: 5174704c2ce098c944be52e50ce94ead1db03aef7ea500e8b67944c4e83ab1c2.

현재 다크 설정에서 iPhone 미러링으로 직접 관찰:
- Home 정상 실행 및 기존 레이아웃. 개발 경고는 UI 닫기 버튼으로만 닫음.
- Home 강수 진입 → H5: 목적지 도착 기준 날짜/시각, 실제 0과 비영 강수값, ‘이후 비 그침은 확인되지 않았어요’ 문구, 시간 행 및 탭 표시.
- G1: 기존 목적지 3개와 선택 상태, 출발/도착 행 및 최대 개수 안내.
- 기존에 선택된 목적지로 G2 진입. 출발지/시각/수단, 반복 요일, 기존 알림 일정, 경로 상태, 코디와 추가 준비, 삭제 영역까지 스크롤 관찰. 설정·저장·삭제·외부 지도 행동은 실행하지 않음.
- Home 탭 복귀 → H6: 현재 기온/체감/강수/바람/습도, 시간별·주간 예보의 정착 화면 확인.
- 이후 사용자 조작으로 미러링 화면이 바뀌어 추가 UI 조작을 중단했다. 사적 장소 이름은 문서에 복제하지 않는다.

직접 확인하지 못한 범위: P1(기존 목적지 최대 개수, 이를 위해 삭제하지 않음), H2/H3/H4/H7/M2의 이번 설치 화면, H6 하단 전체, light/큰 글자/VoiceOver/Reduce Motion·Transparency 설정 조합, 강제 빈/누락/stale 상태, 전체 제스처·프레임 성능. 코드 적용과 자동 회귀 통과를 이 범위의 실기기 PASS로 확대하지 않는다. 31개 화면 전체 적용 완료 또는 원본 픽셀 완전 일치를 뜻하지 않는다.

Git 외부 로그: ../evidence/ambient-destination-weather-20261010/. 종료 시 이번 임시 node_modules 링크와 DeviceQA 복사본만 제거했다.
