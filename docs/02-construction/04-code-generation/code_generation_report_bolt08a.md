# Code Generation Report - BOLT-08a / UNIT-01 + UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27

## Approval Status

Approved by user on 2026-07-27, and superseded by `code_generation_report_bolt08b.md` for every coverage measurement. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08a.md`.

The implementation this report records still stands. Only its measured coverage numbers were later changed, by BOLT-08b. The tables below were deliberately left unedited, per NFR-004, so this remains an accurate record of the BOLT-08a state.

Retrieval note: the verdict above deliberately contains the word "superseded", which classifies this artifact as `historical` rather than `approved`. That is what stops a stale coverage number from being retrieved as current. See the BOLT-08b report's follow-ups.

## Summary

- Implemented BOLT-08a / UNIT-01 + UNIT-02 Classification Coverage, closing the gap the BOLT-08 real-tree scan measured.
- Anchored classifier directory matching with a leading slash, so a root-level folder such as `session-logs/` now matches by path as well as by declared artifact type.
- Added a classifier rule mapping `docs/02-construction/03-domain-design/unit_*` documents to `DecisionMemory` with `UnitMemory` secondary. The rule is scoped to `unit_` files so the directory's own README and templates stay out of project memory.
- Added a classifier rule mapping `PROJECT_STATUS.md` to `SessionHandoffMemory` with `PlanMemory` secondary, so US-001's source of goal, phase, blockers, and next steps enters memory.
- Added matching `inferArtifactType` entries and reader artifact type rules for `domain-design` and `project-status`.
- Added a third `non_memory` scan rule kind and an `excluded_by_rule` skip reason, so a deliberate exclusion is now distinguishable from a missing rule.
- Consulted non-memory rules only after classification fails, so no previously classified artifact was removed from memory. This matters because ten directory READMEs already classified: one in each directory that a directory-based classifier rule matches.
- Inverted the BOLT-08 `PROJECT_STATUS.md` tripwire into a positive classification assertion rather than deleting it.
- Added a coverage test requiring zero `unclassified_artifact` skips when scanning this repository, making classification completeness machine-enforced.
- Added no memory category. `V1_MEMORY_CATEGORY_NAMES` remains at 13 entries, asserted by test.
- Did not write any file, change ranking weights, remove `DEFAULT_ARTIFACT_TYPE_RULES`, or add any dependency.

## Approved Inputs

- **Units:** UNIT-01, UNIT-02
- **Bolts:** BOLT-08a
- **User Stories:** US-001 AC-001, US-002 AC-001, AC-002, AC-004, US-003
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md`, `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`
- **NFRs:** NFR-001, NFR-006, NFR-016
- **Risks:** R-010, R-014
- **Technology Decisions:** ADR-001, ADR-003

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `package.json` | Updated | verification | Updated `npm test` to run the new BOLT-08a compiled test file. |
| `src/domain/lifecycle-memory-core.ts` | Updated | UNIT-01 / US-002 AC-002 | Leading-slash path anchoring, domain-design rule, project-status rule, and two `inferArtifactType` entries. |
| `src/storage/workspace-source-reader.ts` | Updated | UNIT-02 / US-002 AC-001 | `non_memory` rule kind, `excluded_by_rule` skip reason, `findNonMemoryRule`, seven non-memory rules, and two artifact type rules. |
| `tests/classification-coverage.test.ts` | Added | UNIT-01 + UNIT-02 / BOLT-08a | Unchanged-baseline table, category-count guard, new rule tests, anchoring test, non-memory rule tests, and the zero-unclassified coverage test. |
| `tests/workspace-source-reader.test.ts` | Updated | UNIT-02 / BOLT-08a | Inverted the `PROJECT_STATUS.md` tripwire and clarified the unclassified-report assertion. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08a.md` | Updated | AI-DLC gate | Recorded approval, execution progress, and verification. |
| `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` | Updated | AI-DLC gate | Append-only BOLT-08a amendment section. Existing entries unchanged. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt08a.md` | Added | AI-DLC gate | This BOLT-08a Code Generation Report. |
| `docs/02-construction/04-code-generation/test_results_bolt08a.md` | Added | AI-DLC gate | BOLT-08a verification evidence. |

## Coverage Outcome

Measured against this repository on 2026-07-27, after the slice.

| Metric | Before BOLT-08a | After BOLT-08a |
|--------|-----------------|----------------|
| Candidate files | 152 | 156 |
| Observations | 100 | 115 |
| `excluded_by_rule` | 0, reason did not exist | 41 |
| `unclassified_artifact` | 52 | **0** |

The candidate count rose from 152 to 156 because this session added four new lifecycle documents. Of the 15 additional observations, 11 come from the two new classification rules and 4 are the new documents.

| Primary category | Count | | Non-memory rule | Count |
|------------------|-------|---|-----------------|-------|
| PlanMemory | 31 | | `non-memory:methodology` | 22 |
| SessionHandoffMemory | 30 | | `non-memory:operations` | 8 |
| VerificationMemory | 21 | | `non-memory:readme` | 5 |
| DecisionMemory | 14 | | `non-memory:template` | 3 |
| BoltMemory | 4 | | `non-memory:template-checklist` | 1 |
| IntentMemory, UserStoryMemory, NfrMemory, RiskMemory, UnitMemory | 3 each | | `non-memory:agent-instructions` | 1 |
| | | | `non-memory:reference-paper` | 1 |

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Leading-slash path anchoring | UNIT-01 / BOLT-08a | US-002 AC-002 | matchCategoryRule | Directory rules behave alike at any depth | NFR-016, R-010 |
| Domain-design classification rule | UNIT-01 / BOLT-08a | US-002 AC-002, US-003 | ArtifactClassification, DecisionMemory, UnitMemory | Approved design rationale is decision memory | NFR-016, R-010 |
| Project-status classification rule | UNIT-01 / BOLT-08a | US-001 AC-001, US-002 AC-002 | SessionHandoffMemory, PlanMemory | The status file is the continuity record | NFR-001, NFR-006, NFR-016 |
| Artifact type entries | UNIT-01 + UNIT-02 / BOLT-08a | US-002 AC-002 | ArtifactSource.artifactType | Reader declares what it discovered | NFR-016 |
| Non-memory rule kind and skip reason | UNIT-02 / BOLT-08a | US-002 AC-001, AC-004 | Durable source discovery | Exclusions are explicit, not silent | NFR-006, NFR-016, R-014 |
| Classification-wins ordering | UNIT-02 / BOLT-08a | US-002 AC-002 | Durable source discovery | Non-memory rules only relabel unclassified files | NFR-016, R-010 |
| Coverage assertion | UNIT-02 / BOLT-08a | US-002 AC-002 | UNIT-02 validation checklist | Completeness is machine-enforced | NFR-016, R-010 |
| BOLT-08a tests | UNIT-01 + UNIT-02 / BOLT-08a | US-001, US-002, US-003 | UNIT-01 and UNIT-02 validation checklists | Unchanged-baseline guard plus coverage | NFR-006, NFR-016, R-010 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | `PROJECT_STATUS.md` maps to `SessionHandoffMemory` with `PlanMemory` secondary. The plan's recommended mapping was approved and no fourteenth category was added. | Approved by `code_generation_followup_plan_bolt08a.md` |
| Assumption | The domain-design rule is scoped to `/03-domain-design/unit_` rather than the whole directory, so the directory README and the two design templates remain non-memory as the plan's counts intended. | Approved by the plan's measured group of 10 files |
| Assumption | `PlanMemory` was added as a secondary category for `PROJECT_STATUS.md` because the file carries next steps alongside status. This uses existing categories only. | Within the plan's "reuse existing categories" guardrail |
| Deviation | Non-memory rules are consulted only after classification fails, rather than filtering candidates up front. Required because ten directory READMEs already classified as project memory, and a blanket README non-memory rule would have removed them. This preserves the plan's "existing classifications must not change" guardrail exactly, and matches the plan's counts, which were all measured from the 52 skipped files. | Within the plan's scope; recorded here for review. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning during tests inherited from BOLT-02. | Accepted by prior BOLT guardrails; final verification passes. |

## Finding Recorded For A Later Decision

The non-memory rule set now contains an incoherence worth resolving deliberately rather than by accident. Ten READMEs classify as project memory and ten are declared non-memory, but the split follows an implementation detail rather than intent: a README classifies only when its directory is matched by a *directory*-based classifier rule. Where the sibling documents are matched by *filename* instead, the README falls through.

Concretely, `docs/02-construction/04-code-generation/README.md` is memory because its directory is matched by `/04-code-generation/`, while `docs/02-construction/01-architecture/README.md` is not, because architecture artifacts are matched by the filenames `technology_decisions` and `system_architecture`. BOLT-08a added one further instance: scoping the domain-design rule to `/03-domain-design/unit_` leaves that directory's README outside memory.

The underlying question is whether directory READMEs should be memory at all. Both consistent answers exist: declare all twenty non-memory, or classify each by its containing directory's category regardless of how that directory is matched.

Resolving it would change existing classifications, which BOLT-08a was explicitly guarded against. It should be decided in its own slice, most naturally alongside BOLT-14 acceptance when the startup context pack can be inspected end to end.

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | `tsc -p tsconfig.json` completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | `tsc -p tsconfig.json --noEmit` completed successfully. |
| Full tests | `npm test` | Pass | 66 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, and 7 BOLT-08a tests. |
| Unchanged-classification test | BOLT-08a test suite | Pass | All 13 baseline entries keep their exact primary and secondary categories. |
| Category-count test | BOLT-08a test suite | Pass | `V1_MEMORY_CATEGORY_NAMES` still has exactly 13 entries and no `StatusMemory`. |
| New classification tests | BOLT-08a test suite | Pass | Domain-design unit documents map to `DecisionMemory` plus `UnitMemory`; `PROJECT_STATUS.md` maps to `SessionHandoffMemory` plus `PlanMemory`; the directory README and templates still throw. |
| Anchoring test | BOLT-08a test suite | Pass | A root-level session log classifies by path even when the declared artifact type is `unknown`. |
| Non-memory rule tests | BOLT-08a test suite | Pass | All eight representative non-memory paths resolve to a rule, and a classified README still classifies. |
| Coverage test | BOLT-08a test suite | Pass | Zero `unclassified_artifact` skips; every skip is `excluded_by_rule` with a `non-memory:` label; observations plus skips equal the candidate count. |
| Tripwire inversion | BOLT-08 test suite | Pass | `PROJECT_STATUS.md` is now asserted present as an observation with artifact type `project-status`. |
| Regression suite | BOLT-01 through BOLT-08 suites | Pass | The classifier change breaks no existing behaviour and the domain import boundary still holds. |

## Follow-Ups

- BOLT-08a Code Generation Report and Test Results approved on 2026-07-27; no BOLT-08a review artifacts remain pending.
- `unclassified_artifact` is now an alarm rather than a routine outcome. Keep the coverage test as the gate whenever a new document type is introduced.
- Decide the directory-README question in its own slice, most naturally at BOLT-14.
- `DEFAULT_ARTIFACT_TYPE_RULES` is now redundant for paths the anchored classifier matches. Removing it was deliberately deferred and can be revisited once BOLT-09 is stable.
- BOLT-09 remains the next v1 bolt: JSONL event log, `.agent-memory/` layout, file-backed SQLite index, and rebuild from real durable sources.
