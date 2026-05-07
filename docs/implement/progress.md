# Implement progress — Issue #12: Stress slot track

- **Branch:** feat/12-stress-slot-track
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Stress is the third HUD stat track and structurally identical to HP:
slot mode with mark/unmark. Slot count comes from
`character.slotCounts.stress` (default 6, up to 12 via advancement).

Reuses the existing `toggleIndex` helper in `reducer.ts`.

## Files

- `src/character/reducer.ts` — `STRESS_TOGGLE_SLOT { index }` action
- `src/character/reducer.test.ts` — coverage for toggle (mark, unmark, preserve, null state)
- `src/components/PlayerHud/Stress.tsx` (new) — wires `useCharacter` → `StatTrack` slot mode
- `src/components/PlayerHud/Stress.test.tsx` (new)
- `src/components/PlayerHud/index.ts` — export Stress
- `src/App.tsx` — render `<Stress />` after `<HP />`

## Acceptance criteria → verification

| AC                                             | Verification                                                    |
| ---------------------------------------------- | --------------------------------------------------------------- |
| Default Stress cap=6 → renders 6 slots         | Stress.test.tsx default fixture                                 |
| Advanced cap=9 via slotCounts.stress → 9 slots | Stress.test.tsx with slotCounts.stress=9                        |
| Click unmarked → marks; click marked → unmarks | Stress.test.tsx assertions                                      |
| State persisted to localStorage synchronously  | CharacterProvider auto-persists via useEffect (already covered) |

## Out of scope

- Stress thresholds (Daggerheart doesn't use them on the Stress track)
- Stress max enforcement at the reducer level (slotCounts already gates render)
