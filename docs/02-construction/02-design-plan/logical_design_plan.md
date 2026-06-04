# AI-DLC Logical Design Plan

**Project:** Agent-memory  
**Date:** 2026-06-04  
**Skill:** `ai-dlc-logical-design`  
**Approval Status:** Pending human review

## Purpose

Create the Logical Design artifacts that translate the approved Domain Design and approved Technology Decisions into component boundaries, interfaces, data flow, failure modes, security/privacy behavior, and NFR traceability for Agent-memory.

This plan is an approval gate. Do not create Logical Design artifacts, system architecture artifacts, implementation code, tests, dependency changes, runtime structure changes, or deployment changes until this plan is explicitly approved by the human reviewer.

## Approved Inputs

| Input | Status | Path |
|-------|--------|------|
| Intent clarification, user stories, NFRs, and risks | Approved | `docs/01-inception/` |
| Units composition | Approved | `docs/01-inception/05-units/units_composition.md` |
| Bolts plan | Approved | `docs/01-inception/06-bolts/bolts_plan.md` |
| UNIT-01 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md` |
| UNIT-02 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md` |
| UNIT-03 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md` |
| UNIT-04 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_04_privacy_governance_and_memory_operations.md` |
| UNIT-05 Domain Design | Approved | `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension.md` |
| Technology Decisions | Approved | `docs/02-construction/01-architecture/technology_decisions.md` |
| Logical Design skill and template | Available | `docs/00-methodology/01-skills/ai-dlc-logical-design/SKILL.md`, `docs/02-construction/03-domain-design/logical_design_TEMPLATE.md` |

## Planned Outputs

| Output | Path | Approval Posture |
|--------|------|------------------|
| UNIT-01 Logical Design | `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core_logical_design.md` | Draft until reviewed |
| UNIT-02 Logical Design | `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval_logical_design.md` | Draft until reviewed |
| UNIT-03 Logical Design | `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter_logical_design.md` | Draft until reviewed |
| UNIT-04 Logical Design | `docs/02-construction/03-domain-design/unit_04_privacy_governance_and_memory_operations_logical_design.md` | Draft until reviewed |
| UNIT-05 Logical Design | `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension_logical_design.md` | Draft until reviewed |
| System architecture synthesis, if cross-Unit architecture is needed | `docs/02-construction/01-architecture/system_architecture.md` | Draft until reviewed |

## Decision Boundaries

- Approved Technology Decisions may be used as Logical Design inputs.
- TypeScript/Node, optional iii-engine adapter, local-first rebuildable storage, raw observation retention posture, and deferred embeddings are logical constraints only at this gate.
- Do not install dependencies, change package structure, generate implementation code, add tests, or start deployment work under this plan.
- Preserve root `docs/` for Agent-memory development AI-DLC artifacts.
- Keep Agent-memory runtime templates, classified Markdown examples, and fixtures under `src/docs/` when later implementation/test plans authorize those assets.

## Execution Checklist

- [ ] Record explicit human approval of this Logical Design plan.
- [ ] Reconfirm all approved inputs are present before execution.
- [ ] Review `ai-dlc-logical-design` skill instructions and Logical Design template.
- [ ] Create UNIT-01 Logical Design for Lifecycle Memory Core.
- [ ] Create UNIT-04 Logical Design for Privacy, Governance, and Memory Operations.
- [ ] Create UNIT-02 Logical Design for Local Workspace Storage and Retrieval.
- [ ] Create UNIT-03 Logical Design for Framework-Agnostic Integration and Runtime Adapter.
- [ ] Create UNIT-05 Logical Design for Optional Semantic Retrieval Extension.
- [ ] Add an NFR traceability matrix in each Logical Design artifact.
- [ ] Define architecture patterns, component boundaries, dependency direction, and interfaces for each Unit.
- [ ] Define integration contracts between Units and external/runtime surfaces.
- [ ] Add high-level, non-binding technology mapping consistent with approved Technology Decisions.
- [ ] Describe data flows, failure modes, error handling, and security/privacy behavior.
- [ ] Record ADR-lite logical design decisions, open questions, and trade-offs.
- [ ] Create or update `docs/02-construction/01-architecture/system_architecture.md` if cross-Unit architecture synthesis is needed.
- [ ] Verify every Logical Design artifact traces back to approved Units, NFRs, risks, and Technology Decisions.
- [ ] Update `PROJECT_STATUS.md`.
- [ ] Write a session log in `session-logs/`.

## Proposed Modeling Order

1. UNIT-01 first, because lifecycle memory categories and traceability edges are the core vocabulary.
2. UNIT-04 second, because governance and visibility rules constrain storage, retrieval, and integrations.
3. UNIT-02 third, because storage/retrieval depends on lifecycle vocabulary and governance rules.
4. UNIT-03 fourth, because MCP/CLI/local API and iii adapter surfaces depend on core operations and policy behavior.
5. UNIT-05 fifth, because semantic retrieval is an optional extension that must not outrank lifecycle-authoritative retrieval.
6. System architecture last, synthesizing component context, dependency direction, and cross-Unit data flow.

## Exit Criteria

- The plan is explicitly approved by the human reviewer before execution.
- Planned Logical Design outputs are created only after approval.
- Each Logical Design artifact includes NFR traceability, interface boundaries, data flow, failure modes, security/privacy considerations, and open questions.
- No implementation code, tests, dependency changes, runtime structure changes, or deployment changes are made in this gate.

## Execution Notes

- 2026-06-04: Plan created by Codex for human review. Execution is blocked until explicit approval.
