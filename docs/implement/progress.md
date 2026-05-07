# Implement progress — Issue #9: Hope pip track

- **Branch:** feat/9-hope-pip-track
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Adds the first interactive HUD element. Wires the existing
`StatTrack` (pip-mode) to a Hope action handler in the
character reducer and renders it inside `<App>`.

Per AC, click semantics on Hope are state-dependent:

- Click on **empty** pip → increment Hope (capped at system max 6)
- Click on **filled** pip → decrement Hope (floored at 0)

The current `StatTrack` PipRow uses `onClick → onIncrement` for every pip
and `onContextMenu → onDecrement` (right-click). The right-click
decrement was scaffolding without an AC behind it; this story refactors
PipRow so when both `onIncrement` and `onDecrement` are provided, the
click direction follows the pip's filled state. Single-handler usages
(only `onIncrement`) keep current behavior.

## Files

- `src/character/reducer.ts` — add `HOPE_INCREMENT { max }` + `HOPE_DECREMENT` actions; cap at max, floor at 0
- `src/character/reducer.test.ts` — coverage for both actions including bounds
- `src/components/StatTrack/StatTrack.tsx` — state-aware click in PipRow when both handlers provided; drop right-click decrement
- `src/components/StatTrack/StatTrack.test.tsx` — update to new click semantics
- `src/components/PlayerHud/Hope.tsx` (new) — wires `useCharacter` + `useSystem` → `StatTrack`
- `src/components/PlayerHud/Hope.test.tsx` (new)
- `src/components/PlayerHud/index.ts`
- `src/App.tsx` — render `<Hope />` when character loaded

## Acceptance criteria → verification

| AC                                                   | Verification                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| Hope=4 renders 4 filled / 2 empty (max 6)            | StatTrack pip test (already covered) + Hope component integration test  |
| Click empty pip increments to 5; one render frame    | Hope.test.tsx clicks pip[4], asserts dispatch; React state updates sync |
| Hope at max — increment ignored                      | reducer.test bounds + Hope at max renders no empty pip to click         |
| Click filled pip decrements; one render frame        | Hope.test.tsx clicks pip[3] when Hope=4, asserts dispatch               |
| State change persisted to localStorage synchronously | CharacterProvider auto-persists via useEffect — already covered         |

## Out of scope

- Keyboard manipulation (no AC)
- Animation / transitions (no AC)
- Hope cost confirmation modal (explicitly excluded by AC)
