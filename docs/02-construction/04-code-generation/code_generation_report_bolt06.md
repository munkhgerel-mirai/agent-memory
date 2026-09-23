# Code Generation Report - BOLT-06 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-07-27

## Approval Status

Approved by user on 2026-07-27. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt06.md` (approved by user on 2026-07-27).

## Summary

- Implemented the sixth approved Code Generation slice: BOLT-06 / UNIT-03 iii-engine Runtime Adapter Boundary.
- Added an optional runtime adapter binding model with `enabled`, `disabled`, and `unavailable` adapter status states, a human-readable reason, and a last-observed timestamp.
- Made a newly created binding start `disabled`, so declaring an adapter can never silently move a workspace off local mode.
- Added runtime trigger descriptors for `memory.rebuild`, `memory.consolidate`, `memory.export.observe`, `memory.delete.observe`, `memory.query.observe`, and `memory.context.observe`, each deriving its job type and governance flag from the approved BOLT-05 capability definitions.
- Kept `memory.consolidate` as a `descriptor_only` trigger because no approved consolidation domain port exists yet; routing it returns a discovery result and never produces a capability request.
- Added `evaluateRuntimeAdapterPolicy` and `assertLocalModeIndependence`, which report all seven approved capabilities as locally available and an always-empty adapter-dependent capability set for every adapter state.
- Added trigger-to-capability mapping that builds a BOLT-05 `CapabilityRequest` on the `internal` surface; mapping never mutates storage and never reaches a capability except through the Capability Router.
- Added an optional in-process `RuntimeTriggerCoordinator` that routes a trigger through `CapabilityRouter.invokeCapability`, so BOLT-04 governance decisions still apply to adapter-triggered deletes, exports, and writes.
- Added job observation publication contracts that carry job status, timing, result summary, provenance link, errors, and retry eligibility, replace raw target scope with a target-count digest, and withhold fields matching BOLT-04 sensitive-content heuristics.
- Added BOLT-06 tests for descriptor/capability consistency, no-iii fallback, binding validation and status transitions, trigger routing and rejection, governance preservation, observation redaction, and the no-concrete-iii-dependency boundary.
- Did not install or import an iii SDK, run an iii worker/trigger/console, implement runtime scheduling or a background daemon, implement an MCP server, CLI binary/parser, or local HTTP API server, execute filesystem delete/export, implement semantic retrieval, or rewrite the README.

## Approved Inputs

- **Units:** UNIT-03
- **Bolts:** BOLT-06
- **User Stories:** US-007, with US-006 governance interaction for adapter-triggered delete/export/write
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md`
- **Logical Designs:** `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter_logical_design.md`
- **NFRs:** NFR-005, NFR-011, NFR-014, NFR-015
- **Risks:** R-005, R-006, R-011, R-013
- **Technology Decisions:** ADR-001, ADR-002

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `package.json` | Updated | UNIT-03 / verification | Updated `npm test` to run the new BOLT-06 compiled test file. |
| `src/index.ts` | Updated | UNIT-03 | Exported BOLT-06 runtime adapter boundary contracts from the public package entrypoint. |
| `src/domain/runtime-adapter-boundary.ts` | Added | UNIT-03 / US-007 | Adapter binding, adapter status, trigger descriptors, adapter policy validation, trigger-to-capability mapping, trigger coordinator, and job observation publication contracts. |
| `tests/runtime-adapter-boundary.test.ts` | Added | UNIT-03 / US-007 | BOLT-06 tests for trigger mapping, no-iii fallback, binding validation, governance preservation, observation redaction, and dependency/import boundaries. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt06.md` | Updated | AI-DLC gate | Recorded approval, execution progress, verification, and report creation status. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt06.md` | Added | AI-DLC gate | This BOLT-06 Code Generation Report. |
| `docs/02-construction/04-code-generation/test_results_bolt06.md` | Added | AI-DLC gate | BOLT-06 verification evidence. |

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Runtime adapter binding and status model | UNIT-03 / BOLT-06 | US-007 AC-002 | RuntimeAdapterBinding, AdapterBinding, AdapterStatus | iii Runtime Adapter is optional and first-class | NFR-014, NFR-015, R-006 |
| Adapter policy validation and no-iii fallback | UNIT-03 / BOLT-06 | US-007 AC-002 | RuntimeAdapterPolicyService | Core runs without the adapter; adapter reports disabled/unavailable | NFR-005, NFR-015, R-006 |
| Trigger descriptors and trigger-to-capability mapping | UNIT-03 / BOLT-06 | US-007 AC-001 | RuntimeAdapterBindingFactory, CapabilityRoutingService | iii trigger contract carries label, workspace, job type, payload, correlation ID | NFR-014, NFR-015, R-006, R-011 |
| Governance preservation for adapter-triggered operations | UNIT-03 / BOLT-06 | US-006, US-007 | MemoryCapabilityRequest, CapabilityRoutingService | Adapter cannot bypass governance | NFR-011, NFR-015, R-005, R-013 |
| Job observation publication contracts | UNIT-03 / BOLT-06 | US-007 AC-003 | JobObservationService, MemoryJob, JobResultSummary | Observation publishes status, timing, result, provenance, errors | NFR-014, NFR-015 |
| Sensitive-content withholding in observations | UNIT-03 / BOLT-06 | US-006, US-007 | Adapter Observation | Observation does not expose raw content | NFR-007, NFR-011, R-004, R-013 |
| BOLT-06 tests | UNIT-03 / BOLT-06 | US-007 | UNIT-03 validation checklist | Contract tests for optional adapter and no-iii boundary | NFR-014, NFR-015, R-006, R-011 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | Trigger labels are namespaced domain strings (`memory.*`) chosen by Agent-memory, not iii primitives; a later adapter maps them to concrete runtime triggers. | Approved by `code_generation_followup_plan_bolt06.md` |
| Assumption | `memory.consolidate` is published as a `descriptor_only` trigger and cannot be routed, matching the plan position that consolidation stays descriptor-only. | Approved by `code_generation_followup_plan_bolt06.md` |
| Assumption | Adapter-triggered capability requests use the existing `internal` integration surface so an adapter cannot impersonate an MCP, CLI, or local API caller. | Approved by `code_generation_followup_plan_bolt06.md` |
| Assumption | Observation records replace raw target scope with a target-count digest rather than a hash, because BOLT-06 adds no dependency and needs no cross-run correlation of scope values. | Approved by the plan guardrail "Do not publish raw sensitive content by default." |
| Assumption | `src/docs/` fixtures were not required because BOLT-06 tests construct bindings, triggers, and job runs directly. | Approved by `code_generation_followup_plan_bolt06.md` |
| Deviation | `routeRuntimeTrigger` checks `descriptor_only` support before the binding's declared-trigger list, so a descriptor-only trigger reports discovery rather than "not declared". Both paths still refuse to route, so no capability becomes reachable. | Within the plan's trigger-mapping scope; recorded here for review. |
| Deviation | `RuntimeTriggerCoordinator` executes routed requests through the Capability Router. It adds no scheduling, retry, or background behavior; it exists to prove the governance path. | Within the plan's "route through the Capability Router contract" guardrail. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning during tests inherited from BOLT-02. | Accepted by prior BOLT guardrails; final verification passes. |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | `tsc -p tsconfig.json` completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | `tsc -p tsconfig.json --noEmit` completed successfully. |
| Full tests | `npm test` | Pass | 41 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, 7 BOLT-05, and 8 BOLT-06 tests. |
| Adapter fallback tests | BOLT-06 test suite | Pass | All seven capabilities remain locally available with no binding, a disabled binding, and an unavailable binding. |
| Trigger mapping tests | BOLT-06 test suite | Pass | Trigger descriptors match BOLT-05 capability job types and governance flags; routing produces `internal` capability requests only when the binding is enabled, workspace-matched, and declares the trigger. |
| Governance preservation tests | BOLT-06 test suite | Pass | An adapter-triggered delete without targets is denied; a delete with targets is allowed and produces a queued job, both through the Capability Router. |
| Observation tests | BOLT-06 test suite | Pass | Records carry status, timing, provenance, and retry eligibility; raw target scope is digested and secret-like error text is withheld. |
| Boundary tests | BOLT-06 test suite | Pass | No iii/Temporal/Inngest dependency is declared, and every `src/**/*.ts` import is relative or `node:`-prefixed. |

## Follow-Ups

- BOLT-06 Code Generation Report and Test Results approved on 2026-07-27; no BOLT-06 review artifacts remain pending.
- Keep concrete iii SDK dependency, iii worker/trigger/console execution, runtime scheduling, MCP server, CLI binary/parser, local HTTP API server, semantic retrieval, filesystem delete/export execution, deployment, and README rewrite behind later approved plans.
- When a concrete iii adapter is planned, preserve the source-import boundary test so NFR-015 stays machine-enforced rather than review-enforced.
- A consolidation domain port is required before `memory.consolidate` can move from `descriptor_only` to `supported`.
