# AI-DLC Code Generation Follow-Up Plan - BOLT-02 / UNIT-02

**Project:** Agent-memory
**Date:** 2026-06-15
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-06-15

## Purpose

Plan the next AI-DLC Code Generation slice after the approved BOLT-01 / UNIT-01 Lifecycle Memory Core foundation.

This plan is an approval gate. Do not create implementation code, tests, package files, dependency files, runtime structure changes, BOLT-02 code-generation reports, or BOLT-02 test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | The first Code Generation slice is approved; future code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-02 / UNIT-02 Local Workspace Storage And Retrieval foundation | `bolts_plan.md` marks BOLT-02 as sequential after BOLT-01. It establishes local storage, rebuild, and search foundations needed before BOLT-03 retrieval context packing, BOLT-05 interfaces, and later deployment planning. |

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
| UNIT-01 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report.md` |
| UNIT-01 Test Results | Approved | `docs/02-construction/04-code-generation/test_results.md` |
| UNIT-02 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md` |
| UNIT-02 Logical Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval_logical_design.md` |
| Code Generation skill and templates | Available | `docs/00-methodology/01-skills/ai-dlc-code-generation/SKILL.md`, `docs/02-construction/04-code-generation/` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime package | TypeScript/Node package scaffold exists with strict `tsconfig.json`, `package.json`, and Node built-in test execution. | Reuse the existing approved runtime and test setup. |
| Current source | `src/domain/lifecycle-memory-core.ts` implements UNIT-01 categories, artifact source validation, lifecycle memory records, typed edges, historical policy, and repository ports. | BOLT-02 should build on UNIT-01 exports instead of duplicating lifecycle category or edge logic. |
| Current tests | `tests/lifecycle-memory-core.test.ts` covers UNIT-01 behavior. | Add focused BOLT-02 tests in root `tests/` and keep existing tests passing. |
| Storage implementation | No durable source reader, JSONL event model, SQLite/local index projection, rebuild coordinator, or local search implementation exists. | BOLT-02 can add these foundations behind ports and keep them local-first. |
| Runtime docs / fixtures | `src/docs/README.md` exists as the approved location for runtime templates, classified Markdown examples, and fixtures. | Add BOLT-02 fixtures under `src/docs/` only if needed; do not use root `docs/` as product/runtime fixture storage. |
| Prior Code Generation outputs | First-slice report and test results are approved historical artifacts. | Do not rewrite them as BOLT-02 execution reports; produce BOLT-02-specific follow-up reports after implementation. |

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for BOLT-02 only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add UNIT-02 storage/rebuild source modules | Add TypeScript modules for durable source observations, JSONL memory events, rebuild runs, rebuild changes, projection records, and local search requests/results. | Keep domain concepts independent from concrete transport or hosted infrastructure. |
| Add local storage adapter boundary | Add local-first implementation code for reading workspace artifacts/events and projecting searchable derived records. | Derived index must remain rebuildable from Markdown artifacts and JSONL events; it must not become the source of truth. |
| Use local SQLite for BOLT-02 projection | Use the approved local-first SQLite/FTS-style storage posture from ADR-003. Prefer Node built-in `node:sqlite` on the approved Node runtime with no new npm runtime dependency. | If the local runtime cannot support `node:sqlite`, stop, document the failure, and request approval before adding an external SQLite dependency or changing the storage approach. |
| Add JSONL event schema and helpers | Define append-only event records sufficient for rebuild and audit evidence in this slice. | Do not implement raw observation retention, compaction, or governance policy engine beyond metadata required for BOLT-02 tests. |
| Add deterministic rebuild workflow | Rebuild local projection from durable source observations and JSONL events, including created/updated/removed/conflicted counts where feasible for the slice. | Preserve historical approved artifact policy from UNIT-01 and record invalid/malformed sources as rebuild warnings rather than silently accepting them. |
| Add local exact/FTS-style search foundation | Support metadata and text search for local workspace memory sufficient for US-004 acceptance criteria. | Do not implement startup context packs, token-budgeted packing, expanded retrieval modes, or semantic retrieval in this slice. |
| Add BOLT-02 tests | Add tests for JSONL event validation, rebuild from durable sources, template exclusion, index deletion/rebuild, local search ranking by artifact path/phase/status/risk/decision where implemented, and repository boundary behavior. | Keep tests traceable to US-004, NFR-003, NFR-005, NFR-009, NFR-010, NFR-019, R-002, and R-010. |
| Produce BOLT-02 Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report_bolt02.md` and `docs/02-construction/04-code-generation/test_results_bolt02.md`. | Do not semantically rewrite approved BOLT-01 report or test-results artifacts. |

## Scope For BOLT-02

### In Scope

- UNIT-02 local workspace storage and rebuildable index foundation for BOLT-02.
- Durable source observation model for Markdown lifecycle artifacts and append-only memory events.
- JSONL event record model and validation for approved memory events used by rebuild.
- Rebuild run model with source set, status, change counts, warnings, and consistency outcome.
- Local derived projection schema for memory metadata, text fields, lifecycle edge references, approval/visibility metadata needed by this slice, and FTS/BM25-style search.
- Deterministic rebuild behavior after deleting derived projection state.
- Local search foundation for US-004 metadata and text queries without hosted infrastructure.
- Tests for rebuildability, template exclusion, malformed source handling, local/offline search, and derived-index/source separation.
- BOLT-02-specific Code Generation Report and Test Results artifacts.

### Out Of Scope

- BOLT-03 startup context pack builder, retrieval ranking for active goal/phase, token-budgeted context packing, and 2000-token enforcement.
- UNIT-04 governance policy engine, secret/PII redaction, delete/export implementation, raw observation retention policy, and visibility enforcement beyond schema/metadata placeholders needed for BOLT-02.
- UNIT-03 MCP, CLI, local API, capability router, job coordinator, and iii-engine adapter implementation.
- UNIT-05 semantic retrieval, embeddings, vector index, retrieval fusion, or disabled semantic runtime plumbing.
- Hosted/server profile, Postgres, pgvector, deployment, packaging for release, or cloud infrastructure.
- Root `README.md` rewrite unless a later approved documentation plan includes it.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| SYS-LD-OQ-001: Which implementation slice should follow UNIT-01? | Resolve by selecting BOLT-02 / UNIT-02 Local Workspace Storage And Retrieval foundation. | BOLT-02 is sequential after BOLT-01 and unlocks BOLT-03 and BOLT-05. |
| LD-UNIT02-OQ-001: Which token estimator should v1 use before a model-specific tokenizer is selected? | Defer to BOLT-03. | Token estimation belongs to context packing, which is out of scope for BOLT-02. |
| LD-UNIT02-OQ-002: What event compaction/snapshot policy is needed after JSONL grows beyond v1 scale? | Defer to operations planning. | This slice defines append-only events and rebuild behavior only. |
| LD-UNIT02-OQ-003: Should focused retrieval mode allow expanded token budgets above 2000 by default? | Defer to BOLT-03 / interface planning. | Focused retrieval mode and budget controls are out of scope for BOLT-02. |
| SYS-LD-OQ-003: What default raw observation TTL should be used when enabled? | Defer to UNIT-04 governance planning. | Raw observations remain disabled by default per ADR-004 and are not implemented in BOLT-02. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Durable source observation and reader contracts | UNIT-02 / BOLT-02 | US-004 AC-001, AC-003 | Durable Source Reader, WorkspaceMemoryCatalog | NFR-003, NFR-005, NFR-019, R-010 |
| JSONL event schema and validation | UNIT-02 / BOLT-02 | US-004 AC-003 | Durable Source, RebuildRun | NFR-003, NFR-010, R-010 |
| Local projection schema and repository boundary | UNIT-02 / BOLT-02 | US-004 AC-001 | Index Projection, Local Workspace Repository Port | NFR-005, NFR-009, NFR-010, NFR-019, R-002 |
| Deterministic rebuild workflow | UNIT-02 / BOLT-02 | US-004 AC-003 | Rebuild Coordinator, RebuildConsistencyService | NFR-003, R-010 |
| Local search foundation | UNIT-02 / BOLT-02 | US-004 AC-001, AC-002 | Retrieval Orchestrator, Ranking Engine boundary | NFR-005, NFR-009, R-008, R-009 |
| Template exclusion and malformed source handling | UNIT-02 / BOLT-02 | US-002 AC-004, US-004 AC-003 | UNIT-01 classifier integration, Rebuild warnings | NFR-003, NFR-006, R-001, R-010 |
| BOLT-02 tests and verification artifacts | UNIT-02 / BOLT-02 | US-004 | UNIT-02 failure modes and validation checklist | NFR-003, NFR-005, NFR-009, NFR-010, NFR-019, R-002, R-010 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-02 Code Generation follow-up plan.
- [x] Reconfirm approved inputs and verify no upstream approval has changed.
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add UNIT-02 storage/rebuild domain and adapter module structure using approved TypeScript/Node runtime.
- [x] Implement durable source observation and source reader contracts.
- [x] Implement JSONL memory event schema and validation helpers.
- [x] Implement rebuild run, rebuild change, and rebuild outcome models.
- [x] Implement local projection schema and repository boundary for derived index state.
- [x] Implement deterministic rebuild workflow from durable source observations and JSONL events.
- [x] Implement local search foundation for US-004 metadata/text queries.
- [x] Integrate UNIT-01 artifact classification and template exclusion into rebuild.
- [x] Add tests for JSONL validation, rebuild from durable sources, index deletion/rebuild, malformed source warnings, template exclusion, local search, and repository boundary behavior.
- [x] Add `src/docs/` classified examples or fixtures only if needed for tests.
- [x] Run available verification checks: build, typecheck, tests, and any additional storage checks introduced by this slice.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt02.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt02.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes.
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 remains stable and BOLT-02 behavior works. |
| Rebuild validation | Test deletes derived projection state and rebuilds from durable Markdown/event inputs | Prove NFR-003 and US-004 AC-003 for this slice. |
| Local/offline search validation | Test metadata/text search without network or hosted service | Prove US-004 AC-001 and local-first posture. |
| Traceability review | Compare changed files to this plan and BOLT-02 Code Generation Report | Confirm implementation maps to approved Unit/story/NFR/risk scope. |

## Approval Gate

- Execution is blocked until the human explicitly approves this plan.
- Approval of this plan authorizes only the BOLT-02 / UNIT-02 implementation described here.
- Any additional runtime dependency, storage package, CLI/MCP/local API surface, governance policy engine, iii adapter, semantic retrieval, deployment work, README rewrite, or deviation from this plan requires a new approval or approved follow-up plan.
- If `node:sqlite` is unavailable or unsuitable during execution, record the failure and request approval before adding an external SQLite dependency or changing the storage implementation approach.

## Execution Notes

- 2026-06-15: Plan created by GitHub Copilot for human review. No implementation, tests, package files, dependency files, runtime structure changes, BOLT-02 code-generation report, or BOLT-02 test-results report were created.
- 2026-06-15: User approved this BOLT-02 follow-up plan; execution started for BOLT-02 / UNIT-02 only.
- 2026-06-15: Reconfirmed approved input artifacts, current TypeScript baseline, and `node:sqlite` availability before implementation.
- 2026-06-15: Added UNIT-02 domain and local storage adapter module boundaries and exported them from the package entrypoint.
- 2026-06-15: Implemented durable source observation, approval metadata defaults, template-path detection, and source reader contracts.
- 2026-06-15: Implemented JSONL memory event schema, validation, serialization, and replay parsing helpers.
- 2026-06-15: Implemented rebuild run, change, warning, and outcome models with deterministic count summaries.
- 2026-06-15: Implemented projected memory record schema and local `node:sqlite` projection repository boundary for derived index state.
- 2026-06-15: Implemented deterministic rebuild workflow from durable sources and JSONL events, integrating UNIT-01 classification and template exclusion with rebuild warnings.
- 2026-06-15: Implemented local metadata/text search foundation with deterministic path, category, phase, approval, and text scoring signals.
- 2026-06-15: Added BOLT-02 tests for JSONL validation, rebuild, index deletion/rebuild, warnings, template exclusion, local search, and repository boundary behavior; no `src/docs/` fixtures were needed.
- 2026-06-15: Verification passed: `npm run build`, `npm run typecheck`, and `npm test` completed successfully with 13 tests passing.
- 2026-06-15: Created BOLT-02 Code Generation Report and Test Results artifacts. Early typecheck row-cast failure was documented; final verification passes.
- 2026-06-15: Updated project status to show BOLT-02 Code Generation complete and pending human review.
- 2026-06-15: Wrote BOLT-02 execution session log.