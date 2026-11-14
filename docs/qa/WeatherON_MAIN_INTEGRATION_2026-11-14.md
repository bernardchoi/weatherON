# Main integration for internal TestFlight — 2026-11-14

## Scope and source
- Starting remote main: `9f40cb73008b81b989a89ef8187c22833519868e` (native compatibility fixes retained).
- Approved design: `release/ios-design-only-20261109` / `523e0641bf45f7c7f337a994295c7567507cb90d`; merged as `bf17ebf`.
- Character and outfit: `feat/ios-approved-design-character-20261109` / `2d1c888620137b6e9090553d9adc5168840c1847`.
- The character branch predates newer approved screen refinements. Ten conflicting file sections were reconciled by keeping the newer approved design, adding the HomeWeatherMascot rendering and retaining its regression checks. No screen was replaced wholesale with the older character-branch version.
- Main retains the compact wardrobe and outfit UI, centered departure time hierarchy, concise account/logout copy, region-specific account providers and three alert groups. Character receives the same weather/outfit context as Home.
- Removed one unused localization key introduced by older Home text; updated presentation-only source assertions to current approved account, alert-group and destination-delete copy. Behavioral consent/deletion/notification tests remain intact.

## Other work check
Fetched all origin branches; checked existing linked worktrees, status and stash. The separate legacy checkout contains only untracked QA outputs. Its old Android QA worktree has an unrelated uncommitted string-assertion change; preserved and excluded. No unrelated artifacts were staged.

## Verification
Clean lockfile install (`npm ci`) and mobile TypeScript check passed. All source CI checks passed: Android product quality (including 16 consent combinations), iOS release signing contracts, native modules, launch state, reliability, correctness batch, weather/outfit regressions, review regressions, account lifecycle, outfit snapshot, native localization exports and localization (2,274 messages).
Additional approved-design, November 11 refinements, three alert groups, region-provider, home mascot, mascot transitions, artwork registration and outfit mapping checks passed.
These are source/mock tests, not native-device acceptance. Native binary must be built by existing Xcode Cloud workflow, and its source SHA, TestFlight processing and existing internal group availability verified independently.

## Device follow-up
Build 65 feedback reports a crash while closing detailed destination-care alert settings. The integrated three-group settings removes the former expanding details interaction, but this does not prove the original native crash is resolved. Recheck destination-care navigation and settings on the distributed iPhone build, along with character outfit/motion, reduced motion, large text and VoiceOver. No public release or external tester distribution is authorized by this integration.
