# AI-DLC Code Generation Follow-Up Plan - BOLT-10 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27, with both open questions answered as recommended

## Purpose

Make Agent-memory runnable. BOLT-09 gave the workspace durable memory on disk, but there is still no way to reach it: `package.json` declares no `bin`, and the approved Capability Router is not wired to the two services that already exist.

BOLT-10 adds the CLI operator surface and connects `get_context` and `rebuild_index` to real execution.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-10 code-generation reports, or BOLT-10 test-results reports until this plan is explicitly approved by the human reviewer.

## Precondition

Satisfied. The BOLT-09 Code Generation Report and Test Results were reviewed and approved by the user on 2026-07-27, so the persistence layer this surface exposes is confirmed.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-09 is implemented; further code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-10 / UNIT-03 CLI Operator Surface | `bolts_plan_addendum_v1_release.md` marks BOLT-10 as next. It is the cheapest surface, needs no dependency, and is required outright by NFR-013. |

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| User stories | Approved | `docs/01-inception/02-user-stories/all_user_stories.md` |
| NFRs | Approved | `docs/01-inception/03-nfrs/nfrs.md` |
| Risk register | Approved | `docs/01-inception/04-risks/risk_register.md` |
| Bolts plan addendum with Amendments 1 and 2 | Approved | `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` |
| V1 release plan | Approved | `docs/02-construction/02-design-plan/v1_release_plan.md` |
| UNIT-03 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md` |
| UNIT-03 Logical Design | Approved | `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter_logical_design.md` |
| BOLT-09 review artifacts | Pending review | `docs/02-construction/04-code-generation/code_generation_report_bolt09.md`, `test_results_bolt09.md` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Executable entrypoint | `package.json` has `main` and `types` but no `bin`. | BOLT-10 adds the `agent-memory` bin. |
| Engine constraint | No `engines` field, although `node:sqlite` requires Node 22.5 or newer. | BOLT-10 declares the constraint so an unsupported Node fails clearly rather than cryptically. |
| Command descriptors | `CLI_COMMAND_DESCRIPTORS` already names `agent-memory context`, `query`, `inspect`, `rebuild`, `export`, `delete`, `write`. | The CLI is generated from these descriptors rather than restating them. |
| Router wiring | `CapabilityRouter.invokeBuiltInPort` handles only `query_memory` and `inspect_memory`. `get_context` returns `not_implemented`; `rebuild_index` returns `accepted` with a queued job and no execution. | BOLT-10 supplies handlers for both, using services that already exist. |
| Available services | `StartupContextRetriever` and `WorkspaceMemoryStore` are both implemented and unreachable from any surface. | BOLT-10 connects them. |
| Governed capabilities | `export_memory` and `delete_memory` route through governance and return `accepted` with a queued job, but nothing executes. | The CLI must present this as not-yet-available, never as success. |
| Current tests | UNIT-01 through BOLT-09 tests pass, 83 total. | BOLT-10 adds CLI tests that invoke the built binary. |

## Implementation Authorization Requested By This Plan

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add the `agent-memory` bin entry | Add `bin` to `package.json` pointing at a compiled entrypoint with a shebang. | One binary only. No postinstall script. |
| Declare the Node engine constraint | Add `engines.node` reflecting the `node:sqlite` requirement. | Declaration only. No runtime version check beyond a clear error. |
| Add argument parsing | Parse commands and flags with `node:util` `parseArgs`. | No dependency. Unknown commands and unknown flags must fail with a usage message, never be ignored. |
| Add read commands | Implement `context`, `query`, and `inspect` against the persisted store. | Read-only. These must not trigger a write unless BOLT-10-Q1 is answered otherwise. |
| Add the `rebuild` command | Implement `rebuild` against `WorkspaceMemoryStore.rebuild`. | The only writing command in this slice. |
| Wire the Capability Router | Supply `get_context` and `rebuild_index` handlers so both stop returning `not_implemented` and `accepted`. | Reuse `StartupContextRetriever` and `WorkspaceMemoryStore`; do not fork their logic. |
| Present unavailable commands honestly | `export`, `delete`, and `write` appear in `--help` but refuse to run, with a non-zero exit code and a message naming the bolt that will deliver them. | They must never print a success message or exit zero. |
| Add workspace root resolution | Add `--workspace <path>` defaulting to the current working directory. | Resolution belongs to the CLI, since BOLT-09 deliberately left it to the caller. |
| Add output formatting | Human-readable default output plus `--json` on every command. | `--json` must emit a single valid JSON document on stdout with nothing else interleaved. |
| Add exit codes | Map `CapabilityResponseStatus` onto documented exit codes. | Success is zero. Every non-success status gets a distinct non-zero code. |
| Add BOLT-10 tests | Cover parsing, each command, exit codes, `--json` validity, unavailable-command refusal, router wiring, and end-to-end use of a real temporary workspace. | Keep tests traceable to US-001, US-004, US-005 AC-002, NFR-002, NFR-013, and NFR-020. |
| Produce BOLT-10 Code Generation artifacts | Create `code_generation_report_bolt10.md` and `test_results_bolt10.md`. | Do not rewrite approved BOLT-01 through BOLT-09 artifacts. |

## Planned Command Surface

| Command | Backing service | Status in this slice |
|---------|-----------------|----------------------|
| `agent-memory rebuild` | `WorkspaceMemoryStore.rebuild` | Executes |
| `agent-memory context` | `StartupContextRetriever` through the router | Executes |
| `agent-memory query` | Projection search through the router | Executes |
| `agent-memory inspect` | Projection lookup through the router | Executes |
| `agent-memory export` | Governance decision only | Refuses, exits non-zero, names BOLT-11 |
| `agent-memory delete` | Governance decision only | Refuses, exits non-zero, names BOLT-11 |
| `agent-memory write` | Governance decision only | Refuses, exits non-zero, names a later bolt |

### Planned Exit Codes

| Exit | Meaning | Triggering `CapabilityResponseStatus` |
|------|---------|----------------------------------------|
| 0 | Success | `completed` |
| 1 | Unexpected error | Thrown exception |
| 2 | Usage error | Unknown command or flag, `validation_error` |
| 3 | Not available yet | `accepted`, `not_implemented` |
| 4 | Denied by governance | `denied` |
| 5 | Approval required | `approval_required` |

Exit 3 is the important one. Once `rebuild_index` has a real handler, `accepted` no longer means "queued and will happen"; it means the request was validated and nothing ran. A CLI that exited zero there would tell an operator their export succeeded when no file was written.

## Open Questions Resolved By The Reviewer

Both were answered as recommended on 2026-07-27 and are now binding constraints on execution.

| ID | Question | Decision | Selector / Date |
|----|----------|----------|-----------------|
| BOLT-10-Q1 | When a read command runs against a missing or empty index, should the CLI rebuild automatically? | No. Report that memory is not built yet, tell the operator to run `agent-memory rebuild`, and exit non-zero. `--rebuild` is available as an explicit opt-in on read commands. | User / 2026-07-27 |
| BOLT-10-Q2 | Should `export`, `delete`, and `write` appear in `--help` while they refuse to run? | Yes, listed with an explicit "not available yet" marker and the bolt that will deliver them. | User / 2026-07-27 |

### Consequence Of The Q1 Answer

Keeping read commands genuinely write-free requires the CLI to check for the index file **before** opening the store, because `WorkspaceMemoryStore.open` calls `ensureWorkspaceLayout`, which creates `.agent-memory/`. `resolveWorkspaceLayout` performs no filesystem write and is the correct entry point for that check.

Everything else in this plan is a recorded position rather than an open question, including the exit-code table. Approval of this plan approves those positions.

## Scope For BOLT-10

### In Scope

- `bin` entry, compiled entrypoint with shebang, and an `engines.node` declaration.
- `node:util` `parseArgs` command and flag parsing with strict unknown handling.
- `context`, `query`, `inspect`, and `rebuild` commands executing against the persisted store.
- Capability Router handlers for `get_context` and `rebuild_index`.
- `export`, `delete`, and `write` presented but refusing, with a non-zero exit code.
- `--workspace`, `--json`, and `--help`.
- Documented exit codes.
- Tests, including invocation of the built binary against a real temporary workspace.
- BOLT-10-specific Code Generation Report and Test Results.

### Out Of Scope

- MCP server and local HTTP API. BOLT-12 and BOLT-13.
- Delete and export execution. BOLT-11.
- Governed write execution. A later bolt.
- Concurrency control and file locking. See the note below.
- Interactive prompts, colour output, progress bars, or a config file.
- Shell completions, man pages, and npm publication.
- Performance measurement and README rewrite. BOLT-14.
- Any new runtime or dev dependency.

## Concurrency Note

`PROJECT_STATUS.md` records that two processes rebuilding at once would race with no locking. BOLT-10 does not create that race, because the CLI is a single sequential process, but it does make it reachable: an operator can now run `agent-memory rebuild` while another tool holds the same workspace. This slice does not address it. It should be scoped before BOLT-12, when a long-lived MCP server makes concurrent access ordinary rather than accidental.

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Bin entry and engine declaration | UNIT-03 / BOLT-10 | US-005 AC-002 | CLI Surface | NFR-005, NFR-013, NFR-019 |
| Argument parsing | UNIT-03 / BOLT-10 | US-005 AC-002 | CLI Surface | NFR-013 |
| `context` command | UNIT-03 / BOLT-10 | US-001 AC-001, AC-002, AC-003 | StartupContextRetriever, ContextPack | NFR-001, NFR-002, NFR-006, NFR-020 |
| `query` and `inspect` commands | UNIT-03 / BOLT-10 | US-004 AC-001, AC-002 | LocalIndexProjectionRepository | NFR-013 |
| `rebuild` command | UNIT-03 / BOLT-10 | US-004 AC-003 | WorkspaceMemoryStore, RebuildRun | NFR-003, R-010 |
| Router handler wiring | UNIT-03 / BOLT-10 | US-005 | CapabilityRoutingService | NFR-013, NFR-015 |
| Honest refusal for unexecuted capabilities | UNIT-03 / BOLT-10 | US-005, US-006 | CapabilityResponse status | NFR-011, R-005 |
| Exit codes and `--json` | UNIT-03 / BOLT-10 | US-005 AC-002 | CLI Surface | NFR-013 |
| BOLT-10 tests | UNIT-03 / BOLT-10 | US-001, US-004, US-005 | UNIT-03 validation checklist | NFR-002, NFR-013, NFR-020 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-10 Code Generation follow-up plan.
- [x] Record the reviewer's answers to BOLT-10-Q1 and BOLT-10-Q2. (Both answered as recommended.)
- [x] Confirm the BOLT-09 review artifacts are approved before starting.
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add the CLI entrypoint, `bin` entry, and `engines.node` declaration.
- [x] Add `parseArgs` command and flag parsing with strict unknown handling.
- [x] Add Capability Router handlers for `get_context` and `rebuild_index`.
- [x] Implement `rebuild`, `context`, `query`, and `inspect`.
- [x] Implement honest refusal for `export`, `delete`, and `write`.
- [x] Implement `--workspace`, `--json`, `--help`, and the exit-code mapping.
- [x] Add tests, including invocation of the built binary against a temporary workspace.
- [x] Confirm the BOLT-06, BOLT-07, and BOLT-08 boundary tests still pass.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt10.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt10.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (One test failure exposed a real defect: a missing required argument surfaced as `not_implemented` rather than a usage error. Fixed within the planned CLI surface by deriving required arguments from the approved input fields.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-10 behavior. |
| Parsing tests | BOLT-10 test suite | Verify unknown commands and unknown flags exit 2 with usage output rather than being ignored. |
| End-to-end command tests | BOLT-10 test suite | Verify `rebuild` then `context`, `query`, and `inspect` against a real temporary workspace, invoking the built entrypoint. |
| Token budget test | BOLT-10 test suite | Verify `context` output stays within the 2000-token startup budget, satisfying NFR-002 and NFR-020. |
| Refusal tests | BOLT-10 test suite | Verify `export`, `delete`, and `write` exit non-zero, print no success wording, and name the bolt that will deliver them. |
| Exit-code tests | BOLT-10 test suite | Verify every documented status-to-exit-code mapping. |
| JSON output tests | BOLT-10 test suite | Verify `--json` emits a single parseable JSON document per command with nothing else on stdout. |
| Read-only tests | BOLT-10 test suite | Verify `context`, `query`, and `inspect` write nothing, subject to the BOLT-10-Q1 answer. |
| Router wiring tests | BOLT-10 test suite | Verify `get_context` and `rebuild_index` no longer return `not_implemented` or an unexecuted `accepted`. |
| Boundary tests | BOLT-06, BOLT-07, BOLT-08 suites | Verify the domain import boundary holds, the reader still performs no writes, and no dependency was added. |

## Approval Gate

- Execution is blocked until the human explicitly approves this plan and answers BOLT-10-Q1 and BOLT-10-Q2.
- Execution additionally awaits approval of the BOLT-09 review artifacts.
- Approval authorizes only the BOLT-10 / UNIT-03 implementation described here.
- MCP server, local HTTP API, delete or export execution, concurrency control, new dependency, or any deviation from this plan requires a new approval or approved follow-up plan.

## Why This Slice Matters

After BOLT-10 the package stops being a library nobody can run. An operator will be able to clone the repository, run `agent-memory rebuild`, and then `agent-memory context` to see the current goal, phase, active plan, approved decisions, blockers, and next steps within the 2000-token budget. That is US-001 demonstrated end to end for the first time, by a human at a terminal. BOLT-12 then makes the same thing reachable by an agent.

**Outcome correction, 2026-07-27.** The first half held: the package is runnable and the commands work. The US-001 claim did not. Running the finished CLI against this repository returns a pack containing one artifact and omitting 99, without the goal, phase, blockers, or next steps. `PROJECT_STATUS.md` is ~6459 tokens against a 2000-token budget, and `buildContextPack` includes whole documents. This is a BOLT-03 design gap that BOLT-10 surfaced rather than caused. It needs its own approved slice before BOLT-14, and ideally before BOLT-12. See `code_generation_report_bolt10.md`.

## Execution Notes

- 2026-07-27: Plan created after BOLT-09 implementation. No implementation, tests, dependency changes, runtime structure changes, BOLT-10 code-generation report, or BOLT-10 test-results report were created.
- 2026-07-27: Plan approved with both questions answered as recommended, and executed. `src/cli/run.ts` and `src/cli/main.ts` added; `package.json`, `src/index.ts`, and `src/storage/workspace-memory-store.ts` updated; `tests/cli.test.ts` added with 13 tests. No dependency was added. Final verification passed with `npm run build`, `npm run typecheck`, and `npm test` (96 tests, 0 failures). A real-workspace run exposed that US-001 is not yet satisfiable at the current token budget; the finding is recorded in the report and in the corrected outcome section above.
