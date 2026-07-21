# Vellum — human validation protocol (0.2.0 M-F)

**What this is:** the go/no-go check for the 0.2.0 "Paste-and-Play" promise —
_a non-developer gets their character HUD live in a Discord call, from the
hosted URL, without ever opening a terminal or editing a file path._

**This is executed by a person, not a script.** It requires real OBS, a real
Discord client, a real webcam, and a real second human on the call. There is no
automated substitute: the whole point of 0.2.0 is the un-scriptable path —
OS security prompts, virtual-camera plumbing, and Discord device selection —
so a green CI run tells you nothing about whether this passes. Run the whole
protocol **on each of macOS, Windows, and Linux.** Windows is the make-or-break
case.

---

## Roles

- **Tester** — plays the non-developer. Ideally someone who has _not_ built the
  app and does not have a dev toolchain. If you must self-test, act strictly as
  a first-timer: only the hosted URL, only on-screen guidance, no repo, no
  terminal, no editing files.
- **Observer** — a second person on the Discord call who confirms the HUD is
  actually visible on the tester's camera tile. (Can be the same person on a
  second device if solo.)

---

## Ground rules (what "no terminal" means)

The run is **invalid** if the tester ever:

- opens a terminal / command prompt / PowerShell,
- clones the repo or runs `bun`, `git`, or any build,
- edits a file path, a scene JSON, or any config by hand.

Allowed: installing OBS and the Discord desktop app through their normal
installers, clicking through the in-app wizard, copy/pasting the share link,
and using OBS's own **Scene Collection → Import** menu.

---

## Pre-flight (not counted in the time)

- [ ] OBS Studio ≥ 28 installed (built-in Virtual Camera present).
- [ ] Discord **desktop** app installed and signed in.
- [ ] A working webcam.
- [ ] For the network check: know how to open the browser dev-tools **Network**
      tab (or have the observer do it on a mirror of the URL).
- [ ] Tester has their Daggerheart character numbers on hand (name/class, HP /
      Stress / Armor / Hope maxima).

---

## The timed run — time-to-first-HUD-in-Discord

**Start the clock** when the tester opens `https://alxjrvs.github.io/vellum/app/`
for the first time. **Stop the clock** when the observer confirms the tester's
HUD is visible and live on their Discord camera tile (a marked HP pip appears on
the tile within ~1 second).

**Target: ≤ 5 minutes, no terminal.** Record the actual time and every point of
hesitation.

Walk the paste-and-play path (the tester should be led by the in-app wizard, not
this list — this is the observer's scoring sheet):

- [ ] Opened `https://alxjrvs.github.io/vellum/app/` in a normal browser tab.
- [ ] The **screen picker** appeared; the tester chose their game and role
      (Player / GM) without hesitating over which one they were.
- [ ] The setup wizard appeared on first load and was **dismissible** — it never
      blanked the HUD or camera.
- [ ] Configured the character in the form; clicked **Show overlay**.
- [ ] Clicked **Copy share link** and got a URL.
- [ ] Got the scene into OBS — either **Scene Collection → Import** of
      `obs/vellum.scene.json` then pasting the share link as the source URL, **or**
      adding a Browser Source with the share link. (No file path typed.)
- [ ] Added the webcam **Video Capture Device** and ordered it **below** the HUD.
- [ ] **Start Virtual Camera**, approving the OS system-extension / permission
      prompt (macOS especially).
- [ ] Selected **OBS Virtual Camera** in Discord → Voice & Video.
- [ ] Inside OBS, the wizard offered the **self-test** — "click one HP pip — did
      it move on your camera?" — and the tester confirmed it moved.
- [ ] Observer confirms on the call: HUD visible on the tile, a pip change shows
      up within ~1 second.

**Record:** OS + version, OBS version, total time, whether the target was met,
and the single biggest source of delay.

---

## "Nothing is uploaded" — the network-tab check

The trust claim in the app ("Runs entirely in your browser — nothing is
uploaded") must be **verifiable**, not just asserted.

- [ ] Open the app URL with the browser **Network** tab recording.
- [ ] Configure a character and mark some pips.
- [ ] Confirm: the only requests are **GETs for the app's own static assets**
      (HTML/JS/CSS/fonts/images) from `alxjrvs.github.io`. There are **no POST /
      PUT / PATCH** requests, no calls to any analytics/telemetry host, no
      third-party API, and no WebSocket carrying game data.
- [ ] Confirm the character data lives in **localStorage** (Application →
      Local Storage) and travels in the **share link URL**, never to a server.

Any outbound request carrying character or session data is a **hard fail**.

---

## Share-URL round-trip check

The share link is the setup transport that beats OBS's isolated storage — prove
it actually carries the character.

- [ ] On machine/tab **A**, configure a distinctive character (recognizable
      name + non-default maxima) and click **Copy share link**.
- [ ] Open that link in a **fresh** browser context — a different browser, a
      private/incognito window, or another machine — with no prior Vellum
      localStorage.
- [ ] Confirm the HUD comes up **already populated** with A's character
      (identity + correct HP / Stress / Armor / Hope maxima), with no manual
      re-entry.
- [ ] Repeat by pasting the link into an **OBS Browser Source** specifically
      (its storage is isolated from every normal tab) and confirm the HUD is
      populated there too.
- [ ] Confirm live marks persist across a source **Refresh** (localStorage is
      the runtime store; the URL is only the setup transport).

---

## Result

Record per OS:

| OS      | Time-to-HUD | Target met (≤5 min, no terminal) | Network check | Share round-trip | Notes |
| ------- | ----------- | -------------------------------- | ------------- | ---------------- | ----- |
| macOS   |             |                                  |               |                  |       |
| Windows |             |                                  |               |                  |       |
| Linux   |             |                                  |               |                  |       |

**0.2.0 ships only when all three OSes pass** the timed run within target, the
network check shows nothing uploaded, and the share URL round-trips into a fresh
context (including an OBS source). A miss on any row is a release blocker, not a
footnote — file it and fix the friction before tagging. Log real incidents
against the `m3-gate-3-session.md` incident budget where relevant.
</content>
