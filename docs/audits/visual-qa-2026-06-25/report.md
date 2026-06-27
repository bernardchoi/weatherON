# WeatherON Visual QA - 2026-06-25

## Summary
- Scope: preview navigation screens, 43 screens total.
- Capture: Chromium DOM metrics, 393x852 mockup surface.
- Modes: light and dark.
- Output:
  - `screenshots-light/` (previous visual captures retained)
  - `screenshots-dark/` (previous visual captures retained)
  - `visual-audit-results-light.json`
  - `visual-audit-results-dark.json`

## Changes Applied
- H5: moved `비 알림 설정` from scroll content into a fixed safe-area CTA above the tab bar.
- H5: added light/dark aware fixed CTA gradient so the button is visible in both modes.
- C4: changed the fixed bottom CTA background to a light-mode gradient instead of the dark blue overlay.
- M2: removed the duplicated bottom explanatory note that was being clipped behind the tab bar.
- QA script: separated true frame clipping from normal scroll continuation content.
- QA script: added metrics-only mode because full screenshot capture can timeout on asset-heavy screens.
- H1/H2/H3/H5/G1/G4/G6/P2/R4/S2: raised readable helper labels to 10px+ or removed unnecessary thumbnail labels.
- H3: removed whole-card opacity from read notifications and raised notification meta/detail text contrast.
- W4: raised report history labels, place/time/status text, and bottom notice contrast.
- O5: raised step label, inactive routine buttons, helper body text, and footer guidance contrast.
- C3: raised preset filter/segment labels and item metadata contrast.
- C4: raised outfit item reason text and detail state labels.
- H4/H5: raised rain probability, axis, legend, and umbrella comparison labels for light/dark readability.
- G1/G4/G5/G6: separated semantic accent colors from readable text colors for destination, route, journey, and premium metadata.
- C1/G2/G3/P2/C4: raised outfit, destination, trip, and guide metadata so light-mode card text no longer disappears.
- M2/M3: changed settings helper text, status chips, segment values, and inline SVG strokes to readable theme ink tokens.
- A2/O2/O3/O4/O6: raised onboarding helper text, inactive controls, permission chips, style preview icons, and destination search/benefit labels for light-mode visibility.
- Theme tokens: brightened dark-mode functional colors and darkened light-mode functional colors so status labels remain readable when colors are used as text.
- H1/C1/C3/H2/H3/H5/O5/G3/G4/G5/P1/P2/A4/R1/R2/R3/R4/W1/W2/W4/S0/S2/S3: raised remaining helper text, status chips, selected labels, timeline labels, report metadata, and ON Square labels to readable ink colors.

## Verification
- `npm run build:mockups`: passed.
- Light DOM QA: 43 screens regenerated.
- Dark DOM QA: 43 screens regenerated.
- Light clipped total: 0 across 43 screens.
- Dark clipped total: 0 across 43 screens.
- Light tiny text total: 0 across 43 screens.
- Dark tiny text total: 0 across 43 screens.
- Scroll continuation is tracked separately: C3 has 12 items, C4 has 2 items in both modes.
- Light low-contrast total after this pass: 0.
- Dark low-contrast total after this pass: 0.
- Light short-button count: 102 compact controls/chips.
- Dark short-button count: 102 compact controls/chips.
- H1 light screenshot manually inspected after thumbnail label cleanup.
- H5 light screenshot manually inspected: `비 알림 설정` is visible and no longer hidden by the tab bar.
- C4 light screenshot manually inspected: bottom CTA area matches light mode and no longer creates a heavy dark block.
- Full screenshot regeneration timed out at `Page.captureScreenshot` on the current Chromium run. The QA script now supports `WEATHERON_SCREENSHOTS=0` for stable DOM verification, and screenshot capture should be rerun after reducing asset/rendering load.

## Remaining Risks
- Automated low-contrast candidates are now 0 in both modes, but final accessibility QA should still measure real foreground/background pairs per component because gradients and image backgrounds need visual validation.
- Several compact chips/buttons are still below the ideal 44px touch height. Keep true filters/status chips compact, but primary actions should stay 44px+.
- C3/C4 intentionally continue below the first viewport through scrollable content.

## Step List
1. A1 스플래시: 양호
2. H1 게스트 홈: 양호
3. A2 계정 연결: 양호
4. A3 약관 동의: 양호
5. C1 코디 메인: 양호
6. C2 내 옷장: 양호
7. C3 옷 등록: 양호 - scroll continuation 12
8. C4 코디 상세: 양호 - scroll continuation 2
9. H2 위치 변경: 양호
10. H3 알림 사이드바: 양호
11. H4 우산 추천: 양호
12. H5 강수 타임라인: 양호
13. O1 스플래시: 양호
14. O2 기능 소개: 양호
15. O3 권한 요청: 양호
16. O4 스타일 태그: 양호
17. O5 알림 시간: 양호
18. O6 목적지 등록: 양호
19. G1 출발 메인: 양호
20. G2 목적지 알림: 양호
21. G3 여행 플래너: 양호
22. G4 도보여행: 양호
23. G5 AI 종주: 양호
24. G6 프리미엄: 양호
25. P1 목적지 추가: 양호
26. P2 준비 가이드: 양호
27. P3 목적지 필터: 양호
28. M1 마이 메인: 양호
29. M2 알림 설정: 양호
30. M3 전역 설정: 양호
31. A4 계정 관리: 양호
32. R1 정책 허브: 양호
33. R2 개인정보: 양호
34. R3 광고 동의: 양호
35. R4 광고 배치: 양호
36. W1 날씨 제보 홈: 양호
37. W2 날씨 제보: 양호
38. W3 제보 완료: 양호
39. W4 제보 이력: 양호
40. S0 온스퀘어 시작: 양호
41. S1 내 온스퀘어: 양호
42. S2 날씨 노트: 양호
43. S3 날씨 리액션: 양호
