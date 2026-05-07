# Implement progress — Issue #14: Core condition badges

- **Branch:** feat/14-core-condition-badges
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Adds the three core condition badges (Hidden, Restrained, Vulnerable) to
the Player HUD. Each badge is a button that toggles the corresponding
`character.conditions.core[id]` boolean. No modal — single-click toggle.

The system config already declares `coreConditions: [{id, label}]` and
character state already carries `conditions.core: Record<CoreConditionId, boolean>`.

## Files

- `src/character/reducer.ts` — `CONDITION_TOGGLE { condition: CoreConditionId }`
- `src/character/reducer.test.ts` — toggle tests
- `src/components/PlayerHud/CoreConditions.tsx` (new)
- `src/components/PlayerHud/CoreConditions.css` (new)
- `src/components/PlayerHud/CoreConditions.test.tsx` (new)
- `src/components/PlayerHud/index.ts` — export CoreConditions
- `src/App.tsx` — render `<CoreConditions />` after `<Armor />`

## Acceptance criteria → verification

| AC                                                            | Verification                                         |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| Three badges shown (Hidden, Restrained, Vulnerable), inactive | CoreConditions.test.tsx default-fixture assertion    |
| Click inactive → renders active; no modal                     | CoreConditions.test.tsx click → data-state='active'  |
| Click active → renders inactive (toggle off)                  | CoreConditions.test.tsx pre-set + click → 'inactive' |
| State persisted to localStorage synchronously                 | CharacterProvider auto-persists (already covered)    |

## Out of scope

- Feature condition badges (issue #15)
- Custom condition catalogue management (out of M2 scope)
