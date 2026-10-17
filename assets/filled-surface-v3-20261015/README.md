# Filled surface v3 integration
Approved source: WeatherON-filled-icons-v3 design package (2026-10-15).
Original 72 SVGs copied without edits; transparent 192px PNG derivatives rendered with Chromium.
Compact assets serve 22/24/28px weather and UI; hero assets serve larger weather detail.
Tabs use theme-specific compact/selected colors without tint; generic UI uses compact silhouette with existing semantic theme tint.
Current weather contract supports clear/cloud/rain/snow/sleet/hail/storm-hail/mixed/storm/dust/unknown. Fog already had an explicit mapping.
Clear night uses night. Storm remains heavy-rain v1: never substitute thunder. Dust uses the approved filled wind fallback.
Hail is an approved original derivative. Sleet, mixed precipitation and unknown state have separate
filled-surface derivatives for both compact and hero presentation; they are intentionally not
substituted with snow, rain or a sunny fallback.

## Filled UI extension

`svg/ui/` contains 21 code-generated, 64×64 source SVGs for the remaining iOS control,
information and wardrobe-category symbols. Each uses two or three black-alpha shallow surfaces;
the 192px derivatives in `png/ui/` retain that depth when callers apply their semantic tint.
This preserves light/dark contrast without turning every category into a thickened outline.

- Controls: back, add, expand, check, delete, notifications, permissions, settings, policy document.
- Weather information: umbrella, droplet, temperature, time and UV.
- Wardrobe: all, outer, bottom, shoes, accessory and an empty-wardrobe state; top keeps the
  approved v3 shirt tab symbol.
- `previews/filled-ui-*.png` and `previews/filled-ui-small-*.png` are checked full-size
  and 16/22/28px render boards for both themes.

`scripts/build-filled-v3-ui-icons.mjs` is the deterministic source for the generic UI files.
`scripts/build-filled-v3-weather-states.mjs` is the deterministic source for the new weather-state
files and `previews/filled-weather-states-*.png`. Neither changes the approved original weather or
navigation SVGs. No app icon or wordmark changes are included.

Validation: mobile TypeScript and icon mapping/regression checks cover theme-aware weather semantics,
tab state assets and the preserved selection/rain-chart behavior. The user confirmed the selection
sheet and rain-chart fixes on device before commit.
