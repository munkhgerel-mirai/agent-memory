# Session Log - BOLT-10a Section-Level Context Packing

**Date:** 2026-07-27
**Duration:** BOLT-10a planning, approval, and implementation session

## Skills Used

- 2026-07-27: `ai-dlc-code-generation` - created and executed the BOLT-10a / UNIT-02 + UNIT-01 follow-up plan.

## Summary

- Created `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt10a.md` with a falsifiable acceptance criterion, then recorded the reviewer's approval and both answers.
- Changed context packing from whole documents to Markdown sections in `src/domain/retrieval-context.ts`.
- Widened the approval extractor in `src/storage/workspace-source-reader.ts`.
- Added `tests/context-packing.test.ts` with 10 tests.
- Created the BOLT-10a Code Generation Report and Test Results, and appended Amendment 3 to the v1 bolts plan addendum.
- Updated `PROJECT_STATUS.md`.

## The Outcome

US-001 is now demonstrable. Against this repository the startup pack went from **1 item to 13**, at 1982 of 2000 tokens, and carries `PROJECT_STATUS.md § Project Goal`, `§ Current Status`, and `§ Next Steps`. The `audit` mode returns 84 items at 19,967 of 20,000.

## Decisions Made

- Wrote the acceptance criterion into the plan before implementing, precisely because BOLT-10 had over-claimed US-001 on the strength of a working mechanism. It turned out to be the only thing that caught the first failure.
- Combined heading signals additively with the parent document score rather than sorting by heading alone, so an irrelevant old document cannot jump the queue just because it has a "Next Steps" heading.
- Truncated bullet-list sections from the head and prose from the tail. Append-only logs in this corpus put the newest entry last, so head-truncating `Recent Decisions` would have returned the oldest decisions.
- Made the token cap bound the whole packed item rather than the section body, after a test showed the free-text provenance reason left item size unbounded.
- Made reservations spill over, so a workspace with no risk artifacts does not lose 15 percent of its budget.
- Left `PROJECT_STATUS.md` classified `draft` and changed the ranking rule instead. It is a living record, not an approved artifact; marking it approved to win ranking points would have misrepresented it.
- Scoped reservations to `startup` mode, since the reserved categories are chosen for what US-001 enumerates.

## Two Failures During Development

Both changed the implementation.

- **The acceptance criterion failed on the first attempt.** The pack held `Project Goal` and `Current Status` but not `Next Steps`; `Recent Decisions` took the slot because sections were packed in document order. Fixed by adding heading-level ranking signals. No unit test would have caught this; only running the criterion against the real repository did.
- **The section cap did not bound the packed item.** A truncated prose item measured above the 500-token cap, because the cap applied to the body while the provenance header was appended afterwards. Fixed by rendering the header first and subtracting its tokens from the cap.

## Verification

- `npm run typecheck` - Pass.
- `npm run build` - Pass.
- `npm test` - Pass: 106 tests, 0 failures.
- All four original BOLT-03 tests pass unmodified, including the startup budget cap and approved-over-draft ranking.
- The continuity exemption is asserted not to leak: a draft `SessionHandoffMemory` carries no penalty while a draft `DecisionMemory` still does.
- The `nfrs.md` false positive from BOLT-08 does not return under the widened extractor.

## Process Note

The BOLT-10 review artifacts were still formally pending when this slice ran. The reviewer directed execution to proceed, and the finding this slice acts on was independently re-measured beforehand rather than taken on trust. The checklist records that precondition as partially satisfied rather than silently ticking it.

## Limits Recorded

- `PROJECT_STATUS.md § Risks / Blockers` is 831 tokens and does not fit alongside the rest. Blockers arrive from `risk_register.md` instead, which covers the element but not from the preferred source.
- Heading signals are a fixed list. A workspace using different wording gets no lift.
- The acceptance test rebuilds the whole repository and takes roughly 10 seconds, which now dominates suite runtime.
- Supersession is still prose rather than a typed lifecycle edge. US-003 remains the structural fix.

## Next Steps

1. Human reviews the four outstanding artifacts for BOLT-10 and BOLT-10a.
2. Create and approve the BOLT-11 follow-up plan for governed delete and export execution.
3. Run the ADR-006 technology decision gate before BOLT-12, which is no longer blocked by the packing gap.
4. Scope concurrency handling before BOLT-12.
