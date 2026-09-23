# AI-DLC Code Generation Follow-Up Plan - BOLT-07 / UNIT-05

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27

## Purpose

Plan the next AI-DLC Code Generation slice after the approved BOLT-06 / UNIT-03 iii runtime adapter boundary.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-07 code-generation reports, or BOLT-07 test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-06 review outputs are approved; further code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-07 / UNIT-05 Optional Semantic Retrieval Extension Boundary | `bolts_plan.md` marks BOLT-07 as the final planned bolt and the UNIT-05 slice. BOLT-03 provides the baseline retrieval pipeline and BOLT-04 provides governance, so the optional semantic boundary can now be defined against real contracts. |

## Human Selection Recorded Before This Plan

| ID | Question | Selection | Selector / Date |
|----|----------|-----------|-----------------|
| LD-UNIT05-OQ-002 | Should semantic retrieval be completely absent from v1 implementation or included as disabled experimental plumbing? | Disabled extension boundary: optional ports, profile, fusion, conflict, and delete-cleanup contracts with no embedding provider. | User / 2026-07-27 |

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| User stories | Approved | `docs/01-inception/02-user-stories/all_user_stories.md` |
| NFRs | Approved | `docs/01-inception/03-nfrs/nfrs.md` |
| Risk register | Approved | `docs/01-inception/04-risks/risk_register.md` |
| Units composition | Approved | `docs/01-inception/05-units/units_composition.md` |
| Bolts plan | Approved | `docs/01-inception/06-bolts/bolts_plan.md` |
| Technology Decisions | Approved | `docs/02-construction/01-architecture/technology_decisions.md` |
| System Architecture | Approved | `docs/02-construction/01-architecture/system_architecture.md` |
| UNIT-05 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension.md` |
| UNIT-05 Logical Design | Approved | `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension_logical_design.md` |
| BOLT-06 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt06.md` |
| BOLT-06 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt06.md` |
| Code Generation skill and templates | Available | `docs/00-methodology/01-skills/ai-dlc-code-generation/SKILL.md`, `docs/02-construction/04-code-generation/` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime package | TypeScript/Node package with strict TypeScript checks, direct compiled test execution, and no runtime dependencies. | Reuse the existing approved runtime and test setup; add no dependency. |
| Baseline retrieval | BOLT-03 provides `QueryIntent`, `RetrievalMode`, `TokenBudget`, `RetrievalCandidate`, `RankingRationale`, `rankRetrievalCandidates`, `buildContextPack`, and `StartupContextRetriever`. | Semantic candidates must fuse into these contracts as a secondary signal without changing baseline ranking. |
| Governance/operations | BOLT-04 provides governed write, delete/export decisions, provenance, retention, visibility, and redaction semantics. | Semantic candidates must pass governance eligibility before fusion; deletes must reach derived semantic entries. |
| Capability contracts | BOLT-05 provides capability definitions, router envelopes, and memory job types. | Semantic profile state may be reported through existing capability/observation contracts; no new capability is added in this slice. |
| Runtime adapter boundary | BOLT-06 established the optional-boundary pattern: neutral domain contracts, disabled-by-default binding, machine-enforced no-dependency import test. | Reuse the same shape for the semantic extension boundary. |
| Current tests | UNIT-01 through BOLT-06 tests pass, 41 total. | Add focused BOLT-07 tests and keep existing tests passing. |

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for BOLT-07 only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add semantic retrieval profile contracts | Add TypeScript types/factories for `SemanticRetrievalMode` (disabled, enabled, experimental, expanded), profile settings, and enable/disable/mark-experimental transitions. | A profile must default to disabled, and disabled must be a fully valid state. |
| Add semantic provider and index port interfaces | Define `SemanticProviderPort` (`embedMemory`, `embedQuery`, `describeProvider`) and `SemanticIndexPort` (`upsertSemanticEntry`, `querySemanticCandidates`, `deleteSemanticEntries`) as interfaces only. | Do not select, install, import, or implement any embedding provider or vector index. Ports must carry no provider-specific types. |
| Add semantic candidate contracts | Add `SemanticSignal`, `SemanticCandidate`, and a candidate builder that rejects any candidate lacking a governed memory reference. | A semantic candidate can never become durable memory or a standalone record. |
| Add lifecycle-authoritative fusion | Implement `FusionPolicy`, conflict assessment, and a fusion service that combines baseline and semantic candidates so approved lifecycle evidence outranks semantic-only similarity. | Semantic signal must be marked secondary and can never outrank an approved lifecycle candidate by itself. |
| Add governance eligibility filtering | Filter semantic candidates through BOLT-04 eligibility before fusion. | Ineligible candidates are dropped before fusion, not after. |
| Add delete-aware cleanup contract | Define a cleanup contract that maps a delete operation ID and memory IDs onto semantic index removal, including an idempotent no-op when the extension is disabled. | Cleanup must report incomplete rather than silently succeed when an enabled index cannot be purged. |
| Add BOLT-07 tests | Add tests for disabled-profile fallback, provider-unavailable degradation, candidate rejection, conflict demotion/exclusion, token-budget behaviour after fusion, delete cleanup, and a no-embedding-dependency boundary. | Keep tests traceable to US-008, NFR-010, NFR-011, NFR-015, NFR-020, R-003, R-005, R-008, and R-009. |
| Produce BOLT-07 Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report_bolt07.md` and `docs/02-construction/04-code-generation/test_results_bolt07.md`. | Do not rewrite approved BOLT-01 through BOLT-06 report/test artifacts. |

## Scope For BOLT-07

### In Scope

- Optional semantic retrieval profile with disabled, enabled, experimental, and expanded modes, defaulting to disabled.
- `SemanticProviderPort` and `SemanticIndexPort` interface definitions with no implementation.
- Semantic signal and semantic candidate contracts tied to governed memory IDs.
- Candidate builder validation that rejects candidates without a governed memory reference.
- Lifecycle-authoritative fusion policy, conflict assessment producing exclude / demote / require-review outcomes, and fusion explanation output.
- Governance eligibility filtering before fusion.
- Degraded-mode semantics when a profile is enabled but no provider or index is attached.
- Delete-aware semantic cleanup contract with operation ID, idempotency, and incomplete-cleanup reporting.
- Fusion output that feeds the existing BOLT-03 token-bounded context pack without changing its budget rules.
- Tests for the above and a boundary test extending the BOLT-06 import scan.
- BOLT-07-specific Code Generation Report and Test Results artifacts.

### Out Of Scope

- Selecting, installing, importing, or implementing any embedding provider, model, or vector index.
- Computing, storing, or persisting embeddings or vectors.
- Changing BOLT-03 baseline ranking weights or the 2000-token startup budget.
- Adding a new capability name, MCP tool, CLI command, or local API endpoint.
- Actual MCP server, CLI binary/parser, or local HTTP API server implementation.
- Concrete iii SDK dependency or runtime execution.
- Actual filesystem delete/export package execution.
- Deployment, packaging for release, hosted/server profile, or README rewrite.
- Any new runtime or dev dependency.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| LD-UNIT05-OQ-002: absent from v1 or disabled plumbing? | Resolved: disabled extension boundary with no provider. | Recorded human selection on 2026-07-27; see `bolt06_review_approval_plan.md`. |
| OQ-003 / LD-UNIT05-OQ-001: which embedding provider or model? | Deferred. Ports must carry no provider-specific types so the choice stays open. | ADR-005 defers provider selection from v1; a later approved decision gate is required. |
| LD-UNIT05-OQ-003: what evidence triggers semantic-vs-approved conflict review? | Partially resolved: implement exclude / demote / require-review outcomes and a conservative default that demotes on any approval-status contradiction. Tuning the evidence threshold stays deferred. | The three outcomes are named in the approved Domain Design; the threshold needs real semantic results to calibrate. |
| Should the semantic profile be exposed as a new capability? | No. BOLT-07 keeps the profile internal to the retrieval domain. | Adding a capability would change the approved BOLT-05 capability set without a story requiring it. |
| Should fusion change BOLT-03 ranking? | No. Semantic is a secondary signal fused before packing; baseline ranking and token budget are unchanged. | NFR-020 and R-003 require lifecycle-authoritative ordering and a bounded pack. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Semantic retrieval profile and mode model | UNIT-05 / BOLT-07 | US-008 | SemanticRetrievalProfile, SemanticProfileSetting, SemanticRetrievalMode | NFR-010, NFR-015, R-011 |
| Semantic provider and index port interfaces | UNIT-05 / BOLT-07 | US-008 | Semantic Provider Port, Semantic Index Port | NFR-010, NFR-015, R-011 |
| Semantic candidate contracts and builder validation | UNIT-05 / BOLT-07 | US-008 | SemanticCandidateSet, SemanticCandidate, SemanticCandidateSetFactory | NFR-008, NFR-018, R-013 |
| Lifecycle-authoritative fusion and conflict assessment | UNIT-05 / BOLT-07 | US-008 | RetrievalFusionDecision, FusionPolicy, ConflictAssessment, RetrievalFusionService | NFR-020, R-003, R-008, R-009 |
| Governance eligibility filtering before fusion | UNIT-05 / BOLT-07 | US-006, US-008 | SemanticConflictPolicyService, UNIT-04 eligibility contract | NFR-008, NFR-011, NFR-018, R-013 |
| Delete-aware semantic cleanup contract | UNIT-05 / BOLT-07 | US-006, US-008 | Delete cleanup integration contract | NFR-011, R-005 |
| Disabled-profile and provider-unavailable fallback | UNIT-05 / BOLT-07 | US-008 | SemanticRetrievalMode disabled invariant | NFR-005, NFR-015, R-003 |
| BOLT-07 tests and reports | UNIT-05 / BOLT-07 | US-008 | UNIT-05 validation checklist | NFR-010, NFR-011, NFR-015, NFR-020, R-003, R-005 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-07 Code Generation follow-up plan.
- [x] Reconfirm approved inputs and verify no upstream approval has changed.
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add semantic retrieval profile, mode, and setting contracts with a disabled default.
- [x] Add `SemanticProviderPort` and `SemanticIndexPort` interfaces with no implementation.
- [x] Add semantic signal and semantic candidate contracts with governed-memory validation.
- [x] Implement lifecycle-authoritative fusion, conflict assessment, and fusion explanation.
- [x] Implement governance eligibility filtering before fusion.
- [x] Implement the delete-aware semantic cleanup contract.
- [x] Add tests for disabled fallback, provider-unavailable degradation, candidate rejection, conflict outcomes, token-budget behaviour, delete cleanup, and the no-embedding-dependency boundary.
- [x] Add `src/docs/` fixtures only if needed for tests. (Not needed; tests construct projected records, matches, and stub ports directly.)
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt07.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt07.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (One test-side ordering assertion failed during development and was corrected before final verification; no implementation change was needed and the final run has no failures.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-07 behavior. |
| Disabled-profile tests | BOLT-07 test suite | Verify baseline retrieval and context packing are unchanged when semantic retrieval is disabled. |
| Degraded-mode tests | BOLT-07 test suite | Verify an enabled profile with no provider or index falls back to baseline-only retrieval and reports degraded mode. |
| Fusion authority tests | BOLT-07 test suite | Verify an approved lifecycle candidate outranks a higher-similarity semantic candidate and that conflicts demote or exclude. |
| Governance tests | BOLT-07 test suite | Verify ineligible or reference-less semantic candidates are dropped before fusion. |
| Delete cleanup tests | BOLT-07 test suite | Verify cleanup is idempotent, is a no-op when disabled, and reports incomplete when an enabled index cannot be purged. |
| Boundary tests | BOLT-07 test suite | Verify no embedding provider, vector index, or other dependency is required, and every `src/**/*.ts` import stays relative or `node:`-prefixed. |

## Approval Gate

- Approved by user on 2026-07-27. Execution of the BOLT-07 / UNIT-05 scope described here is authorized.
- Approval of this plan authorizes only the BOLT-07 / UNIT-05 implementation described here.
- Any embedding provider or vector index selection, concrete iii SDK dependency, MCP server, CLI binary, local HTTP server, filesystem delete/export execution, deployment work, README rewrite, new dependency, or deviation from this plan requires a new approval or approved follow-up plan.

## Planning Note On Remaining Work

BOLT-07 is the final bolt in the approved `bolts_plan.md`. Completing it does not make the package usable end to end: MCP server, CLI binary/parser, local HTTP API server, filesystem delete/export execution, a concrete iii adapter, and the README rewrite all remain deferred behind later approved plans. A post-BOLT-07 planning gate should decide which of those becomes the next slice.

## Execution Notes

- 2026-07-27: Plan created for human review after BOLT-06 report/test approval and the LD-UNIT05-OQ-002 human selection. No implementation, tests, dependency changes, runtime structure changes, BOLT-07 code-generation report, or BOLT-07 test-results report were created.
- 2026-07-27: Plan approved by the user. BOLT-07 implementation executed: `src/domain/semantic-retrieval-extension.ts` added, `src/index.ts` and `package.json` updated, and `tests/semantic-retrieval-extension.test.ts` added. No dependency was added and no embedding or vector was computed or stored. Final verification passed with `npm run build`, `npm run typecheck`, and `npm test` (51 tests, 0 failures). BOLT-07 Code Generation Report and Test Results created and are pending human review.
