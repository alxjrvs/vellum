# Vellum — game-day runbook

How to run Vellum as the stat tracker for a live Daggerheart session over
Discord. This is the condensed operator + player flow; the deeper
verification procedures live in `obs-pipeline-verification.md` (M1),
`m2-gate-2-rehearsal.md` (M2), and `m3-gate-3-session.md` (M3).

**The pipeline in one line:** a browser renders your character HUD on a
transparent page → OBS composites it over your webcam → OBS Virtual Camera
feeds that into Discord as your camera.

```
Vellum (dist/index.html)  ──▶  OBS Browser Source  ─┐
                                                     ├─▶ OBS scene ─▶ Virtual Camera ─▶ Discord
Webcam ─────────────────────▶  Video Capture Device ─┘
```

---

## 1. One-time setup (per machine, before game day)

- [ ] **OBS Studio ≥ 28** installed (built-in Virtual Camera). Check
      **Help → About → CEF version ≥ 103**.
- [ ] **Discord desktop client** (the browser client can't pick a virtual
      camera on macOS).
- [ ] A working webcam.
- [ ] **bun** installed (`curl -fsSL https://bun.sh/install | bash`).
- [ ] Repo cloned, then from the repo root run the two commands below.

```sh
bun install
bun run build      # produces dist/index.html + dist/assets/
```

`bun run build` runs `obs:check` last and fails if the bundle would break the
OBS path — a clean build is your green light.

- [ ] Install OBS and pre-load the Vellum scene collection (handles the
      browser-source config for you):

```sh
brew install --cask obs
obs/setup-obs.sh      # installs the "Vellum" browser-source scene collection
```

See `obs/README.md` for what's automated vs. the manual macOS/Discord steps.

Everyone in the group does this once and passes the M1 individual check
(`obs-pipeline-verification.md`) before the first real session.

---

## 2. Know your character's numbers (before the session)

You enter your character in an in-app **Character details** form — no files
to prepare. Come with these values from your Daggerheart sheet ready to type:

- **Identity** — name, class, ancestry (+ optional subclass / community /
  level).
- **Max values** — the HUD's pip maximums: **HP slots** (by class),
  **Stress slots** (default 6), **Armor slots** (by equipped armor), and
  **Starting Hope** (usually 2). The class/armor tables are in
  `characters/README.md`.
- **HP thresholds** (optional) — the **Major** / **Severe** HP slot
  positions (1-indexed) → the **M** / **S** markers on the HP track.

Current HP/Stress/Armor marks start empty and fill in as you click during
play. To rehearse before game day: `bun run dev`, open the printed URL, fill
the form, and click **Show overlay**.

---

## 3. Game-day startup (~30 min before session)

Do this per person. A "no" on any line delays the start — the whole point
is that nobody falls back to Demiplane for stat tracking.

### a. Load the HUD in OBS

If you ran `obs/setup-obs.sh` (section 1), the browser source is already
built:

1. OBS → **Scene Collection → Vellum**.
2. **Sources → + → Video Capture Device** (your webcam) — drag it **below**
   `Vellum HUD` so the HUD composites on top.
3. Confirm the HUD rendered (no blank page). Check **Help → Log Files → View
   Current Log** for any `assets/*` 404.

<details><summary>Adding the browser source by hand instead</summary>

**Sources → + → Browser**: Local file ON → your built `dist/index.html`;
Width 1920, Height 1080; **Shutdown when not visible** OFF; **Refresh when
scene becomes active** OFF.

</details>

### b. Set your character details

The HUD is a live web page, so you drive it through OBS's Interact window:

- Right-click **Vellum HUD → Interact** — a window opens where your clicks
  reach the page.
- Fill the **Character details** form (identity + max values from section 2)
  and click **Show overlay**.
- Confirm the identity label and HP / Stress / Armor slot counts match your
  sheet. Need to change a max later? Click **Edit details** to return to the
  form (current marks that still fit are kept).

### c. Go live into Discord

1. OBS → **Start Virtual Camera** (bottom-right Controls).
2. Discord → **User Settings → Voice & Video → Camera** → select **OBS
   Virtual Camera**.
3. Join the session voice channel, camera on.
4. **Group ping test:** each player marks one HP; everyone confirms they
   saw it within ~1 second.

### GM only — the Fear view

The GM runs the same pipeline but loads the HUD with `?mode=gm`:

- Point the OBS browser source at `dist/index.html?mode=gm` (Local file ON
  still works — append the query in the URL field), **or** run
  `bun run dev` and use `http://localhost:5173/?mode=gm`.
- GM mode shows **only the Fear track** — no player tracks, no identity.

---

## 4. During play

### Stats — click to change, no modals

- **Hope / HP / Stress / Armor:** click a pip to fill the next one; click a
  filled pip to clear it. Changes render within a frame and are visible to
  everyone on the call immediately.
- State is saved to the browser's localStorage continuously — a page or OBS
  reload restores every value within ~1 second. You do **not** need to
  re-enter your details after a reload; click **Edit details** only if a max
  value was wrong.
- **GM:** adjust the Fear track the same way in the `?mode=gm` view.

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

## 5. If something breaks (fast recovery)

| Symptom                           | Fix                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| HUD is blank in OBS               | Right-click browser source → **Refresh**. If still blank, re-check the Local file path points at a built `dist/index.html`.                 |
| Stats look wrong after a reload   | They restore from localStorage automatically. If they don't, click **Edit details** and re-enter your maxes (you'll re-mark current state). |
| Discord shows no OBS camera       | Confirm **Start Virtual Camera** is running in OBS, then re-pick "OBS Virtual Camera" in Discord Voice & Video.                             |
| Asset 404 in OBS log              | Rebuild: `bun run build` (its `obs:check` step catches broken asset paths). Point the source at the fresh `dist/`.                          |
| You changed theme tokens recently | Re-run the legibility spot-check in `docs/legibility-validation.md` before relying on Discord-scale readability.                            |

A single bundle reload or one details re-entry recovered in under ~30 seconds is a
normal minor hiccup — see `m3-gate-3-session.md` for the incident budget and
what counts as a real fallback.

---

## Quick command reference

```sh
bun install         # deps (first time / after a pull)
bun run build       # production bundle for OBS (dist/) + obs:check gate
bun run dev         # local dev server (browser testing, GM ?mode=gm)
bun run check       # lint + format + typecheck
bun run test        # full test suite
```
