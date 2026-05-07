# Implement progress — Issue #6: Character JSON export

- **Branch:** feat/6-character-json-export
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end loop)
- **Started:** 2026-05-07

## Plan summary

Mirror the import path in #5. A pure helper builds a `Blob` from the
current `CharacterState` and assembles the suggested filename; a thin
component renders an "Export character" button that, when clicked,
creates an object URL, programmatically clicks an anchor with a
`download` attribute, and revokes the URL. Disabled when no character is
loaded. Round-trip fidelity is verified by feeding the exported text
through `parseCharacterJson` and comparing to the source state.

- `exportCharacter(character)` → `{ blob, filename }` — pure, testable
- `<CharacterExport>` — calls `exportCharacter`, triggers a synthetic anchor click, revokes the URL on the next tick

## Files

- `src/character/exportCharacter.ts`
- `src/character/exportCharacter.test.ts`
- `src/components/CharacterExport/CharacterExport.tsx`
- `src/components/CharacterExport/CharacterExport.test.tsx`
- `src/components/CharacterExport/index.ts`
- App.tsx — render the export control when a character is loaded

## Acceptance criteria → verification

| AC                                                              | Plan                                                                                                           |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Click export → browser downloads `[character-name]-vellum.json` | exportCharacter returns `{ blob, filename: '${slug}-vellum.json' }`; component test asserts download attribute |
| Export → re-import yields identical state                       | Unit test: `parseCharacterJson(await blob.text()).character` deep-equals source                                |
| No network request; Blob + objectURL + download attribute       | Component uses `URL.createObjectURL(blob)` + anchor click, no fetch/XMLHttpRequest                             |

## Out of scope

- File picker dialog ("save as..." with custom path) — requires File System Access API which is Chromium-only and not needed for M1
- Encryption/sharing flows — out of milestone
