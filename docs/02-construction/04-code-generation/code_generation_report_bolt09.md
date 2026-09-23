# Code Generation Report - BOLT-09 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27

## Approval Status

Approved by user on 2026-07-27. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt09.md` (approved by user on 2026-07-27, with all five open questions resolved).

## Summary

- Implemented BOLT-09 / UNIT-02 Persist Event Log And Derived Index. **Workspace memory now survives process exit**, which every Must user story depended on.
- Added `src/storage/workspace-layout.ts`: resolves `<workspaceRoot>/.agent-memory/` with `events.jsonl` and `index.sqlite` inside it, creates the directory, and exposes `isInsideStateDirectory` and `assertInsideStateDirectory` as write guards.
- Added `src/storage/memory-event-log.ts`: append-only JSONL write and read, validating every line through the approved `createMemoryEventRecord` factory and reporting a malformed line as a warning instead of throwing.
- Added `src/storage/workspace-memory-store.ts`: a facade that scans, replays applicable events, rebuilds the projection, and appends removal events.
- Wired `LocalWorkspaceIndexProjection` to the resolved file path instead of leaving it at its `:memory:` default.
- Appended `.agent-memory/` to `.gitignore`, per the BOLT-09-Q2 answer.
- Added `tests/workspace-memory-store.test.ts` with 10 tests, including a genuine second-process read and a delete-then-rebuild determinism test.
- Added no dependency and no new domain type. Every contract used already existed in UNIT-02.

## Approved Inputs

- **Units:** UNIT-02
- **Bolts:** BOLT-09
- **User Stories:** US-002 AC-001, AC-003, US-004 AC-001, AC-003
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`
- **NFRs:** NFR-003, NFR-004, NFR-005, NFR-016, NFR-019
- **Risks:** R-010
- **Technology Decisions:** ADR-001, ADR-003

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `.gitignore` | Updated | BOLT-09-Q2 | Appended `.agent-memory/`. Existing entries untouched. |
| `package.json` | Updated | verification | Updated `npm test` to run the new BOLT-09 compiled test file. |
| `src/index.ts` | Updated | UNIT-02 | Exported the layout, event log, and store modules. |
| `src/storage/workspace-layout.ts` | Added | UNIT-02 / US-004 AC-001 | Layout resolution, state-directory creation, and write guards. |
| `src/storage/memory-event-log.ts` | Added | UNIT-02 / US-002 | Append-only JSONL log with per-line validation and warning reporting. |
| `src/storage/workspace-memory-store.ts` | Added | UNIT-02 / US-004 AC-003 | Store facade: scan, event replay, rebuild, removal recording. |
| `tests/workspace-memory-store.test.ts` | Added | UNIT-02 / BOLT-09 | 10 tests covering layout, append-only behaviour, malformed lines, cross-process persistence, determinism, removal, restoration, warnings, write containment, and gitignore. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt09.md` | Updated | AI-DLC gate | Recorded approval, the five answers, execution progress, and verification. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt09.md` | Added | AI-DLC gate | This report. |
| `docs/02-construction/04-code-generation/test_results_bolt09.md` | Added | AI-DLC gate | BOLT-09 verification evidence. |

## Design Hazard Found Before Implementation

Reading `applyMemoryEvent` before writing any code revealed that a `memory_indexed` event **sets** a projection record. The obvious implementation, appending a `memory_indexed` event for every artifact on every rebuild, would therefore have planted a resurrection bomb in the log: once a file was deleted from disk, the stale event would rebuild its projection anyway, with `sourceKind: "memory_event"`. That directly contradicts the BOLT-09-Q4 decision that Markdown holds content authority.

Two rules were designed in response, and both are enforced in `WorkspaceMemoryStore.rebuild`:

| Rule | Implementation | Effect |
|------|----------------|--------|
| The scan wins for any path it can see | Events whose `sourcePath` appears in the current scan are filtered out before replay, and counted as `supersededEventCount` | A stale removal cannot suppress a restored file, and a stale index event cannot override live content |
| The workspace sync never writes `memory_indexed` | `recordRemovals` appends `memory_removed` only | The log records only what the filesystem cannot express. `memory_indexed` stays available for future non-file memory such as governed writes |

Together these make the log authoritative for history and the filesystem authoritative for content, which is exactly what Q4 and Q5 asked for.

## Verification Against This Repository

A smoke run outside the test suite, cleaned up afterwards.

| Metric | Value |
|--------|-------|
| Projections persisted | 101 |
| Rebuild status | `completed` |
| Created / warnings | 101 / 0 |
| Index file size | ~1.5 MB at `.agent-memory/index.sqlite` |
| Event log | Not created, because nothing was removed |

The absent event log is the design working: a first rebuild of an intact workspace has no history to record that the filesystem does not already express.

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Workspace layout resolution | UNIT-02 / BOLT-09 | US-004 AC-001 | Local storage layout | Derived state sits beside the workspace | NFR-005, NFR-019 |
| Write containment guards | UNIT-02 / BOLT-09 | US-004 | Local storage layout | Persistence never touches a durable source | NFR-004 |
| Append-only JSONL event log | UNIT-02 / BOLT-09 | US-002 | MemoryEventRecord | History is append-only and never rewritten | NFR-003, NFR-004, R-010 |
| Malformed-line tolerance | UNIT-02 / BOLT-09 | US-004 | RebuildWarning | One corrupt line cannot block a workspace | NFR-005 |
| File-backed derived index | UNIT-02 / BOLT-09 | US-004 AC-001 | LocalIndexProjectionRepository | SQLite is a derived, disposable cache | NFR-003, NFR-005 |
| Store facade | UNIT-02 / BOLT-09 | US-002, US-004 | WorkspaceIndexRebuilder, RebuildRun | One call turns a workspace into durable memory | NFR-003, NFR-016 |
| Scan-wins event filtering | UNIT-02 / BOLT-09 | US-002 AC-003 | MemoryEventRecord replay | Markdown holds content authority | NFR-003, R-010 |
| Removal recording | UNIT-02 / BOLT-09 | US-002 AC-003 | RebuildChange, memory_removed | The log holds history authority | NFR-011, R-005, R-010 |
| Rebuild from durable sources | UNIT-02 / BOLT-09 | US-004 AC-003 | RebuildRun, RebuildOutcome | Deleting the index is safe | NFR-003, R-010 |
| BOLT-09 tests | UNIT-02 / BOLT-09 | US-002, US-004 | UNIT-02 validation checklist | Cross-process evidence | NFR-003, NFR-005, NFR-019, R-010 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | The workspace ID defaults to the basename of the workspace root, and the actor defaults to `agent-memory`. Both are overridable. | Within the plan's store-facade scope |
| Assumption | Scan skips that are not `excluded_by_rule` are surfaced as rebuild warnings, so a discovery problem reaches the rebuild result rather than only the scan result. | Within the plan's divergence-reporting scope |
| Assumption | The state directory itself is not a valid write target; only paths strictly inside it are. This makes the guard reject an accidental write to `.agent-memory` as a file. | Within the plan's write-containment guardrail |
| Deviation | No status-propagation code was needed for the Q3 reading. `summarizeRebuildOutcome` already downgrades any run with warnings to `completed_with_warnings`; the store only has to pass event-log warnings into `completeRebuildRun`. | Simpler than planned; same outcome. |
| Deviation | The declared UNIT-02 ports `DurableSourceReader` and `MemoryEventLogReader` were **not** implemented. Both are `Promise`-based, while the codebase is synchronous throughout, including `DatabaseSync`. More importantly `MemoryEventLogReader.readEvents` returns only records, with no channel for the malformed-line warnings that the approved Q3 answer requires. Implementing it as declared would have hidden the warnings. | Recorded for review; see Follow-Ups. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning during tests inherited from BOLT-02. | Accepted by prior BOLT guardrails; final verification passes. |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | `tsc -p tsconfig.json` completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | `tsc -p tsconfig.json --noEmit` completed successfully. |
| Full tests | `npm test` | Pass | 83 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b, and 10 BOLT-09 tests. |
| Layout tests | BOLT-09 test suite | Pass | Paths resolve under the workspace root, the state directory is created, the workspace root must already exist, and the write guard rejects a durable source path, a parent-escape path, and the directory itself. |
| Append-only tests | BOLT-09 test suite | Pass | After a second append the file still starts with the byte-identical first write. |
| Malformed-line tests | BOLT-09 test suite | Pass | Truncated JSON, a bare JSON string, and a contract-invalid object are each skipped with a distinct warning while the surrounding valid events still load. |
| Cross-process test | BOLT-09 test suite | Pass | A projection written by the test process is read by a separately spawned Node process. |
| Determinism test | BOLT-09 test suite | Pass | Deleting `index.sqlite` and rebuilding reproduces an identical projection snapshot. |
| Removal test | BOLT-09 test suite | Pass | A deleted artifact produces one `removed` change and one appended `memory_removed` event; a further rebuild neither resurrects it nor duplicates the event. |
| Restoration test | BOLT-09 test suite | Pass | Restoring the file brings the memory back, the stale removal is counted as superseded, and the log still retains it. |
| Warning-status test | BOLT-09 test suite | Pass | A malformed log line yields `completed_with_warnings` while the rebuild still indexes every artifact. |
| Write-containment test | BOLT-09 test suite | Pass | A full before-and-after tree snapshot shows every added path under `.agent-memory/` and no durable source modified or deleted. |
| Self-exclusion test | BOLT-09 test suite | Pass | The state directory is never indexed as a durable source and appears in `excludedPaths`; `.gitignore` contains it. |
| Regression suite | BOLT-01 through BOLT-08b suites | Pass | The BOLT-08 no-write assertion for the reader still holds, and the BOLT-06 and BOLT-07 domain import boundary scans still pass. |

## Follow-Ups

- BOLT-09 Code Generation Report and Test Results approved on 2026-07-27; no BOLT-09 review artifacts remain pending.
- Decide what to do about the unimplemented `DurableSourceReader` and `MemoryEventLogReader` ports. Either widen `MemoryEventLogReader` to carry warnings and implement both as adapters, or remove them as dead declarations. Leaving contract shapes that the implementation deliberately ignores is worse than either.
- BOLT-11 must address the narrow resurrection path recorded in the BOLT-09 plan: partial governed cleanup that leaves the artifact on disk while a removal event is lost.
- Concurrency is out of scope. Once the CLI and MCP server exist, two processes could rebuild at once with no locking. A later plan should decide whether that needs handling before v1.
- The event log has no compaction. Long-lived workspaces with heavy churn will grow it without bound. Not a v1 problem at the measured scale, but worth revisiting.
