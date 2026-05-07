# M2 Gate 2 — Full-group OBS pipeline rehearsal

**Scope:** Issue #22. This procedure validates the full-group pipeline
(every participant's `OBS browser source → Virtual Camera → Discord`
chain, viewed from every other participant's vantage point) before
the M3 live session in issue #24.

This gate cannot be automated and is not the same thing as issue
#7/#8's M1 Gate 1 individual verification — that was each person
proving their own pipeline works. This gate is the whole group on a
single Discord call confirming that, in practice, the HUDs are
readable, the GM view is differentiated, and there are no
show-stopping interactions between Vellum + OBS + Discord that only
appear with multiple cameras streaming simultaneously.

## Pre-conditions

Before scheduling the rehearsal:

1. Every group member has independently passed
   `docs/obs-pipeline-verification.md` (M1 Gate 1) on their own
   machine. Sign-offs are recorded in issue #8.
2. Every group member has a Daggerheart character JSON ready (see
   issue #23).
3. The build of Vellum at the rehearsal commit's `dist/` is the one
   each group member loads — confirm they're all on the same SHA.
4. Anyone unfamiliar with OBS has been walked through
   `docs/obs-pipeline-verification.md` by a person who has done it
   before — see "Non-expert documentation tester touchpoint" below.

## Rehearsal procedure

### Part A — Pipeline check (15 min)

1. Schedule a Discord call at the same time of day the live session
   will run (lighting/network conditions matter).
2. Every player + the GM joins the same voice channel.
3. Each member confirms in turn that:
   - Their OBS browser source is loading the latest Vellum bundle
   - Their character JSON is loaded (identity label visible)
   - Their virtual camera is selected as Discord's camera input
   - Their HUD is visible to the rest of the call

Each participant's confirmation is the AC #1 signal for them
specifically. A "no" from anyone blocks the gate.

### Part B — Multi-tile readability (15 min)

The legibility validation procedure in `docs/legibility-validation.md`
runs here for the first time with the realistic call layout (5+
tiles, not just one). Specifically:

1. Discord defaults to the focus-speaker view. While someone is
   talking, every other participant is in the sidebar tile.
2. Each participant takes a turn speaking; the rest must confirm
   they can read the speaker's HUD identity at sidebar size.
3. Switch to grid view and verify all four core stats + identity are
   readable on every tile at the grid-tile size.

If any participant fails AC #1 or AC #2 from `legibility-validation.md`,
the operator notes which token to bump and fires another calibration
pass after the call (issue #20 reopens).

### Part C — Manipulation UX sanity (10 min)

1. Each participant performs at least one mark and one unmark on
   each stat track during low-stakes call chatter.
2. Confirm that Discord's encoding latency is acceptable (the rest
   of the group sees the change within ~1 second of it being made).

A failure here suggests the bundle's React reconciliation is
expensive enough to drop frames in OBS — file a follow-up issue.

### Part D — GM view differentiation (5 min)

1. The GM switches their view to `?mode=gm` (URL parameter on the
   browser source).
2. The group confirms the GM tile shows Fear and looks distinct
   from the player tiles.

## Sign-off

The gate passes when, on a single Discord call:

- Every player + the GM confirms their pipeline (AC #1)
- The legibility check passes for every tile at every layout (AC #2 of
  #20)
- No show-stopping issue blocks any participant from continuing

Comment on issue #22 with:

- Date of rehearsal
- Participants (names + roles)
- Per-AC pass/fail
- Any follow-up issues filed (legibility, latency, etc.)

## Non-expert documentation tester touchpoint

AC #2 of issue #22 explicitly requires a non-OBS-expert to follow
`docs/obs-pipeline-verification.md` and reach a working state with at
most one round of clarifying assistance.

The recommended way to satisfy this is asynchronous:

1. Pick the group member with the least OBS experience.
2. Send them a link to the doc plus the latest Vellum bundle.
3. Ask them to follow the doc on their own machine and message the
   group chat with any question that blocks them.
4. If they reach a working state with ≤1 question, AC #2 passes.
5. If they get stuck multiple times, the doc has a gap — file a
   docs follow-up issue and update the doc before the rehearsal.

Run this **before** scheduling the group rehearsal. Discovering a
documentation gap at the rehearsal wastes the whole group's time.
