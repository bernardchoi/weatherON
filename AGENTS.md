## Browser QA

- UI 변경 검증은 In-app browser를 우선 사용한다.
- Puppeteer/Chromium은 DOM 검사나 반복 스크린샷 검증이 필요할 때만 사용한다.

## Build and Release

- 빠른 iOS 개발·실기기 디버깅은 로컬 Xcode 27을 사용한다.
- iOS 자동 빌드·테스트는 Xcode Cloud를 사용한다.
- iOS 배포 후보 실기기 QA는 Xcode Cloud 빌드를 TestFlight로 배포한 뒤 실제 iPhone에서 수행한다.
- 최종 iOS App Store 바이너리는 Xcode Cloud에서 빌드한다. iOS EAS Build·Submit은 사용하지 않는다.
- Android 빌드는 기존 Expo EAS Build를 유지한다.
