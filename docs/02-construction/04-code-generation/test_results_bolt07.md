# Test Results - BOLT-07 / UNIT-05

**Project:** Agent-memory
**Date:** 2026-07-27
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt07.md`

## Approval Status

Approved by user on 2026-07-27.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 51 tests passed, 0 failed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, and 10 BOLT-07 tests. |
| Profile lifecycle tests | BOLT-07 tests | Pass | A new profile is `disabled`; enable/disable return copies; enabling with mode `disabled`, a blank reason, a non-positive candidate limit, or an out-of-range similarity all throw `SemanticRetrievalValidationError`. |
| Disabled-profile tests | BOLT-07 tests | Pass | With a disabled profile, fusion returns the baseline list unchanged and the resulting context pack is deep-equal to the pack built directly from the baseline, within the same 2000-token startup budget. |
| Degraded-mode tests | BOLT-07 tests | Pass | An active profile with no ports, index only, a throwing provider, or an intent with no goal or query degrades to baseline and states the reason; the degraded recall still fuses into a valid baseline-only decision. |
| Candidate rejection tests | BOLT-07 tests | Pass | Matches are rejected with rule `missing_governed_reference`, `ineligible_visibility`, `ineligible_retention`, `deleted_memory`, or `invalid_similarity`; only the eligible match becomes a candidate, and its signal is marked secondary. |
| Fusion authority tests | BOLT-07 tests | Pass | A semantic candidate with similarity 1.0 ranks below an approved lifecycle candidate, carries `score: 0` and a `semantic:secondary-signal` marker; a semantic match on an existing baseline memory sets origin `both` without changing its rank. |
| Conflict tests | BOLT-07 tests | Pass | `historical` excludes, `draft` demotes to last position, a rival approved version routes to `review_required`, and a candidate on an unrelated source path produces no conflict. Excluded and review-required candidates have no final rank and never enter the fused list. |
| Delete cleanup tests | BOLT-07 tests | Pass | Disabled profile returns `not_applicable` and non-retryable; an active profile with no index or an unproven purge returns `incomplete` and retryable; a successful purge returns `completed`, and repeating the same operation stays `completed` with nothing removed or remaining; a throwing index reports the failure reason; a blank operation ID throws. |
| Port-backed recall tests | BOLT-07 tests | Pass | With both ports attached, recall returns only matches that resolve to governed records, rejects the unknown one, assigns a medium confidence band at similarity 0.7, and fuses below baseline. |
| Boundary tests | BOLT-07 tests | Pass | No `openai`, `cohere`, `transformers`, `onnxruntime`, `embedding`, `sqlite-vec`, `pgvector`, `chromadb`, `faiss`, `lancedb`, or `iii` dependency is declared, and every import in `src/**/*.ts` is relative or `node:`-prefixed. |

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | Tests cover US-008: semantic recall augments rather than replaces lifecycle retrieval, disabled mode leaves baseline fully functional, and semantic candidates stay tied to governed memory. | No real embedding provider or vector index exists, so recall quality and similarity calibration are untested by construction. |
| Domain invariants | Tests cover SemanticRetrievalProfile (disabled default, disabled is valid, transitions return copies), SemanticCandidateSet (candidate must link to a governed memory), SemanticSignal (always secondary), and RetrievalFusionDecision (approved lifecycle outranks semantic; pack stays token-bounded). | Repository persistence for profiles, candidate sets, and fusion decisions is not implemented in this slice. |
| Integration points | Fusion consumes BOLT-03 `RetrievalCandidate` and feeds `buildContextPack` unchanged; eligibility mirrors BOLT-04 visibility, retention, and deletion semantics; cleanup consumes a delete operation ID. | Cleanup is not yet wired into an executing delete operation, because BOLT-04 delete execution remains deferred. |
| NFR / risk scenarios | Tests and implementation address NFR-005, NFR-008, NFR-010, NFR-011, NFR-015, NFR-018, NFR-020, R-003, R-005, R-008, R-009, R-011, and R-013. The source-import scan keeps NFR-015 machine-enforced. | R-003 mitigation is proven against the fusion rule, not against real vector results; the rule should be re-validated when a provider is added. |

## Follow-Ups

- BOLT-07 Test Results approved on 2026-07-27.
- Keep the fusion authority and delete cleanup tests as the acceptance gate when an embedding provider or vector index is eventually implemented.
- Add persistence tests for `SemanticRetrievalProfileRepository`, `SemanticCandidateSetRepository`, and `RetrievalFusionDecisionRepository` when storage for them is planned.
- Wire `cleanupSemanticEntries` into delete execution once BOLT-04 filesystem delete execution is approved.
- Revisit the `review_required` evidence threshold (LD-UNIT05-OQ-003) once real semantic results are available.
