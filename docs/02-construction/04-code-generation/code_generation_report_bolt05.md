# Code Generation Report - BOLT-05 / UNIT-03

**Project:** Agent-memory
**Date:** 2026-07-06

## Approval Status

Approved by user on 2026-07-06. Generated from approved `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt05.md`.

## Summary

- Implemented the fifth approved Code Generation slice: BOLT-05 / UNIT-03 Framework-Agnostic Interfaces foundation.
- Added shared capability contracts for `get_context`, `query_memory`, `inspect_memory`, `rebuild_index`, `export_memory`, `delete_memory`, and `write_memory`.
- Added invocation context, capability request/response envelopes, validation results, trace metadata, payload field descriptors, and framework-neutral surface descriptors.
- Added MCP tool, CLI command, and local API endpoint descriptor maps as data contracts only.
- Added an in-process Capability Router foundation with validation, response envelopes, projection-backed query/inspect routing, governance decision integration for export/delete/write, and non-executing job acceptance for later adapters.
- Added memory job lifecycle and observation summary types for query, rebuild, export, and delete jobs.
- Added BOLT-05 tests for capability validation, descriptor consistency, governance-required operations, projection routing, job observations, and no MCP/CLI/API/iii dependency boundaries.
- Did not implement an MCP server, CLI binary/parser, local HTTP server, iii adapter, semantic retrieval, filesystem delete/export execution, deployment, hosted/server profile, dependency changes, or README rewrite.

## Approved Inputs

- **Units:** UNIT-03
- **Bolts:** BOLT-05
- **User Stories:** US-005, with US-006 governance interaction for write/delete/export policy checks
- **Domain Designs:** `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md`
- **Logical Designs:** `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter_logical_design.md`
- **NFRs:** NFR-005, NFR-011, NFR-013, NFR-015
- **Risks:** R-005, R-006, R-011, R-013
- **Technology Decisions:** ADR-001, ADR-002, ADR-003, ADR-004

## Changed Files

| File | Change Type | Related Unit / Story | Notes |
|------|-------------|----------------------|-------|
| `package.json` | Updated | UNIT-03 / verification | Updated `npm test` to run the new BOLT-05 compiled test file. |
| `src/index.ts` | Updated | UNIT-03 | Exported BOLT-05 framework-agnostic integration contracts from the public package entrypoint. |
| `src/domain/framework-agnostic-integration.ts` | Added | UNIT-03 / US-005 | Capability names, invocation context, request/response envelopes, descriptor maps, router foundation, governance integration, and memory job lifecycle model. |
| `tests/framework-agnostic-integration.test.ts` | Added | UNIT-03 / US-005 | BOLT-05 tests for validation, descriptor consistency, governance-required flags, projection routing, job observation, and no-transport dependencies. |
| `docs/02-construction/02-design-plan/code_generation_followup_plan_bolt05.md` | Updated | AI-DLC gate | Recorded approval, execution progress, verification, and report creation status. |
| `docs/02-construction/04-code-generation/code_generation_report_bolt05.md` | Added | AI-DLC gate | This BOLT-05 Code Generation Report. |
| `docs/02-construction/04-code-generation/test_results_bolt05.md` | Added | AI-DLC gate | BOLT-05 verification evidence. |

## Traceability Mapping

| Implementation Task | Unit | Story / AC | Domain Element | Logical Decision | NFR / Risk |
|---------------------|------|------------|----------------|------------------|------------|
| Capability request and invocation context model | UNIT-03 / BOLT-05 | US-005 AC-001, AC-002, AC-003 | CapabilityName, InvocationContext, MemoryCapabilityRequest | Capability facade and shared domain commands | NFR-013, NFR-015, R-011 |
| Capability router validation and response envelopes | UNIT-03 / BOLT-05 | US-005 | CapabilityRoutingService | One Capability Router for all surfaces | NFR-005, NFR-013, NFR-015 |
| MCP tool descriptor map | UNIT-03 / BOLT-05 | US-005 AC-001 | MCP Surface | Tool descriptors route through Capability Router | NFR-013, NFR-015, R-006 |
| CLI command descriptor map | UNIT-03 / BOLT-05 | US-005 AC-002 | CLI Surface | Local operator commands share capability contracts | NFR-005, NFR-013 |
| Local API endpoint descriptor map | UNIT-03 / BOLT-05 | US-005 AC-003 | Local API Surface | Programmatic local integration remains descriptor-only in this slice | NFR-005, NFR-013, NFR-015 |
| Governance-required operation flags and decisions | UNIT-03 / BOLT-05 | US-005, US-006 AC-003, AC-004 | MemoryCapabilityRequest, CapabilityRoutingService | Governance before delete/export/write | NFR-011, R-005, R-013 |
| Memory job lifecycle model | UNIT-03 / BOLT-05 | US-005 | MemoryJob, JobResultSummary | Job lifecycle observation | NFR-013, NFR-015 |
| BOLT-05 tests | UNIT-03 / BOLT-05 | US-005 AC-001, AC-002, AC-003 | UNIT-03 validation checklist | Contract tests per surface and no-iii fallback boundary | NFR-005, NFR-013, NFR-015, R-006, R-011 |

## Assumptions And Deviations

| Type | Description | Approval Status |
|------|-------------|-----------------|
| Assumption | MCP, CLI, and local API maps are descriptor contracts only; no server, binary, parser, or HTTP runtime is introduced in BOLT-05. | Approved by `code_generation_followup_plan_bolt05.md` |
| Assumption | `write_memory` remains a governed request contract and returns approval-required by default unless a later approved adapter/handler performs candidate-level durable write evaluation. | Approved by `code_generation_followup_plan_bolt05.md` |
| Assumption | Query and inspect can route through the existing local projection repository port when attached; context/rebuild/export/delete execution adapters remain later work. | Approved by `code_generation_followup_plan_bolt05.md` |
| Assumption | `src/docs/` fixtures were not required because BOLT-05 tests can construct capability requests and projected memory records directly. | Approved by `code_generation_followup_plan_bolt05.md` |
| Deviation | Rebuild/export/delete capabilities create validated response/job envelopes but do not execute filesystem mutation, export packaging, or rebuild orchestration in this slice. | Approved by BOLT-05 out-of-scope guardrails. |
| Deviation | `node:sqlite` continues to emit Node's experimental feature warning during tests inherited from BOLT-02. | Accepted by prior BOLT guardrails; final verification passes. |

## Verification Results

| Check | Command / Method | Result | Notes |
|-------|------------------|--------|-------|
| TypeScript build | `npm run build` | Pass | `tsc -p tsconfig.json` completed successfully. |
| TypeScript typecheck | `npm run typecheck` | Pass | `tsc -p tsconfig.json --noEmit` completed successfully. |
| Full tests | `npm test` | Pass | 33 tests passed: 7 UNIT-01, 6 BOLT-02, 4 BOLT-03, 9 BOLT-04, and 7 BOLT-05 tests. |
| Capability validation tests | BOLT-05 test suite | Pass | Capability names, invocation context, request creation, and unknown capability validation are covered. |
| Descriptor consistency tests | BOLT-05 test suite | Pass | MCP, CLI, and local API descriptor maps expose the same approved capability set as data-only contracts. |
| Governance flag tests | BOLT-05 test suite | Pass | Export, delete, and write capabilities are marked governance-required across definitions and descriptors. |
| Boundary tests | BOLT-05 test suite | Pass | No MCP SDK, CLI parser, HTTP server, or iii dependency is required by this slice. |

## Follow-Ups

- BOLT-05 Code Generation Report and Test Results approved on 2026-07-06; no BOLT-05 review artifacts remain pending.
- Keep actual MCP server, CLI binary/parser, local HTTP API server, iii adapter, semantic retrieval, filesystem delete/export execution, deployment, and README rewrite behind later approved plans.
- Plan BOLT-06 / UNIT-03 iii adapter work separately before adding runtime triggers or observability publication.