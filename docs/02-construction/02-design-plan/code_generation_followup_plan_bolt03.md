# AI-DLC Code Generation Follow-Up Plan - BOLT-03 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-06-16
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-06-16

## Purpose

Plan the next AI-DLC Code Generation slice after the approved BOLT-02 / UNIT-02 local storage and rebuild foundation.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-03 code-generation reports, or BOLT-03 test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-02 review outputs are approved; future code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-03 / UNIT-02 Retrieval And 2000-Token Context Pack | `bolts_plan.md` marks BOLT-03 as sequential after BOLT-02. BOLT-03 implements the startup context retrieval behavior required by US-001. |

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| User stories | Approved | `docs/01-inception/02-user-stories/all_user_stories.md` |
| NFRs | Approved | `docs/01-inception/03-nfrs/nfrs.md` |
| Risk register | Approved | `docs/01-inception/04-risks/risk_register.md` |
| Units composition | Approved | `docs/01-inception/05-units/units_composition.md` |
| Bolts plan | Approved | `docs/01-inception/06-bolts/bolts_plan.md` |
| Technology Decisions | Approved | `docs/02-construction/01-architecture/technology_decisions.md` |
| System Architecture | Approved | `docs/02-construction/01-architecture/system_architecture.md` |
| UNIT-02 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md` |
| UNIT-02 Logical Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval_logical_design.md` |
| BOLT-02 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt02.md` |
| BOLT-02 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt02.md` |
| Code Generation skill and templates | Available | `docs/00-methodology/01-skills/ai-dlc-code-generation/SKILL.md`, `docs/02-construction/04-code-generation/` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime package | TypeScript/Node package scaffold exists with strict TypeScript checks and direct compiled test execution. | Reuse the existing approved runtime and test setup. |
| Lifecycle core | UNIT-01 provides memory categories, artifact classification, lifecycle memory records, edge types, and historical policy. | BOLT-03 ranking and context pack items should reuse these concepts instead of redefining them. |
| Local storage/rebuild | BOLT-02 provides durable source observations, JSONL events, rebuild runs, `node:sqlite` projection repository, and local metadata/text search. | BOLT-03 should build retrieval orchestration and context packing on top of this projection/search foundation. |
| Current tests | UNIT-01 and BOLT-02 tests pass, 13 total. | Add focused BOLT-03 tests and keep existing tests passing. |
| Runtime docs / fixtures | `src/docs/README.md` remains the approved location for product/runtime fixtures. | Add `src/docs/` fixtures only if tests need reusable sample artifacts. |

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for BOLT-03 only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add retrieval domain types | Add TypeScript types/factories for retrieval modes, query intent, token budget, ranking rationale, retrieval candidates, context pack items, and context packs. | Keep domain concepts independent from CLI/MCP/API presentation. |
| Add ranking and packing services | Implement lifecycle-aware ranking over BOLT-02 local search/projection results and pack selected memories within token budget. | Approved lifecycle memory and exact lifecycle matches outrank draft/conflicting memory. |
| Add deterministic token estimator | Implement a simple deterministic estimator behind a replaceable boundary. | Do not select or require a model-specific tokenizer in this slice. |
| Add startup retrieval orchestration | Implement startup mode to return goal, phase, active plan, approved decisions, blockers, and next steps where indexed memories exist. | Do not implement CLI/MCP/API surfaces; expose library-level functions/classes only. |
| Add BOLT-03 tests | Add tests for startup retrieval shape, <=2000 token budget, provenance/category inclusion, approved-over-draft ranking, and expanded-mode deferral. | Keep tests traceable to US-001, NFR-001, NFR-002, NFR-006, NFR-020, R-008, and R-009. |
| Produce BOLT-03 Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report_bolt03.md` and `docs/02-construction/04-code-generation/test_results_bolt03.md`. | Do not rewrite approved BOLT-01 or BOLT-02 report/test artifacts. |

## Scope For BOLT-03

### In Scope

- UNIT-02 retrieval/session/context pack foundation for BOLT-03.
- Startup retrieval mode for US-001.
- Retrieval request/query intent value objects.
- Token budget model with default startup budget at or below 2000 tokens.
- Deterministic token estimation suitable for tests and later replacement.
- Lifecycle-aware ranking signals for approval state, exact path/category/phase matches, active goal terms, blocker/risk terms, and freshness where available.
- Context pack item ordering with source path, category, approval state, inclusion reason, and token estimate.
- Tests proving startup context includes the expected lifecycle summary when indexed inputs exist and respects the 2000-token budget.
- BOLT-03-specific Code Generation Report and Test Results artifacts.

### Out Of Scope

- UNIT-04 governance policy engine, secret/PII redaction, delete/export implementation, raw observation retention policy, or full visibility enforcement.
- UNIT-03 MCP, CLI, local API, capability router, job coordinator, or iii-engine adapter implementation.
- UNIT-05 semantic retrieval, embeddings, vector index, or retrieval fusion.
- Performance-scale test with 1,000 lifecycle records / 10,000 raw/event records unless feasible without expanding scope.
- Hosted/server profile, deployment, packaging for release, or README rewrite.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| LD-UNIT02-OQ-001: Which token estimator should v1 use before a model-specific tokenizer is selected? | Resolve for BOLT-03 with a deterministic approximate estimator behind a replaceable boundary. | Satisfies tests and keeps model-specific tokenizer selection deferred. |
| LD-UNIT02-OQ-003: Should focused retrieval mode allow expanded token budgets above 2000 by default? | Defer. | BOLT-03 implements default startup mode; expanded/focused mode policy belongs to later interface planning. |
| SYS-LD-OQ-003: What default raw observation TTL should be used when enabled? | Defer to UNIT-04 governance planning. | Raw observations remain disabled by default per ADR-004. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Retrieval request and query intent model | UNIT-02 / BOLT-03 | US-001 AC-001 | QueryIntent, RetrievalSession | NFR-001, NFR-020, R-008 |
| Token budget and estimator | UNIT-02 / BOLT-03 | US-001 AC-002 | TokenBudget, ContextPack | NFR-002, NFR-020, R-008, R-009 |
| Lifecycle-aware ranking | UNIT-02 / BOLT-03 | US-001 AC-004 | RankingRationale, RetrievalCandidate | NFR-006, R-008, R-009 |
| Context pack builder | UNIT-02 / BOLT-03 | US-001 AC-001, AC-003 | ContextPackFactory, ContextPackItem | NFR-001, NFR-002, NFR-006, NFR-020 |
| Startup retrieval orchestration | UNIT-02 / BOLT-03 | US-001 AC-001 | Retrieval Orchestrator | NFR-001, NFR-020, R-008, R-009 |
| BOLT-03 tests and reports | UNIT-02 / BOLT-03 | US-001 | UNIT-02 validation checklist | NFR-001, NFR-002, NFR-006, NFR-020, R-008, R-009 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-03 Code Generation follow-up plan.
- [x] Reconfirm approved inputs and verify no upstream approval has changed.
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add retrieval request, mode, query intent, and token budget domain types.
- [x] Implement deterministic token estimator behind a replaceable boundary.
- [x] Implement retrieval candidate and ranking rationale model.
- [x] Implement lifecycle-aware ranking over BOLT-02 local projection/search results.
- [x] Implement context pack and context pack item model with provenance/category/inclusion reason.
- [x] Implement startup context pack builder with <=2000-token default budget.
- [x] Implement startup retrieval orchestration over BOLT-02 local index projection.
- [x] Add tests for startup context shape, token budget, provenance/category inclusion, approved-over-draft ranking, and scoped deferrals.
- [x] Add `src/docs/` fixtures only if needed for tests.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt03.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt03.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes.
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01, BOLT-02, and BOLT-03 behavior. |
| Token budget test | BOLT-03 test suite | Verify default startup context pack is at or below 2000 estimated tokens. |
| Ranking test | BOLT-03 test suite | Verify approved lifecycle memory outranks conflicting draft memory. |
| Provenance test | BOLT-03 test suite | Verify context pack items include source path, category, approval state, and inclusion reason. |

## Approval Gate

- Execution is blocked until the human explicitly approves this plan.
- Approval of this plan authorizes only the BOLT-03 / UNIT-02 implementation described here.
- Any CLI/MCP/local API, governance policy engine, delete/export, iii adapter, semantic retrieval, deployment work, README rewrite, new dependency, or deviation from this plan requires a new approval or approved follow-up plan.

## Execution Notes

- 2026-06-16: Plan created by GitHub Copilot for human review. No implementation, tests, dependency changes, runtime structure changes, BOLT-03 code-generation report, or BOLT-03 test-results report were created.
- 2026-06-16: User approved this BOLT-03 follow-up plan; execution started for BOLT-03 / UNIT-02 only.
- 2026-06-16: Reconfirmed approved input artifacts and current TypeScript/BOLT-02 baseline before implementation.
- 2026-06-16: Implemented retrieval intent, token budget, deterministic estimator, ranking rationale, context pack models, lifecycle-aware ranking, and startup retrieval orchestration over the BOLT-02 local projection.
- 2026-06-16: Added BOLT-03 tests for startup context shape, token budget cap, provenance/category inclusion, approved-over-draft ranking, and token-budget omission; no `src/docs/` fixtures were needed.
- 2026-06-16: Verification passed: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 17 tests passing.
- 2026-06-16: Created BOLT-03 Code Generation Report and Test Results artifacts. No final verification failures occurred.
- 2026-06-16: Updated project status to show BOLT-03 Code Generation complete and pending human review.
- 2026-06-16: Wrote BOLT-03 implementation session log.