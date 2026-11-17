# WeatherON 빌드 71 내부 배포 기록

- 저장소 bernardchoi/weatherON, 작업 호스트 Daehyeons-Laptop.local, 원본 main `9778cc7aec1864bc289033c531609520b3905640`.
- 빌드 70의 React·Expo 경고 수정과 목적지 반복 요일 탭 지연 수정을 main `aff54255cb36d5e2d4c593fb4431af41b91e578d`에 함께 커밋함. 원격 main과 일치함.
- iOS 네이티브 모듈, 반복 요일 연속 입력, 날씨·코디 회귀 검사, 모바일 TypeScript, git diff --check 통과함.
- 배포 전 fetch 후 브랜치·worktree·stash를 대조함. 홈 마스코트 worktree는 깨끗함. 다른 worktree의 Android 작은 화면 검사 수정과 로컬 .agents/state/는 요청 범위 밖임. 삭제된 임시 worktree 등록만 남아 있으며 stash 없음.
- Xcode Cloud Default 워크플로에서 main으로 빌드 71을 시작함. 원격 소스 커밋의 GitHub 상태가 동일한 [Cloud 실행](https://appstoreconnect.apple.com/teams/19c9676b-22bb-4167-9c5f-493731b432a0/apps/6789612592/ci/builds/fdea29ce-8977-4ff2-baf9-0aaca6032e2d)의 성공을 확인함.
- App Store Connect에서 빌드 71의 전체 소스 SHA를 확인함. 1.0.0 (71)이 테스트 준비 완료 상태일 때 내부 Team (Expo)에 추가했고, 내부 그룹의 빌드 목록에서 ‘테스트 중’과 테스터 1명을 확인함. 사용자가 실제 iPhone에서 빌드 71을 직접 테스트해 목적지 반복 요일을 한 번 탭했을 때의 반응 지연이 해소됐음을 확인함.
- Cloud 화면 경고 632 → 664건, 빌드 오류 0건. XCResult의 React umbrella 경고 294 → 28건, Expo 전송 헤더 nullability 진단 34곳 → 0곳. 71 요약에만 나타난 Swift 파일 진단 296건 중 적어도 219건은 70의 원본 아카이브 로그에서도 같은 파일·행·메시지를 확인함.
