# OBS setup kit

Automates the Vellum-specific half of OBS setup: a scene collection with the
**Vellum HUD** browser source pre-configured (1920×1080, transparent, pointed
at your built `dist/index.html`). See `docs/runbook.md` for the full game-day
flow.

## Files

- `vellum.scene.json` — scene-collection template (path/UUID placeholders).
- `setup-obs.sh` — substitutes the real dist path + fresh UUIDs and installs
  it as an OBS scene collection named **Vellum**. Idempotent; refuses to run
  while OBS is open (OBS rewrites scene files on exit); never touches your
  other collections.

## Use

```sh
bun run build          # produce dist/index.html
obs/setup-obs.sh       # installs the "Vellum" collection (defaults to ./dist)
# or point at another build:
obs/setup-obs.sh /absolute/path/to/dist/index.html
```

## What's automated vs. manual

**Automated:** OBS install (`brew install --cask obs`), the scene collection,
and the browser-source config.

**Manual (macOS security / hardware / Discord — can't be scripted):**

1. In OBS, **Scene Collection → Vellum** if it isn't already active.
2. **Sources → + → Video Capture Device** → pick your webcam → drag it
   **below** `Vellum HUD` so the HUD composites on top.
3. **Start Virtual Camera** → approve the macOS system-extension prompt the
   first time (**System Settings → Privacy & Security** may need an "Allow").
4. Discord → **Settings → Voice & Video → Camera → OBS Virtual Camera**.

## GM view

For the GM's Fear-only view, edit the `Vellum HUD` source (double-click →
Properties) and append `?mode=gm` to the local file, or keep a second
collection whose browser source points at `dist/index.html?mode=gm`.
