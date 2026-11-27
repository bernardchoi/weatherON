# WeatherON 1.0.0 (78) 내부 TestFlight 배포

2026-11-28 KST. bernardchoi/weatherON, Daehyeons-Laptop.local, Xcode Cloud Default 워크플로.

- 배포 소스는 main의 8cab749166e316630519935ddd6134ee455bcd5d. 기존 04e9ef23 병합에 Cloud의 Node 24 설치 수정 한 파일을 추가함. 원본 브랜치 fix/ios-kma-alert-outfit-summary의 285d6fc7, fix/destination-timing-copy의 e08abb29 모두 포함함.
- 별도 worktree의 Android 소형 화면 검사 변경, 미추적 .agents 자료, 로컬 빌드 기록은 iOS 배포 소스에서 제외함.
- 셸 문법 검사, git diff --check 및 [GitHub Source checks](https://github.com/bernardchoi/weatherON/actions/runs/46030577026) 통과함.
- [Xcode Cloud iOS Archive](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/ci/builds/cfdac52d-cdc7-4ff4-89f0-7eeeb96d731a/action/fb76e156-4647-4d7a-9c4d-5ac4416fa2a8) 성공. Cloud head_sha와 원격 main 일치함. 경고 664건.
- [Team (Expo) 내부 그룹](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/testflight/groups/4bdaae10-deb8-4b24-b81c-e468e8732dab/builds)에 테스트 준비 완료 상태인 78을 추가함. 그룹 내 1.0.0 (78), 테스트 중, 90일 후 만료, 테스터 1명 확인함. 실기기 설치·실행은 미확인.
