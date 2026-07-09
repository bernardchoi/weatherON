# Android Device UI UX QA - 2026-07-09 r2

## Scope

- Device: `000841458003652`
- Screen: 1084 x 2412, density override 375
- Build: local release APK rebuilt from current source at 2026-07-09 18:17 KST
- Install: `adb install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- Audit mode: Product Design combined UI, UX, and screenshot-based accessibility risk check

## Validation

- `npx tsc -p apps/mobile/tsconfig.json --noEmit`: pass
- `npm run check:android-product-quality`: pass
- `npm run check:android-adb-ready`: pass
- `./gradlew :app:assembleRelease --console=plain`: pass
- `adb install -r .../app-release.apk`: pass

## Steps

1. `01-home.png` - Home
   - Health: good
   - Notes: bottom nav labels are visible. Weather, outfit, destination, and decision cards fit the first viewport. Feels-like card is present.

2. `02-departure-list.png` - Departure list
   - Health: good
   - Notes: destination place names and area labels are readable. Selected destination state is clear. Bottom nav label does not clip.

3. `03-destination-care.png` - Destination care detail
   - Health: good
   - Notes: back button is visible and aligned. Detail card and destructive actions clear the bottom nav.

4. `04-outfit-home.png` - Outfit home
   - Health: good
   - Notes: outfit item text and CTA buttons are visible. Today's outfit card clears the tab bar.

5. `05-style-edit.png` - Style criteria edit
   - Health: needs polish
   - Notes: onboarding progress is not shown. Fixed save footer keeps the save action visible, but it overlays the lower part of the current selection card.

6. `06-outfit-detail.png` - Outfit detail
   - Health: needs polish
   - Notes: outfit set and item composition are consolidated. Fixed save footer is visible, but it overlays the start of the next section.

7. `07-outfit-detail-lower.png` - Outfit detail lower area
   - Health: usable
   - Notes: wardrobe entry and save flow are present. Content remains usable after scroll.

8. `08-detail-back-result.png` - Outfit detail back result
   - Health: good
   - Notes: back from outfit detail returns to Outfit.

9. `09-umbrella-from-outfit.png` - Umbrella from Outfit
   - Health: mixed
   - Notes: umbrella screen opens correctly. Bottom nav still highlights Home while opened from Outfit, which can weaken route context.

10. `10-umbrella-back-result.png` - Umbrella back result
    - Health: good
    - Notes: back from umbrella returns to Outfit.

11. `12-wardrobe-entry.png` - Wardrobe entry
    - Health: good
    - Notes: wardrobe opens from outfit detail. Filters and item cards are readable.

12. `13-my.png` - MY
    - Health: good
    - Notes: settings rows and bottom nav labels render without clipping.

## Findings

- Confirmed fixed: destination area text clipping was not reproduced.
- Confirmed fixed: onboarding progress is absent from style criteria edit.
- Confirmed fixed: outfit detail merges outfit set and item composition.
- Confirmed fixed: wardrobe entry is restored.
- Confirmed fixed: umbrella back navigation returns to Outfit.
- Needs polish: fixed footer on style criteria edit overlaps content.
- Needs polish: fixed footer on outfit detail overlaps the next section.
- Needs review: umbrella screen bottom nav active state is Home even when entered from Outfit.

## Evidence Limits

- `uiautomator dump` failed with `ERROR: could not get idle state`, so the audit is screenshot-based.
- Full accessibility compliance was not verified. Screen reader order, focus order, and exact contrast ratios need separate checks.
- `logcat-crash.txt` is empty. No crash evidence was captured during this run.
