# Session Log - BOLT-09 Durable Workspace Memory

**Date:** 2026-07-27
**Duration:** BOLT-09 approval and implementation session

## Skills Used

- 2026-07-27: `ai-dlc-code-generation` - executed the approved BOLT-09 / UNIT-02 follow-up plan.

## Summary

- Recorded user approval of `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt09.md` after all five open questions were answered.
- Read `WorkspaceIndexRebuilder.rebuild`, `applyMemoryEvent`, `projectDurableSource`, `summarizeProjectionChanges`, `summarizeRebuildOutcome`, and `createMemoryEventRecord` before writing any code.
- Added `src/storage/workspace-layout.ts`, `src/storage/memory-event-log.ts`, and `src/storage/workspace-memory-store.ts`.
- Wired `LocalWorkspaceIndexProjection` to a resolved file path instead of its `:memory:` default.
- Appended `.agent-memory/` to `.gitignore`.
- Added `tests/workspace-memory-store.test.ts` with 10 tests.
- Created the BOLT-09 Code Generation Report and Test Results.
- Updated `PROJECT_STATUS.md`.

## The Decision That Shaped The Slice

Reading `applyMemoryEvent` before implementing revealed that a `memory_indexed` event **sets** a projection record. The obvious implementation, appending one such event per artifact per rebuild, would have planted a resurrection bomb: once a file was deleted from disk, the stale event would rebuild its projection anyway with `sourceKind: "memory_event"`. That contradicts the BOLT-09-Q4 answer that Markdown holds content authority.

Two rules were designed in response:

- The workspace sync appends `memory_removed` events only. `memory_indexed` stays in the contract for future non-file memory such as governed writes, but nothing in this slice writes one.
- Before replay, events whose `sourcePath` the current scan can see are filtered out and counted as `supersededEventCount`. A stale removal therefore cannot suppress a restored file, and no event can override live content.

Together these make the filesystem authoritative for content and the log authoritative for history, which is precisely what Q4 and Q5 asked for. Both rules are pinned by the removal and restoration tests.

## Other Decisions

- Kept every write inside `.agent-memory/` and enforced it with `assertInsideStateDirectory` rather than trusting construction, then proved it with a before-and-after tree snapshot rather than an assertion about intent.
- Passed event-log warnings into `completeRebuildRun` instead of writing new status logic. `summarizeRebuildOutcome` already downgrades any run with warnings to `completed_with_warnings`, so the Q3 reading needed no new code.
- Surfaced non-rule scan skips as rebuild warnings, so a discovery problem reaches the rebuild result rather than only the scan result.
- Used a genuinely spawned Node process for the persistence test rather than closing and reopening in-process, because the property v1 needs is cross-process durability.
- Did not implement the declared `DurableSourceReader` and `MemoryEventLogReader` ports. Both are `Promise`-based against a synchronous codebase, and `MemoryEventLogReader.readEvents` returns only records with no channel for the malformed-line warnings the approved Q3 answer requires. Implementing it as declared would have hidden them. Raised as a follow-up rather than silently ignored.

## Verification

- `npm run typecheck` - Pass.
- `npm run build` - Pass.
- `npm test` - Pass: 83 tests, 0 failures (7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b, 10 BOLT-09).
- All 10 BOLT-09 tests passed on their first run. No test failure occurred during the slice; the one hazard was caught by reading the code first.
- Smoke run against this repository: 101 projections persisted, status `completed`, 0 warnings, ~1.5 MB index, no event log created because nothing had been removed. The state directory was deleted afterwards.

## Next Steps

1. Human reviews `docs/02-construction/04-code-generation/code_generation_report_bolt09.md` and `test_results_bolt09.md`.
2. Decide the fate of the unimplemented UNIT-02 async ports.
3. Create and approve the BOLT-10 follow-up plan for the CLI operator surface.
4. Scope concurrency handling before BOLT-12, since the CLI and MCP server make simultaneous rebuilds reachable.
