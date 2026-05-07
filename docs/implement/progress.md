# Implement progress — Issue #17: Optional identity fields

- **Branch:** feat/17-optional-identity-fields
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Extends `IdentityLabel` to optionally include `level`, `subclass`, and
`community` when present in `character.identity`. The base format remains
`Name — Class, Ancestry`; optional fields are interleaved without
producing empty fragments when absent.

Format:

```
Name — [Lvl N] Class[ (Subclass)], Ancestry[, Community]
```

Examples:

- `Seraphine — Bard, Elf` (no optional)
- `Seraphine — Lvl 3 Bard, Elf` (level only)
- `Seraphine — Bard (Troubadour), Elf` (subclass only)
- `Seraphine — Lvl 3 Bard (Troubadour), Elf, Wildborne` (all)

`CharacterIdentity` already declares all three optional fields — no
schema change needed.

## Files

- `src/components/PlayerHud/IdentityLabel.tsx` — render optional fields
- `src/components/PlayerHud/IdentityLabel.test.tsx` — add cases for each combination

## Acceptance criteria → verification

| AC                                                                          | Verification                                        |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| Subclass + level included when JSON provides them                           | IdentityLabel.test.tsx — subclass+level case        |
| Optional fields absent → no empty placeholders; only Name — Class, Ancestry | IdentityLabel.test.tsx — base case (already exists) |

## Out of scope

- Discord-scale legibility validation — issue #20
