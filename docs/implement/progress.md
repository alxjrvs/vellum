# Implement progress — Issue #23: Character JSON preparation

- **Branch:** feat/23-character-json-prep
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Issue #23 explicitly notes "Minimal AI leverage — character data is
transcribed from players' Demiplane sheets." The transcription is
inherently per-player manual work: I don't have access to anyone's
Demiplane sheet and shouldn't be inventing values.

What this PR ships is the operator-facing scaffolding that makes the
transcription quick and unambiguous:

- A canonical empty template at `characters/template.character.json`
  that parses cleanly via `parseCharacterJson` (locked in by a new
  test)
- A `characters/README.md` walkthrough explaining how each field maps
  to a Daggerheart sheet, including the class/HP and armor/slot
  tables so the operator doesn't need to look them up
- A `.gitignore` rule that keeps per-player JSONs local (only the
  template is tracked — players' character data shouldn't leak into
  the public repo)

| AC                                                         | Status                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| Class-correct stat caps + identity render from JSON import | Template + walkthrough shipped; per-player transcription is operator work |
| No manual HUD corrections needed after import              | **DEFERRED** — verified by each player at the issue #22 rehearsal         |

## Files

- `characters/template.character.json` (new) — canonical empty
  character matching schema version 1
- `characters/README.md` (new) — walkthrough + class/armor reference
  tables
- `src/character/template.test.ts` (new) — asserts the template
  parses cleanly (regression guard)
- `.gitignore` — ignore per-player `*.character.json` files but
  keep the template tracked

## Out of scope

- Each player's transcribed character JSON (operator/player work,
  files don't live in the repo)
- Validation of per-player JSONs against the operator's sheet —
  per-player verification happens at the #22 rehearsal
