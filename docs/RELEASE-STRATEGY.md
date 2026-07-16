# Vellum — Release Strategy (0.1.0 Beta)

**Status:** Draft
**Scope:** How Vellum goes from a private group tool to a public, open-source, composable overlay platform — distribution, versioning, positioning, and the launch surface.

---

## 1. Positioning

Vellum enters a category it effectively creates (per the PRD competitive scan): **the only tool that composites live, system-aware TTRPG stats onto a player's own webcam for private remote play.** The release message is _not_ "another Daggerheart tracker." It is:

> **Your character sheet, on your face.** A local-only, hackable overlay that puts live tabletop stats on your webcam — for any system you teach it.

Three pillars to lead with:

1. **Local-only & yours.** No account, no server, no telemetry. Runs from a static file. Your data never leaves your machine.
2. **Composable.** Daggerheart ships in the box; the platform is built so _you_ can add your system, scenes, and theme.
3. **Made for the call, not the stream.** Designed for a 4–6 person Discord video call at 480p, not a broadcast audience.

---

## 2. Licensing & IP posture

- **License:** MIT (or Apache-2.0 if patent-grant matters to contributors). Permissive maximizes "other folks can build on it." Decide before tagging; add `LICENSE` in M-F.
- **Game content boundary:** Vellum ships **rules-adjacent config, not copyrighted text.** The Daggerheart system module encodes public SRD-derived mechanics (stat maxima, condition names, thresholds) under the Darrington Press community/SRD terms — no rulebook prose, no proprietary art. Document the SRD provenance in the Daggerheart module's README and keep third-party-system modules to the same standard. This is the single biggest legal watch-item for a public release and for accepting community system modules.
- **Branding assets** (wordmark, palette) are the project's own — safe to ship.

---

## 3. Versioning

- **Semantic versioning**, starting at **0.1.0** — the `0.x` signals "beta, API may move." The extension surface (`SystemDefinition`, `SceneDef`, `ThemeConfig`) is _public but not yet frozen_; breaking changes are allowed in `0.x` minors and **must** be listed in `CHANGELOG.md`.
- **Character JSON schema** is versioned independently (`version` field, already present at `1`). Every bump ships a migration so a mid-campaign character never hard-fails. This is a stronger compat promise than the code API, because it's _user data_.
- **1.0.0** is earned, not scheduled: it means the extension API is stable enough to promise, and ≥1 community-contributed system exists.

---

## 4. Distribution

Vellum is a static, local-only web app — that shapes everything.

### Primary: run-from-source / static bundle

- `git clone && bun install && bun run dev` for extenders.
- **`bun run build`** produces a static bundle (already gated by `obs:check`). Ship that bundle as a **GitHub Release asset** (`vellum-0.1.0.zip`) so a non-developer can download, unzip, and point OBS at `index.html` — no toolchain required. This is the key "other folks" on-ramp: most players are not going to run a dev server.
- Because it's local-only, there is **no hosted app to operate** — the release _is_ the artifact. This is a feature: zero infra, zero uptime risk, zero privacy surface.

### Secondary: hosted convenience build (optional)

- A read-the-docs-style hosted copy on GitHub Pages _could_ double as a "try it" build, but the OBS pipeline needs a local URL anyway. Keep the Pages site as **marketing + docs**, and treat a hosted app as optional convenience, clearly labeled "still local — nothing is uploaded."

### Not doing at 0.1.0

- No npm package, no Electron/Tauri desktop app, no installer, no auto-update. (All viable later; none needed to let people use or extend it.)

---

## 5. Launch surface (what exists at tag time)

| Artifact                                              | Purpose                                                | Milestone         |
| ----------------------------------------------------- | ------------------------------------------------------ | ----------------- |
| `v0.1.0` git tag + GitHub Release                     | The canonical download; release notes                  | M-F               |
| `vellum-0.1.0.zip` static bundle                      | Non-dev on-ramp                                        | M-F               |
| **GitHub Pages site**                                 | Advertise it — what/why/see-it, quick-start, links     | `site/` (live)    |
| `README.md` (rebranded)                               | First contact on GitHub; badges, 60-second start       | M-F               |
| `docs/authoring-a-system.md` + `authoring-a-theme.md` | The composability promise, made real                   | M-E               |
| `CONTRIBUTING.md` + system-module PR checklist        | How community systems get accepted (incl. IP standard) | M-F               |
| `CHANGELOG.md`                                        | Honest 0.x churn tracking                              | M-F               |
| Brand kit (`docs/branding/`)                          | Consistent identity across all of the above            | Done in this pass |

---

## 6. Go-to-market (calm, community-first)

Vellum's audience is small and specific: remote TTRPG groups + the tinkerers among them. No paid push; seed where the audience already is.

1. **Daggerheart community first** — it's the shipping system and an underserved ecosystem. Submit to the `awesome-daggerheart` list (the PRD notes it has _zero_ streaming/overlay entries — Vellum is the first). Post a short demo clip (webcam + HUD in a real call) to the Daggerheart Discord / r/daggerheart.
2. **The OBS + VTT-adjacent crowd** — r/ObsProject, r/rpg, TTRPG streaming Discords. Lead with the 30-second "stats on your face" clip; that's the whole pitch.
3. **The composability hook for developers** — a short "add your own system in ~50 lines" post / the authoring guide is the thing that turns users into contributors. This is what makes it a _project_ and not a _tool_.
4. **Show, don't tell** — the single highest-leverage asset is a **short screen capture of a real Discord call** with two people's HUDs live. Produce it for launch; it goes on the Pages site hero and every post.

**Success signal for the beta** (not revenue): a group _outside the original one_ runs a session on Vellum, and/or one external contributor opens a system or theme PR.

---

## 7. Risks specific to release

| Risk                                                       | Mitigation                                                                                                                                                        |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SRD/IP overreach in a shipped or contributed system module | Documented SRD-only standard; PR checklist; no rulebook prose/art. Section 2.                                                                                     |
| OBS setup friction filters out non-technical users         | Ship the zip bundle + a generalized, screenshot-driven OBS guide; the "safe-mode" HUD (M-F) so a misconfig never blanks a camera mid-session.                     |
| "0.x means unstable" scares off contributors               | Explicit, honest compat policy (§3): character _data_ is protected by migrations even while the code API moves.                                                   |
| Composability claim outpaces reality                       | Don't announce the platform without the second in-tree system (M-D) already merged — it's the proof, not a promise.                                               |
| Maintenance load from community modules                    | 0.1.0 systems are compiled-in via PR review, not runtime plugins — the merge gate _is_ the quality/IP gate. Runtime plugin loading stays post-0.1.0 deliberately. |

---

## 8. Release checklist (M-F gate)

- [ ] `LICENSE` chosen and added
- [ ] README rebranded, 60-second quick-start, demo clip embedded
- [ ] Second system merged (M-D) — composability proven
- [ ] `authoring-a-system` + `authoring-a-theme` guides published
- [ ] `CONTRIBUTING.md` with system-module IP + quality checklist
- [ ] `CHANGELOG.md` seeded at 0.1.0
- [ ] Static bundle builds, passes `obs:check`, zipped as a release asset
- [ ] Error boundary / safe-mode HUD verified (kill a character mid-load, camera stays sane)
- [ ] GitHub Pages site live and linked from README
- [ ] Brand identity applied across README + site + favicon
- [ ] Demo capture recorded and hosted
- [ ] `v0.1.0` tag + GitHub Release with notes
- [ ] Submitted to `awesome-daggerheart`
