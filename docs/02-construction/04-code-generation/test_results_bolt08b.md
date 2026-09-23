# Test Results - BOLT-08b / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt08b.md`

## Approval Status

Approved by user on 2026-07-27.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 73 tests passed, 0 failed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, and 7 BOLT-08b tests. |
| Precedence declaration test | BOLT-08b tests | Pass | Exactly two rules carry `overridesClassification`, `non-memory:readme` and `non-memory:template`, both of kind `non_memory`. No `include` or `exclude` rule carries the flag. |
| Exact base-name test | BOLT-08b tests | Pass | `README.md` and `docs/01-inception/README.md` resolve to the README rule. `docs/api-readme.md` resolves to no rule at all and remains a candidate, which the previous `fileSuffix` matcher would have swept in. |
| Rule-masking test | BOLT-08b tests | Pass | For `docs/03-operations/01-deployment/rollback_plan_TEMPLATE.md`, `findNonMemoryRule` returns the earlier non-overriding operations rule while `findOverridingNonMemoryRule` returns the template rule, so rule order cannot mask precedence. |
| Retention test | BOLT-08b tests | Pass | `docs/00-methodology/setup_validation.md` matches a non-memory rule, matches no overriding rule, and remains an observation. |
| Removal test | BOLT-08b tests | Pass | All ten previously classified READMEs are excluded with a detail beginning `non-memory:readme`. No README and no `isTemplate` artifact remains in memory. |
| No-collateral-loss test | BOLT-08b tests | Pass | Per-rule tallies pinned by exact label: README 20, template 24, methodology 19, template-checklist 1, operations 0. Every skip is `excluded_by_rule` with a declared reason. |
| Coverage test | BOLT-08b tests | Pass | Zero `unclassified_artifact`. Observations plus skips equals the candidate count. `PROJECT_STATUS.md` present and exactly ten domain-design unit documents present, so BOLT-08a's gains are intact. |
| Updated BOLT-08 assertions | BOLT-08 tests | Pass | The temporary-tree test now expects three observations and three skips, with the template reported `excluded_by_rule`. The real-tree test asserts no `isTemplate` observation at all. |
| Updated BOLT-08a assertions | BOLT-08a tests | Pass | The unchanged-baseline table and category-count guard still hold, confirming the classifier itself was not touched. |
| Regression suite | BOLT-01 through BOLT-08a tests | Pass | All prior suites pass, including the BOLT-06 and BOLT-07 domain import boundary scans. |

## Coverage Measurement

| Metric | After BOLT-08a | After BOLT-08b |
|--------|----------------|----------------|
| Candidate files | 156 | 161 |
| Observations | 115 | **95** |
| `excluded_by_rule` | 41 | **66** |
| `unclassified_artifact` | 0 | 0 |

Twenty-five artifacts left memory: ten READMEs and fifteen templates. Five lifecycle documents were added this session and all classify, so 115 plus 5 minus 25 equals 95.

These numbers supersede the coverage table in `test_results_bolt08a.md`, which was deliberately not edited because it is still under review.

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

One test-side defect was found and fixed during development.

| Defect | Symptom | Cause | Fix |
|--------|---------|-------|-----|
| Rule tally over-counted by one | The no-collateral-loss assertion expected 25 override exclusions and measured 45 | The assertion filtered labels with `startsWith("non-memory:template")`, which also matches `non-memory:template-checklist`. The expected value was also wrong, because the override rules cover every README and template, not only those that previously classified. | The test tallies by exact label and pins each rule's count individually. Production code was never affected. |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | US-002 AC-002 remains fully demonstrated with zero unclassified candidates. US-002 AC-004 is strengthened: a template no longer enters memory at all, rather than entering as a draft. | US-002 AC-003 stale-metadata removal on rebuild still belongs to BOLT-09. |
| Domain invariants | Precedence is opt-in per rule and asserted to be limited to two rules. Non-overriding rules are asserted to still yield to classification. | No invariant yet prevents a future rule from carrying precedence without a recorded decision; the test pins the current set, which fails loudly if that changes. |
| Integration points | The classifier is untouched, proven by the BOLT-08a unchanged-baseline table still passing. Discovery changes are confined to the reader. | Observations are still not persisted or projected; that is BOLT-09. |
| NFR / risk scenarios | NFR-016 category mapping stays machine-enforced. NFR-020 benefits because 25 placeholder and navigation artifacts no longer compete for the context-pack budget. R-014 is served because template scaffolding cannot reach retrieval. | NFR-001 latency and NFR-009 scale remain unmeasured until BOLT-14. |

## Follow-Ups

- BOLT-08b Test Results approved on 2026-07-27.
- Keep the per-rule tally assertions as the gate whenever a scan rule is added or given precedence.
- Consider replacing the `label: reason` skip-detail string with a structured field, so consumers cannot mis-parse by prefix as this slice's test initially did. Not required for v1.
- `non-memory:operations` currently matches zero files. Retained deliberately; revisit if a non-template operations document is ever added.
