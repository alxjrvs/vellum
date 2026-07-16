# Vellum 0.2.0 — "Paste-and-Play" Roadmap

**Status:** Draft
**Goal:** Take Vellum from "download a zip, substitute a file path, drive it through OBS's Interact window, and follow a multi-page runbook" to **paste one URL into OBS and play** — on macOS, Windows, or Linux, with no terminal.

> 0.1.0 made Vellum _composable_ — someone outside the original group can pick it up and extend it. 0.2.0 makes it _obtainable_ — someone who has never opened a terminal can get their character HUD live in a Discord call in one sitting. The composability release earned us extenders; this release earns us **players**.

**Builds on 0.1.0.** This roadmap assumes the Composable Beta has shipped: the system/scene/theme registry, the generic character model with **versioned, migratable character JSON**, and the **safe-mode HUD** error boundary. 0.2.0 changes _delivery and setup_, not the app's runtime model.

---

## 1. What "as simple as possible" means

Same three audiences as 0.1.0, re-promised around **setup friction** instead of extensibility:

| Audience                     | 0.1.0 promise                               | 0.2.0 promise                                                                              |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Player / GM** (end user)   | Point OBS at a URL, import a character JSON | Open a page, fill a form, **copy one URL, paste it into OBS.** No download, no file paths. |
| **System author** (extender) | Add a `systems/<id>/` folder, no core edits | Unchanged — plus their system is instantly reachable at a shareable hosted URL.            |
| **Themer** (styler)          | Supply a theme object                       | Unchanged — plus `?theme=` is testable at a live URL, no local build.                      |

The acceptance test for 0.2.0: **a non-developer on Windows gets their character HUD live in a Discord call without ever opening a terminal or editing a file path.** We prove it by watching a real tester do exactly that, on each OS.

---

## 2. The thesis: the friction was never the app

The app is already the simplest possible artifact — static files, no server, no runtime to install. Every real friction point sits _around_ it:

1. **You have to obtain a build.** Clone + `bun install` + `bun run build`, or download and unzip a release. Both are developer-shaped.
2. **The scene points at a per-machine file path.** `setup-obs.sh` substitutes _your_ `dist/index.html` absolute path into the scene template — so the scene collection isn't portable and the script is macOS/bash-only.
3. **Character entry happens inside OBS's "Interact" window.** Because the OBS browser source is a _separate Chromium instance_ with its _own isolated localStorage_, you cannot set up your character in your normal browser and have it appear in OBS. Today's runbook (§3b) routes you through the clumsy Interact window instead.
4. **The un-scriptable steps are documented in prose, not guided.** Adding the webcam capture device, layer ordering, Start Virtual Camera + the OS permission prompt, and picking the camera in Discord are a multi-page checklist you read on a second screen.
5. **Nothing is hosted.** Pages deploys `site/` (marketing) only; the app itself has no URL.

0.2.0 removes 1, 2, 3, and 5 outright, and replaces 4 with in-app guidance. It does **not** try to remove OBS itself (see §6).

**Honest reconciliation with the "local-only" pillar.** Release-strategy pillar #1 is "runs from a static file; your data never leaves your machine." Hosting the app on Pages softens _"runs from a static file"_ but preserves the part that matters: **no account, no telemetry, no API calls, and character data stays in localStorage** — hosting is just delivery of static assets over HTTPS, the same trust model as any web page, and it's verifiable in the network tab (nothing is POSTed). The downloadable zip stays as the fully-offline, purist path for anyone who wants zero network at load. We state this plainly in the UI ("Runs entirely in your browser — nothing is uploaded") rather than hiding the trade.

---

## 3. What's in the way today (the seams to change)

1. **`.github/workflows/pages.yml` deploys `site/` only** — "The Vellum app itself is local-only and is not deployed here." → Add an app build+deploy so the HUD lives at a stable hosted URL alongside the marketing site.
2. **`obs/setup-obs.sh` substitutes `__VELLUM_DIST__` with a local file path** and is macOS-only (`~/Library/Application Support/obs-studio`, `pgrep -x OBS`, bash). → With a hosted URL the substitution disappears (the URL is constant), which is what makes a cross-platform installer tractable.
3. **`obs/vellum.scene.json` is a local-`file://` browser source template.** → Point it at the hosted URL; ship it as an importable scene collection needing no substitution at all.
4. **Character setup is Interact-window-bound** (`docs/runbook.md` §3b) because of OBS's isolated localStorage. → Encode the character into the scene URL / a short share code so setup happens in a normal browser tab.
5. **`docs/runbook.md` is a multi-page operator manual.** → Split out a one-screen "Paste and Play" quick-start; keep the runbook for game-day operators.

---

## 4. Milestones to 0.2.0

Each milestone is independently shippable and leaves `main` green + the Daggerheart session-loop intact.

### M-A — Host the app (the URL exists)

- Extend the Pages pipeline to build the Vellum app and publish it at a stable path (e.g. `…/vellum/app/`) next to the marketing site. `base: './'` (already mandated for `file://` safety) also makes relative assets correct under a Pages subpath — hosting "just works" with no config fight.
- **Pin for mid-campaign safety:** `…/app/` tracks latest; `…/app/v0.2.0/` is a version-pinned URL so a group mid-season isn't force-upgraded during a session. Character-schema migrations (from 0.1.0) protect data across an upgrade regardless.
- Add a visible, honest "runs locally — nothing is uploaded" affordance in the app.
- Keep `bun run build` + the release zip as the offline artifact.
- **Exit:** a public URL renders the HUD; pasting it into an OBS browser source works with zero download or build.

### M-B — Portable character config (kill the Interact dance)

- Encode a configured character into a **shareable URL** (or a short copy-paste code) so a user fills the Character-details form in a **normal browser tab**, copies the resulting URL, and pastes _that_ into OBS — the HUD comes up already populated. This is the direct fix for OBS's isolated-localStorage problem (§2.3).
- Round-trips with the existing versioned character JSON schema; a shared URL is migratable the same way a JSON file is.
- Keep localStorage as the live in-session store (marks/rolls persist across reload exactly as today); the URL is the _setup transport_, not the runtime store.
- **Exit:** configure in a friendly tab → copy URL → paste into OBS → HUD shows your character, with **no Interact window** needed for first setup.

### M-C — One-step OBS scene install, on every OS

- Because the browser source now targets a constant hosted URL (M-A), the per-machine path substitution is gone. Ship the scene collection two ways:
  - **No-script path (lowest common denominator):** a downloadable `Vellum.json` users import via OBS's own **Scene Collection → Import** — identical on all three OSes.
  - **One-command path:** generalize `setup-obs.sh` into installers for **macOS (existing), Windows (PowerShell), and Linux**, each just placing the scene file in that OS's OBS scenes dir + generating fresh UUIDs. No dist path to resolve.
- **Exit:** on macOS, Windows, or Linux, one step gets the Vellum browser source into OBS pointed at the hosted URL.

### M-D — Guided setup for the parts that can't be scripted

- The remaining steps are genuinely un-scriptable (OS security prompts, hardware, Discord): add the webcam capture device + order it under the HUD, **Start Virtual Camera** + approve the OS system-extension prompt, and select the virtual camera in Discord. Replace the prose checklist with a **first-run in-app setup panel** that:
  - detects whether it's rendering inside an OBS browser source vs. a plain tab, and shows the right next step;
  - walks the manual OBS/Discord steps with per-OS hints;
  - ends in a **self-test** ("click one HP pip — did it move on your camera?").
- Composes with the 0.1.0 safe-mode HUD so a misconfig never blanks a camera mid-session.
- **Exit:** a non-technical user gets from "opened the URL" to "live in Discord" following on-screen guidance, without a second-screen doc.

### M-E — Rewrite the onramp: one screen + a 60-second video

- Collapse the setup half of `docs/runbook.md` into a single **"Paste and Play" quick-start** built around: open URL → configure → copy URL → import scene → follow the wizard. Keep the deep runbook for game-day operators and incident recovery.
- Cross-platform screenshots (Mac/Windows/Linux). The release-strategy "stats on your face" demo capture doubles as the setup walkthrough and the Pages hero.
- **Exit:** the quick-start is skimmable in under a minute and every step is correct on all three OSes.

### M-F — Release hardening & measure the win

- Define and **measure time-to-first-HUD-in-Discord** for a fresh non-developer, and validate the target (proposed: **≤ 5 minutes, no terminal**) with a real tester on **each** OS — Windows is the make-or-break case.
- Verify hosted-build caching/versioning (latest vs. pinned URL), the "nothing uploaded" claim in the network tab, and that a shared character URL survives a schema migration.
- `CHANGELOG.md` entry, semver `0.2.0`, Pages app + marketing both live and linked from the README quick-start.
- **Exit:** tagged `v0.2.0`, GitHub Release, and a stranger on Windows demonstrably goes from zero to live-in-Discord in one sitting.

---

## 5. Definition of done for 0.2.0

1. A public Pages URL renders the HUD; **nothing is uploaded** (local-only runtime preserved _and_ visibly stated).
2. Character setup happens in a normal browser tab and produces a paste-into-OBS URL — **no Interact window** required for first setup.
3. **One step** installs the Vellum OBS scene on macOS, Windows, and Linux, pointed at the hosted URL (plus a no-script Import path).
4. An in-app wizard guides the un-scriptable webcam / virtual-camera / Discord steps and ends in a working self-test.
5. Verified on each OS: a fresh non-developer gets live in a Discord call **without a terminal**, within the time target.
6. Daggerheart (and the 0.1.0 second system) play exactly as before — no regression in the session loop.

---

## 6. Explicitly out of scope at 0.2.0

Carried and extended from the 0.1.0 / PRD Won't list:

- **No native "replace OBS" app — this is the named Later bet.** The _only_ thing that removes OBS itself is a desktop app that captures the webcam, composites the HUD, and exposes its **own** virtual camera. That is a v-next _architecture_ change, not a packaging tweak: it means per-OS native virtual-camera plumbing — macOS Core Media IO **system extension** (code-signed + notarized, Apple Developer account, breaks on OS updates), Windows Media Foundation/DirectShow virtual-cam filter, Linux v4l2loopback — i.e. reimplementing the hardest part of OBS, with ongoing per-OS maintenance. It's a deliberate product bet to make **after** adoption justifies it, on **Tauri** (not Electron) for bundle size. Documented here so the ambition is on record and correctly _deferred_, not forgotten.
- No accounts, backend, sync, or telemetry — still **local-only at runtime**. Hosting delivers static assets; it does not add a server that sees your data.
- No mobile / native target beyond the deferred desktop bet above; OBS + Chromium remains the runtime.
- No in-app character _builder_ beyond the existing details form + the M-B share URL. The versioned character JSON schema stays the contract.
- No theme ecosystem / gallery / picker (unchanged from 0.1.0 — post-1.0).

---

## 7. Sequencing note

M-A (hosting) unblocks everything: M-B's share URL, M-C's constant-URL scene, and M-D's "am I inside OBS?" detection all assume a live URL. Suggested order: **M-A → M-B → M-C → M-D → M-E → M-F**, though M-C's no-script Import path can land as soon as M-A is up. M-B and M-C are independent of each other once M-A ships and can go in parallel.
