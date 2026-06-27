## Imported Claude Cowork project instructions

## Browser QA

- 브라우저 검증은 In-app browser를 우선 사용한다.
- Puppeteer/Chromium 자동 캡처는 In-app browser로 확인이 어렵거나 DOM/스크린샷 자동 검증이 꼭 필요할 때만 사용한다.
- Puppeteer/Chromium이 sandbox에서 막히면 프로젝트 오류로 판단하지 않고, 필요 시 승격 실행으로 검증한다.
