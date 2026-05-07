# Implement progress — Issue #18: GM Fear pip track

- **Branch:** feat/18-gm-fear-track
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Adds a GM view (`?mode=gm`) that renders a Fear pip track (max 12) instead
of the player tracks. Reuses `StatTrack` in pip mode. Reducer adds
`FEAR_INCREMENT { max }` / `FEAR_DECREMENT` mirroring Hope. Persistence
flows through the existing `CharacterProvider` `useEffect` write to
localStorage.

GM mode detection: a small `useViewMode` hook reads
`URLSearchParams(window.location.search).get('mode')`. App branches at
the top: in GM mode, only `<GmHud />` renders — no Hope/HP/Stress/Armor/
ConditionsPanel/IdentityLabel.

`stats.fear?: number` is already declared optional. Reducer treats
absent fear as 0.

## Files

- `src/character/reducer.ts` — `FEAR_INCREMENT { max }` + `FEAR_DECREMENT`
- `src/character/reducer.test.ts` — fear action tests
- `src/components/GmHud/Fear.tsx` (new)
- `src/components/GmHud/Fear.test.tsx` (new)
- `src/components/GmHud/GmHud.tsx` (new) — frame wrapping Fear
- `src/components/GmHud/GmHud.css` (new)
- `src/components/GmHud/GmHud.test.tsx` (new)
- `src/components/GmHud/index.ts` (new)
- `src/viewMode/useViewMode.ts` (new)
- `src/App.tsx` — branch on view mode
- `src/App.test.tsx` — GM-mode test that asserts player tracks not in DOM

## Acceptance criteria → verification

| AC                                                                                 | Verification                                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `?mode=gm` renders only Fear track + minimal frame; no player stat tracks          | App.test.tsx — set `window.location` search → assert player tracks absent |
| Fear=7, click next unfilled pip → Fear=8, no modal, one render frame               | Fear.test.tsx                                                             |
| Fear at 12, attempt increment → ignored                                            | reducer.test.ts + Fear.test.tsx                                           |
| Click filled pip → Fear decrements by 1                                            | Fear.test.tsx                                                             |
| Fear update written to localStorage synchronously (matches existing Hope behavior) | Existing CharacterProvider auto-persist (well-tested)                     |

## Out of scope

- GM Fear visual polish — covered in #21 (Daggerheart visual theme)
- Discord-scale legibility validation — issue #20
