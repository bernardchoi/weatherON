# Design-only internal TestFlight candidate · 2026-11-09

User authorized design improvements only on main, then Xcode Cloud iOS build and existing internal TestFlight group. No external group/App Store release.

## Integration scope

Base main: `6e5700bdf875f7a1c523461c523a84be298ed129` after fetch. Source combined branch: `feat/ios-approved-design-character-20261109`, commit `4c1b37b8e0a4e4234637fd06dbde984ccb2ba177`.

Included: AccountManagement, DestinationAdd/Care/List, Home outfit forecast layout/spacing, My, OutfitDetail/Outfit, WardrobePreset/Wardrobe, EN/JA copy and design regression guard.

Explicitly excluded per user: all new character assets, HomeMascot components/state/blink, character imports/render/scroll handling in Home, character QA and character implementation documents. Existing combined branch remains intact. No cherry-pick of the combined commit and no new character dependency in this candidate.

Worktrees checked: original `fix/ios-data-notification-weather` at `cc5773a`, combined-design-character branch at `4c1b37b`, both clean. No stashes. Remote fix branch advanced to `49a628f` but is not part of this design-only request. Main baseline retained; no unrelated remote fixes or other feature branches silently merged.

## Verification

TypeScript with preserveSymlinks, localization 2292 keys, design guards, Home width, outfit snapshot, account lifecycle and review regressions passed. Native-module and release-signing source checks passed. Local reused dependencies initially lacked the existing main postinstall ownership patch; copied expo-modules-jsi into this worktree's ignored dependency directory and ran the existing patch without changing other worktree dependencies or tracked configuration. Xcode Cloud runs npm ci + the committed postinstall itself.

Earlier actual-JSX synthetic RN-web checks covered destination16, search10, account-provider20 and My10 render states; not native optics or physical-device proof. No local app export or physical device QA. Xcode Cloud archive and TestFlight processing/distribution must be verified against this commit before completion is claimed. Target only existing internal Team (Expo), never external testers.
