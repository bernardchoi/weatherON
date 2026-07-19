# Ambient Surface Naming Decision and Trademark Record

**Screening date:** 2026-07-15

**Decision date:** 2026-07-16

**Status:** Naming decided; historical screening retained

**Source of truth:** `../../NAMING.md`

## 0. Final naming system

| Role | Final name |
|---|---|
| Project | Project Wind |
| Design system | Ambient Surface |
| Visual material | Matte Air |
| Core principles | Soft Density · Quiet Signal · Text First |

`Ambient Surface` is the official design-system name. It was selected because it directly describes an interface layer that responds to environmental context without competing with content.

`Matte Air` names the visual material inside Ambient Surface: diffused light, low-glare translucency, restrained depth, and soft atmospheric separation.

`Perfora Air` is no longer a public-name candidate. It remains only as a legacy codename and compatibility namespace in v1.x files, tokens, CSS custom properties, and implementation types.

## 1. Naming architecture

Use the hierarchy as written:

```txt
Project Wind
└─ Ambient Surface — design system
   ├─ Matte Air — visual material
   └─ Soft Density · Quiet Signal · Text First — core principles
```

Preferred display form:

```txt
Project Wind — Ambient Surface
Built with Matte Air
Soft Density · Quiet Signal · Text First
```

Do not use `Matte Air` as the design-system name or append `Design System` to every product-facing mention. Use `Ambient Surface Design System` only when the category needs to be explicit.

## 2. Legacy compatibility

The following identifiers remain frozen through the v1.x line to avoid breaking existing adopters:

- package and file paths containing `perfora_air` or `perfora-air`
- CSS custom properties beginning with `--pa-`
- Swift/TypeScript identifiers beginning with `PA` or `PerforaAir`
- package scopes such as `@perfora-air/*`

New prose, release titles, Figma descriptions, and metadata display names must use `Ambient Surface`. Renaming compatibility identifiers requires a separately versioned migration plan.

## 3. Historical candidate screening

The earlier search was a preliminary knockout screen, not a legal opinion or clearance memo. Its purpose was to reduce obviously crowded candidates before the naming decision.

| Candidate | Historical outcome |
|---|---|
| Ambient Surface | Selected as the descriptive design-system name |
| Matte Air | Selected as the visual-material name |
| Perfora Air | Retained only as a legacy codename and namespace |
| Poravela | Not selected |
| Aervel | Not selected; later exact-name software usage increased collision risk |
| Luvaira | Not selected; later exact-name commercial usage increased collision risk |
| AerVeil, Poralux | Not selected |
| Veyra, Aivora, Aevora, Aerium | Avoided because existing software, service, or technology signals were found |

The previous recommendation to develop a separate coined external mark is superseded by the 2026-07-16 decision. No candidate shortlist remains active.

## 4. Trademark boundary

`Ambient Surface` and `Matte Air` are intentionally intuitive and descriptive. The decision establishes the project's naming system; it does not claim exclusive trademark availability.

Before a public commercial launch or filing:

1. Search exact, phonetic, spacing, and translation variants in official trademark databases.
2. Review goods and services in relevant Nice classes, especially Classes 9 and 42.
3. Check domains, package registries, design communities, and app stores.
4. Obtain jurisdiction-specific legal clearance.

## 5. Official search references

- USPTO Likelihood of Confusion guidance: https://www.uspto.gov/trademarks/search/likelihood-confusion
- WIPO Nice Classification: https://www.wipo.int/en/web/classification-nice
- WIPO Global Brand Database: https://www.wipo.int/en/web/global-brand-database
- KIPRIS trademark search: https://www.kipris.or.kr/khome/search/searchResult.do?tab=trademark
