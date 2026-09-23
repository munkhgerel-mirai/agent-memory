# Code Generation Report - BOLT-10a / UNIT-02 + UNIT-01

**Project:** Agent-memory
**Date:** 2026-07-27

## Approval Status

Approved by user on 2026-07-27. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt10a.md` (approved by user on 2026-07-27, with both open questions answered as recommended).

## Summary

- Implemented BOLT-10a / UNIT-02 + UNIT-01 Section-Level Context Packing. **US-001 is now demonstrable on this repository**, which it was not after BOLT-10.
- Changed the unit of context packing from the whole document to the Markdown section. `splitArtifactSections` splits on `##` through `######`, treats content before the first heading as an unnamed preamble, and returns exactly one section for an artifact with no headings.
- Added a per-section token cap that bounds the **whole packed item**, provenance header included, not just its body.
- Added direction-aware truncation. A bullet-list section keeps its newest entries; prose keeps its opening. Both are marked in the output and flagged with `truncated`.
- Added category reservations for startup mode with spill-over, so the pack's shape follows what US-001 enumerates rather than whatever ranks highest.
- Added heading-level ranking signals for goal, status, next steps, and blockers, combined additively with the parent document's score.
- Stopped applying the `draft` penalty to `SessionHandoffMemory`, per the Q1 answer.
- Added a 20,000-token budget for the `handoff` and `audit` modes, per the Q2 answer. `startup` stays capped at 2000 and still rejects a larger explicit budget.
- Widened the approval extractor to honour `superseded by` anywhere in the `## Approval Status` section, removing the paragraph-placement trap.
- Added `sectionHeading` and `truncated` to `ContextPackItem`, both optional.
- Added `tests/context-packing.test.ts` with 10 tests, including a falsifiable acceptance test against this repository.
- Added no dependency and no memory category.

## Outcome Against The Acceptance Criterion

The plan stated the criterion so the slice could not be declared done on mechanism alone, which is how BOLT-10 over-claimed.

> `agent-memory context` includes the `Project Goal`, `Current Status`, and `Next Steps` sections of `PROJECT_STATUS.md`, within the 2000-token budget.

Measured against this repository:

| | After BOLT-10 | After BOLT-10a |
|---|---|---|
| Items in the startup pack | 1 | **13** |
| Tokens used | 1677 / 2000 | 1982 / 2000 |
| `PROJECT_STATUS.md` present | No | **Yes, three sections** |
| Truncated items | n/a | 0 |

Top of the pack:

```
164  PROJECT_STATUS.md § Project Goal
 88  PROJECT_STATUS.md § Current Status
341  PROJECT_STATUS.md § Next Steps
276  code_generation_followup_plan_bolt10a.md § Purpose
164  code_generation_followup_plan_bolt03.md § Purpose
193  code_generation_followup_plan_bolt08a.md § Purpose
```

The `audit` mode returns 84 items at 19,967 / 20,000 tokens.

Not everything US-001 lists arrives from `PROJECT_STATUS.md`. Its `Risks / Blockers` section is 831 tokens and does not fit alongside the rest, so blockers arrive from `risk_register.md` instead. That is acceptable coverage of the element, but it is a real limit and is recorded in the follow-ups.

## Approved Inputs

- **Units:** UNIT-02, with UNIT-01 approval extraction
- **Bolts:** BOLT-10a
- **User Stories:** US-001 AC-001, AC-002, AC-003, AC-004, US-002 AC-001
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`
- **NFRs:** NFR-001, NFR-002, NFR-004, NFR-006, NFR-020
- **Risks:** R-008, R-009
- **Technology Decisions:** ADR-001, ADR-003

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `package.json` | Updated | verification | Registered the BOLT-10a test file. |
| `src/domain/retrieval-context.ts` | Updated | UNIT-02 / US-001 | Section splitting, per-item cap, direction-aware truncation, category reservations, heading signals, continuity ranking fix, expanded budgets, and two optional `ContextPackItem` fields. |
| `src/storage/workspace-source-reader.ts` | Updated | UNIT-01 + UNIT-02 / US-002 | `superseded by` honoured anywhere in the approval section. |
| `tests/context-packing.test.ts` | Added | UNIT-02 / BOLT-10a | 10 tests including the repository acceptance test. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt10a.md` | Updated | AI-DLC gate | Recorded approval, both answers, and execution progress. |
| `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md` | Updated | AI-DLC gate | Append-only Amendment 3. Existing entries and Amendments 1 and 2 unchanged. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt10a.md` | Added | AI-DLC gate | This report. |
| `docs/02-construction/04-code-generation/test_results_bolt10a.md` | Added | AI-DLC gate | BOLT-10a verification evidence. |

## Design Decisions

| Decision | Reasoning |
|----------|-----------|
| The cap bounds the packed item, not the section body | The provenance header carries a free-text inclusion reason. Capping the body alone left item size unbounded, which a test caught. |
| Heading signals are added to the parent score, not used alone | A pure heading sort would let an irrelevant old document jump the queue because it happens to have a "Next Steps" heading. Additive scoring lifts the right section within a relevant document. |
| Bullet-list sections truncate from the head | Append-only logs in this corpus put the newest entry last. Head-truncating `Recent Decisions` would have returned the oldest decisions, which is worse than omitting the section. |
| Reservations spill over rather than expire | A workspace with no risk artifacts should not lose 15 percent of its budget. |
| `PROJECT_STATUS.md` keeps its `draft` status | It is a living record, not an approved artifact. Marking it approved to win ranking points would misrepresent it. The ranking rule changed instead. |
| Reservations apply to `startup` only | The reserved categories are chosen for what US-001 enumerates. Other modes fall back to plain ranked order. |

## Defect Found And Fixed During Development

| Defect | Symptom | Cause | Fix |
|--------|---------|-------|-----|
| Section cap did not bound the packed item | A truncated prose item measured well above the 500-token cap | The cap applied to the section body while the provenance header, including a free-text reason, was added afterwards | The header is rendered first and its tokens are subtracted from the cap, so no packed item can exceed it. Asserted for both truncation directions. |

An earlier iteration also failed the acceptance criterion: sections were packed in document order, so `Recent Decisions` took the slot `Next Steps` needed. That produced the heading-signal ranking described above. It was caught by running the criterion rather than by a unit test, which is the reason the criterion was written into the plan.

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | NFR / Risk |
|---------------------|------|------------|----------------|------------|
| Section splitting and provenance inheritance | UNIT-02 / BOLT-10a | US-001 AC-001, AC-003 | ContextPack, ContextPackItem | NFR-002, NFR-006, NFR-020 |
| Per-item cap and marked truncation | UNIT-02 / BOLT-10a | US-001 AC-002 | Context Pack Builder | NFR-002, NFR-020 |
| Direction-aware truncation | UNIT-02 / BOLT-10a | US-001 AC-001 | Context Pack Builder | NFR-006 |
| Category reservations | UNIT-02 / BOLT-10a | US-001 AC-001 | Retrieval ranking and packing | NFR-002, R-009 |
| Heading-level ranking signals | UNIT-02 / BOLT-10a | US-001 AC-001 | rankRetrievalCandidates | R-008, R-009 |
| Continuity ranking fix | UNIT-02 / BOLT-10a | US-001 AC-001, AC-004 | rankRetrievalCandidates | NFR-001 |
| Expanded retrieval budgets | UNIT-02 / BOLT-10a | US-001 | TokenBudget, RetrievalMode | NFR-002, NFR-020 |
| Approval-extractor widening | UNIT-01 + UNIT-02 / BOLT-10a | US-002 AC-001 | DurableSourceApprovalMetadata | NFR-004, NFR-006 |
| BOLT-10a tests | UNIT-02 / BOLT-10a | US-001 | UNIT-02 validation checklist | NFR-002, NFR-020, R-008, R-009 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | A section is treated as a bullet list when at least 60 percent of its non-empty lines start with a list marker and it has at least three lines. | Within the plan's direction-aware truncation scope |
| Assumption | Heading signals cover goal, status, next steps, and blockers. Approved decisions are served by the `DecisionMemory` reservation rather than a heading pattern, because decision headings vary widely. | Within the plan's reservation and ranking scope |
| Deviation | The plan described reservations and ranking separately; the implementation needed both to meet the criterion. Heading-level ranking was implied by the plan's rationale but not listed as a task. | Within the plan's stated intent; recorded here for review. |
| Deviation | The acceptance test rebuilds the whole repository and takes roughly 10 seconds, which dominates suite runtime. | Accepted: it is the only evidence that the criterion actually holds. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning. | Accepted by prior BOLT guardrails. |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | Completed successfully. |
| Full tests | `npm test` | Pass | 106 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b, 10 BOLT-09, 13 BOLT-10, and 10 BOLT-10a tests. |
| Acceptance test | BOLT-10a test suite | Pass | The pack carries `Project Goal`, `Current Status`, and `Next Steps` from `PROJECT_STATUS.md` within 2000 tokens, against the real repository. |
| BOLT-03 regression | BOLT-03 test suite | Pass | All four original tests pass unmodified, including the startup budget cap and approved-over-draft ranking. |
| Section splitting | BOLT-10a test suite | Pass | Preamble, nested headings, no-heading fallback, and empty input all behave as specified. |
| Truncation | BOLT-10a test suite | Pass | A 200-entry bullet log keeps entry 200 and drops entry 1; prose keeps its opening; both are marked and both stay within the cap. |
| Reservations | BOLT-10a test suite | Pass | Small risk and decision artifacts survive alongside large plan sections, and removing reservations does not increase category coverage. |
| Heading ranking | BOLT-10a test suite | Pass | `Next Steps` outranks an earlier `Recent Decisions` section in the same document. |
| Provenance | BOLT-10a test suite | Pass | Every packed section carries its parent memory ID, source path, category, and approval status. |
| Lifecycle authority | BOLT-10a test suite | Pass | An approved decision still outranks a conflicting draft, satisfying US-001 AC-004. |
| Continuity ranking | BOLT-10a test suite | Pass | A draft `SessionHandoffMemory` carries no draft penalty; a draft `DecisionMemory` still does. |
| Budgets | BOLT-10a test suite | Pass | `startup` 2000, `focused` 4000, `handoff` and `audit` 20000, and an explicit startup budget above 2000 still throws. |
| Extractor widening | BOLT-10a test suite | Pass | `superseded by` is honoured in a later paragraph, the `nfrs.md` false positive does not return, and a template placeholder still declares nothing. |
| Regression suite | BOLT-01 through BOLT-10 | Pass | No classification, approval, or boundary behaviour changed apart from the deliberate Q1 ranking fix. |

## Follow-Ups

- BOLT-10a Code Generation Report and Test Results approved on 2026-07-27; no BOLT-10a review artifacts remain pending.
- `PROJECT_STATUS.md § Risks / Blockers` is 831 tokens and does not fit in the startup pack. Blockers currently arrive from `risk_register.md`. A per-section soft target below the cap, or splitting that section, would improve it.
- The acceptance test costs about 10 seconds. If suite time becomes a problem, it could seed a fixture workspace instead, at the cost of weaker evidence.
- Heading signals are a fixed list. A workspace using different heading wording gets no lift. Making them configurable alongside the scan rules would generalise this.
- Supersession is still prose rather than a typed lifecycle edge. US-003 remains the structural fix.
- BOLT-11, BOLT-12, and BOLT-13 remain. BOLT-12 is no longer blocked by this gap.
