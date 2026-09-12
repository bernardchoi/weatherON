# Ambient Surface v1.1 Experimental Add-on

**Date:** 2026-09-12 (WeatherON design review; package version unchanged)
**Purpose:** Experimental add-on package for Ambient Surface after the v1.0 stable internal design-system release.

## Package contents

| Step | Artifact | Purpose |
|---:|---|---|
| 1 | `docs/01_experimental_direction_brief.md` | Lock v1.1 experimental product direction and review gates |
| 2 | `docs/02_experimental_data_to_atmosphere_mapping.md` | Define data → surface/density/lumen/flow mapping |
| 2 | `data/perfora-air.experimental-data-map.v1.1.json` | Machine-readable mapping |
| 2 | `data/perfora-air.experimental-data-map.v1.1.ts` | TypeScript helper |
| 3 | `docs/03_experimental_components.md` | AtmospherePanel / SignalCard v1.1 experimental spec |
| 3 | `data/perfora-air.experimental-components.v1.1.json` | Component metadata |
| 3 | `data/perfora-air.experimental-component-types.v1.1.ts` | Component prop contracts |
| 3 | `data/perfora-air.experimental-components.v1.1.css` | Starter CSS |
| 4 | `docs/04_experimental_figma_design_kit.md` | Figma kit creation guide |
| 4 | `figma/perfora-air.experimental-figma.variables.v1.1.json` | Figma variable blueprint |
| 4 | `figma/perfora-air.experimental-figma.component-matrix.v1.1.json` | Component matrix |
| 4 | `figma/perfora-air.experimental-figma.preview.v1.1.svg` | Figma kit visual preview |
| 5 | `05_usability_test_plan.md` | Moderated test plan |
| 5 | `tests/perfora-air.experimental-usability.scorecard.v1.1.json` | Test scorecard structure |
| 6 | `06_weatheron_adoption_scope.md` | WeatherON integration recommendation |
| 7 | `07_implementation_package.md` | React/SwiftUI package guide |
| 7 | `implementation/` | Starter code |
| 8 | `08_brand_trademark_reexploration.md` | External naming/trademark preliminary screen |

## Recommended execution order

1. Read the WeatherON direction and adoption scope (01, 06).
2. Check stable contracts and the documented gaps in the legacy mapping (02).
3. Make matched home/detail/departure mockups with supported WeatherON data.
4. Compare the internal prototype using the updated plan and scorecard (05).
5. Validate native accessibility and performance, then record the adoption ADR.

## Current decision — 2026-09-12

Translate invisible weather changes into preparation decisions. Keep the Tower of Winds response principle and Quiet Horizon identity together through horizontal structure, a focused ON accent, and a bounded data surface. Generic indoor/schedule mapping and starter code remain research references, not the current WeatherON implementation.
