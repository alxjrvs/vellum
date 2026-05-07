# Implement progress — Issue #10: HP slot track

- **Branch:** feat/10-hp-slot-track
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Adds the second HUD stat track (HP). Uses the existing `StatTrack`
slot-mode (mark/unmark via `onToggleSlot`). Slot count comes from
`character.slotCounts.hp` (per-character class-variable).

`stats.hp` is already typed as `readonly number[]` — the array of
marked slot indices. Reducer toggles indices in/out of the array.

## Files

- `src/character/reducer.ts` — `HP_TOGGLE_SLOT { index }` action toggles index in `stats.hp`
- `src/character/reducer.test.ts` — coverage for toggle (mark, unmark, idempotent toggle)
- `src/components/PlayerHud/HP.tsx` (new) — wires `useCharacter` → `StatTrack` slot mode
- `src/components/PlayerHud/HP.test.tsx` (new)
- `src/components/PlayerHud/index.ts` — export HP
- `src/App.tsx` — render `<HP />` after `<Hope />`

## Acceptance criteria → verification

| AC                                                          | Verification                                                     |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| Bard (HP max=6) renders exactly 6 slots                     | HP.test.tsx with class=Bard fixture                              |
| Class with HP max=7 renders exactly 7 slots                 | HP.test.tsx with slotCounts.hp=7                                 |
| Click first unmarked slot → it marks; no other slots change | HP.test.tsx asserts only [0] marked after click                  |
| Click a marked slot → it unmarks                            | HP.test.tsx pre-marks [0,1], clicks [0], asserts only [1] marked |
| State persisted to localStorage synchronously               | CharacterProvider auto-persists via useEffect (already covered)  |

## Out of scope

- HP threshold indicators (issue #11)
- Damage/heal as deltas vs slot toggles (AC explicitly is mark/unmark)
