# Implement progress — Issue #8: OBS Virtual Camera delivery to Discord

- **Branch:** feat/8-obs-virtual-camera-verification
- **Base branch:** main
- **PR strategy:** one
- **Skill-retro opt-in:** yes (deferred to milestone-end loop)
- **Started:** 2026-05-07

## Plan summary

Issue #8 has no implementable code — the acceptance criteria are runtime
properties of the OBS Virtual Camera driver and Discord's webcam input
pipeline, both external to this repo. The deliverable is a documented
manual smoke-test procedure that group members run on their own machines
to close M1 Gate 1.

This story:

- Adds `docs/obs-pipeline-verification.md` codifying the end-to-end
  verification (browser source → composition → Virtual Camera →
  Discord call) with explicit pass criteria and a failure-triage table
- Cross-references the new doc from `docs/architecture.md` Unit 1D
  Deliverables, so future contributors find the procedure from the
  spec, not just from issue history

## Files

- `docs/obs-pipeline-verification.md` (new) — manual procedure
- `docs/architecture.md` — Unit 1D deliverables list links the doc

## Acceptance criteria → verification

| AC                                                                     | Plan                                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| OBS Virtual Camera + browser source → Discord webcam without rejection | Documented in obs-pipeline-verification.md Part B; pass criteria explicit |
| Composited HUD visible on participant's tile in a real call            | Documented in Part C with sign-off protocol                               |

## Out of scope

- Programmatic Virtual Camera enumeration / Discord input introspection
  — both are OS- and app-level concerns; no library hook from this repo
- Per-member sign-off automation — handled by issue comment per the doc

## Wiring classification

This is documentation-only. No new code, no behavior change, no test
churn. Build/test pipeline unchanged. Per the implement:build wiring
heuristic (diff < 50 lines, no new patterns/types/exports, no observable
behavior change), this qualifies as wiring — skipping define/docgen/full
verify dispatch and going straight to commit + PR.
