# Code Generation Report - BOLT-10 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-07-27

## Approval Status

Approved by user on 2026-07-27. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt10.md` (approved by user on 2026-07-27, with both open questions answered as recommended).

## Summary

- Implemented BOLT-10 / UNIT-03 CLI Operator Surface. **Agent-memory is now runnable**: `agent-memory rebuild`, `context`, `query`, and `inspect` work against a real workspace.
- Added `src/cli/run.ts`, a testable `runCli(argv, options)` returning `{ exitCode, stdout, stderr }`, and `src/cli/main.ts`, a shebang entrypoint that writes the result and sets the exit code.
- Added the `bin` entry `agent-memory` and an `engines.node` constraint of `>=22.5.0`, which `node:sqlite` already required but the package never declared.
- Wired the Capability Router with `get_context` and `rebuild_index` handlers. Both previously returned `not_implemented` and an unexecuted `accepted`.
- Implemented the Q1 answer: read commands never build. The index file is checked with `resolveWorkspaceLayout` **before** the store is opened, because opening it would create `.agent-memory/` and make a read command a writer. `--rebuild` is the explicit opt-in.
- Implemented the Q2 answer: `export`, `delete`, and `write` appear in `--help` with a "not available yet" marker, and exit 3 with `Nothing was changed.` rather than any success wording.
- Generated the help text from `CLI_COMMAND_DESCRIPTORS` so it cannot drift from the approved contract.
- Added required-argument validation derived from the approved `inputFields`, after a test showed a missing argument was surfacing as `not_implemented`.
- Added `tests/cli.test.ts` with 13 tests, including invocation of the built entrypoint as a real binary.
- Added no dependency.

## Finding That Changes The V1 Picture

**US-001 is not yet satisfied on a realistic workspace, and BOLT-10 is not the cause.**

The plan's closing section claimed this slice would demonstrate US-001 end to end. Running the finished CLI against this repository shows that it does not. This is reported here rather than deferred to BOLT-14 acceptance.

Measured against this repository, 105 projections indexed:

| Invocation | Items in pack | Tokens | Omitted |
|-----------|---------------|--------|---------|
| `agent-memory context` | 1 | 1677 / 2000 | 99 |
| `agent-memory context --goal "BOLT-10 CLI"` | 3 | 1914 / 2000 | 97 |

`PROJECT_STATUS.md`, which holds the current goal, phase, blockers, and next steps that [US-001 AC-001](docs/01-inception/02-user-stories/all_user_stories.md#L24) explicitly requires, appears in neither pack.

Two measured causes, both in BOLT-03 rather than BOLT-10:

| Cause | Evidence |
|-------|----------|
| Whole documents are packed, and AI-DLC artifacts are far larger than the budget | `PROJECT_STATUS.md` is ~6459 tokens against a 2000-token budget. The top two ranked candidates are 3233 and 6359 tokens. `buildContextPack` skips anything that does not fit, so the first artifact that *does* fit consumes 84 percent of the budget and nearly nothing else follows. |
| The most important artifact ranks 9th of 105 | It is classified `SessionHandoffMemory` with approval `draft`, because it carries no `## Approval Status` section. BOLT-03 adds +50 for `approved` and subtracts 10 for `draft`, a 60-point swing against the one file US-001 most needs. |

Even at rank 1 it could not be included, because it is over three times the entire budget. So ranking alone will not fix this; the pack needs section-level excerpting rather than whole-document inclusion.

This is a design gap in the approved BOLT-03 slice, not a defect in this one. The CLI faithfully renders what the retriever produces. It needs its own approved slice before BOLT-14 can claim US-001, and it should be scoped before BOLT-12, because the MCP server will expose the same limitation to agents.

## Approved Inputs

- **Units:** UNIT-03
- **Bolts:** BOLT-10
- **User Stories:** US-001, US-004, US-005 AC-002
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md`
- **NFRs:** NFR-002, NFR-005, NFR-013, NFR-019, NFR-020
- **Risks:** R-010
- **Technology Decisions:** ADR-001, ADR-003

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `package.json` | Updated | UNIT-03 / US-005 AC-002 | Added the `agent-memory` bin, `engines.node >=22.5.0`, and the BOLT-10 test file. |
| `src/index.ts` | Updated | UNIT-03 | Exported the CLI run module. |
| `src/cli/run.ts` | Added | UNIT-03 / US-005 AC-002 | Argument parsing, command dispatch, router wiring, rendering, exit codes, and descriptor-generated help. |
| `src/cli/main.ts` | Added | UNIT-03 | Shebang entrypoint. |
| `src/storage/workspace-memory-store.ts` | Updated | UNIT-02 | Added a `projectionRepository` accessor so the router can share the store's connection instead of opening a second one. |
| `tests/cli.test.ts` | Added | UNIT-03 / BOLT-10 | 13 tests. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt10.md` | Updated | AI-DLC gate | Recorded approval, both answers, and execution progress. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt10.md` | Added | AI-DLC gate | This report. |
| `docs/02-construction/04-code-generation/test_results_bolt10.md` | Added | AI-DLC gate | BOLT-10 verification evidence. |

## Delivered Command Surface

| Command | Status | Exit |
|---------|--------|------|
| `agent-memory rebuild` | Executes through `rebuild_index` | 0 |
| `agent-memory context` | Executes through `get_context` | 0 |
| `agent-memory query <text>` | Executes through `query_memory` | 0 |
| `agent-memory inspect <memoryId>` | Executes through `inspect_memory` | 0 |
| `agent-memory export` | Refuses, names BOLT-11 | 3 |
| `agent-memory delete` | Refuses, names BOLT-11 | 3 |
| `agent-memory write` | Refuses | 3 |

Flags: `--workspace`, `--rebuild`, `--json`, `--goal`, `--phase`, `--query`, `--category`, `--limit`, `--memory-id`, `-h/--help`.

Exit codes: 0 success, 1 unexpected, 2 usage, 3 not available yet, 4 denied, 5 approval required.

## Defect Found And Fixed During Development

| Defect | Symptom | Cause | Fix |
|--------|---------|-------|-----|
| A missing required argument reported as unsupported | `agent-memory inspect` with no identifier exited 3 rather than 2 | `invokeBuiltInPort` returns `undefined` when `memoryId` is absent, so the router fell through to `not_implemented`. An operator who forgot an argument was told the feature does not exist. | Added `missingRequiredFields`, which derives required arguments from the approved `inputFields` and returns a usage error. `query` with no search text had the same problem and now also exits 2. |

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Bin entry and engine declaration | UNIT-03 / BOLT-10 | US-005 AC-002 | CLI Surface | The package is runnable | NFR-005, NFR-013, NFR-019 |
| Argument parsing | UNIT-03 / BOLT-10 | US-005 AC-002 | CLI Surface | Unknown input fails loudly | NFR-013 |
| Descriptor-generated help | UNIT-03 / BOLT-10 | US-005 AC-002 | CliCommandDescriptor | Help cannot drift from the contract | NFR-013, NFR-015 |
| Required-argument validation | UNIT-03 / BOLT-10 | US-005 AC-002 | CapabilityPayloadField | Usage errors are distinguishable from unsupported features | NFR-013 |
| Router handler wiring | UNIT-03 / BOLT-10 | US-001, US-005 | CapabilityRoutingService | Two existing services become reachable | NFR-013, NFR-015 |
| Read commands never build | UNIT-03 / BOLT-10 | US-004 | WorkspaceLayout | Reads stay write-free | NFR-003 |
| Honest refusal | UNIT-03 / BOLT-10 | US-005, US-006 | CapabilityResponse status | An unexecuted capability never exits zero | NFR-011, R-005 |
| BOLT-10 tests | UNIT-03 / BOLT-10 | US-001, US-004, US-005 | UNIT-03 validation checklist | Binary-level evidence | NFR-002, NFR-013, NFR-020 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | `runCli` returns a result rather than writing to streams, so most tests need no subprocess. One test still invokes the built entrypoint to prove the binary path. | Within the plan's test scope |
| Assumption | The workspace ID passed to the router is the literal `workspace`, because the router only uses it for envelope metadata in this slice. | Within scope |
| Deviation | Added a `projectionRepository` accessor to `WorkspaceMemoryStore`, which is BOLT-09 code. Necessary so the router shares one SQLite connection rather than opening a second to the same file. | Small and required by the plan's "reuse `WorkspaceMemoryStore`" instruction; recorded for review. |
| Deviation | Added `missingRequiredFields` beyond the planned parsing scope, after a test exposed the usage-versus-unsupported confusion. | Correctness fix inside the planned CLI surface; recorded for review. |
| Deviation | No `--version` flag. The plan listed `--workspace`, `--json`, and `--help` only, and scope discipline was kept. | Noted as a gap for a later slice. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning. It now reaches CLI users on stderr, not only test output. | Recorded; worth suppressing before any release. |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | Completed successfully. |
| Full tests | `npm test` | Pass | 96 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b, 10 BOLT-09, and 13 BOLT-10 tests. |
| Help generation | BOLT-10 test suite | Pass | All seven commands listed; the three unavailable ones carry the marker. |
| Usage errors | BOLT-10 test suite | Pass | Unknown command and unknown flag both exit 2 with usage output. |
| Refusal | BOLT-10 test suite | Pass | `export`, `delete`, and `write` exit 3, print nothing to stdout, say `Nothing was changed`, and contain no success wording. |
| Q1 behaviour | BOLT-10 test suite | Pass | Read commands on an unbuilt workspace exit 3, name `agent-memory rebuild`, and do not create `.agent-memory/`. |
| End-to-end commands | BOLT-10 test suite | Pass | `rebuild` then `context`, `query`, and `inspect` all succeed against a temporary workspace. |
| Token budget | BOLT-10 test suite | Pass | The pack stays within 2000 tokens. |
| JSON output | BOLT-10 test suite | Pass | Every command emits one parseable document with a clean stderr. |
| Exit-code mapping | BOLT-10 test suite | Pass | All six statuses map as documented, asserted directly against `exitCodeForStatus`. |
| Required arguments | BOLT-10 test suite | Pass | `inspect` and `query` without arguments exit 2, derived from the approved input fields. |
| Router wiring | BOLT-10 test suite | Pass | An unwired router still returns `not_implemented` and `accepted`; the CLI returns `completed` for both. |
| Binary invocation | BOLT-10 test suite | Pass | The built entrypoint runs as a real process and propagates exit 3 for a refused command. |
| Regression suite | BOLT-01 through BOLT-09 | Pass | Boundary and no-write assertions still hold. |

## Follow-Ups

- BOLT-10 Code Generation Report and Test Results approved on 2026-07-27; no BOLT-10 review artifacts remain pending.
- The context-packing gap this report identified was closed by BOLT-10a, which packs sections instead of whole documents. Section-level excerpting was indeed the answer, and it required heading-level ranking as well.
- The `draft` penalty question was resolved in BOLT-10a: the penalty no longer applies to `SessionHandoffMemory`, and `PROJECT_STATUS.md` keeps its honest `draft` status.
- Suppress the `node:sqlite` experimental warning before release; CLI users should not see it.
- Add `--version` in a later slice.
- Concurrency remains unhandled and becomes ordinary at BOLT-12.
