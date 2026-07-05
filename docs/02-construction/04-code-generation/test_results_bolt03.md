# Test Results - BOLT-03 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-06-16
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt03.md`

## Approval Status

Approved by user on 2026-06-16.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 17 tests passed: 7 UNIT-01 tests, 6 BOLT-02 tests, and 4 BOLT-03 tests. |
| Token budget validation | BOLT-03 tests | Pass | Default startup budget is 2000 tokens and expanded startup budgets above 2000 are rejected. |
| Ranking validation | BOLT-03 tests | Pass | Approved lifecycle memory outranks conflicting draft memory when base relevance is equal. |
| Provenance validation | BOLT-03 tests | Pass | Startup context pack items include source path, category, approval state, inclusion reason, token estimate, and content. |

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | Tests cover US-001 startup context shape, <=2000 token budget, provenance/category metadata, and approved-over-draft ranking. | Actual CLI/MCP/API startup retrieval is deferred to UNIT-03. |
| Domain invariants | Tests cover token budget validation, deterministic token estimate behavior, ranked candidate ordering, and context pack omission under tight budget. | Model-specific tokenizer selection remains deferred. |
| Integration points | Startup retrieval operates over the BOLT-02 local projection repository and search results. | UNIT-04 governance eligibility and full delete/export semantics remain out of scope. |
| NFR / risk scenarios | Tests and implementation address NFR-001, NFR-002, NFR-006, NFR-020, R-008, and R-009 for BOLT-03. | Performance-scale verification for NFR-009 remains a later hardening task. |

## Follow-Ups

- BOLT-03 Test Results approved on 2026-06-16.
- Keep UNIT-04 governance/delete/export and UNIT-03 interface work behind later approved AI-DLC plans.
- Add scale/performance tests before claiming full NFR-009 local workspace scale.