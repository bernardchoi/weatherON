# WeatherON 1.0.0 (75) 내부 배포

2026-11-22, bernardchoi/weatherON, Daehyeons-Laptop. main 77dcafda의 온보딩 첫 화면과 영어·일본어 문구, 목적지 예보 문구 검사 변경 5개 파일을 6adf8994f9f7a7ce4acc3b3e2fbb85a012ca12eb로 통합하고 원격 main SHA와 대조함.

- iOS UI 검사에서 강수확률 49%, 50%, 51%, 61%의 도착 시각 문구와 다음 시간대 예보 혼입 방지 확인. 타입 검사, 온보딩 복구, 번역 검사 및 [GitHub Source checks](https://github.com/bernardchoi/weatherON/actions/runs/45015672528) 통과.
- 같은 온보딩 소스의 로컬 Release 시뮬레이터 검사 결과 3건 확인. iPhone 16 Pro Max 다크 모드와 SE 기본 글자에서 세 항목 모두 첫 화면에 표시됨. SE 최대 글자에서는 스크롤로 각 항목을 확인함. 세 조건 모두 다음 화면 이동 성공.
- iPhone Duo 프로필은 최소 iOS 27.1.0 필요. 설치 런타임 27.0에서 시뮬레이터 생성 시 Incompatible device 반환. Duo 접힘·펼침과 빌드 75 실기기 설치·실행 미확인.
- fetch 후 main과 origin/main 기준점 일치, 미병합 브랜치 및 stash 없음. 별도 worktree의 Android 작은 화면 검사, 미추적 .agents 자료는 배포 범위에서 제외. 삭제된 임시 worktree 등록 1건.
- [Xcode Cloud 빌드 75](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/ci/builds/6ecb0c5e-876a-4d5e-8cef-9df755d3ecb3/action/ffe86f93-ef60-45f2-9480-337a1a7a8b5a) Archive - iOS 성공. 해당 체크의 head_sha가 배포 대상 원격 커밋과 일치함. [Team (Expo) 내부 그룹](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/testflight/groups/4bdaae10-deb8-4b24-b81c-e468e8732dab/builds)에 추가 후 1.0.0 (75) 테스트 중, 90일 후 만료, 테스터 1명 확인.
