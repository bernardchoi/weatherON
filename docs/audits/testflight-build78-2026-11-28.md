# WeatherON 1.0.0 (78) 내부 TestFlight 배포

2026-11-28 KST. bernardchoi/weatherON, Daehyeons-Laptop.local, Xcode Cloud Default 워크플로.

- 배포 소스는 main의 8cab749166e316630519935ddd6134ee455bcd5d. 기존 04e9ef23 병합에 Cloud의 Node 24 설치 수정 한 파일을 추가함. 원본 브랜치 fix/ios-kma-alert-outfit-summary의 285d6fc7, fix/destination-timing-copy의 e08abb29 모두 포함함.
- 별도 worktree의 Android 소형 화면 검사 변경, 미추적 .agents 자료, 로컬 빌드 기록은 iOS 배포 소스에서 제외함.
- 셸 문법 검사, git diff --check 및 [GitHub Source checks](https://github.com/bernardchoi/weatherON/actions/runs/46030577026) 통과함.
- [Xcode Cloud iOS Archive](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/ci/builds/cfdac52d-cdc7-4ff4-89f0-7eeeb96d731a/action/fb76e156-4647-4d7a-9c4d-5ac4416fa2a8) 성공. Cloud head_sha와 원격 main 일치함. 경고 664건.
- [Team (Expo) 내부 그룹](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/testflight/groups/4bdaae10-deb8-4b24-b81c-e468e8732dab/builds)에 테스트 준비 완료 상태인 78을 추가함. 그룹 내 1.0.0 (78), 테스트 중, 90일 후 만료, 테스터 1명 확인함. 실기기 설치·실행은 미확인.

## 외부테스트 그룹 배포

2026-11-28 KST. 동일한 1.0.0 (78)을 [외부테스트 그룹](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/testflight/groups/60aec856-481b-49db-95ab-a82f214c3e8e/builds)에 추가함. 한국어 테스트 내용 입력 후 자동 공지 옵션을 켠 상태로 심사 제출함. 그룹 빌드 목록에서 1.0.0 (78), iOS, 테스트 중, 90일 후 만료 확인함. 그룹 테스터 6명이며 실제 설치·실행 여부는 미확인임.

배포 시점 원격 main은 1f1b1704이며 빌드 소스 8cab7491 이후 변경은 빌드 77·78 기록 두 파일뿐임. 미병합 브랜치, 열린 PR, stash 없음. 기존 Android 검사 수정 및 .agents 자료는 iOS 빌드 범위에서 제외함.
배포 후 병합된 작업 브랜치와 별도 worktree를 정리해 로컬과 origin에는 main 브랜치만, worktree 목록에는 main 작업 폴더 1개만 남았음(정리 직후 SHA 8accb0fb).
