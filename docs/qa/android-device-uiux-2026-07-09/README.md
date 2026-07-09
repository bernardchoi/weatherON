# Android Device UI UX QA - 2026-07-09

## Scope

- Device: `000841458003652`
- Screen: 1084 x 2412, density override 375
- Build: local release APK rebuilt from current source and installed on device
- Capture path: `docs/qa/android-device-uiux-2026-07-09/`
- Audit mode: combined UI, UX, and screenshot-based accessibility risk check

## Steps

1. `01-launch.png` - Home
   - Health: good
   - Notes: bottom nav labels are visible. Home destination chips use truncation without vertical clipping.

2. `02-departure-list.png` - Departure list
   - Health: good
   - Notes: destination card place names and area labels render without vertical clipping. Selected card border and alert state are clear.

3. `03-destination-care.png` - Destination care detail
   - Health: good
   - Notes: back button is visible and aligned. Content clears the bottom nav.

4. `04-outfit-home.png` - Outfit home
   - Health: good
   - Notes: today's outfit text no longer clips. CTA buttons clear the bottom nav.

5. `05-style-edit.png` - Style criteria edit
   - Health: needs polish
   - Notes: onboarding progress is removed and the summary card role is clearer. Save section begins under the bottom nav on first view, so the primary save action is not immediately visible.

6. `06-style-edit-save.png` - Style criteria edit lower area
   - Health: usable
   - Notes: save and cancel actions are visible after scrolling. MY save action is removed.

7. `07-outfit-detail.png` - Outfit detail
   - Health: good
   - Notes: today's set and outfit composition are merged into one card. Items and images are legible.

8. `08-outfit-detail-lower.png` - Outfit detail lower area
   - Health: needs polish
   - Notes: wardrobe entry is restored and usable. The next section starts behind the bottom nav, so lower content spacing still needs review.

9. `09-return-outfit-home.png` - Outfit detail back result
   - Health: good
   - Notes: back from outfit detail returns to outfit home.

10. `10-umbrella-from-outfit.png` - Umbrella from outfit
    - Health: mixed
    - Notes: umbrella screen opens correctly. Bottom nav highlights Home even when entered from Outfit, which may confuse route context.

11. `11-umbrella-back-result.png` - Umbrella back result
    - Health: good
    - Notes: back from umbrella returns to Outfit, not Home.

12. `12-wardrobe-entry.png` - Wardrobe entry
    - Health: good
    - Notes: wardrobe screen opens from outfit detail. Filter chips and item cards are readable.

## Findings

- Confirmed fixed: destination card area label clipping was not reproduced.
- Confirmed fixed: onboarding progress is not shown in style criteria edit.
- Confirmed fixed: MY save action is removed from style criteria edit.
- Confirmed fixed: outfit detail merges the set and composition into one card.
- Confirmed fixed: wardrobe entry is restored from outfit detail.
- Confirmed fixed: umbrella back navigation returns to Outfit.
- Needs polish: style edit first viewport still hides the save section under the bottom nav.
- Needs polish: outfit detail lower content still starts behind the bottom nav when scrolled.
- Needs review: umbrella screen highlights Home in the bottom nav when opened from Outfit.

## Evidence Limits

- `uiautomator dump` failed with `ERROR: could not get idle state`, so this audit is based on screenshots and direct device navigation.
- Full accessibility compliance was not verified. Screen reader order, focus order, and contrast ratios need separate checks.
- `logcat-crash.txt` and `logcat-full.txt` were empty after this run; no crash evidence was captured.
