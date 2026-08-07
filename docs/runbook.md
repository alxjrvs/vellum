# Vellum — game-day operator manual

How to **run** Vellum during a live Daggerheart session over Discord. This is
the operator + player flow for people who are already set up. If you have never
done first-time setup, start with **`docs/QUICKSTART.md`** — that's the
one-screen "Paste and Play" onramp. This doc picks up once the HUD is live and
covers what happens during play and when something breaks. The deeper
verification procedures live in `obs-pipeline-verification.md` (M1),
`m2-gate-2-rehearsal.md` (M2), and `m3-gate-3-session.md` (M3).

**The pipeline in one line:** a browser renders your character HUD on a
transparent page → OBS composites it over your webcam → OBS Virtual Camera
feeds that into Discord as your camera.

```
Vellum (hosted app)  ──▶  OBS Browser Source  ─┐
                                                ├─▶ OBS scene ─▶ Virtual Camera ─▶ Discord
Webcam ────────────────▶  Video Capture Device ─┘
```

---

## 0. First time here? Set up first.

Everything up to "the HUD is live in Discord" is covered in one screen:

- **`docs/QUICKSTART.md`** — open `https://alxjrvs.github.io/vellum/app/`,
  configure your character, **Copy share link**, paste it into OBS (or import
  the `Vellum` scene), add your webcam below the HUD, **Start Virtual Camera**,
  pick **OBS Virtual Camera** in Discord.
- **`obs/README.md`** — the three ways to get the Vellum scene into OBS (Import,
  or the macOS/Linux/Windows install scripts) and the manual OS/hardware steps.

The **in-app setup wizard** guides the un-scriptable parts (webcam ordering,
Start Virtual Camera + the OS prompt, picking the camera in Discord) and ends in
a self-test. Reopen it anytime from the always-available **Setup help**
affordance. Nothing about setup blanks your HUD or camera — the wizard is a
dismissible panel, and the HUD holds safe-mode if anything fails to load.

Everyone in the group does the QUICKSTART once and passes the M1 individual
check (`obs-pipeline-verification.md`) before the first real session.

---

## 1. Game-day startup (~15 min before session)

If you're already set up, going live again is short. Do this per person; a "no"
on any line delays the start — the whole point is that nobody falls back to
Demiplane for stat tracking.

1. **Open your scene in OBS** → **Scene Collection → Vellum**. The `Vellum HUD`
   browser source loads the hosted app. Confirm the HUD rendered (no blank
   page).
2. **Confirm your character.** If your marks restored from a previous session,
   you're done — localStorage kept them. If this is a fresh machine or the HUD
   is unconfigured, re-open your **share link** (from `docs/QUICKSTART.md`
   step 3) as the browser-source URL, or click **Edit details** in the HUD.
   Confirm the identity label and HP / Stress / Armor slot counts match your
   sheet.
3. **Webcam still below the HUD?** The `Video Capture Device` source must sit
   **below** `Vellum HUD` so the HUD composites on top.
4. **Start Virtual Camera** (OBS, bottom-right Controls).
5. **Discord → Settings → Voice & Video → Camera → OBS Virtual Camera.** Join
   the session voice channel, camera on.
6. **Group ping test:** each player marks one HP; everyone confirms they saw it
   within ~1 second.

### GM only — the Fear view

The GM runs the same pipeline but loads the HUD in GM mode: point the OBS
browser source at `https://alxjrvs.github.io/vellum/app/#/daggerheart/gm` (or
keep a second scene collection whose source uses that URL). You can also just
open the bare `/app/` URL and pick **GM** from the screen picker.

In a browser tab the GM screen opens on its **setup page** — a short how-to
covering the Fear track, the during-play controls, and the OBS steps — with a
**Launch GM screen** button at the bottom. Launching is remembered, so a reload
goes straight to the live screen; **Setup** on the live screen brings the how-to
back. The **OBS browser source skips the launch step** and comes up live, so
nothing can strand a setup page on your camera mid-session — but **Setup** still
works there if you click it, and **Launch GM screen** takes you back.

The live GM screen shows the **Fear track and the duality dice** — no player
tracks, no identity — and requires **no character setup**, so it works on a
fresh machine or a fresh browser profile.

(Older `?mode=gm` links still work. A source pointed at the bare `/app/` URL
now lands on the picker rather than the player HUD — set it to
`#/daggerheart/player` to skip the picker.)

---

## 2. During play

### Stats — click to change, no modals

- **Hope / HP / Stress / Armor:** click a pip to fill the next one; click a
  filled pip to clear it. Changes render within a frame and are visible to
  everyone on the call immediately.
- State is saved to the browser's localStorage continuously — a page or OBS
  reload restores every value within ~1 second. You do **not** need to
  re-enter your details after a reload; click **Edit details** only if a max
  value was wrong.
- **GM:** adjust the Fear track the same way in the `#/daggerheart/gm` view.

### Rolling — the Duality Dice panel

The overview includes a **Duality Dice** roller (randsum Daggerheart
engine) beside the HUD:

1. Set **Modifier** with the `−` / `+` stepper (supports negatives).
2. Pick **Advantage**, **Disadvantage**, or **None**.
3. Click **Roll**. The result shows:
   - the **total** (Hope die + Fear die + modifier + any adv/dis d6),
   - the **outcome badge** — **With Hope**, **With Fear**, or **Critical!**
     (matching dice),
   - the **Hope / Fear** dice and the applied modifier / advantage die in
     the breakdown.

Rule of thumb it encodes: higher **Hope** die → you act _with Hope_ (gain a
Hope); higher **Fear** die → _with Fear_ (GM gains a Fear); **matching
dice** → a critical success. Apply the fiction per the Daggerheart rules;
Vellum reports the dice, it doesn't auto-adjust your Hope/Fear tracks.

---

## 3. If something breaks (fast recovery)

| Symptom                           | Fix                                                                                                                                                                                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HUD is blank in OBS               | Right-click browser source → **Refresh**. If still blank, re-check the URL points at `…/app/#/daggerheart/player` (or your share link).                                                                                                                                           |
| OBS shows the screen picker       | The source is on the bare `…/app/` URL. Edit its Properties and append `#/daggerheart/player` (or `#/daggerheart/gm`).                                                                                                                                                            |
| HUD looks cut off or off-centre   | The HUD auto-fits whatever size the browser source is, so this means the source is stale — right-click it → **Refresh**. For a pixel-exact 1:1 render set its **Width 1920 / Height 1080**; other sizes scale to fit, and a non-16:9 source letterboxes with transparent margins. |
| Stats look wrong after a reload   | They restore from localStorage automatically. If they don't, re-open your share link, or click **Edit details** and re-enter your maxes (you'll re-mark current state).                                                                                                           |
| Character didn't load in OBS      | OBS's browser source has its own isolated storage — set it up via the **share link** URL, not by configuring a separate tab. See `docs/QUICKSTART.md` step 3.                                                                                                                     |
| Discord shows no OBS camera       | Confirm **Start Virtual Camera** is running in OBS, then re-pick "OBS Virtual Camera" in Discord Voice & Video.                                                                                                                                                                   |
| Wizard covering the HUD           | It's a dismissible panel — dismiss it; the HUD is underneath. Reopen later via **Setup help**.                                                                                                                                                                                    |
| You changed theme tokens recently | Re-run the legibility spot-check in `docs/legibility-validation.md` before relying on Discord-scale readability.                                                                                                                                                                  |

A single browser-source refresh or one details re-entry recovered in under ~30
seconds is a normal minor hiccup — see `m3-gate-3-session.md` for the incident
budget and what counts as a real fallback.

---

## Quick reference

| Where            | URL                                                         |
| ---------------- | ----------------------------------------------------------- |
| Screen picker    | `https://alxjrvs.github.io/vellum/app/`                     |
| Player HUD       | `https://alxjrvs.github.io/vellum/app/#/daggerheart/player` |
| GM / Fear view   | `https://alxjrvs.github.io/vellum/app/#/daggerheart/gm`     |
| Marketing / docs | `https://alxjrvs.github.io/vellum/`                         |
| Your character   | your **share link** (Copy share link → paste into OBS)      |

Extending Vellum (systems, themes) or running from source is a developer path —
see the repo `README.md` and `docs/RELEASE-STRATEGY.md`.
</content>
