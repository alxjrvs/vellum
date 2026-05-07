# Implement progress — Issue #16: Character identity label

- **Branch:** feat/16-identity-label
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Adds an `IdentityLabel` component that renders `Name — Class, Ancestry`
from `character.identity` whenever a character is loaded. Replaces the
ad-hoc `<p>Loaded: ...</p>` line currently in `App.tsx`.

When no character is loaded, the label renders nothing (no placeholders).
Visual sizing targets ~640×360 video-tile legibility (REQ for #20 will
formally validate this — for now, use existing display font + label size
tokens).

## Files

- `src/components/PlayerHud/IdentityLabel.tsx` (new)
- `src/components/PlayerHud/IdentityLabel.css` (new)
- `src/components/PlayerHud/IdentityLabel.test.tsx` (new)
- `src/components/PlayerHud/index.ts` — export `IdentityLabel`
- `src/App.tsx` — replace ad-hoc `<p>Loaded: ...</p>` with `<IdentityLabel />`

## Acceptance criteria → verification

| AC                                                     | Verification                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| Renders `Name — Class, Ancestry` from identity JSON    | IdentityLabel.test.tsx — assert exact text content                  |
| No character loaded → no placeholder/hardcoded strings | IdentityLabel.test.tsx with null character → component returns null |
| Legible at ~640×360                                    | Uses `--font-family-display` + `--font-size-label`; #20 validates   |

## Out of scope

- Optional identity fields (subclass/community/level) — issue #17
- Discord-scale legibility validation — issue #20
