# Test Results - BOLT-11 Governed Delete And Export

**Project:** Agent-memory
**Date:** 2026-08-26
**Related Code Generation Report:** `code_generation_report_bolt11.md`

## Approval Status

Approved by the user on 2026-08-26.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | No compile errors. |
| TypeScript typecheck | `npm run typecheck` | Pass | No type errors. |
| Full regression suite | `npm test` | Pass | 112 passed, 0 failed, 0 skipped. |
| BOLT-11 operation tests | `node dist/tests/governed-memory-operations.test.js` | Pass | 4 passed. |
| CLI integration tests | `node dist/tests/cli.test.js` | Pass | 15 passed. |
| Durable store tests | `node dist/tests/workspace-memory-store.test.js` | Pass | 11 passed. |
| Editor diagnostics | VS Code Problems scan | Pass | No errors found in the workspace. |

## Failed Checks

No final checks failed. During implementation, the export round-trip test exposed an undefined optional property and the first post-enable CLI run exposed two obsolete pre-BOLT-11 expectations. Both were corrected locally and the same focused checks passed before the full suite was rerun.

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| US-006 AC-004 export | Round-trip JSON assertion includes records, operation decision, export timestamp, and provenance; denied governance writes no file. | No alternate export format is in scope. |
| US-006 AC-003 delete | Projection removal, `memory_deleted` append, semantic cleanup invocation, and target-by-target outcomes are asserted. | Lifecycle edges are not implemented under US-003. |
| Rebuild safety | A visible, byte-identical Markdown source does not resurrect tombstoned memory after rebuild. | Supported undo/restore is out of scope. |
| Durable-source safety | Store and CLI tests compare source content before and after delete; export adds only its named output file. | Repository files remain independently readable by design. |
| Partial failure | Injected semantic cleanup failure returns `incomplete` with `retryable: true`; CLI maps incomplete delete payloads to non-zero status. | No concrete semantic index exists to integration-test. |
| Governance | Export denial performs no write; existing BOLT-04 and BOLT-05 governance suites remain green. | Approval-required injection is covered by the shared router contract rather than a second operation fixture. |
| CLI | Export succeeds with explicit output/reason/targets; delete refuses without `--confirm`, succeeds with it, preserves the file, and survives rebuild. | Interactive prompting is not implemented; confirmation is explicit flag evidence. |

## Follow-Ups

- Human review and approval of the BOLT-11 report pair.
- Keep the Node `node:sqlite` experimental warning on the existing release-risk list.