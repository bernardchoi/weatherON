## Browser QA

- UI 변경 검증은 In-app browser를 우선 사용한다.
- Puppeteer/Chromium은 DOM 검사나 반복 스크린샷 검증이 필요할 때만 사용한다.

## Build and Release

- 빠른 iOS 개발·실기기 디버깅은 로컬 Xcode 27을 사용한다.
- iOS 자동 빌드·테스트는 Xcode Cloud를 사용한다.
- iOS 배포 후보 실기기 QA는 Xcode Cloud 빌드를 TestFlight로 배포한 뒤 실제 iPhone에서 수행한다.
- 최종 iOS App Store 바이너리는 Xcode Cloud에서 빌드한다. iOS EAS Build·Submit은 사용하지 않는다.
- Android 빌드는 기존 Expo EAS Build를 유지한다.

## Integration and Release Completeness

- 작업 완료 보고에는 저장소/실행 호스트, 브랜치, 커밋 SHA, 미커밋·미푸시 여부, main 포함 여부를 명시한다. 구현 완료와 main 통합 완료를 구분한다.
- 원격 채팅·별도 worktree의 미커밋 변경은 현재 checkout의 `git status`에 나타나지 않는다. 배포 전에 관련 로컬·원격 채팅과 모든 작업 폴더의 잔여 변경을 확인한다. 다른 채팅에 지시를 보낼 때는 도구의 사용자 승인 규칙을 따른다.
- 빌드 전 `git fetch`, 로컬/원격 브랜치, `git worktree list`, 각 작업 폴더의 status, stash를 대조한다. `git branch --merged`만으로 누락 없음을 판단하지 않는다. 다른 SHA로 반영된 변경은 patch와 현재 소스를 비교한다.
- 배포별 통합 기록에 요청 작업, 원본 브랜치/커밋, main 반영 커밋 또는 명시적 제외 사유, 검사 결과를 남긴다. 미확인 항목을 포함 완료로 표시하지 않는다.
- 요청 범위의 미통합 작업이 있거나 원격 작업 상태를 확인하지 못하면 외부 배포를 보류한다. 빌드 시작 후 누락을 발견하면 해당 빌드를 외부 배포하지 않고 통합·검증 후 새 빌드를 사용한다.
- Cloud 실행의 소스 SHA와 원격 main SHA를 대조하고 TestFlight 빌드 번호·요청 그룹·테스트 가능 상태를 별도로 확인한다. QA 산출물·임시 파일·미검증 후보는 일괄 추가하지 않는다.
