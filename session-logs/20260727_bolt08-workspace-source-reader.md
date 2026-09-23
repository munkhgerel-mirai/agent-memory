# Session Log - BOLT-08 Workspace Durable Source Reader

**Date:** 2026-07-27
**Duration:** BOLT-08 plan approval and implementation session

## Skills Used

- 2026-07-27: `ai-dlc-code-generation` - executed the approved BOLT-08 / UNIT-02 follow-up plan.

## Summary

- Recorded user approval of `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt08.md`.
- Inspected `classifyArtifactSource`, `matchCategoryRule`, `inferArtifactType`, `createArtifactSource`, and `createDurableSourceObservation` before writing anything, so the reader targets real contracts.
- Added `src/storage/workspace-source-reader.ts` with declarative scan rules, artifact type rules, deterministic content versioning, approval extraction, observation production, and typed skip reporting.
- Exported the reader from `src/index.ts` and registered the new test file in the `npm test` script.
- Added `tests/workspace-source-reader.test.ts` with 8 tests, including a scan of this repository's real tree.
- Created `docs/02-construction/04-code-generation/code_generation_report_bolt08.md` and `docs/02-construction/04-code-generation/test_results_bolt08.md`.
- Updated `PROJECT_STATUS.md` and the plan's execution checklist and execution notes.

## Decisions Made

- Kept the slice strictly read-only and proved it with a test that asserts the reader source references no write, create, delete, rename, or chmod API.
- Made scan rules declarative data with a stated reason per rule, and tested that the rule set contains no functions, so the discovery policy stays inspectable.
- Included root-level Markdown as candidates so files like `PROJECT_STATUS.md` surface as reported skips instead of being invisible to the scan.
- Hashed CRLF-normalized content for `observedVersion` rather than using mtime, so the version is stable across platforms and clones as NFR-003 requires.
- Did not follow symlinks, to avoid cycles and to keep the scan inside the workspace.
- Made `scan` skip and report while `readArtifact` throws, because a caller who names a specific file expects an answer rather than silence.

## Defects Found And Fixed

All three were surfaced by the real-tree scan rather than by hand-written fixtures.

- Root-level directories were unclassifiable. `matchCategoryRule` tests `/session-logs/` with a leading slash, which a root-level path cannot contain, so every session log was dropped. Fixed by having the reader declare `artifactType` through `DEFAULT_ARTIFACT_TYPE_RULES`, which routes through the classifier's existing type matching and leaves BOLT-01 unmodified.
- Approval extraction over-captured. `nfrs.md` resolved to `historical` because the section slice ran past the verdict into the NFR table, whose NFR-004 row contains the word "Historical". Fixed by using only the first verdict paragraph.
- Template placeholders were read as verdicts. Ten `*_TEMPLATE.md` files resolved to `changes_requested` because their placeholder lists every option at once. Fixed by treating angle-bracket placeholder verdicts as `draft` and by forcing any template's approval to `draft`, which is what US-002 AC-004 actually requires.

## Findings Recorded For A Later Decision

- 52 of 152 candidates match no BOLT-01 classification rule. Among them are `PROJECT_STATUS.md`, which holds the goal, phase, blockers, and next steps US-001 must return, and all ten UNIT domain-design and logical-design documents.
- The tests assert `PROJECT_STATUS.md` is skipped, as a deliberate tripwire so the gap stays visible until a decision is taken. Changing the classifier is outside BOLT-08 scope.

## Verification

- `npm run typecheck` - Pass.
- `npm run build` - Pass (run as part of `npm test`).
- `npm test` - Pass: 59 tests, 0 failures (7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08).
- Real-tree scan of this repository: 152 candidates, 100 observations, 52 unclassified skips, 0 unreadable, 0 empty, 0 oversized.

## Next Steps

1. Human reviews `docs/02-construction/04-code-generation/code_generation_report_bolt08.md` and `test_results_bolt08.md`.
2. Human decides how to handle the 52 unclassified candidates.
3. Create and approve the BOLT-09 follow-up plan for durable persistence.
4. Continue through BOLT-10 to BOLT-14, each behind its own approved follow-up plan.
