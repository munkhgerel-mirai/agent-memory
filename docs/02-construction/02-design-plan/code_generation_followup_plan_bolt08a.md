# AI-DLC Code Generation Follow-Up Plan - BOLT-08a / UNIT-01 + UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27

## Purpose

Close the classification-coverage gap that the BOLT-08 real-tree scan exposed, so that every Markdown file discovered in an AI-DLC workspace is either classified into a lifecycle memory category or excluded by an explicit rule.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-08a code-generation reports, or BOLT-08a test-results reports until this plan is explicitly approved by the human reviewer.

## Why This Bolt Exists

BOLT-08a is not in the approved `bolts_plan_addendum_v1_release.md`. It is proposed here because BOLT-08 produced a measured finding that materially affects US-001, and resolving it before BOLT-09 is cheaper than resolving it after three more bolts assume the current shape.

| Reason | Evidence |
|--------|----------|
| US-001's payload is currently dropped | `PROJECT_STATUS.md` is reported `unclassified_artifact`. It holds the current goal, phase, blockers, and next steps that US-001 AC-001 requires. |
| Approved design rationale is currently dropped | All ten `docs/02-construction/03-domain-design/unit_*.md` documents are unclassified, weakening US-003 traceability. |
| "Not memory" and "no rule yet" are indistinguishable | Both surface as `unclassified_artifact`, so a future coverage regression would be invisible. |
| Doing this after BOLT-09 costs more | BOLT-09 persists whatever BOLT-08 produces, and BOLT-10's `context` command would demo an incomplete answer that only fails at BOLT-14 acceptance. |
| It touches an approved artifact | The classifier lives in UNIT-01. Discovering any upstream Domain Design ripple now is preferable to discovering it at BOLT-14. |

If this plan is approved, an amendment section will be appended to `bolts_plan_addendum_v1_release.md` recording BOLT-08a without altering its existing entries, per NFR-004.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-08 is implemented; further code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-08a / UNIT-01 + UNIT-02 Classification Coverage | The BOLT-08 report records this as the decision that blocks US-001 completeness. |

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| User stories | Approved | `docs/01-inception/02-user-stories/all_user_stories.md` |
| NFRs | Approved | `docs/01-inception/03-nfrs/nfrs.md` |
| Risk register | Approved | `docs/01-inception/04-risks/risk_register.md` |
| Bolts plan addendum (v1 release track) | Approved | `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` |
| V1 release plan | Approved | `docs/02-construction/02-design-plan/v1_release_plan.md` |
| UNIT-01 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md` |
| UNIT-02 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md` |
| BOLT-08 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt08.md` |
| BOLT-08 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt08.md` |

BOLT-07 and BOLT-08 review artifacts were approved by the user on 2026-07-27, so the finding this plan acts on is confirmed and execution is unblocked.

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Classifier rules | `matchCategoryRule` in `src/domain/lifecycle-memory-core.ts` covers intent, user stories, NFRs, risks, units, bolts, decisions, architecture, plans, session logs, verification, and open questions. It has no rule for domain-design documents or for `PROJECT_STATUS.md`. | BOLT-08a adds rules for both. |
| Classifier path matching | Directory rules are tested with a leading slash, for example `/session-logs/`, so a root-level directory never matches by path. | BOLT-08a anchors the compared path so root-level and nested directories behave alike. |
| Memory categories | `V1_MEMORY_CATEGORY_NAMES` defines 13 categories. `DecisionMemory` is "Human-approved technology, architecture, or design decisions"; `SessionHandoffMemory` is "Session logs and handoff records used for continuity". | BOLT-08a reuses existing categories and adds none. |
| Scan rules | `DEFAULT_WORKSPACE_SCAN_RULES` has `include` and `exclude` kinds only. Non-memory documents fall through to `unclassified_artifact`. | BOLT-08a adds a third `non_memory` kind and a matching skip reason. |
| Real-tree measurement | 152 candidates, 100 observations, 52 unclassified, 0 unreadable. | BOLT-08a targets 0 unclassified. |
| Current tests | UNIT-01 through BOLT-08 tests pass, 59 total. A BOLT-08 test asserts `PROJECT_STATUS.md` is skipped as a deliberate tripwire. | That tripwire is inverted by this slice, as its own comment anticipated. |

## Classification Decisions Requested By This Plan

The 52 unclassified candidates group cleanly. Counts are measured, not estimated.

| Group | Count | Decision | Category |
|-------|-------|----------|----------|
| `docs/02-construction/03-domain-design/unit_*.md` including `*_logical_design.md` | 10 | Classify as project memory | `DecisionMemory`, secondary `UnitMemory` |
| `PROJECT_STATUS.md` | 1 | Classify as project memory | `SessionHandoffMemory` |
| `docs/00-methodology/**` | 22 | Explicit non-memory | n/a |
| `docs/03-operations/**` | 8 | Explicit non-memory | n/a |
| `README.md` files at any level | 5 | Explicit non-memory | n/a |
| Remaining `*_TEMPLATE.md` and `TEMPLATE_CHECKLIST.md` | 4 | Explicit non-memory | n/a |
| `AGENTS.md`, `ai-dlc-paper.md` | 2 | Explicit non-memory | n/a |

Rationale for the two memory decisions:

- Domain-design documents are approved design rationale. The classifier already maps `system_architecture` to `DecisionMemory`, so this is consistent rather than novel. `UnitMemory` is secondary because each document is unit-scoped.
- `PROJECT_STATUS.md` is the continuity record for the project, which matches the `SessionHandoffMemory` description exactly. BOLT-03 gives that category a +40 startup boost, placing it fourth of thirteen, which is sufficient for US-001 without special-casing.

Rationale for non-memory: methodology documents describe the AI-DLC method itself rather than this project's lifecycle state; operations documents are unfilled templates; READMEs are navigation; `ai-dlc-paper.md` and `AGENTS.md` are reference material. None of them record an approval, decision, plan, or risk belonging to Agent-memory.

### Alternative Considered And Not Selected

Adding a fourteenth category such as `StatusMemory` for `PROJECT_STATUS.md` would model it more precisely, but it changes `V1_MEMORY_CATEGORY_NAMES`, which the approved UNIT-01 Domain Design enumerates. That would require a Domain Design addendum. Mapping to `SessionHandoffMemory` achieves US-001 coverage without an upstream artifact change and is therefore recommended. If the reviewer prefers the new category, this plan must be revised before execution.

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for BOLT-08a only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Extend classifier rules | Add domain-design and project-status rules to `matchCategoryRule`, and matching entries to `inferArtifactType`. | Add no new memory category. Existing classifications must not change. |
| Anchor classifier path matching | Compare directory rules against a leading-slash-anchored path so root-level and nested directories behave alike. | The change may only add matches, never remove one. Verified by an unchanged-classification test. |
| Add a `non_memory` scan rule kind | Add a third rule kind to `DEFAULT_WORKSPACE_SCAN_RULES` and an `excluded_by_rule` skip reason, so deliberate exclusions are distinguishable from missing rules. | Non-memory rules live in UNIT-02 discovery, not in the UNIT-01 classifier, so the domain classifier keeps a single responsibility. |
| Invert the BOLT-08 tripwire | Update the `PROJECT_STATUS.md` assertion to require classification instead of skipping. | The assertion must be replaced with a stronger one, not deleted. |
| Add a coverage assertion | Add a test requiring zero `unclassified_artifact` skips when scanning this repository. | Coverage becomes machine-enforced, so a future unclassified document fails the suite. |
| Add BOLT-08a tests | Add classifier tests for the new rules and reader tests for the new rule kind, coverage, and unchanged existing behaviour. | Keep tests traceable to US-001, US-002, US-003, NFR-006, NFR-016, and R-010. |
| Produce BOLT-08a Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report_bolt08a.md` and `docs/02-construction/04-code-generation/test_results_bolt08a.md`. | Do not rewrite approved BOLT-01 through BOLT-08 report/test artifacts. |
| Append a bolts addendum amendment | Append a BOLT-08a section to `bolts_plan_addendum_v1_release.md`. | Append only. Existing entries must remain byte-identical. |

## Scope For BOLT-08a

### In Scope

- Classifier rules for `docs/02-construction/03-domain-design/**` mapping to `DecisionMemory` with `UnitMemory` secondary.
- A classifier rule for `PROJECT_STATUS.md` mapping to `SessionHandoffMemory`.
- Leading-slash anchoring of classifier directory matching, guarded by an unchanged-classification test.
- Corresponding `inferArtifactType` entries so a caller that supplies no artifact type still classifies.
- A `non_memory` scan rule kind, an `excluded_by_rule` skip reason, and rules covering methodology, operations, READMEs, remaining templates, `AGENTS.md`, and `ai-dlc-paper.md`.
- Inversion of the BOLT-08 `PROJECT_STATUS.md` tripwire into a positive classification assertion.
- A coverage test requiring zero unclassified candidates when scanning this repository.
- BOLT-08a-specific Code Generation Report and Test Results artifacts.
- An append-only BOLT-08a amendment to the v1 bolts plan addendum.

### Out Of Scope

- Adding, renaming, or removing any memory category. `V1_MEMORY_CATEGORY_NAMES` stays at 13 entries.
- Changing `V1_MEMORY_CATEGORIES` descriptions or lifecycle phases.
- Changing BOLT-03 ranking weights or category boosts.
- Removing `DEFAULT_ARTIFACT_TYPE_RULES`. The redundancy is harmless and removing it would churn BOLT-08 behaviour in the same slice as a classifier change.
- Writing any file. All persistence remains BOLT-09.
- Lifecycle edge extraction between artifacts.
- CLI, MCP server, local HTTP API, delete or export execution, performance measurement, or README rewrite.
- Any new runtime or dev dependency.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| Should `PROJECT_STATUS.md` get its own category? | No. Map it to `SessionHandoffMemory`. | Adding a category changes the approved UNIT-01 category enumeration and would require a Domain Design addendum for no US-001 benefit. |
| Where do non-memory rules belong? | UNIT-02 discovery, not the UNIT-01 classifier. | The classifier answers "which category"; deciding what is a candidate at all is a discovery concern. Keeping them separate preserves single responsibility. |
| Should the leading-slash fix remove the BOLT-08 artifact-type workaround? | Not in this slice. | Changing the classifier and removing the reader workaround together would make a regression hard to attribute. Deferred with a note. |
| Are methodology documents project memory? | No. | They describe the AI-DLC method, not Agent-memory's lifecycle state. Recorded as an explicit rule so the decision is visible. |
| What should happen if a future document matches no rule at all? | The suite fails. | The coverage test makes classification completeness a machine-enforced property rather than a review habit. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Domain-design classification rule | UNIT-01 / BOLT-08a | US-002 AC-002, US-003 | ArtifactClassification, DecisionMemory, UnitMemory | NFR-016, R-010 |
| Project-status classification rule | UNIT-01 / BOLT-08a | US-001 AC-001, US-002 AC-002 | SessionHandoffMemory | NFR-001, NFR-006, NFR-016 |
| Leading-slash path anchoring | UNIT-01 / BOLT-08a | US-002 AC-002 | matchCategoryRule | NFR-016, R-010 |
| Non-memory scan rules and skip reason | UNIT-02 / BOLT-08a | US-002 AC-001, AC-004 | Durable source discovery | NFR-006, NFR-016, R-014 |
| Coverage assertion | UNIT-02 / BOLT-08a | US-002 AC-002 | UNIT-02 validation checklist | NFR-016, R-010 |
| BOLT-08a tests and reports | UNIT-01 + UNIT-02 / BOLT-08a | US-001, US-002, US-003 | UNIT-01 and UNIT-02 validation checklists | NFR-006, NFR-016, R-010 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-08a Code Generation follow-up plan.
- [x] Confirm BOLT-08 Code Generation Report and Test Results are approved before starting.
- [x] Confirm the reviewer's decision on `SessionHandoffMemory` versus a new category for `PROJECT_STATUS.md`. (Approved as recommended: `SessionHandoffMemory`, no fourteenth category.)
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Capture the current real-tree classification distribution as a before-baseline for the unchanged-classification test.
- [x] Add the domain-design classification rule with `UnitMemory` secondary.
- [x] Add the `PROJECT_STATUS.md` classification rule.
- [x] Anchor classifier directory matching and verify no existing classification changes.
- [x] Add matching `inferArtifactType` entries.
- [x] Add the `non_memory` scan rule kind, `excluded_by_rule` skip reason, and the non-memory rules.
- [x] Invert the BOLT-08 `PROJECT_STATUS.md` tripwire into a positive assertion.
- [x] Add the zero-unclassified coverage test.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt08a.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt08a.md`.
- [x] Append the BOLT-08a amendment to `bolts_plan_addendum_v1_release.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (No test failed. One design conflict was found while capturing the before-baseline and resolved within scope: non-memory rules are consulted only after classification fails, so seven already-classified directory READMEs were not removed.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-08a behavior. |
| New classification tests | BOLT-08a test suite | Verify domain-design documents map to `DecisionMemory` with `UnitMemory` secondary, and `PROJECT_STATUS.md` maps to `SessionHandoffMemory`. |
| Unchanged-classification test | BOLT-08a test suite | Verify every artifact classified before this slice keeps the same primary category, so anchoring only adds matches. |
| Category-count test | BOLT-08a test suite | Verify `V1_MEMORY_CATEGORY_NAMES` still has exactly 13 entries. |
| Non-memory rule tests | BOLT-08a test suite | Verify methodology, operations, README, template, `AGENTS.md`, and `ai-dlc-paper.md` paths are reported `excluded_by_rule`, not `unclassified_artifact`. |
| Coverage test | BOLT-08a test suite | Verify a scan of this repository reports zero `unclassified_artifact` skips. |
| Regression suite | BOLT-01 through BOLT-08 suites | Verify the classifier change breaks no existing behaviour and the domain import boundary still holds. |

## Approval Gate

- Approved by user on 2026-07-27, together with the BOLT-07 and BOLT-08 review artifacts. The plan's recommended mapping stands: `PROJECT_STATUS.md` maps to `SessionHandoffMemory` and no fourteenth category is added.
- Approval of this plan authorizes only the BOLT-08a implementation described here, plus the append-only bolts addendum amendment.
- Adding a memory category, changing category descriptions or ranking weights, writing any file, or any other deviation from this plan requires a new approval or approved follow-up plan.

## Expected Outcome

After BOLT-08a, a scan of an AI-DLC workspace reports every discovered Markdown file as either a classified observation or an explicitly excluded non-memory document. `unclassified_artifact` becomes a genuine alarm rather than a routine outcome, and the coverage test fails whenever a new document type appears without a decision.

Measured target against this repository: 152 candidates, 111 observations, 41 `excluded_by_rule`, 0 `unclassified_artifact`.

## Execution Notes

- 2026-07-27: Plan created after the BOLT-08 real-tree scan measured 52 unclassified candidates, including `PROJECT_STATUS.md` and all ten UNIT domain-design documents. No implementation, tests, dependency changes, runtime structure changes, bolts addendum amendment, BOLT-08a code-generation report, or BOLT-08a test-results report were created.
- 2026-07-27: Plan approved by the user together with the BOLT-07 and BOLT-08 review artifacts. BOLT-08a implementation executed: `src/domain/lifecycle-memory-core.ts` and `src/storage/workspace-source-reader.ts` updated, `tests/classification-coverage.test.ts` added, `tests/workspace-source-reader.test.ts` tripwire inverted, and `package.json` updated. No dependency was added and no memory category was added. Final verification passed with `npm run build`, `npm run typecheck`, and `npm test` (66 tests, 0 failures). Coverage reached 0 unclassified candidates: 156 candidates, 115 observations, 41 `excluded_by_rule`. Amendment 1 appended to the v1 bolts plan addendum. BOLT-08a Code Generation Report and Test Results created and are pending human review.
