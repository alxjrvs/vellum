# Implement progress — Issue #21: Daggerheart visual theme

- **Branch:** feat/21-daggerheart-visual-theme
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Issue #21 has three ACs:

| AC                                                         | Status                                                                |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| Visual treatment reflects parchment / card / gold-black    | First-pass card frame shipped; final aesthetic gated by #22 rehearsal |
| Group review: 3+ players + GM agree it feels Daggerheart   | **DEFERRED** — operational gate on #22 (M2 Gate 2)                    |
| No hardcoded color/typography values; all use `var(--...)` | Already true on `main`; assertion test added to lock in               |

The `cardSurface`, `cardBorder`, and `gold` theme tokens are defined in
`daggerheart.theme.ts` but currently **unused** by any component CSS.
This PR wires them into a parchment-card frame around both the Player
HUD and GM HUD, and uses gold for the identity name + display
headings — making the previously theoretical aesthetic register
visible on screen.

These nudges are intentionally a first pass — the values can be tuned
during the #22 rehearsal without restructuring the markup.

## Concrete changes

- New `PlayerHud.tsx` wrapper component renders the player stats stack
  inside a card frame using `--color-card-surface` /
  `--color-card-border`
- `GmHud.css` adds the same card frame treatment
- `IdentityLabel.css` — name span uses `--color-gold`
- `index.css` — `h1, h2, h3` headings use `--color-gold` as the
  display accent (was `--color-ink`)
- `App.tsx` uses `<PlayerHud />` instead of inlining the player stats
- Regression test added: scan repo CSS files and assert no hardcoded
  `#hex` / `rgb()` / `rgba()` values exist outside `src/themes/`

## Files

- `src/components/PlayerHud/PlayerHud.tsx` (new)
- `src/components/PlayerHud/PlayerHud.css` (new)
- `src/components/PlayerHud/PlayerHud.test.tsx` (new)
- `src/components/PlayerHud/index.ts` — export `PlayerHud`
- `src/components/PlayerHud/IdentityLabel.css` — name uses
  `--color-gold`
- `src/components/GmHud/GmHud.css` — add card frame
- `src/index.css` — headings use `--color-gold`
- `src/App.tsx` — replace inline stats with `<PlayerHud />`
- `src/themes/no-hardcoded-values.test.ts` (new) — regression assertion

## Out of scope

- Final aesthetic values — pinned by #22 rehearsal
- Frame flourishes (corner ornaments, parchment textures) — would need
  an asset pipeline; deferred until rehearsal validates the simpler
  treatment
