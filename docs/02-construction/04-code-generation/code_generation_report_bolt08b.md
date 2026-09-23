# Code Generation Report - BOLT-08b / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27

## Approval Status

Approved by user on 2026-07-27. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08b.md` (approved by user on 2026-07-27, with both second-decision-point recommendations accepted).

## Summary

- Implemented BOLT-08b / UNIT-02 Non-Memory Rule Precedence, acting on the reviewer's decision that directory READMEs and reusable templates are not project memory.
- Added an opt-in `overridesClassification` flag to `WorkspaceScanRule`, honoured before the file is opened, so a declared non-memory document with precedence never needs its content, its version, or a classification attempt.
- Added a `fileName` exact base-name field to `WorkspacePathMatcher` and switched the README rule to it, so a document such as `docs/api-readme.md` can never be swept in by a precedence-bearing rule.
- Set precedence on `non-memory:readme` and `non-memory:template` only. Every other non-memory rule still yields to classification.
- Added `findOverridingNonMemoryRule`, searched independently of `findNonMemoryRule`, so a broader non-overriding rule listed earlier cannot mask an overriding one. This matters for `docs/03-operations/**/*_TEMPLATE.md`, where the operations prefix rule appears first.
- Retained `docs/00-methodology/setup_validation.md` as project memory without narrowing the methodology rule, because a rule that does not override still yields to classification.
- Updated the BOLT-08 and BOLT-08a assertions the change invalidated, replacing each with a stronger one rather than deleting it.
- Added `tests/non-memory-precedence.test.ts` with 7 tests, including a no-collateral-loss test that pins the per-rule exclusion tallies.
- Did not give the methodology or operations rules precedence, add a memory category, change ranking weights, write any file, or add any dependency.

## Approved Inputs

- **Units:** UNIT-02
- **Bolts:** BOLT-08b
- **User Stories:** US-002 AC-001, AC-002, AC-004
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`
- **NFRs:** NFR-016, NFR-020
- **Risks:** R-010, R-014
- **Technology Decisions:** ADR-001, ADR-003

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `package.json` | Updated | verification | Updated `npm test` to run the new BOLT-08b compiled test file. |
| `src/storage/workspace-source-reader.ts` | Updated | UNIT-02 / US-002 AC-001 | `overridesClassification` on the rule type, `fileName` matcher field, `findOverridingNonMemoryRule`, precedence on the README and template rules, and a pre-read override check. |
| `tests/non-memory-precedence.test.ts` | Added | UNIT-02 / BOLT-08b | Precedence, exact-filename matching, masking, retention, removal, no-collateral-loss, and coverage tests. |
| `tests/workspace-source-reader.test.ts` | Updated | UNIT-02 / BOLT-08b | Temporary-tree expectations updated; the template assertion strengthened from "observed but draft" to "never enters memory". |
| `tests/classification-coverage.test.ts` | Updated | UNIT-01 + UNIT-02 / BOLT-08b | Clarified that the classifier is unchanged and added the `setup_validation.md` retention assertion. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08b.md` | Updated | AI-DLC gate | Recorded approval, the second-decision-point answer, execution progress, and verification. |
| `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` | Updated | AI-DLC gate | Append-only Amendment 2. Existing entries and Amendment 1 unchanged. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt08b.md` | Added | AI-DLC gate | This BOLT-08b Code Generation Report. |
| `docs/02-construction/04-code-generation/test_results_bolt08b.md` | Added | AI-DLC gate | BOLT-08b verification evidence. |

## Coverage Outcome

Measured against this repository on 2026-07-27. These numbers supersede the coverage table in `code_generation_report_bolt08a.md`, which was left untouched because it is still under review.

| Metric | After BOLT-08a | After BOLT-08b |
|--------|----------------|----------------|
| Candidate files | 156 | 161 |
| Observations | 115 | **95** |
| `excluded_by_rule` | 41 | **66** |
| `unclassified_artifact` | 0 | 0 |

The candidate count rose by five because this session added five lifecycle documents, all of which classify. Twenty-five artifacts left memory: ten READMEs and fifteen templates. Adjusted for the five additions, 120 becomes 95.

| Exclusion rule | Files | Overrides classification |
|----------------|-------|--------------------------|
| `non-memory:template` | 24 | Yes |
| `non-memory:readme` | 20 | Yes |
| `non-memory:methodology` | 19 | No |
| `non-memory:template-checklist` | 1 | No |
| `non-memory:agent-instructions` | 1 | No |
| `non-memory:reference-paper` | 1 | No |
| `non-memory:operations` | 0 | No |

The README and template tallies exceed the twenty-five removals because those rules also cover files that were already excluded before this slice. `non-memory:operations` now matches nothing, because every file under `docs/03-operations/` is either a README or a template and is attributed to an overriding rule first.

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Per-rule classification precedence | UNIT-02 / BOLT-08b | US-002 AC-001 | Durable source discovery | Precedence is opt-in per rule, never global | NFR-016 |
| Exact base-name matcher | UNIT-02 / BOLT-08b | US-002 AC-001 | Durable source discovery | A precedence-bearing rule must not over-match | NFR-016, R-010 |
| Independent overriding-rule lookup | UNIT-02 / BOLT-08b | US-002 AC-001 | Durable source discovery | Rule order must not mask precedence | NFR-016 |
| README removal from memory | UNIT-02 / BOLT-08b | US-002 AC-002 | DurableSourceObservation | READMEs are navigation | NFR-016, NFR-020 |
| Template removal from memory | UNIT-02 / BOLT-08b | US-002 AC-004 | ArtifactSource.isTemplate | Placeholders never occupy the index | NFR-016, NFR-020, R-014 |
| `setup_validation.md` retention | UNIT-02 / BOLT-08b | US-002 AC-002 | Durable source discovery | Non-overriding rules still yield to classification | NFR-016 |
| No-collateral-loss test | UNIT-02 / BOLT-08b | US-002 AC-002 | UNIT-02 validation checklist | Scope boundary is machine-enforced | NFR-016, R-010 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | The override is checked before the file is opened, so twenty-five artifacts are no longer read, hashed, or classified. | Within the plan's "honour it before classification is attempted" scope |
| Assumption | Removing READMEs and templates does not weaken US-001, because none of them carry goal, phase, plan, decision, blocker, or next-step content. Freeing that budget serves NFR-020. | Approved by `code_generation_followup_plan_bolt08b.md` |
| Deviation | The methodology rule was **not** narrowed. The plan proposed narrowing it to admit `setup_validation.md`, but that is unnecessary: because the methodology rule does not override, classification already wins and the file stays memory. The simpler outcome is the same. | Simplification within the plan's intent; recorded for review. |
| Deviation | `non-memory:operations` now matches zero files. It is retained rather than deleted, because it still documents the intent for any future non-template operations document. | Within scope; recorded for review. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning during tests inherited from BOLT-02. | Accepted by prior BOLT guardrails; final verification passes. |

## Defect Found And Fixed During Development

| Defect | Symptom | Cause | Fix |
|--------|---------|-------|-----|
| Rule tally over-counted by one | The no-collateral-loss assertion expected 25 override exclusions and measured 45 | The test filtered rule labels with `startsWith("non-memory:template")`, which also matches `non-memory:template-checklist` | The test now tallies by exact label. The production code was never affected, but the collision is a real hazard for any consumer parsing skip details by prefix, so it is called out in the test comment. |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | `tsc -p tsconfig.json` completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | `tsc -p tsconfig.json --noEmit` completed successfully. |
| Full tests | `npm test` | Pass | 73 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, and 7 BOLT-08b tests. |
| Precedence test | BOLT-08b test suite | Pass | Exactly `non-memory:readme` and `non-memory:template` override, both are `non_memory`, and no other rule kind carries the flag. |
| Exact-filename test | BOLT-08b test suite | Pass | `README.md` and `docs/01-inception/README.md` match; `docs/api-readme.md` matches no rule and remains a candidate. |
| Masking test | BOLT-08b test suite | Pass | For an operations template, `findNonMemoryRule` returns the non-overriding operations rule while `findOverridingNonMemoryRule` returns the template rule. |
| Retention test | BOLT-08b test suite | Pass | `setup_validation.md` matches a non-memory rule but no overriding rule, and remains an observation. |
| Removal test | BOLT-08b test suite | Pass | All ten previously classified READMEs are excluded by the README rule; no README and no template remains in memory. |
| No-collateral-loss test | BOLT-08b test suite | Pass | Per-rule tallies pinned by exact label; every skip is `excluded_by_rule` with a declared reason. |
| Coverage test | BOLT-08b test suite | Pass | Zero unclassified candidates, 95 observations plus 66 skips equals 161 candidates, `PROJECT_STATUS.md` present, and the ten domain-design documents present. |
| Regression suite | BOLT-01 through BOLT-08a suites | Pass | The classifier is untouched, the BOLT-08a unchanged-baseline table still holds, and the domain import boundary still holds. |

## Follow-Ups

- BOLT-08b Code Generation Report and Test Results approved on 2026-07-27; no BOLT-08b review artifacts remain pending.
- The coverage numbers here supersede those in `code_generation_report_bolt08a.md` and `test_results_bolt08a.md`, which were approved on the same date as a record of the BOLT-08a state.
- BOLT-09 remains the next v1 bolt: JSONL event log, `.agent-memory/` layout, file-backed SQLite index, and rebuild from real durable sources.
- Consider whether skip details should carry a structured rule label rather than a `label: reason` string, so consumers cannot mis-parse by prefix. Not required for v1.
