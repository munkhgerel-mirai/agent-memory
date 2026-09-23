# Session Log - BOLT-10 CLI Operator Surface

**Date:** 2026-07-27
**Duration:** BOLT-09 approval recording plus BOLT-10 approval and implementation session

## Skills Used

- 2026-07-27: `ai-dlc-code-generation` - recorded the BOLT-09 review approval and executed the approved BOLT-10 / UNIT-03 follow-up plan.

## Summary

- Recorded user approval of the BOLT-09 Code Generation Report and Test Results.
- Recorded user approval of the BOLT-10 plan with both open questions answered as recommended.
- Added `src/cli/run.ts` and `src/cli/main.ts`, the `agent-memory` bin entry, and an `engines.node >=22.5.0` declaration.
- Wired the Capability Router with `get_context` and `rebuild_index` handlers.
- Added `tests/cli.test.ts` with 13 tests, including invocation of the built entrypoint as a real binary.
- Created the BOLT-10 Code Generation Report and Test Results.
- Updated `PROJECT_STATUS.md`.

## Decisions Made

- Made `runCli(argv, options)` return `{ exitCode, stdout, stderr }` rather than writing to streams, so most tests need no subprocess. One test still exercises the real binary path.
- Checked for the index file with `resolveWorkspaceLayout` before opening the store, because `WorkspaceMemoryStore.open` calls `ensureWorkspaceLayout` and would have made every read command create `.agent-memory/`. This is what makes the Q1 answer actually hold, and it is asserted by a test.
- Generated help from `CLI_COMMAND_DESCRIPTORS` rather than restating the command list, so help cannot drift from the approved contract.
- Added a `projectionRepository` accessor to `WorkspaceMemoryStore` so the router shares one SQLite connection instead of opening a second to the same file.
- Mapped `accepted` to exit 3 rather than 0. Once `rebuild_index` has a real handler, `accepted` only occurs for capabilities that were validated but never ran.
- Kept `--version` out of scope, since the plan listed only `--workspace`, `--json`, and `--help`.

## Defect Found And Fixed

A test asserted that `inspect` with no identifier would exit 0 and it exited 3. Investigating showed the CLI was wrong, not the test's premise: `invokeBuiltInPort` returns `undefined` without a `memoryId`, so the router fell through to `not_implemented`, and an operator who simply forgot an argument was told the feature does not exist.

Fixed by adding `missingRequiredFields`, which derives required arguments from the approved BOLT-05 `inputFields` and returns a usage error with exit 2. `query` without search text had the same defect and is also fixed. Deriving from the descriptors rather than hardcoding means the CLI cannot drift from the capability contract.

## Finding That Changes The V1 Picture

The plan claimed this slice would demonstrate US-001 end to end. Running the finished CLI against this repository showed it does not, so the claim was corrected in the plan rather than left standing.

With 105 projections indexed, `agent-memory context` returns **one** artifact and omits 99. With a goal it returns three, all session logs. `PROJECT_STATUS.md`, which holds the goal, phase, blockers, and next steps that US-001 AC-001 requires, is in neither pack.

Two measured causes, both in BOLT-03:

- Whole documents are packed. `PROJECT_STATUS.md` is ~6459 tokens against a 2000-token budget; the top two ranked candidates are 3233 and 6359 tokens. The first artifact that fits consumes 84 percent of the budget.
- `PROJECT_STATUS.md` ranks 9th of 105, because it carries no `## Approval Status` section and is therefore `draft`, which BOLT-03 penalises by 10 while rewarding `approved` by 50.

Ranking changes alone cannot fix this, because even at rank 1 the file is over three times the budget. Section-level excerpting is the likely answer. This needs its own approved slice before BOLT-14, and ideally before BOLT-12 so agents do not inherit the same limitation through MCP.

## Verification

- `npm run typecheck` - Pass.
- `npm run build` - Pass.
- `npm test` - Pass: 96 tests, 0 failures (7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b, 10 BOLT-09, 13 BOLT-10).
- Real-workspace run: 171 candidates scanned, 105 indexed, 66 excluded, status `completed`. The state directory was deleted afterwards.

## Next Steps

1. Human reviews `docs/02-construction/04-code-generation/code_generation_report_bolt10.md` and `test_results_bolt10.md`.
2. Decide how to close the context-packing gap, which now blocks the primary v1 outcome.
3. Decide the fate of the unimplemented UNIT-02 async ports.
4. Create and approve the BOLT-11 follow-up plan for governed delete and export execution.
