# Implement progress — Issue #3: Generic StatTrack component family

- **Branch:** feat/3-stat-track
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end loop)
- **Started:** 2026-05-07

## Plan summary

One `StatTrack` component, two visual modes selected by props:

- **Pip mode** (Hope, Fear): renders `trackLength` pips, first `currentValue` filled, rest empty. `onIncrement` / `onDecrement?` wired to a click target.
- **Slot mode** (HP, Stress, Armor): renders `trackLength` slot buttons, marked per `markedSlots` array, click toggles via `onToggleSlot`.

Mode switch: presence of `markedSlots` ⇒ slot mode; else pip mode.

Props match the issue verbatim: `{ trackLength, currentValue, label, onIncrement, onDecrement?, markedSlots?, onToggleSlot? }`.

Style via theme CSS custom properties — no hardcoded colors/sizes. Single
`StatTrack.css` imported as a side-effect module.

## Files

- `src/components/StatTrack/StatTrack.tsx` — component
- `src/components/StatTrack/StatTrack.css` — themed styles
- `src/components/StatTrack/StatTrack.test.tsx` — render + interaction tests
- `src/components/StatTrack/index.ts` — barrel export

## Acceptance criteria → verification

| AC                                                          | Plan                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Renders Hope/HP/Stress/Fear/Armor from one component family | Five test instances (one per stat) drive the component with config inputs |
| New track type requires zero new component code             | Test instantiates a hypothetical "Momentum" pip track via the same props  |
| Pip track max=6, currentValue=4 ⇒ 4 filled + 2 empty        | Direct render + assert via `data-state` attributes                        |
