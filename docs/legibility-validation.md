# Legibility validation procedure (M2 Gate 2)

This document describes how to validate that the Vellum HUD is legible
under realistic Discord screen-share conditions. The first-pass token
calibration shipped in PR #45 is a starting point — final values are
pinned by the M2 Gate 2 group rehearsal (issue #22).

## Why this matters

Vellum is rendered as an OBS browser source on a 1920×1080 canvas, then
encoded to a Discord screen-share that consumers view at thumbnail
sizes ranging from ~640×360 (full-screen on a window) down to
~200–300px (sidebar tile). At 640×360, a 28px heading on the source
renders at ~9px on the consumer's screen — too small to read at a
glance during play.

The validation procedure below produces a binary pass/fail signal for
each acceptance criterion in issue #20.

## Pre-conditions

- A Daggerheart character JSON loaded into Vellum (issue #23 deliverable
  if not already present)
- Stat values that exercise the visual surfaces:
  - HP partially marked (e.g. 4/8)
  - Stress partially marked (e.g. 3/6)
  - Hope at 3+ pips
  - Fear at 4+ pips (GM view)
  - At least one condition active
- Discord call set up exactly as it will run for the live session
  (issue #24)

## Procedure

### AC #1 — 640×360 thumbnail readability

1. Operator launches Vellum at 1920×1080.
2. Operator screen-shares to Discord.
3. A second participant joins and views the share at a window size
   that produces a ~640×360 effective resolution (this is roughly a
   "fullscreen on a 1080p monitor minus chrome" view, or a single
   tile in a 2×2 layout on a 4K monitor).
4. Without zooming in, the participant must be able to read:
   - Character name + class + ancestry (identity label)
   - Current/max for HP, Stress, Armor (stat tracks)
   - Number of filled Hope pips
   - Active condition badges (if expanded)

**Pass criteria:** every participant on the call can name each of
the above without zooming, scrolling, or asking the operator to
re-share.

### AC #2 — Sidebar-tile readability (200–300px)

1. Operator switches Discord layout so the screen-share is rendered
   as a sidebar tile (this happens automatically when another
   participant becomes the focus speaker).
2. Without making the share fullscreen, every participant must be
   able to read at minimum:
   - Character name (identity label)
   - Number of filled Hope pips

**Pass criteria:** every participant can name both above without
making the share fullscreen.

### AC #3 — Group review on a real Discord call

1. Run AC #1 and AC #2 with the actual Daggerheart play group on the
   actual Discord server they will use for the live session.
2. Collect a verbal "yes, this is usable" from every participant.

**Pass criteria:** unanimous yes. A single "I had to squint" is a
fail and triggers another calibration pass.

## What to adjust if a check fails

The token bumps shipped in PR #45 are conservative. If a check fails,
the operator can edit `src/themes/daggerheart.theme.ts` and bump the
relevant token:

| Failure mode                 | Token to bump     |
| ---------------------------- | ----------------- |
| Identity label illegible     | `fontSizeBase`    |
| Stat track labels illegible  | `fontSizeLabel`   |
| Hope/Fear pips hard to count | `pipSize`         |
| Headings illegible           | `fontSizeHeading` |

After bumping, run `bun run check && bun run test && bun run build`
and re-run the validation procedure.

Bump in 4–8px increments, not by percentage — the encoded thumbnail
resolution does not scale linearly with source pixel count, so small
absolute bumps matter more than proportional ones.

## Recording the result

After the M2 Gate 2 rehearsal, the operator should:

1. Record the validation outcome (pass / fail per AC) in issue #22.
2. If any AC failed, file a follow-up calibration issue or reopen
   issue #20.
3. If all ACs passed, close issue #20 with a comment linking the
   relevant message in the rehearsal Discord thread.
