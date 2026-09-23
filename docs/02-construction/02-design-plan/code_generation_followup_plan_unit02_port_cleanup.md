# AI-DLC Code Generation Follow-Up Plan - UNIT-02 Dead Async Port Cleanup

**Project:** Agent-memory  
**Date:** 2026-09-23  
**Skills:** `code-refactoring`, `ai-dlc-code-generation`  
**Approval Status:** Approved by the user on 2026-09-23 with UNIT02-PORT-Q1 Option A

## Purpose

Resolve the BOLT-09 follow-up concerning the unused `DurableSourceReader` and `MemoryEventLogReader` interfaces without changing workspace scan, event-log, rebuild, persistence, retrieval, or warning behavior.

This is a narrow post-preview boundary cleanup. No source edit, report, test-result artifact, dependency change, or historical-plan rewrite is authorized until the reviewer selects an option and explicitly approves this plan.

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Git | Clean `main`; preview baseline committed at `28dd9b2` and local `origin/main` tracking ref matched. | Capture a fresh baseline before implementation and preserve unrelated work. |
| Dead declarations | `DurableSourceReader` and `MemoryEventLogReader` are declared only in `src/domain/local-workspace-storage.ts`. | No in-repository implementation, consumer, mock, test, or adapter depends on either interface. |
| Actual source reader | `WorkspaceSourceReader` is synchronous and returns `WorkspaceScanResult`, including observations, skips, exclusions, and candidate counts. | The real contract is richer than `Promise<DurableSourceObservation[]>`. |
| Actual event reader | `MemoryEventLog.read()` is synchronous and returns events plus malformed-line warnings, line counts, and skipped line numbers. | `MemoryEventLogReader.readEvents()` cannot carry the approved warning semantics. |
| Composition | `WorkspaceMemoryStore` composes the concrete readers and exposes behavior through tested store/capability boundaries. | Removing unused type declarations does not change runtime composition. |
| Logical design | UNIT-02 retains a conceptual Durable Source Reader component and repository-port architecture. | Removing a dead TypeScript interface does not remove the component or prevent a future justified port. |
| Distribution | The preview is committed but not published as an npm package. | Public-type removal risk is limited but must still be explicit because `src/index.ts` wildcard exports domain types. |

## Decision Point - UNIT02-PORT-Q1

How should the unused async interfaces be resolved?

| Option | Trade-Off |
|--------|-----------|
| **A. Remove both dead declarations now (recommended)** | Smallest change; eliminates misleading contracts that no implementation can honestly satisfy; preserves all runtime behavior. A future alternate adapter can introduce a contract shaped by real consumers. |
| B. Replace them with synchronous warning-aware ports and make concrete classes implement them | Preserves named interfaces but adds abstraction and domain result types for one implementation/consumer pair; risks moving storage diagnostics into domain solely to justify a port. |
| C. Mark them deprecated for one preview cycle | Minimizes theoretical external breakage, but keeps known-dead contracts even though the package has not been published. |

**Recommendation:** Option A.

**Decision:** Option A selected and the plan approved by the user on 2026-09-23.

### Option A Consequences

- Remove exactly the two interface declarations and their three method signatures.
- Keep `WorkspaceSourceReader`, `MemoryEventLog`, `WorkspaceMemoryStore`, and every durable/event domain record unchanged.
- Do not rename or move modules.
- Do not rewrite the approved UNIT-02 Logical Design; record the implementation-level cleanup and the distinction between conceptual component and TypeScript port in the new report.
- Treat this as an intentional preview public-type removal, with High reversibility: the declarations can be restored if a real second adapter/consumer establishes a valid contract.

## Behavior To Preserve

- Workspace scanning rules, classification, skip reporting, and no-write guarantee.
- Malformed JSONL lines are skipped with warnings rather than hidden or thrown as fatal rebuild errors.
- Markdown content authority and JSONL history authority.
- File-backed SQLite persistence and deterministic rebuild.
- Delete tombstones, governed export/delete, CLI, and MCP behavior.
- NFR-003, NFR-004, NFR-005, NFR-010, NFR-019, and R-010 evidence.

## Scope

### In Scope

- Capture build, strict typecheck, focused storage tests, and full-regression baseline.
- Apply the selected decision only in `src/domain/local-workspace-storage.ts` unless compilation proves an actual consumer exists.
- Verify repository-wide absence of consumers before and after the edit.
- Run focused `local-workspace-storage`, `workspace-source-reader`, and `workspace-memory-store` suites.
- Run build, strict typecheck, full regression, and focused BOLT-14 readiness checks.
- Create `code_generation_report_unit02_port_cleanup.md` and `test_results_unit02_port_cleanup.md`.
- Update `PROJECT_STATUS.md` and write an execution session log.

### Out Of Scope

- Changing scan/event/rebuild behavior or making the pipeline asynchronous.
- Creating replacement abstractions, adapters, factories, or repositories unless Option B is explicitly selected.
- Implementing event-log compaction, lifecycle edges, local API, governed write, restore/undo, or server storage.
- New dependencies, runtime structure changes, deployment, tags, publication, or version changes.
- Editing the approved BOLT-09 report or Test Results; they remain historical evidence of why this follow-up exists.

## Traceability

| Planned Task | Design / NFR / Risk | Evidence |
|--------------|---------------------|----------|
| Remove misleading dead declarations | UNIT-02 repository-port discipline; NFR-010 | Repository-wide symbol search and strict typecheck |
| Preserve warning-aware event reading | BOLT-09 Q3; NFR-003, R-010 | `workspace-memory-store` malformed-line/rebuild tests |
| Preserve durable scanning | UNIT-02 Durable Source Reader component; NFR-003, NFR-005 | `workspace-source-reader` tests |
| Preserve runtime surfaces | UNIT-03 shared capability routing | Full regression and BOLT-14 readiness suite |

## Execution Checklist

- [x] Inspect declarations, concrete readers, consumers, tests, logical design, BOLT-09 deviation, Git status, and publication state.
- [x] Record reviewer selection for UNIT02-PORT-Q1. (Option A / User / 2026-09-23.)
- [x] Record explicit human approval of this plan. (User / 2026-09-23.)
- [x] Capture clean baseline verification before source edits. (Build/typecheck pass; focused UNIT-02 suites 25/25 pass.)
- [x] Apply only the selected port cleanup. (Removed exactly `DurableSourceReader` and `MemoryEventLogReader` declarations.)
- [x] Verify no unexpected consumer or public contract dependency appears. (Source/test search returned zero references; compatibility note recorded.)
- [x] Run focused and full verification. (Build/typecheck pass; focused 25/25; full 120/120; preview readiness 2/2.)
- [x] Create Code Generation Report and Test Results with an explicit compatibility note.
- [x] Update current status and write the execution session log.
- [x] Request separate human review of the report pair. (Requested in execution handoff; artifacts remain pending review.)

## Planned Verification

| Check | Purpose |
|-------|---------|
| Repository-wide `rg` for both interface names and method signatures | Prove the declarations have no implementation/consumer and are fully removed only if Option A is selected. |
| `npm run build` | Verify emitted declarations/source compile after the intentional type removal. |
| `npm run typecheck` | Prove no internal TypeScript consumer depends on the ports. |
| Focused storage/source/store suites | Preserve scanner, warnings, persistence, rebuild, and restart behavior. |
| `npm test` | Preserve the full committed preview baseline. |
| `npm run test:v1-readiness` | Preserve fresh CLI/MCP/export/delete behavior. |

## Approval Gate

- Execution requires explicit selection of UNIT02-PORT-Q1 and explicit plan approval.
- Approval of Option A authorizes only removal of the two dead interfaces plus tests/reports/status/logging listed above.
- Any replacement abstraction, behavior change, new dependency, async conversion, or additional cleanup requires a new approval.
- Failed product checks must be documented and stopped; test-harness-only corrections may not alter production behavior silently.

## Execution Notes

- 2026-09-23: Plan created after the user asked to begin the next task without release, tagging, or publication. No source, test, dependency, or historical evidence artifact was changed.
- 2026-09-23: User selected Option A and explicitly approved the plan. Removal of exactly the two dead interfaces plus the recorded verification/reporting work is authorized.
- 2026-09-23: Removed only the two dead declarations. Build/typecheck, focused UNIT-02 25/25, full regression 120/120, and preview readiness 2/2 pass; no source/test consumer exists. Report pair created for review.
- 2026-09-23: Final local rebuild completed with 215 candidates, 149 indexed, and zero warnings; current context reflects cleanup completion and uses 1965/2000 tokens.
- 2026-09-23: User approved both the Code Generation Report and Test Results. The cleanup evidence-review gate is complete.
