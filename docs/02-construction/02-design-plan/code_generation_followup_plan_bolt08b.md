# AI-DLC Code Generation Follow-Up Plan - BOLT-08b / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27, with both second-decision-point recommendations accepted

## Purpose

Act on the reviewer's decision that directory README files are not project memory, by giving selected non-memory rules precedence over classification.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-08b code-generation reports, or BOLT-08b test-results reports until this plan is explicitly approved by the human reviewer.

## Decision Being Implemented

| ID | Question | Selection | Selector / Date |
|----|----------|-----------|-----------------|
| BOLT-08a follow-up | Should directory READMEs be project memory at all? | No. All twenty README files become non-memory. The ten that currently classify leave memory. | User / 2026-07-27 |

BOLT-08a deliberately made non-memory rules yield to classification, so that slice could guarantee no existing classification changed. This plan reverses that for READMEs only, which is a change BOLT-08a's approval gate explicitly reserved for a later plan.

## Measured Impact

| Metric | After BOLT-08a | After BOLT-08b |
|--------|----------------|----------------|
| Candidate files | 156 | 156 |
| Observations | 115 | **105** |
| `excluded_by_rule` | 41 | **51** |
| `unclassified_artifact` | 0 | 0 |

The ten artifacts leaving memory, with the category each currently holds:

| Path | Current category |
|------|------------------|
| `docs/01-inception/01-intent-clarification/README.md` | IntentMemory |
| `docs/01-inception/02-user-stories/README.md` | UserStoryMemory |
| `docs/01-inception/03-nfrs/README.md` | NfrMemory |
| `docs/01-inception/04-risks/README.md` | RiskMemory |
| `docs/01-inception/05-units/README.md` | UnitMemory |
| `docs/01-inception/06-bolts/README.md` | BoltMemory |
| `docs/01-inception/99-plans/README.md` | PlanMemory |
| `docs/02-construction/02-design-plan/README.md` | PlanMemory |
| `docs/02-construction/04-code-generation/README.md` | VerificationMemory |
| `session-logs/README.md` | SessionHandoffMemory |

## Why Precedence Must Be Per-Rule

Making non-memory rules win globally would remove far more than the decision covers. Measured against this repository, 26 currently classified artifacts also match some non-memory rule:

| Non-memory rule | Classified artifacts it also matches |
|-----------------|--------------------------------------|
| `non-memory:readme` | 10 |
| `non-memory:template` | 11 |
| `non-memory:operations` | 3, all `*_TEMPLATE.md` |
| `non-memory:methodology` | 2, being `setup_validation.md` and `setup_validation_TEMPLATE.md` |

Only the first group is in scope. Precedence is therefore expressed per rule, not as a global ordering change.

## Second Decision Point For The Reviewer

The sixteen artifacts outside the README group have the same shape: declared non-memory by rule, yet classified as project memory. This plan does not change them, but the reviewer should decide whether they stay as they are.

| Group | Count | Recommendation | Reasoning |
|-------|-------|----------------|-----------|
| `*_TEMPLATE.md` files that classify, across inception, design-plan, methodology, and operations | 15 | Give the template rule precedence too, so they leave memory | They contain placeholder text such as `<APPROVER>`, which pollutes retrieval and search with no project content. BOLT-08's `isTemplate` flag and forced `draft` approval already prevent them being treated as approved, but they still occupy the index and the context-pack budget. |
| `docs/00-methodology/setup_validation.md` | 1 | Keep as memory, and narrow the methodology rule to admit it | This is Agent-memory's own setup validation record, referenced from `PROJECT_STATUS.md` as an approved artifact. It is genuine project memory that happens to live under a methodology path. |

If the reviewer accepts both recommendations, observations fall to 90 and `excluded_by_rule` rises to 66, with `setup_validation.md` retained. If the reviewer wants only the README decision, this plan stands as written and the sixteen keep their current behaviour.

**Resolved 2026-07-27: the reviewer accepted both recommendations.** The 15 classifying templates lose memory status and `setup_validation.md` is retained. Target coverage is therefore 90 observations and 66 exclusions, and the template rule gains precedence alongside the README rule.

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| User stories | Approved | `docs/01-inception/02-user-stories/all_user_stories.md` |
| NFRs | Approved | `docs/01-inception/03-nfrs/nfrs.md` |
| Bolts plan addendum, Amendment 1 | Approved | `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` |
| V1 release plan | Approved | `docs/02-construction/02-design-plan/v1_release_plan.md` |
| BOLT-08a Code Generation Report | Pending review | `docs/02-construction/04-code-generation/code_generation_report_bolt08a.md` |
| BOLT-08a Test Results | Pending review | `docs/02-construction/04-code-generation/test_results_bolt08a.md` |

BOLT-08a's review artifacts are still pending. Their measured coverage table states 115 observations and 41 exclusions, which this plan changes. Rather than editing an artifact under review, BOLT-08b's own report will state the superseding numbers and cite this plan.

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Rule precedence | `findNonMemoryRule` is called only after `classifyArtifactSource` throws, so classification always wins. | BOLT-08b adds opt-in precedence for individual rules. |
| README matcher | `non-memory:readme` uses `fileSuffix: "readme.md"`. | Latently too broad: a future `docs/api-readme.md` would match. All twenty current matches are exactly `README.md`, so nothing is wrong today, but a precedence-bearing rule must not over-match. |
| Matcher fields | `WorkspacePathMatcher` supports `pathPrefix`, `pathSegment`, `fileSuffix`, and `rootLevelOnly`. | BOLT-08b adds `fileName` for exact base-name matching. |
| BOLT-08a assertions | `classification-coverage.test.ts` asserts `docs/01-inception/03-nfrs/README.md` classifies as `NfrMemory` while also matching a non-memory rule. | That assertion is inverted by this slice. |
| Current tests | UNIT-01 through BOLT-08a tests pass, 66 total. | BOLT-08b updates two suites and adds one. |

## Implementation Authorization Requested By This Plan

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add per-rule classification precedence | Add an `overridesClassification` boolean to `WorkspaceScanRule` and honour it before attempting classification. | Only rules that set it may win over classification. Default behaviour is unchanged. |
| Add an exact-filename matcher | Add `fileName` to `WorkspacePathMatcher` and use it for the README rule. | A precedence-bearing rule must match exact base names, not suffixes. |
| Set precedence on the README rule only | Mark `non-memory:readme` as overriding. | No other rule may gain precedence in this slice unless the reviewer approves the second decision point. |
| Update affected assertions | Invert the BOLT-08a README assertion and update coverage counts. | Assertions must be replaced with stronger ones, not deleted. |
| Add a no-collateral-loss test | Assert that the other 16 classified-yet-declared-non-memory artifacts remain memory. | Makes the scope boundary machine-enforced, so a future precedence change is deliberate. |
| Add BOLT-08b tests | Cover precedence, exact-filename matching, the ten removals, and unchanged behaviour elsewhere. | Keep tests traceable to US-002 AC-001, AC-002, AC-004, NFR-016, and NFR-020. |
| Produce BOLT-08b Code Generation artifacts | Create `code_generation_report_bolt08b.md` and `test_results_bolt08b.md`. | Do not rewrite approved BOLT-01 through BOLT-08 artifacts, nor the pending BOLT-08a artifacts. |
| Append a bolts addendum amendment | Append a BOLT-08b section to `bolts_plan_addendum_v1_release.md`. | Append only. Existing entries and Amendment 1 stay byte-identical. |

## Scope For BOLT-08b

### In Scope

- `overridesClassification` on `WorkspaceScanRule`, honoured before classification is attempted.
- `fileName` exact-match field on `WorkspacePathMatcher`.
- Precedence set on `non-memory:readme` only, with its matcher tightened to the exact base name.
- Inversion of the BOLT-08a README assertion.
- A test asserting the 16 other classified-yet-declared-non-memory artifacts are untouched.
- Updated coverage counts: 105 observations, 51 exclusions, 0 unclassified.
- BOLT-08b Code Generation Report and Test Results.
- Append-only BOLT-08b amendment to the v1 bolts plan addendum.

### Out Of Scope

- Precedence for the template, methodology, or operations rules, unless the reviewer approves the second decision point.
- Adding, renaming, or removing any memory category.
- Changing BOLT-03 ranking weights or the token budget.
- Editing the pending BOLT-08a report or test results.
- Writing any file from the reader. Persistence remains BOLT-09.
- CLI, MCP server, local HTTP API, delete or export execution, performance measurement, or README rewrite of the repository's own `README.md`.
- Any new runtime or dev dependency.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| Should directory READMEs be memory? | No. Resolved by the reviewer on 2026-07-27. | READMEs are navigation scaffolding. Their content describes what belongs in a folder, not a project decision. |
| Should non-memory rules win globally? | No. Precedence is per rule. | A global change would remove 26 artifacts, not the 10 the decision covers. |
| Should templates also lose memory status? | Deferred to the reviewer as the second decision point, with a recommendation to remove them. | It is a separate judgment affecting 15 files and should be an explicit choice. |
| Should `setup_validation.md` stay memory? | Deferred, with a recommendation to keep it and narrow the methodology rule. | It is a real approved project record that happens to sit under a methodology path. |
| Does removing ten artifacts weaken US-001? | No. None of the ten carry goal, phase, plan, decision, blocker, or next-step content. | Their removal frees context-pack budget for artifacts that do, which serves NFR-020. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Per-rule classification precedence | UNIT-02 / BOLT-08b | US-002 AC-001 | Durable source discovery | NFR-016 |
| Exact-filename matcher | UNIT-02 / BOLT-08b | US-002 AC-001 | Durable source discovery | NFR-016, R-010 |
| README removal from memory | UNIT-02 / BOLT-08b | US-002 AC-002, AC-004 | DurableSourceObservation | NFR-016, NFR-020 |
| No-collateral-loss test | UNIT-02 / BOLT-08b | US-002 AC-002 | UNIT-02 validation checklist | NFR-016, R-010 |
| BOLT-08b tests and reports | UNIT-02 / BOLT-08b | US-002 | UNIT-02 validation checklist | NFR-016, NFR-020 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-08b Code Generation follow-up plan.
- [x] Record the reviewer's answer to the second decision point, or record it as still open. (Both recommendations accepted on 2026-07-27.)
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add `overridesClassification` to `WorkspaceScanRule` and honour it before classification.
- [x] Add `fileName` to `WorkspacePathMatcher`.
- [x] Set precedence on `non-memory:readme` and tighten its matcher to the exact base name.
- [x] Set precedence on `non-memory:template` per the accepted second recommendation.
- [x] Retain `docs/00-methodology/setup_validation.md`. (No methodology-rule narrowing was needed; a non-overriding rule already yields to classification.)
- [x] Invert the BOLT-08a README assertion.
- [x] Add the no-collateral-loss test for the other 16 artifacts.
- [x] Update coverage counts in the affected tests.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt08b.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt08b.md`.
- [x] Append the BOLT-08b amendment to `bolts_plan_addendum_v1_release.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (One test-side defect: a rule tally used prefix matching, which also matched `non-memory:template-checklist`, and its expected value conflated total matches with previously classified files. Fixed in the test; production code was unaffected.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-08b behavior. |
| Precedence test | BOLT-08b test suite | Verify an overriding rule wins over classification and a non-overriding rule still yields to it. |
| Exact-filename test | BOLT-08b test suite | Verify `README.md` matches and a hypothetical `docs/api-readme.md` does not. |
| Removal test | BOLT-08b test suite | Verify all ten listed READMEs are reported `excluded_by_rule` and none appears as an observation. |
| No-collateral-loss test | BOLT-08b test suite | Verify the 15 classifying templates and `setup_validation.md` remain observations. |
| Coverage test | BOLT-08b test suite | Verify 105 observations, 51 exclusions, and 0 unclassified candidates. |
| Regression suite | BOLT-01 through BOLT-08a suites | Verify no other behaviour changed and the domain import boundary still holds. |

## Approval Gate

- Approved by user on 2026-07-27. Execution is authorized for the README precedence change, the template precedence change, and retaining `setup_validation.md`, plus the append-only bolts addendum amendment.
- The second decision point was answered in favour of both recommendations, so the template rule gains precedence in this slice.
- Giving the methodology or operations rules precedence is still not authorized, because that would remove `setup_validation.md`.
- Editing the pending BOLT-08a review artifacts is not authorized. BOLT-08b's report states the superseding coverage numbers instead.

## Execution Notes

- 2026-07-27: Plan created after the reviewer decided that all twenty README files are non-memory. Measurement confirmed ten of them currently classify, and that global precedence would instead remove 26 artifacts, which is why precedence is per rule. No implementation, tests, dependency changes, bolts addendum amendment, BOLT-08b code-generation report, or BOLT-08b test-results report were created.
- 2026-07-27: Plan approved and both second-decision-point recommendations accepted. BOLT-08b implementation executed: `src/storage/workspace-source-reader.ts` updated, `tests/non-memory-precedence.test.ts` added, `tests/workspace-source-reader.test.ts` and `tests/classification-coverage.test.ts` assertions updated, and `package.json` updated. No dependency was added, no memory category was added, and the classifier was not touched. Final verification passed with `npm run build`, `npm run typecheck`, and `npm test` (73 tests, 0 failures). Coverage: 161 candidates, 95 observations, 66 `excluded_by_rule`, 0 `unclassified_artifact`. Amendment 2 appended to the v1 bolts plan addendum. BOLT-08b Code Generation Report and Test Results created and are pending human review.
