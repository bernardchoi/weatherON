# WeatherON Current Design Direction Audit

- Date: 2026-07-03 KST
- Scope: current mobile web dist, 390x844 viewport
- Evidence: `screenshots/01-home.png`, `screenshots/02-departure.png`, `screenshots/03-my.png`
- Capture note: Codex in-app browser tool was unavailable in this session. Static dist was served locally on `127.0.0.1:8094`; Puppeteer/Chromium required escalated execution because sandbox blocked browser launch.

## 기준

- Brand direction: Clear Navy + Warm Sun, Sky/Clear/Rain/Mist function colors.
- Product principle: 5-second decision, not raw weather data display.
- MVP structure: Home / Departure / MY as primary bottom tabs.
- Visual QA risks from prior mockup audit: text density, chip/status overuse, low-contrast helper text, CTA/tabbar safety.

## Step Health

| Step | Surface | Health | Notes |
|---:|---|---|---|
| 1 | Splash entry | Good | Brand mark, navy field, warm primary CTA, guest-first home entry are aligned. |
| 2 | Home | Improving | Strong WeatherON identity and 3-tab MVP structure. Main weather card feels productized, but lower quick-action text truncates and the first viewport still reads dense. |
| 3 | Departure | Mixed | MVP direction is clear and CTA is obvious. Empty lower half and oversized background arc make the screen feel unfinished when no destination exists. |
| 4 | MY | Improving | IA is clear and account/permission/settings separation is better. Visual weight is heavy because several warning/check badges compete at once. |

## Findings

1. Direction is mostly correct.
   - The current UI follows Clear Weather UI better than the older heavy Navy/Gold direction.
   - Bottom nav is now `홈/출발/MY`, matching the MVP IA.
   - The app feels more like a real mobile product than a planning dashboard.

2. Home is close, but not polished enough.
   - The hero weather card has clear hierarchy.
   - `강수 타임라인` body copy is visibly truncated in the quick-action card.
   - Status and source copy still packs many conditions into one line.

3. Departure empty state needs visual finishing.
   - User goal is clear: add destination.
   - The lower half is mostly decorative empty space.
   - The giant background arc makes the screen feel like a placeholder instead of a finished empty state.

4. MY is structurally good but visually noisy.
   - Account, readiness, permission, notification, display, policy are separated well.
   - Red warning badges appear repeatedly and make the screen feel more urgent than necessary.
   - Helper text contrast is acceptable by screenshot, but still low-emphasis and should be checked numerically.

5. Accessibility risks remain screenshot-limited.
   - Tap targets look large enough in the captured screens.
   - Screenshot alone cannot prove screen-reader order, focus recovery, native dynamic type, or true contrast ratio.

## Verdict

Applied design direction: aligned.

Visual completeness: not launch-polished yet. Current level looks like a solid MVP UI pass, roughly 60-70% against the documented mockup direction for these three surfaces. Main remaining work is not brand direction; it is screen-by-screen polish, density reduction, empty-state composition, and contrast verification.

## Recommended Order

1. Home: fix truncated quick-action text and simplify preparation/source status copy.
2. Departure: redesign no-destination empty state so the lower half has useful content or calmer spacing.
3. MY: reduce repeated red warning pills; reserve red only for blocking states.
4. Run light mode and dynamic text screenshot checks before calling visual polish complete.
5. Run native TalkBack/VoiceOver and touch target checks before release-readiness judgment.

## Follow-up Applied

- Date: 2026-07-03 KST
- Evidence: `../product-design-polish-2026-07-03/screenshots/01-home-after.png`, `02-departure-after.png`, `03-my-after.png`
- Verification: `npm run export:android-web`, `npm run check:android-small-screen-layout`, `npm run check:android-web-preview-server`

| Surface | Applied |
|---|---|
| Home | Quick-action text now supports 2 lines, status/source copy reduced, unread bell no longer uses Gold border |
| Departure | Empty state now includes first-destination CTA plus 출발 시간/비 그침 benefit cards; background arc softened |
| MY | Warning/info tones split; non-blocking setup uses `설정`/Sky tone, blocking `확인` remains reserved |

Visual completeness after this pass is improved, but release-readiness still depends on light mode, dynamic text, contrast, and native accessibility QA.

## Superseding Design Spec

- Date: 2026-07-03 KST
- Source: `docs/design/WeatherON_UI_Design_Spec.md`
- 이 감사의 3탭 평가는 당시 구현 표면 기준임.
- 이후 통합 디자인 스펙에서 목업 우선순위를 확정했으므로, 탭/아이콘/컴포넌트 판단은 통합 스펙을 우선한다.
