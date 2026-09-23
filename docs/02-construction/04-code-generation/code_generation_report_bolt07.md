# Code Generation Report - BOLT-07 / UNIT-05

**Project:** Agent-memory
**Date:** 2026-07-27

## Approval Status

Approved by user on 2026-07-27. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt07.md` (approved by user on 2026-07-27).

## Summary

- Implemented the seventh approved Code Generation slice: BOLT-07 / UNIT-05 Optional Semantic Retrieval Extension Boundary.
- Added a semantic retrieval profile with `disabled`, `enabled`, `experimental`, and `expanded` modes that is created disabled, carries a human-readable reason, and returns copies on every transition.
- Added `SemanticProviderPort` (`describeProvider`, `embedMemory`, `embedQuery`) and `SemanticIndexPort` (`upsertSemanticEntry`, `querySemanticCandidates`, `deleteSemanticEntries`) as interfaces with no implementation.
- Modelled the provider result as an opaque `SemanticRepresentation` handle rather than a vector, so this slice commits to no representation shape while ADR-005 defers provider selection.
- Added `SemanticSignal` with a literal `secondary: true` field, so a semantic signal cannot be constructed as a primary ranking signal.
- Added `buildSemanticCandidateSet`, which rejects a match that has no governed memory record, an out-of-range similarity, or that fails governance eligibility, and returns the rejections with their rule so callers can explain the drop.
- Added `evaluateSemanticEligibility`, which drops deleted memories, expired retention policies, and records whose visibility exceeds the actor's scope before fusion.
- Added `fuseRetrievalCandidates` with a lifecycle-authoritative policy: baseline order is never changed, a semantic candidate matching a baseline memory annotates that item instead of moving it, and semantic-only candidates land strictly after every baseline candidate.
- Added `assessSemanticConflict`, producing `exclude` for superseded statuses, `demote` for unsettled statuses, and `review_required` only when two approved versions of the same source path disagree.
- Added `cleanupSemanticEntries`, which is a no-op when disabled, reports `incomplete` and retryable when an active profile cannot prove the purge, and stays idempotent across repeated operation IDs.
- Added an optional `SemanticRetrievalExtension` coordinator so degraded behaviour (missing provider, missing index, provider failure, empty intent) is a tested contract rather than caller-specific handling.
- Added BOLT-07 tests for disabled fallback, degraded modes, candidate rejection, fusion authority, baseline annotation, conflict outcomes, delete cleanup, port-backed recall, and a no-embedding-dependency boundary.
- Did not select, install, import, or implement any embedding provider or vector index, did not compute or store embeddings, did not change BOLT-03 ranking weights or the 2000-token budget, and did not add any capability, surface, dependency, or README change.

## Approved Inputs

- **Units:** UNIT-05
- **Bolts:** BOLT-07
- **User Stories:** US-008, with US-006 governance interaction for eligibility and delete cleanup
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension.md`
- **Logical Designs:** `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension_logical_design.md`
- **NFRs:** NFR-005, NFR-008, NFR-010, NFR-011, NFR-015, NFR-018, NFR-020
- **Risks:** R-003, R-005, R-008, R-009, R-011, R-013
- **Technology Decisions:** ADR-001, ADR-003, ADR-004, ADR-005

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `package.json` | Updated | UNIT-05 / verification | Updated `npm test` to run the new BOLT-07 compiled test file. |
| `src/index.ts` | Updated | UNIT-05 | Exported BOLT-07 semantic retrieval extension contracts from the public package entrypoint. |
| `src/domain/semantic-retrieval-extension.ts` | Added | UNIT-05 / US-008 | Semantic profile and modes, provider/index ports, semantic signal and candidate contracts, eligibility filtering, lifecycle-authoritative fusion, conflict assessment, delete-aware cleanup, and the optional extension coordinator. |
| `tests/semantic-retrieval-extension.test.ts` | Added | UNIT-05 / US-008 | BOLT-07 tests for disabled fallback, degraded modes, candidate rejection, fusion authority, conflict outcomes, delete cleanup, port-backed recall, and dependency/import boundaries. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt07.md` | Updated | AI-DLC gate | Recorded approval, execution progress, verification, and report creation status. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt07.md` | Added | AI-DLC gate | This BOLT-07 Code Generation Report. |
| `docs/02-construction/04-code-generation/test_results_bolt07.md` | Added | AI-DLC gate | BOLT-07 verification evidence. |

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Semantic retrieval profile and mode model | UNIT-05 / BOLT-07 | US-008 | SemanticRetrievalProfile, SemanticProfileSetting, SemanticRetrievalMode | Optional extension profile; disabled mode is valid | NFR-005, NFR-010, NFR-015, R-011 |
| Semantic provider and index port interfaces | UNIT-05 / BOLT-07 | US-008 | Semantic Provider Port, Semantic Index Port | ADR-LD-UNIT05-001: define ports, defer provider | NFR-010, NFR-015, R-011 |
| Semantic signal and candidate contracts | UNIT-05 / BOLT-07 | US-008 | SemanticSignal, SemanticCandidate, SemanticCandidateSetFactory | Semantic signal is marked secondary | R-003, R-008, R-009 |
| Governed-reference validation and eligibility filtering | UNIT-05 / BOLT-07 | US-006, US-008 | SemanticCandidateSet invariants | Ineligible candidates dropped before fusion | NFR-008, NFR-011, NFR-018, R-013 |
| Lifecycle-authoritative fusion | UNIT-05 / BOLT-07 | US-008 | RetrievalFusionDecision, FusionPolicy, RetrievalFusionService | ADR-LD-UNIT05-002: lifecycle evidence beats semantic similarity | NFR-020, R-003, R-008, R-009 |
| Conflict assessment outcomes | UNIT-05 / BOLT-07 | US-008 | ConflictAssessment, SemanticConflictPolicyService | Conflicts demote, exclude, or route for review | R-003, R-009 |
| Delete-aware semantic cleanup | UNIT-05 / BOLT-07 | US-006, US-008 | Delete cleanup integration contract | Delete-aware derived index | NFR-011, R-005 |
| Degraded-mode fallback | UNIT-05 / BOLT-07 | US-008 | SemanticRetrievalMode disabled invariant | Provider unavailable falls back to baseline | NFR-005, NFR-015, R-003 |
| BOLT-07 tests | UNIT-05 / BOLT-07 | US-008 | UNIT-05 validation checklist | Contract tests for optional extension and no-provider boundary | NFR-010, NFR-011, NFR-015, NFR-020, R-003, R-005 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | `SemanticRepresentation` is an opaque handle (`representationId`, `providerLabel`, `createdAt`) rather than a numeric vector, so the slice commits to no representation shape while the provider stays deferred. | Approved by the plan guardrail "Ports must carry no provider-specific types." |
| Assumption | `SemanticCandidate` carries the resolved `ProjectedMemoryRecord`, because conflict assessment and eligibility both need approval status, visibility, and source path. The record is looked up from governed memory, never synthesised from a match. | Approved by `code_generation_followup_plan_bolt07.md` |
| Assumption | Governance eligibility is expressed as an actor visibility scope plus optional deleted-memory and expired-retention lists supplied by the caller, because UNIT-04 exposes no candidate-eligibility query in the current code. | Approved by the plan's "filter semantic candidates through BOLT-04 eligibility" scope |
| Assumption | `review_required` is limited to two approved versions of the same source path disagreeing. Broader evidence thresholds stay deferred under LD-UNIT05-OQ-003. | Recorded as partially resolved in `code_generation_followup_plan_bolt07.md` |
| Assumption | `src/docs/` fixtures were not required because BOLT-07 tests construct projected records, matches, and stub ports directly. | Approved by `code_generation_followup_plan_bolt07.md` |
| Deviation | Fusion appends semantic-only candidates positionally and gives them `score: 0` instead of blending scores. This is stricter than "semantic cannot outrank approved lifecycle memory": it means semantic never reorders baseline at all. Chosen because a score-blend would need weights that no approved artifact specifies. | Within the plan's lifecycle-authoritative fusion scope; recorded here for review. |
| Deviation | `SemanticRetrievalExtension` is an optional coordinator that calls the ports. It performs no embedding and no persistence; it exists so degraded behaviour is tested rather than reimplemented per caller. | Within the plan's degraded-mode scope. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning during tests inherited from BOLT-02. | Accepted by prior BOLT guardrails; final verification passes. |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | `tsc -p tsconfig.json` completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | `tsc -p tsconfig.json --noEmit` completed successfully. |
| Full tests | `npm test` | Pass | 51 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, and 10 BOLT-07 tests. |
| Disabled-profile tests | BOLT-07 test suite | Pass | A fused pack built from a disabled profile is deep-equal to the untouched baseline pack. |
| Degraded-mode tests | BOLT-07 test suite | Pass | Missing provider, missing index, provider failure, and an intent with no goal or query all degrade to baseline with a stated reason. |
| Fusion authority tests | BOLT-07 test suite | Pass | A similarity-1.0 semantic candidate still ranks below approved lifecycle memory; a semantic match on a baseline memory annotates instead of reordering. |
| Governance tests | BOLT-07 test suite | Pass | Orphan, over-visibility, expired-retention, deleted, and invalid-similarity matches are rejected with their rule before fusion. |
| Conflict tests | BOLT-07 test suite | Pass | Superseded statuses exclude, unsettled statuses demote to last, and rival approved versions route for review; excluded and review-required candidates never enter the pack. |
| Delete cleanup tests | BOLT-07 test suite | Pass | No-op when disabled, incomplete and retryable when an active profile has no index or the purge is unproven, completed and idempotent on repeat. |
| Boundary tests | BOLT-07 test suite | Pass | No embedding, vector-store, or runtime dependency is declared, and every `src/**/*.ts` import is relative or `node:`-prefixed. |

## Follow-Ups

- BOLT-07 Code Generation Report and Test Results approved on 2026-07-27; no BOLT-07 review artifacts remain pending.
- BOLT-07 is the last bolt in the approved `bolts_plan.md`. A post-BOLT-07 planning gate is required to select the next slice from the deferred MCP server, CLI binary/parser, local HTTP API server, filesystem delete/export execution, concrete iii adapter, and README work.
- Embedding provider and vector index selection remains deferred to a later approved decision gate (OQ-003, LD-UNIT05-OQ-001).
- LD-UNIT05-OQ-003 remains partially open: the `review_required` evidence threshold should be revisited once real semantic results exist.
- When a provider is implemented, keep the fusion and cleanup tests as the acceptance gate so lifecycle authority and delete coverage cannot regress.
