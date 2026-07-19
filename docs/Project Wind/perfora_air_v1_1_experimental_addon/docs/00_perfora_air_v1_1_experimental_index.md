# Ambient Surface v1.1 Experimental Add-on

**Date:** 2026-07-15
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

```txt
1. Review Direction Brief
2. Lock Data Mapping
3. Update Components from Mapping
4. Build Figma Kit
5. Run Usability Test
6. Decide WeatherON scope
7. Move React/SwiftUI starter into target repo
8. Run formal trademark clearance for shortlisted names
```

## Key v1.1 experimental decision

Ambient Surface's main differentiator is **not visual polish**. It is this chain:

```txt
invisible data → atmosphere score → surface density → quiet signal → text-first decision
```

If a visual element cannot be traced back to that chain, remove it or demote it.
