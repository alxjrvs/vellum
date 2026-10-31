# Changelog

All notable changes to Vellum are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unstable-API posture (0.x)

While Vellum is in `0.x`, the release is **beta and the API may move**. The
extension surface — `SystemDefinition`, `SceneDef`, `ThemeConfig` — is _public
but not yet frozen_; breaking changes are allowed in `0.x` minors and are always
listed here. The **character JSON schema** is versioned independently and carries
a stronger promise: every bump ships a migration, so a mid-campaign character
never hard-fails. `1.0.0` is earned, not scheduled — it means the extension API
is stable enough to promise. See [`docs/RELEASE-STRATEGY.md`](docs/RELEASE-STRATEGY.md).

## [Unreleased]

### Added

- **One OBS script does the whole setup.** Load `vellum.lua` (served at
  vellumhud.com/downloads/vellum.lua) under Tools → Scripts, paste your link,
  pick your webcam, and press **Set up Vellum**: it builds a `Vellum` scene with
  the webcam under the HUD, fits both to the canvas, and starts the Virtual
  Camera. Pasting a new link updates the HUD at once. The same script carries
  the hotkeys.

### Removed

- `obs/vellum-hotkeys.lua`, `obs/vellum.scene.json`, `obs/setup-obs.sh` and
  `obs/setup-obs.ps1`, replaced by `obs/vellum.lua`. Remove the old hotkey
  script from Tools → Scripts and rebind your keys after loading the new one.

### Changed

- **New design language: the broadcast package.** One design system now drives
  vellumhud.com, the setup screens, and the HUD: solid slanted plates, Barlow
  Condensed numerals, and the Nameplate wordmark. Chassis tokens live in
  `src/themes/vellum.tokens.css` and the site links the same file. Fonts are
  self-hosted, so OBS still needs no network. See `docs/branding/BRANDING.md`.
- **Two enforced HUD rules.** Labels are at least 40px on the 1920 canvas
  (about 13px on a 640×360 tile) at 7:1 contrast, and right-hand widgets mirror
  so every label reads from the outer edge in.
- **Breaking (`ThemeConfig`):** color tokens are renamed to the chassis set
  (`plate`, `label`, `signal`, `hit`, …), and frames gain `tracks` to choose bar
  or chits per stat, plus new `fontSizeValue` and track layout sizes. HP hearts
  are retired in favor of bars or chits.

### Added

- **Stream Deck plugin with live keys** (`apps/streamdeck`, published at
  `vellumhud.com/downloads/vellum.streamDeckPlugin`). Stat, Condition and Frame
  actions; keys draw the HUD's live values and Stream Deck + dials turn stats.
  The plugin listens on `127.0.0.1:28196` and only answers vellumhud.com (or a
  local dev server); the page connects only inside OBS or with `?deck=1`. The
  app's CSP `connect-src` adds exactly that loopback socket.

- **`validateFrame`** (`src/themes/frameRules.ts`) checks a frame's label size
  and contrast; the official Daggerheart frame is tested against it.

- **Screen picker on the bare `/app/` route.** Opening the app with no scene in
  the URL now shows a game + role selector (Daggerheart → Player / GM) that
  links to each scene's canonical hash, so the GM screen is reachable by
  navigation instead of by hand-typing a URL.
- **Setup → launch is now the lifecycle for every scene.** `SceneShell` owns
  `setup → launch → live` (with an _edit_ path back); a scene supplies only its
  two views and a readiness rule, so a new scene inherits the flow instead of
  re-implementing it.
- **The GM screen has a setup page.** A GM configures nothing, so its setup step
  is the **how-to**: what the screen shows, how to drive the Fear track during
  play, and how to get it into OBS — plus a **Copy GM screen link** action and a
  **Launch GM screen** button. **Setup** on the live screen reopens it.

### Fixed

- **"Edit details" and the GM's "Setup" work inside the OBS browser source
  again.** The scene shell skipped the setup view whenever it detected OBS, so
  an edit click set state that could never take effect — a dead button in the
  one place you are actually clicking the source. OBS now bypasses only the
  _launch_ gate; an explicit edit opens setup everywhere. In a normal browser
  tab the button was unaffected, which is why this slipped through.
- **The HUD fits any browser-source size instead of being clipped.** Every
  screen is laid out on a fixed 1920×1080 canvas, but that canvas was rendered
  at a hard 1920×1080 with `overflow: hidden` — so an OBS browser source of any
  other size (OBS's own default is 800×600) showed only the _left slice_ of a
  1920-wide layout, with the right edge of the UI cut off and everything
  off-centre. The canvas now scales by `min(vw/1920, vh/1080)` to fit the
  source, centred, letterboxing the remainder transparently — it also scales
  _up_, so a 2560×1440 source fills its frame. 1920×1080 still renders 1:1.
- **The setup panel is no longer clipped in a small browser source.** Its bounds
  were expressed in `vw`/`vh`, which measure the un-scaled source rather than
  the canvas the panel is laid out in; they are now percentages of the stage.
- **The GM screen no longer renders blank on a cold start.** Fear was stored
  inside the character record, so a GM — who never fills in a character sheet —
  got an empty scene with no way to reach setup. Fear now lives in its own
  `vellum:fear` store and renders with zero configuration. Existing pools seed
  once from the old `character.stats.fear` value.
- **Share links address the player scene.** A `?c=` link carries no scene, so
  with the new picker it would have landed on the selector — unrecoverable in a
  non-interactive OBS browser source. Generated links now append
  `#/daggerheart/player`, and consuming a hash-less `?c=` sets that hash, so
  links copied before this release keep working.
- The GM Fear track clamps a stored value that exceeds the system max instead of
  over-filling the track.
- `stats.fear` is no longer copied forward when a character is saved, so the
  deprecated field can't freeze a stale value into exports and share links.

### Changed

- The shipped OBS scene collection and install scripts point at
  `#/daggerheart/player` rather than the bare `/app/` URL (which is now the
  picker). Browser sources still on the bare URL should be repointed; legacy
  `?mode=` links are unaffected.
- **Breaking (internal):** the `FEAR_SET` / `FEAR_INCREMENT` / `FEAR_DECREMENT`
  character actions are removed. `CharacterStats.fear` is deprecated and
  read-only, retained so existing records still parse.
- Launch state is persisted per scene (`vellum:launched:<scene>`), so a reload
  never re-gates a live screen. An existing character counts as an
  already-launched player scene, so upgrading users are not sent back to setup.
- **The OBS browser source skips the launch step** and comes up live — that
  source is non-interactive, so gating the HUD behind a click would burn an
  undismissable setup page into a live camera. An explicit **Edit details** /
  **Setup** click still opens setup there. Readiness is still enforced, so a
  player with no character stays on setup even inside OBS.
- The GM scene no longer renders the player-oriented `SetupWizard`. Its OBS
  self-test asks you to click an HP pip, which the GM screen has none of, and in
  a non-interactive OBS source it would float over a live camera undismissably.
  `GmSetup` is the GM's how-to.

## [0.2.0] — Paste-and-Play onramp

The 0.2.0 release turns Vellum from a run-from-source tool into a
**paste-and-play** onramp: open a URL, get a character on your webcam, drop the
scene into OBS — no toolchain required, still local-only, nothing uploaded.

### Added

- **Hosted on GitHub Pages.** The built app is served at `/app/` (latest) and at
  a **version-pinned** `/app/v0.2.0/` mirror, so a link keeps working after the
  latest build moves. The marketing/docs site stays at the Pages root; the app is
  a subtree, not a separate deployment.
- **Portable character share URLs (`?c=`).** A character serializes into the URL,
  so sharing a build — or moving it between machines — is a copy-paste, with no
  account and no server round-trip. Data still lives only in the link and on your
  machine.
- **Cross-platform OBS scene install.** Setup covers macOS, Linux, and Windows,
  plus a **no-script Import** path (OBS scene-collection import) for players who
  won't run a shell script.
- **In-app setup wizard.** A guided first-run flow walks a new user from a blank
  overlay to a live HUD in the call, reducing OBS-configuration friction.
- **Character-schema migration path.** The versioned character JSON schema now
  migrates forward on load, so a character authored against an earlier schema
  opens without a hard failure.

[0.2.0]: https://github.com/alxjrvs/vellum/releases/tag/v0.2.0
