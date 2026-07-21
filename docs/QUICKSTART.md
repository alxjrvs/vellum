# Vellum — Paste and Play (quick-start)

Get your character HUD onto your webcam in a Discord call. No download, no
build, no terminal. Under a minute of reading; a few minutes of clicking.

**What you need first:** [OBS Studio ≥ 28](https://obsproject.com/) (has the
built-in Virtual Camera), the **Discord desktop app**, and a webcam.

---

## The whole thing, six steps

1. **Open the app** → **https://alxjrvs.github.io/vellum/app/**
   It runs in your normal browser tab and opens on a **picker**: choose your
   game (Daggerheart) and the screen you're running — **Player** or **GM**.
   Each lands on its own address, which is what you paste into OBS:
   - Player → `https://alxjrvs.github.io/vellum/app/#/daggerheart/player`
   - GM → `https://alxjrvs.github.io/vellum/app/#/daggerheart/gm`

   **GMs can stop after this step and go to step 4** — the GM screen needs no
   character setup. It opens on a short how-to; read it and click **Launch GM
   screen** (remembered, so you only do it once). Your OBS source skips that
   page and goes straight to the live screen.

2. **Configure your character.** Fill the **Character details** form with the
   numbers from your Daggerheart sheet (name/class + HP / Stress / Armor / Hope
   maxima), then **Show overlay**.

3. **Copy your share link.** Click **Copy share link** — the button hands you a
   URL with your character baked in. This is the paste-into-OBS transport, and
   it's what gets your character past OBS's separate, isolated browser storage.

4. **Get it into OBS**, either way:
   - **Import the scene** (easiest): OBS → **Scene Collection → Import** →
     choose `obs/vellum.scene.json`, then **Scene Collection → Vellum**. Open
     the `Vellum HUD` source's **Properties** and paste your share link as the
     URL.
   - **Or add a Browser Source by hand:** **Sources → + → Browser**, paste your
     share link as the URL, set 1920×1080.

5. **Add your webcam below the HUD.** **Sources → + → Video Capture Device** →
   pick your camera → drag it **below** `Vellum HUD` so the HUD composites on
   top.

6. **Go live.** **Start Virtual Camera** in OBS (approve the one-time OS prompt
   the first time), then in Discord: **Settings → Voice & Video → Camera →
   OBS Virtual Camera**. Your face, with your stats on it.

---

## Let the in-app wizard drive

You don't have to memorize steps 4–6. The first time you open the app, a small,
dismissible **setup panel** appears and walks you through exactly the manual
parts — and it knows where it is:

- **In a normal browser tab**, it guides the paste-and-play path above and
  surfaces the **Copy share link** action inline.
- **Rendering inside OBS** (the page detects it's the browser source itself),
  it skips everything it can't script and guides only the un-scriptable steps —
  add the webcam capture device under the HUD, **Start Virtual Camera** (+
  approve the OS system-extension prompt), pick the camera in Discord — then
  ends with a **self-test**: _"Click one HP pip — did it move on your camera?"_
  Confirm, and you're done.

The wizard never blanks your HUD or camera. Once you confirm the self-test (or
dismiss it), it remembers and won't reappear; a small **Setup help** affordance
is always there to reopen it.

---

## Runs on your machine — nothing is uploaded

Vellum is static files served over HTTPS. There is **no account, no server, no
telemetry, and no upload** — your character lives in your browser's
localStorage, and your share link carries its data in the URL, not to anyone.
Want zero network at load? The GitHub Release ships an offline zip. Either way,
**nothing about your game leaves your machine.** (You can confirm it yourself:
open the browser network tab — nothing is POSTed.)

---

## Next

- Game day — during-play controls, dice, and fast recovery: `docs/runbook.md`.
- The OBS scene collection and per-OS install scripts: `obs/README.md`.
- Before you rely on it live, run (or read) `docs/validation-protocol.md`.
