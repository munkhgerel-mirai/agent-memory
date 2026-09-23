# AI-DLC Code Generation Follow-Up Plan - BOLT-10a / UNIT-02 + UNIT-01

**Project:** Agent-memory
**Date:** 2026-07-27
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27, with both open questions answered as recommended

## Purpose

Make US-001 achievable. BOLT-10 shipped a working CLI and proved that the retrieval mechanism, the persistence layer, and the token budget all function correctly, then showed that the product outcome still does not arrive: `agent-memory context` returns one artifact and omits 99.

BOLT-10a changes the unit of context packing from the whole document to the section, so a 2000-token pack can carry the goal, phase, active plan, approved decisions, blockers, and next steps that [US-001 AC-001](docs/01-inception/02-user-stories/all_user_stories.md#L24) requires.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-10a code-generation reports, or BOLT-10a test-results reports until this plan is explicitly approved by the human reviewer.

## Precondition

The BOLT-10 Code Generation Report and Test Results are still pending human review. Execution should not begin until they are approved, since this slice acts on a finding those artifacts record.

## Why This Bolt Exists

BOLT-10a is not in `bolts_plan_addendum_v1_release.md`. It is proposed because BOLT-10 produced a measured finding that blocks the story US-001's own notes call *"the primary success target for v1."*

| Reason | Evidence |
|--------|----------|
| The primary v1 outcome is unmet | `agent-memory context` returns 1 item and omits 99. With a goal it returns 3, all session logs. |
| The required content never arrives | `PROJECT_STATUS.md` holds the goal, phase, blockers, and next steps. It is in neither pack. |
| Ranking alone cannot fix it | That file is ~6459 tokens against a 2000-token budget. Even ranked first it cannot fit. |
| Whole-document packing is the cause | The top two ranked candidates are 3233 and 6359 tokens. `buildContextPack` skips what does not fit, so the first artifact that fits consumes 84 percent of the budget. |
| It must precede BOLT-12 | The MCP server exposes the same `get_context`. Shipping it first would hand agents the same broken outcome. |

If approved, an Amendment 3 will be appended to `bolts_plan_addendum_v1_release.md` recording BOLT-10a, leaving Amendments 1 and 2 and all existing entries unmodified, per NFR-004.

## Measured Baseline

Captured from this repository on 2026-07-27, 108 artifacts indexed, 194,336 tokens total.

`PROJECT_STATUS.md`, 7105 tokens whole, splits as:

| Section | Tokens | US-001 element |
|---------|--------|----------------|
| `## Project Goal` | 117 | current goal |
| `## Current Status` | 42 | AI-DLC phase |
| `## Recent Decisions` | 5801 | approved decisions, append-only |
| `## Next Steps` | 293 | next steps |
| `## Risks / Blockers` | 831 | blockers |

Goal plus Current Status plus Next Steps is **452 tokens**, 23 percent of the budget, covering three required elements. Adding Blockers reaches 1283 tokens and four elements, leaving room for an active plan and decisions from other artifacts.

Section splitting is not uniformly clean. `nfrs.md` yields a single 1606-token section, because its table sits directly under `## Approval Status` with no further heading. `Recent Decisions` is itself 5801 tokens. Both cases need a per-section cap.

## Scope For BOLT-10a

### In Scope

- **Section-level packing.** Split artifact text on `^##+` headings. Content before the first heading becomes a preamble section. A document with no headings yields one section.
- **Section provenance.** Each section inherits its parent's memory ID, source path, category, and approval status, so [US-001 AC-003](docs/01-inception/02-user-stories/all_user_stories.md#L26) still holds. `ContextPackItem` gains an optional `sectionHeading`.
- **Per-section token cap** with a default, and truncation that is marked in the output.
- **Direction-aware truncation.** A section that is predominantly a bullet list keeps its **last** entries; prose keeps its **first** tokens. Append-only logs in this corpus put the newest entry last, so head-truncating `Recent Decisions` would return the oldest decisions.
- **Category reservations for startup mode.** Reserve a share of the budget per lifecycle category, fill reservations from the top-ranked sections of that category, then fill the remainder by global rank. Unused reservations spill over rather than being wasted.
- **Continuity-artifact ranking fix**, per the BOLT-10a-Q1 answer.
- **Approval-extractor widening**, accepting `superseded by` anywhere in the `## Approval Status` section rather than only the verdict paragraph.
- Tests, including a repository-level acceptance test.
- BOLT-10a Code Generation Report and Test Results.
- Append-only Amendment 3 to the v1 bolts plan addendum.

### Out Of Scope

- Changing the default startup budget of 2000 tokens. NFR-002 and NFR-020 fix it, and this slice must work within it.
- Semantic or embedding-based selection. The BOLT-07 boundary stays disabled.
- Summarisation or any LLM call. NFR-019 keeps v1 free of hosted services.
- Lifecycle `supersedes` edges under US-003. Related and valuable, but a separate slice.
- MCP server, local HTTP API, delete or export execution.
- Concurrency control.
- Any new runtime or dev dependency.

## Open Questions Resolved By The Reviewer

Both answered as recommended on 2026-07-27 and now binding.

| ID | Question | Decision | Selector / Date |
|----|----------|----------|-----------------|
| BOLT-10a-Q1 | How should the continuity document stop being penalised for being `draft`? | Stop applying the `draft` penalty to `SessionHandoffMemory`. A continuity record is never "approved" by nature, so penalising it for that is a category error. `PROJECT_STATUS.md` keeps its honest `draft` status. | User / 2026-07-27 |
| BOLT-10a-Q2 | Should this slice add a 20,000-token expanded retrieval mode? | Yes, wired to the existing `handoff` and `audit` modes. `startup` stays capped at 2000, so NFR-002 and NFR-020 are unchanged. | User / 2026-07-27 |

Everything else is a recorded position rather than an open question, including the truncation rule, the reservation shape, and the optional `sectionHeading` field. Approval of this plan approves those positions.

## Planned Reservation Shape

For `startup` mode only. Percentages are of the 2000-token budget, applied as reservations rather than caps.

| Category group | Reservation | US-001 element served |
|----------------|-------------|-----------------------|
| SessionHandoffMemory | 25% | current goal, phase, next steps |
| PlanMemory, ApprovalGateMemory | 25% | active plan |
| DecisionMemory | 20% | approved decisions |
| RiskMemory | 15% | blockers |
| Unreserved | 15% | filled by global rank |

Reservations are filled first from the highest-ranked sections of that group. Anything unfilled returns to the unreserved pool, so a workspace with no risk artifacts loses nothing.

## Acceptance Criterion

The slice is not complete unless this holds against this repository:

> `agent-memory context` includes the `Project Goal`, `Current Status`, and `Next Steps` sections of `PROJECT_STATUS.md`, within the 2000-token budget.

That is US-001 AC-001 made falsifiable. It is stated here so the slice cannot be declared done on mechanism alone, which is exactly how BOLT-10 over-claimed.

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Section splitting and provenance inheritance | UNIT-02 / BOLT-10a | US-001 AC-001, AC-003 | ContextPack, ContextPackItem | NFR-002, NFR-006, NFR-020 |
| Per-section cap and marked truncation | UNIT-02 / BOLT-10a | US-001 AC-002 | Context Pack Builder | NFR-002, NFR-020 |
| Direction-aware truncation | UNIT-02 / BOLT-10a | US-001 AC-001 | Context Pack Builder | NFR-006 |
| Category reservations | UNIT-02 / BOLT-10a | US-001 AC-001 | Retrieval ranking and packing | NFR-002, NFR-020, R-009 |
| Continuity-artifact ranking fix | UNIT-02 / BOLT-10a | US-001 AC-001, AC-004 | rankRetrievalCandidates | NFR-001, R-009 |
| Approval-extractor widening | UNIT-01 + UNIT-02 / BOLT-10a | US-002 AC-001 | DurableSourceApprovalMetadata | NFR-004, NFR-006 |
| Expanded retrieval mode, if approved | UNIT-02 / BOLT-10a | US-001 | TokenBudget, RetrievalMode | NFR-002, NFR-020 |
| BOLT-10a tests | UNIT-02 / BOLT-10a | US-001 | UNIT-02 validation checklist | NFR-002, NFR-020, R-008, R-009 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-10a Code Generation follow-up plan.
- [x] Record the reviewer's answers to BOLT-10a-Q1 and BOLT-10a-Q2. (Both answered as recommended.)
- [~] Confirm the BOLT-10 review artifacts are approved before starting. (Still formally pending. The reviewer directed execution to proceed; the finding this slice acts on was independently re-measured.)
- [x] Capture a before-baseline of the current pack contents and of existing BOLT-03 ranking outcomes.
- [x] Add section splitting with preamble handling and no-heading fallback.
- [x] Add `sectionHeading` to `ContextPackItem` and inherit provenance.
- [x] Add the per-section cap with marked truncation.
- [x] Add direction-aware truncation for bullet-list sections.
- [x] Add category reservations with spill-over for startup mode.
- [x] Apply the BOLT-10a-Q1 ranking fix.
- [x] Widen the approval extractor to accept `superseded by` anywhere in the section.
- [x] Add the expanded mode if BOLT-10a-Q2 is approved.
- [x] Add tests, including the repository-level acceptance criterion above.
- [x] Verify no previously classified artifact changed category or approval, apart from the deliberate Q1 change.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt10a.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt10a.md`.
- [x] Append Amendment 3 to `bolts_plan_addendum_v1_release.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (Two development failures, both fixed within the approved scope: the acceptance criterion failed on the first attempt because sections were packed in document order, and the section cap did not bound the packed item. Both are recorded in the report and test results.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-10a behavior. |
| Acceptance test | BOLT-10a test suite | Verify the pack contains `Project Goal`, `Current Status`, and `Next Steps` from `PROJECT_STATUS.md` within 2000 tokens, against the real repository. |
| Budget test | BOLT-10a test suite | Verify the startup pack never exceeds 2000 tokens, including after truncation markers are added. |
| Section splitting tests | BOLT-10a test suite | Verify preamble handling, no-heading fallback, and nested heading levels. |
| Truncation tests | BOLT-10a test suite | Verify a bullet-list section keeps its last entries and a prose section keeps its first, and that both are marked as truncated. |
| Reservation tests | BOLT-10a test suite | Verify each category group is represented when candidates exist, and that unused reservations spill over rather than wasting budget. |
| Provenance test | BOLT-10a test suite | Verify every packed section carries its parent source path, category, and approval status, satisfying US-001 AC-003. |
| Lifecycle authority test | BOLT-10a test suite | Verify an approved section still outranks a conflicting draft section, satisfying US-001 AC-004. |
| Extractor widening test | BOLT-10a test suite | Verify `superseded by` is honoured anywhere in the approval section, and that `nfrs.md` does not regress to `historical`. |
| Unchanged-behaviour test | BOLT-01 to BOLT-10 suites | Verify no classification or approval changed apart from the deliberate Q1 ranking fix. |

## Approval Gate

- Execution is blocked until the human explicitly approves this plan and answers BOLT-10a-Q1 and BOLT-10a-Q2.
- Execution additionally awaits approval of the BOLT-10 review artifacts.
- Approval authorizes only the BOLT-10a implementation described here, plus the append-only Amendment 3.
- Raising the default startup budget, adding a memory category, semantic selection, any LLM call, or any new dependency requires a new approval.

## Risk Of This Slice

This changes approved BOLT-03 behaviour, which every later bolt and the BOLT-14 acceptance evidence depend on. Two guards are planned: a before-baseline captured prior to any edit, and an unchanged-behaviour test asserting that nothing except the deliberate Q1 change moved. Both mirror what BOLT-08a did when it extended the approved classifier, which caught a real conflict before it shipped.

## Execution Notes

- 2026-07-27: Plan created after the BOLT-10 real-workspace run showed US-001 unmet. No implementation, tests, dependency changes, bolts addendum amendment, BOLT-10a code-generation report, or BOLT-10a test-results report were created.
- 2026-07-27: Plan approved with both questions answered as recommended, and executed. `src/domain/retrieval-context.ts` and `src/storage/workspace-source-reader.ts` updated, `tests/context-packing.test.ts` added with 10 tests, `package.json` updated. No dependency and no memory category were added. Final verification passed with `npm run build`, `npm run typecheck`, and `npm test` (106 tests, 0 failures). The acceptance criterion holds: the startup pack carries `PROJECT_STATUS.md § Project Goal`, `§ Current Status`, and `§ Next Steps` at 1982 of 2000 tokens across 13 items, up from 1 item. Amendment 3 appended to the v1 bolts plan addendum. Review artifacts pending.
