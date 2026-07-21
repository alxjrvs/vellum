# Vellum

**Your character sheet, on your face.** A local-only, TTRPG-system-aware camera
overlay: a web app renders your character HUD, OBS composites it over your
webcam, and OBS Virtual Camera feeds that into Discord as your camera. Live
Hope / HP / Stress / Armor, right on your video tile.

Ships the Daggerheart frame — Player HUD (Hope / HP / Stress / Armor /
Conditions / Identity) and a GM Fear view — and is built data-driven so adding a
system is config + components, not a rewrite.

## 60-second quick-start

No download, no build, no terminal:

1. Open **https://alxjrvs.github.io/vellum/app/** in a browser tab and pick your
   game and role. (Running the game? Choose **GM** — it needs no character setup
   and you can stop after step 3.)
2. Fill in your character; click **Copy share link**.
3. In OBS, add a Browser Source with that link (or import the Vellum scene),
   put your webcam **below** the HUD, and **Start Virtual Camera**.
4. In Discord, pick **OBS Virtual Camera**.

The full one-screen walkthrough is **[`docs/QUICKSTART.md`](docs/QUICKSTART.md)**,
and an in-app wizard guides the manual OBS/Discord steps for you.

**Runs entirely in your browser — nothing is uploaded.** No account, no server,
no telemetry: your character lives in your browser's localStorage and travels in
your share link, never to anyone. (Want zero network at load? The GitHub Release
ships an offline zip.)

## Quality goals

1. **In-session responsiveness** — stat manipulation updates within one render frame, no modal.
2. **Refresh resilience** — all stat values restored from localStorage within 1 second after any page reload.
3. **Legibility at Discord call scale** — critical values and identity label readable at 640×360 tile, primary stats parseable at 200–300px thumbnail.

## Constraints

- Local-only at runtime — no network, no auth, no telemetry, no external APIs.
- TypeScript throughout, strict mode.
- Modern Chromium target (OBS browser source = CEF).
- 1920×1080 OBS canvas; 640×360 in-call effective size.

## Documentation

- `docs/QUICKSTART.md` — the one-screen "Paste and Play" onramp (start here).
- `docs/runbook.md` — game-day operator manual (during-play, dice, recovery).
- `obs/README.md` — get the Vellum scene into OBS (Import, or per-OS scripts).
- `docs/validation-protocol.md` — the human macOS/Windows/Linux go/no-go check.
- `docs/RELEASE-STRATEGY.md` — distribution, positioning, and release surface.
- `docs/PRD.md` — product requirements (Ideate phase output).
- `docs/architecture.md` — Arc42 architecture document (sections 1–12 + Appendices A–D).

## Status

**0.2.0 "Paste-and-Play" — in progress.** 0.1.0 made Vellum composable; 0.2.0
makes it obtainable: the app is hosted on GitHub Pages, character config travels
in a share link, and the OBS scene installs on macOS, Windows, and Linux
pointed at the hosted URL. Still honest work-in-progress — the in-app setup
wizard and the cross-OS human validation (`docs/validation-protocol.md`) are the
gate before tagging. Issues, milestones, and the project board track the work
breakdown from `docs/architecture.md` Appendix A.
