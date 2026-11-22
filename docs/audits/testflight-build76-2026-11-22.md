# WeatherON 1.0.0 (76) 내부 TestFlight 배포

2026-11-22, bernardchoi/weatherON, Daehyeons-Laptop. 빌드 요청 시점의 로컬·원격 main이 22d49ce0c4e33cb602b6d2d9fe0dfee0be1115e5로 일치함.

- main 22d49ce0에서 최초 환영 화면의 제목·설명, 영어·일본어 번역, Ambient Surface 해·구름 심볼 통합. 빌드 75 이후 앱 변경 파일 4개 확인.
- 로컬 iOS UI 검사, 번역 카탈로그 검사, TypeScript 검사 및 [GitHub Source checks](https://github.com/bernardchoi/weatherON/actions/runs/45019231640) 성공.
- fetch 후 미병합 브랜치와 stash 없음. 별도 worktree의 Android 검사 파일 변경과 미추적 .agents 자료는 iOS 배포 범위에서 제외. 삭제된 임시 worktree 등록 1건.
- [Xcode Cloud 빌드 76](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/ci/builds/462ed606-8c5a-4be4-b057-bc8e2e58e860/action/e2835e21-b1dc-4a89-a66b-0277f7068a10) Archive - iOS 성공. Cloud 체크의 head_sha와 배포 소스 일치. [Team (Expo) 내부 그룹](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/testflight/groups/4bdaae10-deb8-4b24-b81c-e468e8732dab/builds)에 추가 후 1.0.0 (76) 테스트 중, 90일 후 만료, 테스터 1명 확인. 실기기 설치·실행은 미확인.
