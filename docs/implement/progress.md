# Implement progress — Issue #11: HP Major/Severe threshold indicators

- **Branch:** feat/11-hp-threshold-indicators
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Adds visual Major and Severe damage threshold markers to the HP slot track.
Visual marker only — no automatic damage resolution (per AC).

Adds an optional top-level `thresholds: { major: number; severe: number }`
to `CharacterState` (1-indexed position on the HP track). The HP component
forwards them to `StatTrack`, which tags the slot button at the threshold
position with `data-threshold` (`major`, `severe`, or `major-severe` when
they collide). CSS renders an inline label.

Threshold values are sourced from the imported character JSON; deriving
them from level + armor base is out of scope here (no level/equipment
tracking yet).

## Files

- `src/character/types.ts` — add optional `thresholds` field to `CharacterState`
- `src/components/StatTrack/StatTrack.tsx` — accept `thresholds` prop; tag slot buttons
- `src/components/StatTrack/StatTrack.css` — visual M/S marker styling
- `src/components/StatTrack/StatTrack.test.tsx` — coverage for the new prop
- `src/components/PlayerHud/HP.tsx` — forward `character.thresholds`
- `src/components/PlayerHud/HP.test.tsx` — coverage for marker rendering

## Acceptance criteria → verification

| AC                                                                | Verification                                                     |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| Gambeson + Level 1 character → Major at position 2, Severe at 3   | HP.test.tsx with thresholds: { major: 2, severe: 3 }             |
| Unarmored + Level 1 → Major at 1 (Level), Severe at 2 (Level × 2) | HP.test.tsx with thresholds: { major: 1, severe: 2 }             |
| Indicators are visual only — no auto damage resolution            | StatTrack tests assert no extra event handlers / state mutations |
| Character with no thresholds renders no markers                   | HP.test.tsx asserts absence of [data-threshold] when omitted     |

## Out of scope

- Computing thresholds from level + armor base (no level/equipment fields yet)
- Damage application / auto-marking slots when a threshold is crossed
