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
