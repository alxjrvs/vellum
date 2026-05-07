# Implement progress — Issue #20: Discord-scale legibility validation

- **Branch:** feat/20-legibility-calibration
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Issue #20 explicitly notes "Minimal AI leverage on this deliverable" —
final calibration requires the M2 Gate 2 group rehearsal on a real
Discord call (#22). What this PR ships is a **first-pass calibration**
that bumps font and pip dimensions toward sizes more likely to be
legible at ~640×360 effective resolution, plus a calibration notes doc
documenting the validation procedure for the operator to use during
the rehearsal.

Concrete changes:

- `font-size-label` 12px → 16px (+33%)
- `font-size-base` 16px → 18px (+12.5%)
- `font-size-heading` 28px → 32px (+14%)
- New `--pip-size` token at 24px (was using `--spacing-md` = 16px, +50%)
- StatTrack pip + slot consume `--pip-size`
- Extend `--spacing-md` consumers unchanged (only the visual stat
  surfaces grow)

These nudges are intentionally modest — large enough to materially help
thumbnail visibility, small enough that they're unlikely to break the
1920×1080 layout before the rehearsal validates the final values.

AC #3 (group review on a real Discord call) is **operationally gated by
issue #22** and is not closed by this PR.

## Files

- `src/themes/types.ts` — add `pipSize` to `LayoutTokens`; bump font defaults
- `src/themes/daggerheart.theme.ts` — set `pipSize: '24px'`; bump font sizes
- `src/themes/cssVars.ts` — emit `--pip-size`
- `src/themes/cssVars.test.ts` — assert new values + `--pip-size`
- `src/themes/ThemeProvider.test.tsx` — same
- `src/components/StatTrack/StatTrack.css` — pip/slot use `var(--pip-size)`
- `docs/legibility-validation.md` (new) — procedure for M2 Gate 2

## Acceptance criteria → verification

| AC                                                   | Status                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| 640×360: all four core stats + identity legible      | First-pass calibration shipped; final validation gated by #22 rehearsal |
| Thumbnail tiles (200–300px): identity + Hope visible | First-pass calibration shipped; final validation gated by #22 rehearsal |
| Group review on real Discord call confirms usability | **DEFERRED** — operational gate on #22 (M2 Gate 2)                      |

## Out of scope

- Final calibration values — pinned by #22 rehearsal
- Visual theming polish — issue #21
