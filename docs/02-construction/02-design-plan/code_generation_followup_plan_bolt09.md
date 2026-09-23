# AI-DLC Code Generation Follow-Up Plan - BOLT-09 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27

## Purpose

Make workspace memory survive process exit. BOLT-08 and BOLT-08b can read and classify a real workspace, but nothing is written anywhere: the SQLite projection defaults to `:memory:` and no JSONL event log exists on disk.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-09 code-generation reports, or BOLT-09 test-results reports until this plan is explicitly approved by the human reviewer.

This is the first slice in the project that writes to the filesystem.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-08a and BOLT-08b review outputs are approved; further code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-09 / UNIT-02 Persist Event Log And Derived Index | `bolts_plan_addendum_v1_release.md` marks BOLT-09 as the next v1 bolt, and it blocks every surface bolt. |

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| User stories | Approved | `docs/01-inception/02-user-stories/all_user_stories.md` |
| NFRs | Approved | `docs/01-inception/03-nfrs/nfrs.md` |
| Risk register | Approved | `docs/01-inception/04-risks/risk_register.md` |
| Bolts plan addendum with Amendments 1 and 2 | Approved | `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` |
| V1 release plan | Approved | `docs/02-construction/02-design-plan/v1_release_plan.md` |
| UNIT-02 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md` |
| UNIT-02 Logical Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval_logical_design.md` |
| BOLT-08a review artifacts | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt08a.md`, `test_results_bolt08a.md` |
| BOLT-08b review artifacts | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt08b.md`, `test_results_bolt08b.md` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Index location | `LocalWorkspaceIndexProjection` is `constructor(databasePath = ":memory:")`. A path is accepted but nothing chooses, creates, or resolves one. | BOLT-09 resolves and creates a real database file. |
| Event log | `MEMORY_EVENT_TYPES` is `["memory_indexed", "memory_removed"]` and `MemoryEventRecord` is validated, but no code reads or writes JSONL. | BOLT-09 adds append-only JSONL read and write. |
| Rebuild input | `RebuildWorkspaceIndexInput` takes `sources: readonly DurableSourceObservation[]` and optional `events`. | BOLT-09 feeds it from a BOLT-08 scan rather than from caller-supplied arrays. |
| Scanner | `WorkspaceSourceReader.scan()` returns 95 observations and 66 rule-based exclusions for this repository, with zero unclassified. | BOLT-09 consumes `WorkspaceScanResult.observations` directly. |
| Filesystem writes | None anywhere in `src/`. A BOLT-08 test asserts the reader references no write API. | That assertion stays true; writes live in new modules, not in the reader. |
| Current tests | UNIT-01 through BOLT-08b tests pass, 73 total. | BOLT-09 adds the first tests that write to disk. |

## Implementation Authorization Requested By This Plan

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add workspace layout resolution | Resolve a workspace root and an `.agent-memory/` directory, with the index file and event log inside it. Create directories when missing. | Never write outside the resolved `.agent-memory/` directory. Never modify a durable source artifact. |
| Add append-only JSONL event log | Write one JSON object per line, read the log back, and validate each record through the approved `MemoryEventRecord` contract. | Append only. No rewrite, truncate, or in-place edit of existing lines. A malformed line is reported, not silently dropped. |
| Add file-backed index wiring | Open `LocalWorkspaceIndexProjection` at the resolved path and ensure the schema exists. | SQLite stays a derived index. Deleting it must remain safe. |
| Add a workspace memory store facade | Coordinate scan, event append, and projection upsert so a caller performs one `rebuild` or `sync` call. | Reuse the existing `WorkspaceIndexRebuilder`; do not fork rebuild logic. |
| Add rebuild from durable sources | Rebuild the index using a BOLT-08 scan plus the JSONL log, with no caller-supplied arrays. | Deleting the index file and rebuilding must reproduce the same projection, satisfying NFR-003. |
| Add stale-record removal | Remove projections whose source artifact no longer exists or no longer classifies, and record a `memory_removed` event. | US-002 AC-003. A removal must be visible in the rebuild changes and warnings. |
| Add `.agent-memory/` to `.gitignore` | Append the derived directory to the repository `.gitignore`. Authorized by the BOLT-09-Q2 answer. | Append only. Do not reorder or remove existing entries. |
| Add BOLT-09 tests | Cover layout resolution, append-only behaviour, malformed-line reporting, cross-process persistence, deterministic rebuild after index deletion, stale removal, and no writes outside `.agent-memory/`. | Keep tests traceable to US-002, US-004, NFR-003, NFR-005, NFR-019, and R-010. |
| Produce BOLT-09 Code Generation artifacts | Create `code_generation_report_bolt09.md` and `test_results_bolt09.md`. | Do not rewrite approved BOLT-01 through BOLT-08b artifacts. |

## Scope For BOLT-09

### In Scope

- Workspace root and `.agent-memory/` layout resolution, with directory creation.
- Append-only JSONL event log write and read, with per-line validation and malformed-line reporting.
- File-backed SQLite index at a resolved path, with schema initialization.
- A store facade that turns a BOLT-08 scan into persisted events and projections.
- Rebuild driven by real durable sources: Markdown artifacts via the scanner plus the JSONL log.
- Stale-record removal for artifacts that disappeared or stopped classifying, with `memory_removed` events.
- Divergence reporting between durable sources and the derived index, addressing R-010.
- Appending `.agent-memory/` to `.gitignore`, per the BOLT-09-Q2 answer.
- A rebuild that skipped a malformed line reports `completed_with_warnings`, never `completed`, per the Q3 reading.
- Tests, including a cross-process persistence test and a delete-then-rebuild determinism test.
- BOLT-09-specific Code Generation Report and Test Results artifacts.

### Out Of Scope

- CLI, MCP server, or local HTTP API. BOLT-10, BOLT-12, BOLT-13.
- Router wiring for `get_context` and `rebuild_index`. BOLT-10.
- Delete or export execution as a governed operation. BOLT-11.
- Performance measurement at NFR-009 scale and README rewrite. BOLT-14.
- File watching, incremental scanning, or caching.
- Concurrency control, file locking, or multi-process coordination beyond a single sequential run.
- Semantic index persistence; the BOLT-07 boundary stays disabled.
- Any `.gitignore` change beyond appending `.agent-memory/`.
- Any new runtime or dev dependency.

## Open Questions Resolved By The Reviewer

All five were answered on 2026-07-27. Each is now a binding constraint on execution.

| ID | Question | Decision | Selector / Date |
|----|----------|----------|-----------------|
| BOLT-09-Q1 | Where does `.agent-memory/` live? | Directly under the workspace root, as `<workspaceRoot>/.agent-memory/`. | User / 2026-07-27 |
| BOLT-09-Q2 | Should `.gitignore` be modified in this slice? | Yes. `.agent-memory/` is added to `.gitignore`. | User / 2026-07-27 |
| BOLT-09-Q3 | What happens to a malformed JSONL line during read? | Report it as a rebuild warning, skip the line, and continue. Do not throw. | User / 2026-07-27 |
| BOLT-09-Q4 | Is the event log the source of truth, or the Markdown artifacts? | Markdown artifacts are authoritative for content; the event log is authoritative for history, including deliberate removals. | User / 2026-07-27 |
| BOLT-09-Q5 | Should rebuild rewrite the event log? | No. Rebuild reads the log and appends new events only. | User / 2026-07-27 |

### Reading Of The Q3 Answer

The refined recommendation offered alongside Q3 was to skip and warn **and** report the rebuild as `completed_with_warnings` rather than `completed`, reusing the existing `RebuildRunStatus` value. The reviewer's answer restates the skip-and-warn behaviour and does not contradict the status propagation, so execution will include it: a rebuild that skipped a malformed line must never report a clean `completed`.

If the reviewer intended a plain `completed` status with warnings attached, this plan must be corrected before execution.

### Consequence Of Q4 And Q5 Recorded For BOLT-11

Q4 and Q5 together mean a lost `memory_removed` event cannot be reconstructed from the filesystem. The resurrection path is narrow, because a governed delete also removes the durable artifact, but BOLT-04 permits partial cleanup. Partial cleanup plus a lost removal event would let deleted memory return on rebuild. This is recorded here so the BOLT-11 plan addresses it rather than discovering it at BOLT-14. See NFR-011 and R-005.

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Workspace layout resolution | UNIT-02 / BOLT-09 | US-004 AC-001 | Local storage layout | NFR-005, NFR-019 |
| Append-only JSONL event log | UNIT-02 / BOLT-09 | US-002, US-004 | MemoryEventRecord, append-only events | NFR-003, NFR-004, R-010 |
| File-backed derived index | UNIT-02 / BOLT-09 | US-004 AC-001 | LocalIndexProjectionRepository | NFR-003, NFR-005 |
| Store facade over scan and rebuild | UNIT-02 / BOLT-09 | US-002, US-004 | WorkspaceIndexRebuilder, RebuildRun | NFR-003, NFR-016 |
| Rebuild from real durable sources | UNIT-02 / BOLT-09 | US-004 AC-003 | RebuildRun, RebuildOutcome | NFR-003, R-010 |
| Stale-record removal | UNIT-02 / BOLT-09 | US-002 AC-003 | RebuildChange, memory_removed event | NFR-003, R-010 |
| Divergence reporting | UNIT-02 / BOLT-09 | US-004 | RebuildWarning | R-010 |
| BOLT-09 tests | UNIT-02 / BOLT-09 | US-002, US-004 | UNIT-02 validation checklist | NFR-003, NFR-005, NFR-019, R-010 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-09 Code Generation follow-up plan.
- [x] Record the reviewer's answers to BOLT-09-Q1 through BOLT-09-Q5. (All five answered on 2026-07-27.)
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add workspace layout resolution with `.agent-memory/` creation.
- [x] Add append-only JSONL event log write and read with per-line validation.
- [x] Add file-backed index wiring and schema initialization.
- [x] Add the store facade over scan, event append, and projection upsert.
- [x] Implement rebuild from real durable sources.
- [x] Implement stale-record removal with `memory_removed` events.
- [x] Implement divergence reporting between sources and the index.
- [x] Append `.agent-memory/` to `.gitignore`.
- [x] Add tests, including cross-process persistence and delete-then-rebuild determinism.
- [x] Confirm the BOLT-08 no-write assertion still passes for the reader.
- [x] Confirm the BOLT-06 and BOLT-07 domain import boundary tests still pass.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt09.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt09.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (No test failed. One design hazard was found by reading `applyMemoryEvent` before implementing and was designed out; see the report.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-09 behavior. |
| Layout tests | BOLT-09 test suite | Verify `.agent-memory/` is created under the workspace root and nothing is written outside it. |
| Append-only tests | BOLT-09 test suite | Verify a second run appends without rewriting earlier lines, and that byte offsets of existing lines are unchanged. |
| Malformed-line tests | BOLT-09 test suite | Verify a corrupt line is reported as a warning and the remaining log still loads. |
| Persistence tests | BOLT-09 test suite | Verify a projection written by one process is readable by a second, satisfying the core v1 requirement. |
| Determinism tests | BOLT-09 test suite | Verify deleting the index file and rebuilding reproduces the same projection, satisfying NFR-003 and US-004 AC-003. |
| Stale-removal tests | BOLT-09 test suite | Verify a deleted or newly non-classifying artifact is removed from the projection and recorded as `memory_removed`. |
| Local-only tests | BOLT-09 test suite | Verify no network access and no managed service is required, satisfying NFR-005 and NFR-019. |
| Boundary tests | BOLT-06, BOLT-07, BOLT-08 suites | Verify the reader still performs no writes, the domain import boundary holds, and no dependency was added. |

## Approval Gate

- Approved by user on 2026-07-27, after all five open questions were resolved. Execution of the BOLT-09 / UNIT-02 scope described here is authorized.
- Approval authorizes only the BOLT-09 / UNIT-02 implementation described here.
- Appending `.agent-memory/` to `.gitignore` is authorized by the BOLT-09-Q2 answer. No other `.gitignore` change is.
- CLI, MCP server, local HTTP API, delete or export execution, new dependency, or any deviation from this plan requires a new approval or approved follow-up plan.

## Why This Slice Matters

Every approved Must story currently fails for the same reason: memory does not outlive the process. After BOLT-09, a workspace has durable memory on disk that can be rebuilt from its Markdown sources, which is the precondition for the CLI in BOLT-10, the MCP server in BOLT-12, and the acceptance evidence in BOLT-14.

## Execution Notes

- 2026-07-27: Plan created after BOLT-08a and BOLT-08b review approval. No implementation, tests, dependency changes, runtime structure changes, BOLT-09 code-generation report, or BOLT-09 test-results report were created.
- 2026-07-27: Plan approved and executed. `src/storage/workspace-layout.ts`, `src/storage/memory-event-log.ts`, and `src/storage/workspace-memory-store.ts` added; `src/index.ts`, `package.json`, and `.gitignore` updated; `tests/workspace-memory-store.test.ts` added with 10 tests. No dependency was added. Final verification passed with `npm run build`, `npm run typecheck`, and `npm test` (83 tests, 0 failures). A smoke run against this repository persisted 101 projections with status `completed` and no warnings.
- 2026-07-27: All five open questions answered by the user. `.agent-memory/` sits under the workspace root, `.gitignore` gains the directory, a malformed JSONL line is skipped with a warning, Markdown holds content authority while the event log holds history authority, and rebuild never rewrites the log. The consequence of Q4 and Q5 for governed deletion was recorded for BOLT-11. Still no implementation or tests; execution awaits an explicit approval statement.
