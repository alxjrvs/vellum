# OBS setup kit

Automates the Vellum-specific half of OBS setup: a scene collection with the
**Vellum HUD** browser source pre-configured (1920×1080, transparent). The
browser source points at the **hosted URL**
`https://alxjrvs.github.io/vellum/app/`, so there is **no build or `dist` to
produce** — install the collection and it renders the live app. This doc is the
OBS-install detail; for the full first-time onramp (configure your character →
copy share link → paste into OBS → go live in Discord) start with
`docs/QUICKSTART.md`, and see `docs/runbook.md` for the game-day operator flow.

## Files

- `vellum.scene.json` — importable scene-collection file (fixed valid UUIDs,
  browser source already pointed at the hosted URL).
- `setup-obs.sh` — macOS/Linux installer: regenerates fresh UUIDs and installs
  the file as an OBS scene collection named **Vellum**.
- `setup-obs.ps1` — Windows PowerShell installer (same behavior).

All three paths produce the same result: a **Vellum** scene collection whose
browser source loads the hosted app. They are idempotent and non-destructive —
they only ever write a collection named **Vellum** and never touch your other
collections.

## Install

Pick whichever is easiest — they're equivalent.

### (a) No script — OBS Import (works on every OS)

Because the browser source points at a constant hosted URL, the checked-in
file is directly importable with no substitution step:

1. OBS → **Scene Collection → Import**.
2. Choose `obs/vellum.scene.json` from this repo.
3. **Scene Collection → Vellum** to activate it.

### (b) macOS / Linux — `setup-obs.sh`

Quit OBS first (it rewrites scene files on exit), then:

```sh
obs/setup-obs.sh
```

Picks the scenes dir by OS (`~/Library/Application Support/obs-studio/basic/scenes`
on macOS, `~/.config/obs-studio/basic/scenes` on Linux), regenerates fresh
UUIDs, and writes `Vellum.json`.

### (c) Windows — `setup-obs.ps1`

Quit OBS first, then:

```powershell
powershell -ExecutionPolicy Bypass -File obs\setup-obs.ps1
```

Writes to `%APPDATA%\obs-studio\basic\scenes\Vellum.json`.

The hosted URL is a clearly-marked constant at the top of each script
(`VELLUM_URL` / `$VellumUrl`) — change that one line to point at a different
deploy.

## What's automated vs. manual

**Automated:** the scene collection and the browser-source config (which now
points at the hosted app — no `dist`).

**Manual (OS security / hardware / Discord — can't be scripted):**

1. In OBS, **Scene Collection → Vellum** if it isn't already active.
2. **Sources → + → Video Capture Device** → pick your webcam → drag it
   **below** `Vellum HUD` so the HUD composites on top.
3. **Start Virtual Camera** → approve the first-time system prompt:
   - **macOS:** approve the system-extension prompt (**System Settings →
     Privacy & Security** may need an "Allow").
   - **Windows:** the OBS virtual-camera driver installs with OBS; no prompt
     is normally required.
   - **Linux:** ensure the `v4l2loopback` kernel module is loaded so the
     virtual camera device exists.
4. Discord → **Settings → Voice & Video → Camera → OBS Virtual Camera**.

## GM view

For the GM's Fear-only view, edit the `Vellum HUD` source (double-click →
Properties) and append `?mode=gm` to the URL, or keep a second collection whose
browser source points at `https://alxjrvs.github.io/vellum/app/?mode=gm`.
