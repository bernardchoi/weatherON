# WeatherON 1.0.0 (74) 내부 배포

2026-11-22, bernardchoi/weatherON, Daehyeons-Laptop. 기준 main 744f86d0에서 온보딩 1/4·4/4 화면과 iOS 뷰 관리자 등록 수정을 15f98560292035534d7ccc9a38fd0765a310bf14로 커밋하고 원격 main과 대조함.

- 첫 화면에 Ambient Surface 안내 장면과 코디·비 준비·출발 예시를 배치함. 마지막 화면에 목적지 안내 장면과 큰 아이콘·문구를 적용함.
- 최대 글자에서 ‘나중에’ 탭 후 메인 스레드가 Fabric 컴포넌트 등록 잠금을 기다리고 등록 스레드는 메인 큐의 동기 초기화를 기다리는 교착을 확인함. UI 초기화 코드가 없는 앱 뷰 관리자 4개의 메인 큐 초기화 요구를 해제함.
- 로컬 Release, iPhone SE 시뮬레이터 375×667pt, 한국어, 매번 새 설치. 기본 글자에서 첫 화면 세 항목 모두 스크롤 없이 보임. 최대 접근성 글자에서 두 화면 여섯 항목을 스크롤로 각각 끝까지 표시하고 하단 버튼과 겹치지 않는지 확인함. ‘나중에’ 탭 시작부터 홈 위치 변경 버튼 표시·조작 가능 판정까지 최대 글자 2.59초, 기본 글자 4.61초. 각 1회, XCTest 대기 시간 포함.
- 타입 검사, 번역 카탈로그, 온보딩 복구, Android 품질, [GitHub Source checks](https://github.com/bernardchoi/weatherON/actions/runs/45007214547) 통과함. 별도 check-ios-uiux 검사에서 기존 목적지 예보 케이스 실패함. 강수확률 51% 입력에 기온 문구를 기대하나 현재 모델은 강수확률을 표시함. 해당 검사와 모델은 기준 main 대비 차이 없음.
- fetch 후 미병합 브랜치·stash 없음. 별도 worktree의 Android 검사 스크립트 수정과 미추적 .agents 자료는 이번 내부 배포 범위에서 제외함. 삭제된 임시 worktree 등록 1건 있음.
- [Xcode Cloud 74](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/xcode-cloud/products/00bc7f97-00f6-48a8-ab9b-9be4cbdd5646/builds/54cb5d92-aa31-406a-b000-03f441daa35c/summary) Archive - iOS 성공, GitHub 체크의 head_sha와 원격 소스 일치. [내부 Team (Expo)](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/testflight/groups/4bdaae10-deb8-4b24-b81c-e468e8732dab/builds)에 수동 추가 후 1.0.0 (74) 행에서 테스트 중, 90일 후 만료 확인. 테스터 1명. 실기기 설치 및 작동은 미확인.
