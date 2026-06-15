# Test Results - BOLT-02 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-06-15
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt02.md`

## Approval Status

Pending review.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| Built-in SQLite availability | `node -e "import('node:sqlite')..."` | Pass | `node:sqlite` imported successfully; Node emitted an experimental feature warning. |
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 13 tests passed: 7 UNIT-01 tests and 6 BOLT-02 tests. |
| Rebuild validation | BOLT-02 tests | Pass | Rebuilds derived projection state after reset from durable source observations. |
| Local/offline search validation | BOLT-02 tests | Pass | Searches metadata/text locally without hosted infrastructure or network dependency. |

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| Early TypeScript typecheck | Initial `npm run typecheck` failed with TS2352 on a `node:sqlite` result-row cast. | Node's SQLite row type is generic (`Record<string, SQLOutputValue>[]`) and TypeScript required an explicit narrowing step. | Cast query rows through `unknown` before treating them as the internal `ProjectionRow` shape. | No; type-only implementation fix within approved BOLT-02 scope. |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | Tests cover US-004 local indexing/search and rebuild after deleting derived projection state. | US-001 startup context packs and token limits belong to BOLT-03. |
| Domain invariants | Tests cover JSONL event validation, repository projection operations, template exclusion, malformed source warnings, and event replay/removal. | Event compaction/snapshot policy is deferred to operations planning. |
| Integration points | Rebuild uses UNIT-01 artifact classification and lifecycle memory creation; local projection uses `node:sqlite` behind a repository boundary. | UNIT-04 governance engine, UNIT-03 interfaces, iii adapter, and semantic extension are out of scope. |
| NFR / risk scenarios | Tests and implementation address NFR-003, NFR-005, NFR-009, NFR-010, NFR-019, R-002, and R-010 for BOLT-02. | Performance-scale test with 1,000 lifecycle records / 10,000 events remains a later hardening task. |

## Follow-Ups

- Review and approve this BOLT-02 Test Results artifact.
- Keep BOLT-03 retrieval context packing behind a new or approved follow-up plan.
- Keep UNIT-04 governance/delete/export and UNIT-03 interface work behind later approved AI-DLC plans.