---
name: ai-dlc-domain-design
description: Use when creating technology-agnostic Domain-Driven Design models for approved AI-DLC Units with traceability to user stories, NFRs, and risks.
---

# AI-DLC Domain Design

Use this skill to model approved Units with Domain-Driven Design patterns before logical design or implementation. Use `docs/00-methodology/01-skills/ai-dlc-domain-design/references/ddd_reference.md` as the local DDD reference.

## Workflow

1. Confirm approved inputs exist: Units, user stories, NFRs, and risk register.
2. Create a checkbox plan in `docs/02-construction/02-design-plan/domain_design_plan.md`.
3. Request explicit human approval before execution.
4. For each Unit, create a domain design document in `docs/02-construction/03-domain-design/<unit_name>.md` and link each major model element back to relevant user stories.
5. Include Unit summary.
6. Include linked user stories.
7. Include ubiquitous language.
8. Include aggregates and invariants.
9. Include entities and behaviors.
10. Include value objects.
11. Include domain events.
12. Include repository interfaces only.
13. Include factories.
14. Include domain services.
15. Include open questions.
16. Validate each design:
    - Aggregates have clear consistency boundaries.
    - Invariants are explicit and testable.
    - Entities have stable identities.
    - Value objects are immutable and value-based.
    - Domain events are named as past-tense facts.
    - Repositories expose intent-based interfaces only.
    - Domain services do not become generic transaction scripts.
17. Keep the design technology-agnostic. Do not choose databases, frameworks, cloud services, schemas, or implementation code in this step.

## Outputs

- `docs/02-construction/02-design-plan/domain_design_plan.md`
- `docs/02-construction/03-domain-design/<unit_name>.md` per Unit

Each unit document should include:

- Unit summary
- Linked user stories
- Ubiquitous language
- Aggregates and invariants
- Entities and behaviors
- Value objects
- Domain events
- Repository interfaces
- Factories
- Domain services
- Open questions
- Validation checklist

## Approval Gate

- Do not execute beyond planning until the human approves.
- Ask before making critical domain modeling decisions.
- Execute one checkbox at a time.
- Mark each checkbox complete after finishing it.
- Do not rewrite previously approved or completed plans except for append-only addenda or explicitly approved follow-up plans.
- Treat prior approved plans as historical evidence, not current-state documents.
- During execution, update only checkbox status and append execution notes, verification results, blockers, or addendum references.
- Placeholder audits and cleanup passes must distinguish active project debt from historical approved plan records.
