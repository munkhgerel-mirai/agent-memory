# AI-DLC Technology Decision Follow-Up Plan - ADR-006

**Project:** Agent-memory
**Date:** 2026-08-26
**Skill:** `ai-dlc-technology-decision`
**Approval Status:** Completed; plan and ADR-006 approved by the user on 2026-08-26

## Purpose

Select the MCP server implementation approach required by BOLT-12 before adding the project's first runtime dependency or implementing an MCP transport.

This plan is an approval gate. It authorizes decision analysis only after explicit human approval. It does not authorize dependency installation, BOLT-12 implementation, runtime structure changes, tests, deployment, or updates that treat ADR-006 as binding.

## Decision Scope

| ADR | Decision Area | Required Now | Blocking |
|-----|---------------|--------------|----------|
| ADR-006 | Integration / Dependency | Yes | BOLT-12 MCP server implementation |

### Decision Question

How should Agent-memory implement its local stdio MCP server while preserving protocol interoperability, local-first operation, governance routing, and domain independence?

## Approved Inputs

- `docs/01-inception/02-user-stories/all_user_stories.md`: US-001 and US-005 AC-001.
- `docs/01-inception/03-nfrs/nfrs.md`: NFR-005, NFR-015, and NFR-019.
- `docs/01-inception/04-risks/risk_register.md`: R-006, R-011, and R-013.
- `docs/01-inception/06-bolts/bolts_plan_addendum_v1_release.md`: approved BOLT-12 scope and ADR-006 dependency.
- `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter_logical_design.md`: MCP adapter behind the Capability Router.
- `docs/02-construction/02-design-plan/v1_release_plan.md`: official SDK versus dependency-free stdio JSON-RPC comparison requirement.
- `docs/02-construction/01-architecture/technology_decisions.md`: ADR-001 through ADR-005 and their downstream authorization boundaries.
- BOLT-11 approved baseline: 112 tests passing, with export and delete routed through the shared capability model.

## Candidate Starting Points

Candidate A was selected by the user on 2026-08-26 for ADR approval consideration. The selection is not yet binding because this decision plan remains pending approval and the primary-source comparison has not been executed.

| Candidate | Description | Initial Hypothesis |
|-----------|-------------|--------------------|
| A. Official TypeScript MCP SDK | Use the official MCP SDK as a transport adapter outside `src/domain/`. | Likely strongest interoperability and maintenance fit, but introduces the first runtime dependency and supply-chain/version exposure. |
| B. Dependency-free stdio JSON-RPC | Implement the required MCP framing, initialization, tools/list, tools/call, errors, and lifecycle directly with Node APIs. | Minimizes dependencies but transfers protocol correctness, evolution, and interoperability burden into this project. |
| C. Defer ADR-006 / BOLT-12 | Keep CLI as the only usable surface until a later decision. | Avoids immediate dependency risk but leaves US-001 inaccessible to agents and US-005 AC-001 unmet, so it is not the expected recommendation. |

## Human Selection Gate

| Gate Status | Selected Option | Selector / Date | Selection Rationale | Conditions | Downstream Authorization |
|-------------|-----------------|-----------------|---------------------|------------|--------------------------|
| Selected; ADR approval pending | Candidate A: Official TypeScript MCP SDK | User / 2026-08-26 | The official SDK offers the strongest protocol interoperability and maintenance path while a thin transport adapter keeps domain lock-in limited. | Pin and inspect the SDK version and dependency footprint; keep SDK imports outside `src/domain/`; generate tools from existing descriptors; route every call through `CapabilityRouter`; test real-client interoperability and malformed input; expose no SDK types through domain contracts. | Selection authorizes ADR-006 analysis only after plan approval. It does not authorize dependency installation, package changes, or BOLT-12 implementation. |

## Decision Drivers

| Driver | Source | Importance | Planned Evidence |
|--------|--------|------------|------------------|
| A real MCP client can list and call Agent-memory tools | US-005 AC-001, BOLT-12 | Must | Protocol and client interoperability comparison |
| Fresh agents can request bounded startup context | US-001, NFR-005 | Must | Capability Router and stdio flow fit |
| Domain stays transport-independent | NFR-015 | Must | Package/import boundary and adapter placement |
| No hosted or paid service is required | NFR-005, NFR-019 | Must | Local stdio operation |
| Governance cannot be bypassed | UNIT-03, BOLT-04, BOLT-11 | Must | All tool calls route through `CapabilityRouter` |
| First runtime dependency is justified | ADR-001 authorization, v1 release risk | Must | Dependency scope, transitive surface, maintenance, and rollback analysis |
| Protocol evolution remains supportable | BOLT-12 logical design risk | Should | Versioning and ecosystem maturity comparison |
| BOLT-12 remains reversible | AI-DLC decision guidance | Should | Adapter isolation and migration analysis |

## Planned Comparison

Each candidate will be compared across:

- MCP protocol coverage and standards conformance.
- Compatibility with real MCP clients and current protocol negotiation.
- API stability, release cadence, maintenance ownership, and ecosystem maturity.
- Runtime and transitive dependency footprint.
- Supply-chain, security, privacy, and local data exposure.
- Error mapping, cancellation, shutdown, framing, and malformed-input handling.
- Fit with existing `MCP_TOOL_DESCRIPTORS`, JSON Schema generation, and `CapabilityRouter`.
- NFR-015 import-boundary enforcement and adapter placement outside `src/domain/`.
- Testability without network or hosted infrastructure.
- Operational complexity, cost, migration effort, lock-in, and rollback.
- Reversibility and confidence.

## Primary-Source Research Plan

After approval, verify current facts from primary sources before recommending a candidate:

1. Official Model Context Protocol specification and versioning guidance.
2. Official TypeScript SDK repository/package documentation, supported transports, server APIs, package/runtime requirements, and release posture.
3. Published package metadata and dependency tree for the candidate SDK version.
4. Official examples for stdio server initialization, `tools/list`, `tools/call`, JSON Schema, errors, cancellation, and shutdown.
5. Compatibility expectations for at least one real MCP client used in BOLT-12 validation.

## Planned ADR Output

If this plan is approved, append ADR-006 to `docs/02-construction/01-architecture/technology_decisions.md` with status `Proposed` and update its summary/comparison/gate sections. The ADR will include:

- Context, decision drivers, and candidate comparison.
- AI recommendation without selecting on the user's behalf.
- Human Selection Gate with `Selected`, `Deferred`, `Rejected`, or `More Analysis Needed` outcome.
- Dependency and downstream authorization boundaries.
- Security, privacy, compliance, operability, cost, migration, reversibility, and confidence.
- Rejected/deferred alternatives and revisit triggers.
- Links to UNIT-03, BOLT-12, US-001, US-005, NFR-005, NFR-015, NFR-019, R-006, R-011, and R-013.

## Execution Checklist

- [x] Record explicit human approval of this ADR-006 decision plan. (User / 2026-08-26.)
- [x] Confirm approved inputs and the BOLT-11 review gate remain current.
- [x] Verify the current MCP specification from official sources.
- [x] Verify the official TypeScript SDK's current APIs, runtime requirements, package metadata, and dependency footprint from primary sources.
- [x] Define the minimum protocol behavior BOLT-12 must implement.
- [x] Compare Candidate A, Candidate B, and Candidate C across all decision drivers.
- [x] Assess security, privacy, supply-chain, operability, cost, maintainability, migration, and rollback impacts.
- [x] Record reversibility and confidence for each candidate.
- [x] Draft ADR-006 as `Proposed` in `technology_decisions.md` without changing ADR-001 through ADR-005.
- [x] Present the comparison and AI recommendation at the Human Selection Gate.
- [x] Record the user's selection outcome, rationale, conditions, and downstream authorization. (Candidate A selected by user on 2026-08-26; ADR approval and plan approval remain pending.)
- [x] Mark ADR-006 `Approved` only if human selection and approval are explicit. (User approved Proposed ADR-006 on 2026-08-26.)
- [x] Update `PROJECT_STATUS.md`.
- [x] Write a completion session log under `session-logs/`.

## Approval Gate

- Explicit approval is required before executing the checklist beyond planning.
- Human selection and approval are required before ADR-006 becomes binding.
- No dependency may be installed during this technology-decision workflow.
- No BOLT-12 source, tests, runtime structure, package manifest, lockfile, or downstream design may be changed under this plan.
- After ADR-006 approval, BOLT-12 still requires its own approved Code Generation follow-up plan before implementation.

## Execution Notes

- 2026-08-26: Follow-up plan created after approval of the BOLT-11 report pair. No external comparison, ADR entry, dependency change, implementation, test, or runtime structure change was made. Execution awaits explicit human approval.
- 2026-08-26: User selected Candidate A, the official TypeScript MCP SDK, with the stated adapter-isolation, version-pinning, dependency-review, governance-routing, interoperability-test, and domain-type conditions. Selection is recorded but remains non-binding pending plan approval, primary-source comparison, and explicit ADR approval.
- 2026-08-26: User explicitly approved this ADR-006 decision plan. Primary-source research and candidate comparison are authorized; dependency installation and BOLT-12 implementation remain prohibited.
- 2026-08-26: Primary-source research completed against the MCP 2026-07-28 specification, official TypeScript SDK v2 documentation/repository, SDK tiering, npm package metadata, dependency policy, versioning policy, roadmap, and security policy. Candidate A remains recommended and is refined from the legacy monolithic package name to `@modelcontextprotocol/server@2.0.0`. ADR-006 appended as Proposed; final approval remains pending.
- 2026-08-26: User explicitly approved Proposed ADR-006 as binding. Candidate A is approved with all recorded conditions. This closes the technology-decision gate and authorizes BOLT-12 planning, not dependency installation or implementation.