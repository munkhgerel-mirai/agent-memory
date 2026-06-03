---
name: ai-dlc-units
description: Use when designing traceable AI-DLC Unit boundaries and Bolts from approved Inception artifacts for independently buildable, loosely coupled work.
---

# AI-DLC Units

Use this skill to compose Units and plan Bolts from approved Inception artifacts.

## Inputs / Preconditions

- Approved intent clarification
- Approved user stories with priorities and acceptance criteria
- Approved NFRs
- Approved risk register
- Open questions from Inception, if any
- Approval to begin Units planning

## Workflow

1. Confirm approved Inception artifacts exist and review unresolved open questions.
2. Create a checkbox plan in `docs/01-inception/99-plans/units_and_bolts_plan.md`.
3. Request explicit human approval before execution.
4. Map user stories, NFRs, risks, assumptions, and open questions before grouping.
5. Compose Units using cohesion, coupling, business capability, and independent-build criteria.
6. Validate Unit boundaries and revise unclear splits with human input.
7. Document dependencies and integration points between Units, including dependency classification.
8. Save Units to `docs/01-inception/05-units/units_composition.md`.
9. Define Bolts as incremental build-validation steps measured in hours/days, not weeks.
10. Mark parallelizable vs sequential work and document the reasoning.
11. Save Bolts to `docs/01-inception/06-bolts/bolts_plan.md`.
12. Confirm exit criteria and request human approval before moving to Domain Design.

## Quality Guidance

A Unit should:

- Represent one clear business capability or outcome
- Contain highly cohesive user stories
- Be loosely coupled from other Units
- Be independently buildable by one team
- Have explicit dependencies and integration points
- Avoid ambiguous or shared ownership

Each Unit entry should include:

- Unit ID and name
- Business capability or outcome
- Linked story IDs
- Related NFRs
- Related risks
- Key assumptions
- Dependencies and integration points
- Open questions

Classify dependencies as:

- Sequential dependency
- Parallel-safe dependency
- Integration dependency
- Data dependency
- External/system dependency

Each Bolt should include:

- Bolt ID
- Unit
- Goal
- Included stories
- Expected artifact or output
- Dependencies
- Validation method
- Parallel or sequential status

Validate Units before finalizing:

- No story is orphaned.
- No story appears in multiple Units without explanation.
- Each Unit has a clear capability.
- Dependencies are explicit.
- Parallelization assumptions are documented.
- NFR and risk impacts are considered.

## Outputs

- `docs/01-inception/99-plans/units_and_bolts_plan.md`
- `docs/01-inception/05-units/units_composition.md`
- `docs/01-inception/06-bolts/bolts_plan.md`

## Exit Criteria

- All `Must` stories are assigned to Units.
- Unit boundaries are reviewed and approved.
- Dependencies and integration points are documented.
- Bolts are small enough for hours/days execution.
- Parallel/sequential assumptions are documented.
- Human approval is recorded before moving to Domain Design.

## Approval Gate

- Do not execute beyond planning until the human approves.
- Ask before making critical decomposition decisions.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
