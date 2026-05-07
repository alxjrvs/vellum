# Implement progress — Issue #13: Armor slot track

- **Branch:** feat/13-armor-slot-track
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Adds the Armor HUD stat track. Same slot-mode shape as HP/Stress, with
one wrinkle: unarmored characters (`slotCounts.armorSlots === 0`) render
nothing — the track is absent rather than an empty header.

## Files

- `src/character/reducer.ts` — `ARMOR_TOGGLE_SLOT { index }` action
- `src/character/reducer.test.ts` — coverage for toggle (mark, unmark, preserve, null state)
- `src/components/PlayerHud/Armor.tsx` (new) — wires `useCharacter` → `StatTrack`; null when 0 slots
- `src/components/PlayerHud/Armor.test.tsx` (new)
- `src/components/PlayerHud/index.ts` — export Armor
- `src/App.tsx` — render `<Armor />` after `<Stress />`

## Acceptance criteria → verification

| AC                                             | Verification                                                    |
| ---------------------------------------------- | --------------------------------------------------------------- |
| Leather (3 slots) → 3 unmarked slots           | Armor.test.tsx with slotCounts.armorSlots=3                     |
| Unarmored (0 slots) → no slots / track absent  | Armor.test.tsx with slotCounts.armorSlots=0; queryByRole=null   |
| Full Plate (4 slots) → 4 slots                 | Armor.test.tsx with slotCounts.armorSlots=4                     |
| Click unmarked → marks; click marked → unmarks | Armor.test.tsx assertions                                       |
| State persisted to localStorage synchronously  | CharacterProvider auto-persists via useEffect (already covered) |

## Out of scope

- Armor base damage threshold (covered by issue #11 thresholds field)
- Armor type selection / switching (no equipment UI in M2 scope)
