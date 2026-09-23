# Test Results - BOLT-10a / UNIT-02 + UNIT-01

**Project:** Agent-memory
**Date:** 2026-07-27
**Related Code Generation Report:** `docs/02-construction/04-code-generation/code_generation_report_bolt10a.md`

## Approval Status

Approved by user on 2026-07-27.

## Verification Summary

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | Source and tests compile with `tsc -p tsconfig.json`. |
| TypeScript typecheck | `npm run typecheck` | Pass | Strict TypeScript check passes with no emit. |
| Unit/integration tests | `npm test` | Pass | 106 tests passed, 0 failed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, 8 BOLT-06, 10 BOLT-07, 8 BOLT-08, 7 BOLT-08a, 7 BOLT-08b, 10 BOLT-09, 13 BOLT-10, and 10 BOLT-10a tests. |
| **Acceptance criterion** | BOLT-10a tests, real repository | **Pass** | The startup pack carries `PROJECT_STATUS.md § Project Goal`, `§ Current Status`, and `§ Next Steps` within 2000 tokens, with at least 8 items and a source path on every one. |
| Section splitting | BOLT-10a tests | Pass | `# Title` preamble becomes an unnamed section; `##` and `###` headings each become their own; a document with no headings yields exactly one section; whitespace-only input yields none. |
| Bullet truncation | BOLT-10a tests | Pass | A 200-entry log keeps `entry 200` and drops `entry 1`, and is marked `earlier entries omitted`. This is the case where head-truncation would have returned the oldest decisions. |
| Prose truncation | BOLT-10a tests | Pass | Long prose keeps its opening and is marked `remainder omitted`. |
| Cap bounds the item | BOLT-10a tests | Pass | Both truncated items stay at or below the 500-token cap including the provenance header. |
| Provenance inheritance | BOLT-10a tests | Pass | Every packed section carries the parent memory ID, source path, category, approval status, and inclusion reason, and renders `Source: <path> § <heading>`. Satisfies US-001 AC-003. |
| Category reservations | BOLT-10a tests | Pass | Small `RiskMemory` and `DecisionMemory` artifacts survive alongside three large `PlanMemory` documents. Removing reservations does not increase category coverage. Budget stays within 2000. |
| Heading-level ranking | BOLT-10a tests | Pass | Within one document, `Next Steps` is packed ahead of an earlier and much larger `Recent Decisions` section. |
| Lifecycle authority | BOLT-10a tests | Pass | An approved decision still outranks a conflicting draft, satisfying US-001 AC-004. |
| Continuity ranking fix | BOLT-10a tests | Pass | A draft `SessionHandoffMemory` record carries no `ranking:draft-penalty` signal, while a draft `DecisionMemory` record still does. Scoped exactly as the Q1 answer specified. |
| Retrieval budgets | BOLT-10a tests | Pass | `startup` 2000, `focused` 4000, `handoff` and `audit` 20000. An explicit startup budget of 2001 still throws, so NFR-002 and NFR-020 are intact. |
| Extractor widening | BOLT-10a tests | Pass | `superseded by` in a later paragraph now yields `historical` with the verdict date preserved. The `nfrs.md` false positive does not return. A template placeholder still yields `draft`. |
| BOLT-03 regression | BOLT-03 tests | Pass | All four original tests pass unmodified. |
| Full regression | BOLT-01 to BOLT-10 tests | Pass | No classification, approval, coverage, or boundary behaviour changed apart from the deliberate Q1 ranking fix. |

## Measured Outcome

Against this repository, 108 artifacts indexed.

| Metric | After BOLT-10 | After BOLT-10a |
|--------|---------------|----------------|
| Startup pack items | 1 | **13** |
| Startup tokens | 1677 / 2000 | 1982 / 2000 |
| `PROJECT_STATUS.md` sections present | 0 | **3** |
| Truncated items in the startup pack | n/a | 0 |
| `audit` mode items | n/a | 84 at 19,967 / 20,000 |

Top six packed sections:

```
164  PROJECT_STATUS.md § Project Goal
 88  PROJECT_STATUS.md § Current Status
341  PROJECT_STATUS.md § Next Steps
276  code_generation_followup_plan_bolt10a.md § Purpose
164  code_generation_followup_plan_bolt03.md § Purpose
193  code_generation_followup_plan_bolt08a.md § Purpose
```

## Failed Checks

| Check | Failure Summary | Suspected Cause | Proposed Fix | Approval Needed |
|-------|-----------------|-----------------|--------------|-----------------|
| None | No failed checks in final verification. | N/A | N/A | No |

Two failures occurred during development. Both changed the implementation and are recorded because they were real.

| Failure | Symptom | Cause | Fix |
|---------|---------|-------|-----|
| Acceptance criterion not met on the first attempt | The pack contained `Project Goal` and `Current Status` but not `Next Steps`; `Recent Decisions` took the slot | Sections were packed in document order, so an earlier and less useful section won | Added heading-level ranking signals, combined additively with the parent document score |
| Section cap did not bound the packed item | A truncated prose item measured above the 500-token cap | The cap applied to the section body while the provenance header was appended afterwards | The header is rendered first and its tokens are subtracted from the cap |

The first was caught only by running the acceptance criterion against the real repository, not by any unit test. That is the argument for writing the criterion into the plan before implementing.

## Coverage Notes

| Area | Coverage / Evidence | Gaps |
|------|---------------------|------|
| Acceptance criteria | US-001 AC-001 is now demonstrable: goal, phase, and next steps arrive from the continuity document, with an active plan and a risk artifact alongside. AC-002 the 2000-token bound, AC-003 provenance, and AC-004 approved-over-draft are each asserted. | Blockers arrive from `risk_register.md` rather than `PROJECT_STATUS.md § Risks / Blockers`, which at 831 tokens does not fit alongside the rest. The element is covered; the preferred source is not. |
| Domain invariants | Startup budget remains hard-capped. Every packed section carries provenance. Approved still outranks conflicting draft. The continuity exemption is scoped to one category and asserted not to leak. | No test prevents a future heading signal from being added without a recorded decision. |
| Integration points | Packing consumes BOLT-03 `RetrievalCandidate` values unchanged and feeds the same `ContextPack` type, extended with two optional fields. The CLI required no change. | The MCP surface in BOLT-12 will consume the same pack and needs no special handling. |
| NFR / risk scenarios | NFR-002 and NFR-020 bounds are enforced and tested. NFR-006 provenance holds per section. R-008 and R-009 are directly addressed: the pack no longer omits the important content, and it no longer fills with one arbitrary document. | NFR-001 latency is still unmeasured. The acceptance test's ~10 second runtime is a full rebuild, not a retrieval benchmark. |

## Follow-Ups

- BOLT-10a Test Results approved on 2026-07-27.
- Consider a per-section soft target below the hard cap so an 831-token section like `Risks / Blockers` can contribute a trimmed form rather than being omitted entirely.
- Consider making heading signals configurable data, as the scan rules are, so a workspace with different heading wording is not disadvantaged.
- Measure NFR-001 retrieval latency separately at BOLT-14; the acceptance test measures a rebuild, not a read.
- Supersession remains prose rather than a typed lifecycle edge. US-003 is the structural fix and is still unimplemented.
