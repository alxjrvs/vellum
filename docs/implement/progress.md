# Implement progress — Issue #15: Feature condition badges and conditions panel

- **Branch:** feat/15-conditions-panel
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Adds a Conditions panel that hosts both core (Hidden/Restrained/Vulnerable)
and feature condition badges. Panel open/close is local React `useState`
(not persisted). Per REQ-026, one open step before toggle is acceptable —
the AC explicitly says badges are visible only when the panel is open, so
this refactors #14's always-on display into the panel.

Feature conditions come from `character.featureConditions: readonly string[]`
(catalogue) with active state from `character.conditions.feature[name]`.
Reducer adds `FEATURE_CONDITION_TOGGLE { name }`.

## Files

- `src/character/reducer.ts` — `FEATURE_CONDITION_TOGGLE { name }` action
- `src/character/reducer.test.ts` — feature toggle tests
- `src/components/PlayerHud/ConditionsPanel.tsx` (new) — panel with toggle button + badges
- `src/components/PlayerHud/ConditionsPanel.css` (new)
- `src/components/PlayerHud/ConditionsPanel.test.tsx` (new)
- `src/components/PlayerHud/index.ts` — export ConditionsPanel
- `src/App.tsx` — replace `<CoreConditions />` with `<ConditionsPanel />`

## Acceptance criteria → verification

| AC                                                                           | Verification                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Feature conditions from JSON appear alongside core when panel open           | ConditionsPanel.test.tsx with featureConditions: ['On Fire']       |
| Panel toggle button opens the panel; all badges visible/toggleable when open | ConditionsPanel.test.tsx click toggle → badges queryable           |
| Feature condition toggle persists synchronously                              | Reducer tests + CharacterProvider auto-persist (existing coverage) |
| Zero feature conditions → only the three core badges shown (no placeholders) | ConditionsPanel.test.tsx with featureConditions: []                |

## Out of scope

- Cross-checking featureConditions against an SRD catalogue (filed as #30)
- Editing the feature conditions list at runtime (M3 / out)
