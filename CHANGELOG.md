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
- **The OBS browser source skips the setup step** and always renders the live
  scene — that source is non-interactive, so gating the HUD behind a click would
  burn an undismissable setup page into a live camera. Readiness is still
  enforced, so a player with no character stays on setup even inside OBS.
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
