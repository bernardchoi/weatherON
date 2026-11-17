# Committed branch integration — 2026-11-17

User requested merging committed WeatherON branch work into main.

- Base: `07dcadbb07fb5546fda3af529ef3503afcc34657`.
- `fix/destination-status-motion` / `01ee9585dc46b1018d804b85ff71d25c11fcc61b`: merged without conflicts (merge `d1a3747`). Compact home summary and larger mascot; measured destination calculation status entry/exit motion.
- `fix/my-profile-character-selection` / `8a6ea06b6c57e32c38718d5a8e0373229818b9b3`: merged without conflicts (merge `cb8bfeb`). Profile selection affordance/framing and localized ONBY/companion names.
- All other 23 non-main remote branch heads are ancestors of the base. Local committed `fix/mac-correctness-batch` also has no outstanding commit. No obsolete branch work was replayed.
- Existing uncommitted OMA setup in the older main worktree and draft outfit/weekday edits in separate worktrees were preserved, not staged. This integration covers committed branches only and does not claim every worktree is clean.

## Verification

PASS: mobile TypeScript no-emit, home-mascot-layout (660 JSX cases), home-update-motion, home-update-state, ambient-motion, profile-character-layout, my-departure-interactions, profile-character, localization-native-exports (127 consumers), mobile locale catalogs (2285 messages), correctness-batch, ios-reliability, git diff --check.

Verification ran on the connected Mac in an isolated integration worktree. Dependency lockfile matched the existing installed dependency tree, reused via a local ignored symlink. No dependency versions changed. Native boundaries were mocked in these tests; no device/simulator or native build/deployment performed. Prior implementation reports remain historical snapshots; this record supersedes their main-not-integrated status for these two commits.

## Pre-build native animation-driver correction

Installed React Native 0.86 AnimatedStyle.__makeNative promotes all animated style siblings; Animation.start rejects subsequent JS animation on a promoted native node. The measured region combined JS height and native opacity in one Animated.View. This was a source-confirmed driver incompatibility, not a device-reproduced crash. Opacity now shares the JS driver with height, keeping bounded 220/160ms timing and current interruption/accessibility behavior. Regression checks now reject mixed driver tracks on every entry, exit and reversal. PASS: home-update-motion/state, ambient-motion, full mobile no-emit typecheck and diff whitespace. Device/render performance remains unverified.
