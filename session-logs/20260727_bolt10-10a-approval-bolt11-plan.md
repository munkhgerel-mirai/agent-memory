# Session Log - BOLT-10 And BOLT-10a Approval, BOLT-11 Plan

**Date:** 2026-07-27
**Duration:** Review approval recording and BOLT-11 planning session

## Skills Used

- 2026-07-27: `ai-dlc-code-generation` - recorded the BOLT-10 and BOLT-10a review approvals and created the BOLT-11 follow-up plan.

## Summary

- Recorded user approval of the BOLT-10 and BOLT-10a Code Generation Reports and Test Results.
- Annotated the BOLT-10 follow-ups that BOLT-10a resolved, rather than deleting them, so the arc stays readable.
- Created `docs/02-construction/02-design-plan/bolt10_bolt10a_review_approval_plan.md`.
- Inspected `EDGE_TYPE_NAMES`, `evaluateMemoryOperation`, and the BOLT-09 rebuild filter before scoping BOLT-11.
- Created `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt11.md`.
- Updated `PROJECT_STATUS.md`.

## The Question BOLT-11 Has To Settle

Scoping BOLT-11 surfaced a conflict between three approved things.

- **US-006 AC-003** requires deleted memory to leave the "active retrieval indexes, lifecycle edges, and optional vector indexes". It does not mention the durable Markdown artifact.
- **BOLT-04** nevertheless lists `durable-record` among `requiredCleanupTargets`, which goes beyond the acceptance criterion. Deleting an approved lifecycle artifact would also sit badly with **NFR-004**, which requires approved artifacts to remain stable records.
- **BOLT-09** makes rebuild ignore any removal event whose source path the scan can still see, because Markdown holds content authority. So purging only the index means the next `agent-memory rebuild` brings the memory straight back.

Something has to give, and the plan raises it as BOLT-11-Q1 rather than choosing silently.

The recommendation is a `memory_deleted` tombstone that rebuild honours regardless of scan presence, leaving the artifact on disk. That refines the BOLT-09 rule rather than breaking it: the Q4 answer already made the log authoritative for history "including deliberate removals", and BOLT-09's scan-wins filter was designed for a file that *disappeared*, which is incidental. A governed deletion is deliberate. As a side effect it closes the resurrection path BOLT-09 recorded, because a tombstone does not depend on the file being absent.

## Other Findings While Scoping

- The `lifecycle-edges` cleanup target is **vacuous**. `EDGE_TYPE_NAMES` and `LifecycleEdge` exist from BOLT-01, including a `supersedes` type, but no edge is ever extracted or persisted. The plan says so explicitly rather than shipping a no-op that reads as success.
- `cleanupSemanticEntries` has been dead code since BOLT-07. BOLT-11 wires it, which is the first time that contract will be exercised outside its own tests.
- Supersession being prose rather than a `supersedes` edge is now a smaller job than it looked, since the edge type already exists. Only extraction and persistence are missing.

## Decisions Made

- Kept export and delete in one slice but ordered the checklist so export lands first, since it shares the governance path and CLI wiring with delete but removes nothing.
- Recommended JSON for the export document. It needs no dependency, round-trips cleanly, and is verifiable in a test. US-006 AC-004 asks only for "a portable format".
- Put undo explicitly out of scope, and said plainly in the plan that this leaves only three protections on the first destructive slice in the product.

## Verification

- Documentation-only update; no code changed and no verification rerun. Last verified state remains 106 tests passing from the BOLT-10a session.

## Next Steps

1. Human reviews `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt11.md`.
2. Human answers BOLT-11-Q1 through BOLT-11-Q3, the first of which decides whether a governed delete touches Markdown.
3. Execute BOLT-11, export first.
4. Run the ADR-006 gate and scope concurrency before BOLT-12.
