# AI-DLC Technology Decision Plan

**Project:** Agent-memory
**Date:** 2026-06-04
**Skill:** ai-dlc-technology-decision
**Approval Status:** Approved by user on 2026-06-04

---

## Context

The Domain Design artifacts for UNIT-01 through UNIT-05 have been reviewed and approved by the user on 2026-06-04.

This plan starts the AI-DLC Technology Decision workflow for Agent-memory. The goal is to turn open technology and policy choices into explicit, traceable, approval-gated ADR entries before Logical Design, implementation, dependency changes, runtime structure changes, or test generation.

No technology option becomes binding from this plan alone. Candidate options remain non-binding until the Human Selection Gate records a human outcome and the ADR approval record is complete.

---

## Inputs

- Approved project status: `PROJECT_STATUS.md`
- Approved intent clarification: `docs/01-inception/01-intent-clarification/intent_clarification.md`
- Approved user stories: `docs/01-inception/02-user-stories/all_user_stories.md`
- Approved NFRs: `docs/01-inception/03-nfrs/nfrs.md`
- Approved risk register: `docs/01-inception/04-risks/risk_register.md`
- Approved Units: `docs/01-inception/05-units/units_composition.md`
- Approved Bolts: `docs/01-inception/06-bolts/bolts_plan.md`
- Approved Domain Design artifacts:
  - `docs/02-construction/03-domain-design/unit_01_lifecycle_memory_core.md`
  - `docs/02-construction/03-domain-design/unit_02_local_workspace_storage_and_retrieval.md`
  - `docs/02-construction/03-domain-design/unit_03_framework_agnostic_integration_and_runtime_adapter.md`
  - `docs/02-construction/03-domain-design/unit_04_privacy_governance_and_memory_operations.md`
  - `docs/02-construction/03-domain-design/unit_05_optional_semantic_retrieval_extension.md`
- Technology Decision skill: `docs/00-methodology/01-skills/ai-dlc-technology-decision/SKILL.md`
- Technology Decisions template: `docs/02-construction/01-architecture/technology_decisions_TEMPLATE.md`

---

## Approval Gate

Human approval of this plan is required before comparing candidates, making recommendations, or creating ADR entries.

Until approval is recorded, do not create or edit:

- `docs/02-construction/01-architecture/technology_decisions.md`

Do not install dependencies, change runtime structure, update implementation, provision infrastructure, connect cloud services, update Logical Design, generate code, or generate tests during this decision-planning step.

---

## Decision Scope

This technology decision pass will cover decisions that block or strongly shape Logical Design and Code Generation:

| ID | Decision Area | Why It Is Needed Now | Related Inputs |
|----|---------------|----------------------|----------------|
| TD-001 | Implementation language and package/runtime surface | Logical Design and Code Generation need a concrete runtime target before implementation tasks can be scoped. | OQ-001, UNIT-01, UNIT-02, UNIT-03, NFR-005, NFR-015, R-011 |
| TD-002 | iii-engine required-vs-optional status | Runtime adapter boundaries depend on whether iii-engine is required for v1 or optional. | OQ-002, UNIT-03, US-007, NFR-014, R-006, R-011 |
| TD-003 | Storage profile and migration posture | Retrieval, rebuild, delete/export, and future team/server use depend on storage posture. | UNIT-02, UNIT-04, NFR-003, NFR-010, NFR-019, R-002, R-010 |
| TD-004 | Raw observation retention default | Privacy and governance flows need a policy decision before implementation. | OQ-004, UNIT-04, NFR-017, NFR-018, R-012, R-013 |
| TD-005 | Optional semantic retrieval and embeddings posture | Semantic retrieval must not weaken lifecycle-authoritative ranking; provider/model choices can be deferred if not v1. | OQ-003, UNIT-05, US-008, NFR-010, NFR-015, NFR-020, R-003, R-008, R-009 |

---

## Candidate Starting Points

These are starting hypotheses for the approved execution pass, not decisions.

| Decision Area | Candidate Starting Points |
|---------------|----------------------------|
| TD-001 | Python package with CLI/MCP/local API; TypeScript/Node package with CLI/MCP/local API; Rust core with bindings; defer until Logical Design clarifies runtime constraints. |
| TD-002 | iii-engine required for v1; iii-engine optional first-class adapter with core local mode independent; defer adapter implementation to v1.1 while preserving boundary. |
| TD-003 | Local-first durable Markdown plus append-only events plus rebuildable local index; direct Postgres/vector server profile; pluggable repository profile with local default and future server migration path. |
| TD-004 | Short fixed TTL for raw observations; configurable TTL with safe default; no raw observation retention until explicit workspace policy exists. |
| TD-005 | Defer embeddings from v1; optional local semantic provider in v1.1; pluggable semantic provider boundary without selecting provider/model now. |

External references already mentioned by the user, such as `iii-hq/iii` and `rohitg00/agentmemory`, should be reviewed during approved execution before recommendation. Any current external facts must be verified from primary sources before use.

---

## Execution Checklist

- [x] Record explicit approval to execute this Technology Decision plan.
- [x] Confirm approved inputs still exist and are approved.
- [x] Review decision drivers from user stories, NFRs, risks, Units, Bolts, and approved Domain Design artifacts.
- [x] Confirm which decision areas are required now versus safe to defer.
- [x] Review current external references for `iii-hq/iii` and `rohitg00/agentmemory` from primary sources before relying on them.
- [x] Identify candidate options for TD-001, including a defer/no-decision option.
- [x] Compare TD-001 candidates across fit, risks, cost, reversibility, maintainability, operability, testing, and ecosystem maturity.
- [x] Identify candidate options for TD-002, including a defer/no-decision option.
- [x] Compare TD-002 candidates across local-mode independence, observability, lock-in, delivery risk, and adapter complexity.
- [x] Identify candidate options for TD-003, including a defer/no-decision option.
- [x] Compare TD-003 candidates across rebuildability, deletion/export, local-first adoption, future server migration, concurrency, cost, and privacy risk.
- [x] Identify candidate options for TD-004, including a defer/no-decision option.
- [x] Compare TD-004 candidates across privacy risk, auditability, user control, operational simplicity, and implementation complexity.
- [x] Identify candidate options for TD-005, including a defer/no-decision option.
- [x] Compare TD-005 candidates across lifecycle-authoritative ranking, retrieval quality, privacy, token cost, lock-in, and v1 delivery risk.
- [x] Draft recommendations for each decision area with status `Proposed` or `Deferred`.
- [x] Present the Human Selection Gate with candidate comparison, recommendation, and downstream authorization boundaries.
- [x] Record the human outcome for each decision area: Selected, Deferred, Rejected, or More Analysis Needed.
- [x] Create `docs/02-construction/01-architecture/technology_decisions.md` from the approved template.
- [x] Record ADR entries for each decision area, including alternatives, consequences, risks, reversibility, confidence, related Units/NFRs/risks/design artifacts, follow-ups, and approval status.
- [x] Keep ADR entries non-binding unless human selection and approval are both recorded.
- [x] Update `PROJECT_STATUS.md` with decision progress and remaining blockers.
- [x] Write or update a session log under `session-logs/` with skills used, decisions, outputs, and next steps.
- [x] Review verification evidence before requesting approval to use decisions in Logical Design.

---

## Planned Outputs

- `docs/02-construction/01-architecture/technology_decisions.md`
- Updated `PROJECT_STATUS.md`
- Session log under `session-logs/`

---

## Human Selection Gate Rules

For each decision area, the human must choose one outcome:

- `Selected` - one candidate is selected for ADR approval consideration.
- `Deferred` - the decision is intentionally postponed.
- `Rejected` - all current candidates are rejected.
- `More Analysis Needed` - more research or comparison is required before selection.

Record for each gate:

- Gate status
- Selected option, or `None` when deferred/rejected
- Human selector and date
- Selection rationale
- Conditions or constraints
- Downstream artifacts authorized to use the selection

AI may recommend, but must not select on the human's behalf.

---

## Exit Criteria

- Decision scope and drivers are documented.
- Candidate options and defer/no-decision options are considered where reasonable.
- Trade-offs and rejected alternatives are documented.
- Security, privacy, compliance, operability, cost, migration, reversibility, and confidence are considered.
- Human Selection Gate outcome, selector/date, and rationale are recorded before ADR approval.
- ADR entries link to relevant Units, NFRs, risks, and Domain Design artifacts.
- Human approval is recorded before decisions become binding.
- Downstream authorization boundaries are documented.
- Follow-ups for Logical Design, Code Generation, Deployment, or Operations are documented.

---

## Execution Notes

- 2026-06-04: Technology Decision plan created and left pending human review.
- 2026-06-04: User approved the Technology Decision plan in chat.
- 2026-06-04: Reviewed primary sources for `iii-hq/iii` and `rohitg00/agentmemory`.
- 2026-06-04: Created `docs/02-construction/01-architecture/technology_decisions.md` with Proposed ADR entries before user selection.
- 2026-06-04: At creation time, no decision was binding yet.
- 2026-06-04: User approved all AI-recommended selections.
- 2026-06-04: Updated `docs/02-construction/01-architecture/technology_decisions.md` with Selected/Approved ADR entries for TD-001 through TD-005.
