# AI-DLC Domain Design Plan

**Project:** Agent-memory
**Date:** 2026-06-04
**Skill:** ai-dlc-domain-design
**Approval Status:** Approved by user on 2026-06-04

---

## Context

The Inception artifacts, Units composition, and Bolts plan have been reviewed and approved by the user on 2026-06-04.

This plan starts the AI-DLC Domain Design workflow for Agent-memory. The goal is to create technology-agnostic Domain-Driven Design models for the approved Units before Logical Design, technology binding, implementation, or test generation.

Domain Design must focus on business behavior and lifecycle-memory concepts. It must not choose databases, frameworks, cloud services, schemas, iii-engine coupling, embedding providers, or implementation code.

---

## Inputs

- Approved Units composition: `docs/01-inception/05-units/units_composition.md`
- Approved Bolts plan: `docs/01-inception/06-bolts/bolts_plan.md`
- Approved user stories: `docs/01-inception/02-user-stories/all_user_stories.md`
- Approved NFRs: `docs/01-inception/03-nfrs/nfrs.md`
- Approved risk register: `docs/01-inception/04-risks/risk_register.md`
- Domain Design skill: `docs/00-methodology/01-skills/ai-dlc-domain-design/SKILL.md`
- DDD reference: `docs/00-methodology/01-skills/ai-dlc-domain-design/references/ddd_reference.md`
- Domain Design template: `docs/02-construction/03-domain-design/domain_design_TEMPLATE.md`

---

## Approval Gate

Human approval of this plan is required before creating or editing Domain Design artifacts.

Until approval is recorded, do not create or edit:

- `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md`
- `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`
- `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md`
- `docs/02-construction/03-domain-design/unit_04_privacy_governance_and_memory_operations.md`
- `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension.md`

Do not begin Logical Design, technology selection, implementation, or test generation until Domain Design outputs are created, reviewed, and approved.

---

## Execution Checklist

- [x] Record explicit approval to execute this Domain Design plan.
- [x] Confirm approved Units, stories, NFRs, risks, and Bolts are still available and approved.
- [x] Review DDD reference and keep the modeling vocabulary technology-agnostic.
- [x] Create `unit_01_lifecycle_memory_core.md` for UNIT-01.
- [x] Model UNIT-01 ubiquitous language, aggregates, entities, value objects, events, repository interfaces, factories, domain services, invariants, and open questions.
- [x] Validate UNIT-01 against US-002, US-003, NFR-004, NFR-006, NFR-015, NFR-016, R-001, and R-010.
- [x] Create `unit_02_local_workspace_storage_and_retrieval.md` for UNIT-02.
- [x] Model UNIT-02 domain behavior for durable sources, rebuildable indexes, retrieval requests, and context packs without binding storage technology.
- [x] Validate UNIT-02 against US-001, US-004, NFR-001, NFR-002, NFR-003, NFR-005, NFR-009, NFR-010, NFR-019, NFR-020, R-002, R-008, R-009, and R-010.
- [x] Create `unit_03_framework_agnostic_integration_and_runtime_adapter.md` for UNIT-03.
- [x] Model UNIT-03 domain behavior for framework-agnostic memory operations and optional runtime adapter boundaries without binding to iii-engine internals.
- [x] Validate UNIT-03 against US-005, US-007, NFR-005, NFR-013, NFR-014, NFR-015, R-006, and R-011.
- [x] Create `unit_04_privacy_governance_and_memory_operations.md` for UNIT-04.
- [x] Model UNIT-04 policy, provenance, visibility, redaction, retention, delete, and export domain concepts.
- [x] Validate UNIT-04 against US-006, NFR-007, NFR-008, NFR-011, NFR-012, NFR-017, NFR-018, R-004, R-005, R-012, R-013, and R-014.
- [x] Create `unit_05_optional_semantic_retrieval_extension.md` for UNIT-05.
- [x] Model UNIT-05 as an optional extension that augments, but does not override, approved lifecycle retrieval.
- [x] Validate UNIT-05 against US-008, NFR-010, NFR-015, NFR-020, R-003, R-008, R-009, and R-011.
- [x] Review cross-Unit language consistency and document bounded-context relationships.
- [x] Confirm each major model element links back to relevant stories, NFRs, risks, or Units.
- [x] Confirm repository interfaces are intent-based only and avoid database/framework operations.
- [x] Confirm all domain events are past-tense business facts.
- [x] Confirm all open questions are documented and routed to Domain Design, Logical Design, technology decision, or privacy policy as appropriate.
- [x] Update `PROJECT_STATUS.md` with Domain Design progress and remaining blockers.
- [x] Write or update a session log under `session-logs/` with skills used, decisions, outputs, and next steps.
- [x] Review generated Domain Design artifacts and verification evidence before requesting approval to move to Logical Design.

---

## Planned Outputs

- `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md`
- `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`
- `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md`
- `docs/02-construction/03-domain-design/unit_04_privacy_governance_and_memory_operations.md`
- `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension.md`
- Updated `PROJECT_STATUS.md`
- Session log under `session-logs/`

---

## Modeling Order

1. UNIT-01 first, because lifecycle memory categories and traceability edges are the core language used by all other Units.
2. UNIT-04 can proceed after UNIT-01, because governance metadata attaches to lifecycle memory records and affects all write/retrieval behavior.
3. UNIT-02 proceeds after UNIT-01 and should incorporate UNIT-04 policy concepts as integration constraints.
4. UNIT-03 proceeds after UNIT-01, UNIT-02, and UNIT-04 so interfaces expose stable domain operations and respect governance.
5. UNIT-05 proceeds last because semantic retrieval is optional and must not weaken lifecycle-authoritative ranking.

---

## Decision Areas To Preserve For Later Gates

- Implementation language and package/runtime surface remain a technology decision.
- iii-engine required-vs-optional status remains a technology decision; Domain Design may model an optional runtime adapter boundary only.
- SQLite, JSONL, Postgres, pgvector, and embedding providers must not be selected or modeled as implementation details in Domain Design.
- Raw observation TTL remains a privacy/policy decision unless a domain invariant requires a placeholder concept.
- Logical Design will address architecture patterns, integration contracts, failure modes, ADR-lite decisions, and NFR trade-offs after Domain Design approval.

---

## Exit Criteria

- Each approved Unit has one Domain Design artifact.
- Each major model element is linked to stories, NFRs, risks, or Units.
- Ubiquitous language is consistent across related Units.
- Aggregates have clear consistency boundaries.
- Invariants are explicit and testable.
- Entities have stable identities.
- Value objects are immutable and value-based.
- Domain events are named as past-tense facts.
- Repository interfaces are intent-based and technology-agnostic.
- Domain services are justified and do not become generic transaction scripts.
- Technology choices, databases, frameworks, cloud services, schemas, and implementation code are absent.
- Human approval is recorded before moving to Logical Design.

---

## Execution Notes

- 2026-06-04: Domain Design plan created and left pending human review.
- 2026-06-04: User approved the Domain Design plan in chat.
- 2026-06-04: Generated one technology-agnostic Domain Design artifact for each approved Unit.
- 2026-06-04: Domain Design artifacts are pending human review before Logical Design.
- 2026-06-04: User approved Domain Design artifacts in chat.
