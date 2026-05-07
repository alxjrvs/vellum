# Implement progress — Issue #24: Live Daggerheart session (Gate 3)

- **Branch:** feat/24-m3-gate-3-session
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (running at milestone-end after this PR)
- **Started:** 2026-05-07

## Plan summary

Issue #24 is the project completion gate. **All five acceptance
criteria are operational** — they require the actual humans playing
an actual ~4-hour Daggerheart session:

| AC                                                            | Status                                       |
| ------------------------------------------------------------- | -------------------------------------------- |
| Hope, HP, Stress, Fear, Armor, conditions tracked all session | **DEFERRED** — operational, requires session |
| OM-1: zero Demiplane fallback (binary)                        | **DEFERRED** — operational                   |
| OM-4: ≤1 minor incident; 0 session-ending                     | **DEFERRED** — operational                   |
| OM-2: every player reports fewer alt-tabs vs baseline         | **DEFERRED** — operational debrief signal    |
| OM-3: GM reads Hope + HP from call without asking aloud       | **DEFERRED** — operational debrief signal    |

What this PR ships is the only deliverable that exists independent
of running the session: a procedure document for the operator
covering pre-flight checklist, in-session incident definitions, and
post-session debrief templates for each outcome metric. The doc
makes the session execution mechanical so nothing is forgotten on
either side of the actual play.

## Files

- `docs/m3-gate-3-session.md` (new) — pre-flight checklist + during-
  session prompt sheet + post-session debrief template

## Out of scope

- Running the session itself (operational; tracked by closing the
  issue with sign-off comments per the doc's "Issue closing" section)
- Outcome metric reporting (each player + the GM provides their own
  numbers at debrief)
