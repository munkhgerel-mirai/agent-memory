# AI-DLC Code Generation Follow-Up Plan - BOLT-05 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-06-16
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by human reviewer on 2026-07-06

## Purpose

Plan the next AI-DLC Code Generation slice after the approved BOLT-04 / UNIT-04 privacy, governance, and memory operations foundation.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-05 code-generation reports, or BOLT-05 test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-04 review outputs are approved; future code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-05 / UNIT-03 Framework-Agnostic Interfaces | `bolts_plan.md` marks BOLT-05 as sequential after BOLT-02 and BOLT-04. BOLT-05 exposes existing storage, retrieval, and governance capabilities through shared interface contracts. |

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
| UNIT-03 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md` |
| UNIT-03 Logical Design | Approved | `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter_logical_design.md` |
| BOLT-02 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt02.md` |
| BOLT-02 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt02.md` |
| BOLT-03 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt03.md` |
| BOLT-03 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt03.md` |
| BOLT-04 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt04.md` |
| BOLT-04 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt04.md` |
| Code Generation skill and templates | Available | `docs/00-methodology/01-skills/ai-dlc-code-generation/SKILL.md`, `docs/02-construction/04-code-generation/` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime package | TypeScript/Node package scaffold exists with strict TypeScript checks and direct compiled test execution. | Reuse the existing approved runtime and test setup. |
| Lifecycle core | UNIT-01 provides memory categories, approval states, lifecycle records, edges, and historical policy. | Interface contracts should expose these concepts through stable response metadata, not own them. |
| Storage/rebuild/search | BOLT-02 provides local projection, search, rebuild, and event semantics. | Interface capability contracts can route query/rebuild requests to storage/retrieval boundaries later. |
| Retrieval/context pack | BOLT-03 provides startup context retrieval and token-bounded packs. | BOLT-05 can define `context` capability semantics over this service. |
| Governance/operations | BOLT-04 provides governed write, delete/export decisions, provenance, retention, and redaction semantics. | BOLT-05 must require governance decisions for write/delete/export operations. |
| Current tests | UNIT-01 through BOLT-04 tests pass, 26 total. | Add focused BOLT-05 tests and keep existing tests passing. |

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for BOLT-05 only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add integration capability domain types | Add TypeScript types/factories for capability names, invocation context, capability request, capability response, command/tool/API descriptors, and routing results. | Keep contracts independent from concrete MCP SDK, CLI parser, or HTTP server libraries. |
| Add capability router foundation | Implement an in-process framework-agnostic router that validates requests and maps capability names to existing retrieval/governance/storage abstractions where available. | Do not add external runtime dependencies or surface-specific transport behavior in this slice. |
| Add MCP/CLI/local API capability maps | Define MCP tool descriptors, CLI command descriptors, and local API endpoint descriptors as data contracts. | Descriptor maps are contracts only; actual MCP server, CLI binary, and HTTP server are out of scope unless later approved. |
| Add memory job lifecycle model | Add domain types for rebuild/export/delete/query job lifecycle status and observation summaries. | iii adapter/job runtime implementation remains BOLT-06/out of scope. |
| Add BOLT-05 tests | Add tests for capability validation, contract consistency across MCP/CLI/API maps, governance-required operations, context/query descriptors, and no-transport dependency boundaries. | Keep tests traceable to US-005, NFR-005, NFR-013, NFR-015, R-006, and R-011. |
| Produce BOLT-05 Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report_bolt05.md` and `docs/02-construction/04-code-generation/test_results_bolt05.md`. | Do not rewrite approved BOLT-01 through BOLT-04 report/test artifacts. |

## Scope For BOLT-05

### In Scope

- UNIT-03 framework-agnostic capability contract foundation.
- Capability names for context, query, inspect, rebuild, export, delete, and approved memory write.
- Invocation context with actor, workspace, requested surface, and purpose.
- Shared request/response types usable by MCP, CLI, and local API adapters later.
- Capability descriptor maps for MCP tools, CLI commands, and local API endpoints.
- Capability router validation and response envelopes.
- Memory job lifecycle and observation summary types for long-running rebuild/export/delete jobs.
- Tests for contract consistency, governance-required operation flags, no-transport dependency behavior, and capability validation.
- BOLT-05-specific Code Generation Report and Test Results artifacts.

### Out Of Scope

- Actual MCP server implementation or MCP SDK dependency.
- Actual CLI binary/command parser implementation.
- Actual local HTTP API server implementation.
- iii-engine runtime adapter implementation, triggers, or observability publication.
- Filesystem delete/export package execution.
- Semantic retrieval implementation.
- Deployment, packaging for release, hosted/server profile, or README rewrite.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| LD-UNIT03-OQ-001: Which MCP tools are mandatory in the first code-generation slice versus deferred? | Resolve for BOLT-05 with descriptors for `get_context`, `query_memory`, `inspect_memory`, `rebuild_index`, `export_memory`, and `delete_memory`; implementation remains adapter-free. | Matches logical design while avoiding MCP SDK dependency in this slice. |
| LD-UNIT03-OQ-002: Should the local API be shipped in v1 or defined but implemented after CLI/MCP? | Define local API endpoint contracts in BOLT-05; defer actual HTTP server implementation. | Preserves v1 integration shape without adding service lifecycle/security scope. |
| LD-UNIT03-OQ-003: Which iii job types should be enabled first? | Defer to BOLT-06. | iii adapter is explicitly outside BOLT-05 implementation. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Capability request and invocation context model | UNIT-03 / BOLT-05 | US-005 AC-001, AC-002, AC-003 | CapabilityName, InvocationContext | NFR-013, NFR-015, R-011 |
| Capability router foundation | UNIT-03 / BOLT-05 | US-005 | CapabilityRoutingService | NFR-005, NFR-013, NFR-015 |
| MCP tool descriptor map | UNIT-03 / BOLT-05 | US-005 AC-001 | MCP Surface | NFR-013, NFR-015 |
| CLI command descriptor map | UNIT-03 / BOLT-05 | US-005 AC-002 | CLI Surface | NFR-005, NFR-013 |
| Local API endpoint descriptor map | UNIT-03 / BOLT-05 | US-005 AC-003 | Local API Surface | NFR-005, NFR-013, NFR-015 |
| Governance-required operation flags | UNIT-03 / BOLT-05 | US-005, US-006 | Capability Router -> UNIT-04 contract | NFR-008, NFR-011, R-005, R-013 |
| Memory job lifecycle model | UNIT-03 / BOLT-05 | US-005 | Memory Job Coordinator | NFR-013, NFR-015 |
| BOLT-05 tests and reports | UNIT-03 / BOLT-05 | US-005 | UNIT-03 validation checklist | NFR-005, NFR-013, NFR-015, R-006, R-011 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-05 Code Generation follow-up plan.
- [x] Reconfirm approved inputs and verify no upstream approval has changed.
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add capability names, invocation context, request, response, and descriptor domain types.
- [x] Implement capability router validation and response envelope foundation.
- [x] Implement MCP tool descriptor map.
- [x] Implement CLI command descriptor map.
- [x] Implement local API endpoint descriptor map.
- [x] Implement memory job lifecycle and observation summary types.
- [x] Add tests for capability validation, descriptor consistency, governance-required operation flags, and no-transport dependency boundaries.
- [x] Add `src/docs/` fixtures only if needed for tests.
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt05.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt05.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes.
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-05 behavior. |
| Capability contract tests | BOLT-05 test suite | Verify each shared capability is represented consistently across router and descriptor maps. |
| Governance flag tests | BOLT-05 test suite | Verify delete/export/write capabilities are marked as governance-required. |
| Boundary tests | BOLT-05 test suite | Verify no MCP SDK, CLI parser, HTTP server, or iii dependency is required by this slice. |

## Approval Gate

- Execution is blocked until the human explicitly approves this plan.
- Approval of this plan authorizes only the BOLT-05 / UNIT-03 implementation described here.
- Any MCP server, CLI binary, local HTTP server, iii adapter, semantic retrieval, filesystem delete/export execution, deployment work, README rewrite, new dependency, or deviation from this plan requires a new approval or approved follow-up plan.

## Execution Notes

- 2026-06-16: Plan created by GitHub Copilot for human review. No implementation, tests, dependency changes, runtime structure changes, BOLT-05 code-generation report, or BOLT-05 test-results report were created.
- 2026-07-06: Human reviewer approved this BOLT-05 / UNIT-03 follow-up plan in chat with the statement: "approved @file:code_generation_followup_plan_bolt05.md".
- 2026-07-06: Approved inputs reconfirmed: BOLT-05 remains sequential after BOLT-02/BOLT-04, UNIT-03 Domain and Logical Design are approved, and TypeScript/Node plus optional iii boundaries remain the approved implementation context.
- 2026-07-06: Reinspected TypeScript package/source/test baseline. Existing `npm test` passed with 26 tests before BOLT-05 implementation edits.
- 2026-07-06: Added `src/domain/framework-agnostic-integration.ts` and exported it from `src/index.ts`; `npm run typecheck` passed after the contract/router/job-model edit.
- 2026-07-06: Added `tests/framework-agnostic-integration.test.ts` and updated `npm test` to include it. No `src/docs/` fixtures were needed for BOLT-05 tests. Interim `npm test` passed with 33 tests.
- 2026-07-06: Final verification passed: `npm run build`, `npm run typecheck`, and `npm test` all completed successfully with 33 tests. No failed checks required non-trivial fixes or additional approval.
- 2026-07-06: Created BOLT-05 Code Generation Report and Test Results artifacts for human review.
- 2026-07-06: Updated `PROJECT_STATUS.md` and wrote session log `session-logs/20260706_0747_copilot_bolt05-framework-interfaces.md`.