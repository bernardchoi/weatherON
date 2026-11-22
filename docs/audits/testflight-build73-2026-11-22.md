# WeatherON 1.0.0 (73) 내부 TestFlight 배포

2026-11-22, bernardchoi/weatherON, Daehyeons-Laptop. 배포 당시 원격 main과 Xcode Cloud 소스가 585e3d1c81c65f5e65a94320b91e7941fb1b12f0으로 일치함.

- 빌드 72의 1fe790bb 이후 온보딩·홈과 영어·일본어 문구, 복구 검사 변경은 2b03964e에 포함됨. 최신 검사 수정은 585e3d1c. 동일 소스의 [Source checks](https://github.com/bernardchoi/weatherON/actions/runs/44999364902) 성공.
- fetch 후 미병합 로컬·원격 브랜치와 stash 없음. 별도 작업 폴더의 Android 작은 화면 QA 스크립트, 미추적 점검 메모와 .agents/state/는 제외함. 삭제된 임시 worktree 등록 1건 있음.
- [Xcode Cloud 73](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/xcode-cloud/products/00bc7f97-00f6-48a8-ab9b-9be4cbdd5646/builds/777b056e-6d46-449f-9950-bde4b67b8f10/summary) Default의 Archive - iOS 성공. 경고 664건. 내부 Team (Expo) 그룹의 1.0.0 (73) 행에서 테스트 중, 90일 후 만료 확인. 내부 테스터 1명. 실기기 설치·실행 결과는 미확인.
- App Store iOS 버전 1.0은 제출 준비 중. 빌드 미선택, 수동 출시 선택됨. 한국어 제품 페이지의 확인한 iPhone 중형 디스플레이 슬롯은 스크린샷 0장. 네이티브 대상은 iPhone. 시작 가격과 판매 지역 설정 필요. 날씨 카테고리·4+ 글로벌 등급·게시된 개인정보 응답·지원 URL 확인. 콘텐츠 권한 정보 설정과 신규 제출 시 연령 등급 응답 확인 필요. 심사용 로그인 필요 체크 상태. 외부 테스트 그룹 추가 및 App Review 제출은 진행하지 않음.
