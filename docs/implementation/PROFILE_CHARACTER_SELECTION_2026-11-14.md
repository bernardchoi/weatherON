# Device-local profile character selection

## Scope / status
- Implemented in isolated Mac worktree `weatheron-profile-character`, branch `feat/local-profile-character-20261114`, base `8e09b95`.
- Reviewed for the separately authorized commit/push on 2026-11-14. Not merged into main or built/deployed to TestFlight. Git history and remote branch identify publication status.
- Other concurrent main/build worktrees untouched.
- User approved companion11 plus weather-identity restored Wind/Mist12. No new motions.

## Assets
- Solar/Rain/Storm/Frost: exact crops from `WeatherON-profile-11-proposal.png`.
- Wind/Mist: exact crops from `WeatherON-wind-mist-12-generation-source.png` only. Other generated12 characters NOT used.
- Deterministic unscaled extraction into transparent512 canvases; source/output SHA256 and crop rectangles in `apps/mobile/assets/characters/profile/provenance.json`.
- Original sheets preserved outside checkout in sibling `profile-character-source`; reproducible extraction script included. No redrawing, recoloring, regenerated approximations or remote image requests.

## Behavior
- My page keeps existing default profile icon until explicit selection.
- Separate character button leaves account management action intact.
- Choices: existing default, existing main mascot, six companions.
- Guests and linked accounts can choose; preference is device-local, not account-specific and not synced. Modal explicitly says saved only on this device.
- Separate versioned storage key in existing SQLite app_meta / web localStorage. No schema migration or full-state write and no other settings overwritten.
- Initial reads never write defaults. Invalid/future values render default without rewriting stored data; explicit user choice replaces them.
- Strict read errors block selection and offer retry. Strict save failures retain previous choice. Busy guard prevents repeated taps. Shared write queue/read barrier survives screen unmount/remount.
- No account/provider profile mutation or network API. Local choice remains across account connection/logout because it is a device preference.
- ko/en/ja copy, accessible selected/disabled states, scrollable picker, >=44px actions, Reduce Motion-aware existing pressable and no modal animation.

## Verification
PASS `node scripts/check-profile-character.mjs`: eight ID roundtrips; malformed/future ID fallback; no initial overwrite; web save/reload/errors; unrelated data preservation; six source/output hashes/alpha; actual native appStorage module against in-memory SQLite, failure rollback and serialized writes; delayed-write/remount barrier.
PASS `tsc --noEmit -p apps/mobile/tsconfig.json`.
Read-only peer review identified non-iOS image sizing, default preview mismatch, and remount race; all addressed with matching40/48px image sizing, existing default icon preview, shared persistence barrier + regression test.

NOT VERIFIED: interactive UI, VoiceOver focus, on-device SQLite/Retina/large-text behavior. IAB unavailable and browser inventory empty in this tool session. Existing Puppeteer plus installed Chrome both failed to launch (Code:null, no stderr). This is a tool/browser launch blocker, NOT evidence that Mac is locked. No software installation or security changes attempted.
A local Metro preview was started but does not count as UI validation. No release claim.

## Before integration
Review actual My/selector UI on iOS with guest + linked accounts, close/reopen/relaunch, 200% text, dark/light, VoiceOver, and storage errors. Confirm default/main/six images. Commit/push are authorized separately on 2026-11-14; main integration and deployment remain outside this change.
