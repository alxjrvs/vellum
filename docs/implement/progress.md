# Implement progress — Issue #5: Character JSON import

- **Branch:** feat/5-character-json-import
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end loop)
- **Started:** 2026-05-07

## Plan summary

Layer JSON import on top of the persistence pipe shipped in #4. A
`<input type="file" accept=".json,application/json">` reads the file via
the File API, runs the bytes through a runtime validator, and dispatches
`SET_CHARACTER` on success. Failures surface a human-readable message and
leave the existing character state untouched.

- `parseCharacter(unknown)` → `{ ok: true, character } | { ok: false, error }`
  validates schema version, system, identity, stats arrays, slot counts,
  conditions shape, featureConditions array. Pure function; no I/O.
- `<CharacterImport>` renders the file input and an aria-live error region.
  Reads the selected file with `FileReader.readAsText`, parses, validates,
  dispatches.
- App renders `<CharacterImport>` always (so a player can swap mid-session)
  alongside the placeholder/identity summary.

## Files

- `src/character/parseCharacter.ts` — runtime validator
- `src/character/parseCharacter.test.ts`
- `src/components/CharacterImport/CharacterImport.tsx`
- `src/components/CharacterImport/CharacterImport.test.tsx`
- `src/components/CharacterImport/index.ts`
- App.tsx — mount the import control
- App.test.tsx — covers import success + invalid-file paths

## Acceptance criteria → verification

| AC                                                                                 | Plan                                                                                                                    |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Valid JSON file → all fields loaded into active character state                    | Integration test: select valid file → `useCharacter().character` matches input                                          |
| Missing/invalid required fields → clear error, app does not crash, state preserved | parseCharacter returns `{ ok: false, error }` for each AC; integration test asserts error visible + character unchanged |
| Non-JSON or malformed JSON → clear error, no crash                                 | Validator wraps `JSON.parse` in try/catch; integration test selects malformed file                                      |

## Out of scope

- UI polish (button styling, drag-and-drop) — deferred to UI pass
- Migration between schema versions (only v1 exists today; reject others with a clear error)
