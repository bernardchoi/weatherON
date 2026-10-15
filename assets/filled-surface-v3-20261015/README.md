# Filled surface v3 integration
Approved source: WeatherON-filled-icons-v3 design package (2026-10-15).
Original 72 SVGs copied without edits; transparent 192px PNG derivatives rendered with Chromium.
Compact assets serve 22/24/28px weather and UI; hero assets serve larger weather detail.
Tabs use theme-specific compact/selected colors without tint; generic UI uses compact silhouette with existing semantic theme tint.
Current weather contract supports clear/cloud/rain/snow/storm/dust. Fog already had an explicit mapping.
Clear night uses night. Storm remains heavy-rain v1: never substitute thunder. Dust retains its original fallback.
Hail/mixed/unknown and other unsupported provider strings retain existing fallback. Their SVG presence does not introduce new provider semantics.
Wardrobe top uses shirt; outer/bottom/shoes/accessory/all retain distinct existing icons because v3 supplies no matching category variants.
No app icon, wordmark, background motion, labels, or provider normalization changed.

Validation: mobile TypeScript and icon mapping/regression checks pass. The integrated build was installed on iPhone 16 Pro Max. Light-mode home, tabs and wardrobe were inspected. Full dark-mode native review remains outstanding; remaining outline icons are intentionally deferred. The user confirmed the selection sheet and rain-chart fixes on device before commit.
