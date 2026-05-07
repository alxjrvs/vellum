# Implement progress — Issue #22: Full-group OBS pipeline rehearsal

- **Branch:** feat/22-m2-gate-2-rehearsal
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end)
- **Started:** 2026-05-07

## Plan summary

Issue #22 explicitly notes "Minimal AI leverage — this is logistical
coordination work." The acceptance criteria require:

| AC                                                          | Status                                              |
| ----------------------------------------------------------- | --------------------------------------------------- |
| Each player + GM reaches working HUD-on-Discord state       | **DEFERRED** — operational, requires real rehearsal |
| Non-OBS-expert can follow setup doc with ≤1 clarifying ping | **DEFERRED** — operational tester touchpoint        |

What this PR ships is the only deliverable that exists independent of
the rehearsal itself: a written procedure document that the operator
runs on the day of the rehearsal. The procedure cross-references the
existing `docs/obs-pipeline-verification.md` (M1 Gate 1 individual
setup) and `docs/legibility-validation.md` (the calibration check from
issue #20), and adds the multi-participant choreography that isn't
present in either of those.

## Files

- `docs/m2-gate-2-rehearsal.md` (new) — full-group rehearsal procedure

## Out of scope

- Running the rehearsal itself (operational; tracked by closing the
  issue with sign-off comments)
- Updates to `docs/obs-pipeline-verification.md` — no gaps found
  during planning; if the non-expert tester touchpoint surfaces a
  gap, that's a follow-up issue
