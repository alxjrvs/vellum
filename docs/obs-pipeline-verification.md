# OBS Pipeline Verification (M1 Gate 1)

**Scope:** Issues #7 + #8. This procedure validates the OBS browser source →
OBS Virtual Camera → Discord delivery path that Vellum's runtime depends on
(architecture §5.1 Unit 1D, REQ-027, REQ-038, REQ-039, REQ-040).

This gate cannot be automated from inside the repo: it requires OBS, a real
webcam, the OS Virtual Camera driver, and Discord. Each group member runs it
once on their own machine before M2 feature work begins. A single failure
blocks M1 closure.

## Prerequisites

- OBS Studio ≥ 28 (built-in Virtual Camera; older versions need the
  obs-virtualcam plugin)
- OBS CEF Chromium ≥ 103 (Help → About → "CEF version"). 103 is the floor
  for the Vellum bundle's syntax target
- Discord desktop client (browser client cannot select arbitrary virtual
  cameras on macOS)
- A working webcam capture device
- A built Vellum bundle: `bun run build` produces `dist/index.html` plus
  `dist/assets/`. `obs:check` runs as the last build step and fails the
  build on any regression that would break this gate

## Procedure

### Part A — Browser source loads at 1920×1080 with transparency (issue #7)

1. In OBS, create a new scene.
2. **Sources → Add → Browser**.
   - **Local file:** ON
   - **Local file:** select `dist/index.html` from this repo
   - **Width:** 1920
   - **Height:** 1080
   - **Custom CSS:** leave default
   - **Shutdown source when not visible:** OFF
   - **Refresh browser when scene becomes active:** OFF
   - Click OK.
3. **Sources → Add → Video Capture Device** for the webcam, place it _below_
   the browser source in the scene list.
4. Right-click the browser source → **Properties** → confirm "Page
   permissions" defaults are fine and the page rendered (no blank canvas,
   no asset 404s in OBS log: Help → Log Files → View Current Log).

**Pass criteria:**

- Browser source shows the Vellum HUD content without a blank page
- Webcam pixels are visible through the non-HUD area of the browser source
  (alpha compositing intact)
- OBS log shows no `Failed to load` or 404 entries for `assets/*`

### Part B — Virtual Camera → Discord (issue #8)

1. In OBS: **Start Virtual Camera** (button in the bottom-right Controls
   pane).
2. Open Discord → **User Settings → Voice & Video → Camera** dropdown.
3. Select the OBS Virtual Camera entry (named "OBS Virtual Camera" on
   macOS/Windows; on Linux this is typically `/dev/video10` exposed by
   v4l2loopback).

**Pass criteria:**

- Discord's camera preview shows the composited HUD-on-webcam feed
  immediately
- No "Camera failed to start" or format-rejection error
- Aspect ratio is 16:9 (Discord crops at the tile level, but the source
  feed must be 16:9)

### Part C — Live call confirmation

1. Start a one-person test Discord call (Direct Message → Video Call to
   yourself, or use a private server voice channel with video on).
2. Confirm the local self-view tile shows the composited HUD-on-webcam.
3. Confirm aspect ratio in the tile is 16:9 with no black bars from
   format coercion.

**Pass criteria:**

- Self-tile shows HUD composited over webcam in a 16:9 frame
- No Discord console warning about unsupported camera format

## Failure triage

| Symptom                                        | Likely cause                                                                   | First check                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Blank/white browser source in OBS              | `vite.config.ts` lost `base: './'`, or absolute asset paths in build           | Re-run `bun run build` — `obs:check` should already have caught this     |
| Asset 404 entries in OBS log                   | `dist/assets/*` files missing or path mismatch                                 | `bun run build` and confirm `obs:check` reports relative assets resolved |
| Solid background instead of webcam composition | `body { background: transparent }` lost from bundled CSS                       | `obs:check` should fail the build — re-run                               |
| OBS Virtual Camera missing from Discord        | Virtual camera driver not installed; on macOS OBS asks to install on first run | OBS → Tools → Virtual Camera → confirm driver installed                  |
| Discord rejects the camera                     | OBS canvas not 16:9 (Settings → Video → Base Canvas Resolution)                | Set Base + Output to 1920×1080                                           |
| HUD invisible in Discord, visible in OBS       | OBS scene compositing order wrong (webcam above browser source)                | Drag browser source to the top of the scene list                         |

## Sign-off

When this procedure passes on a group member's machine, comment on
issue #8 with: machine OS, OBS version, OBS CEF version, Discord version,
date. M1 Gate 1 closes when ≥1 group member (the OBS buddy touchpoint
named in the architecture spec) has signed off.
