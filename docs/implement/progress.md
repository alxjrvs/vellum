# Implement progress — Issue #19: In-session stat manipulation without alt-tab

- **Branch:** feat/19-in-session-manipulation
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Issue #19 is largely a verify-only check: every Must-Have stat
(Hope, HP, Stress, Armor, core/feature conditions, Fear) is already
manipulable from the Vellum overlay with one click and no modal. Per
REQ-026, the conditions-panel "open + toggle" two-step is explicitly
acceptable.

The remaining concrete change is the `cursor: none` polish from the
issue Notes — the OBS browser source overlays the cursor onto player
video tiles, so hiding it on the transparent canvas background and
showing it only on interactive HUD elements reduces cursor-on-face.

This PR adds:

1. `cursor: none` on `html, body` (the transparent canvas)
2. `cursor: pointer` on every `button` (covers all interactive HUD surfaces)

Per CLAUDE.md meaningful-benefit filter, no new integration test is added:
existing per-component tests already exercise one-click manipulation for
every stat, and "no alt-tab required" is not testable from the DOM. The
existing test suite is the regression net.

## Files

- `src/index.css` — `cursor: none` on canvas background; `cursor: pointer` on `button`

## Acceptance criteria → verification

| AC                                                        | Verification                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| All Must-Have stats updatable from Vellum (no alt-tab)    | App.test.tsx integration test exercises each in one render                  |
| Hope/Fear: exactly one click, no modal                    | Existing Hope.test.tsx + Fear.test.tsx + integration test asserts no dialog |
| Visual update within one render frame                     | React synchronous re-render — implicit in passing tests                     |
| Cursor not visible on transparent canvas (cursor-on-face) | `cursor: none` on html/body, `cursor: pointer` on interactive surfaces      |

## Out of scope

- M2 Gate 2 group review (operational, post-merge)
- Discord-scale legibility validation — issue #20
