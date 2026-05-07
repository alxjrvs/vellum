# Vellum

A local-only, TTRPG-system-aware camera overlay. A web app renders a character HUD composited onto the player's webcam feed via OBS browser source plus OBS Virtual Camera, which Discord receives as the player's camera input.

MVP ships the Daggerheart frame: Player HUD (Hope / HP / Stress / Armor / Conditions / Identity) and GM Fear view. The system is built data-driven from day one so adding a future system frame is config + components, not a rewrite.

**Target release:** MVP — the owner's group runs one complete Daggerheart session using Vellum with no fallback to Demiplane.

## Quality goals

1. **In-session responsiveness** — stat manipulation updates within one render frame, no modal.
2. **Refresh resilience** — all stat values restored from localStorage within 1 second after any page reload.
3. **Legibility at Discord call scale** — critical values and identity label readable at 640×360 tile, primary stats parseable at 200–300px thumbnail.

## Constraints

- Local-only at runtime — no network, no auth, no telemetry, no external APIs.
- TypeScript throughout, strict mode.
- Modern Chromium target (OBS browser source = CEF).
- 1920×1080 OBS canvas; 640×360 in-call effective size.

## Documentation

- `docs/PRD.md` — product requirements (Ideate phase output).
- `docs/architecture.md` — Arc42 architecture document (sections 1–12 + Appendices A–D).

## Status

Pre-implementation. Issues, milestones, and the project board track the work breakdown from `docs/architecture.md` Appendix A.
