# M3 Gate 3 — Live Daggerheart session + debrief

**Scope:** Issue #24. The project completion gate. Vellum is used as
the sole stat-tracking tool for a complete Daggerheart session;
**OM-1 (no Demiplane fallback) is the binary pass/fail signal**.

This document is the operator's pre-flight, in-session prompt sheet,
and post-session debrief template. The session itself is the
deliverable — this doc just makes sure nothing is forgotten on
either side of it.

## Pre-session checklist

Run through this in the 30 minutes before session start.

### Personal pipeline (each member)

Each player + the GM has independently:

- [ ] Passed M1 Gate 1 individual verification (issue #8 sign-off)
- [ ] Passed M2 Gate 2 group rehearsal (issue #22)
- [ ] Has their character JSON ready (issue #23)
- [ ] Imports it via Vellum's **Import character** button and
      confirms the HUD matches their character sheet
- [ ] OBS browser source is loaded with the latest Vellum bundle
- [ ] Virtual camera is selected as Discord's camera input

A "no" on any line for any person delays the session start. Don't
skip — the binary OM-1 pass requires every member's tracking to
work end-to-end.

### Operator's calibration confirmation

- [ ] Token values from `daggerheart.theme.ts` were not adjusted in
      the 24 hours before the session (changes here invalidate the
      legibility validation done at #22)
- [ ] If they were, re-run `docs/legibility-validation.md` AC #1 and
      AC #2 informally before session start

### Discord call setup

- [ ] All players + GM in the same voice channel
- [ ] Everyone's camera is on and showing their HUD
- [ ] Test pings: each player marks one HP, the rest of the group
      confirms they saw it within ~1 second

## During session

The operator (typically the project owner) keeps an informal incident
log during play. Append to the **Post-session debrief** section
below as things happen — it's far easier to capture in real time than
to reconstruct after.

### What counts as a fallback (OM-1 fail)

Any of the following are an OM-1 fail:

- Any player or the GM consults their Demiplane sheet **for stat
  state** during play (looking up an ability is fine — that's not
  stat tracking)
- The GM asks "what's your HP?" because they couldn't read a HUD
  (this is also an OM-3 signal)
- A player marks a stat on Demiplane and not in Vellum because
  Vellum was broken or unresponsive

### What counts as a minor incident (OM-4 budget: 1)

- A bundle reload mid-session due to OBS or Vellum hiccup, recovered
  in <30 seconds
- A character re-import because the original load was wrong, done
  in <60 seconds
- A single misclick that the player corrected themselves

Two minor incidents = OM-4 fail.

### What counts as session-ending (OM-4 hard fail)

- Any incident that pauses play for >5 minutes
- Loss of HUD that can't be recovered in-session and forces
  Demiplane fallback (also OM-1 fail)
- Discord call drops that take the whole group offline >5 minutes

## Post-session debrief

Run within 24 hours of session end while memory is fresh. Capture
each section as a comment on issue #24.

### OM-1 — No Demiplane fallback (binary pass/fail)

- [ ] **PASS** — no fallback to Demiplane occurred for any stat
- [ ] **FAIL** — fallback occurred (describe below)

If FAIL, include: who, what stat, when, why. This is the
project's binary success signal.

### OM-2 — Alt-tab frequency vs Demiplane baseline

Each player self-reports:

| Player | Alt-tabs (Vellum session) | Alt-tabs (typical Demiplane) | Direction |
| ------ | ------------------------- | ---------------------------- | --------- |
|        |                           |                              |           |
|        |                           |                              |           |
|        |                           |                              |           |
|        |                           |                              |           |

Pass condition: every player reports fewer alt-tabs.

### OM-3 — GM stat visibility

GM reports:

- [ ] Could read player **Hope** from the call without asking aloud
- [ ] Could read player **HP** from the call without asking aloud
- Other stats they could read:
- Other stats they could not read:

Pass condition: both Hope and HP boxes checked.

### OM-4 — Technical incident count

| Incident | Type (minor/session-ending) | Recovery time | Notes |
| -------- | --------------------------- | ------------- | ----- |
|          |                             |               |       |

Pass condition: ≤1 minor; 0 session-ending.

### Qualitative observations

What worked. What didn't. What surprised you. What you'd change for
session 2. Free-form, no specific format.

## Sign-off

The gate passes (and the project completes) when:

- OM-1 PASS
- OM-2 PASS for every player
- OM-3 both boxes checked
- OM-4 within budget

If any signal fails, file follow-up issues against the specific
shortcoming. Even on partial pass, the session is the project's
end-of-scope — additional work is post-MVP and out of the original
charter.

## Issue closing

Comment on issue #24 with:

- Date of session
- Participants
- Per-OM pass/fail
- Link to any follow-up issues filed
- One sentence of qualitative summary

Then close the issue. Closing #24 with all four OMs passing is the
M3 milestone close — the project is complete.
