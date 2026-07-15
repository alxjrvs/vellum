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

Everyone in the group does this once and passes the M1 individual check
(`obs-pipeline-verification.md`) before the first real session.

---

## 2. Prepare your character JSON (before the session)

Full field-by-field guide: `characters/README.md`.

```sh
cp characters/template.character.json ~/my-character.character.json
# edit it to match your Daggerheart sheet
```

Key fields:

- `identity` — name, class, ancestry (+ optional subclass / community /
  level). Delete any key you don't use; don't leave `"REPLACE_ME"`.
- `slotCounts` — the HUD's pip maximums: `hp` (by class table),
  `stress` (default 6), `armorSlots` (by equipped armor). Tables are in
  `characters/README.md`.
- `thresholds` — `major` / `severe` HP slot positions (1-indexed) → the
  **M** / **S** markers on the HP track.
- `stats.hope` — starting Hope (usually 2). Leave `hp` / `stress` /
  `armorSlots` as `[]`; they fill in as you click during play.
- `featureConditions` / `conditions.feature` — class-specific badges; keep
  the label set identical in both.

**Test it before game day:** `bun run dev`, open the printed URL, click
**Import character**, and confirm the HUD matches your sheet with no manual
corrections.

---

## 3. Game-day startup (~30 min before session)

Do this per person. A "no" on any line delays the start — the whole point
is that nobody falls back to Demiplane for stat tracking.

### a. Load the HUD in OBS

1. OBS → new scene (or your saved Vellum scene).
2. **Sources → + → Browser**:
   - **Local file:** ON → select this repo's `dist/index.html`
   - **Width 1920**, **Height 1080**
   - **Shutdown source when not visible:** OFF
   - **Refresh browser when scene becomes active:** OFF
3. **Sources → + → Video Capture Device** (your webcam) — place it
   **below** the browser source so the HUD composites on top.
4. Right-click the browser source → **Properties** and confirm the HUD
   rendered (no blank page). Check **Help → Log Files → View Current Log**
   for any `assets/*` 404.

### b. Import your character

- In the HUD, click **Import character** and select your
  `<name>.character.json`.
- Confirm identity label, HP / Stress / Armor slot counts, and any feature
  badges match your sheet.

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
  re-import mid-session unless the original import was wrong.
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

| Symptom                           | Fix                                                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| HUD is blank in OBS               | Right-click browser source → **Refresh**. If still blank, re-check the Local file path points at a built `dist/index.html`.               |
| Stats look wrong after a reload   | They restore from localStorage automatically. If they don't, re-import your JSON (last-known-good is fine; you'll re-mark current state). |
| Discord shows no OBS camera       | Confirm **Start Virtual Camera** is running in OBS, then re-pick "OBS Virtual Camera" in Discord Voice & Video.                           |
| Asset 404 in OBS log              | Rebuild: `bun run build` (its `obs:check` step catches broken asset paths). Point the source at the fresh `dist/`.                        |
| You changed theme tokens recently | Re-run the legibility spot-check in `docs/legibility-validation.md` before relying on Discord-scale readability.                          |

A single bundle reload or one re-import recovered in under ~30 seconds is a
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
