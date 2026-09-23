# AI-DLC Code Generation Follow-Up Plan - BOLT-11 / UNIT-04

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user for execution on 2026-08-26

## Purpose

Turn the approved delete and export decisions into real, verifiable effects. BOLT-04 evaluates governance and returns a decision; nothing executes. The CLI presents `export` and `delete` and refuses them with exit 3.

BOLT-11 makes both work, and settles a question BOLT-09 deliberately left open: what a governed deletion means when the durable Markdown artifact still exists.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-11 code-generation reports, or BOLT-11 test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-10 and BOLT-10a review outputs are approved; further code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-11 / UNIT-04 Governed Delete And Export Execution | `bolts_plan_addendum_v1_release.md` marks BOLT-11 next, and its dependencies BOLT-09 and BOLT-10 are complete. |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Governance decisions | `evaluateMemoryOperation` returns `allowed`, `denied`, or `approval_required`, with `requiredCleanupTargets` of `durable-record`, `local-index`, `lifecycle-edges`, and `future-vector-index` for a delete. | BOLT-11 executes against those targets, but see BOLT-11-Q1 about the first one. |
| CLI | `export`, `delete`, and `write` exit 3 with `Nothing was changed.` | BOLT-11 enables `export` and `delete`. `write` stays refused. |
| Event log | `MEMORY_EVENT_TYPES` is `["memory_indexed", "memory_removed"]`. `memory_removed` is appended when an artifact disappears from the scan. | A governed deletion is a different act from an artifact disappearing, and BOLT-11-Q1 turns on that distinction. |
| Rebuild authority | BOLT-09 filters out any event whose source path the current scan can still see, so Markdown wins on content. | A governed deletion must survive rebuild, which requires an exception to that rule. |
| Semantic cleanup | `cleanupSemanticEntries` exists from BOLT-07 and is unwired. It returns `not_applicable` while the extension is disabled. | BOLT-11 wires it, so the contract stops being dead code. |
| Lifecycle edges | `EDGE_TYPE_NAMES` and `LifecycleEdge` exist from BOLT-01, but no edge is ever extracted or persisted. | The `lifecycle-edges` cleanup target is currently vacuous. BOLT-11 should say so rather than pretend to clean it. |
| Current tests | UNIT-01 through BOLT-10a pass, 106 total. | BOLT-11 adds destructive-operation tests. |

## The Central Question

US-006 AC-003 states the requirement precisely:

> Given a user deletes memory, when deletion completes, then the memory is removed from **active retrieval indexes, lifecycle edges, and optional vector indexes when present**.

It does **not** say the durable Markdown artifact is deleted. BOLT-04's `requiredCleanupTargets` includes `durable-record`, which goes beyond the acceptance criterion, and deleting an approved lifecycle artifact would sit badly with NFR-004's requirement that approved artifacts remain stable records.

But BOLT-09 established that rebuild ignores a removal event whenever the scan still sees the path. So if the file stays and only the index is purged, the next `agent-memory rebuild` brings the memory straight back.

Something has to give. BOLT-11-Q1 is that decision.

## Open Questions Resolved By The Reviewer

All three were answered on 2026-07-27 by adopting the recommendations. Each is now a binding constraint on execution.

| ID | Question | Decision | Selector / Date |
|----|----------|----------|-----------------|
| BOLT-11-Q1 | Does a governed delete remove the durable Markdown artifact, or record a tombstone that overrides the scan for that path? | **Tombstone.** A third event type, `memory_deleted`, which rebuild honours even when the scan still sees the file. The artifact stays on disk. | User / 2026-07-27 |
| BOLT-11-Q2 | What format should `agent-memory export` produce? | A single JSON document carrying the exported records, their provenance, the governance decision, and an export timestamp, written to a caller-named path. | User / 2026-07-27 |
| BOLT-11-Q3 | Should export and delete ship as one slice, or two? | **One slice, export first.** The checklist is ordered so the non-destructive half lands before the destructive one and the reviewer can stop between them. | User / 2026-07-27 |

### Why Q1 Went This Way

This is the decision that shapes the slice, so the reasoning is recorded rather than left in the conversation.

- It is what US-006 AC-003 actually asks for. The criterion names the active retrieval indexes, lifecycle edges, and vector indexes. It does not name the durable artifact.
- It avoids deleting an approved lifecycle record, which NFR-004 requires to remain stable.
- It refines the BOLT-09 rule rather than breaking it. The BOLT-09-Q4 answer already made the event log authoritative for history "including deliberate removals". BOLT-09's scan-wins filter was written for a file that *disappeared*, which is incidental. A governed deletion is deliberate, and the log is where deliberate acts belong.
- It closes the resurrection path BOLT-09 recorded, because a tombstone does not depend on the artifact being absent.

The cost is a third event type, a small UNIT-02 addition, and the fact that a deleted memory's source text remains readable on disk. That second point is a real consequence: **this is deletion from memory, not deletion from the repository.** Anyone expecting `agent-memory delete` to remove a file will be surprised, so the CLI must say so plainly.

### Consequences Recorded For Execution

| Decision | What it forces |
|----------|----------------|
| Q1 tombstone | A `memory_deleted` event type; rebuild must honour it regardless of scan presence; the CLI must state that the source file is untouched. |
| Q2 JSON | The export document is verifiable in a test, so a round-trip assertion is expected rather than optional. |
| Q3 export first | The checklist order is binding, not advisory. Delete may not be implemented before export is working. |

## Scope For BOLT-11

### In Scope

- Governed export execution: resolve target memories, apply the BOLT-04 decision, and write a portable document including provenance.
- Governed delete execution across the derived stores: SQLite projection, event log tombstone, and the BOLT-07 semantic cleanup contract.
- A `memory_deleted` event type and rebuild handling that honours it regardless of scan presence, per the BOLT-11-Q1 answer.
- Partial-cleanup reporting: an operation that cannot complete every target reports `incomplete` and is retryable, never a silent success.
- CLI `export` and `delete` enabled, with confirmation semantics for the destructive one.
- Wiring `cleanupSemanticEntries` so the BOLT-07 contract stops being dead code.
- An explicit statement that `lifecycle-edges` cleanup is vacuous until US-003 is implemented, rather than a no-op that looks like success.
- Tests, including a rebuild-after-delete test proving the memory does not return.
- BOLT-11 Code Generation Report and Test Results.

### Out Of Scope

- Governed write execution. `agent-memory write` stays refused.
- Implementing lifecycle edges under US-003.
- Deleting or modifying any Markdown artifact, subject to the BOLT-11-Q1 answer.
- Undo or restore. A tombstone can be reversed by editing the event log by hand; a supported undo needs its own slice.
- MCP server and local HTTP API.
- Concurrency control.
- Any new runtime or dev dependency.

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Export execution with provenance | UNIT-04 / BOLT-11 | US-006 AC-004 | MemoryOperationRequest, ProvenanceStamp | NFR-011, NFR-012 |
| Delete execution across derived stores | UNIT-04 / BOLT-11 | US-006 AC-003 | OperationDecision, requiredCleanupTargets | NFR-011, R-005 |
| `memory_deleted` tombstone | UNIT-02 + UNIT-04 / BOLT-11 | US-006 AC-003 | MemoryEventRecord | NFR-003, NFR-011, R-005 |
| Rebuild honours the tombstone | UNIT-02 / BOLT-11 | US-006 AC-003 | WorkspaceIndexRebuilder | NFR-003, R-005, R-010 |
| Partial-cleanup reporting | UNIT-04 / BOLT-11 | US-006 AC-003 | RebuildWarning, OperationDecision | NFR-011, R-005 |
| Semantic cleanup wiring | UNIT-04 + UNIT-05 / BOLT-11 | US-006 AC-003 | cleanupSemanticEntries | NFR-011, R-005 |
| CLI enablement and confirmation | UNIT-03 / BOLT-11 | US-005 AC-002, US-006 | CLI Surface | NFR-013 |
| BOLT-11 tests | UNIT-04 / BOLT-11 | US-006 | UNIT-04 validation checklist | NFR-011, R-005 |

## Execution Checklist

Ordered so the non-destructive half lands first and the reviewer can stop after it.

- [x] Record explicit human approval of this BOLT-11 Code Generation follow-up plan. (Approved by user on 2026-08-26.)
- [x] Record the reviewer's answers to BOLT-11-Q1, BOLT-11-Q2, and BOLT-11-Q3. (All three answered on 2026-07-27 by adopting the recommendations.)
- [x] Reinspect the current TypeScript package/source/test baseline. (Completed on 2026-08-26; 106-test BOLT-10a baseline, TypeScript 5.9 / Node 22.5+, no new dependency required.)
- [x] Implement export execution with provenance and a portable JSON document.
- [x] Enable `agent-memory export` and verify it writes only where the caller asked.
- [x] Add a round-trip assertion on the export document, since Q2 chose a machine-readable format.
- [x] Add the `memory_deleted` event type, per the BOLT-11-Q1 answer.
- [x] Make the CLI state plainly that a delete removes memory, not the source file.
- [x] Make rebuild honour a deletion tombstone regardless of scan presence.
- [x] Implement delete execution across projection, event log, and semantic cleanup.
- [x] Implement partial-cleanup reporting with a retryable outcome.
- [x] Record that `lifecycle-edges` cleanup is vacuous until US-003 lands.
- [x] Enable `agent-memory delete` with confirmation semantics.
- [x] Add tests, including rebuild-after-delete and a partial-failure case.
- [x] Verify no Markdown artifact is modified or removed by either operation.
- [x] Run available verification checks: build, typecheck, tests. (112 tests passed; build and typecheck clean on 2026-08-26.)
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt11.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt11.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (No non-trivial fix or design deviation was required; local implementation defects were repaired within the approved slice and reverified.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-11 behavior. |
| Export tests | BOLT-11 test suite | Verify the document contains the targeted memories and their provenance, and that a denied decision writes nothing. |
| Delete tests | BOLT-11 test suite | Verify the memory leaves the projection and a tombstone is appended. |
| **Rebuild-after-delete test** | BOLT-11 test suite | Verify a deleted memory does not return after `rebuild`, even though its Markdown artifact is still on disk. This is the test that proves the tombstone works. |
| Durable-source safety test | BOLT-11 test suite | Verify neither operation modifies or removes any Markdown artifact, via a before-and-after tree snapshot. |
| Partial-failure test | BOLT-11 test suite | Verify an operation that cannot complete every target reports `incomplete` and retryable rather than success. |
| Governance tests | BOLT-11 test suite | Verify a denied or approval-required decision performs no effect at all. |
| Semantic cleanup test | BOLT-11 test suite | Verify the BOLT-07 contract is invoked and reports `not_applicable` while the extension is disabled. |
| CLI tests | BOLT-11 test suite | Verify `export` and `delete` now exit 0 on success, and that `delete` refuses without confirmation. |
| Regression suite | BOLT-01 through BOLT-10a | Verify no existing behaviour changed and no dependency was added. |

## Approval Gate

- All three open questions are resolved, so nothing in the plan is undecided. Execution still awaits an explicit approval statement.
- Approval authorizes only the BOLT-11 / UNIT-04 implementation described here.
- **Deleting or modifying any Markdown artifact is not authorized.** The Q1 answer settled this: a governed delete records a tombstone and leaves the file on disk. A durable-source safety test enforces it.
- Governed write execution, lifecycle edges, MCP server, local HTTP API, concurrency control, or any new dependency requires a new approval.

## Why This Slice Carries More Risk Than Its Predecessors

Every slice so far has been additive. BOLT-11 is the first that removes something a user might want back. Three guards are planned: a durable-source safety test that proves no Markdown is touched, a partial-cleanup outcome that refuses to report success it cannot prove, and confirmation semantics on the CLI. Undo is deliberately out of scope, which makes those three the only protection, and that is worth the reviewer's attention before approval.

## Execution Notes

- 2026-07-27: Plan created after BOLT-10 and BOLT-10a review approval. No implementation, tests, dependency changes, runtime structure changes, BOLT-11 code-generation report, or BOLT-11 test-results report were created.
- 2026-07-27: All three open questions answered by the user, adopting the recommendations. A governed delete records a `memory_deleted` tombstone and leaves the Markdown artifact untouched; export emits a single JSON document; export is implemented before delete. The reasoning for Q1 and the consequences of all three were written into the plan. Still no implementation or tests; execution awaits an explicit approval statement.
- 2026-08-26: User explicitly approved this plan for execution. The TypeScript package, source, tests, current dirty worktree, and 106-test BOLT-10a baseline were reinspected before implementation.
- 2026-08-26: Export implemented first as required. Focused export tests pass for JSON round-trip provenance and denied no-effect behaviour; the CLI suite passes with an assertion that only the caller-named output path is added.
- 2026-08-26: Delete implemented with `memory_deleted` tombstones, SQLite projection cleanup, wired semantic cleanup, explicit vacuous lifecycle-edge reporting, retryable partial outcomes, and CLI confirmation. Focused tests prove rebuild cannot resurrect deleted memory and Markdown remains byte-identical.
- 2026-08-26: Final verification passed: build, strict typecheck, 112 tests, and editor diagnostics. Code Generation Report, Test Results, project status, and session log were completed; report review remains the next human gate.
- 2026-08-26: User reviewed and approved both the BOLT-11 Code Generation Report and Test Results. The review gate is recorded in `bolt11_review_approval_plan.md`; BOLT-11 is closed.
