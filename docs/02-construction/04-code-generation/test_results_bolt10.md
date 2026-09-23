# Test Results - BOLT-10 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-07-27
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt10.md`

## Approval Status

Approved by user on 2026-07-27.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 96 tests passed, 0 failed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b, 10 BOLT-09, and 13 BOLT-10 tests. |
| Help generation | BOLT-10 tests | Pass | Help lists all seven approved commands, generated from `CLI_COMMAND_DESCRIPTORS`. Each of `export`, `delete`, and `write` carries a "not available yet" marker, and the exit-code legend is present. |
| Usage errors | BOLT-10 tests | Pass | `agent-memory exprot` exits 2 naming the unknown command and printing usage. An unknown flag exits 2 with empty stdout. |
| Refusal honesty | BOLT-10 tests | Pass | All three unavailable commands exit 3, print nothing to stdout, state `Nothing was changed`, contain no success wording, and `export` names BOLT-11. |
| Q1 read behaviour | BOLT-10 tests | Pass | `context`, `query`, and `inspect` on an unbuilt workspace each exit 3 and tell the operator to run `agent-memory rebuild`. `.agent-memory/` is asserted absent afterwards, so a read command does not become a writer. |
| End-to-end commands | BOLT-10 tests | Pass | `rebuild` reports `indexed 2` and `status: completed`; `context` renders the pack and the artifact body; `query` finds the NFR artifact; `inspect` shows category `NfrMemory` and approval `approved`. |
| Token budget | BOLT-10 tests | Pass | The context pack reports a 2000-token maximum and stays within it, satisfying NFR-002 and NFR-020. |
| JSON output | BOLT-10 tests | Pass | `rebuild`, `context`, `query`, and `export` each emit one parseable JSON document with matching `command` and `exitCode` fields and an empty stderr. |
| Explicit rebuild | BOLT-10 tests | Pass | `context --rebuild` builds memory then renders the pack, and creates `.agent-memory/`. |
| Read write-containment | BOLT-10 tests | Pass | A before-and-after tree snapshot around `context` and `query` shows nothing deleted and nothing added outside the state directory. |
| Exit-code mapping | BOLT-10 tests | Pass | Asserted directly against `exitCodeForStatus` for all six statuses, including that `accepted` and `not_implemented` both map to 3 rather than 0. |
| Required arguments | BOLT-10 tests | Pass | `missingRequiredFields` returns `["memoryId"]` for `inspect` and `["query"]` for `query`, and empty for `context` and `rebuild`. Both commands exit 2 when the argument is absent. A non-numeric `--limit` exits 1 with a clear message. |
| Router wiring | BOLT-10 tests | Pass | A router built without handlers still returns `not_implemented` for `get_context` and `accepted` for `rebuild_index`. Through the CLI both return `completed`. |
| Binary invocation | BOLT-10 tests | Pass | The built entrypoint runs as a separate process for `rebuild` and `context`, and propagates exit code 3 to the shell for a refused command. |
| Regression suite | BOLT-01 to BOLT-09 tests | Pass | All prior suites pass, including the BOLT-08 reader no-write assertion and the BOLT-06 and BOLT-07 domain import boundary scans. |

## Real-Workspace Observation

Run against this repository outside the test suite, then cleaned up. 171 candidates scanned, 105 indexed, 66 excluded, status `completed`.

| Invocation | Items | Tokens | Omitted |
|-----------|-------|--------|---------|
| `agent-memory context` | 1 | 1677 / 2000 | 99 |
| `agent-memory context --goal "BOLT-10 CLI"` | 3 | 1914 / 2000 | 97 |

`PROJECT_STATUS.md` appears in neither pack. Diagnosis recorded in the Code Generation Report: it is ~6459 tokens against a 2000-token budget and ranks 9th of 105, and the top two candidates are 3233 and 6359 tokens. The CLI renders what BOLT-03 produces; the limitation is whole-document packing.

This does not affect any BOLT-10 test result. It is recorded because it means **US-001 is not yet demonstrable on a realistic workspace**, which the BOLT-10 plan had claimed it would be.

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

One defect was found by a test during development and fixed within scope.

| Defect | Symptom | Cause | Fix |
|--------|---------|-------|-----|
| Missing argument reported as unsupported | `inspect` with no identifier exited 3 instead of 2 | `invokeBuiltInPort` returns `undefined` without a `memoryId`, so the router fell through to `not_implemented`. An operator who forgot an argument was told the feature does not exist. | `missingRequiredFields` derives required arguments from the approved `inputFields` and returns a usage error. `query` had the same problem and is also fixed. |

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | US-005 AC-002 is demonstrated: an operator can inspect, query, and rebuild from the CLI, and sees export and delete listed as not yet available. US-004 AC-001 and AC-003 are exercised end to end. | **US-001 AC-001 is not met on a realistic workspace.** The mechanism works and the budget is respected, but the pack does not contain the goal, phase, active plan, blockers, and next steps. See the observation above. |
| Domain invariants | Read commands are proven write-free. Unexecuted capabilities are proven never to exit zero. Help and required arguments are both derived from the approved descriptors, so neither can drift. | No test yet prevents a future command from being added without a descriptor. |
| Integration points | The CLI composes `WorkspaceMemoryStore`, `StartupContextRetriever`, and the approved `CapabilityRouter`. No capability was added and no domain type changed. | `export`, `delete`, and `write` remain unreachable by design until BOLT-11. |
| NFR / risk scenarios | NFR-002 and NFR-020 token bounds, NFR-013 operator commands, and NFR-005 and NFR-019 local-only operation are all covered. | NFR-001 latency remains unmeasured. Concurrency is untested and out of scope. |

## Follow-Ups

- BOLT-10 Test Results approved on 2026-07-27.
- The context-packing gap was closed by BOLT-10a before BOLT-12, so agents will not inherit the limitation through MCP.
- Add a test asserting every CLI command has a matching approved descriptor, so a future command cannot bypass the contract.
- Measure NFR-001 latency at BOLT-14 using the CLI, which is now the natural harness for it.
- Suppress the `node:sqlite` experimental warning before release; it currently reaches CLI users on stderr.
