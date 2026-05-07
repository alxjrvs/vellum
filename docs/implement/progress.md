# Implement progress — Issue #4: localStorage session auto-save and restore

- **Branch:** feat/4-character-persistence
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end loop)
- **Started:** 2026-05-07

## Plan summary

Implement Unit 1C persistence half per architecture.md §Unit 1C (line 1063+) and ADR-003.
Character JSON import (#5) and export (#6) layer on top of this.

- `CharacterState` type per ADR-003 schema
- `useReducer` for character mutations (initial action: `SET_CHARACTER`; future stories add HOPE_INCREMENT etc.)
- `CharacterProvider` lazy-initializes from localStorage synchronously, persists on every change via `useEffect`
- localStorage key: `vellum:character`
- App shows an import prompt placeholder when no character is loaded (no defaults)

## Files

- `src/character/types.ts` — CharacterState type
- `src/character/storage.ts` — localStorage read/write
- `src/character/reducer.ts` — useReducer + actions
- `src/character/CharacterContext.ts` — context (state + dispatch)
- `src/character/CharacterProvider.tsx` — provider with persistence
- `src/character/useCharacter.ts` — `{ character, dispatch }` hook
- `src/character/fixtures.ts` — test character builder
- App.tsx — render import prompt placeholder when no character
- Tests for each

## Acceptance criteria → verification

| AC                                                         | Plan                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------- |
| Reload restores stat values from localStorage in <1s       | Synchronous lazy init reads localStorage; restore test asserts state |
| App mount with no localStorage → import prompt shown       | App renders placeholder when character is null                       |
| State change → localStorage write before next render frame | useEffect writes on dispatch; integration test asserts written value |
