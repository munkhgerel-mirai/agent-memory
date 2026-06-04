# AI-DLC Units And Bolts Plan

**Project:** Agent-memory
**Date:** 2026-06-04
**Skill:** ai-dlc-units
**Approval Status:** Approved by user on 2026-06-04

---

## Context

The Inception artifacts have been reviewed and approved by the user on 2026-06-04:

- `docs/01-inception/01-intent-clarification/intent_clarification.md`
- `docs/01-inception/02-user-stories/all_user_stories.md`
- `docs/01-inception/03-nfrs/nfrs.md`
- `docs/01-inception/04-risks/risk_register.md`

This plan starts the AI-DLC Units workflow. It will decompose approved Inception artifacts into independently buildable Units and small build-validation Bolts, while preserving traceability to stories, NFRs, risks, assumptions, and open questions.

---

## Inputs

- Approved intent clarification
- Approved user stories `US-001` through `US-008`
- Approved NFRs `NFR-001` through `NFR-020`
- Approved risks `R-001` through `R-014`
- Inception open questions `OQ-001` through `OQ-004`
- `docs/00-methodology/01-skills/ai-dlc-units/SKILL.md`
- `docs/01-inception/05-units/units_composition_TEMPLATE.md`
- `docs/01-inception/06-bolts/bolts_plan_TEMPLATE.md`

---

## Approval Gate

Human approval of this plan is required before composing Units, assigning stories to Units, or planning Bolts.

Until approval is recorded, do not create or edit:

- `docs/01-inception/05-units/units_composition.md`
- `docs/01-inception/06-bolts/bolts_plan.md`

Do not begin Domain Design, Logical Design, technology selection, implementation, or test generation until Units/Bolts outputs are created and approved.

---

## Execution Checklist

- [x] Record explicit approval to execute this Units and Bolts plan.
- [x] Confirm approved Inception artifacts exist and record their approval status.
- [x] Review unresolved Inception open questions and identify which block Unit decomposition versus later technology decision.
- [x] Map each user story to candidate capabilities before grouping.
- [x] Map each NFR and risk to candidate Unit impacts before grouping.
- [x] Compose cohesive, loosely coupled Units using business capability, independent-build, and lifecycle-traceability criteria.
- [x] Validate that no `Must` story is orphaned and no story is duplicated without explanation.
- [x] Document Unit dependencies, integration points, and dependency classifications.
- [x] Save Units to `docs/01-inception/05-units/units_composition.md`.
- [x] Define Bolts as small build-validation steps measured in hours or days.
- [x] Mark each Bolt as parallel-safe or sequential and document the reasoning.
- [x] Save Bolts to `docs/01-inception/06-bolts/bolts_plan.md`.
- [x] Update `PROJECT_STATUS.md` with Units workflow progress and remaining blockers.
- [x] Write a session log under `session-logs/` with skills used, decisions, completed artifacts, and next steps.
- [x] Review generated Units/Bolts artifacts and verification evidence before requesting approval to move to Domain Design.

---

## Planned Outputs

- `docs/01-inception/05-units/units_composition.md`
- `docs/01-inception/06-bolts/bolts_plan.md`
- Updated `PROJECT_STATUS.md`
- Session log under `session-logs/`

---

## Candidate Decomposition Themes To Validate After Approval

These are not final Unit boundaries. They are starting hypotheses for the approved execution pass.

- Lifecycle artifact memory model and classification
- Local workspace storage and rebuildable index
- Retrieval and 2000-token context pack generation
- Framework-agnostic integration surfaces: MCP, CLI, and local API
- Privacy, provenance, retention, deletion, and export controls
- Optional iii-engine runtime adapter and observability hooks

---

## Dependency And Decision Areas To Watch

- Technology decisions for implementation language and package/runtime surface remain open.
- iii-engine required-vs-optional status remains open.
- Raw observation retention duration remains open.
- Optional embeddings are deferred to v1.1 or later unless approved earlier.
- Postgres + pgvector remains a future server profile, not the v1 default.

---

## Exit Criteria

- All `Must` stories are assigned to Units.
- Unit boundaries are reviewed and approved.
- Dependencies and integration points are explicit.
- Bolts are small enough for hours/days execution.
- Parallel/sequential assumptions are documented.
- Human approval is recorded before moving to Domain Design.

---

## Execution Notes

- 2026-06-04: User approved the Units and Bolts plan in chat.
- 2026-06-04: Generated `docs/01-inception/05-units/units_composition.md`.
- 2026-06-04: Generated `docs/01-inception/06-bolts/bolts_plan.md`.
- 2026-06-04: All `Must` stories were assigned exactly once.
- 2026-06-04: Units/Bolts artifacts are pending human review before Domain Design.
- 2026-06-04: User approved `docs/01-inception/05-units/units_composition.md` and `docs/01-inception/06-bolts/bolts_plan.md` in chat.
