# iOS 실기기 헤더·코디 QA

2026-09-06 21:24~21:25 KST. iPhone 16 Pro Max, 현재 기기 글꼴·화면 설정, 다크 테마.

- 현재 체크아웃을 Xcode-beta / WeatherON workspace·scheme / Debug / physical device로 빌드. `FORCE_BUNDLING=1` 사용. BUILD SUCCEEDED, main.jsbundle 존재, codesign --verify --deep --strict 통과.
- `com.weatheron.mobile` 업데이트 설치 성공. devicectl --terminate-existing 실행 성공. 기존 계정·옷장·목적지 데이터 유지된 화면 확인.
- iPhone 미러링을 통해 홈→코디→출발→MY→코디→상세→하단 스크롤→코디 복귀를 실제 조작하고 각 단계 화면 캡처 확인. 증거는 이 작업의 CUA 캡처에 있음.
- 네 첫 화면 제목 시작점이 미러링 캡처에서 동일 높이(약 y=120)에 표시됨. 원본 기기 픽셀 좌표 자동 측정이 아닌 육안 비교임.
- 코디의 라이트 레인 재킷·린넨 티셔츠·와이드 데님·방수 스니커즈 이름 및 두 바로가기 카드 보조 문구 잘림 없음.
- 상세 시간별 조언·체감/비/바람 설명 표시 확인. 아래로 스크롤하면 내 옷장 버튼 전체 노출. 고정 하단 버튼으로 코디 복귀하고 코디 탭 선택 유지 확인.
- 첫 실행 시 개발용 "Open debugger to view warnings" 배너 관찰 후 닫음. 경고 원인 로그 진단은 이번 화면 QA에 포함하지 않았으며, 무경고·전체 로그 정상으로 판정하지 않음. 조작 중 앱 종료·오류 화면은 관찰되지 않음.
- 다른 글꼴 배율, 라이트 테마, 다른 iPhone 크기, 물리적 뒤로가기 스와이프, 알림·로그인·사진 등록 기능은 이번 검증 범위 밖임.
- 로컬 실기기 QA 빌드임. EAS·App Store Connect·TestFlight 업로드 수행하지 않음.
