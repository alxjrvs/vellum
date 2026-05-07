# Implement progress — Issue #2: System and theme configuration as data files

- **Branch:** feat/2-data-skeleton
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end loop)
- **Started:** 2026-05-07

## Plan summary

Implement Unit 1B per architecture.md §1B (line 166) and §Unit 1B detail (line 1034).
Spec-first: ADRs exist, types are inferable from the ADR-003 schema, Daggerheart
values are extracted from the architecture (Hope=6, Fear=12, Stress 6/12, Armor [0,3,4],
core conditions [Hidden, Restrained, Vulnerable], HP class table SRD-derived).

TDD via `generate` mode: tests assert config values and theme-mount behavior.
StatTrack and component consumption land in issue #3 (separate story per architecture).

## Files

- `src/systems/types.ts` — discriminated-union `SystemConfig` types
- `src/systems/daggerheart.system.ts` — Daggerheart instance
- `src/systems/SystemProvider.tsx` — context + `useSystem()` hook
- `src/themes/types.ts` — `ThemeConfig` types
- `src/themes/daggerheart.theme.ts` — Daggerheart theme tokens
- `src/themes/ThemeProvider.tsx` — applies CSS custom properties to `:root` on mount
- `src/main.tsx` — wrap App in providers
- `src/index.css` — consume theme tokens via `var(--token)` (body stays transparent for OBS)
- Tests for each

## Acceptance criteria → verification

| AC                                                                                | Plan                                                                   |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `daggerheart.system.ts` exists; no stat values hardcoded in components            | Source file + grep verification                                        |
| Theme tokens applied via CSS custom properties; no hardcoded colors in stylesheet | `ThemeProvider` injects CSS vars on mount; `index.css` uses `var(--*)` |
| `tsc` strict-mode clean                                                           | `bun run typecheck` exits 0                                            |
