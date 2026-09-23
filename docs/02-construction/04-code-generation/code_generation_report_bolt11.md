# Code Generation Report - BOLT-11 Governed Delete And Export

**Project:** Agent-memory
**Date:** 2026-08-26

## Approval Status

Approved by the user on 2026-08-26.

## Summary

- Implemented governed JSON export with exact target resolution, provenance, and caller-selected output paths.
- Implemented governed deletion through an append-only `memory_deleted` tombstone, active SQLite projection cleanup, and the BOLT-07 semantic cleanup contract.
- Enabled CLI `export` and confirmation-gated `delete`; governed `write` remains unavailable.
- Rebuild now honours deliberate deletion tombstones even while the Markdown source remains visible.
- Partial cleanup reports `incomplete` and retryable instead of success.

## Approved Inputs

- **Unit / Bolt:** UNIT-04 / BOLT-11
- **User Stories:** US-005 AC-002; US-006 AC-003 and AC-004
- **Domain Elements:** `MemoryOperationRequest`, `OperationDecision`, `ProvenanceStamp`, `MemoryEventRecord`
- **Logical Designs:** UNIT-02 local workspace storage; UNIT-04 privacy and governance; UNIT-05 optional semantic retrieval
- **NFRs:** NFR-003, NFR-004, NFR-011, NFR-012, NFR-013
- **Risks:** R-005, R-010

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `src/storage/governed-memory-operations.ts` | Added | UNIT-04 / US-006 | Executes governed export and delete, reports cleanup outcomes. |
| `src/domain/local-workspace-storage.ts` | Updated | UNIT-02 / US-006 AC-003 | Adds validated `memory_deleted` event type. |
| `src/storage/workspace-memory-store.ts` | Updated | UNIT-02 / US-006 AC-003 | Appends tombstones and exposes projection removal. |
| `src/storage/local-workspace-index.ts` | Updated | UNIT-02 / US-006 AC-003 | Applies deletion tombstones during rebuild. |
| `src/domain/framework-agnostic-integration.ts` | Updated | UNIT-03 / US-005 | Adds the caller-selected export output path to the capability contract. |
| `src/cli/run.ts` | Updated | UNIT-03 / US-005, US-006 | Enables export and confirmation-gated delete with clear source-file messaging. |
| `src/index.ts` | Updated | UNIT-04 / US-006 | Exports the governed operation surface. |
| `tests/governed-memory-operations.test.ts` | Added | UNIT-04 / US-006 | Export, governance, semantic cleanup, and partial-failure tests. |
| `tests/workspace-memory-store.test.ts` | Updated | UNIT-02 / US-006 AC-003 | Proves rebuild-after-delete and Markdown preservation. |
| `tests/cli.test.ts` | Updated | UNIT-03 / US-005, US-006 | End-to-end export/delete and confirmation tests. |
| `package.json` | Updated | BOLT-11 | Adds the BOLT-11 test file to the regression command; no dependency change. |

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Portable JSON export | UNIT-04 | US-006 AC-004 | `ProvenanceStamp` | Exact targets and one caller-named document | NFR-011, NFR-012 |
| Deliberate deletion tombstone | UNIT-02 + UNIT-04 | US-006 AC-003 | `MemoryEventRecord` | Event history overrides a visible source only for `memory_deleted` | NFR-003, R-005 |
| Derived-store cleanup | UNIT-04 + UNIT-05 | US-006 AC-003 | `OperationDecision` | SQLite removal plus semantic cleanup contract | NFR-011, R-005 |
| Confirmation-gated CLI | UNIT-03 | US-005 AC-002 | Capability descriptor | Confirmation checked before opening a write-capable store | NFR-013 |
| Partial-cleanup outcome | UNIT-04 | US-006 AC-003 | Cleanup target results | Incomplete work is retryable and non-zero at the CLI | NFR-011, R-005 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Approved refinement | `durable-record` cleanup is satisfied by an append-only `memory_deleted` tombstone; Markdown is never modified or removed. | Approved in BOLT-11-Q1 |
| Approved limitation | Lifecycle-edge cleanup reports `not_applicable` because US-003 extraction and persistence do not exist. | Approved plan scope |
| Approved limitation | Semantic cleanup reports `not_applicable` while the extension is disabled; active partial cleanup remains retryable. | Approved plan scope |
| No deviation | No runtime structure or dependency was added. | Approved |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| Build | `npm run build` | Pass | TypeScript emitted successfully. |
| Typecheck | `npm run typecheck` | Pass | Strict no-emit check passed. |
| Regression tests | `npm test` | Pass | 112 tests passed, 0 failed. |
| Editor diagnostics | VS Code Problems scan | Pass | No errors found. |

## Follow-Ups

- Human review and approval of this report and `test_results_bolt11.md`.
- Undo/restore and lifecycle-edge persistence remain separate future slices.
- Run the ADR-006 technology-decision gate before BOLT-12.