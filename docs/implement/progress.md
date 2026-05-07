# Implement progress — Issue #7: OBS browser source rendering at 1920×1080 with transparency

- **Branch:** feat/7-obs-browser-source
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end loop)
- **Started:** 2026-05-07

## Plan summary

Most OBS-relevant scaffolding shipped earlier:

- `body { background: transparent }` (PR #26 / `src/index.css`)
- `<meta name="viewport" content="width=1920, initial-scale=1">` (PR #25 / `index.html`)
- `vite.config.ts: base: './'` so the build emits relative asset URLs (PR #25)

This story locks those guarantees in place with automated tests and adds
a `Stage` wrapper that fixes the HUD canvas at 1920×1080 with explicit
transparency, so OBS receives a stable, predictable surface. The runtime
OBS smoke test (load the build at `file://`, composite over a webcam,
verify alpha) remains manual — that is the M1 Gate 1 verification step.

## Files

- `src/components/Stage/Stage.tsx` — 1920×1080 transparent root container
- `src/components/Stage/Stage.css`
- `src/components/Stage/Stage.test.tsx`
- `src/components/Stage/index.ts`
- `src/main.tsx` — wrap App in Stage
- `scripts/check-obs-bundle.ts` — verifies the built `dist/index.html` uses
  relative `./assets/...` paths and ships a transparent body rule
- `package.json` — `obs:check` script + `build` runs it after vite build

## Acceptance criteria → verification

| AC                                                               | Plan                                                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| OBS renders without blank page or CORS errors at 1920×1080       | `Stage` forces 1920×1080 dimensions; `obs:check` script asserts relative paths                          |
| Non-HUD areas transparent — webcam shows through                 | `obs:check` greps the bundled CSS for a transparent body rule; Stage CSS sets `background: transparent` |
| Build served via `file://` loads all assets, transparency intact | `obs:check` parses `dist/index.html`, rejects absolute (`/assets/...`) paths, verifies referenced files |

## Manual verification (M1 Gate 1)

The runtime OBS check cannot be automated from this repo. Each session
member runs the following on their own machine:

1. `bun run build`
2. Open OBS → Sources → Add Browser Source → Local file → select
   `dist/index.html`. Width 1920, Height 1080, "Allow Transparency" ON.
3. Composite over a webcam capture source. Confirm the non-HUD canvas
   reveals the webcam (no green spill, no solid background).
4. Confirm OBS console shows no asset 404s. Confirm OBS CEF Chromium is
   ≥ 103 (Help → About).

## Out of scope

- Programmatic Playwright OBS-emulation smoke test — depends on a
  browser MCP/runtime not provisioned for this milestone
- Responsive layout below 1920×1080 — explicit OBS canvas target only
