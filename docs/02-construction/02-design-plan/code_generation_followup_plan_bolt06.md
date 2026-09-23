# AI-DLC Code Generation Follow-Up Plan - BOLT-06 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-07-06
**Skill:** `ai-dlc-code-generation`
**Approval Status:** Approved by user on 2026-07-27

## Purpose

Plan the next AI-DLC Code Generation slice after the approved BOLT-05 / UNIT-03 framework-agnostic interface contracts.

This plan is an approval gate. Do not create implementation code, tests, dependency changes, runtime structure changes, BOLT-06 code-generation reports, or BOLT-06 test-results reports until this plan is explicitly approved by the human reviewer.

## Selected Construction Gate

| Gate | Selection | Rationale |
|------|-----------|-----------|
| Next AI-DLC construction gate | `ai-dlc-code-generation` follow-up | BOLT-05 review outputs are approved; further code and test generation requires a new follow-up plan. |
| Next implementation slice | BOLT-06 / UNIT-03 iii-engine Runtime Adapter Boundary | `bolts_plan.md` marks BOLT-06 as the UNIT-03 runtime adapter slice. BOLT-05 established shared capability contracts that BOLT-06 can observe or trigger without owning domain behavior. |

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
| BOLT-05 Code Generation Report | Approved | `docs/02-construction/04-code-generation/code_generation_report_bolt05.md` |
| BOLT-05 Test Results | Approved | `docs/02-construction/04-code-generation/test_results_bolt05.md` |
| Code Generation skill and templates | Available | `docs/00-methodology/01-skills/ai-dlc-code-generation/SKILL.md`, `docs/02-construction/04-code-generation/` |

## Repository Baseline

| Area | Current Observation | Plan Impact |
|------|---------------------|-------------|
| Runtime package | TypeScript/Node package scaffold exists with strict TypeScript checks and direct compiled test execution. | Reuse the existing approved runtime and test setup. |
| Capability contracts | BOLT-05 provides shared capability definitions, descriptor maps, router envelopes, governance routing, and memory job observation types. | BOLT-06 should attach runtime-adapter semantics to these contracts, not bypass them. |
| Storage/rebuild/search | BOLT-02 provides local projection, search, rebuild, and event semantics. | Runtime triggers may describe rebuild jobs but should not own storage mutation. |
| Retrieval/context pack | BOLT-03 provides startup context retrieval and token-bounded packs. | Adapter observations can reference context/query jobs without changing retrieval ranking. |
| Governance/operations | BOLT-04 provides governed write, delete/export decisions, provenance, retention, and redaction semantics. | iii-triggered jobs must not bypass governance decisions. |
| Current tests | UNIT-01 through BOLT-05 tests pass, 33 total. | Add focused BOLT-06 tests and keep existing tests passing. |

## Implementation Authorization Requested By This Plan

If this plan is approved, the following implementation authorizations are included for BOLT-06 only:

| Requested Authorization | Scope | Guardrail |
|-------------------------|-------|-----------|
| Add optional runtime adapter domain contracts | Add TypeScript types/factories for adapter binding, adapter status, supported triggers, runtime trigger payloads, and observation targets. | Keep contracts independent from the concrete iii SDK and any hosted runtime. |
| Add adapter policy validation | Implement validation that core local mode remains available when iii is disabled or unavailable. | Do not make iii required for query, context, rebuild, delete, export, or write capability contracts. |
| Add trigger-to-capability mapping foundation | Define in-process mapping from approved runtime trigger labels to existing BOLT-05 capability names and memory job types. | Trigger mapping must route through the Capability Router contract and cannot mutate storage directly. |
| Add job observation publication contracts | Define observation summaries and publication decisions for local logs or later iii observation adapters. | Do not publish raw sensitive content by default. |
| Add BOLT-06 tests | Add tests for no-iii fallback, trigger mapping, governance preservation, adapter status validation, and no concrete iii dependency boundary. | Keep tests traceable to US-007, NFR-014, NFR-015, R-006, and R-011. |
| Produce BOLT-06 Code Generation artifacts | Create `docs/02-construction/04-code-generation/code_generation_report_bolt06.md` and `docs/02-construction/04-code-generation/test_results_bolt06.md`. | Do not rewrite approved BOLT-01 through BOLT-05 report/test artifacts. |

## Scope For BOLT-06

### In Scope

- Optional iii runtime adapter boundary contracts.
- Adapter binding and adapter status model with enabled, disabled, and unavailable states.
- Supported trigger descriptors for rebuild, consolidation placeholder, export/delete observation, and query/context observation where applicable.
- Trigger-to-capability mapping that references BOLT-05 capability names and job types.
- Local-mode fallback semantics when no adapter binding exists.
- Observation publication contracts that carry job status, timing, result summary, provenance link, and errors without raw sensitive content.
- Tests for optional adapter behavior, no-hard-dependency boundaries, governance preservation, and trigger mapping consistency.
- BOLT-06-specific Code Generation Report and Test Results artifacts.

### Out Of Scope

- Installing or importing a concrete iii SDK.
- Running an iii worker, trigger, console, or hosted runtime.
- Actual runtime scheduling or background daemon behavior.
- Actual MCP server, CLI binary/parser, or local HTTP API server implementation.
- Actual filesystem delete/export package execution.
- Semantic retrieval implementation.
- Deployment, packaging for release, hosted/server profile, or README rewrite.

## Open Questions Resolved Or Deferred By This Plan

| Question | Plan Position | Rationale |
|----------|---------------|-----------|
| Which iii job types should be enabled first? | Define contracts for rebuild triggers and export/delete/job observation first; consolidation remains descriptor-only unless already supported by existing domain ports. | Rebuild and operation observation are closest to approved BOLT-02/BOLT-04/BOLT-05 contracts. |
| Should BOLT-06 install the iii SDK? | Defer concrete SDK installation. | Current approved slice can prove optional boundary semantics without adding dependency risk. |
| Can iii-triggered actions bypass human/governance checks? | No. Triggers must map through Capability Router contracts and governance decisions. | Preserves BOLT-04 and BOLT-05 safety boundaries. |

## Traceability Map

| Planned Task | Unit / Bolt | Stories | Domain / Logical Design | NFRs / Risks |
|--------------|-------------|---------|--------------------------|--------------|
| Runtime adapter binding and status model | UNIT-03 / BOLT-06 | US-007 AC-002 | RuntimeAdapterBinding, AdapterStatus | NFR-014, NFR-015, R-006 |
| Trigger-to-capability mapping foundation | UNIT-03 / BOLT-06 | US-007 AC-001 | RuntimeAdapterPolicyService, CapabilityRoutingService | NFR-014, NFR-015, R-006, R-011 |
| Job observation publication contracts | UNIT-03 / BOLT-06 | US-007 AC-003 | JobObservationService, MemoryJob | NFR-014, NFR-015 |
| No-iii fallback validation | UNIT-03 / BOLT-06 | US-007 AC-002 | RuntimeAdapterBinding invariant | NFR-005, NFR-015, R-006 |
| Governance preservation for adapter-triggered operations | UNIT-03 / BOLT-06 | US-006, US-007 | Adapter trigger -> Capability Router -> UNIT-04 contract | NFR-011, NFR-015, R-005, R-013 |
| BOLT-06 tests and reports | UNIT-03 / BOLT-06 | US-007 | UNIT-03 validation checklist | NFR-014, NFR-015, R-006, R-011 |

## Execution Checklist

- [x] Record explicit human approval of this BOLT-06 Code Generation follow-up plan.
- [x] Reconfirm approved inputs and verify no upstream approval has changed.
- [x] Reinspect the current TypeScript package/source/test baseline.
- [x] Add optional runtime adapter binding, status, trigger, and observation domain types.
- [x] Implement adapter policy validation and no-iii fallback semantics.
- [x] Implement trigger-to-capability mapping foundation.
- [x] Implement job observation publication contract foundation.
- [x] Add tests for optional adapter behavior, trigger mapping, governance preservation, and no concrete iii dependency boundary.
- [x] Add `src/docs/` fixtures only if needed for tests. (Not needed; tests construct bindings, triggers, and job runs directly.)
- [x] Run available verification checks: build, typecheck, tests.
- [x] Create `docs/02-construction/04-code-generation/code_generation_report_bolt06.md`.
- [x] Create `docs/02-construction/04-code-generation/test_results_bolt06.md`.
- [x] If tests/checks fail, document failures and request approval before applying non-trivial fixes. (One trigger-ordering assertion failed during development and was corrected before final verification; final run has no failures.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a session log in `session-logs/`.

## Planned Verification

| Check | Planned Command / Method | Purpose |
|-------|--------------------------|---------|
| TypeScript build | `npm run build` | Verify source and tests compile. |
| TypeScript typecheck | `npm run typecheck` | Verify strict TypeScript constraints. |
| Unit/integration tests | `npm test` | Verify UNIT-01 through BOLT-06 behavior. |
| Adapter fallback tests | BOLT-06 test suite | Verify core local mode remains valid without iii binding. |
| Trigger mapping tests | BOLT-06 test suite | Verify runtime triggers map to approved BOLT-05 capabilities and job types. |
| Boundary tests | BOLT-06 test suite | Verify no concrete iii SDK/runtime dependency is required by this slice. |

## Approval Gate

- Approved by user on 2026-07-27. Execution of the BOLT-06 / UNIT-03 scope described here is authorized.
- Approval of this plan authorizes only the BOLT-06 / UNIT-03 implementation described here.
- Any concrete iii SDK dependency, MCP server, CLI binary, local HTTP server, semantic retrieval, filesystem delete/export execution, deployment work, README rewrite, new dependency, or deviation from this plan requires a new approval or approved follow-up plan.

## Execution Notes

- 2026-07-06: Plan created by GitHub Copilot for human review after BOLT-05 report/test approval. No implementation, tests, dependency changes, runtime structure changes, BOLT-06 code-generation report, or BOLT-06 test-results report were created.
- 2026-07-27: Plan approved by the user. BOLT-06 implementation executed: `src/domain/runtime-adapter-boundary.ts` added, `src/index.ts` and `package.json` updated, and `tests/runtime-adapter-boundary.test.ts` added. No dependency was added. Final verification passed with `npm run build`, `npm run typecheck`, and `npm test` (41 tests, 0 failures). BOLT-06 Code Generation Report and Test Results created and are pending human review.