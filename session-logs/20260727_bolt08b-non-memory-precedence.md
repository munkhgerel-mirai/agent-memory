# Session Log - BOLT-08b Non-Memory Rule Precedence

**Date:** 2026-07-27
**Duration:** BOLT-08b approval and implementation session

## Skills Used

- 2026-07-27: `ai-dlc-code-generation` - recorded the BOLT-08b approval and its second decision point, then executed the slice.

## Summary

- Recorded user approval of `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08b.md` and the acceptance of both second-decision-point recommendations.
- Added an opt-in `overridesClassification` flag to `WorkspaceScanRule`, honoured before a file is opened.
- Added a `fileName` exact base-name field to `WorkspacePathMatcher` and switched the README rule to it.
- Added `findOverridingNonMemoryRule`, searched independently of `findNonMemoryRule`.
- Set precedence on `non-memory:readme` and `non-memory:template` only.
- Added `tests/non-memory-precedence.test.ts` with 7 tests and updated the BOLT-08 and BOLT-08a assertions the change invalidated.
- Created `code_generation_report_bolt08b.md` and `test_results_bolt08b.md`.
- Appended Amendment 2 to `bolts_plan_addendum_v1_release.md`.
- Updated `PROJECT_STATUS.md`.

## Decisions Made

- Made precedence opt-in per rule rather than a global ordering change. Measurement showed a global change would remove 26 classified artifacts, while the reviewer's decisions covered 25 across two specific rules.
- Searched for overriding rules independently of the first-match lookup, because `non-memory:operations` is listed before `non-memory:template` and would otherwise have masked it for operations templates.
- Checked the override before opening the file, so 25 artifacts are no longer read, hashed, or classified at all.
- Switched the README matcher from `fileSuffix` to `fileName`. All twenty current matches are exactly `README.md`, so nothing was wrong today, but a precedence-bearing suffix rule would eventually sweep in something like `docs/api-readme.md` and silently remove real memory.
- Did **not** narrow the methodology rule, although the plan proposed it. Because that rule does not override, classification already wins and `setup_validation.md` stays memory. The simpler change produces the same outcome.
- Retained `non-memory:operations` even though it now matches zero files, since it still documents intent for any future non-template operations document.
- Strengthened rather than deleted every assertion the change invalidated: the template test moved from "observed but draft" to "never enters memory".

## Defect Found And Fixed

The no-collateral-loss assertion expected 25 override exclusions and measured 45. Two errors compounded:

- The filter used `startsWith("non-memory:template")`, which also matches `non-memory:template-checklist`.
- The expected value conflated "artifacts that left memory" with "artifacts the rules match". The override rules cover every README and template, including those already excluded before this slice.

Fixed by tallying per rule with exact label comparison and pinning each count. Production code was never affected. The prefix collision is a real hazard for any consumer parsing skip details, so it is recorded in the report, the test results, and `PROJECT_STATUS.md` risks.

## Verification

- `npm run typecheck` - Pass.
- `npm run build` - Pass.
- `npm test` - Pass: 73 tests, 0 failures (7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b).
- Coverage against this repository: 161 candidates, 95 observations, 66 `excluded_by_rule`, 0 `unclassified_artifact`.
- Twenty-five artifacts left memory: 10 READMEs and 15 templates. `setup_validation.md`, `PROJECT_STATUS.md`, and the ten domain-design documents all retained.
- Per-rule tallies: template 24, README 20, methodology 19, template-checklist 1, agent-instructions 1, reference-paper 1, operations 0.
- The classifier was not touched, proven by the BOLT-08a unchanged-baseline table and category-count guard still passing.

## Next Steps

1. Human reviews the BOLT-08a and BOLT-08b reports and test results.
2. Create and approve the BOLT-09 follow-up plan for durable persistence.
3. Continue through BOLT-10 to BOLT-14, each behind its own approved follow-up plan.
