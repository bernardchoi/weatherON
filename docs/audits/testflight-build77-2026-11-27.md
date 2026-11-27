# WeatherON Xcode Cloud 빌드 77

2026-11-27 KST. bernardchoi/weatherON, 로컬 확인 호스트 Daehyeons-Laptop.local, 빌드 호스트 Xcode Cloud.

- 요청한 소스는 main의 04e9ef2324fad3d768a8e98d0ae5f16d7303adce. GitHub 원격 main, Cloud 실행의 커밋 링크, Archive 체크의 head_sha가 일치함.
- fix/ios-kma-alert-outfit-summary의 285d6fc7과 fix/destination-timing-copy의 e08abb29가 해당 병합 커밋에 포함됨. 별도 worktree의 Android 검사 수정 및 미추적 .agents 자료는 iOS 빌드 범위에서 제외함.
- [GitHub Source checks](https://github.com/bernardchoi/weatherON/actions/runs/46008522179) 성공. [Xcode Cloud 빌드 77 로그](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/xcode-cloud/products/00bc7f97-00f6-48a8-ab9b-9be4cbdd5646/builds/c3d13f71-0f95-4d92-9852-3a82cbabb7d5/action/5c2b6b4a-6077-4117-96a1-a8f3da7ad80d/logs)에서 Default 워크플로의 Archive - iOS 실패 확인. Xcode 27.1 (27A9275), 경과 53초.
- ci_post_clone.sh에서 Homebrew가 비활성화된 node@20 설치를 거부해 종료 코드 1 발생. 아카이브 생성 전 실패해 내부 그룹 Team (Expo)에 배포할 빌드 없음.
