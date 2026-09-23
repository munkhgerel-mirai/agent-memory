# Test Results - BOLT-09 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt09.md`

## Approval Status

Approved by user on 2026-07-27.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 83 tests passed, 0 failed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b, and 10 BOLT-09 tests. |
| Layout resolution | BOLT-09 tests | Pass | `.agent-memory/` resolves under the workspace root with `events.jsonl` and `index.sqlite` inside. The directory is created on demand; a missing workspace root and a blank root both throw `WorkspaceLayoutError`. |
| Write guard | BOLT-09 tests | Pass | `isInsideStateDirectory` accepts the event log path and rejects a durable source path, a parent-escape path, and the state directory itself. |
| Append-only behaviour | BOLT-09 tests | Pass | After a second append the file content still begins with the byte-identical result of the first append, and both events read back in order. An empty append is a no-op. |
| Malformed-line handling | BOLT-09 tests | Pass | A truncated JSON line, a bare JSON string, and a structurally valid but contract-invalid object are each skipped. Line numbers `[2, 3, 4]` are reported, three distinct warnings are produced, and the two valid events on either side still load. |
| Cross-process persistence | BOLT-09 tests | Pass | Projections written by the test process are read by a separately spawned Node process via `execFileSync`, which is the property v1 actually requires. |
| Rebuild determinism | BOLT-09 tests | Pass | Deleting `index.sqlite` and rebuilding produces an identical projection snapshot across memory ID, path, category, approval status, and observed version. The second rebuild reports 2 created, confirming it came from durable sources. |
| Stale removal | BOLT-09 tests | Pass | Deleting an artifact yields `removedCount` 1, one appended `memory_removed` event with the correct source path, and one remaining projection. A third rebuild neither resurrects the memory nor appends a duplicate event. |
| Restoration precedence | BOLT-09 tests | Pass | Restoring a removed artifact brings the memory back, reports `supersededEventCount` 1 and `replayedEventCount` 0, and leaves the superseded event in the log because the log is append-only. |
| Warning status propagation | BOLT-09 tests | Pass | A malformed log line makes the run report `completed_with_warnings` rather than `completed`, while both artifacts still index. |
| Write containment | BOLT-09 tests | Pass | A full before-and-after tree snapshot shows every added path under `.agent-memory/`, and no pre-existing file removed or modified. |
| Self-exclusion and gitignore | BOLT-09 tests | Pass | A second rebuild never indexes anything under `.agent-memory/`, the directory appears in `excludedPaths`, and `.gitignore` contains it. |
| Regression suite | BOLT-01 to BOLT-08b tests | Pass | The BOLT-08 assertion that the reader references no write API still holds; writes live only in the new modules. The BOLT-06 and BOLT-07 domain import boundary scans still pass. |

## Real-Workspace Smoke Run

Executed outside the test suite against this repository, then cleaned up.

| Metric | Value |
|--------|-------|
| Projections persisted | 101 |
| Rebuild status | `completed` |
| Created | 101 |
| Warnings | 0 |
| Index size | ~1.5 MB |
| Event log | Not created |
| Sample query | `startup context 2000 token` returned the BOLT-03 session log, the intent clarification, and the user stories |

The event log being absent is correct: a first rebuild of an intact workspace has no removal history to record.

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks. All 10 BOLT-09 tests passed on their first run. | N/A | N/A | No |

One design hazard was found by reading `applyMemoryEvent` before writing code, so it never became a test failure.

| Hazard | Detection | Resolution |
|--------|-----------|------------|
| Resurrection of deleted memory | `applyMemoryEvent` sets a projection for a `memory_indexed` event. Appending such an event per artifact per rebuild would have re-created deleted memory from the log after the file was gone. | The workspace sync never appends `memory_indexed`, and events whose source path is visible to the current scan are filtered out before replay. Covered by the removal and restoration tests. |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | US-004 AC-001 local indexing without network, and AC-003 rebuild after index deletion, are both demonstrated. US-002 AC-001 metadata recording and AC-003 stale-metadata removal on rebuild are demonstrated. | US-002 AC-002 full category coverage was demonstrated in BOLT-08a and is unchanged here. |
| Domain invariants | Append-only history, Markdown content authority, log history authority, and derived-index disposability are each pinned by a test. | No invariant test yet prevents a future caller from appending `memory_indexed` for a scanned artifact; the rule lives in `recordRemovals` and its comment. |
| Integration points | The store composes the BOLT-08 reader, the approved `WorkspaceIndexRebuilder`, and the approved `createMemoryEventRecord` factory. No new domain type was introduced. | The declared `DurableSourceReader` and `MemoryEventLogReader` ports remain unimplemented; see the report's deviations. |
| NFR / risk scenarios | NFR-003 rebuildability, NFR-004 append-only history, NFR-005 and NFR-019 local-only operation, and R-010 divergence reporting are all addressed with tests. | NFR-001 latency and NFR-009 scale are still unmeasured; the 101-projection smoke run is not a benchmark. Concurrency is untested and out of scope. |

## Follow-Ups

- BOLT-09 Test Results approved on 2026-07-27.
- Consider an invariant test asserting that no code path appends a `memory_indexed` event for a path the scanner can see, so the resurrection rule is machine-enforced rather than comment-enforced.
- Measure NFR-001 and NFR-009 at BOLT-14 using a generated workspace; the current timing is incidental.
- Decide the fate of the unimplemented UNIT-02 async ports.
- Event log compaction and multi-process locking are both unaddressed and should be scoped once the CLI and MCP server exist.
